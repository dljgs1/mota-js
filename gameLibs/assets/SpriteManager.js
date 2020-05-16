import AssetsManager from "./AssetsManager.js"

const Sprite = PIXI.Sprite;
const ASprite = PIXI.AnimatedSprite;
const TextSprite = PIXI.Text;
const Graphics = PIXI.Graphics;
/**
 *
 */
class ActorSprite extends ASprite{
    constructor(textures) {
        if(!(textures[0] instanceof Array)){
            textures = [textures];
        }
        super(textures[0]);
        this.patterns = textures;
        this.directionPattern = {
            'down':  0,
            'left': 1,
            'right': 2,
            'up': 3,
        };
        this.pattern = 0;
    }
    get pattern(){
        return this._pattern;
    }
    set pattern(n){
        if(n in this.directionPattern)n = this.directionPattern[n];
        if(this._pattern==n)return;
        if(n>=this.patterns.length)n = 0;
        this.textures = this.patterns[n];
        this._pattern = n;
    }
}




class AutotileSprite extends Sprite{
    constructor(textures, autoTileId){
        super();
        this.autoTileId = autoTileId;
        let a = new ActorSprite(textures),
            b = new ActorSprite(textures),
            c = new ActorSprite(textures),
            d = new ActorSprite(textures);
        b.x = core.__BLOCK_SIZE__/2;
        c.y = core.__BLOCK_SIZE__/2;
        d.x = core.__BLOCK_SIZE__/2;
        d.y = core.__BLOCK_SIZE__/2;
        this.addChild(a);
        this.addChild(b);
        this.addChild(c);
        this.addChild(d);
    }

    /**
     * 自动元件的更新 在边角发生变化时进行 需要传入arr矩阵以及当前坐标以及长宽范围
     */
    updateAutotile(arr, x, y, w, h){
        this.anchor.set(0, 0);
        this.x = x*core.__BLOCK_SIZE__;
        this.y = y*core.__BLOCK_SIZE__;
        // 生成位置编码  this.autoTileId
        let cur = arr[y][x];
        let pattern = AssetsManager.getAutotilePatternFromSquare(
            (y-1<0 || x-1<0) ?  cur : (arr[y-1] || {})[x-1]||0,
            (y-1<0) ?  cur : (arr[y-1] || {})[x-0]||0,
            (y-1<0 || x+1>=w) ? cur : (arr[y-1] || {})[x+1]||0,
            (x-1<0) ? cur : (arr[y-0] || {})[x-1]||0,
            (arr[y-0] || {})[x-0]||0,
            (x+1>=w) ? cur : (arr[y-0] || {})[x+1]||0,
            (y+1>=h || x-1<0) ? cur : (arr[y+1] || {})[x-1]||0,
            (y+1>=h) ? cur : (arr[y+1] || {})[x-0]||0,
            (y+1>=h || x+1>=w) ? cur : (arr[y+1] || {})[x+1]||0,
        );
        for(let i in pattern){
            this.children[i].pattern = pattern[i];
        }
    }
}



/**
 * @class WinSprite 窗口皮肤 仅提供皮肤显示 框尺寸设置等
 * @prop name 窗口皮肤名
*/
class WinSprite extends Sprite {
    constructor(name, w, h, dir){
        super();
        this.name = name ||  'winskin.png';
        let textures = AssetsManager.getWindowTexture(this.name);
        this.dir = dir;
        this.components ={
            'face':     new Sprite(textures[0]),
            'top':      new Sprite(textures[1]),
            'left':     new Sprite(textures[2]),
            'right':    new Sprite(textures[3]),
            'bottom':    new Sprite(textures[4]),
            'tl':       new Sprite(textures[5]),
            'tr':       new Sprite(textures[6]),
            'bl':       new Sprite(textures[7]),
            'br':       new Sprite(textures[8]),
            'up':       new Sprite(textures[9]),
            'down':     new Sprite(textures[10]),
        };
        for(let i in this.components){
            if(i=='up' || i=='down'){if(!dir){
                continue;
            }}
            this.addChild(this.components[i]);
        }
        this.win_width = w; 
        this.win_height = h;
        this.updateWinScale();
    }
    get surface(){
        return this.components.face;
    }
    set surface(v){
    }
    get width(){
        return this.win_width;
    }
    get height(){
        return this.win_height;
    }
    set width(w){
        this.win_width = w;
        this.updateWinScale();
    }
    set height(h){
        this.win_height = h;
        this.updateWinScale();
    }
    updateWinScale(bias_x, bias_y){
        let x=bias_x ||0 ,y=bias_y||0;
        let w= this.win_width, h=this.win_height;
        let positions ={
            'face': 
            [x + 2, y + 2, w - 4, h - 4],  // back
            'top':  
            [x + 16, y, w - 32, 16],  // top
            'left': 
            [x, y + 16, 16, h - 32],  // left
            'right':
            [x + w - 16, y + 16, 16, h - 32],  // right
            'bottom':
            [x + 16, y + h - 16, w - 32, 16],  // bottom
            'tl':   
            [x, y, 16, 16],  // top left
            'tr':   
            [x + w - 16, y, 16, 16],  // top right
            'bl':   
            [x, y + h - 16, 16, 16],  // bottom left
            'br':   
            [x + w - 16,y + h - 16, 16, 16],  // bottom right
            'up': 
            [x + ~~(w / 2), y + h - 3, 32, 32], // up arrow
            'down':
            [x + ~~(w / 2), y - 29, 32, 32],
        };
        function applyRect(sprite, rect){
            sprite.x = rect[0];
            sprite.y = rect[1];
            if(rect[2]<=0||rect[3]<=0){
                sprite.width = 1;
                sprite.height = 1;
            }else{
                sprite.width = rect[2];
                sprite.height = rect[3];
            }
        }
        for(let i in this.components){
            if(i=='up' || i=='down'){
                if(!this.dir)continue;
                else{
                    applyRect(this.components[i], positions[i]);
                    this.components[i].x = this.arrowPos;
                }
            }
            applyRect(this.components[i], positions[i]);
        }
    }

    removeArrow(dir){
        this.removeChild(this.components[dir]);
    }
    setArrow(dir, pos){
        if(this.components[dir]){
            this.dir = dir;
            this.arrowPos = pos;
            this.components[dir].anchor.x = 0.5;
            this.addChild(this.components[dir]);
            this.updateWinScale();
        }
    }
}


const SpriteManager = new class SpriteManager {
    constructor() {
    }
    // TODO： sprite对象缓冲池 从而实现地图浏览而不卡
    // 类似勇者的sprite 有四组textures
    getActorSprite(name) {
        var tmp = new ActorSprite(AssetsManager.getTexture(name));
        return tmp;
    }
    // 普通的数字图块 —— 会根据材质自动判断属于什么类型
    getSprite(id) {
        if(id===17){//历史遗留空气墙
            if(main.mode=='editor'){
                return this.getTextSprite('air');
            }else{
                return new Sprite();
            }
        }
        var textures = AssetsManager.getTexture(id);
        var tmp = null;
        if (textures instanceof Array) { // 带动画的 除了autotile 一律用角色
            let info = core.maps.blocksInfo[id];
            if(info && info.cls == 'autotile'){
                tmp = new AutotileSprite(textures)
            }else{
                tmp = new ActorSprite(textures);
            }
        }
        else {
            tmp = new Sprite(textures);
        }
        return tmp;
    }

    /**
     * 图标类精灵图 是静态的 即使动态 也只会取一张
     * @param { String } id
     */
    getIconSprite(id){
        let texture = AssetsManager.getTextureById(id);
        if(texture){
            if(texture instanceof Array){
                return new Sprite(texture[0]);
            }
            return new Sprite(texture);
        }
    }
    /**
     * 更新sprite的图块 避免将其从parent删除
     * @param {*} sprite 
     * @param {*} newid 
     */
    updateSprite(sprite, newid){
        let obj = this.getSprite(newid);
        for(let k in obj){
            sprite[k] = obj[k];
        }
    }
    // 普通的图块
    getSpriteFromTexture(info) {
        if (!info)
            return null;
        var textures = AssetsManager.getExtraTexture(info[0], info[1], info[2]);
        var tmp;
        if (textures instanceof Array) { // 带动画的
            tmp = new ActorSprite(textures);
        }
        else {
            tmp = new Sprite(textures);
        }
        return tmp;
    }
    getTilingSprite(id) {
        let tile = AssetsManager.getTerrainsTexture(id);
        if(!tile)tile = AssetsManager.getTexture(id);
        if(!tile)return null;
        return new PIXI.TilingSprite(tile);
    }
    getTextSprite(text, fontstyle) {
        return new TextSprite(text, fontstyle || {
            fontFamily: 'Arial', fontSize: 20, fill: 0xffffdd, align: 'center'
        });
    }
    getAutotileSprite(name) {
        return new AutotileSprite(AssetsManager.getTexture(name));
    }

    /**
     * 获取一个矩形sprite
     * todo drawRoundedRect 圆角矩形
     * @param x
     * @param y
     * @param w
     * @param h
     * @param color
     * @param alpha
     */
    getRect(x, y, w, h, color, alpha){
        let g = new Graphics();
        g.beginFill(color, alpha);
        g.drawRect(x, y, w, h);
        return g;
    }
    /**
     * 组合精灵 将不同父层的精灵组合到obj
     * @param obj
     * @param { Array }wraps
     */
    warpSprites(obj, wraps, noCache) {
        if (!wraps)
            return;
        let pos = obj.getGlobalPosition();
        let pt = null;
        for (let i in wraps) {
            let cur = wraps[i];
            pt = cur.getGlobalPosition(pt);
            let bias_x = pt.x - pos.x;
            let bias_y = pt.y - pos.y;
            if (!noCache)
                cur.lastInfo = {
                    lastParent: cur.parent,
                    x: cur.x, y: cur.y,
                    bias_x: bias_x, bias_y: bias_y
                };
            cur.x = bias_x;
            cur.y = bias_y;
            obj.addChild(cur);
        }
    }
    /**
     * 拆分精灵
     * @param obj
     * @param { Array }wraps
     */
    unwarpSprites(obj, wraps) {
        if (!wraps)
            return;
        let pos = obj.getGlobalPosition();
        for (let i in wraps) {
            let cur = wraps[i];
            if (cur.lastInfo) {
                cur.setParent(cur.lastInfo.parent);
                cur.x = cur.lastInfo.x;
                cur.y = cur.lastInfo.y;
            }
        }
    }

    /**
     * 窗口精灵
     * @param obj
     * @param dir
     * @returns {WinSprite}
     */
    getWinSprite(obj, dir) {
        if (obj instanceof WinSprite) {
            return new WinSprite(obj.name, 1, 1, dir);
        }
        return new WinSprite(obj, 1, 1, dir);
    }
}();
export default SpriteManager;
