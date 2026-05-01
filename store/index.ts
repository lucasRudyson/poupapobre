import { create } from 'zustand';

interface UserState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useStore = create<UserState>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
