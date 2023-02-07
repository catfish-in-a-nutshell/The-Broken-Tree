
function loadCustomComponents() {
    Vue.component('syn-buyable', {
        props: ['layer', 'data'],
        template: `
            <div v-if="tmp[layer].buyables && tmp[layer].buyables[data[0]]!== undefined && tmp[layer].buyables[data[0]].unlocked" class="syn-row">
                <div class="syn-name"> {{tmp[layer].buyables[data[0]].title}}: </div>

                <div class="syn-amount">{{formatWhole(player[layer].buyables[data[0]])}} [+{{format(player[layer][data[1]])}}]</div>

                <button v-bind:class="{ synbutton: true, canbuy: tmp[layer].buyables[data[0]].canBuy, bought: player[layer].buyables[data[0]].gte(tmp[layer].buyables[data[0]].purchaseLimit) }" 
                v-on:click="if (!interval) buyBuyable(layer, data[0])" :id='"buyable-" + layer + "-" + data[0]' @mousedown="start" @mouseleave="stop" @mouseup="stop" @touchstart="start" @touchend="stop" @touchcancel="stop">

                    <span v-html="run(layers[layer].buyables[data[0]].display, layers[layer].buyables[data[0]])"></span>
                </button>

                <div class="syn-effect">
                    {{run(tmp[layer].buyables[data[0]].effectDisplay, layers[layer].buyables[data[0]])}}
                </div>
            </div>
        `,
		data() { return { interval: false, time: 0,}},
		methods: {
			start() {
				if (!this.interval) {
					this.interval = setInterval((function() {
						if(this.time >= 5)
							buyBuyable(this.layer, this.data[0])
						this.time = this.time+1
					}).bind(this), 50)}
			},
			stop() {
				clearInterval(this.interval)
				this.interval = false
			  	this.time = 0
			}
		},
    })
    
	Vue.component('my-prestige-button', {
		props: ['layer', 'data'],
		template: `
		<button v-if="(tmp[layer].type !== 'none')" v-bind:class="{ [layer]: true, reset: true, grassfont: true, locked: !tmp[layer].canReset, could: tmp[layer].canReset}"
			v-html="prestigeButtonText(layer)" v-on:click="doReset(layer)">
		</button>
		`
	})
    
	Vue.component('uncry-button', {
		props: ['layer', 'data'],
		template: `
		<button v-if="(tmp[layer].type !== 'none')" v-bind:class="{ [layer]: true, reset: true, grassfont: true, locked: !tmp[layer].canUncryReset, could: tmp[layer].canUncryReset}"
			v-html="tmp[layer].uncryHtml" v-on:click="layers[layer].doUncryReset()">
		</button>
		`
	})

	Vue.component('rgci-button', {
		props: ['layer', 'data'],
		template: `
		<button v-if="(tmp[layer].type !== 'none')" v-bind:class="{ [layer]: true, reset: true, grassfont: true, locked: !tmp[layer].canStartRGCI, could: tmp[layer].canStartRGCI}"
			v-html="tmp[layer].rgciHtml" v-on:click="layers[layer].startRGCI()">
		</button>
		`
	})

	Vue.component('gh-milestones', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].milestones" class="gh-milestones">
        <table>
            <tr v-for="id in (data === undefined ? Object.keys(tmp[layer].milestones) : data)" v-if="tmp[layer].milestones[id]!== undefined && tmp[layer].milestones[id].unlocked && milestoneShown(layer, id)">
                <milestone :layer = "layer" :data = "id" v-bind:style="tmp[layer].componentStyles.milestone"></milestone>
            </tr>
        </table>
		</div>
		`
	})

    Vue.component('gs-upgrade', {
		props: ['layer', 'data'],
		template: `
		<button v-if="tmp[layer].upgrades && tmp[layer].upgrades[data]!== undefined && tmp[layer].upgrades[data].unlocked" :id='"upgrade-" + layer + "-" + data' v-on:click="buyUpg(layer, data)" v-on:mouseenter="if (layers[layer].upgrades[data].onHover) layers[layer].upgrades[data].onHover()" v-bind:class="{ [layer]: true, gsupg: true, gsbought: hasUpgrade(layer, data), gslocked: (!(canAffordUpgrade(layer, data))&&!hasUpgrade(layer, data)), gscan: (canAffordUpgrade(layer, data)&&!hasUpgrade(layer, data))}"
			v-bind:style="tmp[layer].upgrades[data].style">
        
            <div v-html="tmp[layer].upgrades[data].description"></div>
            <div v-if="layers[layer].upgrades[data].effectDisplay"><br>Currently: <span v-html="run(layers[layer].upgrades[data].effectDisplay, layers[layer].upgrades[data])"></span></div>
            <div v-if="!hasUpgrade(layer, data)">Cost: {{ formatWhole(tmp[layer].upgrades[data].cost) }} {{(tmp[layer].upgrades[data].currencyDisplayName ? tmp[layer].upgrades[data].currencyDisplayName : tmp[layer].resource)}}</div>
        
			</button>
		`
    })
    
	Vue.component('gs-upgrades', {
		props: ['layer', 'data'],
		template: `
		<div v-if="tmp[layer].upgrades" class="upgTable">
			<div v-for="row in (data === undefined ? tmp[layer].upgrades.rows : data)" class="upgRow">
				<div v-for="col in tmp[layer].upgrades.cols"><div v-if="tmp[layer].upgrades[row*10+col]!== undefined && tmp[layer].upgrades[row*10+col].unlocked" class="upgAlign">
					<gs-upgrade :layer = "layer" :data = "row*10+col" v-bind:style="tmp[layer].componentStyles.upgrade"></gs-upgrade>
				</div></div>
			</div>
			<br>
		</div>
		`
	})

    
	// data = id of clickable
	Vue.component('fill-clickable', {
		props: ['layer', 'data'],
		template: `
		<button 
			v-if="tmp[layer].clickables && tmp[layer].clickables[data]!== undefined && tmp[layer].clickables[data].unlocked" 
			v-bind:class="{gscan: tmp[layer].clickables[data].canClick, gsfill:true, colored: tmp.g.filled || player.g.filling, locked: !tmp[layer].clickables[data].canClick}"
			v-on:click="if(!interval) clickClickable(layer, data)" :id='"clickable-" + layer + "-" + data'>
			<span v-bind:style="{'white-space': 'pre-line'}" v-html="run(layers[layer].clickables[data].display, layers[layer].clickables[data])"></span>

		</button>
		`,
		data() { return { interval: false, time: 0,}},
		methods: {
			start() {
				if (!this.interval && layers[this.layer].clickables[this.data].onHold) {
					this.interval = setInterval((function() {
						let c = layers[this.layer].clickables[this.data]
						if(this.time >= 5 && run(c.canClick, c)) {
							run(c.onHold, c)
						}	
						this.time = this.time+1
					}).bind(this), 50)}
			},
			stop() {
				clearInterval(this.interval)
				this.interval = false
			  	this.time = 0
			}
		},
	})

    Vue.component('grass-hop', {
        props: ['layer', 'data'],
        template: `
            <div class="grass-container">
                <div class="grass-hop-row">
                    <div class="left-box">
                        <div class="grass-box-inner">
                            <my-prestige-button v-bind:style="tmp[layer].componentStyles['prestige-button']" :layer="layer"></my-prestige-button>
                        </div>
                    </div>
                    <div class="right-box">
                        <div class="grass-box-inner">
                            <div class="right-container">
                                <span class="grassfont">You have grasshopped <b>{{formatWhole(player.g.points)}}</b> times</span>
                                <gh-milestones :layer="layer"></gh-milestones>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="uncrystalize-row" v-if="hasMilestone('g', 2)">
                    <div class="left-box">
                        <div class="grass-box-inner">
                            <uncry-button v-bind:style="tmp[layer].componentStyles['prestige-button']" :layer="layer"></uncry-button>
                        </div>
                    </div>

                    <div class="right-box">
                        <div class="grass-box-inner">
                            <div class="right-container">
                                <div class="grassfont">You have uncrystalized <b>{{formatWhole(player.g.uncrys)}}</b> Crystals
                                </div>
                                <div style="font-size:14px" class="grassfont">{{tmp.g.uncryDisplay}}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rgci-row" v-if="hasMilestone('g', 3)">
                    <div class="left-box">
                        <div class="grass-box-inner">
                            <rgci-button v-bind:style="tmp[layer].componentStyles['prestige-button']" :layer="layer"></rgci-button>
                        </div>
                    </div>

                    <div class="right-box">
                        <div class="grass-box-inner">
                            <div class="right-container">
                                <div class="grassfont">You have cut <span style='color: green'> <b>{{formatWhole(player.g.grass)}}</b> GRASS</span>, into:
                                </div>
                                <div style="font-size: 15px;margin-top: 10px;text-align: left;padding-left: 25%;" class="grassfont " v-html="tmp.g.grassDisplay">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="rmbar-row" v-if="hasUpgrade('g', 21)">
                    <fill-clickable :layer="layer" :data="11"></fill-clickable>
                    <bar :layer="layer" :data="'rmBar'"></bar>
                </div>
                <div class="gras-res" v-if="hasUpgrade('g', 21)">Fill 5% your Gras Point into this bar per second, to generate more Really Machine.<br>You have {{formatWhole(player.g.rm)}} Really Machine, unlocking {{formatWhole(tmp.g.blackholes)}} blackholes, boosting prev RM time by x{{format(tmp.g.bhEff)}}</div>

                <div class="gras-shop-row" v-if="hasMilestone('g', 5)">
                    <div class="gras-res" style="
                    margin-bottom: 2px">You have {{format(player.g.gras)}} GRAS. For some reason, in Gras Shop we call them Gras Point.</div>

                    <div>
                        <gs-upgrades :layer="layer"></gs-upgrades>
                    </div>
                </div>

            </div>
        `
    })

    Vue.component('the-reality', {
		props: ['layer', 'data'],
		template: `
        <div>
            <div v-if="!player.r.inreality" v-on:click="layers.r.enterReality()" class="enter-reality">
                ENTER<br>THE<br>REALITY
                <div class="reality-icon"><div>Ω</div></div>
            </div>
            <div v-if="player.r.inreality" class="reality-quotes">
                <div class="truth">
                    Welcome to the Reality Layer.<br>
                    I will tell you the TRUTH.

                </div>

                <div v-if="player.r.truths >= 1" class="truth">
                    The TRUTH is: <br>
                    This is a trash game, and you have wasted {{formatTime(player.timePlayed)}} on it.<br>
                    This is the <b style="color:crimson">REALITY</b> you wanted.<br>
                    You should just stop playing this.

                </div>
                <div v-if="player.r.truths >= 2" class="truth">
                    All things in this so-called-game are stolen from other games. Nothing original.<br>
                    All those upgrades and mechanics are meaningless, stupid and make no sense at all.<br>
                    There is no actual gameplay in this so-called-game.<br>
                    You should just stop playing this.<br>
                    This is the best choice.

                </div>
                <div v-if="player.r.truths >= 3" class="truth">
                    Seriously, why don't you just close the webpage?<br>
                    You have better things to do. IN YOUR REAL LIFE.<br>
                    Is it because you haven't seen the endgame page?<br>
                    Alright then, if you want an endgame, let me give it to you.
                </div>
                <div v-if="player.r.truths < 4" class="truth-button" v-on:click="layers.r.nextTruth()">
                    {{tmp.r.truthButtonText}}
                </div>
                <div v-if="player.r.truths >= 4">
                    <h2>The Mix Tree v1.0</h2><br><br>
                    <h3 v-html="modInfo.winText"></h3><br>
                    <br>
                    <div v-if="!player.timePlayedReset">It took you {{formatTime(player.timePlayed)}} to beat the game.</div>
                    <br>
                    <button class="longUpg can" onclick="layers.r.keepGoing()" v-if="player.r.keepGoing == 0">Keep Going</button>
                </div>

                <div v-if="player.r.keepGoing >= 1">
                    <div class="truth" v-html="tmp.r.keepGoingText1.text"></div>          
                    <button class="longUpg can" onclick="layers.r.keepGoing()" v-if="tmp.r.keepGoingText1.next">Keep Going</button>
                    
                    <div class="truth" v-html="tmp.r.keepGoingText2.text"></div>          
                    <button class="longUpg can" onclick="layers.r.keepGoing()" v-if="tmp.r.keepGoingText2.next">Keep Going</button>        
                    
                    <div class="truth" v-html="tmp.r.keepGoingText3.text"></div>          
                    <button class="longUpg can" onclick="layers.r.keepGoing()" v-if="tmp.r.keepGoingText3.next">Keep Going</button>
                    
                    <div class="truth" v-html="tmp.r.keepGoingText4.text"></div>  
                </div>
                      
            </div>
        </div>
		`
    })
}