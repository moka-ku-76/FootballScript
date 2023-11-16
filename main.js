const ss = SpreadsheetApp.getActiveSpreadsheet();
const paramSheet = ss.getSheetByName("変数");
const tmpSheet = ss.getSheetByName("テンプレート");
const operationSheet = ss.getSheetByName("操作");
const recordSheet = ss.getSheetByName("記録");
//固定シートの数（変数、使い方、記録、操作、テンプレート）
const STATIC_SHEETS_NUMBER = 5;
const MAX_RATE = 5; //レートの最大値

const transpose = a=> a[0].map((_, c) => a.map(r => r[c]));

//その日のシートを作成する。
function createDatedResultSheet(dateString){
  let sheet_name = dateString;

  if(ss.getSheetByName(sheet_name) !== null) {
    throw Error("シートは既に存在しています");
  }

  let newSheet = tmpSheet.copyTo(ss);
  newSheet.setName(sheet_name);
  newSheet.setTabColor(null);
  newSheet.activate();
  ss.moveActiveSheet(STATIC_SHEETS_NUMBER + 1);
  return sheet_name;
}

////試合エリア
const startRowOfMatchRange = 1;
const startColumnOfMatchRange = 1;
const heightOfMatch = 11; //テンプレートの高さ
const widthOfMatch = 4;  //テンプレートの幅

////結果エリア
////メンバーテンプレート
//メンバーナンバーセル

////参加メンバーエリア
const startRowOfParticipantsRange = 2;
const startColumnOfParticipantsRange = 7;

////グループメイカーエリア
const offsetRowOfGroupMakerRange = 8; //オフセット + 試合数がGroupMakerのスタート
const startColumnOfGroupMakerRange = 6;
const heightOfGroupMaker = 13; //テンプレートの高さ
const widthOfGroupMaker = 6;  //テンプレートの幅

////リザルトエリア
const startRowOfResultRange = 1;
const startColumnOfResultRange = 6;

//記録シートの全データ
const recordLastRow = recordSheet.getLastRow();
const recordLastColumn = recordSheet.getLastColumn();
const recordDataRange = recordSheet.getRange(2, 1, recordLastRow - 1, recordLastColumn);
const recordData = recordDataRange.getValues();
const recordDataVertical = transpose(recordData);
const recordHeader = recordData[0];
let recordHeaderMapping = {};
for(let i = 0; i < recordHeader.length; i++){
  const headerName = recordHeader[i];
  recordHeaderMapping[headerName] = i;
}
const recordMembers = recordDataVertical[0].slice(1)
let recordMembersMapping = {};
for(let i = 0; i < recordMembers.length; i++){
  const member_name = recordMembers[i];
  recordMembersMapping[member_name] = i + 1;
}

//現在確保されている試合テンプレートの数
function getMatchesNumber(sheet){
  const data = sheet.getRange("A:A").getValues();
  const numericValues = data.flat().filter(function(value) {
    return typeof value === 'number';
  });
  return numericValues[numericValues.length - 1];
}

function finishMatch(sheet) {
  const gray = '#808080'; // グレーのカラーコード
  const currentMatchsNumber = getMatchesNumber(sheet);
  const range = sheet.getRange('A1:D' + String(currentMatchsNumber * heightOfMatch)); // AからD列まで全て取得
  const values = range.getValues();
  const backgrounds = range.getBackgrounds();

  for (let i = 0; i < backgrounds.length; i += heightOfMatch) { // 11行ごとに試合範囲を確認
    if (backgrounds[i][0] !== gray && values[i][0] !== '') { // 背景色がまだグレーでない & 試合番号が記入されている
      const matchRange = sheet.getRange(i + 1, 1, 11, 4); // 対象の試合範囲
      const matchValues = matchRange.getValues();

      // 出場者、レートがすべて入力されていることをチェック
      if (matchValues[1][1] !== '' && matchValues[1][3] !== '' && matchValues[9][1] !== '') {
        // すべて入力されている場合、背景色をグレーに変更
        matchRange.setBackground(gray);
        break;
      } else {
        throw new Error('試合結果の記入が不十分です。');
      }
    }
  }
}

//終了した試合数をカウント。背景色がグレーの場合試合が終了している。
function getFinishedMatchesNumber(sheet) {
  const gray = '#808080'; // グレーのカラーコード
  const currentMatchsNumber = getMatchesNumber(sheet);
  const range = sheet.getRange('A1:D' + String(currentMatchsNumber * heightOfMatch)); // AからD列まで全て取得
  const backgrounds = range.getBackgrounds();
  
  let finishedMatches = 0; // 記録が終了した試合数
  
  for (let i = 0; i < backgrounds.length; i += heightOfMatch) { // 11行ごとに試合範囲を確認
    if (backgrounds[i][0] === gray) { // 背景色がグレーである場合、試合は終了している
      finishedMatches++;
    }
  }
  
  return finishedMatches;
}


//現在の名前が入力された参加者の人数
function getParticipantsNumber(sheet){
  const firstParticipantsCell = sheet.getRange(startRowOfParticipantsRange, startColumnOfParticipantsRange);
  if(!firstParticipantsCell.getValue()){
    return 0;
  } else if ( !firstParticipantsCell.offset(0, 1).getValue()){
    return 1;
  }
  let lastParticipantsCell = firstParticipantsCell.getNextDataCell(SpreadsheetApp.Direction.NEXT);
  lastParticipantsCell = sheet.getRange(1,lastParticipantsCell.getColumn());
  const participantsNumber = lastParticipantsCell.getValue();
  return participantsNumber;
}


//現在の参加者の名前リストを取得
function getParticipants(sheet){
  const num_columns = getParticipantsNumber(sheet);
  if(num_columns == 0){
    return [];
  }
  const num_rows = 1;
  const participantsRange = sheet.getRange(startRowOfParticipantsRange, startColumnOfParticipantsRange, num_rows, num_columns);
  const participants = participantsRange.getValues()[0];
  return participants;
}

//予定されている参加者の人数
function getWidthOfParticipantRange(sheet){
  const firstParticipantsCell = sheet.getRange(startRowOfParticipantsRange - 1, startColumnOfParticipantsRange);
  if(!firstParticipantsCell.getValue()){
    return 0;
  } else if ( !firstParticipantsCell.offset(0, 1).getValue()){
    return 1;
  }
  let lastParticipantsCell = firstParticipantsCell.getNextDataCell(SpreadsheetApp.Direction.NEXT);
  lastParticipantsCell = sheet.getRange(1,lastParticipantsCell.getColumn());
  const participantsNumber = lastParticipantsCell.getValue();
  return participantsNumber;
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


function sumArray(...arr){
  let ret_arr = arr[0].slice();
  for(let i=1;i<arr.length;i++){
    for(let j=0;j<arr[i].length;j++){
      ret_arr[j]+=arr[i][j];
    }
  }
  return ret_arr;
}


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

function sumEach(array){
  let num = 0; 
  for(let i=0;i<array.length;i++){
    if(typeof(array[i])=="number"){
      num += array[i];
    }
  }
  return num;
}

function countGoals(sheet){
  let goals = {};  //プレイヤーごとのゴール数を格納するオブジェクト
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);  //終了した試合数。データを取得する範囲で使用
  console.log(finishedMatchsNumber);
  const values = sheet.getRange(1, 2, finishedMatchsNumber * heightOfMatch, 3).getValues();  //選手名とゴールのデータ

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

    const matchCount = getMatchesNumber(targetSheet);
    const participantCount = getParticipantsNumber(targetSheet);
    const participants = getParticipants(targetSheet);

    let pointResults = targetSheet.getRange(3, 7, matchCount, participantCount).getValues();
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

////チーム作成に使う関数
//組み合わせを求める関数。チーム作成で使う。
function countPairs(n) {
  return factorial(n) / (factorial(2) * factorial(n - 2));
}

function factorial(n) {
  if (n === 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

// グループ分け
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function splitArrayRandomly(array, chunkCount) {
  let chunks = [];
  let chunkSize = Math.floor(array.length / chunkCount);
  let size;
  // Logger.log("size " + chunkSize)
  let remainder = array.length % chunkCount;
  // Logger.log(remainder)
  array = shuffleArray(array);
  for (let i = 0; i < array.length; i += size) {
    size = chunkSize;
    if (remainder > 0) {
      size += 1;
      remainder -= 1;
    }
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
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

function groupMaker(sheet){
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
  //分割するチーム数を決定
  const groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
  const displayRange = groupMakerRange.offset(3,0,7,3);
  //記入されている情報をクリア
  displayRange.clearContent();
  
  //参加メンバーを取得
  const usePoolCell = groupMakerRange.offset(1,0,1,1);
  let nameArray = [];
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
  ////表示  
  //作成したグループを表示する範囲
  const groupDisplayRange = groupMakerRange.offset(3,0,7,groupsNumber);
  setValuesInOrder(sheet, groupDisplayRange, nameArray);
}

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


function makeMatchRange(sheet, number){
  let currentMatchsNumber = getMatchesNumber(sheet);
  while(currentMatchsNumber < number){
    addMatch(sheet);
    currentMatchsNumber = getMatchesNumber(sheet);
  }
}

function addMatch(sheet){
  //現在の試合数を取得
  ////試合記録範囲の追加
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
  targetMatchRange.setBackground("#ffffff");
  ////リザルト範囲への追加
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

function deleteLastMatch(sheet){
  ////試合記録範囲の削除
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

//参加者の枠を一つ追加する関数
function addParticipantsRange(sheet){
  ////既に空白の範囲が存在していれば処理を終了
  const participants = getParticipants(sheet);　//参加者を取得
  const widthOfParticipantsRange = getWidthOfParticipantRange(sheet);　//参加者範囲の長さを取得
  if(widthOfParticipantsRange > participants.length){
    const error = new Error("記入されていない欄が既に存在しています。");
    error.code = "E001";
    throw error;
  }

  const currentMatchsNumber = getMatchesNumber(sheet); //現在の試合数
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet); //現在の参加枠の列数
  const header = 2; //ヘッダーの行数
  const footer = 3; //フッターの行数

  const srcCheckCell = sheet.getRange(startRowOfResultRange + header + currentMatchsNumber, startColumnOfResultRange + currentParticipantsNumber + 1, 2, 1);
  const dstCheckCell = srcCheckCell.offset(0, 1, srcCheckCell.getNumRows(), srcCheckCell.getNumColumns());
  srcCheckCell.moveTo(dstCheckCell);
  srcCheckCell.clearFormat();

  const srcRange = sheet.getRange(startRowOfResultRange, startColumnOfResultRange + currentParticipantsNumber, header + currentMatchsNumber + footer, 1);
  const targetRange = srcRange.offset(0, 1, srcRange.getNumRows(), srcRange.getNumColumns());
  targetRange.clearDataValidations();
  srcRange.copyTo(targetRange);
  targetRange.offset(1,0,1, 1).clearContent() //名前のセルだけクリア
}

function setParticipants(sheet, name){
  const currentParticipants = getParticipants(sheet);
  console.log(currentParticipants)
  if(currentParticipants.includes(name)){
    throw new Error(name + "は既に参加しています。");
  }
  const currentMatchsNumber = getMatchesNumber(sheet); //現在の試合数
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet); //現在の参加枠の列数
  const header = 2; //ヘッダーの行数
  const footer = 3; //フッターの行数
  const targetRange = sheet.getRange(startRowOfResultRange, startColumnOfResultRange + currentParticipantsNumber, header + currentMatchsNumber + footer, 1);
  //名前のセルにnameをセット
  targetRange.offset(1,0,1, 1).setValue(name);
}

function addAndSetParticipants(sheet, name){
  try {
    addParticipantsRange(sheet);
  } catch (e) {
    // エラーコードが 'E001' の場合のみ setParticipants を実行
    if (e.code === 'E001') {
      console.warn(`エラーコード ${e.code} :` + e.message);
    } else {
      // それ以外のエラーの場合は、エラーを再投げして停止
      throw e;
    }
  }

  // エラーが発生しなかった場合も setParticipants を実行
  setParticipants(sheet, name);  
}


function deleteParticipantsRange(sheet){
  //現在の試合数
  const currentMatchsNumber = getMatchesNumber(sheet);
  //現在の参加枠の列数
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet);
  //ヘッダーの行数
  const header = 2;
  //フッターの行数
  const footer = 3;

  const srcCheckCell = sheet.getRange(startRowOfResultRange + header + currentMatchsNumber, startColumnOfResultRange + currentParticipantsNumber + 1, 2, 1);
  const dstCheckCell = srcCheckCell.offset(0, -1, srcCheckCell.getNumRows(), srcCheckCell.getNumColumns());
  srcCheckCell.moveTo(dstCheckCell);
  srcCheckCell.clearFormat();

  let targetRange = sheet.getRange(startRowOfResultRange, startColumnOfResultRange + currentParticipantsNumber, header + currentMatchsNumber, 1);
  targetRange.clear();
  targetRange.clearDataValidations();
  targetRange.offset(header + currentMatchsNumber + 2, 0, 1, 1).clear();
  targetRange.offset(header + currentMatchsNumber + 2, 0, 1, 1).clearDataValidations();
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

function goal(sheet, name){
  //最新の試合記録範囲を取得
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const latestMatchRange = sheet.getRange(finishedMatchsNumber * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  //チーム、ゴール範囲を取得
  const alphaPlayersRange = latestMatchRange.offset(1, 1, heightOfMatch - 4, 1);
  const scoresRange = latestMatchRange.offset(1, 2, heightOfMatch - 4, 1);
  const betaPlayersRange = latestMatchRange.offset(1, 3, heightOfMatch - 4, 1);
  //範囲の中からnameと等しいセルを探索し、該当するゴール範囲を編集
  const alphaPlayersArray = alphaPlayersRange.getValues();
  const betaPlayersArray = betaPlayersRange.getValues();
  for(let i = 0; i < alphaPlayersArray.length; i++) {
    if(alphaPlayersArray[i][0] === name || betaPlayersArray[i][0] === name) {
      const scoreCell = scoresRange.offset(i, 0, 1, 1);
      let scores = scoreCell.getValue().split(",");
      const teamIndex = alphaPlayersArray[i][0] === name ? 0 : 1;
      scores[teamIndex] = Math.max(0, parseInt(scores[teamIndex]) + 1); // ゴール数を1増やす
      scoreCell.setValue(scores.join(","));
      return;
    }
  }
}


function cancelGoal(sheet, name) {
  // 最新の試合記録範囲を取得
  const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
  const latestMatchRange = sheet.getRange(finishedMatchsNumber * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
  // チーム、ゴール範囲を取得
  const alphaPlayersRange = latestMatchRange.offset(1, 1, heightOfMatch - 4, 1);
  const scoresRange = latestMatchRange.offset(1, 2, heightOfMatch - 4, 1);
  const betaPlayersRange = latestMatchRange.offset(1, 3, heightOfMatch - 4, 1);
  // 範囲の中からnameと等しいセルを探索し、該当するゴール範囲を編集
  const alphaPlayersArray = alphaPlayersRange.getValues();
  const betaPlayersArray = betaPlayersRange.getValues();

  for(let i = 0; i < alphaPlayersArray.length; i++) {
    if(alphaPlayersArray[i][0] === name || betaPlayersArray[i][0] === name) {
      const scoreCell = scoresRange.offset(i, 0, 1, 1);
      let scores = scoreCell.getValue().split(",");
      const teamIndex = alphaPlayersArray[i][0] === name ? 0 : 1;
      scores[teamIndex] = Math.max(0, parseInt(scores[teamIndex]) - 1); // ゴール数を1減らす
      scoreCell.setValue(scores.join(","));
      return;
    }
  }
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


function registerMember(profileName, userId) {
  return new Promise((resolve, reject) => {
    try {
      const range = paramSheet.getRange(1, 3, paramSheet.getLastRow(), 2);
      const values = range.getValues();

      // 同じuserIdとprofileNameが存在するか確認
      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === userId && values[i][1] === profileName) {
          // 同じ組み合わせが見つかった場合は、何もせずに終了
          resolve(`${profileName}は既に登録済みです。`);
          return;
        }
      }

      // 最終行を探す（C列とD列が空でない最後の行）
      let lastRow = 1;
      for (let i = values.length - 1; i >= 0; i--) {
        if (values[i][0] !== "" || values[i][1] !== "") {
          lastRow = i + 1;
          break;
        }
      }

      // 同じ組み合わせが存在しない場合は、新たに追加
      const nextRow = lastRow + 1;
      paramSheet.getRange(nextRow, 3).setValue(userId);
      paramSheet.getRange(nextRow, 4).setValue(profileName);

      resolve(`ユーザー${profileName}を登録しました。`);

    } catch (error) {
      // エラー発生時
      reject("エラーが発生しました。");
    }
  });
}

function getPoolInfo(sheet){
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
  let poolInfo = []

  const poolCriteria = groupMakerRange.offset(1,3,1,1).getValue();
  poolInfo.push(`基準：${poolCriteria}\n`);

  const poolData = groupMakerRange.offset(2,3,10,3).getValues();
  
  // 各列 (プール) についてループ
  for (let col = 0; col < 3; col++) {
      // 各行についてループ
      for (let row = 0; row < poolData.length; row++) {
          // 空の名前は無視
          if (poolData[row][col] !== "") {
              poolInfo.push(poolData[row][col]);
          }
      }

      // プール間のセパレータ
      poolInfo.push('---');
  }
  poolInfo = poolInfo.join('\n');

  return poolInfo;
}

function getPoolCriteria(sheet){
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);

  const poolCriteria = groupMakerRange.offset(1,3,1,1).getValue();
  return poolCriteria;  
}

function setPool(sheet, criteria="", excludedParticipants=[]){
  const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
  const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);

  const poolCriteriaCell = groupMakerRange.offset(1, 3, 1, 1);
  //基準が引数として入力されていればその基準を使用
  if(criteria){
    poolCriteriaCell.setValue(criteria);
  }
  const poolCriteria = poolCriteriaCell.getValue();
  if(!poolCriteria){
    throw Error("基準が入力されていません");
  }
  const deviationValues = recordDataVertical[recordHeaderMapping[poolCriteria]];
  let participants = getParticipants(sheet);

  if (excludedParticipants.length > 0) {
    participants = participants.filter(participant => !excludedParticipants.includes(participant));
  }

  const sortedParticipants = participants.slice().sort((a, b) => {
    const aValue = deviationValues[recordMembersMapping[a]];
    const bValue = deviationValues[recordMembersMapping[b]];
    return bValue - aValue;
  });

  // const poolSize = Math.ceil(sortedParticipants.length / 3);
  //チーム数取得
  let groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
  const pool1 = sortedParticipants.slice(0, groupsNumber);
  const pool2 = sortedParticipants.slice(groupsNumber, 3 * groupsNumber);
  const pool3 = sortedParticipants.slice(3 * groupsNumber);

  const pool1Data = Array.from({ length: 10 }, (_, i) => [pool1[i] || '']);
  const pool2Data = Array.from({ length: 10 }, (_, i) => [pool2[i] || '']);
  const pool3Data = Array.from({ length: 10 }, (_, i) => [pool3[i] || '']);
  const combinedData = pool1Data.map((_, i) => [pool1Data[i][0], pool2Data[i][0], pool3Data[i][0]]);

  groupMakerRange.offset(3, 3, 10, 3).setValues(combinedData);
}



