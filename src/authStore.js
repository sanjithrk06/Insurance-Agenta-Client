import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isAuth: JSON.parse(localStorage.getItem("isAuth")) || false,
  error: null,
  isLoading: false,

  login: async (pin) => {
    set({ isLoading: true, error: null });

    if (pin === "5434") {
      localStorage.setItem("isAuth", true);
      set({ isLoading: false, isAuth: true });
    } else {
      set({ isLoading: false, isAuth: false, error: "Pin is wrong" });
      localStorage.removeItem("isAuth");
      throw new Error("Pin is wrong");
    }
  },

  logout: () => {
    localStorage.removeItem("isAuth");
    set({ isAuth: false });
  },
}));
