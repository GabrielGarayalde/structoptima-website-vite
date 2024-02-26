function HSBToRGB(h, s, b) {
  s /= 100;
  b /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const bb = Math.round(f(1) * 255);
  return [r, g, bb];
}

// Function to map the data values to grayscale color
export default function mapValueToColor(value, type) {
  if (type === "topopt") {
    const colorValue = Math.floor(value * 255); // Map [0, 1] to [0, 255]
    return `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
  }
  if (type === "VM") {
    const hue = (1 - value) * 240; // Map value to hue range [0, 240]
    const saturation = 100; // Set saturation to maximum
    const brightness = 100; // Set brightness to maximum
    const rgb = HSBToRGB(hue, saturation, brightness);
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }
  if (type === "TC") {
    let r = 0;
    let b = 0;
    if (value < 0) {
      r = 0;
      b = 255;
    } else {
      r = 255;
      b = 0;
    }
    const g = 0;

    return `rgb(${r},0,${b})`;
  }
}
