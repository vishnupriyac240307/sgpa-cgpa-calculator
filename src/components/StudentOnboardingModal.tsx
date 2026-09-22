import React from 'react';
import type { StudentInfo } from '../types/curriculum';
import { loadFromCloudStorage } from '../utils/cloudSync';
import { Award, User, CreditCard, ArrowRight, Cloud, CloudDownload, Loader2 } from 'lucide-react';

interface StudentOnboardingModalProps {
  isOpen: boolean;
  onSubmit: (info: StudentInfo, loadedCloudData?: any) => void;
  initialInfo?: StudentInfo;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  isOpen,
  onSubmit,
  initialInfo,
}) => {
  const [name, setName] = React.useState(initialInfo?.name || '');
  const [registerNo, setRegisterNo] = React.useState(initialInfo?.registerNo || '');
  const [error, setError] = React.useState<string | null>(null);
  const [isSearchingCloud, setIsSearchingCloud] = React.useState(false);
  const [cloudFoundMsg, setCloudFoundMsg] = React.useState<string | null>(null);
  const [fetchedCloudData, setFetchedCloudData] = React.useState<any | null>(null);

  if (!isOpen) return null;

  const handleCheckCloud = async (regStr: string) => {
    const trimmed = regStr.trim();
    if (trimmed.length < 3) return;

    setIsSearchingCloud(true);
    setCloudFoundMsg(null);

    const cloudData = await loadFromCloudStorage(trimmed);
    setIsSearchingCloud(false);

    if (cloudData) {
      setFetchedCloudData(cloudData);
      if (cloudData.studentName && !name) {
        setName(cloudData.studentName);
      }
      setCloudFoundMsg(`Found saved cloud profile for ${cloudData.studentName || trimmed}!`);
    } else {
      setFetchedCloudData(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !registerNo.trim()) {
      setError('Please enter your Name or Register Number');
      return;
    }

    setError(null);
    onSubmit(
      {
        name: name.trim() || fetchedCloudData?.studentName || 'Student',
        registerNo: registerNo.trim(),
      },
      fetchedCloudData
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative">
        <div className="bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 p-6 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Cross-Device SGPA & CGPA
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Access your marks & transcript from any phone, laptop, or tablet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div className="text-center mb-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Enter Student Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your Register Number to auto-load your marks on any device
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Register Number *</span>
              {isSearchingCloud && (
                <span className="text-[10px] text-blue-600 flex items-center gap-1 font-normal">
                  <Loader2 className="w-3 h-3 animate-spin" /> Checking Cloud...
                </span>
              )}
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. 2428B0365"
                value={registerNo}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegisterNo(val);
                  if (error) setError(null);
                  handleCheckCloud(val);
                }}
                className="w-full text-sm font-mono font-bold pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {cloudFoundMsg && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2 animate-fade-in">
              <CloudDownload className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{cloudFoundMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Vishnu Priya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs font-medium text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{fetchedCloudData ? 'Load Cloud Profile & Open Dashboard' : 'Open Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 mt-2">
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>Marks sync automatically across all your devices</span>
          </p>
        </form>
      </div>
    </div>
  );
};
