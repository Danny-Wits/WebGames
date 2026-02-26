/* ════════════════════════════════════════
   FIREBASE INIT
════════════════════════════════════════ */
const firebaseConfig = {
  authDomain: "leaderboard-a2fab.firebaseapp.com",
  projectId: "leaderboard-a2fab",
  storageBucket: "leaderboard-a2fab.appspot.com",
  databaseURL:
    "https://leaderboard-a2fab-default-rtdb.asia-southeast1.firebasedatabase.app",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const lbRef = database.ref("leaderboard");

let players = [];
lbRef.on("value", (snapshot) => {
  const data = snapshot.val();
  players = data ? Object.values(data) : [];
  renderBoard();
});

/* ════════════════════════════════════════
   ACHIEVEMENTS
════════════════════════════════════════ */
const ACHIEVEMENTS = [
  {
    id: "first_blood",
    ico: "droplet",
    name: "First Blood",
    desc: "Answer your first question",
    test: (s) => s.total >= 1,
  },
  {
    id: "on_fire",
    ico: "flame",
    name: "On Fire",
    desc: "5-answer streak",
    test: (s) => s.maxStreak >= 5,
  },
  {
    id: "speed_demon",
    ico: "zap",
    name: "Speed Demon",
    desc: "Answer in under 5 seconds",
    test: (s) => s.bestTime <= 5,
  },
  {
    id: "century",
    ico: "hash",
    name: "Century",
    desc: "Score 100+ points",
    test: (s) => s.score >= 100,
  },
];

/* ════════════════════════════════════════
   STATE & ICONS
════════════════════════════════════════ */
let G = {
  name: "",
  mode: "riddle",
  diff: "easy",
  qs: [],
  idx: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  correct: 0,
  total: 0,
  hintsUsed: 0,
  hintThisQ: false,
  x2Active: false,
  frozen: false,
  skips: 2,
  startedQ: 0,
  times: [],
  bestTime: Infinity,
  catStats: {},
  catCorrect: {},
  unlocked: [],
  powerups: { fifty: true, freeze: true, reveal: true, x2: true },
  answered: false,
  myId: "",
};
let timerInterval = null,
  timerLeft = 40;

// Initialize Lucide icons on first load
lucide.createIcons();

function refreshIcons() {
  lucide.createIcons();
}

function saveMe() {
  lbRef.child(G.myId).set({
    id: G.myId,
    name: G.name,
    score: G.score,
  });
}

/* ════════════════════════════════════════
   UI & LOGIC
════════════════════════════════════════ */
function toast(msg) {
  const zone = document.getElementById("toastZone");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  zone.appendChild(t);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => t.classList.add("show")),
  );
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function renderBoard() {
  const el = document.getElementById("leaderboardList");
  const sorted = [...players].sort((a, b) => b.score - a.score);
  if (!sorted.length) {
    el.innerHTML = '<div class="empty-state">No players yet</div>';
    return;
  }

  el.innerHTML = sorted
    .slice(0, 5)
    .map(
      (p, i) => `
    <div class="lb-item ${p.id === G.myId ? "is-me" : ""}">
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-name">${p.name}</div>
      <div class="lb-score">${p.score}</div>
    </div>`,
    )
    .join("");
}

function addCatStat(q, ok) {
  const cat = q.cat || (q.imgs ? "Icon Match" : q.opts ? "MCQ" : "Riddle");
  if (!G.catStats[cat]) G.catStats[cat] = { c: 0, w: 0 };
  if (ok) {
    G.catStats[cat].c++;
    if (!G.catCorrect[cat]) G.catCorrect[cat] = 0;
    G.catCorrect[cat]++;
  } else G.catStats[cat].w++;
  renderCatStats();
}

function renderCatStats() {
  const el = document.getElementById("catStatsList");
  const entries = Object.entries(G.catStats);
  if (!entries.length) {
    el.innerHTML = '<div class="empty-state">Play to see stats</div>';
    return;
  }
  el.innerHTML = entries
    .map(
      ([cat, v]) => `
    <div class="cat-stat-row">
      <span>${cat}</span>
      <span><span class="text-green mr-2">✓ ${v.c}</span> <span class="text-red">✗ ${v.w}</span></span>
    </div>`,
    )
    .join("");
}

function checkAchs() {
  const s = {
    total: G.total,
    correct: G.correct,
    score: G.score,
    maxStreak: G.maxStreak,
    bestTime: G.bestTime,
    hintsUsed: G.hintsUsed,
    avgTime: G.times.length
      ? G.times.reduce((a, b) => a + b, 0) / G.times.length
      : 99,
    catCorrect: G.catCorrect,
  };
  ACHIEVEMENTS.forEach((a) => {
    if (!G.unlocked.includes(a.id) && a.test(s)) {
      G.unlocked.push(a.id);
      toast(`Achievement Unlocked: ${a.name}`);
    }
  });
  renderAchs();
}

function renderAchs() {
  document.getElementById("achList").innerHTML = ACHIEVEMENTS.map(
    (a) => `
    <div class="ach-item ${G.unlocked.includes(a.id) ? "unlocked" : "locked"}">
      <i data-lucide="${a.ico}" class="ach-ico"></i>
      <div class="ach-info">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
    </div>`,
  ).join("");
  refreshIcons();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickMode(el) {
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  G.mode = el.dataset.mode;
}

function pickDiff(el) {
  document
    .querySelectorAll(".diff-btn")
    .forEach((b) => b.classList.remove("active"));
  el.classList.add("active");
  G.diff = el.dataset.d;
}

function setFeedback(type, msg) {
  const el = document.getElementById("feedbackBox");
  el.className = `feedback-box show fb-${type}`;
  el.textContent = msg;
}

function buildQs() {
  const modes =
    G.mode === "random"
      ? ["riddle", "emoji", "trivia", "math", "science"]
      : [G.mode];
  let pool = [];
  modes.forEach((m) => {
    let qs = [...(QB[m] || [])];
    if (G.diff === "easy") qs = qs.filter((q) => q.pts <= 2);
    if (G.diff === "medium") qs = qs.filter((q) => q.pts <= 3);
    if (!qs.length) qs = [...(QB[m] || [])];
    qs = shuffle(qs);
    pool.push(...qs.map((q) => ({ ...q, _mode: m })));
  });
  return shuffle(pool).slice(0, 10);
}

function startGame() {
  G.name = document.getElementById("playerNameInput").value.trim();
  if (!G.name) {
    document.getElementById("playerNameInput").focus();
    return;
  }

  G.qs = buildQs();
  if (!G.qs.length) {
    alert("No questions found.");
    return;
  }
  G.myId = "qa_" + Date.now();
  saveMe();

  document.getElementById("loginPage").style.display = "none";
  document.getElementById("quizPage").style.display = "block";

  document.getElementById("playerTag").innerHTML =
    `<i data-lucide="user" class="icon-sm"></i> ${G.name}`;
  document.getElementById("skipsLeft").textContent = G.skips;

  renderAchs();
  showQ();
}

function showQ() {
  if (G.idx >= G.qs.length) {
    endGame();
    return;
  }
  const q = G.qs[G.idx];
  G.hintThisQ = false;
  G.answered = false;
  G.x2Active = false;

  document.getElementById("qNumLabel").textContent =
    `Q ${G.idx + 1} / ${G.qs.length}`;
  document.getElementById("qPtsLabel").textContent = `+${q.pts || 2} PTS`;
  document.getElementById("qText").textContent = q.q || "Guess the word:";

  const er = document.getElementById("emojiRow");
  if (q.imgs) {
    er.style.display = "flex";
    er.innerHTML = q.imgs
      .map((icon, i) => {
        const isLucide = /^[a-z\-]+$/.test(icon);
        const iconHtml = isLucide
          ? `<i data-lucide="${icon}"></i>`
          : `<span style="font-size: 2rem; line-height: 1;">${icon}</span>`;
        return `${iconHtml} ${i < q.imgs.length - 1 ? '<span class="text-gray">+</span>' : ""}`;
      })
      .join("");
    refreshIcons();
  } else {
    er.style.display = "none";
  }

  const mcqGrid = document.getElementById("mcqGrid");
  const textSec = document.getElementById("textSection");
  if (q.opts) {
    mcqGrid.style.display = "grid";
    textSec.style.display = "none";
    mcqGrid.innerHTML = q.opts
      .map(
        (opt, i) => `
      <button class="mcq-opt" onclick="checkMCQ(${i})" data-i="${i}">
        ${opt}
      </button>`,
      )
      .join("");
  } else {
    mcqGrid.style.display = "none";
    textSec.style.display = "block";
    document.getElementById("answerInput").value = "";
    document.getElementById("answerInput").focus();
    document.getElementById("submitBtn").disabled = false;
  }

  document.getElementById("feedbackBox").className = "feedback-box";
  document.getElementById("hintBox").className = "hint-box";
  document.getElementById("hintBtn").disabled = false;

  document.getElementById("progFill").style.width =
    (G.idx / G.qs.length) * 100 + "%";
  document.getElementById("progLbl").textContent = G.idx + " / " + G.qs.length;

  updateStats();
  G.startedQ = Date.now();
  startTimer(q.opts ? 35 : 40);
}

function startTimer(s = 40) {
  clearInterval(timerInterval);
  timerLeft = s;
  updateTimerUI();
  timerInterval = setInterval(() => {
    if (G.frozen) return;
    timerLeft--;
    updateTimerUI();
    if (timerLeft <= 0) {
      clearInterval(timerInterval);
      timeUp();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimerUI() {
  const fill = document.getElementById("timerFill");
  const num = document.getElementById("timerNum");
  fill.style.width = (timerLeft / 40) * 100 + "%";
  num.textContent = timerLeft;
  fill.className =
    "timer-fill" + (timerLeft <= 10 ? " crit" : timerLeft <= 20 ? " warn" : "");
}

function timeUp() {
  const q = G.qs[G.idx];
  setFeedback("err", `Time's up! Answer: ${q.opts ? q.opts[q.a] : q.a}`);
  G.streak = 0;
  G.total++;
  addCatStat(q, false);
  setTimeout(nextQ, 2000);
}

function checkTyped() {
  if (G.answered) return;
  const raw = document.getElementById("answerInput").value.trim().toLowerCase();
  const correct = G.qs[G.idx].a.toLowerCase();
  G.total++;
  const t = Math.round((Date.now() - G.startedQ) / 1000);
  G.times.push(t);
  if (t < G.bestTime) G.bestTime = t;

  if (raw === correct || raw === correct.replace(/\s+/g, "")) {
    handleOk(t);
  } else {
    G.total--;
    setFeedback("err", "Wrong! Try again…");
    document.getElementById("answerInput").select();
  }
}

function checkMCQ(idx) {
  if (G.answered) return;
  G.answered = true;
  const q = G.qs[G.idx];
  document.querySelectorAll(".mcq-opt").forEach((b) => (b.disabled = true));
  G.total++;
  const t = Math.round((Date.now() - G.startedQ) / 1000);
  G.times.push(t);
  if (t < G.bestTime) G.bestTime = t;

  if (idx === q.a) {
    document.querySelectorAll(".mcq-opt")[idx].classList.add("is-correct");
    handleOk(t, true);
  } else {
    document.querySelectorAll(".mcq-opt")[idx].classList.add("is-wrong");
    if (q.a < 4)
      document.querySelectorAll(".mcq-opt")[q.a].classList.add("is-correct");
    G.streak = 0;
    setFeedback("err", "Wrong! Answer: " + q.opts[q.a]);
    addCatStat(q, false);
    setTimeout(nextQ, 2000);
  }
}

function handleOk(t, isMCQ = false) {
  stopTimer();
  G.answered = true;
  G.correct++;
  G.streak++;
  if (G.streak > G.maxStreak) G.maxStreak = G.streak;

  const q = G.qs[G.idx];
  let pts = (q.pts || 2) * (G.x2Active ? 2 : 1);
  if (G.hintThisQ) pts = Math.max(1, pts - 1);
  if (t <= 5) pts += 1;
  G.score += pts;

  setFeedback("ok", `Correct! +${pts} pts`);
  addCatStat(q, true);
  saveMe();
  updateStats();
  checkAchs();
  setTimeout(nextQ, isMCQ ? 1800 : 1500);
}

function nextQ() {
  G.idx++;
  showQ();
}

function useHint() {
  if (G.hintThisQ) return;
  const q = G.qs[G.idx];
  const hb = document.getElementById("hintBox");
  hb.textContent = q.hint;
  hb.className = "hint-box show";
  G.hintThisQ = true;
  G.hintsUsed++;
  document.getElementById("hintBtn").disabled = true;
}

function skipQ() {
  if (G.skips <= 0) return;
  G.skips--;
  G.streak = 0;
  G.total++;
  stopTimer();
  setFeedback("info", `Skipped! (${G.skips} left)`);
  addCatStat(G.qs[G.idx], false);
  document.getElementById("skipsLeft").textContent = G.skips;
  if (G.skips <= 0) document.getElementById("skipBtn").disabled = true;
  setTimeout(nextQ, 1200);
}

function usePowerup(pu) {
  if (!G.powerups[pu]) return;
  G.powerups[pu] = false;
  document.querySelector(`[data-pu=${pu}]`).disabled = true;

  const q = G.qs[G.idx];
  if (pu === "fifty") {
    if (!q.opts) {
      setFeedback("info", "50/50 only works on MCQ!");
      G.powerups[pu] = true;
      document.querySelector("[data-pu=fifty]").disabled = false;
      return;
    }
    const btns = [...document.querySelectorAll(".mcq-opt")];
    let rem = 0;
    btns.forEach((b, i) => {
      if (i !== q.a && rem < 2) {
        b.disabled = true;
        b.style.opacity = "0.2";
        rem++;
      }
    });
    setFeedback("info", "Two wrong answers removed!");
  } else if (pu === "freeze") {
    G.frozen = true;
    setFeedback("info", "Timer frozen for 10 seconds!");
    setTimeout(() => {
      G.frozen = false;
    }, 10000);
  } else if (pu === "reveal") {
    useHint();
    if (q.opts)
      document.querySelectorAll(".mcq-opt")[q.a].style.border =
        "2px solid var(--mantine-color-green)";
    G.hintThisQ = false;
    G.hintsUsed--;
    setFeedback("info", "Answer revealed! (no penalty)");
  } else if (pu === "x2") {
    G.x2Active = true;
    document.getElementById("qPtsLabel").textContent =
      `+${(q.pts || 2) * 2} PTS`;
    setFeedback("info", "DOUBLE POINTS active this question!");
  }
}

function updateStats() {
  document.getElementById("svScore").textContent = G.score;
  document.getElementById("svStreak").textContent = G.streak;
  const acc = G.total > 0 ? Math.round((G.correct / G.total) * 100) : 100;
  document.getElementById("svAcc").textContent = acc + "%";
  const avg = G.times.length
    ? Math.round(G.times.reduce((a, b) => a + b, 0) / G.times.length)
    : 0;
  document.getElementById("svSpeed").textContent = avg ? avg + "s" : "—";
}

function endGame() {
  stopTimer();
  saveMe();
  checkAchs();
  document.getElementById("quizPage").style.display = "none";
  document.getElementById("resultPage").style.display = "block";

  const acc = G.total > 0 ? Math.round((G.correct / G.total) * 100) : 0;
  const avg = G.times.length
    ? Math.round(G.times.reduce((a, b) => a + b, 0) / G.times.length)
    : 0;

  document.getElementById("resultTitle").textContent =
    acc >= 80 ? "Excellent" : acc >= 50 ? "Solid Effort" : "Keep Training";

  document.getElementById("resultGrid").innerHTML = `
    <div class="rs-tile"><span class="rs-val">${G.score}</span><div class="rs-lbl">Points</div></div>
    <div class="rs-tile"><span class="rs-val">${G.correct}/${G.total}</span><div class="rs-lbl">Correct</div></div>
    <div class="rs-tile"><span class="rs-val">${acc}%</span><div class="rs-lbl">Accuracy</div></div>
  `;

  document.getElementById("resultAchList").innerHTML = G.unlocked.length
    ? G.unlocked
        .map((id) => {
          const a = ACHIEVEMENTS.find((x) => x.id === id);
          return a
            ? `<div class="ach-item unlocked"><i data-lucide="${a.ico}" class="ach-ico"></i><div class="ach-info"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div></div>`
            : "";
        })
        .join("")
    : '<div class="empty-state">No achievements this run.</div>';

  refreshIcons();
}

document.addEventListener("keypress", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("quizPage").style.display !== "none"
  ) {
    if (document.getElementById("textSection").style.display !== "none")
      checkTyped();
  }
});
