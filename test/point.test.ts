// import { BN } from 'bn.js'; // or whichever library you are using for big integers
import { expect } from "chai";
import { point, pointAdd, pointMul } from '../src/points';
import { Fp1, Fp2, Fp6, Fp12, groupOrder } from '../src/fields';

const g1AddTestVector = require("./fixtures/g1_add.json")
const g2AddTestVector = require("./fixtures/g2_add.json")

const g1MulTestVector = require("./fixtures/g1_mul.json")
const g2MulTestVector = require("./fixtures/g2_mul.json")

function createG1Point(xStr: bigint, yStr: bigint): point {
    return new point(
        new Fp1(xStr),
        new Fp1(yStr),
        false
    )
}

function createG2Point(
    xStr_a1: bigint, 
    xStr_a0: bigint, 
    yStr_a1: bigint,
    yStr_a0: bigint,
): point {
    return new point(
        new Fp2(
            new Fp1(xStr_a0),
            new Fp1(xStr_a1),
        ),
        new Fp2(
            new Fp1(yStr_a0),
            new Fp1(yStr_a1),
        ),
        false
    )
}

describe("Points", () => {

    it("g1 add", function() {
        for (let i = 0; i < g1AddTestVector.g1_add.length; i++) {
            let p1 = createG1Point(
                BigInt(g1AddTestVector.g1_add[i].p1X),
                BigInt(g1AddTestVector.g1_add[i].p1Y)
            )
    
            let p2 = createG1Point(
                BigInt(g1AddTestVector.g1_add[i].p2X),
                BigInt(g1AddTestVector.g1_add[i].p2Y)
            )
    
            let res = createG1Point(
                BigInt(g1AddTestVector.g1_add[i].RSX),
                BigInt(g1AddTestVector.g1_add[i].RSY)
            )
    
            let p1PlusP2 = pointAdd(p1, p2)
    
            expect(
                res.eq(p1PlusP2)
            ).to.equal(true)
        }
    }).timeout(100000)

    it("g1 mul", function() {

        for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
            let p1 = createG1Point(
                BigInt(g1MulTestVector.g1_mul[i].p1X),
                BigInt(g1MulTestVector.g1_mul[i].p1Y)
            )
    
            let scalar = BigInt(g1MulTestVector.g1_mul[i].scl)
    
            let res = createG1Point(
                BigInt(g1MulTestVector.g1_mul[i].RSX),
                BigInt(g1MulTestVector.g1_mul[i].RSY)
            )
    
            let sclMulP1 = pointMul(scalar, p1)
    
            expect(
                res.eq(sclMulP1)
            ).to.equal(true)
        }
    }).timeout(100000)

    it("g2 add", function() {

        for (let i = 0; i < g2AddTestVector.g2_add.length; i++) {
            let p1 = createG2Point(
                BigInt(g2AddTestVector.g2_add[i].p1X_a1),
                BigInt(g2AddTestVector.g2_add[i].p1X_a0),
                BigInt(g2AddTestVector.g2_add[i].p1Y_a1),
                BigInt(g2AddTestVector.g2_add[i].p1Y_a0)
            )
    
            let p2 = createG2Point(
                BigInt(g2AddTestVector.g2_add[i].p2X_a1),
                BigInt(g2AddTestVector.g2_add[i].p2X_a0),
                BigInt(g2AddTestVector.g2_add[i].p2Y_a1),
                BigInt(g2AddTestVector.g2_add[i].p2Y_a0)
            )
    
            let res = createG2Point(
                BigInt(g2AddTestVector.g2_add[i].RSX_a1),
                BigInt(g2AddTestVector.g2_add[i].RSX_a0),
                BigInt(g2AddTestVector.g2_add[i].RSY_a1),
                BigInt(g2AddTestVector.g2_add[i].RSY_a0)
            )
    
            let p1PlusP2 = pointAdd(p1, p2)
    
            expect(
                res.eq(p1PlusP2)
            ).to.equal(true)
        }
    }).timeout(100000)

    it("g2 mul", function() {

        for (let i = 0; i < g2MulTestVector.g2_mul.length; i++) {
            let p1 = createG2Point(
                BigInt(g2MulTestVector.g2_mul[i].p1X_a1),
                BigInt(g2MulTestVector.g2_mul[i].p1X_a0),
                BigInt(g2MulTestVector.g2_mul[i].p1Y_a1),
                BigInt(g2MulTestVector.g2_mul[i].p1Y_a0)
            )
    
            let scalar = BigInt(g2MulTestVector.g2_mul[i].scl)
    
            let res = createG2Point(
                BigInt(g2MulTestVector.g2_mul[i].RSX_a1),
                BigInt(g2MulTestVector.g2_mul[i].RSX_a0),
                BigInt(g2MulTestVector.g2_mul[i].RSY_a1),
                BigInt(g2MulTestVector.g2_mul[i].RSY_a0)
            )
    
            let sclMuP1 = pointMul(scalar, p1)
    
            expect(
                res.eq(sclMuP1)
            ).to.equal(true)
        }
    }).timeout(100000)

    it("point at infinity", function() {

        for (let i = 0; i < g2MulTestVector.g2_mul.length; i++) {
            let p1 = createG2Point(
                BigInt(g2MulTestVector.g2_mul[i].p1X_a1),
                BigInt(g2MulTestVector.g2_mul[i].p1X_a0),
                BigInt(g2MulTestVector.g2_mul[i].p1Y_a1),
                BigInt(g2MulTestVector.g2_mul[i].p1Y_a0)
            )
    
            let orderMuP1 = pointMul(groupOrder * (10000n), p1)
            // let orderMuP1 = pointMul(groupOrder.add(BigNumber.from(10).pow(10)), p1)
            // let orderMuP1 = pointMul(order, p1)
    
            console.log("orderMuP1")
            orderMuP1.displayInfo()
            console.log(orderMuP1)
        }
    }).timeout(100000)

    it("point double", function() {

        let p1 = new point(
            new Fp1(3924344720014921989021119511230386772731826098545970939506931087307386672210285223838080721449761235230077903044877n),
            new Fp1(849807144208813628470408553955992794901182511881745746883517188868859266470363575621518219643826028639669002210378n),
            false
        )
    }).timeout(100000)

    // it("pow ", function() {

    //     for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
    //         let f = new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X))
    
    //         let mulRes = f.mul(f).mul(f).mul(f).mul(f)

    //         // let mulRes2 = BigInt(g1MulTestVector.g1_mul[i].p1X) 
    //         // mulRes2 = mulRes2 ^ 5n
    //         // mulRes2 = mod(mulRes2, order)
    //         // let mulRes3 = new Fp1(mulRes2)

    //         // console.log(f)
    //         // console.log(mulRes)
    //         // console.log(mulRes2)
    //         // console.log(mulRes3)
            
    //         // expect(
    //         //     mulRes
    //         // ).to.equal(mulRes3)

    //         // console.log("passed")
    //         // console.log(order.toString())
    //         // console.log(BigNumber.from(order.toString()).toHexString())
    
    //         let powRes = powHelper(f, 5n, oneFp1) as Fp1
    
    //         expect(
    //             mulRes.eq(powRes)
    //         ).to.equal(true)
    //     }

    //     for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
    //         let f = new Fp2(
    //             new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //             new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //         )
    
    //         let mulRes = f.mul(f).mul(f).mul(f).mul(f)
    
    //         let powRes = powHelper(f, 5n, oneFp2) as Fp2
    
    //         expect(
    //             mulRes.eq(powRes)
    //         ).to.equal(true)
    //     }

    //     for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
    //         let f = new Fp6 (
    //             new Fp2(
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //             ),
    //             new Fp2(
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //             ),
    //             new Fp2(
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                 new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //             )
    //         )
    
    //         let mulRes = f.mul(f).mul(f).mul(f).mul(f)
    
    //         let powRes = powHelper(f, 5n, oneFp6) as Fp6
    
    //         expect(
    //             mulRes.eq(powRes)
    //         ).to.equal(true)
    //     }

    //     for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
    //         let f = new Fp12 (
    //             new Fp6 (
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 ),
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 ),
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 )
    //             ),
    //             new Fp6 (
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 ),
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 ),
    //                 new Fp2(
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1X)),
    //                     new Fp1(BigInt(g1MulTestVector.g1_mul[i].p1Y))
    //                 )
    //             )
    //         )
    
    //         let mulRes = f.mul(f).mul(f).mul(f).mul(f)
    
    //         let powRes = powHelper(f, 5n, oneFp6) as Fp12
    
    //         expect(
    //             mulRes.eq(powRes)
    //         ).to.equal(true)
    //     }

    // }).timeout(100000)

    
})

