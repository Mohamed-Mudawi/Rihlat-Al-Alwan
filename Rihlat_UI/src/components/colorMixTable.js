export const NAME_TO_HEX = {
    Red: "#e74c3c",
    Blue: "#3498db",
    Green: "#2ecc71",
    Yellow: "#f1c40f",
    Purple: "#9b59b6",
    Orange: "#e67e22",
    White: "#ffffff",
    Black: "#000000",
};

// Optional simple dictionary rules
export const NAMED_MIXES = {
    "Red+Blue": "Purple",
    "Blue+Yellow": "Green",
    "Red+Yellow": "Orange",
};

export function mixTwoColorNames(a, b) {
    const k1 = `${a}+${b}`;
    const k2 = `${b}+${a}`;
    return NAMED_MIXES[k1] || NAMED_MIXES[k2] || null;
}
