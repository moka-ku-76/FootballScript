function handleMessage(e, userId, latestResultSheet){
	let { type, text } = e.message;
	let optionalData = "";
	//メッセージの送信者のプロフィールを取得して、ユーザ名を抜き出す
  let username = bot.getUsernameFromEvent(e);
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
          console.error(e.message)
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
					message = registerMember(username, userId);
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
			case "@restart":
				try{
					restartMatch(latestResultSheet);
					message = generateMatchSummary(latestResultSheet)
				}catch(e){
					message = e.message;
				}
				logMessage(e, message);
				break
		}
	}
}
