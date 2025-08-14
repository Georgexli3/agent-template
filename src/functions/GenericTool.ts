/* DO NOT MODIFY THIS FILE */
export abstract class AgentFunction<T> {
  abstract definition: any;

  // Abstract methods that accept structured objects with generic typing
  abstract runFunction(input: T): Promise<string>;
}
