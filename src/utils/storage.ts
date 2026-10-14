import { AppSettings, Deck, Question, StudySession } from "../types";

const DECKS_KEY = "recall_study_decks_v1";
const SESSIONS_KEY = "recall_study_sessions_v1";
const SETTINGS_KEY = "recall_app_settings_v1";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  animationsEnabled: true,
  streak: {
    currentStreak: 1,
    lastStudyDate: null,
    bestStreak: 1,
  },
};

const SEED_DECK: Deck = {
  id: "deck_seed_memory_science",
  title: "Memory & Learning Science",
  subject: "Cognitive Science",
  description: "Core principles of how the human brain retains information: active recall, spaced repetition, and memory consolidation.",
  sourceNotes: `Active recall is a principle of efficient learning which claims the need to actively stimulate memory during the learning process. It contrasts with passive review, in which the learning material is processed passively (e.g., by reading, watching).

Hermann Ebbinghaus discovered the Forgetting Curve, showing that memory retention halves within days unless reinforced. Spaced repetition increases intervals between study sessions to exploit the psychological spacing effect.

Cognitive Load Theory posits that working memory has limited capacity. Extraneous cognitive load hinders schema acquisition. Dual coding theory suggests that combining verbal and visual information enhances retrieval.

The Testing Effect demonstrates that retrieving information from memory produces superior long-term retention compared to restudying the same material for an equivalent duration.`,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date().toISOString(),
  lastStudiedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  questions: [
    {
      id: "q_seed_1",
      type: "multiple_choice",
      difficulty: "medium",
      prompt: "What is the primary difference between active recall and passive review?",
      answer: "Active recall stimulates memory retrieval, whereas passive review only re-reads or absorbs information",
      explanation: "Active recall forces the brain to retrieve information from long-term memory, strengthening neural retrieval pathways, unlike passive re-reading which gives an illusion of mastery.",
      options: [
        "Active recall stimulates memory retrieval, whereas passive review only re-reads or absorbs information",
        "Active recall is only useful for mathematics, while passive review is for humanities",
        "Active recall requires memorizing text word-for-word without understanding",
        "Passive review produces significantly higher long-term retention rates than active testing",
      ],
      topic: "Active Recall",
      spacedRepetition: {
        easeFactor: 2.5,
        interval: 1,
        repetition: 1,
        lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 0,
      correctCount: 2,
    },
    {
      id: "q_seed_2",
      type: "flashcard",
      difficulty: "easy",
      prompt: "Who pioneered experimental studies on the Forgetting Curve and Spacing Effect?",
      answer: "Hermann Ebbinghaus",
      explanation: "German psychologist Hermann Ebbinghaus conducted rigorous empirical self-experiments in the late 19th century using nonsense syllables, mapping the exponential decay of memory over time.",
      topic: "The Forgetting Curve",
      spacedRepetition: {
        easeFactor: 2.6,
        interval: 2,
        repetition: 1,
        lastReviewedDate: new Date(Date.now() - 86400000).toISOString(),
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 0,
      correctCount: 1,
    },
    {
      id: "q_seed_3",
      type: "identification",
      difficulty: "hard",
      prompt: "What is the psychological phenomenon where retrieving information produces stronger long-term retention than an equal period of restudying?",
      answer: "Testing effect",
      acceptableAnswers: ["The Testing Effect", "Testing Effect", "Retrieval Practice", "Retrieval Effect"],
      explanation: "Also known as retrieval practice, the testing effect is one of the most robust findings in cognitive psychology: testing is a powerful learning event, not merely an assessment.",
      topic: "Testing Effect",
      spacedRepetition: {
        easeFactor: 2.3,
        interval: 0,
        repetition: 0,
        lastReviewedDate: null,
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 1,
      correctCount: 1,
    },
    {
      id: "q_seed_4",
      type: "multiple_choice",
      difficulty: "medium",
      prompt: "According to Cognitive Load Theory, why does excessive extraneous load hinder learning?",
      answer: "It consumes limited working memory capacity needed for schema acquisition",
      explanation: "Working memory can only hold a small number of information chunks simultaneously. Extraneous load from poor design wastes mental bandwidth that should go to constructing schemas.",
      options: [
        "It consumes limited working memory capacity needed for schema acquisition",
        "It speeds up mental fatigue before sensory registers can receive input",
        "It permanently degrades long-term episodic memory storage",
        "It alters the synaptic neurotransmitters involved in motor reflexes",
      ],
      topic: "Cognitive Load",
      spacedRepetition: {
        easeFactor: 2.5,
        interval: 1,
        repetition: 0,
        lastReviewedDate: null,
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 0,
      correctCount: 0,
    },
    {
      id: "q_seed_5",
      type: "flashcard",
      difficulty: "easy",
      prompt: "What does Dual Coding Theory propose regarding information retention?",
      answer: "Combining verbal and visual representations creates dual associative pathways that enhance recall.",
      explanation: "Proposed by Allan Paivio, dual coding suggests human minds process verbal and non-verbal information through separate cognitive channels, reinforcing memory when both are engaged.",
      topic: "Dual Coding",
      spacedRepetition: {
        easeFactor: 2.5,
        interval: 1,
        repetition: 0,
        lastReviewedDate: null,
        nextReviewDate: new Date().toISOString(),
      },
      mastered: false,
      mistakeCount: 0,
      correctCount: 1,
    },
  ],
};

const SEED_SESSIONS: StudySession[] = [
  {
    id: "session_seed_1",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "flashcards",
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    totalQuestions: 5,
    correctAnswers: 3,
    incorrectAnswers: 2,
    accuracy: 60,
    mistakeQuestionIds: ["q_seed_3", "q_seed_4"],
  },
  {
    id: "session_seed_2",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "quiz",
    startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    accuracy: 80,
    mistakeQuestionIds: ["q_seed_3"],
  },
  {
    id: "session_seed_3",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "flashcards",
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    accuracy: 80,
    mistakeQuestionIds: ["q_seed_4"],
  },
  {
    id: "session_seed_4",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "quiz",
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    accuracy: 80,
    mistakeQuestionIds: ["q_seed_3"],
  },
  {
    id: "session_seed_5",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "flashcards",
    startedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    totalQuestions: 5,
    correctAnswers: 5,
    incorrectAnswers: 0,
    accuracy: 100,
    mistakeQuestionIds: [],
  },
  {
    id: "session_seed_6",
    deckId: "deck_seed_memory_science",
    deckTitle: "Memory & Learning Science",
    mode: "quiz",
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    totalQuestions: 5,
    correctAnswers: 5,
    incorrectAnswers: 0,
    accuracy: 100,
    mistakeQuestionIds: [],
  },
];

export const StorageService = {
  getDecks(): Deck[] {
    try {
      const data = localStorage.getItem(DECKS_KEY);
      if (!data) {
        localStorage.setItem(DECKS_KEY, JSON.stringify([SEED_DECK]));
        return [SEED_DECK];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(DECKS_KEY, JSON.stringify([SEED_DECK]));
      return [SEED_DECK];
    } catch (e) {
      console.error("Error reading decks from localStorage:", e);
      return [SEED_DECK];
    }
  },

  saveDecks(decks: Deck[]): void {
    try {
      localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
    } catch (e) {
      console.error("Error saving decks to localStorage:", e);
    }
  },

  getDeckById(id: string): Deck | undefined {
    const decks = this.getDecks();
    return decks.find((d) => d.id === id);
  },

  saveDeck(deck: Deck): void {
    const decks = this.getDecks();
    const existingIndex = decks.findIndex((d) => d.id === deck.id);
    if (existingIndex >= 0) {
      decks[existingIndex] = deck;
    } else {
      decks.unshift(deck);
    }
    this.saveDecks(decks);
  },

  deleteDeck(id: string): void {
    const decks = this.getDecks().filter((d) => d.id !== id);
    this.saveDecks(decks);
  },

  updateQuestion(deckId: string, updatedQuestion: Question): void {
    const decks = this.getDecks();
    const deck = decks.find((d) => d.id === deckId);
    if (!deck) return;

    const qIndex = deck.questions.findIndex((q) => q.id === updatedQuestion.id);
    if (qIndex >= 0) {
      deck.questions[qIndex] = updatedQuestion;
      deck.updatedAt = new Date().toISOString();
      this.saveDecks(decks);
    }
  },

  getSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(SEED_SESSIONS));
        return SEED_SESSIONS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(SEED_SESSIONS));
      return SEED_SESSIONS;
    } catch {
      return SEED_SESSIONS;
    }
  },

  recordSession(session: StudySession): void {
    try {
      const sessions = this.getSessions();
      sessions.unshift(session);
      // Keep last 100 sessions
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)));

      // Update deck lastStudiedAt
      const decks = this.getDecks();
      const deck = decks.find((d) => d.id === session.deckId);
      if (deck) {
        deck.lastStudiedAt = session.completedAt;
        this.saveDecks(decks);
      }

      // Update study streak
      this.updateStreak();
    } catch (e) {
      console.error("Error recording session:", e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        streak: {
          ...DEFAULT_SETTINGS.streak,
          ...(parsed.streak || {}),
        },
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  },

  updateStreak(): void {
    const settings = this.getSettings();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastDate = settings.streak.lastStudyDate;

    if (lastDate === today) {
      // Already studied today
      return;
    }

    if (!lastDate) {
      settings.streak.currentStreak = 1;
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (lastDate === yesterday) {
        settings.streak.currentStreak += 1;
      } else {
        // Streak broken
        settings.streak.currentStreak = 1;
      }
    }

    settings.streak.lastStudyDate = today;
    if (settings.streak.currentStreak > settings.streak.bestStreak) {
      settings.streak.bestStreak = settings.streak.currentStreak;
    }

    this.saveSettings(settings);
  },

  exportAllData(): string {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      decks: this.getDecks(),
      sessions: this.getSessions(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.decks)) {
        return { success: false, message: "Invalid backup format: missing decks array." };
      }

      // Validate deck structure
      for (const d of parsed.decks) {
        if (!d.id || !d.title || !Array.isArray(d.questions)) {
          return { success: false, message: "Corrupted deck found in backup file." };
        }
      }

      this.saveDecks(parsed.decks);
      if (Array.isArray(parsed.sessions)) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(parsed.sessions));
      }
      if (parsed.settings) {
        this.saveSettings({
          ...DEFAULT_SETTINGS,
          ...parsed.settings,
        });
      }

      return { success: true, message: `Successfully restored ${parsed.decks.length} study decks!` };
    } catch (e: any) {
      return { success: false, message: `Failed to import: ${e.message}` };
    }
  },

  resetAllData(): void {
    localStorage.removeItem(DECKS_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    this.saveDecks([SEED_DECK]);
    this.saveSettings(DEFAULT_SETTINGS);
  },
};
