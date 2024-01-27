function generateMatchSummary(sheet, target = -1) {
  let matchInfo;
  try{
    matchInfo = getMatchInfo(sheet, target=target)
  } catch(e){
    return "試合が見つかりません"
  }
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

  // // Get maximum number of players between both teams
  const maxPlayers = Math.max(playersAlpha.length, playersBeta.length);
  [playersAlpha, playersBeta] = equalizeArrayLengths(playersAlpha, playersBeta)

  let summary = `第${No}試合　レート ${rate}\n\n`;

  if (teamAlphaName || teamBetaName) {
    summary += `${teamAlphaName || ""}`.padEnd(10, " ") + "vs" + `${teamBetaName || ""}`.padStart(10, " ") + '\n';
  }

  // メッセージの幅
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

function generateMatchFinishMessage(sheet){
  let message = "試合終了\n";
  const numOfFinishedMatches = getNumOfFinishedMatches(sheet);
  const finishedMatchSummary = generateMatchSummary(sheet, target = numOfFinishedMatches);
  message += finishedMatchSummary + "\n\n";

  message += "現在進行中の試合\n"
  const nextMatchSummary = generateMatchSummary(sheet);
  message += nextMatchSummary

  return message;
}

function createHelpMessage() {
  return `
    Botの各機能について説明します：

    1. "@help" - ヘルプメッセージ（このメッセージ）を表示します。

    2. "@today" - 本日の日付をシートに追加します。

    3. "!参加者名" - 参加者を追加します。複数の参加者を追加する場合は、名前を"、"で区切って入力してください。

    4. "@participants" - 最新のシートの参加者一覧を表示します。

    5. "@pool{:指標}" - プールを作成します。

    6. "@round" - グループを作成し、試合記録シートに結果を適用します。

    7. "@rate{:数値}" - レートを1増加します。コロンの後に数値を入力するとその値を直接設定します。（最大値は5）

    8. "@goal" - ゴールした選手の情報を要求します。

    9. "@finish" - 試合結果を表示します。

    10. "@rsvp" - 参加するかどうかを尋ねるクイックリプライを表示します。

    11. "@join" - ユーザを登録します。

    12. "@members" - 登録メンバー一覧を表示します。
  `;
}

// infoで返されるメッセージ
function createDailySummary(sheet) {
  const dailyInfo = getDailyInfo(sheet);
  let {
    date,
    numOfMatches,
    numOfParticipants,
    winRateBest3,
    winRateWorst3,
    pointsBest3,
    pointsWorst3,
    goalsTop3,
  } = dailyInfo

  let summary = date + "\n"
  summary += `試合数：${numOfMatches}\n`
  summary += `参加者：${numOfParticipants}名\n`
  summary += '\n'
  summary += "勝率BEST3\n"
  summary += winRateBest3.map(item => {
    return `  ${item.participant}： ${item.fraction}  ${(item.winRate * 100).toFixed(2)}%\n`;
  }).join('');
  summary += '\n'
  summary += "勝率WORST3\n"
  summary += winRateWorst3.map(item => {
    return `  ${item.participant}： ${item.fraction}  ${(item.winRate * 100).toFixed(2)}%\n`;
  }).join('');
  summary += '\n'
  summary += "賞金BEST3\n"
  summary += pointsBest3.map(item => {
    return `  ${item.participant}： ${item.points}\n`;
  }).join('');
  summary += '\n'
  summary += "賞金WORST3\n"
  summary += pointsWorst3.map(item => {
    return `  ${item.participant}： ${item.points}\n`;
  }).join('');
  summary += '\n'
  summary += "ゴール数BEST3\n"
  summary += goalsTop3.map(item => {
    return `  ${item.participant}： ${item.goals}\n`;
  }).join('')

  return summary
}

function padCenter(str, len, fill) {
  let totalPadding = len - str.length;
  if (totalPadding <= 0) return str;

  let leftPadding = Math.floor(totalPadding / 2);
  let rightPadding = totalPadding - leftPadding;

  return str.padStart(str.length + leftPadding, fill).padEnd(len, fill);
}