main.floors.MT0=
{
    "floorId": "MT0",
    "title": "主塔 3 层",
    "name": "3",
    "canFlyTo": true,
    "canUseQuickShop": true,
    "cannotViewMap": true,
    "defaultGround": "ground",
    "images": [],
    "item_ratio": 1,
    "map": [
    [  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
    [  1, 21, 28,  1, 21, 32, 21,  1,  0,  1,  0, 31,  1],
    [  1,  0, 31,  1, 32, 21, 32,  1,  0, 81,205,  0,  1],
    [  1,217,  0,  1, 21, 22, 21,  1,  0,  1,  1,  1,  1],
    [  1, 81,  1,  1,  1,  0,  1,  1,  0,  1,  0,121,  1],
    [  1,  0,  0,205,  0,  0,  0,201,  0,  0,  0,  0,  1],
    [  1, 81,  1,  1,  0,  0,  0,  1,  0,  1,  1,  1,  1],
    [  1,209,  0,  1,  1,245,  1,  1,  0,  1,  0, 31,  1],
    [  1,  0, 21,  1,  0,  0,  0,  1,  0, 81,217, 21,  1],
    [  1, 31, 27,  1,  0,  0,  0,  1,  0,  1,  1,  1,  1],
    [  1,  1,  1,  1,  1,  0,  1,  1,202,  1,  0,  0,  1],
    [  1, 88,134,  0,  0, 22,360,  1,  0, 81,  0, 87,  1],
    [  1,  1,  1,1069,  1,  1,  1,  1,  1,  1,  1,  1,  1]
],
    "firstArrive": [
        {
            "type": "componentUI",
            "name": "statusbar",
            "x": 0,
            "y": 0,
            "width": 220,
            "height": 436,
            "action": [
                {
                    "type": "drawBackground",
                    "background": "winskin.png",
                    "x": 0,
                    "y": 0,
                    "width": 200,
                    "height": 436
                },
                {
                    "type": "setAttribute",
                    "font": "25",
                    "fillStyle": [
                        255,
                        255,
                        255,
                        1
                    ],
                    "strokeStyle": [
                        187,
                        187,
                        187,
                        1
                    ]
                },
                {
                    "type": "drawImage",
                    "image": "bg.jpg",
                    "x": 0,
                    "y": 0
                },
                {
                    "type": "foreach",
                    "condition": "['hp','atk','def','mdef']",
                    "data": [
                        {
                            "type": "componentUI",
                            "name": "${event:selection}",
                            "x": 0,
                            "y": 0,
                            "width": 100,
                            "height": 40,
                            "action": [
                                {
                                    "type": "componentEmbd",
                                    "name": "click",
                                    "action": [
                                        "点了${event:selection}"
                                    ]
                                },
                                {
                                    "type": "drawIcon",
                                    "id": "${event:selection}",
                                    "x": 5,
                                    "y": 5
                                },
                                {
                                    "type": "fillText",
                                    "x": 40,
                                    "y": 5,
                                    "style": [
                                        255,
                                        255,
                                        255,
                                        1
                                    ],
                                    "text": "#a ${StatusManager.getHeroStatus(event:selection)}"
                                },
                                {
                                    "type": "setFlex",
                                    "flex-direction": "row",
                                    "flex-wrap": "wrap",
                                    "justify-content": "flex-start",
                                    "align-items": "flex-start",
                                    "align-content": "space-around"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "foreach",
                    "condition": "['yellowKey','blueKey','redKey']",
                    "data": [
                        {
                            "type": "componentUI",
                            "name": "${event:selection}",
                            "x": 0,
                            "y": 0,
                            "width": 60,
                            "height": 40,
                            "action": [
                                {
                                    "type": "drawIcon",
                                    "id": "${event:selection}",
                                    "x": 5,
                                    "y": 5
                                },
                                {
                                    "type": "fillText",
                                    "x": 40,
                                    "y": 5,
                                    "style": [
                                        255,
                                        255,
                                        255,
                                        1
                                    ],
                                    "text": "#a ${core.itemCount(event:selection)}"
                                },
                                {
                                    "type": "setFlex",
                                    "flex-direction": "row",
                                    "flex-wrap": "wrap",
                                    "justify-content": "flex-start",
                                    "align-items": "flex-start",
                                    "align-content": "space-around"
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "setFlex",
                    "flex-direction": "column",
                    "flex-wrap": "wrap",
                    "justify-content": "flex-start",
                    "align-items": "flex-start",
                    "align-content": "flex-start"
                }
            ]
        },
        {
            "type": "function",
            "function": "function(){\nSceneManager.startDebugger();\n}"
        },
        "\t[${status:name},hero]村子里的老人都说，这塔里的怪物会吞噬试炼者。但我都已经冲到了三层，一点困难都没有。",
        "\t[${status:name},hero]看来，这塔也没什么了不起的，一口气冲到塔顶吧！",
        {
            "type": "componentEnable",
            "name": "statusbar"
        }
    ],
    "parallelDo": "",
    "events": {
        "11,4": [
            "\t[老人,man]可怜的孩子，你都经历了什么……",
            "\t[${status:name},hero]你能看见我？能告诉我到底发生了什么吗？",
            "\t[老人,man]……看来你还蒙在鼓里，你不知道你现在的状态吧，你已经死了，现在是一道幽魂。",
            "\t[${status:name},hero]我明白，我都亲眼看见自己躺尸了。但问题是，为什么我还能动，还能跟你说话？",
            "\t[老人,man]你的资质不错，还能保持清醒，大部分的勇者被击杀后，都因为不适应灵魂状态迷失了自我。",
            "\t[${status:name},hero]（勇者？是那个传说中闯魔塔救公主的主角？那都是一百年前的事了吧……）",
            "\t[老人,man]这座塔将灵魂的法则显化，所有死去的生物，都是暂时的进入了灵魂状态，时机一到，就会重新复活。",
            "\t[${status:name},hero]那我也能够复活了？！快告诉我该怎么做！",
            "\t[老人,man]年轻人，不要急。先来个自我介绍吧，我本来是负责给勇者发怪物手册的老伯伯，但因为透露太多机密触怒了魔王被干掉了，变成了现在的样子。",
            "\t[老人,man]如果我要复活，就需要这座塔的主人——魔王的帮助，才能集中能量重新凝聚身体。",
            "\t[${status:name},hero]魔王亲自干掉我，怎么会答应复活我……",
            "\t[老人,man]你不一样，你的身体还在，只需要一颗归魂石就能复活。很巧，我这里就有一颗。",
            {
                "type": "addValue",
                "name": "item:I302",
                "value": "1"
            },
            "\t[老人,man]只需要找到你的身体，使用它，就可以了。",
            "\t[${status:name},hero]太感谢了！",
            "\t[老人,man]……这最后的怪物手册……我通过灵魂碎片传输给你……我……已经不行了……",
            {
                "type": "addValue",
                "name": "item:book",
                "value": "1"
            },
            "\t[${status:name},hero]您怎么了！？",
            "\t[老人,man]……归魂石……乃是灵魂至宝……像我这样的\r[yellow]孤魂野鬼\r[]，失去了肉身，只能依附归魂石才能生存……",
            "\t[老人,man]……我已经没用了……只有交给你才能发挥它真正的作用……记得……一定要击败魔王……救出公主……",
            "\t[${status:name},hero]（他恐怕还不知道，勇者公主的传说已经百年前的事了，现在恐怕早就化为枯骨了）",
            {
                "type": "hide",
                "loc": [
                    [
                        11,
                        4
                    ]
                ],
                "time": 500
            },
            "\t[${status:name},hero]您放心……我一定会做到的。"
        ],
        "5,7": {
            "trigger": null,
            "enable": false,
            "noPass": null,
            "displayDamage": true,
            "data": []
        },
        "5,10": [
            {
                "type": "moveHero",
                "time": 200,
                "steps": [
                    "up"
                ]
            },
            {
                "type": "show",
                "loc": [
                    [
                        5,
                        7
                    ]
                ],
                "time": 500
            },
            {
                "type": "newtext",
                "title": "魔王",
                "img": "redKing",
                "text": "欢迎来到魔塔，你是第10081名挑战者。但我现在很忙，不会给你挑战我的机会。所以再见吧。"
            },
            "\t[${status:name},hero]什么？",
            {
                "type": "battle",
                "id": "redKing"
            },
            {
                "type": "setCurtain",
                "color": [
                    0,
                    0,
                    0,
                    1
                ],
                "time": 200
            },
            {
                "type": "dowhile",
                "condition": "false",
                "data": [
                    {
                        "type": "hide",
                        "loc": [
                            [
                                4,
                                1
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                4,
                                2
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                4,
                                3
                            ]
                        ],
                        "time": 0
                    }
                ]
            },
            {
                "type": "dowhile",
                "condition": "false",
                "data": [
                    {
                        "type": "hide",
                        "loc": [
                            [
                                5,
                                1
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                5,
                                2
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                5,
                                3
                            ]
                        ],
                        "time": 0
                    }
                ]
            },
            {
                "type": "dowhile",
                "condition": "false",
                "data": [
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                1
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                2
                            ]
                        ],
                        "time": 0
                    },
                    {
                        "type": "hide",
                        "loc": [
                            [
                                6,
                                3
                            ]
                        ],
                        "time": 0
                    }
                ]
            },
            "\t[结局1]你死了。\n如题。",
            {
                "type": "sleep",
                "time": 500,
                "noSkip": true
            },
            "\t[${status:name},hero]（我，我就这么死了？我才刚进来，难道不是给我安排一系列试炼的吗？？…我还不能死啊……翠华……我的梦想还没有实现！）",
            {
                "type": "sleep",
                "time": 500
            },
            "\t[魔王,redKing]嗯，这具躯壳…很快就会变成我最忠诚的骷髅战士……谁把这些钥匙扔在这里了？统统拿走！",
            {
                "type": "setCurtain",
                "time": 500,
                "async": true
            },
            {
                "type": "hide",
                "loc": [
                    [
                        5,
                        7
                    ]
                ],
                "time": 500
            },
            "\t[${status:name},hero]（等等……为什么我还能听见。）",
            {
                "type": "waitAsync"
            },
            "\t[${status:name},hero]（我这是怎么了？）",
            {
                "type": "hide",
                "time": 0
            }
        ],
        "6,11": {
            "trigger": "action",
            "name": "黑菜",
            "enable": true,
            "noPass": null,
            "displayDamage": true,
            "data": [
                {
                    "type": "setText",
                    "time": 50
                },
                {
                    "type": "newtext",
                    "title": "老头",
                    "position": "up,黑菜",
                    "text": "${flag:aa}"
                },
                {
                    "type": "newtext",
                    "title": "老头",
                    "position": "up,黑菜",
                    "text": "欢迎使用事件编辑器(双击方块进入多行编辑)这是一段很长很长的话啊啊啊啊啊啊啊"
                },
                {
                    "type": "move",
                    "time": 1000,
                    "keep": true,
                    "async": true,
                    "steps": [
                        "right"
                    ]
                },
                {
                    "type": "newtext",
                    "title": "老头",
                    "position": "up,黑菜",
                    "text": "我 要 瞎 了"
                },
                {
                    "type": "if",
                    "condition": "true",
                    "true": [],
                    "false": [
                        {
                            "type": "setText",
                            "time": 100
                        },
                        {
                            "type": "setCurtain",
                            "color": [
                                0,
                                0,
                                0,
                                1
                            ],
                            "time": 500,
                            "async": true
                        },
                        {
                            "type": "newtext",
                            "title": "老头",
                            "position": "up,黑菜",
                            "text": "欢迎使用事件编辑器(双击方块进入多行编辑)"
                        },
                        {
                            "type": "waitAsync"
                        },
                        {
                            "type": "show",
                            "loc": [
                                [
                                    5,
                                    7
                                ]
                            ],
                            "time": 500
                        },
                        {
                            "type": "setCurtain",
                            "time": 500
                        },
                        {
                            "type": "setValue",
                            "name": "flag:aa",
                            "value": "1"
                        },
                        {
                            "type": "screenFlash",
                            "color": [
                                255,
                                255,
                                255,
                                1
                            ],
                            "time": 500,
                            "times": 10,
                            "async": true
                        },
                        {
                            "type": "newtext",
                            "title": "老头",
                            "position": "up,黑菜",
                            "text": "我 要 瞎 了"
                        },
                        {
                            "type": "changeFloor",
                            "floorId": "MT3",
                            "loc": [
                                6,
                                12
                            ],
                            "time": 500
                        }
                    ]
                }
            ]
        },
        "2,11": [
            "0",
            {
                "type": "function",
                "function": "function(){\nUIManager.objs.statusbar.ui_setFlex({'align-content':'space-between'})\n}"
            },
            "1",
            {
                "type": "function",
                "function": "function(){\nUIManager.objs.statusbar.ui_setFlex({'align-content':'flex-start'})\n}"
            },
            "2",
            {
                "type": "function",
                "function": "function(){\nUIManager.objs.statusbar.ui_setFlex({'align-content':'center'})\n}"
            },
            "3",
            {
                "type": "function",
                "function": "function(){\nUIManager.objs.statusbar.ui_setFlex({'align-content':'space-around'})\n}"
            },
            {
                "type": "hide",
                "time": 500
            }
        ]
    },
    "changeFloor": {
        "11,11": {
            "floorId": ":next",
            "stair": "downFloor"
        },
        "1,11": {
            "floorId": "MT5",
            "loc": [
                6,
                6
            ],
            "time": 500
        }
    },
    "afterBattle": {},
    "afterGetItem": {},
    "afterOpenDoor": {},
    "cannotMove": {},
    "bgmap": [

],
    "fgmap": [

],
    "width": 13,
    "height": 13,
    "autoEvent": {
        "6,11": {
            "0": null,
            "1": null
        }
    },
    "bg2map": [

],
    "fg2map": [

]
}