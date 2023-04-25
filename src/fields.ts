
// let order: BigNumber = BigNumber.from("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab")
let order: bigint = 0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaabn
// let groupOrder: bigint = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n
let groupOrder: bigint = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n

function mod(a: bigint, b: bigint) {
    const res = a % b;
    return res >= 0n ? res : b + res;
    // return res;
}

const beea = (
    u: bigint, 
    v: bigint, 
    x1: bigint, 
    x2: bigint, 
    p: bigint
) => {
    let firstU = u;
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
    equalOne(): Boolean;
    mulNonres(): any;
    eq(y: any): Boolean;
    fromBigInt(x: bigint): any;
    zero(): any;
}

class Fp1 implements Fp {
    public a0: bigint;
	constructor(a0: bigint){
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
}

function fp1FromBigInt(x: bigint): Fp1 {
    return new Fp1(x)
}

function fp2FromBigInt(x: bigint): Fp2 {
    return new Fp2(fp1FromBigInt(x), zeroFp1)
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
}

let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)
let oneFp12 = new Fp12 (oneFp6, zeroFp6)

export { Fp, Fp1, Fp2, Fp6, Fp12 }
export { mod, fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt }
export { order, groupOrder }