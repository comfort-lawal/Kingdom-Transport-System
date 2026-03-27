import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { ROTATION, INVESTMENT, KEKE6_CONFIG, formatNaira, getCurrentWeek, getWeeklyAmountForPerson } from '../config/investment';

const TransferContext = createContext();
export function useTransfer() { return useContext(TransferContext); }

export function TransferProvider({ children }) {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [beneficiary, setBeneficiary] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rotationData, setRotationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load rotation data
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rotation'), (snap) => {
      if (snap.empty) {
        seedRotation();
      } else {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => a.keke - b.keke);
        setRotationData(data);
        setBeneficiary(data.find(r => r.status === 'saving') || null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Load transfers for current beneficiary
  useEffect(() => {
    if (!beneficiary) return;
    const q = query(
      collection(db, 'transfers'),
      where('kekeNumber', '==', beneficiary.keke),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTransfers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [beneficiary?.keke]);

  // Load notifications
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser?.uid]);

  async function seedRotation() {
    for (const entry of ROTATION) {
      await setDoc(doc(db, 'rotation', `keke-${entry.keke}`), {
        ...entry, bankName: '', accountNumber: '', accountName: '',
      });
    }
  }

  async function setBeneficiaryBankDetails(kekeNumber, bankDetails) {
    if (!isAdmin) throw new Error('Only admin can set bank details');
    await updateDoc(doc(db, 'rotation', `keke-${kekeNumber}`), bankDetails);
  }

  async function logTransfer({ amount, weekNumber, reference, note, collaboratorName }) {
    if (!currentUser || !beneficiary) throw new Error('Not ready');
    const senderName = userProfile?.displayName || currentUser.email;
    const transfer = {
      kekeNumber: beneficiary.keke,
      beneficiaryName: beneficiary.owner,
      senderUid: currentUser.uid,
      senderName,
      collaboratorName: collaboratorName || senderName,
      amount: Number(amount),
      weekNumber: Number(weekNumber),
      reference: reference || '',
      note: note || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      verifiedBy: null, verifiedAt: null, rejectNote: '',
    };
    await addDoc(collection(db, 'transfers'), transfer);
    await notifyAdmin(`${senderName} logged ${formatNaira(amount)} for ${collaboratorName || senderName} — Week ${weekNumber} (Keke #${beneficiary.keke})`,'transfer_logged');
  }

  async function approveTransfer(transferId) {
    if (!isAdmin) throw new Error('Only admin can approve');
    const ref = doc(db, 'transfers', transferId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Transfer not found');
    await updateDoc(ref, { status: 'approved', verifiedBy: currentUser.uid, verifiedAt: serverTimestamp() });
    const t = snap.data();
    await notifyUser(t.senderUid, `Transfer of ${formatNaira(t.amount)} for ${t.collaboratorName} Week ${t.weekNumber} approved.`, 'transfer_approved');
  }

  async function rejectTransfer(transferId, rejectNote) {
    if (!isAdmin) throw new Error('Only admin can reject');
    const ref = doc(db, 'transfers', transferId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Transfer not found');
    await updateDoc(ref, { status: 'rejected', verifiedBy: currentUser.uid, verifiedAt: serverTimestamp(), rejectNote: rejectNote || 'No reason given' });
    const t = snap.data();
    await notifyUser(t.senderUid, `Transfer of ${formatNaira(t.amount)} for ${t.collaboratorName} Week ${t.weekNumber} rejected: ${rejectNote}`, 'transfer_rejected');
  }

  async function confirmPurchase() {
    if (!isAdmin || !beneficiary) throw new Error('Cannot confirm');
    const currentWeek = getCurrentWeek();
    await updateDoc(doc(db, 'rotation', `keke-${beneficiary.keke}`), {
      status: 'purchased', purchaseWeek: currentWeek,
      purchaseDate: new Date().toISOString().split('T')[0],
      roiStartWeek: currentWeek + INVESTMENT.ROI_GAP_WEEKS,
    });
    const nextKeke = rotationData.find(r => r.keke === beneficiary.keke + 1 && r.status === 'pending');
    if (nextKeke) {
      await updateDoc(doc(db, 'rotation', `keke-${nextKeke.keke}`), { status: 'saving' });
    }
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const userDoc of usersSnap.docs) {
      await notifyUser(userDoc.id, `Keke #${beneficiary.keke} purchased for ${beneficiary.owner}! ${nextKeke ? `Next: Keke #${nextKeke.keke} for ${nextKeke.owner}.` : 'All 12 kekes purchased!'}`, 'purchase_confirmed');
    }
  }

  async function notifyAdmin(message, type) {
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    for (const adminDoc of usersSnap.docs) {
      await addDoc(collection(db, 'notifications'), { userId: adminDoc.id, message, type, read: false, createdAt: serverTimestamp() });
    }
  }

  async function notifyUser(userId, message, type) {
    await addDoc(collection(db, 'notifications'), { userId, message, type, read: false, createdAt: serverTimestamp() });
  }

  async function markNotificationRead(notifId) {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  }

  async function markAllRead() {
    for (const n of notifications.filter(n => !n.read)) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  }

  // Computed values — include ₦800k excess in calculations
  const approvedTransfers = transfers.filter(t => t.status === 'approved');
  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const verifiedTransferTotal = approvedTransfers.reduce((sum, t) => sum + t.amount, 0);
  const verifiedTotal = verifiedTransferTotal + KEKE6_CONFIG.excessFromKeke5;
  const pendingTotal = pendingTransfers.reduce((s, t) => s + t.amount, 0);
  const remainingAmount = INVESTMENT.NEW_KEKE_COST - verifiedTotal;
  const progressPercent = Math.min(100, (verifiedTotal / INVESTMENT.NEW_KEKE_COST) * 100);
  const unreadCount = notifications.filter(n => !n.read).length;
  const canPurchase = isAdmin && verifiedTotal >= INVESTMENT.NEW_KEKE_COST;

  // Build weekly checklist: for each week from loggingStartWeek to currentWeek,
  // show who has paid (approved), who is pending, who hasn't logged
  function getWeeklyChecklist() {
    const currentWeek = getCurrentWeek();
    const weeks = [];
    for (let w = KEKE6_CONFIG.loggingStartWeek; w <= currentWeek; w++) {
      if (INVESTMENT.COLLABORATORS.length === 0) continue;
      const weekTransfers = transfers.filter(t => t.weekNumber === w);
      const people = INVESTMENT.COLLABORATORS.map(name => {
        const expectedAmount = getWeeklyAmountForPerson(name, w);
        const personTransfers = weekTransfers.filter(t => t.collaboratorName === name);
        const approved = personTransfers.filter(t => t.status === 'approved');
        const pending = personTransfers.filter(t => t.status === 'pending');
        const totalApproved = approved.reduce((s, t) => s + t.amount, 0);
        const totalPending = pending.reduce((s, t) => s + t.amount, 0);
        let status = 'not_logged';
        if (totalApproved >= expectedAmount) status = 'approved';
        else if (totalPending > 0) status = 'pending';
        else if (personTransfers.some(t => t.status === 'rejected')) status = 'rejected';
        return { name, expectedAmount, totalApproved, totalPending, status };
      });
      weeks.push({ weekNumber: w, people });
    }
    return weeks.reverse(); // Most recent first
  }

  const value = {
    beneficiary, transfers, rotationData, notifications, loading,
    logTransfer, approveTransfer, rejectTransfer, confirmPurchase,
    setBeneficiaryBankDetails, markNotificationRead, markAllRead,
    approvedTransfers, pendingTransfers, verifiedTotal, verifiedTransferTotal,
    pendingTotal, remainingAmount, progressPercent, unreadCount, canPurchase,
    getWeeklyChecklist,
  };

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}
