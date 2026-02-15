// store/create-modal-store.ts

import { Post } from "@/types";
import { create } from "zustand";

interface CreatePostModalState {
  // Modal visibility
  isOpen: boolean;

  // Actions
  openModal: () => void;
  closeModal: () => void;
}

export const useCreatePostModalStore = create<CreatePostModalState>((set) => ({
  isOpen: false,
 
  openModal: () => {
    set({ isOpen: true });
  },

  closeModal: () => {
    set({ isOpen: false});
  },
}));
