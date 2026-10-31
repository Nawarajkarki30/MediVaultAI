import React from 'react';
import { Inbox, RotateCcw } from 'lucide-react';
import { DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface VaultEmptyStateProps {
  language: DashboardLanguage;
  onResetFilters: () => void;
  onResetAllDocs?: () => void;
  isAllCleared?: boolean;
}

export const VaultEmptyState: React.FC<VaultEmptyStateProps> = ({
  language,
  onResetFilters,
  onResetAllDocs,
  isAllCleared = false,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-12 text-center space-y-4 shadow-subtle">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200 shadow-2xs">
        <Inbox className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-navy-950">
          {t.noVaultDocsFound}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {t.noVaultDocsDesc}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors min-h-[40px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetVaultFilters}</span>
        </button>

        {isAllCleared && onResetAllDocs && (
          <button
            type="button"
            onClick={onResetAllDocs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors min-h-[40px]"
          >
            <span>Restore Demo Records</span>
          </button>
        )}
      </div>
    </div>
  );
};
