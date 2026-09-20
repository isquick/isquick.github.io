/* ==========================================================================
   Retro desktop shell.

   Pages supply their own content declaratively:
     #icons-source   <li data-icon data-label data-window|data-href>
     #windows-source <article data-id data-title data-icon [data-open] ...>
   Everything else (boot, chrome, window management) is built here.
   ========================================================================== */

(function () {
	"use strict";

	var SPRITE =
		'<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
		'<symbol id="i-computer" viewBox="0 0 32 32">' +
		'<rect x="3" y="4" width="26" height="18" rx="1" fill="#ded9ca" stroke="#3b3b3b" stroke-width="1.2"/>' +
		'<rect x="5.5" y="6.5" width="21" height="13" fill="#2a6fb0"/>' +
		'<path d="M5.5 6.5h21v4h-21z" fill="#3e8ad2"/>' +
		'<path d="M11 22h10l1.5 4h-13z" fill="#c4bfae" stroke="#3b3b3b" stroke-width="1.2"/>' +
		'<rect x="7" y="26" width="18" height="2.5" rx="1" fill="#aaa393" stroke="#3b3b3b" stroke-width="1.2"/>' +
		"</symbol>" +
		'<symbol id="i-pdf" viewBox="0 0 32 32">' +
		'<path d="M6 2h13l7 7v21H6z" fill="#fff" stroke="#555" stroke-width="1.2"/>' +
		'<path d="M19 2l7 7h-7z" fill="#d3d3d3" stroke="#555" stroke-width="1.2"/>' +
		'<rect x="6" y="17" width="20" height="9" fill="#cc3327"/>' +
		'<text x="16" y="24" text-anchor="middle" fill="#fff" font-family="Tahoma,sans-serif" font-size="7" font-weight="bold">PDF</text>' +
		"</symbol>" +
		'<symbol id="i-doc" viewBox="0 0 32 32">' +
		'<path d="M7 2h12l6 6v22H7z" fill="#fff" stroke="#555" stroke-width="1.2"/>' +
		'<path d="M19 2l6 6h-6z" fill="#d3d3d3" stroke="#555" stroke-width="1.2"/>' +
		'<g fill="#7f97a8"><rect x="10" y="12" width="12" height="1.6"/><rect x="10" y="16" width="12" height="1.6"/>' +
		'<rect x="10" y="20" width="12" height="1.6"/><rect x="10" y="24" width="8" height="1.6"/></g>' +
		"</symbol>" +
		'<symbol id="i-folder" viewBox="0 0 32 32">' +
		'<path d="M2 6h10l2.5 3.5H30V27H2z" fill="#d9a521" stroke="#7d5e0e" stroke-width="1.2"/>' +
		'<path d="M2 11h28v16H2z" fill="#ffd25e" stroke="#7d5e0e" stroke-width="1.2"/>' +
		"</symbol>" +
		'<symbol id="i-case" viewBox="0 0 32 32">' +
		'<path d="M12 9V6.5a1.5 1.5 0 011.5-1.5h5A1.5 1.5 0 0120 6.5V9" fill="none" stroke="#4a3220" stroke-width="1.6"/>' +
		'<rect x="2.5" y="9" width="27" height="18" rx="1.5" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		'<rect x="2.5" y="16" width="27" height="3.5" fill="#815434"/>' +
		'<rect x="13.5" y="15" width="5" height="6" rx="1" fill="#f0d08a" stroke="#4a3220" stroke-width="1.2"/>' +
		"</symbol>" +
		'<symbol id="i-globe" viewBox="0 0 32 32">' +
		'<circle cx="16" cy="16" r="12.5" fill="#2f7fd0" stroke="#17456f" stroke-width="1.2"/>' +
		'<g fill="none" stroke="#cfe7ff" stroke-width="1.1">' +
		'<ellipse cx="16" cy="16" rx="5.5" ry="12.5"/><path d="M3.8 16h24.4M6 9.5h20M6 22.5h20"/></g>' +
		"</symbol>" +
		'<symbol id="i-bin" viewBox="0 0 32 32">' +
		'<rect x="12.5" y="2.5" width="7" height="3" fill="#c3cace" stroke="#495256" stroke-width="1.2"/>' +
		'<rect x="6" y="5.5" width="20" height="4" rx="1" fill="#c3cace" stroke="#495256" stroke-width="1.2"/>' +
		'<path d="M8.5 9.5h15l-1.8 20h-11.4z" fill="#9fa9ae" stroke="#495256" stroke-width="1.2"/>' +
		'<g stroke="#6e787d" stroke-width="1.1"><path d="M13 13.5v12M16 13.5v12M19 13.5v12"/></g>' +
		"</symbol>" +
		'<symbol id="i-home" viewBox="0 0 32 32">' +
		'<path d="M16 3L2.5 14.5H7V29h18V14.5h4.5z" fill="#dde6ec" stroke="#3d4a52" stroke-width="1.2"/>' +
		'<rect x="13" y="19" width="6" height="10" fill="#8a5a33" stroke="#3d4a52" stroke-width="1.1"/>' +
		'<rect x="9" y="17" width="4" height="4" fill="#79b7e0" stroke="#3d4a52" stroke-width="1.1"/>' +
		"</symbol>" +
		'<symbol id="i-mail" viewBox="0 0 32 32">' +
		'<rect x="2.5" y="7" width="27" height="18" fill="#fff" stroke="#555" stroke-width="1.2"/>' +
		'<path d="M2.5 7L16 18 29.5 7" fill="none" stroke="#555" stroke-width="1.2"/>' +
		"</symbol>" +
		'<symbol id="i-floppy" viewBox="0 0 32 32">' +
		'<rect x="3" y="3" width="26" height="26" rx="1" fill="#33383c" stroke="#15181a" stroke-width="1.2"/>' +
		'<rect x="9" y="3" width="14" height="10" fill="#cdd2d6"/>' +
		'<rect x="13" y="4.5" width="4" height="7" fill="#5c6368"/>' +
		'<rect x="7" y="17" width="18" height="12" fill="#e6eaed"/>' +
		"</symbol>" +
		'<symbol id="i-paw" viewBox="0 0 32 32">' +
		'<ellipse cx="16" cy="22" rx="7.5" ry="6" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		'<circle cx="7.5" cy="14" r="3.3" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		'<circle cx="12.5" cy="8.5" r="3.5" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		'<circle cx="19.5" cy="8.5" r="3.5" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		'<circle cx="24.5" cy="14" r="3.3" fill="#a9754b" stroke="#4a3220" stroke-width="1.2"/>' +
		"</symbol>" +
		'<symbol id="i-hamster" viewBox="0 0 32 32">' +
		'<ellipse cx="16" cy="18" rx="10" ry="8.5" fill="#e8b56a" stroke="#6b3f14" stroke-width="1.2"/>' +
		'<ellipse cx="7" cy="12" rx="4.2" ry="4.8" fill="#e8b56a" stroke="#6b3f14" stroke-width="1.2"/>' +
		'<ellipse cx="25" cy="12" rx="4.2" ry="4.8" fill="#e8b56a" stroke="#6b3f14" stroke-width="1.2"/>' +
		'<ellipse cx="7" cy="12.5" rx="2.2" ry="2.6" fill="#f3c9a0"/>' +
		'<ellipse cx="25" cy="12.5" rx="2.2" ry="2.6" fill="#f3c9a0"/>' +
		'<ellipse cx="16" cy="21" rx="3.2" ry="2.4" fill="#f0a8b8" stroke="#6b3f14" stroke-width="0.8"/>' +
		'<circle cx="12" cy="16" r="1.4" fill="#2a1a0a"/>' +
		'<circle cx="20" cy="16" r="1.4" fill="#2a1a0a"/>' +
		'<circle cx="12.4" cy="15.6" r="0.45" fill="#fff"/>' +
		'<circle cx="20.4" cy="15.6" r="0.45" fill="#fff"/>' +
		'<ellipse cx="16" cy="18.2" rx="1.1" ry="0.8" fill="#5a3310"/>' +
		'<path d="M11 24.5c1.6 1.4 8.4 1.4 10 0" fill="none" stroke="#6b3f14" stroke-width="1" stroke-linecap="round"/>' +
		"</symbol>" +
		'<symbol id="i-flag" viewBox="0 0 32 32">' +
		'<path d="M2 8.5l12-3.2v10.2H2z" fill="#e8403a"/><path d="M15.6 5l14.4-3.8v14.3H15.6z" fill="#5bb75b"/>' +
		'<path d="M2 17.5h12v9.7L2 24.4z" fill="#2196f3"/><path d="M15.6 17.5H30v13.3l-14.4-3.8z" fill="#ffc72c"/>' +
		"</symbol>" +
		"</svg>";

	var BOOT = [
		{ t: "ISQUICK 2000 BIOS v4.51PG", d: 220 },
		{ t: "Copyright (C) 1985-1997, Isquick Systems Inc.", d: 320 },
		{ t: "", d: 140 },
		{ t: "Pentium(R) II MMX  266 MHz", d: 240 },
		{ t: "Memory Test:       65536K OK", d: 420 },
		{ t: "", d: 140 },
		{ t: "Detecting IDE Primary Master   ... ISQUICK-HDD 1.6GB", d: 260 },
		{ t: "Detecting IDE Primary Slave    ... None", d: 190 },
		{ t: "Detecting IDE Secondary Master ... CD-ROM 24X", d: 240 },
		{ t: "Detecting Floppy Drive A       ... 1.44M, 3.5 in.", d: 240 },
		{ t: "", d: 160 },
		{ t: "Positioning Coprocessor ........ Installed", d: 190 },
		{ t: "Go-To-Market Accelerator ....... Enabled", d: 190 },
		{ t: "Caffeine Level ................. 98%", d: 280 },
		{ t: "", d: 160 },
		{ t: "Starting ISQUICK 96 ...", d: 520 }
	];

	var BOOTED_KEY = "isq-booted";
	var COMPACT_AT = 760;

	var doc = document;
	var body = doc.body;
	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var coarse = window.matchMedia("(pointer: coarse)").matches;

	var area, taskList, startMenu, startBtn;
	var windows = {};
	var zTop = 10;
	var cascade = 0;

	function el(tag, cls, html) {
		var n = doc.createElement(tag);
		if (cls) n.className = cls;
		if (html != null) n.innerHTML = html;
		return n;
	}

	function useIcon(name, cls) {
		return (
			'<svg class="' + (cls || "") + '" viewBox="0 0 32 32" aria-hidden="true"><use href="#i-' +
			name +
			'"/></svg>'
		);
	}

	/* ---------- boot ------------------------------------------------------ */

	function runBoot(done) {
		var bootLayer = doc.getElementById("boot");
		var splash = doc.getElementById("splash");
		var out = doc.getElementById("boot-text");
		var fill = doc.getElementById("splash-fill");
		var i = 0;
		var timer;
		var finished = false;

		function finish() {
			if (finished) return;
			finished = true;
			clearTimeout(timer);
			doc.removeEventListener("keydown", finish);
			bootLayer.removeEventListener("pointerdown", finish);
			bootLayer.hidden = true;
			splash.hidden = true;
			try { sessionStorage.setItem(BOOTED_KEY, "1"); } catch (e) {}
			done();
		}

		function showSplash() {
			bootLayer.hidden = true;
			splash.hidden = false;
			var pct = 0;
			(function step() {
				pct += 9 + Math.random() * 13;
				fill.style.width = Math.min(pct, 100) + "%";
				if (pct < 100) {
					timer = setTimeout(step, 170);
				} else {
					timer = setTimeout(finish, 520);
				}
			})();
		}

		function nextLine() {
			if (i >= BOOT.length) {
				timer = setTimeout(showSplash, 380);
				return;
			}
			var line = BOOT[i++];
			out.textContent += line.t + "\n";
			timer = setTimeout(nextLine, reduceMotion ? 40 : line.d);
		}

		doc.addEventListener("keydown", finish);
		bootLayer.addEventListener("pointerdown", finish);
		nextLine();
	}

	/* ---------- window management ----------------------------------------- */

	function isCompact() {
		return window.innerWidth < COMPACT_AT;
	}

	function focusWin(id) {
		Object.keys(windows).forEach(function (key) {
			var w = windows[key];
			var on = key === id;
			w.el.classList.toggle("is-active", on);
			if (w.task) w.task.classList.toggle("is-active", on && !w.el.hidden);
		});
		var win = windows[id];
		if (win) win.el.style.zIndex = ++zTop;
	}

	function openWin(id) {
		var win = windows[id];
		if (!win) return;
		if (win.el.hidden) {
			win.el.hidden = false;
			if (isCompact()) win.el.classList.add("is-max");
			else placeWin(win);
		}
		win.task.hidden = false;
		focusWin(id);
	}

	function closeWin(id) {
		var win = windows[id];
		if (id === "hamsterdance") stopHamsterDance();
		win.el.hidden = true;
		win.task.hidden = true;
		var next = Object.keys(windows).filter(function (k) {
			return !windows[k].el.hidden;
		});
		if (next.length) focusWin(next[next.length - 1]);
	}

	function minimizeWin(id) {
		var win = windows[id];
		if (id === "hamsterdance") stopHamsterDance();
		win.el.hidden = true;
		win.el.classList.remove("is-active");
		win.task.classList.remove("is-active");
	}

	function toggleMax(id) {
		var win = windows[id];
		if (isCompact()) return;
		win.el.classList.toggle("is-max");
		focusWin(id);
	}

	function placeWin(win) {
		var rect = area.getBoundingClientRect();
		var w = Math.min(win.spec.w, rect.width - 24);
		var h = Math.min(win.spec.h, rect.height - 24);
		var x = win.spec.x != null ? win.spec.x : 40 + cascade * 26;
		var y = win.spec.y != null ? win.spec.y : 30 + cascade * 24;
		cascade = (cascade + 1) % 5;
		win.el.style.width = w + "px";
		win.el.style.height = h + "px";
		win.el.style.left = Math.max(4, Math.min(x, rect.width - w - 4)) + "px";
		win.el.style.top = Math.max(4, Math.min(y, rect.height - h - 4)) + "px";
	}

	function makeDraggable(win) {
		var bar = win.el.querySelector(".win__bar");
		var dragging = false;
		var offX = 0;
		var offY = 0;

		bar.addEventListener("pointerdown", function (ev) {
			if (ev.target.closest(".btn95")) return;
			focusWin(win.id);
			if (win.el.classList.contains("is-max") || isCompact()) return;
			dragging = true;
			var r = win.el.getBoundingClientRect();
			offX = ev.clientX - r.left;
			offY = ev.clientY - r.top;
			bar.setPointerCapture(ev.pointerId);
			ev.preventDefault();
		});

		bar.addEventListener("pointermove", function (ev) {
			if (!dragging) return;
			var a = area.getBoundingClientRect();
			var r = win.el.getBoundingClientRect();
			var x = ev.clientX - a.left - offX;
			var y = ev.clientY - a.top - offY;
			win.el.style.left = Math.max(0, Math.min(x, a.width - r.width)) + "px";
			win.el.style.top = Math.max(0, Math.min(y, a.height - r.height)) + "px";
		});

		function end(ev) {
			if (!dragging) return;
			dragging = false;
			try { bar.releasePointerCapture(ev.pointerId); } catch (e) {}
		}

		bar.addEventListener("pointerup", end);
		bar.addEventListener("pointercancel", end);
		bar.addEventListener("dblclick", function () {
			toggleMax(win.id);
		});
	}

	function buildWindow(src) {
		var id = src.dataset.id;
		var title = src.dataset.title || id;
		var icon = src.dataset.icon || "doc";

		var frame = el("section", "win");
		frame.hidden = true;
		frame.setAttribute("aria-label", title);

		var bar = el("div", "win__bar");
		bar.innerHTML =
			useIcon(icon) +
			'<span class="win__title">' + title + "</span>" +
			'<span class="win__btns">' +
			'<button class="btn95" type="button" data-act="min" title="Minimize" aria-label="Minimize ' + title + '">_</button>' +
			'<button class="btn95" type="button" data-act="max" title="Maximize" aria-label="Maximize ' + title + '">□</button>' +
			'<button class="btn95" type="button" data-act="close" title="Close" aria-label="Close ' + title + '">✕</button>' +
			"</span>";
		frame.appendChild(bar);

		if (src.dataset.menu) {
			var menu = el("div", "win__menu");
			src.dataset.menu.split("|").forEach(function (label) {
				menu.appendChild(el("span", null, label));
			});
			frame.appendChild(menu);
		}

		var content = el("div", "win__body" + (src.dataset.plain ? " win__body--plain" : ""));
		while (src.firstChild) content.appendChild(src.firstChild);
		frame.appendChild(content);

		if (src.dataset.status) {
			var status = el("div", "win__status");
			src.dataset.status.split("|").forEach(function (part) {
				status.appendChild(el("span", null, part));
			});
			frame.appendChild(status);
		}

		area.appendChild(frame);

		var task = el("button", "task btn95");
		task.type = "button";
		task.hidden = true;
		task.innerHTML = useIcon(icon) + "<span>" + title + "</span>";
		task.addEventListener("click", function () {
			if (frame.hidden) openWin(id);
			else if (frame.classList.contains("is-active")) minimizeWin(id);
			else focusWin(id);
		});
		taskList.appendChild(task);

		var win = {
			id: id,
			el: frame,
			task: task,
			spec: {
				w: parseInt(src.dataset.w, 10) || 520,
				h: parseInt(src.dataset.h, 10) || 400,
				x: src.dataset.x ? parseInt(src.dataset.x, 10) : null,
				y: src.dataset.y ? parseInt(src.dataset.y, 10) : null
			}
		};
		windows[id] = win;

		bar.addEventListener("click", function (ev) {
			var btn = ev.target.closest("[data-act]");
			if (!btn) return;
			var act = btn.dataset.act;
			if (act === "close") closeWin(id);
			else if (act === "min") minimizeWin(id);
			else toggleMax(id);
		});

		frame.addEventListener("pointerdown", function () {
			focusWin(id);
		});

		makeDraggable(win);
		return win;
	}

	/* ---------- desktop icons --------------------------------------------- */

	function buildIcons(sources, list) {
		sources.forEach(function (src) {
			var href = src.dataset.href;
			var node = el(href ? "a" : "button", "icon");
			if (href) {
				node.href = href;
			} else {
				node.type = "button";
			}
			node.innerHTML = useIcon(src.dataset.icon || "folder") +
				'<span class="icon__label">' + src.dataset.label + "</span>";

			function select() {
				list.querySelectorAll(".icon").forEach(function (n) {
					n.classList.remove("is-selected");
				});
				node.classList.add("is-selected");
			}

			function activate() {
				if (href) window.location.href = href;
				else openWin(src.dataset.window);
			}

			node.addEventListener("click", function (ev) {
				select();
				if (coarse) {
					ev.preventDefault();
					activate();
				}
			});
			node.addEventListener("dblclick", function (ev) {
				ev.preventDefault();
				activate();
			});
			node.addEventListener("keydown", function (ev) {
				if (ev.key === "Enter" || ev.key === " ") {
					ev.preventDefault();
					activate();
				}
			});

			var item = el("li");
			item.appendChild(node);
			list.appendChild(item);
		});
	}

	/* ---------- chrome ----------------------------------------------------- */

	function buildChrome(desktop) {
		area = el("div", "desktop__area");
		desktop.appendChild(area);

		var icons = el("ul", "icons");
		area.appendChild(icons);

		var taskbar = el("div", "taskbar");
		startBtn = el("button", "start btn95");
		startBtn.type = "button";
		startBtn.setAttribute("aria-expanded", "false");
		startBtn.innerHTML = useIcon("flag") + "<span>Start</span>";
		taskbar.appendChild(startBtn);

		taskList = el("div", "tasks");
		taskbar.appendChild(taskList);

		var tray = el("div", "tray");
		tray.innerHTML = '<span id="clock">--:--</span>';
		taskbar.appendChild(tray);
		desktop.appendChild(taskbar);

		startMenu = el("nav", "startmenu");
		startMenu.hidden = true;
		startMenu.setAttribute("aria-label", "Start menu");
		startMenu.innerHTML =
			'<div class="startmenu__rail"><b>Isquick<i>96</i></b></div><ul></ul>';
		desktop.appendChild(startMenu);

		return icons;
	}

	function buildStartMenu(items) {
		var ul = startMenu.querySelector("ul");
		items.forEach(function (src) {
			var li = el("li");
			var href = src.dataset.href;
			var node = el(href ? "a" : "button");
			if (href) {
				node.href = href;
				if (src.dataset.external) {
					node.target = "_blank";
					node.rel = "noopener";
				}
			} else {
				node.type = "button";
				node.addEventListener("click", function () {
					openWin(src.dataset.window);
					toggleStart(false);
				});
			}
			node.innerHTML = useIcon(src.dataset.icon || "doc") + "<span>" + src.dataset.label + "</span>";
			li.appendChild(node);
			ul.appendChild(li);
		});
	}

	function toggleStart(open) {
		var next = open != null ? open : startMenu.hidden;
		startMenu.hidden = !next;
		startBtn.setAttribute("aria-expanded", String(next));
	}

	function startClock() {
		var clock = doc.getElementById("clock");
		function tick() {
			clock.textContent = new Date().toLocaleTimeString([], {
				hour: "numeric",
				minute: "2-digit"
			});
		}
		tick();
		setInterval(tick, 20000);
	}

	/* ---------- hamster dance --------------------------------------------- */

	var hamsterAudio = null;
	var hamsterTimer = null;
	var hamsterStep = 0;
	var hamsterDancing = true;
	var hamsterMusic = false;

	var HAMSTER_NOTES = [
		523.25, 523.25, 659.25, 523.25, 783.99, 698.46,
		523.25, 523.25, 659.25, 523.25, 880.0, 783.99,
		523.25, 523.25, 1046.5, 830.61, 783.99, 698.46, 659.25,
		932.33, 932.33, 830.61, 783.99, 880.0, 783.99
	];

	function ensureHamsterAudio() {
		var Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return null;
		if (!hamsterAudio) hamsterAudio = new Ctx();
		if (hamsterAudio.state === "suspended") hamsterAudio.resume();
		return hamsterAudio;
	}

	function beepHamster(freq, dur) {
		var ctx = ensureHamsterAudio();
		if (!ctx) return;
		var osc = ctx.createOscillator();
		var gain = ctx.createGain();
		osc.type = "square";
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(0.045, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + dur);
	}

	function tickHamsterMusic() {
		if (!hamsterMusic || !hamsterDancing) return;
		beepHamster(HAMSTER_NOTES[hamsterStep % HAMSTER_NOTES.length], 0.14);
		hamsterStep += 1;
	}

	function startHamsterMusic() {
		hamsterMusic = true;
		if (hamsterTimer) return;
		tickHamsterMusic();
		hamsterTimer = setInterval(tickHamsterMusic, 180);
	}

	function stopHamsterMusic() {
		hamsterMusic = false;
		if (hamsterTimer) {
			clearInterval(hamsterTimer);
			hamsterTimer = null;
		}
		hamsterStep = 0;
	}

	function stopHamsterDance() {
		stopHamsterMusic();
		var root = doc.getElementById("hamster-dance");
		if (!root) return;
		var musicBtn = root.querySelector("[data-hamster='music']");
		if (musicBtn) {
			musicBtn.textContent = "Music: Off";
			musicBtn.setAttribute("aria-pressed", "false");
		}
	}

	function initHamsterDance() {
		var root = doc.getElementById("hamster-dance");
		if (!root || root.dataset.ready) return;
		root.dataset.ready = "1";

		var danceBtn = root.querySelector("[data-hamster='dance']");
		var musicBtn = root.querySelector("[data-hamster='music']");
		var stage = root.querySelector(".hamster-dance__stage");

		function setDancing(on) {
			hamsterDancing = on;
			root.classList.toggle("is-dancing", on && !reduceMotion);
			if (danceBtn) danceBtn.textContent = on ? "Chill out" : "Dance!";
			if (!on) stopHamsterMusic();
			else if (musicBtn && musicBtn.getAttribute("aria-pressed") === "true") {
				startHamsterMusic();
			}
		}

		setDancing(!reduceMotion);

		if (danceBtn) {
			danceBtn.addEventListener("click", function () {
				setDancing(!hamsterDancing);
			});
		}

		if (musicBtn) {
			musicBtn.addEventListener("click", function () {
				if (hamsterMusic) {
					stopHamsterMusic();
					musicBtn.textContent = "Music: Off";
					musicBtn.setAttribute("aria-pressed", "false");
				} else {
					if (!hamsterDancing) setDancing(true);
					startHamsterMusic();
					musicBtn.textContent = "Music: On";
					musicBtn.setAttribute("aria-pressed", "true");
				}
			});
		}

		if (stage) {
			stage.addEventListener("click", function () {
				if (!hamsterDancing) setDancing(true);
			});
		}
	}

	/* ---------- init ------------------------------------------------------- */

	function init() {
		body.insertAdjacentHTML("afterbegin", SPRITE);

		var desktop = doc.getElementById("desktop");
		var iconList = buildChrome(desktop);

		var iconSources = Array.prototype.slice.call(
			doc.querySelectorAll("#icons-source > li")
		);
		var winSources = Array.prototype.slice.call(
			doc.querySelectorAll("#windows-source > article")
		);
		var menuSources = Array.prototype.slice.call(
			doc.querySelectorAll("#startmenu-source > li")
		);

		winSources.forEach(buildWindow);
		buildIcons(iconSources, iconList);
		buildStartMenu(menuSources);
		startClock();
		initHamsterDance();

		area.addEventListener("pointerdown", function (ev) {
			if (!ev.target.closest(".icon") && !ev.target.closest(".win")) {
				iconList.querySelectorAll(".icon").forEach(function (n) {
					n.classList.remove("is-selected");
				});
			}
			toggleStart(false);
		});

		startBtn.addEventListener("click", function (ev) {
			ev.stopPropagation();
			toggleStart();
		});

		doc.addEventListener("keydown", function (ev) {
			if (ev.key === "Escape") toggleStart(false);
		});

		function syncCompact() {
			body.classList.toggle("is-compact", isCompact());
			Object.keys(windows).forEach(function (id) {
				var win = windows[id];
				if (win.el.hidden) return;
				if (isCompact()) win.el.classList.add("is-max");
			});
		}

		syncCompact();
		window.addEventListener("resize", syncCompact);

		function showDesktop() {
			body.classList.add("is-on");
			desktop.hidden = false;
			winSources.forEach(function (src) {
				if (src.hasAttribute("data-open")) {
					openWin(src.dataset.id);
					if (src.hasAttribute("data-max") && !isCompact()) {
						windows[src.dataset.id].el.classList.add("is-max");
					}
				}
			});
		}

		var alreadyBooted = false;
		try { alreadyBooted = sessionStorage.getItem(BOOTED_KEY) === "1"; } catch (e) {}

		if (alreadyBooted) {
			doc.getElementById("boot").hidden = true;
			doc.getElementById("splash").hidden = true;
			showDesktop();
		} else {
			body.classList.add("is-on");
			runBoot(showDesktop);
		}
	}

	if (doc.readyState === "loading") {
		doc.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
