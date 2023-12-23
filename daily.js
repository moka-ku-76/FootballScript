//その日のシートを作成する。操作シートから呼び出される関数。
function createDatedResultSheet(dateString){
  let sheet_name = dateString;

  if(ss.getSheetByName(sheet_name) !== null) {
    throw new Error("シートは既に存在しています");
  }

  let newSheet = tmpSheet.copyTo(ss);
  newSheet.setName(sheet_name);
  newSheet.setTabColor(null);
  newSheet.activate();
  ss.moveActiveSheet(STATIC_SHEETS_NUMBER + 1);
  return sheet_name;
}

//@todayで呼び出す関数。
function addTodaysDateToOperationSheet() {
  const today = new Date(); // 今日の日付を取得

  // A列の全ての値を取得
  const columnA = operationSheet.getRange('A:A').getValues();
  
  // A列に今日の日付がすでに存在するかチェック
  for (let i = 0; i < columnA.length; i++) {
    if (columnA[i][0] === today) {
      throw new Error("今日の日付はすでに入力されています。");
    }
  }

  // シートのタイムゾーンに基づいて日付をフォーマット
  const formattedDate = Utilities.formatDate(today, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  
  const lastRow = operationSheet.getLastRow() + 1; // A列の最終行の次の行を取得
  // A列の最終行に今日の日付を入力
  operationSheet.getRange('A' + lastRow).setValue(formattedDate);
  const createdSheetName = createDatedResultSheet(formattedDate);
  return createdSheetName;
}

  //最新の結果シート名を取得
function getLatestResultSheetName(){
  let sheets = ss.getSheets();
  sheets = sheets.map(sheet => sheet.getName());
  const exp = /^(\d{4}-\d{2}-\d{2})(-\d+)?$/; //結果シートの名前パターン
  sheets = sheets.filter(sheet => exp.test(sheet));
  sheets.sort((a,b) => b.localeCompare(a));
  const latestResultSheetName = sheets[0]; 
  return latestResultSheetName;
}

// デイリーの情報を返す関数
function getDailyInfo(sheet){
  // 日にち
  const date = sheet.getName();
  // 試合数
  const numOfMatches = getNumOfMatches(sheet)
  // 参加人数
  const numOfparticipants = getNumOfParticipants(sheet);
  // 選手ごとのゴール数
  const goalsByParticipant = countGoals(sheet);
  // 選手ごとの勝ち、負け、引き分け、勝ち点、勝率
  const recordByParticipant = getDailyRecords(sheet);
  // 選手ごとのポイント
  return {
    "date": date,
    "numOfMatches": numOfMatches,
    "numOfparticipants": numOfparticipants,
  }
}


function getDailyInfo(sheet) {
  const date = sheet.getName();
  const numOfMatches = getNumOfMatches(sheet);
  const numOfParticipants = getNumOfParticipants(sheet);
  const goalsByParticipant = countGoals(sheet);
  const recordByParticipant = getDailyRecords(sheet);

  // 勝率の計算とランキング作成
  const winRateRanking = calculateWinRateRanking(recordByParticipant);
  
  // 獲得ポイントのランキング作成
  const pointsRanking = calculatePointsRanking(recordByParticipant);

  // ゴール数のランキング作成
  const goalsRanking = calculateGoalsRanking(goalsByParticipant);

  return {
    date: date,
    numOfMatches: numOfMatches,
    numOfParticipants: numOfParticipants,
    winRateBest3: winRateRanking.best3,
    winRateWorst3: winRateRanking.worst3,
    pointsBest3: pointsRanking.best3,
    pointsWorst3: pointsRanking.worst3,
    goalsTop3: goalsRanking.top3
  };
}

// 勝率のランキング計算
function calculateWinRateRanking(records) {
  const winRates = Object.entries(records).map(([participant, record]) => {
    const total = record[0];
    const wins = record[1];
    const winRate = total > 0 ? (wins / total) : 0; // 分数形式の勝率
    return { participant, winRate, fraction: `${wins}/${total}` }; // 分数も追加
  });

  // 勝率で降順ソート
  winRates.sort((a, b) => b.winRate - a.winRate);

  const best3 = extractTopRankers(winRates, 'winRate');
  const worst3 = extractTopRankers(winRates.slice().reverse(), 'winRate');
  return { best3, worst3 };
}

// ポイントのランキング計算
function calculatePointsRanking(records) {
  const points = Object.entries(records).map(([participant, record]) => {
    return { participant, points: record[4] };
  });
  points.sort((a, b) => b.points - a.points);
  const best3 = extractTopRankers(points, 'points');
  const worst3 = extractTopRankers(points.slice().reverse(), 'points');
  return { best3, worst3 };
}


// ゴール数のランキング計算
function calculateGoalsRanking(goals) {
  const goalsArray = Object.entries(goals).map(([participant, goals]) => {
    return { participant, goals };
  });
  goalsArray.sort((a, b) => b.goals - a.goals);
  const top3 = extractTopRankers(goalsArray, 'goals');
  return { top3 };
}


function extractTopRankers(arr, key) {
  const topRankers = [];
  for (let i = 0; i < arr.length && topRankers.length < 3; i++) {
    topRankers.push(arr[i]);
    while (i + 1 < arr.length && arr[i][key] === arr[i + 1][key]) {
      i++;
      topRankers.push(arr[i]);
    }
  }
  return topRankers;
}

