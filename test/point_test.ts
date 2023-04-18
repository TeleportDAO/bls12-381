import { BN } from 'bn.js'; // or whichever library you are using for big integers
import { expect } from "chai";
import { point, pointAdd } from '../src/points';
import { Fp, Fp1 } from '../src/fields';
import { BigNumber } from '@ethersproject/bignumber';

const g1TestVector = require("./fixtures/g1_add.json")

describe('pointAdd', () => {

    function createG1Point(xStr: string, yStr: string): point {
        return new point(
            new Fp1(BigNumber.from(xStr)),
            new Fp1(BigNumber.from(yStr)),
            false
        )
    }
      

  it('g1 add', async function () {
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
  });

});
