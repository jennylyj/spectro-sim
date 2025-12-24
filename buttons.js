// 1. 定義變數 (就像 Python 的 st.session_state)
// 假設這是你的初始狀態
let state = {
    mode: "MAIN",
    input_buffer: "",
    PS_values: ["", "", "ABS", "1", "0", "No"], 
    editingIndex: 0, // 正在編輯第幾項 (0~4),
    wl: "500.0", // 預設波長
    abs_val: "0.000",
    results: [],
    sampleList: ["", "", "", "", "", ""],
    focus_sample: 0 // 預設聚焦在第一個 Well (Index 0)
};

//樣品儲存槽
// 儲存 Sample 名稱的陣列 (索引 0~5 對應 Well 1~6)

// 2. 定義數字的按鍵功能
function press(key) {
    state.input_buffer += key;

    if (state.input_buffer == 'F5') {
        if (state.mode === "Parameter_Setup") {
        setMode("PHOTOMETRIC");
        } else if (state.mode === "Multi-Cell Parameter_Setup") {
            setMode("Parameter_Setup");
        } else if (state.mode === "PHOTOMETRIC") {
            setMode("Parameter_Setup");
        }

        // 更新 state 數值
        state.wl = state.PS_values[1] || state.wl;
        state.editingIndex = 0;


    }
    else if (state.input_buffer == 'F4') {
        if (state.mode === "Parameter_Setup") {
        setMode("Multi-Cell Parameter_Setup");
        } 
        // 更新 state 數值
        state.wl = state.PS_values[1] || state.wl;
        state.editingIndex = 0;


    }

    renderScreen(); // 每次按完就呼叫這個函數，畫面就會自動根據新 buffer 重新渲染
}

function setMode(newMode) {
    state.mode = newMode;
    state.input_buffer = "";
    if (newMode === "Parameter_Setup") {
        state.PS_values = ["", "", "ABS", "1", "0", "No"];}
    else if (newMode === "Multi-Cell Parameter_Setup") {
        state.PS_values = ["6", "Yes"];}
    state.editingIndex = 0;
    renderScreen(); // 切換模式後自動重繪螢幕內容
}

// 清除鍵
function clearBuffer() {
    state.input_buffer = "";
    renderScreen();
}

// Auto Zero
function resetValue() {
    state.value = "0.000";
    renderScreen();
}


// Enter 鍵邏輯
function enterValue() {
    const input = state.input_buffer;

    if (state.mode === "MAIN") {
        // 判斷在主選單下的輸入邏輯 
        if (input === "1") {
            setMode("Parameter_Setup"); // 切換到光度計模式 [cite: 14]
        } else {
            alert("目前還沒有這個功能唷！");
            clearBuffer();
        }
    } 
    else if (state.mode === "SIMPLE_LAMBDA") {
        // 在光度計模式下的 Enter 邏輯 [cite: 9]
        if (input !== "") {
            state.wl = input; // 將輸入值設為波長
            clearBuffer();
        }
    }
    else if (state.mode === "Parameter_Setup") {
        // 1. 儲存當前 buffer 到對應的索引中
        if (input !== "") {
            state.PS_values[state.editingIndex] = input;
        }

        // 2. 跳到下一項
        if (state.editingIndex < 5) {
            state.editingIndex++;
        } else {
            // 6 項都填完了
            console.log("設定完成:", state.PS_values);
            // 可以選擇回到第一項或切換模式
            state.editingIndex = 0; 
        }

        // 3. 清空 buffer 並重新渲染
        clearBuffer(); 
        
    }
    else if (state.mode === "Multi-Cell Parameter_Setup") {
        // 1. 儲存當前 buffer 到對應的索引中
        if (input !== "") {
            state.PS_values[state.editingIndex] = input;
        }

        // 2. 跳到下一項
        if (state.editingIndex < 1) {
            state.editingIndex++;
        } else {
            // 2 項都填完了
            console.log("設定完成:", state.PS_values);
            // 可以選擇回到第一項或切換模式
            state.editingIndex = 0; 
        }

        // 3. 清空 buffer 並重新渲染
        clearBuffer(); 
        
    }
    
    updateFocus(); // 確保畫面上的聚焦狀態也更新
}

// read 鍵邏輯（我還沒寫 sample)
// 需要多定義的函數：sampleStack(序列0~5) sampleNow(目前樣本) 這個function 要 return
function readSample() {
    // 取得當前聚焦的樣品名稱
    let sampleNow = state.sampleList[state.focus_sample];

    if (sampleNow === "") {
        alert("目前樣本槽沒有樣品，請先輸入樣品名稱 (A-J)！");
        return;
    }

    // 1. 處理波長轉換：將 260.0 變成 "a260"
    // 先轉成數字取整數部分，再拼湊成 JSON 的 key
    let wlNum = Math.round(parseFloat(state.wl));
    let wlKey = "a" + wlNum;

    // 2. 從資料庫中搜尋對應的樣品 ID
    let foundData = sampleDatabase.find(item => item.id === sampleNow);

    if (foundData) {
        // 3. 檢查該樣品是否有此波長的數值
        if (foundData.hasOwnProperty(wlKey)) {
            let result = foundData[wlKey];
            
            // 將數值格式化為小數點三位並更新 state
            state.abs_val = result.toFixed(3);
            
            console.log(`讀取成功: Sample ${sampleNow}, WL ${wlNum}nm, ABS: ${state.abs_val}`);
            
            // --- 關鍵修改：將結果存入對應孔位的結果陣列 ---
            state.results[state.focus_sample] = state.abs_val;
            

        } else {
            // 如果波長不是 260, 280, 595，模擬現實狀況給一個趨近於 0 的隨機值或提示
            state.abs_val = "0.000";
            state.results[state.focus_sample] = state.abs_val;
            alert(`提醒：資料庫中沒有波長 ${wlNum}nm 的數據，顯示為 0.000`);
        }
    } else {
        alert(`找不到 ID 為 "${sampleNow}" 的樣品資料，請輸入 A 到 J。`);
    }

    // 4. 重新渲染螢幕顯示新數值
    renderScreen();
    if (state.mode === "PHOTOMETRIC" && state.focus_sample < 6) {
        state.focus_sample++; // 讀取後自動跳到下一個孔位
        readSample(); // 自動讀取下一個孔位
    }
}
    

// 開關蓋子功能
function toggleLid() {
    const compartment = document.getElementById('sample-compartment');
    compartment.classList.toggle('closed');
}

// 點擊 Well 進行輸入
function editWell(index) {
    // 如果蓋子關著，不允許輸入
    const compartment = document.getElementById('sample-compartment');
    if (compartment.classList.contains('closed')) {
        alert("請先開啟蓋子 (OPEN)");
        return;
    }

    let currentName = state.sampleList[index];
    let newName = prompt(`請輸入 Well ${index + 1} 的 Sample 名稱 (大寫英文):`, currentName);

    if (newName !== null) {
        // 轉為大寫並儲存
        state.sampleList[index] = newName.toUpperCase();
        updateWellDisplay();
    }
}

// 修改原有的 updateWellDisplay 也要確保聚焦狀態還在
function updateWellDisplay() {
    state.sampleList.forEach((name, index) => {
        const wellDiv = document.getElementById(`well-${index}`);
        if (wellDiv) {
            wellDiv.innerText = name;
        }
    });
    updateFocus(); // 更新文字時也檢查聚焦
}

// --- 新增：聚焦更新功能 ---
function updateFocus() {
    // 遍歷 0~5 個 well
    for (let i = 0; i < 6; i++) {
        const wellElement = document.getElementById(`well-${i}`);
        if (wellElement) {
            if (i === state.focus_sample) {
                wellElement.classList.add('focused'); // 符合 ID 就加白邊
            } else {
                wellElement.classList.remove('focused'); // 其他人移除白邊
            }
        }
    }
}

// --- 新增：移動聚焦的函式 ---
function moveFocus(direction) {
    if (direction === 'up') {
        if (state.focus_sample < 5) state.focus_sample++; // 往上切換 (到 Well 6)
    } else if (direction === 'down') {
        if (state.focus_sample > 0) state.focus_sample--; // 往下切換 (到 Well 1)
    }
    updateFocus();
    renderScreen(); // 更新螢幕顯示
}

// 初始化
updateWellDisplay();
// 初始化時執行一次，確保預設有聚焦
updateFocus();
