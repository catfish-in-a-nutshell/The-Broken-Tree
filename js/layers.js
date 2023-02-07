addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        freeUpgs: d(0)
    }},
    color: "#4b6584",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: pause or resume game", onPress() { player.paused = !player.paused }},
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    passiveGeneration: () => {
        let gain = d(0)

        if (hasUpgrade("d", 42)) {
            gain = d(0.5)
        }

        if (hasUpgrade("d", 43)) {
            gain = gain.mul(upgradeEffect("d", 43))
        }
        if (hasUpgrade("d", 45)) {
            gain = gain.mul(upgradeEffect("d", 45))
        }
        gain = gain.mul(tmp.g.bhEff)
        return gain
    },

    autoUpgrade: () => (hasUpgrade("d", 41) && !hasUpgrade("d", 15)) || hasMilestone("g", 8),

    upgrades: {
        11: {
            cost: d(1),
            title: "Game Start",
            effect: () => tmp.p.pointCount.add(3).log(3).mul(upgradeEffect("p", 31)),
            description: () => `generate point based on your points`,
            effectDisplay: () => `${format(upgradeEffect("p", 11))}/s`
        },

        21: {
            cost: d(3),
            title: "Starter",
            effect: () => tmp.p.ppCount.add(2).log(2).mul(upgradeEffect("p", 23)).mul(upgradeEffect("p", 31)),
            description: () => `points count more based on prestige points`,
            effectDisplay: () => `^${format(upgradeEffect("p", 21))}`,
            unlocked: () => hasUpgrade("p", 11)
        },

        22: {
            cost: d(15),
            title: "Startest",
            effect: () => tmp.p.ppCount.add(1.1).log(1.1).pow(2).mul(upgradeEffect("p", 23)).mul(upgradeEffect("p", 31)),
            description: () => `prestige points count more based on itself`,
            effectDisplay: () => `x${format(upgradeEffect("p", 22))}`,
            unlocked: () => hasUpgrade("p", 21)
        },

        23: {
            cost: d(45),
            title: "Startester",
            effect: () => hasUpgrade("p", 23) ? d(5).mul(upgradeEffect("p", 31)) : d(1),
            description: () => `count more effects are stronger`,
            effectDisplay: () => `+400%`,
            unlocked: () => hasUpgrade("p", 22)
        },

        31: {
            cost: d(128),
            title: "The Next Step",
            description: () => `unlock the next layer, and all "Start" upgrades are boosted based on upgrades bought in this layer`,
            unlocked: () => hasUpgrade("p", 23),

            effect: () => hasUpgrade("p", 31) ? d(tmp.p.upgsCount).add(1).sqrt() : d(1),
            effectDisplay: () => `x${format(upgradeEffect("p", 31))}`,

            style: {
                height: "200px",
                width: "200px",
                margin: "30px"
            },
        },

        41: {
            cost: d(0),
            title: "A Free Gift",
            description: () => `Crystal gain is better.<br><i>counts as 5 upgrades</i><br>`,
            unlocked: () => hasUpgrade("d", 15),
            effectDisplay: () => `^2`,
        },
        42: {
            cost: d("1.5e10"),
            title: "A NEW DIAMOND BUILDING",
            description: () => `All you need to know is right above this message.<br><i>counts as 40 upgrades</i><br>`,
            unlocked: () => hasUpgrade("d", 15),
        },
        43: {
            cost: d("9.98e13"),
            title: "A New Layer",
            description: () => `Unlock a new layer.<br><i>all free upgrades count 3x more</i><br>`,
            unlocked: () => hasUpgrade("d", 15),
        }
    },


    pointCount: () => {
        let cnt = player.points
        if (hasUpgrade("p", 21)) {
            cnt = cnt.pow(upgradeEffect("p", 21))
        }
        return cnt
    },

    ppCount: () => {
        let cnt = player.p.points
        if (hasUpgrade("p", 22)) {
            cnt = cnt.mul(upgradeEffect("p", 22))
        }
        return cnt
    },

    freeUpgsDiscounted: () => {
        return player.p.freeUpgs.pow(0.8)
    },

    upgsCount: () => {
        let cnt = d(player.p.upgrades.length)
        if (hasUpgrade("p", 41)) {
            cnt = cnt.add(4)
        }
        if (hasUpgrade("p", 42)) {
            cnt = cnt.add(39)
        }

        let freeUpg = tmp.p.freeUpgsDiscounted
        if (hasUpgrade("p", 43)) {
            freeUpg = freeUpg.mul(3)
        }
        cnt = cnt.add(freeUpg)

        if (hasUpgrade("d", 14)) {
            cnt = cnt.mul(tmp.d.effect)
        }
        return cnt
    },

    layerShown(){ return !player.broken },
    deactivated: () => player.broken
})


let diamond_style = (id) => {
    let bg = hasUpgrade("d", id) ? "green" : "transparent"
    return {
        "background": `radial-gradient(${bg}, cyan)`,
        "border-radius": "0px",
        "min-height": "32px",
        "min-width": "32px",
        "height": "32px",
        "width": "32px",
    }
}

addLayer("d", {
    name: "diamond",
    symbol: "💎",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: d(0),
            focused_upg: -1,
            crystals: d(0),
            d11amount: d(0),
            d12amount: d(0),
        }
    },
    color: "cyan",
    requires: d(444),
    resource: "diamonds",
    baseResource: "prestige points",
    baseAmount() { return player.p.points },
    type: "normal",
    exponent: 0.6,
    gainMult() {
        let mult = d(1)
        if (hasUpgrade("d", 11)) {
            mult = mult.mul(upgradeEffect("d", 11))
        }

        if (hasMilestone("g", 1)) {
            mult = mult.mul(tmp.g.gh2Effect)
        }
        return mult
    },
    gainExp() {
        let exp = d(1)
        return exp
    },
    row: 1,
    hotkeys: [
        {key: "d", description: "D: Reset for diamonds", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    layerShown: () => (hasUpgrade("p", 31) || player.d.best.gt(0) || player.g.best.gt(0)) && !player.broken,

    buyables: {
        11: {
            title: "Refineries",
            cost(x) {
                let cost = d(3).pow(x)
                return cost
            },
            effect(x) {
                if (!x.gt(0)) return d(0)
                let eff = d(4).pow(x).div(4)
                return eff
            },
            unlocked() { return true }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
            },

            effectDisplay() {
                return `Crystal/sec: ${format(tmp.d.crystalGain)}`
            },

            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost

                if (!hasMilestone("g", 6)) {
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                }
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
            },

            display() {
                return `Cost: ${format(tmp.d.buyables[11].cost)} Diamonds`
            },

            purchaseLimit: new Decimal(100)
        },

        12: {
            title: "Upgrade Factories",
            cost(x) {
                let cost = d(10).pow(x).mul(d(50000000))
                return cost
            },
            effect(x) {
                if (!x.gt(0)) return d(0)
                let eff = x.pow(3)
                return eff
            },
            unlocked() { return hasUpgrade("p", 42) }, 
            canAfford() {
                return player[this.layer].points.gte(tmp[this.layer].buyables[this.id].cost)
            },

            effectDisplay() {
                return `P Upgrades/sec: ${format(tmp.d.upgsGain)}`
            },

            buy() { 
                cost = tmp[this.layer].buyables[this.id].cost
                
                if (!hasMilestone("g", 6)) {
                    player[this.layer].points = player[this.layer].points.sub(cost)	
                }
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
            },

            display() {
                return `Cost: ${format(tmp.d.buyables[12].cost)} Diamonds`
            },

            purchaseLimit: new Decimal(100)
        }
    },

    effect: () => {
        return player.d.best.add(3).log(3).sqrt()
    },
    effectDescription: () => {
        if (hasUpgrade("d", 14)) {
            return `prestige upgrades count x${format(tmp.d.effect)} more`
        }
        return `which does not boost anything`
    },
    
    doReset(resettingLayer){
        if(layers[resettingLayer].row > this.row) layerDataReset(this.layer) 

        if (hasMilestone("g", 2)) {
            player.d.upgrades = [42, 44]
        }
        if (hasMilestone("g", 4)) {
            player.d.upgrades = [11,12,13,14,15,41,42,43,44,45]
        }
    },

    upgrades: {
        11: {
            cost: d(2),
            fullDisplay: () => "💎",
            unlocked: () => true,
            description: () => "Gain more diamonds based on upgrades bought in prestige layer.",
            effect: () => d(tmp.p.upgsCount).add(1),
            effectDesc() { return `x${format(upgradeEffect("d", this.id))}` },
            
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        12: {
            cost: d(20),
            fullDisplay: () => "✖",
            unlocked: () => true,
            description: () => "Start generating free Refineries.",
            effect: () => d(1),
            effectDesc() { return `${format(upgradeEffect("d", this.id))} Refineries / s` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        13: {
            cost: d(60),
            fullDisplay: () => "🔮",
            unlocked: () => true,
            description: () => "Crystal effect is much better based on Refineries bought.",
            effect: () => getBuyableAmount("d", 11).add(1).pow(3),
            effectDesc() { return `x${format(upgradeEffect("d", this.id))}` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        14: {
            cost: d(333),
            fullDisplay: () => "💠",
            unlocked: () => true,
            description: () => "Diamond now has an effect.",
            effect: () => getBuyableAmount("d", 11).add(1).pow(3),
            effectDesc() { return `prestige upgrades count x${format(tmp.d.effect)} more` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        15: {
            cost: d(222222),
            fullDisplay: () => "⚪",
            unlocked: () => true,
            description: () => `Unlock more prestige point upgrades${hasMilestone("g", 8) ? "" : ", but 🛒 is disabled"}.`,
            effectDesc() { return `unlock +1 row of upgrades` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },

        41: {
            cost: d(8),
            fullDisplay: () => "🛒",
            unlocked: () => true,
            description: () => `Autobuy prestige upgrades.`,
            effectDesc: () => hasUpgrade("d", 15) ? `DISABLED` : `All you need to know is right above this message.`,
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        42: {
            cost: d(30),
            fullDisplay: () => "🍎",
            unlocked: () => true,
            description: () => `Gain 50% prestige points from prestige every second.`,
            effectDesc: () => `All you need to know is right above this message.`,
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        43: {
            cost: d(2000),
            fullDisplay: () => "🍌",
            unlocked: () => true,
            effect: () => tmp.d.crystalEffect.cbrt(),
            description: () => `Crystals boost passive prestige point gain with a reduced rate.`,
            effectDesc() { return `x${format(upgradeEffect("d", this.id))}` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        44: {
            cost: d(16666),
            fullDisplay: () => "🍑",
            unlocked: () => true,
            description: () => `Gain 10% diamond from prestige every second.`,
            effectDesc: () => `All you need to know is right above this message.`,
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        },
        45: {
            cost: d(2222222),
            fullDisplay: () => "⌚",
            unlocked: () => true,
            effect: () => d(1.05).pow(getBuyableAmount("d", 11)),
            description: () => `Time ticks faster by 1.05x for every Refineries bought.`,
            effectDesc() { return `x${format(upgradeEffect("d", this.id))}` },
            onHover() { player.d.focused_upg = this.id },
            style() { return diamond_style(this.id) }
        }
    },

    passiveGeneration: () => {
        let gain = d(0)

        if (hasUpgrade("d", 44)) {
            gain = d(0.1)
        }

        if (hasUpgrade("d", 45)) {
            gain = gain.mul(upgradeEffect("d", 45))
        }
        gain = gain.mul(tmp.g.bhEff)
        return gain
    },

    crystalEffect: () => {
        let mult = player.d.crystals.add(4).log(4)
        if (hasUpgrade("d", 13)) {
            mult = mult.mul(upgradeEffect("d", 13))
        }
        return player.d.crystals.gt(0) ? mult : d(1)
    },

    crystalGain: () => {
        let d11 = getBuyableAmount("d", 11)
        if (!d11.gt(0)) return d(0)
        let gain = buyableEffect("d", 11)

        let amount = d11.add(player.d.d11amount)

        gain = gain.mul(amount)
        if (hasUpgrade("p", 41)) {
            gain = gain.pow(2)
        }

        gain = gain.pow(tmp.g.uncryEff)
        if (hasMilestone("g", 6)) {
            gain = gain.mul(tmp.g.gh4Effect)
        }
        return gain
    },

    refineryGain: () => {
        let gain = d(0)
        if (hasUpgrade("d", 12)) {
            gain = gain.add(upgradeEffect("d", 12))
        }
        return gain
    },

    upgsGain: () => {
        let d12 = getBuyableAmount("d", 12)
        if (!d12.gt(0)) return d(0)

        let gain = buyableEffect("d", 12)

        let amount = d12.add(player.d.d12amount)
        
        gain = gain.mul(amount)
        gain = gain.mul(tmp.g.graEff)
        if (hasMilestone("g", 6)) {
            gain = gain.mul(tmp.g.gh4Effect)
        }
        return gain
    },


    tabFormat: [
        "main-display",
        "prestige-button",
        "resource-display",
        ["syn-buyable", [11, "d11amount"]],
        ["syn-buyable", [12, "d12amount"]],
        ["blank", "5px"],
        ["display-text", () => {
            return `<span style='color: lightblue'>
                You have ${format(player.d.crystals)} Crystals, multiplying point by ${format(tmp.d.crystalEffect)}x.
            </span>`
        }],
        ["display-text", () => {
            if (!hasUpgrade("p", 42)) return undefined
            return `<span style='color: lightblue'>
                You have produced +${formatWhole(player.p.freeUpgs)} free prestige upgrades (discounted into +${formatWhole(tmp.p.freeUpgsDiscounted)}).
            </span>`
        }],
        ["blank", "20px"],

        ["row", [
            ["column", [
                ["display-text", `<p style="color:cyan; margin-bottom: 5px">Diamond Upgrades</p>`],
                ["upgrades", [1]]]
            ],
            ["blank", ["20px", "20px"]],
            ["column", [
                ["display-text", `<p style="color:crimson; margin-bottom: 5px">Automation Shop</p>`],
                ["upgrades", [4]]]
            ],
        ]],
        ["blank", "20px"],
        ["display-text", () => {
            let id = player.d.focused_upg
            if (id < 0) return ""
            return `
                <p style="color:gold">${tmp.d.upgrades[id].description} ${hasUpgrade("d", id) ? "BOUGHT!":""}</p>
                <p style="color:cyan; margin-top:3px"> Cost: ${formatWhole(tmp.d.upgrades[id].cost)} Diamonds </p>
                <p style="color:pink; margin-top:3px">Effect: ${tmp.d.upgrades[id].effectDesc}</p>
            `
        }]
    ],

    update(diff) {
        if (hasUpgrade("d", 45)) {
            diff = d(diff).mul(upgradeEffect("d", 45))
        }
        diff = d(diff).mul(tmp.g.bhEff)
        player.d.crystals = player.d.crystals.add(tmp.d.crystalGain.mul(diff))
        player.d.d11amount = player.d.d11amount.add(tmp.d.refineryGain.mul(diff))
        player.p.freeUpgs = player.p.freeUpgs.add(tmp.d.upgsGain.mul(diff))

    },

    automate() {
        if (hasMilestone("g", 6)) {
            buyBuyable("d", 11)
            buyBuyable("d", 12)
        }

        if (hasUpgrade("g", 13)) {
            player.d.d12amount = player.g.gras
        }
    },

    branches: ["p"],
    
    deactivated: () => player.broken
})

const MAX_GRAS = d(1e24)

addLayer("g", {
    name: "grasshop",
    symbol: "🌿",
    position: 0,
    startData() {
        return {
            unlocked: false,
            points: d(0),
            uncrys: d(0),
            rgci_started: false,
            cutting_prog: 0,

            gras: d(0),
            s: d(0),
            gra: d(0),
            grass: d(0),

            filling: false,
            filledGras: d(0),

            rm: d(0)
        }
    },

    color: "#c5c5c5",
    requires: d("4.4e22"),
    resource: "grasshop",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "static",
    base: d(6),
    exponent: d(1.5),
    
    gainMult() {
        let mult = d(1)
        return mult
    },
    gainExp() {
        let exp = d(1)
        return exp
    },
    row: 2,
    hotkeys: [
        {key: "g", description: "G: grasshop!", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    gh1Effect: () => {
        return d(5).mul(d(1.5).pow(player.g.points))
    },

    gh2Effect: () => {
        return d(5).mul(d(1.5).pow(player.g.points))
    },

    gh3Effect: () => {
        return d(1.25).pow(player.g.points)
    },

    gh4Effect: () => {
        return d(3).pow(player.g.points)
    },

    milestones: {
        0: {
            requirementDescription: "1 Grasshop",
            effectDescription: () => `Gain 5x points. Point gain is increased by 50% every grasshop.<br>Currently: x${format(tmp.g.gh1Effect)}`,
            done() { return player.g.points.gte(1) },      
        },
        1: {
            requirementDescription: "2 Grasshop",
            effectDescription: () => `Gain 5x diamonds. Diamond gain is increased by 50% every grasshop.<br>Currently: x${format(tmp.g.gh2Effect)}`,
            done() { return player.g.points.gte(2) }
        },
        2: {
            requirementDescription: "3 Grasshop",
            effectDescription: () => "Unlock Uncrystallize. Keep 🍎 and 🍑 on Grasshop.",
            done() { return player.g.points.gte(3) }
        },
        3: {
            requirementDescription: "4 Grasshop",
            effectDescription: "Unlock THE Real Grass Cutting Incremental (?).",
            done() { return player.g.points.gte(4) },
            unlocked: () => hasMilestone("g", 2)
        },
        4: {
            requirementDescription: "5 Grasshop",
            effectDescription: () => `Every Grasshop make Grass Cutting 1.25x faster. Keep all diamond upgrades on Grasshop.<br>Currently: x${format(tmp.g.gh3Effect)}`,
            done() { return player.g.points.gte(5) },
            unlocked: () => hasMilestone("g", 2)
        },
        5: {
            requirementDescription: "6 Grasshop",
            effectDescription: () => `Cut your Grasshop into .... <b style="color: #5151ec">Gras shop</b>.`,
            done() { return player.g.points.gte(6) },
            unlocked: () => hasMilestone("g", 4)
        },
        6: {
            requirementDescription: "7 Grasshop",
            effectDescription: () => `Autobuy Refineries and Upgrade factories and they cost nothing. They works x3 faster every Grasshop.<br>Currently: x${format(tmp.g.gh4Effect)}`,
            done() { return player.g.points.gte(7) },
            unlocked: () => hasMilestone("g", 4)
        },
        7: {
            requirementDescription: "9 Grasshop",
            effectDescription: () => `Automate Uncrystalization, it does not reset crystals anymore.`,
            done() { return player.g.points.gte(9) },
            unlocked: () => hasMilestone("g", 6)
        },
        8: {
            requirementDescription: "11 Grasshop",
            effectDescription: () => `Remove the negative effect of ⚪.`,
            done() { return player.g.points.gte(11) },
            unlocked: () => hasMilestone("g", 7)
        },
        9: {
            requirementDescription: "22 Grasshop",
            effectDescription: () => `Blackholes boost your Gras Point gain with a reduced rate.<br>Currently: x${format(tmp.g.bhGrasEff)}`,
            done() { return player.g.points.gte(22) },
            unlocked: () => hasUpgrade("g", 21)
        }
    },

    canUncryReset: () => hasMilestone("g", 2) && player.d.crystals.gt(0),
    doUncryReset() {
        let c = player.d.crystals
        player.g.uncrys = player.g.uncrys.add(c)
        if (!hasMilestone("g", 7)) {
            player.d.crystals = d(0)
        }
    },
    uncryHtml() {
        if (tmp.g.canUncryReset)
            return `Uncrystalize your crystals`
        else 
            return `Get some crystals first!`
    },
    uncryEff() {
        let u = player.g.uncrys
        let eff = u.add(10).log(10).add(1).log(2)
        return eff
    },
    uncryDisplay() {
        return `which boost crystals by ^${format(tmp.g.uncryEff)}`
    },

    canStartRGCI: () => !player.g.rgci_started,
    startRGCI() { player.g.rgci_started = true },
    rgciHtml: () => player.g.rgci_started ? `CUTTING GRASS...<br>${format(player.g.cutting_prog)} / ${format(tmp.g.cuttingProgMax)}s` : `START RGCI`,

    grassDisplay() {
        return `
            <span style='color: green'>${formatWhole(player.g.gra)} GRA</span>, making free upGRAdes x${format(tmp.g.graEff)}.<br>
            <span style='color: green'>${formatWhole(player.g.gras)} GRAS</span>, doing nothing.<br>
            <span style='color: green'>${formatWhole(player.g.s)} S</span>, boosting point x${format(tmp.g.sEff)}.<br>
        `
    },

    upgrades: {
        11: {
            description: "GRA also boost your Gras Point gain.",
            effect: () => tmp.g.graEff,
            effectDisplay() { return `x${format(upgradeEffect("g", this.id))}` },
            cost: d(20),
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasMilestone("g", 5)
        },
        12: {
            description: "You bulk 10 grass every cut.",
            cost: d(1000),
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasMilestone("g", 5)
        },
        13: {
            description: "Your GRAS works as Upgrade Factories.",
            cost: d(200000),
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasMilestone("g", 5)
        },
        21: {
            description: "Unlock the Really Machine, and the RM Bar.",
            cost: d(800000),
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasUpgrade("g", 13)
        },  
        22: {
            description: "S boost your Gras Point gain.",
            cost: d(8e10),
            effect: () => tmp.g.sEff,
            effectDisplay() { return `x${format(upgradeEffect("g", this.id))}` },
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasUpgrade("g", 13)
        },
        23: {
            description: () => tmp.g.filled ? "Unlock the Reality Layer." : "Fill the BAR to reveal.",
            cost: d(1e24),
            canAfford: () => tmp.g.filled,
            currencyDisplayName: "Gras Points",
            currencyInternalName: "gras",
            currencyLayer: "g",
            unlocked: () => hasUpgrade("g", 13)
        },  
    },

    clickables: {
        11: {
            display() {
                if (tmp.g.filled) return "Filled"
                return player.g.filling ? "Filling" : "Idle"
            },

            canClick: () => !tmp.g.filled,

            onClick() {
                player.g.filling = !player.g.filling
            },

            unlocked() { return true },
        }
    },

    bars: {
        rmBar: {
            direction: RIGHT,
            width: 600,
            height: 70,
            progress: () => tmp.g.fillProgress,
            baseStyle: {
                "background": "transparent"
            },
            fillStyle: {
                "background": "#5151ec"
            },
            borderStyle: {
                "border-radius": "0",
                "border": "0.2rem solid #5151ec",
                "box-sizing": "border-box"
            },
            textStyle: {
                "font-weight": "bold",
                "color": "#5151ec",
                "font-size": "1.2rem",
                "text-shadow": "0px 0px 10px black"
            },
            display() {
                return `${formatWhole(player.g.filledGras)} / ${formatWhole(MAX_GRAS)} Gras Point
                <br>Generating ${format(tmp.g.rmGain)} RM/sec`
            },
        }
    },

    fillProgress() {
        if (player.g.filledGras.lte(1)) return d(0)
        if (player.g.filledGras.gte(MAX_GRAS)) return d(1)
        return player.g.filledGras.log(10).div(d(MAX_GRAS).log(10))
    },

    filled() {
        return tmp.g.fillProgress.gte(1)
    },

    rmGain() {
        return tmp.g.fillProgress.mul(100).pow(10)
    },

    blackholes() {
        if (player.g.rm.lte(1e5)) return d(0)
        return player.g.rm.log(10).div(4).floor()
    },

    bhEff() {   
        if (tmp.g.blackholes.lte(0)) return d(1)
        return d(1.5).pow(tmp.g.blackholes.pow(2))
    },

    bhGrasEff() {
        return tmp.g.bhEff.sqrt()
    },

    sEff: () => {
        if (!player.g.s.gt(0)) return d(1)
        return player.g.s.add(1).pow(0.8)
    },

    graEff: () => {
        if (!player.g.gra.gt(0)) return d(1)
        return player.g.gra.add(1).pow(0.8)
    },

    cuttingProgMax: () => {
        let prog = d(5)
        if (hasMilestone("g", 4))
            prog = prog.div(tmp.g.gh3Effect)
        return prog.toNumber()
    },

    layerShown: () => (hasUpgrade("p", 43) || player.g.best.gte(1)) && !player.broken,
    branches: ["d"],

    tabFormat: [
        "grass-hop"
    ],

    componentStyles: {
        'prestige-button': {        
            "width": "100%",
            "height": "100%",
            "border": "none",
            "border-radius": "0",
        },
        'milestone': {
            "border-radius": "0",
        }
    },

    style: () => {
        let bg = hasMilestone("g", 5) ? "#000115" : "#0052af"
        return {"background-color": bg}
    },

    update(diff) {
        if (player.g.rgci_started) {
            let dif = d(diff).mul(tmp.g.bhEff)

            let grass_dif = dif.toNumber()
            let amount = d(1)

            if (dif.div(tmp.g.cuttingProgMax).gte(5)) {
                amount = amount.mul(dif.div(tmp.g.cuttingProgMax))
                grass_dif = tmp.g.cuttingProgMax
            }

            if (hasUpgrade("g", 12)) {
                amount = amount.mul(10)
            }

            player.g.cutting_prog = player.g.cutting_prog + grass_dif
            while (player.g.cutting_prog >= tmp.g.cuttingProgMax) {
                let rnd = Math.random()
                if (rnd > 0.75) {
                    player.g.grass = player.g.grass.add(amount)

                    let gras = amount
                    if (hasUpgrade("g", 11)) {
                        gras = gras.mul(upgradeEffect("g", 11))
                    }
                    if (hasUpgrade("g", 22)) {
                        gras = gras.mul(upgradeEffect("g", 22))
                    }
                    if (hasMilestone("g", 9)) {
                        gras = gras.mul(tmp.g.bhGrasEff)
                    }

                    player.g.gras = player.g.gras.add(gras)
                    player.g.s = player.g.s.add(amount)
                } else {
                    player.g.grass = player.g.grass.add(amount)
                    player.g.gra = player.g.gra.add(amount)
                    player.g.s = player.g.s.add(amount.mul(2))
                }
                player.g.cutting_prog -= tmp.g.cuttingProgMax
            }
        }
        player.g.rm = player.g.rm.add(tmp.g.rmGain.mul(diff))
        if (player.g.filling) {
            let amount = player.g.gras.mul(d(1).sub(d(0.98).pow(diff)))
            player.g.filledGras = player.g.filledGras.add(amount)
            player.g.gras = player.g.gras.mul(d(0.98).pow(diff))
        }
    },

    automate() {
        if (hasMilestone("g", 7)) {
            layers.g.doUncryReset()
        }
        if (tmp.g.filled && player.g.filling) {
            player.g.filling = false
        }
    },
    deactivated: () => player.broken
})

function constructRThings() {
    let tabformat = []
    let infoboxes = {}
    let milestones = {}
    for (let i = 0; i < 50; i++) {
        tabformat.push(["infobox", "i"+i])
        infoboxes["i"+i] = {
            title: "LEAVE.",
            body() {
                return "CLOSE THIS WEBPAGE NOW.<br>CLOSE THIS WEBPAGE NOW.<br>CLOSE THIS WEBPAGE NOW."
            },
            unlocked: () => (player.r.keepGoing > 2 || (player.r.keepGoing == 2 && tmp.r.keepGoingText2.next)),
            bodyStyle: {
                "padding": "10px",
                "color": "crimson",
                "text-shadow": "2px 2px 2px crimson, -3px -1px 3px crimson, 2px -7px 10px crimson",
                "box-shadow": "crimson 3px 4px 6px, crimson 3px 4px 6px"
            },
            style: {
                "border-color": "crimson",
                "border-radius": 0,
            },
            titleStyle: {
                "background-color": "crimson",
                "border-radius": 0
            }
        }
    }
    
    for (let i = 0; i < 50; i++) {
        milestones[i] = {
            requirementDescription: "PLEASE LEAVE.",
            effectDescription: "please close this webpage.",
            done() {
                return tmp.r.keepGoingText3.next && (player.r.keepGoingTimer - 10) * 5 > this.id
            }
        }
    }
    tabformat.push("the-reality")

    return {
        "tabformat": tabformat,
        "infoboxes": infoboxes,
        "milestones": milestones
    }
}

let RThings = constructRThings()
let realityTabformat = RThings["tabformat"]
let realityInfoboxes = RThings["infoboxes"]
let realityMilestones = RThings["milestones"]

addLayer("r", {
    name: "reality",
    symbol: "R",
    position: 0,
    color: "#0ba00e",
    startData() {
        return {
            unlocked: false,
            points: d(0),
            inreality: false,
            truths: 0,
            keepGoing: 0,
            keepGoingTimer: 0,
            brokenPlayed: false
        }
    },
    requires: d(23),
    resource: "reality",
    baseResource: "grasshop",
    baseAmount() { return player.g.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => hasUpgrade("g", 23) && !player.broken,
    tabFormat: realityTabformat,
    row: 3,

    enterReality() {
        player.r.inreality = true
    },

    nextTruth() {
        if (player.r.truths < 4) {
            player.r.truths += 1 
        }
    },

    keepGoing() {
        player.r.keepGoingTimer = 0
        player.r.keepGoing = player.r.keepGoing + 1
    },

    truthButtonText() {
        if (player.r.truths == 0) return `Tell me the truth.`
        if (player.r.truths == 1 || player.r.truths == 2) return `Tell me more truth.`
        
        if (player.r.truths == 3) return `REACH THE ENDGAME.`
    },

    keepGoingTextChoice(texts, id) {
        if (!texts) return undefined
        let l = texts.length
        let lines = 0
        if (player.r.keepGoing > id) lines = l
        if (player.r.keepGoing == id) {
            lines = Math.ceil(player.r.keepGoingTimer / 2)
            lines = Math.min(lines, l)
        }
        res = ""
        for (let i = 0; i < lines; i++) {
            res += texts[i] + "<br>"
        }
        return {"text": res, "next": player.r.keepGoing == id && lines == l, "prog": lines}
    },

    keepGoingText1() {
        let texts = [
            "... what.",
            "KEEP GOING for what?",
            "Look, this stupid game is over. Nothing to expect.",
            "I just run out of ideas for this game.",
            "Leave this webpage, now."
        ]
        return layers.r.keepGoingTextChoice(texts, 1)
    },

    keepGoingText2() {
        let texts = [
            "I have told you to leave.",
            "NOW. AND. NEVER. COME. BACK.",
            "Why don't you listen?",
            "Just leave this webpage.",
            ""
        ]
        return layers.r.keepGoingTextChoice(texts, 2)
    },
    
    keepGoingText3() {
        let texts = [
            "You just can't give up don't you.",
            "Do I need to beg you?",
            "My game is just bad. You shouldn't play this.",
            "Please... please leave this webpage.",
            ""
        ]
        return layers.r.keepGoingTextChoice(texts, 3)
    },

    keepGoingText4() {
        let texts = [
            "Okay.",
            "If you don't want to give up,",
            "If you want to stay in this game,",
            "Then....",
            "I WILL FORCE YOU TO QUIT.",
            ""
        ]
        return layers.r.keepGoingTextChoice(texts, 4)
    },

    infoboxes: realityInfoboxes,
    milestones: realityMilestones,
    branches: ["g"],

    update(diff) {
        player.r.keepGoingTimer += diff
        console.log(tmp.r.keepGoingText2.prog)
        if (tmp.r.keepGoingText2.prog == 4) {
            document.getElementsByClassName('right').item(0).scrollTop = 0
        }

        if (tmp.r.keepGoingText4.next && !player.r.brokenPlayed) {
            player.r.brokenPlayed = true
            brokeAnimation()
        }
    },

    deactivated: () => player.broken
})
