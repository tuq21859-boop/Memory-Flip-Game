const gameBoard = document.getElementById("gameBoard");
const newGameBtn = document.getElementById("newGameBtn");
const showHintBtn = document.getElementById("showHintBtn");
const timerToggle = document.getElementById("timerToggle");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const bestScoreDisplay = document.getElementById("bestScore");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

const symbols = ["🍉", "⭐", "🎈", "🎵", "🚀", "🌈", "🧩", "⚽"];

let deck = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let bestScore = null;
let lockBoard = false;
let timerSeconds = 0;
let timerId = null;
let gameStarted = false;
let hintUsed = false;

function shuffle(array) {
  const copy = [...array];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateStatus() {
  movesDisplay.textContent = moves;
  matchesDisplay.textContent = `${matchedPairs} / 8`;
  bestScoreDisplay.textContent = bestScore === null ? "-" : `${bestScore} moves`;
  timerDisplay.textContent = formatTime(timerSeconds);
}

function updateMessage(text) {
  message.textContent = text;
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function startTimer() {
  if (!timerToggle.checked || timerId) {
    return;
  }

  timerId = setInterval(() => {
    timerSeconds += 1;
    updateStatus();
  }, 1000);
}

function createDeck() {
  const pairedSymbols = [...symbols, ...symbols];
  deck = shuffle(
    pairedSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      matched: false
    }))
  );
}

function renderBoard() {
  gameBoard.innerHTML = "";

  deck.forEach((cardData, index) => {
    const wrapper = document.createElement("article");
    wrapper.className = "memory-card";
    wrapper.dataset.index = index;

    wrapper.innerHTML = `
      <button type="button" aria-label="Memory card">
        <div class="card-inner">
          <div class="card-face card-back">?</div>
          <div class="card-face card-front">${cardData.symbol}</div>
        </div>
      </button>
    `;

    gameBoard.appendChild(wrapper);
  });
}

function resetGameState() {
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  lockBoard = false;
  timerSeconds = 0;
  gameStarted = false;
  hintUsed = false;
  stopTimer();
  updateStatus();
}

function markCardState(cardIndex, className, shouldAdd) {
  const card = gameBoard.querySelector(`[data-index="${cardIndex}"]`);
  if (!card) {
    return;
  }

  card.classList.toggle(className, shouldAdd);
}

function disableMatchedCards(firstIndex, secondIndex) {
  deck[firstIndex].matched = true;
  deck[secondIndex].matched = true;
  markCardState(firstIndex, "matched", true);
  markCardState(secondIndex, "matched", true);
}

function finishGame() {
  stopTimer();
  if (bestScore === null || moves < bestScore) {
    bestScore = moves;
  }
  updateStatus();

  const timerNote = timerToggle.checked
    ? ` in ${formatTime(timerSeconds)}`
    : "";

  updateMessage(`You matched all pairs in ${moves} moves${timerNote}.`);
}

function handleMatch() {
  const [firstCard, secondCard] = flippedCards;
  disableMatchedCards(firstCard.index, secondCard.index);
  matchedPairs += 1;
  flippedCards = [];
  lockBoard = false;
  updateStatus();

  if (matchedPairs === symbols.length) {
    finishGame();
  } else {
    updateMessage("Match found. Keep going.");
  }
}

function handleMismatch() {
  const [firstCard, secondCard] = flippedCards;

  setTimeout(() => {
    markCardState(firstCard.index, "flipped", false);
    markCardState(secondCard.index, "flipped", false);
    flippedCards = [];
    lockBoard = false;
    updateMessage("No match. Try to remember those positions.");
  }, 800);
}

function revealAllCardsBriefly() {
  if (!deck.length || lockBoard || hintUsed) {
    return;
  }

  hintUsed = true;
  lockBoard = true;
  updateMessage("Hint active: all cards are visible for a moment.");

  deck.forEach((_, index) => {
    if (!deck[index].matched) {
      markCardState(index, "flipped", true);
    }
  });

  setTimeout(() => {
    deck.forEach((_, index) => {
      if (!deck[index].matched && !flippedCards.some((card) => card.index === index)) {
        markCardState(index, "flipped", false);
      }
    });

    lockBoard = false;
    updateMessage("Hint used. Continue matching pairs.");
  }, 1000);
}

function handleCardClick(event) {
  const cardElement = event.target.closest(".memory-card");
  if (!cardElement || lockBoard) {
    return;
  }

  const index = Number(cardElement.dataset.index);
  const selectedCard = deck[index];

  if (selectedCard.matched || flippedCards.some((card) => card.index === index)) {
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  markCardState(index, "flipped", true);
  flippedCards.push({ index, symbol: selectedCard.symbol });

  if (flippedCards.length < 2) {
    updateMessage("Pick one more card.");
    return;
  }

  moves += 1;
  updateStatus();
  lockBoard = true;

  if (flippedCards[0].symbol === flippedCards[1].symbol) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function startNewGame() {
  createDeck();
  resetGameState();
  renderBoard();
  updateMessage("New game started. Flip two cards to begin.");
}

newGameBtn.addEventListener("click", startNewGame);
showHintBtn.addEventListener("click", revealAllCardsBriefly);
timerToggle.addEventListener("change", () => {
  if (!timerToggle.checked) {
    stopTimer();
    timerSeconds = 0;
    updateStatus();
  } else if (gameStarted) {
    startTimer();
  }
});
gameBoard.addEventListener("click", handleCardClick);

startNewGame();
