import { GetUserLocationFunction } from "./functions/getUserLocation";
import { GetWeatherFromLocationFunction } from "./functions/getWeatherFromLocation";

export const agentFunctions = [
  new GetUserLocationFunction(),
  new GetWeatherFromLocationFunction(),
];
