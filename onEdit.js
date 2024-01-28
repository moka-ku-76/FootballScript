function onEdit(e){
  let activeSheet = e.source.getActiveSheet()
  //記録シートの監視
  if (activeSheet.getName() === "記録"){
    let row = e.range.getRow();
    let column = e.range.getColumn();

    if ( row == 2 && column == 1){
      const fleshTriggerCell = activeSheet.getRange(2, 1);
      if (fleshTriggerCell.isChecked()){
        // SpreadsheetApp.getActiveSpreadsheet().toast('処理を開始します...', '実行中', -1);
        showDialog();
        updateLatestRecord();
        fleshTriggerCell.uncheck()
        // SpreadsheetApp.getActiveSpreadsheet().toast('処理が完了しました!', '完了', 2);
      }
    } else {
      return
    }
  }
  //操作シートの監視
  if (activeSheet.getName() === "操作"){
    let row = e.range.getRow();
    let column = e.range.getColumn();
    
    if ( column == 1){
      const date = operationSheet.getRange(row,1).getValue();
      if(!date){return};
      const dateString = Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
      createDatedResultSheet(dateString);
      operationSheet.activate();
    }
    
    let date = activeSheet.getRange(row, 1).getValue();
    date = Utilities.formatDate(date, 'JST', 'yyyy-MM-dd');
    console.log(date)
    let targetSheet = ss.getSheetByName(date);

    
    if ( column == 2){
      //試合追加処理
      const numOfMatchesNumber = Number(e.value);
      makeMatchRange(targetSheet, numOfMatchesNumber);

    }
    if ( column == 3){
      //メンバー追加処理
      const participantsNumber = Number(e.value);
      makeResultRange(targetSheet, participantsNumber);
    }
  }
  //試合結果入力シートの監視
  if (activeSheet.getIndex() > 5){
    //グループ分けに使う
    let startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getNumOfMatches(activeSheet);
    let groupMakerRange = activeSheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
    const poolTriggerCell = groupMakerRange.offset(1, 4, 1, 1);
    const shuffleTriggerCell = groupMakerRange.offset(12, 0, 1, 1);
    let applyTriggerCell = groupMakerRange.offset(12, 1, 1, 1);

    const finishMatchTriggerCell = activeSheet.getRange(2, 5);

    let row = e.range.getRow();
    let column = e.range.getColumn();
    let same_teamRange = activeSheet.getRange("A1");
    if(row % heightOfMatch == 1){
      let team_name = e.value;
      let is_same_team = false;
      let member_listRange = activeSheet.getRange(1,1);
      for(let i=0;i<Math.floor(e.range.getRow() / heightOfMatch);i++){
        same_teamRange = activeSheet.getRange(i*heightOfMatch+1,2);
        if(same_teamRange.getValue() ==team_name){
          is_same_team = true;
          break
        }
        same_teamRange = same_teamRange.offset(0,2);
        if(same_teamRange.getValue()==team_name){
          is_same_team = true;
          break
        }
      }
      if(is_same_team){
        member_listRange = same_teamRange.offset(1,0,max_members);
        member_listRange.copyTo(activeSheet.getRange(row,column).offset(1,0),SpreadsheetApp.CopyPasteType.PASTE_VALUES, false)
      }
    }
    if (poolTriggerCell.isChecked()) {
      setPool(activeSheet);
      poolTriggerCell.uncheck();
    }
    if(shuffleTriggerCell.isChecked()){
      groupMaker(activeSheet);
      shuffleTriggerCell.uncheck();
    }
    if(applyTriggerCell.isChecked()){
      applyResultToSheet(activeSheet);
      startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getNumOfMatches(activeSheet);
      groupMakerRange = activeSheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
      applyTriggerCell = groupMakerRange.offset(12, 1, 1, 1);
      applyIsChecked = applyTriggerCell.isChecked();
      applyTriggerCell.uncheck();
    }
    if(finishMatchTriggerCell.isChecked()){
      finishMatch(activeSheet);
      finishMatchTriggerCell.uncheck();
    }
  }
}