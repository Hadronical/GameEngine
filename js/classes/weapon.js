class Gun extends Entity {
    constructor(dmg) {
        super("weapon");

        let GRFX = this.getComponent("Graphics");
        GRFX.setSource(TEX_pistol);

        this.getComponent("Graphics").setOffset(x0, y0);
        this.getComponent("Transform").setLocalPositionXY(x0, y0);

        /*
        let TM = new TimeMover();
        TM.addField(this.getComponent("Transform"));
        this.addComponent(TM);
        */

        this.shootAngle = 0;
        this.spd = speed;

        this.size = size;

        this.dmg = dmg;
    }

    update () {
        this.shootAngle = mvec.heading();
        this.getComponent("Transform").setLocalRotation(this.shootAngle);

        super.update();
    }

    shoot () {
    }
}