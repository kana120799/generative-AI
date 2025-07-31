const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//  Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

app.use(cors());
app.use(express.json());

// Text Generation
app.post("/text-generation", async (req, res) => {
  try {
    const { prompt, max_new_tokens = 100, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await hf.textGeneration({
      model: "gpt-model",
      inputs: prompt,
      parameters: {
        max_new_tokens,
        temperature,
        return_full_text: false,
      },
    });

    res.json({
      success: true,
      prompt,
      generated_text: result.generated_text,
      model: "gpt-model",
    });
  } catch (error) {
    console.error("Text generation error:", error);
    res.status(500).json({
      error: "Text generation failed",
      details: error.message,
    });
  }
});

// Sentiment Analysis
app.post("/sentiment-analysis", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const result = await hf.textClassification({
      model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      inputs: text,
    });

    res.json({
      success: true,
      text,
      sentiment: result,
    });
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    res.status(500).json({
      error: "Sentiment analysis failed",
      details: error.message,
    });
  }
});

// Text Summarization
app.post("/summarization", async (req, res) => {
  try {
    const { text, max_length = 150, min_length = 30 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text,
      parameters: {
        max_length,
        min_length,
      },
    });

    res.json({
      success: true,
      original_text: text,
      summary: result.summary_text,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({
      error: "Summarization failed",
      details: error.message,
    });
  }
});

// Question Answering
app.post("/question-answering", async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question || !context) {
      return res.status(400).json({
        error: "Both question and context are required",
      });
    }

    const result = await hf.questionAnswering({
      model: "deepset/roberta-base-squad2",
      inputs: {
        question,
        context,
      },
    });

    res.json({
      success: true,
      question,
      context,
      answer: result.answer,
      confidence: result.score,
    });
  } catch (error) {
    console.error("Question answering error:", error);
    res.status(500).json({
      error: "Question answering failed",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Express server running on port ${port}`);
});
