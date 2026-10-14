import React, { useState, useMemo } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target, 
  Activity, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { StudySession } from "../types";

interface StudyAnalyticsSectionProps {
  sessions: StudySession[];
}

type Timeframe = "7d" | "14d" | "30d";

export const StudyAnalyticsSection: React.FC<StudyAnalyticsSectionProps> = ({ sessions }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("7d");

  // Determine number of days to analyze
  const daysCount = timeframe === "7d" ? 7 : timeframe === "14d" ? 14 : 30;

  // Aggregate daily sessions and accuracy trends
  const { dailyData, accuracyTrends, avgDailySessions, averageAccuracy, accuracyImprovement } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dayMap = new Map<string, { date: Date; label: string; sessionsCount: number; questionsCount: number; totalAccuracy: number; sessionCountForAcc: number }>();

    // Pre-populate days in chronological order
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const shortLabel = d.toLocaleDateString(undefined, { 
        weekday: daysCount <= 7 ? "short" : undefined, 
        month: daysCount > 7 ? "numeric" : undefined, 
        day: "numeric" 
      });

      dayMap.set(key, {
        date: d,
        label: shortLabel,
        sessionsCount: 0,
        questionsCount: 0,
        totalAccuracy: 0,
        sessionCountForAcc: 0,
      });
    }

    // Populate from actual sessions
    sessions.forEach((s) => {
      const sessionDate = s.completedAt ? new Date(s.completedAt).toISOString().split("T")[0] : null;
      if (sessionDate && dayMap.has(sessionDate)) {
        const item = dayMap.get(sessionDate)!;
        item.sessionsCount += 1;
        item.questionsCount += s.totalQuestions || 0;
        item.totalAccuracy += s.accuracy || 0;
        item.sessionCountForAcc += 1;
      }
    });

    const dailyResult: Array<{ label: string; sessions: number; questions: number; dateKey: string }> = [];
    const accuracyResult: Array<{ label: string; accuracy: number; dateKey: string; hasData: boolean }> = [];

    let totalSessions = 0;
    let runningAccuracy = 75; // baseline

    dayMap.forEach((val, key) => {
      dailyResult.push({
        label: val.label,
        sessions: val.sessionsCount,
        questions: val.questionsCount,
        dateKey: key,
      });

      totalSessions += val.sessionsCount;

      let dayAcc = 0;
      let hasData = false;
      if (val.sessionCountForAcc > 0) {
        dayAcc = Math.round(val.totalAccuracy / val.sessionCountForAcc);
        runningAccuracy = dayAcc;
        hasData = true;
      } else {
        // Carry forward previous rolling accuracy for smooth trend line or mark 0
        dayAcc = runningAccuracy;
      }

      accuracyResult.push({
        label: val.label,
        accuracy: dayAcc,
        dateKey: key,
        hasData,
      });
    });

    const avgDaily = (totalSessions / daysCount).toFixed(1);

    // Calculate accuracy improvement (first non-zero vs last)
    const validAccuracies = accuracyResult.filter((a) => a.hasData);
    let avgAcc = 0;
    let improvement = 0;

    if (validAccuracies.length > 0) {
      const sum = validAccuracies.reduce((acc, a) => acc + a.accuracy, 0);
      avgAcc = Math.round(sum / validAccuracies.length);
      const first = validAccuracies[0].accuracy;
      const last = validAccuracies[validAccuracies.length - 1].accuracy;
      improvement = last - first;
    }

    return {
      dailyData: dailyResult,
      accuracyTrends: accuracyResult,
      avgDailySessions: avgDaily,
      averageAccuracy: avgAcc || 85,
      accuracyImprovement: improvement,
    };
  }, [sessions, daysCount]);

  // Custom tooltips
  const CustomSessionsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-lg text-xs space-y-1">
          <p className="font-bold text-[#272334] dark:text-[#FAF9F6]">{data.dateKey || label}</p>
          <div className="flex items-center gap-2 text-[#7C3AED] dark:text-[#C4B5FD] font-semibold">
            <span>Sessions:</span>
            <span className="tabular-nums font-extrabold">{payload[0].value}</span>
          </div>
          {data.questions > 0 && (
            <div className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
              <span>Questions practiced: </span>
              <span className="tabular-nums font-semibold">{data.questions}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomAccuracyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-lg text-xs space-y-1">
          <p className="font-bold text-[#272334] dark:text-[#FAF9F6]">{data.dateKey || label}</p>
          <div className="flex items-center gap-2 text-[#10B981] dark:text-[#86EFAC] font-semibold">
            <span>Accuracy:</span>
            <span className="tabular-nums font-extrabold">{payload[0].value}%</span>
          </div>
          <p className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
            {data.hasData ? "Active practice recorded" : "Carried forward from previous day"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="space-y-5">
      {/* Section Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
              Learning Progress & Performance Trends
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#DDD6FE]">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-[#716982] dark:text-[#A8A1BA] mt-0.5">
            Visualize your daily active recall volume and long-term retention accuracy over time.
          </p>
        </div>

        {/* Timeframe Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] self-start sm:self-auto">
          {(["7d", "14d", "30d"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                timeframe === tf
                  ? "bg-white dark:bg-[#2F284B] text-[#7C3AED] dark:text-[#FAF9F6] shadow-xs"
                  : "text-[#716982] dark:text-[#A8A1BA] hover:text-[#272334] dark:hover:text-[#FAF9F6]"
              }`}
            >
              {tf === "7d" ? "Past 7 Days" : tf === "14d" ? "14 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
          <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">Daily Session Average</span>
          <span className="text-xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tabular-nums block mt-0.5">
            {avgDailySessions}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
          <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">Average Accuracy</span>
          <span className="text-xl font-extrabold text-[#10B981] tabular-nums block mt-0.5">
            {averageAccuracy}%
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
          <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">Accuracy Momentum</span>
          <span className={`text-xl font-extrabold tabular-nums block mt-0.5 ${
            accuracyImprovement >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}>
            {accuracyImprovement >= 0 ? `+${accuracyImprovement}%` : `${accuracyImprovement}%`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
          <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">Practice Limit</span>
          <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#C4B5FD] block mt-0.5">
            Unlimited ∞
          </span>
        </div>
      </div>

      {/* Charts Grid: 1 Line Chart (Daily Sessions) + 1 Area Chart (Accuracy Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Line Chart of Daily Study Sessions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#272334] dark:text-[#FAF9F6]">
                  Daily Study Sessions
                </h3>
                <p className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
                  Number of active recall sessions completed per day
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums">
              Line Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#EAE6DF] dark:text-[#2E2843]" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: "currentColor" }} 
                  className="text-[#716982] dark:text-[#A8A1BA]"
                  tickLine={false}
                  axisLine={{ stroke: "#EAE6DF" }}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fontSize: 11, fill: "currentColor" }} 
                  className="text-[#716982] dark:text-[#A8A1BA]"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomSessionsTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Study Sessions"
                  stroke="#7C3AED"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#7C3AED", strokeWidth: 2, stroke: "#FAF9F6" }}
                  activeDot={{ r: 6, fill: "#6D28D9", stroke: "#EDE9FE", strokeWidth: 3 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F0ECE1] dark:border-[#2D2744] flex items-center justify-between text-[11px] text-[#716982] dark:text-[#A8A1BA]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <span>Completed Sessions</span>
            </span>
            <span>Consistent study cements memory retrieval</span>
          </div>
        </div>

        {/* CHART 2: Area Chart representing Accuracy Trends Over Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] dark:bg-[#143D24] text-[#16A34A] dark:text-[#86EFAC] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#272334] dark:text-[#FAF9F6]">
                  Accuracy Trends Over Time
                </h3>
                <p className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
                  Percentage of correct answers across review sessions
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#10B981] tabular-nums">
              Area Chart
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#EAE6DF] dark:text-[#2E2843]" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: "currentColor" }} 
                  className="text-[#716982] dark:text-[#A8A1BA]"
                  tickLine={false}
                  axisLine={{ stroke: "#EAE6DF" }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 11, fill: "currentColor" }} 
                  className="text-[#716982] dark:text-[#A8A1BA]"
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomAccuracyTooltip />} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#accuracyGradient)"
                  dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 1.5, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5, fill: "#7C3AED", stroke: "#FAF9F6", strokeWidth: 2 }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-[#F0ECE1] dark:border-[#2D2744] flex items-center justify-between text-[11px] text-[#716982] dark:text-[#A8A1BA]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span>Retention Accuracy (%)</span>
            </span>
            <span>Targeting 80%+ long-term retention</span>
          </div>
        </div>
      </div>
    </section>
  );
};
