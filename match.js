//現在確保されている試合テンプレートの数
function getMatchesNumber(sheet){
  const data = sheet.getRange("A:A").getValues();
  const numericValues = data.flat().filter(function(value) {
    return typeof value === 'number';
  });
  return numericValues[numericValues.length - 1];
}
  
//  試合終了
function finishMatch(sheet){
  const targetMatchNumber = getFinishedMatchesNumber(sheet) + 1;
  if (checkMatchRangeRecorded(targetMatchNumber)){
    const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
    targetMatchRange.setBackground(GRAY_CODE);
  } else {
    throw new Error('試合結果の記入が不十分です。');
  }
}

// 試合再開
function restartMatch(sheet){
  const targetMatchNumber = getFinishedMatchesNumber(sheet);
  const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
  targetMatchRange.setBackground(WHITE_CODE)
}

//試合の記録がされていることをチェック
function checkMatchRangeRecorded(matchNumber){
  const matchRange = sheet.getRange((matchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch); // 対象の試合範囲
  const matchValues = matchRange.getValues();

  // 出場者、レートがすべて入力されていることをチェック
  if (matchValues[1][1] !== '' && matchValues[1][3] !== '' && matchValues[9][1] !== '') {
    // すべて入力されている場合、trueを返す
    return true
  } else {
    return false
  }
}

  
//終了した試合数をカウント。背景色がグレーの場合、試合が終了している。途切れることなく試合が終了していることが前提。
function getFinishedMatchesNumber(sheet) {
  const currentMatchsNumber = getMatchesNumber(sheet);
  const range = sheet.getRange('A1:A' + String(currentMatchsNumber * heightOfMatch)); // AからD列まで全て取得
  const backgrounds = range.getBackgrounds();
  
  for (let i = 0; i < currentMatchsNumber; i++) {
    if (backgrounds[i * heightOfMatch][0] !== GRAY_CODE) { // 背景色がグレーである場合、試合は終了している
      return i
    }
  }
  return currentMatchsNumber
}

// 試合記録範囲の作成
function makeMatchRange(sheet, number){
  let currentMatchsNumber = getMatchesNumber(sheet);
  while(currentMatchsNumber < number){
    addMatch(sheet);
    currentMatchsNumber = getMatchesNumber(sheet);
  }
}

// 試合記録範囲を一つ追加
function addMatch(sheet){
  //現在の試合数を取得
  const currentMatchsNumber = getMatchesNumber(sheet);
  const srcMatchRange = sheet.getRange((currentMatchsNumber - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  const targetMatchRange = sheet.getRange(currentMatchsNumber * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  srcMatchRange.copyTo(targetMatchRange);
  targetMatchRange.offset(0,1,1,1).clearContent();
  targetMatchRange.offset(0,3,1,1).clearContent();
  targetMatchRange.offset(1,1,7,1).clearContent();
  let values = [];
  for (let i = 0; i < 7; i++) {
    values.push(["0,0"]);
  }
  targetMatchRange.offset(1,2,7,1).setValues(values)
  targetMatchRange.offset(1,3,7,1).clearContent();
  targetMatchRange.setBackground(WHITE_CODE);

  //リザルト範囲への追加
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet);
  //フッターの避難（GroupMakerも含む）
  const srcFooterRange = sheet.getRange(startRowOfResultRange + 1 + currentMatchsNumber + 1, startColumnOfResultRange, 3 + 2 + heightOfGroupMaker, Math.max(1 + currentParticipantsNumber + 1, widthOfGroupMaker));
  const targetFooterRange = srcFooterRange.offset(1, 0, srcFooterRange.getNumRows(), srcFooterRange.getNumColumns());
  srcFooterRange.moveTo(targetFooterRange);
  //テンプレートのコピー
  const srcParticipantsRange = sheet.getRange(startRowOfResultRange + 2, startColumnOfResultRange, 1, 1 + currentParticipantsNumber);
  const targetParticipantsRange = srcParticipantsRange.offset(currentMatchsNumber, 0, srcParticipantsRange.getNumRows(), srcParticipantsRange.getNumColumns());
  srcParticipantsRange.copyTo(targetParticipantsRange);
}

//試合記録範囲の削除
function deleteLastMatch(sheet){
  const currentMatchsNumber = getMatchesNumber(sheet);
  const targetMatchRange = sheet.getRange((currentMatchsNumber - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  targetMatchRange.clear();
  targetMatchRange.clearDataValidations();
  ////リザルト範囲での削除
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet);
  //フッターの避難（GroupMakerも含む）
  const srcFooterRange = sheet.getRange(startRowOfResultRange + 1 + currentMatchsNumber + 1, startColumnOfResultRange, 3 + 2 + heightOfGroupMaker, Math.max(1 + currentParticipantsNumber + 1, widthOfGroupMaker));
  const targetFooterRange = srcFooterRange.offset(-1, 0, srcFooterRange.getNumRows(), srcFooterRange.getNumColumns());
  srcFooterRange.moveTo(targetFooterRange);
}