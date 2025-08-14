import { AgentFunction } from './types';
import { GetUserLocationFunction } from './getUserLocation';

const getUserLocationInstance = new GetUserLocationFunction();

const getUserLocation: AgentFunction = {
  definition: {
    ...getUserLocationInstance.definition,
    display: {
      emoji: '🔍',
      startMessage: 'Finding your location...',
      completeMessage: 'Location found!',
    },
  },
  runFunction: async (args) => {
    return await getUserLocationInstance.runFunction(args);
  },
};

export default getUserLocation;
