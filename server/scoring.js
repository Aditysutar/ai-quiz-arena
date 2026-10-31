export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 50;

export function scoreAnswer({ correct, elapsedMs, timeLimitMs }) {
  if (!correct) {
    return { points: 0, speedBonus: 0 };
  }

  const remainingRatio = Math.max(0, Math.min(1, 1 - elapsedMs / timeLimitMs));
  const speedBonus = Math.round(MAX_SPEED_BONUS * remainingRatio);
  return {
    points: BASE_POINTS + speedBonus,
    speedBonus
  };
}
