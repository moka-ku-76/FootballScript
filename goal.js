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