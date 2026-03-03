import { Timestamp } from "firebase/firestore";

export interface AgendaTask {
  role: string;
  description: string;
}

export interface Agenda {
  id: string;
  title: string;
  description: string;
  category: "Kajian" | "Rapat" | "Event" | string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  location: string;
  status?: "active" | "done";
  tasks?: AgendaTask[];
  createdAt?: Timestamp;
  createdBy?: string;
}
