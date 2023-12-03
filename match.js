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
  console.log("ok")
  if (checkMatchRangeRecorded(sheet, targetMatchNumber)){
    const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
    targetMatchRange.setBackground(GRAY_CODE);
  } else {
    throw new Error('試合結果の記入が不十分です。');
  }
}

// 入力されたシート上の最後に終了した試合を再開させる関数
function restartMatch(sheet){
  const targetMatchNumber = getFinishedMatchesNumber(sheet); //最後に終了した試合の番号を取得
  if (targetMatchNumber === 0){
    throw new Error("再開させる試合が存在しません。")
  }
  const targetMatchRange = sheet.getRange((targetMatchNumber - 1) * heightOfMatch + 1, 1, heightOfMatch, widthOfMatch);
  targetMatchRange.setBackground(WHITE_CODE)
}

//試合の記録がされていることをチェック
function checkMatchRangeRecorded(sheet, matchNumber){
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
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const lastMatchInfo = getMatchInfo(sheet, target = finishedMatchsNumber + 1);

  return lastMatchInfo.rate;
}

function setRate(sheet, rate){
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const currentMatchsNumber = getMatchesNumber(sheet);

  for(let i = finishedMatchsNumber + 1; i <= currentMatchsNumber; i++){
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
    target = getFinishedMatchesNumber(sheet) + 1;
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

function generateMatchSummary(sheet, target = -1) {
  const matchInfo = getMatchInfo(sheet, target=target)
  let {
    teamAlphaName,
    teamBetaName,
    playersAlpha,
    playersBeta,
    scoreAlpha,
    scoreBeta,
    pointAlpha,
    pointBeta,
    rate,
    No
  } = matchInfo;

  // Get maximum number of players between both teams
  const maxPlayers = Math.max(playersAlpha.length, playersBeta.length);

  // Fill the remaining slots with empty strings for alignment
  while (playersAlpha.length < maxPlayers) {
    playersAlpha.push("");
  }
  
  while (playersBeta.length < maxPlayers) {
    playersBeta.push("");
  }

  let summary = `第${No}試合　レート ${rate}\n\n`;

  if (teamAlphaName || teamBetaName) {
    summary += `${teamAlphaName || ""}`.padEnd(10, " ") + "vs" + `${teamBetaName || ""}`.padStart(10, " ") + '\n';
  }

  const len = 18;
  const fill = "　";
  // const fill = "\u3000";
  for (let i = 0; i < maxPlayers; i++) {
    summary += padCenter(playersAlpha[i], len/2, fill) + padCenter(playersBeta[i], len/2, fill) + '\n';
  }

  summary += "\n" + padCenter("スコア", len + 1, fill) + "\n";
  summary += padCenter(`${scoreAlpha}`, len/2, fill) + "-" + padCenter(`${scoreBeta}`, len/2, fill) + '\n';
  
  summary += "\n" + padCenter("ポイント", len + 1, fill) + "\n";
  summary += padCenter(`${pointAlpha}`, len/2, fill) + "-" + padCenter(`${pointBeta}`, len/2, fill) + '\n';

  return summary;
}

function padCenter(str, len, fill) {
  let totalPadding = len - str.length;
  if (totalPadding <= 0) return str;

  let leftPadding = Math.floor(totalPadding / 2);
  let rightPadding = totalPadding - leftPadding;

  return str.padStart(str.length + leftPadding, fill).padEnd(len, fill);
}
