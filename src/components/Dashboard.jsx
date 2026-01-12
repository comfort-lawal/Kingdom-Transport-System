import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInvestment, INVESTMENT_CONFIG } from '../contexts/InvestmentContext';
import { 
  LogOut, Menu, X, TrendingUp, Target, Calendar, 
  Users, Clock, CheckCircle, Plus, Download,
  Wallet, PiggyBank, History, Receipt, Loader2,
  PartyPopper, ChevronDown, ChevronUp, Camera,
  User, Edit3, Save, Trash2, Shield, AlertTriangle,
  Settings, UserCog
} from 'lucide-react';

// Format currency - Always use Naira
const formatCurrency = (amount) => {
  return '₦' + new Intl.NumberFormat('en-NG').format(amount);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Format full date with day
const formatFullDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Format time ago
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

// Progress Ring Component
function ProgressRing({ progress, size = 200, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#008751" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-display font-bold gradient-text">
          {Math.round(progress)}%
        </span>
        <span className="text-slate-400 text-sm">to next Keke</span>
      </div>
    </div>
  );
}

// Countdown Component with estimated date
function Countdown({ targetAmount, currentAmount, weeklyIncome }) {
  const remaining = targetAmount - currentAmount;
  const weeksToGo = Math.ceil(remaining / weeklyIncome);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });
  const [estimatedDate, setEstimatedDate] = useState(null);
  
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (weeksToGo * 7));
    setEstimatedDate(targetDate);
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / (1000 * 60)) % 60),
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [weeksToGo]);

  if (remaining <= 0) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full">
          <PartyPopper className="w-5 h-5" />
          <span className="font-semibold">Ready to Purchase!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <div className="bg-dark-200 rounded-xl px-4 py-3 min-w-[70px]">
            <span className="text-3xl font-display font-bold text-white countdown-number">
              {timeLeft.days}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Days</span>
        </div>
        <div className="text-center">
          <div className="bg-dark-200 rounded-xl px-4 py-3 min-w-[70px]">
            <span className="text-3xl font-display font-bold text-white countdown-number">
              {timeLeft.hours}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Hours</span>
        </div>
        <div className="text-center">
          <div className="bg-dark-200 rounded-xl px-4 py-3 min-w-[70px]">
            <span className="text-3xl font-display font-bold text-white countdown-number">
              {timeLeft.mins}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Mins</span>
        </div>
      </div>
      
      {/* Estimated Purchase Date */}
      {estimatedDate && (
        <div className="text-center">
          <p className="text-slate-400 text-sm">Estimated Purchase Date:</p>
          <p className="text-primary-400 font-display font-semibold text-lg">
            {formatFullDate(estimatedDate)}
          </p>
        </div>
      )}
    </div>
  );
}

// Confirm Delete Modal
function ConfirmDeleteModal({ isOpen, onClose, onConfirm, payment, loading }) {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="font-display text-xl font-bold text-white">
            Delete Payment?
          </h3>
          <p className="text-slate-400 mt-2">
            Are you sure you want to delete the Week {payment.weekNumber} payment of {formatCurrency(payment.amount)}?
          </p>
          <p className="text-red-400 text-sm mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-dark-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 spinner" /> : <Trash2 className="w-5 h-5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Panel Modal
function AdminPanelModal({ isOpen, onClose, allUsers, onUpdateRole, currentUserEmail }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary-400" />
            Admin Panel
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="text-slate-400 text-sm font-medium">Manage Collaborators</h4>
          
          {allUsers.map((user) => (
            <div key={user.uid} className="flex items-center justify-between p-3 bg-dark-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.avatar || user.displayName?.charAt(0) || '?'
                  )}
                </div>
                <div>
                  <p className="text-white font-medium text-sm flex items-center gap-2">
                    {user.displayName}
                    {user.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs">{user.email}</p>
                </div>
              </div>
              
              {user.email !== currentUserEmail && (
                <select
                  value={user.role}
                  onChange={(e) => onUpdateRole(user.uid, e.target.value)}
                  className="bg-dark-300 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
                >
                  <option value="collaborator">Collaborator</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-primary-500/10 rounded-xl">
          <h4 className="text-primary-400 font-medium text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Admin Privileges
          </h4>
          <ul className="text-slate-400 text-xs space-y-1">
            <li>• Delete any payment entry</li>
            <li>• Edit payment amounts</li>
            <li>• Manage user roles</li>
            <li>• Purchase new Kekes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Profile Edit Modal
function ProfileEditModal({ isOpen, onClose, userProfile, onSave, loading }) {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photoURL || null);
  const [photoData, setPhotoData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoPreview(userProfile.photoURL || null);
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image too large. Please use an image under 500KB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhotoData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ displayName, photoData });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Edit Profile
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-gold-500 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="text-slate-500 text-xs mt-2">Click to change photo (max 500KB)</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-dark-200 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-primary-500 transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Role Badge */}
          {userProfile?.role === 'admin' && (
            <div className="flex items-center gap-2 p-3 bg-gold-500/10 rounded-xl">
              <Shield className="w-5 h-5 text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">Administrator</span>
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            <div className="bg-dark-300 rounded-xl py-3 px-4 text-slate-500">
              {userProfile?.email}
            </div>
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-dark-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 spinner" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Log Payment Modal - Each collaborator logs their share
function LogPaymentModal({ isOpen, onClose, onSubmit, currentWeek, loading, loggedWeeks, userDisplayName, expectedPayment }) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [amount, setAmount] = useState(expectedPayment?.toString() || '75000');
  const [note, setNote] = useState('');

  useEffect(() => {
    setAmount(expectedPayment?.toString() || '75000');
    //Find the first unlogged week for this user (excluding holidays)
    const holidayWeeks = [10, 11, 12, 62, 63, 64, 114, 115, 116];
    for (let w = 1; w <= currentWeek; w++) {
      if (holidayWeeks.includes(w)) continue; // Skip holiday weeks
      if (!loggedWeeks.some(lw => lw.week === w && lw.user === userDisplayName)) {
        setSelectedWeek(w);
        break;
      }
    }
  }, [currentWeek, loggedWeeks, userDisplayName, expectedPayment]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedWeek, parseInt(amount), note);
  };

  // Generate week options from week 1 to current week ONLY (no future weeks, no holidays)
  const holidayWeeks = [10, 11, 12, 62, 63, 64, 114, 115, 116];
  const weekOptions = [];
  for (let w = 1; w <= currentWeek; w++) {
    if (holidayWeeks.includes(w)) continue; // Skip holiday weeks
    // Check if THIS USER already logged for this week
    const userLoggedThisWeek = loggedWeeks.some(lw => lw.week === w && lw.user === userDisplayName);
    weekOptions.push({ week: w, isLogged: userLoggedThisWeek });
  }

  // Calculate week date
  const getWeekDate = (weekNum) => {
    const startDate = new Date('2025-10-20');
    startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
    return startDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary-400" />
            Log Your Payment
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-primary-500/10 rounded-xl p-3 mb-4">
          <p className="text-primary-300 text-sm">
            Your expected weekly payment: <strong>₦{(expectedPayment || 75000).toLocaleString()}</strong>
          </p>
          {expectedPayment > 75000 && (
            <p className="text-gold-400 text-xs mt-1">
              (₦75,000 base + ₦{(expectedPayment - 75000).toLocaleString()} from owned Kekes)
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Select Week (Week 1 - {currentWeek} only)</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
              className="w-full bg-dark-200 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-primary-500 transition-colors appearance-none cursor-pointer"
            >
              {weekOptions.map(({ week, isLogged }) => (
                <option key={week} value={week}>
                  Week {week} ({getWeekDate(week)}) {isLogged ? '✓ You logged' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {weekOptions.find(w => w.week === selectedWeek)?.isLogged
                ? '⚠️ You already logged this week' 
                : `Week starting: ${getWeekDate(selectedWeek)}`
              }
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Your Share (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-dark-200 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-primary-500 transition-colors"
              placeholder="Enter amount"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Expected: ₦{(expectedPayment || 75000).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-dark-200 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-primary-500 transition-colors"
              placeholder="e.g., Received via bank transfer"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-dark-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 spinner" /> : <CheckCircle className="w-5 h-5" />}
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Purchase Keke Modal - With owner assignment
function PurchaseKekeModal({ isOpen, onClose, onConfirm, kekeNumber, loading, nextOwner, collaborators }) {
  const [selectedOwner, setSelectedOwner] = useState(nextOwner?.id || '');
  
  useEffect(() => {
    if (nextOwner) {
      setSelectedOwner(nextOwner.id);
    }
  }, [nextOwner]);

  if (!isOpen) return null;

  const selectedCollab = collaborators?.find(c => c.id === selectedOwner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
            <span className="text-4xl">🛺</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white">
            Purchase Keke #{kekeNumber}
          </h3>
          <p className="text-slate-400 mt-2">
            This will deduct ₦5,000,000 from savings
          </p>
        </div>

        {/* Owner Selection */}
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">Assign to Collaborator (Rotation)</label>
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="w-full bg-dark-200 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-primary-500 transition-colors"
          >
            {collaborators?.map((collab) => (
              <option key={collab.id} value={collab.id}>
                {collab.name} {collab.id === nextOwner?.id ? '(Next in rotation)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-primary-400 mt-1">
            {selectedCollab?.name} will pay ₦125,000/week for this Keke
          </p>
        </div>

        <div className="bg-dark-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Weekly Return:</span>
            <span className="text-primary-400 font-medium">₦125,000</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Duration:</span>
            <span className="text-white">52 weeks</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Assigned to:</span>
            <span className="text-gold-400 font-medium">{selectedCollab?.name || 'Select owner'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-dark-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedOwner)}
            disabled={loading || !selectedOwner}
            className="flex-1 btn-primary py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 spinner" /> : <Plus className="w-5 h-5" />}
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment History Item - Shows individual ₦75,000 contributions
function PaymentHistoryItem({ payment, isAdmin, onDelete }) {
  const isPurchase = payment.isPurchase;
  
  // Calculate week date
  const getWeekDate = (weekNum) => {
    const startDate = new Date('2025-10-20');
    startDate.setDate(startDate.getDate() + (weekNum - 1) * 7);
    return startDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
  };
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${isPurchase ? 'bg-gold-500/10' : 'bg-dark-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPurchase ? 'bg-gold-500/20' : 'bg-primary-500/20'
        }`}>
          {isPurchase ? (
            <span>🛺</span>
          ) : (
            <span className="text-primary-400 font-bold text-sm">
              {payment.loggedBy?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div>
          <p className="text-white font-medium text-sm">
            {isPurchase 
              ? `Purchased Keke #${payment.kekeId}` 
              : `${payment.loggedBy} - Week ${payment.weekNumber}`
            }
          </p>
          <p className="text-slate-500 text-xs">
            {isPurchase 
              ? `${timeAgo(payment.loggedAt)}`
              : `${getWeekDate(payment.weekNumber)} • ${timeAgo(payment.loggedAt)}`
            }
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-display font-bold ${isPurchase ? 'text-gold-400' : 'text-primary-400'}`}>
          {isPurchase ? '-' : '+'}₦{new Intl.NumberFormat('en-NG').format(Math.abs(payment.amount))}
        </span>
        {isAdmin && !isPurchase && (
          <button
            onClick={() => onDelete(payment)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
            title="Delete payment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Keke Timeline Item
function TimelineItem({ keke, isLast, currentWeek }) {
  const isOriginal = keke.type === 'Original';
  const isActive = keke.expiryWeek >= currentWeek;
  
  return (
    <div className="relative pl-8 pb-6">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-gold-500" />
      )}
      
      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
        isActive ? 'bg-primary-500 pulse-active' : 'bg-slate-600'
      }`}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      
      <div className={`glass-card rounded-xl p-4 hover-lift ${!isActive && 'opacity-60'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛺</span>
            <span className="font-display font-semibold text-white">
              Keke #{keke.id}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-primary-500/20 text-primary-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isActive ? 'Active' : 'Expired'}
          </span>
        </div>
        
        {/* Owner badge for new Kekes */}
        {!isOriginal && keke.ownerName && (
          <div className="mb-2 inline-flex items-center gap-1 px-2 py-1 bg-gold-500/20 text-gold-400 rounded-full text-xs">
            <span>👤</span>
            <span>Owned by {keke.ownerName}</span>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">Type</span>
            <p className="text-slate-300">{isOriginal ? 'Original (Shared)' : 'New (Assigned)'}</p>
          </div>
          <div>
            <span className="text-slate-500">Weekly Return</span>
            <p className="text-primary-400 font-medium">₦{keke.weeklyReturn?.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-slate-500">Purchased</span>
            <p className="text-slate-300">Week {keke.purchaseWeek}</p>
          </div>
          <div>
            <span className="text-slate-500">Expires</span>
            <p className="text-slate-300">Week {keke.expiryWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, color = 'primary', onClick }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 border-primary-500/30',
    gold: 'from-gold-500/20 to-gold-600/20 border-gold-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  };
  
  return (
    <div 
      className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${colors[color]} hover-lift ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-slate-500 text-sm mt-1">{subValue}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Install PWA Banner
function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 text-white" />
        <p className="text-white text-sm font-medium">Install app for quick access</p>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
      >
        Install
      </button>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const { currentUser, userProfile, allUsers, logout, updateUserProfile, updateProfilePhoto, updateUserRole, isAdmin } = useAuth();
  const { 
    kekes, 
    payments,
    investmentStats, 
    config, 
    getCurrentWeekNumber, 
    isHolidayWeek,
    logPayment,
    purchaseKeke,
    deletePayment,
    getNextKekeOwner,
    calculateCollaboratorPayments
  } = useInvestment();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const currentWeek = getCurrentWeekNumber();
  const isCurrentHoliday = isHolidayWeek(currentWeek);
  const collaboratorShare = investmentStats.currentWeeklyIncome / config.NUM_COLLABORATORS;
  const canPurchase = investmentStats.cumulativeSavings >= config.NEW_KEKE_COST;
  const displayedPayments = showAllPayments ? payments : payments.slice(0, 5);
  const userIsAdmin = isAdmin();
  const hasLoggedCurrentWeek = loggedWeeks.some(lw => lw.week === currentWeek && lw.user === (userProfile?.displayName || currentUser?.email));
  
  // Get next owner for Keke purchase rotation
  const nextKekeOwner = getNextKekeOwner();
  
  // Get each collaborator's payment breakdown
  const collaboratorPayments = calculateCollaboratorPayments();

  // Get list of weeks that have been logged (with user info)
  const loggedWeeks = payments
    .filter(p => !p.isPurchase && p.amount > 0)
    .map(p => ({ week: p.weekNumber, user: p.loggedBy }));

    // Calculate weeks that need logging (excluding holiday weeks)
  const weeksToLog = [];
  for (let w = 1; w <= currentWeek; w++) {
    if (!isHolidayWeek(w) && !loggedWeeks.includes(w)) {
      weeksToLog.push(w);
    }
  }
  
  // Get unique week numbers for the unlogged weeks banner
  const loggedWeekNumbers = [...new Set(loggedWeeks.map(lw => lw.week))];

  const handleLogPayment = async (selectedWeek, amount, note) => {
    setActionLoading(true);
    try {
      await logPayment(selectedWeek, amount, userProfile?.displayName || currentUser?.email, note);
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error logging payment:', error);
    }
    setActionLoading(false);
  };

  const handlePurchaseKeke = async (ownerId) => {
    setActionLoading(true);
    try {
      await purchaseKeke(userProfile?.displayName || currentUser?.email, ownerId);
      setShowPurchaseModal(false);
    } catch (error) {
      console.error('Error purchasing keke:', error);
    }
    setActionLoading(false);
  };

  const handleSaveProfile = async ({ displayName, photoData }) => {
    setActionLoading(true);
    try {
      if (displayName !== userProfile?.displayName) {
        await updateUserProfile({ displayName, avatar: displayName.charAt(0).toUpperCase() });
      }
      if (photoData) {
        await updateProfilePhoto(photoData);
      }
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setActionLoading(false);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setActionLoading(true);
    try {
      await deletePayment(paymentToDelete.docId);
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
    setActionLoading(false);
  };

  const handleUpdateRole = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Get user avatar/photo
  const getUserAvatar = () => {
    if (userProfile?.photoURL) {
      return <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />;
    }
    return userProfile?.avatar || currentUser?.email?.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-xl">🛺</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-white">Kingdom Transport</h1>
                <p className="text-xs text-slate-500">Investment Dashboard</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              {/* Admin Button */}
              {userIsAdmin && (
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              )}
              
              <div 
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-200 cursor-pointer hover:bg-dark-100 transition-colors"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white font-bold overflow-hidden">
                  {getUserAvatar()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-1">
                    {userProfile?.displayName || currentUser?.email}
                    {userIsAdmin && <Shield className="w-3 h-3 text-gold-400" />}
                    <Edit3 className="w-3 h-3 text-slate-500" />
                  </p>
                  <p className="text-xs text-slate-500">{userIsAdmin ? 'Administrator' : 'Collaborator'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl hover:bg-dark-200 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-dark-200 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 p-4 slide-in">
            <div 
              className="flex items-center gap-3 mb-4 p-2 rounded-xl hover:bg-dark-200 cursor-pointer"
              onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center text-white font-bold overflow-hidden">
                {getUserAvatar()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white flex items-center gap-2">
                  {userProfile?.displayName || currentUser?.email}
                  {userIsAdmin && <Shield className="w-4 h-4 text-gold-400" />}
                </p>
                <p className="text-sm text-slate-500">Tap to edit profile</p>
              </div>
              <Edit3 className="w-4 h-4 text-slate-500" />
            </div>
            
            {userIsAdmin && (
              <button
                onClick={() => { setShowAdminModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-gold-500/20 text-gold-400 mb-2"
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </button>
            )}
            
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-dark-200 text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        {/* Install PWA Banner */}
        <InstallBanner />

        {/* Week Banner */}
        <div className={`rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isCurrentHoliday 
            ? 'bg-gold-500/20 border border-gold-500/30' 
            : 'bg-primary-500/20 border border-primary-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${isCurrentHoliday ? 'text-gold-400' : 'text-primary-400'}`} />
            <div>
              <span className="text-white font-medium">Week {currentWeek}</span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-400">{formatDate(new Date())}</span>
            </div>
            {isCurrentHoliday && (
              <span className="px-3 py-1 rounded-full bg-gold-500/30 text-gold-300 text-sm font-medium">
                Holiday Week
              </span>
            )}
          </div>
          
          {!isCurrentHoliday && !loggedWeeks.some(lw => lw.week === currentWeek && lw.user === (userProfile?.displayName || currentUser?.email)) && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary px-4 py-2 rounded-xl font-medium text-white flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Payment
            </button>
            
          )}
        </div>

        {/* Unlogged Weeks Banner - Show weeks where current user hasn't logged */}
        {(() => {
          const userUnloggedWeeks = [];
          const userName = userProfile?.displayName || currentUser?.email;
          for (let w = 1; w <= currentWeek; w++) {
            if (!isHolidayWeek(w) && !loggedWeeks.some(lw => lw.week === w && lw.user === userName)) {
              userUnloggedWeeks.push(w);
            }
          }
          if (userUnloggedWeeks.length === 0) return null;
          
          return (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-2xl p-4 mb-6">
              <p className="text-blue-300 text-sm mb-2">
                <strong>You haven't logged your ₦75,000 for:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {userUnloggedWeeks.map(w => (
                  <span 
                    key={w} 
                    className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-500/50"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Week {w}
                  </span>
                ))}
              </div>
              <p className="text-slate-400 text-xs mt-2">
                Click "Log Payment" to record your share
              </p>
            </div>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Target}
            label="Active Kekes"
            value={`${investmentStats.activeKekes} / ${config.TARGET_KEKES}`}
            subValue={`${config.TARGET_KEKES - investmentStats.activeKekes} more to goal`}
            color="primary"
          />
          <StatCard
            icon={TrendingUp}
            label="Weekly Income"
            value={formatCurrency(investmentStats.currentWeeklyIncome)}
            subValue="All kekes combined"
            color="gold"
          />
          <StatCard
            icon={PiggyBank}
            label="Current Savings"
            value={formatCurrency(investmentStats.cumulativeSavings)}
            subValue={canPurchase ? 'Ready to buy!' : `${formatCurrency(config.NEW_KEKE_COST - investmentStats.cumulativeSavings)} to next`}
            color="blue"
          />
          <StatCard
            icon={Wallet}
            label="Your Share"
            value={formatCurrency(collaboratorShare)}
            subValue="Per week"
            color="primary"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progress Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Progress to Next Keke
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProgressRing 
                  progress={investmentStats.nextPurchaseProgress} 
                  size={180}
                />
                
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm mb-1">Current Savings</p>
                    <p className="text-3xl font-display font-bold gradient-text">
                      {formatCurrency(investmentStats.cumulativeSavings)}
                    </p>
                    <p className="text-slate-500 text-sm">
                      of {formatCurrency(config.NEW_KEKE_COST)} needed
                    </p>
                  </div>
                  
                  <div className="w-full bg-dark-200 rounded-full h-3 mb-4">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all duration-500"
                      style={{ width: `${Math.min(investmentStats.nextPurchaseProgress, 100)}%` }}
                    />
                  </div>

                  {canPurchase ? (
                    <button 
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full btn-primary py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                      disabled={!userIsAdmin}
                      title={!userIsAdmin ? 'Only admins can purchase Kekes' : ''}
                    >
                      <PartyPopper className="w-5 h-5" />
                      {userIsAdmin ? `Purchase Keke #${kekes.length + 1}` : 'Contact Admin to Purchase'}
                    </button>
                  ) : (
                    <p className="text-slate-400 text-sm">
                      {investmentStats.currentWeeklyIncome > 0 
                        ? `Estimated ${Math.ceil((config.NEW_KEKE_COST - investmentStats.cumulativeSavings) / investmentStats.currentWeeklyIncome)} weeks to go`
                        : 'Log payments to track progress'
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Countdown Card */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-400" />
                Time to Next Purchase
              </h2>
              
              <Countdown 
                targetAmount={config.NEW_KEKE_COST}
                currentAmount={investmentStats.cumulativeSavings}
                weeklyIncome={investmentStats.currentWeeklyIncome || config.OLD_KEKE_WEEKLY * config.START_KEKES}
              />
            </div>

            {/* Payment History */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-primary-400" />
                Payment History
                {userIsAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full">
                    Admin Mode
                  </span>
                )}
              </h2>
              
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No payments logged yet</p>
                  <p className="text-slate-500 text-sm">Click "Log Payment" to record weekly income</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {displayedPayments.map((payment, idx) => (
                      <PaymentHistoryItem 
                        key={payment.docId || idx} 
                        payment={payment} 
                        isAdmin={userIsAdmin}
                        onDelete={(p) => { setPaymentToDelete(p); setShowDeleteModal(true); }}
                      />
                    ))}
                  </div>
                  
                  {payments.length > 5 && (
                    <button
                      onClick={() => setShowAllPayments(!showAllPayments)}
                      className="w-full mt-4 py-2 text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      {showAllPayments ? (
                        <>Show Less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Show All ({payments.length}) <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Collaborators Card - Shows ownership and payment status */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                Collaborators & Ownership
              </h2>
              
              {/* Collaborator Cards with Ownership */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {config.COLLABORATORS.map((collab) => {
                  const paymentInfo = collaboratorPayments[collab.id];
                  const hasLoggedThisWeek = payments.some(
                    p => p.weekNumber === currentWeek && 
                    p.loggedBy?.toLowerCase().includes(collab.name.toLowerCase().split(' ').pop()) &&
                    !p.isPurchase
                  );
                  const isNextForPurchase = nextKekeOwner?.id === collab.id;
                  
                  return (
                    <div key={collab.id} className={`rounded-xl p-4 ${hasLoggedThisWeek ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${collab.gradient} flex items-center justify-center text-white font-bold relative flex-shrink-0`}>
                          {collab.initial}
                          {hasLoggedThisWeek && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium truncate">{collab.name}</p>
                            {isNextForPurchase && canPurchase && (
                              <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full whitespace-nowrap">
                                Next Owner
                              </span>
                            )}
                          </div>
                          
                          {/* Owned Kekes */}
                          {paymentInfo?.ownedKekes?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {paymentInfo.ownedKekes.map(kekeId => (
                                <span key={kekeId} className="px-2 py-0.5 bg-gold-500/20 text-gold-300 text-xs rounded">
                                  🛺 Keke #{kekeId}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Payment Breakdown */}
                          <div className="text-xs text-slate-400 space-y-0.5">
                            <div className="flex justify-between">
                              <span>Base (shared):</span>
                              <span>₦{(paymentInfo?.basePayment || 75000).toLocaleString()}</span>
                            </div>
                            {paymentInfo?.newKekePayment > 0 && (
                              <div className="flex justify-between text-gold-400">
                                <span>Owned Kekes:</span>
                                <span>₦{paymentInfo.newKekePayment.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-white pt-1 border-t border-white/10">
                              <span>Weekly Total:</span>
                              <span className="text-primary-400">₦{(paymentInfo?.totalPayment || 75000).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Week Status */}
                      <div className={`mt-3 pt-2 border-t border-white/10 text-center text-sm ${hasLoggedThisWeek ? 'text-primary-400' : 'text-slate-500'}`}>
                        {isHolidayWeek(currentWeek) ? '🎄 Holiday Week' : (hasLoggedThisWeek ? '✓ Week ' + currentWeek + ' Paid' : '○ Week ' + currentWeek + ' Pending')}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Week Summary */}
              <div className="bg-dark-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Week {currentWeek} Collection:</span>
                  <span className="text-white font-semibold">
                    ₦{new Intl.NumberFormat('en-NG').format(
                      payments.filter(p => p.weekNumber === currentWeek && !p.isPurchase && p.amount > 0).reduce((sum, p) => sum + p.amount, 0)
                    )} / ₦{new Intl.NumberFormat('en-NG').format(
                      Object.values(collaboratorPayments).reduce((sum, cp) => sum + (cp?.totalPayment || 75000), 0)
                    )}
                  </span>
                </div>
                <div className="w-full bg-dark-300 rounded-full h-2">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all duration-500"
                    style={{ 
                      width: `${Math.min(
                        (payments.filter(p => p.weekNumber === currentWeek && !p.isPurchase && p.amount > 0).reduce((sum, p) => sum + p.amount, 0) / 
                        Object.values(collaboratorPayments).reduce((sum, cp) => sum + (cp?.totalPayment || 75000), 0)) * 100, 
                        100
                      )}%` 
                    }}
                  />
                </div>
              </div>
              
              {/* Rotation Info */}
              {canPurchase && nextKekeOwner && (
                <div className="bg-gold-500/10 rounded-xl p-4 mb-4">
                  <p className="text-gold-400 text-sm font-medium flex items-center gap-2">
                    <span>🛺</span>
                    Next Keke (#{kekes.length + 1}) will be assigned to: <strong>{nextKekeOwner.name}</strong>
                  </p>
                </div>
              )}
              
              {/* Goal Summary */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">When 12 Kekes achieved:</span>
                  <span className="text-gold-400 font-semibold">
                    3 Kekes each (₦375,000/week total)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="glass-card rounded-2xl p-6 h-fit">
            <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              Keke Timeline
            </h2>
            
            <div className="max-h-[600px] overflow-y-auto pr-2">
              {kekes.map((keke, index) => (
                <TimelineItem 
                  key={keke.id} 
                  keke={keke} 
                  isLast={index === kekes.length - 1}
                  currentWeek={currentWeek}
                />
              ))}
              
              {kekes.length < config.TARGET_KEKES && (
                <div className="relative pl-8 pt-2">
                  <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-600">
                    <Plus className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="glass-card rounded-xl p-4 border-2 border-dashed border-slate-700">
                    <p className="text-slate-500 text-sm">
                      Next Keke: #{kekes.length + 1}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {canPurchase 
                        ? 'Ready to purchase!' 
                        : `${Math.round(investmentStats.nextPurchaseProgress)}% funded`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <LogPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleLogPayment}
        currentWeek={currentWeek}
        loading={actionLoading}
        loggedWeeks={loggedWeeks}
        userDisplayName={userProfile?.displayName || currentUser?.email}
        expectedPayment={(() => {
          // Try to match current user to a collaborator to get their expected payment
          const userName = (userProfile?.displayName || '').toLowerCase();
          for (const collab of config.COLLABORATORS) {
            const collabKey = collab.name.toLowerCase().split(' ').pop(); // Get last word (e.g., "dayo", "itunu")
            if (userName.includes(collabKey) || userName.includes(collab.id)) {
              return collaboratorPayments[collab.id]?.totalPayment || 75000;
            }
          }
          return 75000; // Default base payment
        })()}
      />

      <PurchaseKekeModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onConfirm={handlePurchaseKeke}
        kekeNumber={kekes.length + 1}
        loading={actionLoading}
        nextOwner={nextKekeOwner}
        collaborators={config.COLLABORATORS}
      />

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userProfile={userProfile}
        onSave={handleSaveProfile}
        loading={actionLoading}
      />

      <AdminPanelModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        allUsers={allUsers}
        onUpdateRole={handleUpdateRole}
        currentUserEmail={userProfile?.email}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPaymentToDelete(null); }}
        onConfirm={handleDeletePayment}
        payment={paymentToDelete}
        loading={actionLoading}
      />
    </div>
  );
}
