export type UserRole = "ADMIN" | "USER";

export type ReportEmbedMode = "direct_url" | "powerbi_embedded";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  powerbi_url: string;
  category_id: string | null;
  category: string;
  icon: string;
  active: boolean;
  sort_order: number;
  embed_mode: ReportEmbedMode;
  powerbi_workspace_id: string | null;
  powerbi_report_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportWithCategory extends Report {
  categories?: Pick<Category, "id" | "name" | "icon" | "sort_order" | "active"> | null;
}

export interface UserReport {
  id: string;
  user_id: string;
  report_id: string;
  assigned_at: string;
  assigned_by: string | null;
}

export interface ProfileWithAssignments extends Profile {
  assigned_report_ids: string[];
  assigned_reports_count: number;
}

export interface ReportWithAssignments extends Report {
  assigned_user_ids: string[];
  assigned_users_count: number;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
}
