import React from 'react';
import type { CGPAResult, SemesterResult } from '../types/curriculum';
import { format2Decimals } from '../utils/calculation';
import { Award, CheckCircle2, AlertCircle, Sparkles, Percent } from 'lucide-react';

interface DashboardProps {
  cgpaResult: CGPAResult;
  semesterResults: SemesterResult[];
  activeSemester: number;
  onSelectSemester: (semNumber: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cgpaResult,
  semesterResults,
  activeSemester,
  onSelectSemester,
}) => {
  const { cgpa, totalCredits, completedSemestersCount, isFullyCompleted, totalSemestersCount, totalObtainedMarks, totalMaxMarks, overallPercentage } = cgpaResult;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-blue-900/40 relative overflow-hidden mb-8 no-print">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h2 className="text-xs sm:text-sm font-bold tracking-widest text-blue-200 uppercase">
              CGPA DASHBOARD
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {completedSemestersCount} of {totalSemestersCount} Semesters Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Hero CGPA Display Box */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-white/10 flex flex-col items-center justify-center text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
              {isFullyCompleted ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  Final CGPA
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-blue-400" />
                  Current CGPA
                </>
              )}
            </span>
            
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white my-2 font-mono drop-shadow-sm">
              {format2Decimals(cgpa)}
            </div>

            {/* Overall Percentage & Marks Badge */}
            <div className="flex items-center gap-2 flex-wrap justify-center mt-1">
              <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-400/30">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>Overall: {format2Decimals(overallPercentage)}%</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-200 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-400/20">
                <span>Marks: <strong className="text-white font-mono">{totalObtainedMarks}/{totalMaxMarks}</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2 font-mono">
              Credits Completed: <strong className="text-white">{totalCredits}</strong>
            </div>
          </div>

          {/* Semester SGPAs Grid */}
          <div className="lg:col-span-7">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Semester Overview & Percentage
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {semesterResults.map((sem) => {
                const isActive = sem.semesterNumber === activeSemester;

                return (
                  <button
                    key={sem.semesterNumber}
                    onClick={() => onSelectSemester(sem.semesterNumber)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${
                      isActive
                        ? 'bg-blue-600/30 border-blue-400/80 ring-2 ring-blue-500/50 shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                      <span>Sem {sem.semesterNumber}</span>
                      {sem.isComplete ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : sem.enteredSubjectCount > 0 ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600" />
                      )}
                    </div>

                    <div className="text-lg sm:text-xl font-bold font-mono text-white">
                      {format2Decimals(sem.sgpa)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1 font-mono">
                      <span>{sem.percentage !== null ? `${format2Decimals(sem.percentage)}%` : '--'}</span>
                      <span className="text-slate-400">{sem.totalObtainedMarks}/{sem.totalMaxMarks}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
