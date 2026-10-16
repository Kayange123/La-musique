import { create } from "zustand";
import { TourStep } from "@/lib/tour";

// The guided tour. request() asks for it; the Tour component opens it on
// Home once the page is there, with the steps this screen can show.
interface TourStore {
  requested: boolean;
  steps: TourStep[];
  index: number;
  request: () => void;
  open: (steps: TourStep[]) => void;
  go: (index: number) => void;
  close: () => void;
}

const useTour = create<TourStore>((set) => ({
  requested: false,
  steps: [],
  index: 0,
  request: () => set({ requested: true }),
  open: (steps) => set({ requested: false, steps, index: 0 }),
  go: (index) => set({ index }),
  close: () => set({ requested: false, steps: [], index: 0 }),
}));

export const useTourActive = () =>
  useTour((state) => state.requested || state.steps.length > 0);

export default useTour;
