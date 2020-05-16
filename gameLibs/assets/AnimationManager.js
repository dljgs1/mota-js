import { AnimatePromise } from "../utils/promise.js"
import { BaseScene } from "../scene/BaseScene.js"
import SceneManager from "../scene/SceneManager.js"
/*
    动画管理 基于Tweetjs

// 动画补间库：
// https://cloud.tencent.com/developer/article/1435284
*/
const Tween = createjs.Tween;
const Ease = createjs.Ease;

export default new class AnimationManager {
    constructor() {
        this.playingList = {}; // 持续播放的动画会挂在这里
    }
    /**
     * 获取一个指定配置和形式的动画对象
     * 支持简易的promise，包括apply、call、then的方法
     * @param name 动画类型
     * @param config 动画配置
     */
    getAnimate(name, config) {
        return new AnimatePromise(name, config);
    };
    /**
     * 获取一个动画函数 这个函数对象可以绑定任意对象+回调的组合
     */
    //AnimationManager.prototype.getAnimate = function(name, config){
    //};
    /**
     * 基本动画构造函数 1 等待
     *
     * 动画函数格式：1. 参数保持sprite+config 2. 必须返回一个Tween对象用以调用回调函数
     */
    animate_wait(sprite, config, callback) {
        config.time = config.time || 500;
        return Tween.get(sprite, {}).wait(config.time).call(callback);
    }

    // 不可用的实验品：
    animate_waitDoAction(sprite, config, callback) {
        config.time = config.time || 500;
        return Tween.get(sprite, {}).wait(config.time)
            .call(() => { core.doAction(); })
            .call(callback);
    }
    /**
     * 2. 走路动画，一般指在地图上走，所以步长固定core.__BLOCK_SIZE__
     * @param sprite
     * @param config
     * @param callback
     * @returns {*}
     */
    animate_walk(sprite, config, callback) {
        let direction = config.direction;
        let time = config.time || 50;
        // sprite.playing = true;
        if (sprite.pattern)
            sprite.pattern = direction;
        let sx = sprite.x, sy = sprite.y;
        const dx = core.utils.scan[direction].x, dy = core.utils.scan[direction].y;
        const stepSize = core.__BLOCK_SIZE__ / 4;
        return Tween.get(sprite)
            .to({ x: ~~(sx + dx * stepSize), y: ~~(sy + dy * stepSize) }, ~~(time / 4))
            .call(function (e) {
                if (e.target.gotoAndStop)
                    e.target.gotoAndStop((e.target.currentFrame + 1) % e.target.totalFrames);
            })
            .to({ x: ~~(sx + dx * stepSize * 4), y: ~~(sy + dy * stepSize * 4) }, ~~(time / 4 * 3))
            .call(function (e) {
                if (e.target.gotoAndStop)
                    e.target.gotoAndStop((e.target.currentFrame + 1) % e.target.totalFrames);
                if (callback)
                    callback();
            });
    }
    /**
     * 3. 渐变透明度动画，一般指在地图上走，所以步长固定core.__BLOCK_SIZE__
     * @param sprite
     * @param config
     * @param callback
     * @returns {*}
     */
    animate_fade(sprite, config, callback) {
        let time = config.time || 500;
        let toAlpha = config.alpha || 0;
        return Tween.get(sprite)
            .to({ alpha: toAlpha }, time)
            .call(() => {
            if (callback)
                callback();
            });
    }

    /**
     * 4. 缓动动画obj不一定是sprite
     * @param obj
     * @param config
     * @param callback
     * @returns {*}
     */
    animate_easeMove(obj, config, callback) {
        let time = config.time || 500;
        let param = config.param || 1.5;
        return Tween.get(obj)
            .to(config, time, Ease.getPowIn(param))//getPowIn
            .call(() => {
                if (callback)
                    callback();
            });
    }

    /**
     * 添加一次性动画
     * @param sprite
     * @param name
     */
    addAnimate(sprite, name, config, callback) {
        let fn = this['animate_' + name];
        if (fn) {
            fn.call(this, sprite, config, callback);
        }
    }
    // 添加帧动画 默认会持续播放 勾选once表示只放一次
    addFrameAnimate(sprite, once, callback) {
        if(!sprite.gotoAndStop){console.log('没有动画');return callback&&callback();}
        return createjs.Tween.get(sprite, { loop: !once })
            .wait(500) // TODO 全局控制动画速度
            .call(function (e) {
                try{
                    e.target.gotoAndStop((e.target.currentFrame + 1) % e.target.totalFrames);
                }catch(_e){
                    debugger;
                } // 实现精准定时
                if (once && callback)
                    callback();
            });
    }
    /*
    4-21
        TODO: 精灵自然行走、跳跃、
        ex：普通的块也可以模拟此类行为
    */
    /////////////////////// 地图角色类的动画 //////////////////////////////
    // 添加移动动画
    addMovement(sprite, config, callback) {
        var list = this.playingList;
        var aid = setTimeout(null); //动画编号
        sprite.playing = true;
        var hwnd = createjs.Tween.get(sprite)
            .to({ x: config.x, y: config.y }, config.time || 500)
            .call(function () {
                delete list[aid];
                if (callback)
                    callback();
            });
        list[aid] = hwnd;
        return hwnd;
    }
    // 添加走路动画——移动的过程中需要摆腿(??) 摆腿规则：一个块到另一个块共四段 1、4为停 23为摆腿状态
    // setpSize默认为core.__BLOCK_SIZE__ steps是
    // 当前问题：必须要较高的帧率FPS>60 才能有较好的效果——有没有折中方案？——少摆一次腿试试
    addWalking(sprite, config, callback) {
        main.log('walk');
        let direction = config.direction;
        let time = config.time || 50;
        const list = this.playingList;
        const aid = setTimeout(null); //动画编号
        sprite.playing = true;
        if (sprite instanceof ActorSprite) // 角色类 可控朝向
            sprite.pattern = direction;
        let sx = sprite.x, sy = sprite.y;
        const dx = core.utils.scan[direction].x, dy = core.utils.scan[direction].y;
        const stepSize = core.__BLOCK_SIZE__ / 4;
        const hwnd = createjs.Tween.get(sprite)
            .to({ x: ~~(sx + dx * stepSize), y: ~~(sy + dy * stepSize) }, ~~(time / 4))
            .call(function (e) {
                e.target.gotoAndStop((e.target.currentFrame + 1) % e.target.totalFrames);
            })
            .to({ x: ~~(sx + dx * stepSize * 4), y: ~~(sy + dy * stepSize * 4) }, ~~(time / 4 * 3))
            .call(function (e) {
                e.target.gotoAndStop((e.target.currentFrame + 1) % e.target.totalFrames);
                delete list[aid];
                if (callback)
                    callback();
            });
        //.to({x: ~~(sx+dx*stepSize*4), y: ~~(sy+dy*stepSize*4)}, ~~(time/4))
        //.call(function(){
        //    delete list[aid];
        //    if(callback)callback();
        //});
        list[aid] = hwnd;
        return hwnd;
    }
    // 添加跳跃动画
    addJump(sprite, config, callback) {
    }
    // 添加渐变动画
    addFading(sprite, config, callback) {
    }
    // 添加灯光
    addSourceLight(lightArr) {
        lightArr = lightArr || [];
        let tmp = new LightFilter();
        for (let i in lightArr) {
            tmp.addPosition(lightArr[i][0] / 416, lightArr[i][1] / 416);
        } //layers.map.
        SceneManager.mapScene.filters = [tmp];
        return tmp;
    }
    changeColor(sprite, r, g, b, a) {
        sprite.filters = [new TestFilter()];
        sprite.filters[0].changeLight(r, g, b, a);
    }
    // 添加灯光
    addLight(lightArr) {
        lightArr = lightArr || [];
        let tmp = new BaseScene('light');
        for (let i in lightArr) {
            let pos = lightArr[i][0];
            let r = lightArr[i][1];
            let color = lightArr[i][2];
            let circle = new PIXI.Graphics()
                .beginFill(color)
                .drawCircle(pos[0], pos[1], r, r);
            circle.filters = [
                new PIXI.filters.ColorMatrixFilter(),
                new PIXI.filters.BlurFilter(25)
            ];
            circle.filters[0].brightness(10, 1);
            circle.filters[0].alpha = 0.2;
            tmp.addChild(circle);
        }
        SceneManager.mapScene.addChild(tmp);
        return tmp;
    }
}();

const fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float m[4];
uniform float uAlpha;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);
    if (uAlpha == 0.0) {
        gl_FragColor = c;
        return;
    }
    if (c.a > 0.0) {
      c.rgb /= c.a;
    }
    vec4 result;
    result.r = m[0] + c.r;
    result.g = m[1] + c.g;
    result.b = m[2] + c.b;
    result.a = c.a;
    gl_FragColor = clamp(result, 0.0, 1.0);
}
`;
/**
 * 光源 m=[x,y,v]
 * 原理：离光源越近的点越亮，亮度即rgb*
 * @type {string}
 */
const frag_test =
    `
    varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform vec2 scale;
uniform mat2 rotation;
uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform highp vec4 inputSize;
uniform vec4 inputClamp;

void main(void)
{
    vec4 map =  texture2D(mapSampler, vFilterCoord);

    map -= 0.5;
    map.xy = scale * inputSize.zw * (rotation * map.xy);

    gl_FragColor = texture2D(uSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));
}

    `;
const vertex_test =
    `
varying float violence;
uniform float m[4];
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
    violence = 1.1;
}

    
    `;


const vertex_light =`
attribute vec2 aVertexPosition;

varying float violence;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;
    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	violence = distance(gl_Position.xy,vec2(m[0],m[1])*416.); 
    vTextureCoord = filterTextureCoord();
    //vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}

`;

const fragment_light = `

uniform float m[4];
uniform float blocks[169];
varying float violence;

varying vec2 vTextureCoord;

uniform float uAlpha;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

void main(void)
{
    vec4 c = texture2D(uSampler, vTextureCoord);
    vec4 map = texture2D(mapSampler, vTextureCoord);
    vec2 dest = vec2(m[0],m[1]) * 416.;
    if (uAlpha == 0.0) {
        gl_FragColor = c;
        return;
    }
    if (c.a > 0.0) {
        c.rgb /= c.a; // 计算真实的rgb 因为pixi会做一次透明乘法
    }
    vec2 cur = vTextureCoord.xy * 416.;
    float dist = distance(cur, dest);
    float a = 1.0;
    if(dist> 10.0){// 
        a = 1.-dist/200.;
        // gl_FragColor = vec4(0.2431, 0.302, 0.8471,1.0);
    }else{
        // gl_FragColor = vec4(0.,1.,0.,1.0);
    }
    dist = clamp(dist, 0.1, 10.0);
    
    vec4 result;
    result.r = c.r * a;
    result.g = c.g * a;
    result.b = c.b * a;
    result.a = c.a;
    
    gl_FragColor = clamp(result, 0.0, 1.0);
}
`;

class LightFilter extends PIXI.Filter{
    constructor() {
        // super(null, fragment_light);
        //vertex_test
        super(null, fragment_light);
        this.uniforms.m = [0.5,0.5,0,0];
        let blocks = [];
        core.getMapArray().forEach(arr=>{blocks = blocks.concat(arr)});
        this.uniforms.blocks = blocks;
        this.uniforms.uAlpha = 0.5;
    }
    addPosition(x, y){
        this.uniforms.m[0] = x;
        this.uniforms.m[1] = y;
    }
}



class TestFilter extends PIXI.Filter{
    constructor() {
        super(null, fragment);
        this.uniforms.m = [0,0,0,0];
        this.uniforms.uAlpha = 0.5;
    }
    changeLight(r,g,b,a){
        this.uniforms.m = [r/255,g/255,b/255,a/255];
    }
}




/////////////////// UI 动画 //////////////////////

// Slide 地图滚动

// 震动

// 波动