import { untwist, pointDouble, pointAdd, point } from "./points"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt, order, groupOrder } from "./fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "./fields"
let zeroFp1 = new Fp1 (BigNumber.from(0))
let oneFp1 = new Fp1 (BigNumber.from(1))
let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)

function doubleEval(fp2Point: point, fpPoint: point) {
    console.log("doubleEval...")
    let wideR = untwist(fp2Point)
    console.log("==========")
    wideR.x.displayInfo()
    wideR.y.displayInfo()
    console.log("==========")

    let slope = (
        wideR.x.mul(wideR.x).mul(fp12FromBigInt(BigNumber.from(3)))
    ).mul(
        wideR.y.mul(fp12FromBigInt(BigNumber.from(2))).inv()
    )
    let v = wideR.y.sub(
        slope.mul(wideR.x)
    )

    let fpPointY = fpPoint.y as Fp1
    let fpPointX = fpPoint.x as Fp1

    console.log("...doubleEval")

    return fp12FromBigInt(fpPointY.a0).sub(
        fp12FromBigInt(fpPointX.a0).mul(slope)
    ).sub(
        v
    )
}

function addEvalHelper(fp12PointR: point, fp12PointQ: point, fpPoint: point) {
    console.log("addEvalHelper...")

    // fp12PointR.displayInfo()
    // fp12PointQ.displayInfo()

    console.log("addEvalHelper ------")

    // console.log("QX")
    // fp12PointQ.x.displayInfo()
    // console.log("QY")
    // fp12PointQ.y.displayInfo()
    

    // console.log("RX")
    // fp12PointR.x.displayInfo()
    // console.log("RY")
    // fp12PointR.y.displayInfo()

    console.log("addEvalHelper ------")
    

    let slope = (fp12PointQ.y.sub(fp12PointR.y)).mul(
        (
            fp12PointQ.x.sub(fp12PointR.x)
        ).inv()
    )

    console.log("addEvalHelper after slope")

    let v = (
        (
            fp12PointQ.y.mul(fp12PointR.x)
        ).sub(
            fp12PointR.y.mul(fp12PointQ.x)
        )
    ).mul(
        (
            fp12PointR.x.sub(fp12PointQ.x)
        ).inv()
    )

    console.log("addEvalHelper after v")

    let fpPointY = fpPoint.y as Fp1
    let fpPointX = fpPoint.x as Fp1

    console.log("...addEvalHelper")

    return fp12FromBigInt(fpPointY.a0).sub(
        fp12FromBigInt(fpPointX.a0).mul(slope)
    ).sub(
        v
    )
}

function addEval(fp2PointR: point, fp2PointQ: point, fpPoint: point) {
    console.log("addEval...")
    let wideR = untwist(fp2PointR)
    let wideQ = untwist(fp2PointQ)

    let wideQY = wideQ.y as Fp12
    let wideRX = wideR.x as Fp12

    if (wideR.x.eq(wideQ.x) && wideR.y.eq(zeroFp12.sub(wideQY))) {
        console.log("addEval if")
        let fpPointX = fpPoint.x as Fp1
        return fp12FromBigInt(fpPointX.a0).sub(wideRX)
    } else {
        console.log("addEval else")
        return addEvalHelper(wideR, wideQ, fpPoint)
    }

    console.log("...addEval")
}

function millerHelper(fpPointP: point, fp2PointQ: point, fp2PointR: point, boolsArr: Boolean[], fp12Result: Fp12): Fp12 {
    console.log("millerHelper...")
    if (boolsArr.length == 0) {
        fp12Result.displayInfo()
        return fp12Result;
    }

    console.log("millerHelper before accm")

    let accum = fp12Result.mul(fp12Result).mul(doubleEval(fp2PointR, fpPointP))

    console.log("millerHelper after accm")

    let doubleR = pointDouble(fp2PointR)

    console.log("millerHelper after double")

    if (boolsArr[0]) {
        boolsArr.shift()
        return millerHelper(fpPointP, fp2PointQ, pointAdd(doubleR, fp2PointQ), boolsArr, accum.mul(addEval(doubleR, fp2PointQ, fpPointP)))
    } else {
        boolsArr.shift()
        return millerHelper(fpPointP, fp2PointQ, doubleR, boolsArr, accum)
    }
}

function miller(fpPointP: point, fp2PointQ: point): Fp12 {

    let iterations : Boolean[] = [];

    let b = BigNumber.from("0xd201000000010000");

    while (b.gt(BigNumber.from(0))) {
        let theBool = b.mod(BigNumber.from(2)).gt(BigNumber.from(0))

        iterations.push(theBool);
        // b >>= BigNumber.from(1);
        b = b.div(BigNumber.from(2));
    }

    iterations.reverse().splice(0, 1); // remove first element

    return millerHelper(fpPointP, fp2PointQ, fp2PointQ, iterations, fp12FromBigInt(BigNumber.from(1)))
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

function pointMulHelper(scalar: BigNumber, base: point, accum: point): any {
    // console.log(scalar)
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

function pointMul(scalar: BigNumber, base: point) {
    if (
        base.isOnCurve() && 
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
        return pointMulHelper(scalar.mul(BigNumber.from(-1)), base.pointNegate(), base.pointAtInfinity());
    }
}

function pairing(p: point, q: point): Fp12 {
    // TODO:
    // if (p == PointAtInfinity || q == PointAtInfinity) {
    //     return null;
    // }
    console.log(p)
    console.log(p.isOnCurve())
    console.log(p.isInSubGroup())
    console.log(q)
    console.log(q.isOnCurve())
    console.log(q.isInSubGroup())
    if (p.isOnCurve() && p.isInSubGroup() && q.isOnCurve() && q.isInSubGroup()) {
        return powHelper(miller(p, q), ((order.pow(12)).sub(BigNumber.from(1))).div(groupOrder), oneFp1) as Fp12;
    } else {
        // FIXME:
        // return null;
    }

    return zeroFp12
}
  
export { pairing, pointMul, miller, doubleEval, addEval }
