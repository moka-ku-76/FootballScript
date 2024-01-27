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
        "data": "today",
        "params": {
          "datetime": "2017-09-03T15:00",
          "date": "2017-09-03"
        }
      }
    }
  ]
}


const textEventObjectSample = {
  "events": [
    {
      "type": "message",
      "replyToken": "b60d432864f44d079f6d8efe86cf404b",
      "source": {
        "userId": "testUserId",
        "type": "user"
      },
      "timestamp": 1462629479859,
      "message": {
        "type": "text",
        "id": "325708",
        "text": "!岡田"
      }
    }
  ]
}


function testmain(){
  const date = "2024-01-28";
  const sheet = ss.getSheetByName(date);
  // const e = eventObjectSample.events[0]
  const e = textEventObjectSample.events[0]
  // handlePostback(e, testUserId, sheet)
  handleMessage(e, testUserId, sheet)
  // console.log(generateMatchFinishMessage(sheet))
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


