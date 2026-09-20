const requiredConnections = [
  ["battery+", "switch-in"],
  ["switch-out", "resistor-in"],
  ["resistor-out", "led-anode"],
  ["led-cathode", "battery-"],
  ["switch-in", "switch-out"],
];

const physicalConnections = requiredConnections.slice(0, 4);
const hints = [
  "Electricity starts at the battery’s positive terminal. Connect it to the switch input.",
  "The switch output should lead to the resistor. The resistor protects the LED.",
  "Connect the resistor output to the LED’s positive leg (anode).",
  "Complete the return path from the LED’s negative leg (cathode) to battery negative.",
  "All wires are ready. Close the switch to complete the circuit!",
];

const board = document.querySelector("#board");
const wires = document.querySelector("#wires");
const terminals = [...document.querySelectorAll(".terminal")];
const switchButton = document.querySelector("#toggle-switch");
const led = document.querySelector("#led-bulb");
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");
const coachMessage = document.querySelector("#coach-message");
const dialog = document.querySelector("#success-dialog");
const menuScreen = document.querySelector("#menu-screen");
const gameScreen = document.querySelector("#game-screen");
const startGameButton = document.querySelector("#start-game");
const howToPlayButton = document.querySelector("#how-to-play");
const menuInstructions = document.querySelector("#menu-instructions");
let selected = null;
let connections = [];
let switchClosed = false;
let completed = false;

const normalized = (a, b) => [a, b].sort().join("::");
const hasConnection = ([a, b]) => connections.some(([x, y]) => normalized(a, b) === normalized(x, y));

function drawWires() {
  wires.innerHTML = "";
  const boardBox = board.getBoundingClientRect();
  connections.forEach(([from, to]) => {
    const a = document.querySelector(`[data-node="${from}"]`).getBoundingClientRect();
    const b = document.querySelector(`[data-node="${to}"]`).getBoundingClientRect();
    const x1 = a.left + a.width / 2 - boardBox.left;
    const y1 = a.top + a.height / 2 - boardBox.top;
    const x2 = b.left + b.width / 2 - boardBox.left;
    const y2 = b.top + b.height / 2 - boardBox.top;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`);
    path.setAttribute("class", "wire");
    wires.append(path);
  });
}

function update() {
  const validCount = physicalConnections.filter(hasConnection).length;
  const total = physicalConnections.length + 1;
  const progress = validCount + (switchClosed ? 1 : 0);
  progressText.textContent = `${progress} of ${total} connections`;
  progressBar.style.width = `${(progress / total) * 100}%`;
  terminals.forEach((terminal) => {
    terminal.classList.toggle("connected", connections.some((pair) => pair.includes(terminal.dataset.node)));
  });
  const powered = validCount === physicalConnections.length && switchClosed;
  led.classList.toggle("on", powered);
  coachMessage.innerHTML = validCount < 4
    ? `<strong>Next step:</strong> ${hints[validCount]}`
    : switchClosed
      ? "<strong>Success!</strong> Current now has a complete path through every component."
      : `<strong>Almost there:</strong> ${hints[4]}`;
  if (powered && !completed) {
    completed = true;
    window.setTimeout(() => dialog.showModal(), 450);
  }
}

terminals.forEach((terminal) => terminal.addEventListener("click", () => {
  if (!selected) {
    selected = terminal;
    terminal.classList.add("selected");
    return;
  }
  selected.classList.remove("selected");
  const from = selected.dataset.node;
  const to = terminal.dataset.node;
  selected = null;
  if (from === to) return;
  const existingIndex = connections.findIndex(([a, b]) => normalized(a, b) === normalized(from, to));
  if (existingIndex >= 0) {
    connections.splice(existingIndex, 1);
    drawWires();
    update();
    return;
  }
  connections.push([from, to]);
  drawWires();
  update();
}));

switchButton.addEventListener("click", () => {
  switchClosed = !switchClosed;
  switchButton.setAttribute("aria-pressed", String(switchClosed));
  update();
});

function reset() {
  connections = [];
  switchClosed = false;
  completed = false;
  selected?.classList.remove("selected");
  selected = null;
  switchButton.setAttribute("aria-pressed", "false");
  drawWires();
  update();
}

document.querySelector("#hint-button").addEventListener("click", () => {
  const validCount = physicalConnections.filter(hasConnection).length;
  coachMessage.innerHTML = `<strong>Hint:</strong> ${hints[Math.min(validCount, 4)]}`;
});
document.querySelector("#reset-button").addEventListener("click", reset);
document.querySelector("#play-again").addEventListener("click", () => { dialog.close(); reset(); });
window.addEventListener("resize", drawWires);

function openGame() {
  menuScreen.classList.add("is-leaving");
  window.setTimeout(() => {
    menuScreen.hidden = true;
    menuScreen.classList.remove("is-leaving");
    gameScreen.setAttribute("aria-hidden", "false");
    document.body.classList.remove("menu-open");
    drawWires();
    document.querySelector('[data-node="battery+"]').focus();
  }, 430);
}

function openMenu() {
  menuScreen.hidden = false;
  gameScreen.setAttribute("aria-hidden", "true");
  document.body.classList.add("menu-open");
  startGameButton.focus();
}

startGameButton.addEventListener("click", openGame);
document.querySelector("#back-to-menu").addEventListener("click", openMenu);
howToPlayButton.addEventListener("click", () => {
  const willOpen = menuInstructions.hidden;
  menuInstructions.hidden = !willOpen;
  howToPlayButton.setAttribute("aria-expanded", String(willOpen));
});
update();
