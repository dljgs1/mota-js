
//  基本场景- 就是container 包装了name以及renderTo
// function BaseScene(name){
//     this.name = name;
//     this._init.apply(this, Array.prototype.slice.call(arguments, 1));
// }
// BaseScene.prototype =  Object.create(PIXI.Container.prototype);
// BaseScene.prototype._init = function(){
//     PIXI.Container.call(this);
// }

const Rectangle = PIXI.Rectangle;
const Point = PIXI.Point;
const Graphics = PIXI.Graphics;

/**
 * 基本场景
 */
export class BaseScene extends PIXI.Container{
    constructor(name) {
        super();
        this.name = name;
    }
}
// 渲染到一个相机
BaseScene.prototype.renderTo = function(ctx){
    ctx.render(this);
};
