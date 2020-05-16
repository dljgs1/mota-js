import { BaseWind, TextWind } from "./BaseWindow.js"
import SpriteManager from "../assets/SpriteManager.js"
import SceneManager from "../scene/SceneManager.js"

/**
 * UI管理器
 */

/**
    组件UI说明：
    1. 在没有任何组件嵌入的情况下 使用与正常UI绘制的区别仅在于坐标系转换：每个UI区自带相对坐标系
    2. 嵌入组件后，可以给被嵌入的UI加一个功能，即插即用。
    3. 组件需要自己实现，范例见plugins中的component

    by dljgs1 2020.4
*/
/**
 * @author dljgs1
 * @class UIManager
 *
 * */
export default new class UIManager {
    constructor() {
    }
    _init(scene) {
        this.scene = scene;
        /**
         * @param { Array[BaseWind] }
         */
        this.stack = [];
        this.objs = {};
        this.animates = {};
        this.checkList = {}; //检查组 如果有动画 就会将其推入检查栈中 确认无更新后执行回调
        this.cleanList = {}; //干净组 被标记的这些UI不会参与重绘 而是直接使用之前的内容
        // 创建一些基础UI
        this.objs['text'] = new TextWind('textBox', SpriteManager.getWinSprite());
        // this.objs['statusBar'] = new TextWind('statusBar', SpriteManager.getWinSprite());
    }


    /**
     * 绘制矩形（测试用）
     */
    drawRect(rect,color){
        let g = new PIXI.Graphics();
        g.beginFill(color||12345).drawRect(rect.x,rect.y,rect.width,rect.height);
        this.scene.addChild(g);
    }
    /**
     * @method 创建窗口
     * @property { EventData } 通过事件数据创建一个窗口
     *
     * */
    createWind(info) {
        var obj = new BaseWind(info);
        if(this.stack.length){ // 属于栈顶的——何时出栈？
            this.stack[this.stack.length-1].addSubWind(obj);
        }else{
            this.objs[obj.name] = obj;
        }
        return obj;
    }
    /**
     * @method 获取窗口 —— 不填name则是当前绘制热区 即栈顶的组件UI
     * @property { String } 窗口名
     *
     * */
    getWind(name) {
        if (name)
            return this.objs[name];
        else {
            if (this.stack.length == 0) {
                console.log("error get ");
            }
            else
                return this.stack[this.stack.length - 1];
        }
        ;
    }
    /**
     * @method 画对话框
     * @property { String } 窗口名
     *
     * */
    drawTextBox(data) {
        this.scene.addChild(this.objs.text);
        this.objs.text.drawTextBox(data.text, data);
        // TODO: 添加析构消息
    }
    /**
     * @method 入栈：计算基本信息 以及进行父子连接 —— 入栈前需要将自己的画布清空
     * @property { BaseWind } 需要推入的对象
     *
     * */
    push(obj) {
        core.setFlag('__UI__');
        if (this.stack.length) {
            this.stack[this.stack.length - 1].addChild(obj); // 连接
        }
        this.stack.push(obj);
    }
    // 出栈 可进行实际绘制
    pop() {
        var obj = this.stack.pop();
        if (this.stack.length == 0) { // 全部执行完毕后 是否要进行实际绘制？
            core.removeFlag('__UI__');
            // this.realDrawToCanvas(obj, obj.show ? core.getContextByName(this.realCanvasName) : null);
        }
    }
    // 添加干净标记
    addCleanFlag(name) {
        if (name in this.objs) {
            this.cleanList[name] = true;
        }
    }
    // 添加干净标记
    clearCleanFlag(name) {
        if (!name)
            this.cleanList = {};
        else
            delete this.cleanList[name];
    }
    // 清除UI内容 如果有动画 需要先检查至动画结束
    clearUI(obj, callback) {
        var _callback = function () {
            obj.recurDelete();
            if (callback)
                callback();
        };
        var rootObj = obj.findRoot();
        if (this.animates[rootObj.name]) { //!这里必须检查其父节点是否有动画 因为动画是针对实际显示的底层画布
            if (this.checkList[rootObj.name]) { //回调嵌套
                var tmp = this.checkList[rootObj.name];
                this.checkList[rootObj.name] = function () {
                    tmp();
                    _callback();
                };
            }
            else {
                this.checkList[rootObj.name] = _callback;
            }
        }
        else {
            _callback();
        }
    }
    // 实际绘制：如果有动画的话 就不用
    realDrawToCanvas(obj, ctx, callback) {
        // var needUpdate = obj.checkUpdate();
        ctx = ctx || core.getContextByName(this.realCanvasName);
        ctx.clearRect(obj.x, obj.y, obj.width, obj.height);
        obj.drawWorld(ctx);
        return callback ? callback() : null;
        ///////
        if (ctx && !core.control.renderFrameFuncs['uianimate_' + obj.name]) {
            obj.drawWorld(ctx);
            if (needUpdate) {
                var needEnable = obj.enable;
                obj.recurDisable();
                return core.registerAnimationFrame('uianimate_' + obj.name, true, function () {
                    ctx.clearRect(obj.x, obj.y, obj.width, obj.height);
                    var needUpdate = obj.checkUpdate(); // 检查更新
                    if (obj.show)
                        obj.drawWorld(ctx); // 如果处于显示状态才进行绘制
                    if (!needUpdate || !obj.show) {
                        if (callback)
                            callback();
                        if (!obj.show)
                            ctx.clearRect(obj.x, obj.y, obj.width, obj.height);
                        if (needEnable)
                            obj.recurEnable();
                        core.unregisterAnimationFrame('uianimate_' + obj.name);
                    }
                });
            }
        }
        else
            obj.drawWorld(); // 如果正在动画中 则只进行自己世界的重绘 不绘制到实际画面
        if (callback)
            callback();
    }
    // 绘制动画帧
    drawAnimateFrame(obj) {
        var ctx = core.getContextByName(this.realCanvasName);
        if (obj.checkUpdate()) { // 有动画更新才试图绘制显示
            ctx.clearRect(obj.x, obj.y, obj.width, obj.height);
            obj.drawWorld(ctx); // 如果还在显示 就画上去
        }
        else {
            if (this.checkList[obj.name]) { // 无更新 如果有检查回调 执行之
                this.checkList[obj.name]();
                delete this.checkList[obj.name];
            }
        }
    }
    // 为UI设置动画帧——必须设置在根节点上
    setAnimateFrame(obj) {
        obj = obj.findRoot();
        this.animates[obj.name] = true;
        //core.registerAnimationFrame('uianimate_'+obj.name, true, function(){
        //    UImanager.drawAnimateFrame(obj);
        //});
    }
    // 停止动画
    removeAnimateFrame(obj) {
        delete this.animates[obj.name];
    }
    // 动画循环：一直存在 可卸载
    animateLoop() {
        for (var i in UImanager.animates) {
            UImanager.drawAnimateFrame(UImanager.getBaseWin(i));
        }
    }
    // 向组件发送消息 无视睡眠和enable
    sendMessageToComponent(obj, comp, msg) {
        if (typeof obj == 'string') {
            obj = this.getBaseWin(obj);
        }
        if (comp) {
            if (obj.components[comp] && obj.components[comp].send) {
                obj.components[comp].send(msg);
            }
        }
        else { // 查找所有组件与子组件尝试发送消息
            for (var i in obj.components) {
                if (obj.components[i] && obj.components[i].send) {
                    obj.components[i].send(msg);
                }
            }
            for (var i in obj.subwind) {
                this.sendMessageToComponent(obj.subwind[i], null, msg);
            }
        }
    }
    open(name) {
        if(name in this.objs){
            this.scene.addChild(this.objs[name]);
            this.objs[name].recurEnable();
            return;
        }
        const ui = ui_238e5645_c9c6_4124_b8a8_b65b4c4ab390[name]();
        const vm = new Vue({
            render: h => h(ui)
        });
        window.dbg = vm;
        vm.$mount();
        SceneManager.mainScene.addChild(vm.$el);
    }
}















