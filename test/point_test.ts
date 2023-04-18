// import { BN } from 'bn.js'; // or whichever library you are using for big integers
import { expect } from "chai";
import { point, pointAdd, pointMul } from '../src/points';
import { Fp, Fp1, Fp2, order, groupOrder } from '../src/fields';
import { BigNumber } from '@ethersproject/bignumber';

const g1AddTestVector = require("./fixtures/g1_add.json")
const g2AddTestVector = require("./fixtures/g2_add.json")

const g1MulTestVector = require("./fixtures/g1_mul.json")
const g2MulTestVector = require("./fixtures/g2_mul.json")

function createG1Point(xStr: string, yStr: string): point {
    return new point(
        new Fp1(BigNumber.from(xStr)),
        new Fp1(BigNumber.from(yStr)),
        false
    )
}

function createG2Point(
    xStr_a1: string, 
    xStr_a0: string, 
    yStr_a1: string,
    yStr_a0: string,
): point {
    return new point(
        new Fp2(
            new Fp1(BigNumber.from(xStr_a1)),
            new Fp1(BigNumber.from(xStr_a0))
        ),
        new Fp2(
            new Fp1(BigNumber.from(yStr_a1)),
            new Fp1(BigNumber.from(yStr_a0))
        ),
        false
    )
}

function g1AddTest() {
    for (let i = 0; i < g1AddTestVector.g1_add.length; i++) {
        let p1 = createG1Point(
            g1AddTestVector.g1_add[i].p1X,
            g1AddTestVector.g1_add[i].p1Y
        )

        let p2 = createG1Point(
            g1AddTestVector.g1_add[i].p2X,
            g1AddTestVector.g1_add[i].p2Y
        )

        let res = createG1Point(
            g1AddTestVector.g1_add[i].RSX,
            g1AddTestVector.g1_add[i].RSY
        )

        let p1PlusP2 = pointAdd(p1, p2)

        expect(
            res.eq(p1PlusP2)
        ).to.equal(true)
    }
}

function g1MulTest() {
    for (let i = 0; i < g1MulTestVector.g1_mul.length; i++) {
        let p1 = createG1Point(
            g1MulTestVector.g1_mul[i].p1X,
            g1MulTestVector.g1_mul[i].p1Y
        )

        let scalar = BigNumber.from(g1MulTestVector.g1_mul[i].scl)

        let res = createG1Point(
            g1MulTestVector.g1_mul[i].RSX,
            g1MulTestVector.g1_mul[i].RSY
        )

        let sclMulP1 = pointMul(scalar, p1)

        expect(
            res.eq(sclMulP1)
        ).to.equal(true)
    }
}

function g2AddTest() {
    for (let i = 0; i < g2AddTestVector.g2_add.length; i++) {
        let p1 = createG2Point(
            g2AddTestVector.g2_add[i].p1X_a1,
            g2AddTestVector.g2_add[i].p1X_a0,
            g2AddTestVector.g2_add[i].p1Y_a1,
            g2AddTestVector.g2_add[i].p1Y_a0
        )

        let p2 = createG2Point(
            g2AddTestVector.g2_add[i].p2X_a1,
            g2AddTestVector.g2_add[i].p2X_a0,
            g2AddTestVector.g2_add[i].p2Y_a1,
            g2AddTestVector.g2_add[i].p2Y_a0
        )

        let res = createG2Point(
            g2AddTestVector.g2_add[i].RSX_a1,
            g2AddTestVector.g2_add[i].RSX_a0,
            g2AddTestVector.g2_add[i].RSY_a1,
            g2AddTestVector.g2_add[i].RSY_a0
        )

        let p1PlusP2 = pointAdd(p1, p2)

        expect(
            res.eq(p1PlusP2)
        ).to.equal(true)
    }
}

function g2MulTest() {
    for (let i = 0; i < g2MulTestVector.g2_mul.length; i++) {
        let p1 = createG2Point(
            g2MulTestVector.g2_mul[i].p1X_a1,
            g2MulTestVector.g2_mul[i].p1X_a0,
            g2MulTestVector.g2_mul[i].p1Y_a1,
            g2MulTestVector.g2_mul[i].p1Y_a0
        )

        let scalar = BigNumber.from(g2MulTestVector.g2_mul[i].scl)

        let res = createG2Point(
            g2MulTestVector.g2_mul[i].RSX_a1,
            g2MulTestVector.g2_mul[i].RSX_a0,
            g2MulTestVector.g2_mul[i].RSY_a1,
            g2MulTestVector.g2_mul[i].RSY_a0
        )

        let sclMuP1 = pointMul(scalar, p1)

        expect(
            res.eq(sclMuP1)
        ).to.equal(true)
    }
}

function pointAtInfTest() {
    for (let i = 0; i < g2MulTestVector.g2_mul.length; i++) {
        let p1 = createG2Point(
            g2MulTestVector.g2_mul[i].p1X_a1,
            g2MulTestVector.g2_mul[i].p1X_a0,
            g2MulTestVector.g2_mul[i].p1Y_a1,
            g2MulTestVector.g2_mul[i].p1Y_a0
        )

        let orderMuP1 = pointMul(groupOrder.mul(BigNumber.from(10).pow(20)), p1)
        // let orderMuP1 = pointMul(groupOrder.add(BigNumber.from(10).pow(10)), p1)
        // let orderMuP1 = pointMul(order, p1)

        console.log("orderMuP1")
        orderMuP1.displayInfo()
        console.log(orderMuP1)
    }
}

// g1AddTest()
// g2AddTest()

// g1MulTest()
// g2MulTest()

pointAtInfTest()
