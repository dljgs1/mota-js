import { BaseScene } from "./BaseScene.js"
import { Camera } from "./Camera.js";
import { MapScene } from "./MapScene.js"
import { Curtain } from "./Curtain.js";

import ControlManager from "../system/ControlManager.js"
import MessageManager from "../system/MessageManager.js"
import SpriteManager from "../assets/SpriteManager.js";
import {Listener} from "../system/Base.js";

/*
    运行时场景管理

*/
/* 
场景基类


基本定义
1. 场景是基于一个实际画布的绘制组
2. 绘制体是绘制组的一员，是最基本的渲染单元，
3. 基本渲染单元（图元：sprite）包括的数据有：1个材质引用、1组尺寸（xywh）、1优先级
4. 用层分隔优先级的对比

基本功能范畴：
1. 场景存储所有绘制数据，不接收任何业务数据，提供修改绘制数据的接口
2. 场景管理要考虑部分重绘的情况（四叉树实现）
3. 全重绘


场景-接口：
1. 添加一层
2. 移除一层
3. 添加图元到某层



追加设定：
1. 无嵌套的场景有摄像机，有嵌套的没有


*/

//function SceneManager(){
//}
export default new class SceneManager extends Listener{
    constructor() {
        super();
        this._init();
    }
    _init() {
        const self = this;
        let renderer = main.render;
        this.application = renderer;

        this.stageHeight = core.__PIXELS__ + core.__BOARD_BLANK__ * 2;
        this.stageWidth = core.__PIXELS__ + core.__BOARD_BLANK__ * 3 + core.__STATUS_WIDTH__;

        let mainScene = new BaseScene('main'); // 主窗口 所有画面
        let mapScene = new MapScene('maps');
        let statusScene = new BaseScene('status'); // TODO: 状态栏属于UI 还是属于场景？
        let FilterScene = new BaseScene('filter'); // 地图特效处理层 渲染区域与地图一致 但视角不变
        let curtainScene = new Curtain(); // mapmask

        /**
         * 相机：仅对大小超出边界的使用
         * todo: 对定域场景，加入tillingSprite撑开
         * @type {{map: Camera, status: Camera}}
         */
        this.cameras = {
            map: new Camera(true, core.__STATUS_WIDTH__, 0, core.__PIXELS__ + core.__BOARD_BLANK__*2, core.__PIXELS__ + 2*core.__BOARD_BLANK__),
            status: new Camera(false, 0,0,this.stageWidth, this.stageHeight),
        };
        this.scenes = {
            map: mapScene,
            status: statusScene,
            curtain: curtainScene,
        };
        this.drawList = ['map',  'curtain', 'status',];
        // 主场景构建
        for(let i of this.drawList){
            mainScene.addChild(this.scenes[i]);
        }
        statusScene.width = this.stageWidth;
        statusScene.height = this.stageHeight;

        // 相机初始化
        this.cameras.map.setViewPoint(core.__PIXELS__>>1, core.__PIXELS__>>1, 1.0, 0);
        this.cameras.map.setViewBounds(core.__PIXELS__>>1, core.__PIXELS__>>1, core.__PIXELS__>>1, core.__PIXELS__>>1);
        // this.cameras.curtain.setViewPoint(core.__PIXELS__>>1, core.__PIXELS__>>1, 1.0, 0);
        // this.cameras.curtain.strictArea = false;
        this.cameras.status.setViewPoint(this.stageWidth>>1, this.stageHeight>>1, 1.0, 0);

        if(main.mode=='editor'){
            this.cameras.map.setRenderArea(-core.__BOARD_BLANK__, -core.__BOARD_BLANK__);
        }
        this.debugInfo = {
            fps: new PIXI.Text('This is a PixiJS text', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' }),
            ptr: new PIXI.Text('This is a PixiJS text', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' }),
            wh: new PIXI.Text('This is a PixiJS text', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' }),
            log: new PIXI.Text('logger', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' }),
        };
        ['hp', 'atk', 'def'].forEach((e) => { this.debugInfo[e] = new PIXI.Text('hp', { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' }); });
        let y = 0;
        if(main.mode=='play')
        for (let d in this.debugInfo) {
            this.debugInfo[d].y = y;
            statusScene.addChild(this.debugInfo[d]);
            y += 32;
        }
        this.mapScene = mapScene;
        this.statusScene = statusScene;
        this.filterScene = FilterScene;
        this.mainScene = mainScene;
        // 注册到帧动画——在main.replaying的时候取消
        MessageManager.registerConsumer('frame', this);
        this.on('tick', (event)=>{
            self._update(event);
        });
    }
    ///// 自适应横屏  /////
    rendererResize() {
        let stage = this.mainScene;
        let [width, height] = [main.dom.body.clientWidth, main.dom.body.clientHeight];
        let ratio = 1;
        if ((width > this.stageWidth && height > this.stageHeight)) {
            width = this.stageWidth;
            height = this.stageHeight;
        }
        main.render.resolution = 2; //TODO
        if (width >= height) {
            stage.rotation = 0;
            stage.x = 0;
            ratio = width / this.stageWidth;
            this.isVertical = false;
            ControlManager.t.setHorizontal();
        }
        else {
            ControlManager.t.setVertical();
            this.isVertical = true;
            stage.rotation = Math.PI / 2;
            width = Math.min(width, this.stageHeight);
            stage.x = width;
            ratio = Math.min(height / this.stageWidth, width / this.stageHeight);
        }
        this.application.view.style = `width:${width}px;height:${height}px;`;
        ratio = Math.min(1, ratio);
        if (ControlManager.pointer) {
            ControlManager.pointer.scale = ratio;
        }
        stage.scale.set(ratio);
        this.application.resize(width, height);
        // 重定位相机坐标系
        if(this.cameras)
            for(let c in this.cameras){
                this.cameras[c].setMask(null, null, null, null, this.isVertical);
            }
    }



    /**
     * 检查一个点的边界信息 返回到当前视界的推土机距离 如果距离只要有一个为负表示在视界范围内
     * @param { String } name 
     * @param { Point } pt 
     */
    checkBound(name, pt, tolerance){
        tolerance = tolerance || 0;
        let camera = this.cameras[name];
        let bound = camera.checkBound(pt);
        
        bound.outBound = (bound.dx<-tolerance || bound.dy<-tolerance);
        return bound;
    }



    _update(event) {
        this.debugInfo.fps.text = 'fps:' + ~~(1000 / event.delta); //TODO: 自适应调整fps 使之适应设备性能与画面
        if (ControlManager.pointer)
            this.debugInfo.ptr.text = (ControlManager.pointer.x + ' ' + ControlManager.pointer.y) + (SceneManager.isVertical ? ' vertical ' : 'horzintal'); //TODO: 自适应调整fps 使之适应设备性能与画面
        this.debugInfo.wh.text = 'w&h:' + main.dom.body.clientWidth + ',' + main.dom.body.clientHeight; //TODO: 自适应调整fps 使之适应设备性能与画面

        if (core.status.hero) {
            this.debugInfo.hp.text = 'hp:' + core.status.hero.hp;
            this.debugInfo.atk.text = 'atk:' + core.status.hero.atk;
            this.debugInfo.def.text = 'def:' + core.status.hero.def;
        }

        // 更新相机
        for(let name in this.cameras){
           this.cameras[name].refresh(this.scenes[name]);
        }
        // 主场景渲染 —— 只渲染一次
        this.mainScene.renderTo(main.render);
    }

    /**
     * 重定位相机
     */
    relocateCamera(name, config, animate){
        let camera = this.cameras[name];
        if(!camera)return;
        if(camera.transform)return;//已经绑定了坐标 不能定位
        if(!animate){
            camera.setViewPoint(config.x, config.y);
        }else{
            animate.get(camera.viewPoint, config);
        }
    }


    /**
     * 获取一个遮罩
     * @param name
     * @param color
     */
    getCurtain(name, color){
        if(!name in this.scenes)return null;
        let area = this.cameras[name].renderArea;
        let ctx = this.scenes.curtain.maskTo(name, area, color);
        return ctx;
    }

    /**
     * 设置地图的视角边界
     */
    setMapViewBounds(minX, minY, maxX, maxY){
        this.cameras.map.setViewBounds(minX, minY, maxX, maxY)
    }

    /**
     *
     * @param e
     */

    log(e) {
        this.debugInfo.log.text = e; //TODO: 自适应调整fps 使之适应设备性能与画面
    }
    startDebugger(e) {
        return;
        MessageManager.registerConsumer('user', {
            receive: () => {
                while (1) {
                    try {
                        let v = promot('输入');
                        if (v == 'q')
                            break;
                        main.log(v);
                    }
                    catch (e) {
                        main.log('e:', e);
                    }
                    this.mainScene.renderTo(main.render);
                }
            }
        });
    }
}();
