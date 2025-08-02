import { create } from 'zustand';

interface StepperStore {
  isVisible: boolean;
  showStepper: () => void;
  hideStepper: () => void;
}

export const useStepperStore = create<StepperStore>(set => ({
  isVisible: false,
  showStepper: () => set({ isVisible: true }),
  hideStepper: () => set({ isVisible: false }),
}));
