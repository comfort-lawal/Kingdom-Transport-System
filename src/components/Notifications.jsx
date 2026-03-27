import { useState, useRef, useEffect } from 'react';
import { useTransfer } from '../contexts/TransferContext';
import { Bell, Check, CheckCheck, Send, XCircle, Trophy } from 'lucide-react';

const ICON_MAP = {
  transfer_logged: Send,
  transfer_approved: Check,
  transfer_rejected: XCircle,
  purchase_confirmed: Trophy,
};

const COLOR_MAP = {
  transfer_logged: 'text-blue-400',
  transfer_approved: 'text-green-400',
  transfer_rejected: 'text-red-400',
  purchase_confirmed: 'text-kingdom-gold',
};

export default function Notifications() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useTransfer();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-white/5 transition">
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && <span className="notification-dot" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in">
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-kingdom-green flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No notifications yet.</p>
            ) : (
              notifications.slice(0, 20).map(n => {
                const Icon = ICON_MAP[n.type] || Bell;
                const color = COLOR_MAP[n.type] || 'text-gray-400';
                const timeStr = n.createdAt?.toDate
                  ? n.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div key={n.id}
                    onClick={() => !n.read && markNotificationRead(n.id)}
                    className={`flex items-start gap-3 p-3 border-b border-white/5 cursor-pointer transition ${n.read ? 'opacity-50' : 'bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-300 leading-snug">{n.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{timeStr}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-kingdom-green flex-shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
