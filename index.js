const fs = require('fs');
const Huffman = require('./huffman')

//read input file and compress
let input = fs.readFileSync('./input.txt', 'binary');

let compressedData = Huffman.compress(input);

let compressed = JSON.stringify(compressedData.dict) + '\n' + compressedData.buffer.toString('binary');

fs.writeFileSync('./output.txt', compressed, {
  encoding: 'binary'
});


//read output file and decompress
let output = fs.readFileSync('./output.txt', 'binary');

let decompressedData = Huffman.decompress(output);

console.log('Original input matches decompressed output? ' + (decompressedData.buffer == input));
console.log('From ' + input.length + ' to ' + output.length + ' bytes (' + parseInt(output.length / input.length * 10000) / 100 + '%) (' + parseInt((output.length - JSON.stringify(decompressedData.dict).length) / input.length * 10000) / 100 + '% without dict)');
