let modInfo = {
	name: "The Mix Tree",
	id: "catfish_brokentree",
	author: "catfish",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js", "broken.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Literally nothing",
}

let changelog = `
	<h1>References:</h1><br>
	<div><a class="link" href="https://store.steampowered.com/app/1399720/Antimatter_Dimensions/">Antimatter Dimensions</a> by Hevipelle</div><br>
	<div><a class="link" href="https://mrredshark77.github.io/Really-Grass-Cutting-Incremental/">RGCI</a> by MrRedshark77<div><br>
	<div><a class="link" href="https://pseudo-corp.github.io/SynergismOfficial/">Synergism</a> by Pseudonian and other developers</div>
	<br><br>

	<h1>Changelog:</h1><br><br>

	<h3>Real v1.0</h3><br>
	- Added the 4th layer.<br>
	- Endgame at breaking the tree.<br><br>

	<h3>v1.0</h3><br>
		- Added 3 layers.<br>
		- Endgame at unlocking 4th layer, ~1e103 point.`

let winText = `Congratulations! You have reached the end and beaten this game.<br>Please close this webpage now.`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "onHover", "doUncryReset", "startRGCI", "enterReality", "nextTruth", "keepGoing"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)
	let gain = d(0)
	if (!player.broken) {
		if (!hasUpgrade("p", 11)) return d(0)

		gain = upgradeEffect("p", 11)
		gain = gain.mul(tmp.d.crystalEffect)
		
		if (hasUpgrade("d", 45)) {
			gain = gain.mul(upgradeEffect("d", 45))
		}

		if (hasMilestone("g", 0)) {
			gain = gain.mul(tmp.g.gh1Effect)
		}

		gain = gain.mul(tmp.g.sEff)
		gain = gain.mul(tmp.g.bhEff)
		return gain
	}
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	paused: false,
	broken: false
}}

// Display extra things at the top of the page
var displayThings = [
	function() {
		if (player.paused) {
			return "Game paused (press w to resume)"
		}
	},
	function() {
		if (player.broken)
			return `You have reached the current Endgame!
			 Please wait for a future update`
		return `Current endgame: break the tree`
	}
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}