process.stdin.on('data', data => {
  process.stdout.write(`${data.toString().split('').reverse().join('')} \n\n`);
  // or console.log(`${data.toString().split('').reverse().join('')} \n\n`);
});
