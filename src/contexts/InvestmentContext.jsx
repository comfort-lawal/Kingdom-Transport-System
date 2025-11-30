import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

const InvestmentContext = createContext();

export function useInvestment() {
  return useContext(InvestmentContext);
}

// Investment Constants
export const INVESTMENT_CONFIG = {
  OLD_KEKE_WEEKLY: 75000,
  OLD_KEKE_DURATION: 75,
  NEW_KEKE_COST: 5000000,
  NEW_KEKE_WEEKLY: 125000,
  NEW_KEKE_DURATION: 52,
  START_KEKES: 4,
  TARGET_KEKES: 12,
  NUM_COLLABORATORS: 4,
  START_DATE: new Date('2025-10-20'),
  // Each collaborator's share per Keke per week
  COLLABORATOR_SHARE_OLD: 75000 / 4, // ₦18,750 per person per original Keke
  COLLABORATOR_SHARE_NEW: 125000 / 4, // ₦31,250 per person per new Keke
  // Weekly payment each collaborator should log (with 4 original Kekes)
  WEEKLY_PAYMENT_PER_PERSON: 75000, // Each person logs ₦75,000
};

// Holiday weeks (week numbers from start date)
const HOLIDAY_WEEK_NUMBERS = [10, 11, 62, 63, 114, 115];

export function isHolidayWeek(weekNum) {
  return HOLIDAY_WEEK_NUMBERS.includes(weekNum);
}

export function getWeekStartDate(weekNum) {
  const startDate = new Date(INVESTMENT_CONFIG.START_DATE);
  startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
  return startDate;
}

export function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(INVESTMENT_CONFIG.START_DATE);
  const diffTime = now - start;
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

export function calculateExpiryWeek(purchaseWeek, earningDuration) {
  let earningWeeksCounted = 0;
  let currentWeek = purchaseWeek;
  
  while (earningWeeksCounted < earningDuration) {
    if (!isHolidayWeek(currentWeek)) {
      earningWeeksCounted++;
    }
    if (earningWeeksCounted < earningDuration) {
      currentWeek++;
    }
  }
  
  return currentWeek;
}

export function InvestmentProvider({ children }) {
  const [kekes, setKekes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [investmentStats, setInvestmentStats] = useState({
    totalKekes: 4,
    activeKekes: 4,
    cumulativeSavings: 0,
    currentWeeklyIncome: 300000,
    nextPurchaseProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  // Initialize default kekes if none exist
  async function initializeKekes() {
    const kekesRef = collection(db, 'kekes');
    const snapshot = await getDocs(kekesRef);
    
    if (snapshot.empty) {
      const expiryWeek = calculateExpiryWeek(1, INVESTMENT_CONFIG.OLD_KEKE_DURATION);
      
      for (let i = 1; i <= 4; i++) {
        await setDoc(doc(db, 'kekes', `keke-${i}`), {
          id: i,
          type: 'Original',
          purchaseWeek: 1,
          purchaseDate: INVESTMENT_CONFIG.START_DATE.toISOString(),
          weeklyReturn: INVESTMENT_CONFIG.OLD_KEKE_WEEKLY,
          earningDuration: INVESTMENT_CONFIG.OLD_KEKE_DURATION,
          expiryWeek: expiryWeek,
          cost: 3600000,
          status: 'active'
        });
      }
    }
  }

  // Listen to kekes collection
  useEffect(() => {
    const kekesRef = collection(db, 'kekes');
    const q = query(kekesRef, orderBy('id'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const kekesData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setKekes(kekesData);
      
      if (kekesData.length === 0) {
        initializeKekes().catch(err => console.error('Error initializing kekes:', err));
      }
    }, (error) => {
      console.error('Error listening to kekes:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen to payments collection
  useEffect(() => {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('loggedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to payments:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Calculate investment statistics whenever kekes or payments change
  useEffect(() => {
    if (kekes.length > 0) {
      calculateStats();
    }
  }, [kekes, payments]);

  // Calculate investment statistics
  function calculateStats() {
    const currentWeek = getCurrentWeekNumber();
    const activeKekes = kekes.filter(k => k.expiryWeek >= currentWeek);
    
    // Sum all positive payments (income)
    const totalIncome = payments
      .filter(p => p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Sum all negative payments (purchases)
    const totalPurchases = payments
      .filter(p => p.amount < 0)
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);
    
    const cumulativeSavings = totalIncome - totalPurchases;
    
    const currentWeeklyIncome = activeKekes.reduce((sum, k) => sum + k.weeklyReturn, 0);
    
    const nextPurchaseProgress = Math.min(
      (cumulativeSavings / INVESTMENT_CONFIG.NEW_KEKE_COST) * 100,
      100
    );

    setInvestmentStats({
      totalKekes: kekes.length,
      activeKekes: activeKekes.length,
      cumulativeSavings: Math.max(0, cumulativeSavings),
      currentWeeklyIncome,
      nextPurchaseProgress,
    });
  }

  // Log weekly payment
  async function logPayment(weekNumber, amount, loggedBy, note = '') {
    const weekStart = getWeekStartDate(weekNumber);
    
    await addDoc(collection(db, 'payments'), {
      weekNumber,
      amount,
      weekStartDate: weekStart.toISOString(),
      loggedBy,
      loggedAt: new Date().toISOString(),
      note,
      isHoliday: isHolidayWeek(weekNumber),
      isPurchase: false
    });
  }

  // Purchase new keke
  async function purchaseKeke(purchasedBy) {
    const newKekeId = kekes.length + 1;
    const currentWeek = getCurrentWeekNumber();
    const expiryWeek = calculateExpiryWeek(currentWeek, INVESTMENT_CONFIG.NEW_KEKE_DURATION);
    
    // Add new keke
    await setDoc(doc(db, 'kekes', `keke-${newKekeId}`), {
      id: newKekeId,
      type: 'New',
      purchaseWeek: currentWeek,
      purchaseDate: new Date().toISOString(),
      weeklyReturn: INVESTMENT_CONFIG.NEW_KEKE_WEEKLY,
      earningDuration: INVESTMENT_CONFIG.NEW_KEKE_DURATION,
      expiryWeek: expiryWeek,
      cost: INVESTMENT_CONFIG.NEW_KEKE_COST,
      status: 'active'
    });

    // Log the purchase as a negative payment
    await addDoc(collection(db, 'payments'), {
      weekNumber: currentWeek,
      amount: -INVESTMENT_CONFIG.NEW_KEKE_COST,
      weekStartDate: new Date().toISOString(),
      loggedBy: purchasedBy,
      loggedAt: new Date().toISOString(),
      note: `Purchased Keke #${newKekeId}`,
      isHoliday: false,
      isPurchase: true,
      kekeId: newKekeId
    });
  }

  // Delete a payment (admin only)
  async function deletePayment(paymentDocId) {
    await deleteDoc(doc(db, 'payments', paymentDocId));
  }

  // Edit a payment (admin only)
  async function editPayment(paymentDocId, updates) {
    await updateDoc(doc(db, 'payments', paymentDocId), {
      ...updates,
      editedAt: new Date().toISOString()
    });
  }

  const value = {
    kekes,
    payments,
    investmentStats,
    loading,
    logPayment,
    purchaseKeke,
    deletePayment,
    editPayment,
    config: INVESTMENT_CONFIG,
    getCurrentWeekNumber,
    isHolidayWeek,
    getWeekStartDate
  };

  return (
    <InvestmentContext.Provider value={value}>
      {children}
    </InvestmentContext.Provider>
  );
}
