import { useState } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentWeek, formatNaira, isHolidayWeek, getWeekStartDate } from '../config/investment';
import { Send, X, AlertCircle } from 'lucide-react';

export default function TransferForm({ onClose }) {
  const { beneficiary, logTransfer } = useTransfer();
  const { userProfile } = useAuth();
  const currentWeek = getCurrentWeek();

  const [weekNumber, setWeekNumber] = useState(currentWeek);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!beneficiary) return null;

  // Generate week options (from week of last purchase to current week + 2)
  const weekOptions = [];
  for (let w = Math.max(1, currentWeek - 8); w <= currentWeek + 2; w++) {
    if (!isHolidayWeek(w)) {
      const start = getWeekStartDate(w);
      const label = `Week ${w} — ${start.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      weekOptions.push({ value: w, label, isCurrent: w === currentWeek });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!amount || Number(amount) <= 0) { setError('Please enter a valid amount'); return; }
    if (isHolidayWeek(weekNumber)) { setError('This is a holiday week — no transfers needed'); return; }

    setSubmitting(true);
    try {
      await logTransfer({ amount, weekNumber, reference, note });
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
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Beneficiary info */}
        <div className="bg-kingdom-green/10 border border-kingdom-green/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-400 uppercase">Sending to</p>
          <p className="text-white font-semibold">{beneficiary.owner} — Keke #{beneficiary.keke}</p>
          {beneficiary.accountNumber && (
            <p className="text-gray-400 text-sm mt-0.5">
              {beneficiary.bankName} • {beneficiary.accountNumber}
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Which week is this for?</label>
            <select value={weekNumber} onChange={e => setWeekNumber(Number(e.target.value))}>
              {weekOptions.map(w => (
                <option key={w.value} value={w.value}>
                  {w.label}{w.isCurrent ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Amount (₦)</label>
            <input
              type="number"
              placeholder="e.g. 75000"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            {amount && Number(amount) > 0 && (
              <p className="text-xs text-gray-500 mt-1">{formatNaira(Number(amount))}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Transfer reference (optional)</label>
            <input
              type="text"
              placeholder="Bank transfer reference"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Note (optional)</label>
            <textarea
              placeholder="Any additional note..."
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Logging...' : 'Log transfer'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your transfer will be visible to admin for verification.
          </p>
        </form>
      </div>
    </div>
  );
}
