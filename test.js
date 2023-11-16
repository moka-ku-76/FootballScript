const testUserId = ScriptProperties.getProperty('userID');


function testMessage(message=""){
  bot.pushMessage(testUserId, message + "OK");
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
  const date = "2023-11-15";
  const sheet = ss.getSheetByName(date);
  cancelGoal(sheet, "岡")
}