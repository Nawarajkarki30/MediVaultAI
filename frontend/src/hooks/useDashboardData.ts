import { useState, useMemo, useCallback } from 'react';
import {
  DashboardReport,
  FamilyMember,
  DashboardStats,
  NotificationItem,
  ReportCategory,
  DashboardLanguage,
  DashboardNavTab,
} from '../types/dashboard';
import {
  DEMO_STATS,
  DEMO_REPORTS,
  DEMO_FAMILY_MEMBERS,
  DEMO_NOTIFICATIONS,
} from '../data/demoDashboard';
import { TRANSLATIONS } from '../lib/translations';

export interface UseDashboardDataReturn {
  // State
  language: DashboardLanguage;
  setLanguage: (lang: DashboardLanguage) => void;
  t: (typeof TRANSLATIONS)['en'];
  activeNavTab: DashboardNavTab;
  setActiveNavTab: (tab: DashboardNavTab) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ReportCategory;
  setSelectedCategory: (cat: ReportCategory) => void;
  filteredReports: DashboardReport[];
  totalReportsCount: number;

  // Data
  stats: DashboardStats;
  familyMembers: FamilyMember[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationsAsRead: () => void;

  // Modals & Active Selections
  selectedReport: DashboardReport | null;
  setSelectedReport: (report: DashboardReport | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  comingSoonFeature: string | null;
  setComingSoonFeature: (featureName: string | null) => void;

  // AI Explanation language toggle inside the preview card
  aiExplanationLanguage: DashboardLanguage;
  setAiExplanationLanguage: (lang: DashboardLanguage) => void;

  // Helpers
  getTimeGreetingKey: () => 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening';
}

export const useDashboardData = (): UseDashboardDataReturn => {
  const [language, setLanguage] = useState<DashboardLanguage>('en');
  const [aiExplanationLanguage, setAiExplanationLanguage] = useState<DashboardLanguage>('en');
  const [activeNavTab, setActiveNavTab] = useState<DashboardNavTab>('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('all');

  const [reports] = useState<DashboardReport[]>(DEMO_REPORTS);
  const [familyMembers] = useState<FamilyMember[]>(DEMO_FAMILY_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);

  const [selectedReport, setSelectedReport] = useState<DashboardReport | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  // Active translation dictionary
  const t = useMemo(() => TRANSLATIONS[language], [language]);

  // Compute time of day greeting
  const getTimeGreetingKey = useCallback(():
    'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'greetingMorning';
    if (hour >= 12 && hour < 17) return 'greetingAfternoon';
    return 'greetingEvening';
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        report.name.toLowerCase().includes(q) ||
        report.facility.toLowerCase().includes(q) ||
        report.categoryLabelEn.toLowerCase().includes(q) ||
        report.categoryLabelNe.toLowerCase().includes(q) ||
        (report.doctorName && report.doctorName.toLowerCase().includes(q))
      );
    });
  }, [reports, selectedCategory, searchQuery]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  return {
    language,
    setLanguage,
    t,
    activeNavTab,
    setActiveNavTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredReports,
    totalReportsCount: reports.length,
    stats: DEMO_STATS,
    familyMembers,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    selectedReport,
    setSelectedReport,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isInviteModalOpen,
    setIsInviteModalOpen,
    comingSoonFeature,
    setComingSoonFeature,
    aiExplanationLanguage,
    setAiExplanationLanguage,
    getTimeGreetingKey,
  };
};
