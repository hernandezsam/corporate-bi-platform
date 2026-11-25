import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  Clock,
  Cpu,
  Database,
  DollarSign,
  FileBarChart,
  FileSpreadsheet,
  Folder,
  FolderKanban,
  Globe,
  Landmark,
  Layers,
  LineChart,
  PieChart,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  LineChart,
  PieChart,
  FileBarChart,
  FileSpreadsheet,
  TrendingUp,
  Landmark,
  Wallet,
  DollarSign,
  Briefcase,
  FolderKanban,
  Folder,
  Users,
  UserCheck,
  Clock,
  Activity,
  Building2,
  Cpu,
  Database,
  Globe,
  Layers,
  ShieldCheck,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export function getIconByName(name?: string | null): LucideIcon {
  if (!name) return BarChart3;
  return ICON_MAP[name] ?? BarChart3;
}
