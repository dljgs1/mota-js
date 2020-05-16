import MessageManager from "../system/MessageManager.js"
import { Listener } from "../system/Base.js"
import { MapStack } from "../utils/data.js"
import { Archive, MapCache } from "../utils/cache.js";
import SceneManager from "../scene/SceneManager.js";
import EventManager from "../event/EventManager.js";

// import EventManager from "./EventManager";


/**
 * 缓存逻辑：（包装原有的core.status.map）
 * save：地图数据从存档或者剧本中加载到缓存
 * load：从缓存中读取地图数据
 * compress： 压缩，
 * decompress：
 *
 * 存档逻辑：
 * 1. 存储时，只对变脏的部分进行压缩，别的直接存
 * 2. 读取时，只对目标进行解压，别的都处于压缩状态，等到
 *
 * TODO 1 : 对diff地图进行直接修改访问 无需加压解压——diff信息已经包括了全部信息，没有必要反复申请block
 * TODO 2 : 地图管理控制地图场景刷新——只对部分改变的部分进行刷新 —— 需要干掉core.status.map
 * 问题1： 浏览地图、显伤
 * 问题2： blocks何时建立？
 *
 */

/**
 * 地图压缩包—— 初始全为数字地图
 *
 * —— 打算改造 不再直接全部转blocks
 * 1. 所有blcok相关的信息（id-info），自行到相关机构去问，block自己只知道自己的id和位置
 * 2. block的动态信息由相关部门处理：坐标：地图管理、事件状态：事件管理
 * 3. 只有当前地图存储block，其他地图都是数字，显伤也改变实现方式
 *  ——1. 在初始化绘制的时候就确定并附在block的exSprite上
 *  ——2. 绘制事件层也可以通过map进行，此时附着在临时的dmg层上，用于thumbnail
 */
class MapArchive extends Archive{
    constructor() {
        super('maps');
    }
    /**
     * blocks转map —— 不用从blocks转，而是使用已有的cache缓存
     * @param floorId
     * @param map
     * @returns {*}
     */
    compress(floorId, map){
        // return core.maps.compressMap(core.maps._getMapArrayFromBlocks(map.blocks, map.width, map.height, true), floorId);
        return core.clone(MapManager.cache.getFloor(floorId));
    }
    /**
     * map转blocks，需要读取剧本
     * @param floorId
     * @param map
     */
    decompress(floorId, map){
        return core.maps.loadFloor(floorId, core.clone(MapManager.cache.getFloor(floorId)));
    }
}


/**
 * 地图管理，主要对地形、通行性、图块坐标、显示范围(core.bigMap)等管理
 * 其实是套了core.maps的壳
 *
 * 地图本身是不存状态的 这是游戏加载后就保持静态
 *
 * 带角色： true
 *
 * setBlock本质改变为——更换某个点角色的data，等于换皮，如果不存在，新创角色
 *
 */
export default new class MapManager extends Listener {
    constructor() {
        super();
        const self = this;
        /**
         * 地图集: 包含对块访问（blocks）
         * @type {MapArchive}
         */
        this.archive = new MapArchive();
        /**
         * 缓存: 数字地图
         * @type {MapCache}
         */
        this.cache = new MapCache();
        
        /**
         * 凡是修改过的地方记录到脏位置中 在刷新缓存时对这些位置更新
         */
        this.dirtyPos = {};

        /**
         * 当前地图的事件块索引 block作为角色的data
         * @type { MapStack }
         */
        this.actors = new MapStack();

        // 如何解决移动异步导致的地图修改不一致问题？——离开时标注 到达时写-1  换楼层、存档时统一写
        // bug: 移动如果异步 此时读档 即可导致到达的角色地图重复 ——如何解决？——读档时终止一切异步事件
        
        // 移动前：原地标脏 记录坐标
        this.on('leave', (obj, callback)=>{
            if(obj.isHero)return callback();
            obj.lastInfo = {x: obj.x, y:obj.y};
            this.dirtyPos[obj.x+','+obj.y] = obj.lastInfo;
            callback();
        });

        // 移动后：实际移动角色
        this.on('arrive', (obj, callback)=>{
            if(obj.isHero)return callback();
            if(obj.lastInfo){
                this.actors.move(obj, obj.lastInfo);
                this.dirtyPos[obj.x+','+obj.y] = {x:obj.x, y:obj.y};
                //this.cache.write(this.floorId, obj.lastInfo.x, obj.lastInfo.y, -1);
                delete obj.lastInfo;
            }else
                this.actors.push(obj);
            callback();
        });
        this.on('die', (obj, callback)=>{
            if(obj.isHero)return callback();
            obj.data.disable = true; // 如果有事件 只标记disable 因为还可能活过来
            if(!obj.eventId){
                this.actors.splice(obj);
                this.dirtyPos[obj.x+','+obj.y] = {x:obj.x, y:obj.y};
                // let idx = core.status.thisMap.blocks.indexOf(obj.data);
                // if(idx>=0) core.status.thisMap.blocks.splice(idx, 1);
            }else{
                obj.hide();// 隐藏就行 事件会处理好的
            }
            callback();
        });
        MessageManager.registerConsumer('action', this);
    }

    _init(){
        this.generateStatusMaps();
        // this.archive.init(core.initStatus.maps);
        let mapData = {};
        for(let f in core.floors){
            mapData[f] = core.floors[f].map;
        }
        this.cache.init(mapData);
    }

    /**
     *  代替原core.status.maps 但不建议直接使用 而是：
     *  MapManager.getMapArray(floorId)
     *  MapManager.getMap(floorId)
     *  ...
     */

    // 用于core.status.maps的访问控制 —— 后期考虑拆除
    generateStatusMaps(){
        if(this.statusMapWrap)return this.statusMapWrap;
        let obj = {};
        const archive = this.archive;
        for(let f in core.floors){// floors必须一开始全部加载
            Object.defineProperty(obj, f, {
                get:()=>{
                    return archive.read(f);
                },
                set:(v)=>{
                    archive.save(f, v);
                },
            })
        }
        this.statusMapWrap = obj;
        return obj;
    }

    /**
     * 计算寻路
     * @param startX
     * @param startY
     * @param destX
     * @param destY
     */
    automaticRoute(startX, startY, destX, destY){
        if (destX == startX && destY == startY) return [];
        // BFS找寻最短路径
        var route = this._automaticRoute_bfs(startX, startY, destX, destY);
        if (route[destX+","+destY] == null) return [];
        // 路径数组转换
        var ans = [], nowX = destX, nowY = destY;
        while (nowX != startX || nowY != startY) {
            var dir = route[nowX + "," + nowY];
            ans.push({'direction': dir, 'x': nowX, 'y': nowY});
            nowX -= core.utils.scan[dir].x;
            nowY -= core.utils.scan[dir].y;
        }
        ans.reverse();
        return ans;
    }

    _automaticRoute_bfs(startX, startY, destX, destY) {
        var route = {}, canMoveArray = this.moveArr;
        // 使用优先队列
        var queue = new PriorityQueue({comparator: function (a,b) { return a.depth - b.depth; }});
        route[startX + "," + startY] = '';
        queue.queue({depth: 0, x: startX, y: startY});
        while (queue.length!=0) {
            var curr = queue.dequeue(), deep = curr.depth, nowX = curr.x, nowY = curr.y;
            for (var direction in core.utils.scan) {
                if (!core.inArray(canMoveArray[nowX][nowY], direction)) continue;
                var nx = nowX + core.utils.scan[direction].x;
                var ny = nowY + core.utils.scan[direction].y;
                if (nx<0 || nx>=core.bigmap.width || ny<0 || ny>=core.bigmap.height || route[nx+","+ny] != null) continue;
                // 重点
                if (nx == destX && ny == destY) {
                    route[nx+","+ny] = direction;
                    break;
                }
                // 不可通行
                if (this.noPass(nx, ny)) continue;
                route[nx+","+ny] = direction;
                queue.queue({depth: deep + this._automaticRoute_deepAdd(nx, ny), x: nx, y: ny});
            }
            if (route[destX+","+destY] != null) break;
        }
        return route;
    };
    // 绕路判定：
    _automaticRoute_deepAdd(x, y) {
        // 判定每个可通行点的损耗值，越高越应该绕路
        var deepAdd = 1;
        var block = this.getBlock(x,y);
        if (block != null){
            var id = block.event.id;
            // 绕过亮灯
            if (id == "light") deepAdd += 100;
            // 绕过路障
            if (id.endsWith("Net")) deepAdd += 100;
            // 绕过血瓶
            if (!core.flags.potionWhileRouting && id.endsWith("Potion")) deepAdd += 100;
            // 绕过传送点
            if (block.event.trigger == 'changeFloor') deepAdd+=10;
        }
        // 绕过存在伤害的地方
        deepAdd += (core.status.checkBlock.damage[x+","+y]||0) * 100;
        // 绕过捕捉
        if (core.status.checkBlock.ambush[x+","+y]) deepAdd += 1000;
        return deepAdd;
    }

    getMap(floorId){
        return this.cache.read(floorId);
    }

    /**
     * 更新地图缓存 用于将延迟写入的信息同步
     */
    refreshMapCache(){
        // 前处理：对象销毁 把blocks归还
        for(let idx in this.dirtyPos){
            let p = this.dirtyPos[idx];
            let actor = this.actors.top(p);
            if(actor && actor.id != 0){
                this.cache.write(this.floorId, p.x, p.y, actor.data.id);
            }else {
                this.cache.write(this.floorId, p.x, p.y, -1);
            }
        }
        this.dirtyPos = {};
    }
    /**
     * 清空地图缓存
     */
    clearMapCache(){
        this.dirtyPos = {};
    }

    /**
     * 在转换楼层之后会自动调用此函数 TODO 用消息机制实现
     */
    onChangeFloor(floorId){
        this.refreshMapCache();
        core.bigmap.width = core.floors[floorId].width;
        core.bigmap.height = core.floors[floorId].height;
        SceneManager.setMapViewBounds(
            core.__PIXELS__>>1,
            core.__PIXELS__>>1,
            core.bigmap.width*core.__BLOCK_SIZE__ - (core.__PIXELS__>>1),
            core.bigmap.height*core.__BLOCK_SIZE__ - (core.__PIXELS__>>1),
        );
        core.status.floorId = floorId;
        // core.status.maps[floorId] = this.cache.read(floorId);
        core.status.thisMap = core.status.maps[floorId];
        let map = core.status.thisMap;//this.cache.read(floorId);
        
        // 只有跨层移动才会场景重绘 否则相当于瞬移
        // 读档时由load处理差分信息
        const scene = SceneManager.mapScene;
        core.updateStatusBar();
        if(floorId != this.floorId){
            scene.drawMap(floorId);
            this.floorId = floorId;
            this.moveArr = core.generateMovableArray(floorId);
        }else{
            scene.clearMap('dmg');
            scene.drawEventLayer(map.blocks, map);
            scene.updateDamageInfo(floorId);
            scene.drawHero();
        }
        // 添加角色
        this.actors.clear();//提供对block的坐标查询 避免大量使用core.getBlock(x, y)
        for(let i in map.blocks){
            this.addBlock(map.blocks[i], true);
        }
        ActorManager.getHero().refreshPosition();
    }


    
    /**
     * 更新地图的绘制信息
     * @param { Array } srcmap 原地图 core.floors[xxx].map
     * @param { Array } map
     * @param  { MapStack } blockArr
     */
    updateMap(srcmap) {
        const scene = SceneManager.mapScene;
        // 获取差分的差分
        /**
         *  1. 只要前一次存在 且和当前不一致的 一律清空重置 如果当前存在sprite直接换皮
         */
        for(let y in srcmap){
            for(let x in srcmap[y]){
                
            }
        }
    }


    /**
     * 地形上能否移动？
     */
    canMove(x, y, direction){
        return core.inArray(this.moveArr[x][y], direction);
    }

    /**
     * 地形上是否有阻挡块 如果有多层堆叠 只要有一个noPass就noPass
     */
    noPass(x, y){
        let idx = x+','+y;
        if(this.actors.find(idx, a=>{
            return !a.data.disable && a.data.event.noPass
        }))return true;
        return false;
    }

    /**
     * 在当前地图上添加一个块——添加时会升级为Actor，具有堆叠性质——先到后占
     */
    addBlock(block, noMap){
        let actor = ActorManager.createActor(block);
        EventManager.setEventToActor(actor);
        let info = EventManager.getEventInfoOfActor(actor);
        // 含有事件 要根据信息判断是否隐藏其sprite
        if(info && !info.enable){
            actor.hide();
        }
        this.actors.push(actor);
        // SceneManager.mapScene.drawBlock(block);
        if(!noMap)core.status.thisMap.blocks.push(block);
        actor.refreshPriority();
    }

    /**
     * 获取一个块 当前地图可改 如果获取其他地图 则只读 修改不会生效
     * 不建议大量跨层调用此方法
     */
    getBlock(x, y, floorId){
        if(floorId && floorId !== this.floorId){//
            let id = this.cache.read(floorId, x, y);
            if(id){
                return core.initBlock(id, x, y, true);
            }
        }
        return (this.getActor(x, y)||{}).data;
    }

    /**
     * 设置一个块
     * @param id
     * @param x
     * @param y
     * @param floorId
     * @returns {*|void}
     */
    setBlock(id, x, y, floorId){
        floorId = floorId || this.floorId;
        this.cache.write(floorId, x, y, id);
        if(floorId === this.floorId){
            let block = core.initBlock(x,y,id,true);
            let actor = this.actors.top(x, y);
            if(actor){
                actor.data = block;
            }else{
                SceneManager.mapScene.drawBlock(block);
                this.addBlock(block);
            }
        }
    }

    /**
     * 移除一个块 作为角色移除 作为块禁用
     * ————如果跨楼层隐藏了事件 如何让事件管理器将其唤醒？
     * ————如果跨楼层的事件已经移动 如何获取？ ： 可以实现 但是需要遍历 不建议大量使用
     */
    removeBlock(x, y, floorId){
        floorId = floorId || this.floorId;
        this.cache.write(floorId, x, y, -1);
        if(floorId==this.floorId){
            let actor = this.actors.pop(x+','+y);
            if(actor){
                actor.die(); // 会通过死亡消息告诉事件处理器删除事件
            }
        }else{ // 可能会比较慢 不建议大量使用
            let code = EventManager.findEventCode(floorId, x, y);
            if(code)EventManager.disableEvent(code);
        }
    }
    /**
     * 显示一个块 是否有必要做born消息？
     */
    showBlock(x, y, floorId){
        let actor = EventManager.activeActor(
            {x:x, y:y, floorId:floorId||this.floorId}
        );
        if(actor){
            EventManager.activeEvent(actor.eventId);
            this.actors.push(actor);
        }
        if(!actor)return; // 没有这个事件
        let block = core.getBlock(x, y, floorId, true);
        if(!block || !block.block.disable)return;
        delete block.block.disable;
        block.floorId = floorId || this.floorId;
        if(!actor)return;
        EventManager.activeEvent(actor.eventId);
        if(floorId && floorId != this.floorId)return;
        this.actors.push(actor);
    }


    /**
     * 根据位置获取当前地图某位置的一个角色 如果位置重叠 则返回队列前的第一个
     */
    getActor(x, y){
        return this.actors.top(x+','+y);
    }

    /**
     * 判断一个块是否为碰撞块 —— 可以考虑复写 来实现一些特殊判定
     */
    isCollisionBlock(block){
        return block && block.event.noPass;
    }
    /**
     * 获取一个碰撞块 仅限当前地图
     */
    getCollisionBlock (x, y, direction){
        var idx;
        if(direction){
            idx = (x + core.utils.scan[direction].x) +','+ (y + core.utils.scan[direction].y);
        }else{
            idx = x+','+y;
        }
        let block = this.actors.top(idx);
        if(block && this.isCollisionBlock(block.data)){
            return block;
        }
    }

    /**
     * 地图刷新
     */
    update(){
        this.actors.forEach(actor=>{actor.update()})
    }

    /**
     * 存储地图数据
     * @param tosave 需要存储的槽
     */
    save(tosave){
        this.refreshMapCache();
        let tmp = {};
        this.cache.load(tmp);
        tosave.maps = tmp;
        tosave.floorId = this.floorId;
    }

    /**
     * 读取地图数据
     * @param toload
     */
    load(toload){
        // 1. 停止所有异步角色的行动—— todo: 异步动画也一样
        this.actors.forEach(a=>{a.stopToDo(null)});
        
        if(toload.floorId === this.floorId){
            // this.updateMap(core.floors[this.floorId].map, this.cache.getFloor(this.floorId), toload.maps);// TODO 根据差分的差分更新地图 无需重绘
        }
        this.clearMapCache();
        this.cache.save(toload.maps);
        this.archive.clear();
        // this.floorId = toload.floorId; // 此时不改写楼层 onChangeFloor时会改写
    }
}();
