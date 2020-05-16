/**
 * 基本系统类型
 * 1. 实体——包含运行时数据的基本游戏对象
 * 2. 组件——包含各种处理逻辑的功能模块
 * 3. 监听——被数据消息驱动的各种模块
 * 
 * 组件改变实体
 * 实体产生消息
 * 监听处理消息
 */

/**
 * 所有消息监听者的基类
 *
 * 接收的规范：
 * receive的规范：
 * 1. 必须返回是否接收消息 true false/null 一般来说 只要 on了该消息 就一定返回true
 * 2. 如果接收消息，必须在所有函数处理完消息后调用callback——消息的响应必须完整
 * 3.
 */
export class Listener {
    constructor() {
        /**
         * 消息的处理是串行的 这是个问题
         * @type {ListenPromise}
         */
        this.disable = false; // 默认开启
        // 自造的promise暂时弃用 因为无法实现异步消息并行
        this.listenList = {};
    }

    /**
     * 用函数监听一个消息对象
     * @param code]
     * @param func (obj, callback)=>{ …… }
     */
    on(code, func){
        this.listenList[code] = this.listenList[code] || [];
        this.listenList[code].push(func);
    }
    /**
     * 如果有多个异步事件监听 用回调计数保证callback只执行一次
     * @param event
     * @param obj
     * @param callback
     * @returns {boolean}
     */
    receive(event, obj, callback){
        if(this.disable)return false;
        let list = this.listenList[event] || [];
        if(list.length===0)return false;
        let ct = list.length;
        let fn = ()=>{ct -= 1; if(ct===0 && callback)callback()};
        for(let i in list){
            list[i](obj, fn);
        }
        return true;//消息接收之后只会成功 不会失败
    }
}

/**
 * 组件类
 * 1. 包含逻辑，通常不含数据，至少不含游戏数据
 * 2. 不依赖其他组件，如果产生强依赖，合并；弱依赖，消息
 */
export class Component{
    constructor(name){
        this.name = name;
    }
    /**
     * 更新一个实体对象
     * @param { Entity } obj 
     */
    update(obj){
    }
    /**
     * 当组件被安装时
     * @param { Entity } obj 
     */
    install(obj){
    }
    /**
     * 当组件被移除时
     * @param { Entity } obj 
     */
    uninstall(obj){
    }
}


/**
 * 实体类
 * 1. 是组件的容器
 * 2. 包含数据
 * 3. 在每次更新时（更新粒度与时机由消息管理决定）
 */
export class Entity{
    constructor() {
        this.data = {};
        this.components = {};
    }
    /**
     * 
     * @param { Component } comp 
     */
    addComponent(comp){
        this.components[comp.name] = comp;
        comp.install(this);
    }
    /**
     * @param { String } compName 
     */
    removeComponent(compName){
        if(!this.components[compName])return;
        this.components[compName].uninstall(this);
        delete this.components[compName];
    }
    /**
     * @param { Object } info 
     */
    update(info){
        if(!this.needUpdate)return;
        for(let k in this.components){
            this.components[k].update(this, info);
            // if(this.components[k].needUpdate)
        }
    }
}