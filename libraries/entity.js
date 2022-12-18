var g_entityid = 0;
var ENTITIES = new Map();
var COLLIDERS = new Map();
var COLLIDED = [];
var TIMEMOVERS = new Map();


class Entity
{
	constructor(name)
	{
		this.id = newID();
		ENTITIES.set(this.id, this);

		this.name = (name == undefined) ? "Object " + this.id : name;

		this.pos = createVector(0, 0);
		this.rot = 0;

		this.parent = null;
		this.children = new Map();

		this.components = new Map();
		this.addComponent(new Graphics());
		this.addComponent(new Transform());
	}

	parentTo(obj)
	{
		this.parent = obj;

		if (!Initialized(obj)) {return}
		this.children.set(obj.id, obj);
	}

	getGlobalPosition()
	{
		let pos = this.pos;
		if (this.parent == undefined || this.parent == null)
		{
			return pos;
		}

		p5.Vector.add(pos, this.parent.GetGlobalPosition());
		return pos;
	}

	getGlobalRotation()
	{
		let rot = this.rot;
		if (this.parent == undefined || this.parent == null)
		{
			return rot;
		}

		rot += this.parent.GetGlobalRotation();
		return rot;
	}

	update()
	{
		this.components.forEach(v => { v.update(); });
	}

	addComponent(comp)
	{
		if (this.components.has(NameOf(comp))) { return; }

		comp.parentTo(this);
		this.components.set(NameOf(comp), comp);
	}
	getComponent(type)
	{
		return this.components.get(type);
	}
	hasComponent(type)
	{
		return this.components.has(type);
	}
	removeComponent(type)
	{
		this.components.delete(type);
	}
	allComponents()
	{
		let s = "";
		this.components.forEach(c => s += c.name + ", ");
		return s;
	}


	echoMSG(msg)
	{
		let to = msg.to;
		let omit = msg.omit;
		let all = (to.length == 0);
		this.components.forEach(c => {
			if ((to.includes(c.name) || all) && !omit.includes(c.name))
			{
				c.recieveMSG(msg);
			}
		})
	}

	copy()
	{
		console.log("copying " + this.name);

		//copy this
		let newCopy = new Entity(this.name + " copy");

		//set new id and name for copy
		newCopy.parentTo(this.parent);
		newCopy.pos = this.pos.copy();
		newCopy.rot = this.rot;

		//send message to all components (except TimeMover) to setup new copy
		this.echoMSG(
			new MSG(
				"COPYING",
				this,[],["TimeMover"],
				{ copy: newCopy })
		);

		//send message to TimeMover last
		this.echoMSG(
			new MSG(
				"COPYING",
				this,["TimeMover"],[],
				{ copy: newCopy })
		);

		return newCopy;
	}

	DELETE()
	{
		ENTITIES.delete(this.id);
	}
}


const newID = () => { return g_entityid++; }


//#region -----<COMPONENTS>-----
function Component ()
{
	this.name = this.constructor.name;
	this.parent = null;
	this.active = true;

	this.update = () => {
		if (!this.active) { return; }
	}

	this.parentTo = (obj) => {
		this.parent = obj;
	}

	this.setActive = (b) => {
		this.active = b;
	}

	this.sendMSG = (msg) => {
		this.parent.echoMSg(msg);
	}
	this.recieveMSG = (msg) => {
		console.log(this.parent.id + "/" + this.name + " <- " + msg.msg);

		switch (msg.msg) {
			case "COPYING":
				msg.content.copy.addComponent(this.copy());
				break;
			default:
				break;
		}
	}

	this.toJSON = () => {
		let contents = {
			name: this.name,
			active: this.active,
			parent: this.parent.id
		}
		return JSON.stringify(contents);
	}
	this.fromJSON = (s) => {
		let obj = JSON.parse(s);
		this.name = obj.name;
		this.active = obj.active;
		this.parentTo(ENTITIES.get(obj.parent));
	}

	this.copy = () => {
		return new this.constructor();
	}
}


const g_DEFAULTSIZE = 20;

function Graphics (path)
{
	Component.apply(this, arguments);

	this.visible = true;

	this.srcPath = path;
	this.src = path == undefined ? null : loadImage(path);

	this.offset = createVector(0, 0);
	this.size = new pair(g_DEFAULTSIZE, g_DEFAULTSIZE);
	this.rot = 0;

	this.setSource = (path) => {
		this.srcPath = path;
		this.src = path == undefined ? null : loadImage(path);
	};

	this.setSize   = (size) => {
		if (!Initialized(size)) {return}

		this.size.x = size.x;
		this.size.y = size.y;
	}
	this.setSizeXY = (x, y) => {
		this.size.set(x, y);
	}

	this.setOffset = (pos) => {
		if (!Initialized(pos)) {return}

		this.offset.x = pos.x;
		this.offset.y = pos.y;
	}
	this.setOffsetXY = (x, y) => {
		this.offset.x = x;
		this.offset.y = y;
	}

	this.update = () => {
		if (!this.active) { return }

		this.show();
	}
	this.show = () => {
		if (!this.visible) { return; }

		push();
		let pos = this.parent.getGlobalPosition();
		translate(pos.x, pos.y);

		//TimeMover indicator
		/*
		let tm = this.parent.getComponent("TimeMover");
		if (Initialized(tm)) {
			fill((tm.t_forward) ? (forw_col) : (back_col));
			noStroke();
			circle(
				-this.size.fir / 2,
				-this.size.sec / 2,
				3
			);
		}
		*/

		rotate(this.parent.getGlobalRotation());

		translate(this.offset.x, this.offset.y);

		push();
		rotate(this.rot);
		imageMode(CENTER); rectMode(CENTER);

		if (this.src == null)
		{
			if (TEX_noTexture != undefined && TEX_noTexture != null)
			{
				TEX_noTexture.resize(this.size.fir, this.size.sec);
				image(TEX_noTexture, 0, 0);
			}
			else
			{
				fill(200);
				rect(0, 0, this.size.fir, this.size.sec);
			}
		}
		else
		{
			this.src.resize(this.size.fir, this.size.sec);
			image(this.src, 0, 0);
		}
		pop();

		pop();
	}

	this.setVisible = (b) => {
		this.visible = b;
	}

	this.toJSON = () => {
		let contents = {
			name: this.name,
			active: this.active,
			parent: this.parent.id,
			source: this.srcPath,
			visible: this.visible
		}
		return JSON.stringify(contents);
	}
	this.fromJSON = (s) => {
		let obj = JSON.parse(s);
		this.name = obj.name;
		this.active = obj.active;
		this.parent = ENTITIES.get(obj.parent);
		if (this.srcPath != obj.source)
		{
			this.setSource(obj.source);
		}
		this.visible = obj.visible;
	}


	this.recieveMSG = (msg) => {
		console.log(this.parent.id + "/" + this.name + " <- " + msg.msg);

		switch (msg.msg) {
			case "COPYING":
				let GRFX = msg.content.copy.getComponent("Graphics");
				GRFX.setSource(this.srcPath);
				break;
			default:
				break;
		}
	}

	this.copy = () => {
		return new Graphics(this.srcPath);
	}
}

function Transform ()
{
	Component.apply(this, arguments);

	this.relativeMove = false;
	this.forward = createVector(1, 0);
	this.right = createVector(0, 1);

	this.update = () => {
		this.forward = p5.Vector.fromAngle(this.parent.rot).normalize();
		this.right = p5.Vector.fromAngle(this.parent.rot + PI / 2).normalize();
	}

	this.setRelativeMove = (b) => {
		this.relativeMove = b;
	}

	this.move   = (v) => {
		let movement = v;
		if (this.relativeMove) {
			movement = p5.Vector.add(
				p5.Vector.mult(this.right, v.x),
				p5.Vector.mult(this.forward, v.y),
			);
		}
		this.parent.pos.add(movement);
	}
	this.moveXY = (x, y) => {
		let movement = createVector(x, y);
		if (this.relativeMove) {
			movement = p5.Vector.add(
				p5.Vector.mult(this.right, x),
				p5.Vector.mult(this.forward, y),
			);
		}
		this.parent.pos.add(movement);
	}
	this.setLocalPosition   = (p) => {
		this.parent.pos.x = p.x;
		this.parent.pos.y = p.y;
	}
	this.setLocalPositionXY = (x, y) => {
		this.parent.pos.x = x;
		this.parent.pos.y = y;
	}

	this.rotate           = (r) => {
		this.parent.rot = (this.parent.rot + r) % TWO_PI;
	}
	this.setLocalRotation = (r) => {
		this.parent.rot = r % TWO_PI;
	}

	this.toJSON = () => {
		let contents = {
			name: this.name,
			active: this.active,
			parent: this.parent.id,
			pos: [this.parent.pos.x, this.parent.pos.y],
			rot: this.parent.rot
		}
		return JSON.stringify(contents);
	}
	this.fromJSON = (s) => {
		let obj = JSON.parse(s);
		this.name = obj.name;
		this.active = obj.active;
		this.parentTo(ENTITIES.get(obj.parent));
		this.parent.pos = createVector(obj.pos[0], obj.pos[1]);
		this.parent.rot = obj.rot;
	}
}


function RectCollider (w, h)
{
	Component.apply(this, arguments);

	this.offset = createVector(0, 0);
	if (!Initialized(w) || !Initialized(h))
	{
		this.size = new pair(g_DEFAULTSIZE / 2, g_DEFAULTSIZE / 2);
	}
	else
	{
		this.size = new pair(w, h);
	}

	this.parentTo = (obj) => {
		this.parent = obj;
		COLLIDERS.set(this.parent.id, this);
	}

	this.update = () => {
		COLLIDERS.forEach((col, id) => {
			//if (this.checkCollision(col)) {
				//send MSG
				
			//}
		});
	}


}

function TimeMover()
{
	Component.apply(this, arguments);

	this.t_forward = true;

	this.RECORD_flds = new Map();
	this.RECORD = [];

	this.t_i = 0;

	this.parentTo = (obj) => {
		this.parent = obj;
		TIMEMOVERS.set(this.parent.id, this);
	}


	this.update = () => {
		if (this.t_i < 0)
		{
			if (!this.parent.hasComponent("Graphics")) { return; }
			this.parent.getComponent("Graphics").setVisible(false);
		}

		if (this.t_i == this.RECORD.length)
		{
			if (this.t_forward) this.record();
		}
		else if (this.t_i >= 0)
		{
			this.load(this.t_i);
		}

		if (this.t_forward)
		{
			this.t_i++;
		}
		else
		{
			this.t_i--;
		}
	}

	this.addField = (comp) => {
		this.RECORD_flds.set(comp.name, comp);
	}
	this.removeField = (type) => {
		this.RECORD_flds.delete(type);
	}

	this.record = () => {
		let data = new Map();
		this.RECORD_flds.forEach((comp, type) => {
			data.set(type, comp.toJSON());
		});
		this.RECORD.push(data);
	}
	this.load = (i) => {
		let data = this.RECORD[i];
		data.forEach((s, type) => {
			this.parent.getComponent(type).fromJSON(s);
		});
	}

	this.refresh = () => {
		thyis.refreshFields();
		this.refreshRecord();
	}
	this.refreshFields = () => {
		this.RECORD_flds = new Map();
	}
	this.refreshRecord = () => {
		this.RECORD = [];
	}

	this.invert = () => {
		this.t_forward = !this.t_forward;
	}
	this.split = () => {
		let newCopy = this.parent.copy();
		this.t_forward = !this.t_forward;

		return newCopy;
	}


	this.recieveMSG = (msg) => {
		console.log(this.parent.id + "/" + this.name + " <- " + msg.msg);

		let content = msg.content;

		switch (msg.msg) {
			case "COPYING":
				let TM = new TimeMover ();
				this.RECORD_flds.forEach((_, nm) => {
					TM.addField(content.copy.getComponent(nm));
				});
				content.copy.addComponent(TM);
				break;
			default:
				break;
		}
	}
}


function CheckCollision (A,Aid , B,Bid)
{
	let Apos = A.parent.getGlobalPosition();
	let Bpos = B.parent.getGlobalPosition();
	let dx = abs(Apos.x - Bpos.x);
	let dy = abs(Apos.y - Bpos.y);

	let collidingX = (dx < this.size.fir + other.size.fir);
	let collidingY = (dy < this.size.sec + other.size.sec);

	return collidingX || collidingY;
}
function HandleCollision (A, B)
{
	//A.echoMSG(COLMSG.COLLIDE(B, B.GetComponent("GridMover").gp));
	//B.echoMSG(COLMSG.COLLIDE(A, A.GetComponent("GridMover").gp));
}


function COLLIDERMSG()
{
	//collisions
	this.COLLISIONMSG = "COL";
	this.COLLIDE = (from, col) => {
		return new MSG
		(
			this.COLLISIONMSG,
			from.id, [],[],
			{ COLLIDER: col }
		);
	}

}

let COLMSG = new COLLIDERMSG();

function MSG(msg, from, to,omit, cntnt)
{
	this.msg = msg;
	this.from = from;
	this.to = to;
	this.omit = omit;
	this.content = cntnt;
}



//#endregion