import { BigNumber } from "@ethersproject/bignumber";
import {fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt, order, groupOrder, Fp } from "./fields"

function mod(a: bigint, b: bigint): bigint {
    return ((a % b) + b) % b;
}
  
function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = mod(base, modulus);
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = mod(result * base, modulus);
      }
      exponent = exponent >> 1n
      base = mod(base * base, modulus);
    }
    return result;
}
  
function tonelliShanks(n: bigint, p: bigint): bigint | null {
    if (modPow(n, (p - 1n) / 2n, p) !== 1n) {
      return null;
    }
  
    let q = p - 1n;
    let s = 0n;
    while (q % 2n === 0n) {
      q = q / 2n;
      s += 1n;
    }
  
    if (s === 1n) {
      return modPow(n, (p + 1n) / 4n, p);
    }
  
    let z = 2n;
    while (modPow(z, (p - 1n) / 2n, p) !== p - 1n) {
      z += 1n;
    }
  
    let c = modPow(z, q, p);
    let r = modPow(n, (q + 1n) / 2n, p);
    let t = modPow(n, q, p);
    let m = s;
    while (t !== 1n) {
      let i = 0n;
      let e = t;
      while (e !== 1n) {
        e = modPow(e, 2n, p);
        i += 1n;
      }
      const b = modPow(c, modPow(2n, m - i - 1n, p - 1n), p);
      r = mod(r * b, p);
      c = modPow(b, 2n, p);
      t = mod(t * c, p);
      m = i;
    }
    return r;
}
  
function squareRootInFiniteField(n: bigint, p: bigint): bigint[] {
    const root1 = tonelliShanks(n, p);
    if (root1 === null) {
      return [];
    }
    const root2 = p - root1;
    return [root1, root2];
}

function isStringLexicographicallyLarger(str1: string, str2: string): boolean {
  // iterate over the characters in both strings
  for (let i = 0; i < str1.length && i < str2.length; i++) {
    const char1 = str1.charCodeAt(i);
    const char2 = str2.charCodeAt(i);

    // if the characters are not equal, return the result of the comparison
    if (char1 !== char2) {
      return char1 > char2;
    }
  }

  // if the strings are equal up to this point, return the result based on the length
  return str1.length > str2.length;
}

function doTask(): void {

  let publicKey = 0xa1b2947b95e0f4d1887ee25007e4dba746278322d39743125e94a805cbd2bb93b4fd4805750edf7511abc955d2b81aban

  let x = 261281193191115322981099566287862169080487090734100453656830304501609868535289237715777068036456589256261662939834n
  // let x = 3071902358779104425805220059913391042958977442368743450008922736970201383908820407429457646333339330346464018568299n
  // let x = 2161127915233324357269557240370954667705778757657399697015103965705915888376376158045161631554980345168059638817225n
  console.log("x: ", x.toString(16))
  x = x * x * x
  x = x + 4n

  const roots = squareRootInFiniteField(x, order);
  
  console.log(roots); // should output [62, 51]
  console.log(roots[0])
  console.log(roots[0].toString(16))
  // console.log(BigNumber.from(roots[0]).toHexString())

  console.log(roots[1])
  console.log(roots[1].toString(16))
  // console.log(BigNumber.from(roots[1]).toHexString())

  let isRoot0largerlexicographically = isStringLexicographicallyLarger(
    roots[0].toString(16),
    roots[1].toString(16)
  )

  console.log("y part of public key")

  if (publicKey > 2n ** 383n) {
    if (isRoot0largerlexicographically) {
      console.log(roots[0])
    } else {
      console.log(roots[1])
    }
  }

}

doTask()
