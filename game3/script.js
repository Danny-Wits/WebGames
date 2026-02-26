// Your web app's Firebase configuration
const firebaseConfig = {
  authDomain: "leaderboard-a2fab.firebaseapp.com",
  projectId: "leaderboard-a2fab",
  storageBucket: "leaderboard-a2fab.appspot.com",
  databaseURL:
    "https://leaderboard-a2fab-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase (Compat version)
firebase.initializeApp(firebaseConfig);

// Get a reference to the Realtime Database service
const database = firebase.database();

console.log("Firebase initialized and database reference obtained!");

/* --- FIREBASE LEADERBOARD LISTENER (Compat Syntax) --- */
database
  .ref("emoji_game_scores")
  .orderByChild("score")
  .limitToLast(10)
  .on("value", (snapshot) => {
    const data = snapshot.val();
    const sortedScores = [];

    // Convert object to array
    for (let id in data) {
      sortedScores.push(data[id]);
    }

    // Sort highest to lowest
    sortedScores.sort((a, b) => b.score - a.score);

    const board = document.getElementById("board");
    board.innerHTML = "";

    if (sortedScores.length === 0) {
      board.innerHTML = "<li>No scores yet. Be the first!</li>";
      return;
    }

    sortedScores.forEach((s, i) => {
      let li = document.createElement("li");

      // Assign Tabler Icons for top 3, otherwise use the rank number
      let rankDisplay = "";
      if (i === 0) {
        rankDisplay = '<i class="ti ti-medal" style="color: #fcc419;"></i>'; // Gold
      } else if (i === 1) {
        rankDisplay = '<i class="ti ti-medal" style="color: #adb5bd;"></i>'; // Silver
      } else if (i === 2) {
        rankDisplay = '<i class="ti ti-medal" style="color: #ed9121;"></i>'; // Bronze
      } else {
        rankDisplay = `<small style="color: var(--mantine-dimmed); margin-right: 8px;">#${i + 1}</small>`;
      }

      li.innerHTML = `
        <span style="display: flex; align-items: center;">
            ${rankDisplay}
            <b style="text-transform: uppercase; letter-spacing: 0.5px;">${s.name}</b>
        </span>
        <span class="score-display">${s.score}</span>
    `;
      board.appendChild(li);
    });
  });

/* --- GAME DATA --- */
const allQuestions = {
  easy: [
    { emoji: "🔥🧱", answer: "firewall" },
    { emoji: "🔵🦷", answer: "bluetooth" },
    { emoji: "🌈", answer: "rainbow" },
    { emoji: "⭐🐟", answer: "starfish" },
    { emoji: "🧈🪰", answer: "butterfly" },
    { emoji: "🌊🐴", answer: "seahorse" },
    { emoji: "💧🍈", answer: "watermelon" },
    { emoji: "🥇🐟", answer: "goldfish" },
    { emoji: "✋👜", answer: "handbag" },
    { emoji: "📖🐛", answer: "bookworm" },
    { emoji: "🐶🏠", answer: "doghouse" },
    { emoji: "🚪🔔", answer: "doorbell" },
    { emoji: "🔥🏠", answer: "fireplace" },
    { emoji: "💧⛰️", answer: "waterfall" },
    { emoji: "🌙💡", answer: "moonlight" },

    { emoji: "☀️🌼", answer: "sunflower" },
    { emoji: "🧊🍦", answer: "icecream" },
    { emoji: "🍎📱", answer: "applephone" },
    { emoji: "🐱🐟", answer: "catfish" },
    { emoji: "👟➰", answer: "shoelace" },
    { emoji: "🍞🧈", answer: "breadbutter" },
    { emoji: "🌧️🧥", answer: "raincoat" },
    { emoji: "🎂🔥", answer: "birthday" },
    { emoji: "🦶⚽", answer: "football" },
    { emoji: "🚗🏁", answer: "racecar" },
    { emoji: "🐝🍯", answer: "honeybee" },
    { emoji: "🌊🐠", answer: "fishwave" },
    { emoji: "🛏️🏠", answer: "bedroom" },
    { emoji: "🍫🥛", answer: "chocolate" },
    { emoji: "🧢👦", answer: "capboy" },
    { emoji: "🐼🎋", answer: "panda" },
    { emoji: "🍔👑", answer: "burgerking" },
    { emoji: "📚🎓", answer: "graduate" },
    { emoji: "🐸👑", answer: "frogprince" },
    { emoji: "🚀🌙", answer: "spacemoon" },
    { emoji: "🍕❤️", answer: "pizzalove" },
    { emoji: "🎧🎵", answer: "headphone" },
    { emoji: "🐔🥚", answer: "chickenegg" },
    { emoji: "🌳🏠", answer: "treehouse" },
    { emoji: "🍟🥤", answer: "fastfood" },
    { emoji: "🦁👑", answer: "lionking" },
    { emoji: "🍿🎬", answer: "movie" },
    { emoji: "🐢🏁", answer: "slowrace" },
    { emoji: "🎮🧑", answer: "gamer" },
    { emoji: "👓📚", answer: "study" },
    { emoji: "🎒🏫", answer: "schoolbag" },
    { emoji: "🚲🌳", answer: "parkride" },
    { emoji: "🍩☕", answer: "donutcoffee" },
    { emoji: "🐧❄️", answer: "penguin" },
  ],
  medium: [
    { emoji: "🕷️🕸️", answer: "spiderweb" },
    { emoji: "🍯🪮", answer: "honeycomb" },
    { emoji: "🍯🌙", answer: "honeymoon" },
    { emoji: "💡🏠", answer: "lighthouse" },
    { emoji: "🟢🏠", answer: "greenhouse" },
    { emoji: "🧊🏔️", answer: "iceberg" },
    { emoji: "🐎⚡", answer: "horsepower" },
    { emoji: "❤️🥁", answer: "heartbeat" },
    { emoji: "🌍🪱", answer: "earthworm" },
    { emoji: "🌙🚶", answer: "moonwalk" },

    { emoji: "☀️🕶️", answer: "sunglasses" },
    { emoji: "📚🐛", answer: "bookworm" },
    { emoji: "🐟⭐", answer: "starfish" },
    { emoji: "🌧️🌈", answer: "rainbow" },
    { emoji: "🦷🧚", answer: "toothfairy" },
    { emoji: "🍎📱", answer: "applephone" },
    { emoji: "🧠🌩️", answer: "brainstorm" },
    { emoji: "👶🪑", answer: "highchair" },
    { emoji: "🌊🏄", answer: "surfing" },
    { emoji: "🐍🪜", answer: "snakeladder" },

    { emoji: "🧁🎂", answer: "cupcake" },
    { emoji: "🌼🌻", answer: "sunflower" },
    { emoji: "🐝🍯", answer: "honeybee" },
    { emoji: "🔥🚒", answer: "firetruck" },
    { emoji: "🌍✈️", answer: "worldtour" },
    { emoji: "🎬⭐", answer: "superstar" },
    { emoji: "🐶🏠", answer: "doghouse" },
    { emoji: "🧊🥤", answer: "coldrink" },
    { emoji: "📸⭐", answer: "photostar" },
    { emoji: "🌙⭐", answer: "nightstar" },

    { emoji: "🏀🔥", answer: "hotshot" },
    { emoji: "🛏️🌙", answer: "bedtime" },
    { emoji: "🍕❤️", answer: "pizzalover" },
    { emoji: "🕰️🏃", answer: "timeout" },
    { emoji: "🎵❤️", answer: "lovesong" },
    { emoji: "📦🚚", answer: "delivery" },
    { emoji: "🎮⚡", answer: "gamepower" },
    { emoji: "🐱🦁", answer: "wildcat" },
    { emoji: "🍫🥛", answer: "chocomilk" },
    { emoji: "🌧️☔", answer: "raincoat" },

    { emoji: "🧳✈️", answer: "traveller" },
    { emoji: "👑⭐", answer: "kingstar" },
    { emoji: "🎤🎶", answer: "micmusic" },
    { emoji: "🚗💨", answer: "fastcar" },
    { emoji: "🍔👑", answer: "burgerking" },
    { emoji: "🕶️⭐", answer: "coolstar" },
    { emoji: "📱🔒", answer: "lockscreen" },
    { emoji: "🧠🎯", answer: "mindset" },
    { emoji: "🌊🐚", answer: "seashell" },
    { emoji: "🌟🧭", answer: "northstar" },
  ],

  hard: [
    { emoji: "🐎🪖", answer: "trojanhorse" },
    { emoji: "📦🔓", answer: "pandorasbox" },
    { emoji: "🎲⬇️", answer: "dominoeffect" },
    { emoji: "🐰🕳️", answer: "rabbithole" },
    { emoji: "🦋🌊", answer: "butterflyeffect" },
    { emoji: "🐟📧", answer: "phishing" },
    { emoji: "💪🔒", answer: "bruteforceattack" },
    { emoji: "🍝💻", answer: "spaghetticode" },
    { emoji: "😴📦", answer: "lazyloading" },
    { emoji: "🤖🧪", answer: "turingtest" },

    { emoji: "🧠🔌", answer: "neuralnetwork" },
    { emoji: "☁️💾", answer: "cloudstorage" },
    { emoji: "🔑🔐", answer: "encryptionkey" },
    { emoji: "🌐🕸️", answer: "worldwideweb" },
    { emoji: "📡🛰️", answer: "satellitecommunication" },
    { emoji: "💻🐞", answer: "debugging" },
    { emoji: "🧱⛓️", answer: "blockchain" },
    { emoji: "🔎📊", answer: "dataanalysis" },
    { emoji: "⚡🧠", answer: "machinelearning" },
    { emoji: "🤖📊", answer: "artificialintelligence" },

    { emoji: "📱🧬", answer: "biometricscanner" },
    { emoji: "👁️🔒", answer: "faceunlock" },
    { emoji: "🛡️💻", answer: "cybersecurity" },
    { emoji: "🔗🌍", answer: "hyperlink" },
    { emoji: "📶🌐", answer: "internetconnection" },
    { emoji: "🧑‍💻⌨️", answer: "programming" },
    { emoji: "📜⚙️", answer: "algorithm" },
    { emoji: "🧠⚙️", answer: "deepthinking" },
    { emoji: "🌙💻", answer: "darkmode" },
    { emoji: "📁🗂️", answer: "filesystem" },

    { emoji: "🧑‍💻🐍", answer: "pythonprogramming" },
    { emoji: "☕💻", answer: "javadeveloper" },
    { emoji: "📱🎮", answer: "mobilegaming" },
    { emoji: "🎥💻", answer: "videostreaming" },
    { emoji: "🧑‍💻🔄", answer: "versioncontrol" },
    { emoji: "📡🌎", answer: "globalnetwork" },
    { emoji: "🔐🌐", answer: "securelogin" },
    { emoji: "📊📈", answer: "datascience" },
    { emoji: "💾🧠", answer: "memorycache" },
    { emoji: "🔎🐞", answer: "bugtracking" },

    { emoji: "📶📱", answer: "wirelesssignal" },
    { emoji: "🧑‍💻🧪", answer: "softwaretesting" },
    { emoji: "🎮🕹️", answer: "arcadegame" },
    { emoji: "🌐📚", answer: "onlinelearning" },
    { emoji: "🧭🌐", answer: "navigationmap" },
    { emoji: "📱💬", answer: "instantmessage" },
    { emoji: "🧑‍💻🌙", answer: "nightcoding" },
    { emoji: "🔄💻", answer: "systemupdate" },
    { emoji: "📦💻", answer: "softwarepackage" },
    { emoji: "🧠📡", answer: "smarttechnology" },
  ],
};

/* --- GAME STATE --- */
let currentLevel = [];
let index = 0;
let score = 0;
let time = 100;
let totalRounds = 10;
let interval;
let currentDifficulty = "";

window.show = function (id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "startScreen") document.getElementById("username").value = "";
};

window.goLevel = function () {
  let name = document.getElementById("username").value.trim();
  if (!name) {
    alert("Enter your name to join the leaderboard!");
    return;
  }
  window.show("levelScreen");
};

window.startGame = function (level) {
  currentDifficulty = level;
  // Get  random questions for a longer game
  let pool = [...allQuestions[level]]
    .sort(() => Math.random() - 0.5)
    .slice(0, totalRounds);
  currentLevel = pool;
  index = 0;
  score = 0;

  document.getElementById("score").innerText = "Score: 0";
  document.getElementById("levelTitle").innerText =
    "Level: " + level.toUpperCase();

  window.show("gameScreen");
  loadQuestion();
};

function loadQuestion() {
  document.getElementById("emoji").innerText = currentLevel[index].emoji;
  document.getElementById("guess").value = "";
  document.getElementById("guess").focus();
  startTimer();
}

function startTimer() {
  clearInterval(interval);
  time = 100;
  let bar = document.getElementById("timerBar");
  bar.style.width = "100%";
  bar.style.backgroundColor = "#ff4b2b";

  interval = setInterval(() => {
    time -= 0.5; // 20 second timer
    bar.style.width = time + "%";

    // Change color as time runs out
    if (time < 30) bar.style.backgroundColor = "#dc3545";

    if (time <= 0) endGame("TIME");
  }, 100);
}

window.checkAnswer = function () {
  let g = document
    .getElementById("guess")
    .value.trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  let answer = currentLevel[index].answer.toLowerCase().replace(/\s+/g, "");
  let screen = document.getElementById("gameScreen");
  const getMultiplier = (d) => (d === "easy" ? 1 : d === "medium" ? 1.5 : 2);
  if (g === answer) {
    score += 10 * getMultiplier(currentDifficulty);
    document.getElementById("score").innerText = "Score: " + score;

    // Visual cue for correct
    screen.classList.add("correct-flash");
    setTimeout(() => screen.classList.remove("correct-flash"), 500);

    index++;
    if (index >= currentLevel.length) {
      endGame("WIN");
    } else {
      loadQuestion();
    }
  } else {
    // Visual cue for wrong
    screen.classList.add("shake");
    setTimeout(() => screen.classList.remove("shake"), 400);
    endGame("WRONG");
  }
};

function endGame(status) {
  clearInterval(interval);
  let name = document.getElementById("username").value.trim() || "Anonymous";
  let answerText = currentLevel[index] ? currentLevel[index].answer : "";

  const finalText = document.getElementById("finalText");
  const finalSubtext = document.getElementById("finalSubtext");

  if (status === "WIN") {
    finalText.innerHTML = `<i class="ti ti-confetti" style="color: var(--mantine-success); font-size: 3rem;"></i><br>Success!`;
    finalSubtext.innerHTML = `Excellent work, <b>${name}</b>! You cleared the level with <span class="score-display">${score}</span> points.`;
  } else if (status === "TIME") {
    finalText.innerHTML = `<i class="ti ti-hourglass-empty" style="color: var(--mantine-error); font-size: 3rem;"></i><br>Time Out`;
    finalSubtext.innerHTML = `The timer hit zero! The answer was <b style="color: var(--mantine-title)">${answerText}</b>.`;
  } else if (status === "WRONG") {
    finalText.innerHTML = `<i class="ti ti-circle-x" style="color: var(--mantine-error); font-size: 3rem;"></i><br>Incorrect`;
    finalSubtext.innerHTML = `That wasn't quite right. The answer was <b style="color: var(--mantine-title)">${answerText}</b>.`;
  }

  // Submit to Firebase
  if (score > 0) {
    database.ref("emoji_game_scores").push({
      name: name,
      score: score,
      level: currentDifficulty,
      timestamp: Date.now(),
    });
  }

  window.show("endScreen");
}

// Enter key to submit guess
document.getElementById("guess").addEventListener("keypress", function (e) {
  if (e.key === "Enter") window.checkAnswer();
});
window.getHint = function () {
  if (score >= 5) {
    score -= 5;
    document.getElementById("score").innerText = "Score: " + score;
    const answer = currentLevel[index].answer;
    alert(
      "Hint: The word starts with '" +
        answer[0].toUpperCase() +
        "' and has " +
        answer.length +
        " letters!",
    );
  } else {
    alert("Not enough points for a hint!");
  }
};
const personalBest = localStorage.getItem("emoji_pb") || 0;
if (score > personalBest) {
  localStorage.setItem("emoji_pb", score);
  alert("New Personal Best: " + score + "!");
}
function toggleCredits() {
  const overlay = document.getElementById("creditsOverlay");
  // Toggle between flex and none
  overlay.style.display = overlay.style.display === "flex" ? "none" : "flex";
}
