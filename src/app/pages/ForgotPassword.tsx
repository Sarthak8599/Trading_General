import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const CREDENTIALS_KEY_USERNAME = 'traderUsername';
const CREDENTIALS_KEY_PASSWORD = 'traderPassword';

const getStoredUsername = () => localStorage.getItem(CREDENTIALS_KEY_USERNAME) || 'trader';
const getStoredPassword = () => localStorage.getItem(CREDENTIALS_KEY_PASSWORD) || 'password';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    // Only allow reset for known user (or create the first user)
    const storedUsername = getStoredUsername();
    if (storedUsername && username.trim() !== storedUsername && storedUsername !== 'trader') {
      setError('Username does not match existing account');
      return;
    }

    localStorage.setItem(CREDENTIALS_KEY_USERNAME, username.trim());
    localStorage.setItem(CREDENTIALS_KEY_PASSWORD, newPassword);
    setMessage('Password reset successful. Please log in with your new password.');

    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] p-4">
      <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-sm text-gray-400 mb-6">Enter your username and set a new password.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1" htmlFor="forgot-username">Username</label>
            <input
              id="forgot-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200"
              placeholder={getStoredUsername()}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200"
              placeholder="New password"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200"
              placeholder="Confirm password"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          <button type="submit" className="w-full py-2 mt-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg">
            Reset Password
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          <span>Remembered your password? </span>
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </div>
      </div>
    </div>
  );
}
