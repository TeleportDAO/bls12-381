function splitStringFromEnd(str, n) {
    let segments = [];
    let endIndex = str.length;
    let startIndex = endIndex - n;
  
    while (startIndex >= 0) {
      segments.push(str.slice(startIndex, endIndex));
      endIndex = startIndex;
      startIndex = endIndex - n;
    }
  
    // Add any remaining characters as a segment
    if (endIndex > 0) {
      segments.push(str.slice(0, endIndex));
    }
  
    return segments;
  }

  console.log(splitStringFromEnd("0x0aa76eceea82085ea1ee712fe31eb7933f20efb70e78c5365f1b64a30f0c6cfe730414deb55abe41e0b230450d4f6e9b", 64))