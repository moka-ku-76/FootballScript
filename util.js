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