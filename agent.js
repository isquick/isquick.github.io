/*
 * David Isquick — personal agent
 *
 * A scripted chat agent. It reads every <section class="kb"> in index.html
 * and answers questions by routing them to the best-matching section.
 * No server and no AI model: every answer is David's own content, so it
 * never makes anything up. To teach it something new, add a section.
 */
(function () {
	"use strict";

	var app = document.getElementById("app");
	var log = document.getElementById("log");
	var chips = document.getElementById("chips");
	var form = document.getElementById("composer");
	var input = document.getElementById("input");
	var dialog = document.getElementById("topics");
	var topicsList = document.getElementById("topics-list");

	var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	var busy = false;
	var queue = [];

	// ---------- knowledge base ----------

	var topics = {};
	var order = [];
	Array.prototype.forEach.call(document.querySelectorAll(".kb"), function (s) {
		topics[s.id] = {
			id: s.id,
			ask: s.dataset.ask,
			label: s.dataset.label,
			group: s.dataset.group || "More",
			keys: (s.dataset.keys || "").split(",").map(function (k) { return k.trim().toLowerCase(); }).filter(Boolean),
			next: (s.dataset.next || "").split(",").map(function (k) { return k.trim(); }).filter(function (k) { return topics[k] || document.getElementById(k); }),
			node: s
		};
		order.push(s.id);
	});

	var STARTERS = ["about", "portfolio", "muttgrams", "samples", "contact"];

	// ---------- routing ----------

	function normalize(text) {
		return " " + text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9./ ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
	}

	function route(text) {
		var norm = normalize(text);
		var tokens = norm.trim().split(" ");
		var best = null, bestScore = 0;

		order.forEach(function (id) {
			var t = topics[id], score = 0;
			t.keys.forEach(function (k, i) {
				// The first key is the topic's main subject and counts double.
				var boost = i === 0 ? 2 : 1;
				if (k.indexOf(" ") !== -1) {
					if (norm.indexOf(" " + k + " ") !== -1) score += 3 * boost;
				} else if (tokens.indexOf(k) !== -1) {
					score += 2 * boost;
				} else if (k.length >= 5 && tokens.some(function (w) {
					return w.indexOf(k) === 0 || (w.length >= 5 && k.indexOf(w) === 0);
				})) {
					score += 1;
				}
			});
			if (score > bestScore) { best = id; bestScore = score; }
		});
		return best;
	}

	// Short replies that don't need a knowledge-base section.
	var SMALL_TALK = [
		{ re: /^(hi|hey|hello|yo|hiya|howdy|sup|good (morning|afternoon|evening))\b/,
		  say: ["Hey! 👋 What would you like to know about David?"], chips: STARTERS },
		{ re: /\b(thanks|thank you|thx|ty|cheers|appreciate)\b/,
		  say: ["Anytime. Anything else you want to know?"], chips: ["contact", "samples", "muttgrams"] },
		{ re: /^(bye|goodbye|see ya|later|cya)\b/,
		  say: ["Thanks for stopping by. If you want the real David, he&#8217;s at <a href=\"mailto:david.isquick@gmail.com\">david.isquick@gmail.com</a>."], chips: ["contact"] },
		{ re: /\b(are you (real|human|a bot|an ai|ai|chatgpt|claude)|is this (ai|a bot|real)|who built you|how do you work)\b|^what are you\??$/,
		  say: ["I&#8217;m David&#8217;s scripted agent. I run entirely in your browser, and every answer is something David wrote himself, so I won&#8217;t make anything up.",
		        "If I don&#8217;t know something, the fastest route is to email him."], chips: ["contact", "about", "retro"] },
		{ re: /^(\/|help|menu|topics|options|commands|\?|what can (you|i) (do|ask)|what do you know)/,
		  say: ["Here&#8217;s everything I can tell you about. Tap one, or just type a question."], chips: null, menu: true }
	];

	// ---------- rendering ----------

	function el(tag, cls, html) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (html != null) n.innerHTML = html;
		return n;
	}

	function scrollDown() {
		log.scrollTo({ top: log.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
	}

	function addRow(who, content) {
		var row = el("div", "row row--" + who);
		if (who === "bot") row.appendChild(el("span", "avatar avatar--sm", "DI")).setAttribute("aria-hidden", "true");
		var bubble = el("div", "bubble bubble--" + who);
		if (typeof content === "string") bubble.innerHTML = content;
		else bubble.appendChild(content);
		row.appendChild(bubble);
		log.appendChild(row);
		// Long answers: show their start, not their end.
		if (who === "bot" && row.offsetHeight > log.clientHeight * 0.6) {
			log.scrollTo({ top: row.offsetTop - 12, behavior: reduceMotion ? "auto" : "smooth" });
		} else {
			scrollDown();
		}
		return bubble;
	}

	function typing() {
		var row = el("div", "row row--bot row--typing");
		row.setAttribute("aria-hidden", "true");
		row.appendChild(el("span", "avatar avatar--sm", "DI"));
		row.appendChild(el("div", "bubble bubble--bot typing", "<i></i><i></i><i></i>"));
		log.appendChild(row);
		scrollDown();
		return row;
	}

	function delayFor(len) {
		if (reduceMotion) return 0;
		return Math.min(1100, 380 + len * 0.9);
	}

	// Copy a knowledge-base section into a chat bubble. In-page links (#topic)
	// become follow-up questions instead of jumps.
	function renderTopic(t) {
		var frag = document.createDocumentFragment();
		Array.prototype.forEach.call(t.node.children, function (child) {
			frag.appendChild(child.cloneNode(true));
		});
		Array.prototype.forEach.call(frag.querySelectorAll("a[href^='#']"), function (a) {
			var id = a.getAttribute("href").slice(1);
			if (topics[id]) a.dataset.topic = id;
		});
		Array.prototype.forEach.call(frag.querySelectorAll("a[href^='http']"), function (a) {
			a.target = "_blank";
			a.rel = "noopener";
		});
		return frag;
	}

	// Bot messages are delivered one at a time with a typing indicator.
	function botSay(parts, after) {
		queue.push({ parts: parts, after: after });
		if (!busy) drain();
	}

	function drain() {
		var job = queue.shift();
		if (!job) { busy = false; return; }
		busy = true;
		var i = 0;
		(function next() {
			if (i >= job.parts.length) {
				if (job.after) job.after();
				drain();
				return;
			}
			var part = job.parts[i++];
			var len = typeof part === "string" ? part.length : (part.textContent || "").length;
			var dots = typing();
			setTimeout(function () {
				dots.remove();
				addRow("bot", part);
				next();
			}, delayFor(len));
		})();
	}

	function setChips(ids, exclude) {
		chips.innerHTML = "";
		chips.scrollLeft = 0;
		(ids || []).forEach(function (id) {
			if (!topics[id] || id === exclude) return;
			var b = el("button", "chip", topics[id].ask);
			b.type = "button";
			b.dataset.topic = id;
			chips.appendChild(b);
		});
		var more = el("button", "chip chip--menu", "All topics");
		more.type = "button";
		more.dataset.menu = "1";
		chips.appendChild(more);
	}

	function track(id) {
		if (typeof window.gtag === "function") window.gtag("event", "agent_question", { topic: id || "unknown" });
	}

	function setUrl(id) {
		var url = id ? "#" + id : window.location.pathname + window.location.search;
		try { history.replaceState(null, "", url); } catch (e) { /* file:// or sandboxed */ }
	}

	// ---------- conversation ----------

	function answer(id) {
		var t = topics[id];
		setUrl(id);
		track(id);
		botSay([renderTopic(t)], function () { setChips(t.next, id); });
	}

	function ask(text, forcedId) {
		text = (text || "").trim();
		if (!text) return;
		addRow("user", escapeHtml(text));
		input.value = "";

		if (forcedId && topics[forcedId]) return answer(forcedId);

		var lower = text.toLowerCase();
		for (var i = 0; i < SMALL_TALK.length; i++) {
			var st = SMALL_TALK[i];
			if (st.re.test(lower)) {
				track("smalltalk");
				botSay(st.say, function () {
					if (st.menu) setChips(order.slice(0, 8));
					else setChips(st.chips);
				});
				if (st.menu) openTopics();
				return;
			}
		}

		var id = route(text);
		if (id) return answer(id);

		track(null);
		botSay([
			"I don&#8217;t have an answer for that one. I only know what&#8217;s on David&#8217;s site.",
			"Try one of these, or email him at <a href=\"mailto:david.isquick@gmail.com\">david.isquick@gmail.com</a>."
		], function () { setChips(STARTERS); });
	}

	function escapeHtml(s) {
		return s.replace(/[&<>"']/g, function (c) {
			return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
		});
	}

	function greet(thenId, thenText) {
		log.innerHTML = "";
		queue = [];
		var hello = [
			"Hi, I&#8217;m David Isquick&#8217;s personal agent. 👋",
			"Ask me anything about David: his career, launches, work samples, his app Muttgrams, or how to reach him. I answer in his own words."
		];
		if (thenId && topics[thenId]) {
			botSay(hello, function () { ask(topics[thenId].ask, thenId); });
		} else if (thenText) {
			botSay(hello, function () { ask(thenText); });
		} else {
			botSay(hello, function () { setChips(STARTERS); });
		}
	}

	// ---------- topics menu ----------

	function buildTopics() {
		var groups = {};
		var groupOrder = [];
		order.forEach(function (id) {
			var g = topics[id].group;
			if (!groups[g]) { groups[g] = []; groupOrder.push(g); }
			groups[g].push(id);
		});
		groupOrder.forEach(function (g) {
			topicsList.appendChild(el("h3", null, g));
			var ul = el("ul");
			groups[g].forEach(function (id) {
				var li = el("li");
				var b = el("button", "topic", "<strong>" + topics[id].label + "</strong><span>" + topics[id].ask + "</span>");
				b.type = "button";
				b.dataset.topic = id;
				li.appendChild(b);
				ul.appendChild(li);
			});
			topicsList.appendChild(ul);
		});
	}

	function openTopics() {
		if (typeof dialog.showModal === "function") { if (!dialog.open) dialog.showModal(); }
		else dialog.setAttribute("open", "");
	}

	function closeTopics() {
		if (typeof dialog.close === "function") dialog.close();
		else dialog.removeAttribute("open");
	}

	// ---------- events ----------

	form.addEventListener("submit", function (e) {
		e.preventDefault();
		if (input.value.trim() === "/") { input.value = ""; return openTopics(); }
		ask(input.value);
	});

	input.addEventListener("input", function () {
		if (input.value === "/") { input.value = ""; openTopics(); }
	});

	document.addEventListener("click", function (e) {
		var target = e.target.closest("[data-topic], [data-menu]");
		if (!target) return;
		e.preventDefault();
		if (target.dataset.menu) return openTopics();
		var id = target.dataset.topic;
		if (dialog.open) closeTopics();
		ask(topics[id].ask, id);
	});

	dialog.addEventListener("click", function (e) {
		if (e.target === dialog) closeTopics(); // backdrop
	});
	document.getElementById("topics-btn").addEventListener("click", openTopics);
	document.getElementById("topics-close").addEventListener("click", closeTopics);
	document.getElementById("restart-btn").addEventListener("click", function () {
		setUrl(null);
		greet();
	});

	window.addEventListener("hashchange", function () {
		var id = window.location.hash.slice(1);
		if (topics[id]) ask(topics[id].ask, id);
	});

	// ---------- boot ----------

	buildTopics();
	app.hidden = false;
	var startId = decodeURIComponent(window.location.hash.slice(1));
	var params = new URLSearchParams(window.location.search);
	greet(topics[startId] ? startId : null, params.get("ask"));
	if (window.matchMedia("(pointer: fine)").matches) input.focus({ preventScroll: true });
})();
