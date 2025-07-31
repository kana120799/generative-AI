const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");
// LangChain wrapper for the Hugging Face Inference API. :- take instructions (a prompt) and generate new text. We use it for tasks like answering questions, writing summaries, or continuing a story.
const { HuggingFaceInference } = require("@langchain/community/llms/hf");
// LangChain wrapper for creating text embeddings using Hugging Face models. :- take text and turn it into a list of numbers (called embeddings or vectors).
// :- This is crucial for tasks like finding similar documents or allowing a database to understand the meaning of your query, not just the keywords.
const {
  HuggingFaceInferenceEmbeddings,
} = require("@langchain/community/embeddings/hf");
// LangChain utility for creating reusable and dynamic prompts for language models.
const { PromptTemplate } = require("@langchain/core/prompts");
// LangChain concept that combines an LLM with a prompt to create a reusable component.
const { LLMChain } = require("langchain/chains");
// LangChain tool for splitting long texts into smaller, manageable chunks.
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
// LangChain component that stores text and their vector representations (embeddings) in memory for fast retrieval.
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
// LangChain chain designed for question-answering over a set of documents.
const { RetrievalQAChain } = require("langchain/chains");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

//  Hugging Face clients
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const llm = new HuggingFaceInference({
  model: "gpt-model", // gpt2
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

// Initialize embeddings
const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

// Middleware
app.use(cors());
app.use(express.json());

// LangChain Prompt Template
// This is a manual, two-step process. We first format the prompt yourself (promptTemplate.format()) and then you manually call the model with the formatted string (llm.invoke())
app.post("/langchain-prompt", async (req, res) => {
  try {
    const { template, variables } = req.body;

    if (!template) {
      return res.status(400).json({ error: "Template is required" });
    }

    const promptTemplate = new PromptTemplate({
      template: template,
      inputVariables: Object.keys(variables || {}),
    });

    const formattedPrompt = await promptTemplate.format(variables || {});
    const result = await llm.invoke(formattedPrompt);

    res.json({
      success: true,
      template,
      variables,
      formatted_prompt: formattedPrompt,
      result,
    });
  } catch (error) {
    console.error("LangChain prompt error:", error);
    res.status(500).json({
      error: "LangChain prompt failed",
      details: error.message,
    });
  }
});

// :- Here we package the model and the prompt into a single, reusable LLMChain object, then we just .call() the chain with raw input.
// The chain handles the prompt formatting and model invocation. This allows us to easily combine this chain with other components later.

app.post("/langchain-chain", async (req, res) => {
  try {
    const { prompt, input } = req.body;

    if (!prompt || !input) {
      return res.status(400).json({
        error: "Both prompt and input are required",
      });
    }

    // This object knows how to format a string.
    const promptTemplate = new PromptTemplate({
      template: prompt,
      // 'inputVariables' is an array of strings listing all the placeholder names in the template.
      // Here, we explicitly state that the template will use a variable named "input".
      inputVariables: ["input"],
    });

    //  A chain that links components together.This chain connects our language model (llm) with our prompt template (promptTemplate).
    const chain = new LLMChain({
      llm: llm,
      prompt: promptTemplate,
    });

    // Execute the chain using the .call() method. Here we pass an object where the key ('input') matches the 'inputVariables' from our prompt template.
    // LangChain automatically formats the prompt with the input and sends it to the LLM.
    const result = await chain.call({ input });
    res.json({
      success: true,
      prompt,
      input,
      result: result.text,
      framework: "LangChain Chain + Hugging Face",
    });
  } catch (error) {
    console.error("LangChain chain error:", error);
    res.status(500).json({
      error: "LangChain chain failed",
      details: error.message,
    });
  }
});

// Document Q&A with RAG (LangChain and Hugging Face)
app.post("/document-qa", async (req, res) => {
  try {
    const {
      document,
      question,
      chunk_size = 1000,
      chunk_overlap = 200,
    } = req.body;

    if (!document || !question) {
      return res.status(400).json({
        error: "Both document and question are required",
      });
    }

    // Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: chunk_size,
      chunkOverlap: chunk_overlap,
    });

    const docs = await textSplitter.createDocuments([document]);

    // Create vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Create retrieval QA chain
    const qaChain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever());

    const result = await qaChain.call({ query: question });

    res.json({
      success: true,
      document_length: document.length,
      chunks_created: docs.length,
      question,
      answer: result.text,
    });
  } catch (error) {
    console.error("Document QA error:", error);
    res.status(500).json({
      error: "Document QA failed",
      details: error.message,
    });
  }
});

// Text Summarization Chain
app.post("/text-summarization-chain", async (req, res) => {
  try {
    const { text, max_length = 150 } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const promptTemplate = new PromptTemplate({
      template: `Summarize the following text in approximately {max_length} words:\n\n{text}\n\nSummary:`,
      inputVariables: ["text", "max_length"],
    });

    const chain = new LLMChain({
      llm: llm,
      prompt: promptTemplate,
    });

    const result = await chain.call({
      text: text,
      max_length: max_length.toString(),
    });

    res.json({
      success: true,
      original_text: text,
      max_length,
      summary: result.text,
    });
  } catch (error) {
    console.error("Summarization chain error:", error);
    res.status(500).json({
      error: "Summarization chain failed",
      details: error.message,
    });
  }
});

// Sentiment Analysis Chain
app.post("/sentiment-chain", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Here we use direct Hugging Face API for sentiment analysis
    const sentimentResult = await hf.textClassification({
      model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
      inputs: text,
    });

    // Here we use LangChain for explanation generation
    const promptTemplate = new PromptTemplate({
      template: `Analyze the sentiment of this text and explain why it has a {sentiment} sentiment:\n\nText: "{text}"\n\nExplanation:`,
      inputVariables: ["text", "sentiment"],
    });
    //////////////////////////////////////
    // Manually Steps :-
    //////////////////////////////////////

    // Step 1: Manually format the prompt
    // const formattedPrompt = await promptTemplate.format({
    //   text: "I love this new phone!",
    //   sentiment: "positive",
    // });

    // Step 2: Manually call the model with the formatted string
    // const explanation = await llm.invoke(formattedPrompt);

    //////////////////////////////////////

    // LLMChain :- The Assembly Line: Connects the blueprint and the worker into a single, reusable unit. It automates the process.
    // automatically performs the two steps (
    //  1. Takes raw materials and uses its internal promptTemplate to create the formatted prompt.
    //  2. Then automatically sends that formatted prompt to its internal llm. )
    const chain = new LLMChain({
      llm: llm, // llm :- The Worker: The AI model that can understand and respond to instructions.
      prompt: promptTemplate, // promptTemplate :- The Blueprint: Defines what to ask. It's a template for the instructions.
    });

    const explanation = await chain.call({
      text: text,
      sentiment: sentimentResult[0].label,
    });

    res.json({
      success: true,
      text,
      sentiment_analysis: sentimentResult,
      explanation: explanation.text,
    });
  } catch (error) {
    console.error("Sentiment chain error:", error);
    res.status(500).json({
      error: "Sentiment chain failed",
      details: error.message,
    });
  }
});

// We have direct Hugging Face API call too.
app.post("/direct-hf-call", async (req, res) => {
  try {
    const { text, task = "text-generation" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    let result;
    switch (task) {
      case "text-generation":
        result = await hf.textGeneration({
          model: "gpt2",
          inputs: text,
          parameters: { max_new_tokens: 100 },
        });
        break;
      case "sentiment-analysis":
        result = await hf.textClassification({
          model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
          inputs: text,
        });
        break;
      case "summarization":
        result = await hf.summarization({
          model: "facebook/bart-large-cnn",
          inputs: text,
        });
        break;
      default:
        return res.status(400).json({
          error:
            "Unsupported task. Use: text-generation, sentiment-analysis, or summarization",
        });
    }

    res.json({
      success: true,
      text,
      task,
      result,
      framework: "Direct Hugging Face API",
    });
  } catch (error) {
    console.error("Direct HF call error:", error);
    res.status(500).json({
      error: "Direct HF call failed",
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
