import { u as Point } from "./index-NZHt9VGv.js";
function intersectLineWithViewport(e, t, startCap, endCap, width, height, dashOffset) {
  const eInside = e.x >= 0 && e.x <= width && e.y >= 0 && e.y <= height;
  const tInside = t.x >= 0 && t.x <= width && t.y >= 0 && t.y <= height;
  if (eInside && tInside && !startCap && !endCap) {
    return [e, t];
  }
  if (e.x < 0 && t.x < 0 && (e.x < t.x ? !endCap : !startCap) || e.x > width && t.x > width && (e.x < t.x ? !startCap : !endCap) || e.y < 0 && t.y < 0 && (e.y < t.y ? !endCap : !startCap) || e.y > height && t.y > height && (e.y < t.y ? !startCap : !endCap)) {
    return null;
  }
  const clippedPoints = [];
  if (e.x === t.x) {
    if (e.x < 0 || e.x > width) return null;
    if (e.y < t.y) {
      clippedPoints.push(
        new Point(
          e.x,
          dashOffset === 0 ? 0 : e.y < 0 ? e.y % dashOffset : -(dashOffset - e.y % dashOffset)
        ),
        new Point(t.x, height)
      );
    } else {
      clippedPoints.push(
        new Point(
          e.x,
          dashOffset === 0 ? height : e.y > height ? height + (e.y - height) % dashOffset : height + (dashOffset - (height - e.y) % dashOffset)
        ),
        new Point(t.x, 0)
      );
    }
  } else if (e.y === t.y) {
    if (e.y < 0 || e.y > height) return null;
    if (e.x < t.x) {
      clippedPoints.push(
        new Point(
          dashOffset === 0 ? 0 : e.x < 0 ? e.x % dashOffset : -(dashOffset - e.x % dashOffset),
          e.y
        ),
        new Point(width, t.y)
      );
    } else {
      clippedPoints.push(
        new Point(
          dashOffset === 0 ? width : e.x > width ? width + (e.x - width) % dashOffset : width + (dashOffset - (width - e.x) % dashOffset),
          e.y
        ),
        new Point(0, t.y)
      );
    }
  } else {
    const slope = (t.y - e.y) / (t.x - e.x);
    const intercept = e.y - slope * e.x;
    const clamp = (val, min, max) => val >= min && val <= max ? val : null;
    const xLeftY = clamp(intercept, 0, height);
    if (xLeftY !== null) {
      if (dashOffset > 0 && (e.x <= 0 || startCap && e.x < t.x)) {
        const dist = e.x <= 0 ? Math.hypot(0 - e.x, xLeftY - e.y) % dashOffset : dashOffset - Math.hypot(0 - e.x, xLeftY - e.y) % dashOffset;
        const dx = Math.cos(Math.atan(slope)) * dist;
        const dy = slope * dx;
        clippedPoints.push(new Point(-dx, xLeftY - dy));
      } else {
        clippedPoints.push(new Point(0, xLeftY));
      }
    }
    const xRightY = clamp(slope * width + intercept, 0, height);
    if (xRightY !== null) {
      if (dashOffset > 0 && (e.x >= width || startCap && e.x > t.x)) {
        const dist = e.x >= width ? Math.hypot(e.x - width, e.y - xRightY) % dashOffset : dashOffset - Math.hypot(e.x - width, e.y - xRightY) % dashOffset;
        const dx = Math.cos(Math.atan(slope)) * dist;
        const dy = slope * dx;
        clippedPoints.push(new Point(width + dx, xRightY + dy));
      } else {
        clippedPoints.push(new Point(width, xRightY));
      }
    }
    const yTopX = clamp(-intercept / slope, 0, width);
    if (yTopX !== null && (yTopX !== 0 || xLeftY !== 0)) {
      if (dashOffset > 0 && (e.y <= 0 || startCap && e.y < t.y)) {
        const dist = e.y <= 0 ? Math.hypot(e.x - yTopX, e.y) % dashOffset : dashOffset - Math.hypot(e.x - yTopX, e.y) % dashOffset;
        const dx = Math.cos(Math.atan(slope)) * dist;
        const dy = slope * dx;
        clippedPoints.push(new Point(yTopX - Math.sign(slope) * dx, 0 - Math.sign(slope) * dy));
      } else {
        clippedPoints.push(new Point(yTopX, 0));
      }
    }
    const yBottomX = clamp((height - intercept) / slope, 0, width);
    if (yBottomX !== null && (yBottomX !== 0 || xRightY !== height)) {
      if (dashOffset > 0 && (e.y >= height || startCap && e.y > t.y)) {
        const dist = e.y >= height ? Math.hypot(e.x - yBottomX, e.y - height) % dashOffset : dashOffset - Math.hypot(e.x - yBottomX, e.y - height) % dashOffset;
        const dx = Math.cos(Math.atan(slope)) * dist;
        const dy = slope * dx;
        clippedPoints.push(
          new Point(yBottomX + Math.sign(slope) * dx, height + Math.sign(slope) * dy)
        );
      } else {
        clippedPoints.push(new Point(yBottomX, height));
      }
    }
  }
  if (clippedPoints.length < 1) return null;
  if (clippedPoints.length < 2) clippedPoints.push(clippedPoints[0]);
  const sameDirection = (a, b, originalA, originalB) => Math.sign(a.x - b.x) === Math.sign(originalA.x - originalB.x) && Math.sign(a.y - b.y) === Math.sign(originalA.y - originalB.y);
  if (!startCap && eInside) {
    return [
      e,
      sameDirection(clippedPoints[0], clippedPoints[1], e, t) ? clippedPoints[1] : clippedPoints[0]
    ];
  }
  if (!endCap && tInside) {
    return [
      sameDirection(clippedPoints[0], clippedPoints[1], e, t) ? clippedPoints[0] : clippedPoints[1],
      t
    ];
  }
  return sameDirection(clippedPoints[0], clippedPoints[1], e, t) ? [clippedPoints[0], clippedPoints[1]] : [clippedPoints[1], clippedPoints[0]];
}
export {
  intersectLineWithViewport as i
};
