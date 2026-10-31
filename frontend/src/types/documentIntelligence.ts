// frontend/src/types/documentIntelligence.ts
// MediVault AI — Document Intelligence & Extraction Review Type Definitions

export type IntelligenceReviewStatus =
  | 'not-processed'
  | 'extraction-available'
  | 'needs-review'
  | 'patient-reviewed'
  | 'qualified-review-required'
  | 'unable-to-read';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SourceReferenceLocation {
  page: number;
  table?: string;
  row?: number;
  snippet?: string;
}

export interface PatientCorrection {
  originalValue: string;
  correctedValue: string;
  reason?: string;
  timestamp: string;
}

export interface ExtractedFieldItem<T = string> {
  id: string;
  fieldName: string;
  labelEn: string;
  labelNe: string;
  value: T;
  unit?: string;
  referenceRange?: string;
  confidence: ConfidenceLevel;
  source: SourceReferenceLocation;
  isFlagged?: boolean;
  userCorrection?: PatientCorrection;
  clinicalNote?: string;
}

export interface ExtractedPatientInfo {
  fullName: ExtractedFieldItem;
  dateOfBirth: ExtractedFieldItem;
  patientId: ExtractedFieldItem;
}

export interface ExtractedReportInfo {
  reportDate: ExtractedFieldItem;
  facility: ExtractedFieldItem;
  department: ExtractedFieldItem;
  documentType: ExtractedFieldItem;
}

export interface ExtractedLabResult {
  id: string;
  testName: string;
  extractedValue: string;
  unit: string;
  referenceRange: string;
  confidence: ConfidenceLevel;
  source: SourceReferenceLocation;
  isFlagged?: boolean;
  userCorrection?: PatientCorrection;
}

export interface ExtractedMedication {
  id: string;
  medicationName: string;
  strength: string;
  instructions: string;
  frequency: string;
  confidence: ConfidenceLevel;
  source: SourceReferenceLocation;
  verificationStatus: 'unverified' | 'flagged' | 'reviewed';
  warningNotice?: string;
  userCorrection?: PatientCorrection;
}

export interface AttentionItem {
  id: string;
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
  severity: 'high' | 'medium';
  targetSection: 'patient' | 'lab' | 'medication' | 'report';
  targetFieldId?: string;
}

export interface ReviewChecklistItem {
  id: string;
  labelEn: string;
  labelNe: string;
  completed: boolean;
}

export interface SyntheticDocumentPage {
  pageNumber: number;
  title: string;
  contentType: 'lab-summary' | 'rx-details' | 'doctor-notes';
  previewTextSnippet: string;
}

export interface DocumentIntelligenceData {
  documentId: string;
  documentTitle: string;
  documentCategory: string;
  fileType: string;
  fileSize: string;
  uploadedAtDisplay: string;
  status: IntelligenceReviewStatus;
  totalPages: number;
  reviewedFieldsCount: number;
  totalFieldsCount: number;
  patientInfo: ExtractedPatientInfo;
  reportInfo: ExtractedReportInfo;
  labResults: ExtractedLabResult[];
  medications: ExtractedMedication[];
  generalNotes: string;
  unreadableSections?: string[];
  missingFields?: string[];
  attentionItems: AttentionItem[];
  checklist: ReviewChecklistItem[];
  pages: SyntheticDocumentPage[];
  rawJsonExport?: Record<string, unknown>;
  isPreviewAvailable: boolean;
}

export type IntelligenceTab = 'summary' | 'labs' | 'meds' | 'facility' | 'raw';

export type MobileIntelligenceView = 'original' | 'extracted' | 'review';
