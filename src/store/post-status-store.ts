// store/post-status-store.ts
/**
 * Zustand Store for Real-Time Post Status Tracking
 *
 * Manages the state for tracking posts that are currently being published.
 * When a post is created, its ID is added here and the usePostStatusPolling
 * hook is activated to provide real-time updates.
 */

import { create } from "zustand";

interface PostStatusState {
  // Post IDs that are currently being tracked for status updates
  trackingPostIds: number[];

  // Actions
  addTrackedPost: (postId: number) => void;
  removeTrackedPost: (postId: number) => void;
  clearAllTrackedPosts: () => void;
}

export const usePostStatusStore = create<PostStatusState>((set) => ({
  trackingPostIds: [],

  addTrackedPost: (postId: number) => {
    set((state) => ({
      trackingPostIds: [
        ...state.trackingPostIds.filter((id) => id !== postId),
        postId,
      ],
    }));
  },

  removeTrackedPost: (postId: number) => {
    set((state) => ({
      trackingPostIds: state.trackingPostIds.filter((id) => id !== postId),
    }));
  },

  clearAllTrackedPosts: () => {
    set({ trackingPostIds: [] });
  },
}));
