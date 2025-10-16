export function createVehicle(type, name) {
  if (type === 'car') {
    return { name, type, maxSpeed: 200 };
  } else if (type === 'truck') {
    return { name, type, maxSpeed: 140 };
  }
  return { name, type: 'motorcycle', maxSpeed: 180 };
}
