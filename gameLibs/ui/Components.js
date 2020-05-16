/**
 * 系统提供的组件
 * 
 * 组件的基本结构： function(..){return {install, uninstall,}} ... 即一个返回包含安装和卸载的闭包对象的函数
 */
export const Components = function(){
    class baseComp{
        constructor(obj) {
            obj = obj || {};
            for (let key in obj) {
                this[key] = obj[key];
            }
            this.active = null;
        }
        install() {
            this.active = true;
        }
        uninstall() {
            this.active = false;
        }
    }
    let compList = {};

    /**
     * 等待用户点击。包括空格、enter等
     * : data可能是回调函数，也可能是一个事件数据
     * : 这是优先级最低的点击，即如果系统被锁定了，这个点击就会失效 —— ？
     */
    compList.waitTap = (data)=>{
        let pid = setTimeout(null);
        let tmpObj = {};
        let ret = new baseComp({
            install: ()=>{
                MessageManager.registerConsumer('user', ret);
            },
            uninstall: ()=>{
                MessageManager.unregisterConsumer('user', ret);
                //ControlManager.getCon('screenTap').unregisterCommand('tap', pid);
            }
        });
        if(typeof data == 'function'){
            ret.receive = ()=>{
                return data(ret);
            }
        }else {
            ret.receive = (code, ptr, callback)=>{
                flags.px = ptr.x;
                flags.py = ptr.y;
                core.insertAction(data.action);
            }
        }
        return ret;
    }
    
    return compList;
}();