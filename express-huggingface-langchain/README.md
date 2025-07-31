## Features

- **LangChain Prompt Templates**: Dynamic prompt generation with variable substitution
- **LangChain Chains**: Sequential AI operations with LLM chains
- **Document Q&A with RAG**: Question answering over documents using retrieval augmented generation
- **Text Summarization Chains**: Advanced summarization using LangChain workflows
- **Sentiment Analysis with Explanation**: Hybrid approach combining HF sentiment analysis with LangChain explanations
- **Direct Hugging Face API**: Direct access to HF models for comparison

### LangChain Prompt Templates

```http
POST /langchain-prompt
Content-Type: application/json

{
  "template": "Write a {style} story about {topic} in {length} words.",
  "variables": {
    "style": "science fiction",
    "topic": "time travel",
    "length": "100"
  }
}

formattedPrompt = "The chronometer sputtered, casting flickering light on Dr. Aris Thorne's face. He'd finally done it. The temporal displacement unit hummed, a low thrum that vibrated through the steel floor of his laboratory. Outside the reinforced window, the world wasn't 2042 anymore. Dinosaurs roamed a lush, prehistoric jungle. He had traveled back 65 million years with only a pocket watch and a desperate hope to witness history. But as a colossal shadow fell over his lab, he realized he might not just witness history; he might become an insignificant footnote within it. The roar was deafening."

```

### LangChain Chains

```http
POST /langchain-chain
Content-Type: application/json

{
  "prompt": "Translate the following text to French: {input}",
  "input": "Hello, how are you today?"
}
```

### Document Q&A with RAG

```http
POST /document-qa
Content-Type: application/json

{
  "document": "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents: any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.",
  "question": "What is artificial intelligence?"
  "chunk_size": 1000,
  "chunk_overlap": 200
}

doc= [
  Document({
    pageContent: "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents: any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.",
    metadata: {}
  })
]

vectorStore = {
  memoryVectors: [
    {
      content: "Artificial intelligence (AI) is intelligence...", // The full text
      embedding: [0.012, -0.045, 0.088, ..., -0.023], // The 384-number vector
      metadata: {}
    }
  ]
}
```

### Text Summarization Chain

```http
POST /text-summarization-chain
Content-Type: application/json

{
  "text": " long text to summarize...",
  "max_length": 150
}
```

## Example Usage with curl

### LangChain Prompt Template

```bash
curl -X POST http://localhost:3000/langchain-prompt \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Create a {type} about {subject} with {tone} tone.",
    "variables": {
      "type": "poem",
      "subject": "artificial intelligence",
      "tone": "optimistic"
    }
  }'
```

## Key Features Explained

### LangChain Integration

- **Prompt Templates**: Create reusable, parameterized prompts
- **Chains**: Link multiple AI operations together
- **Memory**: Maintain context across interactions
- **Embeddings**: Vector representations for semantic search

### RAG (Retrieval Augmented Generation)

- Document chunking with configurable size and overlap
- Vector embeddings for semantic similarity
- Retrieval-based question answering
- Memory-based vector store for fast querying
