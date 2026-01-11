export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface User {
  id: string;
  name: string;
}
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number;
}
// MapleMetrics Specific Types
export type ProgramType = 'General' | 'CEC' | 'PNP' | 'FSW' | 'FST' | 'Category-based';
export interface DrawEntry {
  id: string;
  drawNumber: number;
  date: string; // ISO string
  programType: ProgramType;
  itasIssued: number;
  crsScore: number;
  description?: string;
}
export interface DrawStatistics {
  latestCrsScore: number;
  totalItasYearToDate: number;
  averageCrsLastFive: number;
  lastDrawDate: string;
  itaGrowthPercentage: number;
}
export interface CRSProfile {
  id: string;
  label: string;
  date: string;
  score: number;
  age: string;
  education: string;
  language: string;
  experience: string;
}