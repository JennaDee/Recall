import React, { useState } from "react";
import { 
  AlertCircle, 
  RotateCcw, 
  CheckCircle, 
  Check, 
  BookOpen, 
  Filter, 
  Play, 
  Layers,
  Sparkles
} from "lucide-react";
import { Deck, Question } from "../types";

interface MistakesReviewViewProps {
  decks: Deck[];
  onUpdateQuestion: (deckId: string, updatedQuestion: Question) => void;
  onPracticeMistakes: (deck: Deck, questionsToPractice: Question[]) => void;
}

export const MistakesReviewView: React.FC<MistakesReviewViewProps> = ({
  decks,
  onUpdateQuestion,
  onPracticeMistakes,
}) => {
  const [selectedDeckFilter, setSelectedDeckFilter] = useState<string>("all");
  const [hideMastered, setHideMastered] = useState(false);

  // Aggregate all questions with mistakeCount > 0 across decks
  const mistakeItems: { deck: Deck; question: Question }[] = [];

  decks.forEach((deck) => {
    if (selectedDeckFilter !== "all" && deck.id !== selectedDeckFilter) return;

    deck.questions.forEach((q) => {
      if (q.mistakeCount > 0) {
        if (!hideMastered || !q.mastered) {
          mistakeItems.push({ deck, question: q });
        }
      }
    });
  });

  const handleToggleMastered = (deckId: string, question: Question) => {
    const updated: Question = {
      ...question,
      mastered: !question.mastered,
    };
    onUpdateQuestion(deckId, updated);
  };

  const handlePracticeAllFiltered = () => {
    if (mistakeItems.length === 0) return;
    const firstDeck = mistakeItems[0].deck;
    const questions = mistakeItems.map((item) => item.question);
    onPracticeMistakes(firstDeck, questions);
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
            Mistakes Bank
          </h1>
          <p className="mt-1 text-sm text-[#716982] dark:text-[#A8A1BA]">
            Your personal review bank of questions you've previously missed. Retry them as often as you want until mastered.
          </p>
        </div>

        {mistakeItems.length > 0 && (
          <button
            onClick={handlePracticeAllFiltered}
            className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Practice These Mistakes ({mistakeItems.length})</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8B5CF6]" />
          <span className="font-semibold text-[#544D63] dark:text-[#C4BED4]">Filter by deck:</span>
          <select
            value={selectedDeckFilter}
            onChange={(e) => setSelectedDeckFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-[#FAF9F6] dark:bg-[#1E192D] text-xs font-medium text-[#272334] dark:text-[#FAF9F6] focus:outline-hidden"
          >
            <option value="all">All Study Sets ({decks.length})</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideMastered}
            onChange={(e) => setHideMastered(e.target.checked)}
            className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#A78BFA]"
          />
          <span className="text-[#544D63] dark:text-[#C4BED4]">Hide mastered mistakes</span>
        </label>
      </div>

      {/* Mistake Items List */}
      {mistakeItems.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F0FDF4] dark:bg-[#143823] text-[#166534] dark:text-[#86EFAC] flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
            No unmastered mistakes found
          </h2>
          <p className="text-xs text-[#716982] dark:text-[#A8A1BA] max-w-sm mx-auto">
            Whenever you miss a question during a quiz or mark a flashcard as "Again", it automatically appears here for focused review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakeItems.map(({ deck, question }) => (
            <div
              key={question.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                    {deck.title}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{question.type.replace("_", " ")}</span>
                  <span>·</span>
                  <span className="text-[#EF4444] font-medium">
                    Missed {question.mistakeCount} time{question.mistakeCount > 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleMastered(deck.id, question)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    question.mastered
                      ? "bg-[#F0FDF4] dark:bg-[#133722] text-[#166534] dark:text-[#86EFAC]"
                      : "bg-[#FAF9F6] dark:bg-[#1E192D] text-[#716982] dark:text-[#A8A1BA] hover:bg-[#EDE9FE]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{question.mastered ? "Mastered" : "Mark as Mastered"}</span>
                </button>
              </div>

              <h2 className="text-sm sm:text-base font-semibold text-[#272334] dark:text-[#FAF9F6]">
                {question.prompt}
              </h2>

              <div className="p-3 rounded-xl bg-[#F0FDF4] dark:bg-[#143823] border border-[#BBF7D0] dark:border-[#1E5D38] text-xs text-[#166534] dark:text-[#86EFAC]">
                <span className="font-bold mr-1">Answer:</span>
                {question.answer}
              </div>

              {question.explanation && (
                <p className="text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
                  <span className="font-semibold text-[#272334] dark:text-[#FAF9F6]">Explanation: </span>
                  {question.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
