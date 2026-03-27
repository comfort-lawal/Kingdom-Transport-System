import { useTransfer } from '../contexts/TransferContext';
import { formatNaira, COLLABORATOR_COLORS } from '../config/investment';
import { Clock, CheckCircle2, XCircle, User, Hash } from 'lucide-react';

export default function TransferHistory() {
  const { transfers } = useTransfer();

  if (transfers.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Transfer history</h3>
        <p className="text-gray-500 text-sm text-center py-6">No transfers logged yet.</p>
      </div>
    );
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-400', badge: 'badge-pending', label: 'Pending' },
    approved: { icon: CheckCircle2, color: 'text-green-400', badge: 'badge-approved', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-400', badge: 'badge-rejected', label: 'Rejected' },
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Transfer history <span className="text-xs text-gray-500 font-normal ml-2">({transfers.length})</span>
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transfers.map(t => {
          const config = statusConfig[t.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const colors = COLLABORATOR_COLORS[t.collaboratorName] || {};
          const dateStr = t.createdAt?.toDate
            ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '—';

          return (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/30 transition">
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold text-sm">{formatNaira(t.amount)}</span>
                    <span className={`badge ${config.badge}`}>{config.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: (colors.hex || '#6b7280') + '15', color: colors.hex || '#9ca3af' }}>
                      {t.collaboratorName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <User className="w-3 h-3" />
                    <span className="truncate">{t.senderName}</span>
                    <span>• Wk {t.weekNumber}</span>
                    <span>• {dateStr}</span>
                  </div>
                  {t.reference && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{t.reference}</span>
                    </div>
                  )}
                  {t.status === 'rejected' && t.rejectNote && (
                    <p className="text-xs text-red-400/70 mt-0.5">Reason: {t.rejectNote}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
