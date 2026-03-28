import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, isLocalAuth, switchToLocalAuth, switchToSupabaseAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          // Handle rate limit error specifically
          if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
            setError('Sign-up temporarily limited. Please wait 5-10 minutes or contact support to verify your account manually.');
          } else if (error.message.includes('already registered')) {
            setError('This email is already registered. Please try logging in instead.');
          } else {
            setError(error.message);
          }
        } else {
          setSuccessMessage('Account created! Please check your email for verification, then login.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before logging in.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] p-4 relative overflow-hidden">
      {/* Bull and Bear Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/bull-bear-trading.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3
        }}
      />
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/70 to-transparent" />
      
      <div className="w-full max-w-md bg-[#161B22]/90 border border-[#30363D] rounded-xl p-8 shadow-lg relative z-10 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-white mb-2">
          {isSignUp ? 'Sign Up' : 'Login'} to Trading Journal
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          {isSignUp ? 'Create your account to get started.' : 'Enter your credentials to continue.'}
        </p>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-700 rounded-lg text-green-300 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200"
              placeholder="e.g. trader@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-gray-200"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>

          <div className="text-center mt-4 text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Login here
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Sign up here
                </button>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-400 hover:text-blue-300 underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
