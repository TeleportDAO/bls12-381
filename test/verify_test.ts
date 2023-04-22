import { untwist, pointDouble, pointMul, pointAdd, point } from "../src/points"
import { fp1FromBigInt, fp2FromBigInt, fp6FromBigInt, fp12FromBigInt } from "../src/fields"
import { BigNumber } from "@ethersproject/bignumber";
import { Fp, Fp1, Fp2, Fp6, Fp12 } from "../src/fields"

import { pairing, miller, doubleEval, addEval } from "../src/pairing"

const g1AddTestVector = require("./fixtures/g1_add.json")
const g2AddTestVector = require("./fixtures/g2_add.json")

function verify() {
    let P = new point (
        fp1FromBigInt(BigNumber.from("3071902358779104425805220059913391042958977442368743450008922736970201383908820407429457646333339330346464018568299")),
        fp1FromBigInt(BigNumber.from("208729469830998646909339719617829960147637284847029296662162145937938053125975650713155855600870449370845588704920")),
        false 
    )

    // let Hm = new point (
    //     new Fp2(
    //         fp1FromBigInt(BigNumber.from("2357556650209231585002654467241659159063900268360871707630297623496109598089657193704186795702074478622917895656384")),
    //         fp1FromBigInt(BigNumber.from("3953605227375649587553282126565793338489478933421008011676219910137022551750442290689597974472294891051907650111197"))
    //     ),
    //     new Fp2(
    //         fp1FromBigInt(BigNumber.from("2636356076845621042340998927146453389877292467744110912831694031602037452225656755036030562878672313329396684758868")),
    //         fp1FromBigInt(BigNumber.from("2495601009524620857707705364800595215702994859258454180584354350679476916692161325761009870302795857111988758374874"))
    //     ),
    //     false
    // )

    let Hm = new point (
        new Fp2(
            fp1FromBigInt(BigNumber.from("377525340465127240390006870673927129435673249221760063250140335517131386743242190939209933287674151299948365589984")),
            fp1FromBigInt(BigNumber.from("1050959494132411586723873443636085717179713480840095989211192028601018716895799746178715855146873969711260353313306"))
        ),
        new Fp2(
            fp1FromBigInt(BigNumber.from("1131267707057668367159571747448144959495496577180002964665679138922368484682635468083328267231891238196968252631379")),
            fp1FromBigInt(BigNumber.from("3783154323541729598398766283148329593362868413141617593978449262336941595119881847879377563302954053187852058644118"))
        ),
        false
    )

    // console.log("Px: ", P.x)
    // console.log("Py: ", P.y)

    // console.log("P.pointNegate()x: ", P.pointNegate().x)
    // console.log("P.pointNegate()y: ", P.pointNegate().y)

    
    

    console.log(P.isOnCurve())
    console.log(Hm.isOnCurve())

    console.log(P.isInSubGroup())
    console.log(Hm.isInSubGroup())


    let G = new point (
        fp1FromBigInt(BigNumber.from("3685416753713387016781088315183077757961620795782546409894578378688607592378376318836054947676345821548104185464507")),
        fp1FromBigInt(BigNumber.from("1339506544944476473020471379941921221584933875938349620426543736416511423956333506472724655353366534992391756441569")),
        false 
    )

    let S = new point (
        new Fp2(
            fp1FromBigInt(BigNumber.from("966572263166434944599183957482752531047038993953916430862595578899059824912156165297149403978420723932172123775406")),
            fp1FromBigInt(BigNumber.from("842321951799503469014964953496381065608123412078137658319961132736911642409943969612292629578043499296195717122533"))
        ),
        new Fp2(
            fp1FromBigInt(BigNumber.from("1639805997476177777241606094884612303776858264957232458415894583607376414805753804084820168641517462543804792794779")),
            fp1FromBigInt(BigNumber.from("3855722596444217665140296300241881837775734411784092265317102637289824807772757224642216633698428180424693166393122"))
        ),
        false
    )


    console.log(G.isOnCurve())
    console.log(S.isOnCurve())

    console.log(G.isInSubGroup())
    console.log(S.isInSubGroup())


    // let pairingRes = pairing(P.pointNegate(), Hm)
    let pairingRes = pairing(P, Hm)
    let pairingRes2 = pairing(G, S)

    pairingRes.displayInfo()
    pairingRes2.displayInfo()
    console.log(pairingRes.eq(pairingRes2))
}

verify()