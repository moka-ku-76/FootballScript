function getGroupInfo(sheet){
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
  //分割するチーム数を決定
  const groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();

  const groupRange = groupMakerRange.offset(2,0,8,groupsNumber);
  const groupData = groupRange.getValues();

  let groupInfo = []
  // 各列 (プール) についてループ
  for (let col = 0; col < groupsNumber; col++) {
    groupInfo.push(`チーム${col + 1}`);
      // 各行についてループ
      for (let row = 0; row < groupData.length; row++) {
          // 空の名前は無視
          if (groupData[row][col] !== "") {
              groupInfo.push(groupData[row][col]);
          }
      }
      // プール間のセパレータ
      groupInfo.push('---');
  }
  groupInfo = groupInfo.join('\n');
  return groupInfo;
}


function applyResultToSheet(sheet){
  const currentMatchsNumber = getMatchesNumber(sheet); //確保されている試合記録シート数
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + currentMatchsNumber;

  const finishedMatchsNumber = getFinishedMatchesNumber(sheet); //記録が終わった試合数
  let blankMatchRangeNumber = currentMatchsNumber - finishedMatchsNumber;  //記録が終わっていない試合数

  //表示されているグループの配列を取得
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);

  //チーム数取得
  let groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
  let groupRange = groupMakerRange.offset(3,0,7,groupsNumber);
  
  //チームの配列を取得
  let chunksArray = groupRange.getValues();
  chunksArray = transpose(chunksArray);

  let roundMatchesNum = countPairs(groupsNumber);
  let lackMatchesNum = roundMatchesNum - blankMatchRangeNumber;
  for(let i = 0; i < lackMatchesNum; i++){
    addMatch(sheet);    
  }
  for (let i = 0; i < roundMatchesNum; i++) {
    let matchRange = sheet.getRange(1,1,heightOfMatch,widthOfMatch);
    matchRange = matchRange.offset((i+finishedMatchsNumber)*heightOfMatch,0);
    if(matchRange.offset(1,1,1,1).getValue()){
      throw new Error("終了していない試合が存在します。");
    }
    matchRange.offset(1,1,chunksArray[0].length,1).setValues(transpose([chunksArray[i]]));
    matchRange.offset(1,3,chunksArray[0].length,1).setValues(transpose([chunksArray[(i+1) % chunksArray.length]]));
  }
}


function makeResultRange(sheet, number){
  //メンバー追加処理
  const firstCell = sheet.getRange(startRowOfResultRange, startColumnOfResultRange);
  //現在の試合数取得
  const currentMatchsNumber = getMatchesNumber(sheet);
  //ヘッダーの行数
  const header = 2;
  //フッターの行数
  const footer = 3;

  //元の参加人数取得
  let srcParticipantsNumber = getWidthOfParticipantRange(sheet);
  //元のリザルト範囲を取得
  let srcResultRange = firstCell.offset(0,0,header + currentMatchsNumber + footer, 1 + srcParticipantsNumber + 1);

  //先の参加人数取得
  let dstParticipantsNumber = number;
  //先の範囲を取得
  let dstResultRange = firstCell.offset(0,0, header + currentMatchsNumber + footer, 1 + dstParticipantsNumber + 1);
  //チェックセルの範囲を取得
  let srcCheckCell = srcResultRange.offset(srcResultRange.getNumRows()-3,srcResultRange.getNumColumns()-1,2,1);
  let dstCheckCell = dstResultRange.offset(dstResultRange.getNumRows()-3,dstResultRange.getNumColumns()-1,2,1);
  //チェックセルの移動
  srcCheckCell.moveTo(dstCheckCell);
  //テンプレートを取得
  let templateRange = srcResultRange.offset(0,1,srcResultRange.getNumRows(),1);
  templateRange.copyTo(dstResultRange.offset(0, srcResultRange.getNumColumns() - 1, dstResultRange.getNumRows(), dstResultRange.getNumColumns() - srcResultRange.getNumColumns()));
}









