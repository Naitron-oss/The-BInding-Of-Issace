//Variables globales et Arrays
//PAUSE
var isPaused = true, lastPaused = Date.now();
//FPSCOUNTER
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;

var lastFire = Date.now();
var playerBullets = [];
var collideMaps = [];
var holeMaps=[];
var Minions = [];
var Towers = [];
var towerBullets = [];
var towerBulletsCounter = 0;

var Items = [];
var ItemCounter =0;

// Compatibilit� browser
 var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

// loop animation			
var recursiveAnim = function() {
    mainloop();
	animFrame( recursiveAnim );
};

//Initialisation
function gameInit(){
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	var statCanvas = getEl("statCanvas");
    var statContext = statCanvas.getContext('2d');
	Level.create();
	keyboardEvent();
	//minionInit(6);
	fpsCounter();
	animFrame(recursiveAnim);
}

// Pause
function gameIsPaused(){
	if(keyPause && (Date.now() - lastPaused > 200)){
		if(isPaused) isPaused = false;
		else isPaused = true;
	lastPaused = Date.now();}
	return isPaused;
}
function pauseScreen(context){
	context.save();
	context.globalAlpha = 0.7;
	context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
	context.restore();
	context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);
	}

// Loop du jeu
function mainloop(){
	if( !gameIsPaused() && Player.alive ){
		//ifplayeralive
		for(var u=0;u<Items.length;u++){
			Items[u].update();
			if( !Items[u].alive ){
				Items.splice(u,1);
				ItemCounter--;}
		}
		for(var i=0;i<Minions.length;i++){
			Minions[i].update();
			if( !Minions[i].alive ){
				Minions.splice(i,1);}
		}
		for(var t=0;t<Towers.length;t++){
			Towers[t].update();
			if( !Towers[t].alive ){Towers.splice(t,1);}
		}
		for(var j=0;j<playerBullets.length;j++){
			playerBullets[j].update();
			if( !playerBullets[j].alive ) playerBullets.splice(j,1);
		}
		for(var tb=0;tb<towerBullets.length;tb++){
			towerBullets[tb].update();
		}
		Player.update();
	}
	drawGame();
	//fps calcul
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}

//Affichage
function drawGame(){
	//Definition contexte canvas
	var canvas = getEl("canvas");
    var context = canvas.getContext('2d');
	var statCanvas = getEl("statCanvas");
    var statContext = statCanvas.getContext('2d');
	context.clearRect(0,0,canvas.width,canvas.height);
	statContext.clearRect(0,0,statCanvas.width,statCanvas.height);
	
	//�l�ments
	Background.draw(context);
	//uiData.draw();
	for(var c=0;c<collideMaps.length;c++){collideMaps[c].draw(context);}
	for(var h=0;h<holeMaps.length;h++){holeMaps[h].draw(context);}
	for(var u=0;u<Items.length;u++){Items[u].draw(context);}
	Player.draw(context,statContext);
	for(var t=0;t<Towers.length;t++){Towers[t].draw(context);}
	for(var i=0;i<Minions.length;i++){Minions[i].draw(context);}
	for(var j=0;j<playerBullets.length;j++){playerBullets[j].draw(context);}
	for(var tb=0;tb<towerBullets.length;tb++){towerBullets[tb].draw(context);}
	//�cran de pause
	if( gameIsPaused() ) pauseScreen(context);
}

//fps
function fpsCounter(){
	var fpsOut = getEl("fps");
	setInterval(function(){
	fpsOut.innerHTML = (1000/frameTime).toFixed() + " FPS";
	},1000);
}

//Image de fond
var Background = {
	x: 0,
	y: 0,
	height: 576,
	width: 960,
	draw : function(context){
		context.drawImage(imageTool.background, this.x, this.y, this.width, this.height);
	}
};

// Niveau
var Level = {
	map: [
		["B","B","B","B","M"," "," "," "," "," ","M","B","B","B","B"],
		[" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
		[" "," "," "," "," "," "," "," "," "," "," "," "," "," "," "],
		[" "," "," "," "," "," "," ","H"," "," "," "," "," "," "," "],
		[" "," ","H"," ","H"," ","H","4","H"," ","H"," ","H"," "," "],
		[" "," "," "," "," "," "," ","H"," "," "," "," "," "," "," "],
		[" ","H"," "," "," "," "," "," "," "," "," "," "," ","H"," "],
		["H","T","H"," "," "," "," "," "," "," "," "," ","H","T","H"],
		[" ","H"," "," "," "," ","B","P","B"," "," "," "," ","H"," "]
	],
	create: function(){
		var minionCounter=0;
		var towerCounter=0;
		var collideMapsCounter=0;
		var holeMapsCounter = 0;
		for(var i=0,y=0; i< this.map.length; i++,y+=64){
			for(var j=0,x=0; j< this.map[i].length; j++,x+=64){ 
				if(this.map[i][j] == "P") {
					Player.x=x;
					Player.y=y;}
				if(this.map[i][j] == "M") {
					Minions[minionCounter] = new Minion(x,y,2);
					minionCounter++;}
				if(this.map[i][j] == "T") {
					Towers[towerCounter] = new Tower(x,y);
					towerCounter++;}
				if(this.map[i][j] == "B") {
					collideMaps[collideMapsCounter] = new Block(x,y);
					collideMapsCounter++;}
				if(this.map[i][j] == "H") {
					holeMaps[holeMapsCounter] = new Hole(x,y);
					holeMapsCounter++;}
				if(this.map[i][j] == "1") {
					Items[ItemCounter] = new Item(x+16,y+16,1);
					ItemCounter++;}
				if(this.map[i][j] == "2") {
					Items[ItemCounter] = new Item(x+16,y+16,2);
					ItemCounter++;}
				if(this.map[i][j] == "3") {
					Items[ItemCounter] = new Item(x+16,y+16,3);
					ItemCounter++;}
				if(this.map[i][j] == "4") {
					Items[ItemCounter] = new Item(x+16,y+16,4);
					ItemCounter++;}
				if(this.map[i][j] == "5") {
					Items[ItemCounter] = new Item(x+16,y+16,5);
					ItemCounter++;}
				if(this.map[i][j] == "6") {
					Items[ItemCounter] = new Item(x+16,y+16,6);
					ItemCounter++;}
				if(this.map[i][j] == "7") {
					Items[ItemCounter] = new Item(x+16,y+16,7);
					ItemCounter++;}
				if(this.map[i][j] == "8") {
					Items[ItemCounter] = new Item(x+16,y+16,8);
					ItemCounter++;}
			}
		}
	}
};

function Block(x,y){
	this.x = x;
	this.y = y;
	this.width = 64;
	this.height = 64;
	this.draw = function(context){
		context.drawImage(imageTool.block, this.x, this.y, this.width, this.height);
	}
}
function Hole(x,y){
	this.x = x+4;
	this.y = y+4;
	this.width = 56;
	this.height = 56;
	this.draw = function(context){
		context.drawImage(imageTool.hole, x, y, 64, 64);
	}
}

var uiData = {
	draw : function(dirx,diry){
		//getEl("score").innerHTML = "DirX = "+dirx.toFixed(4)+"DirY = "+diry.toFixed(4);
	}
};

function getRand(nbPos,nbDep){ return Math.floor(Math.random()*nbPos + nbDep);}
function getEl(id){ return document.getElementById(id);}