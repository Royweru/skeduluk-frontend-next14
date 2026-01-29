// store/post-modal-store.ts
/**
 * Zustand Store for Post View Modal
 *
 * Manages the state for viewing post details in a modal.
 * Used across dashboard overview and posts page.
 */

import { Post } from "@/types";
import { create } from "zustand";

interface PostModalState {
  // Modal visibility
  isOpen: boolean;

  // Currently selected post for viewing
  selectedPost: Post | null;

  // Actions
  openModal: (post: Post) => void;
  closeModal: () => void;
}

export const usePostModalStore = create<PostModalState>((set) => ({
  isOpen: false,
  selectedPost: null,

  openModal: (post: Post) => {
    set({ isOpen: true, selectedPost: post });
  },

  closeModal: () => {
    set({ isOpen: false, selectedPost: null });
  },
}));
