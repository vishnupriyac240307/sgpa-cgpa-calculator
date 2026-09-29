import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { Semester, CGPAResult, SemesterResult } from '../types/curriculum';
import { calculateSGPA, calculateCGPA, format2Decimals } from '../utils/calculation';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit3,
  LogOut,
  HelpCircle,
  Calculator,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  semesters: Semester[];
  onNavigateToMarks: (semNumber?: number) => void;
  onOpenTranscript?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  semesters,
  onNavigateToMarks,
  onOpenTranscript,
}) => {
  const { user, logout } = useAuth();

  // Calculate SGPA for each semester
  const semesterResults: SemesterResult[] = semesters.map((sem) =>
    calculateSGPA(sem.subjects, sem.number)
  );

  // Calculate overall CGPA across all semesters
  const cgpaResult: CGPAResult = calculateCGPA(semesters);

  const completedSemestersCount = semesterResults.filter((sr) => sr.isComplete).length;
  const totalCompletedCredits = cgpaResult.totalCredits;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-blue-100 mb-3">
              <Award className="w-3.5 h-3.5" /> Student Academic Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {user?.username}!
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-1 max-w-2xl">
              Track your semester grades, view your cumulative CGPA performance, and view your official transcript.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigateToMarks(1)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm shadow-md transition cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Enter / Edit Marks</span>
            </button>

            {onOpenTranscript && (
              <button
                onClick={onOpenTranscript}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-medium text-sm backdrop-blur-md border border-white/20 transition cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Transcript</span>
              </button>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-medium text-sm backdrop-blur-md border border-red-300/30 transition cursor-pointer"
              title="Logout from your account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Result Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current CGPA */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CURRENT CGPA
            </p>
            <p className="text-4xl font-black text-blue-600 mt-2">
              {format2Decimals(cgpaResult.cgpa)}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              {cgpaResult.overallPercentage !== null
                ? `Overall Percentage: ${format2Decimals(cgpaResult.overallPercentage)}%`
                : 'Cumulative Grade Point Average'}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
        </div>

        {/* Completed Credits */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Credits
            </p>
            <p className="text-4xl font-black text-emerald-600 mt-2">
              {totalCompletedCredits}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Total Included Academic Credits Earned
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
        </div>

        {/* Completed Semesters */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Semesters
            </p>
            <p className="text-4xl font-black text-indigo-600 mt-2">
              {completedSemestersCount} <span className="text-xl font-normal text-slate-400">/ 6</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {completedSemestersCount === 6
                ? 'All 6 Semesters Completed'
                : `${6 - completedSemestersCount} Semester(s) Remaining`}
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Semester Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Semester Overview
          </h2>
          <button
            onClick={() => onNavigateToMarks(1)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Edit Marks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((sem) => {
            const result = semesterResults.find((r) => r.semesterNumber === sem.number);
            const isCompleted = result?.isComplete ?? false;

            return (
              <div
                key={sem.number}
                onClick={() => onNavigateToMarks(sem.number)}
                className={`rounded-2xl p-6 border transition shadow-sm hover:shadow-md cursor-pointer ${
                  isCompleted
                    ? 'bg-white border-slate-200 hover:border-blue-300'
                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Semester {sem.number}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Not Completed
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">SGPA</span>
                    <span className="text-2xl font-black text-slate-900">
                      {format2Decimals(result?.sgpa)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-100 pt-2">
                    <span>Credits</span>
                    <span className="font-semibold text-slate-800">
                      {result?.completedCredits || 0} / {result?.totalCredits || 0}
                    </span>
                  </div>

                  {result?.percentage !== null && result?.percentage !== undefined && (
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Percentage</span>
                      <span className="font-semibold text-blue-700">
                        {format2Decimals(result.percentage)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How your CGPA is calculated Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              How your CGPA is calculated
            </h2>
            <p className="text-xs text-slate-500">
              Dynamic calculation breakdown based on your actual entered marks
            </p>
          </div>
        </div>

        {completedSemestersCount === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-medium">No completed semesters yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Enter your subject marks for a semester to view the step-by-step CGPA calculation breakdown.
            </p>
            <button
              onClick={() => onNavigateToMarks(1)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              Enter Marks Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 sm:p-6 space-y-3 font-mono text-sm border border-slate-200/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans mb-2">
                Semester Breakdown:
              </p>

              {semesterResults
                .filter((r) => r.isComplete && r.sgpa !== null)
                .map((r) => {
                  const sgpaFormatted = format2Decimals(r.sgpa);
                  const weightedFormatted = r.totalWeightedPoints.toFixed(2);
                  return (
                    <div
                      key={r.semesterNumber}
                      className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-200/40 last:border-0"
                    >
                      <span>
                        Semester {r.semesterNumber}: {sgpaFormatted} × {r.completedCredits} credits
                      </span>
                      <span className="font-semibold text-slate-900">
                        = {weightedFormatted}
                      </span>
                    </div>
                  );
                })}

              <div className="pt-3 border-t-2 border-slate-300 space-y-2 font-sans">
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Total Weighted Points:</span>
                  <span className="font-bold text-slate-900">
                    {cgpaResult.totalWeightedPoints.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-700">
                  <span>Total Completed Credits:</span>
                  <span className="font-bold text-slate-900">
                    {cgpaResult.totalCredits}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-blue-700 pt-2 border-t border-slate-200">
                  <span>Current CGPA:</span>
                  <span>
                    {cgpaResult.totalWeightedPoints.toFixed(2)} / {cgpaResult.totalCredits} ={' '}
                    <span className="text-xl underline decoration-blue-500 underline-offset-4">
                      {format2Decimals(cgpaResult.cgpa)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <strong className="text-blue-900">Precision Note:</strong> CGPA is calculated internally using full-precision unrounded subject grade points ((Marks / Max Marks) × 10 × Credits) divided by total credits. Displayed SGPA values are rounded to 2 decimal places.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
