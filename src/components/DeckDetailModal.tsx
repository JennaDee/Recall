import React, { useState } from "react";
import { 
  X, 
  Trash2, 
  Plus, 
  Edit3, 
  Check, 
  AlertCircle, 
  Sparkles,
  BookOpen
} from "lucide-react";
import { Deck, Question, QuestionDifficulty, QuestionType } from "../types";

interface DeckDetailModalProps {
  deck: Deck;
  onClose: () => void;
  onSaveDeck: (updated: Deck) => void;
  onDeleteDeck: (id: string) => void;
  onStartStudy: (deck: Deck, mode: "quiz" | "flashcards") => void;
}

export const DeckDetailModal: React.FC<DeckDetailModalProps> = ({
  deck,
  onClose,
  onSaveDeck,
  onDeleteDeck,
  onStartStudy,
}) => {
  const [title, setTitle] = useState(deck.title);
  const [subject, setSubject] = useState(deck.subject);
  const [questions, setQuestions] = useState<Question[]>([...deck.questions]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingQId, setEditingQId] = useState<string | null>(null);

  // New question form state
  const [newPrompt, setNewPrompt] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newType, setNewType] = useState<QuestionType>("multiple_choice");
  const [newOptions, setNewOptions] = useState<string[]>(["", "", "", ""]);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveDeckDetails = () => {
    const updated: Deck = {
      ...deck,
      title: title.trim() || deck.title,
      subject: subject.trim() || deck.subject,
      questions,
      updatedAt: new Date().toISOString(),
    };
    onSaveDeck(updated);
    onClose();
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleUpdateQuestion = (qId: string, field: "prompt" | "answer" | "explanation", val: string) => {
    setQuestions(
      questions.map((q) => (q.id === qId ? { ...q, [field]: val } : q))
    );
  };

  const handleAddNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !newAnswer.trim()) return;

    let finalOptions: string[] | undefined = undefined;
    if (newType === "multiple_choice") {
      const filtered = newOptions.map((o) => o.trim()).filter(Boolean);
      if (!filtered.includes(newAnswer.trim())) {
        filtered[0] = newAnswer.trim();
      }
      finalOptions = filtered.slice(0, 4);
    }

    const created: Question = {
      id: `q_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: newType,
      difficulty: "medium",
      prompt: newPrompt.trim(),
      answer: newAnswer.trim(),
      explanation: newExplanation.trim() || "User created flashcard.",
      options: finalOptions,
      acceptableAnswers: [newAnswer.trim()],
      topic: subject || "Custom",
      spacedRepetition: {
        easeFactor: 2.5,
        interval: 0,
        repetition: 0,
        lastReviewedDate: null,
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 0,
      correctCount: 0,
    };

    setQuestions([...questions, created]);
    setNewPrompt("");
    setNewAnswer("");
    setNewExplanation("");
    setNewOptions(["", "", "", ""]);
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 bg-white dark:bg-[#221E32] rounded-3xl border border-[#EAE6DF] dark:border-[#342E4A] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE6DF] dark:border-[#342E4A] flex items-center justify-between">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-[#272334] dark:text-[#FAF9F6] bg-transparent border-b border-transparent hover:border-[#A78BFA] focus:border-[#7C3AED] focus:outline-hidden w-full transition-colors"
            />
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="text-xs text-[#7C3AED] dark:text-[#C4B5FD] font-semibold bg-transparent border-b border-transparent hover:border-[#A78BFA] focus:outline-hidden"
              />
              <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">
                · {questions.length} questions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartStudy(deck, "flashcards")}
              className="px-3 py-1.5 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#6D28D9] dark:text-[#DDD6FE] text-xs font-semibold cursor-pointer"
            >
              Flashcards
            </button>
            <button
              onClick={() => onStartStudy(deck, "quiz")}
              className="px-3 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold cursor-pointer"
            >
              Quiz
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#716982] dark:text-[#A8A1BA] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body / Question Editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#272334] dark:text-[#FAF9F6]">
              Questions in this Deck
            </h3>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] dark:bg-[#1E192D] hover:bg-[#EDE9FE] text-xs font-semibold text-[#7C3AED] dark:text-[#C4B5FD] border border-[#EAE6DF] dark:border-[#342E4A] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Add New Question Card */}
          {isAddingNew && (
            <form onSubmit={handleAddNewQuestion} className="p-4 rounded-2xl bg-[#F5F3FF] dark:bg-[#251E3D] border border-[#DDD6FE] dark:border-[#4C1D95]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#7C3AED] dark:text-[#DDD6FE]">
                  New Question
                </span>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as QuestionType)}
                  className="text-xs px-2 py-1 rounded-lg border border-[#DDD6FE] bg-white dark:bg-[#1E192D]"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="flashcard">Flashcard</option>
                  <option value="identification">Written / Identification</option>
                </select>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Question / Prompt"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#1E192D] text-xs"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Correct Answer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#1E192D] text-xs"
                />
              </div>

              {newType === "multiple_choice" && (
                <div className="grid grid-cols-2 gap-2">
                  {newOptions.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newOptions];
                        copy[i] = e.target.value;
                        setNewOptions(copy);
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#1E192D] text-xs"
                    />
                  ))}
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Educational Explanation (optional)"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#1E192D] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-[#716982]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold"
                >
                  Add Card
                </button>
              </div>
            </form>
          )}

          {/* List of existing questions */}
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isEditing = editingQId === q.id;

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[#716982] dark:text-[#A8A1BA]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#272334] dark:text-[#FAF9F6]">
                        #{idx + 1}
                      </span>
                      <span>·</span>
                      <span className="capitalize">{q.type.replace("_", " ")}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingQId(isEditing ? null : q.id)}
                        className="p-1 rounded-md hover:bg-white dark:hover:bg-[#2F284B]"
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Edit3 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 rounded-md text-[#EF4444] hover:bg-[#FEE2E2]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(q.id, "prompt", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-[#221E32]"
                      />
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => handleUpdateQuestion(q.id, "answer", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-[#221E32]"
                      />
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => handleUpdateQuestion(q.id, "explanation", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-[#221E32]"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-[#272334] dark:text-[#FAF9F6]">
                        {q.prompt}
                      </p>
                      <p className="text-[#10B981] dark:text-[#86EFAC] mt-1 font-medium">
                        Answer: {q.answer}
                      </p>
                      {q.explanation && (
                        <p className="text-[#716982] dark:text-[#A8A1BA] mt-1 italic">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE6DF] dark:border-[#342E4A] flex items-center justify-between">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#EF4444] font-semibold">Delete entire set?</span>
                <button
                  onClick={() => onDeleteDeck(deck.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#EF4444] text-white text-xs font-bold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 text-xs text-[#716982]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Deck</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#716982] hover:bg-[#FAF9F6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDeckDetails}
              className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
