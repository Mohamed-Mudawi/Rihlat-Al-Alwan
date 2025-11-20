export function hexToRgb(hex) {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function mixHexColors(hexA, hexB) {
  const A = hexToRgb(hexA);
  const B = hexToRgb(hexB);

  const avg = {
    r: Math.round((A.r + B.r) / 2),
    g: Math.round((A.g + B.g) / 2),
    b: Math.round((A.b + B.b) / 2),
  };

  return rgbToHex(avg);
}
