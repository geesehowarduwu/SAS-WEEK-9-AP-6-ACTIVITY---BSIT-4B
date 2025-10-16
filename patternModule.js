export const VehicleModule = (() => {
  let speed = 0;
  let engineOn = false;

  return {
    start() {
      engineOn = true;
      console.log("Engine started.");
      return "Engine started.";
    },
    stop() {
      engineOn = false;
      speed = 0;
      console.log("Engine stopped.");
      return "Engine stopped.";
    },
    getSpeed() {
      return speed;
    },
    setSpeed(newSpeed) {
      speed = newSpeed;
    },
    isEngineOn() {
      return engineOn;
    }
  };
})();
