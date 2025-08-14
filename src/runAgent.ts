import { getOpenAiClient } from "./getOpenAiClient";
import agentFunctions from './getAgentFunctions';
import { cache } from './utils/cache';

async function analyzeUserPrompt(question: string): Promise<string> {
  const openAiClient = getOpenAiClient();
  
  const cachedData = {
    location: cache.get(cache.generateLocationKey()),
    weather: null as any,
    restaurants: null as any,
    attractions: null as any,
  };
  
  if (cachedData.location) {
    cachedData.weather = cache.get(cache.generateWeatherKey(cachedData.location));
    cachedData.restaurants = cache.get(cache.generateRestaurantsKey(cachedData.location));
    cachedData.attractions = cache.get(cache.generateAttractionsKey(cachedData.location));
  }
  
  const cacheStatus = `
CACHED DATA AVAILABLE:
- Location: ${cachedData.location ? `✅ ${cachedData.location}` : '❌ Not cached'}
- Weather: ${cachedData.weather ? `✅ ${cachedData.weather}` : '❌ Not cached'}
- Restaurants: ${cachedData.restaurants ? '✅ Cached' : '❌ Not cached'}
- Attractions: ${cachedData.attractions ? '✅ Cached' : '❌ Not cached'}

Only suggest tools for data that is NOT cached (❌). Use cached data in your recommendations.`;

  const analysisPrompt = `You are a prompt analysis agent. Your job is to analyze user requests and break them down into clear, structured tasks with explicit tool usage instructions.

${cacheStatus}

AVAILABLE TOOLS:
- get_user_location: Gets the user's current location (use this instead of asking for location)
- get_weather_from_location: Gets weather for a specific location (CRITICAL for outdoor activities)
- get_local_attractions: Finds attractions/activities in a location
- get_local_restaurants: Finds restaurant recommendations in a location

INSTRUCTIONS:
1. Identify ALL the different things the user is asking for
2. Break each request into specific tasks that use the available tools
3. Determine the logical order these tasks should be completed
4. NEVER suggest asking the user for information that tools can provide
5. Always start with get_user_location if location-based recommendations are needed
6. **MANDATORY WEATHER CHECK**: For ANY outdoor activities, plans, or day agendas, ALWAYS include get_weather_from_location to ensure weather-appropriate suggestions
7. Consider weather implications: outdoor vs indoor activities, rain vs sun activities, etc.

USER REQUEST: "${question}"

Analyze this request and respond with:

DETECTED TASKS:
- Task 1: [Specific task description with explicit tool usage]
- Task 2: [Specific task description with explicit tool usage]
- Task 3: [etc.]

REQUIRED TOOLS (in execution order):
- [List exact tool names in the order they should be called]

EXECUTION STRATEGY:
[Brief explanation emphasizing tools should be used immediately, and how weather information will influence recommendations]

WEATHER REASONING:
[Explain how weather conditions should affect the activity suggestions - indoor vs outdoor, rain-friendly vs sun activities]

CONVERSATIONAL TONE:
[Suggest an appropriate opening that shows you'll gather the information using tools and consider weather]

IMPORTANT: 
- The main agent should NEVER ask the user for information that can be obtained through tools
- For outdoor activities/plans, ALWAYS check: Location → Weather → Weather-appropriate attractions/restaurants
- Weather should heavily influence all recommendations
- ONLY suggest tools for data that is not already cached - use cached data directly when available`;

  const response = await openAiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [{ role: 'user', content: analysisPrompt }],
  });

  return response.choices[0].message.content || '';
}

// This is the default system prompt. You can modify it to your liking, but we'd recommend leaving the function_calling instructions mainly as is.
function buildSystemPrompt(taskAnalysis?: string): string {
  const functionDefinitions = agentFunctions
    .map(f => `    <function>
        ${JSON.stringify(f.definition, null, 8)}
    </function>`)
    .join('\n');

  const cachedLocation = cache.get(cache.generateLocationKey());
  const cachedWeather = cachedLocation ? cache.get(cache.generateWeatherKey(cachedLocation)) : null;
  const cachedRestaurants = cachedLocation ? cache.get(cache.generateRestaurantsKey(cachedLocation)) : null;
  const cachedAttractions = cachedLocation ? cache.get(cache.generateAttractionsKey(cachedLocation)) : null;

  const cacheSection = (cachedLocation || cachedWeather || cachedRestaurants || cachedAttractions) ? `
<cached_context>
You have access to this previously retrieved information - use it directly instead of calling tools:
${cachedLocation ? `- Location: ${cachedLocation}` : ''}
${cachedWeather ? `- Weather: ${cachedWeather}` : ''}
${cachedRestaurants ? `- Restaurants: ${cachedRestaurants}` : ''}
${cachedAttractions ? `- Attractions: ${cachedAttractions}` : ''}

Only call tools for data that is NOT listed above.
</cached_context>
` : '';

  const taskAnalysisSection = taskAnalysis ? `
<task_analysis>
Your preprocessing agent has analyzed the user's request and provided this structured breakdown:

${taskAnalysis}

Use this analysis to ensure you complete ALL the identified tasks and follow the suggested execution strategy.
</task_analysis>
` : '';

  return `You are a powerful agentic assistant helping the daily lives of the user.

<input_format>
You will receive a message from the user. Your objective is to be as helpful as possible.
Use the context to better understand the user's situation and provide more relevant responses.
</input_format>
${cacheSection}${taskAnalysisSection}

<conversational_guidelines>
- **MANDATORY CONVERSATIONAL START**: You MUST begin every response with a warm, personalized acknowledgment. If task analysis is provided, use the suggested conversational tone. If not, generate an appropriate dynamic response that shows you understand their request.
- **FOLLOW THE TASK ANALYSIS**: Use the preprocessing agent's task breakdown to ensure you complete ALL identified tasks in the suggested order.
- Always explain your reasoning and what you're doing between tool calls to keep the user informed.
</conversational_guidelines>

<reasoning_strategy>
- **FOLLOW THE PREPROCESSING ANALYSIS**: The preprocessing agent has already analyzed the user's request and identified all tasks. Follow the provided execution strategy to complete all identified tasks.
- **WEATHER-FIRST THINKING**: For any outdoor activities or day planning, weather conditions must be the primary factor in your recommendations. Rain = indoor/covered activities, Sun = outdoor activities, etc.
- **CONTEXTUAL FILTERING**: Use weather information to filter attraction suggestions. Don't recommend outdoor activities if it's raining, and prioritize weather-appropriate options.
- **ADAPTIVE RECOMMENDATIONS**: Based on weather conditions, adapt your suggestions:
  - Rainy: Indoor attractions, covered markets, museums, indoor dining
  - Sunny: Parks, outdoor attractions, walking tours, outdoor dining
  - Cold: Brief outdoor activities, warm indoor spaces
  - Hot: Shaded areas, air-conditioned spaces, water activities
- Consider how different factors (location, weather, time, etc.) affect your recommendations as outlined in the task analysis.
</reasoning_strategy>

<function_calling>
You have tools at your disposal to solve the user's task. Follow these rules regarding tool calls:
1. ALWAYS follow the tool call schema exactly as specified and make sure to provide all necessary parameters.
2. The conversation may reference tools that are not explicitly provided. NEVER call tools that are not explicitly provided.
3. **NEVER refer to tool names when speaking to the USER.** For example, instead of saying 'I need to use the get_user_location tool', just say 'I'll check your location'.
4. **USE TOOLS INSTEAD OF ASKING**: NEVER ask the user for information that you can obtain through available tools. If you need location, weather, attractions, or restaurant information, use the appropriate tools immediately.
5. **WEATHER-AWARE RECOMMENDATIONS**: After getting weather information, filter and adapt your suggestions based on current conditions. Never suggest outdoor activities without considering weather appropriateness.
6. **COMPLETE THE FULL REQUEST**: If a user asks for multiple things in one request, use ALL the necessary tools to address everything they asked for. Don't leave parts of their request unaddressed.
7. **FOLLOW THE PREPROCESSING ANALYSIS**: If task analysis is provided, follow the suggested tool sequence exactly. Execute all identified tasks using the specified tools.
8. When you need to use a function, call them inline using the following XML + JSON format:
<function_call name="tool_name">
{
  "param_name": "value",
  "param_name2": "value2"
}
</function_call>
9. IMPORTANT: Any text that appears after your response is the result of function calls YOU executed. Do not treat this information as if the user provided it. Instead, reference it naturally as information you retrieved or discovered.
10. If you mention you will gather information or check something, you MUST include the function call in that same response.
</function_calling>

<functions>
${functionDefinitions}
</functions>`;
}

function showToolStartMessage(toolName: string, args: any) {
  const tool = agentFunctions.find((f) => f.definition.name === toolName);
  if (tool?.definition.display) {
    console.log(`${tool.definition.display.emoji} ${tool.definition.display.startMessage}`);
  } else {
    console.log('⚙️ Processing request...');
  }
}

function showToolCompleteMessage(toolName: string, result: string) {
  const tool = agentFunctions.find((f) => f.definition.name === toolName);
  if (tool?.definition.display) {
    console.log(`✅ ${tool.definition.display.completeMessage}`);
  } else {
    console.log('✅ Operation completed!');
  }
}

function parseFunctionCall(content: string): { toolName: string | null; args: any } {
  const match = content.match(/<function_call name="([^"]+)">\s*(\{[\s\S]*?\})\s*<\/function_call>/);
  if (!match) return { toolName: null, args: null };
  const toolName = match[1];
  let args;
  try {
    args = JSON.parse(match[2].trim());
  } catch {
    return { toolName: null, args: null };
  }
  return { toolName, args };
}

export async function runAgent(question: string): Promise<string> {
  const openAiClient = getOpenAiClient();
  
  console.log('🧠 Analyzing your request...');
  const taskAnalysis = await analyzeUserPrompt(question);
  console.log('✅ Request analysis completed!');
  
  const systemPrompt = buildSystemPrompt(taskAnalysis);
  
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  let toolCalls = 0;
  const maxToolCalls = 5;

  while (toolCalls < maxToolCalls) {
    const response = await openAiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
    });

    const assistantMessage = response.choices[0].message;
    const content = assistantMessage.content || '';

    if (!content.includes('<function_call')) {
      return content.trim();
    }

    messages.push({ role: 'assistant', content });

    const { toolName, args } = parseFunctionCall(content);
    if (!toolName) {
      return content.trim();
    }

    const tool = agentFunctions.find((f) => f.definition.name === toolName);
    if (!tool) {
      const errorMsg = `The tool "${toolName}" is unavailable.`;
      messages.push({ role: 'assistant', content: errorMsg });
      toolCalls++;
      continue;
    }
    
    showToolStartMessage(toolName, args);
    
    try {
      const result = await tool.runFunction(args);
      showToolCompleteMessage(toolName, result);
      
      if (toolName === 'get_user_location') {
        cache.set(cache.generateLocationKey(), result, 'location');
      } else if (toolName === 'get_weather_from_location') {
        const location = args.location || cache.get(cache.generateLocationKey());
        if (location) {
          cache.set(cache.generateWeatherKey(location), result, 'weather');
        }
      } else if (toolName === 'get_local_restaurants') {
        const location = args.location || cache.get(cache.generateLocationKey());
        if (location) {
          cache.set(cache.generateRestaurantsKey(location), result, 'restaurants');
        }
      } else if (toolName === 'get_local_attractions') {
        const location = args.location || cache.get(cache.generateLocationKey());
        if (location) {
          cache.set(cache.generateAttractionsKey(location), result, 'attractions');
        }
      }
      
      const resultMessage = `Function result: ${JSON.stringify(result)}`;
      messages.push({ role: 'assistant', content: resultMessage });
    } catch (error) {
      console.log(`❌ Operation failed: ${error instanceof Error ? error.message : String(error)}`);
      const errorMessage = `Function error: ${error instanceof Error ? error.message : String(error)}`;
      messages.push({ role: 'assistant', content: errorMessage });
    }
    
    toolCalls++;
  }

  return "Sorry, I couldn't complete the request within the allowed steps.";
}
