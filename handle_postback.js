function handlePostback(e, userId, latestResultSheet){
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
				try {
					cancelGoal(latestResultSheet, memberCanceledGoal);
					message = `${memberCanceledGoal} のゴールを取り消しました。`;
				} catch (e) {
					message = e.message;
				}
				logMessage(e, message);
			case 'SET_CRITERIA':
				if(splitedData == "STAY"){
					message = createPoolInfoMessage(latestResultSheet);
				}else{
					let criteria = splitedData;
					try{
						setPool(latestResultSheet, criteria=criteria);
						message = `${criteria}を元にプールを作成しました。\n`
						const poolInfo = getPoolInfo(latestResultSheet);
						const poolInfoMessage = createPoolInfoMessage(poolInfo);
						message += poolInfoMessage;
					}catch(e){
						message = e.message;
					}
				}
				logMessage(e, message);
				break
			case 'SELECT_SUBSTITUTE':
				let substitutePlayer = splitedData;
				try{
					setSubstitutePlayer(latestResultSheet, substitutePlayer);
					message = generateMatchSummary(latestResultSheet)
				} catch(e){
					message = e.message;
				}
				logMessage(e, message)
			case 'NEXT_PAGE':
				let pageNumber = Number(splitedData);
				// 前のアクションを取得
				let previousAction = data.split(':')[2];
				if(previousAction === 'SCORED_GOAL'){
					whoScored(e, pageNumber=pageNumber);
				} else if(previousAction === 'ADD_PARTICIPANT'){
					whoParticipate(e, pageNumber=pageNumber);
				} else if(previousAction === 'CANCEL_GOAL'){
					whoseGoalCancel(e, pageNumber=pageNumber);  
				} else if(previousAction === 'SELECT_SUBSTITUTE'){
					whoIsSubstitutePlayer(e, latestResultSheet, pageNumber=pageNumber)
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
				// message = generateMatchSummary(latestResultSheet);
				try{
					finishMatch(latestResultSheet);
				} catch(e){
          console.error(e.message)
					message = e.message;
				}
				message = generateMatchFinishMessage(latestResultSheet)
				logMessage(e, message);
				break
			case 'rate':
				try{
          message = incrementRate(latestResultSheet);
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
				try{
          message = createDailySummary(latestResultSheet);
        } catch(e){
          message = e.message;
        }
        logMessage(e, message)
				break
			case 'switchRichMenuA':
				try{
					switchRichMenuA(userId);
				} catch(e){
					message = e.message;
				}
				break
			case 'switchRichMenuB':
				try{
					switchRichMenuB(userId);
				} catch(e){
					message = e.message;
				}
				break
			case 'cancelgoal':
				whoseGoalCancel(e)
				break
			case 'helper':
				whoIsSubstitutePlayer(e, latestResultSheet);
				break
			case 'restart':
				try{
					restartMatch(latestResultSheet);
					message = generateMatchSummary(latestResultSheet)
				}catch(e){
					message = e.message;
				}
				logMessage(e, message);
				break
			case 'changeGroupNum':
				implementingMessage(e);
				break
			case 'rest':
				implementingMessage(e);
				break
		}
	}
}
