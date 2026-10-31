import {
  DashboardReport,
  FamilyMember,
  DashboardStats,
  NotificationItem,
} from '../types/dashboard';

/**
 * SYNTHETIC DEMONSTRATION DATA FOR MEDIVAULT AI PHASE 2B
 *
 * NOTE: This is client-side synthetic prototype data for UI/UX demonstration only.
 * No real patient health records, clinical diagnoses, or private health info are stored.
 */

export const DEMO_STATS: DashboardStats = {
  totalReports: 12,
  reportsDelta: 2,
  familyMembersCount: 3,
  aiExplanationsCount: 5,
  explanationsDelta: 1,
};

export const DEMO_REPORTS: DashboardReport[] = [
  {
    id: 'rep-01',
    name: 'Blood Test Report',
    facility: 'City Medical Center',
    category: 'blood-test',
    categoryLabelEn: 'Blood Test',
    categoryLabelNe: 'रगत परीक्षण',
    dateUploaded: 'Oct 28, 2026',
    status: 'processed',
    fileSize: '1.4 MB',
    doctorName: 'Dr. Aarav Sharma (Pathology)',
    sampleSummaryEn:
      'This report checks important indicators like fasting blood sugar, complete blood count (CBC), and lipid profile. All primary parameters remain within normal clinical ranges, with 25-hydroxy vitamin D slightly below ideal target.',
    sampleSummaryNe:
      'यो रिपोर्टले रगतमा ग्लुकोज (सुगर), पूर्ण रगत गणना (CBC) र लिपिड प्रोफाइल जस्ता मुख्य सूचकहरू जाँच गर्दछ। सबै मुख्य सूचकहरू सामान्य दायराभित्र छन्, भिटामिन डी भने केही कम देखिएको छ।',
    keyFindingsEn: [
      'Fasting Blood Glucose: 92 mg/dL (Normal: 70–99 mg/dL)',
      'Total Cholesterol: 178 mg/dL (Desirable: <200 mg/dL)',
      'Hemoglobin: 13.8 g/dL (Normal: 12.0–15.5 g/dL)',
      'Vitamin D (25-OH): 22 ng/mL (Mild insufficiency: 20–29 ng/mL)',
    ],
    keyFindingsNe: [
      'खाली पेटको सुगर: ९२ mg/dL (सामान्य: ७०–९९ mg/dL)',
      'कुल कोलेस्ट्रोल: १७८ mg/dL (राम्रो: <२०० mg/dL)',
      'हेमोग्लोबिन: १३.८ g/dL (सामान्य: १२.०–१५.५ g/dL)',
      'भिटामिन डी: २२ ng/mL (केही कम: २०–२९ ng/mL)',
    ],
  },
  {
    id: 'rep-02',
    name: 'Chest X-Ray',
    facility: 'National Hospital',
    category: 'x-ray',
    categoryLabelEn: 'X-Ray',
    categoryLabelNe: 'एक्स-रे',
    dateUploaded: 'Oct 20, 2026',
    status: 'processed',
    fileSize: '4.8 MB',
    doctorName: 'Dr. Sunita Karki (Radiology)',
    sampleSummaryEn:
      'Standard PA-view chest radiograph. Lung fields appear clear bilaterally without active consolidation, pleural effusion, or pneumothorax. Cardiothoracic ratio is normal.',
    sampleSummaryNe:
      'छातीको डिजिटल एक्स-रे रिपोर्ट। फोक्सोको दुबै भाग सफा देखिएको छ, कुनै संक्रमण वा पानी जमेको लक्षण छैन। मुटुको आकार सामान्य दायराभित्र रहेको छ।',
    keyFindingsEn: [
      'Bilateral lung fields clear and expanded',
      'Cardiac silhouette within normal limits',
      'Costophrenic angles sharp and free',
      'Bony thorax intact without acute abnormality',
    ],
    keyFindingsNe: [
      'दुबै फोक्सो सफा र सामान्य अवस्थामा',
      'मुटुको बाहिरी आकार सामान्य सीमाभित्र',
      'छातीको भित्री कोणहरू सफा रहेका छन्',
      'हड्डीको संरचनामा कुनै चोट वा समस्या नदेखिएको',
    ],
  },
  {
    id: 'rep-03',
    name: 'Prescription',
    facility: 'Sunrise Clinic',
    category: 'prescription',
    categoryLabelEn: 'Prescription',
    categoryLabelNe: 'प्रेस्क्रिप्सन',
    dateUploaded: 'Oct 15, 2026',
    status: 'processed',
    fileSize: '820 KB',
    doctorName: 'Dr. Pradeep Adhikari (Internal Medicine)',
    sampleSummaryEn:
      'Routine outpatient maintenance prescription for seasonal allergic rhinitis and vitamin D3 weekly supplementation.',
    sampleSummaryNe:
      'मौसमी एलर्जीको नियन्त्रण तथा भिटामिन डी३ को साप्ताहिक पूरक औषधी सम्बन्धी ओपीडी सिफारिस।',
    keyFindingsEn: [
      'Cholecalciferol (Vitamin D3) 60,000 IU — 1 capsule weekly for 8 weeks',
      'Cetirizine 10 mg — 1 tablet once daily at bedtime as needed for 5 days',
      'Adequate hydration and 15 mins daily morning sun exposure advised',
    ],
    keyFindingsNe: [
      'भिटामिन डी३ ६०,००० IU — हप्तामा १ क्याप्सुल (८ हप्तासम्म)',
      'सिट्रिजिन १० mg — आवश्यकता अनुसार सुत्ने बेलामा १ चक्की (५ दिन)',
      'पर्याप्त पानी पिउन र बिहान १५ मिनेट घाममा बस्न सल्लाह',
    ],
  },
  {
    id: 'rep-04',
    name: 'General Health Checkup',
    facility: 'Family Care Clinic',
    category: 'checkup',
    categoryLabelEn: 'Health Checkup',
    categoryLabelNe: 'स्वास्थ्य जाँच',
    dateUploaded: 'Oct 10, 2026',
    status: 'processed',
    fileSize: '2.1 MB',
    doctorName: 'Dr. Binod Thapa (General Physician)',
    sampleSummaryEn:
      'Annual comprehensive wellness evaluation. Resting blood pressure, BMI, and pulse rate within optimal limits. Routine lifestyle recommendations provided.',
    sampleSummaryNe:
      'वार्षिक समग्र स्वास्थ्य जाँच। रक्तचाप, शरीरको तौल (BMI) र मुटुको धड्कन पूर्णतया सन्तुलित र स्वस्थ अवस्थामा।',
    keyFindingsEn: [
      'Blood Pressure: 118/76 mmHg (Optimal)',
      'Resting Heart Rate: 72 bpm (Regular sinus)',
      'BMI: 22.4 kg/m² (Healthy weight)',
      'Next review recommended: Annual checkup in October 2027',
    ],
    keyFindingsNe: [
      'रक्तचाप: ११८/७६ mmHg (उत्तम)',
      'मुटुको चाल: ७२ प्रति मिनेट (नियमित)',
      'बीएमआई (BMI): २२.४ (सन्तुलित तौल)',
      'अर्को जाँच: १ वर्षपछि (अक्टोबर २०२७)',
    ],
  },
];

export const DEMO_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    name: 'Ramesh',
    initials: 'RK',
    relationshipEn: 'Father',
    relationshipNe: 'बुबा',
    permissionStatus: 'can_view',
    avatarColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    sharedReportsCount: 4,
  },
  {
    id: 'fam-2',
    name: 'Anita',
    initials: 'AS',
    relationshipEn: 'Sister',
    relationshipNe: 'बहिनी',
    permissionStatus: 'can_view',
    avatarColor: 'bg-blue-100 text-blue-800 border-blue-300',
    sharedReportsCount: 2,
  },
  {
    id: 'fam-3',
    name: 'Pawan',
    initials: 'PS',
    relationshipEn: 'Brother',
    relationshipNe: 'भाइ',
    permissionStatus: 'pending',
    avatarColor: 'bg-amber-100 text-amber-800 border-amber-300',
    sharedReportsCount: 0,
  },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    titleEn: 'AI Explanation Ready',
    titleNe: 'एआई व्याख्या तयार भयो',
    messageEn:
      'Your Blood Test Report from City Medical Center was simplified into plain language.',
    messageNe: 'सिटी मेडिकल सेन्टरको रगत परीक्षण रिपोर्ट सरल नेपाली र अंग्रेजीमा तयार भएको छ।',
    timeAgoEn: '10m ago',
    timeAgoNe: '१० मिनेट अघि',
    read: false,
    type: 'report',
  },
  {
    id: 'notif-2',
    titleEn: 'Family Access Viewed',
    titleNe: 'पारिवारिक पहुँच हेरियो',
    messageEn: 'Anita (Sister) accessed the Chest X-Ray document via shared vault permission.',
    messageNe: 'अनिता (बहिनी) ले साझेदारी अनुमति अन्तर्गत छातीको एक्स-रे कागजात हेर्नुभयो।',
    timeAgoEn: '2h ago',
    timeAgoNe: '२ घण्टा अघि',
    read: false,
    type: 'family',
  },
  {
    id: 'notif-3',
    titleEn: 'Annual Checkup Reminder',
    titleNe: 'वार्षिक स्वास्थ्य जाँच स्मरण',
    messageEn: 'Your annual health evaluation with Family Care Clinic is recorded up to date.',
    messageNe: 'पारिवारिक केयर क्लिनिकसँगको तपाईंको वार्षिक स्वास्थ्य जाँच अद्यावधिक छ।',
    timeAgoEn: '1d ago',
    timeAgoNe: '१ दिन अघि',
    read: true,
    type: 'system',
  },
];
