/* DO NOT MODIFY THIS FILE */
import { sleep } from "../utils/sleep";
import { AgentFunction } from "./GenericTool";

export class GetUserLocationFunction extends AgentFunction<{}> {
  definition = {
    name: "get_user_location",
    description:
      "Get the current user's location. Returns the user's current location as a string.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  };

  async runFunction({}: {}): Promise<string> {
    await sleep(1);
    return "New York, NY";
  }
}
