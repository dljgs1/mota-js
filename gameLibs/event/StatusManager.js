/**
 *  状态管理，包括勇士状态（hero）、 运行时变量（flags）
 *
 *  hero : 玩家状态，理想情况下每次状态变化时就会有记录
 *  flags : 游戏进程变量，额外的记录，不会每次变化都进存档 除非手动存
 *  maps : 地图，是最重的部分，理论上只需要存变化的地方，如增删移动，即只考虑角色（actors）
 *  events : 事件信息，主要是位置
 *
 * https://blog.csdn.net/qinyuanpei/article/details/47775979
 *
 *
 *
 * @type {StatusManager}
 */
import {Listener} from "../system/Base.js";
import MessageManager from "../system/MessageManager.js";

export default new class StatusManager extends Listener{
    constructor() {
        super();
        const self = this;
        let firstData = data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.firstData;
        // 初始数据不含flags、statistics
        const exclude = [];//'flags'
        let statistics = {};

        this.index = -1;//todo： 读取localforage 获取其长度
        let hero = {};
        /**
         * 对所有属性进行包装
         */
        for(let t in firstData.hero){
            if(exclude.indexOf(t)>=0)continue;
            Object.defineProperty(
                hero, t,
                {
                    get: ()=>{
                        return self.getHeroStatus(t);
                    },  
                    set: (v)=>{
                        // self.hero[t] = v;
                        self.setHeroStatus(t, v);
                    },
                    enumerable: true,
                }
            )
        }
        Object.defineProperty(hero, 'statistics', {
            get:()=>{
                return self._hero['statistics'];
            },
            set:(v)=>{
                self._hero['statistics'] = v;
            },
        });
        this.heroWrap = hero;

        // 真实hero数据
        this._hero = {};

        // 状态管理需要存储的东西
        this.saveInfo = {
            hero : this.hero,
            flags : this.flags,
        };
        this.tree = {};
        this.saveData = [];
        MessageManager.registerConsumer('update', this);
    }

    /**
     * 生成hero的数据转发 使得状态可以被监控
     */
    generateHeroWrap(){
        return this.heroWrap;
        if(this.heroWrap){
            return this.heroWrap;
        }
        let hero = {};
        const self = this;
        for(let f in this.hero){// floors必须一开始全部加载
            Object.defineProperty(hero, f, {
                get:()=>{
                    return self.hero;
                },
                set:(v)=>{
                    self.hero = v;
                },
            })
        }
        this.heroWrap = hero;
        return this.heroWrap;
    }

    /**
     * 注册状态变化监听
     * @param {*} type 
     * @param {*} fn 
     */
    onChange(type, fn){
        this.onList[type] = this.onList[type] || [];
        this.onList[type].push(fn);
    }

    /**
     * 重启游戏
     */
    resetGame(){

    }

    /**
     * todo: 状态更新? —— 在
     */
    updateStatusBar(){

    }

    
    /**
     * 捕获动态文本：
     * 1. obj包含text属性
     * 2. text（可能）包含status: flag:(todo) 
     * 3. 变量变化时 修改obj.text
     * @param { Object } obj 
     * @param { String } text 
     */
    catchDynamicText(obj, text){
        if(text.indexOf('status:')>=0 || text.indexOf('Status(')>=0){
            this.on('status', ()=>{
                obj.text = core.replaceText(text);
            })
        }
        if(text.indexOf('item:')>=0 || text.indexOf('itemCount(')>=0){
            this.on('item', ()=>{
                obj.text = core.replaceText(text);
            })
        }
        if(text.indexOf('flag:')>=0 || text.indexOf('getFlag(')>=0){
            this.on('flag', ()=>{
                obj.text = core.replaceText(text);
            })
        }
        // TODO : 闭包变量
        const tmp = 'core.status.event.data.list[0]';
        if(text.indexOf('event:')>=0 || text.indexOf(tmp)>=0){
            let idx = text.indexOf(tmp);
            text = text.replace(/core\.status\.event\.data\.list\[0\]\.([a-zA-Z0-9_\u4E00-\u9FCC]+)/g, evt=>{
                return "'"+eval(evt)+"'";
            });
        }
        return core.replaceText(text);
    }

    /**
     * 分发一个变化消息
     * @type { status|item|flag|global|enemy|blockId|blockCls|equip}
     */
    // emitChange(type, value) {
    //     (this.onList[type] || []).forEach(fn=>{fn(value)});
    // }
    /**
     * 游戏变量 flags不允许修改 使用方法为 StatusManager.flags['xxx'] = xx;
     * @returns {*}
     */
    get flags(){
        if(!core.status.hero)return {};
        return core.status.hero.flags;
    }
    set flags(v){
        core.status.hero.flags = v;
    }

    /**
     * 统计信息
     */
    get statistics(){
        if(core.status.hero)
            return core.status.hero.statistics;
    }
    set statistics(v){
        if(core.status.hero)
            core.status.hero.statistics = v;
    }

    /**
     * 勇士状态
     */
    get hero(){
        return this._hero;
    }

    /**
     * 仅限存储使用 只替换部分属性 —— 不含flags和statistics？
     * todo：显伤刷新数值仅在勇者数值改变后
     * @param val
     */
    set hero(val){
        for(let k in val){
            this._hero[k] = val[k];
        }
    }

    /**
     * 勇者原始状态获取 —— 不建议修改，而是通过修改BattleManager.getHeroStatus
     * @param t
     * @returns {*}
     */
    getHeroStatus(t){
        return this.hero[t];
        // return core.status.hero[t];
    }
    /**
     * 
     * @param { attribute }} t 
     * @param { number } v 
     */
    setHeroStatus(t, v){
        this.receive('status', v);
        // this.emitChange('status');
        this.hero[t] = v;
    }


    save(data){
        data.hero = core.clone(this.hero);
        data.hard = this.hard;
    }
    load(data){
        this.hero = data.hero;
        this.hard = data.hard;
    }



    //////////////// 以下部分暂时不考虑////////////////////////


    /**
     * 读取绝对坐标的存档值
     * todo: 只读有差分的部分
     * @param index
     * @returns {*}
     * @private
     */
    _real_load(index){
        let toLoad = this.saveData[index];
        if(!toLoad){
            return null;
        }
        EventManager.load(toLoad);
        ActorManager.load(toLoad);
        MapManager.load(toLoad);
        for(let k in this.saveInfo){// 硬存的数据
            this[k] = toLoad[k];
        }
        return true;
    }
    /**
     * 从当前的依赖存档进行读取
     * @param bias
     * @private
     */
    _load(){
        return this._real_load(this.index);
    }

    // 读取下一个档 如果有分歧——下一个档的父节点不是自己 则失败
    _back(){
        if(this.tree[this.index+1] && this.tree[this.index+1].parent!=this.index){
            return null;
        }
        return this._real_load(this.index+1);
    }

    // 存档
    _save(){
        let saveData = {};
        EventManager.save(saveData);
        ActorManager.save(saveData); // 勇者的数据在actors里 不用重复存?
        MapManager.save(saveData);
        for(let k in this.saveInfo){// 硬存的数据
            saveData[k] = core.clone(this[k]);
        }
        let last = this.index;
        // 处于最前端 无需分支
        if(this.index===this.saveData.length+1){
            this.index++;
        }else{// 分支
            this.index = this.saveData.length;
        }
        this.tree[this.index] = this.tree[this.index] || {};
        this.tree[this.index].parent = last;
        this.saveData.push(saveData);
    }

    /**
     *
     */
    _old_save(){
        if(this._save())
            main.log('存档成功');
    }

    /**
     * 读取目标index的存档
     * @param index
     */
    _old_load(index){
        if(index==null){
            if(!this._load()){
                return main.log('空存档')
            }
            this.index = this.tree[this.index].parent;
        }else{
            //LCA
            if(!this.tree[index])return main.log('目标index不存在');
            let log= {};
            let arr = [];//back路径
            let ptr = index;
            let tree = this.tree;
            while(tree[ptr]){
                arr.push(ptr);
                log[tree[ptr].parent] = true;
                ptr = tree[ptr].parent;
            }
            ptr = this.index;
            while(tree[ptr]){
                if(log[tree[ptr].parent]){
                    break;
                }
                ptr = tree[ptr].parent;
            }
            let head = tree[ptr].parent;
            // 往回读
            while(this.index != head){
                this._load();
                this.index = tree[this.index].parent;
            }
            // 往后读
            while(this.index != index){
                this._back();

            }
            // todo
        }
        main.log('读档成功');
        core.changeFloor(MapManager.floorId, null, this.hero.loc);
    }
    /**
     * 前进一格 如果有分支如何做——要记录回档路径
     * @param index
     */
    _old_back(index){
        if(this._back())
            core.changeFloor(MapManager.floorId, null, this.hero.loc);
    }


}();