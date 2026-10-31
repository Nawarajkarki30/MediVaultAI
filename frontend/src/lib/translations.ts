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
  },
};
