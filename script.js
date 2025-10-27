
    (function () {
      const minInput = document.getElementById('min');
      const maxInput = document.getElementById('max');
      const setRangeBtn = document.getElementById('setRange');
      const guessInput = document.getElementById('guess');
      const guessBtn = document.getElementById('guessBtn');
      const resetBtn = document.getElementById('resetBtn');
      const message = document.getElementById('message');
      const messageText = message.querySelector('span');
      const messageIcon = message.querySelector('.message-icon');
      const attemptsEl = document.getElementById('attempts');
      const guessesEl = document.getElementById('guesses');
      const bestEl = document.getElementById('best');
      const rangeLabel = document.getElementById('rangeLabel');
      const difficultyLabel = document.getElementById('difficultyLabel');
      const meta = document.getElementById('meta');
      const darkThemeBtn = document.getElementById('darkTheme');
      const lightThemeBtn = document.getElementById('lightTheme');
      const glowThemeBtn = document.getElementById('glowTheme');
      const noGlowThemeBtn = document.getElementById('noGlowTheme');

      let min = 1, max = 100;
      let secret = null;
      let attemptsLeft = 10;
      let guesses = 0;
      const localKey = 'guessNumberBestScore_v2';

      // Theme management
      function setTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme);

        darkThemeBtn.classList.toggle('active', theme === 'dark-theme');
        lightThemeBtn.classList.toggle('active', theme === 'light-theme');

        localStorage.setItem('guessit-theme', theme);
      }

      function setGlow(glow) {
        document.body.classList.remove('glow', 'no-glow');
        document.body.classList.add(glow);

        glowThemeBtn.classList.toggle('active', glow === 'glow');
        noGlowThemeBtn.classList.toggle('active', glow === 'no-glow');

        localStorage.setItem('guessit-glow', glow);
      }

      // Load saved preferences
      const savedTheme = localStorage.getItem('guessit-theme') || 'dark-theme';
      const savedGlow = localStorage.getItem('guessit-glow') || 'glow';
      setTheme(savedTheme);
      setGlow(savedGlow);

      // Theme event listeners
      darkThemeBtn.addEventListener('click', () => setTheme('dark-theme'));
      lightThemeBtn.addEventListener('click', () => setTheme('light-theme'));
      glowThemeBtn.addEventListener('click', () => setGlow('glow'));
      noGlowThemeBtn.addEventListener('click', () => setGlow('no-glow'));

      function randomInt(a, b) {
        return Math.floor(Math.random() * (b - a + 1)) + a;
      }

      function loadBest() {
        const v = localStorage.getItem(localKey);
        bestEl.textContent = v !== null ? v : '—';
      }

      function updateDifficultyLabel() {
        const range = max - min + 1;
        if (range <= 50) {
          difficultyLabel.textContent = 'Easy';
        } else if (range <= 500) {
          difficultyLabel.textContent = 'Medium';
        } else {
          difficultyLabel.textContent = 'Hard';
        }
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
        updateDifficultyLabel();
        messageText.textContent = `I've picked a number between ${min} and ${max}. Good luck!`;
        message.classList.remove('success');
        messageIcon.className = 'fas fa-info-circle message-icon';
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
          messageIcon.className = 'fas fa-trophy message-icon';
          meta.textContent = `You found it in ${guesses} guess${guesses > 1 ? 'es' : ''}.`;
          const currentBest = parseInt(localStorage.getItem(localKey));
          if (!currentBest || guesses < currentBest) {
            localStorage.setItem(localKey, String(guesses));
            loadBest();
            meta.textContent += ' New best!';
          }
        } else {
          messageIcon.className = 'fas fa-times-circle message-icon';
          meta.textContent = `The secret number was ${secret}. Try again!`;
        }
      }

      function handleGuess() {
        const val = parseInt(guessInput.value, 10);
        if (Number.isNaN(val)) {
          messageText.textContent = 'Please enter a valid number.';
          messageIcon.className = 'fas fa-exclamation-circle message-icon';
          return;
        }
        if (val < min || val > max) {
          messageText.textContent = `Out of range — enter a number between ${min} and ${max}.`;
          messageIcon.className = 'fas fa-exclamation-triangle message-icon';
          return;
        }

        guesses++;
        guessesEl.textContent = guesses;
        attemptsLeft--;
        attemptsEl.textContent = attemptsLeft;

        if (val === secret) {
          messageText.textContent = `🎉 Correct! ${val} is the secret number.`;
          messageIcon.className = 'fas fa-check-circle message-icon';
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

        messageText.textContent = `${val} is ${val < secret ? 'too low' : 'too high'}. ${closeness}`;
        messageIcon.className = val < secret ? 'fas fa-arrow-down message-icon' : 'fas fa-arrow-up message-icon';

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
  