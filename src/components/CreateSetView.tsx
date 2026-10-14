import React, { useState } from "react";
import { 
  Sparkles, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  FileText, 
  ListFilter, 
  Plus, 
  Play, 
  Layers,
  HelpCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { 
  Deck, 
  Question, 
  GenerationDifficulty, 
  GenerationQuestionType, 
  QuestionDifficulty, 
  QuestionType 
} from "../types";

interface CreateSetViewProps {
  onSaveDeck: (deck: Deck) => void;
  onStartStudyDirect: (deck: Deck, mode: "quiz" | "flashcards") => void;
}

const SAMPLE_NOTES = [
  {
    title: "Cellular Biology: Photosynthesis & Respiration",
    subject: "Biology",
    content: `Photosynthesis is the biochemical process by which photoautotrophs convert light energy into chemical energy stored in glucose.
It occurs in chloroplasts and consists of two main stages:
1. Light-Dependent Reactions: Take place in the thylakoid membrane. Chlorophyll absorbs photon energy, exciting electrons. Water is split (photolysis) into oxygen gas, protons, and electrons. This creates an electrochemical proton gradient powering ATP synthase, producing ATP and reducing NADP+ to NADPH.
2. The Calvin Cycle (Light-Independent Reactions): Occurs in the stroma. Carbon dioxide is fixed by the enzyme RuBisCO (ribulose-1,5-bisphosphate carboxylase/oxygenase) into 3-phosphoglycerate (3-PGA). ATP and NADPH reduce 3-PGA into glyceraldehyde 3-phosphate (G3P), which eventually forms glucose.

Cellular Respiration is the catabolic process that breaks down glucose to generate ATP. It takes place in the cytosol and mitochondria across four stages:
1. Glycolysis (cytosol): Glucose is split into two pyruvate molecules, yielding a net 2 ATP and 2 NADH.
2. Pyruvate Oxidation (mitochondrial matrix): Converts pyruvate to acetyl-CoA, releasing CO2 and 1 NADH per pyruvate.
3. Citric Acid Cycle / Krebs Cycle (mitochondrial matrix): Acetyl-CoA combines with oxaloacetate to form citrate. Produces 2 ATP/GTP, 6 NADH, and 2 FADH2 per glucose.
4. Oxidative Phosphorylation: The electron transport chain on the inner mitochondrial membrane pumps protons into the intermembrane space. Oxygen acts as the final electron acceptor, forming water. Chemiosmosis generates approximately 30-32 ATP per glucose.`,
  },
  {
    title: "The Industrial Revolution & Modern Labor",
    subject: "History",
    content: `The Industrial Revolution began in Great Britain in the mid-18th century (around 1760) before spreading across Western Europe and the United States.
Key factors facilitating Britain's early lead:
1. Vast domestic coal and iron reserves.
2. Agricultural Revolution that improved crop yields, leaving a surplus labor force.
3. Established colonial trade networks supplying raw materials like cotton and ready consumer markets.
4. Strong legal protections for private property and patents.

Landmark inventions:
- The Flying Shuttle (John Kay, 1733) and Spinning Jenny (James Hargreaves, 1764) revolutionized textile manufacturing.
- James Watt's improved steam engine (1769–1776) with a separate condenser made steam power exponentially more efficient, liberating factories from watermill riverbanks.
- George Stephenson's Rocket locomotive (1829) demonstrated the viability of commercial rail transport.

Social consequences:
Rapid urbanization created crowded industrial cities such as Manchester, leading to rampant sanitation crises and cholera epidemics.
Working conditions in early factories included 12-16 hour workdays, hazardous machinery, and extensive child labor. This prompted the Factory Acts in Britain (such as the Factory Act of 1833), which regulated minimum ages and working hours for youth, ultimately catalyzing the modern labor union movement.`,
  },
  {
    title: "Algorithms: Graph Traversal & Big-O",
    subject: "Computer Science",
    content: `Graph traversal algorithms visit all vertices and edges in a graph systematic fashion.
Two fundamental algorithms:
1. Breadth-First Search (BFS): Explores neighbor nodes level-by-level using a FIFO (First-In, First-Out) queue. It guarantees finding the shortest path on unweighted graphs.
Time complexity is O(V + E) where V is vertices and E is edges. Space complexity is O(V) to maintain the queue and visited set.

2. Depth-First Search (DFS): Explores as deep as possible along each branch before backtracking using a LIFO stack or recursive call stack.
Useful for topological sorting, cycle detection in directed graphs, and solving mazes.
Time complexity is O(V + E). Space complexity is O(V) in the worst case (e.g., skewed linear graph).

Dijkstra's Algorithm finds the shortest path from a single source to all vertices in a weighted graph with non-negative edge weights.
Using a binary min-heap priority queue, Dijkstra runs in O((V + E) log V) time. If edge weights are negative, Dijkstra fails, and the Bellman-Ford algorithm O(V * E) must be used instead.`,
  },
];

export const CreateSetView: React.FC<CreateSetViewProps> = ({
  onSaveDeck,
  onStartStudyDirect,
}) => {
  const [deckTitle, setDeckTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<GenerationDifficulty>("mixed");
  const [questionType, setQuestionType] = useState<GenerationQuestionType>("mixed");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Review stage after generation
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const handleApplySample = (sample: typeof SAMPLE_NOTES[0]) => {
    setDeckTitle(sample.title);
    setSubject(sample.subject);
    setNotes(sample.content);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Please paste lecture notes or study content first.");
      return;
    }
    if (!deckTitle.trim()) {
      setError("Please provide a title for this study set.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Progressive step indicator
    setLoadingStep("Reading and analyzing study materials...");
    const timer1 = setTimeout(() => {
      setLoadingStep("Extracting key concepts, mechanisms, and relationships...");
    }, 1800);
    const timer2 = setTimeout(() => {
      setLoadingStep("Drafting active recall questions and plausible distractors...");
    }, 4000);
    const timer3 = setTimeout(() => {
      setLoadingStep("Verifying educational explanations and answer keys...");
    }, 7000);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckTitle: deckTitle.trim(),
          subject: subject.trim() || "General",
          notes: notes.trim(),
          count,
          difficulty,
          questionType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate study questions.");
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions were returned. Please try with more detailed notes.");
      }

      setGeneratedQuestions(data.questions);
    } catch (err: any) {
      console.error("Generation error:", err);
      // Notes are strictly preserved in state so user doesn't lose work!
      setError(err.message || "An error occurred during generation. Please check your notes and try again.");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleRemoveQuestion = (id: string) => {
    if (!generatedQuestions) return;
    setGeneratedQuestions(generatedQuestions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestionField = (
    id: string,
    field: "prompt" | "answer" | "explanation",
    val: string
  ) => {
    if (!generatedQuestions) return;
    setGeneratedQuestions(
      generatedQuestions.map((q) => (q.id === id ? { ...q, [field]: val } : q))
    );
  };

  const handleFinishAndSave = (startMode?: "quiz" | "flashcards") => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const newDeck: Deck = {
      id: `deck_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: deckTitle.trim() || "Untitled Study Set",
      subject: subject.trim() || "General",
      description: `Generated from study notes covering ${notes.trim().slice(0, 100)}...`,
      sourceNotes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: generatedQuestions,
    };

    onSaveDeck(newDeck);

    if (startMode) {
      onStartStudyDirect(newDeck, startMode);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272334] dark:text-[#FAF9F6] tracking-tight">
          Create Study Set
        </h1>
        <p className="mt-1 text-sm text-[#716982] dark:text-[#A8A1BA]">
          Paste lecture slides, textbook excerpts, or reviewer notes. Gemini AI will convert them into active recall flashcards and quiz questions.
        </p>
      </div>

      {/* Review Stage if questions have been generated */}
      {generatedQuestions ? (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="p-5 rounded-2xl bg-[#EDE9FE] dark:bg-[#2D234C] border border-[#DDD6FE] dark:border-[#4C1D95]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white">
                  {generatedQuestions.length} Questions Ready
                </span>
                <span className="text-xs text-[#544D63] dark:text-[#DDD6FE]">
                  Review or edit questions below before saving
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#272334] dark:text-[#FAF9F6] mt-1">
                {deckTitle}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setGeneratedQuestions(null)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1E192D] text-[#544D63] dark:text-[#C4BED4] hover:bg-[#FAF9F6] text-xs font-medium border border-[#EAE6DF] dark:border-[#3E365E] transition-colors cursor-pointer"
              >
                Back to Edit Notes
              </button>
              <button
                onClick={() => handleFinishAndSave("flashcards")}
                className="px-4 py-2 rounded-xl bg-[#EDE9FE] dark:bg-[#342A5C] text-[#6D28D9] dark:text-[#DDD6FE] text-xs font-semibold hover:bg-[#DDD6FE] transition-colors cursor-pointer"
              >
                Study Flashcards
              </button>
              <button
                onClick={() => handleFinishAndSave("quiz")}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Save & Quiz</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-[#716982] dark:text-[#A8A1BA]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#272334] dark:text-[#FAF9F6]">
                        Question {idx + 1}
                      </span>
                      <span>·</span>
                      <span className="capitalize font-medium text-[#7C3AED] dark:text-[#C4B5FD]">
                        {q.type.replace("_", " ")}
                      </span>
                      <span>·</span>
                      <span className="capitalize text-[#88819A]">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingQuestionId(isEditing ? null : q.id)}
                        className="p-1.5 rounded-lg text-[#716982] dark:text-[#A8A1BA] hover:bg-[#FAF9F6] dark:hover:bg-[#2F284B] transition-colors"
                        title={isEditing ? "Done editing" : "Edit question"}
                      >
                        {isEditing ? <Check className="w-4 h-4 text-[#10B981]" /> : <Edit3 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1.5 rounded-lg text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#451A1A] transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-[#544D63] dark:text-[#A8A1BA] block mb-1">
                          Prompt / Question
                        </label>
                        <input
                          type="text"
                          value={q.prompt}
                          onChange={(e) => handleUpdateQuestionField(q.id, "prompt", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-[#FAF9F6] dark:bg-[#1E192D] text-sm text-[#272334] dark:text-[#FAF9F6]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#544D63] dark:text-[#A8A1BA] block mb-1">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={q.answer}
                          onChange={(e) => handleUpdateQuestionField(q.id, "answer", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-[#FAF9F6] dark:bg-[#1E192D] text-sm text-[#272334] dark:text-[#FAF9F6]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[#544D63] dark:text-[#A8A1BA] block mb-1">
                          Explanation
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestionField(q.id, "explanation", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-[#FAF9F6] dark:bg-[#1E192D] text-sm text-[#272334] dark:text-[#FAF9F6]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm sm:text-base text-[#272334] dark:text-[#FAF9F6]">
                        {q.prompt}
                      </p>

                      {q.type === "multiple_choice" && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          {q.options.map((opt, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-xl text-xs font-medium border ${
                                opt === q.answer
                                  ? "bg-[#F0FDF4] dark:bg-[#143823] border-[#BBF7D0] dark:border-[#1E5D38] text-[#166534] dark:text-[#86EFAC]"
                                  : "bg-[#FAF9F6] dark:bg-[#1E192D] border-[#EAE6DF] dark:border-[#342E4A] text-[#544D63] dark:text-[#C4BED4]"
                              }`}
                            >
                              <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type !== "multiple_choice" && (
                        <div className="mt-2 p-2.5 rounded-xl bg-[#F5F3FF] dark:bg-[#251E3D] border border-[#DDD6FE] dark:border-[#4C1D95]/40 text-xs text-[#581C87] dark:text-[#DDD6FE]">
                          <span className="font-semibold mr-1">Answer:</span>
                          {q.answer}
                        </div>
                      )}

                      <p className="text-xs text-[#716982] dark:text-[#A8A1BA] mt-2 italic">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => handleFinishAndSave()}
              className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Save to Library
            </button>
          </div>
        </div>
      ) : (
        /* Input Form */
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Quick Presets / Try Samples */}
          <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#1E192D] border border-[#EAE6DF] dark:border-[#342E4A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#544D63] dark:text-[#A8A1BA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Quick Test: Load Pre-made Sample Notes</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_NOTES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#2A2341] hover:bg-[#EDE9FE] dark:hover:bg-[#382B5C] text-xs font-medium text-[#272334] dark:text-[#FAF9F6] border border-[#EAE6DF] dark:border-[#3E365E] transition-colors cursor-pointer"
                >
                  {sample.subject}: {sample.title.split(":")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Details Row: Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6]">
                Set Title <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g. Molecular Genetics Chapter 4"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#221E32] text-sm text-[#272334] dark:text-[#FAF9F6] placeholder-[#88819A] focus:outline-hidden focus:ring-2 focus:ring-[#A78BFA]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6]">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology, History"
                className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#221E32] text-sm text-[#272334] dark:text-[#FAF9F6] placeholder-[#88819A] focus:outline-hidden focus:ring-2 focus:ring-[#A78BFA]"
              />
            </div>
          </div>

          {/* Notes Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6]">
                Lecture Notes or Study Material <span className="text-[#EF4444]">*</span>
              </label>
              <span className="text-xs text-[#716982] dark:text-[#A8A1BA] tabular-nums">
                {notes.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              required
              rows={9}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste your lecture transcript, syllabus outline, book chapter, summary, or study notes here..."
              className="w-full px-4 py-3 rounded-2xl border border-[#EAE6DF] dark:border-[#342E4A] bg-white dark:bg-[#221E32] text-sm text-[#272334] dark:text-[#FAF9F6] placeholder-[#88819A] focus:outline-hidden focus:ring-2 focus:ring-[#A78BFA] leading-relaxed resize-y"
            />
          </div>

          {/* Settings Grid: Count, Difficulty, Question Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-white dark:bg-[#221E32] border border-[#EAE6DF] dark:border-[#342E4A] shadow-xs">
            {/* Number of Questions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6] block">
                Question Count
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      count === num
                        ? "bg-[#7C3AED] text-white shadow-xs"
                        : "bg-[#FAF9F6] dark:bg-[#1E192D] text-[#544D63] dark:text-[#C4BED4] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B]"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6] block">
                Target Difficulty
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["mixed", "easy", "medium", "hard"] as GenerationDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      difficulty === diff
                        ? "bg-[#7C3AED] text-white shadow-xs"
                        : "bg-[#FAF9F6] dark:bg-[#1E192D] text-[#544D63] dark:text-[#C4BED4] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B]"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#272334] dark:text-[#FAF9F6] block">
                Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "mixed", label: "Mixed" },
                  { id: "multiple_choice", label: "Multiple Choice" },
                  { id: "flashcard", label: "Flashcards" },
                  { id: "identification", label: "Written" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setQuestionType(type.id as GenerationQuestionType)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      questionType === type.id
                        ? "bg-[#7C3AED] text-white shadow-xs"
                        : "bg-[#FAF9F6] dark:bg-[#1E192D] text-[#544D63] dark:text-[#C4BED4] hover:bg-[#EDE9FE] dark:hover:bg-[#2F284B]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-[#3C1818] border border-[#FCA5A5] dark:border-[#7F1D1D] flex items-start gap-3 text-xs text-[#991B1B] dark:text-[#FCA5A5]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Unable to generate</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
                <p className="mt-1 text-[11px] text-[#B91C1C] dark:text-[#F87171]">
                  Your notes above have been preserved. You can edit them or try again.
                </p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#716982] dark:text-[#A8A1BA]">
              Questions are saved locally for unlimited lifetime practice sessions.
            </span>

            <button
              type="submit"
              disabled={isLoading || !notes.trim()}
              className={`px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isLoading || !notes.trim()
                  ? "bg-[#EAE6DF] dark:bg-[#342E4A] text-[#88819A] cursor-not-allowed"
                  : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white hover:shadow-md"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Study Set...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Loading Animation Card */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-[#EDE9FE] dark:bg-[#261E3E] border border-[#DDD6FE] dark:border-[#4C1D95]/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center animate-bounce shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#272334] dark:text-[#FAF9F6]">
                Analyzing Study Notes
              </h3>
              <p className="text-xs text-[#6D28D9] dark:text-[#C4B5FD] font-medium animate-pulse">
                {loadingStep || "Synthesizing high-yield questions..."}
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
