/**
 * 窗口是UI的基本窗框对象，窗口可以没有皮肤、没有界面，但必须带交互。
 * 交互定义：
 * 1. 输入： 接受用户的输入、如文字、如选择、如点击
 * 2. 输出：向用户展示信息，图片、文字、……
 * 
 * 组件化窗口：
 * 1. 窗口包含多个“功能”，可以通过组件来表示这些功能
 * 2. 组件可以组合之后常驻使用，也可以热插拔使用
 * 3. 组件的注册在Components中，也可以在插件中用this.component_XXXName 进行注册
 * /



/**
 * @class Basewind 基本窗口，可以是不包含任何内容的空窗
 * @extends PIXI.Container
 * @prop { Object } info 窗口的更多信息 详见EventData
 * @prop { WinskinSprite } surface 皮肤，可以使用纯图片、winskin
*/

import SpriteManager from "../assets/SpriteManager.js";
import StatusManager from "../event/StatusManager.js";
import {Entity} from "../system/Base.js";
import {mix} from "../utils/base.js";

const Container = PIXI.Container;
export class BaseWind extends mix(Container, Entity) {
    constructor(info, surface) {
        super();
        if(surface){
            this.skin = surface;
            this.addChild(surface);
        }
        this._init(info);

        /**
         * 弹性布局
         * 1. 设置弹性布局后 容器以及容器内所有item的布局属性失效
         * 2. 没有指定布局的容器自动使用flex（todo
         */
        this.flex = {
            "flex-direction": '',
            "flex-wrap":'',
            "flex-flow":'',
            "justify-content":'',
            "align-items":'',
            "align-content":'',
            "enable": false,
        };
        /**
         * 字体样式
         */
        this.style = new TextStyle();
        /**
         * 上下文设置
         */
        this.context = {
            alpha: 1,
        };
    }
    get show(){return this.renderable}
    set show(t){this.renderable = t}

    get width(){
        if(this.skin)return this.skin.width;
        else return this.info.width;
    }
    get height(){
        if(this.skin)return this.skin.height;
        else return this.info.height;
    }
    set width(v){
        if(this.skin)this.skin.width = v;
        else this.info.width = v;
    }
    set height(v){
        if(this.skin)this.skin.height = v;
        else this.info.height = v;
    }


    /**
     * 排布方向调整 第一个调整
     * info 传递wrap类型
     * @param {} item 
     */
    flex_direction(item, info){
        const attr_axis = {
            "row": 'x',
            "row-reverse": 'x',
            "column": 'y',
            "column-reverse": 'y',
        }
        const attr_cross = {
            "row": 'y',
            "row-reverse": 'y',
            "column": 'x',
            "column-reverse": 'x',
        }
        const acc_axis = {
            "row": 'width',
            "row-reverse": 'width',
            "column": 'height',
            "column-reverse": 'height',
        }
        const acc_cross = {
            "row": 'height',
            "row-reverse": 'height',
            "column": 'width',
            "column-reverse": 'width',
        }
        // 生长方向
        const direction_grow = {
            "row": 1,
            "row-reverse": -1,
            "column": 1,
            "column-reverse": -1,
        }
        // 逆转都是改主轴
        const direction_start = {
            "row": {//从左到右
                axis: 0,
                cross: 0,
            },
            "row-reverse": {//从右到左
                axis: this.width,
                cross: 0,
            },
            "column": {//从上到下
                axis: 0,
                cross: 0,
            },
            "column-reverse": {//从下到上
                axis: this.height,
                cross: 0,
            },
        }
        const anchor = {
            "row": {
                x: 0,
                y: 0,
            },
            "row-reverse": {
                x: 1,
                y: 0,
            },
            "column": {
                x: 0,
                y: 0,
            },
            "column-reverse": {
                x: 0,
                y: 1,
            },
        }
        
        // 返回信息：
        let ret =  {
            grow:{ // 0 增长方向 1/-1/0
                axis: direction_grow[item], 
                cross: info.wrap == 'wrap-inverse' ? -1:(info.wrap == 'nowrap' ? 0 : 1),
            },
            start_pos: { // 1 主轴、交叉轴起始点的坐标，此时经供参考，之后要转化成array形式——记录每一行的起始点
                axis: direction_start[item].axis,
                cross: direction_start[item].cross,
            },
            start: {
                axis: [],
                cross: [],
            },
            anchor: anchor[item], // 2. 项目的锚点是否变化（方向相反则锚点0-1
            step: { // 3. 额外步长（宽度平均 measure后填充array {}
                axis: [],
                cross: [],
            },
            attr: { // 4. 定位属性
                axis: attr_axis[item],
                cross: attr_cross[item],
            },
            attr_acc:{ // 5. 积累的属性
                axis: acc_axis[item],
                cross: acc_cross[item],
            },
            measure:{
                arr:[],//每一行的长宽 0, 1 ,2 ..
                width:0, // 最大宽度
                height:0, // 最大高度
            },
            wrap: info.wrap,
        };
        return ret;
    }
    /**
     * 主轴对齐调整
     * info需包含:
     * 1. arr信息 此属性仅限一行使用
     * 2. measure 整体长宽测量信息，measure: [{width, height}]
     * @param {*} item 
     */
    justify_content(item, info){
        // if(!info.arr || info.arr.length > 1)return info;
        let ast = info.start_pos.axis;
        let cst = info.start_pos.cross;
        switch(item) {
            // 左对齐
            case 'flex-start':
                for(let i in info.arr){
                    info.start.axis[i] = ast;
                }
                break;
            // 右对齐
            case 'flex-end':
                for(let i in info.arr){
                    let blank = this[info.attr_acc.axis] - info.measure[i][info.attr_acc.axis];
                    info.start.axis[i] = ast === 0 ? blank: ast - blank;
                }
                break;
            // 居中
            case 'center':
                for(let i in info.arr){
                    let hfblank = (this[info.attr_acc.axis] - info.measure[i][info.attr_acc.axis]) >> 1;
                    info.start.axis[i] = ast === 0 ? hfblank: ast - hfblank;
                }
                break;
            // 空间隔
            case 'space-between':
                for(let i in info.arr){
                    let itcount = info.arr[i].length;
                    let blank = this[info.attr_acc.axis] - info.measure[i][info.attr_acc.axis];
                    if(itcount - 1>0){
                        info.step.axis[i] = ~~(blank/(itcount-1));
                    }else {
                        info.start.axis[i] = blank>>1;
                    }
                }
                break;
            // 空周边
            case 'space-around':
                for(let i in info.arr){
                    let itcount = info.arr[i].length;
                    let blank = this[info.attr_acc.axis] - info.measure[i][info.attr_acc.axis];
                    info.step.axis[i] = ~~(blank / itcount);
                    info.start.axis[i] = info.step.axis[i]>>1;
                }
                break;
        }
        return info;
    }

    /**
     * 交叉轴对齐调整——对主轴的所有元素的信息进行调整
     * TODO:
     * 1. 顶对齐
     * 2. 居中对齐
     * 3. 底对齐
     * 4. 填充
     * 5. 文字对齐
     * 
     * 
     * info需包含:
     * 1. arr信息
     * 2. measure长宽测量信息，measure: [{width, height}]
     * @param {*} item 
     */
    align_items(item, info){
        let cross_attr = info.attr.cross;
        switch(item) {
            case 'flex-start':// 顶对齐 每一个元素的anchor调整为0 cross出发点为0
                info.anchor[cross_attr] = 0;
                info.start_pos.cross = 0;
                for(let i in info.arr){
                    info.start.cross[i] = 0;
                }
                break;
            case 'flex-end':// 底对齐 每一个元素anchor为1 cross出发点为最大值——交叉最高高度
                info.anchor[cross_attr] = 1;
                // info.start_pos.cross = info.measure[info.attr_acc.cross];
                for(let i in info.arr){
                    let blank = info.measure[i][info.attr_acc.cross];// 交叉的高度
                    info.start.cross[i] = blank;
                }
                break; 
            case 'stretch':// 需要填充宽度 暂时不考虑 因为拉伸sprite会很丑
            case 'baseline':// ?? 如何实现？——其实就是每一个元素的第一个子元素对齐 需要专门建立
            case 'center': // 居中对齐
                info.anchor[cross_attr] = 0.5;
                for(let i in info.arr){
                    let blank = info.measure[i][info.attr_acc.cross]>>1;// todo：交叉的高度
                    info.start.cross[i] = blank;
                }
                break;
        }
        return info;
    }
    /**
     * 多交叉对齐调整——即所有轴线相对于容器的排布
     * info需包含:
     * 1. arr信息
     * 2. measure每一行的长宽测量信息，measure: [{width, height}]
     * @param {*} item 
     */
    align_content(item, info){
        let blank = this[info.attr_acc.cross] - info.measure[info.attr_acc.cross];
        const itcount = info.arr.length;// 主轴数目
        switch(item) {
            case 'flex-start':// 默认如此 无需调整
                break;
            case 'flex-end':// 最后对齐 需要调整出发点
                info.start_pos.cross = info.start_pos.cross == 0 ? blank : info.start_pos.cross-blank;
                break;
            case 'center':
                blank >>= 1;
                info.start_pos.cross = info.start_pos.cross == 0 ? blank : info.start_pos.cross-blank;
                break;
            case 'space-between':
                if(itcount - 1>0){
                    info.step.cross = ~~(blank/(itcount-1));
                }else {
                    blank >>= 1;
                    info.start_pos.cross = info.start_pos.cross == 0 ? blank : info.start_pos.cross-blank;
                }
                break;
            case 'space-around':
                info.step.cross = ~~(blank / itcount);
                info.start_pos.cross = info.step.cross>>1;
                break;
        }
        return info;
    }
    /**
     * 当子节点改变时
     */
    onChildrenChange(){
        //1 解决主轴方向和wrap
        if(this.flex && this.flex.enable){
            /** 
             * 主轴方向决定了主轴生长方向
             */
            let direction = this.flex["flex-direction"]|| "row";
            /**
             * 换行决定了交叉轴生长方向
             */
            let wrap = (this.flex["flex-wrap"] || 'nowrap');

            let info = {wrap: wrap};
            // 0 计算方位
            info = this.flex_direction(direction, info);
            // 1 测算行列
            let axis_sum = [0];
            let index = 0;
            let arr = [[]];
            let measure = {width:0, height:0,0:{height:0, width:0}};// 最大宽高 以及各行的累积宽、最大高
            let max_cross_acc = 0;
            for(let c of this.children){
                if(c===this.skin)continue; // 皮肤不参与
                // 计算最大高
                max_cross_acc = max_cross_acc > c[info.attr_acc.cross] ? max_cross_acc: c[info.attr_acc.cross];
                if(wrap!='nowrap' && measure[index][info.attr_acc.axis] + c[info.attr_acc.axis] > this[info.attr_acc.axis]){
                    measure[info.attr_acc.cross] += max_cross_acc;
                    measure[index][info.attr_acc.cross] = max_cross_acc;
                    max_cross_acc = c[info.attr_acc.cross];
                    index += 1;
                    arr.push([]);
                    measure[index] = {
                        height: 0,
                        width: 0,
                    }
                    axis_sum.push(0);
                }
                // 累积宽
                measure[index][info.attr_acc.axis] += c[info.attr_acc.axis];
                // 统计最大宽
                measure[info.attr_acc.axis] = measure[index][info.attr_acc.axis] > measure[info.attr_acc.axis] ? measure[index][info.attr_acc.axis] : measure[info.attr_acc.axis];
                arr[index].push(c);
            }
            if(measure[index][info.attr_acc.axis]){
                max_cross_acc = (max_cross_acc > measure[index][info.attr_acc.cross] ? max_cross_acc:measure[index][info.attr_acc.cross]);
                measure[info.attr_acc.cross] += max_cross_acc;
                measure[index][info.attr_acc.cross] = max_cross_acc;
            }
            info.arr = arr;
            info.measure = measure;

            // 2. 调节主轴
            let justify = this.flex["justify-content"]|| "flex-start";
            info = this.justify_content(justify, info);

            // 3. 调节交叉轴
            let align_items = this.flex["align-items"]|| "center";
            info = this.align_items(align_items, info);

            // 4. 调节交叉众轴
            let align_content = this.flex["align-content"]|| "center";
            info = this.align_content(align_content, info);
            
            // 5. 依据最终信息实际调整项目
            // let cross_start = info.start_pos.cross;
            let gc = info.grow.cross, ga = info.grow.axis;
            let cross_start = info.start_pos.cross;

            for(let i in arr){
                let axis_start = (info.start.axis[i] || 0); // + info.start_pos.axis;
                // cross_start += info.start.cross[i] || 0; // 交叉轴累积起点？
                for(let j in arr[i]){
                    const c = arr[i][j];
                    let abias = 0, cbias = (info.start.cross[i]||0);
                    if(c.anchor){
                        c.anchor[info.attr.axis] = info.anchor[info.attr.axis];
                        c.anchor[info.attr.cross] = info.anchor[info.attr.cross];
                    }else{
                        abias += -~~(info.anchor[info.attr.axis] * c[info.attr_acc.axis]);
                        cbias += -~~(info.anchor[info.attr.cross] * c[info.attr_acc.cross]);
                    }
                    if(info.attr.axis=='x'){
                        c.setTransform(axis_start + abias, cross_start + cbias);
                    }else {
                        c.setTransform(cross_start + cbias, axis_start + abias);
                    }
                    // c[info.attr.axis] = axis_start*ga + abias;
                    // c[info.attr.cross] = cross_start*gc + cbias;
                    axis_start += ~~((info.step.axis[i]||0) + c[info.attr_acc.axis])*ga;
                }
                cross_start += ~~((info.step.cross||0) + info.measure[i][info.attr_acc.cross])*gc;
            }
            return super.onChildrenChange();
            /**
             * 0. 初始化起点（主轴：左、右、中 交叉轴：）
             * 1. 按序号（排序默认不变）加入子节点，调整交叉轴布局，累积主轴堆量，
             * 2. 如果堆量超过主轴限制，判断是否换行，换行则建立新的主轴，重复1
             * 3. 每次加入
             */
        }
        super.onChildrenChange();
    }

    /**
     * 设置ui位置
     */
    setTransform(x, y, scaleX, scaleY, rotation, skewX, skewY, pivotX, pivotY){
        // TODO: 添加动画组件后进行包装
        let config = {};
        if(x!==null)config.x = x;
        if(y!==null)config.y = y;
        if(scaleX!==null)config.scaleX = scaleX;
        if(scaleY!==null)config.scaleY = scaleY;
        AnimationManager.animate_easeMove(this, config);
    }
    /**
     * 
     */
    // addChild(v){
    //    super.addChild(v);
    //  }

    ////// UI方法 /////
    doUIEvent(data){
        let fn = this['ui_'+data.type];
        if(fn){
            ['id'].forEach(k=>{
                if(data[k] && (typeof data[k] == 'string')){
                    data[k] = core.replaceText(data[k]);
                }
            });
            // 可求值列表 todo：预编译
            ['x','y'].forEach(k=>{
                if(data[k] && (typeof data[k] == 'string')){
                    data[k] = core.calValue(core.replaceText(data[k]));
                }
            });
            fn.call(this, data);
            return true;
        }return false;
    }

    /**
     * 嵌入组件
     * @param data
     */
    ui_componentEmbd(data){
        let comp = ComponentManager.getComponent(data.name);
        comp.action = data.action;
        this.addComponent(comp);
    }
    /**
     * 设置文字属性
     * @param {} info 
     */
    ui_setAttribute(info){
        const mesh = {
            strokeStyle: 'stroke',
            style: 'fill',
            font: 'fontSize',
            baseline: 'textBaseline',
            maxWidth: 'wordWrapWidth',
        };
        for(let key in info){
            let mkey = null;
            if(key in mesh)mkey = mesh[key];
            if(key=='font')info[key] = info[key]+'px';
            if(info[key] instanceof Array){
                let rgba = info[key];
                let a = rgba[3];
                this.context.alpha = a;
                info[key] = (rgba[0]<<16)+(rgba[1]<<8)+(rgba[2]<<0);
            }
            if(mkey in this.style)
                this.style[mkey] = info[key];
        }
    }

    /**
     * 设置弹性布局
     * @param {*} info 
     */
    ui_setFlex(info){
        this.flex.enable = true;
        for(let k in info){
            if(k in this.flex){
                this.flex[k] = info[k];
            }
        }
        this.onChildrenChange();
    }

    /**
     * 绘制文字
     */
    ui_fillText(info){
        let tmpStyle = this.style.clone();
        if(info.maxWidth){
            this.style.breakWords = true;
            this.style.wordWrap = true;
        }
        this.ui_setAttribute(info);
        let obj = SpriteManager.getTextSprite(info.text, this.style);
        if(info.text.indexOf('#a')>=0){
            info.text = StatusManager.catchDynamicText(obj, info.text.substr(2));
        }else{
            info.text = core.replaceText(info.text);
        }
        obj.text = info.text;
        obj.x = info.x;
        obj.y = info.y;
        this.addChild(obj);

        this.style = tmpStyle;// 单独绘制所修改的内容不影响原style
    }
    /**
     * 绘制一个平面(背景)
     * 如果没有皮肤则不绘制
     * 皮肤有两种 1； tillingSprite  2：winsprite
     * 一个窗口只能有一个皮肤
     */
    ui_drawBackground(info){
        if(!this.skin){
            this.skin = SpriteManager.getWinSprite(info.background);
            this.addChild(this.skin);
        }
        this.x = info.x; this.y = info.y; this.skin.width = info.width; this.skin.height = info.height;
    }
    /**
     * 绘制一个精灵贴图 可为动态
     */
    ui_drawSprite(info){
        if(!this.skin){
            this.skin = SpriteManager.getWinSprite(info.background);
            this.addChild(this.skin);
        }
        this.x = info.x; this.y = info.y; this.skin.width = info.width; this.skin.height = info.height;
    }
    /**
     * 绘制一个静态图标
     */
    ui_drawIcon(info){
        let obj =  SpriteManager.getIconSprite(info.id);
        obj.x = info.x;
        obj.y = info.y;
        this.addChild(obj);
    }

}


// 初始化
BaseWind.prototype._init = function(info){
    info = info || {};
    if(typeof info != 'object')return;
    this.needResize = false;// 是否需要对皮肤尺寸变换
    this.info = info;
    this.name = core.utils.replaceText(info.name||'');
    this.x = core.utils.calValue(info.x||0);
    this.y = core.utils.calValue(info.y||0);
    info.width = core.utils.calValue(info.width||1);
    info.height = core.utils.calValue(info.height||1);
    this.enable = false; // 初始不启动
    this.show = false;// 不显示
    this.animate = null; // 是否含有动画组件 如果有动画组件 要考虑异步问题 
    this.subwind = {};
    this.components = {};
}

// 绘制一个元素 如果有窗口皮肤 放到皮肤上（用以控制宽度） 否则就放到自己容器中
BaseWind.prototype.draw = function(sprite){
    this.addChild(sprite);
};

// 使能 : 显示、组件生效、动画生效
BaseWind.prototype.recurEnable = function(exclude, nodraw){
    this.enable = true;
    exclude = exclude || [];
    if(exclude.indexOf(this.name)>=0)return;//
    if(!nodraw){
        this.show = true;
    }
    // for(var i in this.components){
    //     this.components[i].install();
    // }
    for(var i in this.subwind){
        this.subwind[i].recurEnable(exclude, nodraw);
    }
};
// 失能：部分组件失效——不被动生效，比如点击等 但动画组件依然工作 也依然显示
BaseWind.prototype.recurDisable = function(){
    this.enable = false; // 初始不启动
    for(var i in this.subwind){
        this.subwind[i].recurDisable();
    }
}
// 卸载：不显示、卸载组件、动画 —— 彻底去除 同时要清除世界画布
BaseWind.prototype.recurDelete = function(){
    this.enable = false;
    this.show = false;
    for(var i in this.components){
        this.components[i].uninstall();
    }
    for(var i in this.subwind){
        this.subwind[i].recurDelete();
    }
}
// 获取真实坐标与形状——超出父UI的范围会被裁剪
BaseWind.prototype.getRealRect = function(){
    var rect = [this.x, this.y, this.width, this.height];
    if(this.parent){
        var p = this.parent.getRealRect();
        rect[0] = Math.max(0, rect[0] + p[0]);
        rect[1] = Math.max(0, rect[1] + p[1]);
        rect[2] = this.x+this.width>p[2]?p[2]-this.x:rect[2];
        rect[3] = this.y+this.height>p[3]?p[3]-this.y:rect[3];
    }
    return rect;
}
/**
 * 添加一个子容器
 * 需要修改其名字以防重复
 */
BaseWind.prototype.addSubWind = function(obj){
    this.subwind[this.name+obj.name] = obj;
    this.addChild(obj);
}

/**
 * 注册一个组件功能到当前窗口对象
 * @param { Object } data
 */
BaseWind.prototype.registerComponent = function(data){
    if(typeof data == 'function'){//通过函数注册的匿名组件 通常是系统组件
        var comp = data.apply(this, Array.prototype.slice.call(arguments, 1));
        var compName = setTimeout(null);
    }else { // 通过事件注册
        var compName = data.name;
        if(compName.indexOf('animate')>=0){ // 含动画组件
            this.animate = true;
        }
        if(this.components[compName])return;// 已经注册的无需重新注册 除非手动删除
        var comp = core.doFunc('component_'+compName, this, data); // 将组件对象绑定到数据对象
    }
    this.components[compName] = comp;
    comp.ui = this;// 为组件提供ui访问引用
    return compName;
}
BaseWind.prototype.unregisterComponent = function(compName){
    this.components[compName].uninstall();
    return delete this.components[compName];
}

// 重新运行绘制事件 —— 待施工优化@_@ 区分UI事件和action事件
BaseWind.prototype.reupdate = function(){
    // 1.  重新计算UI数据进行更新——先设置目标值 在实际绘制之前更新
    this.translate(
        core.calValue(this.info.x),
        core.calValue(this.info.y), 
        core.calValue(this.info.width), 
        core.calValue(this.info.height));
    // 2. 入栈、虚拟绘制
    if(UImanager.push(this)){// 成功推入
        core.insertAction(this.info.action.concat({"type": "function", "function": "function(){UImanager.pop()}"}));
    }else{
        UImanager.pop();
        //推入失败 直接调用pop
    }
}
// 更新位置和大小 可以被覆写 实现动态变化等
BaseWind.prototype.translate = function(x,y,w,h){
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
}
// 找到根
BaseWind.prototype.findRoot = function(){
    if(this.parent)return this.parent.findRoot();
    return this;
}
// 检查组件更新 如果需要更新 就返回true 否则false —— 仅在组件显示且活跃的情况下
BaseWind.prototype.checkUpdate = function(){
    var ret = false;
    for(var i in this.subwind){ //再绘制所有子画布
        ret = this.subwind[i].checkUpdate() || ret;
    }
    for(var i in this.components){
        if(this.components[i].update){
            ret = this.components[i].update() || ret;
        }
    }
    return ret;
}

/**
 * @class TextUtil 文字切分工具，度量一段话的长宽
 */
const TextUtil =  PIXI.TextMetrics;
const TextStyle = PIXI.TextStyle;
TextUtil.canBreakChars = function(cur, next){
    const chreg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;
    if(chreg.test(next) && !chreg.test(cur))// 下一个是标点且当前不是 则不能换行
        return false;
    return true;
    if(cur=='\n')return true;
    if(cur=='\\' && /[a-z]/.test(next)){
        return false;
    }
    return true;
}
TextUtil.wordWrapSplit  = function(token){
    return core.ui._getRealContent(token).split('');
}

/**
 * @class TextWind 文字框
 */
export class TextWind extends BaseWind {
    constructor(info, surface) {
        super(info, surface);
        this.title = null; // 标题是一个独立的TextWind
        /**
         * @property context 
         * @param position  默认位置在下侧
         */
        this.context = {
            style: new TextStyle({
                fill: 'white',
                fontSize: 18,
            }),
            position: [200,0],
            direction: 'down', //
            vborder: 16, // 垂直外框距
            hborder: 16, // 水平框距
            lineWidth: 10, // 行间距
            maxHeight: ~~(core.__PIXELS__ / 3),//这个不好估计
            maxWidth: core.__PIXELS__ + core.__BOARD_BLANK__<<1,//最大长宽
            index: 0,
            skin: this.skin,
            offsetX: 0,
            offsetY: 0,
            backX: 0,
            backY: 0,
            realMaxh: 0,
            realMaxw: 0,
            fit: false, // 不是自适应
            styleStack : [],//样式栈 有新的颜色要保存旧的 防止格式错乱
        };
        this.defaultConfig = {
            color: 'white',
        };

        // 控制字符解析器 TODO: 仅对需要控制字符的窗口加载
        this.parser = {};
        this.registerParser(['\n','\\n'], (c)=>{;
            this.drawTextBox_updateTextContext(0,0,true);
            return c;
        });
        this.registerParser(['\t','\\t'], (content)=>{
            let index1 = content.indexOf('[');
            let index2 = content.indexOf(']');
            this.drawTextBox_addTitle(content.substring(index1+1, index2))
            return content.substr(index2+1);
        });
        this.registerParser(['\r','\\r'], (content)=>{
            let index1 = content.indexOf('[');
            let index2 = content.indexOf(']');
            let color = content.substring(index1+1, index2);
            if(color==='')color = this.defaultConfig.color;
            this.context.styleStack.push(this.context.style);
            this.context.style = new TextStyle(this.context.styleStack[this.context.styleStack.length-1]);
            this.setContext('fill', color);
            return content.substr(index2+1);
        });
        // 时间占位符，\w[时间延迟毫秒数]会在打字机的情况下控制打字速度
        this.registerParser(['\w','\\w'], (content)=>{
            if(this.animate){
                let index1 = content.indexOf('[');
                let index2 = content.indexOf(']');
                this.animate.config.time = ~~content.substring(index1+1, index2);
                return content.substr(index2+1);
            }
            return content;
        });
        // 等待的控制字符，会在异步的情况下 执行下一个事件
        this.registerParser(['\d','\\d'], (content)=>{
            if(this.animate){
                core.doAction();
            }
            return content;
        });
    }
    /**
     * @method drawText 绘制文字对话框，如果大小超过当前大小 会试图撑大对话框——自适应调整对话框大小
     * @param { String } content 文字内容 
     * @param { Object } info 
     *  1. 文字信息 包括标题(title)、头像(head)、位置(position) 
     *  2. 控制信息 maxWidth 、 fontStyle、 等等……
     * */
    drawTextBox(content, info){
        this.removeChildren();
        // 加载配置
        this.setContextWithConfig(info);
        this.drawBackground();
        content = core.replaceText(content);

        let measure = TextUtil.measureText(content, this.context.style); // 计算真实长宽
        // 默认设置
        this.context.maxWidth = core.__PIXELS__;
        this.context.direction = 'down';
        this.context.head = null;
        this.context.fit = false;

        if(info.position){
            let posinfo = info.position.split(',');
            if(posinfo.length>1){// 需要做自适应
                /**
                 * 自适应原则：
                 * 行数不超过3时，平均单行文本不超过屏幕的一半
                 * 行数超过3时，宽度适度增加，但不能超过全屏幕的3/4
                 * 行数为1，且最大长度超过本长度，调整宽度至刚好框柱。
                 * */
                this.setContext('fit', true);
                let line = measure.lines.length;
                let totallen = 0;
                let avglen = 0;
                let halfScreen = ~~(core.__PIXELS__ / 2);
                for(let i in measure.lineWidths)totallen += measure.lineWidths[i];
                avglen = totallen / line;
                if(line>=3){
                    this.context.maxWidth = Math.min(avglen, core.__PIXELS__);
                }else if(avglen > halfScreen){
                    this.context.maxWidth = halfScreen;
                }else if(line==1 && measure.maxLineWidth>this.context.maxWidth){
                    this.context.maxWidth = measure.maxLineWidth;// 宽度调整
                }
            }else{
                // 位置大小固定
                this.context.direction = posinfo[0];
            }
        }
        this.drawTextBox_getPosition(info.position);
        this.drawTextBox_addTitle(info.title);
        this.drawTextBox_initTextContext();
        // content = core.ui._drawTextBox_drawImages(posInfo.content);
        
        this.animate = info.animate || this.animate;
       
        this.recurEnable();
        this.alpha = 0;
        AnimationManager.animate_fade(this, {alpha: 0.8, time: 200});
        this.drawTextBox_drawEachText(content);
    }
    // 完成打字之后的调用
    drawTextBox_complete(){
        MessageManager.mountOnceCodeListener('screenTap', ()=>{
            AnimationManager
            .animate_fade(this, {alpha: 0, time: 200})
            .call(()=>{
                this.recurDelete();//! 淡出后失能
                core.doAction();
                //清空信息
                // this.context.head = null;
                // this.context.fit = false;
                this.skin.removeArrow(this.context.direction);
            });
        });
    };

    /**
     * @method registerParser 注册一个字符格式控制器 会parse对应的字符 实现相应的功能
     * @param char 字符
     * @param func 执行函数
     */
    registerParser(char, func){
        if(char instanceof Array){
            for(let i in char)this.registerParser(char[i], func);
        }
        else this.parser[char] = func;
    }

    /**
     * 解析一段内容
     * @param { String } content 
     */
    parseContent(content){
        if(content[0] in this.parser){
            return this.parser[content[0]].call(this, content.substr(1));
        }else if(content.substr(0, 2) in this.parser){
            return this.parser[content.substr(0, 2)].call(this, content.substr(2));
        }
        return content;
    }

     /**
     * 获取对话框的位置信息
     */
    drawTextBox_getPosition(info){
        if(!info)return;
        let lst = info.split(',');
        this.context.direction = lst[0]; // 对话框的方向
        if(lst.length==2){
            if(lst[1]=='hero')
                this.context.head = ActorManager.getHero();
            else {
                this.context.head = EventManager.getActor(lst[1]);// 通过事件名找到角色
            }
        }else if (lst.length == 3) {
            this.context.head = MapManager.getActor(lst[1], lst[2]); // 通过位置找到角色
        }else{
            this.context.haed = null;
        }
        if(this.context.head){
            // this.context.head.exSprite.text = this; // 仅仅将本窗口作为其一个附带品 而非其子窗口 x
            // 如何使得动画的角色带着窗口移动？——选择打字机效果即可
        }else this.context.head = null;
    }
    
     /**
     * 添加标题
     */
    drawTextBox_addTitle(text){
        if(!text)return;
        if(!this.title){
            this.title = new TextWind(null, SpriteManager.getWinSprite(this.context.skin));
            this.title.setContextWithConfig({maxWidth: 32, maxHeight:32, vborder: 8, hborder:8 ,'fit': true});
        }
        this.title.drawSingleText(text);
        this.title.setContext('backY', -this.title.context.realMaxh);//TODO @_@ 标题栏的位置?
        this.title.refreshSize();
        this.addChild(this.title);
    }
    // 依次绘制每个文字
    /**
     * 
     * @param {String} content
     */
    drawTextBox_drawEachText(content){
        if(content.length == 0){
            this.drawTextBox_complete();
            return;
        }
        do{
            var last = content;
            content = this.parseContent(content);
        }while(content!==last);
        let c = content[0];
        let txt = SpriteManager.getTextSprite(c, this.context.style);
        txt.x = this.context.x;
        txt.y = this.context.y;
        this.drawTextBox_updateTextContext(txt.width, txt.height);
        this.draw(txt);
        let call = ()=>{this.drawTextBox_drawEachText(content.substr(1))};
        this.refreshSize();
        if(this.animate){
            this.animate
                .get(this)
                .call(call);
        }
        else call();
    }
     /**
     * 初始化文字描绘上下文
     */
    drawTextBox_initTextContext(){
        this.context.offsetX = this.context.hborder;
        this.context.offsetY = this.context.vborder;
        this.context.x = this.context.offsetX; // 实际执行中的坐标
        this.context.y = this.context.offsetY;
        this.context.backX = core.__STATUS_WIDTH__+core.__BOARD_BLANK__; // TODO: 自适应定位
        if(this.context.direction=='up'){
            this.context.backY = 0;
        }
        if(this.context.direction=='center'){this.context.backY = (core.__PIXELS__ /2-this.context.maxHeight/2);}
        if(this.context.direction=='down'){this.context.backY = (core.__PIXELS__-this.context.maxHeight);}
        // if(this.context.style.align=='center')this.context.x = ~~(this.context.maxWidth / 2);//居中暂不考虑 涉及文字组的移动
        // if(this.context.style.align=='right')this.context.x = this.context.maxWidth;
        this.context.realMaxh = 0; // 真实描绘后的长宽
        this.context.realMaxw = 0;
        this.context.realMaxlw = 0;
        this.context.styleStack = [];
    }
    /**
     * 绘制中更新上下文，需要传入文字的长宽
     */
    drawTextBox_updateTextContext(w, h, forceChange){
        let ctx = this.context;
        ctx.x += w;
        if(h>ctx.realMaxlw)ctx.realMaxlw = h;
        if(ctx.x > ctx.realMaxw)ctx.realMaxw = ctx.x;
        if(ctx.x + ctx.hborder + w >= ctx.maxWidth || forceChange){//换行
            ctx.x = ctx.offsetX;//回到偏移起点
            ctx.y += ctx.realMaxlw + ctx.lineWidth;
        }
        if(ctx.y+h > ctx.realMaxh)ctx.realMaxh = ctx.y+h;
    }

    /**
     * 只绘制一段话 可用于标题框、状态栏
     * @param { String } text 
     * @param { Number } bias_x 
     */
    drawSingleText(text, noclear, x, y){
        if(!noclear)this.removeChildren();
        this.drawBackground();
        let txt = SpriteManager.getTextSprite(text);//可缓冲池优化
        txt.x = x || this.context.hborder + this.context.offsetX;
        txt.y = y || this.context.vborder + this.context.offsetY;
        this.draw(txt);
        this.context.realMaxh = txt.height;
        this.context.realMaxw = txt.width;
        this.refreshSize();
    }

    /**
     * 绘制一个图标
     */
    drawIcon(id, x, y){
        let img = SpriteManager.getSprite(id);
        img.x = this.context.hborder + this.context.offsetX;
        img.y = this.context.vborder + this.context.offsetY;
        this.refreshSize();
    }
    hasSkin(){
        return this.context.skin;
    }
    /**
     * 绘制背景 —— 如果有皮肤的话
     */
    drawBackground() {
        if(this.hasSkin()){
            this.draw(this.context.skin);
        }
    }

    refreshSize(){
        if(this.hasSkin()){
            if(this.context.fit){
                this.context.skin.width = this.context.realMaxw + 2 * this.context.hborder;
                this.context.skin.height = this.context.realMaxh+ 2 * this.context.vborder;
            }
            else {
                this.context.skin.width = this.context.maxWidth;
                this.context.skin.height = this.context.maxHeight;
            }
        }
        if(this.context.head){
            let pos = this.context.head.sprite.getGlobalPosition();
            let ph = this.context.head.sprite.height;
            let _x = ~~(pos.x - (this.width>>1));
            this.x = _x;
            if(this.context.skin && this.context.direction!='center'){
                this.context.skin.setArrow(this.context.direction, _x>>1);
            }
            switch(this.context.direction){
                case 'up':
                    this.y = pos.y - this.height;// - ph ;
                    break;
                case 'center':
                    this.y = pos.y;
                    break;
                case 'down':
                    this.y = pos.y + ph;
                    break;
            }
        }else {
            this.x = this.context.backX || 0;
            this.y = this.context.backY || 0;
        }
        this.recurEnable();
    }

    /**
     * 通过配置字典设置上下文环境
     * @param {} key 预设范围：color（文字颜色）、position（对话框位置）、border（文字到周边的最小距离）、
     */
    setContextWithConfig(config){
        for(let k in config){
            let v = config[k];
            if(k in this.context.style)this.context.style[k] = v;
            else if(k!='style') this.context[k] = v;
            if(k=='time'){// 存在打字动画
                this.animate = AnimationManager.getAnimate('wait', this.context);
            }
        }
    }
    /**
     * 设置上下文环境
     * @param {} key 预设范围：color（文字颜色）、position（对话框位置）、border（文字到周边的最小距离）、
     */
    setContext(key, value){
        if(key in this.context){
            if(key != 'style')
                this.context[key] = value;
        }else if(key in this.context.style){
            this.context.style[key] = value;
        }
    }
}


/**
 * 
 */