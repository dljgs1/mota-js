import {Listener} from "./Base.js";


/**
 *
 *
 * 消息中心 用于解决异步问题 也可用于解耦同步
 * 注意：消息的订阅接收是同步的，即发送的时候就立刻确认是否接收，消息管理器自身不存储消息队列，应该由消费者实现
 * 同一个消息如果被多个订阅者订阅，那么都将收到这个消息，如果包含回调，则必须只能回调一次
 *
 * 所有对象都可以是sender，但订阅者请自觉继承Listener
 *
 */
export default new class MessageManager extends Listener{
    constructor() {
        super();
        /**
         * 消费者
         * 系统消费者有：异步事件锁
         */
        this.consumers = {};// topic - consumer list []
        this.asyncObjs = {};
        this.listener = {};// code - function
        this.asyncCount = 0;
        this.registerConsumer('async', this);
        this.on('hang', (obj, callback)=>{
            if(this.asyncObjs[obj._asyncCode]){
                main.log('错误！同一个角色发生了两次异步动作')
            }
            this.asyncCount += 1;
            obj._asyncCode = core.getUid();
            this.asyncObjs [obj._asyncCode] = obj;
            callback();
        });
        this.on('cancel', (obj, callback)=>{
            if(!this.asyncObjs[obj._asyncCode]){
                main.log('错误的异步取消事件！')
            }else{
                delete this.asyncObjs[obj._asyncCode];
                obj._asyncCode = undefined;
                this.asyncCount -= 1;
                if(this.asyncCount==0){
                    this._listen('clearAsync'); // 监听一次清空
                }else{
                    this._listen('asyncWin');
                }
            }
            callback();
        });

        const self = this;

        /**
         * 帧消息 无视异步同步问题 帧消息也不允许发送 会被无视
         * event:
         *  "tick" : 时钟滴答
         *  "animate"： 画面重绘
         *  ""
         */
        createjs.Ticker.addEventListener("tick", function (event) {
            if (!event.paused) {
                (self.consumers['frame'] || []).forEach(c=>{c.receive('tick', event)})
            }
        });

    }

    /**
     * 注册一个消费者，处理器是包含receive方法的对象
     * 消费者能否撤离？ —— 必须消费者唯一 不能丢失其句柄
     */

    registerConsumer(topic, obj){
        if(!obj.receive){main.log('没有receive方法的对象！')};
        this.consumers[topic] = this.consumers[topic] || [];
        this.consumers[topic].push(obj);
    }

    /**
     * 撤销一个消费者 —— 不推荐使用
     */
    unregisterConsumer(topic, obj){
        let consumers = (this.consumers[topic] || []);
        consumers.splice(consumers.indexOf(obj), 1);
    }
    /**
     * 挂载一个一次性函数，收到特定的code的消息后会调用其函数 然后会销毁
     * 适合轻量级的临时异步消息 不必注册
     * 不影响消息分发
     *
     * —— 相当于一次截获
     */
    mountOnceCodeListener(code, fn){
        this.listener[code] = this.listener[code] || [];
        this.listener[code].push(fn);
    };

    /**
     * 等待所有异步完成（promise.all？）
     * @param fn
     */
    waitAsync(fn){
        if(Object.keys(this.asyncObjs).length==0){
            fn();
        }else{
            this.mountOnceCodeListener('clearAsync', fn);
        }
    };

    /**
     * 等待第一个完成的异步事件 : 警告：必须确定所有异步事件已经开始后再使用，否则就会出错
     * @param fn
     */
    waitWinner(fn){
        if(Object.keys(this.asyncObjs).length==0){
            fn();
        }else{
            this.mountOnceCodeListener('asyncWin', fn);
        }
    };

    /**
     * 处理一次性code监听
     */
    _listen (code){
        let todo = (this.listener[code]||[]);
        if(todo.length===0)return;
        this.listener[code] = [];// 防止回调会增加新的异步事件 所以先清除
        todo.forEach((fn)=>{fn()});
    };


    /**
     * 处理对象产生行为的消息
     * @param topic 消息类型
     * @param code 消息代码
     * @param obj 消息来源
     * @param callback 消息处理的回调
     * @param isSeize 是否抢占，如果是，只被第一个成功接收的接收
     *
     * 返回bool确定消息是否被接收，只有当全部拒收时，才不会调用callback
     * 只要有成功接收者，
     * callback就会被调用
     *
     */
    send(topic, code, obj, callback, isSeize){
        this._listen(code);
        let ret = false;
        let ct = 0;// 统一回调计数 如果是同步消息，会被over阻止调用
        let over = false;
        let addCall = (m)=>{
            ct += (m || 1);
            if(ct==0 && over && ret && callback)callback();
        };
        (this.consumers[topic]||[]).forEach((c)=>{
            if(ret && isSeize)return;
            if(c.receive(code, obj, addCall)){
                ret = true;
            }
            addCall(-1);
        });
        if(ct == 0 && ret){// 全同步
            if(callback)callback();
        }else{ // 有异步或者存在没有接收者
            over = true;
        }
        return ret;
    };
    /**
     * 清空当前的异步消息
     */
    clearAsyncs() {
        this.asyncCount = 0;
        this.asyncObjs = {};
    }
}();
