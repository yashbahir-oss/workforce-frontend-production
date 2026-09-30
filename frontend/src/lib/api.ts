const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

let refreshPromise: Promise<string | null> | null = null;

async function refreshSession(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("workforce_token");
          localStorage.removeItem("workforce_user");
          window.dispatchEvent(new Event("workforce-auth-expired"));
        }
        return null;
      }
      const data = await response.json();
      if (!data?.token) return null;
      localStorage.setItem("workforce_token", data.token);
      if (data.user)
        localStorage.setItem("workforce_user", JSON.stringify(data.user));
      window.dispatchEvent(
        new CustomEvent("workforce-auth-refreshed", { detail: data }),
      );
      return data.token as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = async (tokenOverride?: string) => {
    const headers = new Headers(options.headers);
    if (!(options.body instanceof FormData) && !headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
    const token = tokenOverride || localStorage.getItem("workforce_token");
    if (token && !headers.has("Authorization") && !path.startsWith("/auth/"))
      headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response: Response;
  try {
    response = await makeRequest();
  } catch {
    throw new ApiError(
      `WORKFORCE backend is not reachable at ${API}. Start the backend and verify VITE_API_URL.`,
    );
  }

  let data = await response.json().catch(() => ({}));
  if (
    response.status === 401 &&
    !path.startsWith("/auth/refresh") &&
    !path.startsWith("/auth/login")
  ) {
    const newToken = await refreshSession();
    if (newToken) {
      try {
        response = await makeRequest(newToken);
        data = await response.json().catch(() => ({}));
      } catch {
        throw new ApiError(`WORKFORCE backend is not reachable at ${API}.`);
      }
    }
  }
  if (!response.ok)
    throw new ApiError(
      data.message || `Request failed (${response.status})`,
      response.status,
    );
  return data as T;
}

export type User = {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  age?: number | null;
  gender?: string;
  role: "user" | "customer" | "worker" | "admin";
  status?: "active" | "inactive" | "blocked";
  profileImage?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
  verificationRejectionReason?: string;
};
export type AuthResponse = {
  token: string;
  user: User;
  devOtp?: string;
  message?: string;
};

export const authApi = {
  login: (identifier: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  requestContactOtp: () =>
    request<{ message: string; devOtp?: string }>("/auth/me/contact-otp", {
      method: "POST",
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/password/change", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  requestLoginOtp: (identifier: string) =>
    request<{ message: string; devOtp?: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),
  verifyLoginOtp: (identifier: string, code: string) =>
    request<AuthResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ identifier, code }),
    }),
  requestPasswordReset: (identifier: string) =>
    request<{ message: string; devOtp?: string }>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),
  verifyPasswordResetOtp: (identifier: string, code: string) =>
    request<{ ok: boolean; message: string }>("/auth/password/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, code }),
    }),
  resetPassword: (identifier: string, code: string, password: string) =>
    request<{ message: string }>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ identifier, code, password }),
    }),
  requestSignupOtp: (form: FormData) =>
    request<{ message: string; devOtp?: string }>(
      "/auth/register/request-otp",
      { method: "POST", body: form },
    ),
  verifySignupOtp: (identifier: string, code: string) =>
    request<AuthResponse>("/auth/register/verify-otp", {
      method: "POST",
      body: JSON.stringify({ identifier, code }),
    }),
  me: (token?: string) =>
    request<{ user: User }>(
      "/auth/me",
      token ? { headers: { Authorization: `Bearer ${token}` } } : {},
    ),
  update: (
    token: string,
    payload: { name?: string; email?: string; mobile?: string; otp?: string },
  ) =>
    request<{ user: User }>("/auth/me", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
};

export type WorkerProfile = {
  _id: string;
  user: string | { _id?: string; profileImage?: string; name?: string };
  profileImage?: string;
  headline: string;
  bio: string;
  skillNames: string[];
  experienceYears: number;
  district: string;
  taluka: string;
  city: string;
  area: string;
  locality: string;
  languages: string[];
  availability: "available" | "busy" | "unavailable";
  verificationStatus: "pending" | "approved" | "rejected";
  verificationRejectionReason?: string;
  ratingAverage?: number;
  ratingCount?: number;
  completedJobs?: number;
  responseRate?: number;
};
export type VerificationDocument = {
  _id: string;
  worker:
    | string
    | { _id: string; name: string; email?: string; mobile?: string };
  type: string;
  fileName: string;
  contentType: string;
  size: number;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
};
export const workerApi = {
  me: () => request<{ profile: WorkerProfile }>("/workers/me"),
  update: (payload: Partial<WorkerProfile>) =>
    request<{ profile: WorkerProfile }>("/workers/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  uploadDocument: (fd: FormData) =>
    request<{
      document: { id: string; type: string; fileName: string; status: string };
    }>("/workers/me/documents", { method: "POST", body: fd }),
  documents: () =>
    request<{ documents: VerificationDocument[] }>("/workers/me/documents"),
};
export const notificationApi = {
  list: () =>
    request<{ notifications: any[]; unreadCount: number }>("/notifications"),
  markRead: (id: string) =>
    request<{ ok: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    request<{ ok: boolean }>("/notifications/read-all", { method: "POST" }),
};

export type BookingWorker = {
  id: string;
  name: string;
  role?: string;
  place?: string;
  rating?: number;
  photo?: string;
  verified?: boolean;
};
export type CustomerBooking = {
  id: string;
  status: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  worker?: BookingWorker;
};
export const bookingsApi = {
  mine: () => request<{ bookings: any[] }>("/bookings/mine"),
  updateStatus: (
    id: string,
    status: string,
    agreedAmount?: number,
    selfie?: File,
  ) => {
    if (selfie) {
      const fd = new FormData();
      fd.append("status", status);
      if (agreedAmount !== undefined)
        fd.append("agreedAmount", String(agreedAmount));
      fd.append("selfie", selfie);
      return request<{ booking: any }>(
        `/bookings/${encodeURIComponent(id)}/status`,
        { method: "PATCH", body: fd },
      );
    }
    return request<{ booking: any }>(
      `/bookings/${encodeURIComponent(id)}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(agreedAmount !== undefined ? { agreedAmount } : {}),
        }),
      },
    );
  },
  complete: (id: string) =>
    request<{ booking: any }>(`/bookings/${encodeURIComponent(id)}/complete`, {
      method: "PATCH",
    }),
  list: () => request<{ bookings: CustomerBooking[] }>("/bookings"),
  get: (id: string) =>
    request<{ booking: CustomerBooking }>(
      `/bookings/${encodeURIComponent(id)}`,
    ),
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};
export type LocationCatalog = {
  state: string;
  districts: string[];
  talukas: string[];
  localities: string[];
};
export const catalogApi = {
  categories: () => request<{ categories: Category[] }>("/catalog/categories"),
  locations: (district?: string, taluka?: string) => {
    const q = new URLSearchParams();
    if (district) q.set("district", district);
    if (taluka) q.set("taluka", taluka);
    return request<LocationCatalog>(
      `/catalog/locations${q.toString() ? `?${q}` : ""}`,
    );
  },
  stats: () =>
    request<{
      workers: number;
      completedJobs: number;
      averageRating: number;
      reviews: number;
    }>("/catalog/stats"),
};

export type PublicWorker = {
  id: string;
  name: string;
  profileImage?: string;
  profession?: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  district?: string;
  taluka?: string;
  city?: string;
  area?: string;
  locality?: string;
  experienceYears?: number;
  languages?: string[];
  availability?: string;
  verificationStatus?: string;
  rating?: number;
  ratingCount?: number;
  reviewCount?: number;
  completedJobs?: number;
  responseRate?: number;
  joinedAt?: string;
  portfolio?: { title: string; description: string; imageUrl?: string }[];
};
export const workersApi = {
  search: (
    params: {
      q?: string;
      category?: string;
      skill?: string;
      district?: string;
      taluka?: string;
      experienceMin?: number;
      ratingMin?: number;
      verified?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== false) q.set(k, String(v));
    });
    return request<{
      workers: PublicWorker[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/workers/search${q.toString() ? `?${q}` : ""}`);
  },
  get: (id: string) =>
    request<{ worker: PublicWorker; reviews: any[] }>(
      `/workers/${encodeURIComponent(id)}`,
    ),
  favorites: () => request<{ workerIds: string[] }>("/workers/favorites"),
  toggleFavorite: (id: string) =>
    request<{ favorite: boolean }>(
      `/workers/${encodeURIComponent(id)}/favorite`,
      { method: "PATCH" },
    ),
};

export type ChatMessage = {
  _id: string;
  conversationKey: string;
  sender: string;
  recipient: string;
  text: string;
  createdAt: string;
  attachment?: {
    name: string;
    contentType: string;
    size: number;
    url?: string;
  } | null;
};
export type Conversation = {
  key: string;
  participant: {
    _id: string;
    name: string;
    profileImage?: string;
    role?: string;
  };
  messages?: ChatMessage[];
};
export const messagesApi = {
  conversations: () =>
    request<{ conversations: any[] }>("/messages/conversations"),
  conversation: (userId: string) =>
    request<{ conversation: Conversation; messages: ChatMessage[] }>(
      `/messages/${encodeURIComponent(userId)}`,
    ),
  // Uses multipart only when an attachment is present so text-only chat stays simple.
  send: (userId: string, text: string, file?: File, bookingId?: string) => {
    const fd = new FormData();
    if (text.trim()) fd.append("text", text.trim());
    if (file) fd.append("file", file);
    if (bookingId) fd.append("bookingId", bookingId);
    return request<{ message: ChatMessage }>(
      `/messages/${encodeURIComponent(userId)}`,
      { method: "POST", body: fd },
    );
  },
  markRead: (userId: string) =>
    request<{ ok: boolean }>(`/messages/${encodeURIComponent(userId)}/read`, {
      method: "PATCH",
    }),
};

export type JobPayload = {
  title: string;
  description: string;
  category: string;
  skills?: string[];
  workersNeeded: number;
  date: string;
  startTime?: string;
  endTime?: string;
  district: string;
  taluka?: string;
  locality?: string;
  address?: string;
  budget?: number | null;
  specialRequirements?: string;
  image?: File | null;
};
export const jobsApi = {
  mine: () => request<{ jobs: any[] }>("/jobs/mine"),
  updateApplication: (id: string, status: "accepted" | "rejected") =>
    request<{ application: any; booking?: any }>(
      `/jobs/applications/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify({ status }) },
    ),
  applicationsMine: () =>
    request<{ applications: any[] }>("/jobs/applications/mine"),
  apply: (jobId: string, note: string) =>
    request<{ application: any }>(`/jobs/${encodeURIComponent(jobId)}/apply`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  withdrawApplication: (id: string) =>
    request<{ application: any }>(
      `/jobs/applications/${encodeURIComponent(id)}/withdraw`,
      { method: "PATCH" },
    ),
  // The reusable helper converts the requirement payload to FormData only when an image is supplied.
  create: (payload: JobPayload) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (key === "image") {
        if (value instanceof File) fd.append("image", value);
        return;
      }
      if (key === "skills") {
        fd.append("skills", JSON.stringify(value));
        return;
      }
      fd.append(key, String(value));
    });
    return request<{ job: any }>("/jobs", { method: "POST", body: fd });
  },
  list: (
    params: {
      q?: string;
      category?: string;
      district?: string;
      taluka?: string;
      status?: string;
      skill?: string;
    } = {},
  ) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    return request<{ jobs: any[]; pagination: any }>(
      `/jobs${q.toString() ? `?${q}` : ""}`,
    );
  },
  imageUrl: (jobId: string) => `${API}/jobs/${encodeURIComponent(jobId)}/image`,
};

export const aiApi = {
  ask: (
    token: string | undefined,
    message: string,
    context?: Record<string, unknown>,
  ) =>
    request<{ answer: string; workers?: PublicWorker[]; jobs?: any[] }>("/ai", {
      method: "POST",
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      body: JSON.stringify({ message, context }),
    }),
};
export const fileUrl = (path?: string) =>
  path
    ? path.startsWith("http")
      ? path
      : `${API.replace(/\/api$/, "")}${path}`
    : "";
export { API };
export async function uploadProfileImage(token: string, file: File) {
  const fd = new FormData();
  fd.append("image", file);
  return request<{ user: User }>("/profile/image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
}

export type SupportTicketPayload = {
  subject: string;
  description: string;
  category?: string;
};
export type SupportTicket = {
  _id: string;
  complaintId: string;
  subject: string;
  description: string;
  category: string;
  status: "Submitted" | "In Review" | "Resolved" | "Rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
export const complaintsApi = {
  mine: () => request<{ complaints: SupportTicket[] }>("/complaints"),
  create: (payload: SupportTicketPayload) =>
    request<{ complaint: SupportTicket }>("/complaints", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
export type AdminStats = {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  pendingVerification: number;
  activeBookings: number;
  completedJobs: number;
  totalComplaints: number;
  totalDocuments: number;
  totalCategories: number;
  notificationCount: number;
  complaintsByStatus: {
    pending: number;
    processing: number;
    resolved: number;
    rejected: number;
  };
  recentComplaints: any[];
  recentUsers: any[];
  bookingOverview: { status: string; count: number }[];
  topCategories: { category: string; jobs: number; workersNeeded: number }[];
  locationDistribution: { district: string; workers: number }[];
};
export const adminApi = {
  stats: () => request<AdminStats>("/admin/dashboard/stats"),
  clearNotifications: () =>
    request<{ ok: boolean; clearedAt: string }>("/admin/notifications/clear", {
      method: "POST",
    }),
  complaintsTrend: (days = 14) =>
    request<{ trend: { date: string; count: number }[] }>(
      `/admin/dashboard/complaints-trend?days=${days}`,
    ),
  complaintsStatus: () =>
    request<{ statuses: { status: string; count: number }[] }>(
      "/admin/dashboard/complaints-status",
    ),
  usersTrend: (days = 14) =>
    request<{
      trend: {
        date: string;
        total: number;
        workers: number;
        customers: number;
      }[];
    }>(`/admin/dashboard/users-trend?days=${days}`),
  users: (
    params: {
      q?: string;
      status?: string;
      role?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(`/admin/users${q.toString() ? `?${q}` : ""}`);
  },
  userStatus: (id: string, status: string) =>
    request<{ user: User }>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  changeRole: (
    id: string,
    role: "customer" | "worker",
    data?: { experienceYears?: number; idDocument?: File; selfie?: File },
  ) => {
    if (role === "worker") {
      const fd = new FormData();
      fd.append("role", role);
      fd.append("experienceYears", String(data?.experienceYears ?? 0));
      if (data?.idDocument) fd.append("idDocument", data.idDocument);
      if (data?.selfie) fd.append("selfie", data.selfie);
      return request<{ user: User; profile: any }>(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: fd,
      });
    }
    return request<{ user: User; profile?: any }>(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
  deleteUser: (id: string) =>
    request<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE" }),
  documents: (
    params: {
      q?: string;
      category?: string;
      language?: string;
      status?: string;
      fileType?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request<{
      documents: any[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(`/admin/documents${q.toString() ? `?${q}` : ""}`);
  },
  document: (id: string) =>
    request<{ document: any }>(`/admin/documents/${id}`),
  createDocument: (fd: FormData) =>
    request<{ document: any }>("/admin/documents", {
      method: "POST",
      body: fd,
    }),
  updateDocument: (id: string, fd: FormData) =>
    request<{ document: any }>(`/admin/documents/${id}`, {
      method: "PATCH",
      body: fd,
    }),
  deleteDocument: (id: string) =>
    request<{ ok: boolean }>(`/admin/documents/${id}`, { method: "DELETE" }),
  complaints: (params: { q?: string; status?: string } = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) q.set(k, v);
    });
    return request<{ complaints: any[] }>(
      `/admin/complaints${q.toString() ? `?${q}` : ""}`,
    );
  },
  updateComplaint: (id: string, payload: { status: string; notes?: string }) =>
    request<{ complaint: any }>(`/admin/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  workers: (status = "") =>
    request<{ workers: any[] }>(
      `/admin/workers${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    ),
  verificationDocuments: (status = "") =>
    request<{ documents: any[] }>(
      `/admin/verification${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    ),
  updateVerification: (id: string, status: string, adminNote?: string) =>
    request<{ document: any; verificationStatus: string }>(
      `/admin/verification/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, adminNote: adminNote || "" }),
      },
    ),
  updateWorkerVerification: (id: string, status: string, reason?: string) =>
    request<{ profile: any }>(`/admin/workers/${id}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason: reason || "" }),
    }),
  bookings: () => request<{ bookings: any[] }>("/admin/bookings"),
  jobs: () => request<{ jobs: any[] }>("/admin/jobs"),
};
