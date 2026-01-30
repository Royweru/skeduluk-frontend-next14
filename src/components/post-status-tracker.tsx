// components/post-status-tracker.tsx
/**
 * Post Status Tracker Component
 *
 * This component subscribes to the post status store and automatically
 * polls for status updates on posts that are currently being published.
 * When a post reaches a final state, it's removed from tracking.
 *
 * This component should be rendered at a high level in the app (e.g., in the layout)
 * so it's always active when the user is in the dashboard.
 */

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePostStatusPolling } from "@/hooks/api/use-post-status";
import { usePostStatusStore } from "@/store/post-status-store";

// Individual post status poller
function PostStatusPoller({ postId }: { postId: number }) {
  const queryClient = useQueryClient();
  const removeTrackedPost = usePostStatusStore(
    (state) => state.removeTrackedPost,
  );

  const { status, isComplete } = usePostStatusPolling(postId, true);

  useEffect(() => {
    // When the post reaches a final state, remove from tracking and refetch posts
    if (isComplete) {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });

      // Remove from tracking after a short delay to ensure toast has shown
      const timeout = setTimeout(() => {
        removeTrackedPost(postId);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isComplete, postId, queryClient, removeTrackedPost]);

  return null; // This component only handles side effects, no UI
}

// Main tracker that renders pollers for each tracked post
export function PostStatusTracker() {
  const trackingPostIds = usePostStatusStore((state) => state.trackingPostIds);

  return (
    <>
      {trackingPostIds.map((postId) => (
        <PostStatusPoller key={postId} postId={postId} />
      ))}
    </>
  );
}
