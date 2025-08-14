import { runAgent } from './runAgent';

const question = process.argv.slice(2).join(' ');

runAgent(question)
  .then((answer) => {
    console.log(answer);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
