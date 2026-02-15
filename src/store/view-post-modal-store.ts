// store/post-modal-store.ts

import { Post } from "@/types";
import { create } from "zustand";

interface ViewPostModalState {
  // Modal visibility
  isOpen: boolean;

  // Currently selected post for viewing
  selectedPost: Post | null;

  // Actions
  openModal: (post: Post) => void;
  closeModal: () => void;
}

export const useViewPostModalStore = create<ViewPostModalState>((set) => ({
  isOpen: false,
  selectedPost: null,

  openModal: (post: Post) => {
    set({ isOpen: true, selectedPost: post });
  },

  closeModal: () => {
    set({ isOpen: false, selectedPost: null });
  },
}));
