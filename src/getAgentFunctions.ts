import getUserLocation from './functions/getUserLocationWrapper';
import getWeatherFromLocation from './functions/getWeatherFromLocationWrapper';
import getLocalAttractions from './functions/getLocalAttractions';
import getLocalRestaurants from './functions/getLocalRestaurants';
import { AgentFunction } from './functions/types';

const agentFunctions: AgentFunction[] = [
  getUserLocation,
  getWeatherFromLocation,
  getLocalAttractions,
  getLocalRestaurants,
];

export default agentFunctions;
