//THIS IS THE CLIENT CODE
var connected = "no";
var connectedopacity = 1.0;
var mainMenuOpacity = 0;
var gameStart = 0; //gamestart variable outside so that can access in play button onclick in code above
var drawAreaX = 0; //these two variable placed outside so that can access in mousemove event listener
var drawAreaY = 0;
var px = 0;
var py = 0;
var oldcamerax = 0;
var oldcameray = 0;
var canLogIn = 0; //used for account log in and sign ups
var accusername = 0;
var accpassword = 0;
var accdesc = 0;
var acctype = "error";
var loggedInAccount = {};
var clientAngle = 0;
var mobile = "no";
var mobileSentMousePress = "no";
var crDarknessSize = 0;//darkness growth and shrink in crossroads
var darknessGrowth = "yes";//determine if growing or shrinking
var barrelsDarkness = [];//list of barrels in decreasing angle for crossroads darkness
var correspondingBarrelHeight = {};//height of barrel for crossroads darkness

var gateTimer = 0.5;//animation for gates
var startGate = gateTimer;
var endGate = 9;
var gatearrow = [90,70,40,20];

//animate player chats
var chatlist = {};
var typingAnimation = 20;

//animate shape health bar length
var shapeHealthBar = {};

//keep track of number of upgrade buttons for ignore button to position correctly
var maxnumberofbuttons = 0;
var maxnumberofbuttonsb = 0;

var barrelnumberid = 1;//for tank editor display id. the actual ids for barrels are different
var assetnumberid = 1;
var gadgetnumberid = 1;

//buttons for skill points
var skillpointsbutton = [
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
  {hover: "no", clickable: "no",},
];

var skillpointsanimation = [0,0,0,0,0,0,0,0];//animate width slowly towards actual position

var levelwhenignorew = -1;//level when u clicked the ignore button
var levelwhenignoreb = -1;//level when u clicked the ignore button

//store player body color for upgrade buttons and tree to have same color
var playerBodyCol = "";
var playerBodyOutline = "";

//ensure that animation run at same speed for different fps
var prevLoopTime = 0;
var deltaTime = 1;

function createNotif(text,color,timer){
  const notifications = document.getElementById("notifFlex");
  const notifone = document.createElement("div");
  notifone.className = "alert";
  notifone.innerText = text;
  notifone.style.backgroundColor = color;
  notifications.prepend(notifone);//prepend is appendchild but insert at top
  setTimeout(() => {
    notifone.remove();
  }, timer);
}

if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  // true for mobile device
  createNotif("Your device is detected as a mobile device","darkorange",5000)
  mobile = "yes";
} else {
  // false for not mobile device
  console.log("not a mobile user");
}

//stores latest date of changelog update
var dateUpdate = "Loading changelog...";
var gameversion = "Loading...";
var recentUpdate = "";

fetch('/changelog.txt')//get the changelog txt file
.then(function(response) {
  response.text().then(function(text) {
    let newChangelog = text;
    document.getElementById("changelogwords").innerHTML = newChangelog;
    //get date of latest update, which can be found between hr and br tags
    let dateIndex = newChangelog.indexOf("<hr>") + 4; //4 refers to number of characters inside "<hr>"
    let dateIndex2 = newChangelog.indexOf("<span");
    dateUpdate = "CHANGELOG - " + newChangelog.slice(dateIndex, dateIndex2); //text between <hr> and <span
    let dateIndex3 = newChangelog.indexOf("-"); //find the first occurence of dash in changelog. dash is between the alpha and update date
    gameversion = newChangelog.slice(dateIndex, dateIndex3);
    let dateIndex4 = newChangelog.indexOf("<br>") + 4;
    let dateIndex5 = newChangelog.indexOf("</span");
    recentUpdate = newChangelog.slice(dateIndex4, dateIndex5);

    //let myString = recentUpdate.substring(0,recentUpdate.split('<br>', 7).join('<br>').length);//get first 7 lines of recent changelog, minus 8 to remove unneccesary <br><br>
    let myString = recentUpdate.substring(0, recentUpdate.length - 8);//remove <br>
    myString = dateUpdate + "<p>" + myString + "...</p>View the full update by clicking the green button";
    document.getElementById("changelogDisplay").innerHTML = myString;//show changelog on homepage at top left corner
    
    document.getElementById("subtitle").style.display = "block";
    document.getElementById("subtitle").innerHTML = gameversion;
  });
});

//when use settings to change shape color theme
function changetheme(selectObject) {
  colortheme = selectObject.value;
}

var canvasPercentageWidth = 100;
var canvasPercentageHeight = 100;
document.addEventListener("contextmenu", (event) =>
  event.preventDefault()
);//contextmenu is right click popup

function canvasResizing() {
  //resize game canvas, note that home page canvas doesn not resize
  if ((window.innerWidth / 1920) * 1080 < window.innerHeight) {
    //height more than width
    canvas.style.height = "100%";
    canvas.style.top = "0%";
    canvasPercentageHeight = 100;
    let calculationwidth =
      (((window.innerHeight / 1080) * 1920) / window.innerWidth) * 100;
    canvas.style.width = calculationwidth + "%";
    canvas.style.left = -(calculationwidth - 100) / 2 + "%";
    canvasPercentageWidth = calculationwidth;
  } else {
    //width more than height
    canvas.style.width = "100%";
    canvas.style.left = "0%";
    canvasPercentageWidth = 100;
    let calculationheight = (((window.innerWidth / 1920) * 1080) / window.innerHeight) * 100;
    canvas.style.height = calculationheight + "%";
    canvas.style.top = -(calculationheight - 100) / 2 + "%";
    canvasPercentageHeight = calculationheight;
  }
}

var gamemodes = ["Free For All", "2 Teams", "4 Teams", "Tank Editor"]; //all the gamemodes available
var gamemodecolors = ["#f04f54", "#BE7FF5", "#00E06C", "#38B764"]; //must be in same order as gamemode list
var gamemodecolorsdark = ["#D23136", "#A061D7", "#00C24E", "#1A9946"]; //darker colors for the gamemodes (the bottom part of the gamemode display)
var gamemodeBgFoV = [1,1,1,1];//FoV for main menu background, 1 refer to default
var currentGmSelector = {
  //everything is hcanvas.width*property value
  textX: 0.5,
  textY: 0.44,
  gamemode: 0, //index in array gamemodes
  prevgamemode: 0, //for animating purposes
  arrowColor: "white",
  //arrowColor: "darkgrey",//use darkgrey if only have one gamemode
  fontSize1: 60,
  fontSize2: 60,
  fontSize3: 40,
  fontSize4: 40,
  defaultfontSize: 60,
  animatedfontSize: 70,
  defaultfontSize2: 40,
  animatedfontSize2: 50,
  hover1: "no",
  hover2: "no",
  hover3: "no",
  hover4: "no",
  arrow1x: 0.415,
  arrow1y: 0.44,
  arrow2x: 0.585,
  arrow2y: 0.44,
  arrow3x: 0.455,
  arrow3y: 0.505,
  arrow4x: 0.545,
  arrow4y: 0.505,
  transition: 0,
  animateDir: "right", //direction of transition
  colorLerp: 1,
};

var currentGamemodeRegion = 0;

var teleportingTransition = "no";//transition for teleporting
var teleportingLocation = "error";
var oldteleportingLocation = "error";
var teleportingcount = 0;//moves the black background and the transparency animation
var reconnectToDefault = "no";//when die, reconnect to spawning server, e.g. ffa

//for the tank editor
var shownEditButton = "no";
var openedUI = "no";
var safeZone = 2000;
var safeZoneColor = "rgba(133, 194, 212, .5)";

//keep track of the previous mouse position, and only send the new mouse position when there is a difference of 5px (or else mousemove event listener will trigger every 1px of movement)
var oldmousex = 0;
var oldmousey = 0;
var prevSendMouse = 0;

//client runtime
var duration = "-";

//keep track of old player tank and body type to spawn particle when upgrading
var oldtank = "";
var oldbody = "";

//keep track of portal sizes when player touch it
var portalwidths = {};
//keep track of radiant shape colors
var radiantShapes = {};
var crossroadRadians = 0;
if(localStorage.settings == undefined) {
	localStorage.settings = JSON.stringify({"spawnduneparticle":"yes","spawncrossroadsparticle":"yes","spawnradparticle":"yes","showStaticMobName":"no","showMinionMobName":"no","showshapeinfo":"no","radiantSizeRange":5,"theme":"default",showstats:"no",});
}
var spawnduneparticle = "yes";//dune particles on by default
var spawncrossroadsparticle = "yes";//crossroads particles on by default
var spawnradparticle = "yes";//rad particles on by default
var showStaticMobName = "no";//don't show rock's names by default
var showMinionMobName = "no";//dont show dune's minion names, eg. pursuers
var showshapeinfo = "no";//dont show shape id and rad tier
var showstats = "no";

var settings = JSON.parse(localStorage.settings);
spawnduneparticle = settings.spawnduneparticle;
spawncrossroadsparticle = settings.spawncrossroadsparticle;
spawnradparticle = settings.spawnradparticle;
showStaticMobName = settings.showStaticMobName;
showMinionMobName = settings.showMinionMobName;
showstats = settings.showstats;
showshapeinfo = settings.showshapeinfo;
document.querySelector('#radiantSizeRange').value = settings.radiantSizeRange;
document.querySelector('#theme').value = settings.theme;

function updateSettings() {
settings.spawnduneparticle = spawnduneparticle;
settings.spawncrossroadsparticle = spawncrossroadsparticle;
settings.spawnradparticle = spawnradparticle;
settings.showStaticMobName = showStaticMobName;
settings.showMinionMobName = showMinionMobName;
settings.showstats = showstats;
settings.showshapeinfo = showshapeinfo;
settings.radiantSizeRange = document.querySelector('#radiantSizeRange').value;
settings.theme = document.querySelector('#theme').value;

function getCheckBox(settingid) {
if(settings[settingid] == "yes") {
document.querySelector('input[settingid="'+settingid+'"]').setAttribute('checked','true');
} else {
document.querySelector('input[settingid="'+settingid+'"]').removeAttribute('checked');
}
}
  
getCheckBox("spawnduneparticle");
getCheckBox("spawncrossroadsparticle");
getCheckBox("spawnradparticle");
getCheckBox("showStaticMobName");
getCheckBox("showMinionMobName");
getCheckBox("showstats");
getCheckBox("showshapeinfo");
  
  
localStorage.settings = JSON.stringify(settings);
}
updateSettings()
function toggleParticle(){
  if (spawnduneparticle=="yes"){
    spawnduneparticle = "no";
  }
  else{
    spawnduneparticle = "yes";
  }
  updateSettings()
}
function toggleCrParticle(){
  if (spawncrossroadsparticle=="yes"){
    spawncrossroadsparticle = "no";
  }
  else{
    spawncrossroadsparticle = "yes";
  }
  updateSettings()
}
function toggleName(){
  if (showshapeinfo=="yes"){
    showshapeinfo = "no";
  }
  else{
    showshapeinfo = "yes";
  }
  updateSettings()
}
function toggleRadParticle(){
  if (spawnradparticle=="yes"){
    spawnradparticle = "no";
  }
  else{
    spawnradparticle = "yes";
  }
  updateSettings()
}
function toggleStatic(){
  if (showStaticMobName=="yes"){
    showStaticMobName = "no";
  }
  else{
    showStaticMobName = "yes";
  }
  updateSettings()
}
function toggleMinion(){
  if (showMinionMobName=="yes"){
    showMinionMobName = "no";
  }
  else{
    showMinionMobName = "yes";
  }
  updateSettings()
}
function toggleStats(){
  if (showstats=="yes"){
    showstats = "no";
  }
  else{
    showstats = "yes";
  }
  updateSettings()
}


function sendTypingIndicator(){
  var packet = JSON.stringify(["chat", "typingAnim"]);
  socket.send(packet)
}
function removeTypingIndicator(){
  var packet = JSON.stringify(["removeTyping"]);
  socket.send(packet)
}

var keylock = "no";

//hard-coded shape colors so that server does not need to keep sending colors for all the shapes
var colortheme = "default";
const shapecolors = {
  //based on number of sides
  3: {
    name: "triangle",
    default: {
      color: "#FFE46B",
      outline: "#E1C64D",
      hitcolor: "#FFF87F",
      hitoutline: "#f5da61",
    },
    oldtheme: {
      color: "#EFEF91",
      outline: "#D1D173",
      hitcolor: "#ffffa5",
      hitoutline: "#e5e587",
    },
  },
  4: {
    name: "square",
    default: {
      color: "#FC7676",
      outline: "#DE5858",
      hitcolor: "#ff8a8a",
      hitoutline: "#f26c6c",
    },
    oldtheme: {
      color: "#EF9791",
      outline: "#D1797D",
      hitcolor: "#ffaba5",
      hitoutline: "#e58d91",
    },
  },
  5: {
    name: "pentagon",
    default: {
      color: "#768CFC",
      outline: "#586EDE",
      hitcolor: "#95abff",
      hitoutline: "#778de1",
    },
    oldtheme: {
      color: "#A1A4E9",
      outline: "#8386CB",
      hitcolor: "#b5b7fd",
      hitoutline: "#9799df",
    },
  },
  6: {
    name: "hexagon",
    default: {
      color: "#FCA644",
      outline: "#DE8826",
      hitcolor: "#ffb958",
      hitoutline: "#f29c3a",
    },
    oldtheme: {
      color: "#FFD38E",
      outline: "#E1B570",
      hitcolor: "#ffe8a2",
      hitoutline: "#f5ca84",
    },
  },
  7: {
    name: "heptagon",
    default: {
      color: "#38B764",
      outline: "#1A9946",
      hitcolor: "#4ccb78",
      hitoutline: "#2ead5a",
    },
    oldtheme: {
      color: "#C4DC9E",
      outline: "#A6BE80",
      hitcolor: "#d8f0b2",
      hitoutline: "#bad294",
    },
  },
  8: {
    name: "octagon",
    default: {
      color: "#4A66BD",
      outline: "#2C489F",
      hitcolor: "#5e7bd1",
      hitoutline: "#545cb3",
    },
    oldtheme: {
      color: "#FF8BC0",
      outline: "#E16DA2",
      hitcolor: "#ff9fd4",
      hitoutline: "#f581b5",
    },
  },
  9: {
    name: "nonagon",
    default: {
      color: "#5D275D",
      outline: "#3F093F",
      hitcolor: "#713b71",
      hitoutline: "#531d53",
    },
    oldtheme: {
      color: "#9256FF",
      outline: "#7438EB",
      hitcolor: "#a66aff",
      hitoutline: "#884cff",
    },
  },
  10: {
    name: "decagon",
    default: {
      color: "#1A1C2C",
      outline: "#00000E",
      hitcolor: "#2e3040",
      hitoutline: "#141422",
    },
    oldtheme: {
      color: "#DFD4FF",
      outline: "#B6B5B5",
      hitcolor: "#f3e8ff",
      hitoutline: "#cac9c9",
    },
  },
  11: {
    name: "hendecagon",
    default: {
      color: "#060011",
      outline: "#000000",
      hitcolor: "#1a1425",
      hitoutline: "#141414",
    },
    oldtheme: {
      color: "#8DEDED",
      outline: "#6FE1E1",
      hitcolor: "#a1ffff",
      hitoutline: "#83f5f5",
    },
  },
  12: {
    name: "dodecagon",
    default: {
      color: "#403645",
      outline: "#221827",
      hitcolor: "#544a59",
      hitoutline: "#362c3b",
    },
    oldtheme: {
      color: "#F1882B",
      outline: "#db7c27",
      hitcolor: "#ff9c3f",
      hitoutline: "#ef8f3b",
    },
  },
  13: {
    name: "tridecagon",
    default: {
      color: "#EDEDFF",
      outline: "#CFCFE1",
      hitcolor: "#EDEDFF", //same color when hit or else it will be completely white
      hitoutline: "#CFCFE1",
    },
    oldtheme: {
      color: "#BEF0CE",
      outline: "#abd9ba",
      hitcolor: "#d2ffe2",
      hitoutline: "#bfedce",
    },
  },
  14: {
    name: "dodecagon",
    default: {
      color: "#000000",
      outline: "#000000",
      hitcolor: "#000000", //same color when hit
      hitoutline: "#000000",
    },
    oldtheme: {},
  },
  "-5": {
    name: "star",
    default: {
      color: "#ebc334",
      outline: "#ebb134",
      hitcolor: "#ffe252",
      hitoutline: "#ffce52",
    },
    oldtheme: {
      color: "#ebc334",
      outline: "#ebb134",
      hitcolor: "#ffe252",
      hitoutline: "#ffce52",
    },
  },
};
const botcolors = {
  //get colors based on dune mob name
  Cluster: {
    color: "#00ffff",
    outline: "#09d3fb",
    specialty: "",
    static: "no",
    minion: "no",
  },
  Pursuer: {
    color: "#00ffff",
    outline: "#09d3fb",
    specialty: "",
    static: "no",
    minion: "yes",
  },
  Crasher: {
    color: "#00ffff",
    outline: "#09d3fb",
    specialty: "",
    static: "no",
    minion: "yes",
  },
  Champion: {
    color: "#00ffff",
    outline: "#09d3fb",
    specialty: "",
    static: "no",
    minion: "no",
  },
  Infestor: {
    color: "#916f6f",
    outline: "#6c5353",
    specialty: "",
    static: "no",
    minion: "no",
  },
  Pillbox: {
    color: "#916f6f",
    outline: "#6c5353",
    specialty: "bullet knockback",
    static: "no",
    minion: "yes",
  },
  Leech: {
    color: "#916f6f",
    outline: "#6c5353",
    specialty: "lifesteal",
    static: "no",
    minion: "yes",
  },

  "Cavern Protector": {
    color: "#FFE46B",
    outline: "#E1C64D",
    specialty: "",
    static: "no",
    minion: "no",
  },
  "Abyssling": {
    color: "#FFE46B",
    outline: "#E1C64D",
    specialty: "",
    static: "no",
    minion: "no",
  },


  Legion: {
    color: "#e9ac7a",
    outline: "#d99b68",
    specialty: "",
    static: "no",
    minion: "no",
  },
  Booster: {
    color: "#e9ac7a",
    outline: "#d99b68",
    specialty: "",
    static: "no",
    minion: "no",
  },
  'Mega-Crasher': {
    color: "#bf3939",
    outline: "#B22222",
    specialty: "",
  },
  Spike: {
    color: "#123573",
    outline: "#0c2859",
    specialty: "it hurts",
  },
  Mortar: {
    color: "#001a47",
    outline: "#001333",
    specialty: "it hurts even more",
  },
  Rogue: {
    color: "#731582",
    outline: "#581063",
    specialty: "lifesteal",
  },
  Shield: {
    color: "#c79b4e",
    outline: "#a6803d",
    specialty: "bullet knockback",
  },
  Grower: {
    color: "#9400D3",
    outline: "#62008B",
    specialty: "grows when it deals damage",
  },
  Protector: {
    color: "#D5CE67",
    outline: "#ABA552",
    specialty: "sniper",
  },
  Boss: {
    color: "#86775F",
    outline: "#404040",
    specialty: "rarely spawns",
  },
  King: {
    color: "#47048a",
    outline: "#830ff7",
    specialty: "high health",
  },
  Titan: {
    color: "#a03333",
    outline: "#791a1a",
    specialty: "superior health",
  },
  Sultan: {
    color: "#0003b3",
    outline: "#00027a",
    specialty: "Upgraded Titan",
  },
  Beast: {
    color: "#B5D648",
    outline: "#5B692C",
    specialty: "Insane health",
  },
  Wall: {
    color: "#3b2b20",
    outline: "#8a6950",
    specialty: "bullet knockback",
  },

  Rock: {
    color: "#909090",
    outline: "#5c5c5c",
    specialty: "",
    static: "yes",
    minion: "no",
  },
  Gravel: {
    color: "#909090",
    outline: "#5c5c5c",
    specialty: "",
    static: "yes",
    minion: "no",
  },
  Boulder: {
    color: "#505250",
    outline: "#000000",
    specialty: "",
    static: "yes",
    minion: "no",
  },
  Mountain: {
    color: "#b8683b",
    outline: "#87563a",
    specialty: "",
    static: "yes",
    minion: "no",
  },
  Cactus: {
    color: "#60b560",
    outline: "#428042",
    specialty: "",
    static: "yes",
    minion: "no",
  },
};

function getTanksThatCanUpgradeTo(list,tankname){//for upgrade tree
  //get an array of tanks that can upgrade to in the future (these tanks wont be greyed out on upgrade tree)
  let listOfBodyUpgrades = [];
  
  function findChildBodyUpgrade(tank){
    for (const upgrade of tank){
      listOfBodyUpgrades.push(upgrade)
      try{
        let thisTank = list[upgrade].upgradeTo;
        findChildBodyUpgrade(thisTank)
      }
      catch(err){}
    }
  }
  
  try{
    let thisTank = list[tankname].upgradeTo;
    listOfBodyUpgrades.push(tankname)
    findChildBodyUpgrade(thisTank)
  }
  catch(err){}
  return listOfBodyUpgrades;
}

//getTanksThatCanUpgradeTo(bodyupgrades,'basic')
var previousWeapon = '';//check if tank type changed
var previousBody = '';
var weaponCanUpgradeTo = [];
var bodyCanUpgradeTo = [];

//for the upgrade tree
var bodysize = 20; //size of tank on upgrade tree
var bodyangle = 0; //angle of tank on upgrade tree in radians
//client list of tanks, if change tank in server, remember to change here
//this is only used for upgrade tree, NOT buttons and the actual game
//tank names with hyphen need inverted commas, e.g. "auto-guard"
const bodyupgrades = {
  //hardcoded for the upgrade tree. Omit unneccessary properties that dont affect visuals. Remove aura barrels.
  base: {
    upgradeTo: ['raider','wall','sentry'],//needed for upgrade tree (decide which tank to grey out)
  },
  smasher: {
    assets: {
      assetOne: {
        type: "under",
        sides: 6,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.25,
      },
    },
    upgradeTo: ['spike','armory'],
  },
  spike: {
    assets: {
      assetOne: {
        type: "under",
        sides: 4,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.5,
      },
    },
    upgradeTo: ['thorn'],
  },
  thorn: {
    assets: {
      assetOne: {
        type: "under",
        sides: 5,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.5,
      },
    },
    upgradeTo: ['saw','battalion'],
  },
  saw: {
    assets: {
      assetOne: {
        type: "under",
        sides: 4,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.75,
      },
    },
    upgradeTo: [],
  },
  armory: {
    turretBaseSize: 0.6,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.6,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    assets: {
      assetOne: {
        type: "under",
        sides: 6,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.25,
      },
    },
    upgradeTo: ['brigade'],
  },
  brigade: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.6,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    assets: {
      assetOne: {
        type: "under",
        sides: 4,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.5,
      },
    },
    upgradeTo: ['battalion'],
  },
  battalion: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.7,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    assets: {
      assetOne: {
        type: "under",
        sides: 5,
        color: "#5F676C",
        outline: "#41494E",
        size: 1.5,
      },
    },
    upgradeTo: [],
  },
  raider: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.6,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(253,118,118)",
        outline: "rgb(222,88,88)",
        size: 0.3,
      },
    },
    upgradeTo: ['forge'],
  },
  forge: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.65,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(253,118,118)",
        outline: "rgb(222,88,88)",
        size: 0.35,
      },
    },
    upgradeTo: ['foundry','mender','hail'],
  },
  foundry: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.7,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(253,118,118)",
        outline: "rgb(222,88,88)",
        size: 0.35,
      },
    },
    upgradeTo: ['flame'],
  },
  flame: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.8,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(253,118,118)",
        outline: "rgb(222,88,88)",
        size: 0.4,
      },
    },
    upgradeTo: ['inferno','juggernaut'],
  },
  inferno: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.9,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(253,118,118)",
        outline: "rgb(222,88,88)",
        size: 0.45,
      },
    },
    upgradeTo: [],
  },
  juggernaut: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.75,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgba(120, 118, 194)",
        outline: "rgba(90, 88, 164)",
        size: 0.3,
      },
    },
    upgradeTo: [],
  },
  mender: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.65,
      },
      assetTwo: {
        type: "above",
        sides: 8,
        color: "rgba(56,183,100)",
        outline: "rgba(26,153,70)",
        size: 0.3,
      },
    },
    upgradeTo: ['remedy'],
  },
  remedy: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.75,
      },
      assetTwo: {
        type: "above",
        sides: 8,
        color: "rgba(56,183,100)",
        outline: "rgba(26,153,70)",
        size: 0.4,
      },
    },
    upgradeTo: ['fabricator'],
  },
  fabricator: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(153,153,151)",
        outline: "rgb(122,124,123)",
        size: 0.9,
      },
      assetTwo: {
        type: "above",
        sides: 8,
        color: "rgba(56,183,100)",
        outline: "rgba(26,153,70)",
        size: 0.45,
      },
    },
    upgradeTo: [],
  },
  hail: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.65,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgba(150, 208, 227)",
        outline: "rgba(132, 190, 209)",
        size: 0.3,
      },
    },
    upgradeTo: ['blizzard'],
  },
  blizzard: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.65,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgba(150, 208, 227)",
        outline: "rgba(132, 190, 209)",
        size: 0.3,
      },
    },
    upgradeTo: ['snowstorm'],
  },
  snowstorm: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.65,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgba(150, 208, 227)",
        outline: "rgba(132, 190, 209)",
        size: 0.3,
      },
    },
    upgradeTo: [],
  },
  wall: {
    assets: {
      assetOne: {
        type: "above",
        sides: 6,
        color: "default",
        outline: "default",
        size: 1.15,
      },
    },
    upgradeTo: ['castle','smasher','propeller'],
  },
  castle: {
    assets: {
      assetOne: {
        type: "above",
        sides: 6,
        color: "default",
        outline: "default",
        size: 1.2,
      },
      assetTwo: {
        type: "above",
        sides: 6,
        color: "default",
        outline: "default",
        size: 0.6,
      },
    },
    upgradeTo: ['fortress'],
  },
  fortress: {
    assets: {
      assetOne: {
        type: "above",
        sides: 7,
        color: "default",
        outline: "default",
        size: 1.2,
      },
      assetTwo: {
        type: "above",
        sides: 7,
        color: "default",
        outline: "default",
        size: 0.7,
      },
    },
    upgradeTo: ['palace'],
  },
  palace: {
    assets: {
      assetOne: {
        type: "above",
        sides: 8,
        color: "default",
        outline: "default",
        size: 1.1,
      },
      assetTwo: {
        type: "above",
        sides: 6,
        color: "default",
        outline: "default",
        size: 0.8,
      },
    },
    upgradeTo: ['ziggurat'],
  },
  ziggurat: {
    assets: {
      assetOne: {
        type: "above",
        sides: 8,
        color: "default",
        outline: "default",
        size: 1.1,
      },
      assetTwo: {
        type: "above",
        sides: 6,
        color: "default",
        outline: "default",
        size: 0.8,
      },
      assetThree: {
        type: "above",
        sides: 4,
        color: "default",
        outline: "default",
        size: 0.4,
      },
    },
    upgradeTo: [],
  },
  sentry: {
    turretBaseSize: 0.4,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['mono','hangar'],
  },
  mono: {
    turretBaseSize: 0.6,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['bastion','turret','armory'],
  },
  bastion: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.6,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['artillery'],
  },
  artillery: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.9,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['bombard','battalion'],
  },
  bombard: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.9,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  turret: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.6,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: -0.4,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.6,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0.4,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['triplet'],
  },
  triplet: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: -0.4,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0.4,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.6,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['quadruplet'],
  },
  quadruplet: {
    turretBaseSize: 0.7,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0.4,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: -0.4,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: -0.2,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.4,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0.2,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  hangar: {
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['warship'],
  },
  warship: {
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 0,
        x: 0.9,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 0,
        x: -0.9,
        barrelType: "drone",
      },
    },
    upgradeTo: ['battleship'],
  },
  battleship: {
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 0,
        x: 0.9,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 120/180*Math.PI,
        x: 0.9,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 240/180*Math.PI,
        x: 0.9,
        barrelType: "drone",
      },
    },
    upgradeTo: ['mothership'],
  },
  mothership: {
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 0,
        x: 0.9,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 90/180*Math.PI,
        x: 0.9,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 180/180*Math.PI,
        x: 0.9,
        barrelType: "drone",
      },
      barrelFour: {
        barrelWidth: 0.75,
        barrelHeight: 0.75,
        additionalAngle: 270/180*Math.PI,
        x: 0.9,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  propeller: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.3,
      },
    },
    upgradeTo: ['thruster'],
  },
  thruster: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.4,
      },
    },
    upgradeTo: ['launcher'],
  },
  launcher: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.5,
      },
    },
    upgradeTo: ['rocketer'],
  },
  rocketer: {
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        size: 0.6,
      },
    },
    upgradeTo: [],
  },
  oven: {
    eternal: "yes",
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.7,
      },
      assetTwo: {
        type: "above",
        sides: 0,
        color: "rgb(250, 112, 112)",
        outline: "rgba(227, 61, 61)",
        outlineThickness: 5,
        size: 0.4,
      },
    },
    upgradeTo: ['heliosphere','corvus'],
  },
  chainsaw: {
    eternal: "yes",
    assets: {
            assetOne: {
              type: "under",
              sides: 8,
              color: "grey",
              outline: "dimgrey",
              outlineThickness: 5,
              size: 1.2,
            },
          },
    upgradeTo: ['blade'],
  },
  blade: {
    eternal: "yes",
    assets: {
            assetOne: {
              type: "under",
              sides: 8,
              color: "#383838",
              outline: "black",
              outlineThickness: 5,
              size: 1.3,
            },
          },
    upgradeTo: [],
  },
  pounder: {
    eternal: "yes",
    assets: {
      assetTwo: {
        type: "under",
        sides: 6,
        color: "slategrey",
        outline: "black",
        outlineThickness: 5,
        size: 1.4,
      },
      assetOne: {
        type: "under",
        sides: 6,
        color: "dimgrey",
        outline: "black",
        outlineThickness: 5,
        size: 1.2,
      },
    },
    upgradeTo: ['chasm'],
  },
  lightning: {
    eternal: "yes",
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.5,
      },
    },
    upgradeTo: ['firebolt'],
  },
  meteor: {
    eternal: "yes",
    turretBaseSize: 0.6,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['nebula'],
  },
  satellite: {
    eternal: "yes",
    turretBaseSize: 0.4,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['triton'],
  },
  heliosphere: {
    eternal: "yes",
    assets: {
      assetOne: {
        //grey aura base asset
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.4, //in comparison to the player's width
        angle: 0,
        x: 0,
        y: 0,
      },
      assetTwo: {
        //red aura base asset
        type: "above",
        sides: 0,
        color: "rgb(250, 112, 112)",
        outline: "rgba(227, 61, 61)",
        outlineThickness: 5,
        size: 0.2, //in comparison to the player's width
        angle: 0,
        x: 0,
        y: 0,
      },
      assetThree: {
        //grey aura base asset
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.2, //in comparison to the player's width
        angle: 0,
        x: 0.7,
        y: 0,
      },
      assetFour: {
        //red aura base asset
        type: "above",
        sides: 0,
        color: "rgb(250, 112, 112)",
        outline: "rgba(227, 61, 61)",
        outlineThickness: 5,
        size: 0.1, //in comparison to the player's width
        angle: 0,
        x: 0.7,
        y: 0,
      },
      assetFive: {
        //grey aura base asset
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.2, //in comparison to the player's width
        angle: 0,
        x: -0.4,
        y: -0.6,
      },
      assetSix: {
        //red aura base asset
        type: "above",
        sides: 0,
        color: "rgb(250, 112, 112)",
        outline: "rgba(227, 61, 61)",
        outlineThickness: 5,
        size: 0.1, //in comparison to the player's width
        angle: 0,
        x: -0.4,
        y: -0.6,
      },
      assetSeven: {
        //grey aura base asset
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.2, //in comparison to the player's width
        angle: 0,
        x: -0.4,
        y: 0.6,
      },
      assetEight: {
        //red aura base asset
        type: "above",
        sides: 0,
        color: "rgb(250, 112, 112)",
        outline: "rgba(227, 61, 61)",
        outlineThickness: 5,
        size: 0.1, //in comparison to the player's width
        angle: 0,
        x: -0.4,
        y: 0.6,
      },
    },
    upgradeTo: [],
  },
  corvus: {
    eternal: "yes",
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.8,
      },
      assetTwo: {
        type: "above",
        sides: 8,
        color: "rgba(56,183,100)",
        outline: "rgba(26,153,70)",
        outlineThickness: 5,
        size: 0.5,
      },
    },
    upgradeTo: [],
  },
  firebolt: {
    eternal: "yes",
    assets: {
      assetOne: {
        type: "above",
        sides: 0,
        color: "rgb(105, 104, 104)",
        outline: "rgb(79, 78, 78)",
        outlineThickness: 5,
        size: 0.6, //in comparison to the player's width
        angle: 0,
        x: 0,
        y: 0,
      },
    },
    upgradeTo: [],
  },
  chasm: {
    eternal: "yes",
    assets: {
      assetOne: {
        type: "under",
        sides: 6,
        color: "#383838",
        outline: "black",
        outlineThickness: 5,
        size: 1.3, //in comparison to the player's width
        angle: 0,
        x: 0,
        y: 0,
      },
    },
    upgradeTo: [],
  },
  nebula: {
    eternal: "yes",
    turretBaseSize: 0.6,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  triton: {
    eternal: "yes",
    turretBaseSize: 0.5,
    bodybarrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.3,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  primordial: {
    eternal: "yes",
    upgradeTo: ['oven','pounder','chainsaw','lightning','meteor','satellite'],
  },
};
const weaponupgrades = {
  //weapon upgrades for upgrade tree is hardcoded into client. if change in server, remember to change here too
  node: {
    barrels: {},
    upgradeTo: ['basic','guard','trapper'],
  },
  basic: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['twin','sniper','cannon','flank'],
  },
  twin: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.8,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.6,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['gunner','quad','split','stream'],
  },
  sniper: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.2,
        barrelHeight: 2.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['targeter','marksman'],
  },
  cannon: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.4,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['single'],
  },
  flank: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['tri-angle','quad'],
  },
  trapper: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['delta'],
  },
  delta: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['gamma','blockade','minelayer','warden'],
  },
  guard: {
    barrels: {
      barrelOne: {
        barrelWidth: .5,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['commander','overseer'],
  },
  gunner: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: -0.8,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0.8,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['blaster','rimfire','minesweeper'],
  },
  quad: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 90,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 270,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['octo'],
  },
  split: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: -30,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 30,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.83,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['tower','rimfire'],
  },
  stream: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['jet'],
  },
  targeter: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['streamliner'],
  },
  marksman: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['duel'],
  },
  single: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.5,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['destroyer'],
  },
  "tri-angle": {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 150,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 210,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['booster','fighter'],
  },
  gamma: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['beta'],
  },
  blockade: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['barricade'],
  },
  minelayer: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.6,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: ['engineer'],
  },
  barricade: {
    barrels: {
      barrelTwo: {
        barrelWidth: 0.6,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.6,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['riot'],
  },
  commander: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['director'],
  },
  director: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.25,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['manager','spawner'],
  },
  overseer: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1.5,
        additionalAngle: 90,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.5,
        additionalAngle: -90,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['protector'],
  },
  protector: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 90,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: -90,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['king'],
  },
  blaster: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.6,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['minigun','knockback'],
  },
  rimfire: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: -15,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: 15,
        x: 0.6,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['centrefire'],
  },
  octo: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 45,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 90,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 135,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 225,
        x: 0,
        barrelType: "bullet",
      },
      barrelSeven: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 270,
        x: 0,
        barrelType: "bullet",
      },
      barrelEight: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 315,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['cyclone','hex'],
  },
  tower: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.6,
        additionalAngle: 40,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.6,
        additionalAngle: -40,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 20,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: -20,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['stronghold','centrefire'],
  },
  jet: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['flamethrower'],
  },
  streamliner: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 2.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.8,
        barrelHeight: 2.25,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.8,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.8,
        barrelHeight: 1.75,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['conquerer'],
  },
  duel: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 3,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['hunter'],
  },
  destroyer: {
    barrels: {
      barrelOne: {
        barrelWidth: 2,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['hex','harbinger','hybrid'],
  },
  hybrid: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.65,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.85,
        barrelHeight: 1.6,
        additionalAngle: 180,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  booster: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 135,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.72,
        additionalAngle: 155,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 225,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.72,
        additionalAngle: 205,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['guardian','comet'],
  },
  fighter: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: 90,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 150,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: -90,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 210,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['wave','amalgam'],
  },
  beta: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.25,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['alpha'],
  },
  warden: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 90,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 0.5,
        barrelHeight: 1.4,
        additionalAngle: 270,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['defender'],
  },
  engineer: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: ['machine','manufacturer','detonator'],
  },
  manager: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.5,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['executive','CEO','hybrid'],
  },
  spawner: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.7,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "minion",
      },
    },
    upgradeTo: ['factory'],
  },
  king: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: -120,
        x: 0,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 120,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['master','tyrant'],
  },
  factory: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "minion",
      },
    },
    upgradeTo: [],
  },
  master: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: -90,
        x: 0,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 90,
        x: 0,
        barrelType: "drone",
      },
      barrelFour: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 180,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  tyrant: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: -72,
        x: 0,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 72,
        x: 0,
        barrelType: "drone",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: -144,
        x: 0,
        barrelType: "drone",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 144,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  industry: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "minion",
      },
      barrelTwo: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 120,
        x: 0,
        barrelType: "minion",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 240,
        x: 0,
        barrelType: "minion",
      },
    },
    upgradeTo: [],
  },
  battler: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: -15,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: 15,
        x: 0.6,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1 ,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  pinnace: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.75,
        barrelHeight: 2.25,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
      barrelFive: {
        barrelWidth: 0.75,
        barrelHeight: 1.5,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  minigun: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 2.3,
        additionalAngle: 0,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2.3,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2.3,
        additionalAngle: 0,
        x: 0.6,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.4,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 0.4,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 0.4,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0.6,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  knockback: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.8,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0.6,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  centrefire: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.7,
        barrelHeight: 1.6,
        additionalAngle: -10,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.7,
        barrelHeight: 1.6,
        additionalAngle: 10,
        x: 0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 1.8,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 0.5,
        barrelHeight: 2.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  macrofire: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: -25,
        x: -0.6,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.7,
        barrelHeight: 1.8,
        additionalAngle: 25,
        x: 0.6,
        barrelType: "bullet",
      },
    },
  },
  cyclone: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 30,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 60,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 90,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 150,
        x: 0,
        barrelType: "bullet",
      },
      barrelSeven: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelEight: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 210,
        x: 0,
        barrelType: "bullet",
      },
      barrelNine: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
      barrelTen: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 270,
        x: 0,
        barrelType: "bullet",
      },
      barrelEleven: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 300,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwelve: {
        barrelWidth: 0.67,
        barrelHeight: 1.6,
        additionalAngle: 330,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  stronghold: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 45,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: -45,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.6,
        additionalAngle: 30,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.6,
        additionalAngle: -30,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 15,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: -15,
        x: 0,
        barrelType: "bullet",
      },
      barrelSeven: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  flamethrower: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  conquerer: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.8,
        barrelHeight: 3,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.8,
        barrelHeight: 2.75,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.8,
        barrelHeight: 2.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 0.8,
        barrelHeight: 2.25,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 0.8,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 0.8,
        barrelHeight: 1.75,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelSeven: {
        barrelWidth: 0.8,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  hunter: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 3.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  hex: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 60,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1.2,
        barrelHeight: 2,
        additionalAngle: 300,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  harbinger: {
    barrels: {
      barrelOne: {
        barrelWidth: 2,
        barrelHeight: 2.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  guardian: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.9,
        additionalAngle: 190,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.9,
        additionalAngle: 170,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 2.05,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  comet: {
    barrels: {
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.34,
        additionalAngle: 245,
        x: 0,
        barrelType: "bullet",
      },
      barrelSeven: {
        barrelWidth: 1,
        barrelHeight: 1.34,
        additionalAngle: -245,
        x: 0,
        barrelType: "bullet",
      },
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 135,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.72,
        additionalAngle: 155,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 225,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.72,
        additionalAngle: 205,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  wave: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: 100,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 145,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: -100,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: -145,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  amalgam: {
    barrels: {
      barrelOne: {
        barrelWidth: 1/5*4.2,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0.5,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1/5*4.2,
        barrelHeight: 2,
        additionalAngle: 0,
        x: -0.5,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1/1.5,
        barrelHeight: 1.4,
        additionalAngle: -20,
        x: -0.4,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 1/1.5,
        barrelHeight: 1.4,
        additionalAngle: 20,
        x: 0.4,
        barrelType: "trap",
      },
      barrelFive: {
        barrelWidth: .5,
        barrelHeight: 1.6,
        additionalAngle: 140,
        x: 0,
        barrelType: "drone",
      },
      barrelSix: {
        barrelWidth: .5,
        barrelHeight: 1.6,
        additionalAngle: 220,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  alpha: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.5,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  riot: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.6,
        barrelHeight: 2.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelTwo: {
        barrelWidth: 0.6,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.6,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  defender: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 60,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 120,
        x: 0,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
      barrelFive: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 240,
        x: 0,
        barrelType: "trap",
      },
      barrelSix: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 300,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['sharpnel'],
  },
  sharpnel: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 45,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 90,
        x: 0,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 135,
        x: 0,
        barrelType: "trap",
      },
      barrelFive: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
      barrelSix: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 225,
        x: 0,
        barrelType: "trap",
      },
      barrelSeven: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 270,
        x: 0,
        barrelType: "trap",
      },
      barrelEight: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 315,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  machine: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: [],
  },
  manufacturer: {
    barrels: {
      barrelOne: {
        barrelWidth: 1 * 1.3,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: [],
  },
  detonator: {
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: [],
  },
  executive: {
    barrels: {
      barrelOne: {
        barrelWidth: 1.7,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  CEO: {
    barrels: {
      barrelOne: {
        barrelWidth: 2,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  hailstorm: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['thunderstorm','cosmetic'],
  },
  bunker: {
    eternal: "yes",
    barrels: {
      barrelTwo: {
        barrelWidth: 0.5,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 0.5,
        barrelHeight: 1.5,
        additionalAngle: 120,
        x: 0,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 0.5,
        barrelHeight: 1.5,
        additionalAngle: 240,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['vault','asteroid','dynamite'],
  },
  chaos: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: 90,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: -90,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: ['mayhem','industry'],
  },
  bombshell: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 1.5,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1.5,
        barrelHeight: 1.2,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1.5,
        barrelHeight: 1.2,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: ['demolisher'],
  },
  warrior: {
    eternal: "yes",
    barrels: {
      barrelEight: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: -120,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['veteran'],
  },
  thunderstorm: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 60,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },

      barrelFour: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 0.9,
        barrelHeight: 1.3,
        additionalAngle: 300,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  cosmetic: {
    eternal: "yes",
    barrels: {
      barrelOne: {
              barrelWidth: 0.9,
              barrelHeight: 1.6,
              additionalAngle: 180,
              x: 0,
              barrelType: "bullet",
            },
            barrelTwo: {
              barrelWidth: 0.9,
              barrelHeight: 1.6,
              additionalAngle: 60,
              x: 0,
              barrelType: "bullet",
            },
            barrelThree: {
              barrelWidth: 0.8,
              barrelHeight: 1.3,
              additionalAngle: 120,
              x: 0,
              barrelType: "bullet",
            },

            barrelFour: {
              barrelWidth: 0.8,
              barrelHeight: 1.3,
              additionalAngle: 0,
              x: 0,
              barrelType: "bullet",
            },
            barrelFive: {
              barrelWidth: 0.8,
              barrelHeight: 1.3,
              additionalAngle: 240,
              x: 0,
              barrelType: "bullet",
            },
            barrelSix: {
              barrelWidth: 0.9,
              barrelHeight: 1.6,
              additionalAngle: 300,
              x: 0,
              barrelType: "bullet",
            },
    },
    upgradeTo: [],
  },
  vault: {
    eternal: "yes",
    barrels: {
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 60,
        x: 0,
        barrelType: "trap",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 120,
        x: 0,
        barrelType: "trap",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 240,
        x: 0,
        barrelType: "trap",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 300,
        x: 0,
        barrelType: "trap",
      },
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.2,
        additionalAngle: 0,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  asteroid: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 120,
        x: 0,
        barrelType: "mine",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.5,
        additionalAngle: 240,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: [],
  },
  mayhem: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: 90,
        x: 0,
        barrelType: "drone",
      },
      barrelTwo: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: -90,
        x: 0,
        barrelType: "drone",
      },
      barrelThree: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: 0,
        x: 0,
        barrelType: "drone",
      },
      barrelFour: {
        barrelWidth: 0.67,
        barrelHeight: 1.3,
        additionalAngle: 180,
        x: 0,
        barrelType: "drone",
      },
    },
    upgradeTo: [],
  },
  dynamite: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "mine",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 120,
        x: 0,
        barrelType: "mine",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 240,
        x: 0,
        barrelType: "mine",
      },
    },
    upgradeTo: [],
  },
  demolisher: {
    eternal: "yes",
    barrels: {
      barrelOne: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 60,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 120,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 180,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 240,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1.5,
        barrelHeight: 1.3,
        additionalAngle: 300,
        x: 0,
        barrelType: "bullet",
      },
    },
    upgradeTo: [],
  },
  veteran: {
    eternal: "yes",
    barrels: {
      barrelSeven: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 25,
        x: 0,
        barrelType: "drone",
      },
      barrelEight: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: -25,
        x: 0,
        barrelType: "drone",
      },
      barrelOne: {
        barrelWidth: 1,
        barrelHeight: 2,
        additionalAngle: 0,
        x: 0,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: 100,
        x: 0,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: 145,
        x: 0,
        barrelType: "bullet",
      },
      barrelFour: {
        barrelWidth: 1,
        barrelHeight: 1.44,
        additionalAngle: -100,
        x: 0,
        barrelType: "bullet",
      },
      barrelFive: {
        barrelWidth: 1,
        barrelHeight: 1.4,
        additionalAngle: -145,
        x: 0,
        barrelType: "bullet",
      },
      barrelSix: {
        barrelWidth: 1,
        barrelHeight: 1.8,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: [],
  },
  eternal: {
    eternal: "yes",
    upgradeTo: ['hailstorm','bunker','chaos','bombshell','warrior'],
  },
  minesweeper: {
    barrels: {
      barrelOne: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: -0.3,
        barrelType: "bullet",
      },
      barrelTwo: {
        barrelWidth: 0.4,
        barrelHeight: 1.4,
        additionalAngle: 0,
        x: 0.3,
        barrelType: "bullet",
      },
      barrelThree: {
        barrelWidth: 0.75,
        barrelHeight: 2,
        additionalAngle: 180,
        x: 0,
        barrelType: "trap",
      },
    },
    upgradeTo: ['battler','pinnace'],
  },
};

//animating the background of homepage
var backgroundWidth = 0;
var backgroundHeight = 0;
var step = 0;
var radius = 0;
var speed = 0.01;
var zoomedWidth = 0;
var zoomedHeight = 0;
var xChange = 1;
var yChange = 1;

//check whether mouse is near left side of screen, which will make skillpoints appear
var mouseToSkillPoints = "no";

let defaultNotifColor = "rgb(50,50,50)";

function randomNotif() {

        //random notification when player joined game
        let randomFunFact = [
          "To get to the crossroads, rupture a portal without entering it",
          "Press p for passive mode",
          "Press f for fast rotation",
          "You can enter the purple portals at lvl 100 only",
          "Press h to toggle hitboxes",
          "There is a tank that can slow down dune mobs",
          "Juggernaut have purple auras that can suck in players, careful!",
          "Blizzard slows down dune mobs",
          "Some shapes are larger than usual, they give more score!",
          "Detonator shoots traps that explode on death"
        ]
        let rando = randomFunFact[Math.floor(Math.random() * randomFunFact.length)]; //random fun fact
        createNotif(rando,defaultNotifColor,3000)
}

//leaderboard player rotation
var lbAngle = 0;

//2tdm colors
var teamColors = [];

//team colors (copied from scenexe)
var bodyColors = {
  blue: {
    col: "#00B0E1",
    outline: "#0092C3",
    hitCol: "#14c4f5",//color when hit or have spawn protection (values in RGB is 20 higher)
    hitOutline: "#14a6d7",
  },
  green: {
    col: "#00E06C",
    outline: "#00C24E",
    hitCol: "#14f480",
    hitOutline: "#14d662",
  },
  red: {
    col: "#F04F54",
    outline: "#b33b3f",
    hitCol: "#ff6368",
    hitOutline: "#c74f53",
  },
  purple: {
    col: "#BE7FF5",
    outline: "#A061D7",
    hitCol: "#d293ff",
    hitOutline: "#b475eb",
  },
  magenta: {
    col: "#D82BCF",
    outline: "#BA0DB1",
    hitCol: "#ec3fe3",
    hitOutline: "#ce21c5",
  },
  fallen: {
    col: "#C0C0C0",
    outline: "#A2A2A2",
    hitCol: "#d4d4d4",
    hitOutline: "#b6b6b6",
  },
  eternal: {
    col: "#934c93",
    outline: "#660066",
    hitCol: "#a760a7",
    hitOutline: "#7a147a",
  },
  celestial: {
    col: "#F177DD",
    outline: "#D359BF",
    hitCol: "#ff8bf1",
    hitOutline: "#e76dd3",
  },
  barrel: {
    col: "#999999",
    outline: "#7B7B7B",
    hitCol: "#adadad",
    hitOutline: "#8f8f8f",
  },
  asset: {
    col: "#5F676C",
    outline: "#41494E",
    hitCol: "#737b80",
    hitOutline: "#555d62",
  },
  triangle: {
    col: "#FFE46B",
    outline: "#E1C64D",
    hitCol: "#FFF87F",
    hitOutline: "#f5da61",
  },
  square: {
    col: "#FC7676",
    outline: "#DE5858",
    hitCol: "#ff8a8a",
    hitOutline: "#f26c6c",
  },
  pentagon: {
    col: "#768CFC",
    outline: "#586EDE",
    hitCol: "#95abff",
    hitOutline: "#778de1",
  },
  hexagon: {
    col: "#FCA644",
    outline: "#DE8826",
    hitCol: "#ffb958",
    hitOutline: "#f29c3a",
  },
  heptagon: {
    col: "#38B764",
    outline: "#1A9946",
    hitCol: "#4ccb78",
    hitOutline: "#2ead5a",
  },
  octagon: {
    col: "#4A66BD",
    outline: "#2C489F",
    hitCol: "#5e7bd1",
    hitOutline: "#545cb3",
  },
  nonagon: {
    col: "#5D275D",
    outline: "#3F093F",
    hitCol: "#713b71",
    hitOutline: "#531d53",
  },
  decagon: {
    col: "#1A1C2C",
    outline: "#00000E",
    hitCol: "#2e3040",
    hitOutline: "#141422",
  },
  hendecagon: {
    col: "#060011",
    outline: "#000000",
    hitCol: "#1a1425",
    hitOutline: "#141414",
  },
  dodecagon: {
    col: "#403645",
    outline: "#221827",
    hitCol: "#544a59",
    hitOutline: "#362c3b",
  },
  tridecagon: {
    col: "#EDEDFF",
    outline: "#CFCFE1",
    hitCol: "#EDEDFF", //same color when hit or else it will be completely white
    hitOutline: "#CFCFE1",
  },
  tetradecagon: {
    col: "#000000",
    outline: "#000000",
    hitCol: "#000000", //same color when hit
    hitOutline: "#000000",
  },
  transparent: {
    col: "transparent",
    outline: "transparent",
    hitCol: "transparent",
    hitOutline: "transparent",
  }
}

var socket = "null";
  // Connect to server
  if (window.location.href.includes("developer-rocketer")){//website is dev rocketer (used for testing)
    createNotif("Connected to the developer's testing servers.","rgba(150,0,0)",5000)
    createNotif("To play the actual game, proceed to rocketer.glitch.me","rgba(150,0,0)",5000)
    createNotif("Dev rocketer is not working for now, please go to rocketer.glitch.me, thank you!","red",15000)
    var serverlist = {
      "Free For All": "wss://devrocketerarena.devrocketer.repl.co/",
      "2 Teams": "wss://devrocketer2tdm.devrocketer.repl.co/",
      "4 Teams": "wss://devrocketer4tdm.devrocketer.repl.co/",
      "Tank Editor": ["wss://devrocketereditor.devrocketer.repl.co/", "wss://devrocketereditor2.devrocketer.repl.co/"],
      "dune": "wss://devrocketerdune.devrocketer.repl.co/",
      "cavern": "wss://devrocketercavern.devrocketer.repl.co/",
      "cr": "wss://devrocketercr.devrocketer.repl.co/",
      "sanc": "wss://devrocketersanc.devrocketer.repl.co/",
    }
  }
  else{//actual rocketer
    var serverlist = {
      "Free For All": "wss://rock-it-1.glitch.me/", //"wss://m46qtv-3000.csb.app/",
      "2 Teams": "wss://rock-it-3.glitch.me/", //"wss://yfndv9-3000.csb.app/",
      "4 Teams": "wss://rock-it-2.glitch.me/",
      "Tank Editor": ["wss://rock-it-6.glitch.me/", "wss://8kt8fx-3000.csb.app/"],
      "dune": "wss://rock-it-8.glitch.me/",
      "cavern": "wss://rock-it-7.glitch.me/",
      "cr": "wss://rock-it-5.glitch.me/",
      "sanc": "wss://rock-it-4.glitch.me/",
    }
  }
  function connectServer(whichserver,teleportingYN){//'wss://developer-rocketer.glitch.me/'
  if(typeof whichserver == "object") {
    whichserver = whichserver[currentGamemodeRegion];
  }
  socket = new WebSocket(whichserver);
  socket.binaryType = "arraybuffer";//receive uint8array instead of blob (when servre compresses game data)
    console.log("Connecting to server...")
  socket.onopen = function(event) {//connected

    // Send a message to server
    //socket.send('yo');

    //connected
    connected = "yes";
    console.log("Connected!")
    if (teleportingTransition!="yes"){//disconnected and reconnected, but not teleporting
      playButton.style.display = "block";
      nameInput.style.display = "block";
    }
    //retrieve world record from server
    var packet = JSON.stringify(["wr"]);
    socket.send(packet)
    //check latency
    var sentBack = "yes";
    setInterval(function () {
      if (sentBack == "yes") {
        //dont ping again if server havent replied
        start = Date.now();
        var packet = JSON.stringify(["pingServer"]);
        socket.send(packet)
        sentBack = "no";
      }
    }, 1500); //every 1.5 second

    if (teleportingYN=="yes"){
      var packet = JSON.stringify(["teleporting",prevplayerstring]);
      socket.send(packet)
    }



  //auto sign into account when open website
  if (
    localStorage.getItem("rocketerAccountp") &&
    localStorage.getItem("rocketerAccountu")
  ) {
    const catss = localStorage.getItem("rocketerAccountp");
    const dogss = localStorage.getItem("rocketerAccountu");
    document.getElementById("signUp").style.display = "none";
    document.getElementById("logIn").style.display = "none";
    document.getElementById("accountText").innerHTML = "Logging in...";
    document.getElementById("accountName").innerHTML = "Auto logging in...";
    var packet = JSON.stringify(["logInOrSignUp", dogss, catss, "", "login"]);
    socket.send(packet)
  }

    // Listen for stuff sent from server
    socket.onmessage = function(event) {
      let info = "";
      let type = "";
      try{
        info = JSON.parse(event.data)
        type = info[0];//different stuff sent to client from server
        bandwidth += new TextEncoder().encode(event.data).length;
      }
      catch(err){//this packet was compressed using pako, so it cannot be parsed yet
        //console.log(event.data)
        info = JSON.parse(pako.inflate(event.data, { to: 'string' }));
        type = info[0];//different stuff sent to client from server
        bandwidth += event.data.byteLength;//client receives uint8array packet cuz it is compressed, get byte length using bytelength property
      }


      //update bandwidth
      if (Date.now() - prevBandwidthUpdate > 1000) {
          //if 1 second has passed
          shownBandwidth = bandwidth; //update the bandwdth that is shown
          prevBandwidthUpdate = Date.now();
          bandwidth = 0;
        }


      if (type=="sendID"){//client sending player's id
        let yourID = info[1];
        playerstring = yourID;
      }
      else if (type=="youtuber"){
        let icon = info[1];
        let name = info[2];
        let url = info[3];
         //featured youtuber
        document.getElementById("youtuberimage").src = icon;
        document.getElementById("youtubername").innerHTML =
          "Featured YouTuber:<br>" + name;
        var channelurl = "https://youtube.com/" + url;
        document.getElementById("featuredyoutuber").onclick = function () {
          window.open(channelurl);
        };
      }
      else if (type=="newNotification"){//create notification when server sends it
        let text = info[1];
        let color = info[2];
        createNotif(text,color,5000)
      }
      else if (type=="tankButton"){
        let dummyTank = info[1];
        let button = info[2];
        let realPlayer = info[3];
        if (button == "button1") {
          buttonTank[1] = dummyTank;
          howManyButtonSentToClient = 1;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button2") {
          buttonTank[2] = dummyTank;
          howManyButtonSentToClient = 2;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button3") {
          buttonTank[3] = dummyTank;
          howManyButtonSentToClient = 3;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button4") {
          buttonTank[4] = dummyTank;
          howManyButtonSentToClient = 4;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button5") {
          buttonTank[5] = dummyTank;
          howManyButtonSentToClient = 5;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button6") {
          buttonTank[6] = dummyTank;
          howManyButtonSentToClient = 6;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button7") {
          buttonTank[7] = dummyTank;
          howManyButtonSentToClient = 7;
          howManyButtonSentToServer = 0;
          prevPlayerLvl = realPlayer.tankTypeLevel;
        } else if (button == "button8") {
          buttonTank[8] = dummyTank;
          howManyButtonSentToClientb = 8;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button9") {
          buttonTank[9] = dummyTank;
          howManyButtonSentToClientb = 9;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button10") {
          buttonTank[10] = dummyTank;
          howManyButtonSentToClientb = 10;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button11") {
          buttonTank[11] = dummyTank;
          howManyButtonSentToClientb = 11;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button12") {
          buttonTank[12] = dummyTank;
          howManyButtonSentToClientb = 12;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button13") {
          buttonTank[13] = dummyTank;
          howManyButtonSentToClientb = 13;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        } else if (button == "button14") {
          buttonTank[14] = dummyTank;
          howManyButtonSentToClientb = 14;
          howManyButtonSentToServerb = 0;
          prevPlayerLvlb = realPlayer.bodyTypeLevel;
        }
      }
      else if (type=="receiveWR"){
        let recordHolder = info[1];
        document.getElementById("wrwords").innerHTML =
        "<span style='text-align: center;'><h3>World Record Holder</h3><hr></span><table><tr><th>1. " +
        recordHolder[0].name +
        "</th><th>" +
        recordHolder[0].score +
        " xp</th><th>" +
        recordHolder[0].tank +
        "</th></tr><tr><th>2. " +
        recordHolder[1].name +
        "</th><th>" +
        recordHolder[1].score +
        " xp</th><th>" +
        recordHolder[1].tank +
        "</th></tr><tr><th>3. " +
        recordHolder[2].name +
        "</th><th>" +
        recordHolder[2].score +
        " xp</th><th>" +
        recordHolder[2].tank +
        "</th></tr><tr><th>4. " +
        recordHolder[3].name +
        "</th><th>" +
        recordHolder[3].score +
        " xp</th><th>" +
        recordHolder[3].tank +
        "</th></tr><tr><th>5. " +
        recordHolder[4].name +
        "</th><th>" +
        recordHolder[4].score +
        " xp</th><th>" +
        recordHolder[4].tank +
        "</th></tr></table>";
      }
      else if (type=="accountView"){
        let accountObject = info[1];
        //if successfully log into an account, show the account
        /*
        name: accountname,
  desc: description,
  pw: password,
  join: dateToday,
  achievements: [],
  topScore: 0,
  star: 0,
  pfp: "basic",
  clr: "blue",
  bg: "grey",
  lastSeen: Date.now(),*/

        /*
        //used to get the Last Online string, which currently isnt needed
        var lastSeenString = "";
        const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];//needed because date wll return number value, e.g. 0 for Sunday
        var d = new Date(accountObject.lastSeen);
        var day = weekday[d.getDay()];
        lastSeenString += day+" "+d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+ d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        */

        loggedInAccount = accountObject;
        var achievementsDescription = "";
        function addAchievementDiv(color,color2,name,star,starcol,textcol,desc){
          achievementsDescription += "<div class='achievementDiv' style='color:"+textcol+";margin:10px;background: linear-gradient(to bottom, "+color+" 50%, "+color2+" 0%);'><span style='font-size:1.5vw;width: 100%;'>"+name+"<span style='float:right;'><span class='material-icons' style='color: "+starcol+";font-size:1.2vw;'> star </span>"+star+"</span></span><br><br>"+desc+"</div>";
        }
        if (accountObject.achievements.includes(1)) {
          addAchievementDiv('rgb(242,219,120)','rgb(212,189,90)','Welcome',5,'gold','white','Create an account.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Welcome',5,'rgba(192,192,192)','rgba(192,192,192)','Create an account.')
        }
        if (accountObject.achievements.includes(2)) {
          addAchievementDiv('rgb(126,146,247)','rgb(96,116,217)','Killer',20,'gold','white','Kill a player by shooting.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Killer',20,'rgba(192,192,192)','rgba(192,192,192)','Kill a player by shooting.')
        }
        if (accountObject.achievements.includes(3)) {
          addAchievementDiv('rgb(123, 9, 123)','rgb(93, 0, 93)','Rainbow',35,'gold','white','Kill a radiant shape.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Rainbow',35,'rgba(192,192,192)','rgba(192,192,192)','Kill a radiant shape.')
        }
        if (accountObject.achievements.includes(4)) {
          addAchievementDiv('rgb(194, 63, 63)','rgb(164, 33, 33)','Giant',50,'gold','white','Get 1 million xp in one run.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Giant',50,'rgba(192,192,192)','rgba(192,192,192)','Get 1 million xp in one run.')
        }
        if (accountObject.achievements.includes(5)) {
          addAchievementDiv('rgb(81, 217, 225)','rgb(51, 187, 195)','Monstrous',75,'gold','white','Get 10 million xp in one run.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Monstrous',75,'rgba(192,192,192)','rgba(192,192,192)','Get 10 million xp in one run.')
        }
        if (accountObject.achievements.includes(6)) {
          addAchievementDiv('rgb(39, 227, 170)','rgb(9, 197, 140)','Titan',150,'gold','white','Get 100 million xp in one run.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Titan',150,'rgba(192,192,192)','rgba(192,192,192)','Get 100 million xp in one run.')
        }
        if (accountObject.achievements.includes(7)) {
          addAchievementDiv('rgb(222, 156, 58)','rgb(192, 126, 28)','Explorer',5,'gold','white','Enter a portal.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Explorer',5,'rgba(192,192,192)','rgba(192,192,192)','Enter a portal.')
        }
        if (accountObject.achievements.includes(8)) {
          addAchievementDiv('rgb(184, 159, 123)','rgb(154, 129, 93)','Bomber',50,'gold','white','Kill a shape with 10 or more sides.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Bomber',50,'rgba(192,192,192)','rgba(192,192,192)','Kill a shape with 10 or more sides.')
        }
        if (accountObject.achievements.includes(9)) {
          addAchievementDiv('rgb(184, 123, 181)','rgb(154, 93, 151)','Skilled',300,'gold','white','Reach lvl 60 as a node.')
        }
        else{
          addAchievementDiv('rgb(95,103,108)','rgb(65,73,78)','Skilled',300,'rgba(192,192,192)','rgba(192,192,192)','Reach lvl 60 as a node.')
        }

        //put password and username in local storage
        try {
          localStorage.setItem("rocketerAccountp", accountObject.pw);
          localStorage.setItem("rocketerAccountu", accountObject.name);
          const cat = localStorage.getItem("rocketerAccountp");
          const dog = localStorage.getItem("rocketerAccountu");
        } catch (e) {
          console.log("An error occured when storing your password: " + e);
        }

        document.getElementById("accountName").innerHTML = accountObject.name;
        document.getElementById("accountText").style.textAlign = "left";
        document.getElementById("accountText").innerHTML =
          "<canvas id='pfp' style='float:left; width: 10vw; height: 10vw; padding-right: 1vw;'></canvas><br><span style='font-weight: 900;font-size: 2vw;'>" +
          accountObject.name +
          "</span><br><span class='material-icons' style='font-size: 1vw;color: gold;'> star </span>" +
          accountObject.star +
          "<br><br>" +
          accountObject.desc +
          "<br><br><hr style='width:70%;text-align:left;margin-left:15%;'><div style='width:100%;display:flex;flex-wrap: wrap;text-align: center;'><div style='width:50%;'>Joined<br>" +
          accountObject.join + "</div><div style='width:50%;'>" + 'High score<br>' + accountObject.topScore +
          "</div></div><hr style='width:70%;text-align:left;margin-left:15%;'><br><span style='width:100%;display:inline-block;font-weight: 900;font-size: 1.5vw;'>Achievements:<br><br></span>" +
          "<div style='width:100%;display:flex;flex-wrap: wrap;'>"+
          achievementsDescription +
          "</div><br>Reload the page to view the latest account information.";
        var pfpcanvas = document.getElementById("pfp");
        pfpcanvas.width = "300"; //canvas coordinate width and height, not the actual canvas width and height
        pfpcanvas.height = "300";
        var pctx = pfpcanvas.getContext("2d");
        var pfpPlayerX = 125;
        var pfpPlayerY = 175;
        pctx.fillStyle = "#CDCDCD"; //background
        pctx.strokeStyle = "grey";
        pctx.lineWidth = 5;
        pctx.beginPath();
        pctx.arc(150, 150, 148, 0, 2 * Math.PI);
        pctx.fill();
        pctx.stroke();
        //draw grid
        var pgridHeight = 48;
        pctx.lineWidth = 8; //thickness of grid
        pctx.strokeStyle = "rgba(180, 180, 180, .2)";
        for (
          let x = -pgridHeight - ((-pfpcanvas.width / 2) % pgridHeight);
          x < pfpcanvas.width;
          x += pgridHeight
        ) {
          pctx.moveTo(x, 0);
          pctx.lineTo(x, pfpcanvas.height);
        }
        for (
          let y = -pgridHeight - ((-pfpcanvas.height / 2) % pgridHeight);
          y < pfpcanvas.height;
          y += pgridHeight
        ) {
          pctx.moveTo(0, y);
          pctx.lineTo(pfpcanvas.width, y);
        }
        pctx.stroke();
        //crop grid to a circle
        pctx.globalCompositeOperation = "destination-in";
        pctx.beginPath();
        pctx.arc(150, 150, 148, 0, 2 * Math.PI);
        pctx.closePath();
        pctx.fill();
        pctx.globalCompositeOperation = "source-over"; //change back to default
        //draw tank
        pctx.lineWidth = 7;
        pctx.save(); //save so later can restore
        //translate canvas to location of player so that the player is at 0,0 coordinates, allowing rotation around the center of player's body
        pctx.translate(pfpPlayerX, pfpPlayerY);
        pctx.rotate((45 * Math.PI) / 180); //rotate to barrel angle
        pctx.fillStyle = bodyColors.barrel.col;
        pctx.strokeStyle = bodyColors.barrel.outline;
        pctx.fillRect(-50 / 2, -90, 50, 90);
        pctx.strokeRect(-50 / 2, -90, 50, 90);
        pctx.restore();
        pctx.fillStyle = "#00B0E1";
        pctx.strokeStyle = "#0092C3";
        //pctx.lineWidth = 5;
        pctx.beginPath();
        pctx.arc(pfpPlayerX, pfpPlayerY, 50, 0, 2 * Math.PI);
        pctx.fill();
        pctx.stroke();
        //for editing account
        accountUsername.value = accountObject.name;
        accountPassword.value = accountObject.pw;
        accountDesc.value = accountObject.desc;
        document.getElementById("editAccount").style.display = "block";
      }
      else if (type=="pong"){
        //server reply after client ping to check latency
        latency = Date.now() - start;
        start = Date.now();
        sentBack = "yes";
      }
      else if (type=="game"){
        if(teleportingTransition=="yes"){//is teleporting, that's why re-connected
          teleportingTransition = "no";
          teleportingcount = 2.1;
        }
        let gameobjects = info[1];
        let serverruntime = info[2];
        let portalslist = info[3];
        let servertime = info[4];//server's time when send packet. note that server and client time is different


        //inflate the compressed game object list
        //server only compress if packet size exceeds 1kb
        //gameobjects = JSON.parse(pako.inflate(gameobjects, { to: 'string' }));

        //update variables
      oldportals = JSON.parse(JSON.stringify(portals));
        for (const property in portalslist) {
          if (portalslist[property] == "del") {
            //server tells client that a portal is not shown on the screen anymore
            delete portals[property];
          } else {
            if (!portals.hasOwnProperty(property)) {
              portals[property] = { ...portalslist[property] };
            } else {
              for (const propertyy in portalslist[property]) {
                portals[property][propertyy] =
                  portalslist[property][propertyy];
              }
            }
          }
        }
        //server doesnt send all the stuff that can be seen on your screen (will use a lot of bandwidth)
        //instead, it sends the changes made to the things already on your screen (delete, add, change stuff)
        //console.log(gameobjects)
        //console.log(portalslist)
        function loopobj(obj, actual){
          for (const propertyy in obj) {
                          if (
                            typeof obj[propertyy] === 'object' &&
                            !Array.isArray(obj[propertyy]) &&
                            obj[propertyy] !== null
                          ) {//property is an object
                            if (!actual.hasOwnProperty(propertyy)){
                              actual[propertyy] = {};
                            }
                            loopobj(obj[propertyy], actual[propertyy])
                          }
                          else if (obj[propertyy]=="del"){
                            delete actual[propertyy];
                          }
                          else{
                            actual[propertyy] = obj[propertyy];
                          }
                        }
        }
        
        oldobjects = JSON.parse(JSON.stringify(objects));
        prevServerUpdateTime = latestServerUpdateTime;
        //latestServerUpdateTime = Date.now();
        if (latestServerUpdateTime == 0){
          latestServerUpdateTime = Date.now();
        }
        else{
          latestServerUpdateTime += (servertime - oldservertime);
        }
        //console.log(Date.now() - latestServerUpdateTime)
        let diffTime = Date.now() - latestServerUpdateTime;
        if (diffTime < 0){
          latestServerUpdateTime = Date.now();
        }
        oldservertime = servertime;

        for (const type in gameobjects) {
          if (gameobjects[type]!="del"){
            for (const property in gameobjects[type]) {
              if (gameobjects[type][property] == "del") {
                //server tells client that an object is not shown on the screen anymore
                //add to list of dead objects
                if (objects[type][property]){//if we have the dead object info
                  let thisDeadObj = { ...objects[type][property] };
                  thisDeadObj.type = type;
                  thisDeadObj.id = property;
                  listofdeadobjects.push(thisDeadObj);
                }
                //delete actual object
                delete objects[type][property];
              } else {
                if (!(type in objects)) {
                  //new object
                  objects[type] = {};
                  objects[type][property] = {
                    ...gameobjects[type][property],
                  };
                } else if (!(property in objects[type])) {
                  //new object
                  objects[type][property] = {
                    ...gameobjects[type][property],
                  };
                } else {
                  //changed object
                  loopobj(gameobjects[type][property], objects[type][property])
                }
              }
            }
          }
          else{
            objects[type]  = {};
          }
        }
        if (objects.player){
          if (playerstring in objects.player) {
            if (oldtank!=player.tankType || oldbody!=player.bodyType){//tank changed
              if ((oldtank!=""&&oldbody!="")||gamelocation=="arena"||gamelocation=="tank-editor"||gamelocation=="cavern"){//particle when spawn only in these gamemodes
                //spawn particles when upgrade tank
                oldtank = player.tankType;
                oldbody = player.bodyType;
                slightshake = "yes";
                slightshakeIntensity = 1;
                let object = player;
                let playercolor = "";
                let playeroutline = "";
                if (object.team == "none") {
                  playercolor = bodyColors.blue.col;
                  playeroutline = bodyColors.blue.outline;
                } else if (bodyColors.hasOwnProperty(object.team)) {
                    playercolor = bodyColors[object.team].col;
                    playeroutline = bodyColors[object.team].outline;
                }
                if (object.developer == "yes") {//if a developer
                  playercolor = object.color;
                  playeroutline = object.outline;
                }
                for (let i = 0; i < 30; i++) {
                  let angleRadians = (Math.floor(Math.random() * 360) * Math.PI) / 180; //convert to radians
                  var randomDistFromCenter = Math.floor(Math.random() * player.width) - player.width/2;
                  radparticles[particleID] = {
                    angle: angleRadians,
                    x: player.x + randomDistFromCenter * Math.cos(angleRadians),
                    y: player.y - randomDistFromCenter * Math.sin(angleRadians),
                    width: player.width/6 + Math.floor(Math.random() * player.width/4),
                    height: player.width/6 + Math.floor(Math.random() * player.width/4),
                    speed: 3 + Math.floor(Math.random() * 3),
                    timer: 20 + Math.floor(Math.random() * 10),
                    maxtimer: 200,
                    color: playercolor,
                    outline: playeroutline,
                    type: "particle",
                  };
                  particleID++;
                }
              }
              else if (player.tankType && player.bodyType){
                oldtank = player.tankType;
                oldbody = player.bodyType;
              }
            }
            player = objects.player[playerstring]; //refers to the client's tank
          }
        }
        
          //console.log(objects)
        serverCodeTime = serverruntime;
        sentStuffBefore = "yes";
      }
      else if (type=="map"){//map size changed
        gameAreaSize = info[1];
      }
      else if (type=="pc"){//player count changed
        playerCount = info[1];
      }
      else if (type=="gpc"){//global player count changed
        globalPlayerCount = info[1];
      }
      else if (type=="lb"){//leaderboard changed
        players = info[1];
      }
      else if (type=="teams"){
        teamColors = [];
        teamColors.push(info[1]);
        teamColors.push(info[2]);
        if(info[3] !== undefined && info[4] !== undefined) {
        teamColors.push(info[3]);
        teamColors.push(info[4]);
        }
      }
      else if (type == "editedTank"){
        //user import scenexe tank code, so server send info for client to update the UI
        let player = info[1];
        //clear the UI
        $("#assetUI").empty()
        $("#bbUI").empty()
        $("#barrelUI").empty()
        barrelnumberid = 1;
        assetnumberid = 1;
        gadgetnumberid = 1;
        for (const barrelID in player.barrels){
          addCustomBarrelDiv(barrelID,player.barrels[barrelID])
        }
        for (const barrelID in player.bodybarrels){
          addCustomGadgetDiv(barrelID,player.bodybarrels[barrelID])
        }
        for (const barrelID in player.assets){
          addCustomAssetDiv(barrelID,player.assets[barrelID])
        }
        document.getElementById('weapon-fov').value = player.fovMultiplier;
        document.getElementById('body-health').value = player.maxhealth;
        document.getElementById('weapon-name').value = player.tankType;
        document.getElementById('body-name').value = player.bodyType;
        document.getElementById('tank-size').value = player.width;
        document.getElementById('body-speed').value = player.speed;
        document.getElementById('body-damage').value = player.damage;
        document.getElementById('body-regen').value = player.healthRegenSpeed;
        document.getElementById('body-regen-time').value = player.healthRegenTime;
        if (player.turretBaseSize){
          document.getElementById('turret-base').value = player.turretBaseSize;
        }
      }
      else if (type == "exportCode"){//user export tank as scenexe tank code
        let code = info[1];
        document.getElementById('import-code').value = code;
      }
      else if (type=="youDied"){
        let killer = info[1];
        let player = info[2];
        let respawnDivide = info[3];
        let respawnLimit = info[4];
        //when player died
        let skillissue = [
          "Skill issue",
          "Keyboard slamming time",
          "Gonna suggest a nerf?",
          "Maybe its just you",
          "Lag? Na",
          "You died!",
          "All things must come to an end eventually.",
          "That's unfortunate...",
          "Your score was not in vain",
          "Tanks for playing!",
          "Welcome to the death screen",
          "Here lies your grave.",
          "Game over.",
          "Try, try again!",
          "OOF",
          "How much wood would a woodchuck chuck?",
          "Did you really think that through?",
        ];
        let rando =
          skillissue[Math.floor(Math.random() * skillissue.length)]; //random death screen text
        sentStuffBefore = "no";
        //DEATH SCREEN
        gameStart = -1;//ensure that hctx canvas doesnt clear
        hctx.clearRect(0, 0, hcanvas.width, hcanvas.height);
        hctx.fillStyle = "rgba(0,0,0,.5)";
        hctx.fillRect(0, 0, hcanvas.width, hcanvas.height); //drawing background
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 5;
        hctx.font = "900 60px Roboto";
        hctx.textAlign = "center";
        hctx.save();
        hctx.translate(hcanvas.width / 2, hcanvas.height / 4)
        let resizeDiffX = 1/window.innerWidth*hcanvas.width;
        let resizeDiffY = 1/window.innerHeight*hcanvas.height;
        hctx.scale(1,resizeDiffY/resizeDiffX)
        hctx.strokeText(rando, 0, 0);
        hctx.fillText(rando, 0, 0);
        hctx.font = "700 30px Roboto";
        if (typeof killer == "number") {
          //killer is a number, which is numer of sides of a shape
          killer = shapecolors[killer].name;
        }
        hctx.strokeText(
          "You were killed by " + killer,
          0,
          80
        );
        hctx.fillText(
          "You were killed by " + killer,
          0,
          80
        );
        hctx.restore();
        //ABBREVIATE SCORE, e.g. 6000 -> 6k
        //player's score is not abbreviated because need to do calculations using the number, and server might get laggy if it need to abbreviate everyone's score, so abbreviating score is done in client side code
        var newValue = player.score;
        if (player.score >= 1000) {
          var suffixes = ["", "k", "m", "b", "t"];
          var suffixNum = Math.floor(("" + player.score).length / 3);
          var shortValue = "";
          for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat(
              (suffixNum != 0
                ? player.score / Math.pow(1000, suffixNum)
                : player.score
              ).toPrecision(precision)
            );
            var dotLessShortValue = (shortValue + "").replace(
              /[^a-zA-Z 0-9]+/g,
              ""
            );
            if (dotLessShortValue.length <= 2) {
              break;
            }
          }
          if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
          newValue = shortValue + suffixes[suffixNum];
        }
        let timeplayed = Date.now() - startPlayTime;
        function formatSeconds(seconds) {
            var date = new Date(1970,0,1);
            date.setSeconds(seconds);
            return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
        }
        timeplayed = new Date(timeplayed * 1000).toISOString().substring(11, 16);//get hour-minute-second format
        hctx.font = "700 25px Roboto";
        hctx.save();
        hctx.translate(hcanvas.width / 2, hcanvas.height / 1.6)
        hctx.scale(1,resizeDiffY/resizeDiffX)
        hctx.strokeText(
          "Level " +
            player.level +
            " " +
            player.tankType +
            "-" +
            player.bodyType,
          0,
          30
        );
        hctx.fillText(
          "Level " +
            player.level +
            " " +
            player.tankType +
            "-" +
            player.bodyType,
          0,
          30
        );
        hctx.strokeText(
          "Time Played: " + timeplayed,
          0,
          90
        );
        hctx.fillText(
          "Time Played: " + timeplayed,
          0,
          90
        );
        hctx.strokeText(
          "Score: " + newValue + " (" + player.score + ")",
          0,
          130
        );
        hctx.fillText(
          "Score: " + newValue + " (" + player.score + ")",
          0,
          130
        );
        hctx.restore();
        continueButton.style.display = "block";
        //calculating respawn score, change this if server caculation changes
        var respawningScore = 0;
        if (player.score > 0) {
          //if player didnt die at 0 score
          respawningScore = Math.round(player.score / respawnDivide);
          if (respawningScore > respawnLimit) {
            respawningScore = respawnLimit;
          }
        }
        document.getElementById("respawnScoreDiv").innerHTML =
          "Respawning at " + respawningScore + " score";
        document.getElementById("chat").style.display = "none";
        //hide all the editor UI
        tankEditor1.style.display = "none";
        tankEditor2.style.display = "none";
        barrelEditor.style.display = "none";
        assetEditor.style.display = "none";
        bbEditor.style.display = "none";
        //reset player state values
        autorotate = "no";
        autofire = "no";
        fastautorotate = "no";
        passivemode = "no";
        //reset upgrade ignore
        ignorebuttonw.ignore = "no";
        ignorebuttonb.ignore = "no";
      }
      else if (type=="teleport"){//server tells player that it successfully teleported, so need to connect to the server for the new dimension
        let dimension = info[1];
        prevplayerstring = playerstring;
        //reset object list when teleport
        portals = {};
        oldportals = {};
        objects = {
          wall: {},//walls drawn below everything
          gate: {},
          Fixedportal: {},
          shape: {},
          bot: {},
        };//specifically shapes and bots so they would be below players, fixed portals always under everything
        teleportingTransition = "yes";
        oldteleportingLocation = gamelocation;
        teleportingLocation = dimension;
        teleportingcount = 0;
        if (dimension=="dune"){
          socket.close();//disconnect from current server
          connectServer(serverlist.dune,"yes")
          gamelocation = "dune";
        }
        else if (dimension=="sanc"){
          socket.close();//disconnect from current server
          connectServer(serverlist.sanc,"yes")
          gamelocation = "sanctuary";
        }
        else if (dimension=="cavern"){
          socket.close();//disconnect from current server
          connectServer(serverlist.cavern,"yes")
          gamelocation = "cavern";
        }
        else if (dimension=="cr"){
          socket.close();//disconnect from current server
          connectServer(serverlist.cr,"yes")
          gamelocation = "crossroads"
        }
        else if (dimension=="arena"){
          socket.close();//disconnect from current server
          connectServer(serverlist["Free For All"],"yes")
          gamelocation = "arena";
        }
        else if (dimension=="editor"){ // test
          socket.close();//disconnect from current server
          connectServer('wss://rock-it-6.glitch.me/',"yes")
          gamelocation = "arena";
        }
        else if (dimension=="2tdm"){
          socket.close();//disconnect from current server
          connectServer(serverlist["2 Teams"],"yes")
          gamelocation = "2tdm";
        }
        else if (dimension=="4tdm"){
          socket.close();//disconnect from current server
          connectServer(serverlist["4 Teams"],"yes")
          gamelocation = "4tdm";
        }
      }
    };

    // Listen for socket closes
    socket.onclose = function(event) {
      console.log('Disconnected: ',event);
      if (reconnectToDefault != "yes"){//if not purposely disconnecting to respawn in ffa
        if (teleportingTransition != "yes" && currentGmSelector.prevgamemode == currentGmSelector.gamemode && currentGmSelector.gamemode != 3){//if not teleporting, and not switching gamemodes
          //disconnect notification
          //when socket disconnect, this is automatically triggered
          createNotif("Disconnected. Reload the page.","rgb(150,0,0)",10000)
          exitDeathScreen();
          connected = "no";
          playButton.style.display = "none";
          nameInput.style.display = "none";
        }
      }
      else{
        reconnectToDefault = "no";
      }
    };
    socket.onerror = function(err) {
      console.error('Socket error: ', err.message);
      //connection error
      createNotif("Connection error: "+err.message,"rgb(150,0,0)",10000)
      //socket.close();
      exitDeathScreen();
      connected = "no";
      playButton.style.display = "none";
      nameInput.style.display = "none";
      //socket = new WebSocket(whichserver);//try to reconnect
    };
    // To close the socket: socket.close()
  }
  }
  connectServer(serverlist["Free For All"],"no")
  gamemodeBgFoV[currentGmSelector.gamemode] = 0.1;


  //GAME CANVAS
  var canvas = document.getElementById("game");
  canvas.width = 1920;
  canvas.height = 1080; //fixed width and height so that all users regardless of screen size will see the same thing, a bigger fixed size will result in greater field of vision for users but also clearer image on a large screen when html stretches the canvas to fit the screen (because in the css code above we made the canvas width and height as 100%)
  //NOTE: if you change the canvas width and height, also must change in server code at the part at the end of the game loop

  //calculating canvas resizing for different screen sizes
  //remember to fix buttons afterwards
  //window.innerWidth
  canvasResizing();
  canvas.width = 1920;
  canvas.height = 1080;

  var ctx = canvas.getContext("2d");
  //HOME PAGE CANVAS
  //there are two canvas: one is this canvas, and the other is the game canvas
  //the game canvas draws the game, and might not be able to see the entire thing as it resizes to make sure it's porportional
  //this canvas draws the home page, death screen, and other things, which requires the entire canvas to be seen
  var hcanvas = document.getElementById("homePage");
  hcanvas.width = 1920;
  hcanvas.height = 1080;
  var hctx = hcanvas.getContext("2d");

  var continueButton = document.getElementById("continue");
  var playButton = document.getElementById("play");
  var nameInput = document.getElementById("gamename");
  //when continue button clicked after player died, or press enter on death screen
  var joinedWhichGM = "Free For All";
  function exitDeathScreen(){
    gameStart = 0; //reset canvas
    playButton.style.display = "block";
    nameInput.style.display = "block";
    document.body.appendChild(changelogbutton);
    document.body.appendChild(settingsbutton);
    document.body.appendChild(wrlbbutton);
    document.body.appendChild(howToPlaybutton);
    accountsbutton.style.display = "block";
    document.body.appendChild(discordbutton);
    document.body.appendChild(tokeninput);
    document.body.appendChild(redditbutton);
    document.getElementById("advert").style.display = "block";
    document.getElementById("featuredyoutuber").style.display = "block";
    document.getElementById("changelogDisplay").style.display = "block";
    document.getElementById("subtitle").style.display = "block";
    document.getElementById("menuTitle").style.display = "block";
    continueButton.style.display = "none";
    document.getElementById("respawnScoreDiv").style.display = "block";
    if (shownEditButton=="yes"){
      document.getElementById("openEditor").style.display = "none";
      shownEditButton = "no";
    }
    //connect to arena
    reconnectToDefault = "yes";//prevent disconnect notification
    socket.close();//disconnect from current server
    connectServer(serverlist[joinedWhichGM],"no")//join the gamemode which you spawned in. If you spawned in FFA and died in 2tdm, you can only respawn in FFA
    if (joinedWhichGM == "Free For All"){
          gamelocation = "arena"
        }
        else if (joinedWhichGM == "2 Teams"){
          gamelocation = "2tdm"
        }
        else if (joinedWhichGM == "4 Teams"){
          gamelocation = "4tdm"
        }
        else if (joinedWhichGM == "Tank Editor"){
          gamelocation = "tank-editor"
        }
  };

  //list of buttons outside function so that can access in mouse event listeners below function
  //button 1 to 7 are weapon upgrades, 8 to 14 are body upgrades
  var upgradeButtons = {
    1: {
      x: canvas.width + 315, //poition changes when animating
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: canvas.width + 315, //start position for animating button movement (start position)
      endx: canvas.width - 75, //end position
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "255,228,107",
      darkcolor: "225,198,77",
    },
    2: {
      x: canvas.width + 195,
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: canvas.width + 195,
      endx: canvas.width - 195,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "252,118,118",
      darkcolor: "222,88,88",
    },
    3: {
      x: canvas.width + 75,
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: canvas.width + 75,
      endx: canvas.width - 315,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "118,140,252",
      darkcolor: "88,110,222",
    },
    4: {
      x: canvas.width + 315,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: canvas.width + 315,
      endx: canvas.width - 75,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "252,166,68",
      darkcolor: "222,136,38",
    },
    5: {
      x: canvas.width + 195,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: canvas.width + 195,
      endx: canvas.width - 195,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "56,183,100",
      darkcolor: "26,153,70",
    },
    6: {
      x: canvas.width + 75,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: canvas.width + 75,
      endx: canvas.width - 315,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "74,102,189",
      darkcolor: "44,72,159",
    },
    7: {
      x: canvas.width + 315,
      y: canvas.height - 445,
      width: 100,
      hover: "no",
      startx: canvas.width + 315,
      endx: canvas.width - 75,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "93,39,93",
      darkcolor: "63,9,63",
    },
    8: {
      x: -315, //poition changes when animating
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: -315, //start position for animating button movement (start position)
      endx: 75, //end position
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "255,228,107",
      darkcolor: "225,198,77",
    },
    9: {
      x: -195,
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: -195,
      endx: 195,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "252,118,118",
      darkcolor: "222,88,88",
    },
    10: {
      x: -75,
      y: canvas.height - 205,
      width: 100,
      hover: "no",
      startx: -75,
      endx: 315,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "118,140,252",
      darkcolor: "88,110,222",
    },
    11: {
      x: -315,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: -315,
      endx: 75,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "252,166,68",
      darkcolor: "222,136,38",
    },
    12: {
      x: -195,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: -195,
      endx: 195,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "56,183,100",
      darkcolor: "26,153,70",
    },
    13: {
      x: -75,
      y: canvas.height - 325,
      width: 100,
      hover: "no",
      startx: -75,
      endx: 315,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "74,102,189",
      darkcolor: "44,72,159",
    },
    14: {
      x: -315,
      y: canvas.height - 445,
      width: 100,
      hover: "no",
      startx: -315,
      endx: 75,
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      tankRotate: 0,
      color: "93,39,93",
      darkcolor: "63,9,63",
    },
  };
  var ignorebuttonw = {
      x: -1000,
      y: -1000,
      width: 100,
      height: 40,
      hover: "no",
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      color: "255,228,107",
      darkcolor: "225,198,77",
      ignore: "no",
    };
  var ignorebuttonb = {
      x: -1000,
      y: -1000,
      width: 100,
      height: 40,
      hover: "no",
      brightness: 0,
      defaultwidth: 100,
      animatedwidth: 120,
      color: "255,228,107",
      darkcolor: "225,198,77",
      ignore: "no",
    };
  //store tank info from server
  var buttonTank = {1:{},2:{},3:{},4:{},5:{},6:{},7:{},8:{},9:{},10:{},11:{},12:{},13:{},14:{},};
  var prevPlayerLvl = -2; //weapon upgrade tier
  var prevPlayerLvlb = -2; //body upgrade tier
  var howManyButtonSentToClient = 0;
  var howManyButtonSentToClientb = 0;
  var howManyButtonSentToServer = 0; //weapon upgrade
  var howManyButtonSentToServerb = 0; //body upgrade
  var didAnyButtonDraw = "no";
  var barScore = 0; //for score progress bar
  var auraWidth = 0;
  var newaurawidth = 0;
  var auraRotate = 0; //for radiant shape aura size increase
//  var newauraWidthDirection = "increasing";
//  var auraWidthDirection = "increasing";
  var extraSpikeRotate = 0;
  var extraSpikeRotate1 = 0;
  var extraSpikeRotate2 = 360;
  var clientFovMultiplier = 1;
  var listofdeadobjects = []; //animate dead objects
  //stuff needed for drawing canvas
  var playerstring = "error";
  var prevplayerstring = "error";
  var playerCount = "error";
  var globalPlayerCount = "error";
  var portals = {};
  var oldportals = {};
  var gamelocation = "arena";
  var shakeYN = "error";//portal screen shake
  var shakeIntensity = 1;
  var slightshake = "no";//spawn/upgrade screen shake
  var slightshakeIntensity = 1;
  var players = "error";
  var player = "error";
  var gameAreaSize = "error";
  var objects = {};
  var oldobjects = {};//for client interpolation
  var interpolatedobjects = {};
  var prevServerUpdateTime = Date.now();
  var latestServerUpdateTime = 0;
  var oldservertime = 0;
  var serverCodeTime = "error";
  var sentStuffBefore = "no";
  var latency = "Checking latency...";
  var start;
  var showDebug = "yes";
  var showHitBox = "no";
  var shownBandwidth = 0; //bandwidth that is shown, updates every second
  var bandwidth = 0; //size of packet sent from server
  var prevBandwidthUpdate = 0; //previous time that bandwidth was updated
  //particles are completely clientside to reduce server lag (cuz cavern would have 300+ particles)
  var radparticles = {}; //particle effect for radiants
  var portalparticles = {}; //prticle effect for portals
  var particleID = 0;
  //for death screen
  var startPlayTime = 0;
  //for mobile
  var joystick1 = {
    //movement joystick on the left
    size: 100,
    xFromCenter: -500,
    yFromCenter: 150,
  };
  var joystick2 = {
    //shooting joystick on the right
    size: 100,
    xFromCenter: 500,
    yFromCenter: 150,
  };
  var touches = {
    0: {
      state: "no",
      x: "no",
      y: "no",
      angle: "no",
      dir: 0,
      oldangle: "no",
    },
    1: {
      state: "no",
      x: "no",
      y: "no",
      angle: "no",
      dir: 0,
      oldangle: "no",
    },
  };

  let shootBarrelMax = 100;//reduce this value for a larger shooting height change

  function drawBulletBarrel(canvas, x,width,height,shootChange, fov){//shootchange is change in barrel height when shooting
    canvas.fillRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,//divided by 50 times height so that smaller barrels have less height change
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.strokeRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
  }

  function drawDroneTurret(canvas, x,width,shootChange, fov){//shootchange is change in barrel height when shooting
    canvas.fillRect(
      (x - (width - shootChange/shootBarrelMax*width) / 2) / fov,
      -(width - shootChange/shootBarrelMax*width)/2 / fov,//divided by 50 times height so that smaller barrels have less height change
      (width - shootChange/shootBarrelMax*width) / fov,
      (width - shootChange/shootBarrelMax*width) / fov
    );
    canvas.strokeRect(
      (x - (width - shootChange/shootBarrelMax*width) / 2) / fov,
      -(width - shootChange/shootBarrelMax*width)/2 / fov,//divided by 50 times height so that smaller barrels have less height change
      (width - shootChange/shootBarrelMax*width) / fov,
      (width - shootChange/shootBarrelMax*width) / fov
    );
  }

  function drawDroneBarrel(canvas, x,width,height,shootChange, fov){
    canvas.beginPath();
    canvas.moveTo(
      -width / 2 / fov +
        x / fov,
      0
    );
    canvas.lineTo(
      -width / fov +
        x / fov,
      -(height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.lineTo(
      width / fov +
        (x * 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.lineTo(
      width / 2 / fov +
        (x * 2) / fov,
      0
    );
    canvas.fill();
    canvas.stroke();
  }

  function drawTrapBarrel(canvas, x,width,height,shootChange, fov){
    canvas.fillRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
    canvas.strokeRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
    canvas.beginPath();
    canvas.moveTo(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
    canvas.lineTo(
      (x - width) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.lineTo(
      (x + width) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.lineTo(
      (x + width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
    canvas.fill();
    canvas.stroke();
  }

  function drawMineBarrel(canvas, x,width,height,shootChange, fov){
    canvas.fillRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.strokeRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.fillRect(
      (-width * 1.5) / 2 / fov + x / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
    canvas.strokeRect(
      (-width * 1.5) / 2 / fov + x / fov,
      -(height - shootChange/shootBarrelMax*height) * 0.67 / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) * 0.67 / fov
    );
  }

  function drawMinionBarrel(canvas, x,width,height,shootChange, fov){
    canvas.fillRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.strokeRect(
      (x - width / 2) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      width / fov,
      (height - shootChange/shootBarrelMax*height) / fov
    );
    canvas.fillRect(
      (x - width * 0.75) / fov,
      -(height - shootChange/shootBarrelMax*height) / 1.5 / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) / 1.5 / fov
    );
    canvas.strokeRect(
      (x - width * 0.75) / fov,
      -(height - shootChange/shootBarrelMax*height) / 1.5 / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) / 1.5 / fov
    );
    canvas.fillRect(
      (x - width * 0.75) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) / 5 / fov
    );
    canvas.strokeRect(
      (x - width * 0.75) / fov,
      -(height - shootChange/shootBarrelMax*height) / fov,
      (width / fov) * 1.5,
      (height - shootChange/shootBarrelMax*height) / 5 /fov
    );
  }
  function drawAsset(asset,bodysize,color,outline,canvas){
    if (asset.hasOwnProperty("angle")) {
      if (asset.angle != 0) {
        canvas.rotate((asset.angle * Math.PI) / 180);
      }
    }
    canvas.translate(bodysize * asset.x, bodysize * asset.y);
    canvas.fillStyle = color;
    canvas.strokeStyle = outline;
    if (asset.sides == 0) {
      canvas.beginPath();
      canvas.arc(0, 0, bodysize * asset.size, 0, 2 * Math.PI);
      canvas.fill();
      canvas.stroke();
    } else if (asset.sides < 0) {//draw a star
      let numberOfSpikes = -asset.sides;
      let outerRadius = bodysize * asset.size;
      let innerRadius = (bodysize * asset.size / 2);
      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      canvas.beginPath();
      canvas.moveTo(0, -outerRadius);
      for (i = 0; i < numberOfSpikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        canvas.lineTo(x, y);
        rot += Math.PI / numberOfSpikes;
        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        canvas.lineTo(x, y);
        rot += Math.PI / numberOfSpikes;
      }
      canvas.lineTo(0, -outerRadius);
      canvas.closePath();
      canvas.fill();
      canvas.stroke();
    } else {
      canvas.beginPath();
      var baseSides = asset.sides;
      canvas.moveTo(bodysize * asset.size * Math.cos(0), bodysize * asset.size * Math.sin(0));
      for (var i = 1; i <= baseSides; i++) {
        canvas.lineTo(
          bodysize * asset.size * Math.cos((i * 2 * Math.PI) / baseSides),
          bodysize * asset.size * Math.sin((i * 2 * Math.PI) / baseSides)
        );
      }
      canvas.closePath();
      canvas.fill();
      canvas.stroke();
    }
    canvas.translate(-bodysize * asset.x, -bodysize * asset.y);
    if (asset.hasOwnProperty("angle")) {
      if (asset.angle != 0) {
        canvas.rotate((-asset.angle * Math.PI) / 180);
      }
    }
  }
  function hctxroundRectangle(x,y,r,w,h){
    hctx.beginPath();
    hctx.moveTo(x + r, y);
    hctx.arcTo(x + w, y, x + w, y + h, r);
    hctx.arcTo(x + w, y + h, x, y + h, r);
    hctx.arcTo(x, y + h, x, y, r);
    hctx.arcTo(x, y, x + w, y, r);
    hctx.closePath();
    hctx.stroke(); //MUST stroke first, or else the rectangle drawn in code below wil cover part of the stroke
    hctx.fill();
  }
  function ctxroundRectangle(x,y,r,w,h){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.stroke(); //MUST stroke first, or else the rectangle drawn in code below wil cover part of the stroke
    ctx.fill();
  }
  function hctxroundRectangleFill(x,y,r,w,h){//only fill
    hctx.beginPath();
    hctx.moveTo(x + r, y);
    hctx.arcTo(x + w, y, x + w, y + h, r);
    hctx.arcTo(x + w, y + h, x, y + h, r);
    hctx.arcTo(x, y + h, x, y, r);
    hctx.arcTo(x, y, x + w, y, r);
    hctx.closePath();
    hctx.fill();
  }
  function ctxroundRectangleFill(x,y,r,w,h){//only fill
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function drawPlayer(canvas, object, fov, spawnProtect, playercolor, playeroutline, eternal, objectangle, id){//only barrels and body (no heath bars, names, and chats)
    //objectangle refers to angle rotated before triggering this function
    //fov is clientFovMultiplier for ctx, hctx is 1
      canvas.lineJoin = "round"; //make nice round corners
      //draw assets below body, e.g. rammer body base
      for (assetID in object.assets){
        var asset = object.assets[assetID];
        if (asset.type == "under") {
          let assetcolor = asset.color;
          let assetoutline = asset.outline;
          canvas.lineWidth = asset.outlineThickness / fov;
          if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
            assetcolor = playercolor;
          }
          if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
            assetoutline = playeroutline;
          }
          drawAsset(asset,object.width/fov,assetcolor,assetoutline,canvas)
        }
      }

      //draw barrel
      canvas.lineWidth = 4 / fov;
      //weapon barrels
      for (barrel in object.barrels){
        let thisBarrel = object.barrels[barrel];
        canvas.rotate((thisBarrel.additionalAngle * Math.PI) / 180); //rotate to barrel angle
        canvas.fillStyle = bodyColors.barrel.col;
        canvas.strokeStyle = bodyColors.barrel.outline;
        if (spawnProtect == "yes") {
          //if have spawn protection
          canvas.fillStyle = bodyColors.barrel.hitCol;
          canvas.strokeStyle = bodyColors.barrel.hitOutline;
        }
        //lerp barrel animation
        let oldbarrelheight;
        try{
          oldbarrelheight = oldobjects.player[id].barrels[barrel].barrelHeightChange;
        }
        catch(err){}
        let lerpedheight = thisBarrel.barrelHeightChange;
        if (oldbarrelheight){
          lerpedheight = oldbarrelheight + (thisBarrel.barrelHeightChange - oldbarrelheight)/updateInterval*(Date.now() - latestServerUpdateTime);
        }
        //bullet barrel
        //note: barrelHeightChange refers to reduction in barrel height for barrel animation when shooting
        if (thisBarrel.barrelType == "bullet") {
          drawBulletBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //drone barrel
        else if (thisBarrel.barrelType == "drone") {
          drawDroneBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //trap barrel
        else if (thisBarrel.barrelType == "trap") {
          drawTrapBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //mine barrel
        else if (thisBarrel.barrelType == "mine") {
          drawMineBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //minion barrel
        else if (thisBarrel.barrelType == "minion") {
          drawMinionBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        canvas.rotate((-thisBarrel.additionalAngle * Math.PI) / 180); //rotate back
      }

      //draw player body
      canvas.fillStyle = playercolor;
      canvas.strokeStyle = playeroutline;
      if (object.rad > 0){//rad player
        if (!radiantShapes.hasOwnProperty(id)) {
          var randomstate = Math.floor(Math.random() * 3); //randomly choose a color state for the radiant shape to start (if not when you spawn in cavern, all shapes same color)
          var randomtype = Math.floor(Math.random() * 2) + 1; //choose animation color type (1 or 2)
          if (randomtype == 1) {
            if (randomstate == 0) {
              radiantShapes[id] = {
                red: 255,
                blue: 0,
                green: 0,
                rgbstate: 1,
                radtype: randomtype,
              }; //keep track of radiant shape colors (done in client code)
            } else if (randomstate == 1) {
              radiantShapes[id] = {
                red: 199,
                blue: 0,
                green: 150,
                rgbstate: 2,
                radtype: randomtype,
              };
            } else if (randomstate == 2) {
              radiantShapes[id] = {
                red: -1,
                blue: 200,
                green: 0,
                rgbstate: 3,
                radtype: randomtype,
              };
            }
          } else {
            if (randomstate == 0) {
              radiantShapes[id] = {
                red: 118,
                blue: 168,
                green: 151,
                rgbstate: 1,
                radtype: randomtype,
              };
            } else if (randomstate == 1) {
              radiantShapes[id] = {
                red: 209,
                blue: 230,
                green: 222,
                rgbstate: 2,
                radtype: randomtype,
              };
            } else if (randomstate == 2) {
              radiantShapes[id] = {
                red: 234,
                blue: 240,
                green: 180,
                rgbstate: 3,
                radtype: randomtype,
              };
            }
          }
        }
        object.red = radiantShapes[id].red;
        object.blue = radiantShapes[id].blue;
        object.green = radiantShapes[id].green;
        let radiantAuraSize = document.getElementById("sizevalue").innerHTML * auraWidth;
        //calculate color of spikes, which would be 20 higher than actual rgb value
        if (object.red + 150 <= 255) {
          var spikeRed = object.red + 150;
        } else {
          var spikeRed = 255;
        }
        if (object.blue + 150 <= 255) {
          var spikeBlue = object.blue + 150;
        } else {
          var spikeBlue = 255;
        }
        if (object.green + 150 <= 255) {
          var spikeGreen = object.green + 150;
        } else {
          var spikeGreen = 255;
        }
        if (object.rad == 3) {
          //for high rarity radiant shapes, draw spikes
          canvas.rotate((extraSpikeRotate * Math.PI) / 180);
          canvas.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          canvas.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 6;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / fov) *
            0.75;
          var innerRadius = (object.width / fov) * 0.75;

          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;

          canvas.beginPath();
          canvas.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          canvas.lineTo(0, 0 - outerRadius);
          canvas.closePath();
          canvas.lineWidth = 3 / fov;
          canvas.fill();
          canvas.stroke();
          canvas.rotate((-extraSpikeRotate * Math.PI) / 180);
        } else if (object.rad == 4) {
          //for high rarity radiant shapes, draw spikes
          canvas.rotate((extraSpikeRotate1 * Math.PI) / 180);
          canvas.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          canvas.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 3;
          var outerRadius =
            (object.width * radiantAuraSize * 3) / fov;
          var innerRadius = (object.width / fov) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          canvas.beginPath();
          canvas.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          canvas.lineTo(0, 0 - outerRadius);
          canvas.closePath();
          canvas.lineWidth = 3 / fov;
          canvas.fill();
          canvas.stroke();
          canvas.rotate((-extraSpikeRotate1 * Math.PI) / 180);
          canvas.rotate((extraSpikeRotate2 * Math.PI) / 180);
          var numberOfSpikes = 6;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / fov) *
            0.5;
          var innerRadius = (object.width / fov) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          canvas.beginPath();
          canvas.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          canvas.lineTo(0, 0 - outerRadius);
          canvas.closePath();
          canvas.lineWidth = 3 / fov;
          canvas.fill();
          canvas.stroke();
          canvas.rotate((-extraSpikeRotate2 * Math.PI) / 180);
        } else if (object.rad == 5) {
          //for high rarity radiant shapes, draw spikes
          canvas.rotate((extraSpikeRotate1 * Math.PI) / 180);
          canvas.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          canvas.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 3;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / fov) *
            1.5;
          var innerRadius = (object.width / fov) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          canvas.beginPath();
          canvas.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          canvas.lineTo(0, 0 - outerRadius);
          canvas.closePath();
          canvas.lineWidth = 3 / fov;
          canvas.fill();
          canvas.stroke();
          canvas.rotate((-extraSpikeRotate1 * Math.PI) / 180);
          canvas.rotate((extraSpikeRotate2 * Math.PI) / 180);
          var numberOfSpikes = 3;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / fov) *
            0.5;
          var innerRadius = (object.width / fov) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          canvas.beginPath();
          canvas.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            canvas.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          canvas.lineTo(0, 0 - outerRadius);
          canvas.closePath();
          canvas.lineWidth = 3 / fov;
          canvas.fill();
          canvas.stroke();
          canvas.rotate((-extraSpikeRotate2 * Math.PI) / 180);
        }

        //old code where aura have shape
        canvas.fillStyle =
          "rgba(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ", 0.3)";
        canvas.strokeStyle =
          "rgba(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ", 0.3)";
        canvas.lineWidth = 3 / fov;
        canvas.beginPath();

        let shapeaurasize = object.rad;
        if (shapeaurasize > 3) {
          shapeaurasize = 3; //prevent huge auras
        }
        canvas.beginPath();
        canvas.arc(0, 0, object.width * radiantAuraSize * shapeaurasize / fov, 0, 2 * Math.PI);
        canvas.fill();
        canvas.stroke();
        var shadeFactor = 3 / 4; //smaller the value, darker the shade
        canvas.strokeStyle =
          "rgb(" +
          object.red * shadeFactor +
          ", " +
          object.green * shadeFactor +
          ", " +
          object.blue * shadeFactor +
          ")";
        canvas.fillStyle =
          "rgb(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ")";
        if (object.hit > 0) {
          //if shape is hit
          canvas.strokeStyle =
            "rgb(" +
            (object.red * shadeFactor + 20) +
            ", " +
            (object.green * shadeFactor + 20) +
            ", " +
            (object.blue * shadeFactor + 20) +
            ")";
          canvas.fillStyle =
            "rgb(" +
            (object.red + 20) +
            ", " +
            (object.green + 20) +
            ", " +
            (object.blue + 20) +
            ")";
        }

        //choose whether a particle would spawn
        //particle spawn chance based on number of sides the shape has, so square has less particles
        if (spawnradparticle == "yes"){
          var chooseValue = 20 - object.sides * 2; //lower the number means more particles spawned
          if (chooseValue < 5) {
            //5 refers to mimimum particle spawn chance
            chooseValue = 5;
          }
          if (object.radtier == 4){
            chooseValue -= 2;
          }
          else if (object.radtier == 5){
            chooseValue -= 3;
          }
          var choosing = Math.floor(Math.random() * chooseValue); //choose if particle spawn
          if (choosing == 1) {
            //spawn a particle
            var angleDegrees = Math.floor(Math.random() * 360); //choose angle in degrees
            var angleRadians = (angleDegrees * Math.PI) / 180; //convert to radians
            var randomDistFromCenter =
              Math.floor(Math.random() * object.width * 2) - object.width;
            radparticles[particleID] = {
              angle: angleRadians,
              x: object.x + randomDistFromCenter * Math.cos(angleRadians),
              y: object.y + randomDistFromCenter * Math.sin(angleRadians),
              width: 5,
              height: 5,
              speed: 1,
              timer: 25,
              maxtimer: 25,
              color:
                "rgba(" +
                object.red +
                "," +
                object.green +
                "," +
                object.blue +
                ",.5)",
              outline:
                "rgba(" +
                (object.red* shadeFactor + 20) +
                "," +
                (object.green* shadeFactor + 20) +
                "," +
                (object.blue* shadeFactor + 20) +
                ",.5)",
              type: "particle",
            };
            if (object.radtier == 4){
              radparticles[particleID].width = Math.floor(Math.random() * 10) + 5;
            }
            else if (object.radtier == 5){
              radparticles[particleID].width = Math.floor(Math.random() * 20) + 5;
              radparticles[particleID].speed = 3;
              radparticles[particleID].timer = 50;
              radparticles[particleID].maxtimer = 50;
            }
            particleID++;
          }
        }
      } // end of rad player code
      if (eternal == "no") {
        //not a tier 6 tank
        if(object.width >= 0) {
          if (!object.sides){
            canvas.beginPath();
            canvas.arc(0, 0, object.width / fov, 0, 2 * Math.PI);
            canvas.fill();
            canvas.stroke();
          }
          else{
            if (object.sides >= 0){
              let baseSides = object.sides;
              //rotate to fix weird angle
              if (baseSides == 3){
                canvas.rotate(30 * Math.PI / 180);
              }
              else if (baseSides == 4){
                canvas.rotate(45 * Math.PI / 180);
              }
              else if (baseSides == 5){
                canvas.rotate(17.5 * Math.PI / 180);
              }
              else if (baseSides == 7){
                canvas.rotate(40 * Math.PI / 180);
              }
              else if (baseSides == 9){
                canvas.rotate(12 * Math.PI / 180);
              }
              canvas.beginPath();
              canvas.moveTo((object.width / fov), 0);
              for (var i = 1; i <= baseSides; i++) {
                canvas.lineTo((object.width / fov) * Math.cos((i * 2 * Math.PI) / baseSides), (object.width / fov) * Math.sin((i * 2 * Math.PI) / baseSides));
              }
              canvas.fill();
              canvas.stroke();
              if (baseSides == 3){
                canvas.rotate(-30 * Math.PI / 180);
              }
              else if (baseSides == 4){
                canvas.rotate(-45 * Math.PI / 180);
              }
              else if (baseSides == 5){
                canvas.rotate(-17.5 * Math.PI / 180);
              }
              else if (baseSides == 7){
                canvas.rotate(-40 * Math.PI / 180);
              }
              else if (baseSides == 9){
                canvas.rotate(-12 * Math.PI / 180);
              }
            }
            else{
              let numberOfSpikes = -object.sides;
              let outerRadius = object.width / fov;
              let innerRadius = (object.width / fov / 2);
              let rot = (Math.PI / 2) * 3;
              let x = 0;
              let y = 0;
              canvas.beginPath();
              canvas.moveTo(0, -outerRadius);
              for (i = 0; i < numberOfSpikes; i++) {
                x = Math.cos(rot) * outerRadius;
                y = Math.sin(rot) * outerRadius;
                canvas.lineTo(x, y);
                rot += Math.PI / numberOfSpikes;
                x = Math.cos(rot) * innerRadius;
                y = Math.sin(rot) * innerRadius;
                canvas.lineTo(x, y);
                rot += Math.PI / numberOfSpikes;
              }
              canvas.lineTo(0, -outerRadius);
              canvas.closePath();
              canvas.fill();
              canvas.stroke();
            }
          }
        }
      } else {
        //if a tier 6 tank
        canvas.beginPath();
        let baseSides = 6;
        canvas.moveTo((object.width / fov), 0);
        for (var i = 1; i <= baseSides; i++) {
          canvas.lineTo((object.width / fov) * Math.cos((i * 2 * Math.PI) / baseSides), (object.width / fov) * Math.sin((i * 2 * Math.PI) / baseSides));
        }
        canvas.fill();
        canvas.stroke();
      }

      //barrels in body upgrade
      for (barrel in object.bodybarrels){
        let thisBarrel = object.bodybarrels[barrel];
//lerp barrel angle
        let oldangle;
        try{
          oldangle = oldobjects.player[id].bodybarrels[barrel].additionalAngle;
        }
        catch(err){}
        let newangle = thisBarrel.additionalAngle;
        let lerpedAngle = newangle;
        if (oldangle){
          if ((oldangle - newangle)>5.25){//angle went from 360 to 0
            oldangle-=2*Math.PI;
          }
          else if ((newangle - oldangle)>5.25){//angle went from 0 to 360
            oldangle+=2*Math.PI;
          }
          lerpedAngle = oldangle + (newangle - oldangle)/updateInterval*(Date.now() - latestServerUpdateTime);
        }
        canvas.rotate(lerpedAngle - objectangle); //rotate to barrel angle
        canvas.fillStyle = bodyColors.barrel.col;
        canvas.strokeStyle = bodyColors.barrel.outline;
        if (spawnProtect == "yes") {
          //if have spawn protection
          canvas.fillStyle = bodyColors.barrel.hitCol;
          canvas.strokeStyle = bodyColors.barrel.hitOutline;
        }
        //lerp barrel animation
        let oldbarrelheight;
        try{
          oldbarrelheight = oldobjects.player[id].bodybarrels[barrel].barrelHeightChange;
        }
        catch(err){}
        let lerpedheight = thisBarrel.barrelHeightChange;
        if (oldbarrelheight){
          lerpedheight = oldbarrelheight + (thisBarrel.barrelHeightChange - oldbarrelheight)/updateInterval*(Date.now() - latestServerUpdateTime);
        }
        //bullet barrel
        if (thisBarrel.barrelType == "bullet") {
          drawBulletBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //drone barrel
        else if (thisBarrel.barrelType == "drone") {
          if (Math.abs(thisBarrel.barrelWidth - thisBarrel.barrelHeight) > 3){//not a square, dont use equal cuz there might be rounding errors
            drawDroneBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
          }
          else{
            drawDroneTurret(canvas,thisBarrel.x,thisBarrel.barrelWidth,lerpedheight,fov)
          }
        }
        //trap barrel (doesnt exist atm)
        else if (thisBarrel.barrelType == "trap") {
          drawTrapBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //mine barrel (doesnt exist atm)
        else if (thisBarrel.barrelType == "mine") {
          drawMineBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        //minion barrel (doesnt exist atm)
        else if (thisBarrel.barrelType == "minion") {
          drawMinionBarrel(canvas,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,lerpedheight,fov)
        }
        canvas.rotate(-lerpedAngle + objectangle); //rotate back
      }
      //draw turret base
      if ('turretBaseSize' in object){
        canvas.fillStyle = bodyColors.barrel.col;
        canvas.strokeStyle = bodyColors.barrel.outline;
        canvas.beginPath();
        canvas.arc(0, 0, (object.width / clientFovMultiplier) * object.turretBaseSize, 0, 2 * Math.PI);
        canvas.fill();
        canvas.stroke();
      }

      //draw assets above body, e.g. aura assets
      for (assetID in object.assets){
        var asset = object.assets[assetID];
        if (asset.type == "above") {
          let assetcolor = asset.color;
          let assetoutline = asset.outline;
          canvas.lineWidth = asset.outlineThickness / fov;
          if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
            assetcolor = playercolor;
          }
          if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
            assetoutline = playeroutline;
          }
          drawAsset(asset,object.width/fov,assetcolor,assetoutline,canvas)
        }
      }

      canvas.lineJoin = "miter"; //change back
  }

  function drawFakePlayer(name,x,y,bodysize,bodyangle,bodycolor,bodyoutline,which) {//draw player that doesnt exist, e.g. leaderboard, homepage etc
        hctx.save();
        hctx.translate(x, y);
        hctx.rotate(bodyangle);
        if (which == "body" && (name in bodyupgrades)) {
          if (bodyupgrades[name].hasOwnProperty("assets")) {
            //draw under assets
            for (const assetID in bodyupgrades[name].assets) {
              var asset = bodyupgrades[name].assets[assetID];
              if (asset.type == "under") {
                let assetcolor = asset.color;
                let assetoutline = asset.outline;
                if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
                  assetcolor = bodycolor;
                }
                if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
                  assetoutline = bodyoutline;
                }
                drawAsset(asset,bodysize,assetcolor,assetoutline,hctx)
              }
            }
          }
          hctx.fillStyle = bodycolor;
          hctx.strokeStyle = bodyoutline;
          if (!bodyupgrades[name].eternal){
            hctx.beginPath();
            hctx.arc(0, 0, bodysize, 0, 2 * Math.PI);
            hctx.fill();
            hctx.stroke();
          }
          else{
            hctx.beginPath();
            let baseSides = 6;
            hctx.moveTo(bodysize, 0);
            for (var i = 1; i <= baseSides; i++) {
              hctx.lineTo(bodysize * Math.cos((i * 2 * Math.PI) / baseSides), bodysize * Math.sin((i * 2 * Math.PI) / baseSides));
            }
            hctx.fill();
            hctx.stroke();
          }
          if (bodyupgrades[name].hasOwnProperty("bodybarrels")) {
            //draw barrels
            hctx.fillStyle = bodyColors.barrel.col;
            hctx.strokeStyle = bodyColors.barrel.outline;
            for (const barrel in bodyupgrades[name].bodybarrels) {
                let thisBarrel = bodyupgrades[name].bodybarrels[barrel];
                hctx.rotate(thisBarrel.additionalAngle);
              //bullet barrel
                if (thisBarrel.barrelType == "bullet") {
                  drawBulletBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //drone barrel
                else if (thisBarrel.barrelType == "drone") {
                  if (Math.round(thisBarrel.barrelWidth) != Math.round(thisBarrel.barrelHeight)){
                    drawDroneBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                  }
                  else{
                    drawDroneTurret(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,0,1)
                  }
                }
                //trap barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "trap") {
                  drawTrapBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //mine barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "mine") {
                  drawMineBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //minion barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "minion") {
                  drawMinionBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                hctx.rotate(-thisBarrel.additionalAngle); //rotate back
              }
            //draw turret base
            hctx.beginPath();
            hctx.arc(
              0,
              0,
              bodysize * bodyupgrades[name].turretBaseSize,
              0,
              2 * Math.PI
            );
            hctx.fill();
            hctx.stroke();
          }
          if (bodyupgrades[name].hasOwnProperty("assets")) {
            //draw above assets
            Object.keys(bodyupgrades[name].assets).forEach((assetID) => {
              var asset = bodyupgrades[name].assets[assetID];
              if (asset.type == "above") {
                let assetcolor = asset.color;
                let assetoutline = asset.outline;
                if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
                  assetcolor = bodycolor;
                }
                if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
                  assetoutline = bodyoutline;
                }
                drawAsset(asset,bodysize,assetcolor,assetoutline,hctx)
              }
            });
          }
        } else if (which == "weapon" && (name in weaponupgrades)) {
          if (weaponupgrades[name].hasOwnProperty("barrels")) {
                hctx.fillStyle = bodyColors.barrel.col;
                hctx.strokeStyle = bodyColors.barrel.outline;
            Object.keys(weaponupgrades[name].barrels).forEach(
              (assetID) => {
                var thisBarrel = weaponupgrades[name].barrels[assetID];
                hctx.rotate((thisBarrel.additionalAngle * Math.PI) / 180); //rotate to barrel angle
                //bullet barrel
                if (thisBarrel.barrelType == "bullet") {
                  drawBulletBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //drone barrel
                else if (thisBarrel.barrelType == "drone") {
                  drawDroneBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //trap barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "trap") {
                  drawTrapBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //mine barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "mine") {
                  drawMineBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                //minion barrel (doesnt exist atm)
                else if (thisBarrel.barrelType == "minion") {
                  drawMinionBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                }
                hctx.rotate(
                  (-thisBarrel.additionalAngle * Math.PI) / 180
                ); //rotate back
              }
            );
          }
          hctx.fillStyle = bodycolor;
          hctx.strokeStyle = bodyoutline;
          if (!weaponupgrades[name].eternal){
            hctx.beginPath();
            hctx.arc(0, 0, bodysize, 0, 2 * Math.PI);
            hctx.fill();
            hctx.stroke();
          }
          else{
            hctx.beginPath();
            let baseSides = 6;
            hctx.moveTo(bodysize, 0);
            for (var i = 1; i <= baseSides; i++) {
              hctx.lineTo(bodysize * Math.cos((i * 2 * Math.PI) / baseSides), bodysize * Math.sin((i * 2 * Math.PI) / baseSides));
            }
            hctx.fill();
            hctx.stroke();
          }
        }
        hctx.restore();
      }

  function drawobjects(object, id, playerstring, auraWidth) {
    //function for drawing objects on the canvas. need to provide aura width because this fuction cannot access variables outside
    var drawingX =
      (object.x - px) / clientFovMultiplier + canvas.width / 2; //calculate the location on canvas to draw object
    var drawingY =
      (object.y - py) / clientFovMultiplier + canvas.height / 2;
    
    if (object.type == "bullet") {
      //draw bullet
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = object.deadOpacity;
      }
      var chooseflash = 3;
      if (object.hit > 0 && object.bulletType != "aura") {
        //if shape is hit AND bullet is not aura, choose whether it's color is white or original color to create flashing effect
        chooseflash = Math.floor(Math.random() * 3); //random number 0, 1 or 2
      }
      if (chooseflash == 0) {
        ctx.fillStyle = "white";
      } else if (chooseflash == 1) {
        ctx.fillStyle = "pink";
      } else {
        if (object.ownsIt == "yes" || object.bulletType == "aura") {
          //if it's an aura or client's tank owns the bullet
          ctx.fillStyle = object.color;
        } else {
          ctx.fillStyle = "#f04f54"; //bullet color is red
        }
      }
      if (object.bulletType == "aura") {
        var choosing = Math.floor(Math.random() * 3); //choose if particle spawn
        if (choosing == 1) {
          //spawn a particle
          var angleDegrees = Math.floor(Math.random() * 360); //choose angle in degrees
          var angleRadians = (angleDegrees * Math.PI) / 180; //convert to radians
          var randomDistFromCenter =
            Math.floor(Math.random() * object.width * 2) - object.width;
          let auraoutline = object.outline;
          if (auraoutline == "rgba(255,0,0,.15)"){//damaging aura will have particles that look too dark
            auraoutline = auraoutline.substring(0, auraoutline.length - 3)+ '05)';//change opacity to 0.05
          }
          radparticles[particleID] = {
            angle: angleRadians,
            x: object.x + randomDistFromCenter * Math.cos(angleRadians),
            y: object.y + randomDistFromCenter * Math.sin(angleRadians),
            width: 5,
            height: 5,
            speed: 1,
            timer: 15,
            maxtimer: 50,
            color: object.color,
            outline: auraoutline,
            type: "particle",
          };
          particleID++;
        }
      }

      if (object.ownsIt == "yes" || object.bulletType == "aura") {
        //if it's an aura or client's tank owns the bullet
        ctx.strokeStyle = object.outline;
      } else {
        ctx.strokeStyle = "#b33b3f"; //bullet is red
      }


      //bullet is purple even if bullet belongs to enemy
      if (object.color == "#934c93") {
        ctx.fillStyle = object.color;
      }
      if (object.outline == "#660066") {
        ctx.strokeStyle = object.outline;
      }

      //team colors
      if (bodyColors.hasOwnProperty(object.team)) {
        ctx.fillStyle = bodyColors[object.team].col;
        ctx.strokeStyle = bodyColors[object.team].outline;
      }

      if (object.bulletType == "aura"){
        //color is aura color, regardless of team
        ctx.fillStyle = object.color;
        ctx.strokeStyle = object.outline;
      }

      if (object.passive == "yes") {
        if (object.bulletType == "aura") {
          ctx.strokeStyle = "rgba(128,128,128,.2)";
          ctx.fillStyle = "rgba(128,128,128,.2)";
        } else {
          ctx.strokeStyle = "dimgrey";
          ctx.fillStyle = "grey";
        }
      }

      if (object.team=="mob"){
        //dune mob's bullets is the colo of mob
        ctx.fillStyle = botcolors[object.ownerName].color;
        ctx.strokeStyle = botcolors[object.ownerName].outline;
      }

      ctx.lineWidth = 4 / clientFovMultiplier;
      if (object.bulletType == "bullet" || object.bulletType == "aura") {
        if (!object.color.includes('rgba(56,183,100')){//not a heal aura
          ctx.beginPath();
          ctx.arc(
            drawingX,
            drawingY,
            object.width / clientFovMultiplier,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
        }
        else{//8 sides for healing aura
          ctx.beginPath();
          ctx.moveTo((object.width / clientFovMultiplier) + drawingX, drawingY);
          for (var i = 1; i <= 8 + 1; i += 1) {
            ctx.lineTo(
              (object.width / clientFovMultiplier) *
                  Math.cos((i * 2 * Math.PI) / 8) + drawingX,
              (object.width / clientFovMultiplier) *
                  Math.sin((i * 2 * Math.PI) / 8) + drawingY
            );
          }
          ctx.fill();
          ctx.stroke();
        }
      } else if (object.bulletType == "trap") {
        //width is the radius, so need to times two to get total width
        //note: x and y of object are the center of object, but when drawing rectangles, the x and y coordinates given need to be the top left corner of the rectangle, so need to minus the width and height
        ctx.fillRect(
          drawingX - object.width / clientFovMultiplier,
          drawingY - object.width / clientFovMultiplier,
          (object.width * 2) / clientFovMultiplier,
          (object.width * 2) / clientFovMultiplier
        );
        ctx.strokeRect(
          drawingX - object.width / clientFovMultiplier,
          drawingY - object.width / clientFovMultiplier,
          (object.width * 2) / clientFovMultiplier,
          (object.width * 2) / clientFovMultiplier
        );
      } else if (object.bulletType == "drone") {
        ctx.save();
        ctx.translate(drawingX, drawingY);
        ctx.rotate(object.moveAngle);
        //ctx.rotate((object.moveAngle*180/Math.PI - 90) *Math.PI/180);//cannot straightaway use the angle, must add 90 degrees to it, because 0 degrees is pointing right, but we are drawing the triangle upwards
        ctx.beginPath();
        ctx.moveTo(
          (object.width / clientFovMultiplier) * Math.cos(0),
          (object.width / clientFovMultiplier) * Math.sin(0)
        );
        for (var i = 1; i <= 3; i += 1) {
          ctx.lineTo(
            (object.width / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / 3),
            (object.width / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / 3)
          );
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      } else if (object.bulletType == "mine" || object.bulletType == "minion") {
        //console.log(object.moveAngle/Math.PI*180)
        //mine is trap with barrel, minion is bullet with barrel
        ctx.save();
        ctx.translate(drawingX, drawingY);
        ctx.rotate(object.moveAngle);
        //ctx.rotate((object.moveAngle*180/Math.PI - 90) *Math.PI/180);//cannot straightaway use the angle, must add 90 degrees to it, because 0 degrees is pointing right, but we are drawing the triangle upwards

        if (object.bulletType == "minion"){
          //draw barrels underneath
          var prevfill = ctx.fillStyle;
          var prevstroke = ctx.strokeStyle;//store previous bullet color so can change back later
          ctx.fillStyle = bodyColors.barrel.col;
          ctx.strokeStyle = bodyColors.barrel.outline;
          Object.keys(object.barrels).forEach((barrel) => {
            let thisBarrel = object.barrels[barrel];
            ctx.rotate(thisBarrel.additionalAngle); //rotate to barrel angle
            if (thisBarrel.barrelType == "bullet") {
              drawBulletBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "drone") {
              drawDroneBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "trap") {
              drawTrapBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "mine") {
              drawMineBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "minion") {
              drawMinionBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
          })
          ctx.fillStyle = prevfill;
          ctx.strokeStyle = prevstroke;
        }
        ctx.beginPath();
        if (object.bulletType == "mine"){//mine
          ctx.moveTo(
            (object.width / clientFovMultiplier) * Math.cos(0),
            (object.width / clientFovMultiplier) * Math.sin(0)
          );
          for (var i = 1; i <= 3; i += 1) {
            ctx.lineTo(
              (object.width / clientFovMultiplier) *
                Math.cos((i * 2 * Math.PI) / 3),
              (object.width / clientFovMultiplier) *
                Math.sin((i * 2 * Math.PI) / 3)
            );
          }
        }
        else{//minion
          ctx.arc(0, 0, object.width / clientFovMultiplier, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
        ctx.rotate(-object.moveAngle); //rotate back
        //BARREL FOR THE MINE TRAP
        if (object.bulletType == "mine"){
        Object.keys(object.barrels).forEach((barrel) => {
          let thisBarrel = object.barrels[barrel];
          ctx.rotate(thisBarrel.additionalAngle); //rotate to barrel angle
          ctx.fillStyle = "grey";
          ctx.strokeStyle = "#5e5e5e";
          if (thisBarrel.barrelType == "bullet") {
              drawBulletBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "drone") {
              drawDroneBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "trap") {
              drawTrapBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "mine") {
              drawMineBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "minion") {
              drawMinionBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
          ctx.beginPath();
          ctx.arc(
            0,
            0,
            thisBarrel.barrelWidth / clientFovMultiplier,
            0,
            2 * Math.PI
          );
          ctx.fill();
          ctx.stroke();
          ctx.rotate(-thisBarrel.additionalAngle); //rotate back
        });
      }

        ctx.restore();
      }
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = 1.0; //reset opacity
      }
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "bot") {
      //draw bot
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = object.deadOpacity;
      }
      ctx.lineWidth = 4 / clientFovMultiplier;
      ctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
      ctx.save();
      ctx.translate(drawingX, drawingY);
      ctx.rotate(object.angle);
      //draw barrels
      if (object.name!="Pillbox"){//pillbox's barrel is visually a turret
        Object.keys(object.barrels).forEach((barrel) => {
          let thisBarrel = object.barrels[barrel];
          ctx.rotate(((thisBarrel.additionalAngle + 90) * Math.PI) / 180); //rotate to barrel angle
          ctx.fillStyle = bodyColors.barrel.col;
          ctx.strokeStyle = bodyColors.barrel.outline;
          if (thisBarrel.barrelType == "bullet") {
              drawBulletBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "drone") {
              drawDroneBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "trap") {
              drawTrapBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "mine") {
              drawMineBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
            else if (thisBarrel.barrelType == "minion") {
              drawMinionBarrel(ctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,thisBarrel.barrelHeightChange,clientFovMultiplier)
            }
          ctx.rotate((-(thisBarrel.additionalAngle + 90) * Math.PI) / 180); //rotate back
        });
      }
      if (object.name=="Cluster"){
        //draw the spawning barrels
        let barrelwidth = object.width*0.7;
        let barrelheight = object.width*1.2;
        ctx.fillStyle = bodyColors.barrel.col;
        ctx.strokeStyle = bodyColors.barrel.outline;
        ctx.save();
        ctx.rotate(90 * Math.PI / 180);
        for (let i = 0; i < 5; i++){
          if (i!=0){
            ctx.rotate(72 * Math.PI / 180); //rotate 72 for each barrel
          }
          ctx.beginPath();
          ctx.moveTo(
            -barrelwidth / 5 / clientFovMultiplier,
            0
          );
          ctx.lineTo(
            -barrelwidth / clientFovMultiplier,
            -barrelheight / clientFovMultiplier
          );
          ctx.lineTo(
            barrelwidth / clientFovMultiplier,
            -barrelheight / clientFovMultiplier
          );
          ctx.lineTo(
            barrelwidth / 5 / clientFovMultiplier,
            0
          );
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
      else if (object.name=="Infestor"){
        //draw the spawning barrels
        let barrelwidth = object.width*0.7;
        let barrelheight = object.width*1.2;
        ctx.fillStyle = bodyColors.barrel.col;
        ctx.strokeStyle = bodyColors.barrel.outline;
        ctx.save();
        for (let i = 0; i < 4; i++){//normal barrels
          if (i!=0){
            ctx.rotate(90 * Math.PI / 180);
          }
          ctx.fillRect(
            -barrelwidth / 2 / clientFovMultiplier,
            -barrelheight / clientFovMultiplier,
            barrelwidth / clientFovMultiplier,
            barrelheight / clientFovMultiplier
          );
          ctx.strokeRect(
            -barrelwidth / 2 / clientFovMultiplier,
            -barrelheight / clientFovMultiplier,
            barrelwidth / clientFovMultiplier,
            barrelheight / clientFovMultiplier
          );
        }
        ctx.restore();
        ctx.save();
        ctx.rotate(45 * Math.PI / 180);
        barrelwidth = object.width*0.6;
        barrelheight = object.width*2;
        for (let i = 0; i < 4; i++){//traplike barrels
          if (i!=0){
            ctx.rotate(90 * Math.PI / 180);
          }
          ctx.fillRect(
            -barrelwidth / 2 / clientFovMultiplier,
            -barrelheight * 0.55 / clientFovMultiplier,
            barrelwidth / clientFovMultiplier,
            barrelheight * 0.5 / clientFovMultiplier
          );
          ctx.strokeRect(
            -barrelwidth / 2 / clientFovMultiplier,
            -barrelheight * 0.55 / clientFovMultiplier,
            barrelwidth / clientFovMultiplier,
            barrelheight * 0.5 / clientFovMultiplier
          );
          ctx.beginPath();
          ctx.moveTo(
            -barrelwidth / 2 / clientFovMultiplier,
            -barrelheight * 0.55 / clientFovMultiplier
          );
          ctx.lineTo(
            -barrelwidth/1.7 / clientFovMultiplier,
            -barrelheight * 0.65 / clientFovMultiplier
          );
          ctx.lineTo(
            barrelwidth/1.7 / clientFovMultiplier,
            -barrelheight * 0.65 / clientFovMultiplier
          );
          ctx.lineTo(
            barrelwidth / 2 / clientFovMultiplier,
            -barrelheight * 0.55 / clientFovMultiplier
          );
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
      else if (object.name=="Champion"){
        //draw spikes
        var numberOfSpikes = 5;
        var outerRadius = object.width / clientFovMultiplier * 1.3;
        var innerRadius = object.width / clientFovMultiplier /1.3;
        var rot = (Math.PI / 2) * 3;//dont change this, or else will have strange extra lines
        var x = 0;
        var y = 0;
        ctx.fillStyle = bodyColors.barrel.col;
        ctx.strokeStyle = bodyColors.barrel.outline;
        ctx.save();
        ctx.rotate(90 * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      var chooseflash = 3;
      if (object.hit > 0) {
        //if shape is hit, choose whether it's color is white or original color to create flashing effect
        chooseflash = Math.floor(Math.random() * 3); //random number 0, 1 or 2
      }
      if (chooseflash == 0) {
        ctx.fillStyle = "white";
      } else if (chooseflash == 1) {
        ctx.fillStyle = "pink";
      } else {
        ctx.fillStyle = botcolors[object.name].color;
      }
      ctx.strokeStyle = botcolors[object.name].outline;
      //draw body
      if (object.side==0) {
        //draw circle
        ctx.beginPath();
        ctx.arc(0, 0, object.width / clientFovMultiplier, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (object.side>=0) {
        if (object.hasOwnProperty('randomPointsArrayX')){
          //draw for rock and boulder
          //POLYGON WITH IRREGULAR SIDES
          ctx.rotate(-object.angle); //rotate back so that rock wont rotate to face you
          var rockSides = object.side;
          ctx.beginPath();
          ctx.moveTo((object.width / clientFovMultiplier) * Math.cos(0), (object.width / clientFovMultiplier) * Math.sin(0));
          for (var i = 1; i <= rockSides; i++) {
            var XRandom = object.randomPointsArrayX[i - 1] / clientFovMultiplier;
            var YRandom = object.randomPointsArrayY[i - 1] / clientFovMultiplier;
            ctx.lineTo(XRandom + (object.width / clientFovMultiplier) * Math.cos((i * 2 * Math.PI) / rockSides),
              YRandom + (object.width / clientFovMultiplier) * Math.sin((i * 2 * Math.PI) / rockSides)
            );
          }
          ctx.fill();
          ctx.stroke();
        }
        else{//normal spawner
          if (object.name=="Cluster"||object.name=="Pursuer"||object.name=="Champion"||object.name=="Infestor"||object.name=="Abyssling"){
            //need to rotate 72/2 degrees so that pentagon not facing vertex towards player
            ctx.rotate(Math.PI/object.side);//2 PI / sides / 2
          }
          ctx.beginPath();
          ctx.moveTo((object.width / clientFovMultiplier), 0);
          for (var i = 1; i <= object.side + 1; i += 1) {
            ctx.lineTo(
              (object.width / clientFovMultiplier) *
                  Math.cos((i * 2 * Math.PI) / object.side),
              (object.width / clientFovMultiplier) *
                  Math.sin((i * 2 * Math.PI) / object.side)
            );
          }
          ctx.fill();
          ctx.stroke();
          if (object.name=="Cluster"||object.name=="Pursuer"){
            ctx.rotate(-Math.PI/object.side);//rotate back
            //draw circle on top
            ctx.fillStyle = bodyColors.barrel.col;//light grey
            ctx.strokeStyle = bodyColors.barrel.outline;
            ctx.beginPath();
            ctx.arc(0, 0, object.width/2 / clientFovMultiplier, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          else if (object.name=="Champion"){
            ctx.rotate(-Math.PI/object.side);//rotate back
            //draw circle on top
            ctx.fillStyle = "grey";//darker grey
            ctx.strokeStyle = "#5e5e5e";
            ctx.beginPath();
            ctx.arc(0, 0, object.width/2.5 / clientFovMultiplier, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          else if (object.name=="Infestor"){
            ctx.rotate(-Math.PI/object.side);//rotate back
            //draw circle on top
            ctx.fillStyle = bodyColors.barrel.col;//light grey
            ctx.strokeStyle = bodyColors.barrel.outline;
            ctx.beginPath();
            ctx.arc(0, 0, object.width/5 / clientFovMultiplier, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          else if (object.name=="Leech"){
            //draw circle on top
            ctx.fillStyle = bodyColors.barrel.col;//light grey
            ctx.strokeStyle = bodyColors.barrel.outline;
            ctx.beginPath();
            ctx.arc(0, 0, object.width/2 / clientFovMultiplier, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          else if (object.name=="Pillbox"){//pillbox's barrel is visually a turret
            ctx.lineJoin = "round"; //make nice round corners
            ctx.rotate(90 * Math.PI / 180);
            Object.keys(object.barrels).forEach((barrel) => {
              //note that you must use [barrel] instead of .barrel, if not there will be an error
              let thisBarrel = object.barrels[barrel];
              ctx.fillStyle = bodyColors.barrel.col;
              ctx.strokeStyle = bodyColors.barrel.outline;
              ctx.fillRect(
                -thisBarrel.barrelWidth / 2 / clientFovMultiplier +
                  thisBarrel.x,
                -(thisBarrel.barrelHeight - thisBarrel.barrelHeightChange) /
                  clientFovMultiplier,
                thisBarrel.barrelWidth / clientFovMultiplier,
                (thisBarrel.barrelHeight - thisBarrel.barrelHeightChange) /
                  clientFovMultiplier
              );
              ctx.strokeRect(
                -thisBarrel.barrelWidth / 2 / clientFovMultiplier +
                  thisBarrel.x,
                -(thisBarrel.barrelHeight - thisBarrel.barrelHeightChange) /
                  clientFovMultiplier,
                thisBarrel.barrelWidth / clientFovMultiplier,
                (thisBarrel.barrelHeight - thisBarrel.barrelHeightChange) /
                  clientFovMultiplier
              );
            });
            ctx.rotate(-90 * Math.PI / 180);
            //draw turret base
            ctx.beginPath();
            ctx.arc(
              0,
              0,
              (object.width / clientFovMultiplier) * 0.6,
              0,
              2 * Math.PI
            );
            ctx.fill();
            ctx.stroke();
            ctx.lineJoin = "miter"; //change back
          } else if (object.name=="Abyssling"){
            //draw upper layer
            let oldfill = ctx.fillStyle;
            let oldstroke = ctx.strokeStyle;
            ctx.fillStyle = "#5f676c";
            ctx.strokeStyle = "#41494e";
            ctx.beginPath();
            ctx.moveTo((object.width*0.75 / clientFovMultiplier), 0);
            for (var i = 1; i <= object.side + 1; i += 1) {
              ctx.lineTo(
                (object.width*0.75 / clientFovMultiplier) *
                    Math.cos((i * 2 * Math.PI) / object.side),
                (object.width*0.75 / clientFovMultiplier) *
                    Math.sin((i * 2 * Math.PI) / object.side)
              );
            }
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = oldfill;
            ctx.strokeStyle = oldstroke;
            ctx.beginPath();
            ctx.moveTo((object.width*0.7 / clientFovMultiplier), 0);
            for (var i = 1; i <= object.side + 1; i += 1) {
              ctx.lineTo(
                (object.width*0.7 / clientFovMultiplier) *
                    Math.cos((i * 2 * Math.PI) / object.side),
                (object.width*0.7 / clientFovMultiplier) *
                    Math.sin((i * 2 * Math.PI) / object.side)
              );
            }
            ctx.fill();
            ctx.stroke();
            ctx.rotate(-Math.PI/object.side);//rotate back
            //draw turret on top (only visual)
            ctx.fillStyle = bodyColors.barrel.col;//light grey
            ctx.strokeStyle = bodyColors.barrel.outline;
            let barrelwidth = 35;
            let barrelheight = 100;
            ctx.fillRect(
              -barrelwidth / 2 / clientFovMultiplier,
              -barrelheight / clientFovMultiplier,
              barrelwidth / clientFovMultiplier,
              barrelheight / clientFovMultiplier
            );
            ctx.strokeRect(
              -barrelwidth / 2 / clientFovMultiplier,
              -barrelheight / clientFovMultiplier,
              barrelwidth / clientFovMultiplier,
              barrelheight / clientFovMultiplier
            );
            ctx.beginPath();
            ctx.arc(0, 0, object.width*0.45 / clientFovMultiplier, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        }
      } else{//negative sides, draw a star! (cactus)
        var numberOfSpikes = -object.side;
        var outerRadius = object.width / clientFovMultiplier * 1.5;
        var innerRadius = object.width / clientFovMultiplier;

        var rot = (Math.PI / 2) * 3;//dont change this, or else will have strange extra lines
        var x = 0;
        var y = 0;
        ctx.rotate(-object.angle); //rotate back so that rock wont rotate to face you
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      if (object.health < object.maxhealth) {
        //draw health bar background
        var w = (object.width * 2) / clientFovMultiplier;
        var h = 7 / clientFovMultiplier;
        var r = h / 2;
        var x = drawingX - object.width / clientFovMultiplier;
        var y = drawingY + object.width / clientFovMultiplier + 10;
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2.5 / clientFovMultiplier;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        //draw health bar
        if (object.health > 0) {
          w = (w / object.maxhealth) * object.health;
          if (r * 2 > w) {
            //prevent weird shape when radius more than width
            r = w / 2;
            y += (h - w) / 2; //move health bar so that it is centered vertically in black bar
            h = w;
          }
          ctx.fillStyle = botcolors[object.name].color;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 5 / clientFovMultiplier;
      ctx.font = "700 " + 20 / clientFovMultiplier + "px Roboto";
      ctx.textAlign = "center";
      ctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
      //note: if you stroke then fill, the words will be thicker and nicer. If you fill then stroke, the words are thinner.
      if ((showStaticMobName == "yes"||botcolors[object.name].static=="no") && (showMinionMobName == "yes"||botcolors[object.name].minion=="no")){//settings for showing static and minion names
        if (botcolors[object.name].specialty != "") {
          var specialtyText = " (" + botcolors[object.name].specialty + ")";
        } else {
          var specialtyText = "";
        }
        ctx.strokeText(
          object.name + specialtyText,
          drawingX,
          drawingY - object.width / clientFovMultiplier - 10
        );
        ctx.fillText(
          object.name + specialtyText,
          drawingX,
          drawingY - object.width / clientFovMultiplier - 10
        );
      }
      ctx.lineJoin = "miter"; //prevent spikes above the capital letter "M"
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = 1.0; //reset opacity
      }
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "shape") {
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = object.deadOpacity;
      }
      var radiantAuraSize =
        document.getElementById("sizevalue").innerHTML * auraWidth; //aura size determined by settings, but default is 5
      //draw shape
      ctx.save();
      ctx.translate(drawingX, drawingY);
      ctx.rotate((object.angle * Math.PI) / 180);
      if (object.hasOwnProperty("radtier")) {
        //radiant shape
        if (!radiantShapes.hasOwnProperty(id)) {
          var randomstate = Math.floor(Math.random() * 3); //randomly choose a color state for the radiant shape to start (if not when you spawn in cavern, all shapes same color)
          var randomtype = Math.floor(Math.random() * 2) + 1; //choose animation color type (1 or 2)
          if (randomtype == 1) {
            if (randomstate == 0) {
              radiantShapes[id] = {
                red: 255,
                blue: 0,
                green: 0,
                rgbstate: 1,
                radtype: randomtype,
              }; //keep track of radiant shape colors (done in client code)
            } else if (randomstate == 1) {
              radiantShapes[id] = {
                red: 199,
                blue: 0,
                green: 150,
                rgbstate: 2,
                radtype: randomtype,
              };
            } else if (randomstate == 2) {
              radiantShapes[id] = {
                red: -1,
                blue: 200,
                green: 0,
                rgbstate: 3,
                radtype: randomtype,
              };
            }
          } else {
            if (randomstate == 0) {
              radiantShapes[id] = {
                red: 118,
                blue: 168,
                green: 151,
                rgbstate: 1,
                radtype: randomtype,
              };
            } else if (randomstate == 1) {
              radiantShapes[id] = {
                red: 209,
                blue: 230,
                green: 222,
                rgbstate: 2,
                radtype: randomtype,
              };
            } else if (randomstate == 2) {
              radiantShapes[id] = {
                red: 234,
                blue: 240,
                green: 180,
                rgbstate: 3,
                radtype: randomtype,
              };
            }
          }
        }
        object.red = radiantShapes[id].red;
        object.blue = radiantShapes[id].blue;
        object.green = radiantShapes[id].green;
      }
      if (object.hasOwnProperty("red")) {
        //calculate color of spikes, which would be 20 higher than actual rgb value
        if (object.red + 150 <= 255) {
          var spikeRed = object.red + 150;
        } else {
          var spikeRed = 255;
        }
        if (object.blue + 150 <= 255) {
          var spikeBlue = object.blue + 150;
        } else {
          var spikeBlue = 255;
        }
        if (object.green + 150 <= 255) {
          var spikeGreen = object.green + 150;
        } else {
          var spikeGreen = 255;
        }
        if (object.radtier == 3) {
          //for high rarity radiant shapes, draw spikes
          ctx.rotate((extraSpikeRotate * Math.PI) / 180);
          ctx.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          ctx.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 6;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / clientFovMultiplier) *
            0.75;
          var innerRadius = (object.width / clientFovMultiplier) * 0.75;

          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;

          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0, 0 - outerRadius);
          ctx.closePath();
          ctx.lineWidth = 3 / clientFovMultiplier;
          ctx.fill();
          ctx.stroke();
          ctx.rotate((-extraSpikeRotate * Math.PI) / 180);
        } else if (object.radtier == 4) {
          //for high rarity radiant shapes, draw spikes
          ctx.rotate((extraSpikeRotate1 * Math.PI) / 180);
          ctx.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          ctx.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 3;
          var outerRadius =
            (object.width * radiantAuraSize * 3) / clientFovMultiplier;
          var innerRadius = (object.width / clientFovMultiplier) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0, 0 - outerRadius);
          ctx.closePath();
          ctx.lineWidth = 3 / clientFovMultiplier;
          ctx.fill();
          ctx.stroke();
          ctx.rotate((-extraSpikeRotate1 * Math.PI) / 180);
          ctx.rotate((extraSpikeRotate2 * Math.PI) / 180);
          var numberOfSpikes = 6;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / clientFovMultiplier) *
            0.5;
          var innerRadius = (object.width / clientFovMultiplier) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0, 0 - outerRadius);
          ctx.closePath();
          ctx.lineWidth = 3 / clientFovMultiplier;
          ctx.fill();
          ctx.stroke();
          ctx.rotate((-extraSpikeRotate2 * Math.PI) / 180);
        } else if (object.radtier == 5) {
          //for high rarity radiant shapes, draw spikes
          ctx.rotate((extraSpikeRotate1 * Math.PI) / 180);
          ctx.fillStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.7)";
          ctx.strokeStyle =
            "rgba(" +
            spikeRed +
            ", " +
            spikeGreen +
            ", " +
            spikeBlue +
            ", 0.3)";
          var numberOfSpikes = 3;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / clientFovMultiplier) *
            1.5;
          var innerRadius = (object.width / clientFovMultiplier) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0, 0 - outerRadius);
          ctx.closePath();
          ctx.lineWidth = 3 / clientFovMultiplier;
          ctx.fill();
          ctx.stroke();
          ctx.rotate((-extraSpikeRotate1 * Math.PI) / 180);
          ctx.rotate((extraSpikeRotate2 * Math.PI) / 180);
          var numberOfSpikes = 3;
          var outerRadius =
            ((object.width * radiantAuraSize * 3) / clientFovMultiplier) *
            0.5;
          var innerRadius = (object.width / clientFovMultiplier) * 0.5;
          var rot = (Math.PI / 2) * 3;
          var x = 0;
          var y = 0;
          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0, 0 - outerRadius);
          ctx.closePath();
          ctx.lineWidth = 3 / clientFovMultiplier;
          ctx.fill();
          ctx.stroke();
          ctx.rotate((-extraSpikeRotate2 * Math.PI) / 180);
        }
        //if shape is radiant
        //draw aura

        //old code where aura was a gradient
        /*
            const gradient = ctx.createRadialGradient(0, 0, object.width/clientFovMultiplier, 0, 0, object.width/clientFovMultiplier*radiantAuraSize);
            gradient.addColorStop(0, 'rgba(' + object.red + ', ' + object.green + ', ' + object.blue + ', 0.3)');
            gradient.addColorStop(0.5, 'rgba(' + object.red + ', ' + object.green + ', ' + object.blue + ', 0.1)');
            gradient.addColorStop(1, 'rgba(' + object.red + ', ' + object.green + ', ' + object.blue + ', 0.0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            */

        //old code where aura have shape
        ctx.fillStyle =
          "rgba(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ", 0.3)";
        ctx.strokeStyle =
          "rgba(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ", 0.3)";
        ctx.lineWidth = 3 / clientFovMultiplier;
        ctx.beginPath();

        var shapeaurasize = object.radtier;
        if (shapeaurasize > 3) {
          shapeaurasize = 3; //prevent huge auras
        }
        ctx.moveTo(
          0 +
            ((object.width * radiantAuraSize * shapeaurasize) /
              clientFovMultiplier) *
              Math.cos(0),
          0 +
            ((object.width * radiantAuraSize * shapeaurasize) /
              clientFovMultiplier) *
              Math.sin(0)
        );
        for (var i = 1; i <= object.sides + 1; i += 1) {
          ctx.lineTo(
            0 +
              ((object.width * radiantAuraSize * shapeaurasize) /
                clientFovMultiplier) *
                Math.cos((i * 2 * Math.PI) / object.sides),
            0 +
              ((object.width * radiantAuraSize * shapeaurasize) /
                clientFovMultiplier) *
                Math.sin((i * 2 * Math.PI) / object.sides)
          );
        }

        //ctx.arc(0, 0, object.width/clientFovMultiplier*radiantAuraSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        var shadeFactor = 3 / 4; //smaller the value, darker the shade
        ctx.strokeStyle =
          "rgb(" +
          object.red * shadeFactor +
          ", " +
          object.green * shadeFactor +
          ", " +
          object.blue * shadeFactor +
          ")";
        ctx.fillStyle =
          "rgb(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          ")";
        if (object.hit > 0) {
          //if shape is hit
          ctx.strokeStyle =
            "rgb(" +
            (object.red * shadeFactor + 20) +
            ", " +
            (object.green * shadeFactor + 20) +
            ", " +
            (object.blue * shadeFactor + 20) +
            ")";
          ctx.fillStyle =
            "rgb(" +
            (object.red + 20) +
            ", " +
            (object.green + 20) +
            ", " +
            (object.blue + 20) +
            ")";
        }

        //choose whether a particle would spawn
        //particle spawn chance based on number of sides the shape has, so square has less particles
        if (spawnradparticle == "yes"){
          var chooseValue = 20 - object.sides * 2; //lower the number means more particles spawned
          if (chooseValue < 5) {
            //5 refers to mimimum particle spawn chance
            chooseValue = 5;
          }
          if (object.radtier == 4){
            chooseValue -= 2;
          }
          else if (object.radtier == 5){
            chooseValue -= 3;
          }
          var choosing = Math.floor(Math.random() * chooseValue); //choose if particle spawn
          if (choosing == 1) {
            //spawn a particle
            var angleDegrees = Math.floor(Math.random() * 360); //choose angle in degrees
            var angleRadians = (angleDegrees * Math.PI) / 180; //convert to radians
            var randomDistFromCenter =
              Math.floor(Math.random() * object.width * 2) - object.width;
            radparticles[particleID] = {
              angle: angleRadians,
              x: object.x + randomDistFromCenter * Math.cos(angleRadians),
              y: object.y + randomDistFromCenter * Math.sin(angleRadians),
              width: 5,
              height: 5,
              speed: 1,
              timer: 25,
              maxtimer: 25,
              color:
                "rgba(" +
                object.red +
                "," +
                object.green +
                "," +
                object.blue +
                ",.5)",
              outline:
                "rgba(" +
                (object.red* shadeFactor + 20) +
                "," +
                (object.green* shadeFactor + 20) +
                "," +
                (object.blue* shadeFactor + 20) +
                ",.5)",
              type: "particle",
            };
            if (object.radtier == 4){
              radparticles[particleID].width = Math.floor(Math.random() * 10) + 5;
            }
            else if (object.radtier == 5){
              radparticles[particleID].width = Math.floor(Math.random() * 20) + 5;
              radparticles[particleID].speed = 3;
              radparticles[particleID].timer = 50;
              radparticles[particleID].maxtimer = 50;
            }
            particleID++;
          }
        }
      } else {
        //if not radiant
        //get shape colors in client code based on theme
        ctx.fillStyle = shapecolors[object.sides][colortheme].color;
        ctx.strokeStyle = shapecolors[object.sides][colortheme].outline;
        if (object.hit > 0) {
          //if shape is hit
          ctx.fillStyle = shapecolors[object.sides][colortheme].hitcolor;
          ctx.strokeStyle =
            shapecolors[object.sides][colortheme].hitoutline;
        }
      }
      ctx.lineJoin = "round"; //make corners of shape round
      if (object.sides < 0) {
        //draw a star shape

        var numberOfSpikes = 5;
        var outerRadius = object.width / clientFovMultiplier;
        var innerRadius = (object.width / clientFovMultiplier / 2);

        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;

        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.lineWidth = 4 / clientFovMultiplier;
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.lineWidth = 4 / clientFovMultiplier;
        ctx.beginPath();
        ctx.moveTo(
          0 + (object.width / clientFovMultiplier) * Math.cos(0),
          0 + (object.width / clientFovMultiplier) * Math.sin(0)
        );
        for (var i = 1; i <= object.sides + 1; i += 1) {
          ctx.lineTo(
            0 +
              (object.width / clientFovMultiplier) *
                Math.cos((i * 2 * Math.PI) / object.sides),
            0 +
              (object.width / clientFovMultiplier) *
                Math.sin((i * 2 * Math.PI) / object.sides)
          );
        }
        ctx.fill();
        ctx.stroke();
      }
      ctx.lineJoin = "miter"; //change back to default
      ctx.restore(); //must restore to reset angle rotation so health bar wont be rotated sideways
      //draw shape's health bar
      if (object.health < object.maxhealth) {
        //draw health bar background
        if (!shapeHealthBar.hasOwnProperty(id)){//for health bar width animation when first get damage
          shapeHealthBar[id] = 0;
        }
        else if (shapeHealthBar[id] < 10){
          shapeHealthBar[id]+=2*deltaTime;
        }
        if (shapeHealthBar[id] > 10){
          shapeHealthBar[id] = 10;
        }
        var w = (object.width / clientFovMultiplier) * 2 * (shapeHealthBar[id]/10);
        var h = 7 / clientFovMultiplier;
        var r = h / 2;
        var x = drawingX - object.width / clientFovMultiplier * (shapeHealthBar[id]/10);
        var y = drawingY + object.width / clientFovMultiplier + 10;
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2.5 / clientFovMultiplier;//determines with of black area
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        //draw health bar
        if (object.health > 0) {
          //dont draw health bar if negative health
          w = (w / object.maxhealth) * object.health;
          if (r * 2 > w) {
            //prevent weird shape when radius more than width
            r = w / 2;
            y += (h - w) / 2; //move health bar so that it is centered vertically in black bar
            h = w;
          }
          if (object.hasOwnProperty("red")) {
            //if shape is radiant
            ctx.fillStyle =
              "rgb(" +
              object.red +
              ", " +
              object.green +
              ", " +
              object.blue +
              ")";
          } else {
            ctx.fillStyle = shapecolors[object.sides][colortheme].color;
            if (object.sides==10||object.sides==11||object.sides==14){//these shapes are very dark, cannot see health bar
              ctx.fillStyle = shapecolors[12][colortheme].color;//use ddecagon's grey color for health bar
            }
          }
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = 1.0; //reset opacity
      }
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
      if (showshapeinfo == "yes"){
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 5 / clientFovMultiplier;
        ctx.font = "700 " + 20 / clientFovMultiplier + "px Roboto";
        ctx.textAlign = "center";
        ctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        let name = "";
        if (object.radtier == 1){
          name = "Radiant "
        }
        else if (object.radtier == 2){
          name = "Gleaming "
        }
        else if (object.radtier == 3){
          name = "Luminous "
        }
        else if (object.radtier == 4){
          name = "Lustrous "
        }
        else if (object.radtier == 5){
          name = "Highly Radiant "
        }
        name += shapecolors[object.sides].name;
        ctx.strokeText(
         name,
          drawingX,
          drawingY - object.width / clientFovMultiplier - 10
        );
        ctx.fillText(
          name,
          drawingX,
          drawingY - object.width / clientFovMultiplier - 10
        );
        ctx.lineJoin = "miter"; //prevent spikes above the capital letter "M"
      }
    } else if (object.type == "spawner") {
      //spawner in sanctuary
      ctx.save();
      ctx.translate(drawingX, drawingY);
      ctx.rotate(object.angle);
      ctx.lineJoin = "round"; //make corners of shape round

      //actual body
      ctx.fillStyle = object.baseColor;
      ctx.strokeStyle = object.baseOutline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth6 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth6 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth6 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth6 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.width / clientFovMultiplier) * Math.cos(0),
        0 + (object.width / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.width / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.width / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.baseColor;
      ctx.strokeStyle = object.baseOutline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth4 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth4 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth4 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth4 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.lineWidth = 4 / clientFovMultiplier;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth5 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth5 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth5 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth5 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.baseColor;
      ctx.strokeStyle = object.baseOutline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth1 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth1 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth1 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth1 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.barrelColor;
      ctx.strokeStyle = object.barrelOutline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth2 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth2 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth2 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth2 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.lineWidth = 4 / clientFovMultiplier;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.basewidth3 / clientFovMultiplier) * Math.cos(0),
        0 + (object.basewidth3 / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.basewidth3 / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.basewidth3 / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.stroke();
      //draw barrels
      ctx.fillStyle = object.barrelColor;
      ctx.strokeStyle = object.barrelOutline;
      //trapezoid at the tip
      var barrelwidth = 140;
      var barrelheight = 28;
      //rectangle
      var barrelwidth2 = 180;
      var barrelheight2 = 28;
      //base trapezoid
      var barrelwidth3 = 140;
      var barrelheight3 = 80;
      //note that trapezoids and rectangles are drawn differently

      var barrelDistanceFromCenter = (object.width * (Math.cos(Math.PI/object.sides)));//width of middle of polygon (less than width of circle)

      function drawSancBarrel(barNum){
        var barAngle = 360/object.sides*(barNum+0.5);//half of a side, cuz barrel is in between sides
        var barrelX = Math.cos((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter+ barrelheight+ barrelheight2+ barrelheight3);//object.width * 0.9
        var barrelY = Math.sin((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter+ barrelheight+ barrelheight2+ barrelheight3);
        var barrelX2 = Math.cos((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter + barrelheight2 + barrelheight3); //move rectangle barrel downwards
        var barrelY2 = Math.sin((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter + barrelheight2 + barrelheight3);
        var barrelX3 = Math.cos((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter + barrelheight3); //move base trapezoid barrel downwards
        var barrelY3 = Math.sin((barAngle * Math.PI) / 180) * (barrelDistanceFromCenter + barrelheight3);
        //base trapezoid
        ctx.save();
        ctx.translate(
          barrelX3 / clientFovMultiplier,
          barrelY3 / clientFovMultiplier
        );
        ctx.rotate(((barAngle - 90) * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(
          ((-barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.lineTo(-barrelwidth3 / clientFovMultiplier, 0);
        ctx.lineTo(barrelwidth3 / clientFovMultiplier, 0);
        ctx.lineTo(
          ((barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.lineTo(
          ((-barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        //rectangle
        ctx.save();
        ctx.translate(
          barrelX2 / clientFovMultiplier,
          barrelY2 / clientFovMultiplier
        );
        ctx.rotate(((barAngle - 90) * Math.PI) / 180);
        ctx.fillRect(
          -barrelwidth2 / 2 / clientFovMultiplier,
          -barrelheight2 / clientFovMultiplier,
          barrelwidth2 / clientFovMultiplier,
          barrelheight2 / clientFovMultiplier
        );
        ctx.strokeRect(
          -barrelwidth2 / 2 / clientFovMultiplier,
          -barrelheight2 / clientFovMultiplier,
          barrelwidth2 / clientFovMultiplier,
          barrelheight2 / clientFovMultiplier
        );
        ctx.restore();
        //trapezium at the tip
        ctx.save();
        ctx.translate(
          barrelX / clientFovMultiplier,
          barrelY / clientFovMultiplier
        );
        ctx.rotate(((barAngle - 90) * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(-barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.lineTo(
          -barrelwidth / clientFovMultiplier,
          -barrelheight / clientFovMultiplier
        );
        ctx.lineTo(
          barrelwidth / clientFovMultiplier,
          -barrelheight / clientFovMultiplier
        );
        ctx.lineTo(barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.lineTo(-barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      for (let i = 0; i < object.sides; i++) {
        drawSancBarrel(i);
      }
      //draw aura
      ctx.fillStyle = object.auraColor;
      ctx.lineWidth = 4 / clientFovMultiplier;
      ctx.beginPath();
      ctx.moveTo(
        0 + (object.auraWidth / clientFovMultiplier) * Math.cos(0),
        0 + (object.auraWidth / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= object.sides + 1; i += 1) {
        ctx.lineTo(
          0 +
            (object.auraWidth / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / object.sides),
          0 +
            (object.auraWidth / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / object.sides)
        );
      }
      ctx.fill();
      ctx.lineJoin = "miter"; //change back
      ctx.restore();
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "player") {
      var spawnProtectionFlashDuration = 3; //higher number indicates longer duration between flashes.
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = object.deadOpacity;
      }
      //draw players
      ctx.save(); //save so later can restore
      //translate canvas to location of player so that the player is at 0,0 coordinates, allowing rotation around the center of player's body
      ctx.translate(drawingX, drawingY);

      let objectangle = object.angle;
      if (
        id == playerstring &&
        object.autorotate != "yes" &&
        object.fastautorotate != "yes"
      ) {
        //if this player is the tank that the client is controlling
        objectangle = clientAngle;
        ctx.rotate(clientAngle); //instead of using client's actual tank angle, use the angle to the mouse. this reduces lag effect
      } else {
        ctx.rotate(object.angle);
      }

      let spawnProtect = "no";
      if (object.spawnProtection < object.spawnProtectionDuration && object.spawnProtection % spawnProtectionFlashDuration == 0) {
        spawnProtect = "yes";
      }

      let playercolor = "undefined";
      let playeroutline = "undefined";
      let eternal = "no";
      if (object.team == "none") {
        if (id == playerstring) {
          playercolor = bodyColors.blue.col;
          playeroutline = bodyColors.blue.outline;
          if (object.hit > 0 || spawnProtect == "yes") {
            playercolor = bodyColors.blue.hitCol
            playeroutline = bodyColors.blue.hitOutline
          }
        }
        else{
          playercolor = bodyColors.red.col;
          playeroutline = bodyColors.red.outline;
          if (object.hit > 0 || spawnProtect == "yes") {
            playercolor = bodyColors.red.hitCol
            playeroutline = bodyColors.red.hitOutline
          }
        }
      } else if (bodyColors.hasOwnProperty(object.team)) {
          playercolor = bodyColors[object.team].col;
          playeroutline = bodyColors[object.team].outline;
          if (object.hit > 0 || spawnProtect == "yes") {
            playercolor = bodyColors[object.team].hitCol;
            playeroutline = bodyColors[object.team].hitOutline;
          }
          if (object.team == "eternal"){
            eternal = "yes";
          }
      }
      if (object.developer == "yes") {
        //if a developer
        playercolor = object.color;
        playeroutline = object.outline;
      }
      
      //store player color for upgrade buttons
      if (id == playerstring){
        playerBodyCol = playercolor;
        playerBodyOutline = playeroutline;
      }

      drawPlayer(ctx, object, clientFovMultiplier, spawnProtect, playercolor, playeroutline, eternal, objectangle, id)//draw barrel and body
      ctx.restore(); //restore coordinates to saved

      //write player name if not the client's tank

      //draw player health
      if (object.health < object.maxhealth) {
        //draw health bar background
        var w = (object.width / clientFovMultiplier) * 2;
        var h = 7 / clientFovMultiplier;
        var r = h / 2;
        var x = drawingX - object.width / clientFovMultiplier;
        var y = drawingY + object.width / clientFovMultiplier + 10;
        ctx.fillStyle = "black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2.5 / clientFovMultiplier;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        //draw health bar
        if (object.health > 0) {
          w = (w / object.maxhealth) * object.health;
          //if (id == playerstring) {
            //if this player is the tank that the client is controlling
            if (object.team == "none") {
              if (id == playerstring) {
                ctx.fillStyle = bodyColors.blue.col;
              }
              else{
                ctx.fillStyle = bodyColors.red.col;
              }
            } else if (bodyColors.hasOwnProperty(object.team)) {
              ctx.fillStyle = bodyColors[object.team].col;
            }
          if (r * 2 > w) {
            //prevent weird shape when radius more than width
            r = w / 2;
            y += (h - w) / 2; //move health bar so that it is centered vertically in black bar
            h = w;
          }
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }

      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = 1.0; //reset opacity
      }
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "portal") {
      //draw the aura below the portal
      var auraSpeed = 75; //higher number means slower speed
      var auraWidth = 4; //reative to portal size
      var portalAuraSize = object.timer % auraSpeed;
      var portalwidth = portalwidths[id]; //use this for portal width. it keeps track size changes when players touch portal
      var portalsizeincrease = portalwidths[id] / object.width; //increase in width when someone touch it (needed for the spikes)
      //first aura
      var opacityCalculation =
        1 - ((auraWidth / auraSpeed) * portalAuraSize) / auraWidth; //goes from 0 to 0.3
      if (opacityCalculation > 0.3) {
        //max opacity for portal aura
        opacityCalculation = 0.3;
      }
      if (object.hasOwnProperty("red")) {
        //if portal is radiant
        ctx.fillStyle =
          "rgba(" +
          object.red +
          ", " +
          object.green +
          ", " +
          object.blue +
          "," +
          opacityCalculation +
          ")";
      } else {
        ctx.fillStyle =
          "rgba(" + object.color + "," + opacityCalculation + ")";
      }
      if ((portalwidth * ((auraWidth / auraSpeed) * portalAuraSize)) /
          clientFovMultiplier > 0){
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          (portalwidth * ((auraWidth / auraSpeed) * portalAuraSize)) /
            clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
      //second smaller aura
      portalAuraSize = (object.timer - auraSpeed / 2) % auraSpeed;
      if (portalAuraSize > 0) {
        var opacityCalculation =
          1 - ((auraWidth / auraSpeed) * portalAuraSize) / auraWidth;
        if (opacityCalculation > 0.3) {
          //max opacity for portal aura
          opacityCalculation = 0.3;
        }
        if (object.hasOwnProperty("red")) {
          //if portal is radiant
          ctx.fillStyle =
            "rgba(" +
            object.red +
            ", " +
            object.green +
            ", " +
            object.blue +
            "," +
            opacityCalculation +
            ")";
        } else {
          ctx.fillStyle =
            "rgba(" + object.color + "," + opacityCalculation + ")";
        }
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          (portalwidth * ((auraWidth / auraSpeed) * portalAuraSize)) /
            clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = object.deadOpacity;
      }
      //drawing portals
      //create gradient
      //const gradient = ctx.createRadialGradient(drawingX, drawingY, object.width/3/clientFovMultiplier, drawingX, drawingY, object.width/clientFovMultiplier);

      // Add two color stops
      //caluclate color of outline of portal based on time until it die
      var portalColorCalc = object.timer / object.maxtimer;
      var portalColor = 255 - portalColorCalc * 255;
      var portalRGB =
        "rgb(" +
        portalColor +
        "," +
        portalColor +
        "," +
        portalColor +
        ")";
      var portalRGBoutline =
        "rgb(" +
        (portalColor - 20) +
        "," +
        (portalColor - 20) +
        "," +
        (portalColor - 20) +
        ")";
      if (object.ruptured == 1) {
        //portal is ruptured!
        //draw the stars
        ctx.save(); //save so later can restore
        ctx.translate(drawingX, drawingY);
        ctx.fillStyle = "white";
        ctx.strokeStyle = "lightgrey";
        ctx.lineWidth = 3 / clientFovMultiplier;
        ctx.lineJoin = "round";
        //first star: 3 spikes
        ctx.rotate((extraSpikeRotate * Math.PI) / 180);
        var numberOfSpikes = 3;
        var outerRadius =
          ((object.width * 3) / clientFovMultiplier) * portalsizeincrease;
        var innerRadius =
          (object.width / 3 / clientFovMultiplier) * portalsizeincrease;
        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.rotate((-extraSpikeRotate * Math.PI) / 180);
        //second star: 6 spikes in opposite direction
        ctx.rotate(((360 - extraSpikeRotate) * 2 * Math.PI) / 180);
        var numberOfSpikes = 6;
        var outerRadius =
          ((object.width * 1.5) / clientFovMultiplier) *
          portalsizeincrease;
        var innerRadius =
          (object.width / 1.2 / clientFovMultiplier) * portalsizeincrease;
        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.rotate((-(360 - extraSpikeRotate) * 2 * Math.PI) / 180);
        //third star: 6 spikes
        ctx.rotate((extraSpikeRotate * 2 * Math.PI) / 180);
        var numberOfSpikes = 6;
        var outerRadius =
          ((object.width * 1.5) / clientFovMultiplier) *
          portalsizeincrease;
        var innerRadius =
          (object.width / 1.2 / clientFovMultiplier) * portalsizeincrease;
        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.rotate((-extraSpikeRotate * 2 * Math.PI) / 180);
        //fourth star: 6 dark spikes in opposite direction
        ctx.fillStyle = portalRGB;
        ctx.strokeStyle = portalRGBoutline;
        ctx.rotate(((360 - extraSpikeRotate) * 3 * Math.PI) / 180); //times 2 to make it faster
        var numberOfSpikes = 6;
        var outerRadius =
          ((object.width * 1.5) / clientFovMultiplier) *
          portalsizeincrease;
        var innerRadius =
          (object.width / 2 / clientFovMultiplier) * portalsizeincrease;
        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.rotate((-(360 - extraSpikeRotate) * 3 * Math.PI) / 180);
        //fifth star: tiny black spikes
        ctx.rotate((extraSpikeRotate * 3 * Math.PI) / 180); //times 2 to make it faster
        var numberOfSpikes = 6;
        var outerRadius =
          ((object.width * 1.25) / clientFovMultiplier) *
          portalsizeincrease;
        var innerRadius =
          (object.width / 4 / clientFovMultiplier) * portalsizeincrease;
        var rot = (Math.PI / 2) * 3;
        var x = 0;
        var y = 0;
        ctx.beginPath();
        ctx.moveTo(0, 0 - outerRadius);
        for (i = 0; i < numberOfSpikes; i++) {
          x = 0 + Math.cos(rot) * outerRadius;
          y = 0 + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
          x = 0 + Math.cos(rot) * innerRadius;
          y = 0 + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += Math.PI / numberOfSpikes;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.rotate((-extraSpikeRotate * 3 * Math.PI) / 180);
        ctx.restore();
        ctx.lineJoin = "miter";
      }
      ctx.fillStyle = portalRGB;
      ctx.strokeStyle = portalRGBoutline;
      ctx.lineWidth = 3 / clientFovMultiplier;
      ctx.beginPath();
      ctx.arc(
        drawingX,
        drawingY,
        portalwidth / clientFovMultiplier,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
      if (object.hasOwnProperty("deadOpacity")) {
        //if this is an animation of a dead object
        ctx.globalAlpha = 1.0; //reset opacity
      }

      //spawn particles
      var choosing = Math.floor(Math.random() * 3); //choose if particle spawn. Lower number means more particles
      if (choosing == 1) {
        var angleDegrees = Math.floor(Math.random() * 360); //choose angle in degrees
        var angleRadians = (angleDegrees * Math.PI) / 180; //convert to radians
        portalparticles[particleID] = {
          angle: angleRadians,
          x: object.x,
          y: object.y,
          width: 50,
          height: 50,
          speed: 10,
          timer: 30,
          maxtimer: 15, //difference between timer and maxtimer is the opacity change of the particle. Larger difference means more or less transparent
          color: "white",
          outline: "lightgrey",
          type: "particle",
        };
        particleID++;
      }

      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "Fixedportal") {
      //drawing rectangular fixed portals, e.g. the portal at top left corner of dune
      ctx.save(); //save so later can restore
      ctx.translate(drawingX, drawingY); //translate so white portal is at 0,0 coordinates so can rotate around center of portal
      ctx.rotate((object.angleDegrees * Math.PI) / 180); //rotate portal
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.fillRect(
        -object.width / 2 / clientFovMultiplier,
        -object.height / 2 / clientFovMultiplier,
        object.width / clientFovMultiplier,
        object.height / clientFovMultiplier
      );
      ctx.strokeRect(
        -object.width / 2 / clientFovMultiplier,
        -object.height / 2 / clientFovMultiplier,
        object.width / clientFovMultiplier,
        object.height / clientFovMultiplier
      );
      ctx.globalAlpha = 0.7; //transparency
      ctx.fillStyle = object.color2;
      ctx.fillRect(
        -object.width / clientFovMultiplier,
        -object.height / clientFovMultiplier,
        (object.width * 2) / clientFovMultiplier,
        (object.height * 2) / clientFovMultiplier
      );
      ctx.strokeRect(
        -object.width / clientFovMultiplier,
        -object.height / clientFovMultiplier,
        (object.width * 2) / clientFovMultiplier,
        (object.height * 2) / clientFovMultiplier
      );
      ctx.globalAlpha = 1.0; //reset transparency
      ctx.restore(); //restore after translating
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / 2 / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    } else if (object.type == "particle") {
      //draw particles
      if (object.timer <= 10){
        ctx.globalAlpha = object.timer / 10;
      }
      else if (object.timer >= object.maxtimer-10 && (object.source == "dune" || object.source == "crossroads")) {
        ctx.globalAlpha = ((((object.timer - object.maxtimer) + 10) - 10) * -1) / 10;
      }
      //ctx.globalAlpha = object.timer / object.maxtimer;
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;

      ctx.lineWidth = 3 / clientFovMultiplier;
      ctx.beginPath();
      ctx.arc(
        drawingX,
        drawingY,
        object.width / clientFovMultiplier,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (object.type == "wall") {
      //ctx.fillStyle = "#232323";
      ctx.fillStyle = "rgba(15, 15, 15, .5)";//crossroads wall color
      if (gamelocation == "sanctuary"){
        ctx.fillStyle = "rgba(40,40,40, .5)";//sanctuary wall color
      }
      else if (gamelocation == "cavern"){
        ctx.fillStyle = "black";//cavern wall color
      }
      ctx.fillRect(
        drawingX,
        drawingY,
        object.w / clientFovMultiplier,
        object.h / clientFovMultiplier
      );
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          drawingX,
          drawingY,
          object.w / clientFovMultiplier,
          object.h / clientFovMultiplier
        );
      }
    } else if (object.type == "gate") {
      if (gamelocation == "cavern"){//cavern
        ctx.save();
        ctx.translate(drawingX, drawingY);
        ctx.rotate(object.angle/180*Math.PI);
        //draw white rectangle below
        ctx.fillStyle = "rgba(255,255,255,.7)";
        ctx.strokeStyle = "white";
        //FIRST WHITE RECTANGLE
        ctx.globalAlpha = 1.0 * (endGate - gateTimer) / (endGate - 1 - startGate);//gateTimer increases from 0.5 to 9, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.globalAlpha = 1.0;
        //SECOND WHITE RECTANGLE
        let gateTimer2 = gateTimer - endGate/2;
        if (gateTimer2 < startGate){
          gateTimer2 = endGate - (startGate - gateTimer2)
        }
        ctx.globalAlpha = 1.0 * (endGate - gateTimer2) / (endGate - 1 - startGate);//gateTimer increases from 1 to 7, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        //draw arrows
        for (var i = 0; i < gatearrow.length; i++) {
          let y = ((object.height / clientFovMultiplier * 9)/2 + object.height / clientFovMultiplier/2)/45*(gatearrow[i]-45);
          let arrowwidth = 25/clientFovMultiplier;//half of entire width
          let arrowheight = 25/clientFovMultiplier;
          //draw 3 arrows in a row
          if (gatearrow[i] < 20){
            ctx.globalAlpha = gatearrow[i]/20;
          }
          else if (gatearrow[i] > 70){
            ctx.globalAlpha = (90-gatearrow[i])/20;
          }
          else{
            ctx.globalAlpha = 1;
          }
          ctx.lineWidth = 3/clientFovMultiplier;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.moveTo(y-arrowheight, 0-arrowwidth);
          ctx.lineTo(y, 0);
          ctx.lineTo(y-arrowheight, 0+arrowwidth);
          ctx.moveTo(y-arrowheight, object.width/clientFovMultiplier/3-arrowwidth);
          ctx.lineTo(y, object.width/clientFovMultiplier/3);
          ctx.lineTo(y-arrowheight, object.width/clientFovMultiplier/3+arrowwidth);
          ctx.moveTo(y-arrowheight, -object.width/clientFovMultiplier/3-arrowwidth);
          ctx.lineTo(y, -object.width/clientFovMultiplier/3);
          ctx.lineTo(y-arrowheight, -object.width/clientFovMultiplier/3+arrowwidth);
          ctx.stroke();
          //move arrow
          gatearrow[i]+=0.1;
          if (gatearrow[i]>45 && gatearrow[i]<65){//move faster when arrow in the middle
            gatearrow[i]+=0.4;
          }
          else if (gatearrow[i]>90){
            gatearrow[i] = 0;
          }
        }
        ctx.globalAlpha = 1.0;
        //draw actual black gate
        ctx.fillStyle = "black";
        ctx.fillRect(0,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier,
          object.width / clientFovMultiplier
        );
      }
      else if (gamelocation != "sanctuary"){//cross (default)
        ctx.save();
        ctx.translate(drawingX, drawingY);
        ctx.rotate(object.angle/180*Math.PI);
        //draw white rectangle below
        ctx.fillStyle = "rgba(255,255,255,.7)";
        ctx.strokeStyle = "white";
        //FIRST WHITE RECTANGLE
        ctx.globalAlpha = 1.0 * (endGate - gateTimer) / (endGate - 1 - startGate);//gateTimer increases from 0.5 to 9, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.globalAlpha = 1.0;
        //SECOND WHITE RECTANGLE
        let gateTimer2 = gateTimer - endGate/2;
        if (gateTimer2 < startGate){
          gateTimer2 = endGate - (startGate - gateTimer2)
        }
        ctx.globalAlpha = 1.0 * (endGate - gateTimer2) / (endGate - 1 - startGate);//gateTimer increases from 1 to 7, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        ctx.globalAlpha = 1.0;
        //draw actual black gate
        ctx.fillStyle = "black";
        ctx.fillRect(0,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier,
          object.width / clientFovMultiplier
        );
      }
      else{//sanc
        ctx.save();
        ctx.translate(drawingX, drawingY);
        ctx.rotate(object.angle/180*Math.PI);
        //draw white rectangle below
        ctx.fillStyle = "rgba(0,0,0,.2)";
        ctx.strokeStyle = "rgba(0,0,0,.5)";
        //FIRST WHITE RECTANGLE
        ctx.globalAlpha = 1.0 * (endGate - gateTimer) / (endGate - 1 - startGate);//gateTimer increases from 0.5 to 9, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer,
          object.width / clientFovMultiplier
        );
        ctx.globalAlpha = 1.0;
        //SECOND WHITE RECTANGLE
        let gateTimer2 = gateTimer - endGate/2;
        if (gateTimer2 < startGate){
          gateTimer2 = endGate - (startGate - gateTimer2)
        }
        ctx.globalAlpha = 1.0 * (endGate - gateTimer2) / (endGate - 1 - startGate);//gateTimer increases from 1 to 7, this equation makes the opacity decrease from 1 to 0
        ctx.fillRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        ctx.strokeRect(
          -(object.height / clientFovMultiplier * gateTimer2)/2 + object.height / clientFovMultiplier/2,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier * gateTimer2,
          object.width / clientFovMultiplier
        );
        ctx.globalAlpha = 1.0;
        //draw actual black gate
        ctx.fillStyle = "black";
        ctx.fillRect(0,
           -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier,
          object.width / clientFovMultiplier
        );
        let numberOfSpikes = 6;
        let outerRadius = object.width / clientFovMultiplier /8;
        let innerRadius = object.width / clientFovMultiplier /25;
        let rot = (Math.PI / 2) * 3;
        let x = 0;
        let y = 0;
        for (let star = 0; star < 4; star++) {
          x = 0;
          y = 0;

          ctx.translate(object.height / clientFovMultiplier, object.width / clientFovMultiplier / 5 * (star-1.5))
          ctx.rotate(Math.PI * (endGate - gateTimer) / (endGate - 1 - startGate) /204 *360)
          ctx.beginPath();
          ctx.moveTo(0, 0 - outerRadius);
          for (i = 0; i < numberOfSpikes; i++) {
            x = 0 + Math.cos(rot) * outerRadius;
            y = 0 + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
            x = 0 + Math.cos(rot) * innerRadius;
            y = 0 + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += Math.PI / numberOfSpikes;
          }
          ctx.lineTo(0,0 - outerRadius);
          ctx.closePath();
          ctx.fill();
          ctx.rotate(-Math.PI * (endGate - gateTimer) / (endGate - 1 - startGate) /204 *360)
          ctx.translate(-object.height / clientFovMultiplier, -object.width / clientFovMultiplier / 5 * (star-1.5))
        }
      }
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.strokeRect(0,
         -object.width/2/clientFovMultiplier,
          object.height / clientFovMultiplier,
          object.width / clientFovMultiplier
        );
      }
      ctx.restore();
      //spawn particles
      if (gamelocation != "sanctuary" && gamelocation != "cavern"){
        var choosing = Math.floor(Math.random() * 3); //choose if particle spawn. Lower number means more particles
        if (choosing == 1) {
            var dir = Math.floor(Math.random() * 2); //choose angle in degrees
            if (dir == 0){
              var angleRadians = (object.angle) * Math.PI / 180; //convert to radians
            }
            else{
              var angleRadians = (object.angle - 180) * Math.PI / 180;
            }
            let randX = 0;
            let randY = 0;
            //code currently does not support particles for gates that are tilted
            //i dont see a need to add that in the near future
            if (object.angle == 0 || object.angle == 180 || object.angle == 360){
              randY = Math.floor(Math.random() * object.width) - object.width/2;
            }
            else if (object.angle == 90 || object.angle == 270){
              randX = Math.floor(Math.random() * object.width) - object.width/2;
            }
            portalparticles[particleID] = {
              angle: angleRadians,
              x: object.x + randX,
              y: object.y + randY,
              width: 50,
              height: 50,
              speed: 10,
              timer: 30,
              maxtimer: 15, //difference between timer and maxtimer is the opacity change of the particle. Larger difference means more or less transparent
              color: "white",
              outline: "lightgrey",
              type: "particle",
            };
            particleID++;
        }
      }
      else if (gamelocation != "cavern"){
        var choosing = Math.floor(Math.random() * 7); //choose if particle spawn. Lower number means more particles
        if (choosing == 1) {
          var dir = Math.floor(Math.random() * 2); //choose angle in degrees
          if (dir == 0){
            var angleRadians = (object.angle) * Math.PI / 180; //convert to radians
          }
          else{
            var angleRadians = (object.angle - 180) * Math.PI / 180;
          }
          let randX = 0;
          let randY = 0;
          //code currently does not support particles for gates that are tilted
          //i dont see a need to add that in the near future
          if (object.angle == 0 || object.angle == 180 || object.angle == 360){
            randY = Math.floor(Math.random() * object.width) - object.width/2;
          }
          else if (object.angle == 90 || object.angle == 270){
            randX = Math.floor(Math.random() * object.width) - object.width/2;
          }
          portalparticles[particleID] = {
            angle: angleRadians,
            x: object.x + randX,
            y: object.y + randY,
            width: 15,
            height: 15,
            speed: 5,
            timer: 20,
            maxtimer: 20, //difference between timer and maxtimer is the opacity change of the particle. Larger difference means more or less transparent
            color: "black",
            outline: "black",
            type: "particle",
          };
          particleID++;
        }
      }
    } else if (object.type == "def") {
      //base defender in 2tdm
      ctx.save();
      ctx.translate(drawingX, drawingY);
      ctx.rotate(object.angle);
      ctx.lineJoin = "round"; //make corners of shape round
      ctx.lineWidth = 4 / clientFovMultiplier;

      //draw octagon base
      var octagonWidth = object.width/5*6;
      ctx.fillStyle = bodyColors.asset.col;
      ctx.strokeStyle = bodyColors.asset.outline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (octagonWidth / clientFovMultiplier) * Math.cos(0),
        0 + (octagonWidth / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= 8 + 1; i += 1) {
        ctx.lineTo(
          0 +
            (octagonWidth / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / 8),
          0 +
            (octagonWidth / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / 8)
        );
      }
      ctx.fill();
      ctx.stroke();


      //draw barrels
      ctx.fillStyle = bodyColors.barrel.col;
      ctx.strokeStyle = bodyColors.barrel.outline;
      //trapezoid at the tip
      var barrelwidth = 70;
      var barrelheight = 20;
      //rectangle
      var barrelwidth2 = 90;
      var barrelheight2 = 20;
      //base trapezoid
      var barrelwidth3 = 70;
      var barrelheight3 = 60;
      //note that trapezoids and rectangles are drawn differently

      for (let i = 0; i < 4; i++) {//draw 4 barrels
        var barrelAngle = 360/4*i;
        var barrelX = Math.cos((barrelAngle * Math.PI) / 180) * object.width * 1.4;
        var barrelY = Math.sin((barrelAngle * Math.PI) / 180) * object.width * 1.4;
        var barrelX2 =
          Math.cos((barrelAngle * Math.PI) / 180) *
          (object.width * 1.4 - barrelheight); //move rectangle barrel downwards
        var barrelY2 =
          Math.sin((barrelAngle * Math.PI) / 180) *
          (object.width * 1.4 - barrelheight);
        var barrelX3 =
          Math.cos((barrelAngle * Math.PI) / 180) *
          (object.width * 1.4 - barrelheight - barrelheight2); //move base trapezoid barrel downwards
        var barrelY3 =
          Math.sin((barrelAngle * Math.PI) / 180) *
          (object.width * 1.4 - barrelheight - barrelheight2);
        //base trapezoid
        ctx.save();
        ctx.translate(
          barrelX3 / clientFovMultiplier,
          barrelY3 / clientFovMultiplier
        );
        ctx.rotate(((barrelAngle - 90) * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(
          ((-barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.lineTo(-barrelwidth3 / clientFovMultiplier, 0);
        ctx.lineTo(barrelwidth3 / clientFovMultiplier, 0);
        ctx.lineTo(
          ((barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.lineTo(
          ((-barrelwidth3 / 3) * 2) / clientFovMultiplier,
          -barrelheight3 / clientFovMultiplier
        );
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        //rectangle
        ctx.save();
        ctx.translate(
          barrelX2 / clientFovMultiplier,
          barrelY2 / clientFovMultiplier
        );
        ctx.rotate(((barrelAngle - 90) * Math.PI) / 180);
        ctx.fillRect(
          -barrelwidth2 / 2 / clientFovMultiplier,
          -barrelheight2 / clientFovMultiplier,
          barrelwidth2 / clientFovMultiplier,
          barrelheight2 / clientFovMultiplier
        );
        ctx.strokeRect(
          -barrelwidth2 / 2 / clientFovMultiplier,
          -barrelheight2 / clientFovMultiplier,
          barrelwidth2 / clientFovMultiplier,
          barrelheight2 / clientFovMultiplier
        );
        ctx.restore();
        //trapezium at the tip
        ctx.save();
        ctx.translate(
          barrelX / clientFovMultiplier,
          barrelY / clientFovMultiplier
        );
        ctx.rotate(((barrelAngle - 90) * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(-barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.lineTo(
          -barrelwidth / clientFovMultiplier,
          -barrelheight / clientFovMultiplier
        );
        ctx.lineTo(
          barrelwidth / clientFovMultiplier,
          -barrelheight / clientFovMultiplier
        );
        ctx.lineTo(barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.lineTo(-barrelwidth / 2 / clientFovMultiplier, 0);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      //draw body
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        object.width / clientFovMultiplier,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
      var octagonWidth = object.width/5*4;
      ctx.fillStyle = bodyColors.asset.col;
      ctx.strokeStyle = bodyColors.asset.outline;
      ctx.beginPath();
      ctx.moveTo(
        0 + (octagonWidth / clientFovMultiplier) * Math.cos(0),
        0 + (octagonWidth / clientFovMultiplier) * Math.sin(0)
      );
      for (var i = 1; i <= 8 + 1; i += 1) {
        ctx.lineTo(
          0 +
            (octagonWidth / clientFovMultiplier) *
              Math.cos((i * 2 * Math.PI) / 8),
          0 +
            (octagonWidth / clientFovMultiplier) *
              Math.sin((i * 2 * Math.PI) / 8)
        );
      }
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = object.color;
      ctx.strokeStyle = object.outline;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        object.width/2 / clientFovMultiplier,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();

      ctx.lineJoin = "miter"; //change back
      ctx.restore();
      if (showHitBox == "yes") {
        //draw hitbox
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
          drawingX,
          drawingY,
          object.width / clientFovMultiplier,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    }
  }
  function drawplayerdata(object, id, playerstring, auraWidth) {
    //function for drawing objects on the canvas. need to provide aura width because this fuction cannot access variables outside
    var drawingX =
      (object.x - px) / clientFovMultiplier + canvas.width / 2; //calculate the location on canvas to draw object
    var drawingY =
      (object.y - py) / clientFovMultiplier + canvas.height / 2;
    if(object.type == "player") {
      //write chats
      if (id != playerstring) {
        var firstChatY = object.width / clientFovMultiplier /5*4 + 55 / clientFovMultiplier;
      }
      else{
        var firstChatY = object.width / clientFovMultiplier /5*4;//chat nearer to player body if no need to display name
      }
      ctx.font = "700 25px Roboto";
      ctx.textAlign = "center";
      ctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
      var xpadding = 15;
      var ypadding = 10;
      var lineheight = 30;
      
      var timeWhenChatRemove = 100;//when change on server code, remember to change here too
      
      if (!(chatlist[id])){//used for animating chat positions
        chatlist[id] = JSON.parse(JSON.stringify(object.chats));
      }
      else{
        let tempArray = [];
        let messages = {};//prevent bug when multiple chats have same message
        object.chats.forEach(function (item, index) {
          let occurence = 0;//prevent bug when multiple chats have same message
          let foundit = 0;
          for (var i = 0; i < chatlist[id].length; i++) {//check if oldchats hae this message, to preserve the position for animation
            if (chatlist[id][i].chat == item.chat){
              if (messages[item.chat]){//saw a chat with the exact same message before!
                if (messages[item.chat] <= occurence){//this is a different chat
                  let k = JSON.parse(JSON.stringify(chatlist[id][i]));
                  k.time = item.time;
                  tempArray.push(k);
                  messages[chatlist[id][i].chat]++;
                  foundit = 1;
                  break
                }
                else{//this is the same chat that you saw before, continue hunting for the chat
                  occurence++;
                }
              }
              else{
                let k = JSON.parse(JSON.stringify(chatlist[id][i]));
                k.time = item.time;
                tempArray.push(k);
                messages[chatlist[id][i].chat] = 1;
                foundit = 1;
                break
              }
            }
          }
          if (foundit == 0){//new chat message
            let k = JSON.parse(JSON.stringify(item));
            k.opacity = 0;
            tempArray.push(k);
          }
        });
        chatlist[id] = tempArray;
      }

      object.chats.slice().reverse().forEach((chatObj, index) => {//slice and reverse to loop though array backwards (so older messages are above)
        ctx.fillStyle = "rgba(69,69,69,.7)";

        var longestLine = 0;

        //multiline chat
        const wrapText = function(ctx, text, x, y, maxWidth, lineHeight) {
          // First, start by splitting all of our text into words, but splitting it into an array split by spaces
          let words = text.split(' ');
          let line = ''; // This will store the text of the current line
          let testLine = ''; // This will store the text when we add a word, to test if it's too long
          let lineArray = []; // This is an array of lines, which the function will return

          // Lets iterate over each word
          for(var n = 0; n < words.length; n++) {
              // Create a test line, and measure it..
              testLine += `${words[n]} `;
              let metrics = ctx.measureText(testLine);
              let testWidth = metrics.width;
              // If the width of this test line is more than the max width
              if (testWidth > maxWidth && n > 0) {
                  // Then the line is finished, push the current line into "lineArray"
                  line = line.slice(0, -1);//remove space at the end of the line
                  lineArray.push([line, x, y]);
                  let thislinewidth = ctx.measureText(line).width;
                  if (thislinewidth > longestLine){
                    longestLine = thislinewidth;
                  }
                  // Increase the line height, so a new line is started
                  y += lineHeight;
                  // Update line and test line to use this word as the first word on the next line
                  line = `${words[n]} `;
                  testLine = `${words[n]} `;
              }
              else {
                  // If the test line is still less than the max width, then add the word to the current line
                  line += `${words[n]} `;
              }
              // If we never reach the full max width, then there is only one line.. so push it into the lineArray so we return something
              if(n === words.length - 1) {
                  line = line.slice(0, -1);//remove space at the end of the line
                  lineArray.push([line, x, y]);
                  let thislinewidth = ctx.measureText(line).width;
                  if (thislinewidth > longestLine){
                    longestLine = thislinewidth;
                  }
              }
          }
          // Return the line array
          return lineArray;
        }

        let isTypingAnimation = "no";
        if (chatObj.chat == "typingAnim"){
          isTypingAnimation = "yes";
          chatObj.chat = "anim"
        }
        let wrappedText = wrapText(ctx, chatObj.chat, drawingX, drawingY - firstChatY, 900, lineheight);//split message into multiline text
        //draw rect
        var w = longestLine + xpadding * 2;
        var h = lineheight * wrappedText.length + ypadding * 2;
        if (wrappedText.length == 1){//remove spacing between text for single-line text
          h = 25 + ypadding * 2;
        }
        var r = 15;
        var x = drawingX - longestLine / 2 - xpadding;
        var y = drawingY - firstChatY - ypadding - h - 20;//the actual y location of this chat message
        //aniamte towards this y position
        //remember that the loop is reversed, so indexes are reversed here too
        let thischat = chatlist[id][chatlist[id].length - 1 - index];
        let diffpos = 0;
        if (!thischat.y){
          thischat.y = y;
        }
        else{
          if (y > thischat.y){
            thischat.y+=(y - thischat.y)/2*deltaTime;
            if (y < thischat.y){
              thischat.y = y;
            }
          }
          else if (y < thischat.y){
            thischat.y-=(thischat.y - y)/2*deltaTime;
            if (y > thischat.y){
              thischat.y = y;
            }
          }
          if (Math.abs(y - thischat.y)<0.1){//small difference between current position and actual position
            thischat.y = y;
          }
          diffpos = y - thischat.y;
          y = thischat.y;
        }
        if (thischat.opacity < 1){
          thischat.opacity+=0.1;
        }
        ctx.globalAlpha = thischat.opacity;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
        if (index == 0){
          //if this is first chat message, draw triangle
          let trianglewidth = 20;
          let triangleheight = 10;
          ctx.beginPath();
          ctx.moveTo(x + w/2 - trianglewidth/2, y + h);
          ctx.lineTo(x + w/2 + trianglewidth/2, y + h);
          ctx.lineTo(x + w/2, y + h + triangleheight);
          ctx.fill();
        }
        //write words
        ctx.fillStyle = "white";
        wrappedText.forEach(function(item) {
          if (isTypingAnimation == "no"){
            ctx.fillText(item[0], item[1], item[2]-h-diffpos);//write text
          }
          else{//typing animation
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
              let radiusIncrease = 0;
              if (typingAnimation <= 3*(i+1)+3*i && typingAnimation >= 6*i){
                radiusIncrease = (typingAnimation - 6*i);
              }
              else if (typingAnimation <= 6*(i+1) && typingAnimation >= 6*i){
                radiusIncrease = (6*(i+1) - typingAnimation);
              }
              if (radiusIncrease < 0){
                radiusIncrease = 0;
              }
              ctx.arc(item[1]+(i-1)*18, item[2]-h-diffpos-6, 5+radiusIncrease, 0, 2 * Math.PI);
            }
            ctx.fill();
          }
        })
        ctx.globalAlpha = 1.0;
        firstChatY += (h + 10); //height of chat plus space between chats
      });
      ctx.lineJoin = "miter"; //change it back
      
      if (id != playerstring) {
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 8 / clientFovMultiplier;
        ctx.font = "700 " + 35 / clientFovMultiplier + "px Roboto";
        ctx.textAlign = "center";
        ctx.miterLimit = 2;//prevent text spikes, alternative to linejoin round
        //ctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        //note: if you stroke then fill, the words will be thicker and nicer. If you fill then stroke, the words are thinner.
        if (object.name == "unnamed"){
          //this guy is unnamed, add a 3 digit identifier
          let thisID = id.substr(id.length - 3);//last 3 digits of ID
          object.name += (" #" + thisID);
        }
        ctx.strokeText(
          object.name,
          drawingX,
          drawingY - (object.width + 40) / clientFovMultiplier
        );
        ctx.fillText(
          object.name,
          drawingX,
          drawingY - (object.width + 40) / clientFovMultiplier
        );
        //write player level
        ctx.font = "700 " + 18 / clientFovMultiplier + "px Roboto";
        ctx.strokeText(
          "Lvl " +
            object.level +
            " " +
            object.tankType +
            "-" +
            object.bodyType,
          drawingX,
          drawingY - (object.width + 10) / clientFovMultiplier
        );
        ctx.fillText(
          "Lvl " +
            object.level +
            " " +
            object.tankType +
            "-" +
            object.bodyType,
          drawingX,
          drawingY - (object.width + 10) / clientFovMultiplier
        );
        ctx.lineJoin = "miter"; //change it back
      }
    }
}

  //skill points variables
  var currentStatPoints = 0;
  var extraPoints = 0;

function changeGamemode(dir){
  if (dir == "right") {
        currentGmSelector.transition = -1.1; //turn on animation for background black oval thingy
        currentGmSelector.animateDir = "right";
        
        if (currentGmSelector.gamemode - 1 >= 0) {
          currentGmSelector.gamemode--;
        } else {
          currentGmSelector.gamemode = gamemodes.length - 1;
        }
        //disconnect and connect to newly selected gamemode
        socket.close();//disconnect from current server
        playButton.style.display = "none";
        nameInput.style.display = "none";
        connectedopacity = 0;//allow opacity animation to start
        connected = "no";
        gamemodeBgFoV[currentGmSelector.gamemode] = 0.1;
        connectServer(serverlist[gamemodes[currentGmSelector.gamemode]],"no")
        if (currentGmSelector.gamemode == 0){
          gamelocation = "arena"
        }
        else if (currentGmSelector.gamemode == 1){
          gamelocation = "2tdm"
        }
        else if (currentGmSelector.gamemode == 2){
          gamelocation = "4tdm"
        }
        else if (currentGmSelector.gamemode == 3){
          gamelocation = "tank-editor"
        }
        console.log("Connecting to "+serverlist[gamemodes[currentGmSelector.gamemode]])
        joinedWhichGM = gamemodes[currentGmSelector.gamemode];//respawn in the gamemode which you spawned in after you died
      } else if (dir == "left") {
        currentGmSelector.transition = 2.1;
        currentGmSelector.animateDir = "left";
        if (currentGmSelector.gamemode + 1 < gamemodes.length) {
          //if have one more gamemode to the right
          currentGmSelector.gamemode++;
        } else {
          //no more gamemodes, so go back to first one
          currentGmSelector.gamemode = 0;
        }
        //disconnect and connect to newly selected gamemode
        socket.close();//disconnect from current server
        playButton.style.display = "none";
        nameInput.style.display = "none";
        connectedopacity = 0;
        connected = "no";
        gamemodeBgFoV[currentGmSelector.gamemode] = 0.1;
        connectServer(serverlist[gamemodes[currentGmSelector.gamemode]],"no")
        if (currentGmSelector.gamemode == 0){
          gamelocation = "arena"
        }
        else if (currentGmSelector.gamemode == 1){
          gamelocation = "2tdm"
        }
        else if (currentGmSelector.gamemode == 2){
          gamelocation = "4tdm"
        }
        else if (currentGmSelector.gamemode == 3){
          gamelocation = "tank-editor"
        }
        console.log("Connecting to "+serverlist[gamemodes[currentGmSelector.gamemode]])
        joinedWhichGM = gamemodes[currentGmSelector.gamemode];//respawn in the gamemode which you spawned in after you died
      } else if (dir == "regionright") {
        //disconnect and connect to newly selected gamemode
        var gmServers = 1;
        if(currentGmSelector.gamemode == 3) {
          ++gmServers;
        }
        ++currentGamemodeRegion;
        if(currentGamemodeRegion+1 > gmServers) {
          currentGamemodeRegion = 0;
        }
        socket.close();//disconnect from current server
        playButton.style.display = "none";
        nameInput.style.display = "none";
        connected = "no";
        connectServer(serverlist[gamemodes[currentGmSelector.gamemode]],"no")
        if (currentGmSelector.gamemode == 0){
          gamelocation = "arena"
        }
        else if (currentGmSelector.gamemode == 1){
          gamelocation = "2tdm"
        }
        else if (currentGmSelector.gamemode == 2){
          gamelocation = "4tdm"
        }
        else if (currentGmSelector.gamemode == 3){
          gamelocation = "tank-editor"
        }
        console.log("Connecting to "+serverlist[gamemodes[currentGmSelector.gamemode]][currentGamemodeRegion])
        joinedWhichGM = gamemodes[currentGmSelector.gamemode];//respawn in the gamemode which you spawned in after you died
      } else if (dir == "regionleft") {
        //disconnect and connect to newly selected gamemode
        var gmServers = 1;
        if(currentGmSelector.gamemode == 3) {
          ++gmServers;
        }
        --currentGamemodeRegion;
        if(currentGamemodeRegion < 0) {
          currentGamemodeRegion = gmServers-1;
        }
        socket.close();//disconnect from current server
        playButton.style.display = "none";
        nameInput.style.display = "none";
        connected = "no";
        connectServer(serverlist[gamemodes[currentGmSelector.gamemode]],"no")
        if (currentGmSelector.gamemode == 0){
          gamelocation = "arena"
        }
        else if (currentGmSelector.gamemode == 1){
          gamelocation = "2tdm"
        }
        else if (currentGmSelector.gamemode == 2){
          gamelocation = "4tdm"
        }
        else if (currentGmSelector.gamemode == 3){
          gamelocation = "tank-editor"
        }
        console.log("Connecting to "+serverlist[gamemodes[currentGmSelector.gamemode]][currentGamemodeRegion])
        joinedWhichGM = gamemodes[currentGmSelector.gamemode];//respawn in the gamemode which you spawned in after you died
      }
}

  //client send stuff to server
  var autorotate = "no";//keep track of state to create notification
  var autofire = "no";
  var fastautorotate = "no";
  var passivemode = "no";
  //keep track of whether key is pressed down or not to prevent packet sent multiple times when holding down key
  var downpressed = "no";
  var uppressed = "no";
  var leftpressed = "no";
  var rightpressed = "no";
  $("html").keydown(function (e) {
      if(!$("input,textarea").is(":focus")){//if all input and text area do not have focus

      //prevents triggering commands when typing in input boxes
      //console.log(e)
      if (e.key == "ArrowDown" || e.key == "s" || e.key == "S") {
        if (downpressed == "no"){
          var packet = JSON.stringify(["down"]);
          socket.send(packet)
          downpressed = "yes";
        }
      } else if (e.key == "ArrowUp" || e.key == "w" || e.key == "W") {
        if (uppressed == "no"){
          var packet = JSON.stringify(["up"]);
          socket.send(packet)
          uppressed = "yes";
        }
      } else if (e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        if (leftpressed == "no"){
          leftpressed = "yes";//put this before sending packet to prevent sending error from causing weird movement, usually happen when switching server in main menu using left and right keys
          var packet = JSON.stringify(["left"]);
          socket.send(packet)
        }
          if (gameStart < 1 && gameStart > -1){
            changeGamemode("right")
          }
      } else if (e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
        if (rightpressed == "no"){
          rightpressed = "yes";
          var packet = JSON.stringify(["right"]);
          socket.send(packet)
        }
        if (gameStart < 1 && gameStart > -1){
            changeGamemode("left")
          }
      } else if (e.key == "Shift"){
        var packet = JSON.stringify(["mousePressed", 3]);
        socket.send(packet)
        //e.which refers to whether it's lfet or right click. leftclick is 1, rightclick is 3
      } else if (e.key == "e" || e.key == "E") {
        var packet = JSON.stringify(["auto-fire"]);
        socket.send(packet)
        if (autofire == "no"){
          createNotif("Auto Fire (E): ON",defaultNotifColor,3000)
          autofire = "yes";
        }
        else{
          createNotif("Auto Fire (E): OFF",defaultNotifColor,3000)
          autofire = "no";
        }
      } else if (e.key == "c" || e.key == "C") {
        var packet = JSON.stringify(["auto-rotate"]);
        socket.send(packet)
        if (autorotate == "no"){
          createNotif("Auto Rotate (C): ON",defaultNotifColor,3000)
          autorotate = "yes";
        }
        else{
          createNotif("Auto Rotate (C): OFF",defaultNotifColor,3000)
          autorotate = "no";
        }
      } else if (e.key == "f" || e.key == "F") {
        var packet = JSON.stringify(["fast-auto-rotate"]);
        socket.send(packet)
        if (fastautorotate == "no"){
          createNotif("Fast Auto Rotate (F): ON",defaultNotifColor,3000)
          fastautorotate = "yes";
        }
        else{
          createNotif("Fast Auto Rotate (F): OFF",defaultNotifColor,3000)
          fastautorotate = "no";
        }
      } else if (e.key == "x" || e.key == "X") {
        if (keylock == "yes"){
          keylock = "no";
          createNotif("Spin Lock (X): OFF",defaultNotifColor,3000)
        }
        else{
          keylock = "yes";
          createNotif("Spin Lock (X): ON",defaultNotifColor,3000)
        }
      } else if (e.key == "m" || e.key == "M") {
        //opening and closing debug info box
        if (showDebug == "no") {
          //if debug closed
          showDebug = "yes"; //open debug
          //notification
          createNotif("Debug Mode (M): ON",defaultNotifColor,3000)
        } else if (showDebug == "yes") {
          //if debug open
          showDebug = "no"; //hide debug
          //notification
          createNotif("Debug Mode (M): OFF",defaultNotifColor,3000)
        }
      } else if (e.key == "h" || e.key == "H") {
        //toggle hitbox
        if (showHitBox == "no") {
          showHitBox = "yes";
          createNotif("Hitbox (H): ON",defaultNotifColor,3000)
        } else if (showHitBox == "yes") {
          showHitBox = "no";
          createNotif("Hitbox (H): OFF",defaultNotifColor,3000)
        }
      } else if (e.key == "i" || e.key == "I") {
        //notification with more info about game
        //use \n for new line
        //note: will not work properly anymore as long notifications not supported
        //createNotif("Controls:\nMouse: point barrel in direction\nW,A,S,D or arrow keys: move tank\nE: toggle auto-fire\nC: toggle auto-rotate\nF: toggle 3x fast auto-rotate\nU: toggle body upgrade tree\nY: toggle weapon upgrade tree\nM: toggle debug\nI: show this notification\nP: passive mode (bullets and auras do not do damage)\nO: open settings\nH: toggle hitbox\nX: spin lock\nUpgrade levels: 1, 5, 20, 45, 100, 111","rgba(15,15,15)",5000)
      } else if (e.key == "p" || e.key == "P") {
        var packet = JSON.stringify(["passive-mode"]);
        socket.send(packet)
        if (passivemode == "no"){
          createNotif("Passive Mode (P): ON",defaultNotifColor,3000)
          passivemode = "yes";
        }
        else{
          createNotif("Passive Mode (P): OFF",defaultNotifColor,3000)
          passivemode = "no";
        }
      } else if (e.key == "Enter" && gameStart >= 1) {
        //if press enter, add cursor to chat inputbox
        document.getElementById("chat").focus(); //add cursor to input field
      } else if (e.key == "Enter" && gameStart < 1) {
        if (gameStart == -1){
          //at death screen
          exitDeathScreen();
        }
        else{
          //if press enter at homepage, enter the game
          gameStart = 1;
          currentGmSelector.hover1 = "no";
          currentGmSelector.hover2 = "no";
          currentGmSelector.hover3 = "no";
          currentGmSelector.hover4 = "no";
          randomNotif();
        }
      } else if (e.key == "y" || e.key == "Y") {
        if (showUpgradeTree == "no") {
          showUpgradeTree = "yes";
          showBodyUpgradeTree = "no";
        } else {
          showUpgradeTree = "no";
        }
      } else if (e.key == "u" || e.key == "U") {
        if (showBodyUpgradeTree == "no") {
          showBodyUpgradeTree = "yes";
          showUpgradeTree = "no";
        } else {
          showBodyUpgradeTree = "no";
        }
      } else if (e.key == "o" || e.key == "O") {
        //open and close settings
        if (settingspopup.style.display == "none" || settingspopup.style.display == "") {//if settings popup hidden or havent opened before
          settingspopup.style.display = "block";
          document.getElementById("screenDarken").style.display = "block";
          document.getElementById("screenLighten").style.display = "none";
        } else {
          settingspopup.style.display = "none";
          document.getElementById("screenDarken").style.display = "none";
          document.getElementById("screenLighten").style.display = "block";
          setTimeout(function () {
            document.getElementById("screenLighten").style.display = "none";
          }, 500); //after animation finish, make buttons below darkness clickable
        }
      } else if (
        (e.key == "1" ||
          e.key == "2" ||
          e.key == "3" ||
          e.key == "4" ||
          e.key == "5" ||
          e.key == "6" ||
          e.key == "7" ||
          e.key == "8") &&
        extraPoints > 0
      ) {
        //skill points
        var packet = JSON.stringify(["upgradeSkillPoints", e.key]);
        socket.send(packet)
      } else if (e.key == " ") {
        //space bar
        var packet = JSON.stringify(["mousePressed"]);
        socket.send(packet)
      }
    } else if (
      document.activeElement === nameInput
    ) {
      //if name input box is selected
      if (e.key == "Enter") {
        //if press enter, do the same thing as when pressing the play button
        gameStart = 1;
        randomNotif();
      }
    } else if (
      document.activeElement === document.getElementById("chat")
    ) {
      //if chat input box is selected
      if (e.key == "Enter") {
        //if press enter, send chat message
        var yourChat = document.getElementById("chat").value; //get message
        var packet = JSON.stringify(["chat", yourChat]);
        socket.send(packet)
        document.getElementById("chat").value = ""; //clear input field
        document.getElementById("chat").blur(); //remove cursor
      }
    } else if (
      document.activeElement === document.getElementById("devtoken")
    ) {
      //if dev token input box is selected
      if (e.key == "Enter") {
        //if press enter, send chat message
        var devToken = document.getElementById("devtoken").value; //get inputted token
        var packet = JSON.stringify(["developerTest", devToken]);
        socket.send(packet)
        document.getElementById("devtoken").value = ""; //clear input field
        document.getElementById("devtoken").blur(); //remove cursor
      }
    }
  });
  $("html").keyup(function (e) {
    if (document.activeElement !== nameInput) {
      //if the name input box is not selected (prevents triggering commands when typing name)
      //console.log(e)
      if (e.key == "ArrowDown" || e.key == "s" || e.key == "S") {
        if (downpressed == "yes"){
          var packet = JSON.stringify(["downRelease"]);
          socket.send(packet)
          downpressed = "no";
        }
      } else if (e.key == "ArrowUp" || e.key == "w" || e.key == "W") {
        if (uppressed == "yes"){
          var packet = JSON.stringify(["upRelease"]);
          socket.send(packet)
          uppressed = "no";
        }
      } else if (e.key == "ArrowLeft" || e.key == "a" || e.key == "A") {
        if (leftpressed == "yes"){
          leftpressed = "no";
          var packet = JSON.stringify(["leftRelease"]);
          socket.send(packet)
        }
      } else if (e.key == "ArrowRight" || e.key == "d" || e.key == "D") {
        if (rightpressed == "yes"){
          rightpressed = "no";
          var packet = JSON.stringify(["rightRelease"]);
          socket.send(packet)
        }
      } else if (e.key == " ") {
         var packet = JSON.stringify(["mouseReleased"]);
        socket.send(packet)
      } else if (e.key == "Shift"){
        var packet = JSON.stringify(["mousePressed", 1]);//stop drone repel by left click
        socket.send(packet)
        var packet = JSON.stringify(["mouseReleased"]);
        socket.send(packet)
      }
    }
  });

  var mousex = 0;
  var mousey = 0;

  //mouse move listener
  if (mobile == "no") {
    //if not mobile
    $("html").mousemove(function (e) {
      mousex = e.pageX;
      mousey = e.pageY;

      var angle = Math.atan2(
        window.innerHeight / 2 - mousey,
        window.innerWidth / 2 - mousex
      );
      //below code stores the player's angle (only for the player the client is controlling)
      //this reduces lag's effect on mouse movement
      if (keylock == "no"){
        clientAngle = (((angle * 180) / Math.PI - 90) * Math.PI) / 180;
      }
      //change radians to degree, minus 90 degrees, change back to radians
      //must add 90 degress because tank is drawn facing upwards, but 0 degrees is facing right, not upwards

      //for drones
      //this is the mouse coordinates based on game coordinates instead of screen coordinates
      //var mouseXBasedOnCanvas =  (mousex/window.innerWidth)*canvas.width-drawAreaX;
      //var mouseYBasedOnCanvas =  (mousey/window.innerHeight)*canvas.height-drawAreaY;
      var mouseXBasedOnCanvas = (window.innerWidth / 2 - mousex) * clientFovMultiplier;
      var mouseYBasedOnCanvas = (window.innerHeight / 2 - mousey) * clientFovMultiplier;
      //note, the angle is in radians, not degrees
      if (gameStart == 2.3) {
        //if playing the game
        if (
          (Math.abs(mouseXBasedOnCanvas - oldmousex) >= 10 ||
          Math.abs(mouseYBasedOnCanvas - oldmousey) >= 10) && keylock == "no"
        ) {
          if ((Date.now() - prevSendMouse)>30){//limit of one packet sent per 30ms
            //mousemove event triggered every 1px of movement, so use this if statement to only trigger every 10px of movement
            var packet = JSON.stringify(["mouseMoved", mouseXBasedOnCanvas/window.innerWidth*canvas.width, mouseYBasedOnCanvas/window.innerHeight*canvas.height, angle]);//mouse positions are in screen coords, need to convert to game cavas coords
            socket.send(packet)
            oldmousex = mouseXBasedOnCanvas;
            oldmousey = mouseYBasedOnCanvas;
            prevSendMouse = Date.now();
          }
        }
        //check if player mouse touching the upgrade button
        if (openedUI=="no"){
        let hoverOne = "no";
        let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
        let resizeDiffY = 1/window.innerHeight*hcanvas.height;
      //*resizeDiffY/resizeDiffX
        for (let i = 1; i < 15; i++) {
          let button = upgradeButtons[i];
          if (
            mousex > (button.x/canvas.width*window.innerWidth - button.width/2/canvas.width*window.innerWidth) &&
            mousex < (button.x/canvas.width*window.innerWidth + button.width/2/canvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX)
          ) {//note that x coord is not scaled on different screen sizes, only y coord is affected. For upgrade buttons, it scales from the bottom of the screen
            button.hover = 'yes';
            hoverOne = "yes";
          } else {
            button.hover = 'no';
          }
        }

        if (
          mousey > hcanvas.height - 280 &&
          (mousex > hcanvas.width - 320 || mousex < 320)
        ) {
          //make skill points appear
          mouseToSkillPoints = "yes";
        } else {
          mouseToSkillPoints = "no";
        }
        
        //circular button for skill points
        for (let i = 0; i < 8; i++) {
          let button = skillpointsbutton[i];
          let x;
          let y;
          let width = 20;
          if (i < 4){
            x = 17 * 15 / 2 + skillpointspos - 20 + 5;//15 is number of upgrade points
            y = (hcanvas.height - 40 - (3 - i)*33) + 25 / 2 + 3;//25 is height
          }
          else{
            x = -17 * 15/2 + hcanvas.width - skillpointspos + 20 - 5;
            y = (hcanvas.height - 40 - (7-i)*33) + 25 / 2 + 3;
          }
          if (button.clickable == "yes" && 
             mousex > (x/canvas.width*window.innerWidth - width/2/canvas.width*window.innerWidth) &&
            mousex < (x/canvas.width*window.innerWidth + width/2/canvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX)){
            button.hover = 'yes';
            hoverOne = "yes";
          }
          else{
            button.hover = 'no';
          }
        }
        
        let ignorebutton = ignorebuttonw;
        if (mousex > (ignorebutton.x/canvas.width*window.innerWidth) &&
            mousex < (ignorebutton.x/canvas.width*window.innerWidth + ignorebutton.width/canvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - ignorebutton.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + ignorebutton.height/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - ignorebutton.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX)){
            ignorebutton.hover = 'yes';
            hoverOne = "yes";
          }
          else{
            ignorebutton.hover = 'no';
          }
        ignorebutton = ignorebuttonb;
        if (mousex > (ignorebutton.x/canvas.width*window.innerWidth) &&
            mousex < (ignorebutton.x/canvas.width*window.innerWidth + ignorebutton.width/canvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - ignorebutton.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + ignorebutton.height/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - ignorebutton.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX)){
            ignorebutton.hover = 'yes';
            hoverOne = "yes";
          }
          else{
            ignorebutton.hover = 'no';
          }
        
        if (hoverOne == "yes"){
          //one of the button is hovered
          if (hcanvas.style.cursor != "pointer"){
            hcanvas.style.cursor = "pointer";//change mouse to a pointer
          }
        }
        else{
          if (hcanvas.style.cursor != "auto"){
            hcanvas.style.cursor = "auto";
          }
        }
        }
        
      } else if (gameStart > 0 && gameStart <= 0.5) {
        //if on homepage
        //check for mouse touch with gamemode selection arrows
        //note that arrow1x and the other properties are in terms of total canvas width and height, and not the actual position
        if (
          mousex >
            currentGmSelector.arrow1x * window.innerWidth -
              ((currentGmSelector.fontSize1 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousex <
            currentGmSelector.arrow1x * window.innerWidth +
              ((currentGmSelector.fontSize1 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey <
            currentGmSelector.arrow1y * window.innerHeight +
              ((currentGmSelector.fontSize1 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey >
            currentGmSelector.arrow1y * window.innerHeight -
              ((currentGmSelector.fontSize1 / canvas.width) *
                window.innerWidth) /
                2
        ) {
          currentGmSelector.hover1 = "yes";
          hcanvas.style.cursor = "pointer";
        } else {
          currentGmSelector.hover1 = "no";
          if (currentGmSelector.hover2 == "no" && currentGmSelector.hover3 == "no" && currentGmSelector.hover4 == "no") {
            //if both arrows not hovered
            hcanvas.style.cursor = "auto";
          }
        }
        
       
        if (
          mousex >
            currentGmSelector.arrow2x * window.innerWidth -
              ((currentGmSelector.fontSize2 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousex <
            currentGmSelector.arrow2x * window.innerWidth +
              ((currentGmSelector.fontSize2 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey <
            currentGmSelector.arrow2y * window.innerHeight +
              ((currentGmSelector.fontSize2 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey >
            currentGmSelector.arrow2y * window.innerHeight -
              ((currentGmSelector.fontSize2 / canvas.width) *
                window.innerWidth) /
                2
        ) {
          currentGmSelector.hover2 = "yes";
          hcanvas.style.cursor = "pointer";
        } else {
          currentGmSelector.hover2 = "no";
          if (currentGmSelector.hover1 == "no" && currentGmSelector.hover3 == "no" && currentGmSelector.hover4 == "no") {
            //if both arrows not hovered
            hcanvas.style.cursor = "auto";
          }
        }
        
        //check for mouse touch with region selection arrows
        if (
          mousex >
            currentGmSelector.arrow3x * window.innerWidth -
              ((currentGmSelector.fontSize3 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousex <
            currentGmSelector.arrow3x * window.innerWidth +
              ((currentGmSelector.fontSize3 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey <
            currentGmSelector.arrow3y * window.innerHeight +
              ((currentGmSelector.fontSize3 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey >
            currentGmSelector.arrow3y * window.innerHeight -
              ((currentGmSelector.fontSize3 / canvas.width) *
                window.innerWidth) /
                2
        ) {
          currentGmSelector.hover3 = "yes";
          hcanvas.style.cursor = "pointer";
        } else {
          currentGmSelector.hover3 = "no";
          if (currentGmSelector.hover1 == "no" && currentGmSelector.hover2 == "no" && currentGmSelector.hover4 == "no" ) {
            //if both arrows not hovered
            hcanvas.style.cursor = "auto";
          }
        }
        
        if (
          mousex >
            currentGmSelector.arrow4x * window.innerWidth -
              ((currentGmSelector.fontSize4 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousex <
            currentGmSelector.arrow4x * window.innerWidth +
              ((currentGmSelector.fontSize4 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey <
            currentGmSelector.arrow4y * window.innerHeight +
              ((currentGmSelector.fontSize4 / canvas.width) *
                window.innerWidth) /
                2 &&
          mousey >
            currentGmSelector.arrow4y * window.innerHeight -
              ((currentGmSelector.fontSize4 / canvas.width) *
                window.innerWidth) /
                2
        ) {
          currentGmSelector.hover4 = "yes";
          hcanvas.style.cursor = "pointer";
        } else {
          currentGmSelector.hover4 = "no";
          if (currentGmSelector.hover1 == "no" && currentGmSelector.hover2 == "no" && currentGmSelector.hover3 == "no") {
            //if both arrows not hovered
            hcanvas.style.cursor = "auto";
          }
        }
        if(currentGmSelector.hover1 == "yes" || currentGmSelector.hover2 == "yes" || currentGmSelector.hover3 == "yes" || currentGmSelector.hover4 == "yes") {
          hcanvas.style.cursor = "pointer";
        }
      }
    });

    //mouse press listener
    $("html").mousedown(function (e) {
      var packet = JSON.stringify(["mousePressed", e.which]);
      socket.send(packet)
      //e.which refers to whether it's lfet or right click. leftclick is 1, rightclick is 3
    });

    //mouse release listener
    $("html").mouseup(function (e) {
      if (currentGmSelector.hover2 == "yes") {
        changeGamemode("left")
      } else if (currentGmSelector.hover1 == "yes") {
        changeGamemode("right")
      } else if (currentGmSelector.hover3 == "yes" && currentGmSelector.gamemode == 3) {
        changeGamemode("regionleft")
      } else if (currentGmSelector.hover4 == "yes" && currentGmSelector.gamemode == 3) {
        changeGamemode("regionright")
      }
      var packet = JSON.stringify(["mouseReleased", e.which]);
      socket.send(packet);
      if (openedUI=="no"){
      let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
      let resizeDiffY = 1/window.innerHeight*hcanvas.height;
      for (let i = 1; i < 15; i++) {
        let button = upgradeButtons[i];
        if (
          mousex > (button.x/canvas.width*window.innerWidth - button.width/2/canvas.width*window.innerWidth) &&
          mousex < (button.x/canvas.width*window.innerWidth + button.width/2/canvas.width*window.innerWidth) &&
          mousey < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
          mousey > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
          ((ignorebuttonw.ignore == "no" || i>7) && (ignorebuttonb.ignore == "no" || i<=7))
        ) {
          //if player release mouse at button
          if (i <= 7) {
            var packet = JSON.stringify(["upgradePlease", "button" + i.toString(), "weaponUpgrade"]);
            socket.send(packet)
          } else {
            var packet = JSON.stringify(["upgradePlease", "button" + i.toString(), "bodyUpgrade"]);
            socket.send(packet)
          }
        }
      }
      for (let i = 0; i < 8; i++) {
        if (skillpointsbutton[i].hover == "yes"){
          //skill points
          var packet = JSON.stringify(["upgradeSkillPoints", (i+1).toString()]);
          socket.send(packet)
        }
      }
      if (ignorebuttonw.hover == "yes"){
        ignorebuttonw.ignore = "yes";
        levelwhenignorew = player.level;
      }
      if (ignorebuttonb.hover == "yes"){
        ignorebuttonb.ignore = "yes";
        levelwhenignoreb = player.level;
      }
      }
    });
  }

  $(window).resize(function () {
    //resize canvas when browser window is resized
    canvasResizing();
    
    //move play button and gamename
    scaleMainMenuUI();
  });
  
  function scaleMainMenuUI(){
    //move play button and gamename
    let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
    let resizeDiffY = 1/window.innerHeight*hcanvas.height;
    //resize based on position of gamemode selector
    //document.getElementById("play").style.top = "calc(45% + " + ((hcanvas.height / 100) * 9.5)*resizeDiffY/resizeDiffX/hcanvas.height*window.innerHeight + "px)";
    document.getElementById("play").style.top = "calc(47.5% + " + ((hcanvas.height / 100) * 7.4)*resizeDiffY/resizeDiffX/hcanvas.height*window.innerHeight + "px)";
    document.getElementById("gamename").style.top = "calc(47.5% + " + ((hcanvas.height / 100) * 6.9)*resizeDiffY/resizeDiffX/hcanvas.height*window.innerHeight + "px)";
    document.getElementById("respawnScoreDiv").style.top = "calc(47.5% + " + ((hcanvas.height / 100) * 12.5)*resizeDiffY/resizeDiffX/hcanvas.height*window.innerHeight + "px)";
    document.getElementById("chat").style.top = "calc(" + ((hcanvas.height / 100) * 28)*resizeDiffY/resizeDiffX/hcanvas.height*window.innerHeight + "px)";
  }

//do it once
scaleMainMenuUI();

  //mobile touch
  if (mobile == "yes") {
    setInterval(function () {
      if (touches[0].state == "moving" && touches[0].oldangle != touches[0].angle) {
        let tankAngleInDegrees = (touches[0].angle * 180) / Math.PI;
        if (tankAngleInDegrees < 0) {
          tankAngleInDegrees += 360;
        }
        touches[0].oldangle = touches[0].angle;
        var packet = JSON.stringify(["360move",tankAngleInDegrees]);
        socket.send(packet)
      }
      else if (touches[1].state == "moving" && touches[1].oldangle != touches[1].angle) {
        let tankAngleInDegrees = (touches[1].angle * 180) / Math.PI;
        if (tankAngleInDegrees < 0) {
          tankAngleInDegrees += 360;
        }
        touches[1].oldangle = touches[1].angle;
        var packet = JSON.stringify(["360move",tankAngleInDegrees]);
        socket.send(packet)
      }
      if (touches[0].state == "shooting") {
        var packet = JSON.stringify(["mouseMoved",
          touches[0].x,
          touches[0].y,
          touches[0].angle]);
              socket.send(packet)
        if (mobileSentMousePress=="no"){
          var packet = JSON.stringify(["mousePressed", 1]);
          socket.send(packet)
          mobileSentMousePress = "yes";
        }
      } else if (touches[1].state == "shooting") {
        var packet = JSON.stringify(["mouseMoved",
          touches[1].x,
          touches[1].y,
          touches[1].angle]);
              socket.send(packet)
        if (mobileSentMousePress=="no"){
          var packet = JSON.stringify(["mousePressed", 1]);
          socket.send(packet)
          mobileSentMousePress = "yes";
        }
      }
    }, 30);
    document.addEventListener("touchmove", function (e) {
      e.preventDefault();
      //only support 2 touch at each point in time
      let mousex0 = e.touches[0].pageX;
      let mousey0 = e.touches[0].pageY;
      let mousex1;
      let mousey1;
      touches[0].xpos = mousex0;//for drawing the circle on the joystick
      touches[0].ypos = mousey0;//for drawing the circle on the joystick
      if (e.touches[1]) {
        //if have two touches (might only have one touch)
        mousex1 = e.touches[1].pageX;
        mousey1 = e.touches[1].pageY;
        touches[1].xpos = mousex1;//for drawing the circle on the joystick
        touches[1].ypos = mousey1;//for drawing the circle on the joystick
      }
      //for drones
      touches[0].x =
        (window.innerWidth / 2 - mousex0) * clientFovMultiplier;
      touches[0].y =
        (window.innerHeight / 2 - mousey0) * clientFovMultiplier;
      if (e.touches[1]) {
        touches[1].x =
          (window.innerWidth / 2 - mousex0) * clientFovMultiplier;
        touches[1].y =
          (window.innerHeight / 2 - mousey0) * clientFovMultiplier;
      }
      //get joystick position relative to screen size, not canvas size
      var joystick1Locationx =
        (window.innerWidth / hcanvas.width) *
        (hcanvas.width / 2 + joystick1.xFromCenter);
      var joystick1Locationy =
        (window.innerHeight / hcanvas.height) *
        (hcanvas.height / 2 + joystick1.yFromCenter);
      var joystick2Locationx =
        (window.innerWidth / hcanvas.width) *
        (hcanvas.width / 2 + joystick2.xFromCenter);
      var joystick2Locationy =
        (window.innerHeight / hcanvas.height) *
        (hcanvas.height / 2 + joystick2.yFromCenter);
      var joystick1size =
        (window.innerHeight / hcanvas.height) * joystick1.size;
      var joystick2size =
        (window.innerHeight / hcanvas.height) * joystick2.size;
      //there would be two or more touches, so need to figure out whic touch is for which joystick
      //first touch
      if (
        Math.pow(joystick1Locationx - mousex0, 2) +
          Math.pow(joystick1Locationy - mousey0, 2) <
        Math.pow(joystick1size, 2)
      ) {
        //if touch is inside joystick
        touches[0].state = "moving";
      } else if (
        Math.pow(joystick2Locationx - mousex0, 2) +
          Math.pow(joystick2Locationy - mousey0, 2) <
        Math.pow(joystick2size, 2)
      ) {
        //if touch is inside joystick
        touches[0].state = "shooting";
      }
      if (touches[0].state == "shooting") {
        touches[0].angle = Math.atan2(
          joystick2Locationy - mousey0,
          joystick2Locationx - mousex0
        );
        //below code stores the player's angle (only for the player the client is controlling)
        //this reduces lag's effect on mouse movement
        clientAngle =
          (((touches[0].angle * 180) / Math.PI - 90) * Math.PI) / 180;
      } else if (touches[0].state == "moving") {
        touches[0].angle = Math.atan2(
          joystick1Locationy - mousey0,
          joystick1Locationx - mousex0
        );
      }
      //second touch
      if (e.touches[1]) {
        if (
          Math.pow(joystick1Locationx - mousex1, 2) +
            Math.pow(joystick1Locationy - mousey1, 2) <
          Math.pow(joystick1size, 2)
        ) {
          //if touch is inside joystick
          touches[1].state = "moving";
        } else if (
          Math.pow(joystick2Locationx - mousex1, 2) +
            Math.pow(joystick2Locationy - mousey1, 2) <
          Math.pow(joystick2size, 2)
        ) {
          //if touch is inside joystick
          touches[1].state = "shooting";
        }
        if (touches[1].state == "shooting") {
          touches[1].angle = Math.atan2(
            joystick2Locationy - mousey1,
            joystick2Locationx - mousex1
          );
          //below code stores the player's angle (only for the player the client is controlling)
          //this reduces lag's effect on mouse movement
          clientAngle =
            (((touches[0].angle * 180) / Math.PI - 90) * Math.PI) / 180;
        } else if (touches[1].state == "moving") {
          touches[1].angle = Math.atan2(
            joystick1Locationy - mousey1,
            joystick1Locationx - mousex1
          );
        }
      }
      //check if player touching the upgrade button

      if (!e.touches[1]) {
        mousex1 = 0;
      }
      if (!e.touches[1]) {
        mousey1 = 0;
      }
      
      /*
      mousey0 < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey0 > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX)
      */

      let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
      let resizeDiffY = 1/window.innerHeight*hcanvas.height;
      for (let i = 1; i < 15; i++) {
        let button = upgradeButtons[i];
        if (
          (
          mousex0 > (button.x/canvas.width*window.innerWidth - button.width/2/canvas.width*window.innerWidth) &&
          mousex0 < (button.x/canvas.width*window.innerWidth + button.width/2/canvas.width*window.innerWidth) &&
          mousey0 < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
          mousey0 > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX)
          ) ||
          (
          mousex1 > (button.x/canvas.width*window.innerWidth - button.width/2/canvas.width*window.innerWidth) &&
          mousex1 < (button.x/canvas.width*window.innerWidth + button.width/2/canvas.width*window.innerWidth) &&
          mousey1 < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
          mousey1 > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
          e.touches[1]
          )
        ) {
          button.hover = 'yes';
        } else {
          button.hover = 'no';
        }
      }
    });

    //mouse press listener
    document.addEventListener("touchend", function (e) {
      if (e.changedTouches[0]) {
        if (e.changedTouches[0].pageX==touches[0].xpos&&e.changedTouches[0].pageY==touches[0].ypos){
          if (touches[0].state == "moving") {
            var packet = JSON.stringify(["360Release"]);
            socket.send(packet)
          } else {
            if (mobileSentMousePress=="yes"){
              var packet = JSON.stringify(["mouseReleased", 1]);
              socket.send(packet)
              mobileSentMousePress = "no";
            }
          }
          touches[0].state = "no";
        }
        else if (e.changedTouches[0].pageX==touches[1].xpos&&e.changedTouches[0].pageY==touches[1].ypos){
          if (touches[1].state == "moving") {
            var packet = JSON.stringify(["360Release"]);
            socket.send(packet)
          } else {
            if (mobileSentMousePress=="yes"){
              var packet = JSON.stringify(["mouseReleased", 1]);
              socket.send(packet)
              mobileSentMousePress = "no";
            }
          }
          touches[1].state = "no";
        }
      }
      if (e.changedTouches[1]) {
        if (e.changedTouches[1].pageX==touches[0].xpos&&e.changedTouches[1].pageY==touches[0].ypos){
          if (touches[0].state == "moving") {
            var packet = JSON.stringify(["360Release"]);
            socket.send(packet)
          } else {
            if (mobileSentMousePress=="yes"){
              var packet = JSON.stringify(["mouseReleased", 1]);
              socket.send(packet)
              mobileSentMousePress = "no";
            }
          }
          touches[0].state = "no";
        }
        else if (e.changedTouches[1].pageX==touches[1].xpos&&e.changedTouches[1].pageY==touches[1].ypos){
          if (touches[1].state == "moving") {
            var packet = JSON.stringify(["360Release"]);
            socket.send(packet)
          } else {
            if (mobileSentMousePress=="yes"){
              var packet = JSON.stringify(["mouseReleased", 1]);
              socket.send(packet)
              mobileSentMousePress = "no";
            }
          }
          touches[1].state = "no";
        }
      }
      for (let j = 0; j < e.changedTouches.length; j++) {
        let mousex = e.changedTouches[j].pageX;
        let mousey = e.changedTouches[j].pageY;
        let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
        let resizeDiffY = 1/window.innerHeight*hcanvas.height;
        for (let i = 1; i < 15; i++) {
          let button = upgradeButtons[i];
          if (
            mousex > (button.x/canvas.width*window.innerWidth - button.width/2/canvas.width*window.innerWidth) &&
            mousex < (button.x/canvas.width*window.innerWidth + button.width/2/canvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - button.y)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX - button.width/2/canvas.width*window.innerWidth*resizeDiffY/resizeDiffX)
          ) {
            //if player release mouse at button
            if (i <= 7) {
              var packet = JSON.stringify(["upgradePlease", "button" + i.toString(), "weaponUpgrade"]);
              socket.send(packet)
            } else {
              var packet = JSON.stringify(["upgradePlease", "button" + i.toString(), "bodyUpgrade"]);
              socket.send(packet)
            }
          }
        }
        for (let i = 1; i < 9; i++) {//skill points (can only click on mobile)
          let something = 0;
          if (i>4){
            something = 4-(i-4);
          }
          else{
            something = 4-i;
          }
          //something is 3,2,1,0,3,2,1,0 from top to bottom of the 8 skill points
          let skilly = hcanvas.height - 40 - 32*something;
          let skillx = 0;
          if (i<4){
            skillx = -140 + skillpointspos
          }
          else{
            skillx = -140 + hcanvas.width - skillpointspos
          }
          let skillwidth = 280;
          let skillheight = 30;
          if (
            mousex > (skillx/hcanvas.width*window.innerWidth) &&
            mousex < (skillx/hcanvas.width*window.innerWidth+skillwidth/hcanvas.width*window.innerWidth) &&
            mousey < (window.innerHeight - (hcanvas.height - skilly)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX + skillheight/hcanvas.width*window.innerWidth*resizeDiffY/resizeDiffX) &&
            mousey > (window.innerHeight - (hcanvas.height - skilly)/canvas.height*window.innerHeight*resizeDiffY/resizeDiffX)
          ) {
            //if player release mouse at skill point
            var packet = JSON.stringify(["upgradeSkillPoints", i]);
            socket.send(packet)
          }
        }
        if (gameStart > 0 && gameStart <= 0.5) {
        if (
            mousex >
              currentGmSelector.arrow1x * window.innerWidth -
                ((currentGmSelector.fontSize1 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousex <
              currentGmSelector.arrow1x * window.innerWidth +
                ((currentGmSelector.fontSize1 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousey <
              currentGmSelector.arrow1y * window.innerHeight +
                ((currentGmSelector.fontSize1 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousey >
              currentGmSelector.arrow1y * window.innerHeight -
                ((currentGmSelector.fontSize1 / canvas.width) *
                  window.innerWidth) /
                  2
          ) {
            currentGmSelector.hover1 = "yes";
          } else {
            currentGmSelector.hover1 = "no";
          }
          if (
            mousex >
              currentGmSelector.arrow2x * window.innerWidth -
                ((currentGmSelector.fontSize2 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousex <
              currentGmSelector.arrow2x * window.innerWidth +
                ((currentGmSelector.fontSize2 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousey <
              currentGmSelector.arrow2y * window.innerHeight +
                ((currentGmSelector.fontSize2 / canvas.width) *
                  window.innerWidth) /
                  2 &&
            mousey >
              currentGmSelector.arrow2y * window.innerHeight -
                ((currentGmSelector.fontSize2 / canvas.width) *
                  window.innerWidth) /
                  2
          ) {
            currentGmSelector.hover2 = "yes";
          } else {
            currentGmSelector.hover2 = "no";
          }
        }
        //mobile gamemode change
        if (currentGmSelector.hover2 == "yes") {
        changeGamemode("left")
      } else if (currentGmSelector.hover1 == "yes") {
        changeGamemode("right")
      }
      }

    });
  }

  
      var lerpDrawnX = 0;
      var lerpDrawnY = 0;
      let updateInterval = 60;//server send update every 60ms (17 fps)
      function simpleLerpPos(obj,oldobj,currentLocation){
        let timeDiff = Date.now() - latestServerUpdateTime;
        lerpDrawnX = oldobj.x + (obj.x - oldobj.x)/updateInterval*timeDiff;
        lerpDrawnY = oldobj.y + (obj.y - oldobj.y)/updateInterval*timeDiff;
      }
      function simpleLerpAngle(obj,oldobj){
        let timeDiff = Date.now() - latestServerUpdateTime;
        let oldangle = oldobj.angle;
        let newangle = obj.angle;
        //note: player angle in radians
        if ((oldangle - newangle)>5.25){//angle went from 360 to 0
          oldangle-=2*Math.PI;
        }
        else if ((newangle - oldangle)>5.25){//angle went from 0 to 360
          oldangle+=2*Math.PI;
        }
        let lerpedAngle = oldangle + (newangle - oldangle)/updateInterval*timeDiff;
        return lerpedAngle
      }
      function lerpProperty(obj,oldobj,property){
        let timeDiff = Date.now() - latestServerUpdateTime;
        let oldangle = oldobj[property];
        let newangle = obj[property];
        let lerpedAngle = oldangle + (newangle - oldangle)/updateInterval*timeDiff;
        return lerpedAngle
      }

  //variable for background image
  var img = new Image();
  var imageloaded = "no";


  var requestInterval = function (fn, delay) {
    var requestAnimFrame = (function () {
      return window.requestAnimationFrame || function (callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
    })(),
    start = new Date().getTime(),
    handle = {};
    function loop() {
      handle.value = requestAnimFrame(loop);
      var current = new Date().getTime(),
      delta = current - start;
      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }
    }
    handle.value = requestAnimFrame(loop);
    return handle;
  };


  //setInterval(() => {//dont use setinterval anymore cuz it affected latency for mobile users (running 30fps on mobile will cause lag cuz it cant do 30fps)
  function screenDrawLoop(){//everything happens here
      var starting = Date.now(); //start client code execution timer
    
    //calculate delta
    let currentLoopTime = Date.now();
     if (prevLoopTime == 0) { //if this is first loop
        deltaTime = 1;
     } else {
        let timeLapsed = currentLoopTime - prevLoopTime;
        deltaTime = timeLapsed / 30;//30fps would be the speed at which animations should run
     }
     prevLoopTime = currentLoopTime;

    var resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
    var resizeDiffY = 1/window.innerHeight*hcanvas.height;

    //check if player clicked play button and if joined
    if (canLogIn == "yes") {
      //if client wants to log into an account
      if (acctype != "edit"){
        var packet = JSON.stringify(["logInOrSignUp",
        accusername,
        accpassword,
        accdesc,
        acctype]);
              socket.send(packet)
        canLogIn = "no";
      }
      else{
        var packet = JSON.stringify(["editaccount",
        loggedInAccount.name,
        loggedInAccount.pw,
        loggedInAccount.desc,
        accusername,
        accpassword,
        accdesc]);
              socket.send(packet)
        canLogIn = "no";
      }
    }
    if (gameStart == 0) {
      //client have not clicked play
      hctx.clearRect(0, 0, hcanvas.width, hcanvas.height);
      gameStart = 0.01; //start animation
        backgroundWidth = 1153; //get width and height of image
        backgroundHeight = 725;
        //note: you can change zoomedWidth value below, but if increase, then radius variable need to decrease, and vice versa.
        //original value used was 2 for all the values below including radius variable, but image was blurry as it was too zoomed in
        zoomedWidth = backgroundWidth / 1.5;
        zoomedHeight = backgroundHeight / 1.5;
        radius = backgroundHeight / 2.66; //assume background width bigge than height. this variable refers to dist from center of image to center of zoomed in image
        //caculate amount to multiply to prevent canvas from looking stretched
        var xDiff = Math.abs(hcanvas.width - backgroundWidth);
        var yDiff = Math.abs(hcanvas.height - backgroundHeight);
        if (yDiff > xDiff) {
          xChange =
            ((hcanvas.height / zoomedHeight) * zoomedWidth) /
            hcanvas.width;
        } else if (xDiff > yDiff) {
          yChange =
            ((hcanvas.width / zoomedWidth) * zoomedHeight) /
            hcanvas.height;
        }
        document.getElementById("menuTitle").style.display = "block";
        mainMenuOpacity = 0;

    } else if (gameStart > 0 && gameStart <= 0.5) {
      //draw homepage
        if (gameStart >= 0.45) {
          //gameStart might be 0.4500000000000004 due to precision error
          gameStart = 0.5;
        } else {
          gameStart += 0.05;
        }
        if (mainMenuOpacity < 1){
          mainMenuOpacity+=0.05;
        }
        hctx.globalAlpha = mainMenuOpacity; //This is for opacity animation when opening website
        hctx.clearRect(0, 0, hcanvas.width, hcanvas.height);
        //draw the panned image
        //how it works: put image in center of screen and move it in a circular path, then image is stretched to fit screen, x and y coordinates also need to be changed
        //hctx.drawImage(img, , , , );
        step+=0.5*deltaTime; //move position (higher number means faster)
        //calculate circular movement of objects on homepage
        var topleftcornerX = hcanvas.width / 2 - backgroundWidth / 2 + radius * Math.cos(speed * step) - ((backgroundWidth / zoomedWidth) * hcanvas.width - backgroundWidth) / 2;
        var topleftcornerY = hcanvas.height / 2 - backgroundHeight / 2 + radius * Math.sin(speed * step) - ((backgroundHeight / zoomedHeight) * hcanvas.height - backgroundHeight) / 2;
        var zoomamountWidth = (backgroundWidth / zoomedWidth) * hcanvas.width * xChange;
        //var zoomamountHeight = backgroundHeight/zoomedHeight*hcanvas.height*yChange;
        var imgwidth = 1153; //although changed the code so no longer is an image, still need this for zooming in
        //var imgheight = 725;//dont use this or else background will stretch more in x or y direction. intsead, use only one
        var zoomamount = zoomamountWidth / imgwidth;
        //draw background
        hctx.fillStyle = "#CDCDCD";
        hctx.fillRect(0, 0, hcanvas.width, hcanvas.height);
        //draw grid
        hctx.strokeStyle = "#BEBEBE";
        hctx.lineWidth = 1;
        var gridHeight = 30;
        for (
          let x =
            -gridHeight -
            ((hcanvas.width / 2 - topleftcornerX) % gridHeight);
          x < hcanvas.width;
          x += gridHeight
        ) {
          hctx.moveTo(x, 0);
          hctx.lineTo(x, hcanvas.height);
        }
        for (
          let y =
            -gridHeight -
            ((hcanvas.height / 2 - topleftcornerY) % gridHeight);
          y < hcanvas.height;
          y += gridHeight
        ) {
          hctx.moveTo(0, y);
          hctx.lineTo(hcanvas.width, y);
        }
        hctx.stroke();

      hctx.lineJoin = "round";
        hctx.lineWidth = 1.7;
        function drawshapeonbackground(sides, width, x, y, angle) {
          hctx.save();
          hctx.translate(
            x + topleftcornerX,
            y + topleftcornerY
          );
          hctx.scale(zoomamount, zoomamount*resizeDiffY/resizeDiffX);
          hctx.rotate((angle * Math.PI) / 180);
          hctx.fillStyle = shapecolors[sides][colortheme].color;
          hctx.strokeStyle = shapecolors[sides][colortheme].outline;
          hctx.beginPath();
          hctx.moveTo(width, 0);
          for (var i = 1; i <= sides + 1; i += 1) {
            hctx.lineTo(width * Math.cos((i * 2 * Math.PI) / sides), width * Math.sin((i * 2 * Math.PI) / sides));
          }
          hctx.fill();
          hctx.stroke();
          hctx.restore();
        }
      
      function moveToPos(x,y){
        hctx.save();
        hctx.translate(x, y);
        hctx.scale(1, resizeDiffY/resizeDiffX);
      }
      
      function drawFFA(){
        drawshapeonbackground(3, 6, 800, 500, 50);
        drawshapeonbackground(3, 6, 800, 540, 140);
        drawshapeonbackground(4, 10, 850, 540, 140);
        drawshapeonbackground(5, 17, 500, 300, 90);
        drawshapeonbackground(5, 17, 2000, 800, 10);
        drawshapeonbackground(5, 17, 2500, 1000, 30);
        drawshapeonbackground(6, 25, 1150, 720, 110);
        drawshapeonbackground(6, 25, 2600, 1250, 140);
        drawshapeonbackground(7, 40, 800, 1250, 10);
        drawshapeonbackground(7, 40, 1100, 200, 10);
        drawshapeonbackground(8, 65, 2200, 200, 10);
        drawshapeonbackground(9, 85, 1500, 1450, 10);
        drawshapeonbackground(10, 125, 300, 900, 10);
        hctx.lineWidth = 1.7*zoomamount;
        hctx.save();
        hctx.translate(topleftcornerX, topleftcornerY);
        moveToPos(800,700)
        drawFakePlayer("cyclone",0,0,20*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("inferno",0,0,20*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(1200,900)
        drawFakePlayer("centrefire",0,0,15*zoomamount,150*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(2000,500)
        drawFakePlayer("basic",0,0,12*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("mono",0,0,12*zoomamount,180*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(1500,100)
        drawFakePlayer("booster",0,0,15*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("rocketer",0,0,15*zoomamount,180*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(1800,1050)
        drawFakePlayer("riot",0,0,15*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(2200,1350)
        drawFakePlayer("protector",0,0,15*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(550,1350)
        drawFakePlayer("factory",0,0,15*zoomamount,45*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(1500,700)
        drawFakePlayer("veteran",0,0,20*zoomamount,225*Math.PI/180,"#934c93","#660066","weapon")
        hctx.restore();
        hctx.restore();
      }
      function draw2tdm(){
        drawshapeonbackground(6, 25, 800, 500, 50);
        drawshapeonbackground(3, 6, 850, 540, 140);
        drawshapeonbackground(5, 17, 500, 300, 90);
        drawshapeonbackground(5, 17, 2000, 800, 10);
        drawshapeonbackground(5, 17, 2500, 1000, 30);
        drawshapeonbackground(4, 10, 1150, 720, 110);
        drawshapeonbackground(7, 40, 2600, 1250, 140);
        drawshapeonbackground(7, 40, 350, 1250, 140);
        drawshapeonbackground(5, 17, 2200, 200, 10);
        drawshapeonbackground(9, 85, 2500, 700, 10);
        drawshapeonbackground(13, 150, 1500, 500, 0);
        drawshapeonbackground(10, 125, 1000, 1300, 10);
        hctx.lineWidth = 1.7*zoomamount;
        hctx.save();
        hctx.translate(topleftcornerX, topleftcornerY);
        moveToPos(1000,700)
        drawFakePlayer("stronghold",0,0,20*zoomamount,90*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("inferno",0,0,20*zoomamount,90*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(750,850)
        drawFakePlayer("hex",0,0,20*zoomamount,90*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(900,200)
        drawFakePlayer("marksman",0,0,20*zoomamount,110*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("propeller",0,0,20*zoomamount,110*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(1200,900)
        drawFakePlayer("machine",0,0,15*zoomamount,75*Math.PI/180,"#F04F54","#b33b3f","weapon")
        hctx.restore();
        moveToPos(2000,500)
        drawFakePlayer("cyclone",0,0,15*zoomamount,270*Math.PI/180,"#00E06C","#00C24E","weapon")
        drawFakePlayer("snowstorm",0,0,15*zoomamount,270*Math.PI/180,"#00E06C","#00C24E","body")
        hctx.restore();
        moveToPos(1500,150)
        drawFakePlayer("guardian",0,0,15*zoomamount,225*Math.PI/180,"#00E06C","#00C24E","weapon")
        drawFakePlayer("juggernaut",0,0,15*zoomamount,225*Math.PI/180,"#00E06C","#00C24E","body")
        hctx.restore();
        moveToPos(1600,1200)
        drawFakePlayer("fighter",0,0,15*zoomamount,270*Math.PI/180,"#00E06C","#00C24E","weapon")
        hctx.restore();
        moveToPos(1600,900)
        drawFakePlayer("thunderstorm",0,0,22*zoomamount,225*Math.PI/180,"#934c93","#660066","weapon")
        drawFakePlayer("heliosphere",0,0,22*zoomamount,225*Math.PI/180,"#934c93","#660066","body")
        hctx.restore();
        hctx.restore();
      }
      function draw4tdm(){
        /*
        //old 4tdm background
        drawshapeonbackground(3, 6, 800, 500, 50);
        drawshapeonbackground(3, 6, 800, 540, 140);
        drawshapeonbackground(4, 10, 850, 540, 140);
        drawshapeonbackground(5, 17, 500, 300, 90);
        drawshapeonbackground(14, 20, 2000, 800, 10);
        drawshapeonbackground(5, 17, 2500, 1000, 30);
        drawshapeonbackground(5, 100, 1150, 850, 110);
        drawshapeonbackground(6, 25, 2600, 1250, 140);
        hctx.lineWidth = 1.7*zoomamount;
        hctx.save();
        hctx.translate(topleftcornerX, topleftcornerY);
        moveToPos(800,900)
        drawFakePlayer("bunker",0,0,22*zoomamount,225*Math.PI/180,"#C0C0C0","#A2A2A2","weapon")
        hctx.restore();
        hctx.restore();
        */
        drawshapeonbackground(4, 10, 800, 500, 280);
        drawshapeonbackground(4, 10, 300, 200, 230);
        drawshapeonbackground(4, 10, 700, 100, 100);
        drawshapeonbackground(3, 6, 1500, 200, 20);
        drawshapeonbackground(3, 6, 2300, 150, 20);
        drawshapeonbackground(3, 6, 2000, 1200, 20);
        drawshapeonbackground(6, 25, 1400, 100, 320);
        drawshapeonbackground(5, 17, 700, 600, 220);
        drawshapeonbackground(3, 6, 2500, 540, 180);
        drawshapeonbackground(5, 17, 1600, 1500, 0);
        drawshapeonbackground(3, 6, 600, 1300, 80);
        drawshapeonbackground(3, 6, 600, 1300, 350);
        drawshapeonbackground(3, 6, 600, 1300, 80);
        drawshapeonbackground(7, 40, 1100, 1000, 140);
        drawshapeonbackground(7, 40, 2700, 700, 290);
        drawshapeonbackground(5, 17, 200, 1100, 290);
        drawshapeonbackground(6, 25, 200, 1100, 290);
        drawshapeonbackground(11, 135, 1300, 600, 10);
        drawshapeonbackground(10, 125, 2600, 1300, 64);
        drawshapeonbackground(14, 175, 2100, 600, 64);
        hctx.lineWidth = 1.7*zoomamount;
        hctx.save();
        hctx.translate(topleftcornerX, topleftcornerY);
        moveToPos(1800,1400)
        drawFakePlayer("CEO",0,0,22*zoomamount,-30*Math.PI/180,"#00B0E1","#0092C3","weapon")
        drawFakePlayer("juggernaut",0,0,22*zoomamount,-30*Math.PI/180,"#00B0E1","#0092C3","body")
        hctx.restore();
        moveToPos(1600,1200)
        drawFakePlayer("stronghold",0,0,20*zoomamount,130*Math.PI/180,"#F04F54","#b33b3f","weapon")
        drawFakePlayer("inferno",0,0,20*zoomamount,130*Math.PI/180,"#F04F54","#b33b3f","body")
        hctx.restore();
        moveToPos(2000,50)
        drawFakePlayer("amalgam",0,0,20*zoomamount,170*Math.PI/180,"#BE7FF5","#A061D7","weapon")
        drawFakePlayer("fabricator",0,0,20*zoomamount,170*Math.PI/180,"#BE7FF5","#A061D7","body")
        hctx.restore();
        moveToPos(600,300)
        drawFakePlayer("comet",0,0,20*zoomamount,80*Math.PI/180,"#00E06C","#00C24E","weapon")
        drawFakePlayer("rocketer",0,0,20*zoomamount,80*Math.PI/180,"#00E06C","#00C24E","body")
        hctx.restore();
        moveToPos(950,875)
        drawFakePlayer("sniper",0,0,12*zoomamount,140*Math.PI/180,"#00E06C","#00C24E","weapon")
        drawFakePlayer("bastion",0,0,12*zoomamount,115*Math.PI/180,"#00E06C","#00C24E","body")
        hctx.restore();
        moveToPos(1100,1400)
        drawFakePlayer("veteran",0,0,22*zoomamount,-110*Math.PI/180,"#934c93","#660066","weapon")
        drawFakePlayer("firebolt",0,0,22*zoomamount,-110*Math.PI/180,"#934c93","#660066","body")
        hctx.restore();
        moveToPos(750,1475)
        drawFakePlayer("harbinger",0,0,20*zoomamount,84*Math.PI/180,"#BE7FF5","#A061D7","weapon")
        drawFakePlayer("fabricator",0,0,20*zoomamount,84*Math.PI/180,"#BE7FF5","#A061D7","body")
        hctx.restore();
        hctx.restore();
      }
      function drawEditor(){
        drawshapeonbackground(3, 6, 600, 500, 50);
        drawshapeonbackground(3, 6, 750, 540, 140);
        drawshapeonbackground(5, 17, 550, 300, 90);
        drawshapeonbackground(5, 17, 2100, 800, 10);
        drawshapeonbackground(5, 17, 2700, 1000, 30);
        drawshapeonbackground(4, 10, 1300, 720, 110);
        drawshapeonbackground(4, 10, 2250, 1250, 140);
        drawshapeonbackground(5, 17, 2200, 200, 10);
        drawshapeonbackground(3, 6, 1700, 500, 0);
        drawshapeonbackground(3, 300, 1700, 500, 0);
        hctx.lineWidth = 1.7*zoomamount;
        hctx.save();
        hctx.translate(topleftcornerX, topleftcornerY);
        moveToPos(800,900)
        drawFakePlayer("destroyer",0,0,22*zoomamount,45*Math.PI/180,"#DE5D83","#e75480","weapon")
        drawFakePlayer("duel",0,0,22*zoomamount,45*Math.PI/180,"#DE5D83","#e75480","weapon")
        drawFakePlayer("gamma",0,0,22*zoomamount,225*Math.PI/180,"#DE5D83","#e75480","weapon")
        hctx.restore();
        hctx.restore();
      }
      function drawBg(gm){
        let gmView = gamemodeBgFoV[gm];
        let gmName = gamemodes[gm];
        hctx.save();
        hctx.translate(topleftcornerX+hcanvas.width/2, topleftcornerY+hcanvas.height/2);//middle of screen
        hctx.scale(gmView, gmView);//scale for man menu fov
        hctx.translate(-topleftcornerX-hcanvas.width/2, -topleftcornerY-hcanvas.height/2);//middle of screen
        if (gmName == "Free For All"){
          drawFFA()
        }
        else if (gmName == "2 Teams"){
          draw2tdm()
        }
        else if (gmName == "4 Teams"){
          draw4tdm()
        }
        else if (gmName == "Tank Editor"){
          drawEditor()
        }
        hctx.restore();
      }

      //objects on the homepage background
      if (currentGmSelector.transition != 3){
        hctx.save()
        hctx.translate(hcanvas.width * (currentGmSelector.transition + 1.1),0)
        if (currentGmSelector.animateDir == "right") {
          drawBg(currentGmSelector.prevgamemode)
        }
        else{
          drawBg(currentGmSelector.gamemode)
        }
        hctx.restore();
        hctx.save()
        hctx.translate(hcanvas.width * (currentGmSelector.transition - 1.1)-hcanvas.width,0)
        if (currentGmSelector.animateDir == "right") {
          drawBg(currentGmSelector.gamemode)
        }
        else{
          drawBg(currentGmSelector.prevgamemode)
        }
        hctx.restore();
      }
      else{
        drawBg(currentGmSelector.gamemode)
      }
      
      if (gamemodeBgFoV[currentGmSelector.gamemode] < 1){
        gamemodeBgFoV[currentGmSelector.gamemode] += (1 - gamemodeBgFoV[currentGmSelector.gamemode])/10*deltaTime;
      }
      else if ((1 - gamemodeBgFoV[currentGmSelector.gamemode])<0.0001){//very close to 1
        gamemodeBgFoV[currentGmSelector.gamemode] = 1;
      }
      else{
        gamemodeBgFoV[currentGmSelector.gamemode] = 1;
      }
        hctx.lineJoin = "miter"; //change back
        hctx.fillStyle = "rgba(0,0,0,.5)"; //make background darker
        hctx.fillRect(0, 0, hcanvas.width, hcanvas.height);

        //for transition when pressing arrow to change gamemode
        if (
          currentGmSelector.transition >= -1.1 &&
          currentGmSelector.transition <= 2.1
        ) {
          hctx.fillStyle = "black";
          hctx.beginPath();
          hctx.ellipse(
            hcanvas.width * currentGmSelector.transition,
            hcanvas.height / 2,
            hcanvas.width / 1.5,
            hcanvas.height,
            0,
            0,
            Math.PI * 2
          ); //draw oval
          hctx.fill();
          if (currentGmSelector.animateDir == "right") {
            let diff = (2.1-currentGmSelector.transition);
            let amountMove = diff/5*deltaTime;
            if (diff < 0.0005){
              amountMove = diff;
            }
            currentGmSelector.transition += amountMove;
          } else {
            let diff = (currentGmSelector.transition-(-1.1));
            let amountMove = diff/5*deltaTime;
            if (diff < 0.0005){
              amountMove = diff;
            }
            currentGmSelector.transition -= amountMove;
          }
        }
        if (
          currentGmSelector.transition >= 2.1 ||
          currentGmSelector.transition <= -1.1
        ) {
          currentGmSelector.transition = 3; //turns off the animation
          currentGmSelector.prevgamemode = currentGmSelector.gamemode;
        }

        //hctx.lineJoin = "round";
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 6;
        hctx.font = "700 70px Roboto";
        hctx.textAlign = "center";

        //functions for color lerping when changing gamemode
        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
            } : null;
          }
          function getRgb(color) {
            var getRGB = hexToRgb(color);
            let r = getRGB.r;
            let g = getRGB.g;
            let b = getRGB.b;
            return {
              r,
              g,
              b
            }
          }
          function colorInterpolate(colorA, colorB, intval) {
            const rgbA = getRgb(colorA),
              rgbB = getRgb(colorB);
            const colorVal = (prop) =>
              Math.round(rgbA[prop] * (1 - intval) + rgbB[prop] * intval);
            return {
              r: colorVal('r'),
              g: colorVal('g'),
              b: colorVal('b'),
            }
          }

        //drawing gamemode selector
        hctx.save();
        //let yStretch = resizeDiffX/resizeDiffY;//scale to prevent squished width, but will cause position to change
        var w = (hcanvas.width / 100) * 20;
        var h = (hcanvas.width / 100) * 6.5;
        var r = hcanvas.width / 100 / 3;//higher number means less round
        var x = hcanvas.width / 2 - w / 2;
        var y = (hcanvas.height / 100) * 40.5;
        let translatedX = x + w/2;
        let translatedY = y + h/2;
        hctx.translate(translatedX, translatedY);//0 is now at this coords
        hctx.scale(1,resizeDiffY/resizeDiffX);
        x = -w/2;
        y = -h/2;

        if (currentGmSelector.transition == 3){
          hctx.fillStyle = gamemodecolors[currentGmSelector.gamemode]; //color of current gamemode
        }
        else{
          //gamemode transition
          //lerp between colors when changing gamemode
          //currentGmSelector.transition go from -1 to 3
          if (currentGmSelector.animateDir == "right") {
            if (currentGmSelector.transition < 0){
              currentGmSelector.colorLerp = 0;
            }
            else if (currentGmSelector.colorLerp < 1){
              currentGmSelector.colorLerp += 0.05;
            }
            
            var rgbNew = colorInterpolate(gamemodecolors[currentGmSelector.prevgamemode], gamemodecolors[currentGmSelector.gamemode], currentGmSelector.colorLerp);
          }
          else{
            if (currentGmSelector.transition > 1){
              currentGmSelector.colorLerp = 1;
            }
            else if (currentGmSelector.colorLerp > 0){
              currentGmSelector.colorLerp -= 0.05;
            }
            
            var rgbNew = colorInterpolate(gamemodecolors[currentGmSelector.gamemode], gamemodecolors[currentGmSelector.prevgamemode], currentGmSelector.colorLerp);
          }
          hctx.fillStyle = `rgb( ${rgbNew.r}, ${rgbNew.g}, ${rgbNew.b})`;
        }

        hctx.strokeStyle = "black";
        hctx.lineWidth = 8;
        hctxroundRectangle(x,y,r,w,h);
        //now draw the bottom part of the gamemode selector (the area with darker color)
        h = (hcanvas.width / 100) * 3.25;
        y = (hcanvas.height / 100) * 46.2 - translatedY;

        if (currentGmSelector.transition == 3){
          hctx.fillStyle = gamemodecolorsdark[currentGmSelector.gamemode]; //color of current gamemode
        }
        else{
          //gamemode transition
          if (currentGmSelector.animateDir == "right") {
            var rgbNew = colorInterpolate(gamemodecolorsdark[currentGmSelector.prevgamemode], gamemodecolorsdark[currentGmSelector.gamemode], currentGmSelector.colorLerp);
          }
          else{
            var rgbNew = colorInterpolate(gamemodecolorsdark[currentGmSelector.gamemode], gamemodecolorsdark[currentGmSelector.prevgamemode], currentGmSelector.colorLerp);
          }
          hctx.fillStyle = `rgb( ${rgbNew.r}, ${rgbNew.g}, ${rgbNew.b})`;
        }

        hctxroundRectangleFill(x,y,r,w,h);

        hctx.lineWidth = 3;
        hctx.fillStyle = "white";
        hctx.font = "900 60px Yantramanav";
        hctx.textBaseline = "middle"; //make arrows and gamemode word draw with coordinates in the center of the text
        hctx.fillText(
          "Gamemode",
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 37 - translatedY
        );
        hctx.strokeText(
          "Gamemode",
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 37 - translatedY
        );
      hctx.lineWidth = 6.5;
        hctx.font = "900 40px Roboto";
        //gamemodes[currentGmSelector.gamemode] refers to the current gamemode shown on the screen
        if (
          currentGmSelector.prevgamemode != currentGmSelector.gamemode
        ) {
          //animating text opacity when changing gamemode
          var prevAlpha = hctx.globalAlpha; //store prev transparency
          if (currentGmSelector.transition < 0.5) {
            if (currentGmSelector.animateDir == "right") {
              //write prev gamemode
              var transparency = 1 - (currentGmSelector.transition + 1.1);
              if (transparency < 0) {
                transparency = 0;
              }
              hctx.globalAlpha = transparency;
              hctx.strokeText(
                gamemodes[currentGmSelector.prevgamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
              hctx.fillText(
                gamemodes[currentGmSelector.prevgamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
            } else {
              //write new gamemode
              hctx.globalAlpha = 0.5 - currentGmSelector.transition;
              hctx.strokeText(
                gamemodes[currentGmSelector.gamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
              hctx.fillText(
                gamemodes[currentGmSelector.gamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
            }
          } else {
            if (currentGmSelector.animateDir == "right") {
              //write new gamemode
              hctx.globalAlpha = currentGmSelector.transition - 0.5;
              hctx.strokeText(
                gamemodes[currentGmSelector.gamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
              hctx.fillText(
                gamemodes[currentGmSelector.gamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
            } else {
              //write prev gamemode
              var transparency = currentGmSelector.transition - 1;
              if (transparency < 0) {
                transparency = 0;
              }
              hctx.globalAlpha = transparency;
              hctx.strokeText(
                gamemodes[currentGmSelector.prevgamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
              hctx.fillText(
                gamemodes[currentGmSelector.prevgamemode],
                hcanvas.width * currentGmSelector.textX - translatedX,
                hcanvas.height * currentGmSelector.textY - translatedY
              );
            }
          }
          hctx.globalAlpha = prevAlpha;
        } else {
          hctx.strokeText(
            gamemodes[currentGmSelector.gamemode],
            hcanvas.width * currentGmSelector.textX - translatedX,
            hcanvas.height * currentGmSelector.textY - translatedY
          );
          hctx.fillText(
            gamemodes[currentGmSelector.gamemode],
            hcanvas.width * currentGmSelector.textX - translatedX,
            hcanvas.height * currentGmSelector.textY - translatedY
          );
        }
        hctx.fillStyle = currentGmSelector.arrowColor;
      
        //arrow growing animation for arrow 1
        if (
          currentGmSelector.fontSize1 >
            currentGmSelector.defaultfontSize &&
          currentGmSelector.hover1 == "no"
        ) {
          currentGmSelector.fontSize1--;
        } else if (
          currentGmSelector.fontSize1 <
            currentGmSelector.animatedfontSize &&
          currentGmSelector.hover1 == "yes"
        ) {
          currentGmSelector.fontSize1++;
        }
        hctx.font = "700 " + currentGmSelector.fontSize1 + "px Roboto";
        hctx.strokeText(
          "<",
          hcanvas.width * currentGmSelector.arrow1x - translatedX,
          hcanvas.height * currentGmSelector.arrow1y - translatedY
        );
        hctx.fillText(
          "<",
          hcanvas.width * currentGmSelector.arrow1x - translatedX,
          hcanvas.height * currentGmSelector.arrow1y - translatedY
        );
        //growing animation for arrow 2
        if (
          currentGmSelector.fontSize2 >
            currentGmSelector.defaultfontSize &&
          currentGmSelector.hover2 == "no"
        ) {
          currentGmSelector.fontSize2--;
        } else if (
          currentGmSelector.fontSize2 <
            currentGmSelector.animatedfontSize &&
          currentGmSelector.hover2 == "yes"
        ) {
          currentGmSelector.fontSize2++;
        }
        hctx.font = "700 " + currentGmSelector.fontSize2 + "px Roboto";
        hctx.strokeText(
          ">",
          hcanvas.width * currentGmSelector.arrow2x - translatedX,
          hcanvas.height * currentGmSelector.arrow2y - translatedY
        );
        hctx.fillText(
          ">",
          hcanvas.width * currentGmSelector.arrow2x - translatedX,
          hcanvas.height * currentGmSelector.arrow2y - translatedY
        );
        hctx.globalAlpha = 1.0; //reset transparency
      
      
      
      
      
  
      
      
        //now draw region selector
        //region selector code has not been added
        var gamemodeservers = ["Virginia #1"];
        if(currentGmSelector.gamemode == 3) {
          gamemodeservers[gamemodeservers.length] = "Virginia #2";
        }
        hctx.font = "700 20px Roboto";
        hctx.lineWidth = 6;
        hctx.strokeText(
          "Region - Server",//Region
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 47.8 - translatedY
        );
        hctx.fillText(
          "Region - Server",//Region
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 47.8 - translatedY
        );
        hctx.font = "700 26px Roboto";
      
        if(gamemodeservers.length <= 1) {
          hctx.strokeText(
            gamemodeservers[0],
            hcanvas.width / 2 - translatedX,
            (hcanvas.height / 100) * 50.5 - translatedY
          );
          hctx.fillText(
            gamemodeservers[0],
            hcanvas.width / 2 - translatedX,
            (hcanvas.height / 100) * 50.5 - translatedY
          );
        } else {
        hctx.strokeText(
          gamemodeservers[currentGamemodeRegion],
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        hctx.fillText(
          gamemodeservers[currentGamemodeRegion],
          hcanvas.width / 2 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        }

      if(gamemodeservers.length <= 1) {
        hctx.font = "900 35px Roboto";
        hctx.fillStyle = "darkgrey";
        hctx.lineWidth = 6.5;
        hctx.strokeText(
          "<",
          (hcanvas.width / 100) * 45.5 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        hctx.fillText(
          "<",
          (hcanvas.width / 100) * 45.5 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        hctx.strokeText(
          ">",
          (hcanvas.width / 100) * 54.5 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        hctx.fillText(
          ">",
          (hcanvas.width / 100) * 54.5 - translatedX,
          (hcanvas.height / 100) * 50.5 - translatedY
        );
        } else {
      
      
      
              //region selector
        //arrow growing animation for arrow 3
        if (
          currentGmSelector.fontSize3 >
            currentGmSelector.defaultfontSize2 &&
          currentGmSelector.hover3 == "no"
        ) {
          currentGmSelector.fontSize3--;
        } else if (
          currentGmSelector.fontSize3 <
            currentGmSelector.animatedfontSize2 &&
          currentGmSelector.hover3 == "yes"
        ) {
          currentGmSelector.fontSize3++;
        }
        hctx.font = "700 " + currentGmSelector.fontSize3 + "px Roboto";
        hctx.strokeText(
          "<",
          hcanvas.width * currentGmSelector.arrow3x - translatedX,
          hcanvas.height * currentGmSelector.arrow3y - translatedY
        );
        hctx.fillText(
          "<",
          hcanvas.width * currentGmSelector.arrow3x - translatedX,
          hcanvas.height * currentGmSelector.arrow3y - translatedY
        );
        //growing animation for arrow 2
        if (
          currentGmSelector.fontSize4 >
            currentGmSelector.defaultfontSize2 &&
          currentGmSelector.hover4 == "no"
        ) {
          currentGmSelector.fontSize4--;
        } else if (
          currentGmSelector.fontSize4 <
            currentGmSelector.animatedfontSize2 &&
          currentGmSelector.hover4 == "yes"
        ) {
          currentGmSelector.fontSize4++;
        }
        hctx.font = "700 " + currentGmSelector.fontSize4 + "px Roboto";
        hctx.strokeText(
          ">",
          hcanvas.width * currentGmSelector.arrow4x - translatedX,
          hcanvas.height * currentGmSelector.arrow4y - translatedY
        );
        hctx.fillText(
          ">",
          hcanvas.width * currentGmSelector.arrow4x - translatedX,
          hcanvas.height * currentGmSelector.arrow4y - translatedY
        );
        hctx.globalAlpha = 1.0; //reset transparency
      
      
        }
      
      
      
        if (connected == "no" || connectedopacity > 0) {
          hctx.globalAlpha = connectedopacity;
          hctx.font = "900 60px Roboto";
          hctx.fillStyle = "white";
          hctx.strokeText(
            "Connecting...",
            hcanvas.width / 2 - translatedX,
            (hcanvas.height / 100) * 58 - translatedY
          );
          hctx.fillText(
            "Connecting...",
            hcanvas.width / 2 - translatedX,
            (hcanvas.height / 100) * 58 - translatedY
          );
          if (connected == "yes") {
            connectedopacity -= 0.1;//disappear animation
          }
          else if (connectedopacity < 1){
            connectedopacity += 0.1;//appear animation
          }
          hctx.globalAlpha = 1.0;
        }
        hctx.restore();
        hctx.textBaseline = "alphabetic"; //change back
        hctx.lineJoin = "miter"; //change back
    } else if (gameStart >= 1 && gameStart < 2.1) {
      //if client clicked play already but server havent replied
      if (gameStart == 1) {
        //only do once
        var yourName = nameInput.value;
        let mySlurslist = [
          "n!g",
          "nig",
          "fag",
          "f@g",
          "fuc",
          "fuk",
          "porn",
          "bitch",
          "bich",
          "dick",
          "cunt",
          "cock",
          "penis",
          "slut",
          "pussy",
        ];
        for (i of mySlurslist) {
          yourName = yourName.replace(i, "***");//if name has fuck, will become ***k
        }

        var packet = JSON.stringify(["joinGame", yourName]);
        socket.send(packet)
        startPlayTime = Date.now();//needed to get time played

        if (gamelocation=="tank-editor" && shownEditButton=="no"){
            document.getElementById("openEditor").style.display = "block";
            shownEditButton = "yes";
        }
        //clear list of objects
        objects = {
          wall: {},//walls drawn below everything
          gate: {},
          Fixedportal: {},
          shape: {},
          bot: {},
        };//shapes and bots always below player, fixed portals always under everything
        portals = {};
        oldportals = {};
        playButton.style.display = "none"; //remove play button, reason for hiding it instead of removing is to make sure it is still behind the popups
        nameInput.style.display = "none"; //remove name input
        changelogbutton.remove(); //remove changelog button
        settingsbutton.remove(); //remove settings button
        wrlbbutton.remove();//remove world record button
        howToPlaybutton.remove(); //remove how to player button
        accountsbutton.style.display = "none"; //hide accounts button, might need to change account name inside
        discordbutton.remove(); //remove discord button
        redditbutton.remove(); //remove reddit button
        tokeninput.remove(); //remove token input box
        document.getElementById("advert").style.display = "none";
        document.getElementById("respawnScoreDiv").innerHTML = "";
        document.getElementById("respawnScoreDiv").style.display = "none";
        document.getElementById("featuredyoutuber").style.display = "none";
        document.getElementById("changelogDisplay").style.display = "none";
        document.getElementById("subtitle").style.display = "none";
        document.getElementById("menuTitle").style.display = "none";
        try {
          //store name, so next time when open the game, will auto-fill the previous name
          localStorage.setItem("prevname", yourName);
          const kitty = localStorage.getItem("prevname");
        } catch (e) {
          console.log("An error occured when saving your name: " + e);
        }
        if (mobile == "yes"){
          /* Get the documentElement (<html>) to display the page in fullscreen */
          //var elem = document.documentElement;
          let elem = document.body;

          /* View in fullscreen */
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
            createNotif("Your device is detected as a mobile device","darkorange",5000)
          } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
          }
        }
      }
      //draw loading words
      hctx.clearRect(0, 0, hcanvas.width, hcanvas.height); //clear home page
      hctx.fillStyle = "black";
      hctx.font = "700 100px Roboto";
      hctx.textAlign = "center";
      hctx.fillText(
        "Joining Game...",
        hcanvas.width / 2,
        hcanvas.height / 2
      );
      //homepage background slowly disappears
      var canvasopacity = 2 - gameStart; //set transparency, which depends on time since clicked play button to create animation. Gamestart changes from 1 to 2
      if (canvasopacity < 0) {
        canvasopacity = 0;
        //gameStart might be 1.5000000000000004 instead of 1.5 due to js precision error, so this prevents transparency to be less than 0
      }
      hctx.globalAlpha = canvasopacity;
      hctx.drawImage(img, 0, 0, hcanvas.width, hcanvas.height);
      hctx.globalAlpha = 1.0; //reset transparency
      gameStart += 0.1;
    } else if (gameStart > 2.1 && gameStart < 2.2) {
      hctx.clearRect(0, 0, hcanvas.width, hcanvas.height); //clear home page after animation complete
      document.getElementById("chat").style.display = "block"; //show chat box

      gameStart = 2.3;
    } else if (gameStart == 2.3 && sentStuffBefore == "yes") {
      //DRAW THE GAME STUFF
      
    //reset to prevent restore bugs (hctx.restore wont happen if there is an error in the code)
    if (typeof hctx.reset == 'function') { 
      hctx.reset();
    }
      
      //for chat animation
      typingAnimation+=0.5*deltaTime;
      if (typingAnimation > 20){
        typingAnimation = 0;
      }
      
      auraRotate += (80)/30*deltaTime;
      if(auraRotate < 0) {auraRotate = 360}
      if(auraRotate > 360) {auraRotate = 0}
      auraWidth = (Math.sin((auraRotate * Math.PI / 180))/20)+0.125;

      //change radiant shape aura width multiplier
      /*
      if (auraWidth >= 0.2) {
        auraWidthDirection = "decreasing";
      } else if (auraWidth <= 0.1) {
        auraWidthDirection = "increasing";
      }
      if (auraWidthDirection == "increasing") {
        auraWidth += 0.003;
      } else if (auraWidthDirection == "decreasing") {
        auraWidth -= 0.003;
      }
      //new radiant shape aura width
      //newaurawidth
      if ((0.2 - newaurawidth) <= 0.01) {
        newauraWidthDirection = "decreasing";
      } else if ((newaurawidth - 0.1) <= 0.01) {
        newauraWidthDirection = "increasing";
      }
      if (newauraWidthDirection == "increasing") {
        newaurawidth += (0.2 - newaurawidth)/30*deltaTime;
        if (newaurawidth > 0.2){
          newaurawidth = 0.2;
        }
      } else if (newauraWidthDirection == "decreasing") {
        newaurawidth -= (newaurawidth - 0.1)/30*deltaTime;
        if (newaurawidth < 0.1){
          newaurawidth = 0.1;
        }
      }
      */
      //for radiant shape spike
      extraSpikeRotate++;
      if (extraSpikeRotate >= 360) {
        extraSpikeRotate -= 360;
      }
      extraSpikeRotate1 += 2;
      if (extraSpikeRotate1 >= 360) {
        extraSpikeRotate1 -= 360;
      }
      extraSpikeRotate2--;
      if (extraSpikeRotate2 <= 0) {
        extraSpikeRotate2 += 360;
      }
      //for radiant colors
      for (const id in radiantShapes) {
        let animationSpeed = 3;
        let radtype = radiantShapes[id].radtype;
        if (radtype == 1) {
          //red yellow blue
          if (radiantShapes[id].rgbstate == 0) {
            radiantShapes[id].rgbstate = 1;
          } else if (radiantShapes[id].rgbstate == 1) {
            if (radiantShapes[id].red > 200) {
              radiantShapes[id].red -= animationSpeed;
            }
            radiantShapes[id].green += animationSpeed;
            if (radiantShapes[id].green >= 150) {
              radiantShapes[id].rgbstate = 2; //change to next state
            }
          } else if (radiantShapes[id].rgbstate == 2) {
            radiantShapes[id].blue += animationSpeed;
            if (radiantShapes[id].green > 0) {
              radiantShapes[id].green -= animationSpeed;
            }
            if (radiantShapes[id].red > 0) {
              radiantShapes[id].red -= animationSpeed;
            }
            if (radiantShapes[id].blue >= 200) {
              radiantShapes[id].rgbstate = 3; //change state
            }
          } else if (radiantShapes[id].rgbstate == 3) {
            radiantShapes[id].blue -= animationSpeed;
            radiantShapes[id].red += animationSpeed;
            if (
              radiantShapes[id].blue <= 0 &&
              radiantShapes[id].red >= 255
            ) {
              radiantShapes[id].rgbstate = 1; //change state
              radiantShapes[id].red = 255;
              radiantShapes[id].blue = 0;
            }
          }
        } else {
          //greyish-green white yellow 118, 168, 151 -> 209, 230, 222 -> 234, 240, 180
          if (radiantShapes[id].rgbstate == 0) {
            radiantShapes[id].rgbstate = 1;
          } else if (radiantShapes[id].rgbstate == 1) {
            if (
              radiantShapes[id].red >= 118 &&
              radiantShapes[id].red < 209
            ) {
              radiantShapes[id].red += animationSpeed;
              radiantShapes[id].blue += animationSpeed;
              radiantShapes[id].green += animationSpeed;
            } else {
              radiantShapes[id].rgbstate = 2; //change to next state
            }
          } else if (radiantShapes[id].rgbstate == 2) {
            radiantShapes[id].blue -= animationSpeed;
            if (radiantShapes[id].green < 240) {
              radiantShapes[id].green += animationSpeed;
            }
            if (radiantShapes[id].red < 234) {
              radiantShapes[id].red += animationSpeed;
            }
            if (radiantShapes[id].blue <= 180) {
              radiantShapes[id].rgbstate = 3; //change state
            }
          } else if (radiantShapes[id].rgbstate == 3) {
            radiantShapes[id].red -= animationSpeed;
            if (radiantShapes[id].green > 168) {
              radiantShapes[id].green -= animationSpeed;
            }
            if (radiantShapes[id].blue > 151) {
              radiantShapes[id].blue -= animationSpeed;
            }
            if (radiantShapes[id].red <= 118) {
              radiantShapes[id].rgbstate = 1; //change state
              radiantShapes[id].red = 118;
              radiantShapes[id].blue = 168;
              radiantShapes[id].green = 151;
            }
          }
        }
      }
      //for gates
      gateTimer += 0.1 * deltaTime;
      if (gateTimer >= endGate){
        gateTimer = startGate;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height); //clear screen so can redraw
      hctx.clearRect(0, 0, hcanvas.width, hcanvas.height); //clear screen so can redraw
      //shake canvas if touch portal
      let prevShakeYN = shakeYN;//this one doesnt change later on
      if (shakeYN == "yes") {
        ctx.save();
        var dx = Math.random() * 20 * (1 - shakeIntensity) - 10 * (1 - shakeIntensity);
        var dy = Math.random() * 20 * (1 - shakeIntensity) - 10 * (1 - shakeIntensity);
        //-10 at the end so that the chosen number has a range of between -10 and 10
        //shake intensity 0 means that players is at center of portal
        ctx.translate(dx, dy);
      }
      else if (slightshake == "yes"){
        if (slightshakeIntensity<0){
          slightshake = "no";
        }
        else{
          ctx.save();
          var dx = Math.random() * 10 * slightshakeIntensity - 5 * slightshakeIntensity;
          var dy = Math.random() * 10 * slightshakeIntensity - 5 * slightshakeIntensity;
          //-10 at the end so that the chosen number has a range of between -10 and 10
          ctx.translate(dx, dy);
          slightshakeIntensity-=0.1;
        }
      }
      //the canvas is the whole screen
     
      //interpolate the player's position first
      lerpDrawnX = 0;
      lerpDrawnY = 0;
      if (objects.player && oldobjects.player && interpolatedobjects.player){
        interpolatedobjects.player[playerstring] = JSON.parse(JSON.stringify(objects.player[playerstring]));
        simpleLerpPos(objects.player[playerstring],oldobjects.player[playerstring],interpolatedobjects.player[playerstring])
        px = lerpDrawnX;//needed for drawing stuff
        py = lerpDrawnY;
      }
      else{
        px = player.x;
        py = player.y;
      }

      //now we are drawing the game area
      if (playerstring != "error") {
        //checks if server has already sent player's id to client
        drawAreaX = canvas.width / 2 - px; //needed for mouse movement
        drawAreaY = canvas.height / 2 - py;
        window["x"] = px;
        window["y"] = py;
        //COLOR OF AREA OUTSIDE PLAYABLE AREA
      }
      if (gamelocation == "dune") {
        //dune background
        ctx.fillStyle = "#fcdcbb";
      } else if (gamelocation == "cavern") {
        //cavern background
        ctx.fillStyle = "#010101";
      } else if (gamelocation == "sanctuary") {
        //sanc background
        ctx.fillStyle = "#404040";
      } else if (gamelocation == "crossroads") {
        //crossroads background
        ctx.fillStyle = "#1f1f1f";
      } else {
        //arena background
        ctx.fillStyle = "#bebebe";
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height); //drawing background
      //COLOR OF PLAYABLE AREA
      if (gamelocation == "dune") {
        //dune background
        ctx.fillStyle = "#ffead4";
      } else if (gamelocation == "cavern") {
        //cavern background
        ctx.fillStyle = "#141414";
      } else if (gamelocation == "sanctuary") {
        //sanc background
        ctx.fillStyle = "#595959";
      } else if (gamelocation == "crossroads") {
        //crossroads background
        ctx.fillStyle = "#303030";
      } else {
        //arena background
        ctx.fillStyle = "#CDCDCD";
      }
      ctx.fillRect(
        canvas.width / 2 - px / clientFovMultiplier,
        canvas.height / 2 - py / clientFovMultiplier,
        gameAreaSize / clientFovMultiplier,
        gameAreaSize / clientFovMultiplier
      ); //drawing area

      if (gamelocation == "2tdm") {//draw team base
        var baseSize = 1500;
        let firstColor = teamColors[0];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          gameAreaSize / clientFovMultiplier
        );
        firstColor = teamColors[1];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier + gameAreaSize / clientFovMultiplier - baseSize / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          gameAreaSize / clientFovMultiplier
        );
      }
      if (gamelocation == "4tdm") {//draw team base
        var baseSize = 1500;
        let firstColor = teamColors[0];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";//c7bccf
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier
        );
        firstColor = teamColors[1];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier + gameAreaSize / clientFovMultiplier - baseSize / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier
        );
        firstColor = teamColors[2];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier + gameAreaSize / clientFovMultiplier - baseSize / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier + gameAreaSize / clientFovMultiplier - baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier
        );
        

        firstColor = teamColors[3];
        //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
        if (firstColor == "red"){
          ctx.fillStyle = "#dbbfc0";
        }
        else if (firstColor == "green"){
          ctx.fillStyle = "#acd0bd";
        }
        else if (firstColor == "blue"){
          ctx.fillStyle = "#acc8d0";
        }
        else if (firstColor == "purple"){
          ctx.fillStyle = "#c0b3c9";
        }
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier,
          canvas.height / 2 - py / clientFovMultiplier + gameAreaSize / clientFovMultiplier - baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier,
          baseSize / clientFovMultiplier
        );
      }
      if (gamelocation == "tank-editor"){//draw safe zone
        ctx.fillStyle = safeZoneColor;
        ctx.fillRect(
          canvas.width / 2 - px / clientFovMultiplier + gameAreaSize / clientFovMultiplier /2 - safeZone / clientFovMultiplier /2,
          canvas.height / 2 - py / clientFovMultiplier + gameAreaSize / clientFovMultiplier /2 - safeZone / clientFovMultiplier /2,
          safeZone / clientFovMultiplier,
          safeZone / clientFovMultiplier
        );
      }

      //drawin grid lines
      ctx.beginPath();
      ctx.lineWidth = 1; //thickness of grid
      var gridHeight = 30 / clientFovMultiplier;
      if (gamelocation == "dune") {
        //dune grid color
        //ctx.strokeStyle = "#ede9c5";
        ctx.strokeStyle = "#edddc5";
      } else if (gamelocation == "cavern") {
        //cavern grid color
        //ctx.strokeStyle = "#1d1942";
        ctx.strokeStyle = "#242424";
        gridHeight = 80 / clientFovMultiplier;
      } else if (gamelocation == "sanctuary") {
        //sanc grid color
        ctx.strokeStyle = "#363636";
        ctx.lineWidth = 3 / clientFovMultiplier;
      } else if (gamelocation == "crossroads") {
        //crossroads grid color
        //ctx.strokeStyle = "#0f0f0f";
        //ctx.strokeStyle = "#262626";
        ctx.strokeStyle = "rgba(18, 18, 18, .5)";
        gridHeight = 80 / clientFovMultiplier;
        ctx.lineWidth = 3; //thickness of grid
      } else {
        //arena grid color
        //ctx.strokeStyle = "#a9a9a9";//old color
        //ctx.strokeStyle = "#BEBEBE";//newer color that looked ok, except for grid above team bases
        ctx.lineWidth = 4; //thickness of grid
        gridHeight = 24 / clientFovMultiplier;
        ctx.strokeStyle = "rgba(180, 180, 180, .2)";
      }

      //How does drawing the grid lines work: the equation below is to calculate the negative of the closest number to drawAreaX that is divisible by gridHeight, with drawAreaX referring to the distance from left side of screen to arena, and gridHeight is distance between lines drawn. By calculating this, we can find out the position to start drawing the first line on the left side of the screen, producing the effect of the grid moving in the opposite direction of the user. Need to be opposite, that's why negative in equation. Because the lines are drawn relative to the left and top of arena, that's why the lines are always drawn exactly on the left and top of arena on screen, unless people disconnect or connect, resulting in change og arena size.
      //for x: -gridHeight-(-drawAreaX%gridHeight)
      //for y: -gridHeight-(-drawAreaY%gridHeight)
      //edit: instead of using drawAreaX, use (canvas.width/2 - player.x/fov) for accurate grid drawing
      if (player.fovMultiplier < 10) {
        //dont draw grid lines if field of vision is high, to prevent lag from drawing too many grid lines
        for (
          let x =
            -gridHeight -
            (-(canvas.width / 2 - px / clientFovMultiplier) %
              gridHeight);
          x < canvas.width;
          x += gridHeight
        ) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
        }
        for (
          let y =
            -gridHeight -
            (-(canvas.height / 2 - py / clientFovMultiplier) %
              gridHeight);
          y < canvas.height;
          y += gridHeight
        ) {
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
      }
      
      
      //drawing the objects that are sent from the server, order of drawings are already changed by the server, so if you want something to be below another thing, change the order of adding to the object list in the server code, not the client code
      //Object.keys(portalparticles).forEach((id) => {
      for (const id in portalparticles) {
        //potral particle list first, so that it is drawn at the bottom
        let thisobject = portalparticles[id];
        thisobject.x += Math.cos(thisobject.angle) * thisobject.speed*deltaTime;
        thisobject.y += Math.sin(thisobject.angle) * thisobject.speed*deltaTime;
        drawobjects(thisobject, id, playerstring, auraWidth); //draw the objects on the canvas
        thisobject.timer-=1*deltaTime;
        if (thisobject.timer < 0) {
          delete portalparticles[id];
        }
      };
      shakeYN = "no"; //reset portal screen shake
      shakeIntensity = 1;
      Object.keys(portals).forEach((id) => {
        //draw portals. portals not inside object list because all need to be sent for the minimap anyways
        if (!portalwidths.hasOwnProperty(id)) {
          portalwidths[id] = portals[id].width; //this is used for keeping track the sizes of portal that changes when player enter and exit a portal
        } else {
          //if this portal already existed
          if (
            portalwidths[id] <
            portals[id].width + portals[id].peopleTouch * 45
          ) {
            //45px portal size growth per person
            portalwidths[id] += 3;
          } else if (
            portalwidths[id] >
            portals[id].width + portals[id].peopleTouch * 45
          ) {
            portalwidths[id] -= 3;
          }
        }
        var thisobject = portals[id];
        thisobject.type = "portal";
        let oldtimer = thisobject.timer;
        if (oldportals[id]){
          thisobject.timer = lerpProperty(thisobject,oldportals[id],'timer')
        }
        drawobjects(thisobject, id, playerstring, auraWidth); //draw the objects on the canvas
        thisobject.timer = oldtimer;//reset timer to original (not lerped)

        //check for collision with portal to check if shake canvas or not
        var DistanceBetween = Math.sqrt(
          (player.x - thisobject.x) * (player.x - thisobject.x) +
            (player.y - thisobject.y) * (player.y - thisobject.y)
        ); //calculate distance between center of portal and player
        if (DistanceBetween <= player.width + thisobject.width * 3) {
          //portal width times 3 so that shake will be felt from a distance
          shakeYN = "yes";
          if (
            DistanceBetween / (player.width + thisobject.width * 3) <
            shakeIntensity
          ) {
            //if new shake intensity higher than shake intensity from anither portal
            shakeIntensity =
              DistanceBetween / (player.width + thisobject.width * 3); //ranges from 1 to 0, 0 meaning player is at center of portal
          }
        }
      });
      
      //smoothly change player's fov
      if (player.fovMultiplier){
        if (clientFovMultiplier != player.fovMultiplier){
          clientFovMultiplier += (player.fovMultiplier - clientFovMultiplier)/5;
          if (Math.abs(clientFovMultiplier - player.fovMultiplier)<0.001){
            clientFovMultiplier = player.fovMultiplier;
          }
        }
      }
      
      
      for (const type in objects) {
        for (const id in objects[type]) {
          var thisobject = JSON.parse(JSON.stringify(objects[type][id]));
          if (!interpolatedobjects[type]){
            interpolatedobjects[type] = {};
          }
          interpolatedobjects[type][id] = JSON.parse(JSON.stringify(objects[type][id]));
          if (oldobjects[type]){
            if (oldobjects[type][id]){
              //do lerping if not new object
              if (id != playerstring){//not the player
                lerpDrawnX = thisobject.x;
                lerpDrawnY = thisobject.y;
                simpleLerpPos(thisobject,oldobjects[type][id],interpolatedobjects[type][id])
                thisobject.x = lerpDrawnX;
                thisobject.y = lerpDrawnY;
                if (type == "player" || type == "shape" || type == "def"){//lerp angle
                  thisobject.angle = simpleLerpAngle(thisobject,oldobjects[type][id])
                  if (type == "shape"){
                    thisobject.health = lerpProperty(thisobject,oldobjects[type][id],'health')
                  }
                }
              }
              else{
                //camera is lerped
                simpleLerpPos(thisobject,oldobjects[type][id],interpolatedobjects[type][id])
                thisobject.x = px;
                thisobject.y = py;
                thisobject.angle = simpleLerpAngle(thisobject,oldobjects[type][id])
              }
            }
          }
          thisobject.type = type;
          interpolatedobjects[type][id].x = thisobject.x;
          interpolatedobjects[type][id].y = thisobject.y;
          drawobjects(thisobject, id, playerstring, auraWidth); //draw the objects on the canvas
        }
      }
      
        for (const id in objects.player) {
          var thisobject = JSON.parse(JSON.stringify(objects.player[id]));
          if (oldobjects.player){
            if (oldobjects.player[id]){
              //do lerping if not new object
              if (id != playerstring){//not the player
                lerpDrawnX = thisobject.x;
                lerpDrawnY = thisobject.y;
                simpleLerpPos(thisobject,oldobjects.player[id],interpolatedobjects.player[id])
                thisobject.x = lerpDrawnX;
                thisobject.y = lerpDrawnY;
                thisobject.angle = simpleLerpAngle(thisobject,oldobjects.player[id])
              }
              else{
                simpleLerpPos(thisobject,oldobjects.player[id],interpolatedobjects.player[id])
                thisobject.x = px;
                thisobject.y = py;
              }
            }
          }
          thisobject.type = "player";
          interpolatedobjects.player[id].x = thisobject.x;
          interpolatedobjects.player[id].y = thisobject.y;
          drawplayerdata(thisobject, id, playerstring, auraWidth); //draw the obcjects on the canvas
        }
      
      listofdeadobjects.forEach((object) => {
        //dead object array
        if (object.bulletType != "aura") {
          if (object.type == "bullet") {
            //check if bullet belongs to player. usually server does this, but not for dead objects
            if (object.ownerId == playerstring) {
              object.ownsIt = "yes";
            }
          }
          else if (object.type == "shape"){
            if (shapeHealthBar.hasOwnProperty(object.id)){//for health bar width animation when die
              if (shapeHealthBar[object.id] > 0){
                shapeHealthBar[object.id]-=5*deltaTime;
              }
              if (shapeHealthBar[object.id] < 0){
                shapeHealthBar[object.id] = 0;
              }
            }
          }
          if (object.hasOwnProperty("deadanimation")) {
            object.deadanimation--; //animate object
            //object.width += 5;
            object.width *= 1.1;
            if (object.deadOpacity > 0) {
              object.deadOpacity -= 0.2;
            }
            if (object.deadOpacity < 0) {
              object.deadOpacity = 0;
            }
            if (object.deadanimation < 0) {
              //remove object from array
              var index = listofdeadobjects.indexOf(object);
              if (index > -1) {
                // only splice array when item is found
                listofdeadobjects.splice(index, 1); // 2nd parameter means remove one item only
              }
            }
          } else {
            object.deadanimation = 5; //duration of dead animation
            object.deadOpacity = 1;
          }
          drawobjects(object, object.id, playerstring, auraWidth); //draw the objects on the canvas
        }
      });
      Object.keys(radparticles).forEach((id) => {
        //radiant particle list last so that it is drawn at the top
        var thisobject = radparticles[id];
        drawobjects(thisobject, id, playerstring, auraWidth); //draw the objects on the canvas
        thisobject.x += Math.cos(thisobject.angle) * thisobject.speed*deltaTime;
        thisobject.y += Math.sin(thisobject.angle) * thisobject.speed*deltaTime;
        thisobject.timer-=1*deltaTime;
        if(thisobject.source == "dune") {
           thisobject.angle = (((-90 * Math.PI) / 180) + (thisobject.angle * 199)) / 200;
        }

        if (thisobject.timer < 0) {
          delete radparticles[id];
        }
      });
      //update fps
      fpsvaluenow++;

      if (gamelocation == "dune") {
        //spawn random particles if in dune
        if (spawnduneparticle == "yes"){
          var choosing = Math.floor((Math.random() * 10)/clientFovMultiplier); //choose if particle spawn
          if (choosing <= 0) {
            //spawn a particle
            let angleRadians = (-30+Math.floor(Math.random() * 30) * Math.PI) / 180; //convert to radians
            var size = 50*(Math.floor(Math.random() * 3) + 1)-25;
            var randomDistFromCenterX = (Math.floor(Math.random() * canvas.width+size) - (canvas.width+size)/2)*clientFovMultiplier;
            var randomDistFromCenterY = (Math.floor(Math.random() * canvas.height+size) - (canvas.height+size)/2)*clientFovMultiplier;
            radparticles[particleID] = {
              angle: angleRadians,
              x: player.x + randomDistFromCenterX,// * Math.cos(angleRadians),
              y: player.y - randomDistFromCenterY,// * Math.sin(angleRadians),
              width: size,
              height: size,
              speed: 5,
              timer: 200,
              maxtimer: 200,
              color: `rgba(222, 152, 22, ${0.3/((size/50)+1)})`,
              outline: `rgba(0,0,0,${0.1/((size/50)+1)})`,
              type: "particle",
              source: "dune",
            };
            particleID++;
          }
        }
        //cover whole screen in darkness for dune
        ctx.fillStyle = "rgba(0,0,0,.2)"; //make background darker
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      function anglecalc(cx, cy, ex, ey) {
        var dy = ey - cy ;
        var dx = cx - ex ;
        return Math.atan2(dx, dy) * 180 / Math.PI;
      }
      if (player.x && player.y){
        var rangeX = player.x-(gameAreaSize/2);
        var rangeY = player.y-(gameAreaSize/2);
      }
      else{
        var rangeX = 0;
        var rangeY = 0;
      }
      crossroadRadians = (crossroadRadians*29 + anglecalc(0, 0, rangeX, rangeY)+90) / 30;   
      if(isNaN(crossroadRadians)) {
        crossroadRadians = anglecalc(0, 0, rangeX, rangeY)+90; // not really radians but ok
      }

      if (gamelocation == "crossroads") {
        //spawn random particles if in crossroads
        if (spawncrossroadsparticle == "yes"){
          var choosing = Math.floor((Math.random() * 2)/clientFovMultiplier); //choose if particle spawn
          if (choosing <= 0) {
            //spawn a particle

            let angleRadians = crossroadRadians+ ((-30 + Math.floor(Math.random() * 60)));
            var size = 50*(Math.floor(Math.random() * 3) + 1)-25;
            var randomDistFromCenterX = (Math.floor(Math.random() * canvas.width+size) - (canvas.width+size)/2)*clientFovMultiplier;
            var randomDistFromCenterY = (Math.floor(Math.random() * canvas.height+size) - (canvas.height+size)/2)*clientFovMultiplier;
            radparticles[particleID] = {
              angle: angleRadians * Math.PI / 180,
              x: player.x + randomDistFromCenterX,// * Math.cos(angleRadians),
              y: player.y - randomDistFromCenterY,// * Math.sin(angleRadians),
              width: size,
              height: size,
              speed: 25,
              timer: 100,
              maxtimer: 100,
              color: `rgba(152, 152, 152, ${0.3})`,
              outline: `rgba(0,0,0,${0.1})`,
              type: "particle",
              source: "crossroads",
            };
            particleID++;
          }
        }
      }
      //console.log(crossroadRadians, rangeX, rangeY);//was making my fps die

      if (prevShakeYN == "yes" || slightshake == "yes") {
        ctx.restore();
      }

      if (gamelocation == "crossroads") {
        //draw the darkness for crossroads
        //the rectangle (entire screen)
        hctx.fillStyle = "rgba(0,0,0,.7)";
        hctx.fillRect(0,0,hcanvas.width,hcanvas.height)
        
        if (barrelsDarkness.length == 0){//no barrels
          barrelsDarkness.push(0);//circle tourchlight
        }
      
        hctx.save();
        hctx.translate(hcanvas.width/2, hcanvas.height/2);//bottom left of screen
        hctx.scale(1,resizeDiffY/resizeDiffX);
        hctx.translate(-hcanvas.width/2, -hcanvas.height/2);//translate back after scaling
        hctx.globalCompositeOperation='destination-out';//'erase' the darkness
        //let circleWidth = player.width * 4 + 50;
        let circleWidth = player.width * 6;
        //let barrelCorner = 25;//radius of rounded corner
        let barrelCorner = player.width;//radius of rounded corner
        hctx.beginPath();
        hctx.save();
        hctx.translate(canvas.width / 2, canvas.height / 2);
        let playerAngle = clientAngle;
        if (player.autorotate == "yes" || player.fastautorotate == "yes"){
          playerAngle = player.angle;
        }
        hctx.rotate(playerAngle - (90 * Math.PI) / 180);
      
        let holeInArc = 0.15 * Math.PI;//angle towards edge of torchlight, same value as the value used to arc (code above this line)
        let radius = circleWidth+crDarknessSize;
        //calculate the endpoint of the arc around the player
        let torchlightHeightDefault = circleWidth/4*3+crDarknessSize;//size of torchlight
        let torchlightWidthAngle = 10/180*Math.PI;//angle of torchlight
        let endx;
        let endy;
        let extraamount = player.width/25*4.2;//if there is a spike at the corner of the barrel, change this value
      
        function drawBarrelDarkness(angle,prevAngle){
          if (prevAngle == 0){
            prevAngle = 2 * Math.PI;
          }
          hctx.arc(0, 0, circleWidth+crDarknessSize, prevAngle-holeInArc, angle+holeInArc, true); //draw an incomplete circle (circle around the tank)
      
          //the torchlight
          
          hctx.save();
          hctx.rotate(angle);
          endx = Math.cos(holeInArc) * radius;
          endy = Math.sin(holeInArc) * radius;
          endx += Math.cos(torchlightWidthAngle) * torchlightHeightDefault;
          endy += Math.sin(torchlightWidthAngle) * torchlightHeightDefault;
          hctx.lineTo(endx, endy);
          //rounded corner of barrel
          hctx.arc(endx-barrelCorner, endy-barrelCorner-extraamount, barrelCorner, 0.5 * Math.PI, 0, true); //-2 cuz barrel is slanted line
          //line furthest from player
          endx = Math.cos(-holeInArc) * radius;
          endy = Math.sin(-holeInArc) * radius;
          endx += Math.cos(-torchlightWidthAngle) * torchlightHeightDefault;
          endy += Math.sin(-torchlightWidthAngle) * torchlightHeightDefault;
          hctx.lineTo(endx, endy);
        //rounded corner of barrel
          hctx.arc(endx-barrelCorner, endy+barrelCorner+extraamount, barrelCorner, 2 * Math.PI, 1.5 * Math.PI, true); //27 instead of 25 cuz barrel is slanted line
          //line back player towards
          endx = Math.cos(-holeInArc) * radius;
          endy = Math.sin(-holeInArc) * radius;
          hctx.lineTo(endx, endy);
          hctx.restore();
          
        }
      
        for (var i = 0; i < barrelsDarkness.length; i++) {
            let thisAngle = barrelsDarkness[i];
            let previousAngle = barrelsDarkness[i-1]
            if (i == 0){
              previousAngle = barrelsDarkness[barrelsDarkness.length-1]
            }
            let barrelHeight = correspondingBarrelHeight[thisAngle]*player.width
            torchlightHeightDefault = circleWidth/4*3/45*barrelHeight+crDarknessSize;
            drawBarrelDarkness(thisAngle*Math.PI/180, previousAngle*Math.PI/180)
        }
      
        hctx.closePath();
        hctx.restore();
      
        hctx.fillStyle = "white";//make a hole in the darkness
        hctx.fill();
        hctx.restore();
        
        //create the second inner circle
        circleWidth = player.width * 4;
        barrelCorner = player.width/2;//radius of rounded corner
        hctx.globalCompositeOperation='source-over';
        hctx.fillStyle = "rgba(0,0,0,.4)";
        hctx.fillRect(0,0,hcanvas.width,hcanvas.height)
      
        hctx.save();
        hctx.translate(hcanvas.width/2, hcanvas.height/2);//bottom left of screen
        hctx.scale(1,resizeDiffY/resizeDiffX);
        hctx.translate(-hcanvas.width/2, -hcanvas.height/2);//translate back after scaling
        hctx.globalCompositeOperation='destination-out';//'erase' the darkness
        hctx.beginPath();
        hctx.save();
        hctx.translate(canvas.width / 2, canvas.height / 2);
        playerAngle = clientAngle;
        if (player.autorotate == "yes" || player.fastautorotate == "yes"){
          playerAngle = player.angle;
        }
        hctx.rotate(playerAngle - (90 * Math.PI) / 180);
        
        //the torchlight
        holeInArc = 0.1 * Math.PI;
        radius = circleWidth+crDarknessSize;
        extraamount /= 2;//if there is a spike at the corner of the barrel, change this value
      
        for (var i = 0; i < barrelsDarkness.length; i++) {
            let thisAngle = barrelsDarkness[i];
            let previousAngle = barrelsDarkness[i-1]
            if (i == 0){
              previousAngle = barrelsDarkness[barrelsDarkness.length-1]
            }
            let barrelHeight = correspondingBarrelHeight[thisAngle]*player.width
            torchlightHeightDefault = (circleWidth + player.width*2)/4*3/45*barrelHeight+crDarknessSize;
            drawBarrelDarkness(thisAngle*Math.PI/180, previousAngle*Math.PI/180)
        }
        
        hctx.closePath();
        hctx.restore();
        hctx.fillStyle = "white";
        hctx.fill();
        
        if (darknessGrowth == "yes"){
          crDarknessSize+=0.2;
          if (crDarknessSize >= 50){
            darknessGrowth = "no";
          }
        }
        else{
          crDarknessSize-=0.2;
          if (crDarknessSize <= 0){
            darknessGrowth = "yes";
          }
        }
      
        hctx.restore();
        hctx.globalCompositeOperation='source-over';
      }

      if (mobile == "yes") {
        //mobile joystick controls
        hctx.fillStyle = "rgba(69,69,69,.5)";
        let resizeDiffX = 1/window.innerWidth*hcanvas.width;//prevent squashed HUD on different sized screens
        let resizeDiffY = 1/window.innerHeight*hcanvas.height;
        hctx.save();
        hctx.translate(
          hcanvas.width / 2 + joystick1.xFromCenter,
          hcanvas.height / 2 + joystick1.yFromCenter
        );
        hctx.scale(1,resizeDiffY/resizeDiffX);
        
        //first joystick
        hctx.beginPath();
        hctx.arc(
          0,
          0,
          joystick1.size,
          0,
          2 * Math.PI
        );
        hctx.fill();
        
        hctx.restore();
        hctx.save();
        hctx.translate(
          hcanvas.width / 2 + joystick2.xFromCenter,
          hcanvas.height / 2 + joystick2.yFromCenter
        );
        hctx.scale(1,resizeDiffY/resizeDiffX);
        
        //second joystick
        hctx.beginPath();
        hctx.arc(
          0,
          0,
          joystick2.size,
          0,
          2 * Math.PI
        );
        hctx.fill();
        
        hctx.restore();
        //circle at thumb when using joystick
        hctx.fillStyle = "rgba(0,0,0,.5)";
        if (touches[0].state!="no"){
          //calculate position on joystick
          
          //get angle of touch from joystick
          //position of touch
          let ex = touches[0].xpos/window.innerWidth*hcanvas.width;
          let ey = touches[0].ypos/window.innerHeight*hcanvas.height;
          //position of joystick
          let cx;
          let cy;
          let radius;
          if (touches[0].state=="moving"){
            cx = hcanvas.width / 2 + joystick1.xFromCenter;
            cy = hcanvas.height / 2 + joystick1.yFromCenter;
            radius = joystick1.size;
          }
          else{
            cx = hcanvas.width / 2 + joystick2.xFromCenter;
            cy = hcanvas.height / 2 + joystick2.yFromCenter;
            radius = joystick2.size;
          }
          let dy = ey - cy;
          let dx = ex - cx;
          let theta = -Math.atan2(dy, dx) + 90/180*Math.PI;
          
          dx = radius * Math.sin(theta) + cx;
          dy = radius * Math.cos(theta) + cy;
          
          hctx.save();
          hctx.translate(
            cx,
            cy
          );
          hctx.scale(1,resizeDiffY/resizeDiffX);
          
          hctx.beginPath();
          hctx.arc(
            dx - cx,
            dy - cy,
            joystick2.size/2,
            0,
            2 * Math.PI
          );
          hctx.fill();
          
          hctx.restore();
        }
        if (touches[1].state!="no"){
          //calculate position on joystick
          
          //get angle of touch from joystick
          //position of touch
          let ex = touches[1].xpos/window.innerWidth*hcanvas.width;
          let ey = touches[1].ypos/window.innerHeight*hcanvas.height;
          //position of joystick
          let cx;
          let cy;
          let radius;
          if (touches[1].state=="moving"){
            cx = hcanvas.width / 2 + joystick1.xFromCenter;
            cy = hcanvas.height / 2 + joystick1.yFromCenter;
            radius = joystick1.size;
          }
          else{
            cx = hcanvas.width / 2 + joystick2.xFromCenter;
            cy = hcanvas.height / 2 + joystick2.yFromCenter;
            radius = joystick2.size;
          }
          let dy = ey - cy;
          let dx = ex - cx;
          let theta = -Math.atan2(dy, dx) + 90/180*Math.PI;
          
          dx = radius * Math.sin(theta) + cx;
          dy = radius * Math.cos(theta) + cy;
          
          hctx.save();
          hctx.translate(
            cx,
            cy
          );
          hctx.scale(1,resizeDiffY/resizeDiffX);
          
          hctx.beginPath();
          hctx.arc(
            dx - cx,
            dy - cy,
            joystick2.size/2,
            0,
            2 * Math.PI
          );
          hctx.fill();
          
          hctx.restore();
        }
      }

      //note: ctx requires /clientFovMultiplier, but hctx does not because the canvas size does not change
      //drawing upgrade buttons
      function buttondraw(
        buttonNumber,
        one,
        two,
        three,
        four,
        five,
        six,
        seven
      ) {
        if ((ignorebuttonw.ignore == "no" || buttonNumber>7) && (ignorebuttonb.ignore == "no" || buttonNumber<=7)){//if not ignore
        let thisbutton = upgradeButtons[buttonNumber];
        thisbutton.tankRotate += 1.5*deltaTime; //make tank in upgrade button rotate
        if (thisbutton.hover == "yes") {
          if (thisbutton.brightness < 50) {
            //increase brightness when hovering over upgrade button
            thisbutton.brightness += 10*deltaTime;
          } else {
            thisbutton.brightness = 50;
          }
          if (
            thisbutton.width < thisbutton.animatedwidth
          ) {
            let amountAdd = thisbutton.animatedwidth - thisbutton.width;
            if (amountAdd >= 0.05){//if not too near to the end width
              amountAdd /= 3;//button enlarges faster before decreasing in speed
            }
            thisbutton.width += amountAdd*deltaTime;
          } else {
            thisbutton.width = thisbutton.animatedwidth;
          }
        } else {
          if (thisbutton.brightness > 0) {
            //decrease brightness when hovering over upgrade button
            thisbutton.brightness -= 10*deltaTime;
          } else {
            thisbutton.brightness = 0;
          }
          if (
            thisbutton.width > thisbutton.defaultwidth
          ) {
            let amountAdd = thisbutton.width - thisbutton.defaultwidth;
            if (amountAdd >= 0.05){//if not too near to the end width
              amountAdd /= 3;//button enlarges faster before decreasing in speed
            }
            thisbutton.width -= amountAdd*deltaTime;
          } else {
            thisbutton.width = thisbutton.defaultwidth;
          }
        }
        //check if button is animating
        if (buttonNumber <= 7){//upgrade buttons on right side of screen
          if (thisbutton.x > thisbutton.endx) {
            thisbutton.x -= (thisbutton.x - thisbutton.endx)/10*deltaTime; //animating the button with a speed of distStillNeedToMove/10
          }
          else if ((thisbutton.x-thisbutton.endx)<1) {
            thisbutton.x = thisbutton.endx; //if distance between current position and actual position is less than 1
          }
          else if (thisbutton.x < thisbutton.endx) {
            thisbutton.x = thisbutton.endx;//might be reason why body upgrade animation isnt working?
            //thisbutton.x += (thisbutton.endx - thisbutton.x)/10;
          }
        }
        else{//upgrade buttons on left side of screen
          if (thisbutton.x < thisbutton.endx) {
            thisbutton.x += (thisbutton.endx - thisbutton.x)/10*deltaTime; //animating the button with a speed of distStillNeedToMove/10
          }
          else if ((thisbutton.endx-thisbutton.x)<1) {
            thisbutton.x = thisbutton.endx; //if distance between current position and actual position is less than 1
          }
          else if (thisbutton.x > thisbutton.endx) {
            thisbutton.x = thisbutton.endx;//might be reason why body upgrade animation isnt working?
            //thisbutton.x += (thisbutton.endx - thisbutton.x)/10;
          }
        }
        hctx.strokeStyle = "black";
          //change color based on brightness
          let splitRGB = thisbutton.color.split(",");
          let red = Number(splitRGB[0]) + thisbutton.brightness;
          let blue = Number(splitRGB[1]) + thisbutton.brightness;
          let green = Number(splitRGB[2]) + thisbutton.brightness;
          hctx.fillStyle = "rgb(" + red + "," + blue + "," + green + ")";
        hctx.lineWidth = 5;
        //draw button
        var w = thisbutton.width;
        var h = thisbutton.width;
        var r = 7;
          var r2 = r;//radius of bottom part of dark area
        var x = thisbutton.x - thisbutton.width/2;
        var y = thisbutton.y - thisbutton.width/2
        hctx.beginPath();
        hctx.moveTo(x + r, y);
        hctx.arcTo(x + w, y, x + w, y + h, r);
        hctx.arcTo(x + w, y + h, x, y + h, r);
        hctx.arcTo(x, y + h, x, y, r);
        hctx.arcTo(x, y, x + w, y, r);
        hctx.closePath();
        hctx.fill();
        hctx.stroke();
          //draw dark area
          splitRGB = thisbutton.darkcolor.split(",");
          red = Number(splitRGB[0]) + thisbutton.brightness;
          blue = Number(splitRGB[1]) + thisbutton.brightness;
          green = Number(splitRGB[2]) + thisbutton.brightness;
          hctx.fillStyle = "rgb(" + red + "," + blue + "," + green + ")";

          var w = thisbutton.width - hctx.lineWidth;
        var h = thisbutton.width/2 - hctx.lineWidth/2;
        var r = 0;//top of dark area dont have radius
        var x = thisbutton.x - thisbutton.width/2 + hctx.lineWidth/2;
        var y = thisbutton.y;
        hctx.beginPath();
        hctx.moveTo(x + r, y);
        hctx.arcTo(x + w, y, x + w, y + h, r);
          r = r2;//actual radius
        hctx.arcTo(x + w, y + h, x, y + h, r);
        hctx.arcTo(x, y + h, x, y, r);
          r = 0;//top of dark area dont have radius
        hctx.arcTo(x, y, x + w, y, r);
        hctx.closePath();
        hctx.fill();
        //end of drawing button rectangles
        if (
          player.tankTypeLevel != prevPlayerLvl &&
          howManyButtonSentToServer < buttonNumber &&
          buttonNumber < 8
        ) {
          //if player can upgrade but server havent send the information to draw tank on button, and client havent sent the request before
          var packet = JSON.stringify(["upgradePlease",
            "button" + buttonNumber.toString(),
            "tankButton"]);
          socket.send(packet)
          howManyButtonSentToClient = 0;
          howManyButtonSentToServer = buttonNumber;
          maxnumberofbuttons = buttonNumber;//this one doesnt change to 0 after receiving info
        } else if (
          player.bodyTypeLevel != prevPlayerLvlb &&
          howManyButtonSentToServerb < buttonNumber &&
          buttonNumber >= 8
        ) {
          //if player can upgrade but server havent send the information to draw tank on button, and client havent sent the request before
          var packet = JSON.stringify(["upgradePlease",
            "button" + buttonNumber.toString(),
            "tankButton"]);
          socket.send(packet)
          howManyButtonSentToClientb = 0;
          howManyButtonSentToServerb = buttonNumber;
          maxnumberofbuttonsb = buttonNumber;//this one doesnt change to 0 after receiving info
        } else if (
          (buttonNumber < 8 &&
            howManyButtonSentToClient >= buttonNumber) ||
          (buttonNumber >= 8 &&
            howManyButtonSentToClientb >= buttonNumber)
        ) {
          //draw players on button
          let thisbuttontank = buttonTank[buttonNumber];
          didAnyButtonDraw = "yes";
          let playerSize = thisbuttontank.width; //DONT CHANGE THIS
          let playerX = thisbutton.x;
          let playerY = thisbutton.y;
          hctx.save();
          hctx.translate(playerX, playerY);
          hctx.rotate(thisbutton.tankRotate * Math.PI / 180);
          var widthIncrease = thisbutton.width / thisbutton.defaultwidth;
          hctx.scale(0.8 * widthIncrease, 0.8 * widthIncrease); //change the size of tanks inside the button, 1 refers to the size of tank when spawning
          hctx.lineWidth = 5;

          //draw assets, e.g. rammer body base
          hctx.lineJoin = "round";
          if (thisbuttontank.assets) {
            for (assetID in thisbuttontank.assets){
              let asset = thisbuttontank.assets[assetID];
              if (asset.type == "under") {
                hctx.lineWidth = asset.outlineThickness;
                drawAsset(asset,playerSize,asset.color,asset.outline,hctx)
              }
            }
          }

          //draw barrel
          for (barrel in thisbuttontank.barrels){
            //note that you must use [barrel] instead of .barrel, if not there will be an error
            let thisBarrel = thisbuttontank.barrels[barrel];
            hctx.rotate((thisBarrel.additionalAngle * Math.PI) / 180); //rotate to barrel angle
            hctx.fillStyle = bodyColors.barrel.col;
            hctx.strokeStyle = bodyColors.barrel.outline;
            //bullt barrel
            if (thisBarrel.barrelType == "bullet") {
              hctx.fillRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -thisBarrel.barrelHeight,
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight
              );
              hctx.strokeRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -thisBarrel.barrelHeight,
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight
              );
            }
            //drone barrel
            else if (thisBarrel.barrelType == "drone") {
              hctx.beginPath();
              hctx.moveTo(-thisBarrel.barrelWidth / 2 + thisBarrel.x, 0);
              hctx.lineTo(
                -thisBarrel.barrelWidth + thisBarrel.x,
                -thisBarrel.barrelHeight
              );
              hctx.lineTo(
                thisBarrel.barrelWidth + thisBarrel.x * 2,
                -thisBarrel.barrelHeight
              );
              hctx.lineTo(
                thisBarrel.barrelWidth / 2 + thisBarrel.x * 2,
                0
              );
              hctx.fill();
              hctx.stroke();
            }
            //trap barrel
            else if (thisBarrel.barrelType == "trap") {
              hctx.fillRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2,
                thisBarrel.barrelWidth,
                (thisBarrel.barrelHeight / 3) * 2
              );
              hctx.strokeRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2,
                thisBarrel.barrelWidth,
                (thisBarrel.barrelHeight / 3) * 2
              );
              hctx.beginPath();
              hctx.moveTo(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2
              );
              hctx.lineTo(
                -thisBarrel.barrelWidth + thisBarrel.x,
                -thisBarrel.barrelHeight
              );
              hctx.lineTo(
                thisBarrel.barrelWidth + thisBarrel.x,
                -thisBarrel.barrelHeight
              );
              hctx.lineTo(
                thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2
              );
              hctx.fill();
              hctx.stroke();
            }
            //mine barrel
            else if (thisBarrel.barrelType == "mine") {
              hctx.fillRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -thisBarrel.barrelHeight,
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight
              );
              hctx.strokeRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -thisBarrel.barrelHeight,
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight
              );
              hctx.fillRect(
                (-thisBarrel.barrelWidth * 1.5) / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2,
                thisBarrel.barrelWidth * 1.5,
                (thisBarrel.barrelHeight / 3) * 2
              );
              hctx.strokeRect(
                (-thisBarrel.barrelWidth * 1.5) / 2 + thisBarrel.x,
                (-thisBarrel.barrelHeight / 3) * 2,
                thisBarrel.barrelWidth * 1.5,
                (thisBarrel.barrelHeight / 3) * 2
              );
            }
            else if (thisBarrel.barrelType == "minion") {
                  hctx.fillRect(
                    -thisBarrel.barrelWidth / 2 +
                      thisBarrel.x,
                    -thisBarrel.barrelHeight,
                    thisBarrel.barrelWidth,
                    thisBarrel.barrelHeight
                  );
                  hctx.strokeRect(
                    -thisBarrel.barrelWidth / 2 +
                      thisBarrel.x,
                    -thisBarrel.barrelHeight,
                    thisBarrel.barrelWidth,
                    thisBarrel.barrelHeight
                  );
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2 +
                      thisBarrel.x,
                    -thisBarrel.barrelHeight / 1.5,
                    thisBarrel.barrelWidth * 1.5,
                    thisBarrel.barrelHeight / 1.5
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2 +
                      thisBarrel.x,
                    -thisBarrel.barrelHeight / 1.5,
                    (thisBarrel.barrelWidth) * 1.5,
                    thisBarrel.barrelHeight / 1.5
                  );
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2 +
                      thisBarrel.x ,
                    -thisBarrel.barrelHeight,
                    (thisBarrel.barrelWidth) * 1.5,
                    thisBarrel.barrelHeight /5
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2 +
                      thisBarrel.x,
                    -thisBarrel.barrelHeight,
                    (thisBarrel.barrelWidth) * 1.5,
                    thisBarrel.barrelHeight /5
                  );
                }
            hctx.rotate((-thisBarrel.additionalAngle * Math.PI) / 180); //rotate back
          }
          hctx.lineJoin = "miter";

          //draw body
          if (
            (player.level >= 60 &&
              player.tankTypeLevel < 60 &&
              player.tankTypeLevel == 45 &&
              buttonNumber < 8) ||
            (player.bodyTypeLevel < 60 &&
              player.bodyTypeLevel == 45 &&
              buttonNumber >= 8) ||
            (player.tankTypeLevel < 70 &&
              player.tankTypeLevel == 60 &&
              buttonNumber < 8) ||
            (player.bodyTypeLevel < 70 &&
              player.bodyTypeLevel == 60 &&
              buttonNumber >= 8)
          ) {
            //if button is for tier 6 tanks
            hctx.fillStyle = "#934c93";
            hctx.strokeStyle = "#660066";
            hctx.beginPath();
            var baseSides = 6;
            hctx.moveTo(
              0 + playerSize * Math.cos(0),
              0 + playerSize * Math.sin(0)
            );
            for (var i = 1; i <= baseSides; i += 1) {
              hctx.lineTo(
                0 + playerSize * Math.cos((i * 2 * Math.PI) / baseSides),
                0 + playerSize * Math.sin((i * 2 * Math.PI) / baseSides)
              );
            }
            hctx.fill();
            hctx.stroke();
          } else {
            //normal tank
            //hctx.fillStyle = "#00B0E1";
            //hctx.strokeStyle = "#0092C3";
            hctx.fillStyle = playerBodyCol;
            hctx.strokeStyle = playerBodyOutline;
            hctx.beginPath();
            hctx.arc(0, 0, playerSize, 0, 2 * Math.PI);
            hctx.fill();
            hctx.stroke();
          }

          hctx.lineJoin = "round"; //make nice round corners
          for (barrel in thisbuttontank.bodybarrels){
            let thisBarrel = thisbuttontank.bodybarrels[barrel];
            hctx.rotate(thisBarrel.additionalAngle); //rotate to barrel angle
            hctx.fillStyle = bodyColors.barrel.col;
            hctx.strokeStyle = bodyColors.barrel.outline;
            if (thisBarrel.barrelType == "bullet") {
              hctx.fillRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ),
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
              );
              hctx.strokeRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                -(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ),
                thisBarrel.barrelWidth,
                thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
              );
            }
            //drone barrel
            else if (thisBarrel.barrelType == "drone") {
              if (Math.round(thisBarrel.barrelWidth) != Math.round(thisBarrel.barrelHeight)){
                drawDroneBarrel(hctx,thisBarrel.x,thisBarrel.barrelWidth,thisBarrel.barrelHeight,0,1)
              }
              else{
                drawDroneTurret(hctx,thisBarrel.x,thisBarrel.barrelWidth,0,1)
              }
            }
            //trap barrel
            else if (thisBarrel.barrelType == "trap") {
              hctx.fillRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ) /
                  3) *
                  2,
                thisBarrel.barrelWidth,
                ((thisBarrel.barrelHeight -
                  thisBarrel.barrelHeightChange) /
                  3) *
                  2
              );
              hctx.strokeRect(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ) /
                  3) *
                  2,
                thisBarrel.barrelWidth,
                ((thisBarrel.barrelHeight -
                  thisBarrel.barrelHeightChange) /
                  3) *
                  2
              );
              hctx.beginPath();
              hctx.moveTo(
                -thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ) /
                  3) *
                  2
              );
              hctx.lineTo(
                -thisBarrel.barrelWidth + thisBarrel.x,
                -(thisBarrel.barrelHeight - thisBarrel.barrelHeightChange)
              );
              hctx.lineTo(
                thisBarrel.barrelWidth + thisBarrel.x,
                -(thisBarrel.barrelHeight - thisBarrel.barrelHeightChange)
              );
              hctx.lineTo(
                thisBarrel.barrelWidth / 2 + thisBarrel.x,
                (-(
                  thisBarrel.barrelHeight - thisBarrel.barrelHeightChange
                ) /
                  3) *
                  2
              );
              hctx.fill();
              hctx.stroke();
            }
            hctx.rotate(-thisBarrel.additionalAngle); //rotate back
          }
          //draw turret base
          hctx.beginPath();
          hctx.arc(
            0,
            0,
            playerSize * thisbuttontank.turretBaseSize,
            0,
            2 * Math.PI
          );
          hctx.fill();
          hctx.stroke();
          hctx.lineJoin = "miter"; //change back

          if (thisbuttontank.assets) {
            for (assetID in thisbuttontank.assets){
              let asset = thisbuttontank.assets[assetID];
              if (asset.type == "above") {
                hctx.lineWidth = asset.outlineThickness;
                drawAsset(asset,playerSize,asset.color,asset.outline,hctx)
              }
            }
          }

          hctx.restore(); //restore coordinates to saved
        }
        //write names of tanks
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 8;
        var widthIncrease = thisbutton.width / thisbutton.defaultwidth;
        hctx.font = "700 " + 16 * widthIncrease + "px Roboto";
        hctx.textAlign = "center";
        var tankButtonName = "Error";
        //1 refers to first button of weapon upgrades, 8 refers to first button of body upgrades
        if (buttonNumber == 1 || buttonNumber == 8) {
          tankButtonName = one;
        } else if (buttonNumber == 2 || buttonNumber == 9) {
          tankButtonName = two;
        } else if (buttonNumber == 3 || buttonNumber == 10) {
          tankButtonName = three;
        } else if (buttonNumber == 4 || buttonNumber == 11) {
          tankButtonName = four;
        } else if (buttonNumber == 5 || buttonNumber == 12) {
          tankButtonName = five;
        } else if (buttonNumber == 6 || buttonNumber == 13) {
          tankButtonName = six;
        } else if (buttonNumber == 7 || buttonNumber == 14) {
          tankButtonName = seven;
        }
        tankButtonName = tankButtonName.charAt(0).toUpperCase() + tankButtonName.slice(1);//make first letter of tank name uppercase
          hctx.lineJoin = "miter";
          hctx.miterLimit = 2;
        hctx.strokeText(
          tankButtonName,
          thisbutton.x,
          thisbutton.y + thisbutton.width/2 - 10
        );
        hctx.fillText(
          tankButtonName,
          thisbutton.x,
          thisbutton.y + thisbutton.width/2 - 10
        );
        hctx.lineWidth = 6;
        }
      } //end of function

      //IF ADD A TANK OR CHANGE UPGRADES, REMEMBER TO UPDATE UPGRADE TREE BELOW THESE CODE
      //note: try not to use the seventh button
      
      function drawIgnoreButton(nextbuttonnumber,type){
        if (nextbuttonnumber == 7 || nextbuttonnumber == 6 || nextbuttonnumber == 5){
          nextbuttonnumber = 4;
        }
        else if (nextbuttonnumber == 2 || nextbuttonnumber == 3 || nextbuttonnumber == 4){
          nextbuttonnumber = 1;
        }
        else if (nextbuttonnumber == 8){
          nextbuttonnumber = 7;
        }
        else if (nextbuttonnumber == 9 || nextbuttonnumber == 10 || nextbuttonnumber == 11){
          nextbuttonnumber = 8;
        }
        else if (nextbuttonnumber == 13 || nextbuttonnumber == 12 || nextbuttonnumber == 14){
          nextbuttonnumber = 11;
        }
        else if (nextbuttonnumber == 15){
          nextbuttonnumber = 14;
        }
        let thisbutton = upgradeButtons[nextbuttonnumber];
        if (type == "weapon"){
          var ignorebutton = ignorebuttonw;
        }
        else{
          var ignorebutton = ignorebuttonb;
        }
        if (ignorebutton.hover == 'yes'){
          if (ignorebutton.brightness < 50) {
            ignorebutton.brightness += 10*deltaTime;
          } else {
            ignorebutton.brightness = 50;
          }
          if (
            ignorebutton.width < ignorebutton.animatedwidth
          ) {
            let amountAdd = ignorebutton.animatedwidth - ignorebutton.width;
            if (amountAdd >= 0.05){//if not too near to the end width
              amountAdd /= 3;//button enlarges faster before decreasing in speed
            }
            ignorebutton.width += amountAdd*deltaTime;
          } else {
            ignorebutton.width = ignorebutton.animatedwidth;
          }
        }
        else{
          if (ignorebutton.brightness > 0) {
            ignorebutton.brightness -= 10*deltaTime;
          } else {
            ignorebutton.brightness = 0;
          }
          if (
            ignorebutton.width > ignorebutton.defaultwidth
          ) {
            let amountAdd = ignorebutton.width - ignorebutton.defaultwidth;
            if (amountAdd >= 0.05){//if not too near to the end width
              amountAdd /= 3;//button enlarges faster before decreasing in speed
            }
            ignorebutton.width -= amountAdd*deltaTime;
          } else {
            ignorebutton.width = ignorebutton.defaultwidth;
          }
        }
        var w = ignorebutton.width;
        var h = ignorebutton.height * ignorebutton.width / ignorebutton.defaultwidth;
        var originalh = h;
        var r = 7;
          var r2 = r;//radius of bottom part of dark area
        var x = thisbutton.x - ignorebutton.width/2;
        var y = thisbutton.y - ignorebutton.width/2 - 55 - (ignorebutton.height - originalh)/2;
        ignorebutton.x = x;
        ignorebutton.y = y;
        hctx.lineWidth = 5;
        //change color based on brightness
          let color = "173,173,173"
          let splitRGB = color.split(",");
          let red = Number(splitRGB[0]) + ignorebutton.brightness;
          let blue = Number(splitRGB[1]) + ignorebutton.brightness;
          let green = Number(splitRGB[2]) + ignorebutton.brightness;
          hctx.fillStyle = "rgb(" + red + "," + blue + "," + green + ")";
        hctx.beginPath();
        hctx.moveTo(x + r, y);
        hctx.arcTo(x + w, y, x + w, y + h, r);
        hctx.arcTo(x + w, y + h, x, y + h, r);
        hctx.arcTo(x, y + h, x, y, r);
        hctx.arcTo(x, y, x + w, y, r);
        hctx.closePath();
        hctx.fill();
        hctx.stroke();
        //draw dark area
          color = "143,143,143";
          splitRGB = color.split(",");
          red = Number(splitRGB[0]) + ignorebutton.brightness;
          blue = Number(splitRGB[1]) + ignorebutton.brightness;
          green = Number(splitRGB[2]) + ignorebutton.brightness;
          hctx.fillStyle = "rgb(" + red + "," + blue + "," + green + ")";
        var w = ignorebutton.width - hctx.lineWidth;
        var h = h/2 - hctx.lineWidth/2;
        var r = 0;//top of dark area dont have radius
        var x = thisbutton.x - ignorebutton.width/2 + hctx.lineWidth/2;
        var y = thisbutton.y - ignorebutton.width/2 + originalh/2 - 55 - (ignorebutton.height - originalh)/2;
        hctx.beginPath();
        hctx.moveTo(x + r, y);
        hctx.arcTo(x + w, y, x + w, y + h, r);
          r = r2;//actual radius
        hctx.arcTo(x + w, y + h, x, y + h, r);
        hctx.arcTo(x, y + h, x, y, r);
          r = 0;//top of dark area dont have radius
        hctx.arcTo(x, y, x + w, y, r);
        hctx.closePath();
        hctx.fill();
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 6;
        var widthIncrease = ignorebutton.width / ignorebutton.defaultwidth;
        hctx.font = "900 " + 19 * widthIncrease + "px Roboto";
        hctx.miterLimit = 2;
        hctx.textAlign = "center";
        hctx.strokeText(
          "IGNORE",
          thisbutton.x,
          y + 19 * widthIncrease/2 - 3
        );
        hctx.fillText(
          "IGNORE",
          thisbutton.x,
          y + 19 * widthIncrease/2 - 3
        );
      }
      
      //scale button
      hctx.save();
      hctx.translate(0, hcanvas.height);//bottom left of screen
      hctx.scale(1,resizeDiffY/resizeDiffX);
      hctx.translate(-0, -hcanvas.height);//translate back after scaling

      //Weapon upgrades

      //lvl 1 upgrade
      if (player.level >= 0 && player.tankTypeLevel < 0) {
        //if player can upgrade but havent
        //draw 3 buttons
        for (let i = 1; i < 4; i++) {
          buttondraw(
            i,
            "basic",
            "trapper",
            "guard",
            "empty",
            "empty",
            "empty",
            "empty"
          );
        }
      }

      //lvl 5 upgrade
      else if (player.level >= 5 && player.tankTypeLevel < 5) {
        if (player.tankType == "basic") {
          for (let i = 1; i < 5; i++) {
            buttondraw(
              i,
              "twin",
              "sniper",
              "cannon",
              "flank",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "trapper") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "delta",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "guard") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "commander",
              "overseer",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      }
      
      //lvl 15 upgrade
      else if (player.level >= 15 && player.tankTypeLevel < 15) {
        if (player.tankType == "twin") {
          for (let i = 1; i < 5; i++) {
            buttondraw(
              i,
              "gunner",
              "quad",
              "split",
              "stream",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "sniper") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "targeter",
              "marksman",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "cannon") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "single",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "flank") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "tri-angle",
              "quad",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "delta") {
          for (let i = 1; i < 5; i++) {
            buttondraw(
              i,
              "gamma",
              "blockade",
              "warden",
              "minelayer",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "commander") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "director",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "overseer") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "protector",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      }

      //lvl 30 upgrade
      else if (player.level >= 30 && player.tankTypeLevel < 30) {
        if (player.tankType == "gunner") {
          for (let i = 1; i < 4; i++) {
            buttondraw(
              i,
              "blaster",
              "rimfire",
              "minesweeper",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "single") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "destroyer",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "targeter") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "streamliner",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "quad") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "octo",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "tri-angle") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "booster",
              "fighter",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "marksman") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "duel",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "split") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "tower",
              "rimfire",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "director") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "manager",
              "spawner",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "blockade") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "barricade",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "warden") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "defender",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "gamma") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "beta",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "minelayer") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "engineer",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "stream") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "jet",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "protector") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "king",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      }

      //lvl 45 upgrade
      else if (player.level >= 45 && player.tankTypeLevel < 45) {
        //IF CHANGE THIS LEVEL, change the level in the code for choosing color of tank in button
        if (player.tankType == "octo") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "cyclone",
              "hex",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "blaster") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "minigun",
              "knockback",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "minesweeper") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "battler",
              "pinnace",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "spawner") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "factory",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "king") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "master",
              "tyrant",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "fighter") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "wave",
              "amalgam",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "streamliner") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "conquerer",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "destroyer") {
          for (let i = 1; i < 4; i++) {
            buttondraw(
              i,
              "hex",
              "harbinger",
              "hybrid",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "booster") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "guardian",
              "comet",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "duel") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "hunter",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "tower") {
          for (let i = 1; i < 3; i++) {
            buttondraw(
              i,
              "stronghold",
              "centrefire",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "manager") {
          for (let i = 1; i < 4; i++) {
            buttondraw(
              i,
              "hybrid",
              "executive",
              "CEO",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "defender") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "sharpnel",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "engineer") {
          for (let i = 1; i < 4; i++) {
            buttondraw(
              i,
              "machine",
              "manufacturer",
              "detonator",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "jet") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "flamethrower",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "rimfire") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "centrefire",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "beta") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "alpha",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "defender") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "sharpnel",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "barricade") {
          for (let i = 1; i < 2; i++) {
            buttondraw(
              i,
              "riot",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.tankType == "engineer") {
          for (let i = 1; i < 4; i++) {
            buttondraw(
              i,
              "machine",
              "manufacturer",
              "detonator",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      }

      //lvl 60 upgrade
      else if (gamelocation == "sanctuary" && ((player.level >= 60 && player.tankTypeLevel < 60)||(player.level >= 70 && player.tankTypeLevel < 70))) {
        //if in sanctuary, then upgrade button appear
        if (player.level >= 60 && player.tankTypeLevel < 60) {
          //if player can upgrade but havent
          if (player.tankType == "eternal") {
            for (let i = 1; i < 6; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "hailstorm",
                "bunker",
                "chaos",
                "bombshell",
                "warrior",
                "empty",
                "empty"
              );
            }
          }
        }
        //lvl 70 upgrade
        else if (player.level >= 70 && player.tankTypeLevel < 70) {
          //if player can upgrade but havent
          if (player.tankType == "hailstorm") {
            for (let i = 1; i < 3; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "thunderstorm",
                "cosmetic",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.tankType == "bunker") {
            for (let i = 1; i < 4; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "vault",
                "asteroid",
                "dynamite",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.tankType == "chaos") {
            for (let i = 1; i < 3; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "mayhem",
                "industry",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.tankType == "warrior") {
            for (let i = 1; i < 2; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "veteran",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.tankType == "bombshell") {
            for (let i = 1; i < 2; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "demolisher",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          }
        }
      }

      //if no button is drawn and editor ui is active
      else {
        for (let i = 1; i < 8; i++) {
          upgradeButtons[i].x = upgradeButtons[i].startx; //reset position of all upgrade buttons for the next animation
        }
        didAnyButtonDraw = "no";
      }
      if(openedUI != "yes") {

        let textToWrite = "";
        if (player.tankTypeLevel < 5) {
          textToWrite = "Next upgrade at lvl 5";
        } else if (player.tankTypeLevel < 15) {
          textToWrite = "Next upgrade at lvl 15";
        } else if (player.tankTypeLevel < 30) {
          textToWrite = "Next upgrade at lvl 30";
        } else if (player.tankTypeLevel < 45) {
          textToWrite = "Next upgrade at lvl 45";
        } else if (player.tankTypeLevel < 60) {
          textToWrite = "Upgrade to an eternal at lvl 60";
        } else if (player.tankTypeLevel < 70) {
          textToWrite = "Next upgrade at lvl 70";
        } else {
          textToWrite = "No more upgrades";
        }
        
          hctx.fillStyle = "black";
          hctx.font = "700 20px Roboto";
          hctx.textAlign = "center";
          hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
          //draw rect
          var textWidth = hctx.measureText(textToWrite).width; //get width of text
          var xpadding = 25;
          var ypadding = 7;
          var w = textWidth + xpadding * 2;
          var h = 20 + ypadding * 2;
          var r = h / 2; //radius is one third of height
          var x = hcanvas.width - w - 30 - 180 - (skillpointspos/1.95);
          var y = hcanvas.height - h - 10;
          hctx.save();
        hctx.translate(x+w/2, y+h/2);
        x = -w/2;
        y = -h/2;
          hctxroundRectangleFill(x,y,r,w,h);
          //write words
          hctx.fillStyle = "white";
          hctx.fillText(textToWrite, 0, 7.5);
          hctx.lineJoin = "miter"; //change it back
        hctx.restore();
      }
      
      if (ignorebuttonw.ignore == "no"){//if not ignore
        drawIgnoreButton(maxnumberofbuttons + 1,"weapon")
      }
      else{
        let maxplayertanklvl = -1;
        if (player.level >= 70){
          maxplayertanklvl = 70;
        }
        else if (player.level >= 60){
          maxplayertanklvl = 60;
        }
        else if (player.level >= 45){
          maxplayertanklvl = 45;
        }
        else if (player.level >= 30){
          maxplayertanklvl = 30;
        }
        else if (player.level >= 15){
          maxplayertanklvl = 15;
        }
        else if (player.level >= 5){
          maxplayertanklvl = 5;
        }
        else if (player.level >= 0){
          maxplayertanklvl = 0;
        }
        if (maxplayertanklvl > levelwhenignorew){//can upgrade to something that previously couldnt
          ignorebuttonw.ignore = "no";
        }
      }
      if (ignorebuttonb.ignore == "no"){//if not ignore
        drawIgnoreButton(maxnumberofbuttonsb + 1,"body")
      }
      else{
        let maxplayertanklvl = -1;
        if (player.level >= 70){
          maxplayertanklvl = 70;
        }
        else if (player.level >= 60){
          maxplayertanklvl = 60;
        }
        else if (player.level >= 45){
          maxplayertanklvl = 45;
        }
        else if (player.level >= 30){
          maxplayertanklvl = 30;
        }
        else if (player.level >= 15){
          maxplayertanklvl = 15;
        }
        else if (player.level >= 5){
          maxplayertanklvl = 5;
        }
        else if (player.level >= 0){
          maxplayertanklvl = 0;
        }
        if (maxplayertanklvl > levelwhenignoreb){//can upgrade to something that previously couldnt
          ignorebuttonb.ignore = "no";
        }
      }

      //body upgrades
      //note: try not to use the last button
      if (player.level >= 0 && player.bodyTypeLevel < 0) {
        //if player can upgrade but havent
        for (let i = 8; i < 11; i++) {
          buttondraw(
            i,
            "raider",
            "wall",
            "sentry",
            "empty",
            "empty",
            "empty",
            "empty"
          );
        }
      } else if (player.level >= 5 && player.bodyTypeLevel < 5) {
        if (player.bodyType == "wall") {
          for (let i = 8; i < 11; i++) {
            buttondraw(
              i,
              "castle",
              "smasher",
              "propeller",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "raider") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "forge",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "sentry") {
          for (let i = 8; i < 10; i++) {
            buttondraw(
              i,
              "mono",
              "hangar",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      } else if (player.level >= 15 && player.bodyTypeLevel < 15) {
        if (player.bodyType == "smasher") {
          for (let i = 8; i < 10; i++) {
            buttondraw(
              i,
              "spike",
              "armory",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "forge") {
          for (let i = 8; i < 11; i++) {
            buttondraw(
              i,
              "foundry",
              "mender",
              "hail",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "castle") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "fortress",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "mono") {
          for (let i = 8; i < 11; i++) {
            buttondraw(
              i,
              "armory",
              "bastion",
              "turret",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "hangar") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "warship",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "propeller") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "thruster",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      } else if (player.level >= 30 && player.bodyTypeLevel < 30) {
        if (player.bodyType == "spike") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "thorn",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "armory") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "brigade",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "foundry") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "flame",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "mender") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "remedy",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "hail") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "blizzard",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "fortress") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "palace",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "bastion") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "artillery",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "turret") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "triplet",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "warship") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "battleship",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "thruster") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "launcher",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      } else if (player.level >= 45 && player.bodyTypeLevel < 45) {
        if (player.bodyType == "thorn") {
          for (let i = 8; i < 10; i++) {
            buttondraw(
              i,
              "saw",
              "battalion",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "brigade") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "battalion",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "flame") {
          for (let i = 8; i < 10; i++) {
            buttondraw(
              i,
              "inferno",
              "juggernaut",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "remedy") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "fabricator",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "blizzard") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "snowstorm",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "palace") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "ziggurat",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "artillery") {
          for (let i = 8; i < 10; i++) {
            buttondraw(
              i,
              "battalion",
              "bombard",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "triplet") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "quadruplet",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "battleship") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "mothership",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        } else if (player.bodyType == "launcher") {
          for (let i = 8; i < 9; i++) {
            buttondraw(
              i,
              "rocketer",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty",
              "empty"
            );
          }
        }
      } else if (gamelocation == "sanctuary" && ((player.level >= 60 && player.bodyTypeLevel < 60)||(player.level >= 70 && player.bodyTypeLevel < 70))) {
        if (player.level >= 60 && player.bodyTypeLevel < 60) {
          //if player can upgrade but havent
          if (player.bodyType == "primordial") {
            for (let i = 8; i < 14; i++) {
              //if add a tank here, remeber to add the tank name to the code above the code for drawing player body
              buttondraw(
                i,
                "oven",
                "pounder",
                "lightning",
                "meteor",
                "chainsaw",
                "satellite",
                "empty"
              );
            }
          }
        } else if (player.level >= 70 && player.bodyTypeLevel < 70) {
          if (player.bodyType == "oven") {
            for (let i = 8; i < 10; i++) {
              buttondraw(
                i,
                "heliosphere",
                "corvus",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.bodyType == "lightning") {
            for (let i = 8; i < 9; i++) {
              buttondraw(
                i,
                "firebolt",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.bodyType == "pounder") {
            for (let i = 8; i < 9; i++) {
              buttondraw(
                i,
                "chasm",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.bodyType == "chainsaw") {
            for (let i = 8; i < 9; i++) {
              buttondraw(
                i,
                "blade",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.bodyType == "meteor") {
            for (let i = 8; i < 9; i++) {
              buttondraw(
                i,
                "nebula",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          } else if (player.bodyType == "satellite") {
            for (let i = 8; i < 9; i++) {
              buttondraw(
                i,
                "triton",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty",
                "empty"
              );
            }
          }
        }
      }
      else{
        for (let i = 8; i < 15; i++) {
          upgradeButtons[i].x = upgradeButtons[i].startx; //reset position of all upgrade buttons for the next animation
        }
      }

      //write tank information when hover over button
      if (showstats == 'yes'){
      for (let i = 1; i < 15; i++) {
        let thisbutton = upgradeButtons[i];
        if (
          thisbutton.hover == "yes" &&
          ((i < 8 && howManyButtonSentToClient >= i) ||
            (i >= 8 && howManyButtonSentToClientb >= i)) &&
          didAnyButtonDraw == "yes"
        ) {
          //if mouse hover over button and there is player information and the button is already drawn, write tank information
          //draw rectangle
          hctx.fillStyle = "rgba(0,0,0,0.5)";
          let opacity = thisbutton.brightness/50;
          if (opacity<0.3){
            opacity = 0.3;
          }
          hctx.globalAlpha = opacity; //change transparency to same transparency as button
          var w = thisbutton.defaultwidth * 1.5;
          var h = thisbutton.defaultwidth * 3.0;
          var r = 20; //radius is one third of height
          var x = thisbutton.x - thisbutton.defaultwidth*0.75;
          var y = thisbutton.y - thisbutton.defaultwidth*3.7;
          if ((x + w) > hcanvas.width){//outside the screen bruh (right)
            x = thisbutton.x - thisbutton.defaultwidth*1;
          }
          else if ((x - w/2) < 0){//outside the screen bruh (left)
            x = thisbutton.x - thisbutton.defaultwidth*0.5;//note that x is the left side of the rectangle popup
          }
          let thisbuttontank = buttonTank[i];
          if (!thisbuttontank.maxhealth) {
            //if this is a weapon upgrade with no body properties
            h -= 150;
            y += 150;
          }
          if (
            !Object.keys(thisbuttontank.bodybarrels).length &&
            !Object.keys(thisbuttontank.barrels).length
          ) {
            //if no bullet properties
            h -= 150;
            y += 150;
          }
          hctxroundRectangleFill(x,y,r,w,h);
          //write information
          hctx.strokeStyle = "black";
          hctx.lineWidth = 3;
          hctx.font = "700 17px Roboto";
          hctx.textAlign = "center";
          //y-axis value of different properties
          var yproperty1 = 40;
          var yproperty2 = 65;
          var yproperty3 = 90;
          var yproperty4 = 115;
          var yproperty5 = 140;
          var yproperty6 = 165;
          var yproperty7 = 190;
          var yproperty8 = 215;
          var yproperty9 = 240;
          var yproperty10 = 265;
          var yproperty11 = 290;
          //var yproperty12 = 190;
          //now check which properties have, then move the properties so there wont be empty spaces
          if (
            !Object.keys(thisbuttontank.bodybarrels).length &&
            !Object.keys(thisbuttontank.barrels).length
          ) {
            yproperty1 += 150;
            yproperty2 += 150;
            yproperty3 += 150;
            yproperty4 += 150;
            yproperty5 += 150;
          } else if (!thisbuttontank.fovMultiplier) {
            yproperty1 += 25;
            yproperty2 += 25;
            yproperty3 += 25;
            yproperty4 += 25;
            yproperty5 += 25;
            yproperty6 += 25;
            yproperty7 += 25;
            yproperty8 += 25;
            yproperty9 += 25;
            yproperty10 += 25;
            yproperty11 += 25;
          }
          if (!thisbuttontank.maxhealth) {
            yproperty6 += 15;
            yproperty7 += 15;
            yproperty8 += 15;
            yproperty9 += 15;
            yproperty10 += 15;
            yproperty11 += 15;
          }

          //health value
          if (i >= 8) {
            //body upgrades
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Health: " + thisbuttontank.maxhealth,
              x + w/2,
              thisbutton.y + yproperty1 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Health: " + thisbuttontank.maxhealth,
              x + w/2,
              thisbutton.y + yproperty1 - thisbutton.defaultwidth*3.7
            );
            //health regen speed value
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Heal speed: " + thisbuttontank.healthRegenSpeed,
              x + w/2,
             thisbutton.y + yproperty2 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Heal speed: " + thisbuttontank.healthRegenSpeed,
              x + w/2,
              thisbutton.y + yproperty2 - thisbutton.defaultwidth*3.7
            );
            //health regen time value
            hctx.fillStyle = "salmon";
            hctx.strokeText(
              "Heal delay: " + thisbuttontank.healthRegenTime,
              x + w/2,
              thisbutton.y + yproperty3 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Heal delay: " + thisbuttontank.healthRegenTime,
              x + w/2,
              thisbutton.y + yproperty3 - thisbutton.defaultwidth*3.7
            );
            //damage value
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Body damage: " + thisbuttontank.damage,
              x + w/2,
              thisbutton.y + yproperty4 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Body damage: " + thisbuttontank.damage,
              x + w/2,
              thisbutton.y + yproperty4 - thisbutton.defaultwidth*3.7
            );
            //speed value
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Speed: " + thisbuttontank.speed,
              x + w/2,
              thisbutton.y + yproperty5 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Speed: " + thisbuttontank.speed,
              x + w/2,
              thisbutton.y + yproperty5 - thisbutton.defaultwidth*3.7
            );
          }
          if (
            i < 8 ||
            Object.keys(thisbuttontank.bodybarrels).length
          ) {
            //if weapon upgrade or a body upgrade with barrels
            var range = "";
            var lowest = "what";
            var highest = "what";
            function findRangeValue(propertyName) {
              //each individual barrel have different stats for certain stats, so we need to find the range
              range = "";
              lowest = "what";
              highest = "what";
              if (
                Object.keys(
                  thisbuttontank.barrels
                ).length
              ) {
                //if have barrels
                Object.keys(
                  thisbuttontank.barrels
                ).forEach((barrel) => {
                  let prop = thisbuttontank.barrels[barrel][propertyName];
                  if (lowest == "what") {
                    //if this is the first barrel
                    lowest = prop;
                  } else if (
                    prop > lowest
                  ) {
                    if (highest == "what") {
                      highest = prop;
                    } else if (
                      prop > highest
                    ) {
                      highest = prop;
                    }
                  } else if (
                    prop < lowest
                  ) {
                    highest = lowest;
                    lowest = prop;
                  }
                });
              } else if (
                Object.keys(
                  thisbuttontank.bodybarrels
                ).length
              ) {
                //if have body barrels
                Object.keys(
                  thisbuttontank.bodybarrels
                ).forEach((barrel) => {
                  let prop = thisbuttontank.bodybarrels[barrel][propertyName];
                  if (lowest == "what") {
                    //if this is the first barrel
                    lowest = prop
                  } else if (
                    prop > lowest
                  ) {
                    if (highest == "what") {
                      highest = prop
                    } else if (
                      prop > highest
                    ) {
                      highest = prop
                    }
                  } else if (
                    prop < lowest
                  ) {
                    highest = lowest;
                    lowest = prop;
                  }
                });
              }
              if (lowest == "what") {
                //no barrels
                range = "-";
              } else if (highest == "what") {
                //1 barrel or all barrels have same value
                range = lowest;
              } else {
                //if there is a range
                range = lowest + " - " + highest;
              }
            }
            //reload recover value
            findRangeValue("reloadRecover");
            hctx.fillStyle = "salmon";
            hctx.strokeText(
              "Reload delay: " + range,
              x + w/2,
              thisbutton.y + yproperty6 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Reload delay: " + range,
              x + w/2,
              thisbutton.y + yproperty6 - thisbutton.defaultwidth*3.7
            );
            //bullet damage value
            findRangeValue("bulletDamage");
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Bullet damage: " + range,
              x + w/2,
              thisbutton.y + yproperty7 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Bullet damage: " + range,
              x + w/2,
              thisbutton.y + yproperty7 - thisbutton.defaultwidth*3.7
            );
            //bullet health value
            findRangeValue("bulletHealth");
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Bullet health: " + range,
              x + w/2,
              thisbutton.y + yproperty8 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Bullet health: " + range,
              x + w/2,
              thisbutton.y + yproperty8 - thisbutton.defaultwidth*3.7
            );
            //bullet timer value
            findRangeValue("bulletTimer");
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Bullet lifespan: " + range,
              x + w/2,
              thisbutton.y + yproperty9 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Bullet lifespan: " + range,
              x + w/2,
              thisbutton.y + yproperty9 - thisbutton.defaultwidth*3.7
            );
            //bullet speed value
            findRangeValue("bulletSpeed");
            hctx.fillStyle = "lightgreen";
            hctx.strokeText(
              "Bullet speed: " + range,
              x + w/2,
              thisbutton.y + yproperty10 - thisbutton.defaultwidth*3.7
            );
            hctx.fillText(
              "Bullet speed: " + range,
              x + w/2,
              thisbutton.y + yproperty10 - thisbutton.defaultwidth*3.7
            );
            if (thisbuttontank.fovMultiplier) {
              //body upgrade may have barrels but no fov property
              //fov value
              hctx.fillStyle = "lightgreen";
              hctx.strokeText(
                "FoV: " + thisbuttontank.fovMultiplier,
                x + w/2,
                thisbutton.y + yproperty11 - thisbutton.defaultwidth*3.7
              );
              hctx.fillText(
                "FoV: " + thisbuttontank.fovMultiplier,
                x + w/2,
                thisbutton.y + yproperty11 - thisbutton.defaultwidth*3.7
              );
            }
          }
          hctx.globalAlpha = 1.0; //reset transparency
        }
      }
      }
      
      hctx.restore();//restore from scaling for different screen sizes
      hctx.textAlign = "center";

      //UPGRADE TREE
      function drawUpgradetreeBox(
        name,
        Xadditional,
        Yadditional,
        fontsize,
        width,
        boxcolor,
        boxdarkcolor,
        which
      ) {
        bodysize = width / 5; //size of tank in upgrade tree
        let scale = resizeDiffY/resizeDiffX;//make upgrade tree not squashed
        let greyedOut = "no";
        if (which == "body" && !bodyCanUpgradeTo.includes(name)){//cannot upgrade to this tank
          boxcolor = "#999999";//greyed out
          boxdarkcolor = "#7b7b7b";
          greyedOut = "yes";
        }
        else if (which == "weapon" && !weaponCanUpgradeTo.includes(name)){
          boxcolor = "#999999";//greyed out
          boxdarkcolor = "#7b7b7b";
          greyedOut = "yes";
        }
        hctx.font = "700 " + fontsize + "px Roboto";
        hctx.fillStyle = boxcolor;
        hctx.strokeStyle = "black";
        hctx.lineWidth = bodysize/5;
        if (which == "weapon") {
          var pos = upgradetreepos;
        } else if (which == "body") {
          var pos = bupgradetreepos;
        }
        var w = width;
        var h = width;
        var r = 5; //radius is one third of height
        var x = hcanvas.width / 2 - (width / 2 + Xadditional);
        var y = pos + Yadditional;
        h *= scale;
        hctx.beginPath();
        hctx.moveTo(x + r, y);
        hctx.arcTo(x + w, y, x + w, y + h, r);
        hctx.arcTo(x + w, y + h, x, y + h, r);
        hctx.arcTo(x, y + h, x, y, r);
        hctx.arcTo(x, y, x + w, y, r);
        hctx.closePath();
        hctx.fill();
        hctx.stroke();
        //draw darker area
        var w2 = w - hctx.lineWidth;
        var h2 = h/2 - hctx.lineWidth/2;
        var x2 = x + hctx.lineWidth/2;
        var y2 = y + h2;
        //h *= scale;
        hctx.fillStyle = boxdarkcolor;
        hctx.beginPath();
        hctx.moveTo(x2 + r, y2);
        hctx.arcTo(x2 + w2, y2, x2 + w2, y2 + h2, r);
        hctx.arcTo(x2 + w2, y2 + h2, x2, y2 + h2, r);
        hctx.arcTo(x2, y2 + h2, x2, y2, r);
        hctx.arcTo(x2, y2, x2 + w2, y2, r);
        hctx.closePath();
        hctx.fill();
        //now draw hard-coded tank on upgrade tree
        hctx.save();
        hctx.translate(
          hcanvas.width / 2 - Xadditional,
          pos + Yadditional + h / 2
        );
          hctx.scale(1,scale)
        if (which == "body") {
          hctx.lineWidth = bodysize/5;
          if (bodyupgrades[name].hasOwnProperty("assets")) {
            hctx.lineJoin = "round";
            //draw under assets
            Object.keys(bodyupgrades[name].assets).forEach((assetID) => {
              var asset = bodyupgrades[name].assets[assetID];
              if (asset.type == "under") {
                hctx.rotate(-bodyangle);
                let assetcolor = asset.color;
                let assetoutline = asset.outline;
                if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
                  assetcolor = playerBodyCol;
                  if (bodyupgrades[name].eternal){
                    assetcolor = "#934c93";
                  }
                  if (greyedOut == "yes"){
                    assetcolor = "#c0c0c0";
                  }
                }
                if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
                  assetoutline = playerBodyOutline;
                  if (bodyupgrades[name].eternal){
                    assetoutline = "#660066";
                  }
                  if (greyedOut == "yes"){
                    assetoutline = "#a2a2a2";
                  }
                }
                drawAsset(asset,bodysize,assetcolor,assetoutline,hctx)
                hctx.rotate(bodyangle);
              }
            });
            hctx.lineJoin = "miter";
          }
          //FOR BODY UPGRADES BODY
          if (!bodyupgrades[name].eternal){
            //hctx.fillStyle = "#00B0E1";
            //hctx.strokeStyle = "#0092C3";
            hctx.fillStyle = playerBodyCol;
            hctx.strokeStyle = playerBodyOutline;
            if (greyedOut == "yes"){
              hctx.fillStyle = "#c0c0c0";
              hctx.strokeStyle = "#a2a2a2";
            }
            hctx.beginPath();
            hctx.arc(0, 0, bodysize, 0, 2 * Math.PI);
            hctx.fill();
            hctx.stroke();
          }
          else{
            //if a tier 6 tank
            hctx.fillStyle = "#934c93";
            hctx.strokeStyle = "#660066";
            if (greyedOut == "yes"){
              hctx.fillStyle = "#c0c0c0";
              hctx.strokeStyle = "#a2a2a2";
            }
            hctx.rotate(-bodyangle);
            hctx.beginPath();
            var baseSides = 6;
            hctx.moveTo(bodysize * Math.cos(0), bodysize * Math.sin(0));
            for (var i = 1; i <= baseSides; i += 1) {
              hctx.lineTo(bodysize * Math.cos((i * 2 * Math.PI) / baseSides), bodysize * Math.sin((i * 2 * Math.PI) / baseSides));
            }
            hctx.fill();
            hctx.stroke();
            hctx.rotate(bodyangle);
          }
          if (bodyupgrades[name].hasOwnProperty("bodybarrels")) {
            //draw barrels
            hctx.lineJoin = "round";
            Object.keys(bodyupgrades[name].bodybarrels).forEach(
              (barrel) => {
                let thisBarrel = bodyupgrades[name].bodybarrels[barrel];
                hctx.rotate(thisBarrel.additionalAngle - bodyangle);
                hctx.fillStyle = bodyColors.barrel.col;
                hctx.strokeStyle = bodyColors.barrel.outline;
                if (thisBarrel.barrelType == "bullet") {
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                }
                //drone barrel
                else if (thisBarrel.barrelType == "drone") {
                  if (Math.round(thisBarrel.barrelWidth) != Math.round(thisBarrel.barrelHeight)){
                    drawDroneBarrel(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,thisBarrel.barrelHeight * bodysize,0,1)
                  }
                  else{
                    drawDroneTurret(hctx,thisBarrel.x * bodysize,thisBarrel.barrelWidth * bodysize,0,1)
                  }
                }
                //trap barrel
                else if (thisBarrel.barrelType == "trap") {
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.beginPath();
                  hctx.moveTo(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.lineTo(
                    -thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    (thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.fill();
                  hctx.stroke();
                }
                hctx.rotate(-thisBarrel.additionalAngle + bodyangle); //rotate back
              }
            );
            //draw turret base
            hctx.beginPath();
            hctx.arc(
              0,
              0,
              bodysize * bodyupgrades[name].turretBaseSize,
              0,
              2 * Math.PI
            );
            hctx.fill();
            hctx.stroke();
            hctx.lineJoin = "miter"; //change back
          }
          if (bodyupgrades[name].hasOwnProperty("assets")) {
            hctx.lineJoin = "round";
            //draw above assets
            Object.keys(bodyupgrades[name].assets).forEach((assetID) => {
              var asset = bodyupgrades[name].assets[assetID];
              if (asset.type == "above") {
                hctx.rotate(-bodyangle);
                let assetcolor = asset.color;
                let assetoutline = asset.outline;
                if (assetcolor == "default"){//asset same color as body, e.g. ziggurat
                  assetcolor = playerBodyCol;
                  if (bodyupgrades[name].eternal){
                    assetcolor = "#934c93";
                  }
                  if (greyedOut == "yes"){
                    assetcolor = "#c0c0c0";
                  }
                }
                if (assetoutline == "default"){//asset same color as body, e.g. ziggurat
                  assetoutline = playerBodyOutline;
                  if (bodyupgrades[name].eternal){
                    assetoutline = "#660066";
                  }
                  if (greyedOut == "yes"){
                    assetoutline = "#a2a2a2";
                  }
                }
                drawAsset(asset,bodysize,assetcolor,assetoutline,hctx)
                hctx.rotate(bodyangle);
              }
            });
            hctx.lineJoin = "miter";
          }
        } else if (which == "weapon") {
          hctx.lineWidth = bodysize/5;
          if (weaponupgrades[name].hasOwnProperty("barrels")) {
            hctx.lineJoin = "round";
            Object.keys(weaponupgrades[name].barrels).forEach(
              (assetID) => {
                var thisBarrel = weaponupgrades[name].barrels[assetID];
                hctx.rotate(
                  (thisBarrel.additionalAngle * Math.PI) / 180 - bodyangle
                ); //rotate to barrel angle
                hctx.fillStyle = bodyColors.barrel.col;
                hctx.strokeStyle = bodyColors.barrel.outline;
                if (thisBarrel.barrelType == "bullet") {
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                } else if (thisBarrel.barrelType == "drone") {
                  hctx.beginPath();
                  hctx.moveTo(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    0
                  );
                  hctx.lineTo(
                    -thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * 2 * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    (thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * 2 * bodysize,
                    0
                  );
                  hctx.fill();
                  hctx.stroke();
                } else if (thisBarrel.barrelType == "trap") {
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.beginPath();
                  hctx.moveTo(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.lineTo(
                    -thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    thisBarrel.barrelWidth * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize
                  );
                  hctx.lineTo(
                    (thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.fill();
                  hctx.stroke();
                } else if (thisBarrel.barrelType == "mine") {
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.fillRect(
                    ((-thisBarrel.barrelWidth * 1.5) / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize * 1.5,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                  hctx.strokeRect(
                    ((-thisBarrel.barrelWidth * 1.5) / 2) * bodysize +
                      thisBarrel.x * bodysize,
                    (-thisBarrel.barrelHeight / 3) * 2 * bodysize,
                    thisBarrel.barrelWidth * bodysize * 1.5,
                    (thisBarrel.barrelHeight / 3) * 2 * bodysize
                  );
                } else if (thisBarrel.barrelType == "minion") {
                  hctx.fillRect(
                    -thisBarrel.barrelWidth / 2  * bodysize +
                      thisBarrel.x  * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth  * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.strokeRect(
                    -thisBarrel.barrelWidth / 2 * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    thisBarrel.barrelWidth * bodysize,
                    thisBarrel.barrelHeight * bodysize
                  );
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2  * bodysize +
                      thisBarrel.x  * bodysize,
                    -thisBarrel.barrelHeight / 1.5  * bodysize,
                    thisBarrel.barrelWidth  * bodysize * 1.5,
                    thisBarrel.barrelHeight / 1.5  * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2  * bodysize +
                      thisBarrel.x  * bodysize,
                    -thisBarrel.barrelHeight / 1.5  * bodysize,
                    (thisBarrel.barrelWidth * bodysize) * 1.5,
                    thisBarrel.barrelHeight / 1.5  * bodysize
                  );
                  hctx.fillRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2  * bodysize +
                      thisBarrel.x  * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    (thisBarrel.barrelWidth  * bodysize) * 1.5,
                    thisBarrel.barrelHeight /5 * bodysize
                  );
                  hctx.strokeRect(
                    (-thisBarrel.barrelWidth * 1.5) / 2 * bodysize +
                      thisBarrel.x * bodysize,
                    -thisBarrel.barrelHeight * bodysize,
                    (thisBarrel.barrelWidth * bodysize) * 1.5,
                    thisBarrel.barrelHeight /5  * bodysize
                  );
                }
                hctx.rotate(
                  (-thisBarrel.additionalAngle * Math.PI) / 180 +
                    bodyangle
                ); //rotate back
              }
            );
            hctx.lineJoin = "miter"; //change back
          }
          //FOR WEAPON BODY
          if (!weaponupgrades[name].eternal){
            //hctx.fillStyle = "#00B0E1";
            //hctx.strokeStyle = "#0092C3";
            hctx.fillStyle = playerBodyCol;
            hctx.strokeStyle = playerBodyOutline;
            if (greyedOut == "yes"){
              hctx.fillStyle = "#c0c0c0";
              hctx.strokeStyle = "#a2a2a2";
            }
            hctx.beginPath();
            hctx.arc(0, 0, bodysize, 0, 2 * Math.PI);
            hctx.fill();
            hctx.stroke();
          }
          else{
            //if a tier 6 tank
            hctx.fillStyle = "#934c93";
            hctx.strokeStyle = "#660066";
            if (greyedOut == "yes"){
              hctx.fillStyle = "#c0c0c0";
              hctx.strokeStyle = "#a2a2a2";
            }
            hctx.rotate(-bodyangle);
            hctx.beginPath();
            var baseSides = 6;
            hctx.moveTo(bodysize * Math.cos(0), bodysize * Math.sin(0));
            for (var i = 1; i <= baseSides; i += 1) {
              hctx.lineTo(bodysize * Math.cos((i * 2 * Math.PI) / baseSides), bodysize * Math.sin((i * 2 * Math.PI) / baseSides));
            }
            hctx.fill();
            hctx.stroke();
            hctx.rotate(bodyangle);
          }
        }
        hctx.restore();
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = fontsize/2.8;
          name = name.charAt(0).toUpperCase() + name.slice(1);//make first letter of tank name uppercase
          hctx.save();
          hctx.translate(hcanvas.width / 2 - Xadditional, pos + (h - fontsize / 2 * scale + Yadditional));
          hctx.scale(1,scale);
        hctx.strokeText(name, 0, 0);
        hctx.fillText(name, 0, 0);
          hctx.restore();
      }
      function drawConnection(
        startX,
        startY,
        endX,
        endY,
        topWidth,
        which,
        applystyle
      ) {
        let scale = resizeDiffY/resizeDiffX;//make upgrade tree not squashed
        topWidth*=scale;
        //top width refers to the width of the box where the line starts to draw
        if (which == "weapon") {
          var pos = upgradetreepos;
        } else if (which == "body") {
          var pos = bupgradetreepos;
        }
        if(applystyle !== 0)  {
        hctx.strokeStyle = "rgba(51,51,51)";
        }
        hctx.lineWidth = 3;
        hctx.beginPath();
        hctx.moveTo(hcanvas.width / 2 - startX, pos + startY + topWidth);
        hctx.lineTo(hcanvas.width / 2 - endX, pos + endY);
        hctx.stroke();
      }
      //draw weapon upgrades
      //rotate tanks:
      bodyangle += 0.02*deltaTime;
      
      if (player.bodyType != previousBody){//upgraded tank
        bodyCanUpgradeTo = getTanksThatCanUpgradeTo(bodyupgrades,player.bodyType)//get list of upgradable tanks to figure out which ones to grey out on upgrade tree
        previousBody = player.bodyType;
      }
      if (player.tankType != previousWeapon){//upgraded tank
        weaponCanUpgradeTo = getTanksThatCanUpgradeTo(weaponupgrades,player.tankType)//get list of upgradable tanks to figure out which ones to grey out on upgrade tree
        previousWeapon = player.tankType;
        //below code is for crossroads darkness
        barrelsDarkness = [];
        correspondingBarrelHeight = {};
        for (const barrel in player.barrels){
          let thisBarrel = player.barrels[barrel];
          if (!barrelsDarkness.includes(thisBarrel.additionalAngle)){//dont allow repeated angles in the array
            if (thisBarrel.additionalAngle < 0){//prevent negaive angles to break the darkness code
              thisBarrel.additionalAngle += 360;
            }
            barrelsDarkness.push(thisBarrel.additionalAngle)
            if (!correspondingBarrelHeight[thisBarrel.additionalAngle]){//add to list of barrel heights
              correspondingBarrelHeight[thisBarrel.additionalAngle] = thisBarrel.barrelHeight/player.width - 0.5;//barrel height in terms of player's width
            }
            else if (thisBarrel.barrelHeight > correspondingBarrelHeight[thisBarrel.additionalAngle]){//if barrel height more than height of previous barrel with same angle
              correspondingBarrelHeight[thisBarrel.additionalAngle] = thisBarrel.barrelHeight/player.width - 0.5;
            }
          }
        }
        barrelsDarkness.sort((a,b)=>b-a);//sort array in descending order of number
      }
      
      if (showUpgradeTree == "yes" || upgradetreepos > upgradetreestart) {
        //if upgrade tree is open of upgrade tree is closing
        hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        hctx.textAlign = "center";
        if (
          player.tankTypeLevel < 60 &&
          player.bodyTypeLevel < 60 &&
          player.tankType != "eternal"
        ) {
          //if a normal tank create upgrade tiers
          
          var tier1 = {
              "node": {
                  "children": {"basic":"", trapper:"", "guard":""}
              },
          };
          var tier2 = {
              "basic": {"children": {"twin":"", "sniper":"", "cannon":"", "flank":""}},
              trapper: {"children":{"delta":""}},
              "guard": {"children":{"commander":"",overseer:""}},
          };
          var tier3 = {
              "twin": {"children":{"gunner":"","quad":"","split":"","stream":"",}},
              "sniper": {"children":{"targeter":"","marksman":"",}},
              "cannon": {"children":{"single":""}},
              "flank": {"children":{"quad":"","tri-angle":"",}},
              delta: {"children":{"gamma":"","blockade":"",minelayer:"","warden":""}},
              "commander": {"children":{"director":""}},
              overseer: {"children":{protector:""}},
          };
          var tier4 = {
              gunner: {"children":{"minesweeper":"","blaster":"","rimfire":""}},
              quad: {"children":{"octo":""}},
              split: {"children":{"tower":"",rimfire:""}},
              stream: {"children":{"jet":""}},
              targeter: {"children":{"streamliner":""}},
              marksman: {"children":{"duel":""}},
              single: {"children":{"destroyer":""}},
              "tri-angle": {"children":{"booster":"","fighter":""}},
              "gamma": {"children":{"beta":""}},
              "minelayer": {"children":{"engineer":""}},
              warden: {"children":{"defender":""}},
              blockade: {"children":{barricade:""}},
              "director": {"children":{"manager":"","spawner":""}},
              "protector": {"children":{"king":""}},
          };
          var tier5 = {
              minesweeper: {"children":{"battler":"","pinnace":""}},
              blaster: {"children":{"minigun":"","knockback":""}},
              rimfire: {"children":{"centrefire":""}},
              octo: {"children":{"cyclone":"",hex:""}},
              tower: {"children":{"stronghold":"",centrefire:""}},
              jet: {"children":{"flamethrower":""}},
              streamliner: {"children":{"conquerer":""}},
              duel: {"children":{"hunter":""}},
              destroyer: {"children":{"hex":"","harbinger":"",hybrid:""}},
              booster: {"children":{"guardian":"","comet":""}},
              fighter: {"children":{"wave":"","amalgam":""}},
              beta: {"children":{"alpha":""}},
              engineer: {"children":{"machine":"","manufacturer":"","detonator":""}},
              defender: {"children":{"sharpnel":""}},
              barricade: {"children":{riot:""}},
              manager: {"children":{"executive":"",CEO:"",hybrid:""}},
              spawner: {"children":{"factory":""}},
              king:{"children":{"master":"","tyrant":""}},
          }
          
          var tier6 = {
              battler: {},
              pinnace: {},
              minigun: {},
              knockback: {},
              centrefire: {},
              cyclone: {},
              stronghold: {},
              flamethrower: {},
              conquerer: {},
              hunter: {},
              hex: {},
              harbinger: {},
              hybrid: {},
              guardian: {},
              comet: {},
              wave: {},
              amalgam: {},
              alpha: {},
              machine: {},
              manufacturer: {},
              detonator: {},
              sharpnel: {},
              riot: {},
              executive: {},
              CEO: {},
              factory: {},
              master: {},
              tyrant: {},
          }
          
          for(let i = 0; i < Object.keys(tier1).length; ++i) {//tier 1 buttons and lines
            var tank = Object.keys(tier1).reverse()[i];
            drawUpgradetreeBox(
               tank,
              ((i*240)/2)-((Object.keys(tier1).length-1)*(240/2)/2),
              -40,
              15,
              95,
              "rgba(" + upgradeButtons[1].color + ")",
              "rgba(" + upgradeButtons[1].darkcolor + ")",
              "weapon"
            );
            for(let e = 0; e < Object.keys(tier2).length; ++e) {
              if(tier1[tank].children[Object.keys(tier2).reverse()[e]] !== undefined) {
              drawConnection(((i*240)/2)-((Object.keys(tier1).length-1)*(240/2)/2), -40, ((e*300)/2)-((Object.keys(tier2).length-1)*(300/2)/2), 135, 95, "weapon");
              }
            }
          }
          
          for(let i = 0; i < Object.keys(tier2).length; ++i) {//tier 2 buttons and lines...
            var tank = Object.keys(tier2).reverse()[i];
            drawUpgradetreeBox(
               tank,
              ((i*300)/2)-((Object.keys(tier2).length-1)*(300/2)/2),
              135,
              15,
              85,
              "rgba(" + upgradeButtons[2].color + ")",
              "rgba(" + upgradeButtons[2].darkcolor + ")",
              "weapon"
            );
            if(JSON.stringify(tier2[tank]) == '{}') {
              tier2[tank].children = {}
            }
            for(let e = 0; e < Object.keys(tier2[tank].children).length; ++e) {
              if(Object.keys(tier2[tank].children)[e] !== undefined) {
                if(tier3[Object.keys(tier2[tank].children).reverse()[e]] !== undefined) {
                  var id;
                  for(let o = 0; o < Object.keys(tier3).length; ++o) {
                    if(Object.keys(tier3).reverse()[o] == Object.keys(tier2[tank].children)[e]) {id = o};
                  }
                  drawConnection(((i*300)/2)-((Object.keys(tier2).length-1)*(300/2)/2), 125, ((id*170)/2)-((Object.keys(tier3).length-1)*(170/2)/2), 310, 95, "weapon");
                }
              }
            }
          }

          
          for(let i = 0; i < Object.keys(tier3).length; ++i) {//you know the drill
            var tank = Object.keys(tier3).reverse()[i];
            drawUpgradetreeBox(
               tank,
              ((i*170)/2)-((Object.keys(tier3).length-1)*(170/2)/2),
              310,
              14,
              75,
              "rgba(" + upgradeButtons[3].color + ")",
              "rgba(" + upgradeButtons[3].darkcolor + ")",
              "weapon"
            );
            if(JSON.stringify(tier3[tank]) == '{}') {
              tier3[tank].children = {}
            }
            
            for(let e = 0; e < Object.keys(tier3[tank].children).length; ++e) {
              if(Object.keys(tier3[tank].children)[e] !== undefined) {
                if(tier4[Object.keys(tier3[tank].children).reverse()[e]] !== undefined) {
                  var id;
                  for(let o = 0; o < Object.keys(tier4).length; ++o) {
                    if(Object.keys(tier4).reverse()[o] == Object.keys(tier3[tank].children)[e]) {id = o};
                  }
                  drawConnection(((i*170)/2)-((Object.keys(tier3).length-1)*(170/2)/2), 290, ((id*140)/2)-((Object.keys(tier4).length-1)*(140/2)/2), 455, 95, "weapon");
                }
              }
            }
          }
          
          var t4u = 0;
          for(let i = 0; i < Object.keys(tier4).length; ++i) {
            var tank = Object.keys(tier4).reverse()[i];
            drawUpgradetreeBox(
               tank,
              ((i*140)/2)-((Object.keys(tier4).length-1)*(140/2)/2),
              455,
              12,
              65,
              "rgba(" + upgradeButtons[4].color + ")",
              "rgba(" + upgradeButtons[4].darkcolor + ")",
              "weapon"
            );
            if(JSON.stringify(tier4[tank]) == '{}') {
              tier4[tank].children = {}
            }
            for(let e = 0; e < Object.keys(tier4[tank].children).length; ++e) {
              if(Object.keys(tier4[tank].children)[e] !== undefined) {
                if(tier5[Object.keys(tier4[tank].children).reverse()[e]] !== undefined) {
                  var id;
                  for(let o = 0; o < Object.keys(tier5).length; ++o) {
                    if(Object.keys(tier5).reverse()[o] == Object.keys(tier4[tank].children)[e]) {id = o};
                  }
                  //console.log(((t4u*40)/2)-((Object.keys(tier5).length-1)*(40/2)/2), yinc)

                  var oldsS = hctx.strokeStyle;
                  drawConnection(((i*140)/2)-((Object.keys(tier4).length-1)*(140/2)/2), 420, ((id*120)/2)-((Object.keys(tier5).length-1)*(120/2)/2), 570, 95, "weapon");
                  hctx.strokeStyle = oldsS;
                }
              }
            }
          }
          
          for(let i = 0; i < Object.keys(tier5).length; ++i) {
            var tank = Object.keys(tier5).reverse()[i];
              drawUpgradetreeBox(
                 tank,
                ((i*120)/2)-((Object.keys(tier5).length-1)*(120/2)/2),
                570,
                11,
                55,
                "rgba(" + upgradeButtons[5].color + ")",
                "rgba(" + upgradeButtons[5].darkcolor + ")",
                "weapon"
              );
            if(JSON.stringify(tier5[tank]) == '{}') {
              tier5[tank].children = {}
            }
            for(let e = 0; e < Object.keys(tier5[tank].children).length; ++e) {
              if(Object.keys(tier5[tank].children)[e] !== undefined) {
                if(tier6[Object.keys(tier5[tank].children).reverse()[e]] !== undefined) {
                  var id;
                  for(let o = 0; o < Object.keys(tier6).length; ++o) {
                    if(Object.keys(tier6).reverse()[o] == Object.keys(tier5[tank].children)[e]) {id = o};
                  }
                  //console.log(((t4u*40)/2)-((Object.keys(tier5).length-1)*(40/2)/2), yinc)
                  var oldsS = hctx.strokeStyle;
                  hctx.strokeStyle = "rgba(95,95,95)";
                  drawConnection(((i*120)/2)-((Object.keys(tier5).length-1)*(120/2)/2), 525, ((id*100)/2)-((Object.keys(tier6).length-1)*(100/2)/2), 660, 95, "weapon");
                  hctx.strokeStyle = oldsS;
                }
              }
            }
          }
          
          for(let i = 0; i < Object.keys(tier6).length; ++i) {//tier 6 buttons, no lines because theres no tier 7
            var tank = Object.keys(tier6).reverse()[i];
              drawUpgradetreeBox(
                 tank,
                ((i*100)/2)-((Object.keys(tier6).length-1)*(100/2)/2),
                660,
                9,
                45,
                "rgba(" + upgradeButtons[6].color + ")",
                "rgba(" + upgradeButtons[6].darkcolor + ")",
                "weapon"
              );
          }
          
          
        } else {
          
          let col = "rgba(125, 14, 230)";
          let darkcol = "rgba(95, 0, 200)";
          //if it is an eternal or above
          drawUpgradetreeBox(
            "eternal",
            0,
            0,
            15,
            95,
            col,
            darkcol,
            "weapon"
          );
          
          col = "rgba(165, 14, 230)";
          darkcol = "rgba(135, 0, 200)";

          drawUpgradetreeBox(
            "hailstorm",
            300,
            150,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "bunker",
            150,
            150,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "chaos",
            0,
            150,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "bombshell",
            -150,
            150,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "warrior",
            -300,
            150,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawConnection(0, 0, 300, 150, 95, "weapon");
          drawConnection(0, 0, 150, 150, 95, "weapon");
          drawConnection(0, 0, 0, 150, 95, "weapon");
          drawConnection(0, 0, -150, 150, 95, "weapon");
          drawConnection(0, 0, -300, 150, 95, "weapon");
          
          col = "rgba(204, 2, 245)";
          darkcol = "rgba(174, 0, 215)";

          drawUpgradetreeBox(
            "thunderstorm",
            440,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "cosmetic",
            330,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "vault",
            220,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "asteroid",
            110,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "dynamite",
            0,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "mayhem",
            -110,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "industry",
            -220,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "demolisher",
            -330,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawUpgradetreeBox(
            "veteran",
            -440,
            300,
            15,
            85,
            col,
            darkcol,
            "weapon"
          );
          drawConnection(300, 150, 440, 300, 85, "weapon");
          drawConnection(300, 150, 330, 300, 85, "weapon");
          drawConnection(150, 150, 220, 300, 85, "weapon");
          drawConnection(150, 150, 110, 300, 85, "weapon");
          drawConnection(150, 150, 0, 300, 85, "weapon");
          drawConnection(0, 150, -110, 300, 85, "weapon");
          drawConnection(0, 150, -220, 300, 85, "weapon");
          drawConnection(-150, 150, -330, 300, 85, "weapon");
          drawConnection(-300, 150, -440, 300, 85, "weapon");
        }

        hctx.lineJoin = "miter"; //change it back

        //animate upgrade tree when opening
        if (showUpgradeTree == "yes" && upgradetreepos < upgradetreeend) {
          upgradetreepos += (upgradetreeend - upgradetreepos) / 5*deltaTime; //speed changes based on amount moved so far. the smaller the number, the faster
          if (upgradetreeend - upgradetreepos < 1) {
            //if very near end point
            upgradetreepos = upgradetreeend;
          }
        } else if (showUpgradeTree == "no") {
          //if upgrade tree is closing
          upgradetreepos -= (upgradetreepos - upgradetreestart) / 5*deltaTime;
          if (upgradetreepos - upgradetreestart < 1) {
            //if very near end point
            upgradetreepos = upgradetreestart;
          }
        }
      } else {
        //if upgrade tree not drawn
        upgradetreepos = upgradetreestart; //reset variable
      }

      //draw body upgrades
      if (
        showBodyUpgradeTree == "yes" ||
        bupgradetreepos > bupgradetreestart
      ) {
        //if upgrade tree is open of upgrade tree is closing
        hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        hctx.textAlign = "center";
        if (
          player.tankTypeLevel < 60 &&
          player.bodyTypeLevel < 60 &&
          player.tankType != "eternal"
        ) {
          
          let col = "rgba(" + upgradeButtons[1].color + ")";
          let darkcol = "rgba(" + upgradeButtons[1].darkcolor + ")";
          //if a normal tank
          drawUpgradetreeBox(
            "base",
            0,
            -40,
            15,
            95,
            col,
            darkcol,
            "body"
          );
          
          col = "rgba(" + upgradeButtons[2].color + ")";
          darkcol = "rgba(" + upgradeButtons[2].darkcolor + ")";

          drawUpgradetreeBox(
            "raider",
            150,
            110,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "wall",
            0,
            110,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "sentry",
            -150,
            110,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawConnection(0, -40, 150, 110, 95, "body");
          drawConnection(0, -40, 0, 110, 95, "body");
          drawConnection(0, -40, -150, 110, 95, "body");
          
          col = "rgba(" + upgradeButtons[3].color + ")";
          darkcol = "rgba(" + upgradeButtons[3].darkcolor + ")";

          drawUpgradetreeBox(
            "forge",
            275,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "castle",
            165,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "smasher",
            55,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "propeller",
            -55,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "mono",
            -165,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "hangar",
            -275,
            260,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawConnection(150, 110, 275, 260, 85, "body");
          drawConnection(0, 110, 165, 260, 85, "body");
          drawConnection(0, 110, 55, 260, 85, "body");
          drawConnection(0, 110, -55, 260, 85, "body");
          drawConnection(-150, 110, -165, 260, 85, "body");
          drawConnection(-150, 110, -275, 260, 85, "body");
          
          col = "rgba(" + upgradeButtons[4].color + ")";
          darkcol = "rgba(" + upgradeButtons[4].darkcolor + ")";

          drawUpgradetreeBox(
            "foundry",
            427.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "mender",
            332.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "hail",
            237.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "fortress",
            142.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "spike",
            47.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "armory",
            -47.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "thruster",
            -142.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "bastion",
            -237.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "turret",
            -332.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "warship",
            -427.5,
            410,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawConnection(275, 260, 427.5, 410, 85, "body");
          drawConnection(275, 260, 332.5, 410, 85, "body");
          drawConnection(275, 260, 237.5, 410, 85, "body");
          drawConnection(165, 260, 142.5, 410, 85, "body");
          drawConnection(55, 260, 47.5, 410, 85, "body");
          drawConnection(55, 260, -47.5, 410, 85, "body");
          drawConnection(-55, 260, -142.5, 410, 85, "body");
          drawConnection(-165, 260, -237.5, 410, 85, "body");
          drawConnection(-165, 260, -332.5, 410, 85, "body");
          drawConnection(-165, 260, -47.5, 410, 85, "body");
          drawConnection(-275, 260, -427.5, 410, 85, "body");
          
          col = "rgba(" + upgradeButtons[5].color + ")";
          darkcol = "rgba(" + upgradeButtons[5].darkcolor + ")";

          drawUpgradetreeBox(
            "flame",
            427.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "remedy",
            332.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "blizzard",
            237.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "palace",
            142.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "thorn",
            47.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "brigade",
            -47.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "launcher",
            -142.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "artillery",
            -237.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "triplet",
            -332.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "battleship",
            -427.5,
            540,
            13,
            80,
            col,
            darkcol,
            "body"
          );
          drawConnection(427.5, 410, 427.5, 540, 80, "body");
          drawConnection(332.5, 410, 332.5, 540, 80, "body");
          drawConnection(237.5, 410, 237.5, 540, 80, "body");
          drawConnection(142.5, 410, 142.5, 540, 80, "body");
          drawConnection(47.5, 410, 47.5, 540, 80, "body");
          drawConnection(-47.5, 410, -47.5, 540, 80, "body");
          drawConnection(-142.5, 410, -142.5, 540, 80, "body");
          drawConnection(-237.5, 410, -237.5, 540, 80, "body");
          drawConnection(-332.5, 410, -332.5, 540, 80, "body");
          drawConnection(-427.5, 410, -427.5, 540, 80, "body");
          
          col = "rgba(" + upgradeButtons[6].color + ")";
          darkcol = "rgba(" + upgradeButtons[6].darkcolor + ")";

          drawUpgradetreeBox(
            "inferno",
            425,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "juggernaut",
            340,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "fabricator",
            255,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "snowstorm",
            170,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "ziggurat",
            85,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "saw",
            0,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "battalion",
            -85,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "rocketer",
            -170,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "bombard",
            -255,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "quadruplet",
            -340,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "mothership",
            -425,
            660,
            12,
            75,
            col,
            darkcol,
            "body"
          );
          drawConnection(427.5, 540, 425, 660, 80, "body");
          drawConnection(427.5, 540, 340, 660, 80, "body");
          drawConnection(332.5, 540, 255, 660, 80, "body");
          drawConnection(237.5, 540, 170, 660, 80, "body");
          drawConnection(142.5, 540, 85, 660, 80, "body");
          drawConnection(47.5, 540, 0, 660, 80, "body");
          drawConnection(47.5, 540, -85, 660, 80, "body");
          drawConnection(-47.5, 540, -85, 660, 80, "body");
          drawConnection(-237.5, 540, -85, 660, 80, "body");
          drawConnection(-142.5, 540, -170, 660, 80, "body");
          drawConnection(-237.5, 540, -255, 660, 80, "body");
          drawConnection(-332.5, 540, -340, 660, 80, "body");
          drawConnection(-427.5, 540, -425, 660, 80, "body");
        } else {
          
          let col = "rgba(125, 14, 230)";
          let darkcol = "rgba(95, 0, 200)";
          //if it is an eternal or above
          drawUpgradetreeBox(
            "primordial",
            0,
            0,
            15,
            95,
            col,
            darkcol,
            "body"
          );
          
          col = "rgba(165, 14, 230)";
          darkcol = "rgba(135, 0, 200)";

          drawUpgradetreeBox(
            "oven",
            375,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "pounder",
            225,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "chainsaw",
            75,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "lightning",
            -75,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "meteor",
            -225,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "satellite",
            -375,
            150,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawConnection(0, 0, 375, 150, 95, "body");
          drawConnection(0, 0, 225, 150, 95, "body");
          drawConnection(0, 0, 75, 150, 95, "body");
          drawConnection(0, 0, -75, 150, 95, "body");
          drawConnection(0, 0, -225, 150, 95, "body");
          drawConnection(0, 0, -375, 150, 95, "body");
          
          col = "rgba(204, 2, 245)";
          darkcol = "rgba(174, 0, 215)";

          drawUpgradetreeBox(
            "heliosphere",
            450,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "corvus",
            300,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "chasm",
            150,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "blade",
            0,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "firebolt",
            -150,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "nebula",
            -300,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawUpgradetreeBox(
            "triton",
            -450,
            300,
            15,
            85,
            col,
            darkcol,
            "body"
          );
          drawConnection(375, 150, 450, 300, 85, "body");
          drawConnection(375, 150, 300, 300, 85, "body");
          drawConnection(225, 150, 150, 300, 85, "body");
          drawConnection(75, 150, 0, 300, 85, "body");
          drawConnection(-75, 150, -150, 300, 85, "body");
          drawConnection(-225, 150, -300, 300, 85, "body");
          drawConnection(-375, 150, -450, 300, 85, "body");
        }

        hctx.lineJoin = "miter"; //change it back

        //animate upgrade tree when opening
        if (
          showBodyUpgradeTree == "yes" &&
          bupgradetreepos < bupgradetreeend
        ) {
          bupgradetreepos += (bupgradetreeend - bupgradetreepos) / 5*deltaTime; //speed changes based on amount moved so far. the smaller the number, the faster
          if (bupgradetreeend - bupgradetreepos < 1) {
            //if very near end point
            bupgradetreepos = bupgradetreeend;
          }
        } else if (showBodyUpgradeTree == "no") {
          //if upgrade tree is closing
          bupgradetreepos -= (bupgradetreepos - bupgradetreestart) / 5*deltaTime;
          if (bupgradetreepos - bupgradetreestart < 1) {
            //if very near end point
            bupgradetreepos = bupgradetreestart;
          }
        }
      } else {
        //if upgrade tree not drawn
        bupgradetreepos = bupgradetreestart; //reset variable
      }

      //drawing score progress bar, which is a rounded rectangle
      //instead of using the player's score, it uses the client's own score that increases based on the difference between it and the player's score.
      //e.g. player kills something and score jumps from 0 to 50, but the client's own score will slowly increase from 0 to 50 to create a smooth animation of score progress bar
      //the score displayed on the score bar is also the client's score
      //below code increases client's score based on the difference
      if (player.score > barScore) {
        barScore += Math.round((player.score - barScore) / 15); //math.round ensures that a whole number is added to the score, so the score is always a whole number
        if (Math.round((player.score - barScore) / 15) < 1) {
          //if score increment is too small
          barScore = player.score;
        }
      } else {
        barScore = player.score; //neccessary when player respawns and have score lower than previously
      }

      //exponential equation used: score = 1.16^level * 1000 - 1000
      //numberA^level * numberB - numberC
      let numberA = 1.16;
      let numberB = 1000;
      let numberC = 1000;

      if (barScore > 0) {
        var barcurrentlevel = Math.floor(
          Math.log((barScore + numberC) / numberB) / Math.log(numberA)
        ); //calculation for current level
      } else {
        var barcurrentlevel = 0;
      }
      var barnextlevel = barcurrentlevel + 1; //calculation for next level
      var totalScoreInCurrentLvl =
        Math.pow(numberA, barnextlevel) * numberB -
        numberC -
        (Math.pow(numberA, barcurrentlevel) * numberB - numberC);
      var scoreInCurrentLvl =
        barScore -
        (Math.pow(numberA, barcurrentlevel) * numberB - numberC);
      var leader = players[Object.keys(players)[0]].score; //person with most score on leaderboard. use object.keys to change to array to get order of players, then use 0 to get id of top on leaderboard
      var w = 298;
      var h = 25;
      var r = h / 2;
      var x = hcanvas.width / 2 - w / 2;
      var y = hcanvas.height - h - 40;
      hctx.save();
      hctx.translate(hcanvas.width/2, hcanvas.height);
      hctx.scale(1, resizeDiffY/resizeDiffX);//prevent squashed UI
      x-=hcanvas.width/2;
      y-=hcanvas.height;
      hctx.fillStyle = "black";
      hctxroundRectangleFill(x,y,r,w,h);
      h = 17;
      if (barScore > 0) {
        w = (290 / leader) * barScore; //max width 290
      } else {
        w = 0;
      }
      if (w < h) {
        w = h;
      }
      x = hcanvas.width / 2 - 290 / 2; //max width 290
      y = hcanvas.height - 17 / 2 - h / 2 - 44; //max height 17, and x value of 50
      if (r > w / 2) {
        r = w / 2;
      } else {
        r = h / 2;
      }

      if (player.team == "none") {
        hctx.fillStyle = bodyColors.blue.col;
      } else if (bodyColors.hasOwnProperty(player.team)) {
        hctx.fillStyle = bodyColors[player.team].col;
      }
      x-=hcanvas.width/2;
      y-=hcanvas.height;
      hctxroundRectangleFill(x,y,r,w,h);
      var w = 398;
      var h = 30;
      var r = h / 2;
      var x = hcanvas.width / 2 - w / 2;
      var y = hcanvas.height - h - 6;
      x-=hcanvas.width/2;
      y-=hcanvas.height;
      hctx.fillStyle = "black";
      hctxroundRectangleFill(x,y,r,w,h);
      h = 22;
      if (barScore > 0) {
        w = (390 / totalScoreInCurrentLvl) * scoreInCurrentLvl;
      } else {
        w = 0;
      }
      if (w < h) {
        w = h;
      }
      x = hcanvas.width / 2 - 390 / 2;
      y = hcanvas.height - 22 / 2 - h / 2 - 10;
      if (r > w / 2) {
        r = w / 2;
      } else {
        r = h / 2;
      }
      if (player.team == "none") {
        hctx.fillStyle = bodyColors.blue.col;
      } else if (bodyColors.hasOwnProperty(player.team)) {
        hctx.fillStyle = bodyColors[player.team].col;
      }
      x-=hcanvas.width/2;
      y-=hcanvas.height;
      hctxroundRectangleFill(x,y,r,w,h);
      //writing the score, level and tank type
      //ABBREVIATE SCORE, e.g. 6000 -> 6k
      //player's score is not abbreviated because need to do calculations using the number, and server might get laggy if it need to abbreviate everyone's score, so abbreviating score is done in client side code
      var newValue = barScore;
      if (barScore >= 1000) {
        var suffixes = ["", "k", "m", "b", "t"];
        var suffixNum = Math.floor(("" + barScore).length / 3);
        var shortValue = "";
        for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat(
            (suffixNum != 0
              ? barScore / Math.pow(1000, suffixNum)
              : barScore
            ).toPrecision(precision)
          );
          var dotLessShortValue = (shortValue + "").replace(
            /[^a-zA-Z 0-9]+/g,
            ""
          );
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
      }
      scoreInCurrentLvl = Math.round(scoreInCurrentLvl);//MUST ROUND
      if (scoreInCurrentLvl >= 1000) {
        var suffixes = ["", "k", "m", "b", "t"];
        var suffixNum = Math.floor(("" + scoreInCurrentLvl).length / 3);
        var shortValue = "";
        for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat(
            (suffixNum != 0
              ? scoreInCurrentLvl / Math.pow(1000, suffixNum)
              : scoreInCurrentLvl
            ).toPrecision(precision)
          );
          var dotLessShortValue = (shortValue + "").replace(
            /[^a-zA-Z 0-9]+/g,
            ""
          );
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        scoreInCurrentLvl = shortValue + suffixes[suffixNum];
      }
      totalScoreInCurrentLvl = Math.round(totalScoreInCurrentLvl);//MUST ROUND
      if (totalScoreInCurrentLvl >= 1000) {
        var suffixes = ["", "k", "m", "b", "t"];
        var suffixNum = Math.floor(("" + totalScoreInCurrentLvl).length / 3);
        var shortValue = "";
        for (var precision = 2; precision >= 1; precision--) {
          shortValue = parseFloat(
            (suffixNum != 0
              ? totalScoreInCurrentLvl / Math.pow(1000, suffixNum)
              : totalScoreInCurrentLvl
            ).toPrecision(precision)
          );
          var dotLessShortValue = (shortValue + "").replace(
            /[^a-zA-Z 0-9]+/g,
            ""
          );
          if (dotLessShortValue.length <= 2) {
            break;
          }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        totalScoreInCurrentLvl = shortValue + suffixes[suffixNum];
      }

      hctx.fillStyle = "white";
      hctx.strokeStyle = "black";
      hctx.font = "900 18px Roboto";
      hctx.lineWidth = 5;
      hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
      hctx.textAlign = "center";
      hctx.strokeText("Score: " + newValue + " (" + barScore + ")", 0, -47.5);
      hctx.fillText("Score: " + newValue + " (" + barScore + ")", 0, -47.5);
      hctx.font = "900 22px Roboto";
      hctx.strokeText(scoreInCurrentLvl +
          " / " + totalScoreInCurrentLvl,
        0,
        -13
      );
      hctx.fillText(scoreInCurrentLvl +
          " / " + totalScoreInCurrentLvl,
        0,
        -13
      );
      hctx.font = "700 20px Roboto";
      hctx.lineWidth = 9;
      hctx.miterLimit = 2;//prevent spikes, alternative method instead of linejoin round
      hctx.lineJoin = "miter";
      let weapontank = player.tankType;
      let bodytank = player.bodyType;
      if (weapontank && bodytank){
        weapontank = weapontank.charAt(0).toUpperCase() + weapontank.slice(1);//make first letter of tank name uppercase
        bodytank = bodytank.charAt(0).toUpperCase() + bodytank.slice(1);//make first letter of tank name uppercase
      }
      else{
        weapontank = "";
        bodytank = "";
      }
      hctx.strokeText(
        "Level " +
          barcurrentlevel +
          " " +
          weapontank +
          "-" +
          bodytank,
        0,
        - 75
      );
      hctx.fillText(
        "Level " +
          barcurrentlevel +
          " " +
          weapontank +
          "-" +
          bodytank,
        0,
        - 75
      );
      hctx.font = "900 52px Roboto";
      hctx.strokeText(
        player.name,
        0,
        - 102.5
      );
      hctx.fillText(player.name, 0, - 102.5);
      hctx.lineJoin = "miter";
      hctx.restore();

      //drawing minimap
      if (openedUI=="no"){//in tank editor, only draw when editor is closed
        if (gamelocation != "crossroads" && gamelocation != "cavern") {
          //dont draw anything on minimap for crossroads and cavern
          let mmX = 10;
          let mmY = 10;
          let mmSize = 150;
          hctx.save();
          hctx.scale(1,resizeDiffY/resizeDiffX);//ensure that minimap is proportional and not squashed
          //hctx.scale(resizeDiffX,resizeDiffY);

          //draw the map area
          //hctx.fillStyle = "rgba(128,128,128,.5)";
          hctx.fillStyle = "rgba(189,189,189,.5)";
          hctx.strokeStyle = "rgb(90,90,90)";
          hctx.lineWidth = 5;

          hctx.fillRect(mmX, mmY, mmSize, mmSize);//MINIMAP

          if (gamelocation == "2tdm") {//draw team base
            var baseSize = 1500;
            let firstColor = teamColors[0];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX, mmY, baseSize / gameAreaSize * mmSize, mmSize);
            firstColor = teamColors[1];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX + mmSize - baseSize / gameAreaSize * mmSize, mmY, baseSize / gameAreaSize * mmSize, mmSize);
          }

          if (gamelocation == "4tdm") {//draw team base
            var baseSize = 1500;
            let firstColor = teamColors[0];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX, mmY, baseSize / gameAreaSize * mmSize,  baseSize / gameAreaSize * mmSize);
            firstColor = teamColors[1];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX + mmSize - baseSize / gameAreaSize * mmSize, mmY, baseSize / gameAreaSize * mmSize, baseSize / gameAreaSize * mmSize);
            firstColor = teamColors[2];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX + mmSize - baseSize / gameAreaSize * mmSize, mmY + mmSize - baseSize / gameAreaSize * mmSize, baseSize / gameAreaSize * mmSize, baseSize / gameAreaSize * mmSize);
            firstColor = teamColors[3];
            //NOTE: THESE ARE DIFFERENT COLORS FROM THE BODY COLORS!
            if (firstColor == "red"){
              hctx.fillStyle = "#dbbfc0";
            }
            else if (firstColor == "green"){
              hctx.fillStyle = "#acd0bd";
            }
            else if (firstColor == "blue"){
              hctx.fillStyle = "#acc8d0";
            }
            else if (firstColor == "purple"){
              hctx.fillStyle = "#c0b3c9";
            }
            hctx.fillRect(mmX, mmY + mmSize - baseSize / gameAreaSize * mmSize, baseSize / gameAreaSize * mmSize, baseSize / gameAreaSize * mmSize);
          }

          hctx.strokeRect(mmX, mmY, mmSize, mmSize);//MINIMAP OUTLINE

          if (gamelocation == "tank-editor"){//draw safe zone
            hctx.fillStyle = safeZoneColor;
            hctx.fillRect(mmX + mmSize/2 - safeZone/gameAreaSize*mmSize/2, mmY + mmSize/2 - safeZone/gameAreaSize*mmSize/2, safeZone/gameAreaSize*mmSize, safeZone/gameAreaSize*mmSize);
          }


          //player location on minimap
          hctx.fillStyle = "rgb(90,90,90)"; //player always darkgrey triangle on minimap
          hctx.save();
          hctx.translate((player.x / gameAreaSize) * mmSize + mmX, (player.y / gameAreaSize) * mmSize + mmY);
          hctx.rotate(clientAngle);
          hctx.beginPath();//draw triangle
          let h = 10;
          let w = 7;
          hctx.moveTo(0,-h/2)
          hctx.lineTo(w/2,h/2)
          hctx.lineTo(-w/2,h/2)
          hctx.fill();
          hctx.restore();
          //drawing portals on minimap
          Object.keys(portals).forEach((portalID) => {
            let portal = portals[portalID];
            if (portal.hasOwnProperty("red")) {
              //if portal is radiant
              hctx.fillStyle =
                "rgb(" +
                portal.red +
                ", " +
                portal.green +
                ", " +
                portal.blue +
                ")";
            } else {
              hctx.fillStyle = "rgb(" + portal.color + ")";
            }
            hctx.beginPath();
            hctx.arc(
              (portal.x / gameAreaSize) * mmSize + mmX,
              (portal.y / gameAreaSize) * mmSize + mmY,
              4,
              0,
              2 * Math.PI
            );
            //5 refers to width of portal on minimap, the size is not based on actual portal size bcause portal would be almost invisible on minimap if the map is big
            hctx.fill();
          });

          hctx.restore();
        }

      //drawing stat points, the stuff that appear on middle left of screen
      hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        /*
      var statPointColors = [
        "#9BFF91",
        "#9BFFFF",
        "#8196FF",
        "#6464FF",
        "#9664FF",
        "#C864FF",
        "#FF64FF",
        "#FF6496",
        "#ff6464",
      ]; //list of colors
      */
      var statPointColors = [
        "#768cfc",
        "#fc7676",
        "#38b764",
        "#ffe46b",
        "#768cfc",
        "#fc7676",
        "#38b764",
        "#ffe46b",
      ]; //list of colors
      var darkstatpointcolors = [
        "#3b467e",
        "#7e3b3b",
        "#1c5c32",
        "#726630",
        "#3b467e",
        "#7e3b3b",
        "#1c5c32",
        "#726630",
      ];
      currentStatPoints = player.skillPoints;
      extraPoints = player.unusedPoints;
      var plusbuttonsize = 20;
      function drawStatPoints(
        name,
        distFromTop,
        totalnumberOfPoints,
        pointsRemaining,
        currentpoints
      ) {
        if (currentpoints < 4) {
          var extraX = skillpointspos - 20; //stats on left side of screen
        } else {
          var extraX = hcanvas.width - skillpointspos + 20; //stats on right side of screen
        }
        var w = 17 * totalnumberOfPoints;
        var h = 30;
        var r = h / 2; //radius is one third of height
        var y = distFromTop;
        var x = -w / 2 + extraX;
        w += plusbuttonsize;
        if (currentpoints >= 4) {
          x -= plusbuttonsize;
        }
        //draw max points
        hctx.fillStyle = "rgb(0, 0, 0)";
        hctxroundRectangleFill(x,y,r,w,h);
        //grey points representing points that can be upgraded
          h = 20;
          r = h / 2;
          x += (40 - 30) / 2;
          y += (40 - 30) / 2; //40 is original height, 30 is new height
          if (currentpoints >= 4) {
            x += w;
            x -= (40 - 30);
          }
        //draw current stat points
        if (currentStatPoints[currentpoints] > 0) {
          //draw the lighter colored bar below
          hctx.fillStyle = darkstatpointcolors[currentpoints];
          let statw = 17 * currentStatPoints[currentpoints] - (40 - 30)/totalnumberOfPoints*currentStatPoints[currentpoints];
          if (statw<h){
            h = statw;
            r = h/2;
            y += (20 - h)/2;
          }
          if (currentpoints >= 4) {
            x -= statw;
          }
          hctx.beginPath();
          hctx.moveTo(x + r, y);
          hctx.arcTo(x + statw, y, x + statw, y + h, r);
          hctx.arcTo(x + statw, y + h, x, y + h, r);
          hctx.arcTo(x, y + h, x, y, r);
          hctx.arcTo(x, y, x + statw, y, r);
          hctx.closePath();
          hctx.fill();
          //draw the animated bar above
          hctx.fillStyle = statPointColors[currentpoints];
          if (statw<h){
            h = statw;
            r = h/2;
            y += (20 - h)/2;
          }
          if (currentpoints >= 4) {
            x += statw;//remove old statw
          }
          skillpointsanimation[currentpoints] += (statw - skillpointsanimation[currentpoints])/10*deltaTime;
          statw = skillpointsanimation[currentpoints];
          if (currentpoints >= 4) {
            x -= statw;//add new statw
          }
          hctx.beginPath();
          hctx.moveTo(x + r, y);
          hctx.arcTo(x + statw, y, x + statw, y + h, r);
          hctx.arcTo(x + statw, y + h, x, y + h, r);
          hctx.arcTo(x, y + h, x, y, r);
          hctx.arcTo(x, y, x + statw, y, r);
          hctx.closePath();
          hctx.fill();
        }
        h = 25; //change back to original - 5
        x = -w / 2;
        hctx.font = "900 20px Roboto";
        hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 4;
        hctx.strokeText(
          name,
          x + w / 2 + extraX,
          distFromTop + h / 2 + 8
        );
        hctx.fillText(name, x + w / 2 + extraX, distFromTop + h / 2 + 8);
        //draw the number thingy
        if (currentStatPoints[currentpoints] < totalnumberOfPoints) {
          skillpointsbutton[currentpoints].clickable = "yes";//allow the circular button to be clickable
          hctx.font = "900 16px Roboto";
          if (currentpoints < 4) {
            hctx.strokeText(
              "[" + (currentpoints + 1) + "]",
              x + w + extraX - 30,
              distFromTop + h / 2 + 8
            );
            hctx.fillText(
              "[" + (currentpoints + 1) + "]",
              x + w + extraX - 30,
              distFromTop + h / 2 + 8
            );
          } else {
            hctx.strokeText(
              "[" + (currentpoints + 1) + "]",
              x + extraX + 30,
              distFromTop + h / 2 + 8
            );
            hctx.fillText(
              "[" + (currentpoints + 1) + "]",
              x + extraX + 30,
              distFromTop + h / 2 + 8
            );
          }
        }
          else{
            skillpointsbutton[currentpoints].clickable = "no";
          }
        //draw button
            let extrawidth = 0;
            if (skillpointsbutton[currentpoints].hover == "yes"){
              extrawidth = 2;
            }
          if (currentpoints < 4) {
            if (currentStatPoints[currentpoints] < totalnumberOfPoints) {
              hctx.fillStyle = "white";
            }
            else{
              hctx.fillStyle = "grey";
            }
            hctx.beginPath();
            hctx.arc(17 * totalnumberOfPoints / 2 + extraX + 5, distFromTop + h / 2 + 3, plusbuttonsize/2 + extrawidth, 0, 2 * Math.PI);
            hctx.fill();
            hctx.font = "900 " + (20 + extrawidth) + "px Roboto";
            hctx.fillStyle = "black";
            hctx.fillText(
              "+",
              17 * totalnumberOfPoints / 2 + extraX + 5, distFromTop + h / 2 + 10
            );
          } else {
            if (currentStatPoints[currentpoints] < totalnumberOfPoints) {
              hctx.fillStyle = "white";
            }
            else{
              hctx.fillStyle = "grey";
            }
            hctx.beginPath();
            hctx.arc(-17 * totalnumberOfPoints/2 + extraX - 5, distFromTop + h / 2 + 3, plusbuttonsize/2 + extrawidth, 0, 2 * Math.PI);
            hctx.fill();
            hctx.font = "900 " + (20 + extrawidth) + "px Roboto";
            hctx.fillStyle = "black";
            hctx.fillText(
              "+",
              -17 * totalnumberOfPoints/2 + extraX - 5, distFromTop + h / 2 + 10
            );
          }
      }
      if (extraPoints > 0 || mouseToSkillPoints == "yes") {
        //if there are extra points
        //animate skill points bar when appearing
        skillpointspos += (skillpointsend - skillpointspos) / 5; //speed changes based on amount moved so far. the smaller the number, the faster
        if (skillpointsend - skillpointspos < 1) {
          //if very near end point
          skillpointspos = skillpointsend;
        }
      } else {
        //animate skill points bar when disappearing
        skillpointspos -= (skillpointspos - skillpointsstart) / 5;
        if (skillpointspos - skillpointsstart < 1) {
          //if very near end point
          skillpointspos = skillpointsstart;
        }
      }
      if (
        skillpointspos != skillpointsstart ||
        mouseToSkillPoints == "yes"
      ) {
        //if skill points is supposed to be shown or animating
        hctx.save();
      if(currentGmSelector.gamemode == "3") {
      hctx.translate(60, hcanvas.height);//bottom left of screen + 60px while in tank editor
      } else {
      hctx.translate(0, hcanvas.height);//bottom left of screen
      }
      hctx.scale(1,resizeDiffY/resizeDiffX);
      hctx.translate(-0, -hcanvas.height);//translate back after scaling
        drawStatPoints("Heal", hcanvas.height - 138, 15, 0, 0);
        drawStatPoints("Max Health", hcanvas.height - 105, 15, 0, 1);
        drawStatPoints("Body Damage", hcanvas.height - 72, 15, 0, 2);
        drawStatPoints("Bullet Speed", hcanvas.height - 40, 15, 0, 3);
        hctx.restore();
        hctx.save();
      hctx.translate(hcanvas.width, hcanvas.height);//bottom right of screen
      hctx.scale(1,resizeDiffY/resizeDiffX);
      hctx.translate(-hcanvas.width, -hcanvas.height);//translate back after scaling
        drawStatPoints("Bullet Damage", hcanvas.height - 138, 15, 0, 4);
        drawStatPoints("Weapon Reload", hcanvas.height - 105, 15, 0, 5);
        drawStatPoints("Movement Speed", hcanvas.height - 72, 15, 0, 6);
        drawStatPoints("FoV", hcanvas.height - 40, 15, 0, 7);
        hctx.restore();
        if (extraPoints > 0) {//write the number of extra points
          let width = 20 * 15 /2;//20 is width of each point, 15 is number of skill points
          hctx.font = "700 33px Roboto";
          hctx.lineWidth = 10;
          hctx.fillStyle = "white";
        hctx.strokeStyle = "black";
          hctx.lineJoin = "miter";
          //hctx.miterLimit = 2;//prevent text spikes, alternative to linejoin round
          hctx.save();
          hctx.translate(hcanvas.width, hcanvas.height);//bottom right of screen
      hctx.scale(1,resizeDiffY/resizeDiffX);
      hctx.translate(-hcanvas.width, -hcanvas.height);//translate back after scaling
          //x pos doesnt really affect scaling so whatever
          hctx.strokeText(
            extraPoints + "x",
            hcanvas.width - skillpointspos - width - 20,
            hcanvas.height - 15.5 - 40
          );
          hctx.fillText(
            extraPoints + "x",
            hcanvas.width - skillpointspos - width - 20,
            hcanvas.height - 15.5 - 40
          );
          if(currentGmSelector.gamemode == "3") {
          hctx.strokeText(
            "x" + extraPoints,
            skillpointspos + width + 20 + 60,
            hcanvas.height - 15.5
          );
          hctx.fillText(
            "x" + extraPoints,
            skillpointspos + width + 20 + 60,
            hcanvas.height - 15.5
          );
          } else {
          hctx.strokeText(
            "x" + extraPoints,
            skillpointspos + width + 20,
            hcanvas.height - 15.5
          );
          hctx.fillText(
            "x" + extraPoints,
            skillpointspos + width + 20,
            hcanvas.height - 15.5
          );     
          }
          hctx.restore();
        }
      }
      hctx.lineJoin = "miter"; //change back

      //draw leaderboard
      hctx.save();
      hctx.translate(hcanvas.width, 0);//top right of screen
      hctx.scale(1,resizeDiffY/resizeDiffX);
      hctx.translate(-hcanvas.width, 0);//translate back after scaling
      var fromTop = 75;
      hctx.fillStyle = "white";
      hctx.strokeStyle = "black";
      hctx.lineWidth = 8;
      hctx.font = "900 30px Roboto";
      hctx.textAlign = "center";
      hctx.miterLimit = 2;//prevent text spikes, alternative to linejoin round
      hctx.strokeText("LEADERBOARD", hcanvas.width - 130, 40);
      hctx.fillText("LEADERBOARD", hcanvas.width - 130, 40);
      hctx.lineWidth = 3;
      //draw leaderboard on home page canvas so that game canvas redraw in main game loop will not cause leaderboard to flash
      var playerWithMostScore = -1;
      let numberOfPlayersOnLB = Object.keys(players).length;
      let maxSpaceAvailable = 240;
      let spaceBetween = 60/numberOfPlayersOnLB;
      let outlineThickness = 5;
      let textoutline = 3;
      let tankWidth = 8;//the width of tank drawn beside leaderboard bar
        if (numberOfPlayersOnLB<=5){
          spaceBetween = 60/4;
          outlineThickness = 7;
          textoutline = 5;
        }
      let maxPlayers = 8;
      for (const id in players) {
        //draw score bar background
        var w = 240;
        var maxw = w - outlineThickness;
        //maxw is for colored bar
        if (numberOfPlayersOnLB>=5){
          var h = maxSpaceAvailable/numberOfPlayersOnLB - spaceBetween;
        }
        else{
          var h = maxSpaceAvailable/5 - spaceBetween;
        }
        tankWidth = h/2 * 0.64;
        //var h = 25;
        var r = h / 2;
        var x = hcanvas.width - 130 - w / 2; //if change this, remember to change the value of this above the code for drawing colored bar
        var actualX = x - 15;//doesnt change, 15 refer to distance of displayed tank from leaderboard
        var y = fromTop - h / 2;
        var actualY = fromTop;//doesnt change
        hctx.fillStyle = "black";
        hctxroundRectangleFill(x,y,r,w,h);

        //draw score bar based on first player on leaderboard, which is always drawn as 200px, IF the player's score is not 0
        //the variable w will be NaN if any of their score is 0, because 0 cannot divide by anything. Note that the code below did not check for the leader being zero if the other player is not zero bcause the leader have a higher or same score than the other players
        x = hcanvas.width - 130 - w / 2 + outlineThickness/2;
        if (playerWithMostScore == -1) {
          //if this is the first player in the loop
          w = maxw;
          playerWithMostScore = players[id].score;
        } else {
          w = (players[id].score / playerWithMostScore) * maxw;
        }
        if (w < 0) {
          //prevent error
          w = 0;
        }
        h -= outlineThickness;
        r = h / 2;
        y = fromTop - h / 2;
        if (r * 2 > w) {
          w = h;
        }
        //draw colored bar
        //hctx.fillStyle = players[id].color;
        //if not developer, color property is team, else if developer, color is color
        let drawncolor = hctx.fillStyle;
        let drawnoutline = hctx.strokeStyle;
        if (players[id].color == "none") {
          if (id==playerstring){
            drawncolor = bodyColors.blue.col;
            drawnoutline = bodyColors.blue.outline;
          }
          else{
            drawncolor = bodyColors.red.col;
            drawnoutline = bodyColors.red.outline;
          }
        } else if (bodyColors.hasOwnProperty(players[id].color)) {
          drawncolor = bodyColors[players[id].color].col;
          drawnoutline = bodyColors[players[id].color].outline;
        }
        else{//a developer
          drawncolor = players[id].color;
          drawnoutline = players[id].color;
        }

        hctx.fillStyle = drawncolor;
        hctxroundRectangleFill(x,y,r,w,h);
        //ABBREVIATE SCORE, e.g. 6000 -> 6k
        //player's score is not abbreviated because need to do calculations using the number, and server might get laggy if it need to abbreviate everyone's score, so abbreviating score is done in client side code
        var newValue = players[id].score;
        if (players[id].score >= 1000) {
          var suffixes = ["", "k", "m", "b", "t"];
          var suffixNum = Math.floor(("" + players[id].score).length / 3);
          var shortValue = "";
          for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat(
              (suffixNum != 0
                ? players[id].score / Math.pow(1000, suffixNum)
                : players[id].score
              ).toPrecision(precision)
            );
            var dotLessShortValue = (shortValue + "").replace(
              /[^a-zA-Z 0-9]+/g,
              ""
            );
            if (dotLessShortValue.length <= 2) {
              break;
            }
          }
          if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
          newValue = shortValue + suffixes[suffixNum];
        }
        //write player name and score
        hctx.fillStyle = "white";
        if (numberOfPlayersOnLB>=5){
          var textSize = 17 + 1* (8 - numberOfPlayersOnLB);
        }
        else{
          var textSize = 17 + 1* (8 - 5);
        }
        hctx.font = "900 "+textSize+"px Roboto";
        hctx.textAlign = "center";
        hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        hctx.lineWidth = textoutline;
        hctx.strokeText(
          players[id].name + " - " + newValue,
          hcanvas.width - 130,
          fromTop + 6
        ); //additional 6 to center word properly
        hctx.fillText(
          players[id].name + " - " + newValue,
          hcanvas.width - 130,
          fromTop + 6
        );
        //draw player's tank
        if (players[id].tank&&players[id].body){
          if (players[id].tank!="0"){
            hctx.lineWidth = 2;
            drawFakePlayer(players[id].tank,actualX,actualY,tankWidth,lbAngle*Math.PI/180,drawncolor,drawnoutline,"weapon")
            drawFakePlayer(players[id].body,actualX,actualY,tankWidth,lbAngle*Math.PI/180,drawncolor,drawnoutline,"body")
          }
        }
        hctx.lineJoin = "miter"; //change it back
        if (numberOfPlayersOnLB>=5){//if 5 or more players on leaerboard, the bars fill up the whole space
          fromTop += (maxSpaceAvailable/numberOfPlayersOnLB);//space between bars changes based on number of players
        }
        else{
          fromTop += (maxSpaceAvailable/5);
        }
        //fromTop += 32.5; //height plus space between bars
      }
        hctx.restore();
        lbAngle+=0.4;//make leaderboard tanks rotate
      }

      if (teleportingTransition == "yes"){//if player is teleporting between servers
        //draw the transition
        if (teleportingcount<1){//transparncy animation
          hctx.globalAlpha = teleportingcount;
        }
        if (
          teleportingcount >= 0 &&
          teleportingcount <= 1.8
        ) {//oval appearing
          hctx.fillStyle = "black";
          hctx.beginPath();
          hctx.ellipse(
            hcanvas.width * (teleportingcount-1.1),
            hcanvas.height / 2,
            hcanvas.width / 1.4,
            hcanvas.height,
            0,
            0,
            Math.PI * 2
          ); //draw oval
          hctx.fill();
        }
        else{//full black screen
          hctx.fillStyle = "black";
          hctx.fillRect(0, 0, hcanvas.width, hcanvas.height);
        }
        hctx.fillStyle = "white";
        hctx.font = "900 90px Roboto";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 4;
        hctx.textAlign = "center";
        hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        if (teleportingLocation=="arena" || teleportingLocation=="2tdm" || teleportingLocation=="4tdm" || teleportingLocation=="editor"){
          if (oldteleportingLocation == "crossroads"){
            hctx.strokeText("Returning from The Crossroads...", hcanvas.width/2, hcanvas.height/2);
            hctx.fillText("Returning from The Crossroads...", hcanvas.width/2, hcanvas.height/2);
          }
          else if (oldteleportingLocation == "cavern"){
            hctx.strokeText("Returning from The Cavern...", hcanvas.width/2, hcanvas.height/2);
            hctx.fillText("Returning from The Cavern...", hcanvas.width/2, hcanvas.height/2);
          }
          else if (oldteleportingLocation == "dune"){
            hctx.strokeText("Returning from The Dunes...", hcanvas.width/2, hcanvas.height/2);
            hctx.fillText("Returning from The Dunes...", hcanvas.width/2, hcanvas.height/2);
          }
          else{
            hctx.strokeText("Returning to the "+teleportingLocation+"...", hcanvas.width/2, hcanvas.height/2);
            hctx.fillText("Returning to the "+teleportingLocation+"...", hcanvas.width/2, hcanvas.height/2);
          }
        }
        else if (teleportingLocation=="sanc"){
          hctx.strokeText("Ascending to The Sanctuary...", hcanvas.width/2, hcanvas.height/2);
          hctx.fillText("Ascending to The Sanctuary...", hcanvas.width/2, hcanvas.height/2);
        }
        else if (teleportingLocation=="dune"){
          hctx.strokeText("Launching to The Dunes...", hcanvas.width/2, hcanvas.height/2);
          hctx.fillText("Launching to The Dunes...", hcanvas.width/2, hcanvas.height/2);
        }
        else if (teleportingLocation=="cr"){
          hctx.strokeText("Descending into The Crossroads...", hcanvas.width/2, hcanvas.height/2);
          hctx.fillText("Descending into The Crossroads...", hcanvas.width/2, hcanvas.height/2);
        }
        else if (teleportingLocation=="cavern"){
          hctx.strokeText("Entering The Cavern...", hcanvas.width/2, hcanvas.height/2);
          hctx.fillText("Entering The Cavern...", hcanvas.width/2, hcanvas.height/2);
        }
        else{
          hctx.strokeText("Launching to " + teleportingLocation, hcanvas.width/2, hcanvas.height/2);
          hctx.fillText("Launching to " + teleportingLocation, hcanvas.width/2, hcanvas.height/2);
        }
        hctx.textAlign = "left";
        hctx.lineJoin = "miter";
        hctx.globalAlpha = 1.0;
        teleportingcount+=0.1;
      }
      else if(teleportingcount>2){//black oval disappear
        if (teleportingcount>=3.3){
          teleportingcount = 0;
        }
        if (
          teleportingcount >= 2.1 &&
          teleportingcount < 3.2
        ) {//oval appearing
          hctx.fillStyle = "black";
          hctx.beginPath();
          hctx.ellipse(
            hcanvas.width * (teleportingcount-1.1),
            hcanvas.height / 2,
            hcanvas.width / 1.5,
            hcanvas.height,
            0,
            0,
            Math.PI * 2
          ); //draw oval
          hctx.fill();
          teleportingcount+=0.1;
        }
      }

      if (showDebug == "yes" && openedUI=="no") {
        //draw debug
        hctx.fillStyle = "white";
        hctx.font = "900 " + 19.5/resizeDiffX + "px Roboto";
        hctx.strokeStyle = "black";
        hctx.lineWidth = 4/resizeDiffX;
        hctx.textAlign = "left";
        hctx.lineJoin = "round"; //prevent spikes above the capital letter "M"
        hctx.save();
        hctx.scale(1,resizeDiffY/resizeDiffX);
        hctx.translate(20,195);
        if (latency < 250) {
          hctx.fillStyle = "white";
        } else if (latency < 350) {
          hctx.fillStyle = "orange";
        } else if (latency < 600) {
          hctx.fillStyle = "red";
        } else {
          hctx.fillStyle = "#800000";
        }
        hctx.strokeText("Ping: " + latency + "ms", 0, 0);
        hctx.fillText("Ping: " + latency + "ms", 0, 0);
        if (fpsvalue > 25) {
          hctx.fillStyle = "white";
        } else if (fpsvalue > 20) {
          hctx.fillStyle = "orange";
        } else {
          hctx.fillStyle = "red";
        }
        hctx.strokeText("FPS: " + fpsvalue, 0, 38/resizeDiffX);
        hctx.fillText("FPS: " + fpsvalue, 0, 38/resizeDiffX);
        if (serverCodeTime < 40) {
          hctx.fillStyle = "white";
        } else if (serverCodeTime < 50) {
          hctx.fillStyle = "orange";
        } else {
          hctx.fillStyle = "red";
        }
        hctx.strokeText("Server Tick Time: " + serverCodeTime + "ms", 0, 76/resizeDiffX);
        hctx.fillText("Server Tick Time: " + serverCodeTime + "ms", 0, 76/resizeDiffX);
        if (duration < 5) {
          hctx.fillStyle = "white";
        } else if (duration < 10) {
          hctx.fillStyle = "orange";
        } else {
          hctx.fillStyle = "red";
        }
        hctx.strokeText("Client Tick Time: " + duration + "ms", 0, 114/resizeDiffX);
        hctx.fillText("Client Tick Time: " + duration + "ms", 0, 114/resizeDiffX);
        hctx.fillStyle = "white";
        hctx.strokeText("Player Count: " + playerCount, 0, 152/resizeDiffX);
        hctx.fillText("Player Count: " + playerCount, 0, 152/resizeDiffX);
        hctx.strokeText("Global Player Count: " + globalPlayerCount, 0, 190/resizeDiffX);
        hctx.fillText("Global Player Count: " + globalPlayerCount, 0, 190/resizeDiffX);
        hctx.strokeText("Dimension: " + gamelocation, 0, 228/resizeDiffX);
        hctx.fillText("Dimension: " + gamelocation, 0, 228/resizeDiffX);
        var gamemodeservers = ["Virginia #1"];
        if(currentGmSelector.gamemode == 3) {
          gamemodeservers[gamemodeservers.length] = "Virginia #2";
        }
        var region;
        if(gamemodeservers.length <= 1) {
          region = gamemodeservers[0];
        } else {
          region = gamemodeservers[currentGamemodeRegion];
        }
        hctx.strokeText("Region: " + region, 0, 266/resizeDiffX);
        hctx.fillText("Region: " + region, 0, 266/resizeDiffX);


        //shownBandwidth
        if (shownBandwidth < 15000) {
          //15k
          hctx.fillStyle = "white";
        } else if (shownBandwidth < 25000) {
          //25k
          hctx.fillStyle = "orange";
        } else if (shownBandwidth < 50000) {
          //50k
          hctx.fillStyle = "red";
        } else {
          hctx.fillStyle = "#800000";
        }
        var newbandwidth = shownBandwidth / 1000; //__k bytes
        newbandwidth = Math.round(newbandwidth * 100) / 100;//2 decimal place
        hctx.strokeText("Bandwidth: " + newbandwidth + "kb/s", 0, 304/resizeDiffX);
        hctx.fillText("Bandwidth: " + newbandwidth + "kb/s", 0, 304/resizeDiffX);
        hctx.fillStyle = "white";
        var numberOfObjectsDrawn = 0;
        for (const type in objects) {
          for (const item in objects[type]) {
            numberOfObjectsDrawn++;
          }
        }
        hctx.strokeText("Drawn Entities: " + numberOfObjectsDrawn, 0, 342/resizeDiffX);
        hctx.fillText("Drawn Entities: " + numberOfObjectsDrawn, 0, 342/resizeDiffX);
        hctx.restore();
        hctx.lineJoin = "miter"; //change it back
      }
    }
  //}, 30); //check every 30ms //dont use setinterval anymore


      duration = Date.now() - starting; //client code runtime
  }

requestInterval(screenDrawLoop,10);//number refers to delay between redraws, e.g. 16 = 60fps

  //auto fill in previous name into text input field
  if (localStorage.getItem("prevname")) {
    const kittys = localStorage.getItem("prevname");
    nameInput.value = kittys;
  }

  //sandbox
  //listen for enter presses to change tank properties
  var inputfield0 = document.getElementById("tank-name");
  var inputfield1 = document.getElementById("tank-rad");
  var inputfield2 = document.getElementById("tank-xp");
  var inputfield3 = document.getElementById("tank-size");
  var inputfield4 = document.getElementById("weapon-name");
  var inputfield5 = document.getElementById("weapon-fov");
  var inputfield6 = document.getElementById("body-name");
  var inputfield7 = document.getElementById("body-sides");
  var inputfield8 = document.getElementById("body-health");
  var inputfield9 = document.getElementById("body-regen");
  var inputfield10 = document.getElementById("body-regen-time");
  var inputfield11 = document.getElementById("body-damage");
  var inputfield12 = document.getElementById("body-speed");
  var inputfield13 = document.getElementById("team-select");
  var inputfield15 = document.getElementById("turret-base");
  function sendSanboxValue(value,id){
    var packet = JSON.stringify(["sandbox", value, id]);
    socket.send(packet)
  }
  function sendBarrelEdit(value,type,id){
    if (value === undefined || value === null || (typeof value === "number" && isNaN(value)) || value == "" || value == "NaN" || value == "undefined" || value == "null"){
      createNotif("This property value is not allowed: "+value,"darkorange",3000)
    }
    else{
      var packet = JSON.stringify(["BarEdit", value, type, id]);
      socket.send(packet)
    }
  }
  function sendAssetEdit(value,type,id){
    if (value === undefined || value === null || (typeof value === "number" && isNaN(value)) || value == "" || value == "NaN" || value == "undefined" || value == "null"){
      createNotif("This property value is not allowed: "+value,"darkorange",3000)
    }
    else{
      var packet = JSON.stringify(["AssEdit", value, type, id]);
      socket.send(packet)
    }
  }
  function sendBbEdit(value,type,id){
    if (value === undefined || value === null || (typeof value === "number" && isNaN(value)) || value == "" || value == "NaN" || value == "undefined" || value == "null"){
      createNotif("This property value is not allowed: "+value,"darkorange",3000)
    }
    else{
      var packet = JSON.stringify(["BbEdit", value, type, id]);
      socket.send(packet)
    }
  }
  inputfield0.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {//pressed enter inside input field
        sendSanboxValue(inputfield0.value,0)
      }
  });
  $( "#"+inputfield0.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield0.value,0)
  });
  inputfield1.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield1.value,1)
      }
  });
$( "#"+inputfield1.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield1.value,1)
  });
  inputfield2.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield2.value,2)
      }
  });
$( "#"+inputfield2.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield2.value,2)
  });
  inputfield3.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          if(inputfield3.value >= 0) {
          sendSanboxValue(inputfield3.value,3)
          }
      }
  });
$( "#"+inputfield3.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield3.value,3)
  });
  inputfield4.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield4.value,4)
      }
  });
$( "#"+inputfield4.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield4.value,4)
  });
  inputfield5.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield5.value,5)
      }
  });
$( "#"+inputfield5.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield5.value,5)
  });
  inputfield6.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield6.value,6)
      }
  });
$( "#"+inputfield6.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield6.value,6)
  });
  inputfield7.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield7.value,7)
      }
  });
$( "#"+inputfield7.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield7.value,7)
  });
  inputfield8.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield8.value,8)
      }
  });
$( "#"+inputfield8.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield8.value,8)
  });
  inputfield9.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield9.value,9)
      }
  });
$( "#"+inputfield9.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield9.value,9)
  });
  inputfield10.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield10.value,10)
      }
  });
$( "#"+inputfield10.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield10.value,10)
  });
  inputfield11.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield11.value,11)
      }
  });
$( "#"+inputfield11.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield11.value,11)
  });
  inputfield12.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield12.value,12)
      }
  });
$( "#"+inputfield12.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield12.value,12)
  });
   inputfield13.onchange = (event) => {//dropdown select
     sendSanboxValue(event.target.value,13)
   }
  inputfield15.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
          sendSanboxValue(inputfield15.value,15)
      }
  });
$( "#"+inputfield15.id ).blur(function() {//clicked outside the input field after input field was selected
    sendSanboxValue(inputfield15.value,15)
  });
   //inside barrel editor
  $('#barrelUI').on('keyup', 'input', function(event) {
    if (event.key === "Enter") {//someone press enter on an input field in barrel editor
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendBarrelEdit(value,inputType,barrelID)
    }
  });
$('#barrelUI').on('focusout', 'input', function(event) {
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendBarrelEdit(value,inputType,barrelID)
  });
  $('#barrelUI').on('change', 'select', function(event) {//dropdown select for choosing barrel type
        var barrelID = $(event.target).parent().attr('id');
        var inputType = $(event.target).attr('name');//differentiate between different dropdowns, but not neccessary for now cuz there's only one dropdown
        var selection = event.target.value;
    sendBarrelEdit(selection,inputType,barrelID)
    if (selection =="drone"){//changed barrel type to drone
      //need to add one more
      var htmlObject = document.createElement('div');
      var divid = 'dc'+barrelID;
      var divid2 = 'dc2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="3"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Drone Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      //remove minion stuff
      try{
      document.getElementById("mc"+barrelID).remove();
      document.getElementById("mc2"+barrelID).remove();
        document.getElementById("md"+barrelID).remove();
      document.getElementById("md2"+barrelID).remove();
        document.getElementById("minion"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("ma"+barrelID).remove();
      document.getElementById("ma2"+barrelID).remove();
      document.getElementById("mha"+barrelID).remove();
      document.getElementById("mha2"+barrelID).remove();
      document.getElementById("mine"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection =="trap"){//changed barrel type to trap
      //need to add one more
      var htmlObject = document.createElement('div');
      var divid = 'tr'+barrelID;
      var divid2 = 'tr2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove minion stuff
      try{
      document.getElementById("mc"+barrelID).remove();
      document.getElementById("mc2"+barrelID).remove();
        document.getElementById("md"+barrelID).remove();
      document.getElementById("md2"+barrelID).remove();
        document.getElementById("minion"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("ma"+barrelID).remove();
      document.getElementById("ma2"+barrelID).remove();
      document.getElementById("mha"+barrelID).remove();
      document.getElementById("mha2"+barrelID).remove();
      document.getElementById("mine"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection == "bullet"){
      var htmlObject = document.createElement('div');
      var divid = 'bk'+barrelID;
      var divid2 = 'bk2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'bg'+barrelID;
      var divid2 = 'bg2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff when chnge barrel to bllet
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      //remove minion stuff
      try{
      document.getElementById("mc"+barrelID).remove();
      document.getElementById("mc2"+barrelID).remove();
        document.getElementById("md"+barrelID).remove();
      document.getElementById("md2"+barrelID).remove();
        document.getElementById("minion"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("ma"+barrelID).remove();
      document.getElementById("ma2"+barrelID).remove();
      document.getElementById("mha"+barrelID).remove();
      document.getElementById("mha2"+barrelID).remove();
      document.getElementById("mine"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection == "minion"){
      $('*[placeholder="Timer"]').attr("value", "1000");
      var htmlObject = document.createElement('div');
      var divid = 'mc'+barrelID;
      var divid2 = 'mc2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="5"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Minion Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'md'+barrelID;
      var divid2 = 'md2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="minDist" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="200"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Minimum Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
       var htmlObject = document.createElement('div');
      var divid = 'minion'+barrelID;
      
      //MINION EDITING UI
      
      var textnode = '<div id='+divid+'>'+
      '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Minion Barrel Positioning</div>'+
  '<input autocomplete="off" placeholder="Minion Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="15">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Minion Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="21">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Minion Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Angle (WIP)</div>'+
  '<input autocomplete="off" placeholder="Minion x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="Minion y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Minion Barrel Attributes</div>'+
  '<input autocomplete="off" placeholder="Minion Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Minion Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Minion Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.1">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Minion Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="2">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Minion Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="30">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Minion Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Minion Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount (WIP)</div>'+
  '<input autocomplete="off" placeholder="Minion Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
        '</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("ma"+barrelID).remove();
      document.getElementById("ma2"+barrelID).remove();
      document.getElementById("mha"+barrelID).remove();
      document.getElementById("mha2"+barrelID).remove();
      document.getElementById("mine"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection == "mine"){
      var htmlObject = document.createElement('div');
      var divid = 'tr'+barrelID;
      var divid2 = 'tr2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ma'+barrelID;
      var divid2 = 'ma2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="AIdetectRange" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="450"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Detection Range</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'mha'+barrelID;
      var divid2 = 'mha2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="haveAI" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="yes"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Mine AI (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
       var htmlObject = document.createElement('div');
      var divid = 'mine'+barrelID;
      
      //MINE EDITING UI
      
      var textnode = '<div id='+divid+'>'+
  '<select name="Mine type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>' +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Mine Barrel Type (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Mine Barrel Positioning</div>'+
  '<input autocomplete="off" placeholder="Mine Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Mine Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="12.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Mine Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Angle (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Mine Barrel Attributes</div>'+
  '<input autocomplete="off" placeholder="Mine Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="15">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Mine Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Mine Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.25">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Mine Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="2">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Mine Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="30">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Mine Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Mine Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
        '</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove minion stuff
      try{
      document.getElementById("mc"+barrelID).remove();
      document.getElementById("mc2"+barrelID).remove();
        document.getElementById("md"+barrelID).remove();
      document.getElementById("md2"+barrelID).remove();
        document.getElementById("minion"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
  })

$('#assetUI').on('keyup', 'input', function(event) {
    if (event.key === "Enter") {//someone press enter on an input field in barrel editor
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendAssetEdit(value,inputType,barrelID)
    }
  });
$('#assetUI').on('focusout', 'input', function(event) {//focusout is blur but bubbles. Doing this applies the blur event listener to all children. (blur triggered when click outside input field)
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendAssetEdit(value,inputType,barrelID)
  });
  $('#assetUI').on('change', 'select', function(event) {//dropdown select for choosing barrel type
        var barrelID = $(event.target).parent().attr('id');
        var inputType = $(event.target).attr('name');//differentiate between different dropdowns, but not neccessary for now cuz there's only one dropdown
        var selection = event.target.value;
    sendAssetEdit(selection,inputType,barrelID)
  })

$('#bbUI').on('keyup', 'input', function(event) {
    if (event.key === "Enter") {//someone press enter on an input field in barrel editor
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendBbEdit(value,inputType,barrelID)
    }
  });
$('#bbUI').on('focusout', 'input', function(event) {
      var barrelID = $(event.target).parent().attr('id');
      var inputType = $(event.target).attr('placeholder');
      var value = event.target.value;
      sendBbEdit(value,inputType,barrelID)
  });
  $('#bbUI').on('change', 'select', function(event) {//dropdown select for choosing barrel type
        var barrelID = $(event.target).parent().attr('id');
        var inputType = $(event.target).attr('name');//differentiate between different dropdowns, but not neccessary for now cuz there's only one dropdown
        var selection = event.target.value;
    sendBbEdit(selection,inputType,barrelID)
    if (inputType == "auratype"){//change aura type
      if (selection == "damage"){//change the aura color that is shown in the input field
        $('*[placeholder="auraColor"]').attr("value", "rgba(255,0,0,.15)");
        $('*[placeholder="auraOutline"]').attr("value", "rgba(255,0,0,.15)");
        try{
        document.getElementById("hp"+barrelID).remove();
        document.getElementById("hp2"+barrelID).remove();
        }
        catch(err){}
      }
      else if (selection == "freeze"){
        $('*[placeholder="auraColor"]').attr("value", "rgba(173,216,230,.5)");
        $('*[placeholder="auraOutline"]').attr("value", "rgba(150, 208, 227)");
        try{
        document.getElementById("hp"+barrelID).remove();
        document.getElementById("hp2"+barrelID).remove();
        }
        catch(err){}
      }
      else if (selection == "attraction"){
        $('*[placeholder="auraColor"]').attr("value", "rgba(87, 85, 163, .3)");
        $('*[placeholder="auraOutline"]').attr("value", "rgba(75, 73, 143)");
        try{
        document.getElementById("hp"+barrelID).remove();
        document.getElementById("hp2"+barrelID).remove();
        }
        catch(err){}
      }
      else if (selection == "heal"){
        $('*[placeholder="auraColor"]').attr("value", "rgba(56,183,100,.15)");
        $('*[placeholder="auraOutline"]').attr("value", "rgba(26,153,70,.15)");
        var htmlObject = document.createElement('div');
        var divid = 'hp'+barrelID;
        var divid2 = 'hp2'+barrelID;
        var textnode = '<input id='+divid+' autocomplete="off" placeholder="healPower" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.6"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Heal Power</div>';
        htmlObject.innerHTML = textnode;
        htmlObject.setAttribute("id", barrelID);
        document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      }
    }
    if (selection =="drone"){//changed barrel type to drone
      //need to add one more
      var htmlObject = document.createElement('div');
      var divid = 'dc'+barrelID;
      var divid2 = 'dc2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="3"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Drone Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      //remove aura stuff
      try{
      document.getElementById("ao"+barrelID).remove();
      document.getElementById("ao2"+barrelID).remove();
        document.getElementById("ac"+barrelID).remove();
      document.getElementById("ac2"+barrelID).remove();
        document.getElementById("as"+barrelID).remove();
      document.getElementById("as2"+barrelID).remove();
        document.getElementById("at"+barrelID).remove();
      document.getElementById("at2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("hp"+barrelID).remove();
      document.getElementById("hp2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection =="trap"){//changed barrel type to trap
      //need to add one more
      var htmlObject = document.createElement('div');
      var divid = 'tr'+barrelID;
      var divid2 = 'tr2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove aura stuff
      try{
      document.getElementById("ao"+barrelID).remove();
      document.getElementById("ao2"+barrelID).remove();
        document.getElementById("ac"+barrelID).remove();
      document.getElementById("ac2"+barrelID).remove();
        document.getElementById("as"+barrelID).remove();
      document.getElementById("as2"+barrelID).remove();
        document.getElementById("at"+barrelID).remove();
      document.getElementById("at2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("hp"+barrelID).remove();
      document.getElementById("hp2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection == "bullet"){
      var htmlObject = document.createElement('div');
      var divid = 'bk'+barrelID;
      var divid2 = 'bk2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'bg'+barrelID;
      var divid2 = 'bg2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff when chnge barrel to bllet
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      //remove aura stuff
      try{
      document.getElementById("ao"+barrelID).remove();
      document.getElementById("ao2"+barrelID).remove();
        document.getElementById("ac"+barrelID).remove();
      document.getElementById("ac2"+barrelID).remove();
        document.getElementById("as"+barrelID).remove();
      document.getElementById("as2"+barrelID).remove();
        document.getElementById("at"+barrelID).remove();
      document.getElementById("at2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("hp"+barrelID).remove();
      document.getElementById("hp2"+barrelID).remove();
      }
      catch(err){}
    }
    else if (selection == "aura"){
      //changing body barrel to aura will change several barrel properties, so need to change them
      //get the inputs using their placeholders
      $('*[placeholder="Reload"]').attr("value", "1");
      $('*[placeholder="Health"]').attr("value", "1000");
      $('*[placeholder="Damage"]').attr("value", "0.2");
      $('*[placeholder="Penetration"]').attr("value", "0");
      $('*[placeholder="Timer"]').attr("value", "3");
      $('*[placeholder="Speed"]').attr("value", "0");
      var htmlObject = document.createElement('div');
      var divid = 'as'+barrelID;
      var divid2 = 'as2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraSize" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="4"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura size</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ac'+barrelID;
      var divid2 = 'ac2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraColor" class="sandboxInput" style="clear:both;position:relative;float:left;" value="rgba(255,0,0,.15)"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura color</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ao'+barrelID;
      var divid2 = 'ao2'+barrelID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraOutline" class="sandboxInput" style="clear:both;position:relative;float:left;" value="rgba(255,0,0,.15)"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura outline</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'at'+barrelID;
      var divid2 = 'at2'+barrelID;
      var textnode = '<select id='+divid+' name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", barrelID);
      document.getElementById("btn"+barrelID).before(htmlObject);//add before the delete barrel button
      //remove drone stuff when chnge barrel to bllet
      try{
      document.getElementById("dc"+barrelID).remove();
      document.getElementById("dc2"+barrelID).remove();
      }
      catch(err){}
      //remove trap stuff
      try{
      document.getElementById("tr"+barrelID).remove();
      document.getElementById("tr2"+barrelID).remove();
      }
      catch(err){}
      try{
      document.getElementById("bk"+barrelID).remove();
      document.getElementById("bk2"+barrelID).remove();
      document.getElementById("bg"+barrelID).remove();
      document.getElementById("bg2"+barrelID).remove();
      }
      catch(err){}
    }
  })
//});
//weapon upgrade tree
var showUpgradeTree = "no";
var upgradetreepos = -750; //current position of upgrade tree
var upgradetreestart = -750; //start position
var upgradetreeend = 165; //end position
//body upgrade tree
var showBodyUpgradeTree = "no";
var bupgradetreepos = -750; //current position of upgrade tree
var bupgradetreestart = -750; //start position
var bupgradetreeend = 165; //end position

var skillpointspos = -370; //current position of skill points bar
var skillpointsstart = -370; //start position
var skillpointsend = 155; //end position
//skillpoints

var closepopup = document.getElementById("closePopup");
var changelogpopup = document.getElementById("changelogPopup");
var changelogbutton = document.getElementById("changelog");
var settingspopup = document.getElementById("settingsPopup");
var settingsbutton = document.getElementById("settings");
var closesettingspopup = document.getElementById("closeSettingsPopup");
var wrlbpopup = document.getElementById("wrlbPopup");
var wrlbbutton = document.getElementById("wrlb");
var closewrlbpopup = document.getElementById("closewrlbPopup");
var howToPlaybutton = document.getElementById("howToPlay");
var setclosepopup = document.getElementById("closeAccountsPopup");
var accountspopup = document.getElementById("accountsPopup");
var accountsbutton = document.getElementById("accounts");
var discordbutton = document.getElementById("discord");
var redditbutton = document.getElementById("reddit");
var tokeninput = document.getElementById("devtoken");
//changelog close
closepopup.onclick = function () {
  changelogpopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "none";
  document.getElementById("screenLighten").style.display = "block";
  setTimeout(function () {
    document.getElementById("screenLighten").style.display = "none";
  }, 500); //after animation finish, make buttons below darkness clickable
};
//changelog open
changelogbutton.onclick = function () {
  changelogpopup.style.display = "block";
  accountspopup.style.display = "none";
  settingspopup.style.display = "none";
  wrlbpopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "block";
  document.getElementById("screenLighten").style.display = "none";
};
//accounts close
setclosepopup.onclick = function () {
  accountspopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "none";
  document.getElementById("screenLighten").style.display = "block";
  setTimeout(function () {
    document.getElementById("screenLighten").style.display = "none";
  }, 500); //after animation finish, make buttons below darkness clickable
};
//accounts open
accountsbutton.onclick = function () {
  accountspopup.style.display = "block";
  changelogpopup.style.display = "none";
  settingspopup.style.display = "none";
  wrlbpopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "block";
  document.getElementById("screenLighten").style.display = "none";
};
//settings close
closesettingspopup.onclick = function () {
  settingspopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "none";
  document.getElementById("screenLighten").style.display = "block";
  setTimeout(function () {
    document.getElementById("screenLighten").style.display = "none";
  }, 500); //after animation finish, make buttons below darkness clickable
  updateSettings()
};
//settings open
settingsbutton.onclick = function () {
  settingspopup.style.display = "block";
  accountspopup.style.display = "none";
  changelogpopup.style.display = "none";
  wrlbpopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "block";
  document.getElementById("screenLighten").style.display = "none";
};
//wr close
closewrlbpopup.onclick = function () {
  wrlbpopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "none";
  document.getElementById("screenLighten").style.display = "block";
  setTimeout(function () {
    document.getElementById("screenLighten").style.display = "none";
  }, 500); //after animation finish, make buttons below darkness clickable
};
//wr open
wrlbbutton.onclick = function () {
  wrlbpopup.style.display = "block";
  accountspopup.style.display = "none";
  changelogpopup.style.display = "none";
  settingspopup.style.display = "none";
  document.getElementById("screenDarken").style.display = "block";
  document.getElementById("screenLighten").style.display = "none";
};
//change radiant aura size when move slider in settings
var slider = document.getElementById("radiantSizeRange");
var output = document.getElementById("sizevalue");
output.innerHTML = slider.value;

slider.oninput = function () {
  output.innerHTML = this.value;
};

//for accounts
var accountUsername = document.getElementById("accountUsername");
var accountPassword = document.getElementById("accountPassword");
var accountDesc = document.getElementById("accountDesc");
var logInButton = document.getElementById("logInButton");
var signUp = document.getElementById("signUp");
var logIn = document.getElementById("logIn");
var accountWords = document.getElementById("accountText");
function accountsignup() {
  //for bth sign up and log in
  accountUsername.style.display = "block";
  accountPassword.style.display = "block";
  accountDesc.style.display = "block";
  logInButton.style.display = "block";
  signUp.style.display = "none";
  logIn.style.display = "none";
  if (acctype == "login") {
    if (
      localStorage.getItem("rocketerAccountp") &&
      localStorage.getItem("rocketerAccountu")
    ) {
      const cats = localStorage.getItem("rocketerAccountp");
      const dogs = localStorage.getItem("rocketerAccountu");
      accountUsername.value = dogs;
      accountPassword.value = cats;
    }
  }
}
function providedUsername() {
  var usernameGiven = document.getElementById("accountUsername").value;
  var passwordGiven = document.getElementById("accountPassword").value;
  var descGiven = document.getElementById("accountDesc").value;
  //restrictions
  //if change, remember to change in server code
  if (usernameGiven.length > 15) {
    accountWords.innerHTML = "Username must be less than 15 characters.";
  } else if (passwordGiven.length > 15 || passwordGiven.length < 5) {
    accountWords.innerHTML =
      "Password must be between 5 and 15 characters.";
  } else if (descGiven.length > 50) {
    accountWords.innerHTML =
      "Description must be less than 50 characters.";
  } else {
    accountUsername.style.display = "none";
    accountPassword.style.display = "none";
    accountDesc.style.display = "none";
    logInButton.style.display = "none";
    accountWords.innerHTML = "Waiting for server's reply...";
    canLogIn = "yes"; //cannot send to server here because this part of the code cannot access socket, and the pasrt of the code accessing socket cant access functions
    accusername = usernameGiven;
    accpassword = passwordGiven;
    accdesc = descGiven;
  }
}

//update fps
let fpsvalue = 0;//the value shown
let fpsvaluenow = 0;//changes
setInterval(function () {fpsvalue = fpsvaluenow;fpsvaluenow = 0;}, 1000);//update fps every 1 second

//tank editor
//allowing to swap the object
function showHideTankObject(section, id) {
document.querySelector(`#${section}UI > div > #${id}`).classList.toggle("tankObjectHide");
  
  if (document.getElementById(id).style.width != "auto"){
    console.log(document.getElementById(id).style.width)
    document.getElementById(id).style.width = "auto";
    document.getElementById(id).style.padding = "1vw 2vw";
    document.getElementById(id).firstChild.style.fontSize = "1.5vw";
    console.log(document.getElementById(id).firstChild.innerHTML)
    document.getElementById(id).firstChild.innerHTML = document.getElementById(id).firstChild.innerHTML.slice(0, -1) + '▴'; //change the arrow
  }
  else{
    document.getElementById(id).style.width = "30%";
    document.getElementById(id).style.padding = "0.5vw 1vw";
    document.getElementById(id).firstChild.style.fontSize = "1vw";
    document.getElementById(id).firstChild.innerHTML = document.getElementById(id).firstChild.innerHTML.slice(0, -1) + '▾'; //change the arrow
  }
}
//adding a barrel (add a div to the editor)
function addBarrelDiv(first) {
  var htmlObject = document.createElement('div');
  if (first!="yes"){
    var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
    //var specialID  = Math.random();
  }
  else{//this is the first barrel, which is always barrelOne on the server
    var specialID  = "barrelOne";
  }
  var buttonID = 'btn'+specialID; //note: use 'clear:both;' inside style instead of <br> (doesnt work for relative positioning)
  //overflow auto below is to make div take up space of nested items (s that background-color will work)
  var textnode = '<div id=' + specialID + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">' +
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;width:calc(100% - 1vw);cursor: pointer;" onclick="showHideTankObject(\'barrel\', \'' + specialID + '\')">Barrel '+barrelnumberid+' ▾</div>' +
  '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>' +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Barrel Type</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  '<input autocomplete="off" placeholder="Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="25">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="45">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="2">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="50">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="12">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="1">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount</div>'+
  '<input autocomplete="off" placeholder="Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delbar(this)>Delete Barrel</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicatebar(this)>Duplicate Barrel</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("barrelUI").appendChild(htmlObject);
  document.getElementById("barrels").innerHTML = "Barrels (" + $("#barrelUI").children().length + ")";//update barrel count on button
  barrelnumberid++;
  
  var htmlObject = document.createElement('div');
      var divid = 'bk'+specialID;
      var divid2 = 'bk2'+specialID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", specialID);
      document.getElementById("btn"+specialID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'bg'+specialID;
      var divid2 = 'bg2'+specialID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", specialID);
      document.getElementById("btn"+specialID).before(htmlObject);//add before the delete barrel button
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["barrel",specialID]);
    socket.send(packet)
  }
}

function addAssetDiv() {
  var htmlObject = document.createElement('div');
  var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
  var buttonID = 'btn'+specialID;
  
  var textnode = '<div id=' + specialID + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">'+
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;cursor: pointer;" onclick="showHideTankObject(\'asset\', \'' + specialID + '\')">Asset '+assetnumberid+' ▾</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  '<select name="position" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="under">Under tank</option><option value="above">Above tank</option></select>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Position</div>'+
  '<input autocomplete="off" placeholder="Relative size" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="1.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Relative Size</div>'+
  '<input autocomplete="off" placeholder="Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Asset sides" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Sides</div>'+
  '<input autocomplete="off" placeholder="Asset color" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="#5F676C">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Color</div>'+
  '<input autocomplete="off" placeholder="Asset outline" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="#41494E">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Outline</div>'+
  '<input autocomplete="off" placeholder="Outline width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Outline width</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delass(this)>Delete Asset</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicateass(this)>Duplicate Asset</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("assetUI").appendChild(htmlObject);
  document.getElementById("assets").innerHTML = "Assets (" + $("#assetUI").children().length + ")";//update barrel count on button
  assetnumberid++;
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["asset",specialID]);
    socket.send(packet)
  }
}
function addBBDiv() {
  var htmlObject = document.createElement('div');
  var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
  var buttonID = 'btn'+specialID;
  var textnode = '<div id=' + specialID + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">' +
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;cursor: pointer;" onclick="showHideTankObject(\'bb\', \'' + specialID + '\')">Gadget '+gadgetnumberid+' ▾</div>' +
  '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>' +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Barrel Type</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  '<input autocomplete="off" placeholder="Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="25">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="45">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="20">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="10">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0.5">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="2">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="50">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="12">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="1">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount</div>'+
  '<input autocomplete="off" placeholder="Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delbb(this)>Delete Gadget</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicatebb(this)>Duplicate Gadget</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("bbUI").appendChild(htmlObject);
  document.getElementById("turrets").innerHTML = "Gadgets (" + $("#bbUI").children().length + ")";//update barrel count on button
  document.getElementById('turret-base').value = 0.7;//update the turret base size
  gadgetnumberid++;
  
  var htmlObject = document.createElement('div');
      var divid = 'bk'+specialID;
      var divid2 = 'bk2'+specialID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", specialID);
      document.getElementById("btn"+specialID).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'bg'+specialID;
      var divid2 = 'bg2'+specialID;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="no"><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", specialID);
      document.getElementById("btn"+specialID).before(htmlObject);//add before the delete barrel button
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["bodybarrel",specialID]);
    socket.send(packet)
  }
}

//customized adding barrel
//use the below 3 functions only for importing/upgrading tank
//instead of adding default UI, it adds UI based on current properties
function addCustomBarrelDiv(id,barrel) {
  var htmlObject = document.createElement('div');
  let type = barrel.barrelType;
  let barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  //add "selected" inside the option which is the current barrel type
  if (type == "bullet"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet" selected>Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "drone"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone" selected>Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "trap"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap" selected>Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "mine"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine" selected>Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "minion"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion" selected>Spawner</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  var buttonID = 'btn'+id; //note: use 'clear:both;' inside style instead of <br> (doesnt work for relative positioning)
  //overflow auto below is to make div take up space of nested items (s that background-color will work)
  var textnode = '<div id=' + id + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">' +
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;cursor: pointer;" onclick="showHideTankObject(\'barrel\', \'' + id + '\')">Barrel '+barrelnumberid+' ▾</div>' +
  barrelTypeSelect +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Barrel Type</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  '<input autocomplete="off" placeholder="Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.barrelWidth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.barrelHeight+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.additionalAngle+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.x+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.reloadRecover+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletHealth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletDamage+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletPenetration+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletTimer+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletSpeed+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.recoil+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount</div>'+
  '<input autocomplete="off" placeholder="Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.reload+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delbar(this)>Delete Barrel</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicatebar(this)>Duplicate Barrel</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("barrelUI").appendChild(htmlObject);
  document.getElementById("barrels").innerHTML = "Barrels (" + $("#barrelUI").children().length + ")";//update barrel count on button
  barrelnumberid++;
  if (type == "drone"){
    var htmlObject = document.createElement('div');
      var divid = 'dc'+id;
      var divid2 = 'dc2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;" value='+barrel.droneLimit+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Drone Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "trap"){
    var htmlObject = document.createElement('div');
      var divid = 'tr'+id;
      var divid2 = 'tr2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;" value='+barrel.trapDistBeforeStop+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "minion"){
    var htmlObject = document.createElement('div');
      var divid = 'mc'+id;
      var divid2 = 'mc2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.droneLimit+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Minion Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'md'+id;
      var divid2 = 'md2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="minDist" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.minDist+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Minimum Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
    let minionbar = barrel.barrels[Object.keys(barrel.barrels)[0]];//get first property of barrels (assuming only one minion barrel)
       var htmlObject = document.createElement('div');
      var divid = 'minion'+id;
      
      //MINION EDITING UI
      
      var textnode = '<div id='+divid+'>'+
      '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Minion Barrel Positioning</div>'+
  '<input autocomplete="off" placeholder="Minion Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.barrelWidth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Minion Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.barrelHeight+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Minion Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.additionalAngle+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Angle (WIP)</div>'+
  '<input autocomplete="off" placeholder="Minion x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.x+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="Minion y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Minion Barrel Attributes</div>'+
  '<input autocomplete="off" placeholder="Minion Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.reloadRecover+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Minion Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletHealth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Minion Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletDamage+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Minion Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletPenetration+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Minion Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletTimer+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Minion Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletSpeed+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Minion Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.recoil+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount (WIP)</div>'+
  '<input autocomplete="off" placeholder="Minion Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.reload+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
        '</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "mine"){
    var htmlObject = document.createElement('div');
      var divid = 'tr'+id;
      var divid2 = 'tr2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.trapDistBeforeStop+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ma'+id;
      var divid2 = 'ma2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="AIdetectRange" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.AIdetectRange+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Detection Range</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
    let minionbar = barrel.barrels[Object.keys(barrel.barrels)[0]];//get first property of barrels (assuming only one minion barrel)
       var htmlObject = document.createElement('div');
      var divid = 'mine'+id;
      
      //MINE EDITING UI
      
      var textnode = '<div id='+divid+'>'+
  '<select name="Mine type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines</option> <option value="minion">Spawner</option><option value="nothing">Nothing (WIP)</option></select>' +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Mine Barrel Type (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Mine Barrel Positioning</div>'+
  '<input autocomplete="off" placeholder="Mine Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.barrelWidth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Mine Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.barrelHeight+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Mine Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.additionalAngle+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Angle (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.x+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Mine Barrel Attributes</div>'+
  '<input autocomplete="off" placeholder="Mine Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.reloadRecover+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Mine Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletHealth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Mine Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletDamage+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Mine Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletPenetration+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Mine Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletTimer+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Mine Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.bulletSpeed+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Mine Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.recoil+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount (WIP)</div>'+
  '<input autocomplete="off" placeholder="Mine Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+minionbar.reload+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
        '</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "bullet"){
    let value = "no";
    if (barrel.knockback == "yes"){
      value = "yes";
    }
  var htmlObject = document.createElement('div');
      var divid = 'bk'+id;
      var divid2 = 'bk2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+value+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
    value = "no";
    if (barrel.growth == "yes"){
      value = "yes";
    }
      var htmlObject = document.createElement('div');
      var divid = 'bg'+id;
      var divid2 = 'bg2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+value+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
}

function addCustomGadgetDiv(id,barrel) {
  var htmlObject = document.createElement('div');
  let type = barrel.barrelType;
  let barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  //add "selected" inside the option which is the current barrel type
  if (type == "bullet"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "drone"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone" selected>Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "trap"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap" selected>Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "mine"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine" selected>Mines (WIP)</option><option value="aura">Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "minion"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura">Aura</option><option value="minion" selected>Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  else if (type == "aura"){
    barrelTypeSelect = '<select name="type" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="bullet">Bullet</option><option value="drone">Drone</option><option value="trap">Trap</option><option value="mine">Mines (WIP)</option><option value="aura" selected>Aura</option><option value="minion">Spawner (WIP)</option><option value="nothing">Nothing (WIP)</option></select>';
  }
  var buttonID = 'btn'+id; //note: use 'clear:both;' inside style instead of <br> (doesnt work for relative positioning)
  //overflow auto below is to make div take up space of nested items (s that background-color will work)
  var textnode = '<div id=' + id + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">' +
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;cursor: pointer;" onclick="showHideTankObject(\'bb\', \'' + id + '\')">Gadget '+gadgetnumberid+' ▾</div>' +
  barrelTypeSelect +
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;"> Barrel Type</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  '<input autocomplete="off" placeholder="Barrel Width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.barrelWidth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Width</div>'+
  '<input autocomplete="off" placeholder="Barrel Height" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.barrelHeight+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Length</div>'+
  '<input autocomplete="off" placeholder="Additional Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.additionalAngle+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.x+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value="0">'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset (WIP)</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Reload" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.reloadRecover+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Shoot Interval</div>'+
  '<input autocomplete="off" placeholder="Health" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletHealth+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Health</div>'+
  '<input autocomplete="off" placeholder="Damage" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletDamage+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Damage</div>'+
  '<input autocomplete="off" placeholder="Penetration" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletPenetration+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Penetration</div>'+
  '<input autocomplete="off" placeholder="Timer" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletTimer+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Lifetime</div>'+
  '<input autocomplete="off" placeholder="Speed" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.bulletSpeed+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet Speed</div>'+
  '<input autocomplete="off" placeholder="Recoil" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.recoil+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Recoil Amount</div>'+
  '<input autocomplete="off" placeholder="Delay" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.reload+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Barrel Delay</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delbb(this)>Delete Gadget</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicatebb(this)>Duplicate Gadget</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("bbUI").appendChild(htmlObject);
  document.getElementById("turrets").innerHTML = "Gadgets (" + $("#bbUI").children().length + ")";//update barrel count on button
  gadgetnumberid++;
  if (type == "drone"){
    var htmlObject = document.createElement('div');
      var divid = 'dc'+id;
      var divid2 = 'dc2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="droneLimit" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.droneLimit+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Max Drone Count</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "trap"){
    var htmlObject = document.createElement('div');
      var divid = 'tr'+id;
      var divid2 = 'tr2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="trapDistBeforeStop" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.trapDistBeforeStop+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Trap Distance</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
  else if (type == "aura"){
    var htmlObject = document.createElement('div');
      var divid = 'as'+id;
      var divid2 = 'as2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraSize" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.auraSize+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura size</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ac'+id;
      var divid2 = 'ac2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraColor" class="sandboxInput" style="clear:both;position:relative;float:left;" value='+barrel.auraColor+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura color</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'ao'+id;
      var divid2 = 'ao2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="auraOutline" class="sandboxInput" style="clear:both;position:relative;float:left;" value='+barrel.auraOutline+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura outline</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      var htmlObject = document.createElement('div');
      var divid = 'at'+id;
      var divid2 = 'at2'+id;
      var textnode = '<select name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      if (barrel.auraSpecialty == "freeze"){
        textnode = '<select name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze" selected>Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      }
      else if (barrel.auraSpecialty == "attraction"){
        textnode = '<select name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction" selected>Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      }
      else if (barrel.auraSpecialty == "heal"){
        textnode = '<select name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal" selected>Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      }
      else if (barrel.auraSpecialty == "repulsion"){
        textnode = '<select name="auratype" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion" selected>Repulsion</option><option value="heal">Heal</option></select><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Type</div>';
      }
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      if (barrel.auraSpecialty == "heal"){//heal power div
        var htmlObject = document.createElement('div');
        var divid = 'hp'+id;
        var divid2 = 'hp2'+id;
        var textnode = '<input id='+divid+' autocomplete="off" placeholder="healPower" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.healPower+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Aura Heal Power</div>';
        htmlObject.innerHTML = textnode;
        htmlObject.setAttribute("id", id);
        document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
      }
  }
  else if (type == "bullet"){
    let value = "no";
    if (barrel.knockback == "yes"){
      value = "yes";
    }
  var htmlObject = document.createElement('div');
      var divid = 'bk'+id;
      var divid2 = 'bk2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="knockback" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+value+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Knockback (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
    value = "no";
    if (barrel.growth == "yes"){
      value = "yes";
    }
      var htmlObject = document.createElement('div');
      var divid = 'bg'+id;
      var divid2 = 'bg2'+id;
      var textnode = '<input id='+divid+' autocomplete="off" placeholder="growth" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+value+'><div id='+divid2+' class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Bullet growth (y/n)</div>';
      htmlObject.innerHTML = textnode;
      htmlObject.setAttribute("id", id);
      document.getElementById("btn"+id).before(htmlObject);//add before the delete barrel button
  }
}

function addCustomAssetDiv(id,barrel) {
  var htmlObject = document.createElement('div');
  let type = barrel.type;
  let barrelTypeSelect = '<select name="position" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="under">Under tank</option><option value="above">Above tank</option></select>';
  //add "selected" inside the option which is the current barrel type
  if (type == "under"){
  //nothing
  }
  else{
    barrelTypeSelect = '<select name="position" class="sandboxSelect" style="clear:both;position:relative;float:left;"><option value="under">Under tank</option><option value="above" selected>Above tank</option></select>';
  }
  var buttonID = 'btn'+id; //note: use 'clear:both;' inside style instead of <br> (doesnt work for relative positioning)
  //overflow auto below is to make div take up space of nested items (s that background-color will work)
  var textnode = '<div id=' + id + ' class="sandboxStack tankObjectHide" style="overflow: auto;background-color:rgba(0,0,0,.2);width: 30%;padding: 0.5vw 1vw;border-radius:1vw;margin-top: 20px;">'+
  '<div class="sandboxText" style="font-size: 1vw;clear:both;position:relative;float:left;padding:0.3vw 0.3vw;cursor: pointer;" onclick="showHideTankObject(\'asset\', \'' + id + '\')">Asset '+assetnumberid+' ▾</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Positioning</div>'+
  barrelTypeSelect+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw;"> Position</div>'+
  '<input autocomplete="off" placeholder="Relative size" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.size+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Relative Size</div>'+
  '<input autocomplete="off" placeholder="Angle" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.angle+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Rotation</div>'+
  '<input autocomplete="off" placeholder="x-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.x+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Side Offset</div>'+
  '<input autocomplete="off" placeholder="y-offset" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.y+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Forward Offset</div>'+
  '<div class="sandboxText" style="clear:both;position:relative;font-size:1.25vw;float:left;padding:0.3vw 0.3vw;">Attributes</div>'+
  '<input autocomplete="off" placeholder="Asset sides" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.sides+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Sides</div>'+
  '<input autocomplete="off" placeholder="Asset color" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.color+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Color</div>'+
  '<input autocomplete="off" placeholder="Asset outline" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.outline+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Outline</div>'+
  '<input autocomplete="off" placeholder="Outline width" class="sandboxInput" style="clear:both;position:relative;float:left;width:5vw;" value='+barrel.outlineThickness+'>'+
  '<div class="sandboxText" style="position:relative;font-size:1vw;float:left;padding:0.3vw 0.3vw 0.3vw 1vw;">Outline width</div>'+
  '<button id=' + buttonID + ' class="sandboxButton" style="position: relative;clear:both;float:left;" onclick=delass(this)>Delete Asset</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:10vw;" onclick=duplicateass(this)>Duplicate Asset</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Forward (WIP)</button>'+
  '<button class="sandboxButton" style="position: relative;float:left;width:12vw;" >Move Backward (WIP)</button></div>';
  htmlObject.innerHTML = textnode;
  document.getElementById("assetUI").appendChild(htmlObject);
  document.getElementById("assets").innerHTML = "Assets (" + $("#assetUI").children().length + ")";//update barrel count on button
  assetnumberid++;
}

function delbar(e) {//barrel
  var par = $(event.target).parent();
  var parID = par.attr('id');
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["delbarrel",parID]);//tell server to delete barrel
    socket.send(packet)
  }
  par.parent().remove();//delete html div
  document.getElementById("barrels").innerHTML = "Barrels (" + $("#barrelUI").children().length + ")";//update barrel count on button
}
function delass(e) {//asset
  var par = $(event.target).parent();
  var parID = par.attr('id');
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["delasset",parID]);//tell server to delete barrel
    socket.send(packet)
  }
  par.parent().remove();//delete html div
  document.getElementById("assets").innerHTML = "Assets (" + $("#assetUI").children().length + ")";//update barrel count on button
}
function delbb(e) {//bodybarrel
  var par = $(event.target).parent();
  var parID = par.attr('id');
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["delbb",parID]);//tell server to delete barrel
    socket.send(packet)
  }
  par.parent().remove();//delete html div
  document.getElementById("turrets").innerHTML = "Gadgets (" + $("#bbUI").children().length + ")";//update barrel count on button
}


function duplicatebar(e){
  var par = $(event.target).parent();
  var parID = par.attr('id');
  //new ids
  var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
  var buttonID = 'btn'+specialID;
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["dupbarrel",parID, specialID]);//tell server to duplicate barrel
    socket.send(packet)
  }
  //clone div
  var row = par.parent(),
    inputVal = row.find('input').val(),
    selectVal = row.find('select').val(),
    clone = $(row).clone(true, true);
  //change ID
  //dont use find. It doesnt work but idk why.
  clone.children(":first").attr('id', specialID);
  clone.children(":first").children("button:first").attr('id', buttonID);
  //copy the input field values
  clone.find('input[type="text"]').val(inputVal);
  clone.find('select').val(selectVal);
  
  //replace div number
  let divtitle = 'Barrel ';
  let text = clone.find(">:first-child").find(">:first-child").text();
  let indexofnumber = text.indexOf(divtitle) + divtitle.length;
  let number = text.charAt(indexofnumber);
  let texttoreplace = divtitle+number.toString();
  text = text.replace(divtitle+number.toString(), divtitle+barrelnumberid);
  clone.find(">:first-child").find(">:first-child").text(text);
  barrelnumberid++;

  //change onclick event
  clone.find(">:first-child").find(">:first-child").attr("onclick","showHideTankObject(\'barrel\', \'" + specialID + "\')");
  
  //change all the ids of custom properties, e.g. minion customization div
  clone.find(">:first-child").children().each(function () {// "this" is the current html element, but use $(this) to access it as jquery
    if (this.id == parID){//this div contains the divs that we need to change the id of
      $(this).attr('id', specialID);
      $(this).children().each(function () {
        let newid = this.id.replace(parID, specialID);
        $(this).attr('id', newid);
      })
    }
  });
  
  $('#barrelUI').append(clone);//add clone
  document.getElementById("barrels").innerHTML = "Barrels (" + $("#barrelUI").children().length + ")";//update barrel count on button
}
function duplicateass(e){
  var par = $(event.target).parent();
  var parID = par.attr('id');
  //new ids
  var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
  var buttonID = 'btn'+specialID;
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["dupasset",parID, specialID]);//tell server to duplicate barrel
    socket.send(packet)
  }
  //clone div
  var row = par.parent(),
    inputVal = row.find('input').val(),
    selectVal = row.find('select').val(),
    clone = $(row).clone(true, true);
  //change ID
  //dont use find. It doesnt work but idk why.
  clone.children(":first").attr('id', specialID);
  clone.children(":first").children("button:first").attr('id', buttonID);
  //copy the input field valuessss
  clone.find('input[type="text"]').val(inputVal);
  clone.find('select').val(selectVal);
  
  //replace div number
  let divtitle = 'Asset ';
  let text = clone.find(">:first-child").find(">:first-child").text();
  let indexofnumber = text.indexOf(divtitle) + divtitle.length;
  let number = text.charAt(indexofnumber);
  let texttoreplace = divtitle+number.toString();
  text = text.replace(divtitle+number.toString(), divtitle+assetnumberid);
  clone.find(">:first-child").find(">:first-child").text(text);
  assetnumberid++;

  //change onclick event
  clone.find(">:first-child").find(">:first-child").attr("onclick","showHideTankObject(\'asset\', \'" + specialID + "\')");
  
  $('#assetUI').append(clone);//add clone
  document.getElementById("assets").innerHTML = "Assets (" + $("#assetUI").children().length + ")";//update barrel count on button
}
function duplicatebb(e){
  var par = $(event.target).parent();
  var parID = par.attr('id');
  //new ids
  var dataidgen = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    dataidgen = dataidgen.split('');
    var specialID  = "";
    for(let i = 0; i < 20; ++i) {
      specialID += dataidgen[Math.floor(Math.random() * dataidgen.length)];
    }
  
  var buttonID = 'btn'+specialID;
  if (gamelocation=="tank-editor"){//prevent error which causes editor to not be able to open
    var packet = JSON.stringify(["dupbb",parID, specialID]);//tell server to duplicate barrel
    socket.send(packet)
  }
  //clone div
  var row = par.parent(),
    inputVal = row.find('input').val(),
    selectVal = row.find('select').val(),
    clone = $(row).clone(true, true);
  //change ID
  //dont use find. It doesnt work but idk why.
  clone.children(":first").attr('id', specialID);
  clone.children(":first").children("button:first").attr('id', buttonID);
  //copy the input field valuessss
  clone.find('input[type="text"]').val(inputVal);
  clone.find('select').val(selectVal);
  
  //replace div number
  let divtitle = 'Gadget ';
  let text = clone.find(">:first-child").find(">:first-child").text();
  let indexofnumber = text.indexOf(divtitle) + divtitle.length;
  let number = text.charAt(indexofnumber);
  let texttoreplace = divtitle+number.toString();
  text = text.replace(divtitle+number.toString(), divtitle+gadgetnumberid);
  clone.find(">:first-child").find(">:first-child").text(text);
  gadgetnumberid++;

  //change onclick event
  clone.find(">:first-child").find(">:first-child").attr("onclick","showHideTankObject(\'bb\', \'" + specialID + "\')");
  
  //change all the ids of custom properties, e.g. minion customization div
  clone.find(">:first-child").children().each(function () {// "this" is the current html element, but use $(this) to access it as jquery
    if (this.id == parID){//this div contains the divs that we need to change the id of
      $(this).attr('id', specialID);
      $(this).children().each(function () {
        let newid = this.id.replace(parID, specialID);
        $(this).attr('id', newid);
      })
    }
  });
  
  $('#bbUI').append(clone);//add clone
  
  document.getElementById("turrets").innerHTML = "Gadgets (" + $("#bbUI").children().length + ")";//update barrel count on button
  
  //update the aura type if have
  try{
    let e = document.getElementById("at"+parID);
    let value = e.value;
    let text = e.options[e.selectedIndex].text;
    console.log(text)
    if (text == "Damage"){
        document.getElementById("at"+specialID).innerHTML = '<option value="damage" selected>Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option>';
      }
    else if (text == "Freeze"){
        document.getElementById("at"+specialID).innerHTML = '<option value="damage">Damage</option><option value="freeze" selected>Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option>';
      }
      else if (text == "Attraction"){
        document.getElementById("at"+specialID).innerHTML = '<option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction" selected>Attraction</option><option value="repulsion">Repulsion</option><option value="heal">Heal</option>';
      }
      else if (text == "Heal"){
        document.getElementById("at"+specialID).innerHTML = '<option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion">Repulsion</option><option value="heal" selected>Heal</option>';
      }
      else if (text == "Repulsion"){
        document.getElementById("at"+specialID).innerHTML = '<option value="damage">Damage</option><option value="freeze">Freeze</option><option value="attraction">Attraction</option><option value="repulsion" selected>Repulsion</option><option value="heal">Heal</option>';
      }
  }
  catch(err){}
}

//addBarrelDiv("yes");//add one barrel to the editor UI cuz the player spawns with one barrel (basic tank)

var tankEditor1 = document.getElementById("sandbox");
var tankEditor2 = document.getElementById("sandbox2");
var barrelEditor = document.getElementById("sandbox3");
var assetEditor = document.getElementById("sandbox4");
var bbEditor = document.getElementById("sandbox5");
function openBarrelUI(){
  if (barrelEditor.style.display == "none"){
    barrelEditor.style.display = "block";
    assetEditor.style.display = "none";
    bbEditor.style.display = "none";
  }
  else{
    barrelEditor.style.display = "none";
  }
}
function openAssetUI(){
  if (assetEditor.style.display == "none"){
    assetEditor.style.display = "block";
    barrelEditor.style.display = "none";
    bbEditor.style.display = "none";
  }
  else{
    assetEditor.style.display = "none";
  }
}
function openBBUI(){
  if (bbEditor.style.display == "none"){
    bbEditor.style.display = "block";
    assetEditor.style.display = "none";
    barrelEditor.style.display = "none";
  }
  else{
    bbEditor.style.display = "none";
  }
}
function openEditorUI(){
  if (tankEditor1.style.display == "none"){
    tankEditor1.style.display = "block";
    tankEditor2.style.display = "block";
    openedUI = "yes";
    document.getElementById("chat").style.display = "none";
  }
  else{
    tankEditor1.style.display = "none";
    tankEditor2.style.display = "none";
    barrelEditor.style.display = "none";
    assetEditor.style.display = "none";
    bbEditor.style.display = "none";
    openedUI = "no";
    document.getElementById("chat").style.display = "block";
  }
}

//import tank code
//send the tank code to server
function sendTankCode(){
  var tankcode = document.getElementById("import-code").value;
  var packet = JSON.stringify(["tankcode",tankcode]);
  socket.send(packet)
}
//get tank code
function getTankCode(){
  var packet = JSON.stringify(["export"]);
  socket.send(packet)
  createNotif("Exporting tank code...",defaultNotifColor,3000)
  createNotif("Note that this feature is new and may not work properly.",defaultNotifColor,3000)
}

window.onbeforeunload = () =>  {
    if(gameStart >= 1){//in game (show confirmation)
       return true
    }else{//dont show
       return null
    }
}//confirmation dialog when close tab