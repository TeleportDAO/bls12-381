import { BigNumber } from "@ethersproject/bignumber";
import { order } from "./fields";
import { Fp, Fp1, Fp2, Fp6, Fp12, groupOrder } from "./fields";
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "./fields";
// import { error } from "console";

class point {
    public x: Fp;
    public y: Fp;
    public isInf: Boolean;
    constructor(
        x: Fp, 
        y: Fp, 
        isInf: Boolean
    ){
        if (typeof x != typeof y ) {
            throw "error: x and y must have same types"
        } else {
            this.x = x;
            this.y = y;
            this.isInf = isInf;
        }
    }
  	displayInfo(){
        console.log("x:")
        this.x.displayInfo()
        console.log("y:")
        this.y.displayInfo()
    }
    isInSubGroup(): Boolean {
        let mustInf = pointMul(groupOrder, this)
        return mustInf.isInf;
    }
    eq(q: point): Boolean {
        if (this.isInf) {
            return this.isInf == q.isInf
        } else {
            return this.x.eq(q.x) && this.y.eq(q.y) && this.isInf == q.isInf
        }
    }

    isOnCurve(): Boolean {
        if (this.x instanceof Fp1) {
            return this.isOnCurveG1()
        } else if (this.x instanceof Fp2) {
            return this.isOnCurveG2()
        } else {
            throw "error"
        }
    }
    isOnCurveG1(): Boolean {
        if (this.isInf) 
            return false;

        return this.y.mul(this.y).eq(
            this.x.mul(
                this.x.mul(this.x)
            ).add(
                fp1FromBigInt(BigNumber.from(4))
            )
        )
    }

    isOnCurveG2(): Boolean {
        if (this.isInf) 
            return false;

        return this.y.mul(this.y).eq(
            this.x.mul(
                this.x.mul(this.x)
            ).add(
                this.x.fromBigInt(BigNumber.from(4)).mulNonres()
            )
        )
    }
    pointNegate(): point {
        return new point(
            this.x,
            this.y.zero().sub(this.y),
            this.isInf
        )
    }
    pointAtInfinity(): point {
        return new point(
            this.x.zero(),
            this.y.zero(),
            true
        )
    }
}

function pointDouble(p: point): point {
    if (p.isInf) {
        return p
    }

    let slope, x3, y3;
    slope = (p.x.mul(p.x).mul(p.x.fromBigInt(BigNumber.from(3)))).mul((p.y.mul(p.y.fromBigInt(BigNumber.from(2)))).inv())
    x3 = (slope.mul(slope)).sub((p.x.mul(p.x.fromBigInt(BigNumber.from(2)))))
    y3 = ((p.x.sub(x3)).mul(slope)).sub(p.y)

    return new point (x3, y3, false)
}

function pointAdd(p: point, q: point): point {
    if (p.isInf) {
        return q
    }
    if (q.isInf) {
        return p
    }

    if (p.x.eq(q.x) && p.y.eq(q.y)) {
        return pointDouble(p);
    } else if (p.x.eq(q.x) && !p.y.eq(q.y)) {
        return p.pointAtInfinity(); 
    } 

    let slope, x3, y3

    let b1 = q.x.sub(p.x)
    slope = b1.inv()
    let theSub = q.y.sub(p.y)

    slope = theSub.mul(slope)

    x3 = (slope.mul(slope)).sub((p.x.add(q.x)))
    y3 = ((p.x.sub(x3)).mul(slope)).sub(p.y)
    
    return new point(x3, y3, false);
}

let zeroFp1 = new Fp1 (BigNumber.from(0))
let oneFp1 = new Fp1 (BigNumber.from(1))
let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (oneFp1, zeroFp1)
let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)

// TODO: test 
function untwist(fp2Point: point): point {
    // FIXME: what if the point is point at infinity

    let root = new Fp6(zeroFp2, oneFp2, zeroFp2)
    let fp2PointX = fp2Point.x as Fp2
    let wideXA0 = new Fp6(fp2PointX, zeroFp2, zeroFp2)
    let wideX = new Fp12(wideXA0, zeroFp6)
    let forInvX = new Fp12(root, zeroFp6)
    wideX = wideX.mul(forInvX.inv())


    let fp2PointY = fp2Point.y as Fp2
    let wideYA0 = new Fp6(fp2PointY, zeroFp2, zeroFp2)
    let wideY = new Fp12(wideYA0, zeroFp6)
    let forInvY = new Fp12(zeroFp6, root)
    wideY = wideY.mul(forInvY.inv())

    return new point(wideX, wideY, false)
}

function pointMul(scalar: BigNumber, base: point): point {
    if (base.isInf) {
        return base.pointAtInfinity()
    }
    if (
        base.isOnCurve() && 
        scalar.gt(BigNumber.from(0))
    ) {
        return pointMulHelper(scalar, base, new point(base.x.zero(), base.x.zero(), true));
    } else if (base.isOnCurve() && scalar.eq(BigNumber.from(0))) {
        return base.pointAtInfinity();
    } else if (base.isOnCurve() && scalar.lte(BigNumber.from(0))) {
        return pointMulHelper(scalar.mul(BigNumber.from(-1)), base.pointNegate(), base.pointAtInfinity());
    }

    // TODO: add some assert validity function to check the inputs first
    throw "error: is not on curve"
}
  
function pointMulHelper(scalar: BigNumber, base: point, accum: point): point {
    if (scalar.eq(BigNumber.from(0))) {
        return accum;
    }
    const doubleBase = pointAdd(base, base);
    if ((scalar.mod(BigNumber.from(2))).eq(BigNumber.from(1))) {
        pointAdd(accum, base)
        return pointMulHelper(scalar.div(BigNumber.from(2)), doubleBase, pointAdd(accum, base));
    } else {
        return pointMulHelper(scalar.div(BigNumber.from(2)), doubleBase, accum);
    }
}

function powHelper(a0: Fp, exp: BigNumber, result: Fp): Fp {
    if (exp.lte(BigNumber.from(1))) {
      return a0;
    }
    const accum = powHelper(a0, exp.div(BigNumber.from(2)), result);
    if (exp.mod(BigNumber.from(2)).eq(BigNumber.from(0))) {
      return accum.mul(accum);
    } else {
      return accum.mul(accum).mul(a0);
    }
}

export { untwist, pointDouble, pointAdd, pointMul, powHelper, point }