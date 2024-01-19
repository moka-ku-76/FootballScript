//チーム作成に使う関数
//組み合わせを求める関数。チーム作成で使う。
function groupMaker(sheet) {
  const groupMakerRange = getGroupMakerRange(sheet);
  const numOfGroups = getNumOfGroups(groupMakerRange);
  const displayRange = groupMakerRange.offset(3, 0, 7, 3);
  displayRange.clearContent();

  // メンバーをランダムに分割
  let nameArray = [];
  const usePoolCell = groupMakerRange.offset(1,0,1,1);
  if(usePoolCell.isChecked()){
    ////プールを利用する場合
    const poolRange = groupMakerRange.offset(3,3,10,3);  //プールの範囲を取得
    const poolsNum = 3;  //プールの最大数

    //プール数分forループを回す
    for(let i=0;i<poolsNum;i++){
    let range = poolRange.offset(0,i,poolRange.getNumRows(),1);      
    let partNameArray = transpose(range.getValues())[0].filter(function(value) {return value !== "";});
    partNameArray = shuffleArray(partNameArray);
    nameArray = nameArray.concat(partNameArray);
    }
  }else{
    nameArray = getParticipants(sheet);
    nameArray = shuffleArray(nameArray);
  }
  // グループを表示する範囲に名前をセット
  const groupDisplayRange = groupMakerRange.offset(3,0,7, numOfGroups);
  setValuesInOrder(sheet, groupDisplayRange, nameArray);
}


function getGroupMakerRange(sheet) {
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getNumOfMatches(sheet);
  return sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
}


function getNumOfGroups(groupMakerRange) {
  return groupMakerRange.offset(1,1,1,1).getValue();
}



function setValuesInOrder(sheet, range, values) {
  const startRow = range.getRow();
  const startColumn = range.getColumn();
  const width = range.getNumColumns();
  const height = Math.ceil(values.length / width);

  let output = Array.from({ length: height }, () => Array(width).fill(""));

  values.forEach((value, index) => {
    const row = Math.floor(index / width);
    const column = index % width;

    // Set the value in the output array
    output[row][column] = value;
  });

  // Write the 2D array to the sheet in one go
  sheet.getRange(startRow, startColumn, height, width).setValues(output);
}
