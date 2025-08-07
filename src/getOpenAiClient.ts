import OpenAI from "openai";

export const getOpenAiClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};
