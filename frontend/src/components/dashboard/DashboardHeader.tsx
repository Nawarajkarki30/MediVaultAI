import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Globe,
  ChevronDown,
  Shield,
  Settings,
  LogOut,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLanguage, NotificationItem } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: DashboardLanguage;
  onLanguageChange: (lang: DashboardLanguage) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkNotificationsAsRead: () => void;
  onOpenSettings: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  language,
  onLanguageChange,
  notifications,
  unreadCount,
  onMarkNotificationsAsRead,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K shortcut listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/auth/login', { replace: true });
    }
  };

  const displayName = user?.fullName || 'Sita Sharma';
  const firstName = displayName.split(' ')[0] || displayName;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-brand-border px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchAriaLabel}
            className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-navy-950 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none hidden sm:flex">
            <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-400 shadow-2xs">
              {t.searchShortcut}
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications, Language, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label={`${t.notificationsTitle} (${unreadCount} unread)`}
            className="relative p-2.5 rounded-2xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-slate-200"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Window */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-brand-border p-4 space-y-3 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-navy-950">{t.notificationsTitle}</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkNotificationsAsRead}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.markAllAsRead}</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">{t.noNotifications}</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl text-xs transition-colors border ${
                        item.read
                          ? 'bg-white border-slate-100 text-slate-600'
                          : 'bg-blue-50/50 border-blue-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-navy-950">
                          {language === 'en' ? item.titleEn : item.titleNe}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {language === 'en' ? item.timeAgoEn : item.timeAgoNe}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {language === 'en' ? item.messageEn : item.messageNe}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector Dropdown */}
        <div ref={langRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            aria-label="Select language"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 hover:text-navy-950 hover:bg-slate-100 border border-slate-200/80 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[44px]"
          >
            <Globe className="w-4 h-4 text-brand-500" />
            <span className="hidden sm:inline">{language === 'en' ? 'English' : 'नेपाली'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-lg border border-brand-border py-1.5 z-50 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  onLanguageChange('en');
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onLanguageChange('ne');
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors ${
                  language === 'ne'
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>नेपाली (Nepali)</span>
                {language === 'ne' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-label="Open patient profile menu"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[44px]"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-sky-400 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white shrink-0">
              {initial}
            </div>
            <span className="text-xs font-bold text-navy-950 hidden md:inline">{firstName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-brand-border p-3 z-50 space-y-2 animate-in fade-in duration-150">
              <div className="p-2 border-b border-slate-100">
                <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || 'patient@medivault.dev'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {t.patientAccount}
                </span>
              </div>

              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.accountSettings}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.securityPrivacy}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.navLogout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
