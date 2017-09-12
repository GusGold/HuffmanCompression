var mapToKeyVal = function(map, path, dict){
  for(let i = 0; i < 2; i++){
    let desc = map.desc[i];

    if(desc.char !== undefined){
      dict[desc.char] = path + i;
    } else {
      mapToKeyVal(desc, path + i, dict);
    }
  }
}

module.exports = {
  compress(input){
    let charFrequency = {}
    for(let charI = 0; charI < input.length; charI++){
      charFrequency[input[charI]] = charFrequency[input[charI]] + 1 || 1
    }

    let charFreqArray = [];
    let chars = Object.keys(charFrequency);
    for(let charI = 0; charI < chars.length; charI++){
      charFreqArray.push({
        char: chars[charI],
        freq: charFrequency[chars[charI]]
      });
    }

    charFreqArray.sort(function(a, b){
      return (a.freq < b.freq ? 1 : (a.freq > b.freq ? -1 : 0));
    });

    let charMap;

    while(charFreqArray.length > 1){
      let a = charFreqArray.pop();
      let b = charFreqArray.pop();

      let ab = {
        freq: a.freq + b.freq,
        desc: [a, b]
      }

      if(charFreqArray.length){
        for(let i = charFreqArray.length; i >= 0; i--){
          if(!i || charFreqArray[i - 1].freq >= ab.freq){
            charFreqArray.splice(i, 0, ab);
            break;
          }
        }
      } else {
        charMap = ab;
      }
    }

    let dict = {};
    mapToKeyVal(charMap, '', dict);

    let bufferStr = '';
    for(let charI = 0; charI < input.length; charI++){
      bufferStr += dict[input[charI]];
    }

    dict.length = bufferStr.length;

    let buffer = Buffer(0);
    for(let i = 0; i < dict.length; i+= 8){
      let tempStr = bufferStr.substr(i, 8);
      if(tempStr.length < 8){
        tempStr = tempStr.split('');
        for(let j = 8 - tempStr.length; j > 0; j--){
          tempStr.push('0');
        }
        tempStr = tempStr.join('');
      }
      buffer = Buffer.concat([buffer, Buffer.from([parseInt(tempStr, 2)])], buffer.length + 1)
    }

    return {
      dict,
      buffer
    };
  },
  decompress(input){
    input = input.split('\n');
    let dict = JSON.parse(input.splice(0, 1));
    let buffer = Buffer(input.join('\n'), 'binary');

    let bufferStr = '';
    for(let i = 0; i < buffer.length; i++){
      let tempStr = buffer[i].toString(2);
      if(tempStr.length < 8){
        tempStr = tempStr.split('');
        while(tempStr.length < 8){
          tempStr.splice(0, 0, '0');
        }
        tempStr = tempStr.join('');
      }
      bufferStr += tempStr;
    }

    bufferStr = bufferStr.substr(0, dict.length);

    delete dict.length;
    let dictR = {};

    let keys = Object.keys(dict);
    let vals = Object.values(dict);
    for(let i = 0; i < keys.length; i++){
      dictR[vals[i]] = keys[i];
    }

    let bufferOut = '';
    let enStr = '';
    for(let i = 0; i < bufferStr.length; i++){
      enStr += bufferStr.substr(i, 1);
      if(dictR[enStr] !== undefined){
        bufferOut += dictR[enStr];
        enStr = '';
      }
    }

    return {
      dict,
      buffer: bufferOut
    };
  }
}
