import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Truck } from 'lucide-react';

export default function Login() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, ''));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-sm w-full animate-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-kingdom-green/20 flex items-center justify-center mx-auto mb-3">
            <Truck className="w-8 h-8 text-kingdom-green" />
          </div>
          <h1 className="text-xl font-bold text-white">Kingdom Transport</h1>
          <p className="text-gray-400 text-sm mt-1">Investment Collaboration System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <input
              type="text"
              placeholder="Your name (e.g., Dr. Itunu)"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Please wait...' : (
              <>
                {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isSignup ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsSignup(!isSignup); setError(''); }}
            className="text-kingdom-green font-medium"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
