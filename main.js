const main = new class Main {
    constructor() {
        //------------------------ 用户修改内容 ------------------------//
        this.version = "2.6.6"; // 游戏版本号；如果更改了游戏内容建议修改此version以免造成缓存问题。
        this.useCompress = false; // 是否使用压缩文件
        // 当你即将发布你的塔时，请使用“JS代码压缩工具”将所有js代码进行压缩，然后将这里的useCompress改为true。
        // 请注意，只有useCompress是false时才会读取floors目录下的文件，为true时会直接读取libs目录下的floors.min.js文件。
        // 如果要进行剧本的修改请务必将其改成false。
        this.bgmRemote = false; // 是否采用远程BGM
        this.bgmRemoteRoot = "https://h5mota.com/music/"; // 远程BGM的根目录
        this.isCompetition = false; // 是否是比赛模式
        this.savePages = 1000; // 存档页数，每页可存5个；默认为1000页5000个存档
        //------------------------ 用户修改内容 END ------------------------//
        this.dom = {
            'body': document.body,
            'gameGroup': document.getElementById('gameContainer'),
        };
        this.mode = 'play';
        this.runtimeLoadList = [
            "system/MessageManager",
            'system/ControlManager',
            "ui/UIManager",
            "map/MapManager",
            'map/ActorManager',
            "scene/SceneManager",
            "event/EventManager",
            'event/BattleManager',
            'event/StatusManager',
            'assets/SpriteManager',
            'assets/AssetsManager',
            'assets/ComponentManager',
            'assets/AnimationManager',
            "runtimeRewrite",
        ];
        this.loadList = [
            'loader', 'control', 'utils', 'items', 'icons', 'maps', 'enemys', 'events', 'actions', 'data', 'ui', 'extensions', 'core'
        ];
        this.pureData = [
            'data',
            'enemys',
            'icons',
            'maps',
            'items',
            'functions',
            'events',
            'textures',
            'specials',
            'commands',
            'plugins',
            "ui",
        ];
        this.materials = [
            'animates', 'enemys', 'hero', 'items', 'npcs', 'terrains', 'enemy48', 'npc48', 'icons',
        ];
        this.floors = {};
        this.canvas = {};
        this.__VERSION__ = "3.0.0";
        this.__VERSION_CODE__ = 100;
    }
    ///// 游戏逻辑初始化
    init(mode, callback) {
        main.mode = mode;
        // 先导入数据
        main.loadJs('project', main.pureData, function () {
            var mainData = data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d.main;
            for (var ii in mainData)
                main[ii] = mainData[ii];
            main.loadJs('libs', main.loadList, function () {
                main.core = core;
                //TODO：判断云端录像?
                if (true) {
                    // 初始化PIXI舞台
                    var windowHeight = core.__PIXELS__ + core.__BOARD_BLANK__ * 2, windowWidth = core.__PIXELS__ + core.__BOARD_BLANK__ * 3 + core.__STATUS_WIDTH__;
                    // 形成固定游戏窗口大小
                    main.windowWidth = windowWidth;
                    main.windowHeight = windowHeight;
                    if(mode == 'editor'){
                        main.windowWidth = core.__PIXELS__;
                        main.windowHeight = core.__PIXELS__;
                    }
                    main.windowRatio = windowHeight / windowWidth;
                    main.render = new PIXI.autoDetectRenderer({
                        width: windowWidth, height: windowHeight,
                    });
                    if (mode == 'play')
                        main.dom.gameGroup.appendChild(main.render.view);
                    else{
                        editor.dom.mapEdit.appendChild(main.render.view);
                    }
                    window.runtime = {};
                    // 加载运行时系统
                    Promise
                        .all(main.runtimeLoadList.map((e) => import("./gameLibs/" + e + ".js")))
                        .then((modules) => {
                            for (let module of modules) {
                                if (module.default) {
                                    const manager = module.default;
                                    //debugger;
                                    window[manager.constructor.name] = manager;
                                    console.log(manager.constructor.name);
                                }
                                for (let name in module) {
                                    if (name == "default") continue;
                                    //debugger;
                                    window[name] = module[name];
                                }
                            }
                            for (let i = 0; i < main.loadList.length; i++) {
                                var name = main.loadList[i];
                                if (name === 'core')
                                    continue;
                                main.core[name] = new window[name]();
                            }
                            main.loadFloors(function () {
                                var coreData = {};
                                ["dom", "statusBar", "canvas", "images", "tilesets", "materials",
                                    "animates", "bgms", "sounds", "floorIds", "floors"].forEach(function (t) {
                                    coreData[t] = main[t];
                                });

                                main.core.init(coreData, callback);
                                main.core.resize();
                                // main.loadMod('gameLibs', 'runtimeRewrite', ()=>{
                                // });
                            });
                            // 设置动画帧率（TODO:可以通过全局设置调低动画帧率）
                            createjs.Ticker.setFPS(60);
                        });
                }
            });
        });
    }
    ////// 动态加载所有核心JS文件 //////
    loadJs(dir, loadList, callback) {
        // 加载js
        main.setMainTipsText('正在加载核心js文件...');
        if (this.useCompress) {
            main.loadMod(dir, dir, function () {
                callback();
            });
        }
        else {
            var instanceNum = 0;
            for (var i = 0; i < loadList.length; i++) {
                main.loadMod(dir, loadList[i], function (modName) {
                    main.setMainTipsText(modName + '.js 加载完毕');
                    instanceNum++;
                    if (instanceNum === loadList.length) {
                        callback();
                    }
                });
            }
        }
    }
    ////// 加载某一个JS文件 //////
    loadMod(dir, modName, callback, onerror) {
        var script = document.createElement('script');
        var name = modName;
        script.src = dir + '/' + modName + (this.useCompress ? ".min" : "") + '.js?v=' + this.version;
        script.onload = function () {
            callback(name);
        };
        main.dom.body.appendChild(script);
    }
    ////// 动态加载所有楼层（剧本） //////
    loadFloors(callback) {
        // 加载js
        main.setMainTipsText('正在加载楼层文件...');
        if (this.useCompress) { // 读取压缩文件
            var script = document.createElement('script');
            script.src = 'project/floors.min.js?v=' + this.version;
            main.dom.body.appendChild(script);
            script.onload = function () {
                main.dom.mainTips.style.display = 'none';
                callback();
            };
        }
        else {
            for (var i = 0; i < main.floorIds.length; i++) {
                main.loadFloor(main.floorIds[i], function (modName) {
                    main.setMainTipsText("楼层 " + modName + '.js 加载完毕');
                    if (Object.keys(main.floors).length === main.floorIds.length) {
                        callback();
                    }
                });
            }
        }
    }
    ////// 加载某一个楼层 //////
    loadFloor(floorId, callback) {
        var script = document.createElement('script');
        script.src = 'project/floors/' + floorId + '.js?v=' + this.version;
        main.dom.body.appendChild(script);
        script.onload = function () {
            callback(floorId);
        };
    }
    ////// 加载过程提示 ////// @_@
    setMainTipsText(text) {
        //main.dom.mainTips.innerHTML = text;
    }
    log(e) {
        if (e) {
            if (window.SceneManager && SceneManager.log)
                SceneManager.log(e);
            if (main.core && main.core.platform && !main.core.platform.isPC) {
                console.log((e.stack || e.toString()));
            }
            else {
                console.log(e);
            }
        }
    }
    //@_@
    createOnChoiceAnimation() {
        var borderColor = main.dom.startButtonGroup.style.caretColor || "rgb(255, 215, 0)";
        // get rgb value
        var rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+\s*)?\)$/.exec(borderColor);
        if (rgb != null) {
            var value = rgb[1] + ", " + rgb[2] + ", " + rgb[3];
            var style = document.createElement("style");
            style.type = 'text/css';
            var keyFrames = "onChoice { " +
                "0% { border-color: rgba(" + value + ", 0.9); } " +
                "50% { border-color: rgba(" + value + ", 0.3); } " +
                "100% { border-color: rgba(" + value + ", 0.9); } " +
                "}";
            style.innerHTML = "@-webkit-keyframes " + keyFrames + " @keyframes " + keyFrames;
            document.body.appendChild(style);
        }
    }
    ////// 选项 ////// @_@
    selectButton(index) {
        var select = function (children) {
            index = (index + children.length) % children.length;
            for (var i = 0; i < children.length; ++i) {
                children[i].classList.remove("onChoiceAnimate");
            }
            children[index].classList.add("onChoiceAnimate");
            if (main.selectedButton == index) {
                children[index].click();
            }
            else {
                main.selectedButton = index;
            }
        };
        if (core.dom.startPanel.style.display != 'block')
            return;
        if (main.dom.startButtons.style.display == 'block') {
            select(main.dom.startButtons.children);
        }
        else if (main.dom.levelChooseButtons.style.display == 'block') {
            select(main.dom.levelChooseButtons.children);
        }
    }
    listen() {
        ////// 窗口大小变化时 //////@_@
        window.onresize = function () {
            try {
                main.core.resize(); //TODO : 用scale控制Scene大小
            }
            catch (e) {
                main.log(e);
            }
        };
    }
}

window.main = main;