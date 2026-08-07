/* =========================================================================
   app.js — New Level demo
   Pages: landing (index) · properties (list) · property (detail)
   Dependency-free. Renders from content.js.
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------- utilities ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  let currentCurrency = "USD";
  let currentLang = "en";
  const cur = () => (typeof CURRENCIES !== "undefined" && CURRENCIES[currentCurrency]) || { symbol: "$", rate: 1 };

  /* ---- Translations (UI chrome) ---- */
  function translateEl(elm, lang) {
    let base = elm.getAttribute("data-en");
    if (elm.childElementCount === 0) {
      if (base == null) { base = elm.textContent.trim(); if (!base) return; elm.setAttribute("data-en", base); }
      elm.textContent = lang === "en" ? base : ((I18N[base] && I18N[base][lang]) || base);
    } else {
      let tn = null;
      for (const c of elm.childNodes) { if (c.nodeType === 3 && c.textContent.trim()) { tn = c; break; } }
      if (!tn) return;
      if (base == null) { base = tn.textContent.trim(); if (!base) return; elm.setAttribute("data-en", base); }
      const tr = lang === "en" ? base : ((I18N[base] && I18N[base][lang]) || base);
      if (tr !== base) tn.textContent = " " + tr + " ";
    }
  }
  function translatePage(lang) {
    if (typeof I18N === "undefined") return;
    currentLang = lang;
    document.querySelectorAll(".nav__links a,.nav-dropdown a,h1,h2,h3,.menu-nav-link,.menu-label,.menu-panel__ctx,.menu-sec-link,.menu-sitenav__link,.menu-sitenav__children a,.foot-col h4,.foot-col a,.foot-pref span,.link-arrow,.audience-card__label,.tier-opt__t,.fees-col__title,.nearby__title,#navBackLabel,#saveLabel,.purpose-switch__btn,.event-type__chip,.package-card__t,.package-card__tagline,.package-card__badge,.quote__currency span,.category-tab,.search-tab")
      .forEach((e) => { if (e.childElementCount === 0) translateEl(e, lang); });
    document.querySelectorAll(".eyebrow,.field label,.search-bar__field label,.btn,.search-bar__reset,.sticky-book__cta,.report-trigger,.nav__back,.hero-tour-btn,.hero-tour-link,.hero-exit").forEach((e) => translateEl(e, lang));
    const kw = $("#searchKeyword");
    if (kw) { const base = "City, neighborhood, or keyword…"; kw.placeholder = lang === "en" ? base : ((I18N[base] && I18N[base][lang]) || base); }
    const rd = $("#rentDuration");
    if (rd) { const opt = rd.querySelector('option[value=""]'); if (opt) { const base = "Rental type…"; opt.textContent = lang === "en" ? base : ((I18N[base] && I18N[base][lang]) || base); } }
    document.documentElement.lang = lang;
  }
  const money = (n) => { const c = cur(); return c.symbol + Math.round(n * c.rate).toLocaleString("en-US"); };
  const money2 = (n) => { const c = cur(); return c.symbol + (n * c.rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
  const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const nightsBetween = (a, b) => Math.round((b - a) / 86400000);

  /* =========================================================================
     IMAGE OVERRIDES — click-to-upload replacements for any image on the site.
     Uploads are downscaled, stored in localStorage, and applied on every
     render. "Export" turns them into real files you drop into assets/ so the
     change becomes permanent for everyone (see README).
     ========================================================================= */
  const IMG_STORE_KEY = "nl_img_overrides";
  const IMG_API = "/api/images";
  let imgOverrides = {};
  try { imgOverrides = JSON.parse(localStorage.getItem(IMG_STORE_KEY) || "{}"); } catch (e) { imgOverrides = {}; }

  /* Images published to the shared backend (visible to everyone). */
  let serverKeys = new Set();
  let serverVersion = 0;
  let serverUp = false;
  const serverImgUrl = (key) => `${IMG_API}?key=${encodeURIComponent(key)}&v=${serverVersion}`;

  /* Shared (server) images win, so every visitor sees the same thing.
     Local uploads are a personal preview until they're published. */
  const overrideFor = (key) => {
    if (!key) return null;
    if (serverKeys.has(key)) return serverImgUrl(key);
    return imgOverrides[key] || null;
  };

  async function loadServerImages() {
    try {
      const r = await fetch(IMG_API, { headers: { accept: "application/json" } });
      if (!r.ok) return;
      const m = await r.json();
      if (!m || !Array.isArray(m.keys)) return;
      serverUp = true;
      serverVersion = m.version || 0;
      serverKeys = new Set(m.keys);
      applyImageOverrides();
    } catch (e) { /* no backend (e.g. Drop deploy) — local-only mode */ }
  }
  function persistOverrides() {
    try { localStorage.setItem(IMG_STORE_KEY, JSON.stringify(imgOverrides)); return true; }
    catch (e) { return false; }
  }

  /* Downscale an uploaded file to keep storage small (and pages fast). */
  function fileToDataURL(file, maxW, quality) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("read failed"));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("decode failed"));
        img.onload = () => {
          const scale = Math.min(1, maxW / img.naturalWidth);
          const w = Math.round(img.naturalWidth * scale);
          const h = Math.round(img.naturalHeight * scale);
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          const cx = c.getContext("2d");
          cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h);
          cx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  const adminToken = () => { try { return sessionStorage.getItem("nl_admin_token") || ""; } catch (e) { return ""; } };

  /* Publish an image so every visitor sees it. Returns true on success. */
  async function publishToServer(key, dataUrl) {
    if (!serverUp) return false;
    const token = adminToken();
    if (!token) return false;
    try {
      const r = await fetch(IMG_API, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ key, dataUrl }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast(err.error || "Upload rejected by the server.");
        return false;
      }
      const out = await r.json();
      serverVersion = out.version || Date.now();
      serverKeys.add(key);
      delete imgOverrides[key];            // now shared; no need for the local copy
      persistOverrides();
      applyImageOverrides();
      return true;
    } catch (e) { return false; }
  }

  /* Save an upload under `key`: publish it if we can, otherwise keep it local. */
  async function saveOverride(key, file) {
    const attempts = [[1600, 0.82], [1200, 0.78], [900, 0.7]];
    let data = null;
    for (const [w, q] of attempts) {
      data = await fileToDataURL(file, w, q);
      const prev = imgOverrides[key];
      imgOverrides[key] = data;
      if (persistOverrides()) { applyImageOverrides(); break; }
      if (prev) imgOverrides[key] = prev; else delete imgOverrides[key];
      data = null;
    }
    if (!data) { toast("Storage is full — publish or remove some images first."); return false; }

    if (serverUp && adminToken()) {
      const published = await publishToServer(key, data);
      return published ? "published" : true;
    }
    return true;
  }

  /* Apply stored overrides to every tagged slot currently in the DOM. */
  function applyImageOverrides() {
    document.querySelectorAll("[data-img-key]").forEach((node) => {
      const key = node.getAttribute("data-img-key");
      const data = overrideFor(key);
      if (!data) return;
      if (node.tagName === "IMG") { if (node.src !== data) node.src = data; }
      else { node.style.backgroundImage = `url("${data}")`; node.classList.add("has-upload"); }
    });
  }

  /* Photo URL for index "00".."38", honoring PHOTO_SOURCE (see content.js). */
  const cdnPhoto = (idx) => {
    const id = (typeof PHOTO_CDN_IDS !== "undefined") && PHOTO_CDN_IDS[parseInt(idx, 10)];
    return id ? PHOTO_CDN + id + PHOTO_CDN_SUFFIX : null;
  };
  const realPhoto = (idx) => {
    const up = overrideFor("photo:" + idx);          // your uploaded photo wins
    if (up) return up;
    if (typeof PHOTO_SOURCE !== "undefined" && PHOTO_SOURCE === "remote") {
      return cdnPhoto(idx) || (PHOTO_BASE + idx + ".jpg");
    }
    return PHOTO_BASE + idx + ".jpg";
  };

  /* If a local photo is missing (not uploaded yet), fall back to the CDN copy
     automatically. Capture phase — image 'error' events don't bubble. */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fellBack) return;
    const src = img.getAttribute("src") || "";
    const m = src.match(/assets\/photos\/(\d{2})\.jpg/);
    if (!m) return;
    const alt = cdnPhoto(m[1]);
    if (alt) { img.dataset.fellBack = "1"; img.src = alt; }
  }, true);

  function placeholderPhoto(label) {
    label = String(label).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='1000'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#141414'/><stop offset='1' stop-color='#242424'/></linearGradient></defs>
      <rect width='1600' height='1000' fill='url(#g)'/>
      <text x='800' y='500' fill='#72D35B' font-family='Poppins,sans-serif' font-size='34' font-weight='700' text-anchor='middle' letter-spacing='3'>PLACEHOLDER PHOTO — ${label}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------------- shared: the five audience icons ----------------
     handler: either a function (id)=>{} for in-page selection, or an
     object {href:(id)=>url} to render the icons as links. */
  function buildAudienceIcons(container, handler) {
    if (!container) return;
    container.innerHTML = "";
    AUDIENCE_ORDER.forEach((id) => {
      const a = AUDIENCES[id];
      const asLink = handler && typeof handler.href === "function";
      const node = document.createElement(asLink ? "a" : "button");
      node.className = "audience-card";
      if (asLink) { node.href = handler.href(id); }
      else { node.type = "button"; node.addEventListener("click", () => handler(id)); }
      node.setAttribute("aria-label", a.cardLabel);
      node.innerHTML = `
        <span class="audience-card__icon">${a.icon}</span>
        <span class="audience-card__label">${a.cardLabel}</span>
        <span class="audience-card__meta">${a.cardMeta}</span>
        <span class="audience-card__go">${asLink ? "Enter &rsaquo;" : "Select &rsaquo;"}</span>`;
      container.appendChild(node);
    });
  }

  /* ================================================================
     LANDING (index.html) — New Level brand
     ================================================================ */
  function renderLanding() {
    const line = $("#heroLine");
    if (line) line.textContent = NLG_BRAND.landingLine;
    const about = $("#aboutShortText");
    if (about) about.textContent = NLG_BRAND.aboutShort;
    buildSearchBox();
    buildEventCta();
    buildTeam();
    buildServices();
    buildTestimonials();
    initCarousel("#teamGrid", "#teamPrev", "#teamNext", "#teamDots");
    initCarousel("#testimonialsGrid", "#testimonialsPrev", "#testimonialsNext", "#testimonialsDots");
    translatePage(currentLang);
  }

  /* Homepage search bar — overlaid on the hero image. Tabs (For Sale/For
     Rent/Investment) replace the old chip row; picking "For Rent" reveals a
     Rental Type dropdown (Long-Term/Short-Term/Extended) that must be set
     before Search is enabled. The Neighborhood/beds/baths/price dropdowns
     are decorative (see SEARCH_FILTERS comment in content.js) — populated
     and selectable, but excluded from the submit params. Submits to
     properties.html?category=<id>&q=<keyword>, reusing the categorized
     properties list already built. */
  function buildSearchBox() {
    const tabs = $("#searchTabs"), durationField = $("#rentDurationField"), durationSelect = $("#rentDuration"),
      submitBtn = $("#searchSubmit"), keyword = $("#searchKeyword"), resetBtn = $("#searchReset");
    if (!tabs || typeof SEARCH_CATEGORIES === "undefined") return;
    let activeTop = null, activeChild = null;

    tabs.innerHTML = SEARCH_CATEGORIES.map((c) =>
      `<button type="button" class="search-tab" data-id="${c.id}" role="tab" aria-selected="false">${c.label}</button>`).join("");

    const selectedId = () => {
      const cat = SEARCH_CATEGORIES.find((c) => c.id === activeTop);
      return (cat && cat.children && cat.children.length) ? activeChild : activeTop;
    };

    function selectTab(id, btn) {
      activeTop = id; activeChild = null;
      tabs.querySelectorAll(".search-tab").forEach((b) => { const on = b === btn; b.classList.toggle("is-active", on); b.setAttribute("aria-selected", String(on)); });
      const cat = SEARCH_CATEGORIES.find((c) => c.id === id);
      if (cat.children && cat.children.length) {
        durationField.hidden = false;
        durationSelect.innerHTML = `<option value="">Rental type…</option>` +
          cat.children.map((c) => `<option value="${c.id}">${c.label}</option>`).join("");
        durationSelect.value = "";
      } else {
        durationField.hidden = true;
        durationSelect.innerHTML = "";
      }
      submitBtn.disabled = !selectedId();
    }
    tabs.querySelectorAll(".search-tab").forEach((b) => b.addEventListener("click", () => selectTab(b.getAttribute("data-id"), b)));
    durationSelect.addEventListener("change", () => { activeChild = durationSelect.value || null; submitBtn.disabled = !selectedId(); });

    const firstTab = tabs.querySelector(".search-tab");
    if (firstTab) selectTab(firstTab.getAttribute("data-id"), firstTab);

    const submit = () => {
      const id = selectedId();
      if (!id) return;
      const params = new URLSearchParams({ category: id });
      const q = (keyword.value || "").trim();
      if (q) params.set("q", q);
      location.href = "properties.html?" + params.toString();
    };
    submitBtn.addEventListener("click", submit);
    keyword.addEventListener("keydown", (e) => { if (e.key === "Enter" && !submitBtn.disabled) submit(); });

    // decorative filter dropdowns — populated for visual completeness, not wired into filtering yet
    const decorMap = { fNeighborhood: "neighborhood", fBeds: "beds", fBaths: "baths", fMinPrice: "minPrice", fMaxPrice: "maxPrice" };
    if (typeof SEARCH_FILTERS !== "undefined") {
      Object.keys(decorMap).forEach((elId) => {
        const sel = document.getElementById(elId);
        if (!sel) return;
        sel.innerHTML = SEARCH_FILTERS[decorMap[elId]].map((v) => `<option>${v}</option>`).join("");
      });
    }

    if (resetBtn) resetBtn.addEventListener("click", () => {
      keyword.value = "";
      Object.keys(decorMap).forEach((elId) => { const sel = document.getElementById(elId); if (sel) sel.selectedIndex = 0; });
      if (firstTab) selectTab(firstTab.getAttribute("data-id"), firstTab);
    });
  }

  function buildEventCta() {
    if (typeof EVENT_CTA === "undefined") return;
    const eb = $("#eventCtaEyebrow"), h = $("#eventCtaHeading"), s = $("#eventCtaSub"), btn = $("#eventCtaBtn");
    if (eb) eb.textContent = EVENT_CTA.eyebrow;
    if (h) h.textContent = EVENT_CTA.heading;
    if (s) s.textContent = EVENT_CTA.sub;
    if (btn) btn.textContent = EVENT_CTA.cta + " ›";
  }

  function renderAbout() {
    const t = $("#aboutLongText");
    if (t) t.textContent = NLG_BRAND.aboutLong;
    buildServices();
    buildCrossNav("#crossNavLinks", "about");
    translatePage(currentLang);
  }

  /* Pill links to the other dedicated pages — lets a visitor keep exploring
     from any landing page without backing out to the homepage first. */
  function buildCrossNav(sel, currentKey) {
    const box = $(sel);
    if (!box || typeof SITE_PAGES === "undefined") return;
    box.innerHTML = SITE_PAGES.filter((p) => p.key !== currentKey)
      .map((p) => `<a class="cross-nav__link" href="${p.href}">${p.label} &rsaquo;</a>`).join("");
  }

  /* ================================================================
     Dedicated landing pages: team / services / testimonials / events / contact
     ================================================================ */
  function renderTeamPage() {
    if (typeof PAGES !== "undefined") {
      $("#pageEyebrow").textContent = PAGES.team.eyebrow;
      $("#pageHeading").textContent = PAGES.team.heading;
      $("#pageSub").textContent = PAGES.team.sub;
      $("#pageIntro").textContent = PAGES.team.intro;
    }
    buildTeam("#teamGrid");
    initCarousel("#teamGrid", "#teamPrev", "#teamNext", "#teamDots");
    buildCrossNav("#crossNavLinks", "team");
    translatePage(currentLang);
  }

  function renderServicesPage() {
    if (typeof PAGES !== "undefined") {
      $("#pageEyebrow").textContent = PAGES.services.eyebrow;
      $("#pageHeading").textContent = PAGES.services.heading;
      $("#pageSub").textContent = PAGES.services.sub;
      $("#pageIntro").textContent = PAGES.services.intro;
    }
    const grid = $("#servicesGrid");
    if (grid && typeof SERVICES !== "undefined") {
      grid.innerHTML = "";
      const idFor = (t) => /brokerage/i.test(t) ? "brokerage" : /management/i.test(t) ? "management" : /investment/i.test(t) ? "investment" : /events/i.test(t) ? "events-service" : "";
      SERVICES.forEach((s) => {
        const card = el("div", "service-card");
        const id = idFor(s.t);
        if (id) card.id = id;
        card.innerHTML = `<div class="service-card__t">${s.t}</div><p class="service-card__d">${s.d}</p>`;
        grid.appendChild(card);
      });
    }
    buildCrossNav("#crossNavLinks", "services");
    translatePage(currentLang);
  }

  function renderTestimonialsPage() {
    if (typeof PAGES !== "undefined") {
      $("#pageEyebrow").textContent = PAGES.testimonials.eyebrow;
      $("#pageHeading").textContent = PAGES.testimonials.heading;
      $("#pageSub").textContent = PAGES.testimonials.sub;
    }
    buildTestimonials("#testimonialsGrid");
    initCarousel("#testimonialsGrid", "#testimonialsPrev", "#testimonialsNext", "#testimonialsDots");
    buildCrossNav("#crossNavLinks", "testimonials");
    translatePage(currentLang);
  }

  function renderEventsPage() {
    if (typeof PAGES !== "undefined") {
      $("#pageEyebrow").textContent = PAGES.events.eyebrow;
      $("#pageHeading").textContent = PAGES.events.heading;
      $("#pageSub").textContent = PAGES.events.sub;
    }
    buildCrossNav("#crossNavLinks", "events");
    translatePage(currentLang);
  }

  function renderContactPage() {
    if (typeof PAGES !== "undefined") {
      $("#pageEyebrow").textContent = PAGES.contact.eyebrow;
      $("#pageHeading").textContent = PAGES.contact.heading;
      $("#pageSub").textContent = PAGES.contact.sub;
      $("#pageIntro").textContent = PAGES.contact.intro;
    }
    wirePersistent();
    const mail = $("#contactEmail");
    if (mail) { mail.textContent = PROPERTY.inquiryEmail; mail.href = "mailto:" + PROPERTY.inquiryEmail; }
    buildCrossNav("#crossNavLinks", "contact");
    translatePage(currentLang);
  }

  function buildTeam(gridSel) {
    const grid = $(gridSel || "#teamGrid");
    if (!grid || typeof TEAM === "undefined") return;
    grid.innerHTML = "";
    TEAM.forEach((m, i) => {
      const initials = m.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      const card = el("div", "team-card");
      card.innerHTML = `
        <div class="team-card__photo${m.placeholder ? " is-ph" : ""}" data-img-key="team:${i}"><span>${m.placeholder ? "Photo" : initials}</span></div>
        <div class="team-card__name">${m.name}</div>
        <div class="team-card__role">${m.role}</div>
        ${m.motto ? `<p class="team-card__motto">“${m.motto}”</p>` : ""}`;
      grid.appendChild(card);
    });
  }

  /* Generic bounded left/right carousel — arrows scroll the track, disabling
     at each end. No infinite loop; scrolling left always lets you scroll
     back right. Used for Team + Testimonials on the landing and dedicated
     pages. Optionally takes a dots-container selector (renders position
     indicators) and nudges the track once when it first scrolls into view,
     as a visual hint that it's scrollable. */
  function initCarousel(trackSel, prevSel, nextSel, dotsSel) {
    const track = $(trackSel), prev = $(prevSel), next = $(nextSel);
    if (!track || !prev || !next) return;
    const dots = dotsSel ? $(dotsSel) : null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = () => Math.min(track.clientWidth * 0.9, 640);
    const pageCount = () => Math.max(1, Math.round((track.scrollWidth - track.clientWidth) / step()) + 1);
    const activePage = () => Math.min(pageCount() - 1, Math.round(track.scrollLeft / step()));

    function buildDots() {
      if (!dots) return;
      const n = pageCount();
      dots.innerHTML = n > 1 ? Array.from({ length: n }, (_, i) =>
        `<button type="button" class="carousel__dot" aria-label="Go to slide ${i + 1}"></button>`).join("") : "";
      dots.querySelectorAll(".carousel__dot").forEach((d, i) => d.addEventListener("click", () => track.scrollTo({ left: i * step(), behavior: "smooth" })));
    }
    prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    const update = () => {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      if (dots) dots.querySelectorAll(".carousel__dot").forEach((d, i) => d.classList.toggle("is-active", i === activePage()));
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => { buildDots(); update(); });
    buildDots();
    setTimeout(update, 0);

    // one-time "peek" nudge the first time the carousel scrolls into view —
    // signals it's interactive rather than a static row of cards
    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || track.scrollWidth <= track.clientWidth + 4) return;
          io.disconnect();
          track.scrollBy({ left: 88, behavior: "smooth" });
          setTimeout(() => track.scrollBy({ left: -88, behavior: "smooth" }), 700);
        });
      }, { threshold: 0.6 });
      io.observe(track);
    }
  }

  function buildServices(gridSel) {
    const grid = $(gridSel || "#servicesGrid");
    if (!grid || typeof SERVICES === "undefined") return;
    grid.innerHTML = "";
    SERVICES.forEach((s) => grid.appendChild(el("div", "service-card",
      `<div class="service-card__t">${s.t}</div><p class="service-card__d">${s.d}</p>`)));
  }

  function buildTestimonials(gridSel) {
    const grid = $(gridSel || "#testimonialsGrid");
    if (!grid || typeof TESTIMONIALS === "undefined") return;
    grid.innerHTML = "";
    TESTIMONIALS.forEach((tm) => {
      const initials = tm.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
      grid.appendChild(el("figure", "testimonial",
        `<div class="testimonial__stars">★★★★★</div>
         <blockquote class="testimonial__text">“${tm.text}”</blockquote>
         <figcaption class="testimonial__by"><span class="testimonial__avatar">${initials}</span>
           <span><span class="testimonial__name">${tm.name}</span><span class="testimonial__role">${tm.role}</span></span>
         </figcaption>`));
    });
  }

  /* ================================================================
     PROPERTY LIST (properties.html) — filtered by purpose
     ================================================================ */
  function realPropertyCard(hrefId) {
    const href = hrefId ? `property.html?a=${hrefId}` : "property.html";
    const card = el("a", "prop-card");
    card.href = href;
    card.innerHTML = `
      <div class="prop-card__media"><img data-img-key="photo:00" src="${realPhoto("00")}" alt="1331 NW 87th Street, Miami" loading="lazy"></div>
      <div class="prop-card__body">
        <div class="prop-card__eyebrow">New Level Executive House</div>
        <div class="prop-card__title">1331 NW 87th Street, Miami</div>
        <div class="prop-card__facts">
          <span>Sleeps up to 16</span><span>·</span><span>Full private residence</span><span>·</span><span>Miami-Dade</span>
        </div>
        <span class="prop-card__cta">View property &rsaquo;</span>
      </div>`;
    return card;
  }
  function otherPropertyCard(p, i) {
    return el("div", "other-card",
      `<div class="other-card__media" data-img-key="other:${i}">${p.soon ? '<span class="other-card__soon">Coming soon</span>' : ""}</div>
       <div class="other-card__body">
         <div class="other-card__title">${p.title}</div>
         <div class="other-card__meta">${p.meta}</div>
         <div class="other-card__rate">${p.rate}</div>
       </div>`);
  }

  /* Matches the homepage search box's keyword field against a property's
     visible text — soft/illustrative given this demo's tiny inventory, not
     a real search index. */
  function matchesKeyword(text, q) {
    return text.toLowerCase().includes(q.toLowerCase());
  }
  function categoryCards(catId) {
    const cards = [];
    if (PROPERTY.categories && PROPERTY.categories.includes(catId)) cards.push({ card: realPropertyCard(null), text: `${PROPERTY.address} ${PROPERTY.siteName}` });
    OTHER_PROPERTIES.forEach((p, i) => { if (p.categories && p.categories.includes(catId)) cards.push({ card: otherPropertyCard(p, i), text: `${p.title} ${p.meta}` }); });
    return cards;
  }

  function renderPropertyList() {
    const params = new URLSearchParams(location.search);
    let id = params.get("a");
    if (!AUDIENCES[id]) id = null;
    const a = id ? AUDIENCES[id] : null;
    const catId = params.get("category");
    const cat = !a && typeof PROPERTY_CATEGORIES !== "undefined" ? PROPERTY_CATEGORIES.find((c) => c.id === catId) : null;
    const q = (params.get("q") || "").trim();
    const list = $("#propertyList"), catsBox = $("#propertyCategories");

    if (a) {
      // purpose-filtered view: the one real property, no category browsing
      $("#plEyebrow").textContent = a.navLabel;
      $("#plTitle").textContent = `New Level homes for ${a.cardLabel}`;
      $("#plSub").textContent = `One property matches right now. Select it to see availability, amenities and to send an inquiry.`;
      list.hidden = false; list.innerHTML = "";
      list.appendChild(realPropertyCard(id));
      if (catsBox) catsBox.innerHTML = "";
    } else if (cat) {
      // search-box result: just this one category, with a way back to browse everything
      list.hidden = true;
      $("#plEyebrow").textContent = "Search results";
      $("#plTitle").textContent = cat.label;
      let entries = categoryCards(cat.id);
      let sub = cat.blurb;
      if (q) {
        const filtered = entries.filter((e) => matchesKeyword(e.text, q));
        if (filtered.length) { entries = filtered; sub = `Matching “${q}” in ${cat.label}.`; }
        else sub = `No exact matches for “${q}” — showing all ${cat.label.toLowerCase()} listings instead.`;
      }
      $("#plSub").textContent = sub;
      catsBox.innerHTML = "";
      const grid = el("div", "property-list");
      entries.forEach((e) => grid.appendChild(e.card));
      catsBox.appendChild(grid);
      catsBox.appendChild(el("p", "ph-caption", `<a class="link-arrow" href="properties.html">‹ Browse all categories</a>`));
    } else if (catsBox && typeof PROPERTY_CATEGORIES !== "undefined") {
      // default view: properties grouped by category
      list.hidden = true;
      catsBox.innerHTML = "";
      PROPERTY_CATEGORIES.forEach((c) => {
        const entries = categoryCards(c.id);
        if (!entries.length) return;
        const block = el("div", "category-block");
        block.id = c.id;
        block.innerHTML = `<div class="category-block__head"><h2 class="h-lg category-tab">${c.label}</h2><p class="muted">${c.blurb}</p></div>`;
        const grid = el("div", "property-list");
        entries.forEach((e) => grid.appendChild(e.card));
        block.appendChild(grid);
        catsBox.appendChild(block);
      });
    }
    translatePage(currentLang);
  }

  /* ================================================================
     PROPERTY (property.html)
     ================================================================ */
  const bookingState = {
    tier: null,
    view: null, view0: null,
    start: null, end: null,
    checkinTime: EVENT_DEFAULT_CHECKIN_MIN,
    checkoutTime: EVENT_DEFAULT_CHECKOUT_MIN,
    availability: null,
    package: "self",
    quote: null,
    audience: null,
    eventType: null,
    eventTypeOther: "",
  };

  const nextDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  function minToTime(mins) {
    let h = Math.floor(mins / 60) % 24, m = mins % 60;
    const ap = h < 12 ? "AM" : "PM";
    let h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ":" + ("0" + m).slice(-2) + " " + ap;
  }
  function fmtDateTime(d, mins) { return fmtDate(d) + " · " + minToTime(mins); }

  function renderProperty() {
    // static property-level content
    $("#brandIntro").textContent = NLG_BRAND.propertyIntro;
    $("#aboutText").textContent = NLG_BRAND.landingLine;

    wirePersistent();
    initHeroTour();
    buildHighlights();
    buildFees();
    buildNeighborhoodStatic();
    buildReviews();
    buildOtherProperties();
    initPhotoTour();
    initShareSave();
    initStickyBar();

    // purpose selector (in-page)
    buildAudienceIcons($("#purposeGrid"), (id) => setAudience(id, true));
    const changeBtn = $("#changePurpose");
    if (changeBtn) changeBtn.addEventListener("click", () => {
      $("#purposeGrid").hidden = false;
      $("#audienceSwitch").hidden = true;
      const etPicker = $("#eventTypePicker"); if (etPicker) etPicker.hidden = true;
      $("#purpose").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // booking (tier + calendar + quote + form)
    initBooking();

    // entry state
    const params = new URLSearchParams(location.search);
    const a = params.get("a");
    if (AUDIENCES[a]) { setBackTo(a); setAudience(a, false); }
    else { setBackTo(null); showPurposePrompt(); }
    translatePage(currentLang);
  }

  // visible in-page back arrow → previous screen
  function setBackTo(id) {
    const nb = $("#navBack"), nbl = $("#navBackLabel");
    if (!nb) return;
    if (id) { nb.href = "properties.html?a=" + id; if (nbl) nbl.textContent = "Properties"; }
    else { nb.href = "index.html"; if (nbl) nbl.textContent = "New Level"; }
    setTimeout(updateNavRightScroll, 0);
  }

  function showPurposePrompt() {
    $("#purposeGrid").hidden = false;
    $("#audienceSwitch").hidden = true;
    $("#audienceContent").hidden = true;
    const etPicker = $("#eventTypePicker"); if (etPicker) etPicker.hidden = true;
    const cta = $("#heroCta");
    if (cta) { cta.textContent = "Choose your purpose"; cta.setAttribute("href", "#purpose"); }
  }

  function setAudience(id, userInitiated) {
    const a = AUDIENCES[id];
    if (!a) return;
    bookingState.audience = a;
    const photos = (typeof AUDIENCE_PHOTOS !== "undefined" && AUDIENCE_PHOTOS[id]) || {};

    // Overview
    $("#ovHeadline").textContent = a.headline;
    $("#ovText").textContent = a.overview;
    const facts = $("#ovFacts"); facts.innerHTML = "";
    a.facts.forEach((f) => facts.appendChild(el("div", "fact",
      `<div class="fact__k">${f.k}</div><div class="fact__v">${f.v}</div>`)));
    $("#ovPhoto").src = photos.overview ? realPhoto(photos.overview) : placeholderPhoto(a.cardLabel);
    if (photos.overview) $("#ovPhoto").setAttribute("data-img-key", "photo:" + photos.overview);

    // What's included
    const inc = $("#included"); inc.innerHTML = "";
    a.included.forEach((it) => inc.appendChild(el("div", "amenity",
      `<span class="amenity__ic">${GLYPH.check}</span>
       <div><div class="amenity__t">${it.t}</div><p class="amenity__d">${it.d}</p></div>`)));

    // How it works
    const steps = $("#steps"); steps.innerHTML = "";
    a.steps.forEach((s, i) => steps.appendChild(el("div", "step",
      `<div class="step__n">${i + 1}</div><div class="step__t">${s.t}</div><p class="step__d">${s.d}</p>`)));

    // FAQ
    const faq = $("#faq"); faq.innerHTML = "";
    a.faqs.forEach((f) => {
      const item = el("div", "faq__item");
      const btn = el("button", "faq__q");
      btn.type = "button"; btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = `<span>${f.q}</span><span class="chev">${plusIcon()}</span>`;
      const ans = el("div", "faq__a", `<p>${f.a}</p>`);
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        ans.classList.toggle("is-open", !open);
      });
      item.appendChild(btn); item.appendChild(ans); faq.appendChild(item);
    });

    // audience-aware "what's nearby" + other-properties heading
    buildNearby(id);
    const oh = $("#otherHeading"); if (oh) oh.textContent = `Other properties for ${a.navLabel}.`;

    // reveal + switcher
    $("#audienceContent").hidden = false;
    $("#purposeGrid").hidden = true;
    $("#audienceSwitch").hidden = false;
    $("#switchLabel").textContent = a.cardLabel;
    updateWhatsApp(a.navLabel);

    // type-of-event picker — only relevant once "Private Events" is chosen
    const etPicker = $("#eventTypePicker");
    if (etPicker) etPicker.hidden = id !== "events";

    const cta = $("#heroCta");
    if (cta) { cta.textContent = "Check availability"; cta.setAttribute("href", "#booking"); }

    // reflect in URL (shareable) + point the back arrow at this purpose's list
    setBackTo(id);
    try { history.replaceState(null, "", "property.html?a=" + id + (editMode ? "&edit=1" : "")); } catch (e) {}

    updateQuote();
    translatePage(currentLang);

    if (userInitiated) {
      $("#overview").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* Preset chips + free-text field for "what kind of event is it" — only
     shown once the guest has chosen the Private Events purpose. */
  function buildEventTypePicker() {
    const chips = $("#eventTypeChips"), other = $("#eventTypeOther");
    if (!chips || typeof EVENT_TYPES === "undefined") return;
    if (chips.childElementCount) return; // build once
    const s = bookingState;
    EVENT_TYPES.forEach((t) => {
      const btn = el("button", "event-type__chip", t);
      btn.type = "button";
      btn.setAttribute("data-en", t);
      btn.addEventListener("click", () => {
        const active = s.eventType === t;
        chips.querySelectorAll(".event-type__chip").forEach((c) => c.classList.remove("is-active"));
        s.eventType = active ? null : t;
        if (s.eventType) btn.classList.add("is-active");
        updateCarried();
      });
      chips.appendChild(btn);
    });
    if (other) other.addEventListener("input", () => { s.eventTypeOther = other.value.trim(); updateCarried(); });
  }

  function plusIcon() {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
  }

  /* ---------------- persistent contact / floaters ---------------- */
  function updateWhatsApp(purposeLabel) {
    const msg = `Hi, I'm interested in 1331 NW 87th St (New Level Executive House)` +
      (purposeLabel ? ` for ${purposeLabel}.` : ".");
    const wa = `https://wa.me/${PROPERTY.agent.whatsapp}?text=${encodeURIComponent(msg)}`;
    document.querySelectorAll("[data-wa]").forEach((n) => (n.href = wa));
  }
  function wirePersistent() {
    updateWhatsApp(null);
    document.querySelectorAll("[data-agent-name]").forEach((n) => (n.textContent = PROPERTY.agent.name));
    document.querySelectorAll("[data-agent-role]").forEach((n) => (n.textContent = PROPERTY.agent.role));
    document.querySelectorAll("[data-agent-phone]").forEach((n) => {
      n.textContent = PROPERTY.agent.phone;
      if (n.tagName === "A") n.href = `tel:${PROPERTY.agent.phone.replace(/[^\d+]/g, "")}`;
    });
    document.querySelectorAll("[data-agent-initials]").forEach((n) => (n.textContent = PROPERTY.agent.initials));
    document.querySelectorAll("[data-parent-url]").forEach((n) => (n.href = PROPERTY.parentUrl));
    const connect = $("#floatConnect");
    if (connect) connect.addEventListener("click", (e) => {
      e.preventDefault();
      const target = $("#audienceContent").hidden ? $("#purpose") : $("#inquiry");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      const first = $("#f_name");
      if (first && !$("#audienceContent").hidden) setTimeout(() => first.focus(), 500);
    });
  }

  /* ================================================================
     BOOKING: rate tier + calendar + quote + form
     ================================================================ */
  function initBooking() {
    const s = bookingState;
    const today = startOfDay(new Date());
    s.view0 = new Date(today.getFullYear(), today.getMonth(), 1);
    s.view = new Date(s.view0);
    s.availability = buildAvailability();
    s.package = "self";

    // tier options
    const opts = $("#tierOptions");
    opts.innerHTML = "";
    Object.values(RATE_TIERS).forEach((t) => {
      const priceLabel = t.id === "event" ? `${money(t.base)} flat` : `${money(t.perNight)} / night`;
      const label = el("label", "tier-opt");
      label.innerHTML = `
        <input type="radio" name="tier" value="${t.id}">
        <span class="tier-opt__body">
          <span class="tier-opt__t">${t.label}</span>
          <span class="tier-opt__d">${priceLabel}</span>
          <span class="tier-opt__blurb">${t.blurb}</span>
        </span>`;
      label.querySelector("input").addEventListener("change", () => onTierChange(t.id));
      opts.appendChild(label);
    });

    // event packages (replaces the old per-service self/New-Level toggle)
    const packageList = $("#packageList");
    packageList.innerHTML = "";
    EVENT_PACKAGES.forEach((p) => {
      const incLabels = p.includes.map((sid) => { const svc = EVENT_ADDONS.find((a) => a.id === sid); return svc ? svc.label : null; }).filter(Boolean);
      const card = el("label", "package-card" + (p.popular ? " is-popular" : ""));
      card.innerHTML = `
        <input type="radio" name="eventPackage" value="${p.id}" ${p.id === s.package ? "checked" : ""}>
        ${p.popular ? `<span class="package-card__badge">Most popular</span>` : ""}
        <span class="package-card__t">${p.label}</span>
        <span class="package-card__price">${p.price ? `+${money(p.price)}` : "Included"}</span>
        <span class="package-card__tagline">${p.tagline}</span>
        ${incLabels.length ? `<span class="package-card__inc">Includes: ${incLabels.join(", ")}</span>` : ""}`;
      const priceEl = card.querySelector(".package-card__price");
      if (p.price) { priceEl.setAttribute("data-usd", p.price); priceEl.setAttribute("data-pre", "+"); }
      card.querySelector("input").addEventListener("change", () => { s.package = p.id; updateQuote(); });
      packageList.appendChild(card);
    });

    // type-of-event chips (Private Events purpose only)
    buildEventTypePicker();

    // calendar nav
    $("#calPrev").addEventListener("click", () => { s.view = addMonths(s.view, -1); drawCal(); });
    $("#calNext").addEventListener("click", () => { s.view = addMonths(s.view, 1); drawCal(); });

    // tax toggle
    const taxToggle = $("#taxToggle"), taxDetail = $("#taxDetail");
    taxToggle.addEventListener("click", () => {
      const open = taxToggle.getAttribute("aria-expanded") === "true";
      taxToggle.setAttribute("aria-expanded", String(!open));
      taxDetail.classList.toggle("is-open", !open);
    });

    // event check-in / check-out time options (30-min increments, full day)
    const ci = $("#checkinTime"), co = $("#checkoutTime");
    if (ci && co) {
      let opts = "";
      for (let m = 0; m < 1440; m += 30) opts += `<option value="${m}">${minToTime(m)}</option>`;
      ci.innerHTML = opts; co.innerHTML = opts;
      ci.value = String(s.checkinTime); co.value = String(s.checkoutTime);
      ci.addEventListener("change", () => { s.checkinTime = parseInt(ci.value, 10); updateQuote(); });
      co.addEventListener("change", () => { s.checkoutTime = parseInt(co.value, 10); updateQuote(); });
    }

    drawCal();
    initForm();
  }

  function onTierChange(tier) {
    const s = bookingState;
    s.tier = tier;
    s.start = null; s.end = null;
    // event packages + times visibility
    $("#eventPackages").hidden = tier !== "event";
    $("#timeSelect").hidden = tier !== "event";
    // labels
    if (tier === "event") {
      $("#calTitle").textContent = "Select your check-in & check-out";
      $("#calNote").textContent = "Pick your check-in date, then your check-out date (24-hour minimum — usually the next day). Set the times above.";
      $("#qDateInLabel").textContent = "Check-in";
      $("#qDateOutLabel").textContent = "Check-out";
    } else {
      $("#calTitle").textContent = "Select your dates";
      $("#calNote").textContent = "Pick a check-in date, then a check-out date. Ranges can't span an unavailable night.";
      $("#qDateInLabel").textContent = "Check-in";
      $("#qDateOutLabel").textContent = "Check-out";
    }
    setQuoteRateLabel(tier);
    drawCal();
  }

  function drawCal() {
    const s = bookingState;
    const root = $("#calMonths");
    root.innerHTML = "";
    [0, 1].forEach((off) => root.appendChild(buildMonth(addMonths(s.view, off))));
    const atStart = s.view.getFullYear() === s.view0.getFullYear() && s.view.getMonth() === s.view0.getMonth();
    $("#calPrev").disabled = atStart;
    updateQuote();
  }

  function onPickDate(date) {
    const s = bookingState;
    if (!s.tier) return; // must choose a rate type first
    if (s.tier === "event") {
      // 24-hour rental: check-in date + check-out date (defaults to next day)
      if (!s.start) { s.start = date; s.end = nextDay(date); }
      else if (date > s.start && !rangeHasBlocked(s.start, date)) { s.end = date; }
      else { s.start = date; s.end = nextDay(date); }
    } else {
      if (!s.start || (s.start && s.end)) { s.start = date; s.end = null; }
      else if (date <= s.start) { s.start = date; s.end = null; }
      else if (rangeHasBlocked(s.start, date)) { s.start = date; s.end = null; }
      else { s.end = date; }
    }
    drawCal();
  }

  function buildAvailability() {
    const today = startOfDay(new Date());
    return {
      isBlocked(d) {
        if (d < today) return true;
        const seed = Math.floor(d / 86400000);
        let h = (seed * 2654435761) % 97; if (h < 0) h += 97;
        return h < 19;
      },
    };
  }
  function rangeHasBlocked(start, end) {
    for (let d = new Date(start); d < end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
      if (bookingState.availability.isBlocked(d)) return true;
    }
    return false;
  }

  function buildMonth(monthDate) {
    const s = bookingState;
    const y = monthDate.getFullYear(), m = monthDate.getMonth();
    const wrap = el("div", "month");
    wrap.appendChild(el("div", "month__label", `${MONTHS[m]} ${y}`));
    const dow = el("div", "dow");
    DOW.forEach((d) => dow.appendChild(el("span", null, d)));
    wrap.appendChild(dow);
    const days = el("div", "days");
    const lead = new Date(y, m, 1).getDay();
    const total = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < lead; i++) days.appendChild(el("div", "day is-empty"));
    for (let dn = 1; dn <= total; dn++) {
      const date = new Date(y, m, dn);
      const btn = el("button", "day", String(dn));
      btn.type = "button";
      const blocked = s.availability.isBlocked(date);
      if (blocked) { btn.disabled = true; btn.setAttribute("aria-label", `${fmtDate(date)} — unavailable`); }
      else btn.setAttribute("aria-label", fmtDate(date));
      if (sameDay(date, startOfDay(new Date()))) { btn.classList.add("is-today"); btn.setAttribute("aria-current", "date"); }
      const st = s.start, en = s.end;
      const isStart = st && sameDay(date, st), isEnd = en && sameDay(date, en);
      if (isStart || isEnd) btn.classList.add("is-endpoint");
      else if (st && en && date > st && date < en) btn.classList.add("in-range");
      btn.addEventListener("click", () => onPickDate(date));
      days.appendChild(btn);
    }
    wrap.appendChild(days);
    return wrap;
  }

  /* ---------------- Quote (tier-aware) ---------------- */
  function updateQuote() {
    const s = bookingState;
    const body = $("#quoteCalc"), empty = $("#quoteEmpty"), submitBtn = $("#submitInquiry");
    const setEmpty = (msg) => {
      body.style.display = "none"; empty.style.display = "block"; empty.textContent = msg;
      if (submitBtn) submitBtn.disabled = true; s.quote = null; updateCarried();
      const cancelEl = $("#quoteCancel");
      if (cancelEl) cancelEl.textContent = "You won't be charged to inquire. Free cancellation until 1 day before your check-in date.";
      updateStickyBar();
    };

    if (!s.tier) { $("#quoteRate").textContent = "Select a rate type to begin"; return setEmpty("Choose a rate type above, then pick your date(s)."); }

    // dates display
    if (s.tier === "event") {
      $("#qDateIn").textContent = s.start ? fmtDateTime(s.start, s.checkinTime) : "—";
      $("#qDateOut").textContent = s.end ? fmtDateTime(s.end, s.checkoutTime) : "—";
    } else {
      $("#qDateIn").textContent = s.start ? fmtDate(s.start) : "—";
      $("#qDateOut").textContent = s.end ? fmtDate(s.end) : "—";
    }

    // required selections + validation
    let eventHours = null;
    if (s.tier === "event") {
      if (!s.start) return setEmpty("Select your check-in date.");
      if (!s.end) return setEmpty("Select your check-out date (24-hour minimum).");
      const ciDT = new Date(s.start); ciDT.setMinutes(s.checkinTime);
      const coDT = new Date(s.end); coDT.setMinutes(s.checkoutTime);
      eventHours = Math.round((coDT - ciDT) / 3600000);
      if (coDT - ciDT < EVENT_MIN_HOURS * 3600000)
        return setEmpty(`Event rentals are a ${EVENT_MIN_HOURS}-hour minimum — pick a check-out at least ${EVENT_MIN_HOURS} hours after check-in (e.g. 3:00 PM to 3:00 PM the next day).`);
    }
    if (s.tier === "stay" && (!s.start || !s.end)) return setEmpty(s.start ? "Select a check-out date." : "Select your check-in and check-out dates.");

    // base rental
    let rentalBase, subLabel;
    if (s.tier === "event") { rentalBase = RATE_TIERS.event.base; subLabel = `Venue — ${eventHours}-hour event rental (flat)`; }
    else { const nights = nightsBetween(s.start, s.end); rentalBase = RATE_TIERS.stay.perNight * nights; subLabel = `${money(RATE_TIERS.stay.perNight)} × ${nights} night${nights > 1 ? "s" : ""}`; }

    const taxLines = TAX.lines.map((t) => ({ label: t.label, rate: t.rate, amount: rentalBase * t.rate }));
    const taxTotal = taxLines.reduce((a, t) => a + t.amount, 0);
    const cdtAmount = rentalBase * TAX.cdt.rate;

    // selected event package (with demo price) folds into the total
    const pkg = s.tier === "event" ? EVENT_PACKAGES.find((p) => p.id === s.package) : null;
    const pkgIncludes = pkg ? pkg.includes.map((sid) => { const svc = EVENT_ADDONS.find((a) => a.id === sid); return svc ? svc.label : null; }).filter(Boolean) : [];
    const chosen = pkg && pkg.price ? [{ label: `${pkg.label} package`, price: pkg.price, includes: pkgIncludes }] : [];
    const addonsTotal = pkg ? pkg.price : 0;
    const totalNumeric = rentalBase + taxTotal + addonsTotal;

    empty.style.display = "none"; body.style.display = "block";
    $("#qSubLabel").textContent = subLabel;
    $("#qSubtotal").textContent = money2(rentalBase);

    // package line (real demo amount) + what it includes
    const qAddons = $("#qAddons"); qAddons.innerHTML = "";
    chosen.forEach((c) => {
      qAddons.appendChild(el("div", "qline",
        `<span class="muted">${c.label} <span class="ph-token">New Level</span></span><span>+${money2(c.price)}</span>`));
      if (c.includes && c.includes.length) qAddons.appendChild(el("div", "qline qline--sub",
        `<span class="muted">Includes: ${c.includes.join(", ")}</span><span></span>`));
    });

    $("#taxSummary").textContent = "Taxes (13%)";
    $("#taxSummaryAmt").textContent = money2(taxTotal);
    const detail = $("#taxLines"); detail.innerHTML = "";
    taxLines.forEach((t) => detail.appendChild(el("div", "qline",
      `<span class="muted">${t.label} (${(t.rate * 100).toFixed(0)}%)</span><span>${money2(t.amount)}</span>`)));
    $("#cdtLine").innerHTML = `<span class="muted">${TAX.cdt.label} (${(TAX.cdt.rate * 100).toFixed(0)}%)</span><span>${money2(cdtAmount)}</span>`;

    // total (real number incl. any selected services)
    $("#qTotal").textContent = money2(totalNumeric);
    $("#qFootnote").textContent = chosen.length
      ? "Estimate includes the selected New Level services. Rates are demo figures; total excludes the unresolved 3% CDT."
      : "Estimate only. Rates are placeholder; total excludes the unresolved 3% CDT.";

    // security deposit note — event tier only (refundable hold, not charged)
    const depEl = $("#quoteDeposit");
    if (depEl) {
      if (s.tier === "event" && typeof SECURITY_DEPOSIT !== "undefined") {
        depEl.hidden = false;
        depEl.innerHTML = `Plus a refundable <strong>${money2(SECURITY_DEPOSIT.amount)}</strong> security deposit — a hold placed before your date and released after check-out, not a charge today.`;
      } else { depEl.hidden = true; }
    }

    if (submitBtn) submitBtn.disabled = false;

    s.quote = {
      tier: s.tier, tierLabel: RATE_TIERS[s.tier].label,
      checkIn: s.tier === "event" ? fmtDateTime(s.start, s.checkinTime) : fmtDate(s.start),
      checkOut: s.tier === "event" ? fmtDateTime(s.end, s.checkoutTime) : fmtDate(s.end),
      nights: s.tier === "stay" ? nightsBetween(s.start, s.end) : null,
      hours: s.tier === "event" ? eventHours : null,
      rentalBase, taxLines, taxTotal, totalNumeric,
      cdt: { label: TAX.cdt.label, rate: TAX.cdt.rate, amount: cdtAmount },
      addons: chosen.map((c) => c.label),
      addonDetails: chosen.map((c) => `${c.label} (${money2(c.price)})`),
      addonsTotal,
      deposit: s.tier === "event" && typeof SECURITY_DEPOSIT !== "undefined" ? SECURITY_DEPOSIT.amount : 0,
    };
    // disclosure: free cancellation = 1 day before check-in
    const cancelEl = $("#quoteCancel");
    if (cancelEl) {
      const cutoff = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate() - 1);
      cancelEl.textContent = `You won't be charged to inquire. Free cancellation until ${fmtDate(cutoff)} — 1 day before check-in.`;
    }
    updateCarried();
    updateStickyBar();
  }

  /* ---------------- Inquiry form ---------------- */
  function initForm() {
    const form = $("#inquiryForm");
    if (!form) return;
    updateCarried();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = $("#formStatus");
      const s = bookingState;
      if (!s.audience) { status.style.color = "#B00020"; status.textContent = "Please choose a purpose first."; $("#purpose").scrollIntoView({ behavior: "smooth" }); return; }
      if (!s.quote) { status.style.color = "#B00020"; status.textContent = "Please choose a rate type and date(s) above."; $("#booking").scrollIntoView({ behavior: "smooth" }); return; }
      if (!form.reportValidity()) return;

      const data = Object.fromEntries(new FormData(form).entries());
      const q = s.quote;
      const payload = {
        property: "1331 NW 87th Street (New Level Executive House)",
        purpose: s.audience.cardLabel,
        event_type: s.audience.id === "events" ? (s.eventTypeOther || s.eventType || "not specified") : "n/a",
        rate_type: q.tierLabel,
        check_in: q.checkIn,
        check_out: q.checkOut,
        nights: q.nights,
        hours: q.hours,
        name: data.name,
        email: data.email,
        phone: data.phone,
        preferred_contact: data.contact_method,
        group_size: data.group_size,
        notes: data.notes || "",
        base: money2(q.rentalBase),
        taxes_13pct: money2(q.taxTotal),
        subtotal_plus_tax: money2(q.totalNumeric),
        services_requested: q.addons.length ? q.addonDetails.join(", ") : "guest self-providing",
        services_total: money2(q.addonsTotal || 0),
        security_deposit: q.deposit ? money2(q.deposit) + " refundable (hold)" : "n/a",
        cdt_unresolved_3pct: money2(q.cdt.amount),
        _subject: `Inquiry — ${s.audience.cardLabel} — ${q.tierLabel} — ${q.checkIn}`,
      };

      const submitBtn = $("#submitInquiry");
      const finishOK = (isDemo) => {
        form.hidden = true;
        $("#formDone").hidden = false;
        const dn = $("#demoDeliveryNote"); if (dn) dn.hidden = !isDemo;
        $("#formDone").scrollIntoView({ behavior: "smooth", block: "center" });
      };

      if (INQUIRY_ENDPOINT) {
        // Deliver straight to the team inbox / CRM — visitor stays on the page.
        submitBtn.disabled = true;
        const orig = submitBtn.textContent; submitBtn.textContent = "Sending…";
        fetch(INQUIRY_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((r) => { if (!r.ok) throw new Error("bad status"); finishOK(false); })
          .catch(() => {
            status.style.color = "#B00020";
            status.textContent = "Something went wrong sending your inquiry — please try again, or reach us directly.";
          })
          .finally(() => { submitBtn.disabled = false; submitBtn.textContent = orig; });
      } else {
        // Demo: no delivery endpoint connected yet — confirm, with an honest note.
        finishOK(true);
      }
    });

    const editBtn = $("#formEditAgain");
    if (editBtn) editBtn.addEventListener("click", () => { $("#formDone").hidden = true; form.hidden = false; });
  }

  function updateCarried() {
    const box = $("#carriedList");
    if (!box) return;
    const s = bookingState, q = s.quote;
    const rows = [
      ["Purpose", s.audience ? s.audience.cardLabel : "— choose a purpose —"],
      ["Rate type", q ? q.tierLabel : (s.tier ? RATE_TIERS[s.tier].label : "— choose above —")],
      [q && q.tier === "event" ? "Event date" : "Check-in", q ? q.checkIn : "—"],
      ["Check-out", q ? q.checkOut : "—"],
    ];
    const eventTypeVal = s.eventTypeOther || s.eventType;
    if (s.audience && s.audience.id === "events" && eventTypeVal) rows.splice(1, 0, ["Type of event", eventTypeVal]);
    if (q && q.addons.length) rows.push(["Services", q.addons.join(", ") + " (TBD)"]);
    rows.push(["Est. total", q ? (q.addons.length ? money2(q.totalNumeric) + " + services (TBD)" : money2(q.totalNumeric)) : "—"]);
    box.innerHTML = rows.map((r) => `<div><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join("");
  }

  /* ================================================================
     Slim sticky booking bar (property page)
     ================================================================ */
  function updateStickyBar() {
    const bar = $("#stickyBook"); if (!bar) return;
    const s = bookingState;
    const t = $("#sbTitle"), sub = $("#sbSub"), cta = $("#sbContinue");
    if (s.quote) {
      t.textContent = money2(s.quote.totalNumeric) + (s.quote.addons.length ? " + services" : "");
      sub.textContent = s.quote.tierLabel + " · " + s.quote.checkIn + " → " + s.quote.checkOut;
      cta.textContent = "Continue";
    } else {
      t.textContent = "Availability & quote";
      sub.textContent = s.tier ? "Pick your dates" : "Select your rate & dates";
      cta.textContent = "Choose your dates";
    }
  }
  function initStickyBar() {
    const bar = $("#stickyBook"); if (!bar) return;
    bar.hidden = false;                     // present; visibility via .is-visible
    updateStickyBar();
    $("#sbContinue").addEventListener("click", () => {
      const b = $("#booking"); if (b) b.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    const toggle = (show) => { bar.classList.toggle("is-visible", show); document.body.classList.toggle("sticky-open", show); };
    const onScroll = () => {
      const content = $("#audienceContent");
      if (!content || content.hidden) { toggle(false); return; }
      const vh = window.innerHeight;
      const hero = $(".a-hero"), booking = $("#booking"), tail = $(".agentbar") || $(".site-footer");
      const heroPassed = hero ? hero.getBoundingClientRect().bottom < 40 : true;
      const bookingReached = booking ? booking.getBoundingClientRect().top < vh * 0.7 : false;
      const tailNear = tail ? tail.getBoundingClientRect().top < vh - 40 : false;
      toggle(heroPassed && !bookingReached && !tailNear);
    };
    let ticking = false;
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    onScroll();
  }

  /* ================================================================
     Report a problem (all pages) — modal built on demand
     ================================================================ */
  function initReport() {
    const trigger = $("#reportTrigger");
    if (!trigger) return;
    const modal = el("div", "report-modal");
    modal.id = "reportModal"; modal.hidden = true;
    modal.innerHTML = `
      <div class="report-card" role="dialog" aria-modal="true" aria-label="Report a problem">
        <button class="report-close" id="reportClose" type="button" aria-label="Close">&times;</button>
        <h3 class="report-card__title">Report a problem</h3>
        <p class="muted">See something off — wrong info, a bug, or anything else? Tell us and we'll take a look.</p>
        <label class="report-field"><span>What's the issue?</span>
          <select id="reportType">
            <option>Incorrect listing info</option>
            <option>A bug or broken feature</option>
            <option>Report this listing</option>
            <option>Something else</option>
          </select>
        </label>
        <label class="report-field"><span>Details</span>
          <textarea id="reportText" rows="4" placeholder="What did you notice?"></textarea>
        </label>
        <label class="report-field"><span>Your email <span class="muted">(optional)</span></span>
          <input id="reportEmail" type="email" autocomplete="email" placeholder="you@example.com">
        </label>
        <button class="btn btn--solid btn--full" id="reportSubmit" type="button">Send report</button>
        <p class="form-status" id="reportStatus" role="status" aria-live="polite"></p>
      </div>`;
    document.body.appendChild(modal);

    const close = () => { modal.hidden = true; document.body.style.overflow = ""; };
    const open = () => { modal.hidden = false; document.body.style.overflow = "hidden"; setTimeout(() => modal.querySelector("#reportType").focus(), 50); };
    trigger.addEventListener("click", open);
    modal.querySelector("#reportClose").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (!modal.hidden && e.key === "Escape") close(); });

    modal.querySelector("#reportSubmit").addEventListener("click", () => {
      const status = modal.querySelector("#reportStatus");
      const type = modal.querySelector("#reportType").value;
      const details = modal.querySelector("#reportText").value.trim();
      const email = modal.querySelector("#reportEmail").value.trim();
      status.style.color = "";
      if (!details) { status.style.color = "#B00020"; status.textContent = "Please add a short description."; return; }
      const payload = { kind: "report", type, details, email, page: location.href };
      const done = () => { close(); toast("Thanks — your report was sent."); modal.querySelector("#reportText").value = ""; };
      const btn = modal.querySelector("#reportSubmit");
      if (typeof INQUIRY_ENDPOINT !== "undefined" && INQUIRY_ENDPOINT) {
        btn.disabled = true; const orig = btn.textContent; btn.textContent = "Sending…";
        fetch(INQUIRY_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) })
          .then((r) => { if (!r.ok) throw new Error(); done(); })
          .catch(() => { status.style.color = "#B00020"; status.textContent = "Couldn't send — please try again."; })
          .finally(() => { btn.disabled = false; btn.textContent = orig; });
      } else { done(); }
    });
  }

  /* ================================================================
     Gallery strip, nav logo, footer  (shared)
     ================================================================ */
  function buildGalleryStrip() {
    const strip = $("#galleryStrip");
    if (strip && typeof GALLERY_STRIP !== "undefined") {
      strip.innerHTML = "";
      GALLERY_STRIP.forEach((idx) => {
        const b = el("button", "gstrip__item");
        b.type = "button";
        b.setAttribute("aria-label", "Open photo tour");
        const img = el("img"); img.loading = "lazy"; img.src = realPhoto(idx);
        img.alt = "1331 NW 87th Street — property photo";
        b.appendChild(img);
        b.addEventListener("click", () => openLightbox(parseInt(idx, 10)));
        strip.appendChild(b);
      });
    }
    const link = $("#galleryLink");
    if (link) { link.href = GALLERY_URL; link.target = "_blank"; link.rel = "noopener"; }
  }

  /* ---------------- Hero photo tour (embedded carousel) ---------------- */
  let heroIndex = 0;
  let heroActive = false;
  function showHero() {
    const img = $("#aHeroImg"); if (!img) return;
    img.src = realPhoto(pad2(heroIndex));
    img.setAttribute("data-img-key", "photo:" + pad2(heroIndex));   // upload targets this photo
    const c = $("#heroCount"); if (c) c.textContent = (heroIndex + 1) + " / " + TOTAL_PHOTOS;
  }
  function setHeroTour(active) {
    heroActive = active;
    const hero = $(".a-hero"); if (hero) hero.classList.toggle("is-touring", active);
    const ex = $("#heroExit"); if (ex) ex.hidden = !active;
  }
  function heroStep(d) {
    // first arrow click enters the tour: text swipes away + gray filter clears,
    // revealing the current (front-of-property) image. Don't advance yet.
    if (!heroActive) { setHeroTour(true); return; }
    heroIndex = (heroIndex + d + TOTAL_PHOTOS) % TOTAL_PHOTOS; showHero();
  }
  function initHeroTour() {
    heroIndex = 0; showHero(); setHeroTour(false);
    const p = $("#heroPrev"), n = $("#heroNext"), v = $("#heroViewAll"), ex = $("#heroExit");
    if (p) p.addEventListener("click", () => heroStep(-1));
    if (n) n.addEventListener("click", () => heroStep(1));
    if (v) v.addEventListener("click", () => openLightbox(heroIndex));
    if (ex) ex.addEventListener("click", () => { setHeroTour(false); heroIndex = 0; showHero(); });
    const link = $("#galleryLink");
    if (link) { link.href = GALLERY_URL; link.target = "_blank"; link.rel = "noopener"; }
    initHeroIdleReset();
  }

  /* If the page sits idle for 3 minutes while the hero is mid-photo-tour,
     reset it back to the address/title view on the first photo — same
     reset as the Exit button. Only fires while actually touring; browsing
     the rest of the page (booking, form, etc.) still counts as activity,
     it just has nothing to reset since the hero isn't in tour mode there. */
  function initHeroIdleReset() {
    const IDLE_MS = 3 * 60 * 1000;
    let idleTimer = null;
    const reset = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (heroActive) { setHeroTour(false); heroIndex = 0; showHero(); }
      }, IDLE_MS);
    };
    ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"].forEach((evt) =>
      document.addEventListener(evt, reset, { passive: true }));
    reset();
  }

  /* ---------------- Photo-tour lightbox ---------------- */
  const TOTAL_PHOTOS = 39;
  let lbIndex = 0;
  const pad2 = (n) => ("0" + n).slice(-2);
  function showLightbox() {
    const img = $("#lbImg"); if (!img) return;
    img.src = realPhoto(pad2(lbIndex));
    $("#lbCount").textContent = (lbIndex + 1) + " / " + TOTAL_PHOTOS;
  }
  function openLightbox(i) {
    lbIndex = ((i % TOTAL_PHOTOS) + TOTAL_PHOTOS) % TOTAL_PHOTOS;
    const lb = $("#lightbox"); if (!lb) return;
    showLightbox(); lb.hidden = false; document.body.style.overflow = "hidden";
    $("#lbClose").focus();
  }
  function closeLightbox() {
    const lb = $("#lightbox"); if (!lb) return;
    lb.hidden = true; document.body.style.overflow = "";
  }
  function lbStep(d) { lbIndex = (lbIndex + d + TOTAL_PHOTOS) % TOTAL_PHOTOS; showLightbox(); }
  function initPhotoTour() {
    const lb = $("#lightbox"); if (!lb) return;
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", () => lbStep(-1));
    $("#lbNext").addEventListener("click", () => lbStep(1));
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") lbStep(-1);
      else if (e.key === "ArrowRight") lbStep(1);
    });
  }

  /* ---------------- Highlights / Fees / Neighborhood ---------------- */
  function buildHighlights() {
    const ul = $("#highlightsList");
    if (!ul || typeof HIGHLIGHTS === "undefined") return;
    ul.innerHTML = HIGHLIGHTS.map((h) =>
      `<li><span class="hl-ic">${GLYPH.check}</span><span>${h}</span></li>`).join("");
  }
  function buildFees() {
    if (typeof FEES_POLICIES === "undefined") return;
    const inc = $("#feesIncluded"), ex = $("#feesExtra"), rules = $("#feesRules"), cancel = $("#feesCancellation");
    if (inc) inc.innerHTML = FEES_POLICIES.included.map((x) => `<li>${x}</li>`).join("");
    if (ex) ex.innerHTML = FEES_POLICIES.extra.map((x) => `<li><span>${x.t}</span><span class="fee-val">${x.v}</span></li>`).join("");
    if (rules) rules.innerHTML = FEES_POLICIES.houseRules.map((x) =>
      `<li><span class="rule-t">${x.t}</span><span class="rule-d">${x.d}</span></li>`).join("");
    const rnote = $("#feesRulesNote"); if (rnote) rnote.textContent = FEES_POLICIES.rulesNote || "";
    const dep = $("#feesDeposit"); if (dep && typeof SECURITY_DEPOSIT !== "undefined") dep.textContent = SECURITY_DEPOSIT.blurb;
    if (cancel) cancel.textContent = FEES_POLICIES.cancellation;
  }
  function buildNeighborhoodStatic() {
    if (typeof NEIGHBORHOOD === "undefined") return;
    const blurb = $("#neighborhoodBlurb"); if (blurb) blurb.textContent = NEIGHBORHOOD.blurb;
    const q = encodeURIComponent(NEIGHBORHOOD.mapQuery);
    const frame = $("#mapFrame");
    // Google Maps embed with a location pin — no API key needed (output=embed)
    if (frame) frame.src = `https://www.google.com/maps?q=${q}&z=15&output=embed`;
    const map = $("#mapLink");
    if (map) map.href = "https://www.google.com/maps/search/?api=1&query=" + q;
    const addr = $("#mapAddr"); if (addr) addr.textContent = PROPERTY.address;
  }
  function buildNearby(id) {
    const list = $("#nearbyList");
    if (!list || typeof NEIGHBORHOOD === "undefined") return;
    const items = NEIGHBORHOOD.nearby[id] || [];
    list.innerHTML = items.map((x) => `<li>${x}</li>`).join("");
  }

  function buildReviews() {
    if (typeof REVIEWS === "undefined") return;
    const r = $("#revRating"); if (r) r.textContent = REVIEWS.rating;
    const c = $("#revCount"); if (c) c.textContent = REVIEWS.count;
    const how = $("#revHow"); if (how) how.textContent = REVIEWS.howItWorks;
    const grid = $("#reviewsGrid"); if (!grid) return;
    grid.innerHTML = "";
    REVIEWS.items.forEach((rv) => {
      const stars = "★★★★★".slice(0, rv.stars) + "☆☆☆☆☆".slice(0, 5 - rv.stars);
      grid.appendChild(el("div", "review",
        `<div class="review__stars" aria-label="${rv.stars} out of 5">${stars}</div>
         <p class="review__text">“${rv.text}”</p>
         <div class="review__by"><span class="review__name">${rv.name}</span><span class="review__meta">${rv.use} · ${rv.when}</span></div>`));
    });
  }

  function buildOtherProperties() {
    if (typeof OTHER_PROPERTIES === "undefined") return;
    const grid = $("#otherGrid"); if (!grid) return;
    grid.innerHTML = "";
    OTHER_PROPERTIES.forEach((p, i) => {
      grid.appendChild(el("div", "other-card",
        `<div class="other-card__media" data-img-key="other:${i}">${p.soon ? '<span class="other-card__soon">Coming soon</span>' : ""}</div>
         <div class="other-card__body">
           <div class="other-card__title">${p.title}</div>
           <div class="other-card__meta">${p.meta}</div>
           <div class="other-card__rate">${p.rate}</div>
         </div>`));
    });
  }

  /* ---------------- Share / Save ---------------- */
  function toast(msg) {
    let t = $("#toast");
    if (!t) { t = el("div", "toast"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    requestAnimationFrame(() => t.classList.add("is-show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.classList.remove("is-show"); setTimeout(() => (t.hidden = true), 250); }, 2400);
  }
  function initShareSave() {
    const shareBtn = $("#shareBtn"), saveBtn = $("#saveBtn"), saveLabel = $("#saveLabel");
    const KEY = "nl_saved_1331";
    if (shareBtn) shareBtn.addEventListener("click", () => {
      const url = location.href, title = document.title;
      if (navigator.share) { navigator.share({ title, url }).catch(() => {}); return; }
      const done = () => toast("Link copied — send it to a co-planner");
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(() => window.prompt("Copy this link:", url));
      else window.prompt("Copy this link:", url);
    });
    if (saveBtn && saveLabel) {
      const reflect = () => {
        let saved = false; try { saved = localStorage.getItem(KEY) === "1"; } catch (e) {}
        saveLabel.textContent = saved ? "Saved" : "Save";
        saveBtn.classList.toggle("is-saved", saved);
      };
      saveBtn.addEventListener("click", () => {
        let saved = false; try { saved = localStorage.getItem(KEY) === "1"; localStorage.setItem(KEY, saved ? "0" : "1"); } catch (e) {}
        reflect(); toast(saved ? "Removed from saved" : "Saved for later");
      });
      reflect();
    }
  }

  function injectNavLogo() {
    const slot = $("#navMark");
    if (slot) slot.innerHTML = `<img class="brand__logo" data-img-key="logo" src="${overrideFor("logo") || LOGO_SRC}" alt="New Level">`;
    document.querySelectorAll(".nav__lang-ic").forEach((n) => (n.innerHTML = GLYPH.globe));
  }

  /* Nav motion: hides on scroll-down / reappears on scroll-up everywhere;
     on .nav--overlay pages (hero directly behind the nav) it also starts
     transparent and solidifies once scrolled past the hero. Re-measures
     on resize since hero height is viewport-relative.
     .brand-float (the logo, now a fixed sibling of .nav rather than a
     child — see styles.css) needs the same "collapse up as the demo banner
     scrolls away" vertical offset .nav gets, so it visually tracks the bar
     instead of floating at a mismatched height. It does NOT mirror
     .nav--solid — its white card is permanent (see styles.css), since a
     fixed, always-visible logo drifts over arbitrary page content as you
     scroll, not just the nav bar's own background. Its .nav--hidden class
     IS mirrored from .nav: on desktop that's inert (the logo stays visible
     by design — no CSS rule outside the mobile breakpoint acts on it), but
     on mobile it makes the centered logo hide/reappear together with the
     rest of the bar rather than floating on its own. */
  function initNavScroll() {
    const nav = $(".nav");
    if (!nav) return;
    const brandFloat = $(".brand-float");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isOverlay = nav.classList.contains("nav--overlay");
    const banner = $(".demo-banner");
    let bannerH = banner ? banner.offsetHeight : 0;
    const heroEl = $(".nl-hero") || $(".a-hero");
    let heroH = heroEl ? heroEl.offsetHeight : 0;
    let lastY = window.scrollY, ticking = false;

    function measure() {
      bannerH = banner ? banner.offsetHeight : 0;
      heroH = heroEl ? heroEl.offsetHeight : 0;
    }
    function update() {
      const y = window.scrollY;
      const topOffset = Math.max(0, bannerH - y);
      if (brandFloat) brandFloat.style.top = topOffset + "px";
      if (isOverlay) {
        nav.classList.toggle("nav--solid", y > Math.max(heroH - 90, 40));
        nav.style.top = topOffset + "px";
      }
      if (!reduceMotion) {
        const hide = y > lastY && y > 140;
        nav.classList.toggle("nav--hidden", hide);
        // mirrored onto brand-float too: inert on desktop (no matching
        // transform rule outside the mobile breakpoint), but on mobile the
        // logo hides/reappears with the rest of the bar instead of staying
        // permanently fixed — see the .brand-float.nav--hidden rule in the
        // max-width:640px media query in styles.css.
        if (brandFloat) brandFloat.classList.toggle("nav--hidden", hide);
      }
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", measure);
    measure(); update();
  }

  /* Scroll-reveal: sections fade/slide into place as you reach them,
     instead of just appearing static. Progressive enhancement — the
     .reveal class (which starts things at opacity:0) is only ever added
     by this function, so a page never gets stuck invisible if JS fails or
     IntersectionObserver isn't supported. Hero bands are intentionally
     excluded (above the fold, already have their own Ken Burns motion). */
  function initScrollReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll(".section, .agentbar");
    if (!targets.length) return;
    // threshold: 0 (not e.g. 0.12) — a percentage-of-target threshold
    // requires that fraction of the ELEMENT'S OWN height to be visible,
    // which a very tall section (properties.html's whole results block can
    // be 6000px+) may never reach even scrolled fully into view. Fire as
    // soon as any part of it is visible instead.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -60px 0px" });
    targets.forEach((elm) => { elm.classList.add("reveal"); io.observe(elm); });
    // Safety net: this is progressive enhancement, so nothing should ever
    // stay invisible — force-reveal anything still waiting after 2.5s
    // (e.g. an element that never intersects because it's inside a hidden
    // ancestor at init time and only shown later).
    setTimeout(() => document.querySelectorAll(".reveal:not(.is-revealed)").forEach((elm) => elm.classList.add("is-revealed")), 2500);
  }

  /* .nav__right can outgrow the available width (a long purpose-specific
     back label alongside the full link set) — rather than let that squeeze
     the logo (which lives outside .nav entirely now, see .brand-float),
     the track scrolls horizontally, with tiny arrows shown only when
     there's actually somewhere to scroll to. updateNavRightScroll is also
     called from setBackTo() below, since the back label's text (and
     therefore whether the track overflows) can change after a purpose is
     picked. */
  let updateNavRightScroll = () => {};
  function initNavRightScroll() {
    const track = $(".nav__right-track");
    const prev = $(".nav-scroll__arrow--prev");
    const next = $(".nav-scroll__arrow--next");
    if (!track || !prev || !next) return;
    updateNavRightScroll = () => {
      const overflowing = track.scrollWidth > track.clientWidth + 2;
      prev.classList.toggle("is-active", overflowing && track.scrollLeft > 4);
      next.classList.toggle("is-active", overflowing && track.scrollLeft < track.scrollWidth - track.clientWidth - 4);
    };
    prev.addEventListener("click", () => track.scrollBy({ left: -140, behavior: "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: 140, behavior: "smooth" }));
    track.addEventListener("scroll", updateNavRightScroll, { passive: true });
    window.addEventListener("resize", updateNavRightScroll);
    setTimeout(updateNavRightScroll, 50);
  }

  /* Desktop top nav — built from NAV_MENU so items with `children` get a
     hover/click dropdown. Mobile hides #navLinks entirely (see styles.css);
     the same NAV_MENU data drives the hamburger's accordion instead
     (buildMenuSiteNav) so nothing is lost, it just moves. */
  function buildTopNav() {
    const box = $("#navLinks");
    if (!box || typeof NAV_MENU === "undefined") return;
    box.innerHTML = NAV_MENU.map((item, i) => {
      if (!item.children || !item.children.length) return `<span class="nav-item"><a href="${item.href}">${item.label}</a></span>`;
      return `
        <span class="nav-item" data-idx="${i}">
          <a href="${item.href}">${item.label}</a>
          <button type="button" class="nav-item__caret" aria-expanded="false" aria-label="${item.label} submenu">${GLYPH.chevron}</button>
          <span class="nav-dropdown">${item.children.map((c) => `<a href="${c.href}">${c.label}</a>`).join("")}</span>
        </span>`;
    }).join("");
    box.querySelectorAll(".nav-item__caret").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const item = btn.closest(".nav-item");
        const open = item.classList.contains("is-open");
        box.querySelectorAll(".nav-item.is-open").forEach((n) => { n.classList.remove("is-open"); n.querySelector(".nav-item__caret").setAttribute("aria-expanded", "false"); });
        if (!open) { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
    document.addEventListener("click", () => box.querySelectorAll(".nav-item.is-open").forEach((n) => { n.classList.remove("is-open"); n.querySelector(".nav-item__caret").setAttribute("aria-expanded", "false"); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") box.querySelectorAll(".nav-item.is-open").forEach((n) => n.classList.remove("is-open")); });
  }

  function ehoIcon() {
    return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="2"/>
      <path d="M13 25 24 15l11 10" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 24v10h16V24" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 29h8M20 32.5h8" stroke-linecap="round"/></svg>`;
  }

  function buildFooter() {
    const root = $("#siteFooter");
    if (!root || typeof FOOTER_NAV === "undefined") return;
    const year = new Date().getFullYear();
    const socials = SOCIALS.map((s) =>
      `<a class="soc" href="${s.href}" target="_blank" rel="noopener" aria-label="${s.name}">${s.icon}</a>`).join("");
    const cols = FOOTER_NAV.map((c) => `
      <div class="foot-col"><h4>${c.title}</h4>
        ${c.links.map((l) => `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ""}>${l.label}</a>`).join("")}
      </div>`).join("");
    root.innerHTML = `
      <div class="wrap foot-top">
        <a class="foot-brand" href="${PROPERTY.parentUrl}" target="_blank" rel="noopener" aria-label="New Level — Real Estate. Redefined.">
          <img class="foot-logo" data-img-key="logo" src="${overrideFor("logo") || LOGO_SRC}" alt="New Level — Real Estate. Redefined.">
        </a>
        <div class="foot-socials">${socials}</div>
      </div>
      <div class="wrap foot-cols">${cols}</div>
      <div class="wrap foot-divider"></div>
      <div class="wrap foot-legal">
        <div class="eho">
          <span class="eho__icon">${ehoIcon()}</span>
          <p class="eho__text"><strong>Equal Housing Opportunity.</strong> We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing opportunity throughout the nation. We encourage and support an affirmative advertising and marketing program in which there are no barriers to obtaining housing because of race, color, religion, sex, handicap, familial status, or national origin.</p>
        </div>
        <p class="broker-line">New Level Group LLC &nbsp;|&nbsp; Licensed Real Estate Broker &nbsp;|&nbsp; License #<span class="ph-token">[PLACEHOLDER]</span></p>
        <p class="copyright">© ${year} New Level Group LLC. All Rights Reserved.</p>
        <p class="demo-note">Demo build — not a live New Level page. Availability &amp; pricing shown are illustrative placeholders.</p>
        <div class="foot-prefs">
          <label class="foot-pref"><span>Language</span><select class="lang-select" aria-label="Language"></select></label>
          <label class="foot-pref"><span>Currency</span><select class="currency-select" aria-label="Currency"></select></label>
          <button class="report-trigger" id="privacyTrigger" type="button">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/></svg>
            Your privacy choices
          </button>
          <button class="report-trigger" id="reportTrigger" type="button">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15V4a1 1 0 0 1 1-1h14l-3 4 3 4H5a1 1 0 0 0-1 1zM4 21v-6"/></svg>
            Report a problem
          </button>
        </div>
      </div>`;
  }

  /* ---- rate label + currency refresh ---- */
  function setQuoteRateLabel(tier) {
    tier = tier || bookingState.tier;
    const q = $("#quoteRate"); if (!q || !tier) return;
    if (tier === "event") q.innerHTML = `${money(RATE_TIERS.event.base)} <small>/ 24-hour rental <span class="placeholder-tag">placeholder rate</span></small>`;
    else q.innerHTML = `${money(RATE_TIERS.stay.perNight)} <small>/ night <span class="placeholder-tag">placeholder rate</span></small>`;
  }
  function refreshMoney() {
    document.querySelectorAll("[data-usd]").forEach((elm) => {
      const v = parseFloat(elm.getAttribute("data-usd"));
      const pre = elm.classList.contains("addon__up") ? "+" : (elm.getAttribute("data-pre") || "");
      elm.textContent = pre + money(v);
    });
    if (typeof RATE_TIERS !== "undefined") {
      document.querySelectorAll(".tier-opt").forEach((opt) => {
        const inp = opt.querySelector("input"); const d = opt.querySelector(".tier-opt__d");
        if (!inp || !d) return;
        if (inp.value === "event") d.textContent = money(RATE_TIERS.event.base) + " flat";
        else if (inp.value === "stay") d.textContent = money(RATE_TIERS.stay.perNight) + " / night";
      });
    }
    if (bookingState.tier) setQuoteRateLabel();
    if (bookingState.view) updateQuote();
    updateStickyBar();
  }

  /* ================================================================
     Context-aware menu (all pages)
     ================================================================ */
  function menuSectionLabel(sec) {
    const eb = sec.querySelector(".eyebrow");
    let label = eb ? (eb.firstChild ? eb.firstChild.textContent : eb.textContent) : sec.id;
    return (label || sec.id).replace(/\s+/g, " ").trim();
  }
  function collectSections() {
    const out = [];
    document.querySelectorAll("section[id]").forEach((sec) => {
      if (sec.offsetParent === null) return;   // skip hidden sections
      const label = menuSectionLabel(sec);
      if (label) out.push({ id: sec.id, label });
    });
    return out;
  }
  /* Every dedicated landing page cross-links to its siblings, so a visitor
     exploring Team/Services/Testimonials/Events/Contact/Properties/About
     never has to back out to the homepage to keep going. */
  const SITE_PAGES = [
    { key: "properties",   label: "Properties",   href: "properties.html" },
    { key: "about",        label: "About New Level", href: "about.html" },
    { key: "team",         label: "Team",          href: "team.html" },
    { key: "services",     label: "Services",      href: "services.html" },
    { key: "testimonials", label: "Testimonials",  href: "testimonials.html" },
    { key: "events",       label: "Events",        href: "events.html" },
    { key: "contact",      label: "Contact",       href: "contact.html" },
  ];
  function menuNav(page) {
    if (page === "property") {
      const nb = $("#navBack");
      return [
        { label: "‹ Back", href: nb ? nb.getAttribute("href") : "index.html" },
        { label: "New Level home", href: "index.html" },
        { label: "All properties", href: "properties.html" },
      ];
    }
    if (SITE_PAGES.some((p) => p.key === page)) return [{ label: "‹ New Level home", href: "index.html" }];
    return [{ label: "Start your search", href: "#choose", scroll: true }];
  }
  function menuContext(page) {
    if (page === "property") return "1331 NW 87th Street";
    const p = SITE_PAGES.find((x) => x.key === page);
    return p ? p.label : "New Level";
  }
  /* Mobile hamburger's full site map — same NAV_MENU data as the desktop
     dropdowns, rendered as a collapsible accordion (tap a parent to expand
     its children in place; tap again to retract). Rebuilt fresh each time
     the menu opens, same pattern as menuNav()/collectSections() above. */
  function buildMenuSiteNav() {
    const box = $("#menuSiteNav");
    if (!box || typeof NAV_MENU === "undefined") return;
    box.innerHTML = NAV_MENU.map((item, i) => {
      if (!item.children || !item.children.length) return `<a class="menu-sitenav__link" href="${item.href}">${item.label}</a>`;
      return `
        <div class="menu-sitenav__group">
          <a class="menu-sitenav__link" href="${item.href}">${item.label}</a>
          <button type="button" class="menu-sitenav__toggle" aria-expanded="false" aria-label="${item.label} submenu" data-idx="${i}">${GLYPH.chevron}</button>
          <div class="menu-sitenav__children" id="menuSiteChild${i}">
            ${item.children.map((c) => `<a href="${c.href}">${c.label}</a>`).join("")}
          </div>
        </div>`;
    }).join("");
    box.querySelectorAll(".menu-sitenav__toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        btn.parentElement.querySelector(".menu-sitenav__children").classList.toggle("is-open", !open);
      });
    });
  }

  function buildMenu() {
    const nav = $(".nav__inner"); if (!nav) return;
    const page = document.body.getAttribute("data-page");
    const btn = el("button", "menu-btn"); btn.id = "menuBtn"; btn.type = "button";
    btn.setAttribute("aria-label", "Open menu"); btn.innerHTML = "<span></span><span></span><span></span>";
    // right side, mobile-only (desktop already has the full dropdown nav) —
    // keeps the logo alone and unchallenged on the left
    const slot = nav.querySelector(".nav__right") || nav;
    slot.appendChild(btn);

    const overlay = el("div", "menu-overlay"); overlay.id = "menuOverlay"; overlay.hidden = true;
    overlay.innerHTML = `
      <aside class="menu-panel" role="dialog" aria-modal="true" aria-label="Site menu">
        <div class="menu-panel__head">
          <span class="menu-panel__ctx" id="menuCtx"></span>
          <button class="menu-close" id="menuClose" type="button" aria-label="Close menu">&times;</button>
        </div>
        <div class="menu-panel__body">
          <div class="menu-group" id="menuNav"></div>
          <div class="menu-label">Explore</div>
          <nav class="menu-sitenav" id="menuSiteNav"></nav>
          <div class="menu-label">On this page</div>
          <nav class="menu-sections" id="menuSections"></nav>
        </div>
      </aside>`;
    document.body.appendChild(overlay);

    const close = () => { overlay.hidden = true; document.body.style.overflow = ""; };
    const spyOnce = () => {
      const links = overlay.querySelectorAll(".menu-sec-link"); if (!links.length) return;
      let activeId = null; const y = window.scrollY + 140;
      links.forEach((lnk) => { const t = document.getElementById(lnk.getAttribute("data-id")); if (t && t.offsetTop <= y) activeId = lnk.getAttribute("data-id"); });
      links.forEach((lnk) => lnk.classList.toggle("is-active", lnk.getAttribute("data-id") === activeId));
    };
    const open = () => {
      $("#menuCtx").textContent = menuContext(page);
      $("#menuNav").innerHTML = menuNav(page).map((l) =>
        `<a class="menu-nav-link" href="${l.href}" data-scroll="${l.scroll ? 1 : 0}">${l.label}</a>`).join("");
      buildMenuSiteNav();
      $("#menuSections").innerHTML = collectSections().map((s) =>
        `<a class="menu-sec-link" href="#${s.id}" data-id="${s.id}">${s.label}</a>`).join("");
      translatePage(currentLang);
      spyOnce();
      overlay.hidden = false; document.body.style.overflow = "hidden";
    };
    btn.addEventListener("click", open);
    $("#menuClose").addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) { close(); return; }
      const sec = e.target.closest(".menu-sec-link");
      if (sec) { e.preventDefault(); const t = document.getElementById(sec.getAttribute("data-id")); close(); if (t) setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "start" }), 60); return; }
      const nl = e.target.closest(".menu-nav-link");
      if (nl && nl.getAttribute("data-scroll") === "1") { e.preventDefault(); const t = document.getElementById(nl.getAttribute("href").slice(1)); close(); if (t) setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "start" }), 60); }
    });
    document.addEventListener("keydown", (e) => { if (!overlay.hidden && e.key === "Escape") close(); });
  }

  /* ================================================================
     Preferences (language, currency) + Privacy choices
     ================================================================ */
  /* Multiple lang/currency selects can appear on one page (footer, nav,
     quote card) — they all stay in sync off the same currentLang/currentCurrency. */
  function initPreferences() {
    const langEls = document.querySelectorAll(".lang-select");
    if (langEls.length && typeof LANGUAGES !== "undefined") {
      const opts = LANGUAGES.map((l) => `<option value="${l.code}" title="${l.label}">${l.code.toUpperCase()}</option>`).join("");
      let saved = "en"; try { saved = localStorage.getItem("nl_lang") || "en"; } catch (e) {}
      currentLang = saved; document.documentElement.lang = saved;
      langEls.forEach((lang) => {
        lang.innerHTML = opts;
        lang.value = saved;
        lang.addEventListener("change", () => {
          currentLang = lang.value;
          try { localStorage.setItem("nl_lang", currentLang); } catch (e) {}
          translatePage(currentLang);
          langEls.forEach((other) => { if (other !== lang) other.value = currentLang; });
          const L = LANGUAGES.find((x) => x.code === currentLang);
          toast(`${L ? L.label : "Language"} — interface translated (long-form content stays in English for the demo).`);
        });
      });
    }
    const curEls = document.querySelectorAll(".currency-select");
    if (curEls.length && typeof CURRENCIES !== "undefined") {
      const opts = Object.keys(CURRENCIES).map((k) => `<option value="${k}">${CURRENCIES[k].label}</option>`).join("");
      try { const s = localStorage.getItem("nl_currency"); if (s && CURRENCIES[s]) currentCurrency = s; } catch (e) {}
      curEls.forEach((c) => {
        c.innerHTML = opts;
        c.value = currentCurrency;
        c.addEventListener("change", () => {
          currentCurrency = c.value; try { localStorage.setItem("nl_currency", currentCurrency); } catch (e) {}
          curEls.forEach((other) => { if (other !== c) other.value = currentCurrency; });
          refreshMoney(); toast(`Prices shown in ${CURRENCIES[currentCurrency].label} — demo rate.`);
        });
      });
      refreshMoney();
    }
  }

  function initPrivacy() {
    if (typeof PRIVACY_CATEGORIES === "undefined") return;
    const KEY = "nl_privacy";
    let stored = null; try { stored = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
    const state = stored && stored.choices ? stored.choices : { essential: true, analytics: false, marketing: false };
    const persist = (choices) => { try { localStorage.setItem(KEY, JSON.stringify({ choices, ts: Date.now() })); } catch (e) {} };

    const modal = el("div", "privacy-modal"); modal.id = "privacyModal"; modal.hidden = true;
    modal.innerHTML = `
      <div class="privacy-card" role="dialog" aria-modal="true" aria-label="Your privacy choices">
        <button class="report-close" id="privacyClose" type="button" aria-label="Close">&times;</button>
        <h3 class="report-card__title">Your privacy choices</h3>
        <p class="muted">Choose how your data is used here. Essential is always on. This is a demo — no trackers actually load.</p>
        <div id="privacyCats"></div>
        <div class="privacy-actions">
          <button class="btn btn--ghost" id="privacyReject" type="button">Only essential</button>
          <button class="btn btn--solid" id="privacySave" type="button">Save choices</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const renderCats = () => {
      $("#privacyCats").innerHTML = PRIVACY_CATEGORIES.map((cat) => `
        <label class="privacy-cat">
          <span><span class="privacy-cat__t">${cat.label}</span><span class="privacy-cat__d">${cat.desc}</span></span>
          <input type="checkbox" data-cat="${cat.id}" ${state[cat.id] ? "checked" : ""} ${cat.locked ? "disabled" : ""}>
        </label>`).join("");
    };
    const openModal = () => { renderCats(); modal.hidden = false; document.body.style.overflow = "hidden"; };
    const closeModal = () => { modal.hidden = true; document.body.style.overflow = ""; };
    $("#privacyClose").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (!modal.hidden && e.key === "Escape") closeModal(); });
    $("#privacyReject").addEventListener("click", () => { const ch = { essential: true, analytics: false, marketing: false }; persist(ch); Object.assign(state, ch); closeModal(); hideBanner(); toast("Saved — only essential cookies."); });
    $("#privacySave").addEventListener("click", () => { const ch = { essential: true }; modal.querySelectorAll("#privacyCats input").forEach((i) => (ch[i.getAttribute("data-cat")] = i.checked)); persist(ch); Object.assign(state, ch); closeModal(); hideBanner(); toast("Privacy choices saved."); });
    const trig = $("#privacyTrigger"); if (trig) trig.addEventListener("click", openModal);

    let banner = null;
    function hideBanner() { if (banner) { banner.classList.remove("is-show"); const b = banner; banner = null; setTimeout(() => b.remove(), 250); } }
    if (!stored) {
      banner = el("div", "privacy-banner");
      banner.innerHTML = `
        <p>We use cookies to run the site and, with your OK, to improve it — you're in control.</p>
        <div class="privacy-banner__btns">
          <button class="btn btn--ghost" id="pbEssential" type="button">Only essential</button>
          <button class="btn btn--ghost" id="pbManage" type="button">Manage</button>
          <button class="btn btn--green" id="pbAccept" type="button">Accept all</button>
        </div>`;
      document.body.appendChild(banner);
      requestAnimationFrame(() => banner.classList.add("is-show"));
      banner.querySelector("#pbAccept").addEventListener("click", () => { const ch = { essential: true, analytics: true, marketing: true }; persist(ch); Object.assign(state, ch); hideBanner(); toast("All cookies accepted."); });
      banner.querySelector("#pbEssential").addEventListener("click", () => { const ch = { essential: true, analytics: false, marketing: false }; persist(ch); Object.assign(state, ch); hideBanner(); });
      banner.querySelector("#pbManage").addEventListener("click", () => { openModal(); });
    }
  }

  /* =========================================================================
     EDIT MODE — upload badges on every image slot.
     Turn on with ?edit=1 (stays on while you browse). Visitors never see it.
     ========================================================================= */
  let editMode = false;
  const EDIT_LABELS = {
    "logo": "logo", "brand-hero": "hero background", "floorplan": "floor plan",
  };
  function slotLabel(key) {
    if (EDIT_LABELS[key]) return EDIT_LABELS[key];
    if (key.startsWith("photo:")) return "photo " + (parseInt(key.slice(6), 10) + 1);
    if (key.startsWith("team:")) return "team photo " + (parseInt(key.slice(5), 10) + 1);
    if (key.startsWith("other:")) return "property " + (parseInt(key.slice(6), 10) + 1);
    if (key.startsWith("event:")) return "event photo " + (parseInt(key.slice(6), 10) + 1);
    return key;
  }

  function decorateSlots() {
    if (!editMode) return;
    document.querySelectorAll("[data-img-key]").forEach((node) => {
      const key = node.getAttribute("data-img-key");
      // badge lives on the nearest positioned wrapper so it sits over the image
      const host = node.tagName === "IMG" ? (node.parentElement || node) : node;
      if (host.querySelector(':scope > .img-upload')) {
        host.querySelector(':scope > .img-upload').dataset.key = key;   // keep in sync (hero tour)
        return;
      }
      // only establish a containing block if the host is statically positioned —
      // adding position:relative to an absolute host (e.g. the hero bg) breaks layout
      if (getComputedStyle(host).position === "static") host.classList.add("img-slot");
      const badge = el("button", "img-upload");
      badge.type = "button";
      badge.dataset.key = key;
      // small slots (nav logo etc.) get a compact icon-only badge tucked at the corner
      const sizeBadge = () => {
        const w = host.getBoundingClientRect().width;
        const small = host.closest(".nav") || (w > 0 && w < 220);
        badge.classList.toggle("img-upload--sm", !!small);
      };
      sizeBadge();
      requestAnimationFrame(sizeBadge);        // re-check once layout/images settle
      window.addEventListener("load", sizeBadge, { once: true });
      badge.innerHTML = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg><span>Upload</span>`;
      badge.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        openUploadFor(badge.dataset.key);
      });
      host.appendChild(badge);
    });
  }

  function openUploadFor(key) {
    const input = el("input");
    input.type = "file"; input.accept = "image/*"; input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", async () => {
      const f = input.files && input.files[0];
      if (f) {
        toast("Processing " + slotLabel(key) + "…");
        try {
          const ok = await saveOverride(key, f);
          if (ok) {
            updateEditCount();
            toast(ok === "published"
              ? `${slotLabel(key)} updated — live for everyone.`
              : `${slotLabel(key)} replaced (this browser only — see Publish).`);
          }
        } catch (err) { toast("Couldn't read that image — try a JPG or PNG."); }
      }
      input.remove();
    });
    input.click();
  }

  function updateEditCount() {
    const local = Object.keys(imgOverrides).length;
    const live = serverKeys.size;
    const c = $("#editCount");
    if (c) {
      const bits = [];
      if (live) bits.push(`${live} live`);
      if (local) bits.push(`${local} unpublished`);
      c.textContent = bits.length ? bits.join(" · ") : "No images replaced yet";
    }
    const ex = $("#editExport"); if (ex) ex.disabled = !(local + live);
    const rs = $("#editReset"); if (rs) rs.disabled = !(local + live);
    const pb = $("#editPublish");
    if (pb) { pb.hidden = !serverUp; pb.disabled = !local; }
    const st = $("#editStatus");
    if (st) {
      if (!serverUp) { st.textContent = "local only"; st.className = "edit-bar__status is-local"; }
      else if (!adminToken()) { st.textContent = "sign in to publish"; st.className = "edit-bar__status is-local"; }
      else { st.textContent = "publishing live"; st.className = "edit-bar__status is-live"; }
    }
  }

  /* Push every locally-held image to the shared backend. */
  async function publishAll() {
    const keys = Object.keys(imgOverrides);
    if (!keys.length) return;
    if (!adminToken() && !promptForToken()) return;
    const btn = $("#editPublish");
    if (btn) { btn.disabled = true; btn.textContent = "Publishing…"; }
    let done = 0;
    for (const k of keys) {
      const ok = await publishToServer(k, imgOverrides[k]);
      if (ok) done++;
    }
    if (btn) btn.textContent = "Publish";
    updateEditCount();
    toast(done ? `${done} image${done > 1 ? "s" : ""} now live for everyone.` : "Nothing was published — check the admin token.");
  }

  function promptForToken() {
    const t = window.prompt("Admin token (set as ADMIN_TOKEN in your Netlify site settings):", "");
    if (!t) return false;
    try { sessionStorage.setItem("nl_admin_token", t.trim()); } catch (e) {}
    updateEditCount();
    return true;
  }

  /* Export replacements as real files to drop into the project. */
  function exportOverrides() {
    const keys = Object.keys(imgOverrides);
    if (!keys.length) return;
    const nameFor = (k) =>
      k === "logo" ? "logo.png"
      : k.startsWith("photo:") ? k.slice(6) + ".jpg"
      : k.replace(":", "-") + ".jpg";
    keys.forEach((k, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = imgOverrides[k];
        a.download = nameFor(k);
        document.body.appendChild(a); a.click(); a.remove();
      }, i * 350);   // stagger so the browser allows multiple downloads
    });
    toast(`Downloading ${keys.length} image${keys.length > 1 ? "s" : ""} — see README for where they go.`);
  }

  function initEditMode() {
    const params = new URLSearchParams(location.search);
    if (params.get("edit") === "1") { try { sessionStorage.setItem("nl_edit", "1"); } catch (e) {} }
    if (params.get("edit") === "0") { try { sessionStorage.removeItem("nl_edit"); } catch (e) {} }
    let on = false; try { on = sessionStorage.getItem("nl_edit") === "1"; } catch (e) {}
    editMode = on;
    if (!editMode) return;
    document.body.classList.add("is-editing");

    const bar = el("div", "edit-bar");
    bar.innerHTML = `
      <span class="edit-bar__dot"></span>
      <span class="edit-bar__title">Image edit mode</span>
      <span class="edit-bar__status" id="editStatus"></span>
      <span class="edit-bar__count" id="editCount"></span>
      <button class="edit-bar__btn edit-bar__btn--go" id="editPublish" type="button" hidden>Publish</button>
      <button class="edit-bar__btn" id="editExport" type="button">Export</button>
      <button class="edit-bar__btn" id="editReset" type="button">Reset</button>
      <button class="edit-bar__btn edit-bar__btn--x" id="editExit" type="button">Exit</button>`;
    document.body.appendChild(bar);
    $("#editExport").addEventListener("click", exportOverrides);
    $("#editPublish").addEventListener("click", publishAll);
    $("#editStatus").addEventListener("click", () => { if (serverUp) promptForToken(); });
    $("#editReset").addEventListener("click", async () => {
      const live = serverKeys.size;
      const msg = live
        ? `Remove all uploaded images?\n\nThis also removes the ${live} live image${live > 1 ? "s" : ""} everyone can see.`
        : "Remove all uploaded images and restore the originals?";
      if (!confirm(msg)) return;
      if (live && adminToken()) {
        try {
          await fetch(IMG_API + "?all=1", { method: "DELETE", headers: { "x-admin-token": adminToken() } });
          serverKeys = new Set();
        } catch (e) { toast("Couldn't clear the live images."); }
      }
      imgOverrides = {}; persistOverrides(); updateEditCount(); location.reload();
    });
    $("#editExit").addEventListener("click", () => {
      try { sessionStorage.removeItem("nl_edit"); } catch (e) {}
      const u = new URL(location.href); u.searchParams.delete("edit"); location.href = u.toString();
    });
    updateEditCount();
    decorateSlots();
    // re-decorate as sections render/reveal
    new MutationObserver(() => { applyImageOverrides(); decorateSlots(); })
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ================================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    injectNavLogo();
    buildTopNav();
    initNavScroll();
    initNavRightScroll();
    buildFooter();
    buildMenu();
    initReport();
    initPreferences();
    initPrivacy();
    initEditMode();               // before render: page rewrites its own URL
    const page = document.body.getAttribute("data-page");
    if (page === "landing") renderLanding();
    else if (page === "properties") renderPropertyList();
    else if (page === "property") renderProperty();
    else if (page === "about") renderAbout();
    else if (page === "team") renderTeamPage();
    else if (page === "services") renderServicesPage();
    else if (page === "testimonials") renderTestimonialsPage();
    else if (page === "events") renderEventsPage();
    else if (page === "contact") renderContactPage();
    applyImageOverrides();
    decorateSlots();
    initScrollReveal();
    // shared images arrive async; they re-apply over every tagged slot
    loadServerImages().then(() => {
      updateEditCount();
      decorateSlots();
      if (editMode && serverUp && !adminToken()) {
        toast("Connected. Click “sign in to publish” to make uploads live for everyone.");
      }
    });
  });
})();
