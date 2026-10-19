import React, { useState } from 'react';
import type { UserProfile } from '../types/auth';
import { loginApi, registerApi } from '../services/api';
import { Eye, EyeOff, Calculator, Award, Loader2 } from 'lucide-react';

interface StarFrameworkAuthProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const StarFrameworkAuth: React.FC<StarFrameworkAuthProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up specific fields
  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!registerNo.trim()) {
        setError('Please enter your Roll Number / Register Number');
        return;
      }
      if (!username.trim()) {
        setError('Please enter a username or email');
        return;
      }
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      try {
        setIsLoading(true);
        const res = await registerApi({
          name: name.trim(),
          registerNo: registerNo.trim(),
          username: username.trim(),
          password,
          confirmPassword,
        });

        if (res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Failed to create account');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!username.trim()) {
        setError('Please enter your username or register number');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      try {
        setIsLoading(true);
        const res = await loginApi({
          username: username.trim(),
          password,
        });

        if (res.user) {
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } catch (err: any) {
        setError(err.message || 'Invalid username or password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f9f6] bg-[radial-gradient(#86efac_1.5px,transparent_1.5px)] [background-size:24px_24px] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: SGPA AND CGPA CALCULATOR Branding */}
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803d] mb-6 shadow-sm">
              <Calculator className="w-9 h-9" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#15803d] leading-tight mb-4">
              CSDA SGPA AND CGPA CALCULATOR
            </h1>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200 mb-6">
              <Award className="w-3.5 h-3.5" />
              <span>B.Sc. CS & Data Analytics</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
              Instant semester SGPA and cumulative CGPA calculation with secure personal student profile and persistent marks.
            </p>
          </div>

          {/* Right Column: Log in / Sign up Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1e3a8a] tracking-tight">
                {isSignUp ? 'Sign up !' : 'Log in !'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isSignUp
                  ? 'Create Your Calculator Account'
                  : 'Access Your Account'}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] rounded-lg p-3 text-center text-xs sm:text-sm font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vishnu Priya C"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                      Roll Number / Register No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 24UDA001"
                      value={registerNo}
                      onChange={(e) => setRegisterNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 uppercase rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                    />
                  </div>
                </>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Username or Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isSignUp ? "Create a unique username or email" : "Enter username or roll number"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#1e7e34] hover:bg-[#15803d] disabled:opacity-60 text-white font-bold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Log In'}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Log In */}
            <div className="mt-5 text-center text-xs sm:text-sm text-slate-600">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="font-bold text-[#15803d] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError(null);
                    }}
                    className="font-bold text-[#15803d] hover:underline cursor-pointer"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
