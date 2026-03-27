import { useState } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { useAuth } from '../contexts/AuthContext';
import { INVESTMENT, KEKE6_CONFIG, formatNaira, COLLABORATOR_COLORS } from '../config/investment';
import { Building2, Copy, Check, Edit3, Save, X, Trophy, ArrowRight } from 'lucide-react';

export default function BeneficiaryCard() {
  const { beneficiary, verifiedTotal, verifiedTransferTotal, remainingAmount, progressPercent,
    canPurchase, confirmPurchase, setBeneficiaryBankDetails, pendingTotal } = useTransfer();
  const { isAdmin } = useAuth();
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!beneficiary) {
    return (
      <div className="card card-highlight text-center py-8">
        <Trophy className="w-12 h-12 text-kingdom-gold mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">All 12 kekes purchased!</h3>
      </div>
    );
  }

  const colors = COLLABORATOR_COLORS[beneficiary.owner] || { hex: '#008751' };
  const hasBankDetails = beneficiary.bankName && beneficiary.accountNumber;
  const TARGET = INVESTMENT.NEW_KEKE_COST;
  const excess = KEKE6_CONFIG.excessFromKeke5;

  function startEditBank() {
    setBankForm({ bankName: beneficiary.bankName || '', accountNumber: beneficiary.accountNumber || '', accountName: beneficiary.accountName || '' });
    setEditingBank(true);
  }

  async function saveBank() {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountName) return;
    setSaving(true);
    try { await setBeneficiaryBankDetails(beneficiary.keke, bankForm); setEditingBank(false); }
    catch (err) { alert('Error: ' + err.message); }
    setSaving(false);
  }

  function copyAccount() {
    navigator.clipboard.writeText(beneficiary.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirmPurchase() {
    if (!confirm(`Confirm purchase of Keke #${beneficiary.keke} for ${beneficiary.owner}?\n\nThis cannot be undone.`)) return;
    setConfirming(true);
    try { await confirmPurchase(); } catch (err) { alert('Error: ' + err.message); }
    setConfirming(false);
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="card card-highlight pulse-saving animate-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider">Currently saving for</p>
          <h2 className="text-lg font-bold text-white">
            Keke #{beneficiary.keke} <span style={{ color: colors.hex }}>→ {beneficiary.owner}</span>
          </h2>
        </div>
        <span className="badge badge-saving">Saving</span>
      </div>

      {/* Progress ring + amounts */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" className="progress-ring">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="60" cy="60" r={radius} fill="none" stroke={colors.hex} strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{Math.round(progressPercent)}%</span>
            <span className="text-[10px] text-gray-400">of {formatNaira(TARGET)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Excess from Keke #5</span>
            <span className="text-blue-400 font-semibold">{formatNaira(excess)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Verified transfers</span>
            <span className="text-green-400 font-semibold">{formatNaira(verifiedTransferTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pending</span>
            <span className="text-yellow-400 font-semibold">{formatNaira(pendingTotal)}</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total verified</span>
            <span className="text-white font-bold">{formatNaira(verifiedTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Remaining</span>
            <span className="text-white font-bold">{formatNaira(Math.max(0, remainingAmount))}</span>
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="bg-black/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-white">Transfer to ({beneficiary.owner}):</span>
          </div>
          {isAdmin && !editingBank && (
            <button onClick={startEditBank} className="text-kingdom-green text-xs flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        {editingBank ? (
          <div className="space-y-2 mt-2">
            <input placeholder="Bank name" value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} />
            <input placeholder="Account number" value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
            <input placeholder="Account name" value={bankForm.accountName} onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={saveBank} disabled={saving} className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-1 flex-1">
                <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditingBank(false)} className="btn-secondary px-4 py-2 rounded-xl text-gray-300 text-sm">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : hasBankDetails ? (
          <div className="mt-1 space-y-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{beneficiary.accountName}</p>
                <p className="text-gray-400 text-sm">{beneficiary.bankName}</p>
              </div>
              <button onClick={copyAccount} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                <span className="text-white font-mono text-base">{beneficiary.accountNumber}</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Click "Edit" to add bank details.' : 'Bank details not yet set. Contact Admin.'}
          </p>
        )}
      </div>

      {canPurchase && (
        <button onClick={handleConfirmPurchase} disabled={confirming}
          className="w-full mt-4 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${colors.hex}, #fbbf24)` }}>
          {confirming ? 'Confirming...' : (<><Trophy className="w-5 h-5" /> Confirm Purchase — Keke #{beneficiary.keke}<ArrowRight className="w-4 h-4" /></>)}
        </button>
      )}
    </div>
  );
}
