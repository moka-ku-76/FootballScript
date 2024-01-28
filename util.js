function sumArray(...arr){
  let ret_arr = arr[0].slice();
  for(let i=1;i<arr.length;i++){
    for(let j=0;j<arr[i].length;j++){
      ret_arr[j]+=arr[i][j];
    }
  }
  return ret_arr;
}

function sumEach(array){
  let num = 0; 
  for(let i=0;i<array.length;i++){
      if(typeof(array[i])=="number"){
      num += array[i];
      }
  }
  return num;
}

// 配列から要素をランダムに選ぶ関数
function pickElementRandomly(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// コンビネーションの計算
function countPairs(n) {
  return factorial(n) / (factorial(2) * factorial(n - 2));
}

// 階乗計算
function factorial(n) {
  if (n === 0) {
      return 1;
  } else {
      return n * factorial(n - 1);
  }
}

// 配列をランダムに並び替える
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 配列をシャッフルし、chunkCount数で分割する
function splitArrayRandomly(array, chunkCount) {
  let chunks = [];
  let chunkSize = Math.floor(array.length / chunkCount);
  let size;
  // Logger.log("size " + chunkSize)
  let remainder = array.length % chunkCount;
  // Logger.log(remainder)
  array = shuffleArray(array);
  for (let i = 0; i < array.length; i += size) {
      size = chunkSize;
      if (remainder > 0) {
      size += 1;
      remainder -= 1;
      }
      chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function equalizeArrayLengths(arr1, arr2) {
  // 二つの配列の長さを取得
  const len1 = arr1.length;
  const len2 = arr2.length;

  // 長さの差を計算
  const lengthDiff = Math.abs(len1 - len2);

  // 長さが短い配列に空文字列を追加
  if (len1 < len2) {
    for (let i = 0; i < lengthDiff; i++) {
      arr1.push("");
    }
  } else if (len2 < len1) {
    for (let i = 0; i < lengthDiff; i++) {
      arr2.push("");
    }
  }

  // 長さを揃えた配列を返す
  return [arr1, arr2];
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Executing')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
      .showModalDialog(html, '処理を実行しています...');
}
