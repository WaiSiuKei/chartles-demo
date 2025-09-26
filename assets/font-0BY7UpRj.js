function makeFont(fontSize, fontFamily, fontStyle, fontWeight) {
  return `${fontStyle ? fontStyle + " " : ""}${fontWeight ? fontWeight + " " : ""}${fontSize}px ${fontFamily}`;
}
export {
  makeFont as m
};
