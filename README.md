# Agent Template

## Overview

Your task is to implement a basic AI agent. In this case, "agent" being a glorified term for a LLM being called in a loop.

You'll be interacting with OpenAI's endpoint with a real LLM!

**Time Expectation:** 1-2 hours
**Deliverables:** A working implementation.

## Getting Started

1. Fork this template repo
2. Clone it down locally
3. Create a copy of the `.env.sample` file and rename it to `.env`
4. Paste in the `OPENAI_API_KEY` that you'll be provided with

To start running the application:

```
npm install
npm run dev
```

## What is an agent?

There is no consensus definition for what an "AI Agent" is, but in this case, we define an agent as:

> An AI Agent is an AI system (typically an LLM) that can:
>
> 1. Take in natural language input from a user
> 2. Break down complex tasks into steps
> 3. Strategically use tools/functions to gather information or take actions
> 4. Combine tool outputs with its own reasoning to work towards the user's goal
> 5. Operate in a loop until the task is complete
>
> Think of it like an AI assistant that can both think AND do - it doesn't just respond with text, but can actively use tools to get new information and accomplish tasks.

Here's some additional documentation on how function/tool calling works: [Function Calling](https://platform.openai.com/docs/guides/function-calling)

## Your agent

The objective of this exercise is to create our own mini-agent that can intelligently leverage tools available to it to answer questions that it normally wouldn't be.

We've provided some basic boilerplate and some initial tools.

There are two example tools in `getUserLocation.ts` and `getWeatherFromLocation.ts`.

With a normal LLM call, the AI wouldn't be able to answer things like: "Where am I?" or "What is the weather today?"

But with these tools, the agent would be able to answer "What is the weather today?" after leveraging the `getUserLocation` tool followed by using the `getWeatherFromLocation` tool.

## Requirements

1. Implement the core agent behavior in `runAgent.ts`. The agent should be able to answer: "What is the weather today?"
2. Implement two new tools/functions for the agent to use. Bonus points if you design the system in a scalable way where we can add new functions/tools easily.
3. Push up your implementation to a separate repo (Make sure you don't push your `.env` file!)
4. Film a quick 2-3 minute video walking through your implementation + new tools!

## Implementation Notes

- If you look at the default system prompt in `runAgent.ts`, you'll notice we don't do the typical function calling structure. We instead ask the AI to return the function call in a JSON/XML format at the end of the message. This is intentional and an exercise left to the reader how to handle this.
- You are welcome to use any AI tools; we just ask that you don't completely one-shot it with something like Claude Code lol
- Be wary of accidental infinite loops that call the LLM
- The tools are hard-coded / mock tools right now. That's totally fine.

hint: would recommend starting with "Where am I?"
