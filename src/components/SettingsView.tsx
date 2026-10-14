import React, { useState, useRef } from "react";
import { 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Trash2, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Zap
} from "lucide-react";
import { AppSettings } from "../types";
import { StorageService } from "../utils/storage";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onDataReload: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReload,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleToggleAnimations = () => {
    onUpdateSettings({ ...settings, animationsEnabled: !settings.animationsEnabled });
  };

  const handleExportData = () => {
    const jsonString = StorageService.exportAllData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `recall_study_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = StorageService.importAllData(content);
        setImportStatus(result);
        if (result.success) {
          onDataReload();
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetConfirmed = () => {
    StorageService.resetAllData();
    setShowResetConfirm(false);
    onDataReload();
    setImportStatus({
      success: true,
      message: "Study data successfully reset to default sample set.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-sm text-[#716982] dark:text-[#A8A1BA]">
          Customize your study experience, manage your backup data, and view streak records.
        </p>
      </div>

      {/* Notifications / Import status banner */}
      {importStatus && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
          importStatus.success
            ? "bg-[#F0FDF4] dark:bg-[#143823] text-[#166534] dark:text-[#86EFAC] border border-[#BBF7D0]"
            : "bg-[#FEF2F2] dark:bg-[#3C1818] text-[#991B1B] dark:text-[#FCA5A5] border border-[#FECACA]"
        }`}>
          {importStatus.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{importStatus.success ? "Backup Restored" : "Import Error"}</p>
            <p className="mt-0.5">{importStatus.message}</p>
          </div>
        </div>
      )}

      {/* Appearance Section */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-5">
        <h2 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6]">
          Appearance & Motion
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-sm text-[#272334] dark:text-[#FAF9F6] block">
              Color Theme
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">
              Switch between gentle warm off-white and cozy dark theme
            </span>
          </div>

          <button
            onClick={handleToggleTheme}
            className="px-4 py-2 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] text-xs font-semibold text-[#272334] dark:text-[#FAF9F6] flex items-center gap-2 cursor-pointer hover:bg-[#EDE9FE] transition-colors"
          >
            {settings.theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-[#FDE047]" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#8B5CF6]" />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE1] dark:border-[#2D2744]">
          <div>
            <span className="font-semibold text-sm text-[#272334] dark:text-[#FAF9F6] block">
              Card Flip & Smooth Animations
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">
              Interactive 3D card flipping and gentle screen transitions
            </span>
          </div>

          <button
            onClick={handleToggleAnimations}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.animationsEnabled ? "bg-[#7C3AED]" : "bg-[#EAE6DF] dark:bg-[#342E4A]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                settings.animationsEnabled ? "left-6.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Streak & Consistency */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6] flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#F59E0B] fill-current" />
          <span>Active Streak Records</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">Current Daily Streak</span>
            <span className="text-2xl font-extrabold text-[#D97706] dark:text-[#FBBF24] block mt-1 tabular-nums">
              {settings.streak.currentStreak} days
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">Best Record</span>
            <span className="text-2xl font-extrabold text-[#7C3AED] dark:text-[#C4B5FD] block mt-1 tabular-nums">
              {settings.streak.bestStreak} days
            </span>
          </div>
        </div>
      </section>

      {/* Data Backup & Restore */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-4">
        <h2 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6]">
          Data Portability & Backup
        </h2>
        <p className="text-xs text-[#716982] dark:text-[#A8A1BA]">
          All your decks and question review records are saved on your device in localStorage. You can export a JSON backup at any time or restore it on another computer.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] hover:bg-[#DDD6FE] text-[#6D28D9] dark:text-[#DDD6FE] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Data as JSON</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E192D] hover:bg-[#FAF9F6] border border-[#EAE6DF] dark:border-[#342E4A] text-[#544D63] dark:text-[#C4BED4] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import JSON Backup</span>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone: Reset Progress */}
      <section className="p-6 rounded-2xl bg-[#FEF2F2]/60 dark:bg-[#351A1A]/40 border border-[#FECACA] dark:border-[#7F1D1D]/40 space-y-3">
        <h2 className="font-bold text-base text-[#991B1B] dark:text-[#FCA5A5] flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Reset Study Progress</span>
        </h2>
        <p className="text-xs text-[#7F1D1D] dark:text-[#F87171]">
          This will wipe locally stored study sessions and reset the decks back to the initial sample set. This action cannot be undone unless you have an exported backup.
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleResetConfirmed}
              className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold cursor-pointer"
            >
              Confirm Wipe & Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-2 text-xs text-[#716982] dark:text-[#A8A1BA]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#251313] border border-[#FCA5A5] dark:border-[#7F1D1D] text-[#DC2626] dark:text-[#F87171] text-xs font-bold cursor-pointer hover:bg-[#FEF2F2] transition-colors"
          >
            Reset All Data
          </button>
        )}
      </section>
    </div>
  );
};
