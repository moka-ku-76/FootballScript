const testUserId = ScriptProperties.getProperty('userID');

const eventObjectSample = {
  "events": [
    {
      "type": "postback",
      "replyToken": "nHuyWiB7yP5Zw52FIkcQobQuGDXCTA",
      "source": {
        "userId": testUserId,
        "type": "user"
      },
      "timestamp": 1462629479859,
      "postback": {
        "data": "info",
        "params": {
          "datetime": "2017-09-03T15:00",
          "date": "2017-09-03"
        }
      }
    }
  ]
}

function testmain(){
  const date = "2024-01-14";
  const sheet = ss.getSheetByName(date);
  // const e = eventObjectSample[0]
  // console.log(eventObjectSample.events[0])
  // handlePostback(eventObjectSample.events[0], testUserId, sheet)
  // cancelGoal(sheet, "岡")
  // const info = createDailySummary(sheet)
  // console.log(info)
  // message = addParticipantsFromList(sheet, ["岡"])
  // addAndSetParticipants(sheet, "岡")
  groupMaker(sheet)

}


function testRich(){
  switchRichMenuA(testUserId)
}

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
  const poolInfo = createPoolInfoMessage(latestResultSheet);
  message += poolInfo;
  console.log(message);
}


