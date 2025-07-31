## Features

- **Text Generation**: Generate text using GPT model
- **Sentiment Analysis**: Analyze sentiment of text using RoBERTa model
- **Text Summarization**: Summarize long text using BART-CNN model

### Text Generation

```http
POST /text-generation
Content-Type: application/json

{
  "prompt": "The future of artificial intelligence is",
  "max_new_tokens": 100,
  "temperature": 0.7
}
```

### Sentiment Analysis

```http
POST /sentiment-analysis
Content-Type: application/json

{
  "text": "I love this new technology!"
}
```

### Text Summarization

```http
POST /summarization
Content-Type: application/json

{
  "text": "Long text here...",
  "max_length": 150,
  "min_length": 30
}
```

### Question Answering

```http
POST /question-answering
Content-Type: application/json

{
  "question": "What is the capital of France?",
  "context": "France is a country in Europe. Its capital city is Paris, which is known for the Eiffel Tower."
}
```
