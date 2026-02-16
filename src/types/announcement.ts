import { Timestamp } from "firebase/firestore";

export type AnnouncementCategory =
  | "Penting"
  | "Kegiatan"
  | "Sosial"
  | "Informasi Umum"
  | "Keuangan";

export type AnnouncementUrgency = "Mendesak" | "Penting" | "Biasa";

export type TargetAudience =
  | "Seluruh Anggota"
  | "Pengurus"
  | "Panitia Kegiatan"
  | "Anggota Baru";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  urgency: AnnouncementUrgency;
  targetAudience: TargetAudience[];
  createdAt: Timestamp;
  createdBy: {
    uid: string;
    name: string;
    role: string;
  }; // Snapshot of creator info
  isPinned?: boolean; // Optional, can be derived from urgency "Mendesak" but good to have explicit
  attachments?: string[]; // URLs to files (keeping for backward compatibility or multiple files in future)
  attachment?: {
    url: string;
    name: string;
    type: string;
    path: string;
  };
  externalLink?: string;
  updatedAt?: Timestamp;
}
