// frontend/src/components/intelligence/FieldReviewCard.tsx
// MediVault AI — Structured Metadata and Field Review Cards

import React from 'react';
import { ExtractedFieldItem } from '../../types/documentIntelligence';
import { DashboardLanguage } from '../../types/dashboard';
import { ConfidencePill } from './UncertaintyNotice';
import { SourceReference } from './SourceReference';

interface MetadataFieldRowProps {
  field: ExtractedFieldItem;
  language: DashboardLanguage;
  onEdit?: (field: ExtractedFieldItem) => void;
  onNavigateToPage?: (page: number) => void;
}

export const MetadataFieldRow: React.FC<MetadataFieldRowProps> = ({
  field,
  language,
  onEdit,
  onNavigateToPage,
}) => {
  const label = language === 'ne' ? field.labelNe : field.labelEn;

  return (
    <div
      className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0 text-sm"
      data-testid={`meta-row-${field.fieldName}`}
    >
      <div className="w-1/3 text-slate-500 dark:text-slate-400 font-medium truncate pr-2">
        {label}
      </div>

      <div className="w-1/3 font-semibold text-slate-800 dark:text-slate-100 truncate pr-2">
        {field.userCorrection ? (
          <div className="flex items-center space-x-1.5">
            <span className="line-through text-slate-400 text-xs">
              {field.userCorrection.originalValue}
            </span>
            <span className="text-[#2675F5]">{field.userCorrection.correctedValue}</span>
          </div>
        ) : (
          field.value
        )}
      </div>

      <div className="w-1/3 flex items-center justify-end space-x-2">
        <ConfidencePill confidence={field.confidence} language={language} />
        {field.source && onNavigateToPage && (
          <SourceReference
            source={field.source}
            language={language}
            onNavigateToPage={onNavigateToPage}
            className="hidden sm:inline-flex"
          />
        )}
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(field)}
            className="text-xs text-slate-400 hover:text-[#2675F5] dark:hover:text-blue-400 p-1 rounded"
            title="Edit field value (Demo)"
            aria-label={`Edit ${label}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface FieldSectionCardProps {
  title: string;
  fields: ExtractedFieldItem[];
  language: DashboardLanguage;
  onEditSection?: () => void;
  onEditField?: (field: ExtractedFieldItem) => void;
  onNavigateToPage?: (page: number) => void;
  testId?: string;
}

export const FieldSectionCard: React.FC<FieldSectionCardProps> = ({
  title,
  fields,
  language,
  onEditSection,
  onEditField,
  onNavigateToPage,
  testId,
}) => {
  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-xs"
      data-testid={testId || 'field-section-card'}
    >
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
          {title}
        </h4>
        {onEditSection && (
          <button
            type="button"
            onClick={onEditSection}
            className="inline-flex items-center text-xs font-semibold text-[#2675F5] hover:text-blue-700 dark:text-blue-400 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            data-testid={`edit-section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {fields.map((f) => (
          <MetadataFieldRow
            key={f.id}
            field={f}
            language={language}
            onEdit={onEditField}
            onNavigateToPage={onNavigateToPage}
          />
        ))}
      </div>
    </div>
  );
};
