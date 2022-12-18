class Projectile extends Entity {
    constructor(x0,y0, angle, speed, xbnd, ybnd, size, dmg)
    {
        super("projectile");

        let GRFX = this.getComponent("Graphics");
        GRFX.setSource(TEX_bullet);
        GRFX.setSizeXY(15, 15);

        this.getComponent("Transform").setLocalPositionXY(x0, y0);
        this.getComponent("Transform").setLocalRotation(angle);

        this.addComponent(new RectCollider());
        let TM = new TimeMover();
        TM.addField(this.getComponent("Graphics"));
        TM.addField(this.getComponent("Transform"));
        this.addComponent(TM);

        this.moveDir = p5.Vector.fromAngle(angle).normalize();
        this.spd     = speed;
        this.v       = p5.Vector.mult(this.moveDir, this.spd);

        this.xbnd = xbnd;
        this.ybnd = ybnd;

        this.size = size;

        this.dmg = dmg;
    }

    update ()
    {
        this.getComponent("Transform").move(this.v);
        super.update();
    }

    isOutOfBounds ()
    {
        return (
            this.pos.x > this.xbnd.sec + 10 || this.xbnd.fir < -10 ||
            this.pos.y > this.ybnd.sec + 10 || this.ybnd.fir < -10
        );
    }
}
  
  

class Ray {
    constructor(x0,y0, ang, len,wid, col, dmgOverTime, lifeTime, dmg) {
        this.posStart = createVector(x0, y0);
        this.dmg = dmg;
        
        this.w = wid;
        this.a = ang;
        
        this.posEnd = p5.Vector.add(
        this.posStart,
        p5.Vector.fromAngle(this.a).setMag(len)
        );
        
        this.c = color(col);
        this.tTotal = lifeTime;
        this.t = this.tTotal;
        
        this.dmgOverTime = dmgOverTime;
        this.canDmg = true;
    }


    Draw() {
        if (this.t > 0){
        push();
        stroke(this.c, this.t / this.tTotal); strokeWeight(this.w * (this.t / this.tTotal));
        line(this.posStart.x,this.posStart.y, this.posEnd.x,this.posEnd.y);
        pop();
        
        this.t -= constrain(this.t / this.tTotal / 10, 0.001, this.tTotal);
        }
    }


    RayDist(Obj, size) {
        
        let distNum = abs(
        (this.posEnd.x - this.posStart.x)*
        (this.posStart.y - Obj.y)-
        
        (this.posStart.x - Obj.x)*
        (this.posEnd.y - this.posStart.y)
        );
        let distDem = dist(this.posStart.x, this.posStart.y, this.posEnd.x, this.posEnd.y);
        
        let d = distNum / distDem;
        
        return (d - this.w < size/2);
    }
}


class Explosive extends Projectile {
    constructor(x, y, angle, Speed, MaxX, MaxY, Size, dmg,
                blastRad, dmgFalloff,
                triggerable,triggerRad, lifetime) {
        super(x, y, angle, Speed, MaxX, MaxY, Size, dmg);
        
        this.rad = blastRad;
        this.falloff = dmgFalloff;
        
        this.targetsInRad = [];
        
        //same as size if not triggerable, triggerable is useless
        this.trigRad = triggerRad;
        this.t = lifetime;
        this.exists = true;
    }


    Draw() {
        push();
        this.t -= 0.01;
        this.exists = (this.t > 0);
            
        noStroke();
        fill(255,200);
        translate(this.pos.x, this.pos.y);

        rotate(this.angle);
        scale(0.5);
        imageMode(CENTER);
        image(bulletGraphic,0,0);
        
        pop();
    }
        

    Explode() {
        SpawnParticles(
        this.pos,createVector(1,1),
        [180,5], 3,20,
        color(240,80,80),
        10, 10
        );
        EnemyDeadFX.play();
        
        this.targetsInRad.forEach(
        target => {
            let falloff = lerp(1,this.falloff,(p5.Vector.dist(this.pos, target.pos) - target.size/2) / this.rad);
            let dmg = this.dmg * falloff;
            target.Damage(dmg);
        });
        //Destroy explosive
        this.t = -1;
    }


    BlastRadiusScan(Obj, size) {
        return (p5.Vector.dist(this.pos, Obj) - size/2 < this.rad);
    }

    TriggerScan(Obj, size) {
        return (p5.Vector.dist(this.pos, Obj) - size/2 < this.trigRad);
    }
}