import React from 'react';
import { Calculator, Award, Save, RefreshCw, Printer, User } from 'lucide-react';
import type { StudentInfo } from '../types/curriculum';

interface HeaderProps {
  studentInfo: StudentInfo;
  onUpdateStudentInfo: (info: StudentInfo) => void;
  onResetSemester: () => void;
  onResetAll: () => void;
  onOpenResultModal: () => void;
  onOpenOnboarding?: () => void;
  isSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  studentInfo,
  onResetSemester,
  onResetAll,
  onOpenResultModal,
  onOpenOnboarding,
  isSaved,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  SGPA & CGPA Calculator
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Award className="w-3 h-3" /> B.Sc. CS & Data Analytics
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Enter your marks. Get your SGPA and CGPA instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Save className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">Your progress is saved on this device.</span>
              <span className="sm:hidden">Auto-saved</span>
            </div>

            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="Edit Student Details"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{studentInfo.name ? studentInfo.name : 'Student Info'}</span>
            </button>

            <button
              onClick={onOpenResultModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>View Transcript</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={onResetSemester}
                className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                title="Reset active semester marks"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Reset Sem</span>
              </button>
              <button
                onClick={onResetAll}
                className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors"
                title="Reset all 6 semesters"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
