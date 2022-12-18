//#region -----<CLASSESS>-----
function pair (a, b) {
	this.fir = a;
	this.sec = b;

	this.set = (a, b) => {
		this.fir = a;
		this.sec = b;
	}
	this.equals = (other) => {
		return (this.fir = other.fir && this.sec == other.sec);
	}
}

//#endregion


//#region -----<FUNCTIONS>-----
function NameOf (obj)
{
	return obj.constructor.name;
}

function String_Concat (delim, ...args)
{
	let buf = "";

	for (let i = 0; i < args.length; i++)
	{
		if (i > 0)
		{
			buf += delim;
		}
		buf += args[i];
	}

	return buf;
}

function Initialized (a)
{
	return a != null && a != undefined;
}

function Replacer ()
{
	const visited = new WeakSet();
	return (key, val) => {
		if (typeof val === "object" && val !== null) {
		if (visited.has(val)) {
			return;
		}
			visited.add(val);
		}
		return val;
	};
};

function createEntity (nm)
{
	let enty = new Entity (nm);
	ENTITIES.set(enty.id, enty);
	return enty;
}

let toggle = true;
function keyPressed()
{
	if (keyCode == 74)
	{
		toggle = !toggle

		//g_t_Invert();

		PLAYER.getComponent("Graphics").setVisible(toggle);

		/*
		let enty = createEntity("crate");
		enty.getComponent("Graphics").setSource(TEX_crate);
		enty.getComponent("Transform").setLocalPosition(mpos);
		enty.addComponent(new TimeMover());
		enty.name += enty.id;
		*/
	}
}

function mousePressed ()
{
	LaunchProjectile (PLAYER.pos, mvec, 10, [new pair(), new pair()], 5, 1);
}

function LaunchProjectile (p0, dir, spd, bnds, size, dmg)
{
	let newProjectile = new Projectile(
		p0.x,p0.y,
		dir.heading(), spd,
		bnds[0], bnds[1],
		size, dmg
	);

	ENTITIES.set(newProjectile.id, newProjectile);
}


function CollisionCheck (A, B)
{
	let depth = Infinity;
	let smallestDepthAxis;

	let axes = A.normals.concat(B.normals);


	for (let i = 0; i < axes.length; i++)
	{
		let axis = axes[i];

		let Amax = p5.Vector.dot(A.pos, axis);
		let Amin = Amax;
		let Bmax = p5.Vector.dot(B.pos, axis);
		let Bmin = Bmax;

		for (let i = 0; i < A.N; i++)
		{
			let p1 = A.points[i];
			let p2 = A.points[(i + 1) % A.N];
			let p1_ = p5.Vector.dot(p1, axis);
			let p2_ = p5.Vector.dot(p2, axis);

			Amax = max(Amax, p1_, p2_);
			Amin = min(Amin, p1_, p2_);
		}
		for (let i = 0; i < B.N; i++)
		{
			let p1 = B.points[i];
			let p2 = B.points[(i + 1) % B.N];
			let p1_ = p5.Vector.dot(p1, axis);
			let p2_ = p5.Vector.dot(p2, axis);

			Bmax = max(Bmax, p1_, p2_);
			Bmin = min(Bmin, p1_, p2_);
		}

		if ((Bmin > Amax) || (Amin > Bmax))
		{
		return [false, null, null];
		}


		let axisDepth = min(Bmax - Amin, Amax - Bmin);
		if (axisDepth < depth)
		{
		depth = axisDepth;
		smallestDepthAxis = axis;
		}
	}

	depth /= smallestDepthAxis.mag();
	let normal = smallestDepthAxis.normalize();

	let B2A = p5.Vector.sub(A.pos, B.pos);

	if (p5.Vector.dot(normal, B2A) < 0)
	{
		normal.mult(-1);
	}

	Arrow(B.pos, p5.Vector.mult(normal, 10));

	return [true, normal, depth];
}

//#endregion



var mpos,
	mvec;