var events_c12a15a8_c380_4b28_8144_256cba95f760 = 
{
	"commonEvent": {
		"加点事件": [
			{
				"type": "comment",
				"text": "通过传参，flag:arg1 表示当前应该的加点数值"
			},
			{
				"type": "choices",
				"choices": [
					{
						"text": "攻击+${1*flag:arg1}",
						"action": [
							{
								"type": "setValue",
								"name": "status:atk",
								"value": "status:atk+1*flag:arg1"
							}
						]
					},
					{
						"text": "防御+${2*flag:arg1}",
						"action": [
							{
								"type": "setValue",
								"name": "status:def",
								"value": "status:def+2*flag:arg1"
							}
						]
					},
					{
						"text": "生命+${200*flag:arg1}",
						"action": [
							{
								"type": "setValue",
								"name": "status:hp",
								"value": "status:hp+200*flag:arg1"
							}
						]
					}
				]
			}
		],
		"毒衰咒处理": [
			{
				"type": "comment",
				"text": "获得毒衰咒效果，flag:arg1 为要获得的类型"
			},
			{
				"type": "switch",
				"condition": "flag:arg1",
				"caseList": [
					{
						"case": "0",
						"action": [
							{
								"type": "comment",
								"text": "获得毒效果"
							},
							{
								"type": "if",
								"condition": "!flag:poison",
								"true": [
									{
										"type": "setValue",
										"name": "flag:poison",
										"value": "true"
									}
								],
								"false": []
							}
						]
					},
					{
						"case": "1",
						"action": [
							{
								"type": "comment",
								"text": "获得衰效果"
							},
							{
								"type": "if",
								"condition": "!flag:weak",
								"true": [
									{
										"type": "setValue",
										"name": "flag:weak",
										"value": "true"
									},
									{
										"type": "if",
										"condition": "core.values.weakValue>=1",
										"true": [
											{
												"type": "comment",
												"text": ">=1：直接扣数值"
											},
											{
												"type": "addValue",
												"name": "status:atk",
												"value": "-core.values.weakValue"
											},
											{
												"type": "addValue",
												"name": "status:def",
												"value": "-core.values.weakValue"
											}
										],
										"false": [
											{
												"type": "comment",
												"text": "<1：扣比例"
											},
											{
												"type": "function",
												"function": "function(){\ncore.addBuff('atk', -core.values.weakValue);\n}"
											},
											{
												"type": "function",
												"function": "function(){\ncore.addBuff('def', -core.values.weakValue);\n}"
											}
										]
									}
								],
								"false": []
							}
						]
					},
					{
						"case": "2",
						"action": [
							{
								"type": "comment",
								"text": "获得咒效果"
							},
							{
								"type": "if",
								"condition": "!flag:curse",
								"true": [
									{
										"type": "setValue",
										"name": "flag:curse",
										"value": "true"
									}
								],
								"false": []
							}
						]
					}
				]
			}
		],
		"滑冰事件": [
			{
				"type": "comment",
				"text": "公共事件：滑冰事件"
			},
			{
				"type": "if",
				"condition": "core.canMoveHero()",
				"true": [
					{
						"type": "comment",
						"text": "检测下一个点是否可通行"
					},
					{
						"type": "setValue",
						"name": "flag:nx",
						"value": "core.nextX()"
					},
					{
						"type": "setValue",
						"name": "flag:ny",
						"value": "core.nextY()"
					},
					{
						"type": "if",
						"condition": "core.noPass(flag:nx, flag:ny)",
						"true": [
							{
								"type": "comment",
								"text": "不可通行，触发下一个点的事件"
							},
							{
								"type": "trigger",
								"loc": [
									"flag:nx",
									"flag:ny"
								]
							}
						],
						"false": [
							{
								"type": "comment",
								"text": "可通行，先移动到下个点，然后检查阻激夹域，并尝试触发该点事件"
							},
							{
								"type": "moveHero",
								"time": 80,
								"steps": [
									"forward"
								]
							},
							{
								"type": "function",
								"function": "function(){\ncore.checkBlock();\n}"
							},
							{
								"type": "comment",
								"text": "【触发事件】如果该点存在事件则会立刻结束当前事件"
							},
							{
								"type": "trigger",
								"loc": [
									"flag:nx",
									"flag:ny"
								]
							},
							{
								"type": "comment",
								"text": "如果该点不存在事件，则继续检测该点是否是滑冰点"
							},
							{
								"type": "if",
								"condition": "core.getBgNumber() == 167",
								"true": [
									{
										"type": "function",
										"function": "function(){\ncore.insertAction(\"滑冰事件\",null,null,null,true)\n}"
									}
								],
								"false": []
							}
						]
					}
				],
				"false": []
			}
		],
		"回收钥匙商店": [
			{
				"type": "while",
				"condition": "1",
				"data": [
					{
						"type": "choices",
						"text": "选择一个队员进行对话",
						"choices": [
							{
								"text": "天书之灵",
								"icon": "N391",
								"color": [
									255,
									255,
									119,
									1
								],
								"action": [
									{
										"type": "choices",
										"text": "\t[天书之灵,N391]",
										"choices": [
											{
												"text": "对话",
												"action": []
											},
											{
												"text": "领取功法",
												"action": []
											},
											{
												"text": "修行任务",
												"action": []
											}
										]
									}
								]
							},
							{
								"text": "剑魔",
								"icon": "N1085",
								"color": [
									255,
									187,
									85,
									1
								],
								"action": [
									{
										"type": "choices",
										"text": "\t[剑魔,N1085]",
										"choices": [
											{
												"text": "对话",
												"action": []
											},
											{
												"text": "领取功法",
												"action": []
											},
											{
												"text": "修行任务",
												"action": []
											}
										]
									}
								]
							},
							{
								"text": "离开",
								"action": [
									{
										"type": "exit"
									}
								]
							}
						]
					}
				]
			}
		],
		"剧情": [
			{
				"type": "switch",
				"condition": "flag:arg1",
				"caseList": [
					{
						"case": "0",
						"action": [
							{
								"type": "setValue",
								"name": "flag:gameproc",
								"value": "1"
							},
							{
								"type": "jumpHero",
								"time": 200
							},
							{
								"type": "changePos",
								"direction": "left"
							},
							{
								"type": "sleep",
								"time": 300
							},
							{
								"type": "changePos",
								"direction": "right"
							},
							{
								"type": "sleep",
								"time": 300
							},
							{
								"type": "changePos",
								"direction": "down"
							},
							"\t[${status:name},hero]！！竟然……真的复活了！",
							"\t[${status:name},hero]谢天谢地！总算，总算，总算把小命保住了……",
							"\t[${status:name},hero]对不起了老爷爷，我实在没办法完成您的遗愿。死过一次后，我还是觉得生命最重要，实在没有勇气往上冲了。毕竟还有人等着我……",
							{
								"type": "moveHero",
								"time": 125,
								"steps": [
									"down",
									"down",
									"left",
									"left",
									"left",
									"left"
								]
							},
							{
								"type": "changeFloor",
								"floorId": "GT0",
								"loc": [
									6,
									0
								],
								"time": 1000
							}
						]
					},
					{
						"case": "1",
						"action": [
							"\t[${status:name},hero]这些怪物……也是幽灵！难怪少爷……呸，那群混蛋看不见。",
							"\t[${status:name},hero]它们会消耗我的魂力！不能跟他们过多纠缠，我得赶紧离开这里。"
						]
					},
					{
						"case": "2",
						"action": [
							"\t[${status:name},hero]这些宝物到底是什么？为什么别人看不见……这瓶子里，是纯粹的精华，我感觉灵魂充实了。"
						]
					},
					{
						"case": "3",
						"action": [
							"\t[${status:name},hero]…熟悉的感觉…回来了……这元神归窍太伤元气了……得少用。",
							"\t[${status:name},hero]我现在可以\r[yellow]无视那些幽灵怪物\r[]去吸收精华和宝石，很快就恢复了。"
						]
					},
					{
						"case": "4",
						"action": [
							{
								"type": "if",
								"condition": "flag:gameproc==10",
								"true": [
									{
										"type": "addValue",
										"name": "flag:gameproc",
										"value": "1"
									},
									"\t[${status:name},hero]我这个样子……又能做什么？",
									"\t[${status:name},hero]……翠华……翠华。",
									{
										"type": "sleep",
										"time": 500
									},
									"\t[${status:name},hero]啊啊啊——我想死都做不到！什么叫“你的灵魂力量太弱”！我想去送死都不行吗？？",
									{
										"type": "sleep",
										"time": 500
									},
									"\t[？？？]你这个不知好歹的家伙，我这是保护你你还怪起我来了？",
									{
										"type": "changePos",
										"direction": "left"
									},
									{
										"type": "sleep",
										"time": 500
									},
									{
										"type": "changePos",
										"direction": "right"
									},
									{
										"type": "sleep",
										"time": 500
									},
									{
										"type": "changePos",
										"direction": "down"
									},
									"\t[${status:name},hero]是谁？？？",
									{
										"type": "sleep",
										"time": 500
									},
									"\t[？？？]别找了，我在你的意识里和你对话。",
									"\t[${status:name},hero]是……是老爷爷吗？",
									"\t[？？？,book]咳咳咳……老爷爷？听好了，我是神庙第一镇宗法宝的器灵：天书之灵！",
									"\t[${status:name},hero]怪物手册！？说话了？",
									"\t[天书之灵,book]怪物手册是什么鬼，那只是我赋予你的一点点特权，让你能够看透怪物的能力，保护你不去送死。",
									"\t[${status:name},hero]求你撤掉这个保护吧，我现在只想彻底死掉，不想这样半死不活的活着了。",
									"\t[天书之灵,book]…………",
									"\t[天书之灵,book]你的事我都看到了，这也是没办法的事，毕竟你现在还没彻底觉醒……",
									"\t[${status:name},hero]别说那么多了，让我去死吧。",
									"\t[天书之灵,book]你难道就不想报仇？",
									"\t[${status:name},hero]报仇又能如何呢？且不说现在我这个样子根本办不到，而且… 翠华也不可能回来了……",
									"\t[天书之灵,book]嗯……那我告诉你，其实你有能力让她复活呢？",
									"\t[${status:name},hero]什么？真的吗？！……可是我都亲眼看到她……魂飞魄散……",
									"\t[天书之灵,book]我且问你，正常人能看到别人魂飞魄散吗？",
									"\t[${status:name},hero]…………",
									"\t[天书之灵,book]没错，你当然不是常人，从你活着从魔塔走出来的时候，你就注定不一般了。",
									"\t[天书之灵,book]你掌握了\r[yellow]灵魂法则\r[]的初步力量，只要加以修行，日后定能有所成就，复活个凡人还不是易如反掌。",
									"\t[${status:name},hero]……等等，老爷爷说，我之所以不死，是因为那座塔的原因，我自己本身并没有这样的能力才对啊……我从小都没见过这些怪物。",
									"\t[天书之灵,book]告诉你吧，魔法之塔，其实最初是神庙用来训练\r[yellow]律者\r[]的场所。不同的人进入魔塔，会因为自身资质不同，看到不同的场景。我之前灵识封闭，所以完全不知道你说的老爷爷是什么东西。",
									"\t[天书之灵,book]不过魔塔这个训练场，由于后来的\r[yellow]几次事故\r[]，产生了魔域，导致天下大乱……哎对了我忘了问你，如今这时代，神庙怎么样了？",
									"\t[${status:name},hero]刚才我就想说了，你一直说的神庙到底是什么东西？",
									"\t[天书之灵,book]？？？",
									"\t[${status:name},hero]？？？",
									"\t[天书之灵,book]小朋友，你没听说过神庙？这可是世间最强大的组织！你太孤陋寡闻了吧。",
									"\t[${status:name},hero]……孤陋寡闻的是你吧，如今最强的是\r[yellow]泰伦帝国\r[]，拥有无数铁骑，已经统治大半个大陆了。",
									"\t[天书之灵,book]我特么…………算了，你是杨光对吧？从现在起，我赐予你神庙传人的身份。",
									"\t[${status:name},hero]别扯那些虚的，直接告诉我，如何获得起死回生的力量。",
									"\t[天书之灵,book]哪有那么简单，你得一步步来，首先你自己得先回魂才行吧。",
									"\t[${status:name},hero]对…！归魂石！你知道去哪找吗？",
									"\t[天书之灵,book]？？？归魂石是啥？我这里完全没有记载。",
									"\t[${status:name},hero]你这什么破书，啥都不知道？",
									"\t[天书之灵,book]魔塔里发生的事，可能跨越很多个次元的，神仙也不知道啊。",
									"\t[天书之灵,book]而且你只需要修炼出【元神归窍】就行了，并不是难事。",
									"\t[${status:name},hero]怎么修炼？",
									"\t[天书之灵,book]击杀更多的怪物，获取灵魂……哦不是经验……嗯我这里可以教导你一点点技巧，当你经验足够之后，就会突破到下一个境界，那时，大概你就能回魂了吧。",
									"\t[${status:name},hero]好吧……",
									"\t[${status:name},hero]（……卡皮塔，你给我等着……！）",
									{
										"type": "hide",
										"loc": [
											[
												11,
												6
											]
										],
										"floorId": "GT1",
										"time": 0
									},
									{
										"type": "hide",
										"loc": [
											[
												0,
												10
											]
										],
										"time": 0
									}
								]
							}
						]
					},
					{
						"case": "default",
						"action": []
					}
				]
			}
		],
		"平面楼传": [
			{
				"type": "function",
				"function": "function(){\nflags.__cur_floor = core.status.floorId;\nflags.checkStatistic = false;\n}"
			},
			{
				"type": "componentUI",
				"name": "flatten_back",
				"x": 0,
				"y": 0,
				"width": 416,
				"height": 416,
				"action": [
					{
						"type": "componentEmbd",
						"name": "animatechange",
						"param": "fade,false,close,open",
						"action": [
							{
								"type": "comment",
								"text": "开关时的动画特效，考虑用flag控制，减少在垃圾设备上的性能开销"
							}
						]
					},
					{
						"type": "componentEmbd",
						"name": "keyup",
						"param": "G,Esc,X,220",
						"action": [
							{
								"type": "clearUI",
								"name": "flatten_back"
							},
							{
								"type": "unlockControl"
							}
						]
					},
					{
						"type": "componentEmbd",
						"name": "keydelaydown",
						"param": "Enter,Left,Right,Down,Up,Spacebar,220",
						"action": [
							{
								"type": "if",
								"condition": "['Spacebar','Enter'].indexOf(flag:arg_key)>=0",
								"true": [
									{
										"type": "if",
										"condition": "flag:__visited__[flag:__cur_floor]",
										"true": [
											{
												"type": "clearUI",
												"name": "flatten_back"
											},
											{
												"type": "function",
												"function": "function(){\ncore.flyTo(core.getFlag('__cur_floor'), function () {\n\tcore.status.hero.eventlock = false;\n\tcore.unLockControl();\n})\n}"
											}
										],
										"false": [
											{
												"type": "tip",
												"text": "尚未到达此区域"
											}
										]
									}
								],
								"false": [
									{
										"type": "function",
										"function": "function(){\nvar key = core.getFlag('arg_key').toLowerCase();\ncore.flattenKeyDownDirction(key);\n}"
									}
								]
							}
						]
					},
					{
						"type": "clearMap",
						"x": 0,
						"y": 0,
						"width": 416,
						"height": 416
					},
					{
						"type": "fillRect",
						"x": 0,
						"y": 0,
						"width": 416,
						"height": 416,
						"style": [
							0,
							0,
							0,
							0.55
						]
					},
					{
						"type": "strokeRect",
						"x": 30,
						"y": 30,
						"width": 300,
						"height": 300,
						"style": [
							255,
							255,
							255,
							1
						]
					},
					{
						"type": "function",
						"function": "function(){\nvar pos = core.findCenter(flags.__cur_floor);\nflags.__cur_pos = pos;\nvar arr = {};\nvar floor_pos = {};\nfor (var i = 0; i < 9; i++) {\n\tvar x = -1 + ~~(i / 3);\n\tvar y = -1 + (i % 3);\n\tarr[x] = arr[x] || {};\n\tvar f = core.pos2FloorId(~~pos[0] + x, ~~pos[1] + y);\n\tif (f && core.floorIds.indexOf(f) >= 0) {\n\t\tarr[x][y] = f;\n\t\tfloor_pos[f] = [x, y];\n\t}\n}\nflags.__floor_pos = floor_pos;\ncore.setFlag('__arr_pos', arr);\n}"
					},
					{
						"type": "componentUI",
						"name": "flatten_map",
						"x": 30,
						"y": 30,
						"width": 300,
						"height": 300,
						"action": [
							{
								"type": "while",
								"condition": "core.action_forSquareRange([-1,1],[-1,1])",
								"data": [
									{
										"type": "componentUI",
										"name": "${flags.__tmp_x + ',' +flags.__tmp_y}",
										"x": "(flag:__tmp_x+1)*100",
										"y": "(flag:__tmp_y+1)*100",
										"width": 100,
										"height": 100,
										"action": [
											{
												"type": "componentEmbd",
												"name": "animatechange",
												"param": "slide,roll",
												"action": []
											},
											{
												"type": "componentEmbd",
												"name": "click",
												"param": "220",
												"action": [
													{
														"type": "function",
														"function": "function(){\nvar pos = flags.arg_name.split(',');\nflags.arg_name = flags.__arr_pos[~~pos[0]][~~pos[1]]\n}"
													},
													{
														"type": "if",
														"condition": "flags.checkStatistic",
														"true": [
															{
																"type": "function",
																"function": "function(){\ncore.addSelectedFloor(flags.arg_name)\n}"
															},
															{
																"type": "flushUI",
																"name": "flatten_back",
																"param": "[true,'']"
															}
														],
														"false": [
															{
																"type": "if",
																"condition": "flags.__visited__[flags.arg_name]",
																"true": [
																	{
																		"type": "clearUI",
																		"name": "flatten_back"
																	},
																	{
																		"type": "function",
																		"function": "function(){\ncore.flyTo(core.getFlag('arg_name', core.status.floorId), function () {\n\tcore.status.hero.eventlock = false;\n\tcore.unLockControl();\n})\n}"
																	}
																],
																"false": [
																	{
																		"type": "tip",
																		"text": "尚未到达此区域",
																		"icon": "fly"
																	}
																]
															}
														]
													}
												]
											},
											{
												"type": "clearMap",
												"x": 0,
												"y": 0,
												"width": 100,
												"height": 100
											},
											{
												"type": "if",
												"condition": "flags.__arr_pos[flags.__tmp_x][flags.__tmp_y]",
												"true": [
													{
														"type": "drawThumbnail",
														"floorId": "${flag:__arr_pos[flag:__tmp_x][flag:__tmp_y]}",
														"x": 0,
														"y": 0,
														"width": 100,
														"height": 100
													},
													{
														"type": "if",
														"condition": "flags.checkStatistic",
														"true": [
															{
																"type": "if",
																"condition": "flags.__arr_pos[flags.__tmp_x][flags.__tmp_y] in (flags.__selected__floor || {})",
																"true": [
																	{
																		"type": "strokeRect",
																		"x": 1,
																		"y": 1,
																		"width": 98,
																		"height": 98,
																		"style": [
																			0,
																			255,
																			0,
																			0.5
																		],
																		"lineWidth": 2
																	}
																],
																"false": [
																	{
																		"type": "if",
																		"condition": "!flag:__visited__[flag:__arr_pos[flag:__tmp_x][flag:__tmp_y]]",
																		"true": [
																			{
																				"type": "fillRect",
																				"x": 0,
																				"y": 0,
																				"width": 100,
																				"height": 100,
																				"style": [
																					119,
																					119,
																					119,
																					0.4
																				]
																			}
																		],
																		"false": [
																			{
																				"type": "if",
																				"condition": "core.status.maps[flags.__arr_pos[flags.__tmp_x][flags.__tmp_y]].blocks.filter(function(blk){return blk.event.cls.indexOf('enemy')>=0}).length==0",
																				"true": [
																					{
																						"type": "fillText",
																						"x": 80,
																						"y": 80,
																						"style": [
																							0,
																							255,
																							0,
																							1
																						],
																						"font": "bold 14px Verdana",
																						"text": "√"
																					}
																				],
																				"false": [
																					{
																						"type": "fillText",
																						"x": 80,
																						"y": 80,
																						"style": [
																							255,
																							0,
																							0,
																							1
																						],
																						"font": "bold 14px Verdana",
																						"text": "X"
																					}
																				]
																			}
																		]
																	}
																]
															}
														],
														"false": [
															{
																"type": "if",
																"condition": "!flag:__visited__[flag:__arr_pos[flag:__tmp_x][flag:__tmp_y]]",
																"true": [
																	{
																		"type": "fillRect",
																		"x": 0,
																		"y": 0,
																		"width": 100,
																		"height": 100,
																		"style": [
																			119,
																			119,
																			119,
																			0.4
																		]
																	}
																],
																"false": []
															}
														]
													},
													{
														"type": "if",
														"condition": "flag:__arr_pos[flag:__tmp_x][flag:__tmp_y]==flag:__cur_floor",
														"true": [],
														"false": []
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "selector",
						"x": "30+(flags.__floor_pos[flags.__cur_floor][0]+1)*100",
						"y": "30+(flags.__floor_pos[flags.__cur_floor][1]+1)*100",
						"width": 100,
						"height": 100,
						"action": [
							{
								"type": "componentEmbd",
								"name": "animatetrans",
								"action": []
							},
							{
								"type": "strokeRect",
								"x": 1,
								"y": 1,
								"width": 98,
								"height": 98,
								"style": [
									255,
									221,
									0,
									0.7
								],
								"lineWidth": 2
							}
						]
					},
					{
						"type": "if",
						"condition": "flags.checkStatistic",
						"true": [
							{
								"type": "while",
								"condition": "core.action_forList(['atk','def','mdef','hpmax','hp'])",
								"data": [
									{
										"type": "drawIcon",
										"id": "flag:__tmp_it",
										"x": "95 + flags.__tmp_idx*50",
										"y": 386,
										"width": 28,
										"height": 28
									},
									{
										"type": "fillBoldText",
										"x": "95 + flags.__tmp_idx*50",
										"y": 386,
										"style": [
											17,
											255,
											0,
											1
										],
										"font": "bold 16px Verdana",
										"text": "${flags.__tmp_statInfo.total.add[flags.__tmp_it]}"
									}
								]
							},
							{
								"type": "if",
								"condition": "false",
								"true": [
									{
										"type": "fillBoldText",
										"x": 250,
										"y": 386,
										"style": [
											255,
											0,
											0,
											1
										],
										"font": "bold 16px Verdana",
										"text": "血伤：${flags.__tmp_statInfo.total.monster.hpDamage}"
									},
									{
										"type": "fillBoldText",
										"x": 250,
										"y": 406,
										"style": [
											0,
											51,
											255,
											1
										],
										"font": "bold 16px Verdana",
										"text": "魂伤：${flags.__tmp_statInfo.total.monster.mpDamage}"
									}
								]
							}
						],
						"false": [
							{
								"type": "fillBoldText",
								"x": 165,
								"y": 400,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "bold 22px Verdana",
								"text": "${core.floors[flags.__cur_floor ].title}"
							}
						]
					},
					{
						"type": "componentUI",
						"name": "upbutton",
						"x": 350,
						"y": 50,
						"width": 50,
						"height": 80,
						"action": [
							{
								"type": "strokeCircle",
								"x": 28,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 18,
								"y": 35,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "▲"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "210",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.flattenKeyDownDirction('up');\n}"
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "downbutton",
						"x": 350,
						"y": 250,
						"width": 50,
						"height": 80,
						"action": [
							{
								"type": "strokeCircle",
								"x": 28,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 18,
								"y": 40,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "▼"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "211",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.flattenKeyDownDirction('down');\n}"
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "leftbutton",
						"x": 80,
						"y": 330,
						"width": 80,
						"height": 50,
						"action": [
							{
								"type": "strokeCircle",
								"x": 35,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 25,
								"y": 37,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "◀"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "211",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.flattenKeyDownDirction('left');\n}"
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "rightbutton",
						"x": 260,
						"y": 330,
						"width": 80,
						"height": 50,
						"action": [
							{
								"type": "strokeCircle",
								"x": 33,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 25,
								"y": 37,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "▶"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "211",
								"action": [
									{
										"type": "function",
										"function": "function(){\ncore.flattenKeyDownDirction('right');\n}"
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "closeflatten",
						"x": 386,
						"y": 386,
						"width": 30,
						"height": 30,
						"action": [
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "222",
								"action": [
									{
										"type": "clearUI",
										"name": "flatten_back"
									},
									{
										"type": "unlockControl"
									}
								]
							},
							{
								"type": "fillRect",
								"x": 0,
								"y": 0,
								"width": 30,
								"height": 30,
								"style": [
									170,
									170,
									170,
									1
								]
							},
							{
								"type": "fillText",
								"x": 4,
								"y": 20,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "bold 18px Verdana",
								"text": " X "
							}
						]
					},
					{
						"type": "componentUI",
						"name": "checkEnemy",
						"x": 0,
						"y": 386,
						"width": 80,
						"height": 30,
						"action": [
							{
								"type": "fillRect",
								"x": 0,
								"y": 0,
								"width": 80,
								"height": 30,
								"style": [
									170,
									170,
									170,
									1
								]
							},
							{
								"type": "if",
								"condition": "flags.checkStatistic",
								"true": [
									{
										"type": "fillBoldText",
										"x": 2,
										"y": 22,
										"style": [
											0,
											255,
											34,
											1
										],
										"font": "bold 17px Verdana",
										"text": "统计模式"
									}
								],
								"false": [
									{
										"type": "fillBoldText",
										"x": 2,
										"y": 22,
										"style": [
											255,
											255,
											255,
											1
										],
										"font": "bold 17px Verdana",
										"text": "统计模式"
									}
								]
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "233",
								"action": [
									{
										"type": "function",
										"function": "function(){\nflags.checkStatistic = flags.checkStatistic || false;\nflags.checkStatistic = !flags.checkStatistic;\ncore.updateStatisticInfo()\n}"
									},
									{
										"type": "flushUI",
										"name": "flatten_back",
										"param": "[true,'']"
									}
								]
							}
						]
					}
				]
			},
			{
				"type": "componentEnable",
				"name": "flatten_back"
			},
			{
				"type": "lockControl"
			}
		],
		"技能树": [
			{
				"type": "function",
				"function": "function(){\nflags.__tmp_type = 'soul';\nflags.skillTypes = ['soul', 'sword', 'magic'];\nflags.__tmp_direction = 'left';\ntreeMan.initUI();\n}"
			},
			{
				"type": "componentUI",
				"name": "skillbar",
				"x": 0,
				"y": 0,
				"width": 416,
				"height": 416,
				"action": [
					{
						"type": "componentEmbd",
						"name": "keyup",
						"param": "F,X,Esc,220",
						"action": [
							{
								"type": "clearUI",
								"name": "skillbar"
							},
							{
								"type": "unlockControl"
							}
						]
					},
					{
						"type": "componentEmbd",
						"name": "animatechange",
						"param": "fade,false,close,open",
						"action": []
					},
					{
						"type": "componentEmbd",
						"name": "keydelaydown",
						"param": "Enter,Left,Right,Down,Up,Spacebar,220",
						"action": [
							{
								"type": "if",
								"condition": "['Spacebar','Enter'].indexOf(flag:arg_key)>=0",
								"true": [
									{
										"type": "if",
										"condition": "treeMan.curObj",
										"true": [
											{
												"type": "if",
												"condition": "skillMan.canLevelUp(treeMan.curObj.name)",
												"true": [
													{
														"type": "function",
														"function": "function(){\nskillMan.levelUp(treeMan.curObj.name)\n}"
													},
													{
														"type": "function",
														"function": "function(){\nUImanager.sendMessageToComponent('skills', 'animatechange', { msg: 'pause', directly: true })\n}"
													},
													{
														"type": "flushUI",
														"name": "skillbar",
														"param": "[true]"
													}
												],
												"false": [
													{
														"type": "tip",
														"text": "技能未解锁"
													}
												]
											}
										]
									}
								],
								"false": [
									{
										"type": "if",
										"condition": "treeMan.findNext(flags.__tmp_type, flags.arg_key.toLowerCase());",
										"true": [
											{
												"type": "flushUI",
												"name": "skillbar",
												"param": "[false,'']"
											},
											{
												"type": "flushUI",
												"name": "skill_selector",
												"param": "[true,'']"
											}
										],
										"false": [
											{
												"type": "if",
												"condition": "treeMan.nextPage(flags.__tmp_type, flags.arg_key.toLowerCase());",
												"true": [
													{
														"type": "flushUI",
														"name": "skillbar",
														"param": "[true,'']"
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						"type": "setAttribute",
						"align": "center",
						"baseline": "middle"
					},
					{
						"type": "fillRect",
						"x": 0,
						"y": 0,
						"width": 416,
						"height": 416,
						"style": [
							0,
							0,
							0,
							0.73
						]
					},
					{
						"type": "componentUI",
						"name": "skills",
						"x": 0,
						"y": 0,
						"width": 416,
						"height": 300,
						"action": [
							{
								"type": "componentEmbd",
								"name": "animatechange",
								"param": "slide,active",
								"action": []
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "222",
								"action": [
									{
										"type": "if",
										"condition": "treeMan.onclick(flags.__tmp_type, flags.arg_px, flags.arg_py)",
										"true": [
											{
												"type": "if",
												"condition": "treeMan.curObj",
												"true": [
													{
														"type": "if",
														"condition": "skillMan.canLevelUp(treeMan.curObj.name)",
														"true": [
															{
																"type": "function",
																"function": "function(){\nskillMan.levelUp(treeMan.curObj.name)\n}"
															},
															{
																"type": "function",
																"function": "function(){\nUImanager.sendMessageToComponent('skills', 'animatechange', { msg: 'pause', directly: true })\n}"
															},
															{
																"type": "flushUI",
																"name": "skillbar",
																"param": "[true]"
															}
														],
														"false": [
															{
																"type": "tip",
																"text": "技能未解锁"
															}
														]
													}
												]
											}
										]
									},
									{
										"type": "flushUI",
										"name": "skillbar",
										"param": "[true,'skills']"
									}
								]
							},
							{
								"type": "while",
								"condition": "treeMan.forEachEdge(flags.__tmp_type)",
								"data": [
									{
										"type": "drawLine",
										"x1": "flags.__tmp__[0].pos.x",
										"y1": "flags.__tmp__[0].pos.y+16",
										"x2": "flags.__tmp__[1].pos.x",
										"y2": "flags.__tmp__[1].pos.y+16",
										"style": [
											255,
											255,
											255,
											1
										],
										"lineWidth": 1
									}
								]
							},
							{
								"type": "setAttribute",
								"align": "center",
								"baseline": "middle"
							},
							{
								"type": "while",
								"condition": "treeMan.forEachSkillObj(flags.__tmp_type)",
								"data": [
									{
										"type": "if",
										"condition": "skillMan.haveSkill(flags.__tmp__.name)",
										"true": [
											{
												"type": "drawIcon",
												"id": "flags.__tmp__.getItemId()",
												"x": "flags.__tmp__.pos.x",
												"y": "flags.__tmp__.pos.y",
												"width": 32,
												"height": 32
											},
											{
												"type": "strokeRect",
												"x": "flags.__tmp__.pos.x",
												"y": "flags.__tmp__.pos.y",
												"width": 32,
												"height": 32,
												"style": [
													255,
													255,
													255,
													1
												]
											},
											{
												"type": "fillText",
												"x": "flags.__tmp__.pos.x+16",
												"y": "flags.__tmp__.pos.y + 40",
												"style": [
													170,
													255,
													153,
													1
												],
												"font": "12px Verdana",
												"text": "${flags.__tmp__.getLevel()}/${flags.__tmp__.getMaxLevel()}"
											}
										],
										"false": [
											{
												"type": "drawIcon",
												"id": "flags.__tmp__.getItemId()",
												"x": "flags.__tmp__.pos.x",
												"y": "flags.__tmp__.pos.y",
												"width": 32,
												"height": 32
											},
											{
												"type": "strokeRect",
												"x": "flags.__tmp__.pos.x",
												"y": "flags.__tmp__.pos.y",
												"width": 32,
												"height": 32,
												"style": [
													255,
													255,
													255,
													1
												]
											},
											{
												"type": "if",
												"condition": "skillMan.haveUnLockSkill(flags.__tmp__.name)",
												"true": [
													{
														"type": "fillRect",
														"x": "flags.__tmp__.pos.x",
														"y": "flags.__tmp__.pos.y",
														"width": 32,
														"height": 32,
														"style": [
															119,
															119,
															119,
															0.36
														]
													}
												],
												"false": [
													{
														"type": "drawImage",
														"image": "lock.png",
														"x": "flags.__tmp__.pos.x",
														"y": "flags.__tmp__.pos.y"
													}
												]
											}
										]
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "skill_selector",
						"x": "treeMan.selector.x",
						"y": "treeMan.selector.y",
						"width": 32,
						"height": 32,
						"action": [
							{
								"type": "componentEmbd",
								"name": "animatetrans",
								"action": []
							},
							{
								"type": "strokeRect",
								"x": 0,
								"y": 0,
								"width": 32,
								"height": 32,
								"style": [
									255,
									221,
									0,
									1
								],
								"lineWidth": 2
							}
						]
					},
					{
						"type": "componentUI",
						"name": "skillDetail",
						"x": 100,
						"y": 100,
						"width": 208,
						"height": 208,
						"action": [
							{
								"type": "componentEmbd",
								"name": "animatechange",
								"param": "fade,false,close,open",
								"action": []
							},
							{
								"type": "componentEmbd",
								"name": "keyup",
								"param": "Esc,230",
								"action": [
									{
										"type": "clearUI",
										"name": "skillDetail"
									},
									{
										"type": "componentEnable",
										"name": "skillbar",
										"param": "skillDetail",
										"nodraw": true
									}
								]
							},
							{
								"type": "drawBackground",
								"background": "winskin.png",
								"x": 0,
								"y": 0,
								"width": 208,
								"height": 208
							}
						]
					},
					{
						"type": "componentUI",
						"name": "closeSkillBar",
						"x": 386,
						"y": 386,
						"width": 30,
						"height": 30,
						"action": [
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "222",
								"action": [
									{
										"type": "clearUI",
										"name": "skillbar"
									},
									{
										"type": "unlockControl"
									}
								]
							},
							{
								"type": "fillRect",
								"x": 0,
								"y": 0,
								"width": 30,
								"height": 30,
								"style": [
									170,
									170,
									170,
									0.4
								]
							},
							{
								"type": "fillText",
								"x": 4,
								"y": 20,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "bold 18px Verdana",
								"text": " X "
							}
						]
					},
					{
						"type": "componentUI",
						"name": "skill_leftbutton",
						"x": 0,
						"y": 320,
						"width": 80,
						"height": 50,
						"action": [
							{
								"type": "strokeCircle",
								"x": 35,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 25,
								"y": 37,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "◀"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "211",
								"action": [
									{
										"type": "if",
										"condition": "treeMan.nextPage(flags.__tmp_type, 'left')",
										"true": [
											{
												"type": "flushUI",
												"name": "skillbar",
												"param": "[true,'']"
											}
										]
									}
								]
							}
						]
					},
					{
						"type": "componentUI",
						"name": "skill_rightbutton",
						"x": 340,
						"y": 320,
						"width": 80,
						"height": 50,
						"action": [
							{
								"type": "strokeCircle",
								"x": 33,
								"y": 30,
								"r": 15,
								"style": [
									255,
									255,
									255,
									1
								],
								"lineWidth": 2
							},
							{
								"type": "fillText",
								"x": 25,
								"y": 37,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "20px Verdana",
								"text": "▶"
							},
							{
								"type": "componentEmbd",
								"name": "click",
								"param": "211",
								"action": [
									{
										"type": "if",
										"condition": "treeMan.nextPage(flags.__tmp_type, 'right')",
										"true": [
											{
												"type": "flushUI",
												"name": "skillbar",
												"param": "[true,'']"
											}
										]
									}
								]
							}
						]
					},
					{
						"type": "fillText",
						"x": 330,
						"y": 20,
						"style": [
							255,
							255,
							255,
							1
						],
						"font": "bold 15px Verdana",
						"text": "可用技能点：${flags.skillPoint || 0}"
					},
					{
						"type": "if",
						"condition": "treeMan.curObj",
						"true": [
							{
								"type": "if",
								"condition": "skillMan.haveUnLockSkill(treeMan.curObj.name)",
								"true": [
									{
										"type": "fillText",
										"x": 208,
										"y": 290,
										"style": [
											255,
											255,
											255,
											1
										],
										"font": "bold 15px Verdana",
										"text": "${treeMan.curObj.getName()}"
									},
									{
										"type": "drawTextContent",
										"text": "${skillMan.getDescription(treeMan.curObj.name)}",
										"left": 78,
										"top": 315,
										"maxWidth": 260,
										"fontSize": 12
									},
									{
										"type": "if",
										"condition": "skillMan.haveSkill(treeMan.curObj.name)",
										"true": [
											{
												"type": "fillText",
												"x": 208,
												"y": 352,
												"style": [
													238,
													255,
													136,
													1
												],
												"font": "bold 13px Verdana",
												"text": "下一级："
											},
											{
												"type": "drawTextContent",
												"text": "${skillMan.getDescription(treeMan.curObj.name,1)}",
												"left": 78,
												"top": 365,
												"maxWidth": 260,
												"fontSize": 12
											}
										],
										"false": [
											{
												"type": "drawTextContent",
												"text": "等待升级",
												"left": 78,
												"top": 355,
												"maxWidth": 260,
												"fontSize": 12
											}
										]
									}
								],
								"false": [
									{
										"type": "fillText",
										"x": 208,
										"y": 290,
										"style": [
											255,
											255,
											255,
											1
										],
										"font": "bold 15px Verdana",
										"text": "？？？"
									},
									{
										"type": "fillText",
										"x": 208,
										"y": 340,
										"style": [
											255,
											255,
											255,
											1
										],
										"font": "bold 14px Verdana",
										"text": "未解锁"
									}
								]
							}
						],
						"false": [
							{
								"type": "fillText",
								"x": 208,
								"y": 330,
								"style": [
									255,
									255,
									255,
									1
								],
								"font": "bold 20px Verdana",
								"text": "${skillMan.getTypeName(flags.__tmp_type)}"
							},
							{
								"type": "drawTextContent",
								"text": "    ${skillMan.getTypeDescribe(flags.__tmp_type)}",
								"left": 78,
								"top": 350,
								"maxWidth": 260,
								"fontSize": 12
							}
						]
					},
					{
						"type": "drawLine",
						"x1": 100,
						"y1": 306,
						"x2": 316,
						"y2": 306,
						"style": [
							255,
							255,
							255,
							1
						],
						"lineWidth": 1
					},
					{
						"type": "strokeRect",
						"x": "208-50",
						"y": 302,
						"width": 100,
						"height": 8,
						"style": [
							0,
							255,
							221,
							0.44
						]
					}
				]
			},
			{
				"type": "componentEnable",
				"name": "skillbar",
				"param": "skillDetail"
			},
			{
				"type": "lockControl"
			}
		]
	}
}