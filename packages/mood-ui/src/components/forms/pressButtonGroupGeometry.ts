export interface DividerSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GroupMorphGeometry {
  /** Outer contour path (`inset = 0`) used for CSS `clip-path: path(...)` */
  clipPathD: string;
  /** Border contour path (`inset = 0.5`) so a 1px stroke sits flush inside the clip edge */
  strokePathD: string;
  /** Internal 1px seam dividers trimmed precisely to the morphed contour */
  dividers: DividerSegment[];
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

function buildHorizontalContour(
  W: number,
  H: number,
  outerR: number,
  seams: number[],
  press: number[],
  inset: number,
): { pathD: string; dividers: DividerSegment[] } {
  const N = press.length;
  if (N === 0 || W <= 2 || H <= 2) {
    return { pathD: "", dividers: [] };
  }

  // Symmetrical vertical squeeze per side (~9% of height -> ~7.2px total on a 40px bar)
  const maxDy = Math.min(4.2, Math.max(2.4, H * 0.09));
  const maxDx = maxDy * 0.68;

  const pFirst = Math.max(0, Math.min(1, press[0] ?? 0));
  const pLast = Math.max(0, Math.min(1, press[N - 1] ?? 0));

  const xLeft = inset + pFirst * maxDx;
  const xRight = Math.max(xLeft + 1, W - inset - pLast * maxDx);

  const topY: number[] = new Array(N);
  const botY: number[] = new Array(N);
  for (let k = 0; k < N; k++) {
    const pk = Math.max(0, Math.min(1, press[k] ?? 0));
    topY[k] = inset + pk * maxDy;
    botY[k] = Math.max(topY[k]! + 1, H - inset - pk * maxDy);
  }

  const baseR = Math.max(0, outerR - inset);
  const hLeft = Math.max(0, botY[0]! - topY[0]!);
  const hRight = Math.max(0, botY[N - 1]! - topY[N - 1]!);
  const wFirst = Math.max(0, (seams[1] ?? xRight) - xLeft);
  const wLast = Math.max(0, xRight - (seams[N - 1] ?? xLeft));

  const rLeft = Math.min(
    baseR,
    hLeft / 2,
    N === 1 ? wFirst / 2 : wFirst * 0.62,
  );
  const rRight = Math.min(
    baseR,
    hRight / 2,
    N === 1 ? wLast / 2 : wLast * 0.62,
  );

  // Compute safe S-curve half-spreads per internal seam so curves never collide
  const targetSpread = Math.min(22, Math.max(12, H * 0.48));
  const spreads: number[] = new Array(N).fill(0);
  for (let k = 1; k < N; k++) {
    const sx = seams[k]!;
    const availLeft =
      k === 1
        ? (sx - (xLeft + rLeft)) * 0.85
        : (sx - seams[k - 1]!) * 0.46;
    const availRight =
      k === N - 1
        ? (xRight - rRight - sx) * 0.85
        : (seams[k + 1]! - sx) * 0.46;
    spreads[k] = Math.max(0, Math.min(targetSpread, availLeft, availRight));
  }

  const cmds: string[] = [];
  cmds.push(`M ${fmt(xLeft + rLeft)} ${fmt(topY[0]!)}`);

  // Top edge (left -> right) with C1-continuous cubic Bezier S-curves across seams
  for (let k = 1; k < N; k++) {
    const sx = seams[k]!;
    const sp = spreads[k]!;
    const y0 = topY[k - 1]!;
    const y1 = topY[k]!;
    if (Math.abs(y1 - y0) >= 0.04 && sp >= 0.5) {
      cmds.push(`L ${fmt(sx - sp)} ${fmt(y0)}`);
      cmds.push(
        `C ${fmt(sx)} ${fmt(y0)}, ${fmt(sx)} ${fmt(y1)}, ${fmt(sx + sp)} ${fmt(y1)}`,
      );
    }
  }

  cmds.push(`L ${fmt(xRight - rRight)} ${fmt(topY[N - 1]!)}`);
  if (rRight > 0.05) {
    cmds.push(
      `A ${fmt(rRight)} ${fmt(rRight)} 0 0 1 ${fmt(xRight)} ${fmt(topY[N - 1]! + rRight)}`,
    );
  }

  cmds.push(`L ${fmt(xRight)} ${fmt(botY[N - 1]! - rRight)}`);
  if (rRight > 0.05) {
    cmds.push(
      `A ${fmt(rRight)} ${fmt(rRight)} 0 0 1 ${fmt(xRight - rRight)} ${fmt(botY[N - 1]!)}`,
    );
  }

  // Bottom edge (right -> left) mirroring top S-curves
  for (let k = N - 1; k >= 1; k--) {
    const sx = seams[k]!;
    const sp = spreads[k]!;
    const yRight = botY[k]!;
    const yLeft = botY[k - 1]!;
    if (Math.abs(yRight - yLeft) >= 0.04 && sp >= 0.5) {
      cmds.push(`L ${fmt(sx + sp)} ${fmt(yRight)}`);
      cmds.push(
        `C ${fmt(sx)} ${fmt(yRight)}, ${fmt(sx)} ${fmt(yLeft)}, ${fmt(sx - sp)} ${fmt(yLeft)}`,
      );
    }
  }

  cmds.push(`L ${fmt(xLeft + rLeft)} ${fmt(botY[0]!)}`);
  if (rLeft > 0.05) {
    cmds.push(
      `A ${fmt(rLeft)} ${fmt(rLeft)} 0 0 1 ${fmt(xLeft)} ${fmt(botY[0]! - rLeft)}`,
    );
  }

  cmds.push(`L ${fmt(xLeft)} ${fmt(topY[0]! + rLeft)}`);
  if (rLeft > 0.05) {
    cmds.push(
      `A ${fmt(rLeft)} ${fmt(rLeft)} 0 0 1 ${fmt(xLeft + rLeft)} ${fmt(topY[0]!)}`,
    );
  }
  cmds.push("Z");

  // Internal 1px dividers meet the exact inflection midpoint at each seam
  const dividers: DividerSegment[] = [];
  for (let k = 1; k < N; k++) {
    const sx = Math.round(seams[k]!) + 0.5;
    const y1 = (topY[k - 1]! + topY[k]!) / 2;
    const y2 = (botY[k - 1]! + botY[k]!) / 2;
    dividers.push({ x1: sx, y1, x2: sx, y2 });
  }

  return { pathD: cmds.join(" "), dividers };
}

function buildVerticalContour(
  W: number,
  H: number,
  outerR: number,
  seams: number[],
  press: number[],
  inset: number,
): { pathD: string; dividers: DividerSegment[] } {
  const N = press.length;
  if (N === 0 || W <= 2 || H <= 2) {
    return { pathD: "", dividers: [] };
  }

  // Symmetrical horizontal waist squeeze per side (~4px on a 100px stack)
  const maxDx = Math.min(5.0, Math.max(3.2, W * 0.042));
  const maxDy = maxDx * 0.65;

  const pFirst = Math.max(0, Math.min(1, press[0] ?? 0));
  const pLast = Math.max(0, Math.min(1, press[N - 1] ?? 0));

  const yTop = inset + pFirst * maxDy;
  const yBot = Math.max(yTop + 1, H - inset - pLast * maxDy);

  const leftX: number[] = new Array(N);
  const rightX: number[] = new Array(N);
  for (let k = 0; k < N; k++) {
    const pk = Math.max(0, Math.min(1, press[k] ?? 0));
    leftX[k] = inset + pk * maxDx;
    rightX[k] = Math.max(leftX[k]! + 1, W - inset - pk * maxDx);
  }

  const baseR = Math.max(0, outerR - inset);
  const wTop = Math.max(0, rightX[0]! - leftX[0]!);
  const wBot = Math.max(0, rightX[N - 1]! - leftX[N - 1]!);
  const hFirst = Math.max(0, (seams[1] ?? yBot) - yTop);
  const hLast = Math.max(0, yBot - (seams[N - 1] ?? yTop));

  const rTop = Math.min(
    baseR,
    wTop / 2,
    N === 1 ? hFirst / 2 : hFirst * 0.62,
  );
  const rBot = Math.min(
    baseR,
    wBot / 2,
    N === 1 ? hLast / 2 : hLast * 0.62,
  );

  const avgRowH = H / N;
  const targetSpread = Math.min(22, Math.max(12, avgRowH * 0.48));
  const spreads: number[] = new Array(N).fill(0);
  for (let k = 1; k < N; k++) {
    const sy = seams[k]!;
    const availAbove =
      k === 1
        ? (sy - (yTop + rTop)) * 0.85
        : (sy - seams[k - 1]!) * 0.46;
    const availBelow =
      k === N - 1
        ? (yBot - rBot - sy) * 0.85
        : (seams[k + 1]! - sy) * 0.46;
    spreads[k] = Math.max(0, Math.min(targetSpread, availAbove, availBelow));
  }

  const cmds: string[] = [];
  cmds.push(`M ${fmt(leftX[0]! + rTop)} ${fmt(yTop)}`);
  cmds.push(`L ${fmt(rightX[0]! - rTop)} ${fmt(yTop)}`);
  if (rTop > 0.05) {
    cmds.push(
      `A ${fmt(rTop)} ${fmt(rTop)} 0 0 1 ${fmt(rightX[0]!)} ${fmt(yTop + rTop)}`,
    );
  }

  // Right wall (top -> bottom) with vertical-tangent S-curves across seams
  for (let k = 1; k < N; k++) {
    const sy = seams[k]!;
    const sp = spreads[k]!;
    const x0 = rightX[k - 1]!;
    const x1 = rightX[k]!;
    if (Math.abs(x1 - x0) >= 0.04 && sp >= 0.5) {
      cmds.push(`L ${fmt(x0)} ${fmt(sy - sp)}`);
      cmds.push(
        `C ${fmt(x0)} ${fmt(sy)}, ${fmt(x1)} ${fmt(sy)}, ${fmt(x1)} ${fmt(sy + sp)}`,
      );
    }
  }

  cmds.push(`L ${fmt(rightX[N - 1]!)} ${fmt(yBot - rBot)}`);
  if (rBot > 0.05) {
    cmds.push(
      `A ${fmt(rBot)} ${fmt(rBot)} 0 0 1 ${fmt(rightX[N - 1]! - rBot)} ${fmt(yBot)}`,
    );
  }

  cmds.push(`L ${fmt(leftX[N - 1]! + rBot)} ${fmt(yBot)}`);
  if (rBot > 0.05) {
    cmds.push(
      `A ${fmt(rBot)} ${fmt(rBot)} 0 0 1 ${fmt(leftX[N - 1]!)} ${fmt(yBot - rBot)}`,
    );
  }

  // Left wall (bottom -> top) mirroring right S-curves
  for (let k = N - 1; k >= 1; k--) {
    const sy = seams[k]!;
    const sp = spreads[k]!;
    const xBelow = leftX[k]!;
    const xAbove = leftX[k - 1]!;
    if (Math.abs(xBelow - xAbove) >= 0.04 && sp >= 0.5) {
      cmds.push(`L ${fmt(xBelow)} ${fmt(sy + sp)}`);
      cmds.push(
        `C ${fmt(xBelow)} ${fmt(sy)}, ${fmt(xAbove)} ${fmt(sy)}, ${fmt(xAbove)} ${fmt(sy - sp)}`,
      );
    }
  }

  cmds.push(`L ${fmt(leftX[0]!)} ${fmt(yTop + rTop)}`);
  if (rTop > 0.05) {
    cmds.push(
      `A ${fmt(rTop)} ${fmt(rTop)} 0 0 1 ${fmt(leftX[0]! + rTop)} ${fmt(yTop)}`,
    );
  }
  cmds.push("Z");

  const dividers: DividerSegment[] = [];
  for (let k = 1; k < N; k++) {
    const sy = Math.round(seams[k]!) + 0.5;
    const x1 = (leftX[k - 1]! + leftX[k]!) / 2;
    const x2 = (rightX[k - 1]! + rightX[k]!) / 2;
    dividers.push({ x1, y1: sy, x2, y2: sy });
  }

  return { pathD: cmds.join(" "), dividers };
}

export function buildHorizontalGroupGeometry(
  W: number,
  H: number,
  outerR: number,
  seams: number[],
  press: number[],
): GroupMorphGeometry {
  const clip = buildHorizontalContour(W, H, outerR, seams, press, 0);
  const stroke = buildHorizontalContour(W, H, outerR, seams, press, 0.5);
  return {
    clipPathD: clip.pathD,
    strokePathD: stroke.pathD,
    dividers: stroke.dividers,
  };
}

export function buildVerticalGroupGeometry(
  W: number,
  H: number,
  outerR: number,
  seams: number[],
  press: number[],
): GroupMorphGeometry {
  const clip = buildVerticalContour(W, H, outerR, seams, press, 0);
  const stroke = buildVerticalContour(W, H, outerR, seams, press, 0.5);
  return {
    clipPathD: clip.pathD,
    strokePathD: stroke.pathD,
    dividers: stroke.dividers,
  };
}
