import { useTransfer } from '../contexts/TransferContext';
import { getCurrentWeek, getWeekStartDate, isHolidayWeek, formatNaira, INVESTMENT } from '../config/investment';
import { Calendar, TrendingUp, Snowflake } from 'lucide-react';

export default function WeeklyStatus() {
  const { rotationData } = useTransfer();
  const currentWeek = getCurrentWeek();
  const weekStart = getWeekStartDate(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const holiday = isHolidayWeek(currentWeek);

  // Calculate current weekly income from rotation data
  const purchasedNew = rotationData.filter(r => r.status === 'purchased' && r.roiStartWeek && r.roiStartWeek <= currentWeek);
  const activeNewKekes = purchasedNew.length;
  const oldIncome = INVESTMENT.ORIGINAL_KEKE_COUNT * INVESTMENT.ORIGINAL_KEKE_WEEKLY;
  const newIncome = activeNewKekes * INVESTMENT.NEW_KEKE_WEEKLY;
  const totalWeekly = holiday ? 0 : oldIncome + newIncome;
  const totalKekes = INVESTMENT.ORIGINAL_KEKE_COUNT + rotationData.filter(r => r.status === 'purchased').length;

  const fmt = (d) => d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">This week</h3>
        </div>
        <span className="text-xs text-gray-500">Week {currentWeek}</span>
      </div>

      <p className="text-white font-medium text-sm mb-3">
        {fmt(weekStart)} — {fmt(weekEnd)}
      </p>

      {holiday ? (
        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/15 rounded-xl p-3">
          <Snowflake className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Holiday week — no returns</span>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-lg font-bold">{formatNaira(totalWeekly)}</span>
            <span className="text-gray-500 text-xs">/week</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase">Original (×{INVESTMENT.ORIGINAL_KEKE_COUNT})</p>
              <p className="text-white font-semibold text-sm">{formatNaira(oldIncome)}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase">New (×{activeNewKekes})</p>
              <p className="text-white font-semibold text-sm">{formatNaira(newIncome)}</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center pt-1">
            {totalKekes} kekes total • {INVESTMENT.TARGET_KEKES - totalKekes} remaining to goal
          </p>
        </div>
      )}
    </div>
  );
}
