import { G as PaneCursor } from "./index-DSkroicZ.js";
function thirdPointCursorType(e, t) {
  const i = t.x - e.x, n = t.y - e.y, r = Math.abs(Math.atan2(i, n));
  return r > Math.PI / 4 && r < 3 * Math.PI / 4 ? PaneCursor.ns : PaneCursor.ew;
}
export {
  thirdPointCursorType as t
};
