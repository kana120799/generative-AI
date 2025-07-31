```jsx
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
onst prompt = "Suggest me a popular movie showing near me tonight."
// Chat completion
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: "You are an expert ticketing assistant." },
    { role: "user",   content: prompt  },
  ],
});
console.log(response.choices[0].message.content);

```

```

```

### LLM Langchain Integration

**`index.ts`**

```tsx
import { getChatModel } from "./llm-provider";

app.post("/chat", async (req, res) => {
  try {
    const { provider, message } = req.body;

    const chatModel = getChatModel(provider);
    const response = await chatModel.invoke(message);

    res.json({ response: response.content });
  } catch (error) {}
});
```

### LLM Provider

**`llm-provider.ts`**

```tsx
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export function getChatModel(provider: string): BaseChatModel {
  switch (provider.toLowerCase()) {
    case "openai":
      return new ChatOpenAI({
        modelName: "gpt-4o",
        temperature: 0.7,
      });

    case "gemini":
      return new ChatGoogleGenerativeAI({
        modelName: "gemini-pro",
        maxOutputTokens: 2048,
      });

    case "deepseek":
      return new ChatOpenAI({
        modelName: "deepseek-chat",
        openAIApiKey: "deepseek-api-key",
        configuration: {
          baseURL: "<https://api.deepseek.com/v1>", // Point to DeepSeek's API endpoint
        },
      });
  }
}
```

### Installing Dependencies and Environment Variables

```bash
npm install express typescript ts-node @types/express
npm install langchain @langchain/openai @langchain/google-genai @langchain/community

```

**`.env`**

```
# For OpenAI
OPENAI_API_KEY="your-openai-api-key"

# For Google Gemini
GOOGLE_API_KEY="your-google-api-key"

# For Hugging Face
HUGGINGFACEHUB_API_TOKEN="your-huggingface-api-token"

```
