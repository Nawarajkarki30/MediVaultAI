import { DashboardLanguage } from '../types/dashboard';

export interface TranslationDictionary {
  // Navigation
  navDashboard: string;
  navVault: string;
  navAI: string;
  navFamily: string;
  navCaregivers: string;
  navNotifications: string;
  navSettings: string;
  navProfile: string;
  navLogout: string;
  patientAccount: string;

  // Header
  searchPlaceholder: string;
  searchAriaLabel: string;
  searchShortcut: string;
  languageSelect: string;
  notificationsTitle: string;
  markAllAsRead: string;
  noNotifications: string;
  profileMenuTitle: string;
  accountSettings: string;
  securityPrivacy: string;

  // Hero
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  heroSubtitle: string;
  uploadReportBtn: string;
  exploreVaultBtn: string;
  healthInYourHands: string;
  secureSimpleTogether: string;

  // Summary Cards
  cardReportsTitle: string;
  cardReportsSubtitle: string;
  cardFamilyTitle: string;
  cardFamilySubtitle: string;
  cardAITitle: string;
  cardAISubtitle: string;
  demoDataNotice: string;

  // Recent Reports
  recentReportsTitle: string;
  viewAllLink: string;
  filterAll: string;
  filterBloodTests: string;
  filterXRay: string;
  filterPrescription: string;
  filterCheckup: string;
  filterMoreReports: string;
  thDocumentName: string;
  thCategory: string;
  thDateUploaded: string;
  thStatus: string;
  thAction: string;
  statusProcessed: string;
  statusAnalyzing: string;
  statusPending: string;
  actionView: string;
  actionDownload: string;
  actionShare: string;
  actionAiExplain: string;
  emptyReportsTitle: string;
  emptyReportsDesc: string;
  resetFiltersBtn: string;

  // AI Explanation Preview
  aiPreviewTitle: string;
  aiPreviewSubtitle: string;
  aiTryNow: string;
  sampleBadge: string;
  exploreAIBtn: string;
  medicalDisclaimer: string;

  // Family Sharing
  familySharingTitle: string;
  manageLink: string;
  familySubtitle: string;
  canViewStatus: string;
  pendingStatus: string;
  inviteFamilyBtn: string;

  // Quick Actions
  quickActionsTitle: string;
  qaUploadReport: string;
  qaViewReports: string;
  qaAIExplanation: string;
  qaManageFamily: string;
  qaFindCaregiver: string;

  // Mobile Bottom Nav
  tabHome: string;
  tabVault: string;
  tabAI: string;
  tabFamily: string;
  tabMore: string;

  // Modals & Banners
  closeModal: string;
  demoReportModalTitle: string;
  demoReportNotice: string;
  keyFindingsHeader: string;
  doctorInCharge: string;
  fileDetails: string;
  demoUploadTitle: string;
  demoUploadSubtitle: string;
  demoUploadDropzone: string;
  demoUploadSupported: string;
  demoUploadNotice: string;
  demoUploadSubmit: string;
  inviteFamilyTitle: string;
  inviteFamilySubtitle: string;
  inviteNameLabel: string;
  inviteRelationLabel: string;
  inviteSubmit: string;
  comingSoonTitle: string;
  comingSoonDesc: string;
  comingSoonClose: string;

  // Phase 2C.1 Health Vault Extensions
  vaultTitle: string;
  vaultSubtitle: string;
  vaultDemoBanner: string;
  uploadDocumentBtn: string;
  privateOrganizedControl: string;
  searchVaultPlaceholder: string;
  searchVaultMobile: string;
  allCategories: string;
  catLabReports: string;
  catPrescriptions: string;
  catImaging: string;
  catDischarge: string;
  catConsultation: string;
  catOther: string;
  fileType: string;
  allFileTypes: string;
  allStatus: string;
  statusUploaded: string;
  statusPendingReview: string;
  statusReviewed: string;
  statusNotAvailable: string;
  sortNewest: string;
  sortOldest: string;
  sortName: string;
  sortRecentlyAdded: string;
  viewGrid: string;
  viewList: string;
  filterPanelTitle: string;
  dateRangeFrom: string;
  dateRangeTo: string;
  applyFilters: string;
  clearFilters: string;
  documentDate: string;
  addedDate: string;
  facility: string;
  physician: string;
  viewDocument: string;
  editTitle: string;
  changeCategory: string;
  deleteDocument: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  confirmDeleteBtn: string;
  cancelBtn: string;
  downloadBtn: string;
  shareFamilyComingSoon: string;
  explainAIComingSoon: string;
  backToVault: string;
  originalPreview: string;
  previewUnavailable: string;
  previewUnavailableDesc: string;
  documentDetails: string;
  notesHeader: string;
  notesPlaceholder: string;
  saveNoteBtn: string;
  noteSaved: string;
  editDetailsBtn: string;
  summaryHeader: string;
  uploadModalTitle: string;
  uploadModalSubtitle: string;
  dragDropNotice: string;
  orBrowseFiles: string;
  supportedFiles: string;
  fileSizeError: string;
  fileTypeError: string;
  uploadNoticePrototype: string;
  continueUploadDemo: string;
  uploadSuccessMessage: string;
  privacyNoticeTitle: string;
  privacyPrivateDefault: string;
  privacyGranularShare: string;
  privacyRevocable: string;
  privacyNoticeNote: string;
  noVaultDocsFound: string;
  noVaultDocsDesc: string;
  resetVaultFilters: string;
}

export const TRANSLATIONS: Record<DashboardLanguage, TranslationDictionary> = {
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navVault: 'My Health Vault',
    navAI: 'AI Explanations',
    navFamily: 'Family Sharing',
    navCaregivers: 'Caregivers',
    navNotifications: 'Notifications',
    navSettings: 'Profile & Settings',
    navProfile: 'Profile',
    navLogout: 'Log out',
    patientAccount: 'Patient Account',

    // Header
    searchPlaceholder: 'Search reports, documents, or help...',
    searchAriaLabel: 'Search medical reports and health documents',
    searchShortcut: 'Ctrl K',
    languageSelect: 'English',
    notificationsTitle: 'Notifications',
    markAllAsRead: 'Mark all as read',
    noNotifications: 'No unread notifications',
    profileMenuTitle: 'Patient Profile',
    accountSettings: 'Account Settings',
    securityPrivacy: 'Security & Access',

    // Hero
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    heroSubtitle: 'Your health information, organized in one secure place.',
    uploadReportBtn: 'Upload Report',
    exploreVaultBtn: 'Explore My Vault',
    healthInYourHands: 'Your Health In Your Hands ♡',
    secureSimpleTogether: 'Secure. Simple. Together.',

    // Summary Cards
    cardReportsTitle: 'My Medical Reports',
    cardReportsSubtitle: 'Uploaded documents',
    cardFamilyTitle: 'Shared With Family',
    cardFamilySubtitle: 'Family members',
    cardAITitle: 'AI Explanations',
    cardAISubtitle: 'Reports explained',
    demoDataNotice: 'Demonstration metrics',

    // Recent Reports
    recentReportsTitle: 'Recent Medical Reports',
    viewAllLink: 'View all →',
    filterAll: 'All',
    filterBloodTests: 'Blood Tests',
    filterXRay: 'X-Ray',
    filterPrescription: 'Prescription',
    filterCheckup: 'Health Checkup',
    filterMoreReports: 'Reports',
    thDocumentName: 'Document Name',
    thCategory: 'Category',
    thDateUploaded: 'Date Uploaded',
    thStatus: 'Status',
    thAction: 'Action',
    statusProcessed: 'Processed',
    statusAnalyzing: 'Analyzing',
    statusPending: 'Pending',
    actionView: 'View',
    actionDownload: 'Download Demo PDF',
    actionShare: 'Share with Family',
    actionAiExplain: 'View AI Explanation',
    emptyReportsTitle: 'No medical reports found',
    emptyReportsDesc: 'Try adjusting your search query or category filters.',
    resetFiltersBtn: 'Reset filters',

    // AI Explanation Preview
    aiPreviewTitle: 'AI Explanation Preview',
    aiPreviewSubtitle: 'Understand your medical reports in simpler language.',
    aiTryNow: 'Try now →',
    sampleBadge: 'Sample',
    exploreAIBtn: '✦ Explore AI Explanations',
    medicalDisclaimer:
      'AI explanations are informational only and do not replace professional medical advice.',

    // Family Sharing
    familySharingTitle: 'Family Sharing',
    manageLink: 'Manage →',
    familySubtitle: 'Share your reports with trusted family members.',
    canViewStatus: 'Can view',
    pendingStatus: 'Pending',
    inviteFamilyBtn: 'Invite Family',

    // Quick Actions
    quickActionsTitle: 'Quick Actions',
    qaUploadReport: 'Upload Report',
    qaViewReports: 'View Reports',
    qaAIExplanation: 'AI Explanation',
    qaManageFamily: 'Manage Family',
    qaFindCaregiver: 'Find Caregiver',

    // Mobile Bottom Nav
    tabHome: 'Home',
    tabVault: 'Vault',
    tabAI: 'AI',
    tabFamily: 'Family',
    tabMore: 'More',

    // Modals & Banners
    closeModal: 'Close',
    demoReportModalTitle: 'Medical Report Preview (Demonstration)',
    demoReportNotice:
      'This is a synthetic demonstration report designed for interface testing. No real protected health information (PHI) is present.',
    keyFindingsHeader: 'Key Clinical Indicators (Simplified)',
    doctorInCharge: 'Physician / Specialist',
    fileDetails: 'File Information',
    demoUploadTitle: 'Upload Medical Report (Demonstration)',
    demoUploadSubtitle:
      'Simulate document ingestion for laboratory reports, scans, or prescriptions.',
    demoUploadDropzone: 'Drag and drop your file here, or click to browse',
    demoUploadSupported: 'Supported demo formats: PDF, JPG, PNG (Max 15MB)',
    demoUploadNotice:
      'Phase 2B runs simulated document processing. Files are not persisted to production storage until Phase 2C.',
    demoUploadSubmit: 'Simulate Upload',
    inviteFamilyTitle: 'Invite Trusted Family Member (Demonstration)',
    inviteFamilySubtitle:
      'Control read permissions for selected medical reports with family members.',
    inviteNameLabel: 'Family Member Full Name',
    inviteRelationLabel: 'Relationship (e.g. Father, Mother, Sister)',
    inviteSubmit: 'Send Invitation',
    comingSoonTitle: 'Feature in Active Roadmap',
    comingSoonDesc:
      'This feature is slated for MediVault AI Phase 3 development. Real clinical processing and verified caregiver marketplace access will be available in upcoming releases.',
    comingSoonClose: 'Understood',

    // Phase 2C.1 Health Vault Extensions
    vaultTitle: 'My Health Vault',
    vaultSubtitle: 'Your medical documents, organized in one place.',
    vaultDemoBanner:
      'This is a demonstration view with sample documents. Secure document storage, encryption, and AI processing will be implemented in later phases.',
    uploadDocumentBtn: 'Upload Document',
    privateOrganizedControl: 'Private. Organized. In Your Control.',
    searchVaultPlaceholder: 'Search by document name, category, or keyword...',
    searchVaultMobile: 'Search documents...',
    allCategories: 'All Categories',
    catLabReports: 'Laboratory Reports',
    catPrescriptions: 'Prescriptions',
    catImaging: 'Imaging Reports',
    catDischarge: 'Discharge Summaries',
    catConsultation: 'Consultation Notes',
    catOther: 'Other Medical Documents',
    fileType: 'File Type',
    allFileTypes: 'All File Types',
    allStatus: 'All Status',
    statusUploaded: 'Uploaded',
    statusPendingReview: 'Pending Review',
    statusReviewed: 'Reviewed',
    statusNotAvailable: 'Extraction Not Available',
    sortNewest: 'Sort: Newest first',
    sortOldest: 'Sort: Oldest first',
    sortName: 'Sort: Document name',
    sortRecentlyAdded: 'Sort: Recently added',
    viewGrid: 'Grid',
    viewList: 'List',
    filterPanelTitle: 'Filter Documents',
    dateRangeFrom: 'From date',
    dateRangeTo: 'To date',
    applyFilters: 'Apply Filters',
    clearFilters: 'Clear Filters',
    documentDate: 'Document Date',
    addedDate: 'Added Date',
    facility: 'Source / Facility',
    physician: 'Physician / Specialist',
    viewDocument: 'View Document',
    editTitle: 'Edit Title (Demo)',
    changeCategory: 'Change Category (Demo)',
    deleteDocument: 'Delete Document (Demo)',
    deleteConfirmTitle: 'Delete Document (Demonstration)',
    deleteConfirmDesc:
      'Are you sure you want to remove this sample document from your current session? You can restore demo records at any time.',
    confirmDeleteBtn: 'Delete Document',
    cancelBtn: 'Cancel',
    downloadBtn: 'Download',
    shareFamilyComingSoon: 'Share with Family (Coming Soon)',
    explainAIComingSoon: 'Explain with AI (Coming Soon)',
    backToVault: 'Back to My Health Vault',
    originalPreview: 'Original Document Preview',
    previewUnavailable: 'Visual Preview Not Available',
    previewUnavailableDesc:
      'A rendered visual preview is not available for this synthetic document format in Phase 2C.1.',
    documentDetails: 'Document Details',
    notesHeader: 'Notes',
    notesPlaceholder: 'Add your personal notes about this document...',
    saveNoteBtn: 'Save Note (Demo)',
    noteSaved: 'Note updated in demonstration session!',
    editDetailsBtn: 'Edit Details (Demo)',
    summaryHeader: 'Extracted Clinical Findings (Demo Summary)',
    uploadModalTitle: 'Upload Medical Document',
    uploadModalSubtitle: 'Select a medical document from your device to test the upload prototype.',
    dragDropNotice: 'Drag and drop your file here',
    orBrowseFiles: 'or Browse Files',
    supportedFiles: 'Supported files: PDF, PNG, JPG, JPEG • Maximum file size: 10 MB',
    fileSizeError: 'File exceeds the 10 MB limit (Selected file is',
    fileTypeError: 'Unsupported file type. Please select a valid PDF, PNG, or JPG document.',
    uploadNoticePrototype:
      'This is a prototype demonstration. The file will not be uploaded or stored yet. Secure uploads will be implemented in a later phase.',
    continueUploadDemo: 'Continue (Demo)',
    uploadSuccessMessage:
      'Secure uploads are being developed for Phase 2C.2. Your file was validated client-side and safely cleared.',
    privacyNoticeTitle: 'Privacy & Security Safeguards (Planned Architecture)',
    privacyPrivateDefault:
      'Private by default: Only you have access to your personal medical vault.',
    privacyGranularShare:
      'Granular controls: Choose exactly which documents to share and with whom.',
    privacyRevocable: 'Revocable access: Change permissions or revoke family access at any time.',
    privacyNoticeNote:
      '* These safeguards describe the planned privacy architecture. All documents currently shown are synthetic prototypes.',
    noVaultDocsFound: 'No medical documents found',
    noVaultDocsDesc:
      'Try adjusting your search query, clearing filters, or switching category tabs.',
    resetVaultFilters: 'Reset filters',
  },
  ne: {
    // Navigation
    navDashboard: 'ड्यासबोर्ड',
    navVault: 'स्वास्थ्य भल्ट',
    navAI: 'एआई व्याख्या',
    navFamily: 'परिवार साझेदारी',
    navCaregivers: 'हेरचाहकर्ता',
    navNotifications: 'सूचनाहरू',
    navSettings: 'प्रोफाइल र सेटिङ',
    navProfile: 'प्रोफाइल',
    navLogout: 'लग आउट',
    patientAccount: 'बिरामी खाता',

    // Header
    searchPlaceholder: 'रिपोर्ट, कागजात वा मद्दत खोज्नुहोस्...',
    searchAriaLabel: 'मेडिकल रिपोर्ट र स्वास्थ्य कागजात खोज्नुहोस्',
    searchShortcut: 'Ctrl K',
    languageSelect: 'नेपाली',
    notificationsTitle: 'सूचनाहरू',
    markAllAsRead: 'सबै पढिएको जनाउनुहोस्',
    noNotifications: 'कुनै नयाँ सूचना छैन',
    profileMenuTitle: 'बिरामी प्रोफाइल',
    accountSettings: 'खाता सेटिङ',
    securityPrivacy: 'सुरक्षा र पहुँच',

    // Hero
    greetingMorning: 'शुभ प्रभात',
    greetingAfternoon: 'शुभ दिउँसो',
    greetingEvening: 'शुभ सन्ध्या',
    heroSubtitle: 'तपाईंको स्वास्थ्य जानकारी, एकै सुरक्षित ठाउँमा व्यवस्थित।',
    uploadReportBtn: 'रिपोर्ट अपलोड गर्नुहोस्',
    exploreVaultBtn: 'मेरो भल्ट हेर्नुहोस्',
    healthInYourHands: 'तपाईंको स्वास्थ्य, तपाईंको हातमा ♡',
    secureSimpleTogether: 'सुरक्षित। सरल। सँगै।',

    // Summary Cards
    cardReportsTitle: 'मेरा मेडिकल रिपोर्टहरू',
    cardReportsSubtitle: 'अपलोड गरिएका कागजातहरू',
    cardFamilyTitle: 'परिवारसँग साझा',
    cardFamilySubtitle: 'परिवारका सदस्यहरू',
    cardAITitle: 'एआई व्याख्याहरू',
    cardAISubtitle: 'व्याख्या गरिएका रिपोर्टहरू',
    demoDataNotice: 'नमुना तथ्याङ्क',

    // Recent Reports
    recentReportsTitle: 'हालैका मेडिकल रिपोर्टहरू',
    viewAllLink: 'सबै हेर्नुहोस् →',
    filterAll: 'सबै',
    filterBloodTests: 'रगत परीक्षण',
    filterXRay: 'एक्स-रे',
    filterPrescription: 'प्रेस्क्रिप्सन',
    filterCheckup: 'स्वास्थ्य जाँच',
    filterMoreReports: 'रिपोर्टहरू',
    thDocumentName: 'कागजातको नाम',
    thCategory: 'वर्ग',
    thDateUploaded: 'अपलोड मिति',
    thStatus: 'स्थिति',
    thAction: 'कार्य',
    statusProcessed: 'सम्पन्न',
    statusAnalyzing: 'विश्लेषण हुँदै',
    statusPending: 'प्रतीक्षारत',
    actionView: 'हेर्नुहोस्',
    actionDownload: 'नमुना PDF डाउनलोड',
    actionShare: 'परिवारसँग साझा',
    actionAiExplain: 'एआई व्याख्या हेर्नुहोस्',
    emptyReportsTitle: 'कुनै मेडिकल रिपोर्ट फेला परेन',
    emptyReportsDesc: 'कृपया अर्को शब्द खोजी हेर्नुहोस् वा फिल्टर परिवर्तन गर्नुहोस्।',
    resetFiltersBtn: 'फिल्टर रिसेट गर्नुहोस्',

    // AI Explanation Preview
    aiPreviewTitle: 'एआई व्याख्या पूर्वावलोकन',
    aiPreviewSubtitle: 'तपाईंको मेडिकल रिपोर्टहरू सरल भाषामा बुझ्नुहोस्।',
    aiTryNow: 'अहिले प्रयास गर्नुहोस् →',
    sampleBadge: 'नमुना',
    exploreAIBtn: '✦ एआई व्याख्या अन्वेषण गर्नुहोस्',
    medicalDisclaimer:
      'एआई व्याख्या जानकारीका लागि मात्र हो र यसले चिकित्सकीय सल्लाहलाई प्रतिस्थापन गर्दैन।',

    // Family Sharing
    familySharingTitle: 'परिवार साझेदारी',
    manageLink: 'व्यवस्थापन →',
    familySubtitle: 'विश्वसनीय परिवारका सदस्यहरूसँग रिपोर्टहरू साझा गर्नुहोस्।',
    canViewStatus: 'हेर्न मिल्ने',
    pendingStatus: 'पेन्डिङ',
    inviteFamilyBtn: 'परिवार आमन्त्रण',

    // Quick Actions
    quickActionsTitle: 'द्रुत कार्यहरू',
    qaUploadReport: 'रिपोर्ट अपलोड',
    qaViewReports: 'रिपोर्ट हेर्नुहोस्',
    qaAIExplanation: 'एआई व्याख्या',
    qaManageFamily: 'परिवार व्यवस्थापन',
    qaFindCaregiver: 'हेरचाहकर्ता खोज्नुहोस्',

    // Mobile Bottom Nav
    tabHome: 'गृह',
    tabVault: 'भल्ट',
    tabAI: 'एआई',
    tabFamily: 'परिवार',
    tabMore: 'थप',

    // Modals & Banners
    closeModal: 'बन्द गर्नुहोस्',
    demoReportModalTitle: 'मेडिकल रिपोर्ट पूर्वावलोकन (प्रदर्शन नमुना)',
    demoReportNotice:
      'यो इन्टरफेस परीक्षणका लागि तयार गरिएको नमुना प्रदर्शन रिपोर्ट हो। यहाँ कुनै वास्तविक बिरामी स्वास्थ्य विवरण छैन।',
    keyFindingsHeader: 'मुख्य स्वास्थ्य सूचकहरू (सरलीकृत)',
    doctorInCharge: 'सम्बन्धित चिकित्सक / विशेषज्ञ',
    fileDetails: 'फाइल विवरण',
    demoUploadTitle: 'मेडिकल रिपोर्ट अपलोड (नमुना)',
    demoUploadSubtitle:
      'प्रयोगशाला रिपोर्ट, एक्स-रे वा प्रेस्क्रिप्सन कागजात अपलोड सिमुलेट गर्नुहोस्।',
    demoUploadDropzone: 'यहाँ फाइल तानेर ल्याउनुहोस् वा ब्राउज गर्न क्लिक गर्नुहोस्',
    demoUploadSupported: 'समर्थित नमुना ढाँचा: PDF, JPG, PNG (अधिकतम १५MB)',
    demoUploadNotice:
      'फेज २B मा फाइल अपलोडको सिमुलेसन मात्र गरिएको छ। वास्तविक सर्भरमा भण्डारण फेज २C मा हुनेछ।',
    demoUploadSubmit: 'अपलोड सिमुलेट गर्नुहोस्',
    inviteFamilyTitle: 'परिवारका सदस्यलाई आमन्त्रण गर्नुहोस् (नमुना)',
    inviteFamilySubtitle:
      'विश्वसनीय परिवारका सदस्यहरूलाई चयन गरिएका मेडिकल रिपोर्ट हेर्ने अनुमति दिनुहोस्।',
    inviteNameLabel: 'परिवारका सदस्यको पूरा नाम',
    inviteRelationLabel: 'सम्बन्ध (उदा. बुबा, आमा, बहिनी)',
    inviteSubmit: 'आमन्त्रण पठाउनुहोस्',
    comingSoonTitle: 'सुविधा विकासको क्रममा छ',
    comingSoonDesc:
      'यो सुविधा MediVault AI फेज ३ विकासका लागि योजना गरिएको छ। आगामी संस्करणहरूमा वास्तविक क्लिनिकल प्रक्रिया र प्रमाणित हेरचाहकर्ता बुकिङ उपलब्ध हुनेछ।',
    comingSoonClose: 'बुझें',

    // Phase 2C.1 Health Vault Extensions
    vaultTitle: 'मेरो स्वास्थ्य भल्ट',
    vaultSubtitle: 'तपाईंको मेडिकल कागजातहरू, एकै ठाउँमा व्यवस्थित।',
    vaultDemoBanner:
      'यो नमुना कागजातसहितको प्रदर्शन दृश्य हो। सुरक्षित भण्डारण, इन्क्रिप्सन र एआई प्रशोधन पछिल्ला चरणहरूमा कार्यान्वयन हुनेछ।',
    uploadDocumentBtn: 'कागजात अपलोड गर्नुहोस्',
    privateOrganizedControl: 'निजी। व्यवस्थित। तपाईंको नियन्त्रणमा।',
    searchVaultPlaceholder: 'कागजातको नाम, वर्ग वा शब्द खोज्नुहोस्...',
    searchVaultMobile: 'कागजात खोज्नुहोस्...',
    allCategories: 'सबै वर्गहरू',
    catLabReports: 'प्रयोगशाला रिपोर्ट',
    catPrescriptions: 'प्रेस्क्रिप्सन',
    catImaging: 'इमेजिङ रिपोर्ट',
    catDischarge: 'डिस्चार्ज सारांश',
    catConsultation: 'परामर्श टिपोट',
    catOther: 'अन्य मेडिकल कागजात',
    fileType: 'फाइल प्रकार',
    allFileTypes: 'सबै फाइल ढाँचा',
    allStatus: 'सबै स्थिति',
    statusUploaded: 'अपलोड गरिएको',
    statusPendingReview: 'समीक्षा बाँकी',
    statusReviewed: 'समीक्षा सम्पन्न',
    statusNotAvailable: 'विवरण उपलब्ध छैन',
    sortNewest: 'क्रम: नयाँ पहिले',
    sortOldest: 'क्रम: पुरानो पहिले',
    sortName: 'क्रम: कागजातको नाम',
    sortRecentlyAdded: 'क्रम: हालै थपिएको',
    viewGrid: 'ग्रिड',
    viewList: 'सूची',
    filterPanelTitle: 'कागजात फिल्टर गर्नुहोस्',
    dateRangeFrom: 'सुरु मिति',
    dateRangeTo: 'अन्तिम मिति',
    applyFilters: 'फिल्टर लागू गर्नुहोस्',
    clearFilters: 'फिल्टर हटाउनुहोस्',
    documentDate: 'कागजात मिति',
    addedDate: 'थपिएको मिति',
    facility: 'स्वास्थ्य संस्था',
    physician: 'सम्बन्धित चिकित्सक',
    viewDocument: 'कागजात हेर्नुहोस्',
    editTitle: 'शीर्षक सम्पादन (नमुना)',
    changeCategory: 'वर्ग परिवर्तन (नमुना)',
    deleteDocument: 'कागजात मेटाउनुहोस् (नमुना)',
    deleteConfirmTitle: 'कागजात मेटाउने पुष्टि (नमुना)',
    deleteConfirmDesc:
      'के तपाईं यो नमुना कागजात हालको सत्रबाट हटाउन निश्चित हुनुहुन्छ? तपाईं जुनसुकै बेला नमुना कागजातहरू पुनः प्राप्त गर्न सक्नुहुन्छ।',
    confirmDeleteBtn: 'मेटाउनुहोस्',
    cancelBtn: 'रद्द गर्नुहोस्',
    downloadBtn: 'डाउनलोड',
    shareFamilyComingSoon: 'परिवारसँग साझा (छिट्टै)',
    explainAIComingSoon: 'एआईबाट व्याख्या (छिट्टै)',
    backToVault: 'मेरो स्वास्थ्य भल्टमा फर्कनुहोस्',
    originalPreview: 'मूल कागजात पूर्वावलोकन',
    previewUnavailable: 'पूर्वावलोकन उपलब्ध छैन',
    previewUnavailableDesc: 'फेज २C.१ मा यो फाइल ढाँचाका लागि भिजुअल पूर्वावलोकन उपलब्ध छैन।',
    documentDetails: 'कागजात विवरण',
    notesHeader: 'व्यक्तिगत टिपोट',
    notesPlaceholder: 'यस कागजात बारे आफ्नो टिपोट लेख्नुहोस्...',
    saveNoteBtn: 'टिपोट सुरक्षित गर्नुहोस् (नमुना)',
    noteSaved: 'नमुना टिपोट सुरक्षित भयो!',
    editDetailsBtn: 'विवरण सम्पादन गर्नुहोस् (नमुना)',
    summaryHeader: 'नमुना क्लिनिकल निष्कर्ष सारांश',
    uploadModalTitle: 'मेडिकल कागजात अपलोड',
    uploadModalSubtitle: 'अपलोड नमुना परीक्षणका लागि आफ्नो डिभाइसबाट मेडिकल कागजात चयन गर्नुहोस्।',
    dragDropNotice: 'यहाँ फाइल तानेर ल्याउनुहोस्',
    orBrowseFiles: 'वा फाइल ब्राउज गर्नुहोस्',
    supportedFiles: 'समर्थित फाइल: PDF, PNG, JPG, JPEG • अधिकतम फाइल आकार: १० MB',
    fileSizeError: 'फाइल १० MB भन्दा ठूलो छ (चयन गरिएको फाइल आकार:',
    fileTypeError: 'असमर्थित फाइल ढाँचा। कृपया मान्य PDF, PNG वा JPG कागजात चयन गर्नुहोस्।',
    uploadNoticePrototype:
      'यो नमुना परीक्षण मात्र हो। फाइल सर्भरमा अपलोड वा भण्डारण हुने छैन। सुरक्षित अपलोड पछिल्लो चरणमा कार्यान्वयन हुनेछ।',
    continueUploadDemo: 'जारी राख्नुहोस् (नमुना)',
    uploadSuccessMessage:
      'सुरक्षित अपलोड पछिल्लो चरणका लागि विकास हुँदैछ। फाइल सफलतापूर्वक प्रमाणित भयो र खाली गरियो।',
    privacyNoticeTitle: 'गोपनीयता तथा सुरक्षा मापदण्ड (योजनाबद्ध संरचना)',
    privacyPrivateDefault:
      'निजी पूर्वनिर्धारित: तपाईंको स्वास्थ्य भल्टमा तपाईंको मात्र पहुँच हुनेछ।',
    privacyGranularShare: 'विशिष्ट नियन्त्रण: कुन कागजात कोसँग साझा गर्ने निर्णय तपाईंको हातमा।',
    privacyRevocable:
      'फिर्ता लिन सकिने पहुँच: जुनसुकै बेला साझेदारी अनुमति परिवर्तन वा रद्द गर्न सकिने।',
    privacyNoticeNote:
      '* यी बुँदाहरूले योजनाबद्ध गोपनीयता संरचना प्रस्तुत गर्दछ। हाल देखाइएका सम्पूर्ण कागजातहरू नमुना हुन्।',
    noVaultDocsFound: 'कुनै मेडिकल कागजात फेला परेन',
    noVaultDocsDesc:
      'कृपया खोजी शब्द परिवर्तन गर्नुहोस्, फिल्टर हटाउनुहोस् वा अर्को वर्ग चयन गर्नुहोस्।',
    resetVaultFilters: 'फिल्टर रिसेट गर्नुहोस्',
  },
};
