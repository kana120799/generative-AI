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

### 3. LLM Provider

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
  }
}
```

### 4. Installing Dependencies and Environment Variables

You'll need to install the necessary LangChain packages for each provider.

```bash
npm install express typescript ts-node @types/express
npm install langchain @langchain/openai @langchain/google-genai @langchain/community

```

Create a `.env` file in your project's root to store your API keys. LangChain libraries will automatically pick them up.

**`.env`**

```
# For OpenAI
OPENAI_API_KEY="your-openai-api-key"

# For Google Gemini
GOOGLE_API_KEY="your-google-api-key"

# For Hugging Face
HUGGINGFACEHUB_API_TOKEN="your-huggingface-api-token"

```

### 5. How to Handle DeepSeek and Other Models

For models like **DeepSeek**, the integration method depends on how they are exposed:

- **OpenAI-Compatible API**: Many newer providers, including DeepSeek, offer an API that is compatible with OpenAI's API structure. In this case, you can use LangChain's `ChatOpenAI` class and just change the `baseURL`.

Here is how you would add DeepSeek to your `llm-provider.ts`:

```tsx
// Inside llm-provider.ts, add a case for DeepSeek

case 'deepseek':
  return new ChatOpenAI({
    modelName: "deepseek-chat",
    openAIApiKey: "your-deepseek-api-key", // Use the specific key
    configuration: {
      baseURL: "<https://api.deepseek.com/v1>", // Point to DeepSeek's API endpoint
    },
  });

```

This approach is powerful because it allows you to use any LLM that follows the OpenAI API format without needing a specific LangChain integration package.

By structuring your application this way, you can easily switch between LLMs by simply changing the `provider` string in your API calls, making your MERN app highly flexible and future-proof.

---

---

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
