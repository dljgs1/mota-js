main.floors.sample0=
{
    "floorId": "sample0",
    "title": "样板 0 层",
    "name": "0",
    "canFlyTo": true,
    "canUseQuickShop": true,
    "defaultGround": "ground",
    "images": [],
    "bgm": "bgm.mp3",
    "item_ratio": 1,
    "map": [
    [  0,  0,220,  0,  0, 20, 87,  3, 65, 64, 44, 43, 42],
    [  0,246,  0,246,  0, 20,  0,  3, 58, 59, 60, 61, 41],
    [219,  0,  0,  0,219, 20,  0,  3, 57, 26, 62, 63, 40],
    [ 20, 20,125, 20, 20, 20,  0,  3, 53, 54, 55, 56, 39],
    [216,247,263,235,248,  6,  0,  3, 49, 50, 51, 52, 38],
    [  6,  6,125,  6,  6,  6,  0,  1, 45, 46, 47, 48, 37],
    [224,254,212,262,204,  5,  0,  1, 31, 32, 34, 33, 36],
    [201,261,217,264,207,  5,  0,  1, 27, 28, 29, 30, 35],
    [  5,  5,125,  5,  5,  5,  0,  1, 21, 22, 23, 24, 25],
    [  0,  0,237,  0,  0,  0, 45,  1,  1,  1,121,  1,  1],
    [  4,  4,133,  4,  4,  4,  0,  0,  0,  0,  0, 85,124],
    [ 87, 11, 12, 13, 14,  4,  4,  2,  2,  2,122,  2,  2],
    [ 88, 89, 90, 91, 92, 93, 94,  2, 81, 82, 83, 84, 86]
],
    "firstArrive": [
        {
            "type": "setText",
            "background": "winskin.png",
            "time": 10
        },
        "\t[样板提示]首次到达某层可以触发 firstArrive 事件，该事件可类似于RMXP中的“自动执行脚本”。\n\n本事件支持一切的事件类型，常常用来触发对话，例如：",
        "\t[hero]\b[up,hero]我是谁？我从哪来？我又要到哪去？",
        "\t[仙子,fairy]你问我...？我也不知道啊...",
        "本层主要对道具、门、怪物等进行介绍，有关事件的各种信息在下一层会有更为详细的说明。",
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
            "type": "componentEnable",
            "name": "statusbar"
        }
    ],
    "events": {
        "10,9": [
            "\t[老人,man]这些是本样板支持的所有的道具。\n\n道具分为四类：items, constants, tools，equips。\nitems 为即捡即用类道具，例如宝石、血瓶、剑盾等。\nconstants 为永久道具，例如怪物手册、楼层传送器、幸运金币等。\ntools 为消耗类道具，例如破墙镐、炸弹、中心对称飞行器等。\nequips 为装备，例如剑盾等。",
            "\t[老人,man]\b[up]有关道具效果，定义在items.js中。\n目前大多数道具已有默认行为，如有自定义的需求则需在items.js中修改代码。",
            "\t[老人,man]\b[up]拾取道具结束后可触发 afterGetItem 事件。\n\n有关事件的各种信息在下一层会有更为详细的说明。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "10,11": [
            "\t[老人,woman]这些是门，需要对应的钥匙打开。\n机关门必须使用特殊的开法。",
            "\t[老人,woman]开门后可触发 afterOpenDoor 事件。\n\n有关事件的各种信息在下一层会有更为详细的说明。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "2,10": [
            "\t[少女,npc0]这些是路障、楼梯、传送门。",
            "\t[少女,npc0]血网的伤害数值、中毒后每步伤害数值、衰弱时攻防下降的数值，都在 data.js 内定义。\n\n路障同样会尽量被自动寻路绕过。",
            "\t[少女,npc0]楼梯和传送门需要在changeFloor中定义目标楼层和位置，可参见样板里已有的的写法。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "2,8": [
            "\t[老人,magician]这些都是各种各样的怪物，所有怪物的数据都在enemys.js中设置。",
            "\t[老人,magician]这批怪物分别为：普通、先攻、魔攻、坚固、2连击、3连击、4连击、破甲、反击、净化。",
            "\t[老人,magician]打败怪物后可触发 afterBattle 事件。\n\n有关事件的各种信息在下一层会有更为详细的说明。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "2,5": [
            "\t[老人,magician]模仿、吸血、中毒、衰弱、诅咒。\n\n请注意吸血怪需要设置value为吸血数值，可参见样板中黑暗大法师的写法。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "2,3": [
            "\t[老人,magician]领域、夹击。\n请注意领域怪需要设置value为伤害数值，可参见样板中初级巫师的写法。",
            "\t[老人,magician]夹击和领域同时发生时先计算领域，再夹击。\n自动寻路同样会尽量绕过你设置的这些点。",
            {
                "type": "hide",
                "time": 500
            }
        ],
        "12,10": {
            "enable": false,
            "data": [
                "\t[仙子,fairy]只有楼上启用事件后，才能看到我并可以和我对话来触发事件。",
                {
                    "type": "hide",
                    "time": 500
                }
            ]
        }
    },
    "changeFloor": {
        "6,0": {
            "floorId": "sample1",
            "stair": "downFloor"
        },
        "0,11": {
            "floorId": "sample0",
            "loc": [
                0,
                12
            ]
        },
        "0,12": {
            "floorId": "sample0",
            "stair": "upFloor"
        },
        "1,12": {
            "floorId": "sample0",
            "loc": [
                1,
                12
            ]
        },
        "2,12": {
            "floorId": "sample0",
            "loc": [
                2,
                12
            ]
        },
        "3,12": {
            "floorId": "sample0",
            "loc": [
                6,
                1
            ],
            "direction": "up"
        },
        "4,12": {
            "floorId": "sample0",
            "loc": [
                0,
                9
            ],
            "direction": "left",
            "time": 1000
        },
        "5,12": {
            "floorId": "sample0",
            "loc": [
                6,
                10
            ],
            "time": 0,
            "portalWithoutTrigger": false
        },
        "6,12": {
            "floorId": "sample0",
            "loc": [
                10,
                10
            ],
            "direction": "left",
            "time": 1000
        }
    },
    "afterBattle": {
        "2,6": [
            "\t[ghostSkeleton]不可能，你怎么可能打败我！\n（一个打败怪物触发的事件）"
        ]
    },
    "afterGetItem": {
        "11,8": [
            "由于状态栏放不下，绿钥匙和铁门钥匙均视为tools，放入工具栏中。\n碰到绿门和铁门仍然会自动使用开门。"
        ],
        "8,6": [
            "由于吸血和夹击等的存在，血瓶默认自动被绕路。\n你可以修改data.js中的系统Flag来设置这一项。"
        ],
        "8,7": [
            "如需修改消耗品的效果，请前往 data.js ，找到并修改values内对应的具体数值即可。\n如果有更高级的需求（如每个区域宝石数值变化），详见doc文档内的做法说明。"
        ],
        "9,5": [
            "每层楼的 canFlyTo 决定了该楼层能否被飞到。\n\n不能被飞到的楼层也无法使用楼层传送器。",
            "飞行的楼层顺序由 main.js 中 floorIds 加载顺序所决定。\n\n是否必须在楼梯边使用楼传器由 data.js 中的系统Flag所决定。"
        ],
        "10,5": [
            "破墙镐是破面前的墙壁还是四个方向的墙壁，由data.js中的系统Flag所决定。"
        ],
        "8,4": [
            "炸弹是只能炸面前的怪物还是四个方向的怪物，由data.js中的系统Flag所决定。\n如只能炸前方怪物则和上面的圣锤等价。\n不能被炸的怪物在enemys中可以定义，可参见样板里黑衣魔王和黑暗大法师的写法。"
        ],
        "10,4": [
            "“上楼”和“下楼”的目标层由 main.js 的 floorIds顺序所决定。"
        ],
        "9,2": [
            "该道具默认是大黄门钥匙，如需改为钥匙盒直接修改 data.js 中的系统Flag即可。"
        ],
        "10,2": [
            "屠龙匕首目前未被定义，可能需要自行实现功能。\n有关如何实现一个道具功能参见doc文档。"
        ],
        "12,7": [
            "在 data.js 的系统Flag中设置是否启用装备栏。\n如果不启用则装备会直接增加属性。"
        ],
        "12,6": [
            "在 data.js 的系统Flag中设置是否启用装备栏按钮。\n如果启用则装备栏按钮会替代楼传按钮。"
        ],
        "12,5": [
            "装备的种类由全塔属性中的equipName决定,type的值就是该类型在equipName中的位次，例如默认情况下equiptype为0代表武器，同时只有type为0的装备的animate属性生效"
        ]
    },
    "afterOpenDoor": {
        "11,12": [
            "你开了一个绿门，触发了一个afterOpenDoor事件"
        ]
    },
    "cannotMove": {},
    "bgmap": [

],
    "fgmap": [

],
    "width": 13,
    "height": 13,
    "autoEvent": {},
    "bg2map": [

],
    "fg2map": [

]
}