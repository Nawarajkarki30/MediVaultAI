import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Users,
  UserCheck,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { DashboardNavTab, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardSidebarProps {
  activeTab: DashboardNavTab;
  onSelectTab: (tab: DashboardNavTab) => void;
  language: DashboardLanguage;
  unreadCount: number;
  className?: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  language,
  unreadCount,
  className = '',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = TRANSLATIONS[language];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/auth/login', { replace: true });
    }
  };

  const navItems = [
    { id: 'dashboard' as DashboardNavTab, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'vault' as DashboardNavTab, label: t.navVault, icon: FileText },
    { id: 'ai' as DashboardNavTab, label: t.navAI, icon: Sparkles },
    { id: 'family' as DashboardNavTab, label: t.navFamily, icon: Users },
    { id: 'caregivers' as DashboardNavTab, label: t.navCaregivers, icon: UserCheck },
    {
      id: 'notifications' as DashboardNavTab,
      label: t.navNotifications,
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'settings' as DashboardNavTab, label: t.navSettings, icon: Settings },
  ];

  const displayName = user?.fullName || 'Sita Sharma';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside
      className={`bg-white border-r border-brand-border flex flex-col justify-between p-5 min-h-screen select-none ${className}`}
      aria-label="Main Navigation"
    >
      {/* Top Section: Logo & Nav List */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="px-2 pt-1 pb-2">
          <Logo />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Dashboard Menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            const isVaultOpen =
              item.id === 'vault' &&
              (location.pathname.includes('/vault') || location.pathname.includes('/intelligence'));
            const isIntelligenceActive = location.pathname.includes('/intelligence');

            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 font-bold shadow-2xs'
                      : 'text-brand-muted hover:text-brand-navy hover:bg-slate-50'
                  } focus:outline-hidden focus:ring-2 focus:ring-brand-500`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-brand-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Vault Submenu (matching Wireframe) */}
                {isVaultOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => navigate('/patient/vault')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl font-medium transition-colors ${
                        !isIntelligenceActive && location.pathname.startsWith('/patient/vault')
                          ? 'text-[#2675F5] font-bold bg-blue-50/50'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      data-testid="sidebar-my-documents"
                    >
                      <span>My Documents</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/patient/vault/doc-01/intelligence')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl font-medium transition-colors ${
                        isIntelligenceActive
                          ? 'text-[#2675F5] font-bold bg-blue-50 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                      data-testid="sidebar-doc-intelligence"
                    >
                      <span className="truncate">{t.intelligenceTitle}</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-[#2675F5]">
                        {t.betaBadge}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Authenticated Patient Card & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        {/* Patient Profile Snapshot */}
        <div className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-navy-950 truncate">{displayName}</p>
            <p className="text-[11px] text-brand-muted truncate">{t.patientAccount}</p>
          </div>
        </div>

        {/* Real Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
          <span>{t.navLogout}</span>
        </button>
      </div>
    </aside>
  );
};
