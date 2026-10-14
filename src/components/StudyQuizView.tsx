import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  RefreshCw, 
  Check, 
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Deck, Question, StudySession } from "../types";
import { calculateNextReview } from "../utils/spacedRepetition";

interface StudyQuizViewProps {
  deck: Deck;
  onUpdateQuestion: (deckId: string, updatedQuestion: Question) => void;
  onRecordSession: (session: StudySession) => void;
  onExit: () => void;
  onFinishQuiz: (session: StudySession, missedQuestions: Question[]) => void;
  initialQuestions?: Question[];
}

export const StudyQuizView: React.FC<StudyQuizViewProps> = ({
  deck,
  onUpdateQuestion,
  onRecordSession,
  onExit,
  onFinishQuiz,
  initialQuestions,
}) => {
  const [questions] = useState<Question[]>(() => {
    return initialQuestions && initialQuestions.length > 0 
      ? [...initialQuestions] 
      : [...deck.questions];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  
  // State for answered status of current question
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [isOverridden, setIsOverridden] = useState(false);

  // Session tallies
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [sessionStartTime] = useState(Date.now());

  const currentQ = questions[currentIndex];

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A]">
        <HelpCircle className="w-10 h-10 text-[#8B5CF6] mx-auto mb-2 opacity-70" />
        <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
          No quiz questions available
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

  // Handle selecting a multiple-choice option
  const handleSelectChoice = (option: string) => {
    if (isAnswered) return;

    setSelectedChoice(option);
    const isCorrect = option.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();
    
    processAnswerResult(isCorrect);
  };

  // Handle submitting written / identification answer
  const handleSubmitTypedAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !typedAnswer.trim()) return;

    const userClean = typedAnswer.trim().toLowerCase();
    const expectedClean = currentQ.answer.trim().toLowerCase();
    const acceptable = (currentQ.acceptableAnswers || []).map((a) => a.trim().toLowerCase());

    const isDirectMatch = userClean === expectedClean || acceptable.includes(userClean);

    if (isDirectMatch) {
      processAnswerResult(true);
    } else {
      // Check if candidate wants AI assistance or we mark as pending evaluation
      processAnswerResult(false);
    }
  };

  // Optional AI Evaluation for Identification answers
  const handleAskAiToEvaluate = async () => {
    if (isAiEvaluating || !typedAnswer.trim()) return;
    setIsAiEvaluating(true);

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentQ.prompt,
          expectedAnswer: currentQ.answer,
          acceptableAnswers: currentQ.acceptableAnswers,
          userAnswer: typedAnswer.trim(),
        }),
      });

      const data = await response.json();
      if (data.isCorrect !== undefined) {
        setAiFeedback(data.feedback);
        if (data.isCorrect && !isCurrentCorrect) {
          // Adjust tallies
          setIsCurrentCorrect(true);
          setCorrectCount((prev) => prev + 1);
          setIncorrectCount((prev) => Math.max(0, prev - 1));
          setMissedQuestions((prev) => prev.filter((q) => q.id !== currentQ.id));

          // Update spaced repetition
          const nextSR = calculateNextReview(currentQ.spacedRepetition, "good");
          onUpdateQuestion(deck.id, {
            ...currentQ,
            spacedRepetition: nextSR,
            correctCount: currentQ.correctCount + 1,
          });
        }
      }
    } catch (e) {
      console.error("AI Evaluation error:", e);
      setAiFeedback("Could not connect to AI grader. You can use 'Mark myself correct' below.");
    } finally {
      setIsAiEvaluating(false);
    }
  };

  // Manual Override "Mark myself correct"
  const handleOverrideCorrect = () => {
    if (isOverridden) return;
    setIsOverridden(true);
    setIsCurrentCorrect(true);

    setCorrectCount((prev) => prev + 1);
    setIncorrectCount((prev) => Math.max(0, prev - 1));
    setMissedQuestions((prev) => prev.filter((q) => q.id !== currentQ.id));

    const nextSR = calculateNextReview(currentQ.spacedRepetition, "good");
    onUpdateQuestion(deck.id, {
      ...currentQ,
      spacedRepetition: nextSR,
      correctCount: currentQ.correctCount + 1,
    });
  };

  const processAnswerResult = (isCorrect: boolean) => {
    setIsAnswered(true);
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      const nextSR = calculateNextReview(currentQ.spacedRepetition, "good");
      onUpdateQuestion(deck.id, {
        ...currentQ,
        spacedRepetition: nextSR,
        correctCount: currentQ.correctCount + 1,
        mastered: currentQ.correctCount >= 2,
      });
    } else {
      setIncorrectCount((prev) => prev + 1);
      setMissedQuestions((prev) => [...prev, currentQ]);
      const nextSR = calculateNextReview(currentQ.spacedRepetition, "again");
      onUpdateQuestion(deck.id, {
        ...currentQ,
        spacedRepetition: nextSR,
        mistakeCount: currentQ.mistakeCount + 1,
        mastered: false,
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setTypedAnswer("");
      setIsAnswered(false);
      setIsCurrentCorrect(false);
      setAiFeedback(null);
      setIsOverridden(false);
    } else {
      // Finished quiz!
      const totalAttempted = questions.length;
      const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

      const session: StudySession = {
        id: `session_${Date.now()}`,
        deckId: deck.id,
        deckTitle: deck.title,
        mode: "quiz",
        startedAt: new Date(sessionStartTime).toISOString(),
        completedAt: new Date().toISOString(),
        totalQuestions: totalAttempted,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        accuracy,
        mistakeQuestionIds: missedQuestions.map((q) => q.id),
      };

      onRecordSession(session);
      onFinishQuiz(session, missedQuestions);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#716982] dark:text-[#A8A1BA] hover:text-[#272334] dark:hover:text-[#FAF9F6] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Quiz</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#10B981] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {correctCount}
            </span>
            <span className="font-semibold text-[#EF4444] flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {incorrectCount}
            </span>
          </div>

          <span className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6] tabular-nums">
            {currentIndex + 1} / {questions.length}
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

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-6">
        {/* Question Topic & Format Meta */}
        <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
          <span className="font-bold text-[#7C3AED] dark:text-[#C4B5FD] uppercase tracking-wider text-[10px]">
            {currentQ.topic || deck.subject}
          </span>
          <span className="capitalize">{currentQ.difficulty}</span>
        </div>

        {/* Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-[#272334] dark:text-[#FAF9F6] leading-relaxed">
          {currentQ.prompt}
        </h2>

        {/* Answer Section */}
        {currentQ.type === "multiple_choice" && currentQ.options && (
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedChoice === option;
              const isCorrectAnswer = option.trim().toLowerCase() === currentQ.answer.trim().toLowerCase();

              let style = "bg-[#FAF9F6] dark:bg-[#1E192D] border-[#EAE6DF] dark:border-[#342E4A] text-[#272334] dark:text-[#FAF9F6] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B] hover:border-[#DDD6FE]";

              if (isAnswered) {
                if (isCorrectAnswer) {
                  style = "bg-[#F0FDF4] dark:bg-[#133722] border-[#22C55E] text-[#15803D] dark:text-[#86EFAC] font-semibold";
                } else if (isSelected && !isCorrectAnswer) {
                  style = "bg-[#FEF2F2] dark:bg-[#3D1818] border-[#EF4444] text-[#B91C1C] dark:text-[#FCA5A5]";
                } else {
                  style = "opacity-50 bg-[#FAF9F6] dark:bg-[#1E192D] border-[#EAE6DF] dark:border-[#342E4A] text-[#716982]";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectChoice(option)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer ${style}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {isAnswered && (
                    <div className="shrink-0 mt-0.5">
                      {isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
                      {isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-[#EF4444]" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Written / Identification Input */}
        {currentQ.type !== "multiple_choice" && (
          <form onSubmit={handleSubmitTypedAnswer} className="space-y-3">
            <div>
              <input
                type="text"
                disabled={isAnswered}
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                autoFocus
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-hidden transition-all ${
                  isAnswered
                    ? isCurrentCorrect
                      ? "bg-[#F0FDF4] dark:bg-[#133722] border-[#22C55E] text-[#15803D] dark:text-[#86EFAC]"
                      : "bg-[#FEF2F2] dark:bg-[#3D1818] border-[#EF4444] text-[#B91C1C] dark:text-[#FCA5A5]"
                    : "bg-[#FAF9F6] dark:bg-[#1E192D] border-[#EAE6DF] dark:border-[#342E4A] text-[#272334] dark:text-[#FAF9F6] focus:ring-2 focus:ring-[#A78BFA]"
                }`}
              />
            </div>

            {!isAnswered && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!typedAnswer.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </form>
        )}

        {/* Feedback & Educational Explanation Panel */}
        {isAnswered && (
          <div className="space-y-3 pt-2 animate-fadeIn">
            <div className={`p-4 rounded-2xl border ${
              isCurrentCorrect
                ? "bg-[#F0FDF4] dark:bg-[#143823] border-[#BBF7D0] dark:border-[#1E5D38] text-[#166534] dark:text-[#86EFAC]"
                : "bg-[#FEF2F2] dark:bg-[#3C1818] border-[#FECACA] dark:border-[#7F1D1D] text-[#991B1B] dark:text-[#FCA5A5]"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                    <span>Correct! Excellent recall.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-[#EF4444]" />
                    <span>Incorrect. Learning opportunity!</span>
                  </>
                )}
              </div>

              {!isCurrentCorrect && (
                <div className="mt-2 text-xs">
                  <span className="font-semibold text-[#272334] dark:text-[#FAF9F6]">Expected Answer:</span>{" "}
                  <span className="font-bold underline">{currentQ.answer}</span>
                </div>
              )}

              {aiFeedback && (
                <div className="mt-2 text-xs p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-current/20">
                  <span className="font-semibold">AI Evaluation:</span> {aiFeedback}
                </div>
              )}
            </div>

            {/* Explanation box */}
            <div className="p-4 rounded-2xl bg-[#EDE9FE]/60 dark:bg-[#251E3D] border border-[#DDD6FE] dark:border-[#4C1D95]/40 text-xs text-[#544D63] dark:text-[#C4BED4] leading-relaxed">
              <span className="font-bold text-[#6D28D9] dark:text-[#DDD6FE] block mb-1">
                Educational Context:
              </span>
              {currentQ.explanation}
            </div>

            {/* AI evaluation or Manual override options for Identification */}
            {currentQ.type !== "multiple_choice" && !isCurrentCorrect && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleAskAiToEvaluate}
                  disabled={isAiEvaluating}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] hover:bg-[#FAF9F6] text-[#6D28D9] dark:text-[#DDD6FE] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {isAiEvaluating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  )}
                  <span>Ask AI to Evaluate Meaning</span>
                </button>

                <button
                  type="button"
                  onClick={handleOverrideCorrect}
                  className="px-3 py-1.5 rounded-xl text-[#716982] dark:text-[#A8A1BA] hover:text-[#272334] dark:hover:text-[#FAF9F6] underline cursor-pointer"
                >
                  I was right (override)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next Button Bar */}
      {isAnswered && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNextQuestion}
            className="px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>{currentIndex < questions.length - 1 ? "Next Question" : "View Results"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
