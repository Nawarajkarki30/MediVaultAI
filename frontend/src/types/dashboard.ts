export type ReportCategory = 'all' | 'blood-test' | 'x-ray' | 'prescription' | 'checkup';

export type ReportStatus = 'processed' | 'analyzing' | 'pending';

export type PermissionStatus = 'can_view' | 'pending';

export interface DashboardReport {
  id: string;
  name: string;
  facility: string;
  category: ReportCategory;
  categoryLabelEn: string;
  categoryLabelNe: string;
  dateUploaded: string;
  status: ReportStatus;
  fileSize: string;
  sampleSummaryEn: string;
  sampleSummaryNe: string;
  keyFindingsEn: string[];
  keyFindingsNe: string[];
  doctorName?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  initials: string;
  relationshipEn: string;
  relationshipNe: string;
  permissionStatus: PermissionStatus;
  avatarColor: string;
  sharedReportsCount: number;
}

export interface DashboardStats {
  totalReports: number;
  reportsDelta: number;
  familyMembersCount: number;
  aiExplanationsCount: number;
  explanationsDelta: number;
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleNe: string;
  messageEn: string;
  messageNe: string;
  timeAgoEn: string;
  timeAgoNe: string;
  read: boolean;
  type: 'report' | 'family' | 'system';
}

export type DashboardLanguage = 'en' | 'ne';

export type DashboardNavTab =
  'dashboard' | 'vault' | 'ai' | 'family' | 'caregivers' | 'notifications' | 'settings';
