// === IMPORT MODULES ===
import { registerEvent } from './eventModule.js';
import { increaseSpeed, decreaseSpeed } from './compositionModule.js';
import { VehicleModule } from './patternModule.js';
import { createVehicle } from './factoryModule.js';
import { EventEmitter } from './observerModule.js';

// === ELEMENTS ===
const display = document.getElementById('display');
const carImage = document.getElementById('carImage');
const engineLight = document.getElementById('engineStatus');
const gifContainer = document.getElementById('gifContainer');
const actionGif = document.getElementById('actionGif');
const btnNotify = document.getElementById('btnNotify');

// Notification elements
const notifPanel = document.getElementById('notificationPanel');
const notifList = document.getElementById('notifList');
const notifCount = document.getElementById('notifCount');
const btnClose = document.getElementById('closeNotif');
const btnClear = document.getElementById('clearNotif');

// Stats
const statSpeed = document.getElementById('statSpeed');
const statFuel = document.getElementById('statFuel');
const statTemp = document.getElementById('statTemp');
const statOdo = document.getElementById('statOdo');

// === GLOBAL VARIABLES ===
const eventBus = new EventEmitter();
const myCar = createVehicle('car', 'Lightning McQueen');
let fuel = 100;
let odometer = 0;
let notifications = [];

// === CORE EVENT UPDATERS ===
eventBus.on('update', msg => {
  display.textContent = msg;
  addNotification(msg);
});
eventBus.on('engineStatus', on => {
  engineLight.className = `status-light ${on ? 'status-on' : 'status-off'}`;
  carImage.classList.toggle('running', on);
});
eventBus.on('statsUpdate', () => {
  statSpeed.textContent = `${VehicleModule.getSpeed()} km/h`;
  statFuel.textContent = `${fuel}%`;
  statOdo.textContent = `${odometer} km`;
});

// === NOTIFICATION FUNCTIONS ===
function addNotification(message) {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'notif-item';
  item.innerHTML = `<time>${time}</time>${message}`;
  notifList.prepend(item);
  notifications.push({ time, message });
  notifCount.textContent = `${notifications.length} notifications`;
}

// Notification buttons
btnNotify.addEventListener('click', () => notifPanel.classList.toggle('hidden'));
btnClose.addEventListener('click', () => notifPanel.classList.add('hidden'));
btnClear.addEventListener('click', () => {
  notifList.innerHTML = '';
  notifications = [];
  notifCount.textContent = '0 notifications';
});

// === VEHICLE CONTROLS ===

// START ENGINE
registerEvent('btnStart', () => {
  const msg = VehicleModule.start();
  eventBus.emit('update', msg);
  eventBus.emit('engineStatus', true);

  actionGif.src = 'images/start.gif';
  gifContainer.classList.remove('hidden');
  gifContainer.classList.add('visible');
});

// ACCELERATE
registerEvent('btnAccelerate', () => {
  if (!VehicleModule.isEngineOn()) {
    eventBus.emit('update', '⚠️ Start the engine first!');
    addNotification('Attempted to accelerate while engine off!');
    return;
  }

  let newSpeed = increaseSpeed(VehicleModule.getSpeed(), 20);
  VehicleModule.setSpeed(newSpeed);
  fuel = Math.max(0, fuel - 5);
  odometer += 1;

  eventBus.emit('update', `⚡ ${myCar.name} Speed: ${newSpeed} km/h`);
  eventBus.emit('statsUpdate');

  actionGif.src = 'images/accelerate.gif';
  gifContainer.classList.add('visible');

  // Fuel warning and auto-stop
  if (fuel <= 10 && fuel > 0) addNotification(`⚠️ Low fuel! ${fuel}% remaining.`);
  if (fuel <= 0) {
    fuel = 0;
    VehicleModule.stop();
    eventBus.emit('update', '🛑 Out of fuel! Engine stopped.');
    eventBus.emit('engineStatus', false);
    actionGif.src = 'images/stop.gif';
  }
});

// BRAKE
registerEvent('btnBrake', () => {
  let newSpeed = decreaseSpeed(VehicleModule.getSpeed(), 20);
  VehicleModule.setSpeed(newSpeed);
  eventBus.emit('update', `🛑 Braking... Speed: ${newSpeed} km/h`);
  eventBus.emit('statsUpdate');

  actionGif.src = 'images/brake.gif';
  gifContainer.classList.add('visible');
});

// STOP ENGINE
registerEvent('btnStop', () => {
  const msg = VehicleModule.stop();
  eventBus.emit('update', msg);
  eventBus.emit('engineStatus', false);
  eventBus.emit('statsUpdate');

  actionGif.src = 'images/stop.gif';
  gifContainer.classList.add('visible');

  setTimeout(() => {
    gifContainer.classList.remove('visible');
    gifContainer.classList.add('hidden');
  }, 2500);
});

// REFUEL FEATURE
registerEvent('btnRefuel', () => {
  if (VehicleModule.isEngineOn()) {
    eventBus.emit('update', '⛽ Please stop the engine before refueling!');
    addNotification('Tried to refuel while engine running!');
    return;
  }

  const prevFuel = fuel;
  fuel = Math.min(100, fuel + 30); // add 30%, max 100
  eventBus.emit('statsUpdate');

  if (fuel > prevFuel) {
    const msg = `⛽ Refueled ${fuel - prevFuel}% — Tank at ${fuel}%`;
    eventBus.emit('update', msg);
    addNotification(msg);

    // Optional refuel animation
    actionGif.src = 'images/refuel.gif';
    gifContainer.classList.remove('hidden');
    gifContainer.classList.add('visible');
    setTimeout(() => {
      gifContainer.classList.remove('visible');
      gifContainer.classList.add('hidden');
    }, 2500);
  } else {
    const msg = 'Tank is already full!';
    eventBus.emit('update', msg);
    addNotification(msg);
  }
});

// =====================
// Robust Refuel Handler
// =====================

// helper to safely get element and warn
function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`Element #${id} not found in DOM.`);
  return el;
}

const btnRefuelEl = getEl('btnRefuel');

// refuel settings
const REFUEL_AMOUNT = 30;      // how much to add when hitting refuel (percent)
const REFILL_STEP = 5;         // percent per tick
const REFILL_INTERVAL = 300;   // ms per tick

function playRefuelGif(duration = 2000) {
  // if refuel.gif exists, play it for `duration` ms
  try {
    actionGif.src = 'images/refuel.gif';
    gifContainer.classList.remove('hidden');
    gifContainer.classList.add('visible');
    setTimeout(() => {
      // only hide if it wasn't changed by another action
      gifContainer.classList.remove('visible');
      gifContainer.classList.add('hidden');
      // reset to default (optional)
      // actionGif.src = 'images/start.gif';
    }, duration);
  } catch (err) {
    console.warn('Refuel GIF missing or error showing it:', err);
  }
}

function refuelHandler() {
  console.log('Refuel clicked — engineOn:', VehicleModule.isEngineOn(), 'fuel:', fuel);
  if (VehicleModule.isEngineOn()) {
    const msg = '⛽ Please stop the engine before refueling!';
    eventBus.emit('update', msg);
    addNotification('Tried to refuel while engine running');
    return;
  }

  if (fuel >= 100) {
    const msg = 'Tank is already full!';
    eventBus.emit('update', msg);
    addNotification(msg);
    return;
  }

  const target = Math.min(100, fuel + REFUEL_AMOUNT);
  addNotification(`Refueling started — target ${target}%`);

  // play refuel animation (if available)
  playRefuelGif( (Math.ceil((target - fuel) / REFILL_STEP) * REFILL_INTERVAL) + 500 );

  // gradual refill so user sees the fuel percent change
  const refillIntervalId = setInterval(() => {
    if (fuel >= target) {
      clearInterval(refillIntervalId);
      const doneMsg = `⛽ Refuel complete — Tank at ${fuel}%`;
      eventBus.emit('update', doneMsg);
      addNotification(doneMsg);
      eventBus.emit('statsUpdate');
      return;
    }
    fuel = Math.min(100, fuel + REFILL_STEP);
    eventBus.emit('statsUpdate');
  }, REFILL_INTERVAL);
}

// wire using registerEvent if available, otherwise direct listener
if (typeof registerEvent === 'function') {
  try {
    registerEvent('btnRefuel', refuelHandler);
  } catch (err) {
    // fallback if registerEvent failed
    if (btnRefuelEl) btnRefuelEl.addEventListener('click', refuelHandler);
  }
} else {
  if (btnRefuelEl) btnRefuelEl.addEventListener('click', refuelHandler);
}


