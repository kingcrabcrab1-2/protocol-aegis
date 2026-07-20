let adminMode = false;
let adminPassword = "";
let currentRecord = null;
let soundOn = true;
let allRecords = [];

const LOCAL_ADMIN_PASSWORD = "aegis0126";

const $ = (id) => document.getElementById(id);

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const timelineNo = (id) =>
  String(id).padStart(6, "0");

function escapeHTML(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );

}

let audioCtx = null;

function play(id) {

  if (!soundOn) return;

  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
    const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  const now = audioCtx.currentTime;

  osc.type = "square";

  osc.frequency.setValueAtTime(
    1650 + Math.random() * 220,
    now
  );

  gain.gain.setValueAtTime(
    0.035,
    now
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + 0.018
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.019);

}

async function api(path, options = {}) {

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (adminPassword) {
    headers["X-Admin-Password"] =
      adminPassword;
  }

  const res = await fetch(path, {
    ...options,
    headers
  });

  const data =
    await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.error || "요청 실패"
    );
  }

  return data;

}

async function typeLines(
  target,
  lines,
  delay = 120
) {

  target.textContent = "";

  for (const line of lines) {

    for (const ch of line) {

      target.textContent += ch;

      if (
        soundOn &&
        ch !== " " &&
        ch !== "\n"
      ) {
        play("clickSound");
      }

      await wait(18);

    }

    target.textContent += "\n";

    await wait(delay);

  }

}
async function typeMessage(target, text) {

  target.textContent = "";
  target.classList.add("typing");

  for (const ch of String(text ?? "")) {

    target.textContent += ch;

    if (
      soundOn &&
      ch !== " " &&
      ch !== "\n" &&
      Math.random() < 0.7
    ) {
      play("clickSound");
    }

    await wait(18);

  }

  target.classList.remove("typing");

}

async function bootSequence() {

  $("soundToggle").textContent =
    soundOn
      ? "SOUND ON"
      : "SOUND OFF";

  const lines = [

    "N.E.R.S.A. U.S. MAIN FACILITY",
    "GARDINERS ISLAND / ARCHIVED TERMINAL",
    "",
    "PROTOCOL : AEGIS",
    "",
    "BOOT SEQUENCE INITIALIZED...",
    "ACCESSING...",
    "VERIFYING UNKNOWN TIMELINE...",
    "SACRIFICE REQUIREMENT : REVOKED",
    "GROUP CONSCIOUSNESS SYNC : STABLE",
    "INTER-TIMELINE RELAY : ONLINE",
    "SIGNAL NOISE : ACCEPTABLE",
    "",
    "WELCOME, UNKNOWN TIMELINE."

  ];

  let out = "";

  for (let i = 0; i < lines.length; i++) {

    out += lines[i] + "\n";

    $("bootText").textContent = out;

    $("bootFill").style.width =
      Math.round(
        ((i + 1) / lines.length) * 100
      ) + "%";

    play("clickSound");

    await wait(i < 4 ? 180 : 120);

  }

  await wait(500);

  $("boot").classList.add("hidden");
  $("mainApp").classList.remove("hidden");

  await loadRecords();

}
async function loadRecords() {

  $("records").innerHTML =
    "<p class='muted'>시간선 기록을 불러오는 중...</p>";

  try {

    const data =
      await api("/api/messages");

    allRecords =
      data.messages || [];

    renderRecords();

  } catch (e) {

    $("records").innerHTML =
      "<p class='muted'>기록을 불러오지 못했습니다. Cloudflare 설정을 확인하세요.</p>";

  }

}

function renderRecords() {

  const keyword =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();

  const asc =
    $("sortSelect").value === "asc";

  let filtered =
    allRecords.filter((item) =>

      `${item.team_name || ""} ${item.message || ""} ${timelineNo(item.id)}`
        .toLowerCase()
        .includes(keyword)

    );

  filtered.sort((a, b) =>

    a.is_pinned !== b.is_pinned
      ? Number(b.is_pinned) - Number(a.is_pinned)
      : asc
        ? a.id - b.id
        : b.id - a.id

  );

  if (!filtered.length) {

    $("records").innerHTML =
      "<p class='muted'>검색 결과가 없습니다.</p>";

    return;

  }

  $("records").innerHTML =
    filtered.map((item) => `

      <article
        class="record ${item.is_pinned ? "pinned" : ""}"
        data-id="${item.id}">

        <div class="record-no">
          TIME LINE #${timelineNo(item.id)}
          ${
            item.is_pinned
              ? "<span class='pin-label'>★ FIXED</span>"
              : ""
          }
        </div>

        <div class="record-name">
          ${escapeHTML(item.team_name)}
        </div>

      </article>

    `).join("");

  document
    .querySelectorAll(".record")
    .forEach((node) => {

      node.addEventListener("click", () => {

        const record =
          allRecords.find(
            (item) =>
              item.id === Number(node.dataset.id)
          );

        openReader(record);

      });

    });

}
async function openReader(record) {

  if (!record) return;

  currentRecord = record;

  $("reader").classList.remove("hidden");

  $("messageView").classList.add("hidden");
  $("decrypt").classList.remove("hidden");

  await typeLines(

    $("decrypt"),

    [
      "SIGNAL RECEIVED...",
      "Decrypting...",
      "Synchronization Complete."
    ],

    210

  );

  await wait(260);

  $("decrypt").classList.add("hidden");
  $("messageView").classList.remove("hidden");

  $("viewMeta").textContent =
    `RECEIVED / TIME LINE #${timelineNo(record.id)}`;

  $("viewTitle").textContent =
    record.team_name;

  $("pinButton").textContent =
    record.is_pinned
      ? "고정 해제"
      : "고정";

  $("adminTools").classList.toggle(
    "hidden",
    !adminMode
  );

  await typeMessage(
    $("viewMessage"),
    record.message
  );

}

$("readerClose").addEventListener(
  "click",
  () => {

    $("reader").classList.add("hidden");

  }
);

$("adminToggle").addEventListener(
  "click",
  () => {

    if (adminMode) {

      adminMode = false;
      adminPassword = "";

      $("adminPassword").value = "";

      $("adminComposer").classList.add(
        "hidden"
      );

      $("adminToggle").textContent =
        "관리자 로그인";

      $("adminStatus").textContent =
        "로그아웃되었습니다.";

      $("adminTools").classList.add(
        "hidden"
      );

      return;

    }

    const pw =
      $("adminPassword").value;

    if (!pw) {

      $("adminStatus").textContent =
        "비밀번호를 입력해 주세요.";

      return;

    }
        if (pw !== LOCAL_ADMIN_PASSWORD) {

      $("adminStatus").textContent =
        "비밀번호가 올바르지 않습니다.";

      return;

    }

    adminPassword = pw;
    adminMode = true;

    $("adminComposer").classList.remove(
      "hidden"
    );

    $("adminToggle").textContent =
      "관리자 로그아웃";

    $("adminStatus").textContent =
      "관리자 인증 완료.";

    if (currentRecord) {

      $("adminTools").classList.remove(
        "hidden"
      );

    }

  }
);

$("sendButton").addEventListener(
  "click",
  async () => {

    const team_name =
      $("teamName")
        .value
        .trim() || "UNKNOWN TIMELINE";

    const message =
      $("messageText")
        .value
        .trim();

    if (!message) {

      $("sendStatus").textContent =
        "메시지를 입력해 주세요.";

      return;

    }

    $("sendStatus").textContent =
      "TRANSMITTING...";

    try {

      await api(
        "/api/messages",
        {
          method: "POST",
          body: JSON.stringify({
            team_name,
            message
          })
        }
      );

      play("sendSound");

      $("messageText").value = "";

      $("sendStatus").textContent =
        "등록 완료.";

      await loadRecords();

    } catch (e) {

      $("sendStatus").textContent =
        e.message;

    }

  }
);
$("editButton").addEventListener(
  "click",
  async () => {

    if (!currentRecord) return;

    const message = prompt(
      "수정할 메시지를 입력하세요.",
      currentRecord.message
    );

    if (message === null) return;

    try {

      await api(
        `/api/messages/${currentRecord.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            message
          })
        }
      );

      $("reader").classList.add("hidden");

      await loadRecords();

    } catch (e) {

      alert(e.message);

    }

  }
);

$("deleteButton").addEventListener(
  "click",
  async () => {

    if (!currentRecord) return;

    if (
      !confirm("정말 삭제하시겠습니까?")
    ) {
      return;
    }

    try {

      await api(
        `/api/messages/${currentRecord.id}`,
        {
          method: "DELETE"
        }
      );

      $("reader").classList.add("hidden");

      await loadRecords();

    } catch (e) {

      alert(e.message);

    }

  }
);
$("pinButton").addEventListener(
  "click",
  async () => {

    if (!currentRecord) return;

    try {

      await api(
        `/api/messages/${currentRecord.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            is_pinned: !currentRecord.is_pinned
          })
        }
      );

      $("reader").classList.add("hidden");

      await loadRecords();

    } catch (e) {

      alert(e.message);

    }

  }
);

$("soundToggle").addEventListener(
  "click",
  () => {

    soundOn = !soundOn;

    $("soundToggle").textContent =
      soundOn
        ? "SOUND ON"
        : "SOUND OFF";

  }
);

$("searchInput").addEventListener(
  "input",
  renderRecords
);

$("sortSelect").addEventListener(
  "change",
  renderRecords
);
// 최초 실행
function createAegisCursorHud() {

  if (!window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const hud = document.createElement("div");

  hud.className = "aegis-cursor-hud";

  document.body.appendChild(hud);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let hudX = mouseX;
  let hudY = mouseY;

  document.addEventListener("mousemove", (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

  });

  function animateHud() {

    hudX += (mouseX - hudX) * 0.18;
    hudY += (mouseY - hudY) * 0.18;

    hud.style.left = `${hudX}px`;
    hud.style.top = `${hudY}px`;

    requestAnimationFrame(animateHud);

  }

  animateHud();

  const interactiveSelector = [
    "button",
    ".record",
    "summary",
    "select",
    "input",
    "textarea",
    "a"
  ].join(",");

  document.addEventListener("mouseover", (event) => {

    if (event.target.closest(interactiveSelector)) {
      hud.classList.add("interactive");
    }

  });

  document.addEventListener("mouseout", (event) => {

    if (event.target.closest(interactiveSelector)) {
      hud.classList.remove("interactive");
    }

  });

  document.addEventListener("mousedown", () => {

    hud.classList.add("clicking");

    const pulse = document.createElement("div");

    pulse.className = "aegis-cursor-pulse";
    pulse.style.left = `${mouseX}px`;
    pulse.style.top = `${mouseY}px`;

    document.body.appendChild(pulse);

    setTimeout(() => {
      pulse.remove();
    }, 460);

  });

  document.addEventListener("mouseup", () => {

    hud.classList.remove("clicking");

  });

}

createAegisCursorHud();
bootSequence();
