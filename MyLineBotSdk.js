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

  lineBotClient.getUsernameFromEvent = function (e){
    const userId = e.source.userId;
    const url = 'https://api.line.me/v2/bot/profile/' + userId;

    const headers = {
        'Authorization': 'Bearer ' + this.accessToken
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

  lineBotClient.setRichMenuToUser = function(userId, richMenuId) {
    // リッチメニュー設定用のURLを設定
    const url = 'https://api.line.me/v2/bot/user/' + userId + '/richmenu/' + richMenuId;
  
    // リッチメニュー設定用のヘッダーを設定
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.accessToken
    };
  
    // リッチメニュー設定用のオプションを設定
    const options = {
      'method': 'post',
      'headers': headers
    };
  
    // リッチメニューを設定
    UrlFetchApp.fetch(url, options);
  }
  
  lineBotClient.findRichMenuIdByName = function(name) {
    const richMenus = getRichMenuList();
    const foundMenu = richMenus.find(menu => menu.name === name);
    return foundMenu ? foundMenu.richMenuId : null;
  }
  return lineBotClient;
}

function getArguments(func) {
  const funcString = func.toString();
  const argsString = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')'));
  return argsString.split(',').map(arg => arg.trim());
}

function confirmInstance(){
  console.log(getArguments(bot.replyMessage))
}