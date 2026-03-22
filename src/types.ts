import { LucideIcon } from 'lucide-react';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  name: string;
  estimated: number;
  actual: number;
}

export interface Module {
  id: string;
  title: string;
  icon: string; // Icon name from lucide
  tasks: Task[];
}

export interface BrandSettings {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    paper: string;
  };
  logoUrl?: string;
  salonName: string;
}

export interface AppState {
  modules: Module[];
  openingDate: string;
  hammamStatus: 'Ready' | 'Plumbing' | 'Tiling' | 'Foundation';
  brandSettings: BrandSettings;
}
