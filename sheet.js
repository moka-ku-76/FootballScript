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