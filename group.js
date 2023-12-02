////チーム作成に使う関数
//組み合わせを求める関数。チーム作成で使う。
function groupMaker(sheet){
    const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
    const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
    //分割するチーム数を決定
    const groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
    const displayRange = groupMakerRange.offset(3,0,7,3);
    //記入されている情報をクリア
    displayRange.clearContent();

    //参加メンバーを取得
    const usePoolCell = groupMakerRange.offset(1,0,1,1);
    let nameArray = [];
    if(usePoolCell.isChecked()){
        ////プールを利用する場合
        const poolRange = groupMakerRange.offset(3,3,10,3);  //プールの範囲を取得
        const poolsNum = 3;  //プールの最大数
        
        //プール数分forループを回す
        for(let i=0;i<poolsNum;i++){
        let range = poolRange.offset(0,i,poolRange.getNumRows(),1);      
        let partNameArray = transpose(range.getValues())[0].filter(function(value) {return value !== "";});
        partNameArray = shuffleArray(partNameArray);
        nameArray = nameArray.concat(partNameArray);
        }
    }else{
        nameArray = getParticipants(sheet);
        nameArray = shuffleArray(nameArray);
    }
    ////表示  
    //作成したグループを表示する範囲
    const groupDisplayRange = groupMakerRange.offset(3,0,7,groupsNumber);
    setValuesInOrder(sheet, groupDisplayRange, nameArray);
}

function countPairs(n) {
    return factorial(n) / (factorial(2) * factorial(n - 2));
}
  
function factorial(n) {
    if (n === 0) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

// グループ分け
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function splitArrayRandomly(array, chunkCount) {
    let chunks = [];
    let chunkSize = Math.floor(array.length / chunkCount);
    let size;
    // Logger.log("size " + chunkSize)
    let remainder = array.length % chunkCount;
    // Logger.log(remainder)
    array = shuffleArray(array);
    for (let i = 0; i < array.length; i += size) {
        size = chunkSize;
        if (remainder > 0) {
        size += 1;
        remainder -= 1;
        }
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function setValuesInOrder(sheet, range, values) {
    const startRow = range.getRow();
    const startColumn = range.getColumn();
    const width = range.getNumColumns();
    const height = Math.ceil(values.length / width);

    let output = Array.from({ length: height }, () => Array(width).fill(""));

    values.forEach((value, index) => {
        const row = Math.floor(index / width);
        const column = index % width;

        // Set the value in the output array
        output[row][column] = value;
    });

    // Write the 2D array to the sheet in one go
    sheet.getRange(startRow, startColumn, height, width).setValues(output);
}

function getPoolInfo(sheet){
    const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
    const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
    let poolInfo = []
  
    const poolCriteria = groupMakerRange.offset(1,3,1,1).getValue();
    poolInfo.push(`基準：${poolCriteria}\n`);
  
    const poolData = groupMakerRange.offset(2,3,10,3).getValues();
    
    // 各列 (プール) についてループ
    for (let col = 0; col < 3; col++) {
        // 各行についてループ
        for (let row = 0; row < poolData.length; row++) {
            // 空の名前は無視
            if (poolData[row][col] !== "") {
                poolInfo.push(poolData[row][col]);
            }
        }
  
        // プール間のセパレータ
        poolInfo.push('---');
    }
    poolInfo = poolInfo.join('\n');
  
    return poolInfo;
}
  
function getPoolCriteria(sheet){
    const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
    const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
  
    const poolCriteria = groupMakerRange.offset(1,3,1,1).getValue();
    return poolCriteria;  
}

function setPool(sheet, criteria="", excludedParticipants=[]){
    const startRowOfGroupMakerRange = offsetRowOfGroupMakerRange + getMatchesNumber(sheet);
    const groupMakerRange = sheet.getRange(startRowOfGroupMakerRange, startColumnOfGroupMakerRange, heightOfGroupMaker, widthOfGroupMaker);
  
    const poolCriteriaCell = groupMakerRange.offset(1, 3, 1, 1);
    //基準が引数として入力されていればその基準を使用
    if(criteria){
      poolCriteriaCell.setValue(criteria);
    }
    const poolCriteria = poolCriteriaCell.getValue();
    if(!poolCriteria){
      throw Error("基準が入力されていません");
    }
    const deviationValues = recordDataVertical[recordHeaderMapping[poolCriteria]];
    let participants = getParticipants(sheet);
  
    if (excludedParticipants.length > 0) {
      participants = participants.filter(participant => !excludedParticipants.includes(participant));
    }
  
    const sortedParticipants = participants.slice().sort((a, b) => {
      const aValue = deviationValues[recordMembersMapping[a]];
      const bValue = deviationValues[recordMembersMapping[b]];
      return bValue - aValue;
    });
  
    // const poolSize = Math.ceil(sortedParticipants.length / 3);
    //チーム数取得
    let groupsNumber = groupMakerRange.offset(1,1,1,1).getValue();
    const pool1 = sortedParticipants.slice(0, groupsNumber);
    const pool2 = sortedParticipants.slice(groupsNumber, 3 * groupsNumber);
    const pool3 = sortedParticipants.slice(3 * groupsNumber);
  
    const pool1Data = Array.from({ length: 10 }, (_, i) => [pool1[i] || '']);
    const pool2Data = Array.from({ length: 10 }, (_, i) => [pool2[i] || '']);
    const pool3Data = Array.from({ length: 10 }, (_, i) => [pool3[i] || '']);
    const combinedData = pool1Data.map((_, i) => [pool1Data[i][0], pool2Data[i][0], pool3Data[i][0]]);
  
    groupMakerRange.offset(3, 3, 10, 3).setValues(combinedData);
}


