import MessageManager from "../system/MessageManager.js"
import { Listener } from "../system/Base.js"
import MapManager from "../map/MapManager.js"
import { Cache } from "../utils/cache.js"
import { BaseEvent, ArriveEvent, CollisionEvent, DieEvent} from "./MapEvent.js";

/**
 * 事件管理器
 * 关于地图上一切影响角色行为的东西在此定义处理
 *
 *
 * # 事件与地形的关系：
 * 1. 包含事件的空块或可穿透地形，是一个触发点(trigger point)，当角色与其重合(@code: arrive)时触发。
 *
 * # 事件与block的关系：
 * 1. 包含事件的地图块(block)，是一个事件点(event point)，角色与之碰撞会触发。——如果有事件移动器，
 * 2. block要升级为角色，必须绑定一个事件——比如如果是移动图块但块本身不含事件，那么这个块只会临时升级为角色，然后回退为块。
 * 3. 当发生碰撞(@code: collision)或者检查(@code: check)时，包含事件的block被触发（相当于空格捡物品，当然前提是允许check
 *
 * # 事件与角色的关系：
 * 1. 角色可能包含事件，事件可能属于角色，碰撞块事件一定属于角色
 * 2. 具有事件的角色特性和blcok是一样的
 * 3. 可以通过事件唯一确定一个角色
 *
 * # 事件类型：
 * 1. 碰撞类事件，包括与块碰撞、角色碰撞(@code: collision) ！
 * 2. 到达地图点事件，(@code: arrive) ！
 * 3. 离开地图点事件，(@code: leave)！
 * 4. 战后事件：战后触发(@code: afterBattle)！
 * 5. 战前事件：战前触发(@code: beforeBattle)！
 * 6. 拾取后事件(@code: getItem)！
 * 7. 开门后事件(@code: afteropendoor)！
 * 8. 开门前事件(@code: beforeopendoor)！
 * 9. 自动事件(@code: auto)
 * 10. 楼层转换(@code: changeFloor)！(@code: firstArrive)(@code: eachArrive)(@code: firstLeave)(@code: eachLeave)
 * 11. 并行事件(@code: tick) —— 慎用
 * 12. 隔空触发事件(@code: trigger:XXX) —— 比如点击一个点 然后触发其某类型的事件
 *
 * # 消息机制：事件管理器接收消息，依据消息类别搜寻对应的事件，如果存在就返回事件，进行进一步的执行
 * # 同一时间，只能执行一条事件
 *
 * # 移动事件的实现
 * 1. 静态绑定：在游戏开始、或者到达地图时，把所有与位置相关的事件（地图事件）绑定到该位置的角色，如果不存在块，创建空角色用以触发
 * ——静态绑定的问题是，对存档由一定开销，因为很难区分哪些事件是移动过的，每次存档都需要遍历所有角色。并且setBlock时
 * 2. 动态绑定：游戏开始时事件与设置点绑定，只有移动相关的事件触发时，才将事件绑定到角色。
 * ——动态绑定的问题是，无法确定什么时候会移动事件，而且涉及移动点较多的时候，管理会很混乱，容易产生bug。
 * 3. 动静结合：在开始时只对定义在不可穿透block的点进行绑定，将其升级为角色。可穿透的事件只能被事件移动，避免了管理混乱，只需要处理事件移动即可。
 *
 *
 * 消息机制的一个好处是可以溯源，谁发的消息就处理谁，比如战后消息就是由战斗的怪物发出的，事件管理收到之后就查询该怪物是否有订阅消息的事件，有就执行
 */

/**
 * 事件差分缓存
 * 1. 初始化一份事件原型，可供查询（只读）
 * 2. 如果要修改，复制原型到运存，进存档
 */
class EventCache extends Cache{
    constructor(){
        super();
    }

    /**
     * 存入新的数据，需要把之前的还原，并且新数据需要立即激活
     */

    /**
     * 事件只需要存储激活状态的
     *
     * load
     */

    /**
     * 访问一个键对应的数据，注意，不要在此修改，否则会出错
     * todo: 对srcData的写权限控制？
     * @param key   保证只读！！
     * @returns {*}
     *
     * read
     */

    /**
     * 修改值 这会导致激活
     * @param key
     * @param config
     * @returns {*}
     */
    write(key, config){
        if(key in this.srcData || key.indexOf(':')==1){
            super.write(key);
            let data = this.activeData[key] || {};
            for(let k in config){
                data[k] = config[k];
            }
            this.activeData[key] = data;// 如果是不存在原型的数据需要强行写入
        }
    }

    /**
     * 弹出一个键
     */
    pop(key){
        let ret = this.activeData[key];
        this.clear(key);
        return ret;
    }

}

export default new class EventManager extends Listener {
    constructor(){
        super();

        /**
         * 事件id到信息的映射
         * eventInfo是事件当前状态
         * 1. 当前位置x,y,floorId
         * 2. 使能信息，disble？
         * 3. 独立开关
         * 事件触发时会判定位置有没有被修改 如果被修改 就不会触发
         *
         * 不同索引前缀的意义：
         * 1. m: 表示后者非索引，而是当前的事件位置，用于通过位置快速索引事件
         * 2. d: 表示事件已被失能，并且带有图块，需要将其图块存储，以备恢复——是否考虑用地图存储？
         * 
         * 需要初始化
         */
        this.eventInfo = new EventCache();

        /**
         * 名字到事件id的映射 如果包含楼层 为：MT0@name
         * @type {{}}
         */
        this.nameMap = {};

        let events = {
            'arrive': new ArriveEvent('arrive'),
            'collision': new CollisionEvent('collision'),
            'die': new DieEvent('die'),
        };
        this.events = events;
        /**
         * 角色位置 - 事件id
         */
        this.actors = {};
        /**
         * 接收消息
         * 如果是来自勇者的行为：执行事件
         * 如果是来自角色的行为：设置角色事件
         */
        let fn = function(type, obj, callback){
            let evt = events[type];
            if(evt){
                let actions = evt.getActions(obj);
                if(actions){
                    return evt.trigger(actions, callback);
                }
            }
            return true;
        };
        for(let type in events){
            this.on(type, (obj, callback)=>{fn(type, obj, callback)});
        }
        // 这是给外挂用的注册事件的方法
        this.registerEvent = (code, config)=>{
            this.events[code] = new BaseEvent(code, config);
        };
        MessageManager.registerConsumer('action', this);// 订阅行为消息
    }

    /**
     * 初始化内容：所有的事件状态——
     * 1. enable 是否显示事件
     * 2. name 地图名字
     * 3. 开关信息
     * 4. nopass 通行性
     *
     * @private
     */
    _init(){
        let info = {};
        for(let f in core.floors){
            const evts = core.floors[f].events;
            for(let loc in evts){
                let evt = evts[loc];
                if(!evt)continue;
                let code = f+'@'+loc; //事件代码uid： 楼层+位置
                if(evt.name){
                    this.nameMap[f+'@'+evt.name] = f+'@'+loc;
                }
                let pos = loc.split(',');
                let tmp = {};
                Object.defineProperties(tmp,{
                    x: {
                        value: ~~pos[0],
                        writable: false,
                        enumerable: true,
                    },
                    y:{
                        value: ~~pos[1],
                        writable: false,
                        enumerable: true,
                    },
                    floorId:{
                        value: f+'',
                        writable: false,
                        enumerable: true,
                    },
                    noPass: {
                        value: evt.noPass || undefined,
                        writable: false,
                        enumerable: true,
                    },
                    displayDamage: {
                        value: evt.displayDamage || undefined,
                        writable: false,
                        enumerable: true,
                    },
                    enable: {
                        value: evt.enable == null ? true:evt.enable,
                        writable: false,
                        enumerable: true,
                    },}
                );
                info[code] = tmp;
            }
        }
        this.eventInfo.init(info);
    }

    /**
     * 通过事件代码来找到角色
     */
    getActor(obj){
        let code = this.getEventCode(obj);
        return this.actors[code];
    }
    removeActor(code){
        delete this.actors[code];
    }

    /**
     * 设置一个角色的事件
     * 
     * 只有aciton类型的事件才会设置 因为触发器、脚本 都不会涉及到移动
     * 
     * 读档后，移动过的事件和角色要重新绑定，事件需要根据与角色位置重合的事件来分配
     * 
     * @param actor
     */
    setEventToActor(actor){
        if(actor.eventId)return;//已经被设置
        if(this.isEventExist(actor)){
            let code = this.getEventCode(actor);//原始代码
            code = (this.eventInfo.read('m:'+code)||{}).eventId || code;// 如果包含于移动信息 则优先移动信息
            actor.eventId = code;
            this.actors[code] = actor;// TODO 何时销毁？
        }
    };

    /**
     * 激活一个事件
     */
    activeEvent(code){
        if(this.eventInfo.exist(code))
            this.eventInfo.write(code, {enable: true});
    }

    /**
     * 失能一个事件
     */
    disableEvent(code){
        if(this.eventInfo.exist(code))
            this.eventInfo.write(code, {enable: false});
    }

    /**
     * 找到一个事件代码
     */
    findEventCode(floorId, x, y){
        let code = floorId+'@'+x+','+y;
        let info = this.getEventInfo(code);
        // 没有进行位移：
        if(info && info.x === x && info.y === y && info.floorId === floorId){
            return code;
        }
        return this.eventInfo.find(e=>{
            return e.floorId === floorId && e.x === x && e.y === y;
        })
    }

    /**
     * 激活一个角色——有事件的角色在死后是被事件管理器回收的
     * @param code
     */
    activeActor(obj){
        let code = this.getEventCode(obj);
        let actor = this.eventInfo.pop('d:'+code);
        return actor;
    }

    /**
     * 获取一个地图事件
     * @param type 事件类型
     * @param code 事件ID
     * @returns {*}
     */
    getMapEvent(type, code){
        let fc = code.split('@');
        let evt = ((core.floors[fc[0]]||{})[type]||{})[fc[1]];
        if(evt){
            if(evt instanceof Array)return evt;
            return evt.data;//TODO 考虑事件的名称
        }
    };
    /**
     * 移动角色的事件 
     */
    moveEventOfActor(actor){
        if(!actor.eventId)return;
        let last = this.eventInfo.read(actor.eventId); // 获取之前的位置信息
        this.eventInfo.pop('m:'+this.getEventCode(last)); //删除上一次的位置信息
        
        // 更新移动信息
        this.eventInfo.write('m:'+this.getEventCode({x : actor.x, y: actor.y}), {eventId: actor.eventId});
        this.eventInfo.write(actor.eventId, {x : actor.x, y: actor.y});
    }
    /**
     * 判断某个点是否存在事件 或者是否存在某种类型的事件
     * 这个事件类型仅限actions除非特地指定了类型
     */
    isEventExist(actor, type){
        type = type || 'actions';
        if(type=='actions'){
            let code = this.getEventCode(actor);
            return this.eventInfo.exist(code) || this.eventInfo.exist('m:'+code);
        }
        for(let t in this.events){
            let evt = this.events[t].getActions(actor);
            if(evt && evt.type==(type || 'actions')){
                return true;
            }
        }
        return false;
    }
    /**
     * 通过角色获取地图事件的代码，即唯一标识符 —— 注意，战后事件、拾取后事件……公用同一个代码，可以将其理解为带触发的事件页
     * 角色名也可以用这个代替
     * 也可生成一个位置对象的事件代码
     * ——这个事件可能是不存在的
     */
    getEventCode(obj){
        if(typeof obj == 'string'){//通过事件名获取
            if(obj.indexOf('@')<0){//已经标记了地图不需要添加
                obj = MapManager.floorId + '@' + obj;
            }
            return this.nameMap[obj] || obj;
        }
        else if(!obj.eventId || typeof obj.eventId != 'string')
            return (obj.floorId || MapManager.floorId) + '@' + obj.x + ',' + obj.y;
        return obj.eventId;
    }
    /**
     * 获取事件的信息
     */
    getEventInfo(obj){
        return this.eventInfo.read(this.getEventCode(obj)) || obj;
    }

    /**
     *
     */
    getEventInfoOfActor(actor){
        if(actor.eventId){
           return this.eventInfo.read(actor.eventId);
        }
    }

    /**
     * 事件是否处于激活状态——即可以修改的状态
     * @param code
     * @returns {*}
     */
    isEventActive(code){
        return this.eventInfo.activeList[code];
    }


    /**
     * 存储
     * @param tosave
     */
    save(tosave){
        let tmp = {};
        this.eventInfo.load(tmp);
        tosave.eventInfo = tmp;
    }

    /**
     * 读取
     * @param toload
     */
    load(toload){
        this.eventInfo.save(toload.eventInfo);
    }
}();