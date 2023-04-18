import { BigNumber } from "@ethersproject/bignumber";

let order: BigNumber = BigNumber.from("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab")
let groupOrder: BigNumber = BigNumber.from("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001")

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

class Fp1{
    public a0: BigNumber;
	constructor(a0: BigNumber){
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("a0: ", this.a0)
    }
    inv(){
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
    add(y: Fp1) {
        return new Fp1(
            this.a0.add(y.a0).mod(order)
        )
    }
    sub(y: Fp1) {
        return new Fp1(
            this.a0.sub(y.a0).mod(order)
        )
    }
    mul(y: Fp1){
        return new Fp1(
            this.a0.mul(y.a0).mod(order)
        )
    }
    equalOne(){
        return this.eq(oneFp1)
    }
    mulNonres(){
        return new Fp1(
            this.a0
        )
    }
    eq(y: Fp1){
        return this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber) {
        return new Fp1(x)
    }
    zero() {
        return zeroFp1
    }
}

let zeroFp1 = new Fp1 (BigNumber.from(0))
let oneFp1 = new Fp1 (BigNumber.from(1))

class Fp2{
    public a1: Fp1;
    public a0: Fp1;
	constructor(a1: Fp1, a0: Fp1){
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("a1: ", this.a1)
        console.log("a0: ", this.a0)
    }
    inv(){
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
    add(y: Fp2) {
        return new Fp2(
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp2) {
        return new Fp2(
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp2){
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
    equalOne(){
        return this.a1.eq(zeroFp1) && this.a0.eq(oneFp1)
    }
    mulNonres(){
        return new Fp2(
            this.a1.add(this.a0),
            this.a0.sub(this.a1)
        )
    }
    eq(y: Fp2){
        return this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber) {
        return new Fp2(zeroFp1, fp1FromBigInt(x))
    }
    zero() {
        return zeroFp2
    }
}

function fp1FromBigInt(x: BigNumber) {
    return new Fp1(x)
}

function fp2FromBigInt(x: BigNumber) {
    return new Fp2(zeroFp1,fp1FromBigInt(x))
}

function fp6FromBigInt(x: BigNumber) {
    return new Fp6(zeroFp2, zeroFp2, fp2FromBigInt(x))
}

function fp12FromBigInt(x: BigNumber) {
    return new Fp12(zeroFp6, fp6FromBigInt(x))
}

let zeroFp2 = new Fp2 (zeroFp1, zeroFp1)
let oneFp2 = new Fp2 (zeroFp1, oneFp1)

class Fp6{
    public a2: Fp2;
    public a1: Fp2;
    public a0: Fp2;
	constructor(a2: Fp2, a1: Fp2, a0: Fp2){
        this.a2 = a2;
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("a2: ", this.a2)
        console.log("a1: ", this.a1)
        console.log("a0: ", this.a0)
    }
    inv(){
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
    add(y: Fp6) {
        return new Fp6(
            this.a2.add(y.a2),
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp6) {
        return new Fp6(
            this.a2.sub(y.a2),
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp6){
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
    equalOne(){
        return this.a2.eq(zeroFp2) && this.a1.eq(zeroFp2) && this.a0.eq(oneFp2)
    }
    mulNonres(){
        return new Fp6(
            this.a1,
            this.a0, 
            this.a2.mulNonres()
        )
    }
    eq(y: Fp6){
        return this.a2.eq(y.a2) && this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x: BigNumber) {
        return new Fp6(zeroFp2, zeroFp2, fp2FromBigInt(x))
    }
    zero() {
        return zeroFp6
    }
}

let zeroFp6 = new Fp6 (zeroFp2, zeroFp2, zeroFp2)
let oneFp6 = new Fp6 (zeroFp2, zeroFp2, oneFp2)

class Fp12{
    public a1: Fp6;
    public a0: Fp6;
	constructor(a1: Fp6, a0: Fp6){
    	this.a1 = a1;
      	this.a0 = a0;
    }
  	displayInfo(){
        console.log("fp12")
        console.log("a1: ", this.a1)
        console.log("a0: ", this.a0)
        console.log("end of fp12")
    }
    inv(){
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
    add(y: Fp12) {
        return new Fp12(
            this.a1.add(y.a1),
            this.a0.add(y.a0)
        )
    }
    sub(y: Fp12) {
        return new Fp12(
            this.a1.sub(y.a1),
            this.a0.sub(y.a0)
        )
    }
    mul(y: Fp12){
        return new Fp12(
            (this.a1.mul(y.a0)).add(this.a0.mul(y.a1)),
            (this.a0.mul(y.a0)).add((this.a1.mul(y.a1).mulNonres()))
        )
    }
    equalOne(){
        return this.a1.eq(zeroFp6) && this.a0.eq(oneFp6)
    }
    eq(y: Fp12){
        return this.a1.eq(y.a1) && this.a0.eq(y.a0)
    } 
    fromBigInt(x) {
        return new Fp12(zeroFp6, fp6FromBigInt(x))
    }
    zero() {
        return zeroFp12
    }
}
let zeroFp12 = new Fp12 (zeroFp6, zeroFp6)
let oneFp12 = new Fp12 (zeroFp6, oneFp6)

export { Fp1, Fp2, Fp6, Fp12 }
export { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt }
export { order, groupOrder }