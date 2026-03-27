import { useTransfer } from '../contexts/TransferContext';
import { formatNaira } from '../config/investment';
import { Clock, CheckCircle2, XCircle, User } from 'lucide-react';

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
        Transfer history
        <span className="text-xs text-gray-500 font-normal ml-2">({transfers.length} total)</span>
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transfers.map(t => {
          const config = statusConfig[t.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const dateStr = t.createdAt?.toDate
            ? t.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : '—';

          return (
            <div key={t.id}
              className="flex items-center justify-between p-3 rounded-xl bg-black/20 hover:bg-black/30 transition">
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{formatNaira(t.amount)}</span>
                    <span className={`badge ${config.badge}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <User className="w-3 h-3" />
                    <span className="truncate">{t.senderName}</span>
                    <span>• Wk {t.weekNumber}</span>
                    <span>• {dateStr}</span>
                  </div>
                  {t.reference && (
                    <p className="text-xs text-gray-600 mt-0.5">Ref: {t.reference}</p>
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
