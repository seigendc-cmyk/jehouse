import express from "express";
import { createServer as createHttpServer } from "node:http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createHttpServer(app);
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini Client Initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// AI API Endpoints

app.post("/api/ai/book-outline", async (req, res) => {
  try {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const category = typeof req.body?.category === "string" ? req.body.category.trim() : "";
    const userPrompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
    if (!title || !userPrompt || title.length > 200 || userPrompt.length > 4000) {
      return res.status(400).json({ error: "A valid title and outline prompt are required." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Create a structured four-chapter outline for a book titled "${title}" in the category "${category || "General"}".
Author direction: ${userPrompt}

Return a JSON array only:
[
  { "title": "Chapter title", "summary": "Initial opening paragraph text" }
]`,
      config: { responseMimeType: "application/json" },
    });
    const chapters = JSON.parse(response.text || "[]");
    if (!Array.isArray(chapters)) {
      return res.status(502).json({ error: "The outline service returned an invalid response." });
    }
    res.json({ chapters: chapters.slice(0, 12) });
  } catch (error: any) {
    console.error("Book outline API error:", error);
    res.status(500).json({ error: "Failed to generate the book outline." });
  }
});

// 1. Proofread & Grammar Correction
app.post("/api/ai/proofread", async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required for proofreading." });
    }

    const prompt = `You are an expert editorial proofreader for a high-end book publishing press.
Analyze the following text for spelling mistakes, grammar issues, awkward phrasing, tone consistency, and typography errors.
Text to proofread:
"${text}"

${context ? `Book Context / Genre: ${context}` : ""}

Return a JSON array of issues found. Each issue object must have:
- "originalText": exact phrase with the error
- "correction": suggested fix
- "explanation": brief reason for the change
- "type": one of ["spelling", "grammar", "style", "punctuation"]

If no errors are found, return an empty array [].
Do NOT wrap the output in markdown backticks outside of valid JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "[]";
    const issues = JSON.parse(resultText);
    res.json({ issues });
  } catch (error: any) {
    console.error("Proofread API error:", error);
    res.status(500).json({ error: error.message || "Failed to proofread text." });
  }
});

// 2. Story / Content Continuation (AI Co-Author)
app.post("/api/ai/continue-story", async (req, res) => {
  try {
    const { chapterTitle, currentContent, userInstruction, genre, style } = req.body;

    const prompt = `You are a professional co-author helping write a book chapter.
Chapter Title: "${chapterTitle || "Untitled Chapter"}"
Genre / Category: "${genre || "General Fiction / Non-Fiction"}"
Style / Tone: "${style || "Literary and Engaging"}"

Current Chapter Context:
"${currentContent || ""}"

${userInstruction ? `Author's Direction for Continuation: "${userInstruction}"` : "Instruction: Smoothly continue the story/content for 2 to 3 well-crafted paragraphs matching the established narrative flow and tone."}

Please output the continuation text clearly. Maintain high literary quality suitable for industrial book publication.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ continuation: response.text });
  } catch (error: any) {
    console.error("Continue Story API error:", error);
    res.status(500).json({ error: error.message || "Failed to continue story." });
  }
});

// 3. Executive Summary Generator
app.post("/api/ai/executive-summary", async (req, res) => {
  try {
    const { bookTitle, chaptersContent } = req.body;

    const prompt = `You are an executive book editor.
Book Title: "${bookTitle || "Untitled Book"}"

Chapter Synopsis Data:
${chaptersContent}

Write a compelling, structured Executive Summary / Book Synopsis (approx 200-300 words). Include:
1. Core Thesis / Narrative Arc
2. Key Themes or Findings
3. Intended Readership & Value Proposition

Provide the response formatted in Markdown with subheadings.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Executive Summary API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate executive summary." });
  }
});

// 4. Quiz / Assessment Questions Generator
app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { topic, chapterText, questionCount } = req.body;

    const prompt = `Create a set of ${questionCount || 3} multiple-choice quiz questions suitable for a textbook / educational edition of a book.
Topic / Content:
"${chapterText || topic}"

Return a JSON array of question objects. Each question object must have:
- "id": string (e.g. "q1")
- "question": string
- "options": array of 4 string choices
- "correctIndex": number (0 to 3)
- "explanation": brief explanation of the correct answer

Do NOT wrap output in markdown formatting outside JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const questions = JSON.parse(response.text || "[]");
    res.json({ questions });
  } catch (error: any) {
    console.error("Generate Quiz API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz." });
  }
});

// 5. AI Cartoon Book Script & Character Generator
app.post("/api/ai/cartoon-generate-script", async (req, res) => {
  try {
    const { promptConcept, artStyle, targetAudience, pageCount } = req.body;

    const prompt = `You are a world-class children's comic author and cartoon story director.
Create a complete cartoon storybook structure based on this concept:
- Concept: "${promptConcept || "A mischievous cat who builds a cardboard rocket ship"}"
- Art Style: "${artStyle || "disney_3d"}"
- Target Audience: "${targetAudience || "kids_6_8"}"
- Total Pages: ${pageCount || 3}

Return a valid JSON object matching this structure EXACTLY (without extra markdown backticks):
{
  "id": "cartoon-1",
  "title": "Title of cartoon storybook",
  "subtitle": "Short subtitle",
  "themeConcept": "Summary of concept",
  "artStyle": "${artStyle || "disney_3d"}",
  "targetAudience": "${targetAudience || "kids_6_8"}",
  "characters": [
    {
      "id": "char-1",
      "name": "Character Name",
      "speciesRole": "Species or role (e.g. Hero Puppy)",
      "visualDescription": "Detailed visual description for illustrator prompt",
      "personality": "Short personality traits",
      "colorPalette": "#FF6B00, #3B82F6",
      "avatarUrl": "https://picsum.photos/seed/char1/300/300"
    }
  ],
  "pages": [
    {
      "pageNumber": 1,
      "pageTitle": "Page Title",
      "layoutType": "2_panel_horizontal",
      "backgroundSetting": "Setting description",
      "narrativeText": "Opening narration",
      "panels": [
        {
          "id": "p1-panel-1",
          "panelNumber": 1,
          "visualPrompt": "Highly descriptive scene prompt for drawing panel in ${artStyle} style",
          "illustrationUrl": "https://picsum.photos/seed/panel1/800/600",
          "speechBubbles": [
            {
              "id": "b1",
              "speakerName": "Character Name",
              "text": "Funny cartoon dialogue line!",
              "bubbleType": "speech",
              "position": { "x": 30, "y": 20 }
            }
          ],
          "sfxText": "POW!",
          "sfxColor": "#FF6B00",
          "cameraAngle": "wide",
          "narrativeCaption": "Optional comic caption"
        }
      ]
    }
  ],
  "createdAt": "${new Date().toISOString()}",
  "status": "completed"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const cartoonProject = JSON.parse(response.text || "{}");
    res.json({ cartoonProject });
  } catch (error: any) {
    console.error("Cartoon Script API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate cartoon script." });
  }
});

// 6. AI Cartoon Panel Illustration Generator
app.post("/api/ai/cartoon-generate-panel-image", async (req, res) => {
  try {
    const { prompt, artStyle, characterDescriptions } = req.body;

    const fullPrompt = `Vibrant high quality ${artStyle || 'cartoon'} panel illustration: ${prompt}. ${characterDescriptions ? `Characters: ${characterDescriptions}` : ''}`;

    let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt.slice(0, 30))}/800/600`;

    // Attempt Gemini Image generation if API is available
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-image",
        contents: fullPrompt,
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (imgErr) {
      console.warn("Gemini image generation warning, using stylized canvas/picsum url:", imgErr);
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Cartoon Panel Image API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate panel image." });
  }
});

// 7. AI Project Proposal & Financial Model Generator
app.post("/api/ai/proposal-generate", async (req, res) => {
  try {
    const { projectTitle, clientName, category, projectDescription, estimatedBudget, durationMonths } = req.body;

    const b = estimatedBudget || 150000;

    const prompt = `You are an elite corporate proposal architect and CFO financial strategist.
Generate a structured project proposal with executive summary, problem statement, solution, detailed line-item budget breakdown across Q1-Q4, milestone timeline, and risk matrix.

- Project Title: "${projectTitle || "Enterprise Platform Modernization"}"
- Target Client: "${clientName || "Acme Logistics"}"
- Category: "${category || "tech_software"}"
- Estimated Total Budget: $${b}
- Project Duration: ${durationMonths || 6} months
- Brief: "${projectDescription || "Modernization and automated workflow deployment."}"

Return a valid JSON object matching this structure EXACTLY (no markdown backticks):
{
  "proposal": {
    "id": "proposal-${Date.now()}",
    "title": "${projectTitle || "Enterprise Platform Modernization"}",
    "clientName": "${clientName || "Acme Logistics"}",
    "authorName": "PressCraft Strategic Consulting",
    "category": "${category || "tech_software"}",
    "currency": "$",
    "targetBudget": ${b},
    "projectDurationMonths": ${durationMonths || 6},
    "executiveSummary": "Compelling 3-sentence executive summary highlighting strategic alignment, execution methodology, and ROI.",
    "problemStatement": "Detailed problem statement outlining current inefficiencies and operational risks.",
    "proposedSolution": "Clear proposed solution detailing implementation roadmap, system architecture, and deliverables.",
    "budgetItems": [
      {
        "id": "b-1",
        "name": "Senior Software Engineers & System Architects",
        "category": "Personnel",
        "q1Cost": ${Math.round(b * 0.25)},
        "q2Cost": ${Math.round(b * 0.20)},
        "q3Cost": ${Math.round(b * 0.05)},
        "q4Cost": 0
      },
      {
        "id": "b-2",
        "name": "Cloud Infrastructure & Tooling Licenses",
        "category": "Technology & Tools",
        "q1Cost": ${Math.round(b * 0.05)},
        "q2Cost": ${Math.round(b * 0.08)},
        "q3Cost": ${Math.round(b * 0.07)},
        "q4Cost": ${Math.round(b * 0.05)}
      },
      {
        "id": "b-3",
        "name": "Operations & Quality Assurance",
        "category": "Operations & Overhead",
        "q1Cost": ${Math.round(b * 0.03)},
        "q2Cost": ${Math.round(b * 0.03)},
        "q3Cost": ${Math.round(b * 0.02)},
        "q4Cost": ${Math.round(b * 0.02)}
      },
      {
        "id": "b-4",
        "name": "Marketing & Training Enablement",
        "category": "Marketing & Sales",
        "q1Cost": 0,
        "q2Cost": ${Math.round(b * 0.04)},
        "q3Cost": ${Math.round(b * 0.06)},
        "q4Cost": ${Math.round(b * 0.03)}
      },
      {
        "id": "b-5",
        "name": "Risk & Contingency Reserve",
        "category": "Contingency",
        "q1Cost": ${Math.round(b * 0.01)},
        "q2Cost": ${Math.round(b * 0.01)},
        "q3Cost": ${Math.round(b * 0.01)},
        "q4Cost": ${Math.round(b * 0.01)}
      }
    ],
    "milestones": [
      {
        "id": "m-1",
        "phase": "Phase 1: Discovery & Architecture",
        "taskName": "Requirements Mapping & Technical Blueprint",
        "owner": "Lead System Architect",
        "startMonth": 1,
        "durationMonths": 1,
        "estimatedCost": ${Math.round(b * 0.15)},
        "status": "Completed"
      },
      {
        "id": "m-2",
        "phase": "Phase 2: Core Engineering",
        "taskName": "Database Schema & API Development",
        "owner": "Development Team Lead",
        "startMonth": 2,
        "durationMonths": 2,
        "estimatedCost": ${Math.round(b * 0.40)},
        "status": "In Progress"
      },
      {
        "id": "m-3",
        "phase": "Phase 3: Integration & Testing",
        "taskName": "End-to-End Testing & Security Audits",
        "owner": "QA Lead",
        "startMonth": 4,
        "durationMonths": 1,
        "estimatedCost": ${Math.round(b * 0.25)},
        "status": "Planned"
      },
      {
        "id": "m-4",
        "phase": "Phase 4: Launch & Enablement",
        "taskName": "Production Rollout & User Onboarding",
        "owner": "Deployment Manager",
        "startMonth": 5,
        "durationMonths": 2,
        "estimatedCost": ${Math.round(b * 0.20)},
        "status": "Planned"
      }
    ],
    "risks": [
      {
        "id": "r-1",
        "riskName": "Legacy System Integration Delays",
        "impact": "High",
        "probability": "Medium",
        "mitigationStrategy": "Deploy API middleware adapters and run parallel staging environments."
      },
      {
        "id": "r-2",
        "riskName": "Scope Creep & Changing Specifications",
        "impact": "Medium",
        "probability": "Low",
        "mitigationStrategy": "Enforce strict agile change-request signoffs and milestone gates."
      }
    ],
    "expectedRevenueYear1": ${Math.round(b * 1.35)},
    "expectedRevenueYear2": ${Math.round(b * 2.80)},
    "expectedRevenueYear3": ${Math.round(b * 4.50)},
    "sections": [
      {
        "id": "sec-1",
        "title": "Project Scope & Core Objectives",
        "content": "Comprehensive breakdown of key deliverables, milestones, and success metrics.",
        "chartType": "budget_pie"
      },
      {
        "id": "sec-2",
        "title": "Quarterly Financial Outlay & Model",
        "content": "Quarterly budget allocation across personnel, technology, marketing, and operations.",
        "chartType": "cashflow_bar"
      },
      {
        "id": "sec-3",
        "title": "3-Year Yield & ROI Projections",
        "content": "Revenue yield projections demonstrating capital break-even within Year 1.",
        "chartType": "roi_growth"
      }
    ],
    "createdAt": "${new Date().toISOString()}"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const proposal = JSON.parse(response.text || "{}");
    res.json(proposal);
  } catch (error: any) {
    console.error("Proposal API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate proposal." });
  }
});

// Vite / Static Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`PressCraft Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
