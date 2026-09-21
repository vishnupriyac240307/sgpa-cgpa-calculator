import React from 'react';
import type { SemesterResult } from '../types/curriculum';
import { format2Decimals } from '../utils/calculation';
import { CheckCircle2, Clock, Calculator } from 'lucide-react';

interface SGPAResultProps {
  semesterResult: SemesterResult;
}

export const SGPAResult: React.FC<SGPAResultProps> = ({ semesterResult }) => {
  const { sgpa, totalCredits, totalWeightedPoints, completedCredits, isComplete, enteredSubjectCount, totalIncludedSubjects } =
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

            <div className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight mt-1">
              {format2Decimals(sgpa)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:w-auto">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Total Credits
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
              {isComplete ? totalCredits : `${completedCredits} / ${totalCredits}`}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Total Weighted Points
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-700">
              {format2Decimals(totalWeightedPoints)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
