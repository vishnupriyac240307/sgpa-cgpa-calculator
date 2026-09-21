import React from 'react';
import type { Subject } from '../types/curriculum';
import { calculateGradePoint, calculateWeightedPoint, format2Decimals } from '../utils/calculation';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

interface CalculationInfoProps {
  subjects: Subject[];
}

export const CalculationInfo: React.FC<CalculationInfoProps> = ({ subjects }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const sampleSubject =
    subjects.find((s) => s.included && s.marks !== null) || {
      name: 'Programming in C',
      marks: 82,
      maxMarks: 100,
      credits: 4,
    };

  const sampleMark = sampleSubject.marks !== null ? sampleSubject.marks : 82;
  const sampleGradePoint = calculateGradePoint(sampleMark, sampleSubject.maxMarks);
  const sampleWeightedPoint = calculateWeightedPoint(sampleMark, sampleSubject.maxMarks, sampleSubject.credits);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 no-print">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              How is my SGPA calculated?
            </h3>
            <p className="text-xs text-slate-500">
              Transparent step-by-step credit-weighting formula explanation
            </p>
          </div>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/50 space-y-6 animate-fade-in text-xs sm:text-sm text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Step 1: Grade Point (out of 10)
              </span>
              <p className="text-slate-600 mb-3">
                Converts your obtained mark into a 10-point scale based on the subject's maximum marks.
              </p>
              
              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-lg space-y-1">
                <div className="text-blue-300">Grade Point = (Marks Obtained / Max Marks) × 10</div>
                <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800 flex items-center gap-1">
                  <span>Example ({sampleSubject.name}):</span>
                  <span className="text-white">({sampleMark} / {sampleSubject.maxMarks}) × 10 = </span>
                  <span className="text-emerald-400 font-bold">{format2Decimals(sampleGradePoint)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Step 2: Weighted Point
              </span>
              <p className="text-slate-600 mb-3">
                Multiplies the 10-point Grade Point by the subject's assigned course credits.
              </p>
              
              <div className="bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-lg space-y-1">
                <div className="text-indigo-300">Weighted Point = Grade Point × Credits</div>
                <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800 flex items-center gap-1">
                  <span>Example:</span>
                  <span className="text-white">{format2Decimals(sampleGradePoint)} × {sampleSubject.credits} credits = </span>
                  <span className="text-emerald-400 font-bold">{format2Decimals(sampleWeightedPoint)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
              Step 3: Semester SGPA & Overall CGPA
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-blue-50/80 p-3.5 rounded-lg border border-blue-200 font-mono text-xs text-blue-950">
                <div className="font-bold text-blue-900 mb-1">Semester SGPA Formula:</div>
                <div>SGPA = SUM(Weighted Points of Included Subjects) / SUM(Credits of Included Subjects)</div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
                <div className="font-bold text-emerald-400 mb-1">Overall CGPA Formula:</div>
                <div>CGPA = SUM(All Semesters Weighted Points) / SUM(All Semesters Credits)</div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note on Excluded Subjects:</strong> Language, English, Environmental Studies, Value Education, Naan Mudhalvan, and General electives do not affect SGPA/CGPA calculations as per curriculum regulations.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
