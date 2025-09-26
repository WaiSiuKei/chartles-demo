import { s as should } from "./index-DSkroicZ.js";
function roundByMinmov(val, minmov) {
  should(minmov > 0);
  return Math.round(val / minmov) * minmov;
}
export {
  roundByMinmov as r
};
