
import { Fp1, Fp2, Fp6, Fp12 } from "./fields"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "./fields"
import { BigNumber } from "@ethersproject/bignumber";
import { order } from "./fields"

class point {
    public x: Fp1 | Fp2 | Fp6 | Fp12;
    public y: Fp1 | Fp2 | Fp6 | Fp12;
    public isInf: Boolean;
    constructor(
        x: Fp1 | Fp2 | Fp6 | Fp12, 
        y: Fp1 | Fp2 | Fp6 | Fp12, 
        isInf: boolean
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
    isInSubGroup() {
        let mustInf = pointMul(order, this)
        return mustInf.isInf;
    }
    eq(q: point) {
        if (this.isInf) {
            return this.isInf == q.isInf
        } else {
            return this.x.eq(q.x) && this.y.eq(q.y) && this.isInf == q.isInf
        }
    }

    isOnCurve() {
        if (this.x instanceof Fp1) {
            return this.isOnCurveG1()
        } else if (this.x instanceof Fp2) {
            return this.isOnCurveG2()
        } else {
            throw "error"
        }
    }
    isOnCurveG1() {
        return this.y.mul(this.y).eq(
            this.x.mul(
                this.x.mul(this.x)
            ).add(
                fp1FromBigInt(BigNumber.from(4))
            )
        )
    }

    isOnCurveG2() {
        // FIXME: fix this part 
        // TODO check point at infinity
        return this.y.mul(this.y).eq(
            this.x.mul(
                this.x.mul(this.x)
            ).add(
                this.x.fromBigInt(BigNumber.from(4)).mulNonres()
            )
        )
    }
}

function pointDouble(p) {
    if (p.isInf) {
        return p
    }

    let slope, x3, y3;
    slope = (p.x.mul(p.x).mul(p.x.fromBigInt(BigNumber.from(3)))).mul((p.y.mul(p.y.fromBigInt(BigNumber.from(2)))).inv())
    x3 = (slope.mul(slope)).sub((p.x.mul(p.x.fromBigInt(BigNumber.from(2)))))
    y3 = ((p.x.sub(x3)).mul(slope)).sub(p.y)

    return new point (x3, y3, 0)
}

function pointAdd(p, q) {
    if (p.isInf) {
        return q
    }
    if (q.isInf) {
        return p
    }

    if (p.x.eq(q.x) && p.y.eq(q.y)) {
        return pointDouble(p);
    } else if (p.x.eq(q.x) && !p.y.eq(q.y)) {
        return new point(BigNumber.from(0),BigNumber.from(0), 0); 
    } else {
        let slope, x3, y3

        let b1 = q.x.sub(p.x)
        slope = b1.inv()
        let theSub = q.y.sub(p.y)

        slope = theSub.mul(slope)

        x3 = (slope.mul(slope)).sub((p.x.add(q.x)))
        y3 = ((p.x.sub(x3)).mul(slope)).sub(p.y)
        
        return new point(x3, y3, 0);
    }
}

let zeroFp1 = new Fp1 (BigNumber.from(0))
let oneFp1 = new Fp1 (BigNumber.from(1))
let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (zeroFp1, oneFp1)
let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)

function untwist(fp2Point) {
    let root = new Fp6(zeroFp2, oneFp2, zeroFp2)
    let wideXA0 = new Fp6(zeroFp2, zeroFp2, fp2Point.x)
    let wideX = new Fp12(zeroFp6, wideXA0)
    let forInvX = new Fp12(zeroFp6, root)
    wideX = wideX.mul(forInvX.inv())

    let wideYA0 = new Fp6(zeroFp2, zeroFp2, fp2Point.y)
    let wideY = new Fp12(zeroFp6, wideYA0)
    let forInvY = new Fp12(root, zeroFp6)
    wideY = wideY.mul(forInvY.inv())

    return new point(wideX, wideY, 0)
}

function pointMul(scalar, base) {
    if (
        // base.isOnCurve() && 
        scalar.gt(BigNumber.from(0))) {
        // TODO: adding a zero point (an instance of point at infinity which its components is zero but its 
        // isInf flag is not necessarily true) {PointAtInfinity}
        // return pointMulHelper(scalar, base, PointAtInfinity);

        return pointMulHelper(scalar, base, new point(base.x.zero(), base.x.zero(), true));

        // if (base.x instanceof BigNumber) {
        //     return pointMulHelper(scalar, base, new point(BigNumber.from(0), BigNumber.from(0)));
        // }
        // else
        //     return pointMulHelper(scalar, base, new point(base.x.zero(), base.x.zero()));
    } else if (base.isOnCurve() && scalar.eq(BigNumber.from(0))) {
        return null;
    } else if (base.isOnCurve() && scalar.lte(BigNumber.from(0))) {
        // TODO
        // return pointMulHelper(scalar.mul(BigNumber.from(-1)), pointNegate(base), PointAtInfinity);
    }
}
  
function pointMulHelper(scalar, base, accum) {
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

export { untwist, pointDouble, pointAdd }