import {
  api,
  CreateScheduleData,
  ScheduledNotification,
  UpdateScheduleData
} from "@/lib/api";
import { create } from "zustand";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheEntry {
  data: ScheduledNotification[];
  timestamp: number;
  key: string;
}

interface ScheduleState {
  schedules: ScheduledNotification[];
  isLoading: boolean;
  error: string | null;
  cache: CacheEntry | null;

  fetchSchedulesByRegion: (
    region: "vn" | "na",
    options?: { forceRefresh?: boolean }
  ) => Promise<void>;
  fetchAllSchedules: (options?: { forceRefresh?: boolean }) => Promise<void>;
  createSchedule: (data: CreateScheduleData) => Promise<ScheduledNotification>;
  updateSchedule: (
    id: number,
    data: UpdateScheduleData
  ) => Promise<ScheduledNotification>;
  deleteSchedule: (id: number) => Promise<void>;
  invalidateCache: () => void;
  clearError: () => void;
}

const isCacheValid = (cache: CacheEntry | null, key: string): boolean => {
  if (!cache) return false;
  if (cache.key !== key) return false;
  return Date.now() - cache.timestamp < CACHE_DURATION;
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  isLoading: false,
  error: null,
  cache: null,

  fetchSchedulesByRegion: async (
    region: "vn" | "na",
    options?: { forceRefresh?: boolean }
  ) => {
    const cacheKey = `region:${region}`;
    const { cache } = get();

    // Return cached data if valid and not forcing refresh
    if (!options?.forceRefresh && isCacheValid(cache, cacheKey)) {
      set({ schedules: cache!.data });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const schedules = await api.getSchedulesByRegion(region);
      set({
        schedules,
        isLoading: false,
        cache: { data: schedules, timestamp: Date.now(), key: cacheKey }
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch schedules",
        isLoading: false
      });
    }
  },

  fetchAllSchedules: async (options?: { forceRefresh?: boolean }) => {
    const cacheKey = "all";
    const { cache } = get();

    // Return cached data if valid and not forcing refresh
    if (!options?.forceRefresh && isCacheValid(cache, cacheKey)) {
      set({ schedules: cache!.data });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const schedules = await api.getAllSchedules();
      set({
        schedules,
        isLoading: false,
        cache: { data: schedules, timestamp: Date.now(), key: cacheKey }
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch schedules",
        isLoading: false
      });
    }
  },

  createSchedule: async (data: CreateScheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const newSchedule = await api.createSchedule(data);
      set(state => ({
        schedules: [...state.schedules, newSchedule],
        isLoading: false,
        cache: null // Invalidate cache
      }));
      return newSchedule;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create schedule",
        isLoading: false
      });
      throw error;
    }
  },

  updateSchedule: async (id: number, data: UpdateScheduleData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSchedule = await api.updateSchedule(id, data);
      set(state => ({
        schedules: state.schedules.map(s =>
          s.id === id ? updatedSchedule : s
        ),
        isLoading: false,
        cache: null // Invalidate cache
      }));
      return updatedSchedule;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update schedule",
        isLoading: false
      });
      throw error;
    }
  },

  deleteSchedule: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteSchedule(id);
      set(state => ({
        schedules: state.schedules.filter(s => s.id !== id),
        isLoading: false,
        cache: null // Invalidate cache
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete schedule",
        isLoading: false
      });
      throw error;
    }
  },

  invalidateCache: () => set({ cache: null }),

  clearError: () => set({ error: null })
}));
