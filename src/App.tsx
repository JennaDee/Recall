/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AppSettings, Deck, Question, StudySession } from "./types";
import { StorageService } from "./utils/storage";
import { isQuestionDue } from "./utils/spacedRepetition";
import { Navigation, NavTab } from "./components/Navigation";
import { DashboardView } from "./components/DashboardView";
import { CreateSetView } from "./components/CreateSetView";
import { LibraryView } from "./components/LibraryView";
import { StudyFlashcardsView } from "./components/StudyFlashcardsView";
import { StudyQuizView } from "./components/StudyQuizView";
import { StudyResultsView } from "./components/StudyResultsView";
import { MistakesReviewView } from "./components/MistakesReviewView";
import { SpacedReviewView } from "./components/SpacedReviewView";
import { SettingsView } from "./components/SettingsView";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [decks, setDecks] = useState<Deck[]>(() => StorageService.getDecks());
  const [sessions, setSessions] = useState<StudySession[]>(() => StorageService.getSessions());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // Active study state
  const [activeStudyDeck, setActiveStudyDeck] = useState<Deck | null>(null);
  const [activeStudyMode, setActiveStudyMode] = useState<"flashcards" | "quiz" | null>(null);
  const [activeQuestionsSubset, setActiveQuestionsSubset] = useState<Question[] | undefined>(undefined);

  // Active results state
  const [completedSession, setCompletedSession] = useState<StudySession | null>(null);
  const [completedMissed, setCompletedMissed] = useState<Question[]>([]);

  // Apply dark mode class to document
  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.theme]);

  // Synchronize storage
  const handleReloadData = () => {
    setDecks(StorageService.getDecks());
    setSessions(StorageService.getSessions());
    setSettings(StorageService.getSettings());
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    handleUpdateSettings({ ...settings, theme: nextTheme });
  };

  const handleSaveDeck = (newDeck: Deck) => {
    StorageService.saveDeck(newDeck);
    setDecks(StorageService.getDecks());
    setCurrentTab("library");
  };

  const handleDeleteDeck = (deckId: string) => {
    StorageService.deleteDeck(deckId);
    setDecks(StorageService.getDecks());
  };

  const handleUpdateQuestion = (deckId: string, updatedQuestion: Question) => {
    StorageService.updateQuestion(deckId, updatedQuestion);
    setDecks(StorageService.getDecks());
  };

  const handleRecordSession = (newSession: StudySession) => {
    StorageService.recordSession(newSession);
    setSessions(StorageService.getSessions());
    setSettings(StorageService.getSettings());
  };

  // Launch a study session
  const handleStartStudy = (
    deck: Deck,
    mode: "flashcards" | "quiz" | "spaced_repetition",
    subset?: Question[]
  ) => {
    setActiveStudyDeck(deck);
    setActiveStudyMode(mode === "spaced_repetition" ? "flashcards" : mode);
    setActiveQuestionsSubset(subset);
    setCompletedSession(null);
    setCompletedMissed([]);
  };

  const handleFinishQuiz = (session: StudySession, missed: Question[]) => {
    setCompletedSession(session);
    setCompletedMissed(missed);
  };

  const handleExitStudy = () => {
    setActiveStudyDeck(null);
    setActiveStudyMode(null);
    setActiveQuestionsSubset(undefined);
    setCompletedSession(null);
    setCompletedMissed([]);
  };

  // Calculate global badges
  let dueCount = 0;
  let unmasteredMistakesCount = 0;

  decks.forEach((deck) => {
    deck.questions.forEach((q) => {
      if (isQuestionDue(q.spacedRepetition)) {
        dueCount++;
      }
      if (q.mistakeCount > 0 && !q.mastered) {
        unmasteredMistakesCount++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#181524] text-[#272334] dark:text-[#F3F1F8] flex flex-col md:flex-row">
      {/* Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => {
          handleExitStudy();
          setCurrentTab(tab);
        }}
        settings={settings}
        onToggleTheme={handleToggleTheme}
        dueCount={dueCount}
        mistakesCount={unmasteredMistakesCount}
        totalDecks={decks.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* If Results Screen is active */}
        {completedSession && activeStudyDeck ? (
          <StudyResultsView
            deck={activeStudyDeck}
            session={completedSession}
            missedQuestions={completedMissed}
            onRetryMistakes={(missed) => {
              handleStartStudy(activeStudyDeck, "quiz", missed);
            }}
            onStudyAgain={() => {
              handleStartStudy(activeStudyDeck, completedSession.mode === "quiz" ? "quiz" : "flashcards");
            }}
            onReturnToDashboard={handleExitStudy}
          />
        ) : /* If Flashcard study session is active */
        activeStudyDeck && activeStudyMode === "flashcards" ? (
          <StudyFlashcardsView
            deck={activeStudyDeck}
            initialQuestions={activeQuestionsSubset}
            onUpdateQuestion={handleUpdateQuestion}
            onRecordSession={handleRecordSession}
            onExit={handleExitStudy}
          />
        ) : /* If Quiz study session is active */
        activeStudyDeck && activeStudyMode === "quiz" ? (
          <StudyQuizView
            deck={activeStudyDeck}
            initialQuestions={activeQuestionsSubset}
            onUpdateQuestion={handleUpdateQuestion}
            onRecordSession={handleRecordSession}
            onExit={handleExitStudy}
            onFinishQuiz={handleFinishQuiz}
          />
        ) : (
          /* Normal Tab Views */
          <>
            {currentTab === "dashboard" && (
              <DashboardView
                decks={decks}
                sessions={sessions}
                currentStreak={settings.streak.currentStreak}
                onSelectTab={setCurrentTab}
                onStartStudy={(deck, mode) => handleStartStudy(deck, mode)}
              />
            )}

            {currentTab === "create" && (
              <CreateSetView
                onSaveDeck={handleSaveDeck}
                onStartStudyDirect={(deck, mode) => {
                  handleSaveDeck(deck);
                  handleStartStudy(deck, mode);
                }}
              />
            )}

            {currentTab === "library" && (
              <LibraryView
                decks={decks}
                onSaveDeck={handleSaveDeck}
                onDeleteDeck={handleDeleteDeck}
                onStartStudy={(deck, mode) => handleStartStudy(deck, mode)}
                onCreateNew={() => setCurrentTab("create")}
              />
            )}

            {currentTab === "spaced" && (
              <SpacedReviewView
                decks={decks}
                onStartDueStudy={(deck, questions, mode) => {
                  handleStartStudy(deck, mode, questions);
                }}
              />
            )}

            {currentTab === "mistakes" && (
              <MistakesReviewView
                decks={decks}
                onUpdateQuestion={handleUpdateQuestion}
                onPracticeMistakes={(deck, questions) => {
                  handleStartStudy(deck, "quiz", questions);
                }}
              />
            )}

            {currentTab === "settings" && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onDataReload={handleReloadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
