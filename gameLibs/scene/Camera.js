const Rectangle = PIXI.Rectangle;
const Graphics = PIXI.Graphics;
/**
 * 相机
 * 一个场景Scene只有一个摄像机
 * 摄像机需要照射到Scene才能渲染到屏幕
 *
 *
 * TODO： 相机，是【实体】！！！
 */
export class Camera{
    /**
     *
     * @param { Boolean } withMask 是否将超出视窗外的遮住
     * @param { Number } x 摄像机坐标
     * @param { Number } y
     * @param { Number } w 摄像机大小
     * @param { Number } h
     * @returns {*}
     */
    constructor(withMask, x, y, w, h){
        const self = this;
        /**
         * 在游戏窗口的渲染区域 MaskData
         * @type {Rectangle}
         */
        this.renderArea = new Rectangle(x, y, w, h);

        this.withMask = withMask;
        if(withMask){
            /**
             * 掩码
             * @type {null}
             */
            this.setMask();
        }
        /**
         * 绑定的transform对象 如果绑定 则会依据对象的坐标进行调整
         * *通常绑定到sprite
         * @type {null}
         */
        this.transform = null;
        /**
         * 所照向的场景对象
         */
        this.sceneObj = null;
        /**
         * 严格区域 设置边界 实际渲染时，viewPoint会被收束到renderArea边界中——即 不会有黑边
         */
        this.strictArea = null;


        /**
         * 目标场景的观察点（center）
         * x,y: 中心坐标
         * scale: 放大率（暂时不分xy）
         * rotate: 旋转角度
         * @type {Rectangle}
         */
        let _x = core.__PIXELS__/2, _y = core.__PIXELS__/2, _scale = 1;
        this.viewPoint = {
            _x: core.__PIXELS__/2,
            get x(){
                if(self.transform){
                    return self.transform.x;
                }else{
                    return this._x;
                }
            },
            set x(v){
                this._x = v;
            },
            _y: core.__PIXELS__/2,
            get y(){
                if(self.transform){
                    return self.transform.y;
                }else{
                    return this._y;
                }
            },
            set y(v){
                this._y = v;
            },
            _scale: 1,
            get scale(){
                return this._scale;
            },
            set scale(v){
                this._scale = v;
            },
            _rotation: 0,
            get rotation(){
                if(self.transform){
                    return self.transform.rotation;
                }else{
                    return this._rotation;
                }
            },
            set rotation(v){
                this._rotation = v;
            },
        };



        // 覆盖在观察区域的filter
        this.filter = null;
    }

    /**
     * 设置mask
     */
    setMask(x, y, w, h, vertical){
        if(!this.withMask)return;

        x = x==null ? this.renderArea.x: x;
        y = y==null ? this.renderArea.y: y;
        w = w==null ? this.renderArea.width: w;
        h = h==null ? this.renderArea.height: h;

        if(vertical){
            [x,y] = [y,x];
        }

        this.mask = new Graphics();
        this.mask.beginFill(0xFF3300, 0.5);
        this.mask.drawRect(x, y, w, h);
        this.mask.endFill();
    }
    /**
     * 清除mask
     */
    removeMask(){
        this.withMask = false;
        this.mask = null;
    }


    /**
     * 设置视界
     */
    setViewBounds(minX, minY, maxX, maxY){
        this.strictArea = {
            minX: minX,
            minY: minY,
            maxX: maxX,
            maxY: maxY,
        }
    }
    /**
     * 检查边界 返回到各个边界的距离（不含方向）
     * 距离为负表示在边界外 否则为边界内
     * @param {*} scene 
     */
    checkBound(pt){
        let cx = this.viewPoint.x;
        let cy = this.viewPoint.y;
        let scale = this.viewPoint.scale;
        const area = this.renderArea;
        const dw = (~~(area.width / scale))>>1;
        const dh = (~~(area.height / scale))>>1;
        let dx = cx - pt.x;
        let dy = cy - pt.y;
        if(dx<0){
            dx += dw;
        }else{
            dx = dw - dx;
        }
        if(dy<0){
            dy += dh;
        }else{
            dy = dh - dy;
        }
        return {dx:dx, dy:dy};
    }

    /**
     * 刷新场景的位置
     * @param scene
     */
    refresh(scene){
        // 场景目标坐标
        let cx = this.viewPoint.x;
        let cy = this.viewPoint.y;
        // 实际半屏坐标
        let dw = this.renderArea.width >> 1;
        let dh = this.renderArea.height >> 1;
        // let mw = scene.width > this.renderArea.width ? scene.width: this.renderArea.width;
        // let mh = scene.height > this.renderArea.height ? scene.height: this.renderArea.height;

        // 严格化区域 : cx和cy不能超过这个值 在到达大地图之后自行设置
        if(this.strictArea){
            cx = cx < this.strictArea.minX ? this.strictArea.minX: cx;
            cy = cy < this.strictArea.minY ? this.strictArea.minY: cy;
            cx = cx > this.strictArea.maxX ? this.strictArea.maxX: cx;
            cy = cy > this.strictArea.maxY ? this.strictArea.maxY: cy;
        }
        if(this.withMask)
            scene.mask = this.mask;
        else
            scene.mask = null;
        //
        //if(dh - cy + this.renderArea.y != 0)debugger;
        scene.x = dw - cx + this.renderArea.x;
        scene.y = dh - cy + this.renderArea.y;

        scene.rotation = this.viewPoint.rotation;
        scene.scale.set(this.viewPoint.scale, this.viewPoint.scale);// TODO: xy放大率？
    }

    /**
     * 设置视角
     */
    setViewPoint(x, y, scale, rotation){
        this.viewPoint.x = x;
        this.viewPoint.y = y;
        if(scale!=undefined)this.viewPoint.scale = scale;
        if(rotation!=undefined)this.viewPoint.rotation = rotation;
    }

    /**
     * 设置渲染区域
     */
    setRenderArea(x, y, width, height){
        this.renderArea.x = x;
        this.renderArea.y = y;
        if(width!=undefined)this.renderArea.width = width;
        if(height!=undefined)this.renderArea.height = height;
        if(this.withMask){
            this.setMask();
        }
    }

    /**
     * 绑定一个位移对象
     */
    bindTransformObj(obj){
        this.transform = obj;
    }




}