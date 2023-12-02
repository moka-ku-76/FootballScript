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
      throw Error("終了していない試合が存在します。");
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




function setMatchInfo({sheet, target, teamAlphaName = "", teamBetaName = "", playersAlpha = [], playersBeta = [], rate = ""}) {
  //対象の試合記録範囲を取得
  const targetMatchRange = sheet.getRange((target - 1) * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  
  // チーム名をセット
  targetMatchRange.offset(0, 1, 1, 1).setValue(teamAlphaName); // チームA名をB1にセット
  targetMatchRange.offset(0, 3, 1, 1).setValue(teamBetaName); // チームB名をD1にセット

  // プレイヤー名をセット
  for(let i = 0; i < (heightOfMatch - 4); i++) {
    // チームAのプレイヤー名をセット
    if(playersAlpha[i]) {
      targetMatchRange.offset(i + 1, 1, 1, 1).setValue(playersAlpha[i]);
    }

    // チームBのプレイヤー名をセット
    if(playersBeta[i]) {
      targetMatchRange.offset(i + 1, 3, 1, 1).setValue(playersBeta[i]);
    }
  }

  // 使用レートをセット
  targetMatchRange.offset(9, 1, 1, 1).setValue(rate); // 使用レートをセット
}

function getCurrentRate(sheet){
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const lastMatchInfo = getMatchInfo(sheet, target = finishedMatchsNumber);

  return lastMatchInfo.rate;
}

function setRate(sheet, rate){
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const currentMatchsNumber = getMatchesNumber(sheet);

  for(let i = finishedMatchsNumber + 1; i <= currentMatchsNumber; i++){
    setMatchInfo({sheet: sheet, target: i, rate:rate});
  }
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





