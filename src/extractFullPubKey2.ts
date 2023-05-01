function sqrt(n: bigint, p: bigint): bigint[] {
  if (n === 0n) {
    return [0n];
  }
  if (p % 4n !== 3n) {
    throw new Error('Invalid prime field for square root computation');
  }
  let s = p - 1n;
  let e = 0n;
  while (s % 2n === 0n) {
    s = s >> 1n;
    e = e + 1n;
  }
  let z = 2n;
  while (legendre(z, p) !== p - 1n) {
    z = z + 1n;
  }
  let y = modExp(n, (s + 1n) / 2n, p);
  let x = modExp(n, s, p);
  let b = modExp(z, s, p);
  while (x !== 1n) {
    let m = 0n;
    let t = x;
    while (t !== 1n) {
      t = modExp(t, 2n, p);
      m = m + 1n;
    }
    let b1 = modExp(b, 2n ** (e - m - 1n), p);
    e = m;
    x = (x * b1 * b1) % p;
    y = (y * b1) % p;
    b = (b1 * b1) % p;
  }
  return [y, p - y];
}

function legendre(a: bigint, p: bigint): bigint {
  return modExp(a, (p - 1n) / 2n, p);
}

function modExp(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  return result;
}


function discover(): void {
  let n = 2n

// p should be prime
let p = 113n

let x = sqrt(n, p);

  console.log("x: ", x)
}

discover()