// SINGLE SOURCE OF TRUTH — all financial parameters
// Verified against Keke_Investment_Tracker_Updated_Mar_2026.xlsx

export const INVESTMENT = {
  START_DATE: new Date(2025, 9, 20), // October 20, 2025
  ORIGINAL_KEKE_COUNT: 4,
  ORIGINAL_KEKE_WEEKLY: 75000,
  ORIGINAL_KEKE_COST: 3600000,
  ORIGINAL_KEKE_DURATION: 75,
  NEW_KEKE_COST: 4000000,
  NEW_KEKE_WEEKLY: 125000,
  NEW_KEKE_DURATION: 52,
  ROI_GAP_WEEKS: 2,
  TARGET_KEKES: 12,
  COLLABORATORS: ['A.S.O', 'Dr. Dayo', 'Dr. Itunu', 'Dr. Fadeke'],
};

// Keke #5 purchased Week 19, ₦800k excess carried forward
export const KEKE6_CONFIG = {
  excessFromKeke5: 800000,
  loggingStartWeek: 20,
  roiStartWeek: 21, // Keke #5 ROI (₦125k for Fadeke) starts Week 21
};

// Rotation: Fadeke → A.S.O → Itunu → Dayo (repeating)
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

export const HOLIDAY_WEEKS = [10, 11, 12, 62, 63, 64, 114, 115, 116];

export const COLLABORATOR_COLORS = {
  'A.S.O': { bg: 'bg-green-600', text: 'text-green-400', hex: '#16a34a' },
  'Dr. Dayo': { bg: 'bg-blue-600', text: 'text-blue-400', hex: '#2563eb' },
  'Dr. Itunu': { bg: 'bg-pink-600', text: 'text-pink-400', hex: '#db2777' },
  'Dr. Fadeke': { bg: 'bg-teal-600', text: 'text-teal-400', hex: '#0d9488' },
};

// What each person should pay for a given week
// Week 20: everyone ₦75k (Keke #5 ROI hasn't started)
// Week 21+: Fadeke ₦200k (₦75k + ₦125k), everyone else ₦75k
export function getWeeklyAmountForPerson(personName, weekNumber) {
  const base = INVESTMENT.ORIGINAL_KEKE_WEEKLY;
  if (personName === 'Dr. Fadeke' && weekNumber >= KEKE6_CONFIG.roiStartWeek) {
    return base + INVESTMENT.NEW_KEKE_WEEKLY;
  }
  return base;
}

export function getWeeklyTotal(weekNumber) {
  if (isHolidayWeek(weekNumber)) return 0;
  let total = 0;
  for (const name of INVESTMENT.COLLABORATORS) {
    total += getWeeklyAmountForPerson(name, weekNumber);
  }
  return total;
}

export function getExpectedTotal(upToWeek) {
  let total = KEKE6_CONFIG.excessFromKeke5;
  for (let w = KEKE6_CONFIG.loggingStartWeek; w <= upToWeek; w++) {
    if (!isHolidayWeek(w)) total += getWeeklyTotal(w);
  }
  return total;
}

export function getCurrentWeek() {
  const now = new Date();
  const diff = now - INVESTMENT.START_DATE;
  return Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1);
}

export function getWeekStartDate(weekNum) {
  const start = new Date(INVESTMENT.START_DATE);
  start.setDate(start.getDate() + (weekNum - 1) * 7);
  return start;
}

export function isHolidayWeek(weekNum) {
  return HOLIDAY_WEEKS.includes(weekNum);
}

export function formatNaira(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

export function getCurrentBeneficiary(rotationData) {
  if (!rotationData || rotationData.length === 0) return ROTATION.find(r => r.status === 'saving') || ROTATION[1];
  return rotationData.find(r => r.status === 'saving') || rotationData.find(r => r.status === 'pending') || null;
}
