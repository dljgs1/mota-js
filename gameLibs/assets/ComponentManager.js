
import {Component} from "../system/Base.js";
import {ActionPromise} from "../utils/promise.js";

//// 系统自带的组件 ///////
/**
 *
 * 此处为拆分预期施工地区（咕？
 * 拆分目标：
 * 1. 地图角色的功能拆分
 *  - 角色的各种行为以组件形式分离，需要的再添加，不需要了移除
 *  -
 * 2. UI的功能拆分
 *……
 *
 */

/**
 * 行为组件
 * 1. 可以产生action消息
 */
class ActionComponent extends Component{
    constructor(name){
        super(name || 'action')
    }
    /**
     *
     * @param obj
     */
    install(obj){
        if(obj.actionHwnd && obj.createAction)return;
        obj.actionHwnd = new ActionPromise(obj);
        obj.createAction = (msg)=>{
            return obj.actionHwnd.send(msg)
        }
    }
}


/**
 * 位移组件
 *
 * 1. 有移动组件的一定有x/y坐标数据，但反过来不然
 * 2. 移动组件移附的坐标系是地图坐标
 *
 */
class TransformComponent extends ActionComponent{
    constructor() {
        super('transform');
    }
    install(obj){
        super.install(obj);
        obj.transform = this.transform;
        if(obj.x==null || obj.y==null){
            obj.x = 0;
            obj.y = 0;
        }
    }
    uninstall(obj){
        super.uninstall(obj);
    }

    // 位置增量
    transform(dx, dy){
        this.x += dx;
        this.y += dy;
        if(this.refreshPosition)
            this.refreshPosition();
    }
    // 瞬移
    moveDirectly(x, y){
        if(x!=null)this.x = x;
        if(y!=null)this.y = y;
        this.refreshPosition();
    }
}


/**
 * 碰撞体组件 用于修饰具有碰撞功能的角色
 * @private
 */
class CollisionComponent extends ActionComponent{
    constructor(){
        super('collision')
    }

    /**
     *
     * @param { BaseActor } obj
     */
    install(obj){
        super.install(obj);
        obj.collision = this.collision;
    }
    /**
     *
     * @param { BaseActor } obj
     */
    uninstall(obj){
        obj.collision = null;
    }

    /**
     * 碰撞行为： 会产生collsion
     * 找到被碰撞的角色，然后产生碰撞消息
     * @param { left|right|down|up } direction
     */
    collision(direction){
        this.turn(direction);
        // 判断前方有无碰撞体
        let collisionObj = MapManager.getCollisionBlock(this.x, this.y, direction);
        // 有碰撞体 移动不会成功 只会转个向然后发碰撞消息
        if(collisionObj){
            // 碰撞体发出消息——不是自己发消息 因为自己没事件
            collisionObj.createAction('collision');
        }
        return this.actionHwnd;
    }

}


/**
 * 交互式组件
 * 如：点击、按键
 * 1. 点击： 如果实体有bounds 那么会根据bounds判断点击域
 * 2. 拖拽：点击的扩展
 * 3. 按键：本质是添加一个监听
 *
 * 具体的功能实现要由实体自己addAction(行为)决定，组件会通过 this.doAction('消息类型')来进行调用
 *
 */
class InteractiveComponent extends Component{
    constructor(props) {
        super(props);
    }
    install(obj){
        super.install(obj);
        let con = ControlManager.getCon('ui');
        con.addInteract(obj, this.name);
    }
    uninstall(obj){
        ControlManager.getCon('ui').removeInteract(obj, this.name);
    }
}

class ClickComponent extends InteractiveComponent{
    constructor(){
        super('tap');
    }
}

/**
 * 组件管理：
 * 1. 组件=插件
 * 2. 组件需要依附实体（Entity
 * 3. 组件集中式管理，依据命名
 */
export default new class ComponentManager{
    constructor(){
        this.compList = {};
        this.registerComponent('click', ClickComponent);
    }
    /**
     * 注册组件
     * @param { String }name
     * @param { Component } comp
     */
    registerComponent(name, comp){
        this.compList[name] = comp;
    }

    /**
     * 获取一个组件
     * @param name
     * @returns {*}
     */
    getComponent(name){
        return new this.compList[name]();
    }

    /**
     * 列出组件
     * @returns {string[]}
     */
    listCompnents(){
        return Object.keys(this.compList);
    }



}