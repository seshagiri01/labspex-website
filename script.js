/* =========================================================
   LabSpex website — EDIT THESE TWO THINGS
   ========================================================= */

/* 1) YouTube founders video: paste the video ID (the part after "watch?v=" or "youtu.be/").
      Example: for https://youtu.be/abc123XYZ  ->  const YOUTUBE_ID = "abc123XYZ";               */
const YOUTUBE_ID = "EzGH-g6I0Wg";

/* 2) Parts of the glasses. Fill in "desc" for each part (and rename "name" if you like).
      Leave desc as "" and the site shows "To be confirmed".
      "spots" = where the marker sits on each view, in % from the left / top of the image.        */
const PARTS = [
  { key: "A", name: "LED indicator", desc: "The white dot on the front of the frame is the LED indicator.",
    spots: { front: [21.8, 42], side: [67.5, 44] } },
  { key: "B", name: "Camera", desc: "The black dot on the front of the frame is the camera that records video of your work.",
    spots: { front: [77.7, 42] } },
  { key: "C", name: "Display", desc: "The display sits on the inside of the lens: a peripheral, HUD-type display.",
    spots: { front: [69, 59], inside: [44.7, 38] } },
  { key: "D", name: "Side spacers", desc: "The green sides are spacers between the glasses and the face. They keep some distance from the eyes because LabSpex uses a peripheral HUD-type display.",
    spots: { side: [56.7, 49.5] } },
  { key: "E", name: "Speakers (one per arm)", desc: "Each arm of the frame holds one speaker. The grilles on the arms (dotted on one side, slotted on the other) mark where the speaker sits.",
    spots: { side: [[46.7, 26.7], [24, 41]], inside: [[21.7, 33.7]] } },
];

/* ========================================================= */

const VIEWS = {
  front:  { src: "assets/view-front.jpg",  alt: "LabSpex glasses, front view" },
  side:   { src: "assets/view-side.jpg",   alt: "LabSpex glasses, side view" },
  inside: { src: "assets/view-inside.jpg", alt: "LabSpex glasses, view from the wearer's side" },
};

/* ---------- Mobile nav ---------- */
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));

/* ---------- YouTube ---------- */
if (YOUTUBE_ID.trim()) {
  document.getElementById("ytSlot").innerHTML =
    `<div class="yt-frame"><iframe src="https://www.youtube-nocookie.com/embed/${YOUTUBE_ID.trim()}?rel=0"
      title="LabSpex founders video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe></div>`;
}

/* ---------- Drag-to-spin viewer ---------- */
(() => {
  const stage = document.getElementById("spinStage");
  const vid = document.getElementById("spinVideo");
  const range = document.getElementById("spinRange");
  const playBtn = document.getElementById("spinPlay");
  let playing = true, dragging = false, startX = 0, startT = 0;

  const setPlaying = p => {
    playing = p;
    playBtn.textContent = p ? "⏸ PAUSE" : "▶ SPIN";
    p ? vid.play().catch(() => {}) : vid.pause();
  };
  vid.loop = true;
  vid.addEventListener("loadedmetadata", () => setPlaying(true));
  vid.addEventListener("timeupdate", () => {
    if (vid.duration) range.value = (vid.currentTime / vid.duration) * 1000;
  });
  playBtn.addEventListener("click", () => setPlaying(!playing));
  range.addEventListener("input", () => {
    setPlaying(false);
    if (vid.duration) vid.currentTime = (range.value / 1000) * vid.duration;
  });

  const wrap = t => { const d = vid.duration || 1; return ((t % d) + d) % d; };
  stage.addEventListener("pointerdown", e => {
    dragging = true; startX = e.clientX; startT = vid.currentTime;
    setPlaying(false); stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", e => {
    if (!dragging || !vid.duration) return;
    const dx = e.clientX - startX;
    vid.currentTime = wrap(startT + (dx / stage.clientWidth) * vid.duration);
  });
  const end = () => { dragging = false; stage.classList.remove("dragging"); };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
})();

/* ---------- Hotspot explorer ---------- */
(() => {
  const img = document.getElementById("viewImg");
  const layer = document.getElementById("hotspots");
  const card = document.getElementById("partCard");
  const index = document.getElementById("partsIndex");
  const tabs = document.querySelectorAll(".tab");
  let currentView = "front", activeKey = null;


  const showPart = key => {
    const p = PARTS.find(x => x.key === key);
    if (!p) return;
    activeKey = key;
    const has = p.desc.trim();
    card.innerHTML = `<p class="part-id">PART ${p.key}</p>
      <h4 class="part-name">${p.name}</h4>
      <p class="part-desc${has ? "" : " tbc"}">${has ? p.desc : "To be confirmed by the LabSpex team."}</p>`;
    layer.querySelectorAll(".hs").forEach(h => h.classList.toggle("active", h.dataset.key === key));
    index.querySelectorAll("li").forEach(li => li.classList.toggle("active", li.dataset.key === key));
  };

  const drawSpots = () => {
    layer.innerHTML = "";
    PARTS.forEach(p => {
      const raw = p.spots[currentView];
      if (!raw) return;
      const list = Array.isArray(raw[0]) ? raw : [raw];
      list.forEach(pos => {
      const b = document.createElement("button");
      b.className = "hs" + (p.key === activeKey ? " active" : "");
      b.dataset.key = p.key;
      b.style.left = pos[0] + "%";
      b.style.top = pos[1] + "%";
      b.textContent = p.key;
      b.setAttribute("aria-label", "Part " + p.key + ": " + p.name);
      b.addEventListener("click", () => showPart(p.key));
      layer.appendChild(b);
      });
    });
  };

  const setView = v => {
    currentView = v;
    img.src = VIEWS[v].src; img.alt = VIEWS[v].alt;
    tabs.forEach(t => t.classList.toggle("active", t.dataset.view === v));
    drawSpots();
  };
  tabs.forEach(t => t.addEventListener("click", () => setView(t.dataset.view)));

  PARTS.forEach(p => {
    const li = document.createElement("li");
    li.dataset.key = p.key;
    li.innerHTML = `<span class="pi-key">${p.key}</span>${p.name}`;
    li.addEventListener("click", () => {
      if (!p.spots[currentView]) setView(Object.keys(p.spots)[0]);
      showPart(p.key);
      document.getElementById("hotspotStage").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    index.appendChild(li);
  });

  drawSpots();
})();

/* ---------- Reveal on scroll + stat counters ---------- */
(() => {
  const els = document.querySelectorAll("#blueprint, .section .wrap > *, .stat, .pu, .player, .combo-card, .loop-step, .rm-stage");
  els.forEach(el => el.classList.add("reveal"));
  const countUp = el => {
    const target = +el.dataset.count, pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
    let n = 0; const step = Math.max(1, Math.ceil(target / 30));
    const t = setInterval(() => { n = Math.min(target, n + step); el.textContent = pre + n + suf; if (n >= target) clearInterval(t); }, 35);
  };
  if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll?.("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();
