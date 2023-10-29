export function uint8ArrayToHex(uint8Array) {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToUint8Array(hexString) {
  const hexLength = hexString.length;
  if (hexLength % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters");
  }

  const uint8Array = new Uint8Array(hexLength / 2);

  for (let i = 0; i < hexLength; i += 2) {
    uint8Array[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }

  return uint8Array;
}
