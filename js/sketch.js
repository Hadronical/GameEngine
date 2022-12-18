var forw_col,
	back_col;

var M_t = 10.0;
var g_t = 0.0;
var g_dt = 0.02;
var g_forward = true;

var g_frames = 0;

var p_i = 0;
var p_v;

var PLAYER;

//#region -----<TEXTURES>-----

var TEX_noTexture;
var TEX_characterTest;

var TEX_bullet;
var TEX_crate;
var TEX_pistol;

//#endregion

//#region -----<FONTS>-----

var FNT_splash;

//#endregion


function g_t_Invert()
{
	g_forward = !g_forward;

	console.log(TIMEMOVERS.size);

	let temp = new Map(TIMEMOVERS);
	temp.forEach((tm) => {
		if (tm.parent == PLAYER)
		{
			PLAYER = tm.split();
			return;
		}
		tm.invert();
	});
}


function preload ()
{
	//LOADING FONTS
	FNT_splash = loadFont("assets/fonts/Splash-regular.ttf");
}


function setup ()
{
	createCanvas(600, 600);

	//LOADING TEXTURES
	TEX_noTexture = "assets/images/missing_texture.png";
	TEX_characterTest = "assets/images/character_test.png";

	TEX_bullet = "assets/images/bullet.png";
	TEX_crate = "assets/images/crate.png";
	TEX_pistol = "assets/images/pistol.png";


	forw_col = color(240, 80, 80);
	back_col = color(80, 80, 240);

	p_v = createVector(0, 0);

	mpos = createVector(0, 0);


	PLAYER = createEntity("Player");
	PLAYER.getComponent("Graphics").setSource(TEX_characterTest);
	PLAYER.getComponent("Transform").setRelativeMove(false);
	let TM = new TimeMover();
	TM.addField(PLAYER.getComponent("Transform"));
	TM.addField(PLAYER.getComponent("Graphics"));
	PLAYER.addComponent(TM);
}

function draw ()
{
	for (let i = 0; i < g_entityid; i++)
	{
		COLLIDED[i] = false;
	}


	mpos.x = mouseX;
	mpos.y = mouseY;

	switch (SCENE_current)
	{
		case SCENES.MAIN:
			break;
		case SCENES.PLAY:
			SCENE_PLAY();
			break;
		case SCENES.PAUSE:
			break;
		case SCENES.WIN:
			break;
		default: break;
	}
}