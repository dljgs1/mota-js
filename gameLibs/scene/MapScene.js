import { BaseScene } from "./BaseScene.js"
import SpriteManager from "../assets/SpriteManager.js"
import { MapStack } from "../utils/data.js";

/**
 * 地图场景
 * @param MapScene
 * @extends { BaseScene }
 */
export class MapScene extends BaseScene {
    /**
     *
     * @param { String } name
     */
    constructor(name) {
        super(name);
        this.layers = {};
        var maps = ['bgmap', 'bg2map', 'map', 'fgmap', 'fg2map','dmg'];//TODO：定制层数
        for (var i in maps) {
            var tmp = new BaseScene(maps[i]);
            this.layers[maps[i]] = tmp;
            this.addChild(tmp);
        }
        this.layers['map'].sortableChildren = true;
    }
}

/**
 * 绘制一张地图
 *
 */
MapScene.prototype.drawMap = function(floorId){
    var src = core.floors[floorId];//  todo 送入数据 数据由输入决定
    // 1. 清空
    for(var i in this.children){
        this.children[i].removeChildren();
    }
    // 2. 前景或背景图片
    this._drawMap_drawFloorImages(src);
    // 3. 各层图块
    this._drawMap_drawAll(floorId);
    // 4. 显伤
    this.updateDamageInfo(floorId);
    // 5. 添加勇者
    this.drawHero();
};

/**
 * 
 */
MapScene.prototype.drawHero = function(){
    if(main.mode=='play')
        this.layers['map'].addChild(ActorManager.getHero().sprite);
    ActorManager.getHero().refreshPriority();
}

/**
 * 
 */
MapScene.prototype.clearMap = function(name){
    this.layers[name].removeChildren();
}
/**
 * 绘制一个楼层的前景和背景图
 * 如果有图存在 且为平铺 则不绘制地板图
 * 标识方法： 默认为背景
 * 0 : 拉伸平铺
 * 1 : 重复
 * 2 : 放置
 * [
 *  ["image.png", "bg2", 1],
 *  ["","fg"]
 *  ["","fg"]
 * ]
 * @param src
 * @private
 */
MapScene.prototype._drawMap_drawFloorImages = function(src){
    let noBack = true;
    if(src.images.length){
        for(let img of src.images){
            if(typeof img == "string"){
                img = [img, 'bg', 0];
            }
            img[1] = img[1] || 'bg';
            let sprite;
            if(img[2]==1){
                sprite = SpriteManager.getTilingSprite(img[0]);
                sprite.width = src.width * core.__PIXELS__;
                sprite.height = src.height * core.__PIXELS__;
                noBack = false;
            }else{
                sprite = SpriteManager.getSprite(img[0]);
                if(img[2]!=2){
                    sprite.width = src.width * core.__PIXELS__;
                    sprite.height = src.height * core.__PIXELS__;
                    noBack = false;
                }
            }
            this.drawImageSprite(img[1]+'map', sprite, 0, 0);
        }
    }
    if(noBack && src.defaultGround){
        var back = SpriteManager.getTilingSprite(src.defaultGround);
        back.width = src.width * core.__BLOCK_SIZE__;
        back.height = src.height * core.__BLOCK_SIZE__;
        this.drawImageSprite('bgmap', back, 0, 0);
    }
};


/**
 * 刷新显伤
 * 只对可见范围刷新
 * todo: 如何保证所见范围一定被刷新？——反复调用updateStatusBar是不可取的 开销太大？
 * @param { String } floorId 显示伤害的楼层
 */
MapScene.prototype.updateDamageInfo = function(floorId){
    floorId = floorId || core.status.floorId;
    if(!core.status.maps || !core.status.maps[floorId])return;
    let ct = 0;
    core.status.maps[floorId].blocks.forEach( (block)=> {
        // 边界外不更新
        let pos = {
            x: block.x * core.__BLOCK_SIZE__ + (core.__BLOCK_SIZE__>>1),
            y: block.y * core.__BLOCK_SIZE__ + (core.__BLOCK_SIZE__>>1),
        }
        if(block.sprite)pos = block.sprite;
        if(SceneManager.checkBound('map', pos, core.__PIXELS__>>1).outBound){ 
            //debugger;
            return ;
        }
        ct += 1;
        let x = block.x, y = block.y;
        const size = 9;
        if (!block.disable && block.event.cls.indexOf('enemy') == 0 && block.event.displayDamage !== false) {
            var damageString = core.enemys.getDamageString(block.event.id, x, y, floorId);
            var damage = damageString.damage, color = damageString.color;
            block.exSprite = block.exSprite||{};
            if(block.exSprite.dmg)block.exSprite.dmg.text = damage;
            let text = block.exSprite.dmg || SpriteManager.getTextSprite(damage, {
                fontFamily : 'Arial',
                fontSize : size,
                fill: color,
                align : 'left',
                fontWeight: 'bold',
                dropShadow: true,
                dropShadowDistance: 2,
            });
            block.exSprite.dmg = text;
            block.exSprite.dmg.style.fill = color;
            text.x = x * core.__BLOCK_SIZE__;
            text.y = (y+1) * (core.__BLOCK_SIZE__) - size;
            this.layers.dmg.addChild(text);
            if (core.flags.displayCritical) {
                var critical = core.enemys.nextCriticals(block.event.id, 1, x, y, floorId);
                critical = core.formatBigNumber((critical[0]||[])[0], true);
                if (critical == '???') critical = '?';
                let text2 = block.exSprite.critical || SpriteManager.getTextSprite(critical, {
                    fontFamily : 'Arial',
                    fontSize : size-2,
                    fill: "#ffddff",
                    align : 'left',
                    fontWeight: 'bold',
                    dropShadow: true,
                    dropShadowDistance: 2,
                });
                text2.text = critical;
                block.exSprite.critical = text2;
                text2.x = x * core.__BLOCK_SIZE__;
                text2.y = y * (core.__BLOCK_SIZE__) + size;
                this.layers.dmg.addChild(text2);

                // core.fillBoldText(ctx, critical, 32*x+1, 32*(y+1)-11, '#FFFFFF');
            }
        }
    });
    console.log('updateDamage:'+ct)
};

/**
 * 给一个block添加动画 通常是帧动画
 * @param block
 */
MapScene.prototype.addAnimate = function(block){
    if(block.sprite && block.event.animate && block.event.animate>1){
        AnimationManager.addFrameAnimate(block.sprite);
    }
};

// 事件层 TODO: 大地图？
MapScene.prototype.drawEventLayer = function(blocks, floorInfo){
    if(!blocks)return;
    this.layers.map.removeChildren();
    let map = [[]];
    for(var i in blocks){
        let b = blocks[i];
        map[b.y] = map[b.y] || [];
        map[b.y][b.x] = b.id;
        this.drawBlock(b, 'map');
    }
    // 自动元件
    blocks.forEach((b)=>{if(b.sprite.updateAutotile)b.sprite.updateAutotile(map, b.x, b.y, floorInfo.width, floorInfo.height);})
};


// 静态array层
MapScene.prototype.drawLayer = function(name, map, floorInfo){
    if(!map)return;
    let blocks = [];
    for(let i = 0; i < map.length; i++){
        for(let j = 0; j < map[i].length; j++){
            if(map[i] && map[i][j]){
                let block = core.maps.initBlock(j, i, map[i][j], true);
                blocks.push(block);
                this.drawBlock(block, name);
                // TODO 不用initBlock
            }
        }
    }
    // 更新自动元件——问题：背景层如果被破坏 自动元件无法及时适配更新 因为丢失block
    blocks.forEach((b)=>{if(b.sprite.updateAutotile)b.sprite.updateAutotile(map, b.x, b.y, floorInfo.width, floorInfo.height);})
};

// 绘制全部 —— 考虑编辑器接口
MapScene.prototype._drawMap_drawAll = function(floorId, ctx){
    const src = core.floors[floorId];
    const blocks = core.status.maps[floorId].blocks;
    for(const name in this.layers){
        if(name!='map')this.drawLayer(name, src[name], src);
        else this.drawEventLayer(blocks, src);
    }
    if(ctx){// 绘制接口？
    }
};

// 添加一个图片类型类型的sprite到某一层
MapScene.prototype.drawImageSprite = function(name, obj, x, y){
    if(name in this.layers){
        obj.x = core.__BLOCK_SIZE__ * x;
        obj.y = core.__BLOCK_SIZE__ * y;        
        this.layers[name].addChild(obj);
    }
};

// 去除一个块
MapScene.prototype.removeBlock = function(block, name){
    if(!block || !block.sprite)return;
    name = name || 'map';
    if(name in this.layers){
        this.layers[name].removeChild(block.sprite);
    }
}
// 更新一个块
MapScene.prototype.updateBlock = function(block, newblock){
    if(!block || !block.sprite)return;
    newblock.sprite = block.sprite;
    SpriteManager.updateSprite(newblock.sprite);
    newblock.exsprite = {};
}


// 添加一个图块类型的sprite到某一层 需要做前处理
MapScene.prototype.drawBlock = function(block, name, addPrior){
    name = name || 'map';
    if(block.event.id == 0)return;
    if(name in this.layers){
        const isEnemy = block.event.cls.indexOf('enemy')>=0; // TODO: 改为有贴图的判定
        var obj =
            isEnemy && core.material.enemys[block.event.id].texture?
            SpriteManager.getSprite(core.material.enemys[block.event.id].texture)
            || SpriteManager.getSprite(block.id) : SpriteManager.getSprite(block.id);
        obj.anchor.x = 0.5;
        obj.anchor.y = 1;
        obj.x = core.__BLOCK_SIZE__ * block.x + core.__BLOCK_SIZE__/2;
        obj.y = core.__BLOCK_SIZE__ * (block.y+1);
        this.layers[name].addChild(obj);
        if(block.sprite){
            // SpriteManager.updateSprite(block.sprite, obj);
        }else{
            }
        block.sprite = obj; // TODO 切换场景之后的销毁？ TODO 由精灵池统一管理
        
        //if(block.exSprite){
        //    for(let i in block.exSprite){
        //        if(block.exSprite[i].parent)
        //            block.exSprite[i].parent.removeChild(block.exSprite[i]);
        //    }
        // }
        block.exSprite = {}; // 存放额外的sprite 不一定会添加
        
        // this.drawBlock_drawDamageInfo(block);
        this.addAnimate(block);
    }
};

/**
 * 伤害信息和块在逻辑上是绑定的 只是层不同
 */
MapScene.prototype.drawBlock_drawDamageInfo = function(){

};

/**
 * 计算像素点在游戏中的坐标 —— 需要做尺度变换
 * TODO: 移动到相机里？
 */
MapScene.prototype.getGamePosition = function(pt){
    let x = ~~ ((pt.x - this.x) / (core.__BLOCK_SIZE__));
    let y = ~~ ((pt.y - this.y) / (core.__BLOCK_SIZE__));
    return {
        x: x,
        y: y,
    }
};

// 重绘一个块
MapScene.prototype.reDrawSprite = function(sprite){

};

