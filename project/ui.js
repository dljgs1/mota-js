var ui_238e5645_c9c6_4124_b8a8_b65b4c4ab390 = {
    "book": function() {
        const width = 416;
        const height = 416;
        const lineHeight = 62;
        const num = 6;

        return {
            name: "book",
            template: /* HTML */`
            <zone :style="bg" ref="bg">
                <text
                    v-if='enemys.length === 0'
                    :fit='{zone:[0,0,width,height],ratio:[0, 2]}'
                >暂无怪物</text>
                <zone v-else
                    v-for="(enemy, index) in enemys"
                    :key="enemy.name"
                    :x="10"
                    :y="3 + (lineHeight+3)*index"
                    :data='{
                        index,
                    }'
                    :style="{
                        width: width - 20,
                        height: lineHeight,
                        fillAlpha: 0.4,
                        radius: 0.2,
                        lineColor: 0xffff00,
                        lineWidth: select === index ? 2 : 0,
                    }"
                    @pointerdown.stop='clickIndex'
                    ref='zone'
                >
                    <sprite :x="lineHeight/2" :y="lineHeight/2" :width=32 :height=32 anchor="0.5">./logo.png</sprite>
                    <text
                        :fit="{zone:[lineHeight, 0, 70, 30], ratio:[0.4,0.8]}"
                        style="fill: white"
                    >{{ enemy.name }}</text>
                    <container :x="lineHeight+nameWidth">
                        <text :style="status">生命 {{ enemy.hp }}</text>
                        <text :x=90 :style="status">攻击 {{ enemy.atk }}</text>
                        <text :x=180 :style="status">防御 {{ enemy.def }}</text>
                        <text :x=0 :y=20 :style="status">金币 {{ enemy.money }}</text>
                        <text :x=90 :y=20 :style="status">伤害 {{ enemy.damage }}</text>
                        <text :x=0 :y=40 :style="status">临界 {{ enemy.critical }}</text>
                        <text :x=90 :y=40 :style="status">减伤 {{ enemy.criticalDamage }}</text>
                        <text :x=180 :y=40 :style="status">1防 {{ enemy.defDamage }}</text>
                    </container>
                </zone>
                <container
                :y="height-25"
                >
                    <text
                        class='bottomText good'
                        :x='width/2-130'
                        :style="{
                            fill: 'black',
                            fontSize: '22px',
                        }"
                        @pointerdown='beforePage'
                    >上一页</text>
                    <text :x="width/2-40">
                        {{realPage + 1}} / {{maxPage}}
                    </text>
                    <text
                        :value="100"
                        :x='width/2+40'
                        :style="{
                            fill: 'black',
                            fontSize: '22px',
                        }"
                        @pointerdown='nextPage'
                    >下一页</text>
                </container>
                <text :width=90 :height=30 :x="width-100" :y="height-30"
                @pointerdown="closePanel"
                >返回游戏</text>
            </zone>
            `,
            props: ["floorId"],
            class: {
                bottomText: {
                    style: {
                        fill: 'black',
                        fontSize: '22px',
                    }
                }
            },
            data() {
                return {
                    status: {
                        fontSize: '17px',
                        fill: '#ffffff',
                        fontFamily: 'sans-serif',
                    },
                    bg: {
                        radius: 0,
                        fillColor: 0x0,
                        fillAlpha:0.5,
                        width: width,
                        height: height,
                    },
                    width,
                    height,
                    num,
                    page: 0,
                    lineHeight,
                    select: 0,
                    nameWidth: 80,
                    allEnemys: [],
                };
            },
            created() {
                const floorId = this.floorId || core.status.floorId;
                this.allEnemys = core.enemys.getCurrentEnemys(floorId);
            },
            computed: {
                enemys() {
                    return this.allEnemys.slice(
                        this.num * this.realPage,
                        this.num * (this.realPage + 1)
                    );
                },
                realPage() {
                    const page = this.page % this.maxPage;
                    if (page >= 0) return page;
                    return page + this.maxPage;
                },
                maxPage() {
                    return Math.ceil(this.allEnemys.length / this.num);
                }
            },
            methods: {
                nextPage() {
                    this.page += 1;
                },
                beforePage() {
                    this.page -= 1;
                },
                closePanel() {
                    console.log("you click closePanel2");
                },
                clickIndex(event) {
                    if (event.target === null) return;
                    this.select = event.target.index;
                },
                console() {}
            }
        }
    }
}