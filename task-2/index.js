import csvtojson from 'csvtojson';
import { createReadStream, createWriteStream } from 'fs';

const readStream = createReadStream('./csv/nodejs-hw1-ex1.csv');
const writeStream = createWriteStream('./dataFromStream.txt');

const handleStreamError = () => {
  console.error('Something went wrong during data transfer');
  readStream.destroy();
  writeStream.end('Finished with error');
};

readStream.pipe(csvtojson())
  .on('error', handleStreamError)
  .pipe(writeStream)
  .on('error', handleStreamError);
