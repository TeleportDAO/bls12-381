import { expect } from "chai"
import { untwist, pointDouble, pointMul, pointAdd, point } from "../src/points"
import { mod, fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt, order, groupOrder } from "../src/fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "../src/fields"

import { pairing, miller, doubleEval, addEval } from "../src/pairing"

const g1AddTestVector = require("./fixtures/g1_add.json")
const g2AddTestVector = require("./fixtures/g2_add.json")


describe.only("Pairing", () => {

    it("pairing", function() {



        // let mew1 = new point (
        //     fp1FromBigInt(BigNumber.from("3071902358779104425805220059913391042958977442368743450008922736970201383908820407429457646333339330346464018568299")),
        //     fp1FromBigInt(BigNumber.from("208729469830998646909339719617829960147637284847029296662162145937938053125975650713155855600870449370845588704920")),
        //     false 
        // )
        let mew1 = new point (
            fp1FromBigInt(3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507n),
            fp1FromBigInt(1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569n),
            false 
        )

        // let mew2 = new point (
        //     new Fp2(
        //         fp1FromBigInt(BigNumber.from("377525340465127240390006870673927129435673249221760063250140335517131386743242190939209933287674151299948365589984")),
        //         fp1FromBigInt(BigNumber.from("1050959494132411586723873443636085717179713480840095989211192028601018716895799746178715855146873969711260353313306"))
        //     ),
        //     new Fp2(
        //         fp1FromBigInt(BigNumber.from("1131267707057668367159571747448144959495496577180002964665679138922368484682635468083328267231891238196968252631379")),
        //         fp1FromBigInt(BigNumber.from("3783154323541729598398766283148329593362868413141617593978449262336941595119881847879377563302954053187852058644118"))
        //     ),
        //     false
        // )

        let mew2 = new point (
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

        // let pairingRes = pairing(
        //     pointMul(BigNumber.from("966572263166434944599183957482752531047038993953916430862595578899059824912156165297149403978420723932172123775406"), mew1), 
        //     pointMul(BigNumber.from("842321951799503469014964953496381065608123412078137658319961132736911642409943969612292629578043499296195717122533"), mew2)
        // )
        // let pairingRes2 = pairing(
        //     mew1, 
        //     pointMul(
        //         (
        //             BigNumber.from("966572263166434944599183957482752531047038993953916430862595578899059824912156165297149403978420723932172123775406").mul(
        //                 BigNumber.from("842321951799503469014964953496381065608123412078137658319961132736911642409943969612292629578043499296195717122533")
        //             )
        //         ).mod(groupOrder)
        //         , 
        //         mew2
        //     )
        // )

        console.log(mew1.isOnCurve())
        console.log(mew1.isInSubGroup())

        console.log(mew2.isOnCurve())
        console.log(mew2.isInSubGroup())

        let pairingRes = pairing(
            pointMul(3n, mew1), 
            pointMul(2n, mew2)
        )
        // pairingRes.displayInfo()

        // let pairingRes2 = pairing(
        //     mew1, 
        //     pointMul(
        //         6n, 
        //         mew2
        //     )
        // )

        // pairingRes.displayInfo()
        // pairingRes2.displayInfo()

        // let pairingRes = pairing(mew1, mew2)
        // console.log(pairingRes.displayInfo())
        // let pairingRes2 = pairing(mew1, pointMul(BigNumber.from(3), mew2))
        // pairingRes = pairingRes.mul(pairingRes).mul(pairingRes)
        // pairingRes2.displayInfo()
        
        // let pairingRes = pairing(mew1, mew2)
        // let pairingRes2 = pairing(mew1.pointNegate(), mew2)
        // pairingRes.inv().displayInfo()
        // pairingRes2.displayInfo()
        // pairingRes.mul(pairingRes2).displayInfo()
        // console.log(pairingRes.mul(pairingRes2).equalOne())

        // console.log("result: ")
        // pairingRes.a1.displayInfo()
        // pairingRes.a0.displayInfo()

        // console.log("result: ")
        // pairingRes2.a1.displayInfo()
        // pairingRes2.a0.displayInfo()
        // // pairingRes.displayInfo()
        
        // expect(
        //     pairingRes.eq(pairingRes2)
        // ).to.equal(true)

    }).timeout(600000)

    it("double eval", function() {
        let mew1 = new point (
            fp1FromBigInt(g1AddTestVector.g1_add[0].p1X),
            fp1FromBigInt(g1AddTestVector.g1_add[0].p1Y),
            false 
        )
    
        let mew2 = new point (
            new Fp2(
                fp1FromBigInt(g2AddTestVector.g2_add[0].p1X_a0),
                fp1FromBigInt(g2AddTestVector.g2_add[0].p1X_a1),
            ),
            new Fp2(
                fp1FromBigInt(g2AddTestVector.g2_add[0].p1Y_a0),
                fp1FromBigInt(g2AddTestVector.g2_add[0].p1Y_a1),
            ),
            false
        )
    
        let doubleEvalRes = doubleEval(mew2, mew1)
        let addEvalRes = addEval(mew2, mew2, mew1)

        expect(
            doubleEvalRes.eq(addEvalRes)
        ).to.equal(true)
    
        // console.log("result: ")
    
        // console.log(doubleEvalRes.eq(addEvalRes))
    
        // doubleEvalRes.displayInfo()
        // addEvalRes.displayInfo()
    }).timeout(100000)
})