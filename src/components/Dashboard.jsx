import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransfer } from '../contexts/TransferContext';
import BeneficiaryCard from './BeneficiaryCard';
import TransferForm from './TransferForm';
import TransferHistory from './TransferHistory';
import AdminVerification from './AdminVerification';
import RotationTimeline from './RotationTimeline';
import WeeklyStatus from './WeeklyStatus';
import WeeklyChecklist from './WeeklyChecklist';
import Notifications from './Notifications';
import { Plus, LogOut, Truck, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { beneficiary, loading } = useTransfer();
  const [showTransferForm, setShowTransferForm] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Truck className="w-10 h-10 text-kingdom-green mx-auto mb-3 animate-pulse" />
      </div>
    );
  }

  const displayName = userProfile?.displayName || currentUser?.email;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-kingdom-dark/90 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-kingdom-green/20 flex items-center justify-center">
              <Truck className="w-4 h-4 text-kingdom-green" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Kingdom Transport</h1>
              <p className="text-[10px] text-gray-500 leading-tight flex items-center gap-1">
                {displayName}
                {isAdmin && <ShieldCheck className="w-2.5 h-2.5 text-yellow-400" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Notifications />
            <button onClick={logout} className="p-2 rounded-xl hover:bg-white/5 transition" title="Sign out">
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <BeneficiaryCard />
        <WeeklyStatus />
        <AdminVerification />
        <WeeklyChecklist />
        <TransferHistory />
        <RotationTimeline />
      </main>

      {beneficiary && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
          <button onClick={() => setShowTransferForm(true)}
            className="btn-primary px-6 py-3 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg shadow-kingdom-green/20">
            <Plus className="w-5 h-5" /> Log transfer
          </button>
        </div>
      )}

      {showTransferForm && <TransferForm onClose={() => setShowTransferForm(false)} />}
    </div>
  );
}
