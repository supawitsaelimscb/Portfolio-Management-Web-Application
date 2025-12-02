import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { db, auth } from '../services/firebase';
import { otpService } from '../services/otp';
import { OTPModal } from '../components/OTPModal';
import { signOut } from 'firebase/auth';
import { loginRateLimiter, isValidEmail } from '../utils/validation';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check Firebase connection
    const checkConnection = async () => {
      try {
        // Simple check if db is initialized
        setIsDbConnected(!!db);
      } catch {
        setIsDbConnected(false);
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    // Validate email format
    const sanitizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(sanitizedEmail)) {
      setLocalError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // Check rate limiting
    if (!loginRateLimiter.isAllowed(sanitizedEmail)) {
      const remaining = loginRateLimiter.getRemainingAttempts(sanitizedEmail);
      setLocalError('Too many login attempts. Please try again in 15 minutes.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Login with email/password
      await login(sanitizedEmail, password);
      
      // Step 2: Check if user has 2FA enabled
      const user = auth.currentUser;
      if (user) {
        const is2FAEnabled = await otpService.is2FAEnabled(user.uid);
        
        if (is2FAEnabled) {
          // Generate and send OTP
          const otp = otpService.generateOTP();
          await otpService.storeOTP(user.uid, otp);
          await otpService.sendOTPEmail(sanitizedEmail, otp);
          
          // Store user ID and show OTP modal
          setPendingUserId(user.uid);
          setShowOTPModal(true);
          setIsLoading(false);
          
          // Important: Don't navigate yet, wait for OTP verification
          return;
        }
      }
      
      // Reset rate limiter on successful login
      loginRateLimiter.reset(sanitizedEmail);
      
      // If no 2FA, proceed to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string): Promise<boolean> => {
    if (!pendingUserId) return false;
    
    const isValid = await otpService.verifyOTP(pendingUserId, otp);
    if (isValid) {
      setShowOTPModal(false);
      navigate('/dashboard');
      return true;
    }
    return false;
  };

  const handleOTPResend = async () => {
    if (!pendingUserId) return;
    
    const otp = otpService.generateOTP();
    await otpService.storeOTP(pendingUserId, otp);
    await otpService.sendOTPEmail(email, otp);
  };

  const handleOTPClose = async () => {
    // If user closes OTP modal, log them out for security
    setShowOTPModal(false);
    setPendingUserId(null);
    await signOut(auth);
    setLocalError('Login cancelled. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Portfolio Manager
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your investments
            </p>
          </div>

          {/* Error Alert */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <svg className="h-5 w-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{localError}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Database Connection Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isDbConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
              {isDbConnected && (
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {isDbConnected ? 'Database Connected' : 'Database Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        email={email}
        onVerify={handleOTPVerify}
        onClose={handleOTPClose}
        onResend={handleOTPResend}
      />
    </div>
  );
}
