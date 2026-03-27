import { useState } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeek, formatNaira, isHolidayWeek, getWeekStartDate, getWeeklyAmountForPerson,
  INVESTMENT, KEKE6_CONFIG } from '../config/investment';
import { Send, X, AlertCircle, Info } from 'lucide-react';

export default function TransferForm({ onClose }) {
  const { beneficiary, logTransfer } = useTransfer();
  const { isAdmin } = useAuth();
  const currentWeek = getCurrentWeek();

  const [collaboratorName, setCollaboratorName] = useState(INVESTMENT.COLLABORATORS[0]);
  const [weekNumber, setWeekNumber] = useState(currentWeek);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!beneficiary) return null;

  const expectedAmount = getWeeklyAmountForPerson(collaboratorName, weekNumber);

  // Weeks from logging start to current week (skip holidays)
  const weekOptions = [];
  for (let w = KEKE6_CONFIG.loggingStartWeek; w <= currentWeek; w++) {
    if (!isHolidayWeek(w)) {
      const start = getWeekStartDate(w);
      const label = `Week ${w} — ${start.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      weekOptions.push({ value: w, label, isCurrent: w === currentWeek });
    }
  }

  function prefillAmount() {
    setAmount(String(expectedAmount));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }

    setSubmitting(true);
    try {
      await logTransfer({ amount, weekNumber, reference, note, collaboratorName });
      onClose();
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Log transfer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Beneficiary info */}
        <div className="bg-kingdom-green/10 border border-kingdom-green/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-400 uppercase">Sending to</p>
          <p className="text-white font-semibold">{beneficiary.owner} — Keke #{beneficiary.keke}</p>
          {beneficiary.accountNumber && (
            <p className="text-gray-400 text-sm mt-0.5">{beneficiary.bankName} • {beneficiary.accountNumber}</p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Who is this transfer for */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Who made this transfer?</label>
            <select value={collaboratorName} onChange={e => { setCollaboratorName(e.target.value); setAmount(''); }}>
              {INVESTMENT.COLLABORATORS.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Week */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Which week?</label>
            <select value={weekNumber} onChange={e => { setWeekNumber(Number(e.target.value)); setAmount(''); }}>
              {weekOptions.map(w => (
                <option key={w.value} value={w.value}>
                  {w.label}{w.isCurrent ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Expected amount hint */}
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/15 rounded-xl p-3">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="text-blue-300">{collaboratorName}</span>
              <span className="text-gray-400"> should pay </span>
              <span className="text-white font-bold">{formatNaira(expectedAmount)}</span>
              <span className="text-gray-400"> for Week {weekNumber}</span>
              {collaboratorName === 'Dr. Fadeke' && weekNumber >= KEKE6_CONFIG.roiStartWeek && (
                <span className="text-gray-500 text-xs block mt-0.5">₦75k base + ₦125k (Keke #5 ROI)</span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Amount (₦)</label>
            <div className="flex gap-2">
              <input type="number" placeholder={`e.g. ${expectedAmount}`} value={amount}
                onChange={e => setAmount(e.target.value)} required className="flex-1" />
              <button type="button" onClick={prefillAmount}
                className="btn-secondary px-3 py-2 rounded-xl text-sm text-gray-300 whitespace-nowrap">
                Use {formatNaira(expectedAmount)}
              </button>
            </div>
            {amount && Number(amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">{formatNaira(Number(amount))}</p>
            )}
          </div>

          {/* Transfer reference */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Bank transfer reference *</label>
            <input type="text" placeholder="e.g. NIP/FBN/241027... or session ID" value={reference}
              onChange={e => setReference(e.target.value)} />
            <p className="text-xs text-gray-600 mt-1">From your bank app — helps Admin verify the transfer</p>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Note (optional)</label>
            <textarea placeholder="Any additional note..." value={note}
              onChange={e => setNote(e.target.value)} rows={2} className="resize-none" />
          </div>

          <button type="submit" disabled={submitting}
            className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            {submitting ? 'Logging...' : 'Log transfer'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Admin will verify this transfer against bank records.
          </p>
        </form>
      </div>
    </div>
  );
}
