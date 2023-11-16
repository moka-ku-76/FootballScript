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
          case "@help":
            message = createHelpMessage();
            logMessage(e, message);
          case "@today":
            try{
              const createdSheetName = addTodaysDateToOperationSheet();
              message = `シート ${createdSheetName} を作成しました`;
            } catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case "@participants":
            const participants = getParticipants(latestResultSheet);
            message = '本日の参加者: \n' + participants.join('\n');
            logMessage(e, message);
            //クイックリプライの送信
            whoParticipate(e);
            break
          case "@pool":
            if(optionalData){
              let criteria = optionalData;
              let excludedParticipants = [];
              if(optionalData2){
                excludedParticipants = optionalData2.split('、');
              }
              try{
                setPool(latestResultSheet, criteria=criteria, excludedParticipants=excludedParticipants);
                message = `${criteria}を元にプールを作成しました。\n`
                const poolInfo = getPoolInfo(latestResultSheet);
                message += poolInfo;
              }catch(e){
                message = e.message;
              };
              message = getPoolInfo(latestResultSheet);
              logMessage(e, message);
            }else{
              let currentCriteria = getPoolCriteria(latestResultSheet);
              howMakePool(e, currentCriteria);
            };
            break
          case "@round":
            try{
              groupMaker(latestResultSheet);
              message = getGroupInfo(latestResultSheet);
              //チーム数を取得してその分試合記録シートを追加
              applyResultToSheet(latestResultSheet);
            }catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case "@rate":
            try{
              setRate(latestResultSheet, optionalData);
              message = `レートを${optionalData}に変更しました。`;
            } catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
                    
          case "@goal":
            whoScored(e);
            break
          case "@finish":
            //試合結果を表示
            message = generateMatchSummary(latestResultSheet);
            try{
              finishMatch(latestResultSheet);
            } catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case "@rsvp":
            //参加するかどうかを尋ねるクイックリプライを転送
            askForParticipation(e);
            break
          case "@join":
            try{
              message = await registerMember(username, userId);
              logMessage(e, message);
            } catch(error){
              // console.log(error);
              error = bot.textMessage(error);
              bot.replyMessage(e, [error]);
            }
            break
          case "@members":
            message = '登録メンバー: \n' + members.join('\n');
            logMessage(e, message);
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
          case 'ADD_PARTICIPANT':
            const memberToAdd = splitedData;
            addAndSetParticipants(latestResultSheet, memberToAdd);
            message = `${memberToAdd} の参加を受け付けました。`;
            logMessage(e, message);
            whoParticipate(e)
            break;
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
          case 'SET_CRITERIA':
            if(splitedData == "STAY"){
              message = getPoolInfo(latestResultSheet);
            }else{
              let criteria = splitedData;
              try{
                setPool(latestResultSheet, criteria=criteria);
                message = `${criteria}を元にプールを作成しました。\n`
                const poolInfo = getPoolInfo(latestResultSheet);
                message += poolInfo;
              }catch(e){
                message = e.message;
              }
            }
            logMessage(e, message);
            break
          case 'NEXT_PAGE':
            let pageNumber = Number(splitedData);
            // 'SCORED_GOAL'または'ADD_PARTICIPANT'のどちらから来たかを判断するための追加情報が必要
            let previousAction = data.split(':')[2];
            if(previousAction === 'SCORED_GOAL'){
              whoScored(e, pageNumber=pageNumber);
            } else if(previousAction === 'ADD_PARTICIPANT'){
              whoParticipate(e, pageNumber=pageNumber);
            } else if(previousAction === 'CANCEL_GOAL'){
              whoseGoalCancel(e, pageNumber=pageNumber);  
            }
            break;
        }
      } else {
        switch( data ){
          case "today":
            const createdSheetName = addTodaysDateToOperationSheet();
            message = `シート ${createdSheetName} を作成しました`;
            logMessage(e, message);
            break
          case "participate":
            //取得したユーザ名をシートの参加者欄にセット
            try{
              addAndSetParticipants(latestResultSheet, name = username);
              message = "追加されました。";
              logMessage(e, message);
            } catch(error){
              error = bot.textMessage(error);
              bot.replyMessage(e, [error]);            
            }
            break
          case 'round':
            try{
              groupMaker(latestResultSheet);
              //チーム数を取得してその分試合記録シートを追加
              applyResultToSheet(latestResultSheet);
              message = getGroupInfo(latestResultSheet);
            }catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case 'goal':
            whoScored(e);
            break
          case 'finish':
            //試合結果を表示
            message = generateMatchSummary(latestResultSheet);
            try{
              finishMatch(latestResultSheet);
            } catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case 'rate':
            const currentRate = getCurrentRate(latestResultSheet);
            const rate = (currentRate + 1) % 6;
            try{
              setRate(latestResultSheet, rate);
              message = `レートを${rate}に変更しました。`;
            } catch(e){
              message = e.message;
            }
            logMessage(e, message);
            break
          case 'pool':
            let currentCriteria = getPoolCriteria(latestResultSheet);
            howMakePool(e, currentCriteria);
            break
          case 'info':
            implementingMessage(e);
            break
        }
      }
      break
  }
};



////@todayで呼び出す関数。
function addTodaysDateToOperationSheet() {
  const today = new Date(); // 今日の日付を取得

  // A列の全ての値を取得
  const columnA = operationSheet.getRange('A:A').getValues();
  
  // A列に今日の日付がすでに存在するかチェック
  for (let i = 0; i < columnA.length; i++) {
    if (columnA[i][0] === today) {
      throw new Error("今日の日付はすでに入力されています。");
    }
  }

  // シートのタイムゾーンに基づいて日付をフォーマット
  const formattedDate = Utilities.formatDate(today, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  
  const lastRow = operationSheet.getLastRow() + 1; // A列の最終行の次の行を取得
  // A列の最終行に今日の日付を入力
  operationSheet.getRange('A' + lastRow).setValue(formattedDate);
  const createdSheetName = createDatedResultSheet(formattedDate);
  return createdSheetName;
}

function createHelpMessage() {
  return `
    Botの各機能について説明します：

    1. "@help" - ヘルプメッセージ（このメッセージ）を表示します。

    2. "@today" - 本日の日付をシートに追加します。

    3. "!参加者名" - 参加者を追加します。複数の参加者を追加する場合は、名前を"、"で区切って入力してください。

    4. "@participants" - 最新のシートの参加者一覧を表示します。

    5. "@pool{:指標}" - プールを作成します。

    6. "@round" - グループを作成し、試合記録シートに結果を適用します。

    7. "@rate{:数値}" - レートを1増加します。コロンの後に数値を入力するとその値を直接設定します。（最大値は5）

    8. "@goal" - ゴールした選手の情報を要求します。

    9. "@finish" - 試合結果を表示します。

    10. "@rsvp" - 参加するかどうかを尋ねるクイックリプライを表示します。

    11. "@join" - ユーザを登録します。

    12. "@members" - 登録メンバー一覧を表示します。
  `;
}


function implementingMessage(e){
  const message = bot.textMessage('実装中です');
  bot.replyMessage(e, [message]);
}

function logMessage(e, message){
  message = bot.textMessage(message);
  bot.replyMessage(e, [message]);
}