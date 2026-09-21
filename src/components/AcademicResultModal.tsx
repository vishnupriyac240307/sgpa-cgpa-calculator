import React from 'react';
import type { Semester, SemesterResult, CGPAResult, StudentInfo } from '../types/curriculum';
import { calculateGradePoint, calculateWeightedPoint, format2Decimals } from '../utils/calculation';
import { Printer, Download, X, Award, CheckCircle2, User, School } from 'lucide-react';

interface AcademicResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  semesterResults: SemesterResult[];
  cgpaResult: CGPAResult;
  studentInfo: StudentInfo;
}

export const AcademicResultModal: React.FC<AcademicResultModalProps> = ({
  isOpen,
  onClose,
  semesters,
  semesterResults,
  cgpaResult,
  studentInfo,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const transcriptData = {
      institution: "B.Sc. Computer Science with Data Analytics",
      studentName: studentInfo.name || "Student",
      registerNumber: studentInfo.registerNo || "N/A",
      dateGenerated: new Date().toLocaleDateString(),
      overallCGPA: format2Decimals(cgpaResult.cgpa),
      totalCredits: cgpaResult.totalCredits,
      totalWeightedPoints: format2Decimals(cgpaResult.totalWeightedPoints),
      semesters: semesterResults.map((sem) => ({
        semesterNumber: sem.semesterNumber,
        sgpa: format2Decimals(sem.sgpa),
        completedCredits: sem.completedCredits,
        isComplete: sem.isComplete,
      })),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transcriptData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `academic_transcript_${studentInfo.registerNo || 'result'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print-container">
        
        {/* Modal Action Header (Hidden during Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">
              Academic Result & Official Transcript View
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Print Result Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Result</span>
            </button>

            {/* Download JSON Button */}
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
              title="Download raw JSON data"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download JSON</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE / EXPORTABLE TRANSCRIPT REPORT CONTAINER */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print-scroll-container" id="academic-transcript-report">
          
          {/* Institution & Student Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-widest">
                <School className="w-4 h-4" /> Degree Transcript Report
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                B.Sc. Computer Science with Data Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                6-Semester Degree Credit-Weighted Assessment
              </p>
            </div>

            {/* Student Info Box */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 min-w-[200px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{studentInfo.name || 'Student Name: N/A'}</span>
              </div>
              <div className="text-slate-600 font-mono">
                Reg No: <strong>{studentInfo.registerNo || 'Not Entered'}</strong>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* ACADEMIC RESULT HERO CARD */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800 text-center relative overflow-hidden">
            <span className="text-xs uppercase font-bold tracking-widest text-blue-300 block mb-1">
              YOUR ACADEMIC RESULT
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white my-3">
              {format2Decimals(cgpaResult.cgpa)}
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Credits Earned: <strong>{cgpaResult.totalCredits}</strong></span>
            </div>

            {/* Semester SGPAs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10 text-left">
              {semesterResults.map((sem) => (
                <div key={sem.semesterNumber} className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Semester {sem.semesterNumber}
                  </span>
                  <span className="text-lg font-mono font-bold text-white block mt-0.5">
                    {format2Decimals(sem.sgpa)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {sem.completedCredits} Credits
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED SUBJECT-BY-SUBJECT TRANSCRIPT TABLE */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">
              Semester-wise Detailed Course Performance
            </h3>

            {semesters.map((sem) => {
              const semResult = semesterResults.find((r) => r.semesterNumber === sem.number);
              const includedSubjects = sem.subjects.filter((s) => s.included);

              return (
                <div key={sem.number} className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 p-3 font-bold text-slate-800 flex justify-between items-center border-b border-slate-200">
                    <span>Semester {sem.number}</span>
                    <span className="font-mono text-blue-800">
                      SGPA: {format2Decimals(semResult?.sgpa)} ({semResult?.completedCredits} Credits)
                    </span>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                        <th className="p-2.5">Course Title</th>
                        <th className="p-2.5 text-center">Category</th>
                        <th className="p-2.5 text-center">Max Marks</th>
                        <th className="p-2.5 text-center">Marks Obtained</th>
                        <th className="p-2.5 text-center">Credits</th>
                        <th className="p-2.5 text-center">Grade Point</th>
                        <th className="p-2.5 text-center">Weighted Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {includedSubjects.map((sub) => {
                        const gp = sub.marks !== null ? calculateGradePoint(sub.marks, sub.maxMarks) : null;
                        const wp = sub.marks !== null ? calculateWeightedPoint(sub.marks, sub.maxMarks, sub.credits) : null;

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-sans font-medium text-slate-900">{sub.name}</td>
                            <td className="p-2.5 text-center font-sans text-[10px] text-slate-600">{sub.category}</td>
                            <td className="p-2.5 text-center">{sub.maxMarks}</td>
                            <td className="p-2.5 text-center font-bold text-blue-900">
                              {sub.marks !== null ? sub.marks : '--'}
                            </td>
                            <td className="p-2.5 text-center">{sub.credits}</td>
                            <td className="p-2.5 text-center">{format2Decimals(gp)}</td>
                            <td className="p-2.5 text-center font-bold text-slate-900">{format2Decimals(wp)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
