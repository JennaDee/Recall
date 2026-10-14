import React from "react";
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  AlertCircle, 
  Clock, 
  Settings, 
  PlusCircle, 
  Moon, 
  Sun,
  Flame
} from "lucide-react";
import { AppSettings } from "../types";

export type NavTab = "dashboard" | "create" | "library" | "mistakes" | "spaced" | "settings";

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  dueCount: number;
  mistakesCount: number;
  totalDecks: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onToggleTheme,
  dueCount,
  mistakesCount,
}) => {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: Layers },
    { id: "create" as NavTab, label: "Create Set", icon: PlusCircle, highlight: true },
    { id: "library" as NavTab, label: "My Library", icon: BookOpen },
    { 
      id: "spaced" as NavTab, 
      label: "Spaced Review", 
      icon: Clock, 
      badge: dueCount > 0 ? dueCount : undefined 
    },
    { 
      id: "mistakes" as NavTab, 
      label: "Mistakes Bank", 
      icon: AlertCircle, 
      badge: mistakesCount > 0 ? mistakesCount : undefined 
    },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#EAE6DF] dark:border-[#342E4A] bg-[#FFFFFF] dark:bg-[#221E32] p-5 shrink-0 select-none">
        {/* Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-[#F0ECE1] dark:border-[#2D2744]">
          <button 
            onClick={() => onSelectTab("dashboard")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#272334] dark:text-[#FAF9F6]">
                Recall
              </span>
              <p className="text-xs text-[#716982] dark:text-[#A8A1BA]">Active Study & AI</p>
            </div>
          </button>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#716982] dark:text-[#A8A1BA] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B] transition-colors"
          >
            {settings.theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#FDE047]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8B5CF6]" />
            )}
          </button>
        </div>

        {/* Streak Indicator */}
        <div className="mt-4 mb-2 p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] dark:bg-[#451A03] flex items-center justify-center text-[#D97706] dark:text-[#FBBF24]">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
                {settings.streak.currentStreak} day streak
              </span>
              <p className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">Keep it going!</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#8B5CF6] dark:text-[#C4B5FD]">
            Best {settings.streak.bestStreak}d
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#EDE9FE] dark:bg-[#342A5C] text-[#6D28D9] dark:text-[#DDD6FE] font-semibold"
                    : "text-[#544D63] dark:text-[#B3ACCA] hover:bg-[#FAF9F6] dark:hover:bg-[#28223D] hover:text-[#272334] dark:hover:text-[#FFFFFF]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#7C3AED] dark:text-[#C4B5FD]" : "text-[#88819A]"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive 
                      ? "bg-[#7C3AED] text-white" 
                      : "bg-[#F3E8FF] dark:bg-[#3B2D62] text-[#7C3AED] dark:text-[#DDD6FE]"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Practice Notice */}
        <div className="mt-auto pt-4 border-t border-[#F0ECE1] dark:border-[#2D2744]">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FAF5FF] to-[#FDF4FF] dark:from-[#261E3E] dark:to-[#311D3E] border border-[#E9D5FF] dark:border-[#4C1D95]/40 text-xs text-[#581C87] dark:text-[#E9D5FF]">
            <p className="font-semibold text-xs mb-0.5">Zero Restrictions</p>
            <p className="text-[11px] leading-relaxed text-[#7E22CE] dark:text-[#D8B4FE]">
              Unlimited practice retries. No energy or lives limits. Practice as much as you need!
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#EAE6DF] dark:border-[#342E4A] bg-[#FFFFFF] dark:bg-[#221E32] sticky top-0 z-30">
        <button 
          onClick={() => onSelectTab("dashboard")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#272334] dark:text-[#FAF9F6]">
            Recall
          </span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FEF3C7] dark:bg-[#451A03] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24]">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="tabular-nums">{settings.streak.currentStreak}d</span>
          </div>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-[#716982] dark:text-[#A8A1BA] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B]"
          >
            {settings.theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#FDE047]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8B5CF6]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF] dark:bg-[#221E32] border-t border-[#EAE6DF] dark:border-[#342E4A] px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1.5 px-2 relative rounded-lg transition-colors ${
                isActive
                  ? "text-[#7C3AED] dark:text-[#C4B5FD]"
                  : "text-[#716982] dark:text-[#A8A1BA]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 text-[10px] w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
