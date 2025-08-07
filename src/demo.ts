import { getRandomString } from "./tools/getRandomString";

console.log("🎲 Random String Generator Demo\n");
console.log("Here are 5 different random responses:\n");

for (let i = 1; i <= 5; i++) {
  console.log(`${i}. ${getRandomString()}\n`);
}

console.log("Run this script multiple times to see different combinations!");
