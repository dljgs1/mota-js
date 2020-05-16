/**
 * 缓存：提供对原数据的临时访问，在游戏里体现为动态数据
 *
 * 缓存——读：是内存的直接引用 写：内存的拷贝
 * 存取——存：只写activeData 取：只取activeData
 *
 *
 * 1. 一定要有srcData
 * 2. srcData不可写，只能被读。
 *
 * todo: 收束——如果数据与原型一致 将其删去
 */
class Cache{
    constructor(){
        /**
         * 原型数据 是游戏自带的静态数据
         * @type {{}}
         */
        this.srcData = {};
        /**
         * 激活数据：是被修改过的活跃数据
         * @type {{}}
         */
        this.activeData = {};
    }
    init(data){
        this.srcData = data;
    }

    /**
     * save： 替换掉当前的激活数据
     * @param data
     */
    save(data){
        this.activeData = data;
    }

    /**
     * 将激活数据加载到外部
      * @param toload
     */
    load(toload){
        for(let k in this.activeData){
            toload[k] = core.clone(this.activeData[k]);
        }
    }

    /**
     * 访问一个键对应的值
     * @param key
     * @returns {*}
     */
    read(key){
        if(key in this.activeData)return this.activeData[key];
        return this.srcData[key];
    }

    /**
     * 存在值
     * @param key
     */
    exist(key){
        if(key in this.activeData || key in this.srcData)
            return true;
        return false;
    }

    /**
     * 找到一个符合要求的值 比较慢不建议使用
     * @param fn
     */
    find(fn){
        for(let key in this.activeData){
            if(fn(this.activeData[key]))return key;
        }
        for(let key in this.srcData){
            if(fn(this.srcData[key]))return key;
        }
    }

    /**
     * 写一个值 这个一般必须继承实现
     * @param key
     * @param value 如果为null 表示把只这个值从原型中复制并激活 否则表示用这个值替代原值
     */
    write(key, value){
        if(key in this.activeData){
            this.activeData[key] = value || this.activeData[key];
        }else{
            this.activeData[key] = this.clone(key, value);
        }
    }

    /**
     * 取一份拷贝
     * @param key
     * @param value 为null表示使用原型
     * @returns {*}
     */
    clone(key, value){
        return value || core.clone(this.srcData[key]);
    }

    /**
     * 清除缓存数据
     */
    clear(key){
        if(key)delete this.activeData[key];
        else this.activeData = {};
    }
}


/**
 * 基本压缩单元：提供压缩数据的访问和存取
 *
 * 1. 激活数据（activeData）：访问时会调用decompress返回数据，如果已经访问过，不用解压
 * 2. 存储（save）：将键值对数据compress到缓存，包含访问标记的一律清除，如果加了nocompress则不压缩
 * 3. 载入（load）：将压缩后的数据返回
 * 4. 访问（read）：decompress一个数据并且标记脏
 * 5. 压缩/解压 :
 *  save到data的数据初一律处于压缩状态，除非标记了不用压缩（即在外部就做好了压缩）
 *  load出去的数据一律要处于压缩状态，
 *  read的数据需要解压
 */
class Archive {
    constructor(name){
        this.name = name;
        /**
         * decompress后会再次标记
         */
        this.activeData = {};
        this.decompFlag = {};
    }

    compress(k, v){
        return v;
    }
    decompress(k, v){
        return v;
    }

    /**
     * 存储数据到压缩包
     * 如果标记nocompress 说明存储的数据没有压缩 需要手动压缩
     * @param data 需要存入的数据 将直接替换当前的激活数据
     * @paran needCompress 需要压缩
     */
    save(data, needCompress){
        this.clear();
        if(needCompress){
            for(let key in data){
                data[key] = this.compress(key, data[key]);
            }
        }
        this.activeData = data;
    }

    /**
     * 将解压的数据加载到toload 加载前加压
     * ——为什么不返回未激活的数据？因为未激活的数据本来就是外部存进来的，不需要重复给
     * ——为什么需要压缩？因为要遵循“存取一致”
     * @param  { Object } toload
     * @param replace 如果为true 压缩的内容会替换自身
     * @returns {*}
     */
    load(toload, replace){
        for(let key in this.decompFlag){
            toload[key]= this.compress(key, this.activeData[key]);
            if(replace){
                this.activeData[key] = toload[key];
                this.clear(key);
            }
        }
    }

    /**
     * 访问一个键对应的数据 需要解压
     * @param key
     * @returns { Data }
     */
    read(key){
        if(!this.decompFlag[key]){
            this.activeData[key] = this.decompress(key, this.activeData[key]);
            this.decompFlag[key] = true;
        }
        return this.activeData[key];
    }
    /**
     * 写一个数据 ? 问题是不知道是加压还是没加 这个不建议使用
     * @param key
     * @param value
     */
    write(key, value){
        console.log('archive 未知写操作');
        this.activeData[key] = value;
    }
    /**
     * 清除激活标记与数据
     */
    clear(key){
        if(key) delete this.decompFlag[key];
        else this.decompFlag = {};
    }
}


/**
 * 地图缓存
 * key是floorId
 * value是map array —— 暂时不考虑stack 即事件重叠的情况
 */
class MapCache extends Cache{
    constructor(){
        super()
    }
    /**
     * 获取一层的数据
     */
    getFloor(floorId){
        return this.activeData[floorId] || this.srcData[floorId];
    }
    /**
     * 读取一个block的id
     * @param floorId
     * @param x
     * @param y
     */
    read(floorId, x, y){
        if(!this.activeData[floorId] || !this.activeData[floorId][y] || !this.activeData[floorId][y][x]){
            return this.srcData[floorId][y][x];
        }
        const ret = this.activeData[floorId][y][x];
        if(ret===-1){
            return 0;
        }else {
            return ret;
        }
    }
    /**
     * 修改一个值
     * @param floorId
     * @param x
     * @param y
     * @param value 可为 -1/0/n 分别表示删去原数据/写空（回归原数据）/替换为新数据
     */
    write(floorId, x, y, value){
        try{
            if(!this.activeData[floorId])super.write(floorId);
            if(value === this.srcData[floorId][y][x])value = 0;
            if(value === 0 && (!this.activeData[floorId][y] || !this.activeData[floorId][y][x]))return;
            this.activeData[floorId][y]= this.activeData[floorId][y] || [];
            this.activeData[floorId][y][x] = value;
        }catch(e){
            debugger;
        }
    }
    /**
     * 说是复制 其实是创造一个diff矩阵
     */
    clone(key, value){
        let ret = [];
        for(let i in this.srcData[key])
            ret.push(0);
        return ret;
    }
}


// TODO: 对深度不足的使用键值存储？

export { Cache , Archive, MapCache}