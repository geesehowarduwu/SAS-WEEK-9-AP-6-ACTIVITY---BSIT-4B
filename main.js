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

const eventBus = new EventEmitter();
const myCar = createVehicle('car', 'Lightning McQueen');

// Stats
const statSpeed = document.getElementById('statSpeed');
const statFuel = document.getElementById('statFuel');
const statTemp = document.getElementById('statTemp');
const statOdo = document.getElementById('statOdo');

let fuel = 100;
let odometer = 0;
let notifications = [];

// === EVENT LISTENERS ===
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

// === FUNCTIONS ===
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

// === BUTTON FUNCTIONS ===
registerEvent('btnStart', () => {
  const msg = VehicleModule.start();
  eventBus.emit('update', msg);
  eventBus.emit('engineStatus', true);

  actionGif.src = 'images/start.gif';
  gifContainer.classList.remove('hidden');
  gifContainer.classList.add('visible');
});

registerEvent('btnAccelerate', () => {
  if (!VehicleModule.isEngineOn()) {
    eventBus.emit('update', '⚠️ Start the engine first!');
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

  if (fuel <= 5) addNotification(`Low fuel! ${fuel}% remaining.`);
  if (fuel <= 0) {
    fuel = 0;
    VehicleModule.stop();
    eventBus.emit('update', 'Out of fuel! Engine stopped.');
  }
});

registerEvent('btnBrake', () => {
  let newSpeed = decreaseSpeed(VehicleModule.getSpeed(), 20);
  VehicleModule.setSpeed(newSpeed);
  eventBus.emit('update', `🛑 Braking... Speed: ${newSpeed} km/h`);
  eventBus.emit('statsUpdate');

  actionGif.src = 'images/brake.gif';
  gifContainer.classList.add('visible');
});

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
registerEvent('btnRefuel', () => {
  if (VehicleModule.isEngineOn()) {
    eventBus.emit('update', '⛽ Please stop the engine before refueling!');
    addNotification('Attempted to refuel while engine running!');
    return;
  }

  const previousFuel = fuel;
  fuel = Math.min(100, fuel + 30);  // Add 30% fuel, max 100
  eventBus.emit('statsUpdate');

  const added = fuel - previousFuel;
  if (added > 0) {
    const msg = `⛽ Refueled ${added}% — Tank at ${fuel}%`;
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
