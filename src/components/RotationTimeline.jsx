import { useTransfer } from '../contexts/TransferContext';
import { COLLABORATOR_COLORS, formatNaira, INVESTMENT, getWeekStartDate } from '../config/investment';
import { CheckCircle2, Clock, Circle, Truck } from 'lucide-react';

export default function RotationTimeline() {
  const { rotationData } = useTransfer();

  if (!rotationData || rotationData.length === 0) return null;

  const statusConfig = {
    purchased: { icon: CheckCircle2, color: 'text-green-400', label: 'Purchased' },
    saving: { icon: Clock, color: 'text-blue-400', label: 'Saving now' },
    pending: { icon: Circle, color: 'text-gray-600', label: 'Upcoming' },
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Keke ownership timeline
        </h3>
      </div>

      <div className="space-y-1">
        {rotationData.map((entry, i) => {
          const config = statusConfig[entry.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const colors = COLLABORATOR_COLORS[entry.owner] || { hex: '#6b7280' };
          const isSaving = entry.status === 'saving';

          let dateLabel = '';
          if (entry.status === 'purchased' && entry.purchaseDate) {
            const d = new Date(entry.purchaseDate);
            dateLabel = d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
          } else if (entry.purchaseWeek) {
            const d = getWeekStartDate(entry.purchaseWeek);
            dateLabel = '~' + d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
          }

          return (
            <div key={entry.keke}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${isSaving ? 'bg-blue-500/5 border border-blue-500/15' : 'hover:bg-white/[0.02]'}`}>
              {/* Keke number badge */}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: entry.status === 'pending' ? 'rgba(255,255,255,0.04)' : `${colors.hex}20`,
                  color: entry.status === 'pending' ? '#6b7280' : colors.hex,
                  border: isSaving ? `1.5px solid ${colors.hex}` : 'none',
                }}>
                #{entry.keke}
              </div>

              {/* Owner + status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${entry.status === 'pending' ? 'text-gray-500' : 'text-white'}`}>
                    {entry.owner}
                  </span>
                  <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                  {isSaving && <span className="badge badge-saving text-[10px]">Active</span>}
                </div>
                {dateLabel && <p className="text-xs text-gray-600">{dateLabel}</p>}
              </div>

              {/* Status label on right */}
              <span className={`text-xs ${config.color}`}>{config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {rotationData.filter(r => r.status === 'purchased').length + INVESTMENT.ORIGINAL_KEKE_COUNT} of {INVESTMENT.TARGET_KEKES} kekes
        </span>
        <span className="text-gray-500">
          Rotation: Fadeke → A.S.O → Itunu → Dayo
        </span>
      </div>
    </div>
  );
}
