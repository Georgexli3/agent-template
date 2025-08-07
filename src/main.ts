import * as readline from "readline";
import * as dotenv from "dotenv";
import { runAgent } from "./runAgent";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function promptUser(): Promise<void> {
  rl.question("Ask anything: ", async (input: string) => {
    if (input.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    await runAgent({ input });

    await promptUser();
  });
}

console.log('Welcome! Type something and press Enter. Type "exit" to quit.');
promptUser().catch(console.error);
