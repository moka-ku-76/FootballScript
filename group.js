//チーム作成に使う関数
//組み合わせを求める関数。チーム作成で使う。
function groupMaker(sheet) {
  const groupMakerRange = getGroupMakerRange(sheet);
  const numOfGroups = getNumOfGroups(groupMakerRange);
  const displayRange = groupMakerRange.offset(3, 0, 7, 3);
  displayRange.clearContent();

  // 参加メンバーの配列を取得
  let nameArray = getParticipants(sheet);

  // グループを表示する範囲に名前をセット
  setValuesInOrder(sheet, groupMakerRange.offset(3, 0, 7, numOfGroups), nameArray);
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
