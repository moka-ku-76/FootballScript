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
