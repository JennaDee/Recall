import React from "react";
import { 
  Sparkles, 
  PlusCircle, 
  Layers, 
  Clock, 
  Flame, 
  Play, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  CheckCircle2
} from "lucide-react";
import { Deck, StudySession } from "../types";
import { isQuestionDue } from "../utils/spacedRepetition";
import { NavTab } from "./Navigation";
import { StudyAnalyticsSection } from "./StudyAnalyticsSection";

interface DashboardViewProps {
  decks: Deck[];
  sessions: StudySession[];
  currentStreak: number;
  onSelectTab: (tab: NavTab) => void;
  onStartStudy: (deck: Deck, mode: "quiz" | "flashcards" | "spaced_repetition") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  decks,
  sessions,
  currentStreak,
  onSelectTab,
  onStartStudy,
}) => {
  // Aggregate real stats
  const totalDecks = decks.length;
  
  const totalQuestions = decks.reduce((acc, d) => acc + d.questions.length, 0);

  // Total answers/questions reviewed across all logged sessions or question logs
  const totalQuestionsReviewed = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);

  // Questions due for spaced repetition review today
  let dueQuestionsCount = 0;
  let dueDecksMap = new Map<string, number>();

  decks.forEach((deck) => {
    let deckDue = 0;
    deck.questions.forEach((q) => {
      if (isQuestionDue(q.spacedRepetition)) {
        deckDue++;
        dueQuestionsCount++;
      }
    });
    if (deckDue > 0) {
      dueDecksMap.set(deck.id, deckDue);
    }
  });

  // Calculate overall accuracy from sessions
  const totalCorrect = sessions.reduce((acc, s) => acc + s.correctAnswers, 0);
  const totalAttempted = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Recently studied decks
  const recentDecks = [...decks]
    .sort((a, b) => {
      const timeA = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
      const timeB = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 4);

  // Deck to continue studying (most recently studied or first deck with due questions)
  const continueDeck = recentDecks[0] || decks[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#EDE9FE] via-[#FAF5FF] to-[#FCE7F3] dark:from-[#2A2148] dark:via-[#261E3E] dark:to-[#381E38] p-6 sm:p-8 border border-[#DDD6FE] dark:border-[#4C1D95]/40 shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-black/30 backdrop-blur-xs text-xs font-semibold text-[#7C3AED] dark:text-[#DDD6FE] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Active Recall Learning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
            Ready to master your knowledge?
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
            Practice freely with zero restrictions or daily energy limits. Strengthen neural pathways with spaced repetition and active testing.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {continueDeck ? (
              <button
                onClick={() => onStartStudy(continueDeck, "flashcards")}
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continue Studying: {continueDeck.title}</span>
              </button>
            ) : null}

            <button
              onClick={() => onSelectTab("create")}
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#2F284B] hover:bg-[#FAF9F6] dark:hover:bg-[#39315A] text-[#272334] dark:text-[#FAF9F6] font-medium text-sm flex items-center gap-2 border border-[#EAE6DF] dark:border-[#3E365E] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#8B5CF6]" />
              <span>Create Study Set</span>
            </button>
          </div>
        </div>

        {/* Decorative corner visual */}
        <div className="hidden lg:block absolute -right-6 -bottom-6 opacity-40 dark:opacity-20 pointer-events-none">
          <BrainCircuit className="w-56 h-56 text-[#A78BFA]" />
        </div>
      </div>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Sets */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
            <span>Study Sets</span>
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
              {totalDecks}
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">decks</span>
          </div>
          <p className="mt-1 text-xs text-[#716982] dark:text-[#A8A1BA]">
            {totalQuestions} total questions
          </p>
        </div>

        {/* Questions Reviewed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
            <span>Questions Practiced</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
              {totalQuestionsReviewed}
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">reps</span>
          </div>
          <p className="mt-1 text-xs text-[#716982] dark:text-[#A8A1BA]">
            {sessions.length} study sessions
          </p>
        </div>

        {/* Study Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-[#F59E0B] fill-current" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
              {currentStreak}
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">days</span>
          </div>
          <p className="mt-1 text-xs text-[#716982] dark:text-[#A8A1BA]">
            {sessions.length > 0 ? `${overallAccuracy}% accuracy` : "No sessions yet"}
          </p>
        </div>

        {/* Questions Due */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
            <span>Due for Review</span>
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
              {dueQuestionsCount}
            </span>
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">questions</span>
          </div>
          <p className="mt-1 text-xs text-[#8B5CF6] dark:text-[#C4B5FD] font-medium">
            Spaced repetition target
          </p>
        </div>
      </div>

      {/* Due for Review Spotlight Section */}
      {dueQuestionsCount > 0 && (
        <div className="p-5 rounded-2xl bg-[#F5F3FF] dark:bg-[#251E3D] border border-[#DDD6FE] dark:border-[#4C1D95]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-[#272334] dark:text-[#FAF9F6]">
                You have {dueQuestionsCount} question{dueQuestionsCount === 1 ? "" : "s"} due for spaced review
              </h2>
              <p className="text-xs text-[#544D63] dark:text-[#C4BED4]">
                Reviewing now locks in memories right before they decay according to your personal SM-2 forgetting curve.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab("spaced")}
            className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Review Spaced Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress Analytics Dashboard Section */}
      <StudyAnalyticsSection sessions={sessions} />

      {/* Recently Studied Decks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
              Study Decks
            </h2>
            <p className="text-xs text-[#716982] dark:text-[#A8A1BA]">
              Pick up where you left off or begin a new practice session
            </p>
          </div>
          <button
            onClick={() => onSelectTab("library")}
            className="text-xs font-semibold text-[#7C3AED] dark:text-[#C4B5FD] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({totalDecks})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
            <BookOpen className="w-10 h-10 text-[#8B5CF6] mx-auto opacity-70 mb-3" />
            <h3 className="font-semibold text-base text-[#272334] dark:text-[#FAF9F6]">
              No study sets created yet
            </h3>
            <p className="text-xs text-[#716982] dark:text-[#A8A1BA] mt-1 max-w-sm mx-auto">
              Paste your lecture notes or study material and let Gemini generate interactive flashcards and quizzes.
            </p>
            <button
              onClick={() => onSelectTab("create")}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors cursor-pointer"
            >
              Create Your First Set
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentDecks.map((deck) => {
              const dueInDeck = dueDecksMap.get(deck.id) || 0;
              const masteredCount = deck.questions.filter((q) => q.mastered).length;
              const masteryPercent = deck.questions.length > 0 
                ? Math.round((masteredCount / deck.questions.length) * 100) 
                : 0;

              return (
                <div
                  key={deck.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#DDD6FE] dark:hover:border-[#4C1D95]/60 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
                >
                  <div>
                    {/* Header line: Subject and due tag */}
                    <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA] mb-2">
                      <span className="font-medium text-[#7C3AED] dark:text-[#C4B5FD]">{deck.subject}</span>
                      <div className="flex items-center gap-2">
                        {dueInDeck > 0 && (
                          <span className="text-[11px] font-semibold text-[#8B5CF6] dark:text-[#C4B5FD] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dueInDeck} due
                          </span>
                        )}
                        <span>{deck.questions.length} cards</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6] line-clamp-1">
                      {deck.title}
                    </h3>
                    {deck.description && (
                      <p className="text-xs text-[#544D63] dark:text-[#A8A1BA] mt-1 line-clamp-2">
                        {deck.description}
                      </p>
                    )}

                    {/* Mastery bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-[#716982] dark:text-[#A8A1BA] mb-1">
                        <span>Mastery</span>
                        <span className="tabular-nums font-medium">{masteryPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#FAF9F6] dark:bg-[#2A2341] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#A78BFA] to-[#10B981] rounded-full transition-all duration-300"
                          style={{ width: `${masteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-[#F0ECE1] dark:border-[#2D2744] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#88819A] dark:text-[#7A738E]">
                      {deck.lastStudiedAt 
                        ? `Studied ${new Date(deck.lastStudiedAt).toLocaleDateString()}` 
                        : "Not yet studied"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartStudy(deck, "flashcards")}
                        className="px-3 py-1.5 rounded-lg bg-[#F5F3FF] dark:bg-[#2F284B] hover:bg-[#EDE9FE] dark:hover:bg-[#3B325E] text-[#6D28D9] dark:text-[#DDD6FE] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Flashcards
                      </button>
                      <button
                        onClick={() => onStartStudy(deck, "quiz")}
                        className="px-3 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Quiz</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Active Learning Guidance Note */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
          <span className="font-semibold text-[#272334] dark:text-[#FAF9F6]">How to get the most out of Recall:</span>
          {" "}Always attempt to retrieve the answer in your mind before flipping cards or peeking at options. Active testing produces up to 3x higher retention than passive reading, and the SM-2 algorithm automatically spaces your repetitions right before memories fade.
        </div>
      </div>
    </div>
  );
};
