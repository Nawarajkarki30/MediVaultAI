import React, { useState, useRef, useEffect } from 'react';
import { FileText, MoreVertical, Eye, Download, Share2, Inbox, RotateCcw } from 'lucide-react';
import { DashboardReport, ReportCategory, DashboardLanguage } from '../../types/dashboard';
import { TRANSLATIONS } from '../../lib/translations';

interface RecentReportsProps {
  reports: DashboardReport[];
  selectedCategory: ReportCategory;
  onSelectCategory: (category: ReportCategory) => void;
  language: DashboardLanguage;
  onViewReport: (report: DashboardReport) => void;
  onViewAllClick: () => void;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export const RecentReports: React.FC<RecentReportsProps> = ({
  reports,
  selectedCategory,
  onSelectCategory,
  language,
  onViewReport,
  onViewAllClick,
  onResetFilters,
  isFiltered,
}) => {
  const t = TRANSLATIONS[language];
  const [activeMenuReportId, setActiveMenuReportId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuReportId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterButtons = [
    { id: 'all' as ReportCategory, label: t.filterAll },
    { id: 'blood-test' as ReportCategory, label: t.filterBloodTests },
    { id: 'x-ray' as ReportCategory, label: t.filterXRay },
    { id: 'prescription' as ReportCategory, label: t.filterPrescription },
    { id: 'checkup' as ReportCategory, label: t.filterCheckup },
  ];

  const getCategoryBadgeClass = (category: ReportCategory) => {
    switch (category) {
      case 'blood-test':
        return 'bg-blue-50 text-brand-600 border-blue-200';
      case 'x-ray':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'prescription':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'checkup':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <section
      aria-label="Recent Medical Reports"
      className="bg-white rounded-3xl border border-brand-border p-5 sm:p-6 shadow-subtle space-y-5"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-navy-950">{t.recentReportsTitle}</h2>
        <button
          type="button"
          onClick={onViewAllClick}
          className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 rounded-lg px-2 py-1 min-h-[36px] flex items-center"
        >
          {t.viewAllLink}
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Category Pills (Horizontal scroll on very small screens) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {filterButtons.map((btn) => {
            const isActive = selectedCategory === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => onSelectCategory(btn.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 min-h-[36px] ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-950 border border-slate-200/60'
                } focus:outline-hidden focus:ring-2 focus:ring-brand-500`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Search status or reset indicator if filtered */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFiltersBtn}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {reports.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-navy-950">{t.emptyReportsTitle}</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">{t.emptyReportsDesc}</p>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetFiltersBtn}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (Visible >= md) */}
          <div className="hidden md:block overflow-x-auto" ref={menuRef}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th scope="col" className="pb-3 font-semibold">
                    {t.thDocumentName}
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    {t.thCategory}
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    {t.thDateUploaded}
                  </th>
                  <th scope="col" className="pb-3 font-semibold">
                    {t.thStatus}
                  </th>
                  <th scope="col" className="pb-3 font-semibold text-right">
                    {t.thAction}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reports.map((report) => {
                  const isMenuOpen = activeMenuReportId === report.id;
                  const categoryLabel =
                    language === 'en' ? report.categoryLabelEn : report.categoryLabelNe;

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Document Name & Facility */}
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50/80 border border-brand-100 flex items-center justify-center text-brand-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-navy-950 block truncate group-hover:text-brand-600 transition-colors">
                              {report.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {report.facility}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                            report.category
                          )}`}
                        >
                          {categoryLabel}
                        </span>
                      </td>

                      {/* Date Uploaded */}
                      <td className="py-3.5 pr-4 whitespace-nowrap text-slate-500">
                        {report.dateUploaded}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {t.statusProcessed}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2 relative">
                          <button
                            type="button"
                            onClick={() => onViewReport(report)}
                            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline px-2.5 py-1 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[36px]"
                          >
                            {t.actionView}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuReportId((prev) =>
                                prev === report.id ? null : report.id
                              )
                            }
                            aria-label={`Options for ${report.name}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-brand-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Options Popover */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-brand-border p-1.5 z-40 text-left space-y-1 animate-in fade-in duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuReportId(null);
                                  onViewReport(report);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-brand-500" />
                                <span>{t.actionView}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuReportId(null);
                                  alert(`Demonstration PDF download for ${report.name}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 text-brand-500" />
                                <span>{t.actionDownload}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuReportId(null);
                                  alert(`Family sharing link for ${report.name}`);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5 text-brand-500" />
                                <span>{t.actionShare}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Visible < md, strictly matching 375px mobile wireframe!) */}
          <div className="block md:hidden space-y-3">
            {reports.map((report) => {
              const categoryLabel =
                language === 'en' ? report.categoryLabelEn : report.categoryLabelNe;

              return (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-500 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-navy-950 truncate">{report.name}</h3>
                        <p className="text-[11px] text-slate-500 truncate">{report.facility}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewReport(report)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-brand-200 text-brand-600 font-bold text-xs hover:bg-brand-50 transition-colors shrink-0 min-h-[38px]"
                    >
                      {t.actionView}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{report.dateUploaded}</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getCategoryBadgeClass(
                          report.category
                        )}`}
                      >
                        {categoryLabel}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {t.statusProcessed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
