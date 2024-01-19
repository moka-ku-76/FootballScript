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
