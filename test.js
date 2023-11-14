const testUserId = ScriptProperties.getProperty('userID');


function testMessage(message=""){
  bot.pushMessage(testUserId, message + "OK");
}

function implementingMessage(e){
  const message = bot.textMessage('実装中です');
  bot.replyMessage(e, [message]);
}

function logMessage(e, message){
  message = bot.textMessage(message);
  bot.replyMessage(e, [message]);
}

async function testLINE() {
  const events = {
    "events": [
      {
        "type": "message",
        "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
        "source": {
          "userId": "U5f458bdf51f8ad2a5f5920e1be7d4d67",
          "type": "user"
        },
        "timestamp": 1462629479859,
        "message": {
          "type": "text",
          "id": "325708",
          "text": "テストです"
        }
      }
    ]
  };
  const latestResultSheetName = getLatestResultSheetName();
  const latestResultSheet = ss.getSheetByName(latestResultSheetName);
  const e = events['events'][0];
  let criteria = "ポイント";
  setPool(latestResultSheet, criteria = criteria);
  message = `${criteria}を元にプールを作成しました。\n`;
  const poolInfo = getPoolInfo(latestResultSheet);
  message += poolInfo;
  console.log(message);
}


function testmain(){
  const date = "2023-06-11";
  const sheet = ss.getSheetByName(date);
  getMatchInfo(sheet);
  setPool(sheet, "ポイント");
}