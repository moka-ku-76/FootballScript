//シート情報
const ss = SpreadsheetApp.getActiveSpreadsheet();
const paramSheet = ss.getSheetByName("変数");
const tmpSheet = ss.getSheetByName("テンプレート");
const operationSheet = ss.getSheetByName("操作");
const recordSheet = ss.getSheetByName("記録");
//固定シートの数（変数、使い方、記録、操作、テンプレート）
const STATIC_SHEETS_NUMBER = 5;
const MAX_RATE = 5; //レートの最大値

const transpose = a=> a[0].map((_, c) => a.map(r => r[c]));

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

// その他
const GRAY_CODE = '#808080';
const WHITE_CODE = '#ffffff';