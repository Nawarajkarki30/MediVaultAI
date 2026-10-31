import React, { useState } from 'react';
import {
  Home,
  FileText,
  Sparkles,
  Users,
  MoreHorizontal,
  UserCheck,
  Bell,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { DashboardNavTab, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MobileBottomNavProps {
  activeTab: DashboardNavTab;
  onSelectTab: (tab: DashboardNavTab) => void;
  language: DashboardLanguage;
  onLanguageChange: (lang: DashboardLanguage) => void;
  unreadCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  onLanguageChange,
  unreadCount,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/auth/login', { replace: true });
    }
  };

  const mainTabs = [
    { id: 'dashboard' as DashboardNavTab, label: t.tabHome, icon: Home },
    { id: 'vault' as DashboardNavTab, label: t.tabVault, icon: FileText },
    { id: 'ai' as DashboardNavTab, label: t.tabAI, icon: Sparkles },
    { id: 'family' as DashboardNavTab, label: t.tabFamily, icon: Users },
  ];

  return (
    <>
      {/* Mobile Slide-Up "More" Sheet */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label="More options menu"
        >
          <div className="fixed inset-0" onClick={() => setIsMoreOpen(false)} aria-hidden="true" />

          <div className="relative bg-white rounded-t-3xl border-t border-brand-border p-6 space-y-4 z-10 max-h-[80vh] overflow-y-auto">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-navy-950">{user?.fullName}</span>
                <span className="text-[11px] text-slate-400 block">{t.patientAccount}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label={t.closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-navy-950 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('caregivers');
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                <UserCheck className="w-4 h-4 text-brand-500" />
                <span>{t.navCaregivers}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('notifications');
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-brand-500" />
                  <span>{t.navNotifications}</span>
                </div>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('settings');
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                <Settings className="w-4 h-4 text-brand-500" />
                <span>{t.navSettings}</span>
              </button>

              {/* Language Switcher inside More */}
              <div className="pt-2 pb-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 px-3.5 block mb-2">
                  Language / भाषा
                </span>
                <div className="grid grid-cols-2 gap-2 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('en');
                      setIsMoreOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      language === 'en'
                        ? 'bg-brand-50 border-brand-300 text-brand-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('ne');
                      setIsMoreOpen(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border ${
                      language === 'ne'
                        ? 'bg-brand-50 border-brand-300 text-brand-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    नेपाली
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>{t.navLogout}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar on Mobile */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onSelectTab(tab.id);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[44px] min-w-[56px] focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
                isActive ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-navy-950'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">{tab.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-brand-500 mt-1" />}
            </button>
          );
        })}

        {/* More Tab Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          aria-expanded={isMoreOpen}
          aria-label="Open more menu"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-h-[44px] min-w-[56px] focus:outline-hidden focus:ring-2 focus:ring-brand-500 ${
            isMoreOpen ? 'text-brand-500 font-bold' : 'text-slate-400 hover:text-navy-950'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">{t.tabMore}</span>
          {isMoreOpen && <span className="w-1 h-1 rounded-full bg-brand-500 mt-1" />}
        </button>
      </nav>
    </>
  );
};
