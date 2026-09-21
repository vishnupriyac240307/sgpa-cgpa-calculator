import React from 'react';
import type { SemesterResult } from '../types/curriculum';
import { format2Decimals } from '../utils/calculation';
import { CheckCircle2, Clock } from 'lucide-react';

interface SemesterSummaryProps {
  semesterResults: SemesterResult[];
  onSelectSemester: (semNumber: number) => void;
  activeSemester: number;
}

export const SemesterSummary: React.FC<SemesterSummaryProps> = ({
  semesterResults,
  onSelectSemester,
  activeSemester,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 no-print">
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            6-Semester Academic Summary
          </h3>
          <p className="text-xs text-slate-500">
            Overview of completed credits, SGPA, total marks, and percentage by semester
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-3 px-4">Semester</th>
              <th className="py-3 px-4 text-center">Included Credits</th>
              <th className="py-3 px-4 text-center">Total Marks</th>
              <th className="py-3 px-4 text-center">Semester SGPA</th>
              <th className="py-3 px-4 text-center">Percentage</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {semesterResults.map((sem) => {
              const isActive = sem.semesterNumber === activeSemester;

              return (
                <tr
                  key={sem.semesterNumber}
                  onClick={() => onSelectSemester(sem.semesterNumber)}
                  className={`cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-mono">
                      {sem.semesterNumber}
                    </span>
                    <span>Semester {sem.semesterNumber}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                    {sem.isComplete ? sem.totalCredits : `${sem.completedCredits} / ${sem.totalCredits}`}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-800 font-semibold">
                    {sem.totalObtainedMarks} / {sem.totalMaxMarks}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700 text-base">
                    {format2Decimals(sem.sgpa)}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">
                    {sem.percentage !== null ? `${format2Decimals(sem.percentage)}%` : '--'}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {sem.isComplete ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> Incomplete
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
