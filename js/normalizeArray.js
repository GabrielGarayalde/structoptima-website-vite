export default function normalizeArray(arr) {
  const max = Math.max(...arr);
  const normalizedArray = arr.map((value) => value / max);

  return normalizedArray;
}
