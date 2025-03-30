// server/controllers/selfEvaluateController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { processPdfWithDocumentAI } from "./pdfhandler.js";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export const selfEvaluateController = async (req, res) => {
  try {
    if (!req.files || !req.files.questionsFile || !req.files.answersFile) {
      return res.status(400).json({ error: "Both questions and answers files are required." });
    }

    // Process both files
    const questions = await processFile(req.files.questionsFile);
    const answers = await processFile(req.files.answersFile);

    if (questions.length !== answers.length) {
      return res.status(400).json({ 
        error: "Number of questions and answers must match",
        questionsCount: questions.length,
        answersCount: answers.length
      });
    }

    const evaluations = [];
    let totalScore = 0;

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const answer = answers[i];

      if (!question || !answer) {
        evaluations.push({
          questionNumber: i + 1,
          question,
          answer,
          score: 0,
          feedback: "Empty question or answer",
          metrics: {
            clarity: 0,
            depth: 0,
            accuracy: 0,
            originality: 0,
            practicality: 0
          }
        });
        continue;
      }

      console.log(`Evaluating question ${i + 1}:`, question.substring(0, 50) + '...');

      const prompt = `Perform a detailed self-evaluation on the following Q&A pair:
      
Question: ${question}
Answer: ${answer}

Provide JSON output with:
1. Overall score (0-1)
2. Constructive feedback
3. Metrics scores (0-1) for:
   - Clarity (answer clarity)
   - Depth (thoroughness)
   - Accuracy (factual correctness)
   - Originality (unique insights)
   - Practicality (real-world applicability)

Format strictly as:
{
  "score": number,
  "feedback": string,
  "metrics": {
    "clarity": number,
    "depth": number,
    "accuracy": number,
    "originality": number,
    "practicality": number
  }
}

Evaluation guidelines:
- Be objective and constructive
- Score 0 for empty/invalid answers
- Focus on answer quality
- Avoid generic feedback
- Consider answer length relative to question complexity`;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        let jsonString = text.trim();
        jsonString = jsonString.replace(/```(json)?/gi, "").replace(/```/gi, "").trim();
        
        let evalResult;
        try {
          evalResult = JSON.parse(jsonString);
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          evalResult = { 
            score: 0, 
            feedback: "Evaluation failed - invalid response format", 
            metrics: {} 
          };
        }

        const score = Number(evalResult.score) || 0;
        totalScore += score;

        evaluations.push({
          questionNumber: i + 1,
          question,
          answer,
          score,
          feedback: evalResult.feedback || "No feedback provided",
          metrics: {
            clarity: evalResult.metrics?.clarity ?? 0,
            depth: evalResult.metrics?.depth ?? 0,
            accuracy: evalResult.metrics?.accuracy ?? 0,
            originality: evalResult.metrics?.originality ?? 0,
            practicality: evalResult.metrics?.practicality ?? 0
          }
        });
      } catch (genAIError) {
        console.error("AI evaluation error:", genAIError);
        evaluations.push({
          questionNumber: i + 1,
          question,
          answer,
          score: 0,
          feedback: "AI evaluation service error",
          metrics: {}
        });
      }
    }

    const overallScore = evaluations.length > 0 ? totalScore / evaluations.length : 0;
    
    res.json({ 
      success: true,
      overallScore: parseFloat(overallScore.toFixed(2)),
      evaluations,
      summary: {
        totalQuestions: questions.length,
        evaluated: evaluations.length,
        averageMetrics: calculateAverageMetrics(evaluations)
      }
    });

  } catch (error) {
    console.error("Error in self-evaluation:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to perform self-evaluation",
      details: error.message 
    });
  }
};

// Enhanced file processor with PDF support
async function processFile(file) {
  try {
    if (file.name.endsWith('.pdf')) {
      // Process PDF using Document AI
      const pdfText = await processPdfWithDocumentAI(file.data);
      return splitContentIntoItems(pdfText);
    } else if (file.name.endsWith('.json')) {
      const content = file.data.toString('utf8');
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [data];
    } else if (file.name.endsWith('.csv')) {
      const content = file.data.toString('utf8');
      return parseCSV(content);
    } else {
      // Text file processing
      const content = file.data.toString('utf8');
      return splitContentIntoItems(content);
    }
  } catch (error) {
    console.error(`Error processing ${file.name}:`, error);
    return [];
  }
}

// Helper to split text into logical items
function splitContentIntoItems(content) {
  // First try splitting by double newlines (common in PDFs)
  let items = content.split(/\n\s*\n/);
  
  // If that produces too few items, try other delimiters
  if (items.length <= 1) {
    items = content.split(/(?:\d+[.)]\s*|\n\s*[-•*]\s*)/).filter(Boolean);
  }
  
  return items
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

// Improved CSV parser
function parseCSV(content) {
  return content.split('\n')
    .map(line => {
      // Handle quoted CSV values
      const match = line.match(/"(.*?)"|([^,]+)/);
      return match ? (match[1] || match[2]).trim() : '';
    })
    .filter(line => line.length > 0);
}

// Calculate average metrics across all evaluations
function calculateAverageMetrics(evaluations) {
  const metrics = {
    clarity: 0,
    depth: 0,
    accuracy: 0,
    originality: 0,
    practicality: 0
  };

  if (evaluations.length === 0) return metrics;

  evaluations.forEach(evalResult => {
    for (const metric in metrics) {
      metrics[metric] += eval.metrics[metric] || 0;
    }
  });

  for (const metric in metrics) {
    metrics[metric] = parseFloat((metrics[metric] / evaluations.length).toFixed(2));
  }

  return metrics;
}