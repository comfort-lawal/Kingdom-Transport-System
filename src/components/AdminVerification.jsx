import { useState } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { useAuth } from '../contexts/AuthContext';
import { formatNaira } from '../config/investment';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, User } from 'lucide-react';

export default function AdminVerification() {
  const { isAdmin } = useAuth();
  const { pendingTransfers, approveTransfer, rejectTransfer, verifiedTotal } = useTransfer();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(null);

  if (!isAdmin) return null;

  async function handleApprove(id) {
    setProcessing(id);
    try {
      await approveTransfer(id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setProcessing(null);
  }

  async function handleReject(id) {
    if (!rejectNote.trim()) { alert('Please provide a reason for rejection'); return; }
    setProcessing(id);
    try {
      await rejectTransfer(id, rejectNote);
      setRejectingId(null);
      setRejectNote('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setProcessing(null);
  }

  return (
    <div className="card border-yellow-500/20">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-yellow-400" />
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
          Admin — Verify transfers
        </h3>
        {pendingTransfers.length > 0 && (
          <span className="badge badge-pending ml-auto">{pendingTransfers.length} pending</span>
        )}
      </div>

      {pendingTransfers.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No pending transfers to review.</p>
      ) : (
        <div className="space-y-3">
          {pendingTransfers.map(t => {
            const dateStr = t.createdAt?.toDate
              ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
              : '—';
            const isRejecting = rejectingId === t.id;
            const isProcessing = processing === t.id;

            return (
              <div key={t.id} className="bg-black/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-bold text-lg">{formatNaira(t.amount)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <User className="w-3 h-3" />
                      <span>{t.senderName}</span>
                      <span>• Week {t.weekNumber}</span>
                      <span>• {dateStr}</span>
                    </div>
                    {t.reference && <p className="text-xs text-gray-500 mt-1">Ref: {t.reference}</p>}
                    {t.note && <p className="text-xs text-gray-400 mt-1">Note: {t.note}</p>}
                  </div>
                </div>

                {isRejecting ? (
                  <div className="mt-3 space-y-2">
                    <input
                      placeholder="Reason for rejection..."
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(t.id)} disabled={isProcessing}
                        className="btn-danger px-4 py-2 rounded-xl text-white text-sm flex items-center gap-1 flex-1">
                        <XCircle className="w-3 h-3" /> {isProcessing ? 'Rejecting...' : 'Confirm reject'}
                      </button>
                      <button onClick={() => { setRejectingId(null); setRejectNote(''); }}
                        className="btn-secondary px-4 py-2 rounded-xl text-gray-300 text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApprove(t.id)} disabled={isProcessing}
                      className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-1 flex-1">
                      <CheckCircle2 className="w-3 h-3" /> {isProcessing ? 'Approving...' : 'Approve'}
                    </button>
                    <button onClick={() => setRejectingId(t.id)}
                      className="btn-secondary px-4 py-2 rounded-xl text-gray-300 text-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick stat */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
        <span>Total verified so far</span>
        <span className="text-green-400 font-semibold">{formatNaira(verifiedTotal)}</span>
      </div>
    </div>
  );
}
