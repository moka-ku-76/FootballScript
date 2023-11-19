const RICHMENU_WIDTH = 2500;
const RICHMENU_HEIGHT = 1686;
const AREA_WIDTH = 772.5;
const AREA_HEIGHT = 700;
const TAB_WIDTH = 1250;
const TAB_HEIGHT = 200;
const XPADDING = 46.2;
const XMARGIN = 45;
const YPADDING = 16;
const YMARGIN = 15;
const IMAGE_DRIVE_ID_A = "11hC81E60C-9-bxEqTdt541tVyTS4AM40";
const IMAGE_DRIVE_ID_B = "11qLLRxWw8quPG3IRPzGaNMphWmKOUFV_";
const RICHMENU_NAME_A = "リッチメニューA"
const RICHMENU_NAME_B = "リッチメニューB"

function createAllProcess() {
  const richmenuIdA = createRichMenuA();
  const richmenuIdB = createRichMenuB();
  uploadRichmenuImage(IMAGE_DRIVE_ID_A, richmenuIdA);
  uploadRichmenuImage(IMAGE_DRIVE_ID_B, richmenuIdB);
  bot.setDefaultRichMenu(richmenuIdA);
}

function createRichMenuA() {
  const data_list = ["round", "goal", "finish", "rate", "pool", "info"]
  let richmenu = bot.richmenu({
    "name": RICHMENU_NAME_A,
    "barText": "メニュー（開く / 閉じる）",
    "size": { "width": RICHMENU_WIDTH, "height": RICHMENU_HEIGHT },
    "selected": false, 
    "areas": [
      // タブA（アクティブ）
      bot.area({ "x": 0, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuA"} }),
      // タブB
      bot.area({ "x": TAB_WIDTH, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuB"} }),
      //上側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[0], "displayText": "@" + data_list[0] } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[1], "displayText": "@" + data_list[1] } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[2], "displayText": "@" + data_list[2] } }),
      //下側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[3], "displayText": "@" + data_list[3] } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[4], "displayText": "@" + data_list[4] } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[5], "displayText": "@" + data_list[5] } }),
    ]
  })
  let res = bot.createRichMenu(richmenu);
  return JSON.parse(res).richMenuId;
}

function createRichMenuB() {
  const data_list = ["helper", "cancelgoal", "restart", "changeGroupNum", "rest", "info"]
  let richmenu = bot.richmenu({
    "name": RICHMENU_NAME_B,
    "barText": "メニュー（開く / 閉じる）",
    "size": { "width": RICHMENU_WIDTH, "height": RICHMENU_HEIGHT },
    "selected": false, 
    "areas": [
      // タブA
      bot.area({ "x": 0, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuA"} }),
      // タブB（アクティブ）
      bot.area({ "x": TAB_WIDTH, "y": 0, "width": TAB_WIDTH, "height": TAB_HEIGHT,
      "action": { "type": "postback", "data": "switchRichMenuB"} }),
      //上側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[0], "displayText": "@" + data_list[0] } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[1], "displayText": "@" + data_list[1] } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[2], "displayText": "@" + data_list[2] } }),
      //下側
      bot.area({ "x": XPADDING, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[3], "displayText": "@" + data_list[3] } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[4], "displayText": "@" + data_list[4] } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": TAB_HEIGHT + YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": data_list[5], "displayText": "@" + data_list[5] } }),
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
  for(let i = 0; i < response.richmenus.length; i++){
    const richMenuId = response.richmenus[i].richMenuId;
  }
  return response.richmenus
}

function uploadRichmenuImage(driveId, richMenuId) {
  const file = DriveApp.getFileById(driveId);
  const blob = Utilities.newBlob(
    file.getBlob().getBytes(),
    file.getMimeType(),
    file.getName()
  );
  bot.setRichMenuImage(richMenuId, blob);
}


// リッチメニューを切り替える関数 B->A
function switchRichMenuA(userId) {
  richMenuId = bot.findRichMenuIdByName(RICHMENU_NAME_A)
  bot.setRichMenuToUser(userId, richMenuId);
}
// リッチメニューを切り替える関数 A->B
function switchRichMenuB(userId) {
  richMenuId = bot.findRichMenuIdByName(RICHMENU_NAME_B)
  bot.setRichMenuToUser(userId, richMenuId);
}


//デフォルトのリッチメニューのIDを取得
function getDefaultRichMenuId(){
  // リッチメニュー設定用のURLを設定
  const url = 'https://api.line.me/v2/bot/user/all/richmenu';

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


