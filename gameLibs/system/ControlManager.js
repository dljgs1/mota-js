import MessageManager from "./MessageManager.js"
import ActorManager from "../map/ActorManager.js";
import { Component } from "./Base.js";

import InputManager, {Command} from "./InputManager.js"

/** 控制系统
 - 基于tink :
     https://github.com/kittykatattack/tink
     https://blog.csdn.net/FE_dev/article/details/87741188


控制器定义：
 1. 组件
 2. 能够自主调用对象的方法
    “自主”
        ——绑定对象的方法
        ——注册的指令

        说是自主，其实通常由交互驱动、或是AI驱动

控制管理：
    用户的交互数据状态：
        键位
        鼠标
    控制器组

    主要控制器：
    1. 勇士控制器
    2. 系统控制器
    3. UI控制器
    4. 自定义控制器
*/



/**
 * 抽象控制器 继承自组件
 * 与组件一样 控制器只有绑定到具体的实体才能生效——因为只有实体才会刷新，才会去应用到实际数据
 * 控制器与其他静态组件不同 不会等到刷新才对实体进行执行 而是在指令激发时执行
 *
 */
class Controller extends Component {
    constructor(name) {
        super(name);
        /**
         * 指令列表
         * 表示控制器当前注册的指令
         * @type {{Command}}
         */
        this.commands = {};
        this.actionList = {};// 执行指令对应的函数，如果有函数，doAction将默认执行函数
        this.lock = false;// 控制器是否被锁定 —— 按键无效化、操作无效化
    }
    /**
     * 绑定一个控制的对象，如果不绑，由注册指令的回调函数决定操作范围。
     * @param { BaseActor | Sprite } obj
     * 与一般的组件不同 控制器组件可以绑定到系统而非实体
     */
    bind(obj) {
        this.obj = obj;
    }
    /**
     * 当组件被安装时即绑定该对象
     * @param { Entity | BaseActor } obj
     */
    install(obj){
        this.obj = obj;
    }
    uninstall(obj){
        this.obj = null;
    }

    enable(){
        return !this.lock && this.obj;
    }

    /**
     * 执行。
     * 此时传递的info通常是键位信息 controller根据是什么键进行具体的执行
     * @param { String } name 指令名
     * @param { keyboard | Pointer } info 键位状态、消息
     */
    doAction(name, info){
        if(this.enable() && name in this.commands && name in this.actionList){
            const f = this.actionList[name];
            if(f && f(name, info)){
                return true;
            }
        }
        return false;
    }
    /**
     * 注册一个指令到当前控制器，如果选择了函数，将会在指令激发时执行函数
     * @param { Command } cmd
     * @param { Function } fn
     */
    registerCommand(cmd, fn){
        cmd.addController(this);
        this.commands[cmd.name] = cmd;
        if(fn)this.actionList[cmd.name] = fn;
    }
    /**
     * 注册多个指令
     * @param {[ Command ]} cmds
     * @param { function } fn
     */
    registerCommands(cmds, fn){
        cmds.forEach(cmd => {
            this.registerCommand(cmd, fn);
        });
    }

    /**
     *
     * @param name
     */
    unregisterCommand(name){
        if(this.commands[name])
            this.commands[name].removeController(this);
        delete this.commands[name];
        delete this.actionList[name];
    }
}

/**
 * 角色控制器——本来可以不继承而是直接实现 但为了突出角色的重要性所以单独写出来
 * 优点：方法集中，清晰明了；
 * 缺点：一个控制器只能控制一个角色
 * 扩展：其实是系统控制器
 * //TODO 要保持绝对流畅必须得循环监听方向键的状态然后决定行动 —— 在PC端开启轮询模式
 * 摄像机如何跟随？——请跟随实体
 */
class ActorController extends Controller {
    constructor(name) {
        super(name);
        this.buff = {};
        // 缓存 其实把键值状态都存进去了 从而实现更流畅的操控（多按键）
        for(let k of ['Up', 'Down', 'Left', 'Right']){
            this.buff[k.toLowerCase()] = InputManager.getStatus(k);
        }
    }

    /**
     * 检测按键 移动
     * @param obj
     */
    update(obj){
        if(this.enable()){
            for(let k in this.buff){
                if(this.buff[k].isDown){
                    this.doAction(k, this.buff[k]);
                    break;
                }
            }
        }
    }
    get lock(){
        return core.status.lockControl
    }
    set lock(v){
        core.status.lockControl = v;
    }

    /**
     *
     * @param name 指令名
     * @param { keyboard | Pointer} status
     * @returns {boolean}
     */
    doAction(name, status){
        if(super.doAction(name, status))return true;
        if(this.enable() && name in this.commands){
            switch (name) {
                case 'left':
                case 'right':
                case 'up':
                case 'down': return this.move(name, status);
                case 'turn': return this.turn();
                case 'click': return this.moveDirectly(status);
                case 'press':
                case 'release':
                case 'drag': return this.makeRoute(status);
            }
        }
    }

    /**
     * 控制一个角色移动
     * @param { String } direction
     * @param { tink.keyboard } key (一个包含isDown isUp的对象即可
     */
    move(direction, key){
        main.log('move ')
        // TODO : 录像模式下的操作 直接transform
        if(this.obj.isMoving){
            if(key && this.preRoute){// 如果用按键 会强行打断寻路 但必须等待到达，不然角色动画会卡
                this.preRoute = null;
                this.obj.arriveToDo(success=>{
                    this.move(direction, key);
                    success();
                });
            }
            return true;
        }
        if(!direction){
            if(this.preRoute && this.preRoute.length){ // 如果提前准备了路线 且当前没有干扰 进行移动
                direction = this.preRoute.shift().direction;
            }
            else return;
        }
        if(this.obj.canmove(direction)){// 能移动就直接移动
            this.obj.move(direction).
                then(success=>{// @_@ TODO: 此处记录录像 表示移动操作成功 if(this.name == 'hero')core.status.route.push(direction);
                if(key && key.isDown){
                    this.move(direction, key);
                }else{
                    this.move();
                }
                success();
            });
            return true;
        }else{
            // 不能移动 尝试撞击 后决定是否停止
            this.obj.collision(direction)
                .then((success, fail)=>{
                if(this.obj.canmove(direction)){
                    this.obj.move(direction).then(go=>{
                        go();
                        this.move();
                    });
                    success();
                }else{
                    fail();
                    this.clearRoute();
                }
            });
        }
        return false;
    }

    /**
     * 清除路线 TODO: clearRoute 清掉UI对象
     */
    clearRoute(){
        this.preRoute = null;
    }
    /**
     * 转身
     */
    turn(direction){
        if(this.obj.direction==direction)return false;
        // 录像
        if(direction)this.obj.turn(direction);
        else {
            let dirs = ['up','right','down','left'];
            this.obj.turn(dirs[(dirs.indexOf(this.obj.direction) + 1) % 4]);
        }
        return true;
    }
    /**
     * 瞬移：需要提供目标坐标
     * @param { tink.Pointer | null } pt
     */
    moveDirectly(pt){
        main.log('move directly')
        if(!this.obj)return;
        this.obj.arriveToDo((success,fail)=>{
            pt = SceneManager.mapScene.getGamePosition(pt);
            if(pt.x === this.obj.x && pt.y === this.obj.y){
                this.turn();
            }else if(this.obj.isNear(pt.x, pt.y)){
                this.move(core.utils.invDir[(pt.x - this.obj.x)+','+(pt.y-this.obj.y)])
            }
            else if(this.obj.canMoveDirectly(pt.x, pt.y)){
                this.obj.moveDirectly(pt.x, pt.y);
            }else {
                this.preRoute = this.obj.calRoute(pt.x, pt.y);
                if(!this.preRoute)return fail();
                this.move();
            }
            success();
        });
        return true; // 属于指令的函数都需要返回true 用来打断指令重叠
    }

    jump(x, y){
        if(!this.obj)return;
    }

    /**
     * 拖拽路线
     * 1. 起点要计算最短路径——如果起点不能找到最短路径
     * 2. 拖拽点要计入之后路线中
     */
    makeRoute(ptr){
        if(!this.obj)return false;
        let pt = SceneManager.mapScene.getGamePosition(ptr);
        // 必须判断是在drag
        if(ptr.isDrag){
            if(this.autoRoute){
                let last = this.autoRoute[this.autoRoute.length-1];
                let dir = core.utils.invDir[(pt.x - last.x)+','+(pt.y-last.y)];
                if(dir)this.autoRoute.push({direction:dir, x: pt.x, y:pt.y});
            }else{
                this.autoRoute = [{x: pt.x, y: pt.y}];
            }
        }else { // 弹起 先寻路 然后拼接 —— 如果根本没动过 就不动 因为瞬移会处理好
            if(!this.autoRoute || this.autoRoute.length==1 || this.obj.isMoving){
                this.autoRoute = null;
                return ;
            }
            let st = this.autoRoute.shift();
            this.preRoute =
                (this.obj.calRoute(st.x, st.y)||[])
                    .concat(this.autoRoute);
            this.obj.clearAutoRoute(); //！重要 寻路的过程仍然由控制器完成 对象自身不主动
            this.autoRoute = null;
            this.move();
        }
        return true;
    }
}


/**
 * UI控制器
 * 0. 交互式的集中管理
 * 1. 点击的堆叠树——设置点击相关的UI，会依据其层级对比优先级
 * 2. 键盘的唯一性——同一时刻只能有一个UI响应键盘消息
 * 3. 可以同时绑定多个
 */
class UIController extends Controller{
    constructor(){
        super('ui');
        this.activeList = {};
    }
    install(obj){
        let id = obj.name || setTimeout(null);
        this.activeList[id] = obj;
    }
    uninstall(obj){
        if(obj.name){delete this.activeList[obj.name]}
        else{
            for(let k in this.activeList){
                if(this.activeList[k]===obj){
                    delete this.activeList[k];
                    return ;
                }
            }
        }


    }

    /**
     * UI以操作帧率(5~10fps)进行更新，主要是检测press（长按）
     * @param obj
     */
    update(obj){

    }
    /**
     *
     */
    doAction(name, info){
        if(name in this.activeList){
            let kname = name.split('_');
            let obj = this.activeList[name].obj;
            const comp = obj.components[kname[kname.length-1]]; // TODO: 实体emit
            if(comp){
                if(info.hitTestSprite(obj))
                core.insertAction(comp.action);
                return true;
            }
        }
    }

    /**
     * 算出一个名字：
     * 容器名 + 键名 —— 这是唯一的
     * @param obj
     * @param key
     * @returns {string}
     */
    getNameMap(obj, key){
        let keyname = key;
        if(key instanceof Array){
            keyname = key.join('@');
        }
        let name = obj.name + '_' + keyname;
        return name;
    }

    /**
     * 对一个对象添加交互
     * @param { Component }obj
     * @param { String | Array | Component} key tap|drag|release|W|D
     */
    addInteract(obj, key){
        let name = this.getNameMap(obj, key);
        if(!(name in this.activeList)){
            this.activeList[name] = {
                obj : obj,
                name : name,
                command: ControlManager.getSetCommand(name, key),
            };
        }
        this.activeList[name].command.addController(this);
    }

    /**
     * 去除交互
     * @param obj
     * @param key
     */
    removeInteract(obj, key){
        let name = this.getNameMap(obj, key);
        let cmd = this.activeList[name];
        if(cmd)cmd.removeController(this);
    }

}

/**
 * 控制器管理中心
 *
 * 这里是玩家行为具体如何影响游戏实体的管理中心
 * 如控制角色的WASD 不指代具体键位 而是一种抽象的指令
 * 又如
 *
 *
 */
const ControlManager = new class ControlManager {
    constructor() {
        let cmds = commands_45ec4f32_3f61_49af_b0b6_a020739976b1;
        /**
         * 指令列表
         * @type {{ Command }}
         */
        this.commandList = {};
        for(let i in cmds){
            this.commandList[i] = new Command(i);
            InputManager.bindCommand(cmds[i], this.commandList[i]);
        }

        this.t = new Tink(PIXI, main.render.view);
        this.pointer = this.t.makePointer(); // 全局唯一指针
        this.buttons = {}; // 自定义UI按钮 t.makeInteractive(anySprite);

        this.conList = {}; // 控制器列表
        this.keyTable = { "0": "96", "1": "97", "2": "98", "3": "99", "4": "100", "5": "101", "6": "102", "7": "103", "8": "104", "9": "105", "A": "65", "J": "74", "S": "83", "B": "66", "K": "75", "T": "84", "C": "67", "L": "76", "U": "85", "D": "68", "M": "77", "V": "86", "E": "69", "N": "78", "W": "87", "F": "70", "O": "79", "X": "88", "G": "71", "P": "80", "Y": "89", "H": "72", "Q": "81", "Z": "90", "I": "73", "R": "82", "F1": "112", "F7": "118", "F2": "113", "F8": "119", "*": "106", "F3": "114", "F9": "120", "+": "107", "F4": "115", "F10": "121", "Enter": "13", "F5": "116", "F11": "122", "-": "109", "F6": "117", "F12": "123", ".": "110", "/": "111", "BackSpace": "8", "Esc": "27", "Right": "39", "-_": "189", "Tab": "9", "Spacebar": "32", "Down": "40", ".>": "190", "Clear": "12", "PageUp": "33", "Insert": "45", "PageDown": "34", "Delete": "46", "~": "192", "Shift": "16", "End": "35", "NumLock": "144", "[{": "219", "Control": "17", "Home": "36", ";:": "186", "Alt": "18", "Left": "37", "=+": "187", "}": "221", "CapeLock": "20", "Up": "38", "<": "188", "\'": "222" };
        // this._init();
        this.route = []; //录像：会记录所有控制器的操作——只要时序绝对，就能实现怪物袭击主角的录像回放了。
    }
    getCommand(name){
        return this.commandList[name];
    }

    /**
     * 动态增加全局指令
     * @param name
     * @param key
     * @param fn
     */
    addCommand(name, key){
        this.commandList[name] = new Command(name);
        InputManager.bindCommand(key, this.commandList[name]);
    }

    /**
     *
     * @param name
     * @param key
     * @returns { Command }
     */
    getSetCommand(name, key){
        if(!(name in this.commandList)){
            this.addCommand(name, key);
        }
        return this.commandList[name];
    }


    _init() {
        ////// 系统控制器
        /**
         * TODO： 玩家设置键位——键位映射
         * @type {Controller}
         */
        if(main.mode=='editor')return;
        // 系统控制器 —— 也被core.status.lockControl锁定？——todo：随时可存读档 包括事件过程中
        let sysCon = this.create('sys');


        sysCon.registerCommand(this.getCommand('save'), () => {
            if(heroCon.obj)
                heroCon.obj.stopToDo(success=>{
                    core.autosave(); success();
                });
            return true;
        });
        sysCon.registerCommand(this.getCommand('autoback'), () => {
            if(heroCon.obj)
                heroCon.obj.stopToDo(success=>{
                    core.doSL("autoSave-back", "load");
                    success();
                });
            return true;
        });
        sysCon.registerCommand(this.getCommand('autoload'), () => {
            if(heroCon.obj)
                heroCon.obj.stopToDo(success=>{
                    core.doSL("autoSave", "load");
                    success();
                });
            return true;
        });

        // 勇者控制器 —— 在游戏正式开始后 要绑定勇者实体对象才能使用
        let heroCon = this.create('hero', new ActorController('hero'));
        const heroCmds = ['up', 'down', 'left', 'right', 'turn', 'click', 'release', 'press', 'drag'];
        for(let c of heroCmds){
            heroCon.registerCommand(this.getCommand(c));
        }
        // 响应式控制器 如点击屏幕、按空格等 —— 响应多种类型到同一种结果——发送user消息
        // 优先要大于勇者操作的tap 否则就会出现碰撞的事件瞬间被关闭的情况
        // todo: 让左右键可以控制
        let tapCon = this.create('screenTap');
        tapCon.registerCommands([this.getCommand('check'), this.getCommand('click')], ptr=>{
            // 点击是用户行为产生的消息 如果之后有类似的
            return MessageManager.send('user', 'screenTap', ptr);
        });
        // ui控制器
        let uiCon = this.create('ui', new UIController());

        // 绑定到管理系统的控制器都属于系统控制器
        sysCon.bind(this);
        tapCon.bind(this);
        uiCon.bind(this);
    }
    // 获取一个控制器
    getCon(name) {
        return this.conList[name];
    }
    // 创建一个控制器
    create(name, obj) {
        if (!obj) {
            obj = new Controller(name);
        }
        if (name in this.conList) {
            main.log('重复' + name);
            debugger;
        }
        this.conList[name] = obj;
        return obj;
    }

    /**
     * 锁定所有控制器
     */
    lockDown(name){
        if(name){
            (this.conList[name]||{}).lock = true;
        }
        else{
            for(let k in this.conList){
                this.conList[k].lock = true;
            }
        }
    }

    unlock(name){
        if(name){
            (this.conList[name]||{}).lock = false;
        }
        else{
            for(let k in this.conList){
                this.conList[k].lock = false;
            }
        }
    }

    // 绑定控制器到一个对象 —— 目前一个控制器只能绑定一个对象
    bindObject(name, obj) {
        this.conList[name].bind(obj);
    }
    /**
     * 指针消息绑定到控制器 会依据类型向控制器发消息 类型为tap、press、release、drag，
     * 传递参数为pointer(x, y)——
     * 这个坐标是世界坐标，需要通过相机在不同场景转换
     */
    bindPointer(type, con, priority) {
        const self = this;
        if (!this.pointer[type]) {
            this.pointer[type] = function () {
                for (let i in self.pObjs[type]) {
                    if (self.pObjs[type][i].obj.doCommand(type, this)) {
                        break;
                    }
                }
            };
        }
        this.pObjs[type] = this.pObjs[type] || [];
        this.pObjs[type].push({ obj: con, priority: priority || 0 });
        this.pObjs[type] = this.pObjs[type].sort((a, b) => { b.priority - a.priority; });
    }
    /**
     * 键盘消息绑定到控制器 keyName就是commandType —— 奇怪的设计
     */
    bindKey(key, con, priority, isup) {
        let name = key;
        priority = priority || 0;
        if (con instanceof Array) {
            for (let i in con) {
                this.bindKey(con[i], func, priority, isup);
            }
        }
        if (key in this.keyTable)
            key = this.keyTable[key];
        else
            main.log('未识别的keycode' + key);
        var funclist = this.keyObjs;
        function getKeyFunc(type) {
            return function () {
                if (!funclist[key] || !funclist[key][type])
                    return;
                for (var i in funclist[key][type]) {
                    if (funclist[key][type][i].obj.doCommand(name, this))
                        break;
                }
            };
        }
        function insertKeyFunc(type) {
            funclist[key] = funclist[key] || {};
            funclist[key][type] = funclist[key][type] || [];
            funclist[key][type].push({
                priority: priority,
                obj: con,
            });
            funclist[key][type] = funclist[key][type].sort((a, b) => { b.priority - a.priority; });
        }
        if (!this.keys[key]) {
            this.keys[key] = new this.t.keyboard(key);
            this.keys[key].press = getKeyFunc('press');
            this.keys[key].release = getKeyFunc('release');
        }
        if (isup)
            insertKeyFunc('release');
        else
            insertKeyFunc('press');
    }
}();
export default ControlManager;