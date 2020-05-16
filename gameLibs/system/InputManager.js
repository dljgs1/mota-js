import {Listener} from "./Base.js";

const keyTable = { "0": "96", "1": "97", "2": "98", "3": "99", "4": "100", "5": "101", "6": "102", "7": "103", "8": "104", "9": "105", "A": "65", "J": "74", "S": "83", "B": "66", "K": "75", "T": "84", "C": "67", "L": "76", "U": "85", "D": "68", "M": "77", "V": "86", "E": "69", "N": "78", "W": "87", "F": "70", "O": "79", "X": "88", "G": "71", "P": "80", "Y": "89", "H": "72", "Q": "81", "Z": "90", "I": "73", "R": "82", "F1": "112", "F7": "118", "F2": "113", "F8": "119", "*": "106", "F3": "114", "F9": "120", "+": "107", "F4": "115", "F10": "121", "Enter": "13", "F5": "116", "F11": "122", "-": "109", "F6": "117", "F12": "123", ".": "110", "/": "111", "BackSpace": "8", "Esc": "27", "Right": "39", "-_": "189", "Tab": "9", "Spacebar": "32", "Down": "40", ".>": "190", "Clear": "12", "PageUp": "33", "Insert": "45", "PageDown": "34", "Delete": "46", "~": "192", "Shift": "16", "End": "35", "NumLock": "144", "[{": "219", "Control": "17", "Home": "36", ";:": "186", "Alt": "18", "Left": "37", "=+": "187", "}": "221", "CapeLock": "20", "Up": "38", "<": "188", "\'": "222" };

/**
 * 键-指令是双射的 一个键可以同时发出多个指令 也可以多个键发同一个指令
 *
 * 指令是一个监听器？但不归消息处理中心管
 *
 * 指令是可以和输入绑定的监听器
 *
 * 指令解耦的好处：多操作对应单指令无需重新绑定——如UI中上下左右 以及上下左右的UI
 *
 *
 */
export class Command{
    constructor(name, input, priority) {
        this.name = name;
        this.input = input;
        this.priority = priority || 0;
        this.conList = [];
    }

    /**
     * 控制器的优先级是——后来先判 从而方便热插拔
     * @param con
     */
    addController(con){
        this.removeController(con);
        this.conList.push(con);
    }
    removeController(con){
        let idx = this.conList.indexOf(con);
        if(idx>=0) {
            this.conList.splice(idx, 1);
            this.conList.push(con);
        }
    }


    /**
     * 默认指令执行即接受消息
     * @param info
     * @returns {*}
     */
    execute(info){
        for(let i = this.conList.length-1; i>=0 ;i--){
            if(this.conList[i].doAction(this.name, info))
                break;
        }
    }
}

/**
 * 输入管理
 *
 * 这里提供的是key代码 以及指针状态的查询
 * key/ptr 可以绑定指令消息 Command
 *
 * 一般来说 用户输入->指令->具体执行信息分发（controller）->实体（）->组件……、
 *
 * 有如下两种应用方案：
 *
 * 1. 输入是一种状态，定期查询状态，根据状态做出响应——此时，command作为一个状态代理
 * 2. 输入是一种事件，事件发生后，执行对应的代码——此时，command作为消息传递
 *
 */

export default new class InputManager{
    constructor(){
        let t = new Tink(PIXI, main.render.view);
        let keyStatus = {};
        let ptr = t.makePointer(); // 指针状态
        let keyCommandList = {
            up:{},
            down:{},
            press:{},
        };
        let ptCommandList = {
            press: [],
            release: [],
            drag: [],
            tap: [],
        };

        for(let type in ptCommandList){
            ptr[type] = function () {
                for (let i in ptCommandList[type]) {
                    if (ptCommandList[type][i].execute(ptr)) {
                        break;
                    }
                }
            }
        }

        for(let name in keyTable){
            keyStatus[keyTable[name]] = {
                name: name, // 键位的名字
                isUp: true,
                isDown: false,
            }
        }
        let keyUp = function(event){
            const code = event.keyCode;
            const status = keyStatus[code];
            status.isUp = true;
            status.isDown = false;
            if(code in keyCommandList.up){
                for (let i in keyCommandList.up[code]) {
                    if (keyCommandList.up[code][i].execute(status)) {
                        break;
                    }
                }
            }
        };
        let keyDown = function(event){
            const code = event.keyCode;
            const status = keyStatus[code];
            status.isUp = false;
            status.isDown = true;
            if(code in keyCommandList.down){
                for (let i in keyCommandList.down[code]) {
                    if (keyCommandList.down[code][i].execute(status)) {
                        break;
                    }
                }
            }
        };
        this.keyStatus = keyStatus;//键位状态
        this.pointer = ptr;

        window.addEventListener("keydown", keyDown, false);
        window.addEventListener("keyup", keyUp, false);

        this.pObjs = ptCommandList;
        this.kObjs = keyCommandList;
    }


    /**
     * 输入绑定指令 自动判断是键盘还是鼠标
     * todo: 区分按下、弹起、长按
     * @param name
     * @param command
     */
    bindCommand(name, command){
        if(name instanceof Array)
            name.forEach(n=>{this.bindCommand(n, command)});
        if(name in keyTable){
            this.bindKey(name, 'down', command);
            return true;
        }
        if(name in this.pObjs){
            this.bindPointer(name, command);
            return true;
        }
        return false;
    }


    /**
     * 键盘消息绑定一条command
     */
    bindKey(key, type, command) {
        if (key instanceof Array) {
            for (let k of key) {
                this.bindKey(k, type, command);
            }
        }
        if (key in keyTable)
            key = keyTable[key];
        else
            main.log('未识别的keycode' + key);
        var cmdList = this.kObjs;
        cmdList[type][key] = cmdList[type][key] || [];
        cmdList[type][key].push(command);
        cmdList[type][key].sort((a, b) => { return b.priority - a.priority; });
    }

    /**
     * 指针消息绑定到到一条指令
     * @param type
     * @param { Command } command
     */
    bindPointer(type, command) {
        if(type in this.pObjs){
            this.pObjs[type] = this.pObjs[type] || [];
            this.pObjs[type].push(command);
            this.pObjs[type] = this.pObjs[type].sort((a, b) => { return b.priority - a.priority; });
        }else{
            main.log('error type : '+type)
        }

    }

    /**
     * 获取一个键的输入状态
     * @param key
     * @returns {*}
     */
    getStatus(key){
        if(key in keyTable)
            return this.keyStatus[keyTable[key]];
        return this.pointer;
    }

    updatePriority(){
        for(let k in this.kObjs){
            for(let t in this.kObjs[k]){
                this.kObjs[k][t].sort((a, b) => { return b.priority - a.priority; });
            }
        }
        for(let t in this.pObjs){
            this.pObjs[t].sort((a, b) => { return b.priority - a.priority; });
        }
    }


}