// --- 對應 logic.py 的 render_screen 函數 ---
var { mode, input_buffer, PS_values, editingIndex, wl, abs_val, focus_sample, results } = state;


function renderScreen() {
    var { mode, input_buffer, PS_values, editingIndex, wl, abs_val, focus_sample, results } = state;
    let content = "";

    // 1. 根據模式決定內容 (對應原本的 if/elif)
    if (mode === "MAIN") {
        content = `
        <div style="text-align: center; padding: 3px; margin: 0px;">
            System Main Menu</div>
        <div style="border: 1px solid white; padding: 10px; margin: 0px;">
            1. Photometric<br>
            2. Spectrum<br>
            3. Timescan<br>
            4. Kinetic
        </div>
        <div style="text-align: center; margin-left: 10px; margin:10px;">
            Select Number: <u>&nbsp;${input_buffer}&nbsp;</u>
        </div>
        `; 
    } 
    else if (mode === "SIMPLE_LAMBDA") {
        content = `
        <div style="text-align: center; margin-top: 40px;">
            <div style="font-size: 28px;">
                &lambda; : ${input_buffer ? input_buffer : wl} nm </div>
            <br>
            <div style="font-size: 28px; color: #FFFF00;">
                DATA: ${abs_val} A
            </div>
        </div>
        `; 
    } 
    else if (mode === "Parameter_Setup") {

        // 建立每一行的內容
        const rows = [
            "1. Input the number of &lambda; : ",
            "___ &lambda; : ",
            "2. Measure mode: ",
            "3. Cycle number: ",
            "4. Cycle interval (sec): ",
            "5. Print every cycle: "
        ];

        let rowsHtml = "";
        rows.forEach((text, i) => {
            const isEditing = (state.editingIndex === i);
            // 如果正在編輯，顯示 buffer 內容並加上反白樣式；否則顯示已存的值
            const displayValue = isEditing ? (state.input_buffer || "_") : (state.PS_values[i] || "_");
            const highlightClass = isEditing ? "input-highlight" : "";

            rowsHtml += `
            <div class="input-row ${isEditing ? 'active' : ''}" id="row-${i}">
                ${text} <span class="${highlightClass}" style="float: right;">${displayValue}</span>
            </div>`;
        });

        content = `
            <div style="text-align: left; margin-top: 0px;">
                ${rowsHtml}
            </div>
            <div style="text-align: left; margin-top: 0px;">
                Press < > key to select...
            </div>

            <div style="display: flex; gap: 1px; margin-top: 0px; justify-content: space-around;">
                <div class="screen-bottom-bar">Load<br>Param</div>
                <div class="screen-bottom-bar">Save<br>Param</div>
                <div class="screen-bottom-bar">Print<br>Data</div>
                <div class="screen-bottom-bar">Sample<br>Control</div>
                <div class="screen-bottom-bar">Next<br>Screen</div>
            </div>
        `; 
    }
    else if (mode === "Multi-Cell Parameter_Setup") {
     
        // 建立每一行的內容
        const rows = [
            "1. Drive cell number(1-6):",
            "2. Reagent blank corr.(cell 1):"
        ];

        let rowsHtml = "";
        rows.forEach((text, i) => {
            const isEditing = (state.editingIndex === i);
            // 如果正在編輯，顯示 buffer 內容並加上反白樣式；否則顯示已存的值
            const displayValue = isEditing ? (state.input_buffer || "_") : (state.MCPS_values[i] || "_");
            const highlightClass = isEditing ? "input-highlight" : "";

            rowsHtml += `
            <div class="input-row ${isEditing ? 'active' : ''}" id="row-${i}">
                ${text} <span class="${highlightClass}" style="float: right;">${displayValue}</span>
            </div>`;
        });

        content = `
            <div style="text-align: left; margin-top: 0px;">
                ${rowsHtml}
            </div>

            <div style="text-align: left; margin-top: 77px;">
                Cell from 1 to 6<br>
            </div>
            <div style="display: flex; gap: 1px; margin-top: 0px; justify-content: space-around;">
                <div class="screen-bottom-bar">Cell<br>Home</div>
                <div class="screen-bottom-bar">Cell<br>Standby</div>
                <div class="screen-bottom-bar">Print<br>Data</div>
                <div class="screen-bottom-bar">Load<br>Default</div>
                <div class="screen-bottom-bar">Prev<br>Screen</div>
            </div>
        `; 
    }
    else if (mode === "PHOTOMETRIC") {
        let rows = "";
        
        // 遍歷 0 到 5 (代表 Well 1 到 6)
        for (let i = 0; i < 6; i++) {
            // 從 state.results 取得數值，若無則留空
            let val = state.results[i] || "";
            
            // 判斷是否為當前選取的孔位，可以加個背景色提醒（選修功能）
            let bgStyle = (i === state.focus_sample) ? "background: rgba(255,255,255,0.2);" : "";

            rows += `
                <tr style="border-bottom: 1px solid white; ${bgStyle}">
                    <td style="width: 30%; border-right: 1px solid white; padding: 2px;">${i + 1}</td>
                    <td style="width: 70%; padding: 2px;">${val}</td>
                </tr>`;
        }

        content = `
            <div style="font-size: 14px; text-align: left; margin-bottom: 5px;">
                Mode: Absorbance <span style="float:right;">${state.wl} nm</span>
            </div>
            <table style="width: 100%; color: white; border-collapse: collapse; text-align: center; border: 2px solid white; background: transparent; font-size: 14px;">
                <thead>
                    <tr style="border-bottom: 2px solid white; background: #444;">
                        <th style="border-right: 1px solid white;">Well</th>
                        <th>Result (ABS)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <div style="font-size: 10px; margin-top: 5px; text-align: center;">
                Press READ to update focused cell
            </div>
        
        
        <div style="display: flex; gap: 1px; margin-top: 0px; justify-content: space-around;">
            <div class="screen-bottom-bar"> </div>
            <div class="screen-bottom-bar"></div>
            <div class="screen-bottom-bar">Print<br>Data</div>
            <div class="screen-bottom-bar"></div>
            <div class="screen-bottom-bar">Prev<br>Screen</div>
        </div>
        `;
    }

    // 2. 最終打包外框 (對應原本最後的 html 變數)
    const fullHtml = `
    <div style="background-color: transparent ; color: white; font-family: 'monospace'; padding: 15px; height: 230px; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.3);">
            <span>13:30:00</span><span>${mode}</span><span>Cell=${focus_sample+1}</span>
        </div>
        ${content}
    </div>
    `; 

    // 3. 把產出的 HTML 塞進網頁標籤中
    // 假設你的 HTML 螢幕容器 ID 是 'lcd-screen'
    document.getElementById('lcd-screen').innerHTML = fullHtml;
}