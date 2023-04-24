import { BigNumber } from "@ethersproject/bignumber";

let order: BigNumber = BigNumber.from("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab")
let groupOrder: BigNumber = BigNumber.from("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001")

const curveX = BigNumber.from("0xd201000000010000")
function bitLen(n: BigNumber) {
    let len;
    for (len = 0; n.gt(BigNumber.from(0)); n.div(2), len += 1);
    return len;
}
const BLS_X_LEN = bitLen(curveX);

// TODO maybe change big number to big int
function bitGet(n: bigint, pos: number) {
  return (n >> BigInt(pos)) & 1n;
}

// TODO change to fp2 instance
const FP12_FROBENIUS_COEFFICIENTS = [
    [0x1n, 0x0n],
    [
      0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
      0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
    ],
    [
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffffn,
      0x0n,
    ],
    [
      0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
      0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
    ],
    [
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
      0x0n,
    ],
    [
      0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
      0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
    ],
    [
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x0n,
    ],
    [
      0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
      0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
    ],
    [
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
      0x0n,
    ],
    [
      0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
      0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
    ],
    [
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaadn,
      0x0n,
    ],
    [
      0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
      0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
    ],
  ]

const beea = (
    u: BigNumber, 
    v: BigNumber, 
    x1: BigNumber, 
    x2: BigNumber, 
    p: BigNumber
) => {
    let firstU = u;
    let theInv = BigNumber.from(0)

    while (!u.eq(BigNumber.from(1)) && !v.eq( BigNumber.from(1))) {
        while (u.mod(2).eq(0) && u.gt(0)) {
            u = u.div(2)
            if (x1.mod(2).eq(0))
                x1 = x1.div(2)
            else 
                x1 = (x1.add(p)).div(2)
        }
        while (v.mod(2).eq(0)) {
            v = v.div(2)
            if (x2.mod(2).eq(0))
                x2 = x2.div(2)
            else 
                x2 = (x2.add(p)).div(2)
        }
        if (u.gt(v)) {
            u = u.sub(v)
            x1 = x1.sub(x2)
        } else {
            v = v.sub(u)
            x2 = x2.sub(x1)
        }
    }

    if (u.eq(BigNumber.from(1))) {
        theInv = x1.mod(p)
    }
    else {
        theInv = x2.mod(p)
    }

    return theInv;
    
}

interface Fp{
  	displayInfo(): void;
    inv(): any;
    add(y: any): any;
    sub(y: any): any;
    mul(y: any): any;
    equalOne(): Boolean;
    mulNonres(): any;
    eq(y: any): Boolean;
    fromBigInt(x: BigNumber): any;
    zero(): any;
}

class Fp1 implements Fp {
    public a0: BigNumber;
	constructor(a0: BigNumber){
      	this.a0 = a0;
    }
  	displayInfo() {
        console.log("a0: ", this.a0)
    }
    inv(): Fp1{
        return new Fp1(
            beea(
                this.a0,
                order, 
                BigNumber.from(1), 
                BigNumber.from(0), 
                order
            )
        )
    }
    add(y: Fp1): Fp1 {
        return new Fp1(
            this.a0.add(y.a0).mod(order)
        )
    }
    sub(y: Fp1): Fp1 {
        return new Fp1(
            this.a0.sub(y.a0).mod(order)
        )
    }
    mul(y: Fp1): Fp1 {
        return new Fp1(
            this.a0.mul(y.a0).mod(order)
        )
    }
    equalOne(): Boolean{
        return this.eq(oneFp1)
    }
    mulNonres(): Fp1 {
        return new Fp1(
            this.a0
        )
    }
    eq(y: Fp1): Boolean{
        return this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber): Fp1 {
        return new Fp1(x)
    }
    zero(): Fp1 {
        return zeroFp1
    }
}

let zeroFp1 = new Fp1 (BigNumber.from(0))
let oneFp1 = new Fp1 (BigNumber.from(1))

class Fp2 implements Fp {
    public a1: Fp1;
    public a0: Fp1;
	constructor(a1: Fp1, a0: Fp1){
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("a1: ", this.a1)
        console.log("a1: ", this.a0)
    }
    inv(): Fp2 {
        let factor = (
            (
                (this.a1.mul(this.a1))
            ).add(
                (this.a0.mul(this.a0))
            )
        ).inv()

        return new Fp2(
            this.a1.mul(fp1FromBigInt(BigNumber.from(-1))).mul(factor), 
            this.a0.mul(factor)
        )
    }
    add(y: Fp2): Fp2 {
        return new Fp2(
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp2): Fp2 {
        return new Fp2(
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp2): Fp2 {
        return new Fp2(
            (
                this.a1.mul(y.a0)
            ).add(
                this.a0.mul(y.a1), 
            ),
            (
                this.a0.mul(y.a0)
            ).sub(
                this.a1.mul(y.a1), 
            ),
        )
    }
    equalOne(): Boolean {
        return this.a1.eq(zeroFp1) && this.a0.eq(oneFp1)
    }
    mulNonres(): Fp2 {
        return new Fp2(
            this.a1.add(this.a0),
            this.a0.sub(this.a1)
        )
    }
    eq(y: Fp2): Boolean{
        return this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber): Fp2 {
        return new Fp2(zeroFp1, fp1FromBigInt(x))
    }
    zero(): Fp2 {
        return zeroFp2
    }
}

function fp1FromBigInt(x: BigNumber): Fp1 {
    return new Fp1(x)
}

function fp2FromBigInt(x: BigNumber): Fp2 {
    return new Fp2(zeroFp1,fp1FromBigInt(x))
}

function fp6FromBigInt(x: BigNumber): Fp6 {
    return new Fp6(zeroFp2, zeroFp2, fp2FromBigInt(x))
}

function fp12FromBigInt(x: BigNumber): Fp12 {
    return new Fp12(zeroFp6, fp6FromBigInt(x))
}

let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (zeroFp1, oneFp1)

class Fp6 implements Fp {
    public a2: Fp2;
    public a1: Fp2;
    public a0: Fp2;
	constructor(a2: Fp2, a1: Fp2, a0: Fp2){
        this.a2 = a2;
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo() {
        console.log("a2: ", this.a2)
        console.log("a1: ", this.a1)
        console.log("a0: ", this.a0)
        
    }
    inv(): Fp6 {
        let t0 = (this.a0.mul(this.a0)).sub(this.a1.mul(this.a2).mulNonres())
        let t1 = (this.a2.mul(this.a2)).mulNonres().sub(this.a0.mul(this.a1))
        let t2 = (this.a1.mul(this.a1)).sub(this.a0.mul(this.a2))
        let factor = 
            (
                this.a0.mul(t0)
            ).add(
                (
                    (this.a2.mul(t1)).mulNonres()
                ).add(
                    (this.a1.mul(t2)).mulNonres()
                )
            ).inv()
        return new Fp6(
            t2.mul(factor),
            t1.mul(factor),
            t0.mul(factor)
        )
    }
    add(y: Fp6): Fp6 {
        return new Fp6(
            this.a2.add(y.a2),
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp6): Fp6 {
        return new Fp6(
            this.a2.sub(y.a2),
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp6): Fp6 {
        let t0 = this.a0.mul(y.a0)
        let t1 = (this.a0.mul(y.a1)).add(this.a1.mul(y.a0))
        let t2 = (this.a0.mul(y.a2)).add(this.a1.mul(y.a1)).add(this.a2.mul(y.a0))
        let t3 = ((this.a1.mul(y.a2)).add(this.a2.mul(y.a1))).mulNonres()
        let t4 = (this.a2.mul(y.a2)).mulNonres()
        return new Fp6(
            t2,
            t1.add(t4),
            t0.add(t3)
        )
    }
    equalOne(): Boolean {
        return this.a2.eq(zeroFp2) && this.a1.eq(zeroFp2) && this.a0.eq(oneFp2)
    }
    mulNonres(): Fp6 {
        return new Fp6(
            this.a1,
            this.a0, 
            this.a2.mulNonres()
        )
    }
    eq(y: Fp6): Boolean {
        return this.a2.eq(y.a2) && this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber): Fp6 {
        return new Fp6(zeroFp2, zeroFp2, fp2FromBigInt(x))
    }
    zero(): Fp6 {
        return zeroFp6
    }
}

let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let oneFp6 = new Fp6 (zeroFp2, zeroFp2, oneFp2)

class Fp12 implements Fp {
    public a1: Fp6;
    public a0: Fp6;
	constructor(a1: Fp6, a0: Fp6){
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("fp12")
        console.log("a1: ", this.a1.displayInfo())
        console.log("a0: ", this.a0.displayInfo())
        console.log("end of fp12")
    }
    inv(): Fp12 {
        // this.a0.mul(this.a0).displayInfo()
        // this.a1.mul(this.a1).mulNonres().displayInfo()

        let factor = 
            ((
                this.a0.mul(this.a0)
            ).sub(
                this.a1.mul(this.a1).mulNonres()
            )).inv()
  
        return new Fp12(
            // -1 * a1 * factor
            zeroFp6.sub(this.a1.mul(factor)),
            this.a0.mul(factor)
        )
    }
    add(y: Fp12): Fp12 {
        return new Fp12(
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp12): Fp12 {
        return new Fp12(
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp12): Fp12 {
        return new Fp12(
            (this.a1.mul(y.a0)).add(this.a0.mul(y.a1)),
            (this.a0.mul(y.a0)).add((this.a1.mul(y.a1).mulNonres()))
        )
    }
    equalOne(): Boolean {
        return this.a1.eq(zeroFp6) && this.a0.eq(oneFp6)
    }
    mulNonres(): Fp12{
        throw "error: not mul non res"
    }
    eq(y: Fp12): Boolean {
        return this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber): Fp12 {
        return new Fp12(zeroFp6, fp6FromBigInt(x))
    }
    zero(): Fp12 {
        return zeroFp12
    }

    // TODO implement negate on all fields
    conjugate(): Fp12 {
        return new Fp12(this.a0, this.a1.negate());
    }
    
    // TODO implement frobeniusMap on all fileds
    frobeniusMap(power: number) {
        const r0 = this.a0.frobeniusMap(power);
        const { c0, c1, c2 } = this.a1.frobeniusMap(power);
        const coeff = FP12_FROBENIUS_COEFFICIENTS[power % 12];
        return new Fp12(r0, new Fp6(c0.multiply(coeff), c1.multiply(coeff), c2.multiply(coeff)));
    }
    
    // TODO implement square on all fields
    private Fp4Square(a: Fp2, b: Fp2): { first: Fp2; second: Fp2 } {
        const a2 = a.square();
        const b2 = b.square();
        return {
          first: b2.mulByNonresidue().add(a2), // b² * Nonresidue + a²
          second: a.add(b).square().subtract(a2).subtract(b2), // (a + b)² - a² - b²
        };
    }
    
    private cyclotomicSquare(): Fp12 {
        const { a0: c0c0, a1: c0c1, a2: c0c2 } = this.a0;
        const { a0: c1c0, a1: c1c1, a2: c1c2 } = this.a1;
        const { first: t3, second: t4 } = this.Fp4Square(c0c0, c1c1);
        const { first: t5, second: t6 } = this.Fp4Square(c1c0, c0c2);
        const { first: t7, second: t8 } = this.Fp4Square(c0c1, c1c2);
        let t9 = t8.mulNonres(); // T8 * (u + 1)
        // TODO add multiply function for multiplying by big number
        return new Fp12(
            new Fp6(
            t3.sub(c0c0).multiply(2n).add(t3), // 2 * (T3 - c0c0)  + T3
            t5.sub(c0c1).multiply(2n).add(t5), // 2 * (T5 - c0c1)  + T5
            t7.sub(c0c2).multiply(2n).add(t7)
            ), // 2 * (T7 - c0c2)  + T7
            new Fp6(
            t9.add(c1c0).multiply(2n).add(t9), // 2 * (T9 + c1c0) + T9
            t4.add(c1c1).multiply(2n).add(t4), // 2 * (T4 + c1c1) + T4
            t6.add(c1c2).multiply(2n).add(t6)
            )
        ); // 2 * (T6 + c1c2) + T6
    }
    
    private cyclotomicExp(n: BigNumber) {
        let z = oneFp12;
        for (let i = BLS_X_LEN - 1; i >= 0; i--) {
            z = z.cyclotomicSquare();
            if (bitGet(n, i)) z = z.multiply(this);
          }
        return z;
    }

    // TODO implement invert on all fields
    invert() {
        let { a0, a1 } = this;
        let t = a0.square().subtract(a1.square().mulByNonresidue()).invert();
        return new Fp12(a0.mul(t), a1.mul(t).negate());
    }

    div(rhs: Fp12 | BigNumber): Fp12 {
        const inv = typeof rhs === 'bigint' ? new Fp1(rhs).invert().value : rhs.invert();
        return this.mul(inv);
    }

    multiply(rhs: Fp12 | bigint) {
        if (typeof rhs === 'bigint') return new Fp12(this.a1.multiply(rhs), this.a0.multiply(rhs));
        let { a0, a1 } = this;
        let { a0: r0, a1: r1 } = rhs;
        let t1 = a0.mul(r0);
        let t2 = a1.mul(r1);
        return new Fp12(
            t1.add(t2.mulNonres()),
            a0.add(a1).mul(r0.add(r1)).sub(t1.add(t2))
        );
    }
    
    finalExponentiate() {
        const t0 = this.frobeniusMap(6).div(this);
        const t1 = t0.frobeniusMap(2).mul(t0);
        const t2 = t1.cyclotomicExp(curveX).conjugate();
        const t3 = t1.cyclotomicSquare().conjugate().multiply(t2);
        const t4 = t3.cyclotomicExp(curveX).conjugate();
        const t5 = t4.cyclotomicExp(curveX).conjugate();
        const t6 = t5.cyclotomicExp(curveX).conjugate().multiply(t2.cyclotomicSquare());
        const t7 = t6.cyclotomicExp(curveX).conjugate();
        const t2_t5_pow_q2 = t2.multiply(t5).frobeniusMap(2);
        const t4_t1_pow_q3 = t4.multiply(t1).frobeniusMap(3);
        const t6_t1c_pow_q1 = t6.multiply(t1.conjugate()).frobeniusMap(1);
        const t7_t3c_t1 = t7.multiply(t3.conjugate()).multiply(t1);
        return t2_t5_pow_q2.multiply(t4_t1_pow_q3).multiply(t6_t1c_pow_q1).multiply(t7_t3c_t1);
    }
}

let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)
let oneFp12 = new Fp12 (zeroFp6, oneFp6)

export { Fp, Fp1, Fp2, Fp6, Fp12 }
export { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt }
export { order, groupOrder }