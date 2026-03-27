import { useTransfer } from '../contexts/TransferContext';
import { formatNaira, getWeekStartDate, isHolidayWeek, getCurrentWeek, COLLABORATOR_COLORS } from '../config/investment';
import { CheckCircle2, Clock, XCircle, Circle, ClipboardList } from 'lucide-react';

const STATUS_CONFIG = {
  approved: { icon: CheckCircle2, color: 'text-green-400', label: 'Paid' },
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  rejected: { icon: XCircle, color: 'text-red-400', label: 'Rejected' },
  not_logged: { icon: Circle, color: 'text-gray-600', label: 'Not logged' },
};

export default function WeeklyChecklist() {
  const { getWeeklyChecklist } = useTransfer();
  const currentWeek = getCurrentWeek();
  const weeks = getWeeklyChecklist();

  if (weeks.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Weekly register</h3>
        </div>
        <p className="text-gray-500 text-sm text-center py-4">No weeks to show yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Weekly register</h3>
      </div>

      <div className="space-y-3">
        {weeks.map(week => {
          const start = getWeekStartDate(week.weekNumber);
          const dateStr = start.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
          const allPaid = week.people.every(p => p.status === 'approved');
          const isCurrent = week.weekNumber === currentWeek;

          return (
            <div key={week.weekNumber}
              className={`rounded-xl p-3 ${isCurrent ? 'bg-blue-500/5 border border-blue-500/15' : 'bg-black/20'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">Week {week.weekNumber}</span>
                  <span className="text-gray-500 text-xs">{dateStr}</span>
                  {isCurrent && <span className="badge badge-saving text-[10px]">Current</span>}
                </div>
                {allPaid && <span className="text-green-400 text-xs font-semibold">All paid ✓</span>}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {week.people.map(person => {
                  const config = STATUS_CONFIG[person.status];
                  const StatusIcon = config.icon;
                  const colors = COLLABORATOR_COLORS[person.name] || {};

                  return (
                    <div key={person.name}
                      className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                      <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${config.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate" style={{ color: colors.hex || '#9ca3af' }}>
                          {person.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {person.status === 'approved'
                            ? formatNaira(person.totalApproved)
                            : person.status === 'pending'
                            ? `${formatNaira(person.totalPending)} pending`
                            : formatNaira(person.expectedAmount) + ' due'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
