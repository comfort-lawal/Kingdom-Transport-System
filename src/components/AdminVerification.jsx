import { useState } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { useAuth } from '../contexts/AuthContext';
import { formatNaira, COLLABORATOR_COLORS } from '../config/investment';
import { ShieldCheck, CheckCircle2, XCircle, User, Hash } from 'lucide-react';

export default function AdminVerification() {
  const { isAdmin } = useAuth();
  const { pendingTransfers, approveTransfer, rejectTransfer, verifiedTotal } = useTransfer();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(null);

  if (!isAdmin) return null;

  async function handleApprove(id) {
    setProcessing(id);
    try { await approveTransfer(id); } catch (err) { alert('Error: ' + err.message); }
    setProcessing(null);
  }

  async function handleReject(id) {
    if (!rejectNote.trim()) { alert('Please provide a reason for rejection'); return; }
    setProcessing(id);
    try { await rejectTransfer(id, rejectNote); setRejectingId(null); setRejectNote(''); }
    catch (err) { alert('Error: ' + err.message); }
    setProcessing(null);
  }

  return (
    <div className="card border-yellow-500/20">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-yellow-400" />
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Admin — Verify transfers</h3>
        {pendingTransfers.length > 0 && <span className="badge badge-pending ml-auto">{pendingTransfers.length} pending</span>}
      </div>

      {pendingTransfers.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No pending transfers to review.</p>
      ) : (
        <div className="space-y-3">
          {pendingTransfers.map(t => {
            const dateStr = t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
            const isRejecting = rejectingId === t.id;
            const isProcessing = processing === t.id;
            const colors = COLLABORATOR_COLORS[t.collaboratorName] || {};

            return (
              <div key={t.id} className="bg-black/20 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-lg">{formatNaira(t.amount)}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: (colors.hex || '#6b7280') + '20', color: colors.hex || '#9ca3af' }}>
                        {t.collaboratorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>Logged by {t.senderName}</span>
                      <span>• Week {t.weekNumber}</span>
                      <span>• {dateStr}</span>
                    </div>
                    {t.reference && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono">{t.reference}</span>
                      </div>
                    )}
                    {t.note && <p className="text-xs text-gray-400 mt-1">Note: {t.note}</p>}
                  </div>
                </div>

                {isRejecting ? (
                  <div className="mt-3 space-y-2">
                    <input placeholder="Reason for rejection..." value={rejectNote} onChange={e => setRejectNote(e.target.value)} autoFocus />
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(t.id)} disabled={isProcessing} className="btn-danger px-4 py-2 rounded-xl text-white text-sm flex items-center gap-1 flex-1">
                        <XCircle className="w-3 h-3" /> {isProcessing ? 'Rejecting...' : 'Confirm reject'}
                      </button>
                      <button onClick={() => { setRejectingId(null); setRejectNote(''); }} className="btn-secondary px-4 py-2 rounded-xl text-gray-300 text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleApprove(t.id)} disabled={isProcessing} className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-1 flex-1">
                      <CheckCircle2 className="w-3 h-3" /> {isProcessing ? 'Approving...' : 'Approve'}
                    </button>
                    <button onClick={() => setRejectingId(t.id)} className="btn-secondary px-4 py-2 rounded-xl text-gray-300 text-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-500">
        <span>Total verified (incl. excess)</span>
        <span className="text-green-400 font-semibold">{formatNaira(verifiedTotal)}</span>
      </div>
    </div>
  );
}
