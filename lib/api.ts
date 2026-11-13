import axios from "axios";
import toast from "react-hot-toast";

declare module "axios" {
  interface AxiosRequestConfig {
    skipToast?: boolean;
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    } else if (!error.config?.skipToast) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    return Promise.reject(error);
  }
);

export async function uploadFile(file: File, kind: "image" | "document") {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  const res = await api.post<{ id: string; url: string; name: string }>("/api/files", body);
  return res.data;
}

export default api;
