// 派生クラス (MyLineBotSdk) の定義
function MyLineBotSdk(accessToken) {
  const lineBotClient = new LineBotSdk.client(accessToken);
  // 派生クラスのメソッドを追加
  lineBotClient.pushMessage = function (userId, messages) {
    const url = 'https://api.line.me/v2/bot/message/push';

    // 応答用のヘッダーを設定
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    };
    // 応答用のデータを設定
    const data = {
      'to': userId,
      'messages': [{
        'type': 'text',
        'text': messages,
      }]
    };

    // 応答用のオプションを設定
    const options = {
      'method': 'post',
      'headers': headers,
      'payload': JSON.stringify(data)
    };
    // メッセージを送信
    UrlFetchApp.fetch(url, options);
  };
  
  
  lineBotClient.quickPushMessage = function (userId, messages) {
    const url = 'https://api.line.me/v2/bot/message/push';

    // 応答用のヘッダーを設定
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    };
    // 応答用のデータを設定
    const data = {
      'to': userId,
      'messages': [messages]
    };
    // 応答用のオプションを設定
    const options = {
      'method': 'post',
      'headers': headers,
      'payload': JSON.stringify(data)
    };
    // メッセージを送信
    UrlFetchApp.fetch(url, options);
  };

  lineBotClient.quickReplyMessage = function (e, messages) {
    //リプライトークンを取得
    const replyToken = e.replyToken;
    // 応答用のURLを設定
    const url = 'https://api.line.me/v2/bot/message/reply';

    // 応答用のヘッダーを設定
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    };

    // 応答用のデータを設定
    const data = {
      'replyToken': replyToken,
      'messages': [messages]
    };

    // 応答用のオプションを設定
    const options = {
      'method': 'post',
      'headers': headers,
      'payload': JSON.stringify(data)
    };

    // メッセージを送信
    UrlFetchApp.fetch(url, options);
  }



  lineBotClient.getUsernameFromUserId = function (e){
    const userId = e.source.userId;
    const url = 'https://api.line.me/v2/bot/profile/' + userId;

    const headers = {
        'Authorization': 'Bearer ' + ACCESS_TOKEN
    };

    const options = {
      'method': 'get',
      'headers': headers,
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseJson = JSON.parse(response.getContentText());

    return responseJson.displayName;
  }


  return lineBotClient;
}




	// [ 'constructor',
  // 'call',
  // 'bool',
  // 'textMessage',
  // 'emoji',
  // 'imageMessage',
  // 'videoMessage',
  // 'flexMessage',
  // 'carouselMessage',
  // 'replyMessage',
  // 'pushMessage',
  // 'multicastMessage',
  // 'broadcastMessage',
  // 'aPostback',
  // 'aMessage',
  // 'aUri',
  // 'aSwitch',
  // 'area',
  // 'richmenu',
  // 'createRichMenu',
  // 'setRichMenuImage',
  // 'getRichMenuList',
  // 'getRichMenu',
  // 'deleteRichMenu',
  // 'setDefaultRichMenu',
  // 'deleteDefaultRichMenu',
  // 'linkRichMenuToUser',
  // 'linkRichMenuToMultipleUsers',
  // 'unlinkRichMenuFromUser',
  // 'unlinkRichMenusFromMultipleUsers',
  // 'createRichMenuArias',
  // 'getRichMenuAriasList',
  // 'deleteRichMenuArias',
  // 'updateRichMenuArias' ]

function getArguments(func) {
  const funcString = func.toString();
  const argsString = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')'));
  return argsString.split(',').map(arg => arg.trim());
}

function confirmInstance(){
  // console.log(bot);
  // console.log(bot.accessToken);
  // console.log(typeof(bot));
  // console.log(Object.getOwnPropertyNames(bot))
  // // console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(bot)))
  console.log(getArguments(bot.replyMessage))
  // console.log(bot2)
  // console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(bot2)))
  // bot2.newMethod();
}