import { create } from 'zustand';

interface ModalStore {
  isProjectModalOpen: boolean;
  isShowreelOpen: boolean;
  isBookCallOpen: boolean;
  openProjectModal: () => void;
  closeProjectModal: () => void;
  openShowreel: () => void;
  closeShowreel: () => void;
  openBookCall: () => void;
  closeBookCall: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isProjectModalOpen: false,
  isShowreelOpen: false,
  isBookCallOpen: false,
  openProjectModal: () => set({ isProjectModalOpen: true }),
  closeProjectModal: () => set({ isProjectModalOpen: false }),
  openShowreel: () => set({ isShowreelOpen: true }),
  closeShowreel: () => set({ isShowreelOpen: false }),
  openBookCall: () => set({ isBookCallOpen: true }),
  closeBookCall: () => set({ isBookCallOpen: false }),
}));
