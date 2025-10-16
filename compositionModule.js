export function increaseSpeed(speed, increment) {
  return speed + increment;
}

export function decreaseSpeed(speed, decrement) {
  return Math.max(0, speed - decrement);
}
