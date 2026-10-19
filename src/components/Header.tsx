import React from 'react';
import { Calculator, Award, Save, RefreshCw, Printer, User, LogOut } from 'lucide-react';
import type { StudentInfo } from '../types/curriculum';
import type { StarUser } from '../types/auth';

interface HeaderProps {
  studentInfo: StudentInfo;
  currentUser?: StarUser | null;
  onResetSemester: () => void;
  onResetAll: () => void;
  onOpenResultModal: () => void;
  onOpenOnboarding: () => void;
  onLogout: () => void;
  isSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  studentInfo,
  currentUser,
  onResetSemester,
  onResetAll,
  onOpenResultModal,
  onOpenOnboarding,
  onLogout,
  isSaved,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* App Title & Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#15803d] to-[#16a34a] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  SGPA & CGPA Calculator
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803d] border border-emerald-200">
                  <Award className="w-3 h-3" /> B.Sc. CS & Data Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Credit-Weighted Semester Grade & Cumulative GPA Portal
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Save className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">Auto-saved to your account</span>
              <span className="sm:hidden">Saved</span>
            </div>

            {/* User Profile Pill */}
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title="Edit Profile Info"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-800">
                {studentInfo.name || currentUser?.name || 'Student Info'}
              </span>
              {currentUser?.registerNo && (
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-slate-600 font-mono border border-slate-200">
                  {currentUser.registerNo}
                </span>
              )}
            </button>

            {/* Transcript Modal Button */}
            <button
              onClick={onOpenResultModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-[#15803d] hover:bg-[#166534] shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Transcript</span>
            </button>

            {/* Reset Semester & All */}
            <div className="flex items-center gap-1">
              <button
                onClick={onResetSemester}
                className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset active semester marks"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span className="hidden sm:inline">Reset Sem</span>
              </button>
              <button
                onClick={onResetAll}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                title="Reset all 6 semesters"
              >
                Reset All
              </button>
            </div>

            {/* Log Out Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
