/*
    对旧版本的全部覆写，用于通过3.0系统

     —————— 游戏性基础系统 ————
*/

import SceneManager from './scene/SceneManager.js'

const tco = function(f){
    var value;
    var active = false;
    var acc = [];
    return function(){
        acc.push(arguments);
        if(!active){
            active = true;
            while(acc.length){
                value = f.apply(this, acc.shift());
            }
            active = false;
            return value;
        }
    }
};


events.prototype._action_text = function (data, x, y, prefix) {
    if (this.__action_checkReplaying()) return;
    this._action_newtext(data, x, y, prefix);
}

events.prototype._action_newtext = function (data, x, y, prefix) {
    if (this.__action_checkReplaying()) return;
    UIManager.drawTextBox(data);
}
















/*
////// 初始化 //////
core.prototype.init = function (coreData, callback) {
    this._forwardFuncs();
    for (var key in coreData)
        core[key] = coreData[key];
    this._init_flags();
    this._init_platform();
    this._init_others();
    this._initPlugins();

    core.loader._load(function () {
        core.extensions._load(function () {
            if(main.mode=='play'){ // TODO:需要更为精确的判断 区分云端录像和运行时
                // 运行时资产初始化：
                window.AssetsManager._init();
            }
            core._afterLoadResources(callback);
        });
    });
}

core.prototype._init_flags = function () {
    core.flags = core.clone(core.data.flags);
    core.values = core.clone(core.data.values);
    core.firstData = core.clone(core.data.firstData);
    this._init_sys_flags();

    // core.dom.versionLabel.innerText = core.firstData.version;
    // core.dom.logoLabel.innerText = core.firstData.title;
    document.title = core.firstData.title + " - HTML5魔塔";
    // document.getElementById("startLogo").innerText = core.firstData.title;
    (core.firstData.shops||[]).forEach(function (t) { core.initStatus.shops[t.id] = t; });
    // 初始化自动事件
    for (var floorId in core.floors) {
        var autoEvents = core.floors[floorId].autoEvent || {};
        for (var loc in autoEvents) {
            var locs = loc.split(","), x = parseInt(locs[0]), y = parseInt(locs[1]);
            for (var index in autoEvents[loc]) {
                var autoEvent = core.clone(autoEvents[loc][index]);
                if (autoEvent && autoEvent.condition && autoEvent.data) {
                    autoEvent.floorId = floorId;
                    autoEvent.x = x;
                    autoEvent.y = y;
                    autoEvent.index = index;
                    autoEvent.symbol = floorId + "@" + x + "@" + y + "@" + index;
                    autoEvent.condition = core.replaceValue(autoEvent.condition);
                    autoEvent.data = core.precompile(autoEvent.data);
                    core.initStatus.autoEvents.push(autoEvent);
                }
            }
        }
    }
    core.initStatus.autoEvents.sort(function (e1, e2) {
        if (e1.priority != e2.priority) return e2.priority - e1.priority;
        if (e1.floorId != e2.floorId) return core.floorIds.indexOf(e1.floorId) - core.floorIds.indexOf(e2.floorId);
        if (e1.x != e2.x) return e1.x - e2.x;
        if (e1.y != e2.y) return e1.y - e2.y;
        return e1.index - e2.index;
    })

    core.maps._setFloorSize();
    // 初始化怪物、道具等
    core.material.enemys = core.enemys.getEnemys();
    core.material.items = core.items.getItems();
    core.items._resetItems();
    core.material.icons = core.icons.getIcons();
}

core.prototype._afterLoadResources = function (callback) {
    // 初始化地图
    core.initStatus.maps = core.maps._initMaps();
    core.control._setRequestAnimationFrame();
    if (core.plugin._afterLoadResources)
        core.plugin._afterLoadResources();
    //@_@core.showStartAnimate();
    // 资源加载？

    core.startGame();
    if (callback) callback();
}
*/
////// canvas创建 //////
ui.prototype.createCanvas = (name, x, y, width, height, z)=>{
    if (core.dymCanvas[name]) {
        core.ui.relocateCanvas(name, x, y);
        core.ui.resizeCanvas(name, width, height);
        core.dymCanvas[name].canvas.style.zIndex = z;
        return core.dymCanvas[name];
    }
    var newCanvas = document.createElement("canvas");
    newCanvas.id = name;
    newCanvas.style.display = 'block';
    newCanvas.width = width;
    newCanvas.height = height;
    newCanvas.setAttribute("_left", x);
    newCanvas.setAttribute("_top", y);
    newCanvas.style.width = width * core.domStyle.scale + 'px';
    newCanvas.style.height = height * core.domStyle.scale + 'px';
    newCanvas.style.left = x * core.domStyle.scale + 'px';
    newCanvas.style.top = y * core.domStyle.scale + 'px';
    newCanvas.style.zIndex = z;
    newCanvas.style.position = 'absolute';
    core.dymCanvas[name] = newCanvas.getContext('2d');
    return core.dymCanvas[name];
};
////// canvas删除 //////
ui.prototype.deleteCanvas = (name)=>{
    if (!core.dymCanvas[name]) return null;
    delete core.dymCanvas[name];
};


control.prototype.drawHero = ()=>{};

////// 楼层切换 //////
events.prototype.changeFloor = function (floorId, stair, heroLoc, time, callback, fromLoad) {
    var info = this._changeFloor_getInfo(floorId, stair, heroLoc, time);
    if (info == null) {
        if (callback) callback();
        return;
    }
    info.fromLoad = fromLoad;
    floorId = info.floorId;
    info.locked = core.status.lockControl;
    core.lockControl();
    // core.status.replay.animate = true;
    // clearInterval(core.interval.onDownInterval);
    // core.interval.onDownInterval = 'tmp';
    core.events._changeFloor_changing(info, callback);
    // this._changeFloor_beforeChange(info, callback);
}

events.prototype._changeFloor_changing = function (info, callback) {
    this.changingFloor(info.floorId, info.heroLoc, info.fromLoad);
        this._changeFloor_afterChange(info, callback);
}

loader.prototype._loadIcons = function () {
    this.loadImage("icons.png", function (id, image) {
        return;//!
        var images = core.splitImage(image);
        for (var key in core.statusBar.icons) {
            if (typeof core.statusBar.icons[key] == 'number') {
                core.statusBar.icons[key] = images[core.statusBar.icons[key]];
                if (core.statusBar.image[key] != null)
                    core.statusBar.image[key].src = core.statusBar.icons[key].src;
            }
        }
    });
}

////// 设置加载进度条进度 //////
loader.prototype._setStartProgressVal = function (val) {
    //! 进度条？ //core.dom.startTopProgress.style.width = val + '%';
}

////// 设置加载进度条提示文字 //////
loader.prototype._setStartLoadTipText = function (text) {
    // core.dom.startTopLoadTips.innerText = text;
}


////// 更新状态栏 //////
control.prototype.updateStatusBar = function (doNotCheckAutoEvents) {
    if (!core.isPlaying()) {
        return;
    }
    core.updateCheckBlock();
    SceneManager.mapScene.updateDamageInfo(core.status.floorId);
    return;//@_@ 待施工
}


control.prototype.updateGlobalAttribute = function (name) {
    return;//@_@
}
////// 更新状态栏的勇士图标 //////
control.prototype.updateHeroIcon = function (name) {
}


////// 屏幕分辨率改变后重新自适应 //////
control.prototype.resize = function() {
    if (main.mode=='editor')return;
    SceneManager.rendererResize();
    return;
    var clientWidth = main.dom.body.clientWidth, clientHeight = main.dom.body.clientHeight;
    // 根据初设窗口大小直接变化
    var w = main.windowWidth, h = main.windowHeight;
    var ratio = h/w;
    if(document.body.clientWidth<main.windowWidth){
        w = document.body.clientWidth;
        h = ~~(document.body.clientWidth * ratio);
    }
    if(ratio<1){
    }x = w/main.windowWidth;
    SceneManager.mainScene.scale.y = h/main.windowHeight;
    main.render.resize(w, h);
    return;
}

////// 清除游戏状态和数据 //////
control.prototype.clearStatus = function() {
	return;//@_@
    // 停止各个Timeout和Interval
    for (var i in core.timeout) {
        clearTimeout(core.timeout[i]);
        core.timeout[i] = null;
    }
    for (var i in core.interval) {
        clearInterval(core.interval[i]);
        core.interval[i] = null;
    }
    core.status = {};
	core.clearStatusBar();
	if(!__tmp__nochange__){ // 短暂性重置数据不需要删除画布
	    core.deleteAllCanvas();
	}else{
		__tmp__nochange__ = false;
	}
    core.status.played = false;
}

////// 清空状态栏 //////
control.prototype.clearStatusBar = function() {
    return;
    Object.keys(core.statusBar).forEach(function (e) {
        if (core.statusBar[e].innerHTML != null)
            core.statusBar[e].innerHTML = "&nbsp;";
    })
    core.statusBar.image.book.style.opacity = 0.3;
    if (!core.flags.equipboxButton)
        core.statusBar.image.fly.style.opacity = 0.3;
}

control.prototype._showStartAnimate_resetDom = function () {
    
}
events.prototype._startGame_start = function (hard, seed, route, callback) {
    main.log('开始游戏');
    core.resetGame(core.firstData.hero, hard, null, core.clone(core.initStatus.maps));
    var nowLoc = core.clone(core.getHeroLoc());
    core.setHeroLoc('x', -1);
    core.setHeroLoc('y', -1);

    if (seed != null) {
        core.setFlag('__seed__', seed);
        core.setFlag('__rand__', seed);
    }
    else core.utils.__init_seed();
    this.setInitData();
    // core.clearStatusBar(); //@_@

    var todo = [];
    if (core.flags.startUsingCanvas) {
        core.hideStatusBar();
        core.dom.musicBtn.style.display = 'block';
        core.push(todo, core.firstData.startCanvas);
    }
    // test();
    core.events._startGame_afterStart(nowLoc, callback);
    //
    if (route != null) core.startReplay(route);
}

events.prototype._startGame_afterStart = function (nowLoc, callback) {
    core.ui.closePanel();
    this._startGame_statusBar();
    // core.dom.musicBtn.style.display = 'none';
    core.changeFloor(core.firstData.floorId, null, nowLoc, null, function () {
        // 插入一个空事件避免直接回放录像出错
        core.insertAction([]);
        if (callback) callback();
    });
    this._startGame_upload();
}



ui.prototype.clearUI = function () {
    
    return;//@_@
    core.status.boxAnimateObjs = [];
    if (core.dymCanvas._selector) core.deleteCanvas("_selector");
    main.dom.next.style.display = 'none';
    core.clearMap('ui');
    core.setAlpha('ui', 1);
}




////// 绘制一个对话框 //////
ui.prototype.drawTextBox = function(content, showAll) {
    if (core.status.event && core.status.event.id == 'action')
        core.status.event.ui = content;

    this.clearUI();

    content = core.replaceText(content);
    core.doAction();
}