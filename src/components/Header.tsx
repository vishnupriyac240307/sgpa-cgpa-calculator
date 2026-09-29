import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Award, User as UserIcon, LogOut, LayoutDashboard, Edit3, ChevronDown, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type PageView = 'dashboard' | 'marks' | 'profile';

interface HeaderProps {
  activeView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenTranscript?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, onOpenTranscript }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and App Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  SGPA & CGPA Calculator
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Award className="w-3 h-3" /> B.Sc. CS & Data Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Academic Transcript & CGPA Management Portal
              </p>
            </div>
          </div>

          {/* Navigation & Profile */}
          {user && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Navigation Links */}
              <nav className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activeView === 'dashboard'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </button>

                <button
                  onClick={() => onNavigate('marks')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                    activeView === 'marks'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Marks</span>
                </button>

                {onOpenTranscript && (
                  <button
                    onClick={onOpenTranscript}
                    className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Transcript</span>
                  </button>
                )}
              </nav>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.username.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate font-semibold text-slate-800">
                    {user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.username}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('marks');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      Edit Marks
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Profile
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
