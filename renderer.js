let bodyel = document.querySelector('body');
let mainel = document.querySelector('#main-block')
window.userWinManagement.windowsSet((event, newBounds) => {
    let heightInfo = newBounds[1],
        widthInfo = newBounds[0];
    let mainWidth = widthInfo - 200,
        mainHeight = heightInfo - 40;
    bodyel.style.height = heightInfo + 'px';
    mainel.style.height = (heightInfo - 40) + 'px';

    serial_receiveEl.style.margin = `${parseInt(0.04*mainHeight)}px auto`;
    serial_receiveEl.style.padding = `${parseInt(0.02*mainWidth)}px`;
    serial_receiveEl.style.width = `${parseInt(0.86*mainWidth)}px`;
    serial_receiveEl.style.height = `${parseInt(0.65*mainHeight)}px`;

    serial_transmitEl.parentNode.style.margin = `${parseInt(0.03*mainHeight)}px auto`;
    serial_transmitEl.parentNode.style.width = `${parseInt(0.9*mainWidth)}px`;
    serial_transmitEl.parentNode.style.height = `${parseInt(0.16*mainHeight)}px`;
    serial_transmitEl.style.padding = `${parseInt(0.02*mainWidth)}px`;
    serial_transmitEl.style.height = `${parseInt(0.14*mainHeight)}px`;
    serial_transmitEl.style.width = `${parseInt(0.56*mainWidth)}px`;
    serialSubBtn.style.fontSize = `${parseInt(0.05*(mainWidth<mainHeight?mainWidth:mainHeight))}px`
        //height: 15%;
        // serial_transmitEl.style.
        // serial_transmitEl.style.
        // serial_transmitEl.style.
})

let serial_Port_SelectEl = document.getElementById('SerialPortSelectEl');
let serial_dataBits_SelectEL = document.getElementById('Serial-dataBits-select');
let serial_stopBits_SelectEL = document.getElementById('Serial-stopBits-select');
let serial_parity_SelectEL = document.getElementById('Serial-parity-select');
let serial_baudRate_SelectEL = document.getElementById('Serial-baudRate-select');
let serial_SelectEL_arr = [serial_Port_SelectEl,
    serial_dataBits_SelectEL,
    serial_stopBits_SelectEL,
    serial_parity_SelectEL,
    serial_baudRate_SelectEL
];
let openProjectUrlBtn = document.getElementById('SerialPortInfo');
let serialSubBtn = document.getElementById('serial-info-send-btn');
let serialSidebar = document.getElementById('sidebar');
let serialReceiveModSelectBtn = document.getElementById('receiveShowModSetBtn');
let serialTransmitModSelectBtn = document.getElementById('transmitShowModSetBtn');
let serialReceiveMod = 0,
    serialTransmitMod = 0; // 0 STR 1 HEX
let serialPortMap = new Map();
let userSerialPort = null
let serialPort = null;
openProjectUrlBtn.onclick = () => {
    window.API.openUrl('https://github.com/PrettyMisaka/A-simple-serial-port-tool');
}
serialReceiveModSelectBtn.onclick = () => {
    if (serialReceiveMod === 0) {
        serialReceiveMod = 1;
        serialReceiveModSelectBtn.children[0].style.float = 'right';
        serialReceiveModSelectBtn.children[0].innerHTML = 'HEX';
        serialReceiveObj.isShowUin8 = true;
    } else {
        serialReceiveMod = 0;
        serialReceiveModSelectBtn.children[0].style.float = 'left';
        serialReceiveModSelectBtn.children[0].innerHTML = 'STR';
        serialReceiveObj.isShowUin8 = false;
    }
    serialReceiveObj.flash();
}
serialTransmitModSelectBtn.onclick = () => {
    if (serialTransmitMod === 0) {
        serialTransmitMod = 1;
        serialTransmitModSelectBtn.children[0].style.float = 'right';
        serialTransmitModSelectBtn.children[0].innerHTML = 'HEX';

        const inputValue_arr = string2Uint8Array(serial_transmitEl.value);
        let str = '';
        for (let j = 0; j < inputValue_arr.length; j++) {
            str += dec2hex(parseInt(inputValue_arr[j] / 16)) + dec2hex(parseInt(inputValue_arr[j] % 16)) + ' ';
        }
        str = str.substring(0, str.length - 1);
        serial_transmitEl.value = str;
    } else {
        serialTransmitMod = 0;
        serialTransmitModSelectBtn.children[0].style.float = 'left';
        serialTransmitModSelectBtn.children[0].innerHTML = 'STR';

        const inputValue_arr = serial_transmitEl.value.split(' ');
        let tmp = [];
        for (let i = 0; i < inputValue_arr.length; i++) {
            let tmpnum = 0;
            for (let j = 0; j < inputValue_arr[i].length; j++) {
                tmpnum += Math.pow(16, (1 - j)) * hex2dec(inputValue_arr[i][j]);
            }
            tmp.push(tmpnum);
        }
        let Uint8Array_tmp = new Uint8Array(tmp);
        serial_transmitEl.value = Uint8Array2String(Uint8Array_tmp);
    }
}
serial_Port_SelectEl.onclick = async function() {
    serialPort = await navigator.serial.requestPort();
};
serial_Port_SelectEl.onblur = async function() {
    if (serial_Port_SelectEl.value !== '') {
        window.userSerialHandle.checkSerialPort(serialPortMap.get(serial_Port_SelectEl.value), true); //request回调
        serialPort = await navigator.serial.requestPort();
    }
};

window.userSerialHandle.serialInfoGet((__event, portInfo, mod) => {
    if (mod) { //添加    
        if (serialPortMap.get(portInfo.portName) === null || serialPortMap.get(portInfo.portName) === undefined) //不存在   
        {
            serialPortMap.set(portInfo.portName, portInfo);
            let optionTmp = document.createElement('option');
            optionTmp.innerHTML = '' + portInfo.portName + '&nbsp;&nbsp;&nbsp;' + portInfo.displayName;
            optionTmp.value = portInfo.portName
            serial_Port_SelectEl.appendChild(optionTmp);
        }
    } else {
        if (serialPortMap.get(portInfo.portName) !== undefined) {
            serialPortMap.set(portInfo.portName, undefined);
        }
        for (let i = 0; i < serial_Port_SelectEl.children.length; i++) {
            if (serial_Port_SelectEl.children[i].value === portInfo.portName) {
                serial_Port_SelectEl.removeChild(serial_Port_SelectEl.children[i]);
            }
        }
    }
})

let openPortBtn = document.getElementById('SerialPortOpenBlock').children[0];
let isOpenPort = false;
let serial_receiveEl = document.getElementById('Serial-info-receive');
let serial_transmitEl = document.getElementById('Serial-info-transmit');

let serialReader, serialWriter;
let serialReceiveObj = new function() {
    this.arr = [];
    this.isShowUin8 = false;
    this.pushEl = function(Uint8Array_info, mod, fontColor) { //0接受 1发送
        this.arr.push({
            time: new Date(),
            uint_8: Uint8Array_info,
            mod: mod,
            str: Uint8Array2String(Uint8Array_info),
            fontColor: fontColor,
        })
    };
    this.showtime = function(i) {
        let hour = this.arr[i].time.getHours() >= 10 ? this.arr[i].time.getHours() : '0' + this.arr[i].time.getHours();
        let min = this.arr[i].time.getMinutes() >= 10 ? this.arr[i].time.getMinutes() : '0' + this.arr[i].time.getMinutes();
        let sec = this.arr[i].time.getSeconds() >= 10 ? this.arr[i].time.getSeconds() : '0' + this.arr[i].time.getSeconds();
        let ms = this.arr[i].time.getMilliseconds() >= 100 ? this.arr[i].time.getMilliseconds() : (this.arr[i].time.getMilliseconds() >= 10 ? '0' + this.arr[i].time.getMilliseconds() : '00' + this.arr[i].time.getMilliseconds());
        return `${hour}:${min}:${sec}.${ms}`;
    };
    this.showStrInfo = (i) => {
        let InfoEl = document.createElement('p');
        let tmp = this.arr[i].mod === 0 ? '&nbsp;&gt;&gt;&gt;' : '&nbsp;&lt;&lt;&lt;';
        InfoEl.innerHTML = this.showtime(i) + tmp + this.arr[i].str
        InfoEl.style.color = this.arr[i].fontColor;
        serial_receiveEl.appendChild(InfoEl);
        serial_receiveEl.scrollTop = serial_receiveEl.scrollHeight;
    };
    this.showUin8Info = (i) => {
        if (this.arr[i].fontColor === 'red') {
            this.showStrInfo(i);
        } else {
            let InfoEl = document.createElement('p');
            let tmp = this.arr[i].mod === 0 ? '&nbsp;&gt;&gt;&gt;' : '&nbsp;&lt;&lt;&lt;';
            let str = '';
            for (let j = 0; j < this.arr[i].uint_8.length; j++) {
                str += dec2hex(parseInt(this.arr[i].uint_8[j] / 16)) + dec2hex(parseInt(this.arr[i].uint_8[j] % 16)) + '&nbsp;';
            }
            InfoEl.innerHTML = this.showtime(i) + tmp + str;
            InfoEl.style.color = this.arr[i].fontColor;
            serial_receiveEl.appendChild(InfoEl);
            serial_receiveEl.scrollTop = serial_receiveEl.scrollHeight;
        }
    };
    this.showInfo = (i) => {
        if (this.isShowUin8) this.showUin8Info(i);
        else this.showStrInfo(i);
    }
    this.flash = function() { //0str 1uint8
        serial_receiveEl.innerHTML = '';
        for (let i = 0; i < this.arr.length; i++) {
            if (this.isShowUin8) this.showUin8Info(i);
            else this.showStrInfo(i);
        }
    }
};
serial_transmitEl.onkeydown = function(event) {
    if (event.keyCode == 13) {
        serialSubBtn.click();
        return false;
    }
    if (serialTransmitMod) { // 1>49 0>48 9>57 a>65 f>70 空格>32 退格>8
        if ((48 <= event.keyCode && event.keyCode < 58) ||
            (65 <= event.keyCode && event.keyCode <= 70) || event.keyCode == 32 || event.keyCode == 8) {
            if (!(event.keyCode == 8)) {
                const inputValue = serial_transmitEl.value;
                if (event.keyCode == 32) {
                    if (inputValue.length == 0 || //空格添加判定
                        (inputValue[inputValue.length - 3] != ' ' && inputValue[inputValue.length - 2] != ' ' && inputValue[inputValue.length - 1] == ' ') ||
                        (inputValue[inputValue.length - 3] != ' ' && inputValue[inputValue.length - 2] == ' ' && inputValue[inputValue.length - 1] != ' ')) {
                        // event.preventDefault();
                    } else
                        serial_transmitEl.value = (inputValue + event.key).toLowerCase(); //添加
                    event.preventDefault();
                } else if (event.ctrlKey && event.keyCode == 65) {
                    //快捷键允许通过
                } else {
                    if ((inputValue[inputValue.length - 2] != ' ' && inputValue[inputValue.length - 1] != ' ') && inputValue.length > 1)
                        serial_transmitEl.value = (inputValue + ' ' + event.key).toLowerCase();
                    else serial_transmitEl.value = (inputValue + event.key).toLowerCase(); //添加
                    event.preventDefault();
                }

            }
        } else {
            event.preventDefault();
        }
    }
}

let serialSubBtndisable = true;
serialSubBtn.onclick = async function() {
    if (serial_transmitEl.value === '') return;
    if (!serialSubBtndisable) {
        if (serialTransmitMod) { //0 STR 1HEX
            const inputValue_arr = serial_transmitEl.value.split(' ');
            let tmp = [];
            for (let i = 0; i < inputValue_arr.length; i++) {
                let tmpnum = 0;
                for (let j = 0; j < inputValue_arr[i].length; j++) {
                    tmpnum += Math.pow(16, (1 - j)) * hex2dec(inputValue_arr[i][j]);
                }
                tmp.push(tmpnum);
            }
            let Uint8Array_tmp = new Uint8Array(tmp);
            serialReceiveObj.pushEl(Uint8Array_tmp, 1, 'black');
            await serialWriter.write(Uint8Array_tmp);
        } else {
            let Uint8Array_tmp = string2Uint8Array(serial_transmitEl.value);
            serialReceiveObj.pushEl(Uint8Array_tmp, 1, 'black');
            await serialWriter.write(Uint8Array_tmp);
        }
        serialReceiveObj.showInfo(serialReceiveObj.arr.length - 1);
        serial_transmitEl.value = '';
    }
}


openPortBtn.onclick = () => {
    if (serial_Port_SelectEl.value === '') {
        serialReceiveObj.pushEl(string2Uint8Array('plz select the port!!!'), 0, 'red');
        // serialReceiveObj.showStrInfo(serialReceiveObj.arr.length - 1);
        serialReceiveObj.showInfo(serialReceiveObj.arr.length - 1);
        return;
    }
    isOpenPort = !isOpenPort;

    openAndcloseSerialFn();
    async function openAndcloseSerialFn() {
        if (isOpenPort === true) {
            await serialPort.open({
                dataBits: serial_dataBits_SelectEL.value, // 数据位
                stopBits: serial_stopBits_SelectEL.value, // 停止位
                parity: serial_parity_SelectEL.value, // 奇偶校验
                baudRate: serial_baudRate_SelectEL.value, // 波特率
            });
            serialReader = serialPort.readable.getReader();
            serialWriter = serialPort.writable.getWriter();
            // 监听来自串口的数据

            while (1) {
                try {
                    let datasave_tmp = [];
                    let isread;
                    while (true) {
                        const { value, done } = await serialReader.read();
                        if (done) {
                            serialReader.releaseLock();
                            serialWriter.releaseLock();

                            break;
                        }
                        if (value) {
                            for (let i = 0; i < value.length; i++) {
                                datasave_tmp.push(value[i]);
                            }
                            clearTimeout(isread);
                            isread = setTimeout(() => {
                                serialReceiveObj.pushEl(new Uint8Array(datasave_tmp), 0, 'black');
                                serialReceiveObj.showInfo(serialReceiveObj.arr.length - 1);
                                datasave_tmp = [];
                            }, 10);
                        }
                    }
                } catch (error) {
                    // Handle non-fatal read error.
                    console.error(error);
                } finally {
                    console.log(port.readable, keepReading);
                }
            }

        } else {
            await serialReader.cancel();
            await serialReader.releaseLock();
            await serialPort.close()
        }
    }


    if (isOpenPort) {
        bodyel.style.background = 'linear-gradient(135deg, #e5e0ff, #7286d3) no-repeat';
        serialSidebar.style.background = '#fff2f240';
        openPortBtn.innerHTML = 'CLOSE'
        openPortBtn.style.color = 'black';
        openPortBtn.style.background = 'linear-gradient(135deg, #fff2f2, #7286d3) no-repeat';
        serial_receiveEl.style.backgroundColor = '#ffffffa0';
        serial_transmitEl.style.backgroundColor = '#ffffffa0';
        serial_transmitEl.disabled = false;
        serial_transmitEl.placeholder = "transmit msg to serial port"
        serialSubBtndisable = false;
    } else {
        bodyel.style.background = 'linear-gradient(315deg, #e5e0ff, #7286d3) no-repeat;';
        serialSidebar.style.background = '#fff2f280';
        openPortBtn.innerHTML = 'OPEN'
        openPortBtn.style.color = 'white';
        openPortBtn.style.background = 'linear-gradient(-45deg, #8ea7e9, #7286d3) no-repeat';
        serial_receiveEl.style.backgroundColor = '#ffffff40';
        serial_transmitEl.style.backgroundColor = '#ffffff40';
        serial_transmitEl.disabled = true;
        serial_transmitEl.placeholder = "open the port to transmit msg"
        serialSubBtndisable = true;
    }
    for (let i = 0; i < serial_SelectEL_arr.length; i++) {
        serial_SelectEL_arr[i].disabled = isOpenPort;
        if (isOpenPort) serial_SelectEL_arr[i].style.cursor = 'default';
        else serial_SelectEL_arr[i].style.cursor = 'pointer';
    }
}

function Uint8Array2String(fileData) {
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString
}

function string2Uint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}

function dec2hex(num) {
    num = parseInt(num);
    switch (num) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            return num + '';
        case 10:
            return 'a';
        case 11:
            return 'b';
        case 12:
            return 'c';
        case 13:
            return 'd';
        case 14:
            return 'e';
        case 15:
            return 'f';

    }
}

function hex2dec(num) {
    switch (num) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            return Number(num);
        case 'a':
            return 10;
        case 'b':
            return 11;
        case 'c':
            return 12;
        case 'd':
            return 13;
        case 'e':
            return 14;
        case 'f':
            return 15;

    }
}



// 获取用户之前授予该网站访问权限的所有串口
// const ports = await navigator.serial.getPorts();

// // 打开串口
// await port.open({
//     dataBits: 8, // 数据位
//     stopBits: 1, // 停止位
//     parity: "none", // 奇偶校验
//     baudRate: 9600, // 波特率
// });

// console.log(port);
// console.log(ports);