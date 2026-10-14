import React, { useState } from "react";
import { 
  Search, 
  PlusCircle, 
  BookOpen, 
  Play, 
  Layers, 
  Clock, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Sparkles,
  Filter
} from "lucide-react";
import { Deck } from "../types";
import { isQuestionDue } from "../utils/spacedRepetition";
import { DeckDetailModal } from "./DeckDetailModal";

interface LibraryViewProps {
  decks: Deck[];
  onSaveDeck: (updated: Deck) => void;
  onDeleteDeck: (id: string) => void;
  onStartStudy: (deck: Deck, mode: "quiz" | "flashcards" | "spaced_repetition") => void;
  onCreateNew: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  decks,
  onSaveDeck,
  onDeleteDeck,
  onStartStudy,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  // Extract distinct subjects
  const subjects = Array.from(new Set(decks.map((d) => d.subject).filter(Boolean)));

  // Filtered decks
  const filteredDecks = decks.filter((deck) => {
    const matchesSearch =
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === "all" || deck.subject.toLowerCase() === selectedSubject.toLowerCase();

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      {/* Page Title & New Deck CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
            Study Library
          </h1>
          <p className="mt-1 text-sm text-[#716982] dark:text-[#A8A1BA]">
            All your generated flashcards and question decks. Unlimited practice attempts anytime.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Set</span>
        </button>
      </div>

      {/* Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#88819A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#221E32] text-xs font-medium text-[#272334] dark:text-[#FAF9F6] placeholder-[#88819A] focus:outline-hidden focus:ring-2 focus:ring-[#A78BFA]"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubject === "all"
                ? "bg-[#7C3AED] text-white"
                : "bg-white dark:bg-[#221E32] text-[#544D63] dark:text-[#C4BED4] border border-[#EAE6DF] dark:border-[#342E4A] hover:bg-[#FAF9F6]"
            }`}
          >
            All ({decks.length})
          </button>
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject.toLowerCase() === subj.toLowerCase()
                  ? "bg-[#7C3AED] text-white"
                  : "bg-white dark:bg-[#221E32] text-[#544D63] dark:text-[#C4BED4] border border-[#EAE6DF] dark:border-[#342E4A] hover:bg-[#FAF9F6]"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] space-y-3">
          <BookOpen className="w-12 h-12 text-[#8B5CF6] mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6]">
            No study decks found
          </h2>
          <p className="text-xs text-[#716982] dark:text-[#A8A1BA] max-w-sm mx-auto">
            {searchQuery
              ? `No decks matching "${searchQuery}". Try a different keyword.`
              : "Generate a set with Gemini AI from your lecture notes to begin practicing."}
          </p>
          <button
            onClick={onCreateNew}
            className="mt-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] cursor-pointer"
          >
            Create Study Set
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => {
            const dueCount = deck.questions.filter((q) => isQuestionDue(q.spacedRepetition)).length;
            const masteredCount = deck.questions.filter((q) => q.mastered).length;
            const masteryRate = deck.questions.length > 0
              ? Math.round((masteredCount / deck.questions.length) * 100)
              : 0;

            return (
              <div
                key={deck.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] hover:border-[#DDD6FE] dark:hover:border-[#4C1D95]/60 transition-all flex flex-col justify-between shadow-xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA] mb-2">
                    <span className="font-semibold text-[#7C3AED] dark:text-[#C4B5FD]">
                      {deck.subject}
                    </span>
                    <button
                      onClick={() => setEditingDeck(deck)}
                      className="p-1 rounded-md text-[#716982] hover:text-[#272334] dark:hover:text-[#FAF9F6] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B]"
                      title="Edit deck & questions"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h2 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6] line-clamp-1">
                    {deck.title}
                  </h2>

                  {deck.description && (
                    <p className="text-xs text-[#544D63] dark:text-[#A8A1BA] mt-1 line-clamp-2">
                      {deck.description}
                    </p>
                  )}

                  {/* Metadata line */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#716982] dark:text-[#A8A1BA]">
                    <span>{deck.questions.length} cards</span>
                    <span>·</span>
                    <span>{masteryRate}% mastered</span>
                    {dueCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-[#8B5CF6] font-semibold">{dueCount} due</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[#F0ECE1] dark:border-[#2D2744] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingDeck(deck)}
                    className="text-xs font-semibold text-[#716982] dark:text-[#A8A1BA] hover:text-[#272334] dark:hover:text-[#FAF9F6] cursor-pointer"
                  >
                    Edit Cards
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onStartStudy(deck, "flashcards")}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] dark:bg-[#1E192D] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B] text-[#544D63] dark:text-[#C4BED4] text-xs font-semibold transition-colors cursor-pointer"
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

      {/* Edit Deck Modal */}
      {editingDeck && (
        <DeckDetailModal
          deck={editingDeck}
          onClose={() => setEditingDeck(null)}
          onSaveDeck={onSaveDeck}
          onDeleteDeck={(id) => {
            onDeleteDeck(id);
            setEditingDeck(null);
          }}
          onStartStudy={(deck, mode) => {
            setEditingDeck(null);
            onStartStudy(deck, mode);
          }}
        />
      )}
    </div>
  );
};
