
/**
 * 地图栈
 */
class MapStack{
    constructor(){
        this.blockArr = {};
    }

    _getIndex(obj){
        let idx = obj;
        if(obj.x != null){
            idx = obj.x + ',' + obj.y;
        }
        return idx;
    }

    /**
     * 剔除一个特定对象
     * @param obj
     * @private
     */
    splice(obj){
        let idx = this._getIndex(obj);
        let ret = this.blockArr[idx];
        if(!ret)return null;
        if(ret instanceof Array){
            idx = ret.indexOf(obj);
            ret = ret.splice(idx, 1)[0];
        }else{
            delete this.blockArr[idx];
        }
        return ret;
    }
    /**
     * 队首
     * @param idx
     * @private
     */
    top (obj){
        let idx = this._getIndex(obj);
        if(this.blockArr[idx] instanceof Array){
            return this.blockArr[idx][this.blockArr[idx].length-1];
        }
        return this.blockArr[idx];
    }
    /**
     * 弹出idx位置的角色——栈顶
     * @param idx
     * @private
     */
    pop(obj){
        let idx = this._getIndex(obj);
        if(!this.blockArr[idx])return null;
        let ret = this.blockArr[idx];
        if(this.blockArr[idx] instanceof Array){
            ret = this.blockArr[idx].pop();
            if(this.blockArr[idx].length==1){
                this.blockArr[idx] = this.blockArr[idx][0];
            }
        }else{
            delete this.blockArr[idx];
        }
        return ret;
    };
    /**
     * 入栈
     * @param idx
     * @param obj
     * @private
     */
    push(obj){
        let idx = this._getIndex(obj);
        if(!this.blockArr[idx]){
            this.blockArr[idx] = obj;
        }else{
            if(this.blockArr[idx] instanceof Array){
                this.blockArr[idx].push(obj);
            }else{
                this.blockArr[idx] = [this.blockArr[idx], obj];
            }
        }
    }

    /**
     * 移动一个对象, dst不填表示已经移动到位了
     * @param { BaseActor } 角色对象
     * @param {*} src 原位置
     * @param {*} dst 现位置
     */
    move(obj, src, dst){
        src = src.x+','+src.y;
        if(this.blockArr[src] instanceof Array){
            let idx = this.blockArr[src].indexOf(obj);
            if(idx>=0){
                this.blockArr[src].splice(idx,1);
            }
        }else if(this.blockArr[src] === obj){
            delete this.blockArr[src];
        }
        if(dst){
            obj.x = dst.x;
            obj.y = dst.y;
        }
        this.push(obj);
    }

    /**
     * 
     * @param { Point } obj 
     * @param { Point } newObj 
     */
    replace(obj, newObj){
        this.splice(obj);
        this.push(newObj);
    }


    /**
     * 对所有进行处理
     */
    forEach(fn){
        for(let k in this.blockArr){
            if(this.blockArr[k] instanceof Array)this.blockArr[k].forEach(fn);
            else fn(this.blockArr[k]);
        }
    }
    /**
     *
     */
    clear(){
        this.blockArr = {};
    }
    /**
     *
     */
    find(index, cond){
        if(!this.blockArr[index])return null;
        if(this.blockArr[index] instanceof Array){
            for(let b of this.blockArr[index]){
                if(cond(b))return b;
            }
        }else{
            if(cond(this.blockArr[index]))return this.blockArr[index];
        }
    }
}


export { MapStack }