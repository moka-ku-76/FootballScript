const RICHMENU_WIDTH = 2500;
const RICHMENU_HEIGHT = 1686;
const AREA_WIDTH = 772.5;
const AREA_HEIGHT = 772.5;
const TAB_WIDTH = 1250;
const TAB_HEIGHT = 94;
const XPADDING = 46.2;
const XMARGIN = 45;
const YPADDING = 16;
const YMARGIN = 15;
const IMAGE_DRIVE_ID = "1013J6EQbLT07MkR9IIHN691Oy9YUU8Ls";
// https://drive.google.com/open?id=108N_EPTXid3NB5HFqqtNHeEyJH1zQ9rq&usp=drive_fs 
// https://drive.google.com/open?id=10WGXHY-qN0N83x_otu9Qvg9tPUb-UHyK&usp=drive_fs


function createRichMenuA() {
  let richmenu = bot.richmenu({
    "name": "リッチメニューA",
    "barText": "メニュー（開く / 閉じる）",
    "size": { "width": RICHMENU_WIDTH, "height": RICHMENU_HEIGHT },
    "selected": false, 
    "areas": [
      // タブA（アクティブ）
      bot.area({ "x": 0, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuA", "displayText": "タブA" } }),
      // タブB
      bot.area({ "x": TAB_WIDTH, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuB", "displayText": "タブB" } }),
      //上側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "round", "displayText": "@round" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "goal", "displayText": "@goal" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "finish", "displayText": "@finish" } }),
      //下側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "rate", "displayText": "@rate" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "pool", "displayText": "@pool" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "info", "displayText": "@info" } }),
    ]
  })
  let res = bot.createRichMenu(richmenu);
  return JSON.parse(res).richMenuId;
}

function createRichMenuB() {
  let richmenu = bot.richmenu({
    "name": "リッチメニューB",
    "barText": "メニュー（開く / 閉じる）",
    "size": { "width": RICHMENU_WIDTH, "height": RICHMENU_HEIGHT },
    "selected": false, 
    "areas": [
      // タブA
      bot.area({ "x": 0, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuA", "displayText": "タブA" } }),
      // タブB（アクティブ）
      bot.area({ "x": TAB_WIDTH, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuB", "displayText": "タブB" } }),
      //上側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "round", "displayText": "@round" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "goal", "displayText": "@goal" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "finish", "displayText": "@finish" } }),
      //下側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "rate", "displayText": "@rate" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "pool", "displayText": "@pool" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "info", "displayText": "@info" } }),
    ]
  })
  let res = bot.createRichMenu(richmenu);
  return JSON.parse(res).richMenuId;
}

function getRichMenuList() {
  // リッチメニュー設定用のURLを設定
  const url = 'https://api.line.me/v2/bot/richmenu/list';

  // リッチメニュー設定用のヘッダーを設定
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  // リッチメニュー設定用のオプションを設定
  const options = {
    'method': 'get',
    'headers': headers
  };

  // リッチメニューを設定
  const res = UrlFetchApp.fetch(url, options);
  const response = JSON.parse(res)
  console.log(response.richmenus.length)
  for(let i = 0; i < response.richmenus.length; i++){
    const richMenuId = response.richmenus[i].richMenuId;
    console.log(richMenuId);
  }
  return response.richmenu
}

function uploadRichmenuImage(richmenuId) {
  const file = DriveApp.getFileById(IMAGE_DRIVE_ID);
  const blob = Utilities.newBlob(
    file.getBlob().getBytes(),
    file.getMimeType(),
    file.getName()
  );
  bot.setRichMenuImage(richmenuId, blob);
}

function createAllProcessA() {
  const richmenuId = createRichMenuA();
  uploadRichmenuImage(richmenuId);
  bot.setDefaultRichMenu(richmenuId);
}

function createAllProcessB() {
  const richmenuId = createRichMenuB();
  uploadRichmenuImage(richmenuId);
}

// リッチメニューを切り替える関数
function switchRichMenuA(userId) {
  const richMenuIdA = ""
  bot.setRichMenuToUser(userId, richMenuIdA);
}

function switchRichMenuB() {
  const richMenuIdB = ""
  bot.setRichMenuToUser(userId, richMenuIdB)
}

//デフォルトのリッチメニューのIDを取得
function getDefaultRichMenuId(accessToken){
  // リッチメニュー設定用のURLを設定
  const url = 'https://api.line.me/v2/bot/user/all/richmenu';

  // リッチメニュー設定用のヘッダーを設定
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  };

  // リッチメニュー設定用のオプションを設定
  const options = {
    'method': 'get',
    'headers': headers
  };

  // リッチメニューを設定
  const res = UrlFetchApp.fetch(url, options);
  const richMenuId = JSON.parse(res).richMenuId;
  return richMenuId;
}

function deleteRichMenuList() {
  // リッチメニュー設定用のURLを設定
  const url = 'https://api.line.me/v2/bot/richmenu/list';

  // リッチメニュー設定用のヘッダーを設定
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + ACCESS_TOKEN
  };

  // リッチメニュー設定用のオプションを設定
  const options = {
    'method': 'get',
    'headers': headers
  };

  // リッチメニューを設定
  const res = UrlFetchApp.fetch(url, options);
  // console.log(JSON.parse(res))
  const response = JSON.parse(res)
  console.log(response.richmenus.length)
  for(let i = 0; i < response.richmenus.length; i++){
    const richMenuId = response.richmenus[i].richMenuId;
    console.log(richMenuId);
    bot.deleteRichMenu(richMenuId);
  }
}


