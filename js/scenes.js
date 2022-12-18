const SCENES = {
	MAIN: "main",
	PLAY: "play",
	PAUSE: "pause",
	WIN: "win",
	LOSE: "lose",
	SETTINGS: "settings"
};
var SCENE_current = SCENES.PLAY;


var copyID = 1;

function SCENE_PLAY() {
	if (g_t < 0) {
		g_t = 0;
		g_t_Invert();
	}
	if (g_t > M_t) {
		g_t = M_t;
		g_t_Invert();
	}

	//global time
	g_t += g_forward ? g_dt : -g_dt;
	g_frames += g_forward ? 1 : -1;


	background(20);


	//local
	let dx = 0, dy = 0;
	let mult = 1;
	if (keyIsDown(87)) dy = -1;
	if (keyIsDown(83)) dy = 1;
	if (keyIsDown(65)) dx = -1;
	if (keyIsDown(68)) dx = 1;
	if (keyIsDown(SHIFT)) mult = 2.5;
	p_v = p5.Vector.lerp(p_v, createVector(dx, dy).normalize().mult(mult), 0.2);

	mvec = p5.Vector.sub(mpos, PLAYER.pos);

	PLAYER.getComponent("Transform").moveXY(p_v.x, p_v.y);
	PLAYER.getComponent("Transform").setLocalRotation(mvec.heading());

	ENTITIES.forEach(ent => {
		ent.update();
	});


	SCENE_PLAY_UI();
}



function SCENE_PLAY_UI() {
	//UI
	push();
	fill(255);
	noStroke();
	
	textFont(FNT_splash, 40);
	text(nf(g_t, 0, 2) + "s", 20, height - 20);

	let col = g_forward ? color(0, 0) : color(0, 0, 250, 10);
	fill(col);
	background(col);
	pop();
}