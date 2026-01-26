const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export type ClassType =
  | "strategicSword"
  | "heavenquakerSpear"
  | "namelessSword"
  | "namelessSpear"
  | "vernalUmbrella"
  | "inkwellFan"
  | "soulshadeUmbrella"
  | "panaceaFan"
  | "thundercryBlade"
  | "stormreakerSpear"
  | "infernalTwinblades"
  | "mortalRopeDart";

export type TimeSlot =
  | "sat_19:30-20:00"
  | "sat_20:00-20:30"
  | "sat_20:30-21:00"
  | "sat_21:00-21:30"
  | "sat_21:30-22:00"
  | "sat_22:00-22:30"
  | "sun_19:30-20:00"
  | "sun_20:00-20:30"
  | "sun_20:30-21:00"
  | "sun_21:00-21:30"
  | "sun_21:30-22:00"
  | "sun_22:00-22:30";

export interface User {
  id: number;
  username: string;
  region: string;
  isAdmin: boolean;
  primaryClass: [ClassType, ClassType];
  secondaryClass?: [ClassType, ClassType] | null;
  primaryRole: "dps" | "healer" | "tank";
  secondaryRole?: "dps" | "healer" | "tank" | null;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

export interface TeamMember {
  teamId: number;
  userId: number;
  assignedAt: string;
  user: User;
}

export interface Team {
  id: number;
  eventId: number;
  name: string;
  description: string | null;
  day: "saturday" | "sunday";
  createdAt: string;
  members: TeamMember[];
}

export interface EventSignup {
  eventId: number;
  userId: number;
  timeSlots: TimeSlot[];
  notes: string | null;
  signedUpAt: string;
  user: User;
}

export interface GuildEvent {
  id: number;
  region: "vn" | "na";
  weekStartDate: string;
  createdAt: string;
  signups: EventSignup[];
  teams: Team[];
}

export interface SignupResponse {
  message: string;
  user: User;
  event: {
    id: number;
    weekStartDate: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers
    };

    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || "An error occurred");
    }

    return data as T;
  }

  // Auth
  async login(username: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  }

  async signup(data: {
    username: string;
    region: "vn" | "na";
    primaryClass: [ClassType, ClassType];
    secondaryClass?: [ClassType, ClassType];
    primaryRole: "dps" | "healer" | "tank";
    secondaryRole?: "dps" | "healer" | "tank";
    timeSlots: TimeSlot[];
    notes?: string;
  }): Promise<SignupResponse> {
    return this.request<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  // Events - Public
  async getCurrentEvent(region: "vn" | "na"): Promise<GuildEvent> {
    return this.request<GuildEvent>(`/events/current/${region}`);
  }

  // Events - Admin
  async createWeeklyEvent(): Promise<{ message: string; event: GuildEvent }> {
    return this.request("/events/create-weekly", { method: "POST" });
  }

  async createEvent(): Promise<{ message: string; event: GuildEvent }> {
    return this.request("/events/create", { method: "POST" });
  }

  // Teams - Admin
  async createTeam(
    eventId: number,
    name: string,
    day: "saturday" | "sunday",
    description?: string
  ): Promise<Team> {
    return this.request<Team>("/teams", {
      method: "POST",
      body: JSON.stringify({ eventId, name, day, description })
    });
  }

  async updateTeam(
    teamId: number,
    data: { name?: string; description?: string }
  ): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }

  async deleteTeam(teamId: number): Promise<{ message: string }> {
    return this.request(`/teams/${teamId}`, { method: "DELETE" });
  }

  async assignUserToTeam(
    teamId: number,
    userId: number
  ): Promise<{ message: string }> {
    return this.request(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId })
    });
  }

  async removeUserFromTeam(
    teamId: number,
    userId: number
  ): Promise<{ message: string }> {
    return this.request(`/teams/${teamId}/members/${userId}`, {
      method: "DELETE"
    });
  }

  // Users - Admin
  async getUsers(): Promise<User[]> {
    return this.request<User[]>("/users");
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.request(`/users/${userId}`, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
