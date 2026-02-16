import { Timestamp } from "firebase/firestore";

export interface Agenda {
  id: string;
  title: string;
  description: string;
  category: "Kajian" | "Rapat" | "Event" | string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  location: string;
  createdAt?: Timestamp;
  createdBy?: string;
}
