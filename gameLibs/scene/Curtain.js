/**
 * 遮罩层
 */

import { BaseScene } from "./BaseScene.js";

const Graphics = PIXI.Graphics;

export class Curtain extends BaseScene{
    constructor(){
        super('curtain');
        this.maskList = {};
    }

    /**
     * 取得一个遮罩层 标识符为name
     * @param name
     * @returns {*}
     */
    getMask(name){
        if(!this.maskList[name]){
            this.maskList[name] = new Graphics();
        }
        return this.maskList[name];
    }

    /**
     * 对一个目标进行遮罩
     */
    maskTo(name, area, color, alpha){
        if(!this.maskList[name]){
            this.maskList[name] = new Graphics();
            this.addChild(this.maskList[name]);
        }
        let ctx = this.maskList[name];
        if(!color)return ctx;
        if(color instanceof Array){
            color = (color[0]<<16) + (color[1]<<8) + color[2];
            alpha = color[3] || alpha;
        }
        ctx.clear();
        ctx.beginFill(color, alpha);
        ctx.drawRect(area.x, area.y, area.width, area.height);
        ctx.endFill();
        return ctx;
    }
    clearMask(name){
        let ctx = this.maskList[name];
        if(ctx)ctx.clear();
    }
}