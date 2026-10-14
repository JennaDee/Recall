import React, { useState, useEffect } from "react";
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  ArrowLeft, 
  Volume2, 
  CheckCircle, 
  Clock, 
  Sparkles,
  HelpCircle,
  Eye,
  RefreshCw
} from "lucide-react";
import { Deck, Question, StudyRating, StudySession } from "../types";
import { calculateNextReview } from "../utils/spacedRepetition";

interface StudyFlashcardsViewProps {
  deck: Deck;
  onUpdateQuestion: (deckId: string, updatedQuestion: Question) => void;
  onRecordSession: (session: StudySession) => void;
  onExit: () => void;
  initialQuestions?: Question[];
}

export const StudyFlashcardsView: React.FC<StudyFlashcardsViewProps> = ({
  deck,
  onUpdateQuestion,
  onRecordSession,
  onExit,
  initialQuestions,
}) => {
  const [cards, setCards] = useState<Question[]>(() => {
    return initialQuestions && initialQuestions.length > 0 
      ? [...initialQuestions] 
      : [...deck.questions];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratedCardsCount, setRatedCardsCount] = useState(0);
  const [ratingsBreakdown, setRatingsBreakdown] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });

  const [sessionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakeQuestionIds, setMistakeQuestionIds] = useState<string[]>([]);

  const currentCard = cards[currentIndex];

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (isFlipped) {
        if (e.key === "1") handleRate("again");
        if (e.key === "2") handleRate("hard");
        if (e.key === "3") handleRate("good");
        if (e.key === "4") handleRate("easy");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped, isCompleted, cards]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const handleRate = (rating: StudyRating) => {
    if (!currentCard) return;

    // Calculate new SM-2 spaced repetition state
    const nextSR = calculateNextReview(currentCard.spacedRepetition, rating);
    const isMistake = rating === "again";

    const updatedCard: Question = {
      ...currentCard,
      spacedRepetition: nextSR,
      mistakeCount: isMistake ? currentCard.mistakeCount + 1 : currentCard.mistakeCount,
      correctCount: !isMistake ? currentCard.correctCount + 1 : currentCard.correctCount,
      mastered: rating === "easy" || (currentCard.correctCount >= 3 && !isMistake),
    };

    // Save persistent question stats
    onUpdateQuestion(deck.id, updatedCard);

    // Update session state
    setRatingsBreakdown((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
    }));
    setRatedCardsCount((prev) => prev + 1);

    if (isMistake) {
      setMistakeQuestionIds((prev) => 
        prev.includes(currentCard.id) ? prev : [...prev, currentCard.id]
      );
    }

    // Proceed to next card or complete
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession(ratingsBreakdown[rating] + 1, isMistake);
    }
  };

  const finishSession = (finalRatingCount: number, lastWasMistake: boolean) => {
    setIsCompleted(true);

    const totalRated = ratedCardsCount + 1;
    const againCount = ratingsBreakdown.again + (lastWasMistake ? 1 : 0);
    const correctCount = totalRated - againCount;
    const accuracy = totalRated > 0 ? Math.round((correctCount / totalRated) * 100) : 100;

    const session: StudySession = {
      id: `session_${Date.now()}`,
      deckId: deck.id,
      deckTitle: deck.title,
      mode: "flashcards",
      startedAt: new Date(sessionStartTime).toISOString(),
      completedAt: new Date().toISOString(),
      totalQuestions: totalRated,
      correctAnswers: correctCount,
      incorrectAnswers: againCount,
      accuracy,
      mistakeQuestionIds,
    };

    onRecordSession(session);
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRatedCardsCount(0);
    setRatingsBreakdown({ again: 0, hard: 0, good: 0, easy: 0 });
    setMistakeQuestionIds([]);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
        <HelpCircle className="w-10 h-10 text-[#8B5CF6] mx-auto mb-2 opacity-70" />
        <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
          No flashcards available in this deck
        </h2>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold"
        >
          Return to Deck
        </button>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const total = cards.length;
    const successful = ratingsBreakdown.good + ratingsBreakdown.easy;
    const accuracy = Math.round((successful / Math.max(total, 1)) * 100);

    return (
      <div className="max-w-xl mx-auto py-8 px-4 text-center space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-sm space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#7C3AED] dark:text-[#C4B5FD] flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-[#272334] dark:text-[#FAF9F6]">
              Deck Review Complete!
            </h2>
            <p className="text-xs text-[#716982] dark:text-[#A8A1BA] mt-1">
              You reviewed {cards.length} cards from <span className="font-semibold text-[#272334] dark:text-[#FAF9F6]">{deck.title}</span>
            </p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
              <span className="text-[11px] text-[#EF4444] font-bold block">Again</span>
              <span className="text-lg font-extrabold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
                {ratingsBreakdown.again}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
              <span className="text-[11px] text-[#F59E0B] font-bold block">Hard</span>
              <span className="text-lg font-extrabold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
                {ratingsBreakdown.hard}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
              <span className="text-[11px] text-[#3B82F6] font-bold block">Good</span>
              <span className="text-lg font-extrabold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
                {ratingsBreakdown.good}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
              <span className="text-[11px] text-[#10B981] font-bold block">Easy</span>
              <span className="text-lg font-extrabold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
                {ratingsBreakdown.easy}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Study Again (Unlimited Retries)</span>
            </button>
            <button
              onClick={onExit}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B] text-[#544D63] dark:text-[#C4BED4] text-xs font-semibold border border-[#EAE6DF] dark:border-[#342E4A] transition-colors cursor-pointer"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#716982] dark:text-[#A8A1BA] hover:text-[#272334] dark:hover:text-[#FAF9F6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            title="Shuffle cards"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] text-xs font-medium text-[#544D63] dark:text-[#C4BED4] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B] transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Shuffle</span>
          </button>

          <span className="text-xs font-semibold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-[#EAE6DF] dark:bg-[#342E4A] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Flashcard Container */}
      <div 
        onClick={handleFlip}
        className="perspective-1000 cursor-pointer min-h-[340px] select-none"
        title="Click or press Space to flip"
      >
        <div
          className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-sm hover:shadow-md ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* FRONT */}
          <div className="absolute inset-0 backface-hidden p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
              <span className="font-semibold text-[#7C3AED] dark:text-[#C4B5FD] uppercase tracking-wider text-[10px]">
                {currentCard.topic || deck.subject || "Front"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>Tap to flip</span>
              </span>
            </div>

            <div className="my-auto py-6 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-[#272334] dark:text-[#FAF9F6] leading-relaxed">
                {currentCard.prompt}
              </h2>
            </div>

            <div className="flex items-center justify-between text-xs text-[#88819A]">
              <span>Spacebar to flip</span>
              <span className="capitalize">{currentCard.difficulty}</span>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#FAF5FF] to-white dark:from-[#2B2348] dark:to-[#221E32] border border-[#DDD6FE] dark:border-[#4C1D95]/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
              <span className="font-semibold text-[#10B981] dark:text-[#86EFAC] uppercase tracking-wider text-[10px]">
                Answer Key
              </span>
              <span className="flex items-center gap-1 text-[#8B5CF6]">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Flipped</span>
              </span>
            </div>

            <div className="my-auto py-4 text-center space-y-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#272334] dark:text-[#FAF9F6] leading-snug">
                {currentCard.answer}
              </h2>

              {currentCard.explanation && (
                <div className="p-3.5 rounded-2xl bg-[#EDE9FE]/60 dark:bg-[#1E192D] text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed text-left max-w-lg mx-auto">
                  <span className="font-semibold text-[#6D28D9] dark:text-[#DDD6FE] mr-1">Explanation:</span>
                  {currentCard.explanation}
                </div>
              )}
            </div>

            <div className="text-center text-xs text-[#88819A]">
              Rate your recall below to schedule next review
            </div>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons (visible when flipped or ready) */}
      <div className="space-y-3 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleRate("again")}
            className="p-3 rounded-2xl bg-white dark:bg-[#221E32] hover:bg-[#FEF2F2] dark:hover:bg-[#381B1B] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#EF4444] text-center transition-all cursor-pointer group"
          >
            <span className="font-bold text-sm text-[#EF4444] block group-hover:scale-105 transition-transform">
              Again [1]
            </span>
            <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
              1 day
            </span>
          </button>

          <button
            onClick={() => handleRate("hard")}
            className="p-3 rounded-2xl bg-white dark:bg-[#221E32] hover:bg-[#FFFBEB] dark:hover:bg-[#3D2C13] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#F59E0B] text-center transition-all cursor-pointer group"
          >
            <span className="font-bold text-sm text-[#F59E0B] block group-hover:scale-105 transition-transform">
              Hard [2]
            </span>
            <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
              {Math.max(1, Math.round(currentCard.spacedRepetition.interval * 1.2))} days
            </span>
          </button>

          <button
            onClick={() => handleRate("good")}
            className="p-3 rounded-2xl bg-white dark:bg-[#221E32] hover:bg-[#EFF6FF] dark:hover:bg-[#1A2E4C] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#3B82F6] text-center transition-all cursor-pointer group"
          >
            <span className="font-bold text-sm text-[#3B82F6] block group-hover:scale-105 transition-transform">
              Good [3]
            </span>
            <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
              {currentCard.spacedRepetition.repetition === 0 ? "1 day" : `${Math.round(currentCard.spacedRepetition.interval * currentCard.spacedRepetition.easeFactor || 3)} days`}
            </span>
          </button>

          <button
            onClick={() => handleRate("easy")}
            className="p-3 rounded-2xl bg-white dark:bg-[#221E32] hover:bg-[#F0FDF4] dark:hover:bg-[#143322] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#10B981] text-center transition-all cursor-pointer group"
          >
            <span className="font-bold text-sm text-[#10B981] block group-hover:scale-105 transition-transform">
              Easy [4]
            </span>
            <span className="text-[11px] text-[#716982] dark:text-[#A8A1BA]">
              {currentCard.spacedRepetition.repetition === 0 ? "3 days" : `${Math.round(currentCard.spacedRepetition.interval * currentCard.spacedRepetition.easeFactor * 1.3 || 7)} days`}
            </span>
          </button>
        </div>

        {/* Previous / Next navigation */}
        <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA] pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] transition-colors ${
              currentIndex === 0 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:bg-white dark:hover:bg-[#221E32] cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleFlip}
            className="font-medium text-[#7C3AED] dark:text-[#C4B5FD] hover:underline cursor-pointer"
          >
            {isFlipped ? "View Question" : "Reveal Answer"}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] transition-colors ${
              currentIndex === cards.length - 1 
                ? "opacity-40 cursor-not-allowed" 
                : "hover:bg-white dark:hover:bg-[#221E32] cursor-pointer"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
