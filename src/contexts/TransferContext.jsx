import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { ROTATION, INVESTMENT, formatNaira, getCurrentWeek } from '../config/investment';

const TransferContext = createContext();
export function useTransfer() { return useContext(TransferContext); }

export function TransferProvider({ children }) {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [beneficiary, setBeneficiary] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [rotationData, setRotationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Load rotation data from Firestore ───
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'rotation'), (snap) => {
      if (snap.empty) {
        // First time: seed rotation from constants
        seedRotation();
      } else {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => a.keke - b.keke);
        setRotationData(data);
        // Find the current beneficiary (status === 'saving')
        const current = data.find(r => r.status === 'saving');
        setBeneficiary(current || null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ─── Load transfers for current beneficiary ───
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

  // ─── Load notifications for current user ───
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

  // ─── Seed initial rotation data ───
  async function seedRotation() {
    for (const entry of ROTATION) {
      await setDoc(doc(db, 'rotation', `keke-${entry.keke}`), {
        ...entry,
        bankName: '',
        accountNumber: '',
        accountName: '',
      });
    }
  }

  // ─── Admin: Set beneficiary bank details ───
  async function setBeneficiaryBankDetails(kekeNumber, bankDetails) {
    if (!isAdmin) throw new Error('Only admin can set bank details');
    const ref = doc(db, 'rotation', `keke-${kekeNumber}`);
    await updateDoc(ref, {
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
    });
  }

  // ─── Log a transfer ───
  async function logTransfer({ amount, weekNumber, reference, note }) {
    if (!currentUser || !beneficiary) throw new Error('Not ready');
    const senderName = userProfile?.displayName || currentUser.email;

    const transfer = {
      kekeNumber: beneficiary.keke,
      beneficiaryName: beneficiary.owner,
      senderUid: currentUser.uid,
      senderName,
      amount: Number(amount),
      weekNumber: Number(weekNumber),
      reference: reference || '',
      note: note || '',
      status: 'pending', // pending → approved | rejected
      createdAt: serverTimestamp(),
      verifiedBy: null,
      verifiedAt: null,
      rejectNote: '',
    };

    const docRef = await addDoc(collection(db, 'transfers'), transfer);

    // Notify admin
    await notifyAdmin(
      `${senderName} logged a transfer of ${formatNaira(amount)} for Week ${weekNumber} (Keke #${beneficiary.keke})`,
      'transfer_logged'
    );

    return docRef.id;
  }

  // ─── Admin: Approve a transfer ───
  async function approveTransfer(transferId) {
    if (!isAdmin) throw new Error('Only admin can approve');
    const ref = doc(db, 'transfers', transferId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Transfer not found');

    await updateDoc(ref, {
      status: 'approved',
      verifiedBy: currentUser.uid,
      verifiedAt: serverTimestamp(),
    });

    // Notify the sender
    const transfer = snap.data();
    await notifyUser(
      transfer.senderUid,
      `Your transfer of ${formatNaira(transfer.amount)} for Week ${transfer.weekNumber} has been approved.`,
      'transfer_approved'
    );
  }

  // ─── Admin: Reject a transfer ───
  async function rejectTransfer(transferId, rejectNote) {
    if (!isAdmin) throw new Error('Only admin can reject');
    const ref = doc(db, 'transfers', transferId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Transfer not found');

    await updateDoc(ref, {
      status: 'rejected',
      verifiedBy: currentUser.uid,
      verifiedAt: serverTimestamp(),
      rejectNote: rejectNote || 'No reason given',
    });

    const transfer = snap.data();
    await notifyUser(
      transfer.senderUid,
      `Your transfer of ${formatNaira(transfer.amount)} for Week ${transfer.weekNumber} was rejected: ${rejectNote}`,
      'transfer_rejected'
    );
  }

  // ─── Admin: Confirm keke purchase ───
  async function confirmPurchase() {
    if (!isAdmin || !beneficiary) throw new Error('Cannot confirm');

    const currentWeek = getCurrentWeek();
    const ref = doc(db, 'rotation', `keke-${beneficiary.keke}`);
    await updateDoc(ref, {
      status: 'purchased',
      purchaseWeek: currentWeek,
      purchaseDate: new Date().toISOString().split('T')[0],
      roiStartWeek: currentWeek + INVESTMENT.ROI_GAP_WEEKS,
    });

    // Move next keke to 'saving' status
    const nextKeke = rotationData.find(r => r.keke === beneficiary.keke + 1 && r.status === 'pending');
    if (nextKeke) {
      const nextRef = doc(db, 'rotation', `keke-${nextKeke.keke}`);
      await updateDoc(nextRef, { status: 'saving' });
    }

    // Notify ALL users
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const userDoc of usersSnap.docs) {
      await notifyUser(
        userDoc.id,
        `Keke #${beneficiary.keke} has been purchased for ${beneficiary.owner}! ${nextKeke ? `Next up: Keke #${nextKeke.keke} for ${nextKeke.owner}.` : 'All 12 kekes purchased!'}`,
        'purchase_confirmed'
      );
    }
  }

  // ─── Notification helpers ───
  async function notifyAdmin(message, type) {
    const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')));
    for (const adminDoc of usersSnap.docs) {
      await addDoc(collection(db, 'notifications'), {
        userId: adminDoc.id,
        message,
        type,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function notifyUser(userId, message, type) {
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  }

  async function markNotificationRead(notifId) {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  }

  async function markAllRead() {
    for (const n of notifications.filter(n => !n.read)) {
      await updateDoc(doc(db, 'notifications', n.id), { read: true });
    }
  }

  // ─── Computed values ───
  const approvedTransfers = transfers.filter(t => t.status === 'approved');
  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const verifiedTotal = approvedTransfers.reduce((sum, t) => sum + t.amount, 0);
  const remainingAmount = INVESTMENT.NEW_KEKE_COST - verifiedTotal;
  const progressPercent = Math.min(100, (verifiedTotal / INVESTMENT.NEW_KEKE_COST) * 100);
  const unreadCount = notifications.filter(n => !n.read).length;
  const canPurchase = isAdmin && verifiedTotal >= INVESTMENT.NEW_KEKE_COST;

  const value = {
    beneficiary,
    transfers,
    rotationData,
    notifications,
    loading,
    // Actions
    logTransfer,
    approveTransfer,
    rejectTransfer,
    confirmPurchase,
    setBeneficiaryBankDetails,
    markNotificationRead,
    markAllRead,
    // Computed
    approvedTransfers,
    pendingTransfers,
    verifiedTotal,
    remainingAmount,
    progressPercent,
    unreadCount,
    canPurchase,
  };

  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
}
