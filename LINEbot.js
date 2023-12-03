const ScriptProperties = PropertiesService.getScriptProperties();
const ACCESS_TOKEN = ScriptProperties.getProperty('LINEtoken');
const bot = new MyLineBotSdk(ACCESS_TOKEN);

const MAX_QUICK_REPLY_ITEMS = 12;
const members = paramSheet.getRange('A2:A').getValues().flat().filter(Boolean);
let message;


function doPost(e) { bot.call(e, callback) };
async function callback(e) {
  let userId = e.source.userId;
  
  //最新の結果シートを取得
  const latestResultSheetName = getLatestResultSheetName();
  const latestResultSheet = ss.getSheetByName(latestResultSheetName);
  switch(e.type){
    case "message":
      handleMessage(e, userId, latestResultSheet);
      break
    case "postback":
      handlePostback(e, userId, latestResultSheet);
      break
  }
};



////@todayで呼び出す関数。
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


function implementingMessage(e){
  const message = bot.textMessage('実装中です');
  bot.replyMessage(e, [message]);
}

// function logMessage(e, message){
//   message = bot.textMessage(message);
//   bot.replyMessage(e, [message]);
// }

function logMessage(e, message){
  testMessage(message)
}


