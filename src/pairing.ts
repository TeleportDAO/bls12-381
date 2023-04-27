import { Fp, Fp1, Fp2, Fp6, Fp12, BLS_X_LEN, bitGet, curveX } from "./fields"
import { zeroFp12, oneFp12, zeroFp6, oneFp6, zeroFp2, oneFp2, zeroFp1, oneFp1 } from "./fields";
import { mod, fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt, order, groupOrder } from "./fields"
import { untwist, pointDouble, pointAdd, powHelper, point } from "./points"

function doubleEval(fp2Point: point, fpPoint: point) {
    let wideR = untwist(fp2Point)

    let slope = (
        wideR.x.mul(wideR.x).mul(fp12FromBigInt(3n))
    ).mul(
        wideR.y.mul(fp12FromBigInt(2n)).inv()
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


function millerHelper(fpPointP: point, fp2PointQ: point, fp2PointR: point, boolsArr: boolean[], fp12Result: Fp12): Fp12 {
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

    let iterations : boolean[] = [];

    let b = 0xd201000000010000n

    while (b > 0n) {
        let theBool = mod(b, 2n) > 0n
        
        iterations.push(theBool);
        // b >>= BigNumber.from(1);
        b = b >> 1n;
    }

    iterations.reverse().splice(0, 1); // remove first element

    return millerHelper(fpPointP, fp2PointQ, fp2PointQ, iterations, fp12FromBigInt(1n))
}

function oldPairing(p: point, q: point): Fp12 {

    if ( p.isInf || q.isInf ) {
        return zeroFp12;
    }

    if (
        p.isOnCurve() && 
        p.isInSubGroup() && 
        q.isOnCurve() && 
        q.isInSubGroup()
    ) {
        // let bigNumberOrder = BigNumber.from(order.toString())
        // bigNumberOrder = (bigNumberOrder.pow(12)).sub(BigNumber.from(1))
        // console.log("before miller", new Date())
        // let millerRes = miller(p, q)
        // let theSecond = (BigInt(bigNumberOrder.toHexString())) / (groupOrder)
        // console.log("after miller", new Date())
        // let powRes = powHelper(millerRes, theSecond, oneFp12) as Fp12
        
        // console.log("after power", new Date())
        
        // return powRes;
        return oneFp12
    } else {
        return zeroFp12;
    }
}



function calcPairingPrecomputes(x: Fp2, y: Fp2) {
    // prettier-ignore
    const Qx = x, Qy = y, Qz = oneFp2;
    // prettier-ignore
    let Rx = Qx, Ry = Qy, Rz = Qz;
    let ell_coeff: [Fp2, Fp2, Fp2][] = [];
    for (let i = BLS_X_LEN - 2; i >= 0; i--) {
      // Double
      let t0 = Ry.square(); // Ry²
      let t1 = Rz.square(); // Rz²
      let t2 = t1.mulScalar(3n).multiplyByB(); // 3 * T1 * B
      let t3 = t2.mulScalar(3n); // 3 * T2
      let t4 = Ry.add(Rz).square().sub(t1).sub(t0); // (Ry + Rz)² - T1 - T0
      ell_coeff.push([
        t2.sub(t0), // T2 - T0
        Rx.square().mulScalar(3n), // 3 * Rx²
        t4.negate(), // -T4
      ]);
      Rx = t0.sub(t3).mul(Rx).mul(Ry).divScalar(2n); // ((T0 - T3) * Rx * Ry) / 2
      Ry = t0.add(t3).divScalar(2n).square().sub(t2.square().mulScalar(3n)); // ((T0 + T3) / 2)² - 3 * T2²
      Rz = t0.mul(t4); // T0 * T4
      if (bitGet(curveX, i)) {
        // Addition
        let t0 = Ry.sub(Qy.mul(Rz)); // Ry - Qy * Rz
        let t1 = Rx.sub(Qx.mul(Rz)); // Rx - Qx * Rz
        ell_coeff.push([
          t0.mul(Qx).sub(t1.mul(Qy)), // T0 * Qx - T1 * Qy
          t0.negate(), // -T0
          t1, // T1
        ]);
        let t2 = t1.square(); // T1²
        let t3 = t2.mul(t1); // T2 * T1
        let t4 = t2.mul(Rx); // T2 * Rx
        let t5 = t3.sub(t4.mulScalar(2n)).add(t0.square().mul(Rz)); // T3 - 2 * T4 + T0² * Rz
        Rx = t1.mul(t5); // T1 * T5
        Ry = t4.sub(t5).mul(t0).sub(t3.mul(Ry)); // (T4 - T5) * T0 - T3 * Ry
        Rz = Rz.mul(t3); // Rz * T3
      }
    }
    return ell_coeff;
}

function millerLoop(ell: [Fp2, Fp2, Fp2][], g1: [Fp1, Fp1]): Fp12 {
    const Px = g1[0].a0;
    const Py = g1[1].a0;
    let f12 = oneFp12;
    for (let j = 0, i = BLS_X_LEN - 2; i >= 0; i--, j++) {
      const E = ell[j];
      f12 = f12.multiplyBy014(E[0], E[1].mulScalar(Px), E[2].mulScalar(Py));
      if (bitGet(curveX, i)) {
        j += 1;
        const F = ell[j];
        f12 = f12.multiplyBy014(F[0], F[1].mulScalar(Px), F[2].mulScalar(Py));
      }
      if (i !== 0) f12 = f12.square();
    }
    return f12.conjugate();
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
        return millerLoop(
            calcPairingPrecomputes(q.x as Fp2, q.y as Fp2), 
            [p.x as Fp1, p.y as Fp1]
        )
    } else {
        return zeroFp12;
    }
}
  
export { pairing, miller, doubleEval, addEval }
