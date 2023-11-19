const ScriptProperties = PropertiesService.getScriptProperties();
const ACCESS_TOKEN = ScriptProperties.getProperty('LINEtoken');
const bot = new MyLineBotSdk(ACCESS_TOKEN);

const MAX_QUICK_REPLY_ITEMS = 12;
const members = paramSheet.getRange('A2:A').getValues().flat().filter(Boolean);
let message;


function doPost(e) { bot.call(e, callback) };
async function callback(e) {
  // const replyToken = e.replyToken;
  let userId = e.source.userId;
  //メッセージの送信者のプロフィールを取得して、ユーザ名を抜き出す
  let username = bot.getUsernameFromUserId(e);
  //最新の結果シートを取得
  const latestResultSheetName = getLatestResultSheetName();
  const latestResultSheet = ss.getSheetByName(latestResultSheetName);
  switch(e.type){
    case "message":
      let { type, text } = e.message;
      let optionalData = "";
      if( type == "text" ){
        if(text[0] === "!" || text[0] === "！"){
          const membersListStringToAdd = text.slice(1);
          const membersListToAdd = membersListStringToAdd.split("、");
          message = addParticipantsFromList(latestResultSheet, membersListToAdd);
          logMessage(e, message);
        }
        if( text.includes(':')){
          const splitedTextArray = text.split(':');
          text = splitedTextArray[0];
          optionalData = splitedTextArray[1];
          optionalData2 = splitedTextArray[2];
        }
        switch(text){
          case "@goal":
            whoScored(e);
            break
          case "@cancelgoal":
            whoseGoalCancel(e)
            break
        }
      }
      break
    case "postback":
      const { data } = e.postback;
      if( data.includes(':')){
        const [action, splitedData] = data.split(':');
        switch(action) {
          case 'SCORED_GOAL':
            const memberScoredGoal = splitedData;
            goal(latestResultSheet, memberScoredGoal);
            message = `${memberScoredGoal} のゴールを記録しました。`;
            logMessage(e, message);
            break;
          case 'CANCEL_GOAL':
            const memberCanceledGoal = splitedData;
            cancelGoal(latestResultSheet, memberCanceledGoal);
            message = `${memberCanceledGoal} のゴールを取り消しました。`;
            logMessage(e, message);
          case 'NEXT_PAGE':
            let pageNumber = Number(splitedData);
            // 'SCORED_GOAL'または'ADD_PARTICIPANT'のどちらから来たかを判断するための追加情報が必要
            let previousAction = data.split(':')[2];
            if(previousAction === 'SCORED_GOAL'){
              whoScored(e, pageNumber=pageNumber);
            } else if(previousAction === 'CANCEL_GOAL'){
              whoseGoalCancel(e, pageNumber=pageNumber);  
            }
            break;
        }
      } else {
        switch( data ){
          case 'goal':
            whoScored(e);
            break
        }
      }
      break
  }
};

// 誰のゴールかを尋ねるためのクイックリプライを作成する関数
function createQuickReplyItemsForScorers(pageNumber) {
    // 開始インデックスを計算
    const startIndex = pageNumber * MAX_QUICK_REPLY_ITEMS;
  
    const latestResultSheetName = getLatestResultSheetName();
    const latestResultSheet = ss.getSheetByName(latestResultSheetName);
    const matchInfo = getMatchInfo(latestResultSheet);
    
    // 現在の試合の出場者リストを取得
    const currentMatchPlayers = matchInfo.playersAlpha.concat(matchInfo.playersBeta);
  
    // このページの出場者のスライスを取得
    const currentMatchPlayersForThisPage = currentMatchPlayers.slice(startIndex, startIndex + MAX_QUICK_REPLY_ITEMS);
  
    // これらの出場者のためのQuickReplyアイテムを作成
    const quickReplyItems = currentMatchPlayersForThisPage.map(player => {
      return {
        type: 'action',
        action: {
          type: 'postback',
          label: player,
          data: `SCORED_GOAL:${player}`, // アクションタイプとプレーヤー名をポストバックデータに含める
        }
      };
    });
  
    // もしまだ出場者がいれば、'次のページ'ボタンを追加
    if (startIndex + MAX_QUICK_REPLY_ITEMS < currentMatchPlayers.length) {
      quickReplyItems.push({
        type: 'action',
        action: {
          type: 'postback',
          label: '次のページ',
          data: `NEXT_PAGE:${pageNumber + 1}:SCORED_GOAL`, // アクションタイプと次のページ番号をポストバックデータに含める
        }
      });
    }
  
    return quickReplyItems;
  }
  
  // キャンセルするゴールを尋ねるためのクイックリプライをを作成する関数
  function createQuickReplyItemsForCancelGoal(pageNumber) {
    // 開始インデックスを計算
    const startIndex = pageNumber * MAX_QUICK_REPLY_ITEMS;
  
    const latestResultSheetName = getLatestResultSheetName();
    const latestResultSheet = ss.getSheetByName(latestResultSheetName);
    const matchInfo = getMatchInfo(latestResultSheet);
    
    // 現在の試合の出場者リストを取得
    const currentMatchPlayers = matchInfo.playersAlpha.concat(matchInfo.playersBeta);
  
    // このページの出場者のスライスを取得
    const currentMatchPlayersForThisPage = currentMatchPlayers.slice(startIndex, startIndex + MAX_QUICK_REPLY_ITEMS);
  
    // これらの出場者のためのQuickReplyアイテムを作成
    const quickReplyItems = currentMatchPlayersForThisPage.map(player => {
      return {
        type: 'action',
        action: {
          type: 'postback',
          label: player,
          data: `CANCEL_GOAL:${player}`, // アクションタイプとプレーヤー名をポストバックデータに含める
        }
      };
    });
  
    // もしまだ出場者がいれば、'次のページ'ボタンを追加
    if (startIndex + MAX_QUICK_REPLY_ITEMS < currentMatchPlayers.length) {
      quickReplyItems.push({
        type: 'action',
        action: {
          type: 'postback',
          label: '次のページ',
          data: `NEXT_PAGE:${pageNumber + 1}:SCORED_GOAL`, // アクションタイプと次のページ番号をポストバックデータに含める
        }
      });
    }
  
    return quickReplyItems;
  }
  
  //ゴール決めた人を尋ねるクイックリプライ
  function whoScored(e, pageNumber = 0) {
    const quickReplyItems = createQuickReplyItemsForScorers(pageNumber);
    const messages = {
      "type": "text",
      "text": "誰がゴールしましたか？",
      "quickReply": {
        items: quickReplyItems
      }
    };
    const userId = e.source.userId;
    bot.quickPushMessage(userId, messages);
  }
  
  //キャンセルするゴールを尋ねるクイックリプライ
  function whoseGoalCancel(e, pageNumber = 0) {
    const quickReplyItems = createQuickReplyItemsForCancelGoal(pageNumber);
    const messages = {
      "type": "text",
      "text": "誰のゴールを取り消しますか？",
      "quickReply": {
        items: quickReplyItems
      }
    };
    const userId = e.source.userId;
    bot.quickPushMessage(userId, messages);
  }

  function goal(sheet, name){
    //最新の試合記録範囲を取得
    const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
    const latestMatchRange = sheet.getRange(finishedMatchsNumber * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
    //チーム、ゴール範囲を取得
    const alphaPlayersRange = latestMatchRange.offset(1, 1, heightOfMatch - 4, 1);
    const scoresRange = latestMatchRange.offset(1, 2, heightOfMatch - 4, 1);くく
    const betaPlayersRange = latestMatchRange.offset(1, 3, heightOfMatch - 4, 1);
    //範囲の中からnameと等しいセルを探索し、該当するゴール範囲を編集
    const alphaPlayersArray = alphaPlayersRange.getValues();
    const betaPlayersArray = betaPlayersRange.getValues();
    for(let i = 0; i < alphaPlayersArray.length; i++) {
      if(alphaPlayersArray[i][0] === name || betaPlayersArray[i][0] === name) {
        const scoreCell = scoresRange.offset(i, 0, 1, 1);
        let scores = scoreCell.getValue().split(",");
        const teamIndex = alphaPlayersArray[i][0] === name ? 0 : 1;
        scores[teamIndex] = Math.max(0, parseInt(scores[teamIndex]) + 1); // ゴール数を1増やす
        scoreCell.setValue(scores.join(","));
        return;
      }
    }
  }
  
  
  function cancelGoal(sheet, name) {
    // 最新の試合記録範囲を取得
    const finishedMatchsNumber = getFinishedMatchesNumber(sheet);
    const latestMatchRange = sheet.getRange(finishedMatchsNumber * heightOfMatch + 1, startColumnOfMatchRange, heightOfMatch, widthOfMatch);
    // チーム、ゴール範囲を取得
    const alphaPlayersRange = latestMatchRange.offset(1, 1, heightOfMatch - 4, 1);
    const scoresRange = latestMatchRange.offset(1, 2, heightOfMatch - 4, 1);
    const betaPlayersRange = latestMatchRange.offset(1, 3, heightOfMatch - 4, 1);
    // 範囲の中からnameと等しいセルを探索し、該当するゴール範囲を編集
    const alphaPlayersArray = alphaPlayersRange.getValues();
    const betaPlayersArray = betaPlayersRange.getValues();
  
    for(let i = 0; i < alphaPlayersArray.length; i++) {
      if(alphaPlayersArray[i][0] === name || betaPlayersArray[i][0] === name) {
        const scoreCell = scoresRange.offset(i, 0, 1, 1);
        let scores = scoreCell.getValue().split(",");
        const teamIndex = alphaPlayersArray[i][0] === name ? 0 : 1;
        scores[teamIndex] = Math.max(0, parseInt(scores[teamIndex]) - 1); // ゴール数を1減らす
        scoreCell.setValue(scores.join(","));
        return;
      }
    }
  }