import csvtojson from 'csvtojson';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'node:stream';

const readStream = createReadStream('./csv/nodejs-hw1-ex1.csv');
const writeStream = createWriteStream('./dataFromStream.txt');

const handleStreamError = () => {
  console.error('Something went wrong during data transfer');
  readStream.destroy();
  writeStream.end('Finished with error');
};

pipeline(
  readStream,
  csvtojson({ delimiter: ',' }),
  writeStream,
  (err) => {
    if (err) {
      handleStreamError();
    } else {
      console.log('Pipeline succeeded.');
    }
  }
);
