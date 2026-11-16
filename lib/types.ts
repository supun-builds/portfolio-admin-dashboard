export interface Tech { id: string; name: string; logoUrl: string | null; logo: string | null; order: number }
export interface ImageRef { id: string; url: string }
export interface Project {
  id: string; title: string; description: string; githubUrl: string; liveUrl: string;
  images: ImageRef[]; technologies: Tech[]; featured: boolean; status: "PUBLISHED" | "DRAFT"; createdAt: string;
}
export interface ResearchItem {
  id: string;
  title: string;
  badge: string;
  authors: string;
  description: string;
  coverImage: string | null;
  coverImageUrl: string | null;
  images: ImageRef[];
  thesisUrl: string;
  paperUrl: string;
  projectUrl: string;
  githubUrl: string;
  featured: boolean;
  order: number;
  status: "PUBLISHED" | "DRAFT";
  createdAt?: string;
  updatedAt?: string;
}
export interface Profile {
  fullName: string; headline: string; bio: string; avatar: string | null; avatarUrl: string | null;
  cvFile: string | null; cvUrl: string | null; cvName: string;
  githubUrl: string; linkedinUrl: string;
  researchSubtitle?: string; researchGateUrl?: string; mediumUrl?: string;
  connectText: string; email: string; phone: string; location: string; openToWork: boolean;
}
export interface Msg { id: string; name: string; email: string; subject: string; message: string; read: boolean; createdAt: string }
export interface Pagination { pageNumber: number; pageSize: number; totalCount: number; totalPages: number }
