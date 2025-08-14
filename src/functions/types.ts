export type AgentFunctionDefinition = {
  name: string;
  description: string;
  parameters: unknown;
  display?: {
    emoji: string;
    startMessage: string;
    completeMessage: string;
  };
};

export type AgentFunction = {
  definition: AgentFunctionDefinition;
  runFunction: (args: any) => Promise<string>;
};
