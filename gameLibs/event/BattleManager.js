/**
 * 战斗管理几点原则：
 * 1. 战斗管理只负责计算——输入动态数据，输出静态结果，管理本身不会对动态数据进行直接修改，相当于一个查询API
 * 2. 有一些技能需要接收消息进行处理，将交由状态管理
 * @type {BattleManager}
 *
 *
 * 显伤计算加速？：
 * https://www.cnblogs.com/haodawang/p/5967269.html
 * 异步计算，计算结果会返还到显伤模块
 */


/**
 * 怪物特殊技能类
 */
class Special {
    constructor(idx, info) {
        this.id = idx;
        for(var ii in info){
            if(info[ii]){
                if(typeof info[ii] == 'string' && info[ii].indexOf('function')==0){ // 函数
                    eval('this[ii]='+info[ii]);
                }
                else this[ii] = info[ii];
            }
        }
    }
    bindEnemyObj(value){
        function tmp(value){
            if(typeof value == 'number'){
                this.value = value;
            }else {
                for(var i in value){
                    this['value'+(i+1)] = value[i];
                }
            }
        }
        if(value){
            tmp.prototype = this;
            return new tmp(value);
        }else {
            return this;
        }
    }
    getDamageInfo(dmg){return dmg;
    }
    getHeroStatus(hero){return hero;
    }
    getEnemyInfo(info){return info;
    }
    updateCheckBlock(){
    }
    checkBlock(){
    }
    afterBattle(){
    }
}

export default new class BattleManager {
    constructor(){
        this.enemys = JSON.parse(JSON.stringify(enemys_fcae963b_31c9_42b4_b48c_bb48d09f3f80));
        this.specials = specials_90f36752_8815_4be8_b32b_d7fad1d0542e;
        this.battleData = functions_d6ad677b_427a_4623_b50f_a445a3b0ef8a.battle;
        //
        this.specialObjs = [];
        //this.worker = new Worker('gameLibs/threadCompute.js');
        //this.worker.onmessage = function(event){
        //    console.log(event.data);
        //};
        //this.worker.postMessage({id: '123'});
        // specials初始化
        for(let i in this.specials){
            this.specialObjs.push(new Special(i, this.specials[i]));
        }

        // 所有敌人中的special引用到special对象
        for(let i in this.enemys){
            if(this.enemys[i].special && this.enemys[i].special instanceof Array){
                var special = this.enemys[i].special;
                for(var j in special){
                    try{
                        this.enemys[i].special[j] = this.specialObjs[special[j].id].bindEnemyObj(special[j].value);
                    }catch(e){
                        debugger;
                    }
                }
            }
        }
    }

    getSpecials(){
        return this.specials;
    }
    getSpecialIds(){
        let ret = [];
        for (let i = 0; i < this.specials.length; i++){
            ret.push(i);
        }
        return ret;
    }
    getEnemy(eid){
        if (typeof eid == 'string'){
            return this.enemys[eid];
        }
        eid.special = this.enemys[eid.id].special;
        return eid;
    }
    getEnemySpecial(eid){
        if (typeof eid != 'string'){
            eid = eid.id;
        }
        return this.enemys[eid].special;
    }


////////////////////// 技能对数值的修正/////////////////////////

    /**
     * 最终数值修正结果
     * @param info 原始信息
     * @param minfo 修改信息
     * @private
     *
     * 技能对数值修改的方法：
     * TODO 对超过限额的改变类型进行标记 比如{type:'percentage', value:12} 表示1200% 没超过的还是按原来的判断方法：
     * -10 < value < 10 && ~~value != value —— 百分比
     * value < -10 || ~~value==value || value > 10 ——固定数值
     * 百分比是加算，比如 -0.1 表示该数值下降10% ， 0.1表示上升10% 如果同时出现 就会抵消
     */
    onInfoChange(info, minfo){
        var hardChange = {}; // 固定数值改变（ 比如针对于基础攻击力）
        var percentage = {}; // 百分比改变
        if(!minfo || minfo.length==0)return info;
        function change(minfo){
            for(var i in minfo){
                var v = minfo[i];
                // 最简单的判别办法：判断是整数还是小数 缺陷：无法区分1.0 和 1 为了方便 避免使用大数值的百分比以及小数值的硬变化
                if((v<10||v>-10) && ~~v!=v){// 百分比变化上限1000%
                    percentage[i] = percentage[i] || 1; // 默认百分之百 即不变化
                    percentage[i] += v;
                }else{
                    hardChange[i] = hardChange[i] || 0;
                    hardChange[i] += v;
                }
            }
        }
        if(minfo instanceof Array){// 组合式变化
            minfo.forEach(change);
        }else change(minfo);
        // —— 对同一属性值先固定 后百分比
        for(var i in hardChange){
            info[i] += hardChange[i];
        }
        for(var i in percentage){
            info[i] *= percentage[i];
            info[i] = ~~info[i]; // ~~取下整
        }
        return info;
    }


    /**
     * 获取光环在某个位置产生的影响
     * @param funcname 战斗阶段
     * @param src_info 原信息
     * @param x
     * @param y
     * @returns {Array}
     */
    getHaloChange(funcname, src_info, x, y){
        var specials = [];
        /**
         * checkBlock的使用方法：
         * 1. checkBlock['光环名'] = SpecialObject 表示checkBlock是地图光环 对地图所有单位有效
         * 2. checkBlock['光环名'][index] = specialObject 表示是特定位置光环 对index位置生效
         * 3. checkBlock['光环名'] = [SpecialObject] 表示地图叠加光环
         * 4. checkBlock['光环名'][index] = [specialObject] 表示单点叠加光环
         * @type {{damage, type, souldmg, ambush, snip, zone}|*}
         */
        var check = core.status.checkBlock;

        for(var i in check){
            if(check[i] instanceof Array && (check[i][0]||{}).isHalo){
                check[i].forEach((s)=>specials.push(s));
            }
            if(check[i].isHalo){// 地图光环 直接将自身放进checkBlock
                specials.push(check[i]);
            }
            if(x!=null && y !=null){
                var index = x+','+y;
                for(var i in check){
                    if(check[i][index] instanceof Array && (check[i][index][0]||{}).isHalo){
                        check[i][index].forEach((s)=>specials.push(s));
                    }
                    if(check[i][index] && check[i][index].isHalo){
                        specials.push(check[i][index]);
                    }
                }
            }
        }
        if(specials.length)
            return this.getSpecialChange(specials, funcname, src_info, true);
    }

    /**
     * 获取特殊技能产生的变化
     * @param specials 特殊技能列表
     * @param funcname 战斗阶段
     * @param src_info 原始信息
     * @param isHalo 是否为光环的计算 如果是 只对有光环技能进行计算
     * @returns {Array}
     */
    getSpecialChange(specials, funcname, src_info, isHalo){
        var infos = [];
        for(var i in (specials||[])){
            if(!~~specials[i].id)continue;
            if(isHalo && !specials[i].isHalo)continue;
            if(!isHalo && specials[i].isHalo)continue;// 过滤光环类
            infos.push({});
            specials[i][funcname](src_info, infos[infos.length - 1]);
        }
        return infos;
    }

    /**
     *
     * @param specials
     * @param funcname
     */
    doSpecialFunc(specials, funcname){
        for(var i in specials){
            if(specials[i].isHalo)continue;
            specials[i][funcname].apply(specials[i], Array.prototype.slice.call(arguments, 2));
        }
    }

    /**
     * 执行光环函数
     * @param funcname
     * @param x
     * @param y
     */
    doHaloFunc(funcname, x, y){
        let check = core.status.checkBlock;
        // 光环格式： checkBlock._halotype_.?loc.object
        // 光环类型、光环作用的位置、产生光环的技能对象（组），
        // 当对象的作用是全局地图：省略loc
        // 当checkBlock单纯用于显示文字时（领域显伤、警告标记、魂伤等等）忽略 ——TODO: 将其移动到专用层
        let args = arguments;
        function doFunc(obj){
            if(obj.isHalo){
                obj[funcname].apply(obj, Array.prototype.slice.call(args, 3));
            }else if(obj instanceof Array){
                obj.forEach(doFunc);
            }
        }
        const index = x+','+y;
        for(let i in check){
            doFunc(check[i]);
            if(x!=null && y!=null){//只看地图光环
                if(check[i][index]){
                    doFunc(check[i][index])
                }
            }
        }
    }


    /**
     * 战斗 ： 实际战斗过程分为五个阶段
     * 1. 战前
     * 2. 获取己方信息
     * 3. 获取敌方信息
     * 4. 获取伤害信息
     * 5. 战后
     * 返回战斗结果：己方战损
     */
    battle(id, x, y, force, callback){
        if(!id)return;
        id = id || core.getBlockId(x, y);
        if (!id) return core.clearContinueAutomaticRoute(callback);
        // 非强制战斗
        if (!core.enemys.canBattle(id, x, y) && !force && !core.status.event.id) {
            core.drawTip("你的灵魂力量太弱！", null, true);
            return ActorManager.getHero().clearAutoRoute();
        }
        // 自动存档
        if (!core.status.event.id) core.autosave();
        // 战前事件
        if (!this.beforeBattle(id, x, y))
            return callback();
        // 战后事件
        this.afterBattle(id, x, y, callback);
    }
    beforeBattle(enemy, x, y){
        return this.battleData.beforeBattle(enemy,x,y);
    }
    getEnemyInfo(enemy, hero, x, y, floorId){
        return this.battleData.getEnemyInfo(enemy, hero, x, y, floorId);
    }
    getHeroInfo(hero, enemy, x, y){
        return this.battleData.getHeroInfo(enemy, hero, x, y);
    }

    getDamageInfo(enemy, hero, x, y, floorId, noSpecial){
        return this.battleData.getDamageInfo(enemy, hero, x, y, floorId, noSpecial);
    }
    getDamageString (enemy, x, y, floorId) {
        if (typeof enemy == 'string') enemy = this.enemys[enemy];
        var damage = this.getDamageInfo(enemy, null, x, y, floorId).damage;
        var color = '#000000';

        if (damage == null) {
            damage = "???";
            color = '#FF0000';
        }
        else {
            if (damage <= 0) color = '#00FF00';
            else if (damage < core.status.hero.hp / 3) color = '#FFFFFF';
            else if (damage < core.status.hero.hp * 2 / 3) color = '#FFFF00';
            else if (damage < core.status.hero.hp) color = '#FF7F00';
            else color = '#FF0000';
            damage = core.formatBigNumber(damage, true);
        }
        return {
            "damage": damage,
            "color": color
        };
    }

    afterBattle(enemyId, x, y, callback){
        return this.battleData.afterBattle(enemyId, x, y, callback);
    }

}();
