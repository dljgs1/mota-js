/**
 * @file MapEvent.js
 * 地图类事件
 */

import MapManager from "../map/MapManager.js";
import EventManager from "./EventManager.js";

/**
 * 基本事件 就是地图的红点
 */
class BaseEvent {
    constructor(type, config) {
        this.type = type;
        this.data = {};
        this.status = null;
        config = config || {};
        for(let key in config){
            this[key] = config[key];
        }
    }
    /**
     * 获取一个红点事件
     * @param { Object } obj 触发者
     */
    getActions(obj){
        let code = EventManager.getEventCode(obj);
        let evt = EventManager.eventInfo.read(code);
        if(evt){
            if(evt.x!= obj.x || evt.y!= obj.y)return null;
            if(!evt.enable)return null;
        }
        let actions = EventManager.getMapEvent('events', code) || EventManager.getMapEvent('changeFloor', code);
        if(!actions)return null;
        return {type : 'actions', data : actions, src : obj}
    }
    /**
     * 触发获取的事件，一般来说都是直接core.insertAction
     * @param { actions } actions
     * @param { Object } obj
     * @param { function } callback
     */
    trigger(actions, callback){
        if(!actions)return false;
        let obj = actions.src || {};
        if(actions.type == 'actions'){
            core.insertAction(actions.data, obj.x, obj.y, callback);// , callback); ！插入事件直接回调 表示已经收到 不再等待
        }
        else if(actions.type=='script'){
            try{
                eval(action.data);
                callback();
            }
            catch (e) {
                main.log(e);
                return false;
            }
        }else if(actions.type=='trigger'){
            core.events.doSystemEvent(actions.data, obj.data, callback);
        }else{
            core.insertAction("未知的事件类型");
            return false;
        }
        return true;
    }
}



/**
 * 死亡事件——不是战后，战后不代表死亡，一般由“隐藏事件”、“删除角色”等操作触发
 */
class DieEvent extends BaseEvent{
    constructor(a, b){super(a, b);}

    /**
     * 死亡后禁止该角色的事件 同时 由于有事件 所以要将其按坐标索引暂存到事件信息中
     * @param { BaseActor } actor
     */
    getActions(actor){
        const info = EventManager.eventInfo;
        if(info.exist(actor.eventId)){// 存在该事件
            info.write(actor.eventId, {enable: false});
            // TODO: 如何存储其他信息？ 角色和事件合二为一？
            info.write('d:'+EventManager.getEventCode(actor),
                {id: actor.data.id});
            EventManager.removeActor(actor.eventId);
        }
    }
    /**
     */
    trigger(actions, callback){
        return null;
    }
}
/**
 * 碰撞block事件
 * 碰撞触发的时机：1. 不可到达时碰撞 2. 到达后试图碰撞地板道具 3. 隔空碰撞
 */
class CollisionEvent extends BaseEvent{
    constructor(a, b){super(a, b);}
    /**
     * actor：被碰撞的对象
     * @param { BaseActor } actor
     */
    getActions(actor){
        if(actor.isHero)return null;// 勇者无法被碰撞？
        let block = actor.data;// 获取碰撞体block
        if(block && block.event && !block.disable){
            if(block.event.script)
                return {type: 'script', data: block.event.script, src: actor};
            if(block.event.trigger && block.event.trigger != 'action')
                return {type: 'trigger', data: block.event.trigger, src: actor};
        }
        return super.getActions(actor);
    }
}

/**
 * 到达点事件 就是碰基本事件
 * 如果这个点存在角色或者事件 就尝试去碰撞
 */
class ArriveEvent extends CollisionEvent{
    constructor(a, b){super(a, b);}
    /**
     * 获取事件是从被碰撞的对象获取的
     * @param { BaseActor } actor
     */
    getActions(actor){
        if(!actor.isHero){
            EventManager.moveEventOfActor(actor);
            return null; // 其他角色不触发arrive事件
        }
        return super.getActions(MapManager.getActor(actor.x, actor.y) || actor);
    }
    /**
     * 只有勇者才能触发到达事件
     * @param { actions } actions
     * @param { Object } obj
     * @param { function } callback
     */
    trigger(actions, callback){
        return super.trigger(actions, callback);
    }
}


export {BaseEvent, DieEvent, CollisionEvent, ArriveEvent};