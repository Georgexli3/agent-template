import { AgentFunction } from './types';

const getLocalAttractions: AgentFunction = {
  definition: {
    name: 'get_local_attractions',
    description: 'Find a popular tourist attraction or point of interest in the specified location.',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City or area' },
      },
      required: ['location'],
    },
    display: {
      emoji: '🏛️',
      startMessage: 'Looking for attractions...',
      completeMessage: 'Attractions found!',
    },
  },
  runFunction: async (args) => {
    const { location } = args;
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 250 + 200));
    if (location.includes('New York')) return 'You could visit the Statue of Liberty in New York.';
    if (location.includes('Paris')) return 'Consider the Eiffel Tower in Paris.';
    if (location.includes('San Francisco')) return 'The Golden Gate Bridge in San Francisco is a top pick.';
    return `Try the main city park or a local museum in ${location}.`;
  },
};

export default getLocalAttractions;
