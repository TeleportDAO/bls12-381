import { untwist, pointDouble, pointAdd } from "./points"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "./fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp1, Fp2, Fp6, Fp12 } from "./fields"
let zeroFp1 = new Fp1 (BigNumber.from(0))
let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)

function doubleEval(fp2Point, fpPoint) {
    let wideR = untwist(fp2Point)
    let slope = (
        wideR.x.mul(wideR.x).mul(fp12FromBigInt(BigNumber.from(3)))
    ).mul(
        wideR.y.mul(fp12FromBigInt(BigNumber.from(2))).inv()
    )
    let v = wideR.y.sub(
        slope.mul(wideR.x)
    )

    return fp12FromBigInt(fpPoint.y).sub(
        fp12FromBigInt(fpPoint.x).mul(slope)
    ).sub(
        v
    )
}

function addEvalHelper(fp12PointR, fp12PointQ, fpPoint) {
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

    return fp12FromBigInt(fpPoint.y).sub(
        fp12FromBigInt(fpPoint.x).mul(slope)
    ).sub(
        v
    )
}

function addEval(fp2PointR, fp2PointQ, fpPoint) {
    let wideR = untwist(fp2PointR)
    let wideQ = untwist(fp2PointQ)
    if (wideR.x.eq(wideQ.x) && wideR.y.eq(zeroFp12.sub(wideQ.y))) {
        return fp12FromBigInt(fpPoint.x).sub(wideR.x)
    } else {
        return addEvalHelper(wideR, wideQ, fpPoint)
    }
}

function millerHelper(fpPointP, fp2PointQ, fp2PointR, boolsArr, fp12Result) {
    console.log("millerHelper...")
    if (boolsArr.length == 0) {
        fp12Result.displayInfo()
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

function miller(fpPointP, fp2PointQ) {

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

function powHelper(a0, exp, result) {
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
