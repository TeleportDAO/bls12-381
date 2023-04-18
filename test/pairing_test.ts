import { untwist, pointDouble, pointAdd, point } from "../src/points"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "../src/fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "../src/fields"
import { pairing, pointMul, miller } from "../src/pairing"



function calcPairing() {
    let mew1 = new point (
        fp1FromBigInt(BigNumber.from("3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507")),
        fp1FromBigInt(BigNumber.from("1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569")),
        false 
    )


    let mew2 = new point (
        new Fp2(
            fp1FromBigInt(BigNumber.from("3059144344244213709971259814753781636986470325476647558659373206291635324768958432433509563104347017837885763365758")),
            fp1FromBigInt(BigNumber.from("352701069587466618187139116011060144890029952792775240219908644239793785735715026873347600343865175952761926303160"))
        ),
        new Fp2(
            fp1FromBigInt(BigNumber.from("927553665492332455747201965776037880757740193453592970025027978793976877002675564980949289727957565575433344219582")),
            fp1FromBigInt(BigNumber.from("1985150602287291935568054521177171638300868978215655730859378665066344726373823718423869104263333984641494340347905"))
        ),
        false
    )

    let pairingRes = pairing(mew1, mew2)

    console.log("result: ")
    pairingRes.a1.displayInfo()
    pairingRes.a0.displayInfo()
    // pairingRes.displayInfo()
}

calcPairing()