import { Timestamp } from "firebase/firestore";

export type FundType = "kas" | "infak";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  fundType?: FundType; // Optional for backward compatibility
  date: Timestamp;
  createdBy: string;
  updatedAt?: Timestamp;
}

export interface InfakClass {
  className: string;
  amount: number;
}

export interface InfakSession {
  id: string;
  title: string; // e.g., "Infak Jumat 17 Feb 2024"
  date: Timestamp;
  classes: InfakClass[];
  total: number;
  status: "draft" | "completed";
  createdAt: Timestamp;
  createdBy: string;
  createdByName?: string; // Display name of the creator
  transactionId?: string; // Link to the created transaction
}
