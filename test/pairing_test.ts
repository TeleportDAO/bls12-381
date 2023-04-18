import { untwist, pointDouble, pointAdd, point } from "../src/points"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "../src/fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "../src/fields"
import { pairing, pointMul, miller } from "../src/pairing"



function calcPairing() {
    let mew1 = new point (
        fp1FromBigInt(BigNumber.from("0x0000000000000000000000000000000012196c5a43d69224d8713389285f26b98f86ee910ab3dd668e413738282003cc5b7357af9a7af54bb713d62255e80f56")),
        fp1FromBigInt(BigNumber.from("0x0000000000000000000000000000000006ba8102bfbeea4416b710c73e8cce3032c31c6269c44906f8ac4f7874ce99fb17559992486528963884ce429a992fee")),
        false 
    )
    let mew2 = new point (
        new Fp2(
            // BigNumber.from("0x0000000000000000000000000000000017c9fcf0504e62d3553b2f089b64574150aa5117bd3d2e89a8c1ed59bb7f70fb83215975ef31976e757abf60a75a1d9f"), 
            fp1FromBigInt(BigNumber.from("0x0000000000000000000000000000000008f5a53d704298fe0cfc955e020442874fe87d5c729c7126abbdcbed355eef6c8f07277bee6d49d56c4ebaf334848624")),
            fp1FromBigInt(BigNumber.from("0x0000000000000000000000000000000017c9fcf0504e62d3553b2f089b64574150aa5117bd3d2e89a8c1ed59bb7f70fb83215975ef31976e757abf60a75a1d9f"))
        ),
        new Fp2(
            // BigNumber.from("0x000000000000000000000000000000001302dcc50c6ce4c28086f8e1b43f9f65543cf598be440123816765ab6bc93f62bceda80045fbcad8598d4f32d03ee8fa"), 
            fp1FromBigInt(BigNumber.from("0x000000000000000000000000000000000bbb4eb37628d60b035a3e0c45c0ea8c4abef5a6ddc5625e0560097ef9caab208221062e81cd77ef72162923a1906a40")),
            fp1FromBigInt(BigNumber.from("0x000000000000000000000000000000001302dcc50c6ce4c28086f8e1b43f9f65543cf598be440123816765ab6bc93f62bceda80045fbcad8598d4f32d03ee8fa"))
        ),
        false
    )

    let pairingRes = pairing(mew1, mew2)

    console.log("result: ")
    pairingRes.displayInfo()
    console.log(pairingRes)
    // pairingRes.displayInfo()
}

calcPairing()