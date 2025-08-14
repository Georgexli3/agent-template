/* DO NOT MODIFY THIS FILE */
import { sleep } from "../utils/sleep";
import { AgentFunction } from "./GenericTool";

export class GetWeatherFromLocationFunction extends AgentFunction<{
  location: string;
}> {
  definition = {
    name: "get_weather_from_location",
    description:
      "Get current weather information for a specific location. Returns a random weather condition for the given location.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The location to get weather information for",
        },
      },
      required: ["location"],
    },
  };

  async runFunction({ location }: { location: string }): Promise<string> {
    await sleep(1);
    const responses = [
      `It's sunny and 75°F in ${location}`,
      `Cloudy with a chance of rain in ${location}`,
      `Clear skies and mild temperatures in ${location}`,
      `Partly cloudy with light winds in ${location}`,
      `Warm and humid in ${location}`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
