import { Fp, Fp1, Fp2, Fp6, Fp12 } from "./fields"
import { mod, fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt, order, groupOrder } from "./fields"
import { untwist, pointDouble, pointAdd, powHelper, point } from "./points"

// TODO: import from fields.ts
let zeroFp1 = new Fp1 (0n)
let oneFp1 = new Fp1 (1n)
let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (oneFp1, zeroFp1)
let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let oneFp6 = new Fp6 (oneFp2, zeroFp2, zeroFp2)
let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)
let oneFp12 = new Fp12 (oneFp6, zeroFp6)

function doubleEval(fp2Point: point, fpPoint: point) {
    let wideR = untwist(fp2Point)

    let slope = (
        wideR.x.mul(wideR.x).mul(fp12FromBigInt(3n))
    ).mul(
        wideR.y.mul(fp12FromBigInt(3n)).inv()
    )
    let v = wideR.y.sub(
        slope.mul(wideR.x)
    )

    let fpPointY = fpPoint.y as Fp1
    let fpPointX = fpPoint.x as Fp1

    return fp12FromBigInt(fpPointY.a0).sub(
        fp12FromBigInt(fpPointX.a0).mul(slope)
    ).sub(
        v
    )
}

function addEvalHelper(fp12PointR: point, fp12PointQ: point, fpPoint: point) {
    

    let slope = (fp12PointQ.y.sub(fp12PointR.y)).mul(
        (
            fp12PointQ.x.sub(fp12PointR.x)
        ).inv()
    )

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

    let fpPointY = fpPoint.y as Fp1
    let fpPointX = fpPoint.x as Fp1

    return fp12FromBigInt(fpPointY.a0).sub(
        fp12FromBigInt(fpPointX.a0).mul(slope)
    ).sub(
        v
    )
}

function addEval(fp2PointR: point, fp2PointQ: point, fpPoint: point) {
    let wideR = untwist(fp2PointR)
    let wideQ = untwist(fp2PointQ)

    let wideQY = wideQ.y as Fp12
    let wideRX = wideR.x as Fp12

    if (wideR.x.eq(wideQ.x) && wideR.y.eq(zeroFp12.sub(wideQY))) {
        let fpPointX = fpPoint.x as Fp1
        return fp12FromBigInt(fpPointX.a0).sub(wideRX)
    } else {
        return addEvalHelper(wideR, wideQ, fpPoint)
    }
}

function millerHelper(fpPointP: point, fp2PointQ: point, fp2PointR: point, boolsArr: Boolean[], fp12Result: Fp12): Fp12 {
    if (boolsArr.length == 0) {
        return fp12Result;
    }

    let accum = fp12Result.mul(fp12Result).mul(doubleEval(fp2PointR, fpPointP))

    let doubleR = pointDouble(fp2PointR)

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

    let b = 0xd201000000010000n

    while (b > 0n) {
        let theBool = mod(b, 2n) > 0n
        
        iterations.push(theBool);
        // b >>= BigNumber.from(1);
        b = b / 2n;
    }

    iterations.reverse().splice(0, 1); // remove first element

    return millerHelper(fpPointP, fp2PointQ, fp2PointQ, iterations, fp12FromBigInt(1n))
}



function pairing(p: point, q: point): Fp12 {

    if ( p.isInf || q.isInf ) {
        return zeroFp12;
    }

    if (
        p.isOnCurve() && 
        p.isInSubGroup() && 
        q.isOnCurve() && 
        q.isInSubGroup()
        ) {
        return powHelper(miller(p, q), ((order ^ (12n)) - (1n)) / (groupOrder), oneFp12) as Fp12;
    } else {
        return zeroFp12;
    }
}
  
export { pairing, miller, doubleEval, addEval }
