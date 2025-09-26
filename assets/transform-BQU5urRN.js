import { u as Point } from "./index-DSkroicZ.js";
function rotationMatrix(angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1]
  ];
}
function scalingMatrix(scaleX, scaleY) {
  return [
    [scaleX, 0, 0],
    [0, scaleY, 0],
    [0, 0, 1]
  ];
}
function translationMatrix(dx, dy) {
  return [
    [1, 0, dx],
    [0, 1, dy],
    [0, 0, 1]
  ];
}
function transformPoint(mat, point) {
  const inputVec = [point.x, point.y, 1];
  const resultVec = [0, 0, 0];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      resultVec[row] += mat[row][col] * inputVec[col];
    }
  }
  return new Point(resultVec[0], resultVec[1]);
}
export {
  translationMatrix as a,
  rotationMatrix as r,
  scalingMatrix as s,
  transformPoint as t
};
