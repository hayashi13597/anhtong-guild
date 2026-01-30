import { api, type User } from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  _hasHydrated: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isLoading: true, // Start as true to prevent redirect before hydration
      isAuthenticated: false,
      _hasHydrated: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.login(username, password);
          localStorage.setItem("auth_token", response.token);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("auth_token");
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setHasHydrated: (hasHydrated: boolean) =>
        set({ _hasHydrated: hasHydrated, isLoading: false })
    }),
    {
      name: "auth-storage",
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => state => {
        // Called when hydration is complete
        state?.setHasHydrated(true);
      }
    }
  )
);
