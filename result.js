// 勝敗・引き分けをカウント
function countResult(array){
  let positive = 0;
  let negative = 0;
  let draw = 0;
  let result = [0,0,0];
  for(let i=0;i<array.length;i++){
    if(array[i]>0){
      positive++
    }else if(array[i]<0){
      negative++
    }else if(array[i]== 0){
      if(typeof(array[i])=="number"){
        draw++
      }
    }
  }
  result[0] = positive;
  result[1] = negative;
  result[2] = draw;
  return result;
}

  
function countGoals(sheet){
  let goals = {};  //プレイヤーごとのゴール数を格納するオブジェクト
  const numOfFinshedMatches = getNumOfFinishedMatches(sheet);  //終了した試合数。データを取得する範囲で使用
  console.log(numOfFinshedMatches);
  const values = sheet.getRange(1, 2, numOfFinshedMatches * heightOfMatch, 3).getValues();  //選手名とゴールのデータ

  values.forEach((row) => {
      if(row[1] && row[1].includes(",")){
      const alphaPlayer = row[0];
      const goalsData = row[1].split(",");
      const betaPlayer = row[2];

      //プレイヤーごとのゴールをカウント
      if(alphaPlayer !== "") {
          goals[alphaPlayer] = (goals[alphaPlayer] || 0) + parseInt(goalsData[0]);
      }
      if(betaPlayer !== "") {
          goals[betaPlayer] = (goals[betaPlayer] || 0) + parseInt(goalsData[1]);
      }
      }
  });
  return goals;
}

function inputRecordEachDay(){
  const resultSheets = operationSheet.getRange(1, 1, operationSheet.getLastRow(), operationSheet.getLastColumn()).getValues();
  let recordByMember = {};
  resultSheets.slice(1).forEach(sheet => {
    let dateString = Utilities.formatDate(sheet[0], 'JST', 'yyyy-MM-dd');
    
    const targetSheet = ss.getSheetByName(dateString);
    if (!targetSheet) {
      console.error(`Sheet for date ${dateString} not found.`);
      return;
    }

    const numOfMatches = getNumOfMatches(targetSheet);
    const numOfParticipants = getNumOfParticipants(targetSheet);
    const participants = getParticipants(targetSheet);

    let pointResults = targetSheet.getRange(3, 7, numOfMatches, numOfParticipants).getValues();
    pointResults = transpose(pointResults);

    const goalsByParticipant = countGoals(targetSheet);

    participants.forEach((participant, index) => {
      let pointResult = pointResults[index];
      let matchResult = countResult(pointResult);
      let total = sumEach(matchResult);
      let wins = matchResult[0];
      let losses = matchResult[1];
      let draws = matchResult[2];
      let points = sumEach(pointResult);
      let goals = goalsByParticipant[participant]
      let record = [total, wins, losses, draws, points, goals];
      // console.log(record)
      
      if (recordByMember[participant]) {
        recordByMember[participant] = sumArray(recordByMember[participant], record);
      } else {
        recordByMember[participant] = record;
      }
    });
  });
  const key = Object.keys(recordByMember)[0];
  const recordItemsNumber = recordByMember[key].length;
  const recordRange = recordSheet.getRange(3, 1, Object.keys(recordByMember).length, 1 + recordItemsNumber);
  // 前回までの記録をクリア
  recordRange.clearContent();

  const names = Object.keys(recordByMember);
  const records = Object.values(recordByMember);

  let dataToWrite = names.map((name, index) => [name, ...records[index]]);
  recordRange.setValues(dataToWrite);

  // ポイントで降順にソート
  const pointsColumnIndex = 6; 
  const ascending = false;
  recordRange.sort([{column: pointsColumnIndex, ascending: ascending}]);
}


function getDailyRecords(sheet) {
  let recordByParticipant = {};
  const numOfMatches = getNumOfMatches(sheet);
  const numOfParticipants = getNumOfParticipants(sheet);
  const participants = getParticipants(sheet);

  // 試合結果と得点の範囲を取得
  let pointResults = sheet.getRange(3, 7, numOfMatches, numOfParticipants).getValues();
  pointResults = transpose(pointResults); // 縦横変換

  // 各参加者のゴール数を集計
  const goalsByParticipant = countGoals(sheet);

  // 各参加者の記録を集計
  participants.forEach((participant, index) => {
    let pointResult = pointResults[index];
    let matchResult = countResult(pointResult); // 試合結果の集計
    // 合計試合数、勝利数、敗北数、引き分け数、得点数、ゴール数
    let record = [sumEach(matchResult), matchResult[0], matchResult[1], matchResult[2], sumEach(pointResult), goalsByParticipant[participant]];

    recordByParticipant[participant] = record;
  });

  return recordByParticipant;
}
