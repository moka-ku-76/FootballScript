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