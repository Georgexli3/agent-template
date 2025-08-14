import { AgentFunction } from './types';

const cuisines = [
  'Italian restaurant',
  'sushi bar',
  'local cafe',
  'steakhouse',
  'Mexican taqueria',
  'Mediterranean bistro',
];

const getLocalRestaurants: AgentFunction = {
  definition: {
    name: 'get_local_restaurants',
    description: 'Get a recommendation for a restaurant in the specified location.',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City or area' },
      },
      required: ['location'],
    },
    display: {
      emoji: '🍽️',
      startMessage: 'Finding restaurant recommendations...',
      completeMessage: 'Restaurant recommendations ready!',
    },
  },
  runFunction: async (args) => {
    const { location } = args;
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 250 + 200));
    const cuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
    return `Try a highly rated ${cuisine} in ${location}.`;
  },
};

export default getLocalRestaurants;
