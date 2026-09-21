import React from 'react';
import type { SemesterResult } from '../types/curriculum';
import { format2Decimals } from '../utils/calculation';
import { CheckCircle2, Clock, Calculator, Percent } from 'lucide-react';

interface SGPAResultProps {
  semesterResult: SemesterResult;
}

export const SGPAResult: React.FC<SGPAResultProps> = ({ semesterResult }) => {
  const { sgpa, totalCredits, totalWeightedPoints, completedCredits, isComplete, enteredSubjectCount, totalIncludedSubjects, totalObtainedMarks, totalMaxMarks, percentage } =
    semesterResult;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm mb-8 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Calculator className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Semester {semesterResult.semesterNumber} SGPA
              </span>
              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3 h-3 text-amber-500" /> {enteredSubjectCount}/{totalIncludedSubjects} Entered
                </span>
              )}
            </div>

            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight mt-1 flex items-baseline gap-3">
              <span>{format2Decimals(sgpa)}</span>
              {percentage !== null && (
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Percent className="w-4 h-4" /> {format2Decimals(percentage)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:w-auto">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Credits
            </span>
            <span className="text-base sm:text-xl font-bold font-mono text-slate-800">
              {isComplete ? totalCredits : `${completedCredits}/${totalCredits}`}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Total Marks
            </span>
            <span className="text-base sm:text-xl font-bold font-mono text-slate-900">
              {totalObtainedMarks}/{totalMaxMarks}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Weighted Pts
            </span>
            <span className="text-base sm:text-xl font-bold font-mono text-blue-700">
              {format2Decimals(totalWeightedPoints)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
