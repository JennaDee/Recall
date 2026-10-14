import React, { useState } from "react";
import { 
  Clock, 
  Calendar, 
  Play, 
  CheckCircle2, 
  BookOpen, 
  RotateCw, 
  Layers,
  Sparkles
} from "lucide-react";
import { Deck, Question } from "../types";
import { isQuestionDue } from "../utils/spacedRepetition";

interface SpacedReviewViewProps {
  decks: Deck[];
  onStartDueStudy: (deck: Deck, questions: Question[], mode: "flashcards" | "quiz") => void;
}

export const SpacedReviewView: React.FC<SpacedReviewViewProps> = ({
  decks,
  onStartDueStudy,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>("all");

  // Collect due questions
  const dueItems: { deck: Deck; question: Question }[] = [];

  decks.forEach((deck) => {
    if (selectedDeckId !== "all" && deck.id !== selectedDeckId) return;

    deck.questions.forEach((q) => {
      if (isQuestionDue(q.spacedRepetition)) {
        dueItems.push({ deck, question: q });
      }
    });
  });

  const handleStartReview = (mode: "flashcards" | "quiz") => {
    if (dueItems.length === 0) return;
    const firstDeck = dueItems[0].deck;
    const questions = dueItems.map((item) => item.question);
    onStartDueStudy(firstDeck, questions, mode);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#342A5C] text-xs font-semibold text-[#7C3AED] dark:text-[#DDD6FE] mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>SuperMemo SM-2 Algorithm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
            Spaced Repetition
          </h1>
          <p className="mt-1 text-sm text-[#716982] dark:text-[#A8A1BA]">
            Questions scheduled for review right before your memory retention begins to fade.
          </p>
        </div>

        {dueItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStartReview("flashcards")}
              className="px-4 py-2.5 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#6D28D9] dark:text-[#DDD6FE] text-xs font-bold hover:bg-[#DDD6FE] transition-colors cursor-pointer"
            >
              Flashcards ({dueItems.length})
            </button>
            <button
              onClick={() => handleStartReview("quiz")}
              className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Quiz ({dueItems.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Spaced Repetition Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-3">
        <h2 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          <span>How Spaced Repetition Works in Recall</span>
        </h2>
        <p className="text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
          Each card tracks its personalized <strong>Ease Factor</strong> and <strong>Repetition Interval</strong>. Rating a card as "Easy" or "Good" widens the interval (e.g. 1 day → 3 days → 8 days → 21 days), while "Again" immediately resets the interval to 1 day so you review it tomorrow.
        </p>
      </div>

      {/* Due list */}
      {dueItems.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0FDF4] dark:bg-[#143823] text-[#166534] dark:text-[#86EFAC] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
            All caught up! Zero cards due today
          </h2>
          <p className="text-xs text-[#716982] dark:text-[#A8A1BA] max-w-sm mx-auto">
            Your memory retention is optimal. You can still practice unlimited sessions from your library at any time!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#272334] dark:text-[#FAF9F6] flex items-center gap-2">
            <span>Scheduled Questions Due ({dueItems.length})</span>
          </h2>

          <div className="space-y-3">
            {dueItems.map(({ deck, question }, idx) => (
              <div
                key={question.id || idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
                  <span className="font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                    {deck.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{question.type.replace("_", " ")}</span>
                    <span>·</span>
                    <span className="text-[#8B5CF6] font-medium">
                      Interval: {question.spacedRepetition.interval}d
                    </span>
                  </div>
                </div>

                <p className="font-semibold text-sm text-[#272334] dark:text-[#FAF9F6]">
                  {question.prompt}
                </p>

                <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] text-xs text-[#544D63] dark:text-[#C4BED4]">
                  <span className="font-bold text-[#272334] dark:text-[#FAF9F6] mr-1">Answer:</span>
                  {question.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
