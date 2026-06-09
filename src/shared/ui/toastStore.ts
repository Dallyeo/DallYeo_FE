import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (message: string) => void;
  clear: () => void;
}

/** 간단한 토스트 스토어. ToastHost가 렌더. */
export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => set({ message }),
  clear: () => set({ message: null }),
}));

export const toast = {
  show: (message: string) => useToastStore.getState().show(message),
};
