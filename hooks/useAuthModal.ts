import { create } from "zustand";

interface AuthModalOptions {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useAuthModal = create<AuthModalOptions>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useAuthModal;
