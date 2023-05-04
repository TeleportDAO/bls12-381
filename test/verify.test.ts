import { expect } from "chai"
import { pointDouble, pointMul, pointAdd, point } from "../src/points"
import { mod, fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "../src/fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "../src/fields"

import { pairing } from "../src/pairing"

const bls = require('@noble/bls12-381');

const g1AddTestVector = require("./fixtures/g1_add.json")
const g2AddTestVector = require("./fixtures/g2_add.json")

describe("Verification", () => {

    it("verify", function() {
        let P = new point (
            fp1FromBigInt(3071902358779104425805220059913391042958977442368743450008922736970201383908820407429457646333339330346464018568299n),
            fp1FromBigInt(208729469830998646909339719617829960147637284847029296662162145937938053125975650713155855600870449370845588704920n),
            false 
        )
    
        let Hm = new point (
            new Fp2(
                fp1FromBigInt(1050959494132411586723873443636085717179713480840095989211192028601018716895799746178715855146873969711260353313306n),
                fp1FromBigInt(377525340465127240390006870673927129435673249221760063250140335517131386743242190939209933287674151299948365589984n),
            ),
            new Fp2(
                fp1FromBigInt(3783154323541729598398766283148329593362868413141617593978449262336941595119881847879377563302954053187852058644118n),
                fp1FromBigInt(1131267707057668367159571747448144959495496577180002964665679138922368484682635468083328267231891238196968252631379n),
            ),
            false
        )
    
        expect(
            P.isOnCurve()
        ).to.equal(true)

        expect(
            Hm.isOnCurve()
        ).to.equal(true)
    
        expect(
            P.isInSubGroup()
        ).to.equal(true)

        expect(
            Hm.isInSubGroup()
        ).to.equal(true)
    
    
        let G = new point (
            fp1FromBigInt(3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n),
            fp1FromBigInt(1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n),
            false 
        )
    
        let S = new point (
            new Fp2(
                fp1FromBigInt(842321951799503469014964953496381065608123412078137658319961132736911642409943969612292629578043499296195717122533n),
                fp1FromBigInt(966572263166434944599183957482752531047038993953916430862595578899059824912156165297149403978420723932172123775406n),
            ),
            new Fp2(
                fp1FromBigInt(3855722596444217665140296300241881837775734411784092265317102637289824807772757224642216633698428180424693166393122n),
                fp1FromBigInt(1639805997476177777241606094884612303776858264957232458415894583607376414805753804084820168641517462543804792794779n),
            ),
            false
        )
    
        expect(
            G.isOnCurve()
        ).to.equal(true)

        expect(
            S.isOnCurve()
        ).to.equal(true)
    
        expect(
            G.isInSubGroup()
        ).to.equal(true)

        expect(
            S.isInSubGroup()
        ).to.equal(true)

        let pairingRes = pairing(P.pointNegate(), Hm)
        // let pairingRes = pairing(P, Hm)
        // console.log("pairingRes: ")
        // pairingRes.displayInfo()

        let pairingRes2 = pairing(G, S)
        // console.log("pairingRes2: ")
        // pairingRes2.displayInfo()
    
        // expect(
        //     pairingRes.mul(pairingRes2).equalOne()
        // ).to.equal(true)

        // console.log("before theMustOne", new Date())
        // let theMustOne = pairingRes.mul(pairingRes2).finalExponentiate()
        // console.log("after theMustOne", new Date())

        let theMulRes = pairingRes.mul(pairingRes2)

        console.log("theMulRes")
        theMulRes.displayInfoForSolidity()

        expect(
            theMulRes.finalExponentiate().equalOne()
        ).to.equal(true)

    }).timeout(80000)

    it("messageVerification", async function() {
        let hashedMessage = "01a6ba2f9a11fa5598b2d8ace0fbe0a0eacb65deceb476fbbcb64fd24557c2f4"
        let moc = (await bls.PointG2.hashToCurve(hashedMessage)).toAffine()
        let privateKey = 0x63eda653299d7d483339d80809a1d80553bda402fffe5bfeffaaffff00000001n
    
        let G = new point (
            fp1FromBigInt(3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n),
            fp1FromBigInt(1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n),
            false 
        )
    
        let P = pointMul(privateKey, G)
    
        let Hm = new point (
            new Fp2(
                fp1FromBigInt(moc[0].c0.value),
                fp1FromBigInt(moc[0].c1.value),
            ),
            new Fp2(
                fp1FromBigInt(moc[1].c0.value),
                fp1FromBigInt(moc[1].c1.value),
            ),
            false
        )
    
        let S = pointMul(privateKey, Hm)
    
        if (!P.isOnCurve() || !P.isInSubGroup())
            throw("invalid publickey")
        if (!Hm.isOnCurve() || !Hm.isInSubGroup())
            throw("invalid message")
        if (!S.isOnCurve() || !S.isInSubGroup())
            throw("invalid signature")
        if (!G.isOnCurve() || !G.isInSubGroup())
            throw("invalid generator point")
    
        let pairingRes = pairing(P.pointNegate(), Hm)
        let pairingRes2 = pairing(G, S)
    
        expect(
            pairingRes.mul(pairingRes2).finalExponentiate().equalOne()
        ).to.equal(true)
    }).timeout(80000)
})

