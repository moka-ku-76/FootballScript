function setSubstitutePlayer(sheet, substitutePlayer) {
  // 現在の試合情報を取得
  const matchInfo = getMatchInfo(sheet);
  let { playersAlpha, playersBeta } = matchInfo;

  // 助っ人の名前がrandomの場合、休憩している参加者からランダムに選択
  if ( substitutePlayer === 'random' ){
    const restingPlayers = getRestingPlayers(sheet, matchInfo);
    substitutePlayer = pickElementRandomly(restingPlayers);
  }

  // チームAとチームBのプレイヤー数を比較
  let updatedAlpha = false, updatedBeta = false;
  if (playersAlpha.length === playersBeta.length) {
    // チームAとチームBのプレイヤー数が等しい場合、エラーを投げる
    throw new Error("チーム人数が等しいため、助っ人は必要ありません。");
  } else if (playersAlpha.length < playersBeta.length) {
    // チームAのプレイヤー数が少ないか等しい場合、助っ人をチームAに追加
    playersAlpha.push(substitutePlayer);
    updatedAlpha = true;
  } else {
    // チームBのプレイヤー数が少ない場合、助っ人をチームBに追加
    playersBeta.push(substitutePlayer);
    updatedBeta = true;
  }

  // 更新した情報をセット
  setMatchInfo({
    sheet: sheet,
    target: matchInfo.No,
    playersAlpha: updatedAlpha ? playersAlpha : undefined,
    playersBeta: updatedBeta ? playersBeta : undefined,
  });
}

function whoIsSubstitutePlayer(e, sheet, pageNumber = 0) {
  const matchInfo = getMatchInfo(sheet); // 最新の試合情報を取得
  // 人数が等しい場合のエラーチェック
  if (arePlayerCountsEqual(matchInfo)) {
    throw new Error("チーム人数が等しいため、助っ人は必要ありません。");
  }
  const restingPlayers = getRestingPlayers(sheet, matchInfo); // 休んでいるプレイヤーを取得
  // 休んでいるプレイヤーがいない場合のエラーチェック
  if (restingPlayers.length === 0) {
    throw new Error( "休んでいるプレイヤーがいません。");
  }
  // 休んでいるプレイヤーからランダムに選ぶクイックリプライを作成
  const quickReplyItems = createQuickReplyItemsForSubstitutes(restingPlayers, pageNumber);

  const messages = {
    "type": "text",
    "text": "誰を助っ人にしますか？",
    "quickReply": {
      items: quickReplyItems
    }
  };
  const userId = e.source.userId;
  bot.quickPushMessage(userId, messages);
}

function arePlayerCountsEqual(matchInfo) {
  // チームAとチームBのプレイヤー数を取得
  const playersAlphaCount = matchInfo.playersAlpha.length;
  const playersBetaCount = matchInfo.playersBeta.length;

  // プレイヤー数が等しいかどうかを確認
  return playersAlphaCount === playersBetaCount;
}

function getRestingPlayers(sheet, matchInfo) {
  // 参加者全体のリストを取得
  const participants = getParticipants(sheet);

  // 試合に参加しているプレイヤーのリストを結合
  const playersInMatch = matchInfo.playersAlpha.concat(matchInfo.playersBeta);

  // 休んでいるプレイヤーのリストを作成（試合に参加していないプレイヤー）
  const restingPlayers = participants.filter(player => !playersInMatch.includes(player));

  return restingPlayers;
}

function createQuickReplyItemsForSubstitutes(restingPlayers, pageNumber) {
  // 開始インデックスを計算
  const startIndex = pageNumber * MAX_QUICK_REPLY_ITEMS;

  // このページの休んでいるプレイヤーのスライスを取得
  const restingPlayersForThisPage = restingPlayers.slice(startIndex, startIndex + MAX_QUICK_REPLY_ITEMS);

  // これらのプレイヤーのためのQuickReplyアイテムを作成
  const quickReplyItems = restingPlayersForThisPage.map(player => {
    return {
      type: 'action',
      action: {
        type: 'postback',
        label: player,
        data: `SELECT_SUBSTITUTE:${player}`, // アクションタイプとプレーヤー名をポストバックデータに含める
      }
    };
  });

  // ランダムを追加
  quickReplyItems.push({
    type: 'action',
    action: {
      type: 'postback',
      label: 'ランダム',
      data: `SELECT_SUBSTITUTE:random`,
    }
  })

  // もしまだ休んでいるプレイヤーがいれば、'次のページ'ボタンを追加
  if (startIndex + MAX_QUICK_REPLY_ITEMS < restingPlayers.length) {
    quickReplyItems.push({
      type: 'action',
      action: {
        type: 'postback',
        label: '次のページ',
        data: `NEXT_PAGE:${pageNumber + 1}:SELECT_SUBSTITUTE`, // アクションタイプと次のページ番号をポストバックデータに含める
      }
    });
  }

  return quickReplyItems;
}
