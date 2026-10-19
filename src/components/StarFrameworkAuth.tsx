import React, { useState } from 'react';
import type { UserRole, StarUser } from '../types/auth';
import { loginUser, registerUser } from '../utils/authStorage';
import { Eye, EyeOff, Check, GraduationCap, Building2 } from 'lucide-react';

interface StarFrameworkAuthProps {
  onLoginSuccess: (user: StarUser) => void;
}

export const StarFrameworkAuth: React.FC<StarFrameworkAuthProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [username, setUsername] = useState('vishnupriya.28b24@kprcas.ac.in');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up specific fields
  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & error states
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!username.trim()) {
        setError('Please enter a username or college email');
        return;
      }
      if (!password) {
        setError('Please enter a password');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const res = registerUser({
        username,
        name,
        registerNo: registerNo || '24UDA001',
        role,
        password,
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Failed to create account');
        return;
      }

      onLoginSuccess(res.user);
    } else {
      if (!username.trim()) {
        setError('Invalid email/username or password');
        return;
      }

      const res = loginUser({
        username,
        password,
        role,
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Invalid email/username or password');
        return;
      }

      onLoginSuccess(res.user);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError(null);
    if (!isSignUp) {
      if (newRole === 'student') {
        setUsername('vishnupriya.28b24@kprcas.ac.in');
      } else {
        setUsername('faculty.csda@kprcas.ac.in');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f6f9f6] bg-[radial-gradient(#86efac_1.5px,transparent_1.5px)] [background-size:24px_24px] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-6">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: STAR FRAMEWORK Branding & KPRCAS Logo */}
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center bg-white border-b md:border-b-0 md:border-r border-slate-100">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-[#15803d] mb-6">
              STAR <span className="text-[#16a34a]">FRAMEWORK</span>
            </h1>

            {/* Official KPR College Logo and Ribbon Mark */}
            <div className="flex items-center gap-4 my-2 text-left">
              {/* SVG Ribbon Flower Icon */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <svg
                  className="w-14 h-14"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Blue Loops */}
                  <path
                    d="M 50,50 C 30,20 10,35 25,60 C 35,75 50,50 50,50 Z"
                    fill="#1e3a8a"
                  />
                  <path
                    d="M 50,50 C 20,60 30,85 55,75 C 70,70 50,50 50,50 Z"
                    fill="#2563eb"
                  />
                  {/* Green Loops */}
                  <path
                    d="M 50,50 C 65,20 85,35 75,60 C 65,75 50,50 50,50 Z"
                    fill="#15803d"
                  />
                  <path
                    d="M 50,50 C 70,55 65,85 45,75 C 35,70 50,50 50,50 Z"
                    fill="#16a34a"
                  />
                </svg>
                <span className="text-[9px] font-bold text-[#1e3a8a] tracking-tight mt-0.5">
                  Learn Beyond
                </span>
              </div>

              {/* College Information */}
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                  KPR College of Arts
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                  Science and Research
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">
                  Avinashi Road, Arasur, Coimbatore.
                </div>
              </div>
            </div>

            {/* College Tagline */}
            <p className="mt-8 text-[11px] sm:text-xs font-semibold tracking-widest text-slate-600 uppercase border-t border-slate-100 pt-6 w-full">
              LEARN &nbsp;|&nbsp; GROW &nbsp;|&nbsp; ACHIEVE &nbsp;|&nbsp; BEYOND
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
                  ? 'Create Your Star Framework Account'
                  : 'Access Your Star Framework Account'}
              </p>
            </div>

            {/* Role Selector Cards (Student / Faculty) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Student Role */}
              <button
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                  role === 'student'
                    ? 'border-2 border-[#16a34a] bg-[#f0fdf4] text-[#15803d] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                {role === 'student' && (
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#16a34a] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm">Student</span>
              </button>

              {/* Faculty Role */}
              <button
                type="button"
                onClick={() => handleRoleChange('faculty')}
                className={`relative flex flex-col items-center justify-center py-4 px-3 rounded-xl border transition-all cursor-pointer ${
                  role === 'faculty'
                    ? 'border-2 border-[#16a34a] bg-[#f0fdf4] text-[#15803d] font-bold shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                {role === 'faculty' && (
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#16a34a] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm">Faculty</span>
              </button>
            </div>

            {/* Error Banner matching the exact screenshot styling */}
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
                      Roll Number / Register No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 24UDA001"
                      value={registerNo}
                      onChange={(e) => setRegisterNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                    />
                  </div>
                </>
              )}

              {/* Username Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vishnupriya.28b24@kprcas.ac.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] text-slate-900 text-sm transition"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                  Password
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
                    Confirm Password
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
                className="w-full mt-2 py-3 px-4 bg-[#1e7e34] hover:bg-[#15803d] text-white font-bold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSignUp ? 'Create Account' : 'Log In'}</span>
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
