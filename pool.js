function getPoolInfo(sheet) {
  const groupMakerRange = getGroupMakerRange(sheet);
  
  const poolCriteria = groupMakerRange.offset(1,3,1,1).getValue();
  const readyPlayers = groupMakerRange.offset(2,3,10,3).getValues();

  return {
    criteria: poolCriteria,
    readyPlayers: readyPlayers
  };
}


function getPoolCriteria(sheet) {
  const poolInfo = getPoolInfo(sheet);
  return poolInfo.criteria;
}


function getReadyParticipants(sheet){
  const groupMakerRange = getGroupMakerRange(sheet)
  const readyParticipantsRange = groupMakerRange.offset(3, 3, 10, 3)
  const readyParticipants = readyParticipantsRange.getValues()

}


async function setPool(sheet, criteria="", restingParticipants=[]){
  // 範囲を取得
  const groupMakerRange = getGroupMakerRange(sheet)
  // 基準
  const poolCriteria = await setOrGetCriteria(groupMakerRange, criteria);
  // プールに含めるメンバー
  const participants = getParticipants(sheet);
  const readyParticipants = filterParticipants(participants, restingParticipants);

  const sortedParticipants = sortParticipantsByCriteria(readyParticipants, poolCriteria)

  //チーム数取得
  const groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
  const poolsData = splitIntoPools(sortedParticipants, groupsNumber);

  writePoolsToSheet(groupMakerRange, poolsData);
}


async function setOrGetCriteria(groupMakerRange, criteria) {
  const poolCriteriaCell = groupMakerRange.offset(1, 3, 1, 1);
  if (criteria) {
      // 非同期で基準をセット
      await poolCriteriaCell.setValue(criteria);
      return criteria;
  } else {
      // 既存の基準を取得
      return poolCriteriaCell.getValue();
  }
}


function filterParticipants(participants, restingParticipants) {
  return restingParticipants.length > 0 ? 
         participants.filter(participant => !restingParticipants.includes(participant)) : 
         participants;
}


function sortParticipantsByCriteria(participants, criteria) {
  const deviationValues = recordDataVertical[recordHeaderMapping[criteria]];
  return participants.slice().sort((a, b) => deviationValues[recordMembersMapping[b]] - deviationValues[recordMembersMapping[a]]);
}


function splitIntoPools(sortedParticipants, groupsNumber) {
  const pool1 = sortedParticipants.slice(0, groupsNumber);
  const pool2 = sortedParticipants.slice(groupsNumber, 3 * groupsNumber);
  const pool3 = sortedParticipants.slice(3 * groupsNumber);
  return [pool1, pool2, pool3].map(pool => Array.from({ length: 10 }, (_, i) => [pool[i] || '']));
}


function writePoolsToSheet(groupMakerRange, poolsData) {
  const combinedData = poolsData[0].map((_, i) => poolsData.map(pool => pool[i][0]));
  groupMakerRange.offset(3, 3, 10, 3).setValues(combinedData);
}


function createPoolInfoMessage(poolInfo){
  let poolMessage = `基準：${poolInfo.criteria}\n`;

  // 各列 (プール) についてループ
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < poolInfo.readyPlayers.length; row++) {
      if (poolInfo.readyPlayers[row][col] !== "") {
        poolMessage += poolInfo.readyPlayers[row][col] + '\n';
      }
    }
    poolMessage += '---\n'; // プール間のセパレータ
  }

  return poolMessage;
}

function createQuickReplyItemsForMakePool(pageNumber) {
  // 開始インデックスを計算
  const startIndex = pageNumber * MAX_QUICK_REPLY_ITEMS;
  // 記録のカラム一覧を取得
  const recordLastColumn = recordSheet.getLastColumn();
  let recordMetric = recordSheet.getRange(2, 2, 1, recordLastColumn - 1).getValues()[0];
  const deleteMetric = ["順位", "効率（正規化前）", "引き分け"];
  recordMetric = recordMetric.filter(element => !deleteMetric.includes(element));

  // このページの出場者のスライスを取得
  const recordMetricForThisPage = recordMetric.slice(startIndex, startIndex + MAX_QUICK_REPLY_ITEMS);

  // QuickReplyアイテムを作成
  const quickReplyItems = recordMetricForThisPage.map(metric => {
    return {
      type: 'action',
      action: {
        type: 'postback',
        label: metric,
        data: `SET_CRITERIA:${metric}`, // アクションタイプと指標をポストバックデータに含める
      }
    };
  });

  quickReplyItems.unshift({
    type: 'action',
    action: {
      type: 'postback',
      label: '変更なし',
      data: `SET_CRITERIA:STAY`, // アクションタイプと指標をポストバックデータに含める
    }
  });

  // もしまだ指標があれば、'次のページ'ボタンを追加
  if (startIndex + MAX_QUICK_REPLY_ITEMS < recordMetric.length) {
    quickReplyItems.push({
      type: 'action',
      action: {
        type: 'postback',
        label: '次のページ',
        data: `NEXT_PAGE:${pageNumber + 1}:SET_CRITERIA`, // アクションタイプと次のページ番号をポストバックデータに含める
      }
    });
  }

  return quickReplyItems;
}

//ゴール決めた人を尋ねるクイックリプライ
function howMakePool(e, currentCriteria, pageNumber = 0) {
  const quickReplyItems = createQuickReplyItemsForMakePool(pageNumber);
  const messages = {
    "type": "text",
    "text": `どの指標を基準にプールを作成しますか？\n現在の指標：${currentCriteria}`,
    "quickReply": {
      items: quickReplyItems
    }
  };
  const userId = e.source.userId;
  bot.quickPushMessage(userId, messages);
}