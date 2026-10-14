import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization with user-agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Generate Questions from notes
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { deckTitle, subject, notes, count, difficulty, questionType } = req.body;

    if (!notes || typeof notes !== "string" || notes.trim().length === 0) {
      return res.status(400).json({ error: "Study notes are required." });
    }

    const questionCount = Math.min(Math.max(parseInt(count, 10) || 5, 3), 30);
    const ai = getGeminiClient();

    const systemInstruction = `You are Recall's specialized pedagogical question generator.
Analyze the user's provided study notes and generate exactly ${questionCount} high-yield, interactive study questions.
Rules:
1. Ground strictly in the provided study material. Avoid hallucinating or inventing facts not in or directly implied by the notes.
2. Cover major concepts, definitions, mechanisms, and key relationships without repeating the same core question.
3. Target difficulty: "${difficulty}" (if "mixed", provide a balanced blend of easy, medium, and hard).
4. Target question type: "${questionType}" (if "mixed", generate a balanced blend of multiple_choice, flashcard, and identification).
5. For multiple_choice questions:
   - Provide exactly 4 options in the 'options' array.
   - The correct answer MUST be one of the 4 items in 'options'.
   - The other 3 options must be plausible distractors related to the topic.
   - Randomize the position of the correct answer among the 4 choices.
6. For flashcard questions:
   - 'prompt' is a clear, concise question or front prompt.
   - 'answer' is the clear key answer.
   - 'explanation' provides concise context or memory hook.
7. For identification questions:
   - 'prompt' asks for a specific term, concept, person, date, or formula.
   - 'answer' is the standard expected short answer.
   - 'acceptableAnswers' is an array of valid synonyms, alternate spellings, or equivalent acronyms.
8. Each question must include an educational explanation clarifying why the answer is correct.`;

    const userPrompt = `Subject: ${subject || "General Study"}
Deck Title: ${deckTitle || "Untitled Study Deck"}
Target Question Count: ${questionCount}
Requested Question Type: ${questionType}
Requested Difficulty: ${difficulty}

STUDY MATERIAL:
"""
${notes}
"""

Generate the questions in JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "Must be 'multiple_choice', 'flashcard', or 'identification'",
              },
              difficulty: {
                type: Type.STRING,
                description: "Must be 'easy', 'medium', or 'hard'",
              },
              prompt: {
                type: Type.STRING,
                description: "The question text or flashcard front prompt.",
              },
              answer: {
                type: Type.STRING,
                description: "The correct answer or flashcard back.",
              },
              explanation: {
                type: Type.STRING,
                description: "Educational explanation of why the answer is correct.",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Required for multiple_choice: exactly 4 choices containing the correct answer and 3 plausible distractors.",
              },
              acceptableAnswers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "For identification: acceptable alternative answers, acronyms, or variants.",
              },
              topic: {
                type: Type.STRING,
                description: "Subtopic or concept tag.",
              },
            },
            required: ["type", "difficulty", "prompt", "answer", "explanation"],
          },
        },
      },
    });

    const rawText = response.text?.trim() || "[]";
    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch {
      // Fallback clean extraction if JSON wrapped in markdown
      const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
      questions = JSON.parse(cleaned);
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: "Failed to generate structured question list." });
    }

    // Sanitize and ensure full compliance
    const sanitized = questions.map((q: any, index: number) => {
      let qType = q.type;
      if (!["multiple_choice", "flashcard", "identification"].includes(qType)) {
        qType = q.options && q.options.length >= 2 ? "multiple_choice" : "flashcard";
      }

      let options = q.options;
      if (qType === "multiple_choice") {
        if (!Array.isArray(options) || options.length < 2) {
          // Fallback options
          options = [q.answer, "None of the above", "Partially correct", "Alternative interpretation"];
        } else if (!options.includes(q.answer)) {
          options[0] = q.answer;
        }
        // Ensure options array has at most 4 items and contains answer
        options = options.slice(0, 4);
      }

      return {
        id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
        type: qType,
        difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
        prompt: q.prompt || "Question prompt",
        answer: q.answer || "Answer",
        explanation: q.explanation || "Review the study notes for full context.",
        options: qType === "multiple_choice" ? options : undefined,
        acceptableAnswers: Array.isArray(q.acceptableAnswers) ? q.acceptableAnswers : [q.answer],
        topic: q.topic || subject || "General",
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
    });

    return res.json({ questions: sanitized });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate questions. Please try again.",
    });
  }
});

// API: AI-assisted Evaluation of Written/Identification answers
app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { prompt, expectedAnswer, acceptableAnswers, userAnswer } = req.body;

    if (!userAnswer || typeof userAnswer !== "string") {
      return res.json({ isCorrect: false, feedback: "No answer was provided." });
    }

    // Quick client-independent check first to save LLM tokens if exact or listed in acceptable
    const cleanUser = userAnswer.trim().toLowerCase();
    const cleanExpected = (expectedAnswer || "").trim().toLowerCase();
    const cleanAcceptable = (acceptableAnswers || []).map((a: string) => a.trim().toLowerCase());

    if (cleanUser === cleanExpected || cleanAcceptable.includes(cleanUser)) {
      return res.json({
        isCorrect: true,
        feedback: "Exact match! Outstanding recall.",
      });
    }

    // Call Gemini 3.8 Flash for semantic checking
    const ai = getGeminiClient();
    const evaluationPrompt = `Question: "${prompt}"
Expected Answer: "${expectedAnswer}"
Acceptable Variations: ${JSON.stringify(acceptableAnswers || [])}
Student's Answer: "${userAnswer}"

Evaluate if the student's answer accurately captures the required concept or is semantically correct despite phrasing variations or minor typos.
Be encouraging and fair. If borderline or partially correct with the main key idea, you may mark it correct.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: evaluationPrompt,
      config: {
        systemInstruction:
          "You are an encouraging academic grader. Respond only with JSON: { 'isCorrect': boolean, 'feedback': '1-2 sentence constructive explanation' }",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING },
          },
          required: ["isCorrect", "feedback"],
        },
      },
    });

    const raw = response.text?.trim() || "{}";
    const result = JSON.parse(raw);

    return res.json({
      isCorrect: Boolean(result.isCorrect),
      feedback: result.feedback || (result.isCorrect ? "Great answer!" : `Expected: ${expectedAnswer}`),
    });
  } catch (error: any) {
    console.error("Error evaluating answer:", error);
    // Graceful fallback for semantic evaluation failure
    return res.status(500).json({
      error: "Could not perform AI evaluation.",
    });
  }
});

// Serve frontend with Vite in dev, or static dist in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Recall server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
