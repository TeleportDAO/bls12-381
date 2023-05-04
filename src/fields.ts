
let order: bigint = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
let groupOrder: bigint = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n

function mod(a: bigint, b: bigint) {
    const res = a % b;
    return res >= 0n ? res : b + res;
}

const beea = (
    u: bigint, 
    v: bigint, 
    x1: bigint, 
    x2: bigint, 
    p: bigint
) => {
    let theInv = 0n

    while (u != 1n && v != 1n) {
        while (mod(u, 2n) == 0n && u > 0n) {
            u = u / 2n
            if (mod(x1, 2n) == 0n)
                x1 = x1 / 2n
            else 
                x1 = (x1 + p) / 2n
        }
        while (mod(v, 2n) == 0n) {
            v = v / 2n
            if (mod(x2, 2n) == 0n )
                x2 = x2 / 2n
            else 
                x2 = (x2 + p) / 2n
        }
        if (u > v) {
            u = u - v
            x1 = x1 - x2
        } else {
            v = v - u
            x2 = x2 -x1
        }
    }

    if (u == 1n) {
        theInv = mod(x1, p)
    }
    else {
        theInv = mod(x2, p)
    }

    return theInv;
    
}

interface Fp{
  	displayInfo(): void;
    inv(): any;
    add(y: any): any;
    sub(y: any): any;
    mul(y: any): any;
    mulScalar(y: bigint): any;
    div(y: any): any;
    divScalar(y: bigint): any;
    equalOne(): Boolean;
    mulNonres(): any;
    eq(y: any): Boolean;
    fromBigInt(x: bigint): any;
    zero(): any;
    frobeniusMap(p: number): any;
    negate(): any;
}

class Fp1 implements Fp {
    public a0: bigint;
	constructor(a0: bigint){
      	this.a0 = mod(a0, order);
    }
  	displayInfo() {
        console.log("a0: ", this.a0.toString(16))
    }
    inv(): Fp1{
        return new Fp1(
            beea(
                this.a0,
                order, 
                1n, 
                0n, 
                order
            )
        )
    }
    add(y: Fp1): Fp1 {
        return new Fp1(
            mod(this.a0 + y.a0, order)
        )
    }
    sub(y: Fp1): Fp1 {
        return new Fp1(
            mod(this.a0 - y.a0, order)
        )
    }
    mul(y: Fp1): Fp1 {
        return new Fp1(
            mod(this.a0 * y.a0, order)
        )
    }
    mulScalar(y: bigint): Fp1 {
        return new Fp1(
            mod(this.a0 * y, order)
        )
    }
    div(y: Fp1): Fp1 {
        return this.mul(y.inv())
    }
    divScalar(y: bigint): Fp1 {
        return new Fp1(
            mod(this.a0 / y, order)
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
        return this.a0 == y.a0
    } 
    fromBigInt(x: bigint): Fp1 {
        return new Fp1(x)
    }
    zero(): Fp1 {
        return zeroFp1
    }
    frobeniusMap(p: number): Fp1{
        throw "error un-implemented"
    }
    negate(): Fp1 {
        return new Fp1(mod(-this.a0, order))
    }
    // invert(): Fp {
    //     return new Fp1(invert(this.a0));
    // }
}

let zeroFp1 = new Fp1 (0n)
let oneFp1 = new Fp1 (1n)

class Fp2 implements Fp {
    public a0: Fp1;
    public a1: Fp1;
    
	constructor(a0: Fp1, a1: Fp1){
        this.a0 = a0;
    	this.a1 = a1;
    }
  	displayInfo(){
        console.log("a0: ", this.a0)
        console.log("a1: ", this.a1)
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
            this.a0.mul(factor),
            this.a1.mul(fp1FromBigInt(-1n)).mul(factor)
        )
    }
    add(y: Fp2): Fp2 {
        return new Fp2(
            this.a0.add(y.a0),
            this.a1.add(y.a1)
        )
    }
    sub(y: Fp2): Fp2 {
        return new Fp2(
            this.a0.sub(y.a0),
            this.a1.sub(y.a1)
        )
    }
    mul(y: Fp2): Fp2 {
        return new Fp2(
            (
                this.a0.mul(y.a0)
            ).sub(
                this.a1.mul(y.a1), 
            ),
            (
                this.a1.mul(y.a0)
            ).add(
                this.a0.mul(y.a1), 
            ),
        )
    }
    mulScalar(y: bigint): Fp2 {
        return new Fp2(
            this.a0.mulScalar(y),
            this.a1.mulScalar(y)
        )
    }
    multiplyByB() {
        let c0 = this.a0;
        let c1 = this.a1;
        let t0 = c0.mulScalar(4n); // 4 * c0
        let t1 = c1.mulScalar(4n); // 4 * c1
        // (T0-T1) + (T0+T1)*i
        return new Fp2(t0.sub(t1), t0.add(t1));
    }
    div(y: Fp2): Fp2 {
        return this.mul(y.inv())
    }
    divScalar(y: bigint): Fp2 {
        let theFp1 = new Fp1(y)
        let theFp1Inv = theFp1.inv()
        return this.mulScalar(theFp1Inv.a0)
    }
    equalOne(): Boolean {
        return this.a1.eq(zeroFp1) && this.a0.eq(oneFp1)
    }
    mulNonres(): Fp2 {
        return new Fp2(
            this.a0.sub(this.a1),
            this.a1.add(this.a0)
        )
    }
    eq(y: Fp2): Boolean{
        return this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: bigint): Fp2 {
        return new Fp2(fp1FromBigInt(x), zeroFp1)
    }
    zero(): Fp2 {
        return zeroFp2
    }
    frobeniusMap(p: number): Fp2{
        return new Fp2(
            this.a0,
            this.a1.mul(
                FP2_FROBENIUS_COEFFICIENTS[p % 2]
            )
        )
    }
    negate(): Fp2 {
        return new Fp2(this.a0.negate(), this.a1.negate());
    }
    square() {
        const c0 = this.a0;
        // if the error is because of this, fuck me please ;)))
        const c1 = this.a1; 
        const a = c0.add(c1);
        const b = c0.sub(c1);
        const c = c0.add(c0);
        return new Fp2(a.mul(b), c.mul(c1));
    }
}

function fp1FromBigInt(x: bigint): Fp1 {
    return new Fp1(x)
}
function buildFp1(x: bigint): Fp1 {
    return new Fp1(x)
}

function fp2FromBigInt(x: bigint): Fp2 {
    return new Fp2(fp1FromBigInt(x), zeroFp1)
}
function buildFp2(a0: bigint, a1: bigint): Fp2 {
    return new Fp2(fp1FromBigInt(a0), fp1FromBigInt(a1))
}

function fp6FromBigInt(x: bigint): Fp6 {
    return new Fp6(fp2FromBigInt(x), zeroFp2, zeroFp2)
}

function fp12FromBigInt(x: bigint): Fp12 {
    return new Fp12(fp6FromBigInt(x), zeroFp6)
}

let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (oneFp1, zeroFp1)

class Fp6 implements Fp {
    public a0: Fp2;
    public a1: Fp2;
    public a2: Fp2;
    
    
	constructor(a0: Fp2, a1: Fp2, a2: Fp2){
        this.a0 = a0;
        this.a1 = a1;
        this.a2 = a2;
    }

  	displayInfo() {
        console.log("a0: ", this.a0)
        console.log("a1: ", this.a1)
        console.log("a2: ", this.a2)
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
            t0.mul(factor),
            t1.mul(factor),
            t2.mul(factor)
        )
    }
    add(y: Fp6): Fp6 {
        return new Fp6(
            this.a0.add(y.a0),
            this.a1.add(y.a1),
            this.a2.add(y.a2)
        )
    }
    sub(y: Fp6): Fp6 {
        return new Fp6(
            this.a0.sub(y.a0),
            this.a1.sub(y.a1),
            this.a2.sub(y.a2)
        )
    }
    mul(y: Fp6): Fp6 {
        let t0 = this.a0.mul(y.a0)
        let t1 = (this.a0.mul(y.a1)).add(this.a1.mul(y.a0))
        let t2 = (this.a0.mul(y.a2)).add(this.a1.mul(y.a1)).add(this.a2.mul(y.a0))
        let t3 = ((this.a1.mul(y.a2)).add(this.a2.mul(y.a1))).mulNonres()
        let t4 = (this.a2.mul(y.a2)).mulNonres()
        return new Fp6(
            t0.add(t3),
            t1.add(t4),
            t2
        )
    }
    mulScalar(y: bigint): Fp6 {
        return new Fp6(
            this.a0.mulScalar(y),
            this.a1.mulScalar(y),
            this.a2.mulScalar(y),
        )
    }
    // Sparse multiplication
    multiplyBy01(b0: Fp2, b1: Fp2): Fp6 {
        let { a0, a1, a2 } = this;
        let t0 = a0.mul(b0); // c0 * b0
        let t1 = a1.mul(b1); // c1 * b1
        return new Fp6(
        // ((c1 + c2) * b1 - T1) * (u + 1) + T0
        a1.add(a2).mul(b1).sub(t1).mulNonres().add(t0),
        // (b0 + b1) * (c0 + c1) - T0 - T1
        b0.add(b1).mul(a0.add(a1)).sub(t0).sub(t1),
        // (c0 + c2) * b0 - T0 + T1
        a0.add(a2).mul(b0).sub(t0).add(t1)
        );
    }
    // Sparse multiplication
    multiplyBy1(b1: Fp2): Fp6 {
        return new Fp6(
        this.a2.mul(b1).mulNonres(),
        this.a0.mul(b1),
        this.a1.mul(b1)
        );
    }
    div(y: Fp6): Fp6 {
        return this.mul(y.inv())
    }
    divScalar(y: bigint): Fp6 {
        let theFp1 = new Fp1(y)
        let theFp1Inv = theFp1.inv()
        return this.mulScalar(theFp1Inv.a0)
    }
    equalOne(): Boolean {
        return this.a2.eq(zeroFp2) && this.a1.eq(zeroFp2) && this.a0.eq(oneFp2)
    }
    mulNonres(): Fp6 {
        return new Fp6(
            this.a2.mulNonres(),
            this.a0, 
            this.a1
        )
    }
    eq(y: Fp6): Boolean {
        return this.a2.eq(y.a2) && this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: bigint): Fp6 {
        return new Fp6(fp2FromBigInt(x), zeroFp2, zeroFp2)
    }
    zero(): Fp6 {
        return zeroFp6
    }
    frobeniusMap(p: number): Fp6{
        return new Fp6(
            this.a0.frobeniusMap(p),
            this.a1.frobeniusMap(p).mul(FP6_FROBENIUS_COEFFICIENTS_1[p % 6]),
            this.a2.frobeniusMap(p).mul(FP6_FROBENIUS_COEFFICIENTS_2[p % 6])
        )
    }
    negate(): Fp6 {
        return new Fp6(this.a0.negate(), this.a1.negate(), this.a2.negate());
    }
}

let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let oneFp6 = new Fp6 (oneFp2, zeroFp2, zeroFp2)

class Fp12 implements Fp {
    public a0: Fp6;
    public a1: Fp6;
    
	constructor(a0: Fp6, a1: Fp6){
        this.a0 = a0;
    	this.a1 = a1;
    }
    displayInfoForSolidity() {
        let myString = ""
        console.log("fp12")

        myString = this.a0.a0.a0.a0.toString(16)
        console.log("a0_a0_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a0_a0_b: ", '0x'+myString.substring(myString.length - 64))

        myString = this.a0.a0.a1.a0.toString(16)
        console.log("a0_a0_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a0_a1_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a0.a1.a0.a0.toString(16)
        console.log("a0_a1_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a1_a0_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a0.a1.a1.a0.toString(16)
        console.log("a0_a1_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a1_a1_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a0.a2.a0.a0.toString(16)
        console.log("a0_a2_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a2_a0_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a0.a2.a1.a0.toString(16)
        console.log("a0_a2_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a0_a2_a1_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a0.a0.a0.toString(16)
        console.log("a1_a0_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a0_a0_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a0.a1.a0.toString(16)
        console.log("a1_a0_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a0_a1_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a1.a0.a0.toString(16)
        console.log("a1_a1_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a1_a0_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a1.a1.a0.toString(16)
        console.log("a1_a1_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a1_a1_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a2.a0.a0.toString(16)
        console.log("a1_a2_a0_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a2_a0_b: ", '0x'+myString.substring(myString.length -64))

        myString = this.a1.a2.a1.a0.toString(16)
        console.log("a1_a2_a1_a: ", '0x'+myString.substring(0, myString.length - 64).padStart(64, '0'))
        console.log("a1_a2_a1_b: ", '0x'+myString.substring(myString.length -64))

        console.log("end of fp12")
    }
  	displayInfo(){
        console.log("fp12")
        console.log("a0: ", this.a0.displayInfo())
        console.log("a1: ", this.a1.displayInfo())
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
            this.a0.mul(factor),
            // -1 * a1 * factor
            zeroFp6.sub(this.a1.mul(factor))
        )
    }
    add(y: Fp12): Fp12 {
        return new Fp12(
            this.a0.add(y.a0),
            this.a1.add(y.a1)
        )
    }
    sub(y: Fp12): Fp12 {
        return new Fp12(
            this.a0.sub(y.a0),
            this.a1.sub(y.a1)
        )
    }
    mul(y: Fp12): Fp12 {
        return new Fp12(
            (this.a0.mul(y.a0)).add((this.a1.mul(y.a1).mulNonres())),
            (this.a1.mul(y.a0)).add(this.a0.mul(y.a1))
        )
    }
    mulScalar(y: bigint): Fp12 {
        return new Fp12(
            this.a0.mulScalar(y),
            this.a1.mulScalar(y)
        )
    }
    // Sparse multiplication
    multiplyBy014(o0: Fp2, o1: Fp2, o4: Fp2) {
        let { a0, a1 } = this;
        let t0 = a0.multiplyBy01(o0, o1);
        let t1 = a1.multiplyBy1(o4);
        return new Fp12(
            t1.mulNonres().add(t0), // T1 * v + T0
            // (c1 + c0) * [o0, o1+o4] - T0 - T1
            a1.add(a0).multiplyBy01(o0, o1.add(o4)).sub(t0).sub(t1)
        );
    }
    div(y: Fp12): Fp12 {
        return this.mul(y.inv());
    }
    divScalar(y: bigint): Fp12 {
        let theFp1 = new Fp1(y)
        let theFp1Inv = theFp1.inv()
        return this.mulScalar(theFp1Inv.a0)
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
    fromBigInt(x: bigint): Fp12 {
        return new Fp12(fp6FromBigInt(x), zeroFp6)
    }
    zero(): Fp12 {
        return zeroFp12
    }
    frobeniusMap(p: number): Fp12{
        const r0 = this.a0.frobeniusMap(p);
        const { a0, a1, a2 } = this.a1.frobeniusMap(p);
        const coeff = FP12_FROBENIUS_COEFFICIENTS[p % 12];
        return new Fp12(r0, new Fp6(a0.mul(coeff), a1.mul(coeff), a2.mul(coeff)));
    }
    negate(): Fp12 {
        return new Fp12(this.a0.negate(), this.a1.negate());
    }
    conjugate(): Fp12 {
        return new Fp12(this.a0, this.a1.negate());
    }
    private Fp4Square(a: Fp2, b: Fp2): { first: Fp2; second: Fp2 } {
        const a2 = a.square();
        const b2 = b.square();
        return {
          first: b2.mulNonres().add(a2), // b² * Nonresidue + a²
          second: ((a.add(b)).square()).sub(a2).sub(b2), // (a + b)² - a² - b²
        };
    }
    square() {
        let { a0, a1 } = this;
        let ab = a0.mul(a1); // c0 * c1
        return new Fp12(
          // (c1 * v + c0) * (c0 + c1) - AB - AB * v
          a1.mulNonres().add(a0).mul(a0.add(a1)).sub(ab).sub(ab.mulNonres()),
          ab.add(ab)
        ); // AB + AB
      }

    private cyclotomicSquare(): Fp12 {
        const { a0: c0c0, a1: c0c1, a2: c0c2 } = this.a0;
        const { a0: c1c0, a1: c1c1, a2: c1c2 } = this.a1;
        const { first: t3, second: t4 } = this.Fp4Square(c0c0, c1c1);
        const { first: t5, second: t6 } = this.Fp4Square(c1c0, c0c2);
        const { first: t7, second: t8 } = this.Fp4Square(c0c1, c1c2);
        let t9 = t8.mulNonres(); // T8 * (u + 1)
        return new Fp12(
            new Fp6(
            t3.sub(c0c0).mulScalar(2n).add(t3), // 2 * (T3 - c0c0)  + T3
            t5.sub(c0c1).mulScalar(2n).add(t5), // 2 * (T5 - c0c1)  + T5
            t7.sub(c0c2).mulScalar(2n).add(t7)
            ), // 2 * (T7 - c0c2)  + T7
            new Fp6(
            t9.add(c1c0).mulScalar(2n).add(t9), // 2 * (T9 + c1c0) + T9
            t4.add(c1c1).mulScalar(2n).add(t4), // 2 * (T4 + c1c1) + T4
            t6.add(c1c2).mulScalar(2n).add(t6)
            )
        ); // 2 * (T6 + c1c2) + T6
    }

    private cyclotomicExp(n: bigint) {
        let z = oneFp12;
        for (let i = BLS_X_LEN - 1; i >= 0; i--) {
            z = z.cyclotomicSquare();
            if (bitGet(n, i)) z = z.mul(this);
          }
        return z;
    }

    finalExponentiate() {
        const t0 = this.frobeniusMap(6).div(this);
        const t1 = t0.frobeniusMap(2).mul(t0);
        const t2 = t1.cyclotomicExp(curveX).conjugate();
        const t3 = t1.cyclotomicSquare().conjugate().mul(t2);
        const t4 = t3.cyclotomicExp(curveX).conjugate();
        const t5 = t4.cyclotomicExp(curveX).conjugate();
        const t6 = t5.cyclotomicExp(curveX).conjugate().mul(t2.cyclotomicSquare());
        const t7 = t6.cyclotomicExp(curveX).conjugate();
        const t2_t5_pow_q2 = t2.mul(t5).frobeniusMap(2);
        const t4_t1_pow_q3 = t4.mul(t1).frobeniusMap(3);
        const t6_t1c_pow_q1 = t6.mul(t1.conjugate()).frobeniusMap(1);
        const t7_t3c_t1 = t7.mul(t3.conjugate()).mul(t1);
        return t2_t5_pow_q2.mul(t4_t1_pow_q3).mul(t6_t1c_pow_q1).mul(t7_t3c_t1);
    }
}

const curveX = 0xd201000000010000n

function bitLen(n: bigint) {
    let len;
    for (len = 0; n > 0n; n >>= 1n, len += 1);
    return len;
}

const BLS_X_LEN = bitLen(curveX);

function bitGet(n: bigint, pos: number) {
    return (n >> BigInt(pos)) & 1n;
}

const FP2_FROBENIUS_COEFFICIENTS = [
    buildFp1(0x1n),
    buildFp1(0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan),
]

const FP6_FROBENIUS_COEFFICIENTS_1 = [
    buildFp2(0x1n, 0x0n),
    buildFp2(
      0x0n,
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
    ),
    buildFp2(
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
      0x0n,
    ),
    buildFp2(0x0n, 0x1n),
    buildFp2(
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
      0x0n,
    ),
    buildFp2(
      0x0n,
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
    ),
]

const FP6_FROBENIUS_COEFFICIENTS_2 = [
    buildFp2(0x1n, 0x0n),
    buildFp2(
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaadn,
      0x0n,
    ),
    buildFp2(
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
      0x0n,
    ),
    buildFp2(
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x0n,
    ),
    buildFp2(
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
      0x0n,
    ),
    buildFp2(
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffffn,
      0x0n,
    ),
]

const FP12_FROBENIUS_COEFFICIENTS = [
    buildFp2(0x1n, 0x0n),
    buildFp2(
      0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
      0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
    ),
    buildFp2(
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffffn,
      0x0n,
    ),
    buildFp2(
      0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
      0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
    ),
    buildFp2(
      0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffen,
      0x0n,
    ),
    buildFp2(
      0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
      0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
    ),
    buildFp2(
      0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaan,
      0x0n,
    ),
    buildFp2(
      0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3n,
      0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8n,
    ),
    buildFp2(
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaacn,
      0x0n,
    ),
    buildFp2(
      0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09n,
      0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2n,
    ),
    buildFp2(
      0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaadn,
      0x0n,
    ),
    buildFp2(
      0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116n,
      0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995n,
    ),
]


let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)
let oneFp12 = new Fp12 (oneFp6, zeroFp6)

export { Fp, Fp1, Fp2, Fp6, Fp12 }
export { zeroFp12, oneFp12, zeroFp6, oneFp6, zeroFp2, oneFp2, zeroFp1, oneFp1 }
export { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt }
export { order, groupOrder }
export { mod, bitGet, BLS_X_LEN, curveX }