// frontend/src/data/demoExtraction.ts
// MediVault AI — Synthetic Demonstration Fixtures for Phase 2D.1 Document Intelligence
//
// CRITICAL MEDICAL SOFTWARE SAFETY DISCLAIMER:
// All data contained herein is purely synthetic, fictional, and designed solely for UI/UX
// evaluation and automated testing. No actual PHI, clinical diagnoses, or real AI models
// are invoked or represented.

import { DocumentIntelligenceData } from '../types/documentIntelligence';

export const PRIMARY_DEMO_EXTRACTION: DocumentIntelligenceData = {
  documentId: 'doc-01',
  documentTitle: 'Lab Report - 12 Jan 2024',
  documentCategory: 'Laboratory Report',
  fileType: 'PDF Report',
  fileSize: '2.3 MB',
  uploadedAtDisplay: 'Uploaded on Jan 12, 2024 • 2.3 MB',
  status: 'needs-review',
  totalPages: 3,
  reviewedFieldsCount: 3,
  totalFieldsCount: 7,
  isPreviewAvailable: true,
  patientInfo: {
    fullName: {
      id: 'pat-name',
      fieldName: 'fullName',
      labelEn: 'Full Name',
      labelNe: 'पूरा नाम',
      value: 'John Doe',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 1 },
    },
    dateOfBirth: {
      id: 'pat-dob',
      fieldName: 'dateOfBirth',
      labelEn: 'Date of Birth',
      labelNe: 'जन्म मिति',
      value: '15 Jan 1995',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 2 },
    },
    patientId: {
      id: 'pat-id',
      fieldName: 'patientId',
      labelEn: 'Patient ID',
      labelNe: 'बिरामी आईडी',
      value: 'MC123456',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 3 },
    },
  },
  reportInfo: {
    reportDate: {
      id: 'rep-date',
      fieldName: 'reportDate',
      labelEn: 'Report Date',
      labelNe: 'रिपोर्ट मिति',
      value: '12 Jan 2024',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 1 },
    },
    facility: {
      id: 'rep-facility',
      fieldName: 'facility',
      labelEn: 'Facility',
      labelNe: 'स्वास्थ्य संस्था',
      value: 'City Medical Center',
      confidence: 'medium',
      source: { page: 1, table: 'Header', row: 2 },
    },
    department: {
      id: 'rep-dept',
      fieldName: 'department',
      labelEn: 'Department',
      labelNe: 'विभाग',
      value: 'Pathology',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 3 },
    },
    documentType: {
      id: 'rep-type',
      fieldName: 'documentType',
      labelEn: 'Document Type',
      labelNe: 'कागजात प्रकार',
      value: 'Laboratory Report',
      confidence: 'high',
      source: { page: 1, table: 'Header', row: 4 },
    },
  },
  labResults: [
    {
      id: 'lab-hb',
      testName: 'Hemoglobin',
      extractedValue: '14.2',
      unit: 'g/dL',
      referenceRange: '13.0 - 17.0',
      confidence: 'high',
      source: { page: 1, table: 'Complete Blood Count (CBC)', row: 1 },
    },
    {
      id: 'lab-hct',
      testName: 'Hematocrit',
      extractedValue: '42.1',
      unit: '%',
      referenceRange: '38.0 - 50.0',
      confidence: 'high',
      source: { page: 1, table: 'Complete Blood Count (CBC)', row: 2 },
    },
    {
      id: 'lab-wbc',
      testName: 'WBC',
      extractedValue: '6.8',
      unit: 'x10³/µL',
      referenceRange: '4.0 - 11.0',
      confidence: 'high',
      source: { page: 1, table: 'Complete Blood Count (CBC)', row: 3 },
    },
    {
      id: 'lab-plt',
      testName: 'Platelets',
      extractedValue: '250',
      unit: 'x10³/µL',
      referenceRange: '150 - 400',
      confidence: 'high',
      source: { page: 1, table: 'Complete Blood Count (CBC)', row: 4 },
    },
    {
      id: 'lab-chol',
      testName: 'Total Cholesterol',
      extractedValue: '180',
      unit: 'mg/dL',
      referenceRange: '< 200',
      confidence: 'medium',
      source: { page: 1, table: 'Lipid Profile', row: 1 },
    },
    {
      id: 'lab-ldl',
      testName: 'LDL',
      extractedValue: '110',
      unit: 'mg/dL',
      referenceRange: '< 130',
      confidence: 'medium',
      source: { page: 1, table: 'Lipid Profile', row: 2 },
    },
  ],
  medications: [
    {
      id: 'med-amox',
      medicationName: 'Amoxicillin',
      strength: '500 mg',
      instructions: 'Take 1 capsule 3 times daily',
      frequency: 'TID',
      confidence: 'low',
      source: { page: 2, table: 'Discharge Medications', row: 1 },
      verificationStatus: 'flagged',
      warningNotice:
        'The medication information may be incomplete or unclear. Please verify with the original document and consult a healthcare professional.',
    },
  ],
  generalNotes: 'This report shows normal blood counts. Lipid profile is within acceptable range.',
  attentionItems: [
    {
      id: 'att-med',
      titleEn: 'Medication information has low confidence',
      titleNe: 'औषधिको विवरणमा कम निश्चितता छ',
      descriptionEn: 'Verify dosage and frequency against original prescription on Page 2.',
      descriptionNe: 'पृष्ठ २ मा रहेको मूल प्रेस्क्रिप्सनबाट मात्रा र सेवन समय रुजु गर्नुहोस्।',
      severity: 'high',
      targetSection: 'medication',
      targetFieldId: 'med-amox',
    },
    {
      id: 'att-ldl',
      titleEn: 'LDL reference range unclear',
      titleNe: 'LDL को सन्दर्भ दायरा अस्पष्ट छ',
      descriptionEn: 'Check original document table format on Page 1.',
      descriptionNe: 'पृष्ठ १ मा रहेको तालिका ढाँचाबाट यकिन गर्नुहोस्।',
      severity: 'medium',
      targetSection: 'lab',
      targetFieldId: 'lab-ldl',
    },
  ],
  checklist: [
    {
      id: 'chk-1',
      labelEn: 'Patient information verified',
      labelNe: 'बिरामीको जानकारी प्रमाणीकरण भयो',
      completed: true,
    },
    {
      id: 'chk-2',
      labelEn: 'Lab results reviewed',
      labelNe: 'प्रयोगशाला परीक्षणको नतिजा पुनरावलोकन भयो',
      completed: true,
    },
    {
      id: 'chk-3',
      labelEn: 'Medications reviewed',
      labelNe: 'औषधिको सूची पुनरावलोकन भयो',
      completed: false,
    },
    {
      id: 'chk-4',
      labelEn: 'Doctor and facility information reviewed',
      labelNe: 'चिकित्सक तथा अस्पताल विवरण पुनरावलोकन भयो',
      completed: false,
    },
    {
      id: 'chk-5',
      labelEn: 'Additional notes added',
      labelNe: 'थप व्यक्तिगत टिपोट थपियो',
      completed: false,
    },
  ],
  pages: [
    {
      pageNumber: 1,
      title: 'Page 1 — Complete Blood Count & Lipid Profile',
      contentType: 'lab-summary',
      previewTextSnippet:
        'CITY MEDICAL CENTER\nLaboratory Report\nPatient: John Doe | DOB: 15 Jan 1995 | ID: MC123456\nDoctor: Dr. Sarah Smith | Department: Pathology\nComplete Blood Count (CBC):\nHemoglobin: 14.2 g/dL (13.0 - 17.0)\nHematocrit: 42.1 % (38.0 - 50.0)\nWBC: 6.8 x10³/µL (4.0 - 11.0)\nPlatelets: 250 x10³/µL (150 - 400)\nLipid Profile:\nTotal Cholesterol: 180 mg/dL (< 200)\nHDL: 55 mg/dL (> 40)\nLDL: 110 mg/dL (< 130)\nTriglycerides: 120 mg/dL (< 150)',
    },
    {
      pageNumber: 2,
      title: 'Page 2 — Outpatient Prescription & Instructions',
      contentType: 'rx-details',
      previewTextSnippet:
        'CITY MEDICAL CENTER\nOutpatient Prescription Sheet\nRx:\n1. Amoxicillin 500 mg — Oral Capsules\nSig: Take 1 capsule 3 times daily (TID) with water for 7 days.\nDispense: #21 capsules.\nRefills: 0\nWarning: Patient reported mild pen-allergy note — verified safe cephalosporin clearance.',
    },
    {
      pageNumber: 3,
      title: 'Page 3 — Clinical Notes & Pathologist Sign-off',
      contentType: 'doctor-notes',
      previewTextSnippet:
        'CITY MEDICAL CENTER\nClinical Pathology Observations\nComments: Specimen adequacy confirmed. Zero hemolysis detected.\nReviewed and validated electronically by Dr. Sarah Smith, MD (Pathology).\nLicense No: 48921-NMC.\nDate: 12 Jan 2024 16:45:00 UTC',
    },
  ],
  rawJsonExport: {
    schemaVersion: '2.0.0-synthetic-demo',
    extractionModel: 'simulated-vlm-parser-v2d',
    extractionDate: '2026-10-31T12:00:00Z',
    document: {
      id: 'doc-01',
      title: 'Lab Report - 12 Jan 2024',
      pages: 3,
      sourceSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    patient: {
      fullName: 'John Doe',
      dateOfBirth: '1995-01-15',
      identifier: 'MC123456',
    },
    laboratoryMetrics: [
      { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', reference: '13.0-17.0', confidence: 0.98 },
      { name: 'Hematocrit', value: 42.1, unit: '%', reference: '38.0-50.0', confidence: 0.97 },
      { name: 'WBC', value: 6.8, unit: 'x10³/µL', reference: '4.0-11.0', confidence: 0.95 },
      { name: 'Platelets', value: 250, unit: 'x10³/µL', reference: '150-400', confidence: 0.96 },
      { name: 'Total Cholesterol', value: 180, unit: 'mg/dL', reference: '<200', confidence: 0.88 },
      { name: 'LDL', value: 110, unit: 'mg/dL', reference: '<130', confidence: 0.84 },
    ],
    medications: [
      {
        name: 'Amoxicillin',
        strength: '500 mg',
        instructions: 'Take 1 capsule 3 times daily',
        frequency: 'TID',
        confidence: 0.62,
        flagged: true,
      },
    ],
  },
};

/**
 * Synthetic variations for testing all 10 required demonstration states
 */
export const DEMO_EXTRACTION_STATES: Record<string, DocumentIntelligenceData> = {
  // 1. Standard structured report matching wireframe
  standard: PRIMARY_DEMO_EXTRACTION,

  // 2. Unprocessed document
  unprocessed: {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'not-processed',
    reviewedFieldsCount: 0,
    totalFieldsCount: 0,
    labResults: [],
    medications: [],
    attentionItems: [],
    generalNotes: '',
    checklist: [],
  },

  // 3. Document with missing extraction fields
  'missing-fields': {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'needs-review',
    patientInfo: {
      ...PRIMARY_DEMO_EXTRACTION.patientInfo,
      dateOfBirth: {
        ...PRIMARY_DEMO_EXTRACTION.patientInfo.dateOfBirth,
        value: '[Missing / Not Detected]',
        confidence: 'low',
      },
    },
    labResults: PRIMARY_DEMO_EXTRACTION.labResults.map((r, i) =>
      i === 4 ? { ...r, referenceRange: '[Not Printed on Report]' } : r
    ),
    missingFields: ['Patient Date of Birth', 'Total Cholesterol Reference Interval'],
  },

  // 4. Unreadable handwritten text
  unreadable: {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'unable-to-read',
    medications: [],
    unreadableSections: [
      'Page 2 Prescription lines 2-4: Handwritten cursive script illegible due to low scan resolution and faded ink.',
    ],
    attentionItems: [
      {
        id: 'att-unread',
        titleEn: 'Handwritten prescription unreadable',
        titleNe: 'हातले लेखिएको प्रेस्क्रिप्सन पढ्न सकिएन',
        descriptionEn: 'The model could not decipher handwritten instructions on Page 2.',
        descriptionNe: 'पृष्ठ २ मा रहेको हस्तलिखित विवरण पहिचान हुन सकेन।',
        severity: 'high',
        targetSection: 'medication',
      },
    ],
  },

  // 5. Ambiguous medication instruction
  'ambiguous-med': {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'qualified-review-required',
    medications: [
      {
        id: 'med-warf',
        medicationName: 'Warfarin',
        strength: '2.5 mg / 5 mg Alternating',
        instructions: 'Take as directed by clinic post INR',
        frequency: 'Variable',
        confidence: 'low',
        source: { page: 2, table: 'Anticoagulation Flow' },
        verificationStatus: 'flagged',
        warningNotice:
          'High-alert medication with variable dosing detected. Requires licensed clinical pharmacist verification before reliance.',
      },
    ],
    attentionItems: [
      {
        id: 'att-high-risk',
        titleEn: 'Qualified Clinical Review Required',
        titleNe: 'योग्य स्वास्थ्यकर्मीको समीक्षा आवश्यक',
        descriptionEn: 'High-risk anticoagulation medication requires clinical verification.',
        descriptionNe: 'उच्च जोखिमयुक्त औषधिको विवरण चिकित्सकबाट प्रमाणित गराउनुहोस्।',
        severity: 'high',
        targetSection: 'medication',
      },
    ],
  },

  // 6. Empty document result
  empty: {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'extraction-available',
    reviewedFieldsCount: 0,
    totalFieldsCount: 0,
    labResults: [],
    medications: [],
    attentionItems: [],
    generalNotes: 'No structured laboratory or prescription data was identified in this document.',
  },

  // 7. Preview unavailable
  'preview-unavailable': {
    ...PRIMARY_DEMO_EXTRACTION,
    isPreviewAvailable: false,
  },

  // 8. Patient-corrected document
  'patient-corrected': {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'patient-reviewed',
    reviewedFieldsCount: 7,
    labResults: PRIMARY_DEMO_EXTRACTION.labResults.map((r, i) =>
      i === 0
        ? {
            ...r,
            extractedValue: '14.0',
            userCorrection: {
              originalValue: '14.2',
              correctedValue: '14.0',
              reason: 'Printed report smudge caused OCR error; correct value is 14.0 g/dL',
              timestamp: '2026-10-31T14:30:00Z',
            },
          }
        : r
    ),
    checklist: PRIMARY_DEMO_EXTRACTION.checklist.map((c) => ({ ...c, completed: true })),
  },

  // 9. Extraction failed
  'extraction-failed': {
    ...PRIMARY_DEMO_EXTRACTION,
    status: 'unable-to-read',
    reviewedFieldsCount: 0,
    totalFieldsCount: 0,
    labResults: [],
    medications: [],
    generalNotes: 'Automated extraction service failed to parse text streams from this scan.',
    attentionItems: [
      {
        id: 'att-fail',
        titleEn: 'Extraction Process Failed',
        titleNe: 'निष्कर्षण प्रक्रिया असफल भयो',
        descriptionEn:
          'Automated parsing could not complete. Please check the scan clarity or enter values manually.',
        descriptionNe:
          'स्वचालित विश्लेषण पूरा हुन सकेन। कृपया स्क्यान स्पष्टता जाँच गर्नुहोस् वा म्यानुअल रूपमा प्रविष्ट गर्नुहोस्।',
        severity: 'high',
        targetSection: 'report',
      },
    ],
  },
};

export function getDemoExtraction(
  documentId: string,
  stateOverride?: string
): DocumentIntelligenceData {
  if (stateOverride && DEMO_EXTRACTION_STATES[stateOverride]) {
    return { ...DEMO_EXTRACTION_STATES[stateOverride], documentId };
  }
  return { ...PRIMARY_DEMO_EXTRACTION, documentId };
}
