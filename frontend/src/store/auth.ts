import { create } from "zustand";
import api from "../api/axios";

export type UserRole = "admin" | "owner" | "public";

export interface User {
  _id: string;
  citizenId: string;
  email: string;
  phoneNumber: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

type LoginPayload = {
  citizenId: string;
  password: string;
};

type SignupPayload = {
  citizenId: string;
  email: string;
  phoneNumber: string;
  name: string;
  password: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => void;
};

const LOCAL_STORAGE_KEY = "auth_user";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  hydrate: () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const parsed: User = JSON.parse(raw);
      set({ user: parsed });
    } catch (error) {
      // ignore hydration errors
    }
  },

  login: async (payload: LoginPayload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<User>("/auth/login", payload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      set({ user: data, loading: false });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  signup: async (payload: SignupPayload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<User>("/auth/signup", payload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      set({ user: data, loading: false });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Signup failed";
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      set({ user: null });
    }
  },
}));


