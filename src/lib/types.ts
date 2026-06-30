// Shared TypeScript types mirroring the Firestore data model.

export type AdminRole = "super_admin" | "admin" | "revoked";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  createdAt: number;
  lastLogin: number | null;
  createdBy: string | null;
  needsPasswordReset?: boolean;
}

export interface CommunityFolder {
  id: string;
  name: string;
  description: string;
  iconEmoji: string;
  isVisible: boolean;
  createdAt: number;
  createdBy: string;
  photoCount: number;
}

export interface Photo {
  id: string;
  folderId: string;
  storagePath: string;
  caption: string;
  isPublished: boolean;
  uploadedAt: number;
  uploadedBy: string;
}

export interface BlogPost {
  id: string;
  title: string;
  bodyText: string;
  coverImagePath: string | null;
  isPublished: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt: number;
}

export type OrgContentSection = "about" | "vision" | "mission" | "coreValues";

export interface OrgContent {
  id: string;
  sectionType: OrgContentSection;
  bodyText: string;
  lastUpdated: number;
  updatedBy: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  receivedAt: number;
  isRead: boolean;
}

export interface HeroImage {
  id: string;
  storagePath: string; // Cloudinary secure URL
  uploadedAt: number;
  uploadedBy: string;
}
