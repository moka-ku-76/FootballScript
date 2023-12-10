// 現在の参加者の名前リストを取得
function getParticipants(sheet){
  const firstParticipantsCell = sheet.getRange(startRowOfParticipantsRange, startColumnOfParticipantsRange);
  let lastParticipantsCell = firstParticipantsCell.getNextDataCell(SpreadsheetApp.Direction.NEXT);
  let num_columns;

  if(lastParticipantsCell.getRow() > startRowOfParticipantsRange) {
    // 次のデータセルが次の行にある場合、参加者はいません。
    num_columns = 0;
  } else {
    // 参加者が存在する場合
    num_columns = lastParticipantsCell.getColumn() - startColumnOfParticipantsRange + 1;
  }

  if(num_columns === 0){
    return [];
  }

  const num_rows = 1;
  const participantsRange = sheet.getRange(startRowOfParticipantsRange, startColumnOfParticipantsRange, num_rows, num_columns);
  const participants = participantsRange.getValues()[0];
  return participants;
}

// 参加者人数を取得
function getNumOfParticipants(sheet){
  const participants = getParticipants(sheet);
  return participants.length;
}

//予定されている参加者の人数
function getWidthOfParticipantRange(sheet){
  const firstParticipantsCell = sheet.getRange(startRowOfParticipantsRange - 1, startColumnOfParticipantsRange);
  if(!firstParticipantsCell.getValue()){
    return 0;
  } else if ( !firstParticipantsCell.offset(0, 1).getValue()){
    return 1;
  }
  let lastParticipantsCell = firstParticipantsCell.getNextDataCell(SpreadsheetApp.Direction.NEXT);
  lastParticipantsCell = sheet.getRange(1,lastParticipantsCell.getColumn());
  const participantsNumber = lastParticipantsCell.getValue();
  return participantsNumber;
}

////@participantsで呼び出す関数
function askForParticipation(e) {
  const messages = {
    "type": "text",
    "text": "参加しますか？",
    "quickReply": {
      "items": [
        {
          "type": "action",
          "action": {
            "type": "postback",
            "label": "参加",
            "data": "participate"
          }
        },
        {
          "type": "action",
          "action": {
            "type": "postback",
            "label": "不参加",
            "data": "not_participate"
          }
        }
      ]
    }
  };
  bot.quickReplyMessage(e, messages);
}

//@participantsで呼び出す関数
function whoParticipate(e, pageNumber = 0) {
  // const pageNumber = 0;
  const quickReplyItems = createQuickReplyItems(pageNumber);

  const messages = {
    "type": "text",
    "text": "どなたが参加しますか？",
    "quickReply": {
      items: quickReplyItems
    }
  };
  const userId = e.source.userId;
  bot.quickPushMessage(userId, messages);
  // bot.quickReplyMessage(e, messages);
}

function createQuickReplyItems(pageNumber) {
  // 開始インデックスを計算
  const startIndex = pageNumber * MAX_QUICK_REPLY_ITEMS;

  const latestResultSheetName = getLatestResultSheetName();
  const latestResultSheet = ss.getSheetByName(latestResultSheetName);
  const participants = getParticipants(latestResultSheet);
  
  // 現在の参加者リストに含まれていないメンバーのリストを取得
  const nonParticipantMembers = members.filter(member => !participants.includes(member));

  // このページのメンバーのスライスを取得
  const nonParticipantMembersForThisPage = nonParticipantMembers.slice(startIndex, startIndex + MAX_QUICK_REPLY_ITEMS);

  // これらのメンバーのためのQuickReplyアイテムを作成
  const quickReplyItems = nonParticipantMembersForThisPage.map(member => {
    return {
      type: 'action',
      action: {
        type: 'postback',
        label: member,
        data: `ADD_PARTICIPANT:${member}`, // アクションタイプとメンバーをポストバックデータに含める
      }
    };
  });

  // もしまだメンバーがいれば、'次のページ'ボタンを追加
  if (startIndex + MAX_QUICK_REPLY_ITEMS < nonParticipantMembers.length) {
    quickReplyItems.push({
      type: 'action',
      action: {
        type: 'postback',
        label: '次のページ',
        data: `NEXT_PAGE:${pageNumber + 1}:ADD_PARTICIPANT`, // アクションタイプと次のページ番号をポストバックデータに含める
      }
    });
  }

  return quickReplyItems;
}


function addParticipantsFromList(latestResultSheet, membersListToAdd){
  // const membersListToAdd = membersListStringToAdd.split("、");
  let successNames = [];
  let failedNames = [];
  let message = "";
  for(member of membersListToAdd){
    // addAndSetParticipants(latestResultSheet, member);
    try{
      addAndSetParticipants(latestResultSheet, member);
      successNames.push(member);
    } catch(e){
      failedNames.push(member);
    }
  }
  successNames = successNames.join("、");
  failedNames = failedNames.join("、");
  if(successNames){
    message += `${successNames}の参加を受け付けました。`;
  }
  if(failedNames){
    message += `${failedNames}は既に参加しているか、メンバーとして登録されていません。\n\n@member:登録名の確認\n@participants:参加者の確認`;
  }
  return message;
}

//参加者の枠を一つ追加する関数
function addParticipantsRange(sheet){
  ////既に空白の範囲が存在していれば処理を終了
  const numOfParticipants = getNumOfParticipants(sheet);　//参加者を取得

  // const participants = getParticipants(sheet);　//参加者を取得
  const widthOfParticipantsRange = getWidthOfParticipantRange(sheet);　//参加者範囲の長さを取得
  if(widthOfParticipantsRange > numOfParticipants){
    const error = new Error("記入されていない欄が既に存在しています。");
    error.code = "E001";
    throw new Error;
  }

  const numOfMatches = getNumOfMatches(sheet); //現在の試合数
  const header = 2; //ヘッダーの行数
  const footer = 3; //フッターの行数

  const srcCheckCell = sheet.getRange(startRowOfResultRange + header + numOfMatches, startColumnOfResultRange + widthOfParticipantsRange + 1, 2, 1);
  const dstCheckCell = srcCheckCell.offset(0, 1, srcCheckCell.getNumRows(), srcCheckCell.getNumColumns());
  srcCheckCell.moveTo(dstCheckCell);
  srcCheckCell.clearFormat();

  const srcRange = sheet.getRange(startRowOfResultRange, startColumnOfResultRange + widthOfParticipantsRange, header + numOfMatches + footer, 1);
  const targetRange = srcRange.offset(0, 1, srcRange.getNumRows(), srcRange.getNumColumns());
  targetRange.clearDataValidations();
  srcRange.copyTo(targetRange);
  targetRange.offset(1,0,1, 1).clearContent() //名前のセルだけクリア
}

function setParticipant(sheet, name) {
  // 現在の参加者リストを取得し、重複参加をチェック
  const currentParticipants = getParticipants(sheet);
  if (currentParticipants.includes(name)) {
    throw new Error(name + "は既に参加しています。");
  }

  // 現在の参加者枠の最終列を取得
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet); 

  // 名前を設定するセルの範囲を特定
  const nameCell = sheet.getRange(startRowOfParticipantsRange, startColumnOfParticipantsRange + currentParticipantsNumber);

  // 名前のセルに参加者名をセット
  nameCell.setValue(name);
}


function addAndSetParticipants(sheet, name){
  try {
    addParticipantsRange(sheet);
  } catch (e) {
    // エラーコードが 'E001' の場合のみ setParticipant を実行
    if (e.code === 'E001') {
      console.warn(`エラーコード ${e.code} :` + e.message);
    } else {
      // それ以外のエラーの場合は、エラーを再投げして停止
      throw e;
    }
  }

  // エラーが発生しなかった場合も setParticipant を実行
  setParticipant(sheet, name);  
}


function deleteParticipantsRange(sheet){
  //現在の試合数
  const numOfMatches = getNumOfMatches(sheet);
  //現在の参加枠の列数
  const currentParticipantsNumber = getWidthOfParticipantRange(sheet);
  //ヘッダーの行数
  const header = 2;
  //フッターの行数
  const footer = 3;

  const srcCheckCell = sheet.getRange(startRowOfResultRange + header + numOfMatches, startColumnOfResultRange + currentParticipantsNumber + 1, 2, 1);
  const dstCheckCell = srcCheckCell.offset(0, -1, srcCheckCell.getNumRows(), srcCheckCell.getNumColumns());
  srcCheckCell.moveTo(dstCheckCell);
  srcCheckCell.clearFormat();

  let targetRange = sheet.getRange(startRowOfResultRange, startColumnOfResultRange + currentParticipantsNumber, header + numOfMatches, 1);
  targetRange.clear();
  targetRange.clearDataValidations();
  targetRange.offset(header + numOfMatches + 2, 0, 1, 1).clear();
  targetRange.offset(header + numOfMatches + 2, 0, 1, 1).clearDataValidations();
}


function registerMember(profileName, userId) {
  return new Promise((resolve, reject) => {
    try {
      const range = paramSheet.getRange(1, 3, paramSheet.getLastRow(), 2);
      const values = range.getValues();

      // 同じuserIdとprofileNameが存在するか確認
      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === userId && values[i][1] === profileName) {
          // 同じ組み合わせが見つかった場合は、何もせずに終了
          resolve(`${profileName}は既に登録済みです。`);
          return;
        }
      }

      // 最終行を探す（C列とD列が空でない最後の行）
      let lastRow = 1;
      for (let i = values.length - 1; i >= 0; i--) {
        if (values[i][0] !== "" || values[i][1] !== "") {
          lastRow = i + 1;
          break;
        }
      }

      // 同じ組み合わせが存在しない場合は、新たに追加
      const nextRow = lastRow + 1;
      paramSheet.getRange(nextRow, 3).setValue(userId);
      paramSheet.getRange(nextRow, 4).setValue(profileName);

      resolve(`ユーザー${profileName}を登録しました。`);

    } catch (error) {
      // エラー発生時
      reject("エラーが発生しました。");
    }
  });
}