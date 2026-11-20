"use strict";

const symbols = ["🚀", "🌎", "🌙", "⭐", "🪐", "👽"];


const payouts = {
    "🚀": 10,
    "🌎": 8,
    "🌙": 6,
    "⭐": 5,
    "🪐": 4,
    "👽": 3
};

const MIN_BET = 10;
const BET_STEP = 10;
const START_BALANCE = 1000;



let balance = START_BALANCE;
let bet = 50;
let spinCount = 0;
let isSpinning = false;
let soundOn = true;


let reelResults = ["🚀", "🌎", "⭐"];



const balanceText = document.getElementById("balance");
const betText = document.getElementById("betDisplay");
const spinText = document.getElementById("spinCount");
const messageBox = document.getElementById("message");

const reel1 = document.getElementById("reel1");
const reel2 = document.getElementById("reel2");
const reel3 = document.getElementById("reel3");
const reels = [reel1, reel2, reel3];

const betInput = document.getElementById("bet");
const decreaseBetButton = document.getElementById("decreaseBet");
const increaseBetButton = document.getElementById("increaseBet");
const spinButton = document.getElementById("spinButton");
const soundButton = document.getElementById("soundButton");
const resetButton = document.getElementById("resetButton");


let spinIntervals = [null, null, null];



function updateScreen() {
    balanceText.textContent = balance;
    betText.textContent = bet;
    spinText.textContent = spinCount;
    betInput.value = bet;
}



function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex];
}

function setControlsDisabled(disabled) {
    spinButton.disabled = disabled;
    decreaseBetButton.disabled = disabled;
    increaseBetButton.disabled = disabled;
    betInput.disabled = disabled;
    resetButton.disabled = disabled;
}


function playBeep(frequency, duration) {
    if (!soundOn) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const volume = context.createGain();

    oscillator.frequency.value = frequency;
    oscillator.connect(volume);
    volume.connect(context.destination);
    volume.gain.value = 0.15;

    oscillator.start();
    oscillator.stop(context.currentTime + duration);
}



function increaseBet() {
    if (bet + BET_STEP <= balance) {
        bet += BET_STEP;
    }
    updateScreen();
}

function decreaseBet() {
    if (bet - BET_STEP >= MIN_BET) {
        bet -= BET_STEP;
    }
    updateScreen();
}

function handleBetTyped() {
    let typedValue = parseInt(betInput.value, 10);

    if (isNaN(typedValue)) {
        typedValue = MIN_BET;
    }
    if (typedValue < MIN_BET) {
        typedValue = MIN_BET;
    }
    if (typedValue > balance) {
        typedValue = balance;
    }

    bet = typedValue;
    updateScreen();
}



function startReelSpin(reel, reelIndex) {
    reel.classList.add("spinning");

    spinIntervals[reelIndex] = setInterval(() => {
        reel.querySelector("span").textContent = getRandomSymbol();
    }, 80);
}


function stopReelSpin(reel, reelIndex) {
    clearInterval(spinIntervals[reelIndex]);
    reel.classList.remove("spinning");

    const finalSymbol = getRandomSymbol();
    reelResults[reelIndex] = finalSymbol;
    reel.querySelector("span").textContent = finalSymbol;

   
    reel.classList.add("landed");
    setTimeout(() => reel.classList.remove("landed"), 300);

    playBeep(440, 0.08);
}



function handleSpin() {
    if (isSpinning) return;

    if (bet > balance) {
        messageBox.textContent = "Not enough credits for that bet!";
        return;
    }

    isSpinning = true;
    setControlsDisabled(true);

    balance -= bet;
    spinCount += 1;
    updateScreen();

    messageBox.textContent = "Spinning... 🌌";
    messageBox.classList.remove("win-effect", "lose-effect");

    
    startReelSpin(reel1, 0);
    startReelSpin(reel2, 1);
    startReelSpin(reel3, 2);

   
    setTimeout(() => stopReelSpin(reel1, 0), 600);
    setTimeout(() => stopReelSpin(reel2, 1), 900);
    setTimeout(() => stopReelSpin(reel3, 2), 1300);


    setTimeout(checkResult, 1400);
}



function checkResult() {
    const a = reelResults[0];
    const b = reelResults[1];
    const c = reelResults[2];

    let winnings = 0;
    let matchedSymbol = null;

    if (a === b && b === c) {
       
        matchedSymbol = a;
        winnings = bet * payouts[a];
    } else if (a === b) {
  
        matchedSymbol = a;
        winnings = Math.floor((bet * payouts[a]) / 2);
    } else if (b === c) {
        
        matchedSymbol = b;
        winnings = Math.floor((bet * payouts[b]) / 2);
    } else if (a === c) {
      
        matchedSymbol = a;
        winnings = Math.floor((bet * payouts[a]) / 2);
    }

    if (winnings > 0) {
        balance += winnings;
        messageBox.textContent = "🎉 You won " + winnings + " credits!";
        messageBox.classList.add("win-effect");
        playBeep(880, 0.25);
    } else {
        messageBox.textContent = "No match this time. Spin again!";
        messageBox.classList.add("lose-effect");
        playBeep(180, 0.3);
    }

    updateScreen();
    isSpinning = false;

    if (balance < MIN_BET) {
        gameOver();
    } else {
        setControlsDisabled(false);
    }
}



function gameOver() {
    setControlsDisabled(true);
    resetButton.disabled = false; 
    messageBox.textContent = "💀 GAME OVER — press RESET to play again.";
    messageBox.classList.add("lose-effect");
}



function handleReset() {
    if (spinCount > 0 && !window.confirm("Reset the game back to 1000 credits?")) {
        return;
    }

    balance = START_BALANCE;
    bet = 50;
    spinCount = 0;
    isSpinning = false;

    reelResults = ["🚀", "🌎", "⭐"];
    reel1.querySelector("span").textContent = "🚀";
    reel2.querySelector("span").textContent = "🌎";
    reel3.querySelector("span").textContent = "⭐";

    messageBox.textContent = "Press SPIN to begin your journey!";
    messageBox.classList.remove("win-effect", "lose-effect");

    setControlsDisabled(false);
    updateScreen();
}



function toggleSound() {
    soundOn = !soundOn;
    soundButton.textContent = soundOn ? "🔊 SOUND ON" : "🔇 SOUND OFF";
}



spinButton.addEventListener("click", handleSpin);
resetButton.addEventListener("click", handleReset);
soundButton.addEventListener("click", toggleSound);
increaseBetButton.addEventListener("click", increaseBet);
decreaseBetButton.addEventListener("click", decreaseBet);
betInput.addEventListener("change", handleBetTyped);

updateScreen();