import React from "react";
import { 
  Trophy, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  BookOpen,
  ArrowLeft
} from "lucide-react";
import { Deck, Question, StudySession } from "../types";

interface StudyResultsViewProps {
  deck: Deck;
  session: StudySession;
  missedQuestions: Question[];
  onRetryMistakes: (missed: Question[]) => void;
  onStudyAgain: () => void;
  onReturnToDashboard: () => void;
}

export const StudyResultsView: React.FC<StudyResultsViewProps> = ({
  deck,
  session,
  missedQuestions,
  onRetryMistakes,
  onStudyAgain,
  onReturnToDashboard,
}) => {
  const isPerfectScore = session.incorrectAnswers === 0 && session.totalQuestions > 0;

  return (
    <div className="max-w-2xl mx-auto py-6 pb-20 space-y-6">
      {/* Celebration / Score Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs text-center space-y-5">
        <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center ${
          isPerfectScore
            ? "bg-[#FEF3C7] dark:bg-[#451A03] text-[#D97706] dark:text-[#FBBF24]"
            : "bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD]"
        }`}>
          {isPerfectScore ? <Trophy className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6]">
            {isPerfectScore ? "Flawless Recall!" : "Study Session Finished"}
          </h1>
          <p className="text-xs sm:text-sm text-[#716982] dark:text-[#A8A1BA] mt-1">
            {deck.title} · {session.mode === "quiz" ? "Quiz Mode" : "Flashcards Mode"}
          </p>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA] block">Accuracy</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#7C3AED] dark:text-[#C4B5FD] tabular-nums mt-0.5 block">
              {session.accuracy}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA] block">Correct</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10B981] tabular-nums mt-0.5 block">
              {session.correctAnswers}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA] block">Needs Practice</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#EF4444] tabular-nums mt-0.5 block">
              {session.incorrectAnswers}
            </span>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {missedQuestions.length > 0 && (
            <button
              onClick={() => onRetryMistakes(missedQuestions)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Missed Questions ({missedQuestions.length})</span>
            </button>
          )}

          <button
            onClick={onStudyAgain}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Study Deck Again</span>
          </button>

          <button
            onClick={onReturnToDashboard}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B] text-[#544D63] dark:text-[#C4BED4] text-xs font-semibold border border-[#EAE6DF] dark:border-[#342E4A] transition-colors cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Missed Questions Detail Review */}
      {missedQuestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#EF4444] font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Questions to Reinforce</span>
          </div>

          <div className="space-y-3">
            {missedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#FECACA] dark:border-[#7F1D1D]/50 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
                  <span className="font-semibold text-[#EF4444]">Missed Question #{idx + 1}</span>
                  <span className="capitalize">{q.type.replace("_", " ")}</span>
                </div>

                <p className="font-semibold text-sm text-[#272334] dark:text-[#FAF9F6]">
                  {q.prompt}
                </p>

                <div className="p-3 rounded-xl bg-[#F0FDF4] dark:bg-[#143823] border border-[#BBF7D0] dark:border-[#1E5D38] text-xs text-[#166534] dark:text-[#86EFAC]">
                  <span className="font-bold mr-1">Correct Answer:</span>
                  {q.answer}
                </div>

                {q.explanation && (
                  <p className="text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
                    <span className="font-semibold text-[#272334] dark:text-[#FAF9F6]">Why: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
