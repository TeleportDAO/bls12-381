// import { BN } from 'bn.js'; // or whichever library you are using for big integers
import { expect } from "chai";
import { point, pointAdd } from '../src/points';
import { Fp, Fp1, Fp2 } from '../src/fields';
import { BigNumber } from '@ethersproject/bignumber';

const g1TestVector = require("./fixtures/g1_add.json")
const g2TestVector = require("./fixtures/g2_add.json")

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
    for (let i = 0; i < g1TestVector.g1_add.length; i++) {
        let p1 = createG1Point(
            g1TestVector.g1_add[i].p1X,
            g1TestVector.g1_add[i].p1Y
        )

        let p2 = createG1Point(
            g1TestVector.g1_add[i].p2X,
            g1TestVector.g1_add[i].p2Y
        )

        let res = createG1Point(
            g1TestVector.g1_add[i].RSX,
            g1TestVector.g1_add[i].RSY
        )

        let p1PlusP2 = pointAdd(p1, p2)

        expect(
            res.eq(p1PlusP2)
        ).to.equal(true)
    }
}

function g2AddTest() {
    for (let i = 0; i < g2TestVector.g2_add.length; i++) {
        let p1 = createG2Point(
            g2TestVector.g2_add[i].p1X_a1,
            g2TestVector.g2_add[i].p1X_a0,
            g2TestVector.g2_add[i].p1Y_a1,
            g2TestVector.g2_add[i].p1Y_a0
        )

        let p2 = createG2Point(
            g2TestVector.g2_add[i].p2X_a1,
            g2TestVector.g2_add[i].p2X_a0,
            g2TestVector.g2_add[i].p2Y_a1,
            g2TestVector.g2_add[i].p2Y_a0
        )

        let res = createG2Point(
            g2TestVector.g2_add[i].RSX_a1,
            g2TestVector.g2_add[i].RSX_a0,
            g2TestVector.g2_add[i].RSY_a1,
            g2TestVector.g2_add[i].RSY_a0
        )

        let p1PlusP2 = pointAdd(p1, p2)

        expect(
            res.eq(p1PlusP2)
        ).to.equal(true)
    }
}

g1AddTest()
g2AddTest()
