// SINGLE SOURCE OF TRUTH — all financial parameters
// Verified against Keke_Investment_Tracker_Updated_Mar_2026.xlsx

export const INVESTMENT = {
  START_DATE: new Date(2025, 9, 20), // October 20, 2025
  ORIGINAL_KEKE_COUNT: 4,
  ORIGINAL_KEKE_WEEKLY: 75000,
  ORIGINAL_KEKE_COST: 3600000,
  ORIGINAL_KEKE_DURATION: 75, // weeks
  NEW_KEKE_COST: 4000000,
  NEW_KEKE_WEEKLY: 125000,
  NEW_KEKE_DURATION: 52, // weeks
  ROI_GAP_WEEKS: 2, // purchase → agreement → ROI starts
  TARGET_KEKES: 12,
  COLLABORATORS: ['A.S.O', 'Dr. Dayo', 'Dr. Itunu', 'Dr. Fadeke'],
};

// Rotation order for keke assignments (verified with user)
// Fadeke → A.S.O → Itunu → Dayo (repeating)
export const ROTATION = [
  { keke: 5, owner: 'Dr. Fadeke', status: 'purchased', purchaseWeek: 19, purchaseDate: '2026-03-02', roiStartWeek: 21 },
  { keke: 6, owner: 'A.S.O', status: 'saving', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 7, owner: 'Dr. Itunu', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 8, owner: 'Dr. Dayo', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 9, owner: 'Dr. Fadeke', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 10, owner: 'A.S.O', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 11, owner: 'Dr. Itunu', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
  { keke: 12, owner: 'Dr. Dayo', status: 'pending', purchaseWeek: null, purchaseDate: null, roiStartWeek: null },
];

// Holiday weeks (week numbers): Christmas, New Year, Extra Week each year
export const HOLIDAY_WEEKS = [10, 11, 12, 62, 63, 64, 114, 115, 116];

// Collaborator theme colours
export const COLLABORATOR_COLORS = {
  'A.S.O': { bg: 'bg-green-600', text: 'text-green-400', hex: '#16a34a' },
  'Dr. Dayo': { bg: 'bg-blue-600', text: 'text-blue-400', hex: '#2563eb' },
  'Dr. Itunu': { bg: 'bg-pink-600', text: 'text-pink-400', hex: '#db2777' },
  'Dr. Fadeke': { bg: 'bg-teal-600', text: 'text-teal-400', hex: '#0d9488' },
};

// Calculate current week number from start date
export function getCurrentWeek() {
  const now = new Date();
  const diff = now - INVESTMENT.START_DATE;
  const weekNum = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, weekNum);
}

// Get the Monday start date for a given week number
export function getWeekStartDate(weekNum) {
  const start = new Date(INVESTMENT.START_DATE);
  start.setDate(start.getDate() + (weekNum - 1) * 7);
  return start;
}

// Check if a week is a holiday
export function isHolidayWeek(weekNum) {
  return HOLIDAY_WEEKS.includes(weekNum);
}

// Format currency in Naira
export function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// Get the next beneficiary (first one with status 'saving' or 'pending' after all purchased)
export function getCurrentBeneficiary(rotationData) {
  if (!rotationData || rotationData.length === 0) return ROTATION.find(r => r.status === 'saving') || ROTATION[1];
  const saving = rotationData.find(r => r.status === 'saving');
  return saving || rotationData.find(r => r.status === 'pending') || null;
}
