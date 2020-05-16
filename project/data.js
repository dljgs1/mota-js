var data_a1e2fb4a_e986_4524_b0da_9b7ba7c0874d = 
{
	"main": {
		"floorIds": [
			"MT0",
			"sample0",
			"sample1",
			"sample2",
			"sample3"
		],
		"images": [
			"light1.png",
			"bg.jpg",
			"winskin.png",
			"sky.jpg"
		],
		"tilesets": [
			"magictower.png",
			"Tilesets/001-Grassland01.png",
			"Tilesets/002-Woods01.png",
			"Tilesets/003-Forest01.png",
			"Tilesets/004-Mountain01.png",
			"Tilesets/005-Beach01.png",
			"Tilesets/006-Desert01.png",
			"Tilesets/007-Swamp01.png",
			"Tilesets/008-Snowfield01.png",
			"Tilesets/009-CastleTown01.png",
			"Tilesets/010-CastleTown02.png",
			"Tilesets/011-PortTown01.png",
			"Tilesets/012-PortTown02.png",
			"Tilesets/013-PostTown01.png",
			"Tilesets/014-PostTown02.png",
			"Tilesets/015-ForestTown01.png",
			"Tilesets/016-ForestTown02.png",
			"Tilesets/017-MineTown01.png",
			"Tilesets/018-MineTown02.png",
			"Tilesets/019-DesertTown01.png",
			"Tilesets/020-DesertTown02.png",
			"Tilesets/021-SnowTown01.png",
			"Tilesets/022-SnowTown02.png",
			"Tilesets/023-FarmVillage01.png",
			"Tilesets/024-FarmVillage02.png",
			"Tilesets/025-Castle01.png",
			"Tilesets/026-Castle02.png",
			"Tilesets/027-Castle03.png",
			"Tilesets/028-Church01.png",
			"Tilesets/029-Church02.png",
			"Tilesets/030-Ship01.png",
			"Tilesets/031-Ship02.png",
			"Tilesets/032-Heaven01.png",
			"Tilesets/033-Heaven02.png",
			"Tilesets/034-Bridge01.png",
			"Tilesets/035-Ruins01.png",
			"Tilesets/036-Shop01.png",
			"Tilesets/037-Fort01.png",
			"Tilesets/038-Fort02.png",
			"Tilesets/039-Tower01.png",
			"Tilesets/040-Tower02.png",
			"Tilesets/041-EvilCastle01.png",
			"Tilesets/042-EvilCastle02.png",
			"Tilesets/043-Cave01.png",
			"Tilesets/044-Cave02.png",
			"Tilesets/045-Cave03.png",
			"Tilesets/046-Cave04.png",
			"Tilesets/047-Mine01.png",
			"Tilesets/048-Sewer01.png",
			"Tilesets/049-InnerBody01.png",
			"Tilesets/050-DarkSpace01.png"
		],
		"animates": [
			"hand",
			"sword",
			"zone",
			"hand_sword",
			"jianji"
		],
		"bgms": [
			"bgm.mp3",
			"FT.mp3"
		],
		"sounds": [
			"crack.mp3",
			"potion.mp3",
			"floor.mp3",
			"floor_fly.mp3",
			"floor_long.mp3",
			"attack.mp3",
			"door.mp3",
			"item.mp3",
			"equip.mp3",
			"zone.mp3",
			"jump.mp3",
			"pickaxe.mp3",
			"bomb.mp3",
			"centerFly.mp3",
			"thunder.mp3",
			"thunder_big.mp3",
			"rain.ogg",
			"sword.ogg"
		],
		"nameMap": {
			"背景图.jpg": "bg.jpg",
			"背景音乐.mp3": "bgm.mp3"
		},
		"startBackground": "bg.jpg",
		"startLogoStyle": "color: black",
		"levelChoose": [
			[
				"简单",
				"Easy"
			],
			[
				"普通",
				"Normal"
			],
			[
				"困难",
				"Hard"
			],
			[
				"噩梦",
				"Hell"
			]
		],
		"equipName": [
			"功法",
			"法则"
		],
		"startBgm": null,
		"statusLeftBackground": null,
		"statusTopBackground": "url(project/images/ground.png) repeat",
		"toolsBackground": "url(project/images/ground.png) repeat",
		"borderColor": "#111111",
		"statusBarColor": "white",
		"hardLabelColor": "red",
		"floorChangingBackground": "black",
		"floorChangingTextColor": "white",
		"font": "Verdana",
		"startButtonsStyle": "background-color: #32369F; opacity: 0.85; color: #FFFFFF; border: #FFFFFF 2px solid; caret-color: #FFD700;"
	},
	"firstData": {
		"title": "魔塔样板",
		"name": "template3.0",
		"version": "Ver 3.0",
		"floorId": "sample0",
		"hero": {
			"name": "杨光",
			"lv": 1,
			"hpmax": 1000,
			"hp": 1000,
			"manamax": -1,
			"mana": 1,
			"atk": 10,
			"def": 10,
			"mdef": 0,
			"money": 0,
			"experience": 0,
			"equipment": [],
			"items": {
				"keys": {
					"yellowKey": 0,
					"blueKey": 0,
					"redKey": 0
				},
				"constants": {},
				"tools": {},
				"equips": {}
			},
			"loc": {
				"direction": "right",
				"x": 6,
				"y": 10
			},
			"flags": {},
			"steps": 0
		},
		"startCanvas": [
			{
				"type": "comment",
				"text": "在这里可以用事件来自定义绘制标题界面的背景图等"
			},
			{
				"type": "comment",
				"text": "也可以直接切换到其他楼层（比如某个开始剧情楼层）进行操作。"
			},
			{
				"type": "showImage",
				"code": 1,
				"image": "bg.jpg",
				"loc": [
					0,
					0
				],
				"dw": 100,
				"dh": 100,
				"opacity": 1,
				"time": 0
			},
			{
				"type": "while",
				"condition": "1",
				"data": [
					{
						"type": "comment",
						"text": "给用户提供选择项，这里简单的使用了choices事件"
					},
					{
						"type": "comment",
						"text": "也可以贴按钮图然后使用等待操作来完成"
					},
					{
						"type": "choices",
						"choices": [
							{
								"text": "开始游戏",
								"action": [
									{
										"type": "comment",
										"text": "检查bgm状态，下同"
									},
									{
										"type": "function",
										"function": "function(){\ncore.control.checkBgm()\n}"
									},
									{
										"type": "if",
										"condition": "core.flags.startDirectly",
										"true": [
											{
												"type": "comment",
												"text": "直接开始游戏，设置初始化数据"
											},
											{
												"type": "function",
												"function": "function(){\ncore.events.setInitData('')\n}"
											}
										],
										"false": [
											{
												"type": "comment",
												"text": "动态生成难度选择项"
											},
											{
												"type": "function",
												"function": "function(){\nvar choices = [];\nmain.levelChoose.forEach(function (one) {\n\tchoices.push({\"text\": one[0], \"action\": [\n\t\t{\"type\": \"function\", \"function\": \"function() { core.status.hard = '\"+one[1]+\"'; core.events.setInitData('\"+one[1]+\"'); }\"}\n\t]});\n})\ncore.insertAction({\"type\": \"choices\", \"choices\": choices});\n}"
											}
										]
									},
									{
										"type": "hideImage",
										"code": 1,
										"time": 0
									},
									{
										"type": "comment",
										"text": "成功选择难度"
									},
									{
										"type": "break"
									}
								]
							},
							{
								"text": "读取存档",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.control.checkBgm()\n}"
									},
									{
										"type": "comment",
										"text": "简单的使用“呼出读档界面”来处理"
									},
									{
										"type": "callLoad"
									}
								]
							},
							{
								"text": "回放录像",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.control.checkBgm()\n}"
									},
									{
										"type": "comment",
										"text": "这段代码会弹框选择录像文件"
									},
									{
										"type": "if",
										"condition": "!core.isReplaying()",
										"true": [
											{
												"type": "function",
												"function": "function(){\ncore.chooseReplayFile()\n}"
											}
										],
										"false": []
									}
								]
							}
						]
					}
				]
			},
			{
				"type": "comment",
				"text": "接下来会执行startText中的事件"
			}
		],
		"startText": [],
		"shops": [
			{
				"id": "keyShop1",
				"textInList": "回收钥匙商店",
				"mustEnable": false,
				"commonEvent": "回收钥匙商店"
			}
		],
		"levelUp": [
			{
				"need": "0",
				"title": "凡阶",
				"action": []
			}
		]
	},
	"values": {
		"lavaDamage": 100,
		"poisonDamage": 10,
		"weakValue": 20,
		"redJewel": 1,
		"blueJewel": 1,
		"greenJewel": 3,
		"redPotion": 100,
		"bluePotion": 250,
		"yellowPotion": 500,
		"greenPotion": 800,
		"breakArmor": 0.9,
		"counterAttack": 0.1,
		"purify": 3,
		"hatred": 2,
		"moveSpeed": 100,
		"animateSpeed": 400,
		"floorChangeTime": 800
	},
	"flags": {
		"enableFloor": true,
		"enableName": true,
		"enableLv": true,
		"enableHPMax": true,
		"enableMana": true,
		"enableMDef": true,
		"enableMoney": false,
		"enableExperience": true,
		"enableLevelUp": true,
		"enableAnimate": true,
		"levelUpLeftMode": true,
		"enableKeys": true,
		"enablePZF": false,
		"enableDebuff": false,
		"enableSkill": false,
		"flyNearStair": false,
		"flyRecordPosition": false,
		"pickaxeFourDirections": false,
		"bombFourDirections": false,
		"snowFourDirections": false,
		"bigKeyIsBox": false,
		"steelDoorWithoutKey": false,
		"itemFirstText": false,
		"equipment": false,
		"equipboxButton": false,
		"iconInEquipbox": false,
		"enableAddPoint": false,
		"enableNegativeDamage": false,
		"hatredDecrease": true,
		"betweenAttackCeil": false,
		"betweenAttackMax": false,
		"useLoop": false,
		"startUsingCanvas": false,
		"startDirectly": false,
		"statusCanvas": true,
		"statusCanvasRowsOnMobile": 3,
		"displayEnemyDamage": false,
		"displayCritical": true,
		"displayExtraDamage": true,
		"enableGentleClick": true,
		"potionWhileRouting": false,
		"ignoreChangeFloor": true,
		"canGoDeadZone": true,
		"enableMoveDirectly": true,
		"enableDisabledShop": true,
		"disableShopOnDamage": false,
		"blurFg": false,
		"checkConsole": false
	}
}