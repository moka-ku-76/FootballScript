const ScriptProperties = PropertiesService.getScriptProperties();
const ACCESS_TOKEN = ScriptProperties.getProperty('LINEtoken');
const bot = new MyLineBotSdk(ACCESS_TOKEN);

const MAX_QUICK_REPLY_ITEMS = 12;
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


