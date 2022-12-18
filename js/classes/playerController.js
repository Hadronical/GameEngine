function PlayerController () {
	Component.apply(this, arguments);

	this.speed = 1;

	this.inputs  = new Map ();


	this.update = () => {
		this.forward = p5.Vector.fromAngle(this.parent.rot).normalize();
		this.right = p5.Vector.fromAngle(this.parent.rot + PI / 2).normalize();
	}

	this.setSpeed = (spd) => {
		this.speed = spd;
	}

	this.bindKey = (key, act) => {
		this.inputs.set(key, act);
	}
}