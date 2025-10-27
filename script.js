(function() {
  const minInput = document.getElementById('min');
  const maxInput = document.getElementById('max');
  const setRangeBtn = document.getElementById('setRange');
  const guessInput = document.getElementById('guess');
  const guessBtn = document.getElementById('guessBtn');
  const resetBtn = document.getElementById('resetBtn');
  const message = document.getElementById('message');
  const attemptsEl = document.getElementById('attempts');
  const guessesEl = document.getElementById('guesses');
  const bestEl = document.getElementById('best');
  const rangeLabel = document.getElementById('rangeLabel');
  const meta = document.getElementById('meta');

  let min = 1, max = 100;
  let secret = null;
  let attemptsLeft = 10;
  let guesses = 0;
  const localKey = 'guessNumberBestScore_v1';

  function randomInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function loadBest() {
    const v = localStorage.getItem(localKey);
    bestEl.textContent = v !== null ? v : '—';
  }

  function startNew() {
    min = Math.max(0, parseInt(minInput.value) || 1);
    max = Math.max(min + 1, parseInt(maxInput.value) || (min + 99));
    secret = randomInt(min, max);
    attemptsLeft = Math.max(3, Math.ceil(Math.log2(max - min + 1)) + 2);
    guesses = 0;
    attemptsEl.textContent = attemptsLeft;
    guessesEl.textContent = guesses;
    rangeLabel.textContent = `${min}–${max}`;
    message.textContent = `I've picked a number between ${min} and ${max}. Good luck!`;
    message.classList.remove('success');
    meta.textContent = '';
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
  }

  function finish(won) {
    guessInput.disabled = true;
    guessBtn.disabled = true;
    if (won) {
      message.classList.add('success');
      meta.textContent = `You found it in ${guesses} guess${guesses > 1 ? 'es' : ''}.`;
      const currentBest = parseInt(localStorage.getItem(localKey));
      if (!currentBest || guesses < currentBest) {
        localStorage.setItem(localKey, String(guesses));
        loadBest();
        meta.textContent += ' New best!';
      }
    } else {
      meta.textContent = `The secret number was ${secret}. Try again!`;
    }
  }

  function handleGuess() {
    const val = parseInt(guessInput.value, 10);
    if (Number.isNaN(val)) {
      message.textContent = 'Please enter a valid number.';
      return;
    }
    if (val < min || val > max) {
      message.textContent = `Out of range — enter a number between ${min} and ${max}.`;
      return;
    }

    guesses++;
    guessesEl.textContent = guesses;
    attemptsLeft--;
    attemptsEl.textContent = attemptsLeft;

    if (val === secret) {
      message.textContent = `🎉 Correct! ${val} is the secret number.`;
      finish(true);
      return;
    }

    const diff = Math.abs(val - secret);
    const closeness =
      diff <= Math.max(1, Math.floor((max - min + 1) * 0.06))
        ? '🔥 Very close!'
        : diff <= Math.max(2, Math.floor((max - min + 1) * 0.12))
        ? '🙂 Close'
        : '❄️ Far';

    message.textContent = `${val} is ${val < secret ? 'too low' : 'too high'}. ${closeness}`;

    if (attemptsLeft <= 0) {
      finish(false);
    }
  }

  guessBtn.addEventListener('click', handleGuess);
  resetBtn.addEventListener('click', startNew);
  setRangeBtn.addEventListener('click', startNew);

  guessInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGuess();
  });

  loadBest();
  startNew();
})();
