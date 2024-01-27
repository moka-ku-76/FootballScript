//現在確保されている試合テンプレートの数
function getNumOfMatches(sheet){
  const data = sheet.getRange("A:A").getValues();
  const numericValues = data.flat().filter(function(value) {
    return typeof value === 'number';
  });
  return numericValues[numericValues.length - 1];
}
  
//  試合終了
function finishMatch(sheet){
  const targetMatchNumber = getNumOfFinishedMatches(sheet) + 1;
  if (isMatchRangeFilled(sheet, targetMatchNumber)){
    const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
    targetMatchRange.setBackground(GRAY_CODE);
  } else {
    throw new Error('試合結果の記入が不十分です。');
  }
}

// 入力されたシート上の最後に終了した試合を再開させる関数
function restartMatch(sheet){
  const targetMatchNumber = getNumOfFinishedMatches(sheet); //最後に終了した試合の番号を取得
  if (targetMatchNumber === 0){
    throw new Error("再開させる試合が存在しません。")
  }
  const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
  targetMatchRange.setBackground(WHITE_CODE)
}

//試合の記録がされていることをチェック
function isMatchRangeFilled(sheet, matchNumber){
  const matchRange = sheet.getRange((matchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch); // 対象の試合範囲
  const matchValues = matchRange.getValues();

  // チームAの一人目、チームBの一人目、レートがすべて入力されていることをチェック
  if (matchValues[1][1] !== '' && matchValues[1][3] !== '' && matchValues[9][1] !== '') {
    // すべて入力されている場合、trueを返す
    return true
  } else {
    return false
  }
}

  
//終了した試合数をカウント。背景色がグレーの場合、試合が終了している。途切れることなく試合が終了していることが前提。
function getNumOfFinishedMatches(sheet) {
  const numOfMatches = getNumOfMatches(sheet);
  const range = sheet.getRange('A1:A' + String(numOfMatches * heightOfMatch)); // AからD列まで全て取得
  const backgrounds = range.getBackgrounds();
  
  for (let i = 0; i < numOfMatches; i++) {
    if (backgrounds[i * heightOfMatch][0] !== GRAY_CODE) { // 背景色がグレーである場合、試合は終了している
      return i
    }
  }
  return numOfMatches
}

// 試合記録範囲の作成
function makeMatchRange(sheet, number){
  let numOfMatches = getNumOfMatches(sheet);
  while(numOfMatches < number){
    addMatch(sheet);
    numOfMatches = getNumOfMatches(sheet);
  }
}

// 試合記録範囲を一つ追加
function addMatch(sheet){
  //現在の試合数を取得
  const numOfMatches = getNumOfMatches(sheet);
  const srcMatchRange = sheet.getRange((numOfMatches - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  const targetMatchRange = sheet.getRange(numOfMatches * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
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
  const srcFooterRange = sheet.getRange(startRowOfResultRange + 1 + numOfMatches + 1, startColumnOfResultRange, 3 + 2 + heightOfGroupMaker, Math.max(1 + currentParticipantsNumber + 1, widthOfGroupMaker));
  const targetFooterRange = srcFooterRange.offset(1, 0, srcFooterRange.getNumRows(), srcFooterRange.getNumColumns());
  srcFooterRange.moveTo(targetFooterRange);
  //テンプレートのコピー
  const srcParticipantsRange = sheet.getRange(startRowOfResultRange + 2, startColumnOfResultRange, 1, 1 + currentParticipantsNumber);
  const targetParticipantsRange = srcParticipantsRange.offset(numOfMatches, 0, srcParticipantsRange.getNumRows(), srcParticipantsRange.getNumColumns());
  srcParticipantsRange.copyTo(targetParticipantsRange);
}

//試合記録範囲の削除
function deleteLastMatch(sheet){
  const numOfMatches = getNumOfMatches(sheet);
  const targetMatchRange = sheet.getRange((numOfMatches - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  targetMatchRange.clear();
  targetMatchRange.clearDataValidations();
  ////リザルト範囲での削除
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet);
  //フッターの避難（GroupMakerも含む）
  const srcFooterRange = sheet.getRange(startRowOfResultRange + 1 + numOfMatches + 1, startColumnOfResultRange, 3 + 2 + heightOfGroupMaker, Math.max(1 + currentParticipantsNumber + 1, widthOfGroupMaker));
  const targetFooterRange = srcFooterRange.offset(-1, 0, srcFooterRange.getNumRows(), srcFooterRange.getNumColumns());
  srcFooterRange.moveTo(targetFooterRange);
}

function setMatchInfo({sheet, target, teamAlphaName = "", teamBetaName = "", playersAlpha = [], playersBeta = [], rate = ""}) {
  // 対象の試合記録範囲を取得
  const targetMatchRange = sheet.getRange((target - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  
  // チーム名をセット（入力されている場合のみ）
  if (teamAlphaName) {
    targetMatchRange.offset(0, 1, 1, 1).setValue(teamAlphaName); // チームA名をセット
  }
  if (teamBetaName) {
    targetMatchRange.offset(0, 3, 1, 1).setValue(teamBetaName); // チームB名をセット
  }

  // プレイヤー名をセット（配列が空でない場合のみ）
  if (playersAlpha.length) {
    playersAlpha.forEach((player, index) => {
      targetMatchRange.offset(index + 1, 1, 1, 1).setValue(player);
    });
  }
  if (playersBeta.length) {
    playersBeta.forEach((player, index) => {
      targetMatchRange.offset(index + 1, 3, 1, 1).setValue(player);
    });
  }

  // 使用レートをセット（入力されている場合のみ）
  if (rate) {
    targetMatchRange.offset(9, 1, 1, 1).setValue(rate);
  }
}


function getCurrentRate(sheet){
  const numOfFinshedMatches = getNumOfFinishedMatches(sheet);
  const lastMatchInfo = getMatchInfo(sheet, target = numOfFinshedMatches + 1);

  return lastMatchInfo.rate;
}

function setRate(sheet, rate){
  const numOfFinshedMatches = getNumOfFinishedMatches(sheet);
  const numOfMatches = getNumOfMatches(sheet);

  for(let i = numOfFinshedMatches + 1; i <= numOfMatches; i++){
    setMatchInfo({sheet: sheet, target: i, rate:rate});
  }
}

function incrementRate(sheet) {
  const currentRate = getCurrentRate(sheet);
  // 1を加算し、5で割った余りを計算。0の場合は5に設定
  const newRate = (currentRate % 5) + 1;
  setRate(sheet, newRate);
  return `レートを${newRate}に変更しました。`;
}


function getMatchInfo(sheet, target = -1){
  if(target === -1){
    target = getNumOfFinishedMatches(sheet) + 1;
  }

  if(!isMatchRangeFilled(sheet, target)){
    throw new Error("必須情報が入力されていません。")
  }

  const matchRange = sheet.getRange((target - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfGroupMaker);

  // チーム名を取得
  let teamAlphaName = matchRange.offset(0, 1, 1, 1).getValue();
  let teamBetaName = matchRange.offset(0, 3, 1, 1).getValue();

  // プレイヤー名を取得
  let playersAlpha = [];
  let playersBeta = [];
  for(let i = 0; i < 7; i++) {
    playersAlpha.push(matchRange.offset(i + 1, 1, 1, 1).getValue());
    playersBeta.push(matchRange.offset(i + 1, 3, 1, 1).getValue());
  }
  playersAlpha = playersAlpha.filter(function(value) {return value !== "";})
  playersBeta = playersBeta.filter(function(value) {return value !== "";})

  // スコアを取得
  let scoreAlpha = matchRange.offset(8, 1, 1, 1).getValues();
  let scoreBeta = matchRange.offset(8, 3, 1, 1).getValues();

  // ポイントを取得
  let pointAlpha = matchRange.offset(10, 1, 1, 1).getValues();
  let pointBeta = matchRange.offset(10, 3, 1, 1).getValues();

  // 得点者を取得
  let scorersAlpha = {}, scorersBeta = {};
  for(let i = 0; i < 7; i++) {
    let scorer = matchRange.offset(i + 1, 2, 1, 1).getValue();
    let score = scorer.split(",");
    if(score[0] > 0){
      scorersAlpha[playersAlpha[i]] = parseInt(score[0]);
    }
    if(score[1] > 0){
      scorersBeta[playersBeta[i]] = parseInt(score[1]);
    }
  }

  // 使用レートを取得
  let rate = matchRange.offset(9, 1, 1, 1).getValue();

  // 試合Noを取得
  let matchNo = matchRange.offset(0, 0, 1, 1).getValue();

  return {
    "teamAlphaName": teamAlphaName,
    "teamBetaName": teamBetaName,
    "playersAlpha": playersAlpha,
    "playersBeta": playersBeta,
    "scoreAlpha": scoreAlpha,
    "scoreBeta": scoreBeta,
    "pointAlpha": pointAlpha,
    "pointBeta": pointBeta,
    "scorersAlpha": scorersAlpha,
    "scorersBeta": scorersBeta,
    "rate": rate,
    "No": matchNo
  }
}


