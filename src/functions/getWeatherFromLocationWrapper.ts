import { AgentFunction } from './types';
import { GetWeatherFromLocationFunction } from './getWeatherFromLocation';

const getWeatherFromLocationInstance = new GetWeatherFromLocationFunction();

const getWeatherFromLocation: AgentFunction = {
  definition: {
    ...getWeatherFromLocationInstance.definition,
    display: {
      emoji: '🌤️',
      startMessage: 'Grabbing weather data...',
      completeMessage: 'Weather data retrieved!',
    },
  },
  runFunction: async (args) => {
    return await getWeatherFromLocationInstance.runFunction(args);
  },
};

export default getWeatherFromLocation;
