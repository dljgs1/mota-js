/*
    运行时资产管理 : 对 core.material 的包装

    注：编辑器、录像播放中不使用

    负责：
    1. texture就地切分
    2. 类型判断
    3. (TODO:) 懒加载

*/

const Texture = PIXI.Texture;
const BaseTexture = PIXI.BaseTexture;
const Rectangle = PIXI.Rectangle;
const Loader = PIXI.Loader.shared;


export default new class AssetsManager {
    constructor() {
        this.textures = {};
        this.baseTextures = {};
        this.oldTypes = {
            'terrains': [32, 32, 1, 1],
            'items': [32, 32, 1, 1],
            'enemys': [64, 32, 2, 1],
            'npcs': [64, 32, 2, 1],
            'animates': [128, 32, 4, 1],
            'npc48': [128, 48, 4, 1],
            'enemy48': [128, 48, 4, 1],
            'icons': [32, 32, 1, 1],
        };
        this.winskins = {};
        this.frameTextures = textures_3d8be5ed_06ec_4002_bc28_3988b5f2aad7;

        /**
         * 自动元件绘制代码
         * @type {*[]}
         */
        this.autotileDrawCode = [
            [26,27,32,33],
            [4,27,32,33],
            [26,5,32,33],
            [4,5,32,33],
            [26,27,32,11],
            [4,27,32,11],
            [26,5,32,11],
            [4,5,32,11],
            [26,27,10,33],
            [4,27,10,33],
            [26,5,10,33],
            [4,5,10,33],
            [26,27,10,11],
            [4,27,10,11],
            [26,5,10,11],
            [4,5,10,11],
            [24,25,30,31],
            [24,5,30,31],
            [24,25,30,11],
            [24,5,30,11],
            [14,15,20,21],
            [14,15,20,11],
            [14,15,10,21],
            [14,15,10,11],
            [28,29,34,35],
            [28,29,10,35],
            [4,29,34,35],
            [4,29,10,35],
            [26,27,44,45],
            [4,39,44,45],
            [38,5,44,45],
            [4,5,44,45],
            [24,29,30,35],
            [14,15,44,45],
            [12,13,18,19],
            [12,13,18,11],
            [16,17,22,23],
            [16,17,10,23],
            [40,41,46,47],
            [4,41,46,47],
            [36,37,42,43],
            [36,5,42,43],
            [12,17,18,23],
            [12,13,42,43],
            [36,41,42,47],
            [16,17,46,47],
            [12,17,42,47],
            [12,17,42,47]];
        // 0 0 边
        let edge = {};
        /**
         * 九宫格临边情况到绘制pattern的映射
         */
        this.autotileEdgeMap = edge;
        /**
         * 对mask符合filter的edge填充角落
         * @param value
         * @param filter
         */
        function fillCorner(filter, value, mask) {
            mask = mask || 0xf;
            for(let i = 0; i < (1<<8); i++){
                if((i & mask) == filter){
                    edge[i] = value;
                }
            }
        }
        // 0 边
        fillCorner(0, 47);
        // 1 边
        fillCorner((1<<0), 42); // 下
        fillCorner((1<<1), 43); // 右
        fillCorner((1<<2), 44); // 上
        fillCorner((1<<3), 45); // 左
        // 2. 2边
        fillCorner((1<<0) + (1<<2), 32); // 下 + 上
        fillCorner((1<<1) + (1<<3), 33); // 右 + 左 —— 对角无影响

        fillCorner((1<<1) + (1<<0), 35, 0xf | (1<<4)); // 右下*
        fillCorner((1<<1) + (1<<0) + (1<<4), 34, 0xf | (1<<4)); // 右下* —— 4

        fillCorner((1<<1) + (1<<2), 41, 0xf | (1<<5)); // 右上*
        fillCorner((1<<1) + (1<<2) + (1<<5), 40, 0xf | (1<<5)); // 右上* —— 5


        fillCorner((1<<3) + (1<<2), 39, 0xf | (1<<6)); // 左上*
        fillCorner((1<<3) + (1<<2) + (1<<6), 38, 0xf | (1<<6)); // 左上* —— 6

        fillCorner((1<<3) + (1<<0), 37, 0xf | (1<<7)); // 左下*
        fillCorner((1<<3) + (1<<0) + (1<<7), 36, 0xf | (1<<7)); // 左下* —— 7

        // 3. 3边

        // 缺左 左角无影响
        // 右满
        fillCorner((1<<0) + (1<<2) + (1<<1) + (1<<4) + (1<<5), 16, 0xf | ((1<<4) + (1<<5)));
        // 右下
        fillCorner((1<<0) + (1<<2) + (1<<1) + (1<<4), 17, 0xf | ((1<<4) + (1<<5)));
        // 右上
        fillCorner((1<<0) + (1<<2) + (1<<1) + (1<<5), 18, 0xf | ((1<<4) + (1<<5)));
        // 无右
        fillCorner((1<<0) + (1<<2) + (1<<1), 19, 0xf | ((1<<4) + (1<<5)));
        // 缺上
        fillCorner((1<<0) + (1<<1) + (1<<3) + (1<<4) + (1<<7), 20, 0xf | ((1<<4) + (1<<7))); // 缺 上 + 下满
        fillCorner((1<<0) + (1<<1) + (1<<3) + (1<<7), 21, 0xf | ((1<<4) + (1<<7))); // 缺 上 + 左下
        fillCorner((1<<0) + (1<<1) + (1<<3) + (1<<4), 22, 0xf | ((1<<4) + (1<<7))); // 缺 上 + 右下
        fillCorner((1<<0) + (1<<1) + (1<<3), 23, 0xf | ((1<<4) + (1<<7))); // 缺 上
        // 缺右
        fillCorner((1<<0) + (1<<2) + (1<<3) + (1<<6) + (1<<7), 24, 0xf | ((1<<6) + (1<<7))); // 缺 右 + 左满
        fillCorner((1<<0) + (1<<2) + (1<<3) + (1<<6), 25, 0xf | ((1<<6) + (1<<7))); // 缺 右 + 左上
        fillCorner((1<<0) + (1<<2) + (1<<3) + (1<<7), 26, 0xf | ((1<<6) + (1<<7))); // 缺 右 + 左下
        fillCorner((1<<0) + (1<<2) + (1<<3), 27, 0xf | ((1<<6) + (1<<7))); // 缺 右

        fillCorner((1<<1) + (1<<2) + (1<<3) + (1<<5) + (1<<6), 28, 0xf | ((1<<5) + (1<<6))); // 缺 下 + 上满 （存疑 26 27 44 45 ？）
        fillCorner((1<<1) + (1<<2) + (1<<3) + (1<<6), 30, 0xf | ((1<<5) + (1<<6))); // 缺 下 + 左上
        fillCorner((1<<1) + (1<<2) + (1<<3) + (1<<5), 29, 0xf | ((1<<5) + (1<<6))); // 缺 下 + 右上
        fillCorner((1<<1) + (1<<2) + (1<<3), 31, 0xf | ((1<<5) + (1<<6))); // 缺 下

        // 4. 4边
        let four = (1<<0) + (1<<1) + (1<<2) + (1<<3);
        // --------  右下     右上      左上      左下 -----------
        edge[four + (1<<4) + (1<<5) + (1<<6) + (1<<7)] = 0;
        edge[four + (1<<4) + (1<<5) + (0<<6) + (1<<7)] = 1; // 缺左上
        edge[four + (1<<4) + (0<<5) + (1<<6) + (1<<7)] = 2; // 缺右上
        edge[four + (1<<4) + (0<<5) + (0<<6) + (1<<7)] = 3; // 缺左上 右上
        edge[four + (0<<4) + (1<<5) + (1<<6) + (1<<7)] = 4; // 缺右下
        edge[four + (0<<4) + (1<<5) + (0<<6) + (1<<7)] = 5; // 缺右下 左上
        edge[four + (0<<4) + (0<<5) + (1<<6) + (1<<7)] = 6; // 缺右下 右上
        edge[four + (0<<4) + (0<<5) + (0<<6) + (1<<7)] = 7; // 缺右下 右上 左上
        edge[four + (1<<4) + (1<<5) + (1<<6) + (0<<7)] = 8; // 缺左下
        edge[four + (1<<4) + (1<<5) + (0<<6) + (0<<7)] = 9; // 缺左上 左下
        edge[four + (1<<4) + (0<<5) + (1<<6) + (0<<7)] = 10; // 缺左下 右上
        edge[four + (1<<4) + (0<<5) + (0<<6) + (0<<7)] = 11; // 缺左上 左下 右上
        edge[four + (0<<4) + (1<<5) + (1<<6) + (0<<7)] = 12; // 缺左下 右下
        edge[four + (0<<4) + (1<<5) + (0<<6) + (0<<7)] = 13; // 缺左下 左上 右下
        edge[four + (0<<4) + (0<<5) + (1<<6) + (0<<7)] = 14; // 缺左下 右上 右下
        edge[four] = 15; // 都缺

        /**
         * << 0
         * 1. 4边都没有（1种）

             此时对角全失去影响力。位置4只有1种情况，即情况编号46

         2. 只有1边（4种）

             此时对角依然全失去影响力。位置4只有4种情况，即情况42,43,44,45

         3. 有2边（6种）

             3.1 对边情况（2种）

             即左边和右边同时出现，或者上边和下边同时出现，此时对角依然全失去影响力。位置4只有2种情况，即情况32,33

            3.2 临边情况（4种） 

            考虑左边和上边同时出现，此时左上角有影响力，有左上角出现与不出现2种情况。其他临边情况一样。位置4共有4*2=8种情况，即情况34-41

         4. 有3边（4种）

             考虑左上右同时出现，此时左上角和右上角有影响力，2个角有4种出现情况。所以共有4*4=16种情况。即情况16-31

         5. 4边都有（1种）

             此时所有角都有影响力，4个角有16种出现情况。所以共有1*16=16种情况。即情况0-15

         */
    }

    // 初始化时机： afterLoadResource
    // 初始化内容： 所有基本材质的准备
    _init(callback){
        const specialTextures = ['autotile', 'tilesets'];
        /**
         * 自动元件边界判定初始化
         */
        core.maps._makeAutotileEdges();

        // 按类型收集基本素材集 目前2种： autotile tilesets
        function recur(save, obj){
            for(let i in obj){
                save[i] = Texture.from(obj[i]);
            }
        }
        for(let i in core.material.images){
            if(specialTextures.indexOf(i)>=0){
                this.baseTextures[i] = {};
                recur(this.baseTextures[i], core.material.images[i]);
            }
        }
        // 加载自定义图片
        recur(this.textures, core.material.images.images);

        // 加载勇士贴图——历史遗留
        this.textures['hero'] = this._transTextures(this.textures['hero.png'], [4, 4]);

        // tilesets加载（使用才加载）


        // 加载帧贴图
        let exTextures = this.frameTextures;
        for(let i in exTextures){
            let name = exTextures[i][0];
            Loader.add(name, 'project/images/textures/'+name);
        }
        Loader.load((loader, resources) => {
            for(let i in exTextures){
                let name = exTextures[i][0];
                this.textures[name] = this._transTextures(
                    resources[name].texture,
                    [exTextures[i][1], exTextures[i][2]],
                );
            }


            // 加载所有images下常规素材(oldTypes)——即单张图片
            // 各个材质的切分 需要在资源全部加载完之后进行 主要针对2.x系列的素材
            // 新素材以及tilesets因为分散不存在这个问题
            // webgl的坑点： 图片不能太大 否则不能渲染 因此需要在合成材质之前切分
            let tmp = this.baseTextures;
            // 考虑懒加载
            function splitImageToTextures(name, width, height){
                var img = core.material.images[name];
                var arr = core.splitImage(img, width, height);
                tmp[name] = tmp[name] || {};
                for(let i in arr){
                    tmp[name][i] = Texture.from(arr[i], {width: width, height: height}, true);//  为了防止load出错加严格模式
                }
            }
            for(var i in this.oldTypes){
                var t = this.oldTypes[i];
                splitImageToTextures(i, t[0], t[1]);
            }
            callback();
        });

    }

    /**
     * 读取一个块材质 —— 一般需要load的都是懒加载
     * @param id
     * @private
     */
    _loadBlockTexture(id){
        var binfo = core.maps.blocksInfo[id];
        if(!binfo && id==0){//?????——历史遗留
            binfo = {cls: 'terrains', id: 'ground'};
        }
        // tileset才会大于10000
        if(id >= core.icons.tilesetStartOffset){
            binfo = {cls : 'tileset', id:id};
        }
        if(!this.baseTextures[binfo.cls] && binfo.cls!='tileset'){
            return main.log('不存在的类型'+binfo.cls);
        }
        var cls = binfo.cls;

        if(cls in this.oldTypes){
            var t = this.oldTypes[cls];
            var w = t[2], h = t[3];
            var base = this.baseTextures[cls][core.material.icons[cls][binfo.id]];
            if(w!=1 || h != 1){
                this.textures[id] = this._transTextures(base, [w, h]);
            }else{
                this.textures[id] = new Texture(
                    base, new Rectangle(0, 0, t[0], t[1])
                );
            }
        }
        else if(cls === 'tileset'){
            cls = cls + 's';
            let offset = core.icons.tilesetStartOffset;
            let base = this.baseTextures[cls][core.tilesets[~~(id/offset)-1]];
            const size = core.__BLOCK_SIZE__;
            let w = ~~(base.width / size);
            let h = ~~(base.height / size);
            let cur = ~~(id % offset);
            this.textures[id] = new Texture(base, new Rectangle(size*~~(cur % w), size*~~(cur / w), size, size));
        }
        else if(cls === 'autotile'){
            this.textures[id] = this.getAutotileTexture(binfo.id);
        }

        //TODO： 48、autotile、tileset、animates
    }
    // 根据形状转换为材质组合
    _transTextures(base, shape){
        var w = base.width, h = base.height;
        var dw = w/shape[0], dh = h/shape[1];
        var ret = [];
        for(let i = 0;i<shape[1];i++){
            var tmp = [];
            for(let j = 0;j<shape[0];j++){
                tmp.push(new Texture(
                    base,
                    new Rectangle(j*dw, i*dh, dw, dh))
                );
            }
            ret.push(tmp);
        }
        if(ret.length==1)return ret[0];
        return ret;
    }
    // 数字找材质 如果是动画 则是材质组合
    _number2Texture(id){
        if(!this.textures[id])this._loadBlockTexture(id);
        return this.textures[id];
    }
    // 地形材质 用event.id查找
    getTerrainsTexture(id){
        if(id in core.icons.icons.terrains){
            return this.baseTextures.terrains[core.icons.icons.terrains[id]];
        }else {
            main.log('没有定义的地形材质');
        }
    }
    
    /**
     * 通过图片id获取材质（BaseTextures）
     * @param { String } id 
     */
    getTextureById(id){
        for(let type in core.icons.icons){
            if(id in core.icons.icons[type]){
                return this.getTexture(core.icons.icons[type][id], type);
            }
        }
    }

    /**
     * 通过九宫格生成自动元件绘制模式 一共返回四个模式
     * @param arr
     * @param id
     */
    getAutotilePatternFromSquare(a, b, c, d, e, f, g, h, i){
        if(!e)return [0,0,0,0];
        if(a==e || core.material.autotileEdges[e].indexOf(a)>=0)a = 1; else a = 0;
        if(b==e || core.material.autotileEdges[e].indexOf(b)>=0)b = 1; else b = 0;
        if(c==e || core.material.autotileEdges[e].indexOf(c)>=0)c = 1; else c = 0;
        if(d==e || core.material.autotileEdges[e].indexOf(d)>=0)d = 1; else d = 0;
        if(f==e || core.material.autotileEdges[e].indexOf(f)>=0)f = 1; else f = 0;
        if(g==e || core.material.autotileEdges[e].indexOf(g)>=0)g = 1; else g = 0;
        if(h==e || core.material.autotileEdges[e].indexOf(h)>=0)h = 1; else h = 0;
        if(i==e || core.material.autotileEdges[e].indexOf(i)>=0)i = 1; else i = 0;
        let code = (h<<0) + (f<<1) + (b<<2) + (d<<3) // 下右上左
        + (i<<4) + (c<<5) + (a<<6) + (g<<7); //
        return this.autotileDrawCode[this.autotileEdgeMap[code]];
    }

    /**
     * 裁剪texture 如果不足w或者h 则返回数组
     * @param base
     * @param w
     * @param h
     * @returns {PIXI.Texture}
     */
    cutTexture(base, w, h){
        let W = base.width, H = base.height;
        let ret = [];
        for(let y = 0; y < H; y += h){
            for(let x = 0; x < W; x += w){
                ret.push(new Texture(base, new Rectangle(x, y, w, h)));
            }
        }
        return ret;
    }
// 生成窗口材质
    getWindowTexture(name) {
        if(name in this.winskins){
            return this.winskins[name];
        }
        var base = this.getTexture(name);
        if(!base)return [];
        let scale_list = [
            new Rectangle(0, 0, 128, 128),

            new Rectangle(144, 0, 32, 16),
            new Rectangle(128, 16, 16, 32),
            new Rectangle(176, 16, 16, 32),
            new Rectangle(144, 48, 32, 16),

            new Rectangle(128, 0, 16, 16),
            new Rectangle(176, 0, 16, 16),
            new Rectangle(128, 48, 16, 16),
            new Rectangle(176, 48, 16, 16),

            new Rectangle(128,96,32,32,),//arrow down
            new Rectangle(160,96,32,32),// arrow up
        ];
        var ret = [];
        scale_list.forEach((r)=>{ret.push(new Texture(base, r))});
        return ret;
    }
    /**
     * 生产自动元件的texture
     * @param name
     */
    getAutotileTexture(name){
        let base = this.baseTextures.autotile[name];
        if(!base){
            main.log('不存在的自动元件'+name);
            return;
        }
        // 1. 切分成定长组 如果只有一组
        let arr = this.cutTexture(base, core.__BLOCK_SIZE__ * 3, core.__BLOCK_SIZE__ * 4);
        // 2. 划分48组
        for(let k in arr){
            arr[k] = this.cutTexture(arr[k], ~~(core.__BLOCK_SIZE__/2), ~~(core.__BLOCK_SIZE__/2));
        }
        // 3. 对有动画的 动画放到同一组
        let ret = [];
        for(let i in arr[0]){
            ret.push([arr[0][i]])
        }
        for(let i = 1; i < arr.length; i++){
            for(let k in ret){
                ret[k].push(arr[i][k]);
            }
        }
        return ret;
    }

// 找材质 @_@ 施工中
    getTexture(rid, type){
        if(type){
            return this.baseTextures[type][rid];
        }
        if(typeof rid == 'number' || ~~rid===rid){// 如果是数字 属于原始素材：图块贴图
            return this._number2Texture(rid);
        }else{// 如果是字符串 则代表是自己添加的材质图
            if(rid in this.textures){
                return this.textures[rid];
            }else {
                return null;
                // main.log('未定义的材质，自动返回空白');
                // // return this.textures[0];
            }
        }
    };

}();
