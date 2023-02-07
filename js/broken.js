
function shake_anim(ele_class, scale) {
    let trans = [[1,1], [-1,-2], [-3,0], [3,2], [1,-1], [-1,2], [-3,1], [3,1], [-1,-1], [1, 2], [1, -2]]
    let rots = [0, -0.1, 0.1, 0, 0.1, -0.1, 0, -0.1, 0.1, 0, -0.1]
    
    let anims = []
    for (let it = 0; it < 20; it++) {
        let s = scale * it / 20
        for (let i in trans) {
            anims.push({transform: `translate(${trans[i][0]*s}px, ${trans[i][1]*s/3}px) rotate(${rots[i]}deg)`})
        }
    }
    document.querySelector(ele_class).animate(anims, {
        duration: 10000,
        iterations: 1,
    })
}

function fade_anim(ele_class) {
    let anims = {
        opacity: [0, 0.3, 1, 0.3, 0],
        offset:  [0, 0.3, 0.75, 0.92, 1],
        easing: ["ease-in-out"]
    }

    document.querySelector(ele_class).animate(anims, {
        duration: 10000,
        iterations: 1,
    })
}

function brokeAnimation() {
    setTimeout(() => {
        player.tab = "none"
        player.broken = true
        setTimeout(() => { player.points = d(1) }, 100)
        
    }, 7500)
    fade_anim(".global-filter")
    shake_anim("body", 30)
}

addNode("pl1", {
    row: 0,
    position: 2,
    layerShown: () => !player.broken ? false : "ghost",
})
addNode("pl2", {
    row: 3,
    position: 2,
    layerShown: () => !player.broken ? false : "ghost",
})


addLayer("nl", {
    name: "placeholder",
    symbol: "P",
    position: 1,
    color: "#4b6584",
    startData() {
        return {
            unlocked: true,
            points: d(0),
        }
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    requires: d(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => player.broken,
    row: 0,

    nodeStyle: {
        "clip-path": "polygon(200% -100%, 74% 36%, 53% 50%, 69% 73%, 33% 94%, -100% 200%, -100% -100%)"
    },

    tabFormat: []
})

addLayer("nr", {
    name: "placeholder",
    symbol: "P",
    position: 4,
    color: "#4b6584",
    startData() {
        return {
            unlocked: true,
            points: d(0),
        }
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    requires: d(10),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => player.broken,
    row: 0,

    nodeStyle: {
        "clip-path": "polygon(200% -100%, 74% 36%, 53% 50%, 69% 73%, 33% 94%, -100% 200%, 200% 200%)"
    },

    tabFormat: []
})


addLayer("d1", {
    name: "placeholder",
    symbol: "💎",
    position: 1,
    color: "cyan",
    startData() {
        return {
            unlocked: true,
            points: d(0),
        }
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    requires: d(1000),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => player.broken,
    row: 2,
    displayRow: 3,

    nodeStyle: {
        "clip-path": "polygon(16% -100%, 42% 36%, 40% 57%, 53% 78%, 33% 94%, -100% 200%, -100% -100%)"
    },

    tabFormat: []
})

addLayer("d2", {
    name: "placeholder",
    symbol: "💎",
    position: 1,
    color: "cyan",
    startData() {
        return {
            unlocked: true,
            points: d(0),
        }
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    requires: d(1000),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => player.broken,
    row: 2,
    displayRow: 2,

    nodeStyle: {
        "clip-path": "polygon(16% -100%, 42% 36%, 40% 57%, 200% 43%, 200% -100%)"
    },

    tabFormat: []
})

addLayer("d3", {
    name: "placeholder",
    symbol: "💎",
    position: 3,
    color: "cyan",
    startData() {
        return {
            unlocked: true,
            points: d(0),
        }
    },
    gainMult() {
        mult = new Decimal(1)
        return mult
    },
    gainExp() {
        return new Decimal(1)
    },
    requires: d(1000),
    resource: "prestige points",
    baseResource: "points",
    baseAmount() { return player.points },
    type: "normal",
    exponent: 0.5,
    layerShown: () => player.broken,
    row: 2,
    displayRow: 3,

    nodeStyle: {
        "clip-path": "polygon(200% 200%, 200% 43%, 40% 57%, 53% 78%, 33% 94%, -100% 200%)"
    },

    tabFormat: []
})