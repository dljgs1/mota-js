import AnimationManager from "../assets/AnimationManager.js"
import { Listener, Entity } from "../system/Base.js"
import SceneManager from "../scene/SceneManager.js";
import MessageManager from "../system/MessageManager.js"
import { MapStack } from "../utils/data.js";
import { ActionPromise} from "../utils/promise.js";

/*
    角色（类hero）管理

    角色定义：
        理论上地图上能跑能动的有属性的都是角色，但图块和npc和hero显然不属于同一种
        需要对其进行什么样的管理？
    角色有如下几个特征：
    0. 是地图场景(mapScene)中的一个对象
        超出场景外的，不作考虑
    1. 动态属性
        角色是有属性的，并且属性值是可能动态变化的，这点和怪物不同，怪物一般属性不变，图块更不用说
        ——因此当怪物和角色行为相似时（比如到处乱跑——x,y值），应将其升级到【角色】
    2. 活跃度
        角色是活跃的，因此在地图之中的优先级会发生变化，需要通过调整渲染顺序使其显示正确（sorted=true）
    3. 有自由度，但同时有法则约束的
        角色有一些自己的方法，可以修改自己的属性，但这些方法的使用是受到法则约束的，要么是方法序列固定，要么是方法需要触发

    4. （可选）可控的——这一点仅限与hero相关的
    ——综上所述，event层的所有块都有成为actor的潜质，但是全部转化为actor没有必要。

    对象层级:
    sprite -> block -> actor -> hero/AI
    仅绘制的贴图 -> 有真实位置、贴图信息的块 -> 有属性有方法的角色 -> 包含控制器的主角 或者包含自我控制逻辑的AI

    录像：
        录像是hero唯一的情况才能用，即不能有AI，世界随着自己的控制进行流动，这显然不符合逻辑。如何在录像中加入世界线的变化？
        1. 录像本身是控制流的记录，那么只需要把别的角色控制自己的记录也一并进行播放即可。
        2. 解决控制冲突：比如A和B都要往同一个方向走，必然存在一个先后，让后者不能走。即控制是串行的。
        3. 伪控制：AI看上去在自己行动，其实将其夹杂在主角的控制逻辑中，
        4. 消除问题：录像播放时，不播放有自我控制的角色，或者将其交互时的位置锁死（不好使）

    法则：
        1. 基本法则：方格（二维坐标系），
        2. 延伸法则：通行性：由图块属性约束
        3. 次生法则：战斗、宝物、开门……可重定义


*/


class BaseActor extends Entity{
    constructor(name, sprite, data){
        super();
        this.name = name;
        this.sprite = sprite || data.sprite;
        this.data = data;
        this.animate = {
            'walk': AnimationManager.getAnimate('walk'),// 所有角色都有行走动画?
        };
        if(sprite)sprite.anchor.set(0.5, 1);

        const self = this;
        /**
         * 行为承诺 ： 每一次行为必定产生消息
         * 1. 一个行为跟着另一个行为
         * 2. 行为产生消息，函数除外
         */
        this.actionHwnd = new ActionPromise(this);
        this.createAction = (msg)=>{
            return this.actionHwnd.send(msg)
        }
    }
    // ----- 基本属性 -----
    // 坐标
    get x(){
        return this.data.x;
    }
    set x(v){
        this.data.x = v;
    }
    get y(){
        return this.data.y;
    }
    set y(v){
        this.data.y = v;
    }
    get direction(){
        return this.data.direction;
    }
    set direction(v){
        this.data.direction = v;
    }
    // 移动速度 ms/格
    set moveSpeed(s){
        this.data.moveSpeed = s;
    }
    get moveSpeed(){
        return this.data.moveSpeed || 100;
    }
    // 装饰用的sprite
    set exSprite(s){
        return null;
    }
    get exSprite(){
        return this.data.exSprite || {};
    }
    setAnimate(name, animate) {
        this.animate[name] = animate;
    }
    // 位置增量
    transform(dx, dy){
        this.x += dx;
        this.y += dy;
        this.refreshPosition();
    }

    /**
     * 刷新位置 在地图坐标变动后调用
     */
    refreshPosition(){
        this.sprite.x = ~~((this.x + 0.5) * core.__BLOCK_SIZE__);
        this.sprite.y = ~~((this.y + 1) * core.__BLOCK_SIZE__);
        this.refreshPriority();
    }
    hide(animate){
        if(animate==null){
            this.sprite.alpha = 0;
        }else{
            return animate.get(this.sprite);
        }
    }
    show(animate){
        if(animate==null){
            this.sprite.alpha = 1;
        }else{
            return animate.get(this.sprite);
        }
    }
    /**
     * 刷新角色优先级
     * todo: 消除地板的优先级
     * @param addValue
     */
    refreshPriority(){
        if(this.sprite)
            this.sprite.zIndex = this.sprite.y * 500 + this.sprite.width + (this.exPriority || 0);
    }

    canMoveDirectly(x, y){
        return core.canMoveDirectly(x, y)>=0;
    }
    // 瞬移
    moveDirectly(x, y){
        if(x!=null)this.x = x;
        if(y!=null)this.y = y;
        this.refreshPosition();
    }
    /**
     * 能否移动的绝对判断方法，但对于事件触碰者来说 这种判法不适用
     * @param { left|right|down|up } direction 
     */
    canmove(direction){
        if(this.passAll)return true; // 开启穿透无视碰撞
        if(!core.status.floorId)return true;
        const dx = core.utils.scan[direction].x, dy = core.utils.scan[direction].y;
        return MapManager.canMove(this.x, this.y ,direction) && !MapManager.noPass(this.x+dx, this.y+dy);
        // TODO: 更通用的算法
    }
    /**
     * 强制移动，如果不填方向，依据设置的路线移动
     * @param { left|right|down|up } direction
     * @param { function } callback X 弃用 改为promise
     * @return { ActionPromise }
     */
    move(direction, callback){
        if(!direction)debugger;//单一原则 ： 走路就是走路 不要套自动寻路
        if(callback)debugger;
        this.turn(direction);
        let promise = this.actionHwnd;
        const dx = core.utils.scan[direction].x, dy = core.utils.scan[direction].y;
        return promise
            .send('leave')
            .then(success=>{
                if(this.animate.walk){
                    this.isMoving = true;
                    this.animate.walk.get(this.sprite, {direction: direction, time: this.moveSpeed});
                    for(let i in this.exSprite){
                        this.animate.walk.get(this.exSprite[i]);
                    }
                    this.animate.walk
                        .onChange(()=>{this.refreshPriority()})
                        .call(success);
                }else success()
            })
            .then(success=>{
                this.transform(dx, dy);
                this.isMoving = false;
                success();
            })
            .send('arrive');
    }

    // 停止一切行动
    waitstop(callback){
        this.autoRoute = null;
        this.stopcall = callback;
    }

    /**
     * 设置移动的的路径 如果已有路径 就添加到后面
     * @param {Array} steps
     * @param {function} callback 走完之后的回调
     * @param {boolean} notnow 仅设置 不立即走
     */
    setAutoRoute(steps){
        steps = steps.map((s)=>{if(typeof s == 'string'){return {direction: s}}return s;});
        if(this.autoRoute){
            this.autoRoute = this.autoRoute.concat(steps);
        }
        else this.autoRoute =steps;
        return this.actionHwnd;
    }
    /**
     * 设置移动的的路径 如果已有路径 就添加到后面
     * @param {Array} steps
     * @param {function} callback 走完之后的回调
     * @param {boolean} notnow 仅设置 不立即走
     */
    clearAutoRoute(){
        this.autoRoute = null;
    }

    /**
     * 计算自动寻路的路径 会将结果存起来
     * @param {number} x 
     * @param {number} y
     */
    calRoute(x, y){
        let route = MapManager.automaticRoute(this.x, this.y, x, y);
        if(route.length==0)return null;
        this.autoRoute = route;
        return route;
    }

    /**
     * 开始自动寻路
     * @returns { Promise }
     */
    autoMove(route){
        route = route || this.autoRoute || [];
        let promise = this.actionHwnd;
        for(let i in route){
            let direction = route[i].direction || route[i];
            this.move(direction);
        }
        promise.then(success=>{this.clearAutoRoute();success()});
        return this.actionHwnd;
    }
    /**
     * 转向
     * @param { left|right|down|up } direction 
     */
    turn(direction){
        if(this.direction)this.direction = direction;
        if(this.sprite && this.sprite.patterns)this.sprite.pattern = direction;
        return this.actionHwnd;
    }

    /**
     * 是否接近一个点
     * @param x
     * @param y
     */
    isNear(x, y){
        const dx = x - this.x;
        const dy = y - this.y;
        if(dy===0) return dx===1 || dx===-1;
        if(dx===0) return dy===1 || dy===-1;
        return false;
    }
    /**
     * 尝试向一个方向碰撞
     * @param { left|right|down|up } direction 
     */
    collision(direction){
        return this.actionHwnd;
    }

    /**
     * 建议使用： 在下一次arrive消息产生后进行
     * @returns {ActionPromise|*|PromiseLike<T | never>|Promise<T | never>}
     */
    arriveToDo(action){
        return this.actionHwnd.clearTo('arrive')
            .then(action);
    }

    /**
     * 慎用警告：停下一切去做 会打断走路行为 也会使得arrive失效
     * @param action
     * @returns {ActionPromise|*|PromiseLike<T | never>|Promise<T | never>}
     */
    stopToDo(action){
        return this.actionHwnd
            .stop()
            .then((s,f)=>{
                this.isMoving = false;
                this.refreshPosition();
                if(action)action(s,f);
                else s();
            });
    }
    // 完成一个行为
    doAction(action){
        return this.actionHwnd.then(action);
    }
    // 绑定一个操作器
    bindController(controller){
    }
    /**
     * 产生一次行为，这种行为通常是由操作（control）产生的，事件行为不计入消息列表
     * @param { String } code 
     * @param { function } callback 
     */
    //createAction(code, callback){
    //}
    /////////// 以下内容基本对象没有 因为通常数据（坐标）通过保存到
    /**
     * 从地图中清除角色数据
     * 如果静默 不发出消息
     */
    die(silent){
        this.data.disable = true; // 第一时间禁用自己 防止异步出错
        let clear = ()=>{
            if(this.sprite.parent)
                this.sprite.parent.removeChild(this.sprite);
            for(let it in this.exSprite){
                if(this.exSprite[it].parent)
                    this.exSprite[it].parent.removeChild(this.exSprite[it]);
            }
            this.createAction('die'); // 死亡行为
        };
        if(this.animate.die){
            return this.animate.die
                .get(this.sprite)
                .call(clear);
        }else{
            clear();
        }
    }
    // 保存角色数据到存档 - 用name作为唯一标志符存入flag?
    save(){
    }
    // 从存档读取角色数据
    load(){
    }
}

// 勇者角色
class HeroActor extends BaseActor {
    constructor(name, sprite, data){
        super(name, sprite, data || core.clone(core.firstData.hero));
        super.moveDirectly();
        this.exPriority = 500;
        this.isHero = true;
        this.needUpdate = true;
        // 相机跟随动画：
        this.animate.camera = AnimationManager.getAnimate('easeMove');
    }
    // 勇者坐标：
    get x(){
        return StatusManager.hero.loc.x;
    }
    set x(v){
        StatusManager.hero.loc.x = v;
    }
    get y(){
        return StatusManager.hero.loc.y;
    }
    set y(v){
        StatusManager.hero.loc.y = v;
    }
    get direction(){
        return StatusManager.hero.loc.direction;
    }
    set direction(v){
        StatusManager.hero.loc.direction = v;
    }
    // ——历史遗留的lockControl 区分是否处于事件移动的依据——
    get lockControl(){
        return core.status.lockControl;
    }
    set lockControl(l){
        console.log('不要直接锁定角色！而是锁定控制器！');
        // core.status.lockControl = l;
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

    /**
     * 勇者在调用之后需要刷新相机位置
     */
    refreshPosition(){
        super.refreshPosition();
        if(core.bigmap.width>core.__SIZE__)
            // 大地图再调用刷新相机 否则抖屏…… 原因是脑袋出屏幕外 被错认为边界扩张……mask还不起作用
            SceneManager.relocateCamera('map',
                {x: this.sprite.x, y:this.sprite.y - (core.__BLOCK_SIZE__>>1), time:150},
                this.animate.camera);
    }
    /**
     * 勇者的移动行为会产生 leave、arrive
     * @param { left|right|down|up } direction 
     * @param { bool } animate 
     * @param { function } callback 
     */
    move(direction){
        if(this.lockControl){// 来自事件 不发送行为消息
            return super.move(direction);
        }else{
            return super.move(direction)
                .then(success=>{
                    core.control.moveOneStep(this.x, this.y);
                    success(); // TODO 录像的记录全部由控制器完成 其他地方不设录像
            });
        }
    }
    /**
     * 勇者判断能否瞬移到x,y时，如下两个特点：
     * 1. 要考虑目标点周围是否能移动
     * 2. 要考虑有事件时，退化为寻路 —— 由控制器来决定是否退化
     * @param { number } x 
     * @param { number } y 
     */
    canMoveDirectly(destX, destY){
        this.moveInfo = null;
        var dirs = [[destX,destY],[destX-1,destY,"right"],[destX,destY-1,"down"],[destX,destY+1,"up"],[destX+1,destY,"left"]];
        let canMoveDirectlyArray = core.maps.canMoveDirectlyArray(dirs);
        //TODO MapManager维护一个通行性团 判断能否瞬移直接判断两个点是否在同一个团 当地图变化时异步更新变化点的所在团
        let canMoveArray = MapManager.moveArr;
        for (let i = 0; i < dirs.length; ++i) {
            let d = dirs[i], dx = d[0], dy = d[1], dir = d[2];
            if (dx<0 || dx>=core.bigmap.width|| dy<0 || dy>=core.bigmap.height) continue;
            if (dir && !core.inArray(canMoveArray[dx][dy],dir)) continue;
            if (canMoveDirectlyArray[i]<0 || canMoveDirectlyArray[i]==null) continue;
            this.moveInfo = {x:dx, y:dy, direction: dir, ignoreSteps: canMoveDirectlyArray[i]};
            return true;
        }
        return false;
    }
    // 勇者的瞬移不是直接到目标地点，需要判断如果不能瞬移 判断周边空地
    moveDirectly(x, y){
        if(this.moveInfo){
            x = this.moveInfo.x;
            y = this.moveInfo.y;
            if(core.control.moveDirectly(x, y, this.moveInfo.ignoreSteps)){
                super.moveDirectly(x, y);
                if(this.moveInfo.direction){
                    if(this.canmove(this.moveInfo.direction))
                        this.move(this.moveInfo.direction);
                    else{
                        this.collision(this.moveInfo.direction);
                    }
                }
            }
        }

    }
}


/**
 * 角色管理统筹一切需要存储数据的地图角色
 * 1. 勇者
 * 2. 带存储数值的npc——如：带事件的角色改变坐标时、死亡时
 * 3. 
 *
 * 对于不需要存储的，托管给MapManager
 */
export default new class ActorManager extends Listener{
    constructor() {
        super();
        const self = this;
        
        /**
         * 所有的活跃actor，索引为完全位置信息 floorId@x,y 信息为 {eventId, blockId, disable}
         * 这个暂时不做 原因是事件信息和角色结合更为紧密，没有必要再做角色管理
         */
        this.actors = {};
        this._getIndex = function(obj){
            return (obj.floorId || MapManager.floorId)+'@'+obj.x+','+obj.y;
        };

        this.on("tick", event=>{
            for(let i in self.actors)self.actors[i].update(event);
        });
        MessageManager.registerConsumer('frame', this);
    }
    getActor (x, y, floorId){
        return this.actors[EventManager.getEventCode({x: x, y: y, floorId: floorId})];
    }

    createActor(data){
        var name = EventManager.getEventCode(data);
        var ret = new BaseActor(name, (data||{}).sprite, data);
        if(ret.needSave){
            this.actors[name] = ret;
        }
        return ret;
    }

    getHero(){
        if(!this.actors.hero){
            this.actors.hero = new HeroActor('hero',
                SpriteManager.getActorSprite('hero'),
                StatusManager.hero,
                );
            // 为勇者添加控制组件
            if(main.mode=='play'){
                this.actors.hero.addComponent(ControlManager.getCon('hero'));
            }
            // SceneManager.cameras.map.bindTransformObj(this.actors.hero.sprite);
        }
        return this.actors.hero;
    }

    /**
     * 地图的摄像机也是地图上的一个角色?
     */
    getCamera(){
    }

    /**
     * 停止所有系统角色的操作
     */
    stopActorsToDo(fn){
        let ct = Object.keys(this.actors).length;
        let call = success=>{
            ct -= 1;
            success();
            if(ct === 0)fn();
        }
        for(let k in this.actors){
            this.actors[k].stopToDo(call);
        }
    }

    isHero(obj){
        return this.getHero() === obj;
    }

    // todo : 需要保存关键角色的基本信息
    save(tosave){
    }
    load(data){
    }
    update(){
        this.actors.hero.update();
        // for(let i in this.actors){
        // }
    }

}();
