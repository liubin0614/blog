const fs = require('fs');

const gap = 'T@T'

const aStart = 97
const zEnd = 122
const AStart = 65
const ZEnd = 90

function isNumber(value) {
  const num = Number(value)
  return typeof num === 'number' && !isNaN(num);
}

function letterToNumber(str) {
  return str.split('').map(char => {
    if (/[a-zA-Z]/.test(char)) {
      if (char >= 'A' && char <= 'Z') {
        return char.charCodeAt(0)
      }
      if (char >= 'a' && char <= 'z') {
        return char.charCodeAt(0)
      }
    }
    return char;
  }).join(gap);
}

function numberToLetter(numString) {
  const nums = numString.split(gap)
  return nums.map(num => {
    if(isNumber(num)){
       if(num >= aStart && num <= zEnd || num >= AStart && num <= ZEnd){
        return String.fromCharCode(num)
      }
    }
    return num;
  }).join('');
}



// fs.readFile('your-file.txt', 'utf8', (err, data) => {
//   if (err) {
//     console.error('读取文件时发生错误:', err);
//     return;
//   }
//   console.log('文件内容:', data);
// });


// 测试
console.log(letterToNumber("aA")); 
