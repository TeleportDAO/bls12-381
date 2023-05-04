function isLexicographicallyLess(a: string, b: string): boolean {
  // Convert hex strings to byte arrays
  const bytesA = hexStringToByteArray(a);
  const bytesB = hexStringToByteArray(b);

  // Compare byte arrays lexicographically
  for (let i = 0; i < bytesA.length && i < bytesB.length; i++) {
    if (bytesA[i] < bytesB[i]) {
      return true;
    } else if (bytesA[i] > bytesB[i]) {
      return false;
    }
  }
  return bytesA.length < bytesB.length;
}

function hexStringToByteArray(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hex string');
  }
  const uint8Array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    const byte = parseInt(hexString.slice(i, i + 2), 16);
    if (isNaN(byte)) {
      throw new Error('Invalid hex string');
    }
    uint8Array[i / 2] = byte;
  }
  return uint8Array;
}


function isLexicographicallyLarger(y1: string, y2: string): boolean {
  // Convert the y values to Buffers for bitwise comparison
  const y1Buffer = Buffer.from(y1, "hex");
  const y2Buffer = Buffer.from(y2, "hex");

  console.log("y1Buffer: ", y1Buffer)
  console.log("y1Buffer[0] ", y1Buffer[0])

  console.log("y2Buffer: ", y2Buffer)
  console.log("y2Buffer[0] ", y2Buffer[0])

  // Compare the most significant bits first
  for (let i = 0; i < y1Buffer.length; i++) {
    if (y1Buffer[i] !== y2Buffer[i]) {
      // If the bits are not equal, return whether y1's bit is larger
      return (y1Buffer[i] & 0x80) > (y2Buffer[i] & 0x80);
      // return (y1Buffer[i]) > (y2Buffer[i]);
    }
  }

  // If all bits are equal, y1 and y2 are equal
  return false;
}



function doTask(): void {
  const a = "015b2c2b84e6a8bd20efd524811835b8aa6e3fd1e91bb793c77def50420166142de12cb76ca061fb7a6a04794b934e98";
  const b = "18a5e5beb4993ddd2a2bd291c233771eba090bb30a695b2b9fb2e350b4af900ff0cad34744b39e043f94fb86b46c5c13";
  console.log(isLexicographicallyLess(a, b)); // should output true
  console.log(isLexicographicallyLess(b, a)); // should output false

}

function doTask2(): void {
  const y1 = "0123456789abcdef";
  const y2 = "fedcba9876543210";
  const isY1LexicographicallyLarger = isLexicographicallyLarger(y1, y2);
  console.log(`y1 is lexicographically larger: ${isY1LexicographicallyLarger}`);
}

doTask2()