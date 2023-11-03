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

  // quickReplyItems.push({
  //   type: 'action',
  //   action: {
  //     type: 'postback',
  //     label: '今日の調子',
  //     data: `SET_CRITERIA:今日の調子`, // アクションタイプと指標をポストバックデータに含める
  //   }
  // });

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