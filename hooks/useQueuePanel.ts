import { create } from "zustand";

interface QueuePanelStore {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const useQueuePanel = create<QueuePanelStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}));

export default useQueuePanel;
