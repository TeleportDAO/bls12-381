import { Fp, Fp1, Fp2, Fp6, Fp12, order, groupOrder, mod } from "./fields";

function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    let hexString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const hex = uint8Array[i].toString(16);
      hexString += (hex.length === 1 ? '0' + hex : hex);
    }
    return hexString;
}

function hexToBigint(theHex: string): bigint {
    return BigInt('0x' + theHex)
}


function decompressBls(publicKey: string): { x: string, y: string } {
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    const xCoord = publicKeyBuffer.slice(0, 47); // Extract first 48 bytes for x coordinate
    const yFlag = publicKeyBuffer.readUInt8(47); // Read y flag from last byte
    const yCoordBig = getYCoordinate(xCoord, yFlag); // Get y coordinate as a BigInt
    const yCoordBuffer = Buffer.from(yCoordBig.toString(16).padStart(96, '0'), 'hex'); // Convert y coordinate to buffer
    return {
      x: xCoord.toString('hex'),
      y: yCoordBuffer.toString('hex'),
    };
}
  
function getYCoordinate(xCoord: Buffer, yFlag: number): bigint {
    const xCoordBig = BigInt(`0x${xCoord.toString('hex')}`);
    const b = 4n; // Curve parameter
    const yCoordBig = sqrtMod(mod(xCoordBig * xCoordBig * xCoordBig + b, groupOrder), groupOrder);
    if (yCoordBig % 2n !== BigInt(yFlag)) { // Negate y coordinate if flag is set to 1
      return groupOrder - yCoordBig;
    }
    return yCoordBig;
}
  
function sqrtMod(n: bigint, p: bigint): bigint {
    if (n === 0n) {
      return 0n;
    }
    if (p % 4n === 3n) {
      return modExp(n, (p + 1n) / 4n, p);
    }
    throw new Error('Invalid prime field for square root computation');
}
  
function modExp(base: bigint, exponent: bigint, modulus: bigint): bigint {
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }
    return result;
}
  

function doTask(): void {
    // const publicKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01';
    const publicKey = '93f563b00742791d5a2a1baf2099b2944d210d1a6739caff2b9d83c5030aaa872bc688601875301b7d851eb6c62e146b';
    const { x, y } = decompressBls(publicKey);
    console.log(`x: ${x}`);
    console.log(`y: ${y}`);

    // Px:  Fp {
    //     value: 3071902358779104425805220059913391042958977442368743450008922736970201383908820407429457646333339330346464018568299n
    //   }
    //   Py:  Fp {
    //     value: 208729469830998646909339719617829960147637284847029296662162145937938053125975650713155855600870449370845588704920n
    //   }
}

doTask()