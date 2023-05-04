import { Fp1, Fp2, Fp12, BLS_X_LEN, bitGet, curveX } from "./fields"
import { zeroFp12, oneFp12, oneFp2 } from "./fields";
import { point } from "./points"

function calcPairingPrecomputes(x: Fp2, y: Fp2) {
    const Qx = x, Qy = y, Qz = oneFp2;
    let Rx = Qx, Ry = Qy, Rz = Qz;
    let ell_coeff: [Fp2, Fp2, Fp2][] = [];
    for (let i = BLS_X_LEN - 2; i >= 0; i--) {
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
  
export { pairing }
