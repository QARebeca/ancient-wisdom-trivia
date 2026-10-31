(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const screens = ["homeScreen", "setupScreen", "quizScreen", "resultsScreen", "leaderboardScreen"];
  const state = { category: "All", difficulty: "Mixed", count: 10, player: "Seeker", questions: [], index: 0, score: 0, correct: 0, streak: 0, bestStreak: 0, roundNumber: 1, answered: false, lastScreen: "homeScreen" };
  const STORAGE_KEY = "ancientWisdomTriviaScoresV1";

  function showScreen(id) {
    screens.forEach(screen => $(screen).classList.toggle("active", screen === id));
    state.lastScreen = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function getScores() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (_) { return []; }
  }
  function saveScore(entry) {
    const scores = getScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy || b.date - a.date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 50)));
  }
  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function chooseCategory(category) {
    state.category = category;
    document.querySelectorAll(".category-card").forEach(btn => btn.classList.toggle("selected", btn.dataset.category === category));
  }
  function startRound() {
    const pool = window.QUESTION_BANK.filter(q =>
      (state.category === "All" || q.category === state.category) &&
      (state.difficulty === "Mixed" || q.difficulty === state.difficulty)
    );
    if (!pool.length) {
      alert("There are no questions for that combination yet. Please choose another level or realm.");
      return;
    }
    state.questions = shuffle(pool).slice(0, Math.min(state.count, pool.length));
    state.index = 0; state.score = 0; state.correct = 0; state.streak = 0; state.bestStreak = 0; state.answered = false;
    state.player = ($("playerName").value.trim() || "Seeker").slice(0, 18);
    state.roundNumber = getScores().length + 1;
    $("liveScore").textContent = "0";
    showScreen("quizScreen");
    renderQuestion();
  }
  function renderQuestion() {
    const q = state.questions[state.index];
    state.answered = false;
    $("questionCategory").textContent = q.category.toUpperCase();
    $("questionDifficulty").textContent = q.difficulty.toUpperCase();
    $("questionNumber").textContent = `QUESTION ${String(state.index + 1).padStart(2, "0")} / ${String(state.questions.length).padStart(2, "0")}`;
    $("roundLabel").textContent = `ROUND ${String(state.roundNumber).padStart(2, "0")}`;
    $("questionText").textContent = q.question;
    $("progressFill").style.width = `${(state.index / state.questions.length) * 100}%`;
    $("feedback").hidden = true;
    const list = $("answerList");
    list.innerHTML = "";
    q.answers.forEach((answer, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";
      button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + i)}</span><span></span>`;
      button.querySelector("span:last-child").textContent = answer;
      button.addEventListener("click", () => selectAnswer(i));
      list.appendChild(button);
    });
  }
  function selectAnswer(choice) {
    if (state.answered) return;
    state.answered = true;
    const q = state.questions[state.index];
    const buttons = [...$("answerList").querySelectorAll("button")];
    buttons.forEach((button, i) => {
      button.disabled = true;
      if (i === q.correct) button.classList.add("correct");
      else if (i === choice) button.classList.add("incorrect");
    });
    const isCorrect = choice === q.correct;
    if (isCorrect) {
      const points = q.difficulty === "Hard" ? 150 : q.difficulty === "Medium" ? 120 : 100;
      state.score += points;
      state.correct++;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      $("feedbackTitle").textContent = `✧ Correct! +${points} points`;
    } else {
      state.streak = 0;
      $("feedbackTitle").textContent = "A new piece of wisdom";
    }
    $("liveScore").textContent = state.score;
    $("feedbackExplanation").textContent = q.explanation;
    $("feedback").hidden = false;
    $("nextQuestionButton").innerHTML = state.index === state.questions.length - 1 ? 'Reveal my results <span>→</span>' : 'Continue <span>→</span>';
    $("progressFill").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  }
  function nextQuestion() {
    if (state.index < state.questions.length - 1) {
      state.index++;
      renderQuestion();
    } else finishRound();
  }
  function finishRound() {
    const total = state.questions.length;
    const accuracy = Math.round((state.correct / total) * 100);
    $("finalScore").textContent = state.score;
    $("correctCount").textContent = `${state.correct}/${total}`;
    $("accuracy").textContent = `${accuracy}%`;
    $("bestStreak").textContent = state.bestStreak;
    let heading = "Well explored.";
    let message = "Every question is a doorway. Keep following your curiosity.";
    if (accuracy === 100) { heading = "A radiant achievement."; message = "A perfect round. May your curiosity continue to illuminate the path."; }
    else if (accuracy >= 70) { heading = "Wisdom is unfolding."; message = "A strong journey. You are building knowledge one discovery at a time."; }
    else if (accuracy >= 40) { heading = "The path is opening."; message = "Each new fact is a seed. Explore again and watch your understanding grow."; }
    $("resultHeading").textContent = heading;
    $("resultMessage").textContent = message;
    $("resultSubheading").textContent = `${state.player}, you completed ${state.category === "All" ? "a journey through all realms" : `the realm of ${state.category}`}.`;
    saveScore({ name: state.player, score: state.score, accuracy, correct: state.correct, total, category: state.category, difficulty: state.difficulty, date: Date.now() });
    showScreen("resultsScreen");
  }
  function renderLeaderboard() {
    const scores = getScores();
    const rows = $("leaderboardRows");
    rows.innerHTML = "";
    $("emptyLeaderboard").hidden = scores.length > 0;
    scores.slice(0, 10).forEach((entry, i) => {
      const row = document.createElement("div");
      row.className = "leader-row";
      const name = document.createElement("span");
      name.innerHTML = `<span class="rank">${String(i + 1).padStart(2, "0")}</span><span class="player"></span>`;
      name.querySelector(".player").textContent = entry.name;
      const score = document.createElement("span"); score.className = "score"; score.textContent = `${entry.score} pts`;
      const accuracy = document.createElement("span"); accuracy.className = "accuracy"; accuracy.textContent = `${entry.accuracy}%`;
      row.append(name, score, accuracy);
      rows.appendChild(row);
    });
  }

  $("beginButton").addEventListener("click", () => showScreen("setupScreen"));
  $("homeBrand").addEventListener("click", e => { e.preventDefault(); showScreen("homeScreen"); });
  $("leaderboardTop").addEventListener("click", () => { renderLeaderboard(); showScreen("leaderboardScreen"); });
  $("viewScoresButton").addEventListener("click", () => { renderLeaderboard(); showScreen("leaderboardScreen"); });
  $("backHome").addEventListener("click", () => showScreen("homeScreen"));
  $("categoryGrid").addEventListener("click", e => {
    const button = e.target.closest("[data-category]");
    if (button) chooseCategory(button.dataset.category);
  });
  $("difficultyChoices").addEventListener("click", e => {
    const button = e.target.closest("[data-difficulty]");
    if (!button) return;
    state.difficulty = button.dataset.difficulty;
    $("difficultyChoices").querySelectorAll("button").forEach(b => b.classList.toggle("selected", b === button));
  });
  $("countChoices").addEventListener("click", e => {
    const button = e.target.closest("[data-count]");
    if (!button) return;
    state.count = Number(button.dataset.count);
    $("countChoices").querySelectorAll("button").forEach(b => b.classList.toggle("selected", b === button));
  });
  $("startRoundButton").addEventListener("click", startRound);
  $("quitRound").addEventListener("click", () => {
    if (confirm("Leave this round? Your progress in this round will not be saved.")) showScreen("setupScreen");
  });
  $("nextQuestionButton").addEventListener("click", nextQuestion);
  $("playAgainButton").addEventListener("click", () => showScreen("setupScreen"));
  $("resultsLeaderboard").addEventListener("click", () => { renderLeaderboard(); showScreen("leaderboardScreen"); });
  $("leaderboardPlay").addEventListener("click", () => showScreen("setupScreen"));
  $("leaderboardBack").addEventListener("click", () => showScreen(state.lastScreen === "leaderboardScreen" ? "homeScreen" : state.lastScreen));
  $("clearScores").addEventListener("click", () => {
    if (confirm("Clear all saved scores from this browser? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY); renderLeaderboard();
    }
  });
})();