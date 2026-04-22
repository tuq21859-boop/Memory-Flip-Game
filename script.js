const gameBoard = document.getElementById("gameBoard");
const newGameBtn = document.getElementById("newGameBtn");
const showHintBtn = document.getElementById("showHintBtn");
const timerToggle = document.getElementById("timerToggle");
const difficultySelect = document.getElementById("difficultySelect");
const movesDisplay = document.getElementById("moves");
const matchesDisplay = document.getElementById("matches");
const bestScoreDisplay = document.getElementById("bestScore");
const timerDisplay = document.getElementById("timer");
const difficultyLabel = document.getElementById("difficultyLabel");
const pairsGoal = document.getElementById("pairsGoal");
const hintsLeft = document.getElementById("hintsLeft");
const message = document.getElementById("message");

const ALL_SYMBOLS = ["🍉", "⭐", "🎈", "🎵", "🚀", "🌈", "🧩", "⚽", "🎯", "🍀", "🎲", "🪐"];

const DIFFICULTY_SETTINGS = {
  easy: { label: "Easy", pairs: 8, columns: 4, mobileColumns: 4 },
  medium: { label: "Medium", pairs: 10, columns: 5, mobileColumns: 4 },
  hard: { label: "Hard", pairs: 12, columns: 6, mobileColumns: 4 }
};

const gameState = {
  deck: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  bestScore: null,
  lockBoard: false,
  timerSeconds: 0,
  timerId: null,
  gameStarted: false,
  hintsRemaining: 1,
  difficulty: "easy"
};

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

function getCurrentSettings() {
  return DIFFICULTY_SETTINGS[gameState.difficulty];
}

function updateMessage(text) {
  message.textContent = text;
}

function updateStatus() {
  const settings = getCurrentSettings();
  movesDisplay.textContent = gameState.moves;
  matchesDisplay.textContent = `${gameState.matchedPairs} / ${settings.pairs}`;
  bestScoreDisplay.textContent = gameState.bestScore === null ? "-" : `${gameState.bestScore} moves`;
  timerDisplay.textContent = formatTime(gameState.timerSeconds);
  difficultyLabel.textContent = settings.label;
  pairsGoal.textContent = `Goal: ${settings.pairs} pairs`;
  hintsLeft.textContent = `Hints: ${gameState.hintsRemaining} left`;
}

function updateBoardLayout() {
  const settings = getCurrentSettings();
  gameBoard.style.setProperty("--columns", settings.columns);
  gameBoard.style.setProperty("--columns-mobile", settings.mobileColumns);
}

function stopTimer() {
  if (gameState.timerId) {
    clearInterval(gameState.timerId);
    gameState.timerId = null;
  }
}

function startTimer() {
  if (!timerToggle.checked || gameState.timerId) {
    return;
  }

  gameState.timerId = setInterval(() => {
    gameState.timerSeconds += 1;
    updateStatus();
  }, 1000);
}

function createDeck() {
  const settings = getCurrentSettings();
  const chosenSymbols = ALL_SYMBOLS.slice(0, settings.pairs);
  const pairedSymbols = [...chosenSymbols, ...chosenSymbols];

  gameState.deck = shuffle(
    pairedSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      matched: false
    }))
  );
}

function renderBoard() {
  gameBoard.innerHTML = "";
  updateBoardLayout();

  gameState.deck.forEach((cardData, index) => {
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
  gameState.flippedCards = [];
  gameState.matchedPairs = 0;
  gameState.moves = 0;
  gameState.lockBoard = false;
  gameState.timerSeconds = 0;
  gameState.gameStarted = false;
  gameState.hintsRemaining = 1;
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
  gameState.deck[firstIndex].matched = true;
  gameState.deck[secondIndex].matched = true;
  markCardState(firstIndex, "matched", true);
  markCardState(secondIndex, "matched", true);
}

function finishGame() {
  stopTimer();

  if (gameState.bestScore === null || gameState.moves < gameState.bestScore) {
    gameState.bestScore = gameState.moves;
  }

  updateStatus();

  const timerNote = timerToggle.checked
    ? ` in ${formatTime(gameState.timerSeconds)}`
    : "";

  updateMessage(`You matched all pairs in ${gameState.moves} moves${timerNote}.`);
}

function handleMatch() {
  const [firstCard, secondCard] = gameState.flippedCards;
  disableMatchedCards(firstCard.index, secondCard.index);
  gameState.matchedPairs += 1;
  gameState.flippedCards = [];
  gameState.lockBoard = false;
  updateStatus();

  if (gameState.matchedPairs === getCurrentSettings().pairs) {
    finishGame();
    return;
  }

  updateMessage("Match found. Keep going.");
}

function handleMismatch() {
  const [firstCard, secondCard] = gameState.flippedCards;

  setTimeout(() => {
    markCardState(firstCard.index, "flipped", false);
    markCardState(secondCard.index, "flipped", false);
    gameState.flippedCards = [];
    gameState.lockBoard = false;
    updateMessage("No match. Try to remember those positions.");
  }, 800);
}

function revealAllCardsBriefly() {
  if (!gameState.deck.length || gameState.lockBoard || gameState.hintsRemaining < 1) {
    return;
  }

  gameState.hintsRemaining -= 1;
  gameState.lockBoard = true;
  updateStatus();
  updateMessage("Hint active: all cards are visible for a moment.");

  gameState.deck.forEach((_, index) => {
    if (!gameState.deck[index].matched) {
      markCardState(index, "flipped", true);
    }
  });

  setTimeout(() => {
    gameState.deck.forEach((_, index) => {
      const isStillSelected = gameState.flippedCards.some((card) => card.index === index);
      if (!gameState.deck[index].matched && !isStillSelected) {
        markCardState(index, "flipped", false);
      }
    });

    gameState.lockBoard = false;
    updateMessage("Hint used. Continue matching pairs.");
  }, 1000);
}

function handleCardClick(event) {
  const cardElement = event.target.closest(".memory-card");
  if (!cardElement || gameState.lockBoard) {
    return;
  }

  const index = Number(cardElement.dataset.index);
  const selectedCard = gameState.deck[index];
  const alreadyFlipped = gameState.flippedCards.some((card) => card.index === index);

  if (selectedCard.matched || alreadyFlipped) {
    return;
  }

  if (!gameState.gameStarted) {
    gameState.gameStarted = true;
    startTimer();
  }

  markCardState(index, "flipped", true);
  gameState.flippedCards.push({ index, symbol: selectedCard.symbol });

  if (gameState.flippedCards.length < 2) {
    updateMessage("Pick one more card.");
    return;
  }

  gameState.moves += 1;
  gameState.lockBoard = true;
  updateStatus();

  if (gameState.flippedCards[0].symbol === gameState.flippedCards[1].symbol) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function startNewGame() {
  gameState.difficulty = difficultySelect.value;
  createDeck();
  resetGameState();
  renderBoard();
  updateMessage(`New ${getCurrentSettings().label.toLowerCase()} game started. Flip two cards to begin.`);
}

newGameBtn.addEventListener("click", startNewGame);
showHintBtn.addEventListener("click", revealAllCardsBriefly);
difficultySelect.addEventListener("change", () => {
  gameState.difficulty = difficultySelect.value;
  updateStatus();
  updateBoardLayout();
  updateMessage(`Difficulty set to ${getCurrentSettings().label}. Press New Game to reshuffle.`);
});
timerToggle.addEventListener("change", () => {
  if (!timerToggle.checked) {
    stopTimer();
    gameState.timerSeconds = 0;
    updateStatus();
  } else if (gameState.gameStarted) {
    startTimer();
  }
});
gameBoard.addEventListener("click", handleCardClick);

startNewGame();
