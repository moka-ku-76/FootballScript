const RICHMENU_WIDTH = 2500;
const RICHMENU_HEIGHT = 1686;
const AREA_WIDTH = 772.5;
const AREA_HEIGHT = 772.5;
const XPADDING = 46.2;
const XMARGIN = 45;
const YPADDING = 45;
const YMARGIN = 51;
const IMAGE_DRIVE_ID = "1013J6EQbLT07MkR9IIHN691Oy9YUU8Ls";
//https://drive.google.com/file/d/1013J6EQbLT07MkR9IIHN691Oy9YUU8Ls/view?usp=drive_link
function createAllProcess() {
  const richmenuId = createRichMenu();
  uploadRichmenuImage(richmenuId);
  bot.setDefaultRichMenu(richmenuId);
}

function createRichMenu() {
  let richmenu = bot.richmenu({
    "name": "リッチメニューA",
    "barText": "メニュー（開く / 閉じる）",
    "size": { "width": RICHMENU_WIDTH, "height": RICHMENU_HEIGHT },
    "selected": false, 
    "areas": [
      //上側
      bot.area({ "x": XPADDING, "y": YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "round", "displayText": "@round" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "goal", "displayText": "@goal" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": YPADDING, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "finish", "displayText": "@finish" } }),
      //下側
      bot.area({ "x": XPADDING, "y": YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "rate", "displayText": "@rate" } }),
      bot.area({ "x": XPADDING + XMARGIN + AREA_WIDTH, "y": YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "pool", "displayText": "@pool" } }),
      bot.area({ "x": XPADDING + (2 * XMARGIN) + (2 * AREA_WIDTH), "y": YPADDING + AREA_HEIGHT + YMARGIN, "width": AREA_WIDTH, "height": AREA_HEIGHT,
      "action": { "type": "postback", "data": "info", "displayText": "@info" } }),
    ]
  })
  let res = bot.createRichMenu(richmenu);
  return JSON.parse(res).richMenuId;
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

function setRichMenuToUser(userId, accessToken, richMenuId) {
  // リッチメニュー設定用のURLを設定
  const url = 'https://api.line.me/v2/bot/user/' + userId + '/richmenu/' + richMenuId;

  // リッチメニュー設定用のヘッダーを設定
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  };

  // リッチメニュー設定用のオプションを設定
  const options = {
    'method': 'post',
    'headers': headers
  };

  // リッチメニューを設定
  UrlFetchApp.fetch(url, options);
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
  for(let i =0; i < response.richmenus.length; i++){
    const richMenuId = response.richmenus[i].richMenuId;
    console.log(richMenuId);
    bot.deleteRichMenu(richMenuId);
  }
}

// function test_rich(){
//   console.log()
// }









