
/**
 * 基本的promise 需要内部继承后修改才能使用
 */

class BasePromise{
    constructor() {
        /**
         * 任务列表。
         * @type {Array}
         */
        this.tasks = [];
        /**
         * 0 : pending
         * 1 : busy
         * 2 : special
         * @type {number}
         */
        this.state = 0;
    }

    /**
     * 成功后行为
     */
    success() {
        this.state = 0;
        this.work();
    }
    /**
     * 失败后行为
     */
    fail() {
    }

    /**
     * 立即停止一切行动
     */
    stop(){
        this.tasks = [];
        return this;
    }
    /**
     * 工作
     */
    work(){
        if(this.tasks.length===0){
            return this;
        }
        if(this.state==0){
            this.state = 1;
            this._parseWork(this.tasks.shift())
        }
        return this;
    }
    _parseWork(f){
        f(()=>{this.success.call(this)}, ()=>{this.fail.call(this)});
    }
    then(fn){
        this.tasks.push(fn);
        return this.work();
    }
}


const Tween = createjs.Tween;

/**
 * 包装tween的动画对象
 *
 * 较好的效率的实现：
 * 1. 普通动画对象和角色绑定，角色存储动画对象——这是由于发生动画的经常是在角色
 * 2. 特殊动画对象，如对屏幕、对地图的，非常驻不存储，需要时申请，如果是常驻，由UI管理
 * 3. 单个动画对象接收三个参数，1. sprite 2. 配置 3. 回调，无需关心其他逻辑
 *
 *
 * 动画对象使用方法：
 * obj
 *  .get(sprite, config) //将动画应用到sprite config可选
 *  .wait(); // 等待动画执行完毕
 *  .then('wait', config) // 改变动画类型为‘wait’
 *  .get(sprite,config) // 应用到sprite
 *
 *  使用方法2（推荐），适用于作用于多个对象：
 * obj
 *  .get(sprite1, config) //将动画应用到sprite1 config可选
 *  .get(sprite2, config) //将动画应用到sprite2 config可选
 *  .get(sprite3, config) //将动画应用到sprite3 config可选
 *  .call(callback); // 动画完成后的回调
 *
 * sprite1~3将会并行执行同一个动画全部完成后执行callback
 *
 */

class AnimatePromise extends BasePromise {
    constructor(name, config) {
        super();
        this.config = config || {};
        this.animate = AnimationManager['animate_' + name]; // 过程中不改变
        /**
         * 0 : pending
         * 1 : animate 此时call会被该动画等待 如果get其他动画 则会计入动画组
         * 2 : call 正在callback 不能插入动画 只能等待
         * @type {number}
         */
        this.ct = 0; // 动画对象计数
        this.lock = 0;
        this.tweens = []; // tween实例组——即当前的运行动画组
    }
    call(callback) {
        return this.then(callback);
    }
    work() {
        /**
         * 将动画全部执行
         */
        while (this.state != 2 && this.tasks.length > 0 && this.tasks[0].animate) {
            let next = this.tasks.shift();
            let config = next.config;
            this.ct += 1;
            this.state = 1;
            if (config) {
                for (let i in config) {
                    this.config[i] = config[i];
                }
            }
            this.tweens = this.tweens || [];
            this.tweens.push(this.animate(next.sprite, this.config, () => {
                this.ct -= 1;
                if (this.ct == 0) {
                    this.tweens = null;
                    this.state = 0;
                    this.work();
                }
            }));
        }
        return super.work();
    }
    /**
     * 处理一个sprite 尝试将其加入动画组 如果被阻塞 延迟加入
     * get后，会阻塞then
     * then后，会阻塞get和then
     * @param sprite
     * @returns { AnimatePromise }
     */
    get(sprite, config) {
        this.tasks.push({
            animate: true,
            sprite: sprite,
            config: config
        });
        return this.work();
    }
    /**
     * 等待动画执行完毕
     * @returns {AnimatePromise}
     */
    wait(fn) {
        if (this.state = 1 && this.ct > 0)
            this.state = 2;
        if (fn)
            return this.then(fn);
        return this;
    }
    /**
     * 处理一个sprite组
     * @param sprites
     * @param config
     */
    wrap(sprites, config) {
        if (config) {
            for (let i in config) {
                this.config[i] = config[i];
            }
        }
        ;
        sprites.forEach((s) => this.get(s));
        return this;
    }
    /**
     * 加入变化时处理，仅对有动画生成时有效
     * @param callback
     * @returns {AnimatePromise}
     */
    onChange(callback) {
        if (this.tweens)
            this.tweens.forEach((t) => {
                t.addEventListener("change", (e) => { callback(e.target); });
            });
        return this;
    }
    /**
     * 不推荐使用，next改变动画类型和配置
     * @param name
     * @param config
     * @returns {AnimatePromise}
     */
    next(name, config) {
        if (AnimationManager['animate_' + name])
            this.animate = AnimationManager['animate_' + name];
        for (let i in (config || {}))
            this.config[i] = config[i];
        return this;
    }
    /**
     * 立即停止当前动画 不处理回调
     */
    stop() {
        (this.tweens || []).forEach((t) => { t.stop(); });
        this.tweens = null;
        this.state = 0;
        return this;
    }
}


/**
 * 行为promise
 */
class ActionPromise{
    constructor(self) {
        this.msg = [];
        /**
         * 0 : pending
         * 1 : busy
         * 2 : reject
         * @type {number}
         */
        this.state = 0;
        this.self = self;// 指向特定的角色
    }

    /**
     * 停止一切行动 —— 只等待最后一次行动完成
     */
    stop(){
        this.msg = [];
        return this;
    }
    /**
     * 清除某条消息后的行动
     */
    clearTo(msg){
        let st = 0;
        for(st = 0;st < this.msg.length;st++){
            if(this.msg[st].msg==msg)break;
        }
        this.msg.splice(st+1);
        return this;
    }
    work(){
        if(this.msg.length===0){
            return this;
        }
        if(this.state==0){
            this.state = 1;
            let msg = this.msg.shift();
            // 成功 根据指令继续前进
            let call = ()=>{
                this.state = 0;//state ||
                return this.work();
            };
            // 失败 清除余下指令
            let stop = ()=>{
                this.state = 0;
                this.msg = [];
                return this;
            };
            if(msg.type == 'wait'){
                if(!MessageManager.send('action', msg.msg, this.self, call))
                    return this;
            }else if(msg.type=='func'){
                msg.msg(call, stop);
            }else{
                MessageManager.send('action', msg.msg, this.self);
                return call();
            }
            return this;
        }
        return this;
    }
    // 行为发送发送一个消息
    send(msg, wait){
        if(wait)this.msg.push({type:'wait', msg:msg});
        else this.msg.push({msg:msg});
        return this.work();
    }
    then(fn){
        this.msg.push({type:'func',msg:fn});
        return this.work();
    }
};



export { BasePromise, AnimatePromise , ActionPromise}