var specials_90f36752_8815_4be8_b32b_d7fad1d0542e = 
[
	{
		"name": "空属性",
		"text": "这个地方不要写属性",
		"getEnemyInfo": null
	},
	{
		"name": "先攻",
		"text": "怪物首先攻击"
	},
	{
		"name": "魔攻",
		"text": "怪物无视勇士的防御"
	},
	{
		"name": "坚固",
		"text": "勇士每回合最多只能对怪物造成1点伤害"
	},
	{
		"name": "2连击",
		"text": "怪物每回合攻击2次"
	},
	{
		"name": "3连击",
		"text": "怪物每回合攻击3次"
	},
	{
		"name": "n连击",
		"text": "怪物每回合攻击n次"
	},
	{
		"name": "破甲",
		"text": "战斗前，怪物附加角色防御的90%作为伤害"
	},
	{
		"name": "反击",
		"text": "战斗时，怪物每回合附加角色攻击的10%作为伤害，无视角色防御"
	},
	{
		"name": "净化",
		"text": "战斗前，怪物附加勇士魔防的3倍作为伤害"
	},
	{
		"name": "模仿",
		"text": "怪物的攻防和勇士攻防相等"
	},
	{
		"name": "吸血"
	},
	{
		"name": "中毒",
		"text": "战斗后，勇士陷入中毒状态，每一步损失生命10点"
	},
	{
		"name": "衰弱",
		"text": "战斗后，勇士陷入衰弱状态，攻防暂时下降20点"
	},
	{
		"name": "诅咒",
		"text": "战斗后，勇士陷入诅咒状态，战斗无法获得金币和经验"
	},
	{
		"name": "领域"
	},
	{
		"name": "夹击",
		"text": "经过两只相同的怪物中间，勇士生命值变成一半"
	},
	{
		"name": "仇恨",
		"text": "战斗前，怪物附加之前积累的仇恨值作为伤害；战斗后，释放一半的仇恨值。（每杀死一个怪物获得2点仇恨值）"
	},
	{
		"name": "阻击"
	},
	{
		"name": "自爆",
		"text": "战斗后勇士的生命值变成1"
	},
	{
		"name": "无敌",
		"text": "勇士无法打败怪物，除非拥有十字架"
	},
	{
		"name": "退化"
	},
	{
		"name": "固伤"
	},
	{
		"name": "重生",
		"text": "怪物被击败后，角色转换楼层则怪物将再次出现"
	},
	{
		"name": "激光"
	},
	{
		"name": "光环"
	},
	{
		"name": "支援",
		"text": "当周围一圈的怪物受到攻击时将上前支援，并组成小队战斗。"
	},
	{
		"name": "捕捉",
		"text": "当走到怪物周围十字时会强制进行战斗。"
	},
	{
		"name": "五步毒",
		"text": "战斗后走完五步死亡，生命归零。"
	},
	{
		"name": "材宝之魂",
		"isHalo": false,
		"updateCheckBlock": "function (checkBlock, block, map, floorId) {\n\tvar width = core.floors[floorId].width,\n\t\theight = core.floors[floorId].height;\n\t// 领域范围，默认为1\n\tvar range = this.value1 || 1;\n\t// 是否是九宫格领域\n\tvar zoneSquare = !!this.value2;\n\tvar hasItem = false;\n\tvar x = block.x,\n\t\ty = block.y;\n\tvar zone = checkBlock.zone || {};\n\tfor (var dx = -range; dx <= range; dx++) {\n\t\tfor (var dy = -range; dy <= range; dy++) {\n\t\t\tif (dx == 0 && dy == 0) continue;\n\t\t\tvar nx = x + dx,\n\t\t\t\tny = y + dy,\n\t\t\t\tcurrloc = nx + \",\" + ny;\n\t\t\tif (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;\n\t\t\tif (!zoneSquare && Math.abs(dx) + Math.abs(dy) > range) continue;\n\t\t\tif (map[ny][nx] && core.maps.blocksInfo[map[ny][nx]] && core.maps.blocksInfo[map[ny][nx]].cls == 'items') {\n\t\t\t\tzone[currloc] = zone[currloc] || {};\n\t\t\t\tzone[currloc].soul = { x: block.x, y: block.y };\n\t\t\t\thasItem = true;\n\t\t\t}\n\t\t}\n\t}\n\tcheckBlock.zone = zone;\n\tif (!hasItem) {\n\t\tcore.clearGhost(x, y); // 消除魂\n\t\tcore.insertAction([{\n\t\t\t\"type\": \"hide\",\n\t\t\t\"loc\": [\n\t\t\t\t[x, y]\n\t\t\t],\n\t\t\t\"time\": 500\n\t\t}]);\n\t}\n}",
		"afterBattle": "function (enemy, x, y) {\n\tvar floorId = core.status.floorId;\n\tvar width = core.floors[floorId].width,\n\t\theight = core.floors[floorId].height;\n\t// 领域范围，默认为1\n\tvar range = this.value1 || 1;\n\t// 是否是九宫格领域\n\tvar zoneSquare = !!this.value2;\n\tfor (var dx = -range; dx <= range; dx++) {\n\t\tfor (var dy = -range; dy <= range; dy++) {\n\t\t\tif (dx == 0 && dy == 0) continue;\n\t\t\tvar nx = x + dx,\n\t\t\t\tny = y + dy,\n\t\t\t\tcurrloc = nx + \",\" + ny;\n\t\t\tif (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;\n\t\t\tif (!zoneSquare && Math.abs(dx) + Math.abs(dy) > range) continue;\n\t\t\tif (core.getBlockCls(nx, ny) == 'items') {\n\t\t\t\tcore.removeBlock(nx, ny);\n\t\t\t}\n\t\t}\n\t}\n}"
	},
	{
		"name": "材宝领域",
		"isHalo": false,
		"updateCheckBlock": "function (checkBlock, block, map, floorId) {\n\tvar range = this.value1 || 1;\n\t// 是否是九宫格领域\n\tvar zoneSquare = !!this.value2;\n\tvar hasItem = false;\n\tvar zone = checkBlock.zone || {};\n\n\t// 在范围内进行搜索，增加领域伤害值\n\tfor (var dx = -range; dx <= range; dx++) {\n\t\tfor (var dy = -range; dy <= range; dy++) {\n\t\t\tif (dx == 0 && dy == 0) continue;\n\t\t\tvar nx = x + dx,\n\t\t\t\tny = y + dy,\n\t\t\t\tcurrloc = nx + \",\" + ny;\n\t\t\tif (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;\n\t\t\t// 如果是十字领域，则还需要满足 |dx|+|dy|<=range\n\t\t\tif (!zoneSquare && Math.abs(dx) + Math.abs(dy) > range) continue;\n\t\t\tif (map[ny][nx] && core.maps.blocksInfo[map[ny][nx]] && core.maps.blocksInfo[map[ny][nx]].cls == 'items') {\n\t\t\t\tzone[currloc] = zone[currloc] || {};\n\t\t\t\tzone[currloc]['nopick'] = true;\n\t\t\t}\n\t\t}\n\t}\n\tcheckBlock.zone = zone;\n}"
	},
	{
		"name": "魂核",
		"text": "击败此怪物后，立即消灭当前地图所有同族怪物并获取经验。其他同族怪物消灭后此怪物消失。",
		"updateCheckBlock": "function (checkBlock, block) {\n\tvar type = BattleManager.getEnemy(block.event.id).race;\n\tvar check = checkBlock['soulcore_' + type] || [];\n\tcheckBlock['soulcore_' + type] = check;\n\tcheck.push(this);\n}",
		"isHalo": true
	},
	{
		"name": "吸魂",
		"isHalo": true,
		"updateCheckBlock": "function (checkBlock, block, map) {\n\t// 魂伤显伤\n\tvar souldmg = checkBlock.souldmg || {};\n\tvar idx = block.x + ',' + block.y;\n\tsouldmg[idx] = souldmg[idx] || 0;\n\tsouldmg[idx] += this.value;\n\tcheckBlock.souldmg = souldmg;\n\t// 实际触发\n\tvar soulcheck = checkBlock.soulcheck || {};\n\tsoulcheck[idx] = soulcheck[idx] || []; // 触发可能有多个\n\tsoulcheck[idx].push(this);\n\tcheckBlock.soulcheck = soulcheck;\n}",
		"text": "穿过该怪物时失去${this.value}灵魂值。",
		"checkBlock": "function (x, y) {\n\tActorManager.changeStatus('mana', -this.value)\n}"
	},
	{
		"name": "硬化皮肤",
		"text": "额外增加相当于勇者${this.value*100}%攻击力的防御力。",
		"getEnemyInfo": "function (info, m_info) {\n\tm_info.def = ~~(info.hero.atk * this.value); //必须取整 不然被视为倍率\n}"
	},
	{
		"name": "狼嚎",
		"text": "增加附近友军${this.value*100}%的攻击力，不叠加。",
		"getEnemyInfo": "function (_, m_info) {\n\tm_info.atk = 0.2;\n}",
		"isHalo": true,
		"updateCheckBlock": "function (checkBlock) {\n\tcheckBlock.wolf = this;\n}"
	},
	{
		"name": "缓慢热身",
		"text": "前${this.value}回合，勇者攻击力下降10%。",
		"getDamageInfo": "function (info) {\n\tif (info.turn <= 10) return info;\n\tvar mon_hp = info.mon_hp,\n\t\tmon_atk = info.mon_atk,\n\t\tmon_def = enemyInfo.def,\n\t\tmon_special = enemyInfo.special;\n\tmon_hp -= info.hero_per_damage * 10;\n\tinfo.hero_per_damage = this.getHeroStatus(info.hero, info.enemy).atk - info.enemy.def;\n\n}",
		"getEnemyInfo": null,
		"getHeroStatus": "function (hero) {\n\thero.atk = ~~(hero.atk * 0.9);\n\treturn hero;\n}",
		"afterBattle": null
	},
	{
		"name": "寒冰之足",
		"text": "",
		"getDamageInfo": null,
		"getEnemyInfo": null,
		"getHeroStatus": null,
		"afterBattle": null
	},
	{
		"name": "新属性",
		"text": "",
		"getDamageInfo": null,
		"getEnemyInfo": null,
		"getHeroStatus": null,
		"afterBattle": null
	},
	{
		"name": "新属性",
		"text": "",
		"getDamageInfo": null,
		"getEnemyInfo": null,
		"getHeroStatus": null,
		"afterBattle": null
	},
	{
		"name": "新属性",
		"text": "",
		"getDamageInfo": null,
		"getEnemyInfo": null,
		"getHeroStatus": null,
		"afterBattle": null
	},
	{
		"name": "新属性",
		"text": "",
		"getDamageInfo": null,
		"getEnemyInfo": null,
		"getHeroStatus": null,
		"afterBattle": null
	}
]