/**
 * PhoneRadar Frontend & Backend Integration
 * Fullstack Search, Autocomplete, REST API & Reviews
 */

document.addEventListener("DOMContentLoaded", () => {
  // App State
  const state = {
    selectedBrand: "all",
    selectedCategory: "all",
    searchQuery: "",
    sortBy: "rating-desc",
    filterIp68: false,
    filterOis: false,
    comparedPhoneIds: JSON.parse(localStorage.getItem("phoneradar_compare") || "[]"),
    favoritePhoneIds: JSON.parse(localStorage.getItem("phoneradar_favs") || "[]"),
    theme: localStorage.getItem("phoneradar_theme") || "dark",
    phonesData: [], // loaded from API or fallback
    advisor: {
      step: 1,
      budget: null,
      priority: null,
      brand: null
    }
  };

  // Helper for custom phone edits (SMARTFON.ol)
  function getCustomPhoneEdits() {
    try {
      return JSON.parse(localStorage.getItem("smartfon_custom_edits") || "{}");
    } catch(e) { return {}; }
  }

  // Toast notification helper
  function showToast(msg) {
    const existing = document.querySelector(".smartfon-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "smartfon-toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Apply stored edits to PHONES_DATABASE on boot
  if (typeof PHONES_DATABASE !== "undefined") {
    const edits = getCustomPhoneEdits();
    PHONES_DATABASE.forEach((phone, idx) => {
      if (edits[phone.id]) {
        PHONES_DATABASE[idx] = Object.assign({}, phone, edits[phone.id]);
      }
    });
  }

  // DOM Elements
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const phonesGrid = document.getElementById("phonesGrid");
  const brandChipsContainer = document.getElementById("brandChipsContainer");
  const phoneSearchInput = document.getElementById("phoneSearchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const searchSuggestionsDropdown = document.getElementById("searchSuggestionsDropdown");
  const categorySelect = document.getElementById("categorySelect");
  const sortBySelect = document.getElementById("sortBySelect");
  const filterIp68Chk = document.getElementById("filterIp68");
  const filterOisChk = document.getElementById("filterOis");
  const catalogCountEl = document.getElementById("catalogCount");
  const emptyStateEl = document.getElementById("emptyState");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Compare Drawer Elements
  const compareDrawerBtn = document.getElementById("compareDrawerBtn");
  const compareBadgeCount = document.getElementById("compareBadgeCount");
  const compareDrawer = document.getElementById("compareDrawer");
  const compareDrawerBackdrop = document.getElementById("compareDrawerBackdrop");
  const drawerCloseBtn = document.getElementById("drawerCloseBtn");
  const drawerBadge = document.getElementById("drawerBadge");
  const compareSlotsContainer = document.getElementById("compareSlotsContainer");
  const compareTableWrapper = document.getElementById("compareTableWrapper");
  const clearCompareBtn = document.getElementById("clearCompareBtn");
  const openFullCompareModalBtn = document.getElementById("openFullCompareModalBtn");

  // Modals
  const phoneDetailModal = document.getElementById("phoneDetailModal");
  const phoneModalBackdrop = document.getElementById("phoneModalBackdrop");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalBrand = document.getElementById("modalBrand");
  const modalName = document.getElementById("modalName");
  const modalBody = document.getElementById("modalBody");

  const fullCompareModal = document.getElementById("fullCompareModal");
  const fullCompareBackdrop = document.getElementById("fullCompareBackdrop");
  const fullCompareCloseBtn = document.getElementById("fullCompareCloseBtn");
  const fullCompareBody = document.getElementById("fullCompareBody");

  // Buyer's Guide & Deep Dive Elements
  const guideCardsGrid = document.getElementById("guideCardsGrid");
  const recsGridContainer = document.getElementById("recsGridContainer");

  // ==========================================
  // 1. THEME INITIALIZATION
  // ==========================================
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    state.theme = theme;
    localStorage.setItem("phoneradar_theme", theme);
    if (theme === "light") {
      themeIcon.className = "fa-solid fa-sun";
    } else {
      themeIcon.className = "fa-solid fa-moon";
    }
  }

  applyTheme(state.theme);

  themeToggleBtn.addEventListener("click", () => {
    const newTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  });

  // ==========================================
  // 2. RENDER BRAND FILTER CHIPS
  // ==========================================
  function renderBrandChips() {
    brandChipsContainer.innerHTML = "";
    BRANDS_LIST.forEach(b => {
      const chip = document.createElement("button");
      chip.className = `brand-chip-btn ${state.selectedBrand === b.id ? "active" : ""}`;
      chip.innerHTML = `${b.logo ? `<i class="${b.logo}"></i>` : ""} <span>${b.name}</span>`;
      chip.addEventListener("click", () => {
        state.selectedBrand = b.id;
        document.querySelectorAll(".brand-chip-btn").forEach(btn => btn.classList.remove("active"));
        chip.classList.add("active");
        fetchAndRenderPhones();
      });
      brandChipsContainer.appendChild(chip);
    });
  }

  window.filterByBrandName = function(brandId) {
    state.selectedBrand = brandId;
    document.querySelectorAll(".brand-chip-btn").forEach(btn => {
      if (btn.textContent.includes(brandId)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    fetchAndRenderPhones();
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
  };

  // ==========================================
  // 3. FETCH PHONES FROM BACKEND API (OR FALLBACK)
  // ==========================================
  async function fetchAndRenderPhones() {
    const params = new URLSearchParams();
    if (state.searchQuery) params.append("q", state.searchQuery);
    if (state.selectedBrand !== "all") params.append("brand", state.selectedBrand);
    if (state.selectedCategory !== "all") params.append("category", state.selectedCategory);
    if (state.filterIp68) params.append("hasIp68", "true");
    if (state.filterOis) params.append("hasOis", "true");
    if (state.sortBy) params.append("sort", state.sortBy);

    try {
      const res = await fetch(`/api/phones?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        state.phonesData = json.data;
        renderPhonesCatalog(state.phonesData);
        return;
      }
    } catch (err) {
      console.warn("Backend API not reachable, using local fallback database", err);
    }

    // Local fallback for GitHub Pages (100% Client-Side Search & Filter)
    let filtered = (typeof PHONES_DATABASE !== "undefined" ? [...PHONES_DATABASE] : []);

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      const cleanQ = q.replace(/\s+/g, '');
      const tokens = q.split(/\s+/).filter(Boolean);

      filtered = filtered.filter(p => {
        const allText = [
          p.name,
          p.brand,
          p.badge,
          p.performanceHardware.chipset,
          p.camera.mainSensor.mp,
          p.quickSpecs.mainCamera,
          p.battery.capacity,
          p.battery.wiredCharging,
          p.display.type,
          p.display.peakBrightness,
          p.bodyAndBuild.waterResistance
        ].join(' ').toLowerCase();

        const allTextClean = allText.replace(/\s+/g, '');
        if (allTextClean.includes(cleanQ)) return true;
        return tokens.every(t => allText.includes(t) || allTextClean.includes(t));
      });
    }

    if (state.selectedBrand !== "all") {
      filtered = filtered.filter(p => p.brand.toLowerCase() === state.selectedBrand.toLowerCase());
    }

    if (state.selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === state.selectedCategory);
    }

    if (state.filterIp68) {
      filtered = filtered.filter(p => p.bodyAndBuild.waterResistance.includes("IP68"));
    }

    if (state.filterOis) {
      filtered = filtered.filter(p => p.camera.mainSensor.ois.includes("OIS"));
    }

    // Sort
    switch (state.sortBy) {
      case "rating-desc":
        filtered.sort((a, b) => b.hardwareScores.overall - a.hardwareScores.overall);
        break;
      case "camera-desc":
        filtered.sort((a, b) => b.hardwareScores.camera - a.hardwareScores.camera);
        break;
      case "battery-desc":
        filtered.sort((a, b) => b.hardwareScores.battery - a.hardwareScores.battery);
        break;
      case "price-asc":
        filtered.sort((a, b) => a.priceEstimateUSD - b.priceEstimateUSD);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.priceEstimateUSD - a.priceEstimateUSD);
        break;
      default:
        break;
    }

    state.phonesData = filtered;
    renderPhonesCatalog(state.phonesData);
  }

  // ==========================================
  // 4. RENDER PHONES GRID
  // ==========================================
  function renderPhonesCatalog(phones) {
    catalogCountEl.textContent = phones.length;

    if (phones.length === 0) {
      phonesGrid.innerHTML = "";
      emptyStateEl.style.display = "block";
      return;
    }

    emptyStateEl.style.display = "none";
    phonesGrid.innerHTML = "";

    phones.forEach(phone => {
      const isCompared = state.comparedPhoneIds.includes(phone.id);
      const isFav = state.favoritePhoneIds.includes(phone.id);

      const card = document.createElement("div");
      card.className = "phone-card";
      card.innerHTML = `
        <div class="card-top-media">
          <span class="card-badge"><i class="fa-solid fa-microchip"></i> ${phone.badge}</span>
          <button class="card-favorite-btn ${isFav ? "active" : ""}" data-id="${phone.id}" title="Sevimlilarga qo'shish">
            <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
          <img src="${phone.image}" alt="${phone.name}" class="card-phone-img" loading="lazy">
          <span class="card-score-pill"><i class="fa-solid fa-star"></i> ${phone.rating}</span>
        </div>
        <div class="card-body">
          <div class="card-brand-row">
            <span class="card-brand">${phone.brand}</span>
            <span class="card-year">${phone.releaseYear} yil</span>
          </div>
          <h3 class="card-title">${phone.name}</h3>
          <div class="card-price-row">
            <span class="card-price-uzs">${phone.priceEstimateUZS}</span>
            <span class="card-price-usd">~$${phone.priceEstimateUSD}</span>
          </div>

          <div class="quick-specs-list">
            <div class="quick-spec-item" title="Displey">
              <i class="fa-solid fa-desktop"></i>
              <span><strong>Ekran:</strong> ${phone.quickSpecs.display}</span>
            </div>
            <div class="quick-spec-item" title="Kamera">
              <i class="fa-solid fa-camera"></i>
              <span><strong>Kamera:</strong> ${phone.quickSpecs.mainCamera}</span>
            </div>
            <div class="quick-spec-item" title="Batareya">
              <i class="fa-solid fa-bolt"></i>
              <span><strong>Batareya:</strong> ${phone.quickSpecs.battery}</span>
            </div>
            <div class="quick-spec-item" title="Protsessor">
              <i class="fa-solid fa-microchip"></i>
              <span><strong>Chip:</strong> ${phone.quickSpecs.chipset}</span>
            </div>
            <div class="quick-spec-item" title="Himoya">
              <i class="fa-solid fa-shield-halved"></i>
              <span><strong>Himoya:</strong> ${phone.quickSpecs.protection}</span>
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn btn-primary btn-card-detail" data-id="${phone.id}">
              <i class="fa-solid fa-circle-info"></i> Tahlil
            </button>
            <button class="btn-card-edit" data-id="${phone.id}" title="Smartfonni to'g'irlash (Ismi, narxi, parametrlari)">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-card-compare ${isCompared ? "in-compare" : ""}" data-id="${phone.id}" title="Taqqoslashga qo'shish">
              <i class="fa-solid fa-code-compare"></i>
            </button>
          </div>
        </div>
      `;

      card.querySelector(".btn-card-detail").addEventListener("click", () => {
        openPhoneDetailModal(phone.id);
      });

      card.querySelector(".btn-card-edit").addEventListener("click", (e) => {
        e.stopPropagation();
        openEditPhoneModal(phone.id);
      });

      card.querySelector(".btn-card-compare").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleComparePhone(phone.id);
      });

      card.querySelector(".card-favorite-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoritePhone(phone.id);
      });

      phonesGrid.appendChild(card);
    });
  }

  // ==========================================
  // 5. LIVE SEARCH & AUTOCOMPLETE DROPDOWN
  // ==========================================
  let searchDebounce;
  let suggestionsDebounce;

  if (phoneSearchInput) {
    phoneSearchInput.addEventListener("input", (e) => {
    const val = e.target.value.trim();
    state.searchQuery = val;
    clearSearchBtn.style.display = val ? "block" : "none";

    // 1. Instant Autocomplete Suggestions
    clearTimeout(suggestionsDebounce);
    if (val.length >= 2) {
      suggestionsDebounce = setTimeout(async () => {
        let suggestions = [];
        try {
          const res = await fetch(`/api/phones/search-suggestions?q=${encodeURIComponent(val)}`);
          if (res.ok) {
            suggestions = await res.json();
          }
        } catch (err) {}

        // 100% Client-side Fallback for GitHub Pages / Static Hosting
        if (!suggestions || suggestions.length === 0) {
          const cleanQ = val.toLowerCase().replace(/\s+/g, '');
          const source = (typeof PHONES_DATABASE !== "undefined" ? PHONES_DATABASE : []);
          suggestions = source.filter(p => {
            const allText = [
              p.name,
              p.brand,
              p.badge,
              p.performanceHardware.chipset,
              p.camera.mainSensor.mp,
              p.quickSpecs.battery
            ].join(' ').toLowerCase();
            return allText.includes(val.toLowerCase()) || allText.replace(/\s+/g, '').includes(cleanQ);
          }).slice(0, 6).map(p => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            image: p.image,
            priceEstimateUZS: p.priceEstimateUZS,
            priceEstimateUSD: p.priceEstimateUSD,
            badge: p.badge,
            quickCamera: p.quickSpecs.mainCamera,
            rating: p.rating
          }));
        }

        renderSearchSuggestions(suggestions);
      }, 150);
    } else {
      hideSuggestions();
    }

    // 2. Main Catalog Search
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      fetchAndRenderPhones();
    }, 300);
  });
  }

  function renderSearchSuggestions(items) {
    if (!items || items.length === 0) {
      hideSuggestions();
      return;
    }

    searchSuggestionsDropdown.innerHTML = "";
    items.forEach(item => {
      const el = document.createElement("div");
      el.className = "suggestion-item";
      el.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="suggestion-thumb">
        <div class="suggestion-meta">
          <div class="suggestion-name">
            ${item.name}
            <span class="suggestion-badge">${item.badge}</span>
          </div>
          <div class="suggestion-specs">
            <i class="fa-solid fa-camera text-cyan"></i> ${item.quickCamera}
          </div>
        </div>
        <div class="suggestion-price">
          ${item.priceEstimateUZS}
          <small>~$${item.priceEstimateUSD}</small>
        </div>
      `;

      el.addEventListener("click", () => {
        hideSuggestions();
        openPhoneDetailModal(item.id);
      });

      searchSuggestionsDropdown.appendChild(el);
    });

    searchSuggestionsDropdown.classList.add("active");
  }

  function hideSuggestions() {
    searchSuggestionsDropdown.classList.remove("active");
    searchSuggestionsDropdown.innerHTML = "";
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (phoneSearchInput && searchSuggestionsDropdown && !phoneSearchInput.contains(e.target) && !searchSuggestionsDropdown.contains(e.target)) {
      hideSuggestions();
    }
  });

  clearSearchBtn.addEventListener("click", () => {
    phoneSearchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.style.display = "none";
    hideSuggestions();
    fetchAndRenderPhones();
  });

  // ==========================================
  // 6. COMPARE FUNCTIONALITY
  // ==========================================
  function toggleComparePhone(phoneId) {
    const idx = state.comparedPhoneIds.indexOf(phoneId);
    if (idx > -1) {
      state.comparedPhoneIds.splice(idx, 1);
    } else {
      if (state.comparedPhoneIds.length >= 3) {
        alert("Siz bir vaqtda ko'pi bilan 3 ta telefonni solishtirishingiz mumkin!");
        return;
      }
      state.comparedPhoneIds.push(phoneId);
    }
    updateCompareUI();
    renderPhonesCatalog(state.phonesData);
  }

  async function updateCompareUI() {
    const count = state.comparedPhoneIds.length;
    localStorage.setItem("phoneradar_compare", JSON.stringify(state.comparedPhoneIds));
    compareBadgeCount.textContent = count;
    drawerBadge.textContent = `${count}/3`;

    // Render Slots
    compareSlotsContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const slot = document.createElement("div");
      const phoneId = state.comparedPhoneIds[i];

      if (phoneId) {
        // Find phone
        let phone = state.phonesData.find(p => p.id === phoneId);
        if (!phone && typeof PHONES_DATABASE !== "undefined") {
          phone = PHONES_DATABASE.find(p => p.id === phoneId);
        }

        slot.className = "compare-slot-card filled";
        slot.innerHTML = `
          <button class="slot-remove-btn" data-id="${phoneId}" title="Olib tashlash"><i class="fa-solid fa-xmark"></i></button>
          <img src="${phone ? phone.image : ''}" alt="${phone ? phone.name : ''}" class="slot-img">
          <span class="slot-name">${phone ? phone.name : phoneId}</span>
        `;
        slot.querySelector(".slot-remove-btn").addEventListener("click", () => {
          toggleComparePhone(phoneId);
        });
      } else {
        slot.className = "compare-slot-card";
        slot.innerHTML = `
          <i class="fa-solid fa-plus text-muted" style="font-size: 1.5rem; margin-bottom: 0.4rem;"></i>
          <span class="text-muted" style="font-size: 0.75rem;">Bo'sh katak (${i + 1})</span>
        `;
      }
      compareSlotsContainer.appendChild(slot);
    }

    if (count < 2) {
      compareTableWrapper.innerHTML = `
        <div class="text-center" style="padding: 2rem 1rem; color: var(--text-muted);">
          <i class="fa-solid fa-scale-balanced" style="font-size: 2rem; margin-bottom: 0.8rem; display: block;"></i>
          <p>Taqqoslash uchun kamida 2 ta telefon tanlang.</p>
        </div>
      `;
    } else {
      renderCompareTable();
    }
  }

  async function getPhonesByIds(ids) {
    try {
      const res = await fetch(`/api/compare?ids=${ids.join(",")}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return ids.map(id => state.phonesData.find(p => p.id === id) || (typeof PHONES_DATABASE !== "undefined" ? PHONES_DATABASE.find(p => p.id === id) : null)).filter(Boolean);
  }

  async function renderCompareTable() {
    const phones = await getPhonesByIds(state.comparedPhoneIds);

    let html = `
      <table class="hardware-table" style="font-size: 0.82rem;">
        <thead>
          <tr>
            <th>Parametr</th>
            ${phones.map(p => `<th style="color: var(--accent-cyan);">${p.name}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Narxi:</strong></td>
            ${phones.map(p => `<td><strong>${p.priceEstimateUZS}</strong> (~$${p.priceEstimateUSD})</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Displey:</strong></td>
            ${phones.map(p => `<td>${p.display.size}, ${p.display.type}, ${p.display.peakBrightness}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Asosiy Kamera:</strong></td>
            ${phones.map(p => `<td>${p.camera.mainSensor.mp}, ${p.camera.mainSensor.sensorSize}, ${p.camera.mainSensor.ois}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Zum Kamera:</strong></td>
            ${phones.map(p => `<td>${p.camera.telephoto.tele1 || "Yo'q"}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Batareya:</strong></td>
            ${phones.map(p => `<td><strong>${p.battery.capacity}</strong>, ${p.battery.wiredCharging}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Qutida Blok:</strong></td>
            ${phones.map(p => `<td>${p.battery.chargerInBox}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Protsessor:</strong></td>
            ${phones.map(p => `<td>${p.performanceHardware.chipset}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Suvdan Himoya:</strong></td>
            ${phones.map(p => `<td>${p.bodyAndBuild.waterResistance}</td>`).join("")}
          </tr>
        </tbody>
      </table>
    `;
    compareTableWrapper.innerHTML = html;
  }

  if (compareDrawerBtn && compareDrawer && compareDrawerBackdrop) {
    compareDrawerBtn.addEventListener("click", () => {
      compareDrawer.classList.add("active");
      compareDrawerBackdrop.classList.add("active");
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener("click", () => {
        compareDrawer.classList.remove("active");
        compareDrawerBackdrop.classList.remove("active");
      });
    }

    compareDrawerBackdrop.addEventListener("click", () => {
      compareDrawer.classList.remove("active");
      compareDrawerBackdrop.classList.remove("active");
    });
  }

  if (clearCompareBtn) clearCompareBtn.addEventListener("click", () => {
    state.comparedPhoneIds = [];
    updateCompareUI();
    renderPhonesCatalog(state.phonesData);
  });

  // Full Screen Compare Modal
  if (openFullCompareModalBtn) openFullCompareModalBtn.addEventListener("click", async () => {
    if (state.comparedPhoneIds.length < 2) {
      alert("Iltimos, to'liq solishtirish uchun kamida 2 ta telefon tanlang!");
      return;
    }
    const phones = await getPhonesByIds(state.comparedPhoneIds);

    fullCompareBody.innerHTML = `
      <table class="compare-matrix-table">
        <thead>
          <tr>
            <th style="width: 20%;">Apparat Bo'limi</th>
            ${phones.map(p => `
              <th>
                <div style="text-align: center;">
                  <img src="${p.image}" style="height: 90px; margin: 0 auto 0.5rem; object-fit: contain;">
                  <strong>${p.name}</strong>
                  <div style="color: var(--accent-green); font-size: 0.9rem;">${p.priceEstimateUZS}</div>
                </div>
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Ekspert Apparat Bali</strong></td>
            ${phones.map(p => `<td><strong style="font-size: 1.1rem; color: var(--accent-cyan);">${p.hardwareScores.overall} / 100</strong></td>`).join("")}
          </tr>
          <tr>
            <td><strong>Displey & Shisha</strong></td>
            ${phones.map(p => `<td>${p.display.type}<br><strong>${p.display.size}</strong> (${p.display.resolution})<br>Yorqinlik: <strong>${p.display.peakBrightness}</strong><br>Himoya: ${p.display.glassProtection}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Kamera Sensori & OIS</strong></td>
            ${phones.map(p => `<td><strong>${p.camera.mainSensor.mp}</strong><br>O'lcham: ${p.camera.mainSensor.sensorSize}<br>Diafragma: ${p.camera.mainSensor.aperture}<br>Stabilizatsiya: ${p.camera.mainSensor.ois}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Optik Zum (Telefoto)</strong></td>
            ${phones.map(p => `<td>${p.camera.telephoto.tele1 || "Yo'q"}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Batareya & Zaryadlash</strong></td>
            ${phones.map(p => `<td><strong>${p.battery.capacity}</strong><br>Simli: <strong>${p.battery.wiredCharging}</strong><br>Faol ekran vaqti: ${p.battery.screenOnTime}<br>Qutida blok: <strong>${p.battery.chargerInBox}</strong></td>`).join("")}
          </tr>
          <tr>
            <td><strong>Chipset & Sovitish</strong></td>
            ${phones.map(p => `<td><strong>${p.performanceHardware.chipset}</strong><br>GPU: ${p.performanceHardware.gpu}<br>Sovitish: ${p.performanceHardware.coolingSystem}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Korpus & IP Himoya</strong></td>
            ${phones.map(p => `<td>Suvdan himoya: <strong>${p.bodyAndBuild.waterResistance}</strong><br>Materiallar: ${p.bodyAndBuild.materials}</td>`).join("")}
          </tr>
          <tr>
            <td><strong>Xulosa & Eng Kuchli Jihati</strong></td>
            ${phones.map(p => `<td style="color: var(--accent-cyan); font-size: 0.85rem;">${p.verdictHardware.bestFor}</td>`).join("")}
          </tr>
        </tbody>
      </table>
    `;

    compareDrawer.classList.remove("active");
    compareDrawerBackdrop.classList.remove("active");
    fullCompareModal.classList.add("active");
    fullCompareBackdrop.classList.add("active");
  });

  if (fullCompareCloseBtn && fullCompareModal && fullCompareBackdrop) fullCompareCloseBtn.addEventListener("click", () => {
    fullCompareModal.classList.remove("active");
    fullCompareBackdrop.classList.remove("active");
  });

  if (fullCompareBackdrop && fullCompareModal) fullCompareBackdrop.addEventListener("click", () => {
    fullCompareModal.classList.remove("active");
    fullCompareBackdrop.classList.remove("active");
  });

  // ==========================================
  // 7. FAVORITES FUNCTIONALITY
  // ==========================================
  function toggleFavoritePhone(phoneId) {
    const idx = state.favoritePhoneIds.indexOf(phoneId);
    if (idx > -1) {
      state.favoritePhoneIds.splice(idx, 1);
    } else {
      state.favoritePhoneIds.push(phoneId);
    }
    localStorage.setItem("phoneradar_favs", JSON.stringify(state.favoritePhoneIds));
    renderPhonesCatalog(state.phonesData);
  }

  // ==========================================
  // 8. PHONE DETAILED HARDWARE MODAL & REVIEWS
  // ==========================================
  async function openPhoneDetailModal(phoneId) {
    let phone;
    try {
      const res = await fetch(`/api/phones/${phoneId}`);
      if (res.ok) {
        phone = await res.json();
      }
    } catch (e) {}

    if (!phone) {
      phone = state.phonesData.find(p => p.id === phoneId) || (typeof PHONES_DATABASE !== "undefined" ? PHONES_DATABASE.find(p => p.id === phoneId) : null);
    }

    if (!phone) return;

    modalBrand.textContent = phone.brand;
    modalName.textContent = phone.name;

    const reviews = phone.reviews || [];
    const reviewsHtml = reviews.length > 0 ? reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <span class="review-user"><i class="fa-solid fa-user-circle"></i> ${r.userName}</span>
          <span class="review-stars">${'★'.repeat(r.rating || 5)} (${r.date})</span>
        </div>
        <p class="review-comment">${r.comment}</p>
      </div>
    `).join('') : '<p style="color: var(--text-muted); font-size: 0.85rem;">Hozircha sharhlar yo\'q. Birinchi bo\'lib fikringizni bildiring!</p>';

    modalBody.innerHTML = `
      <div class="modal-hero-split">
        <div class="modal-img-wrap">
          <img src="${phone.image}" alt="${phone.name}">
        </div>
        <div class="modal-summary-info">
          <div style="margin-bottom: 1rem;">
            <span class="card-badge" style="position: static; margin-bottom: 0.5rem; display: inline-block;">
              <i class="fa-solid fa-microchip"></i> ${phone.badge}
            </span>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-green); margin-top: 0.4rem;">
              ${phone.priceEstimateUZS} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">(taxminan $${phone.priceEstimateUSD})</span>
            </div>
          </div>

          <div class="modal-scores-grid">
            <div class="score-box">
              <div class="num">${phone.hardwareScores.overall}</div>
              <div class="lbl">Umumiy Ball</div>
            </div>
            <div class="score-box">
              <div class="num">${phone.hardwareScores.camera}</div>
              <div class="lbl">Kamera Bali</div>
            </div>
            <div class="score-box">
              <div class="num">${phone.hardwareScores.battery}</div>
              <div class="lbl">Batareya Bali</div>
            </div>
            <div class="score-box">
              <div class="num">${phone.hardwareScores.display}</div>
              <div class="lbl">Displey Bali</div>
            </div>
            <div class="score-box">
              <div class="num">${phone.hardwareScores.performance}</div>
              <div class="lbl">Unumdorlik</div>
            </div>
            <div class="score-box">
              <div class="num">${phone.hardwareScores.durability}</div>
              <div class="lbl">Mustahkamlik</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kamera Apparati -->
      <div class="modal-hardware-block">
        <h4><i class="fa-solid fa-camera text-accent"></i> Kamera Apparati (Optika va Datchiklar)</h4>
        <table class="hardware-table">
          <tr>
            <td>Asosiy Sensor:</td>
            <td><strong>${phone.camera.mainSensor.mp}</strong> (${phone.camera.mainSensor.sensorSize}), Diafragma: ${phone.camera.mainSensor.aperture}</td>
          </tr>
          <tr>
            <td>Optik Stabilizatsiya (OIS):</td>
            <td><strong style="color: var(--accent-cyan);">${phone.camera.mainSensor.ois}</strong></td>
          </tr>
          <tr>
            <td>Telefoto & Zoom:</td>
            <td>${phone.camera.telephoto.tele1 || "Mavjud emas"}</td>
          </tr>
          <tr>
            <td>Ultrakeng Kamera:</td>
            <td>${phone.camera.ultrawide}</td>
          </tr>
          <tr>
            <td>Selfi Kamerasi:</td>
            <td>${phone.camera.frontCamera}</td>
          </tr>
          <tr>
            <td>Video Yozish Formati:</td>
            <td>${phone.camera.videoCapabilities}</td>
          </tr>
        </table>
      </div>

      <!-- Batareya va Zaryadlash -->
      <div class="modal-hardware-block">
        <h4><i class="fa-solid fa-bolt text-accent"></i> Batareya va Quvvatlash Apparati</h4>
        <table class="hardware-table">
          <tr>
            <td>Akkumulyator Sig'imi:</td>
            <td><strong style="color: var(--accent-green); font-size: 1.05rem;">${phone.battery.capacity}</strong></td>
          </tr>
          <tr>
            <td>Simli Tezkor Quvvatlash:</td>
            <td><strong>${phone.battery.wiredCharging}</strong></td>
          </tr>
          <tr>
            <td>Simsiz Quvvatlash:</td>
            <td>${phone.battery.wirelessCharging}</td>
          </tr>
          <tr>
            <td>Faol Ekran Vaqti (SOT):</td>
            <td>${phone.battery.screenOnTime}</td>
          </tr>
          <tr>
            <td>Qutida Zaryadlovchi Blok:</td>
            <td><strong style="${phone.battery.chargerInBox.includes("Bor") ? "color: var(--accent-green);" : "color: var(--accent-rose);"}">${phone.battery.chargerInBox}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Ekran va Displey -->
      <div class="modal-hardware-block">
        <h4><i class="fa-solid fa-desktop text-accent"></i> Displey Apparati</h4>
        <table class="hardware-table">
          <tr>
            <td>O'lchami va Turi:</td>
            <td>${phone.display.size}, <strong>${phone.display.type}</strong></td>
          </tr>
          <tr>
            <td>Aniqlik:</td>
            <td>${phone.display.resolution}</td>
          </tr>
          <tr>
            <td>Cho'qqi Yorqinlik (Nits):</td>
            <td><strong style="color: var(--accent-amber);">${phone.display.peakBrightness}</strong></td>
          </tr>
          <tr>
            <td>Himoya Shishasi:</td>
            <td>${phone.display.glassProtection}</td>
          </tr>
        </table>
      </div>

      <!-- Protsessor va Sovitish -->
      <div class="modal-hardware-block">
        <h4><i class="fa-solid fa-microchip text-accent"></i> Protsessor, Xotira va Sovitish</h4>
        <table class="hardware-table">
          <tr>
            <td>Chipset:</td>
            <td><strong>${phone.performanceHardware.chipset}</strong></td>
          </tr>
          <tr>
            <td>GPU Grafik Tezlatgich:</td>
            <td>${phone.performanceHardware.gpu}</td>
          </tr>
          <tr>
            <td>Sovitish Tizimi:</td>
            <td>${phone.performanceHardware.coolingSystem}</td>
          </tr>
          <tr>
            <td>Operativ va Doimiy Xotira:</td>
            <td>RAM: ${phone.performanceHardware.ramOptions} | Xotira: ${phone.performanceHardware.storageOptions}</td>
          </tr>
        </table>
      </div>

      <!-- Korpus va Suvdan Himoya -->
      <div class="modal-hardware-block">
        <h4><i class="fa-solid fa-shield-halved text-accent"></i> Korpus Materiallari va Chidamlilik</h4>
        <table class="hardware-table">
          <tr>
            <td>Suv va Changdan Himoya:</td>
            <td><strong style="color: var(--accent-cyan); font-size: 1.05rem;">${phone.bodyAndBuild.waterResistance}</strong></td>
          </tr>
          <tr>
            <td>Korpus Materiallari:</td>
            <td>${phone.bodyAndBuild.materials}</td>
          </tr>
          <tr>
            <td>O'lchamlari va Og'irligi:</td>
            <td>${phone.bodyAndBuild.dimensions}, <strong>${phone.bodyAndBuild.weight}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Pros & Cons -->
      <div class="pros-cons-grid">
        <div class="pros-box">
          <h5><i class="fa-solid fa-thumbs-up text-green"></i> Apparat Afzalliklari:</h5>
          <ul>
            ${phone.verdictHardware.pros.map(p => `<li>${p}</li>`).join("")}
          </ul>
        </div>
        <div class="cons-box">
          <h5><i class="fa-solid fa-thumbs-down text-rose"></i> Apparat Kamchiliklari:</h5>
          <ul>
            ${phone.verdictHardware.cons.map(c => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      </div>

      <!-- User Reviews & Form Section -->
      <div class="modal-reviews-section">
        <h4 style="margin-bottom: 1rem;"><i class="fa-solid fa-comments text-cyan"></i> Foydalanuvchilarning Apparat Sharhlari</h4>
        <div class="reviews-list">${reviewsHtml}</div>

        <div class="add-review-form">
          <h5 style="margin-bottom: 0.6rem;"><i class="fa-solid fa-pen-clip"></i> Telefon bo'yicha fikringizni qoldiring:</h5>
          <div style="display: flex; gap: 0.8rem; margin-bottom: 0.8rem;">
            <input type="text" id="reviewUserName" class="form-input" placeholder="Ismingiz..." style="flex: 2;">
            <select id="reviewRating" class="form-select" style="flex: 1;">
              <option value="5">⭐⭐⭐⭐⭐ 5 Ball</option>
              <option value="4">⭐⭐⭐⭐ 4 Ball</option>
              <option value="3">⭐⭐⭐ 3 Ball</option>
              <option value="2">⭐⭐ 2 Ball</option>
              <option value="1">⭐ 1 Ball</option>
            </select>
          </div>
          <textarea id="reviewComment" class="form-textarea" placeholder="Kamerasi, batareyasi yoki ekrani haqida fikringiz..." rows="2" style="margin-bottom: 0.8rem;"></textarea>
          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-primary" id="submitReviewBtn" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;">
              <i class="fa-solid fa-paper-plane"></i> Sharhni Yuborish
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Bottom Actions (Orqaga Qaytish va Smartfonni To'g'irlash) -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.8rem;">
        <button class="btn btn-secondary" id="modalBackBtnBottom">
          <i class="fa-solid fa-arrow-left"></i> <span>Orqaga qaytish</span>
        </button>
        <div style="display: flex; gap: 0.6rem;">
          <button class="btn btn-secondary" id="modalEditBtnBottom">
            <i class="fa-solid fa-pen-to-square text-cyan"></i> <span>Smartfonni to'g'irlash</span>
          </button>
          <button class="btn btn-primary" id="modalCompareBtnBottom">
            <i class="fa-solid fa-code-compare"></i> <span>Taqqoslash</span>
          </button>
        </div>
      </div>
    `;

    // Hook up review submission
    document.getElementById("submitReviewBtn").addEventListener("click", async () => {
      const userName = document.getElementById("reviewUserName").value.trim();
      const rating = document.getElementById("reviewRating").value;
      const comment = document.getElementById("reviewComment").value.trim();

      if (!userName || !comment) {
        alert("Iltimos, ismingiz va sharh matnini yozing!");
        return;
      }

      try {
        const res = await fetch(`/api/phones/${phone.id}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, rating, comment })
        });
        const data = await res.json();
        if (data.success) {
          showToast("Sharhingiz qabul qilindi!");
          openPhoneDetailModal(phone.id);
        } else {
          alert(data.error || "Xatolik yuz berdi");
        }
      } catch (err) {
        showToast("Sharh qabul qilindi (Mahalliy rejimda)");
      }
    });

    // Wire up modal header & bottom back/edit buttons
    const modalBackBtn = document.getElementById("modalBackBtn");
    if (modalBackBtn) {
      modalBackBtn.onclick = () => {
        phoneDetailModal.classList.remove("active");
        phoneModalBackdrop.classList.remove("active");
      };
    }
    const modalEditPhoneBtn = document.getElementById("modalEditPhoneBtn");
    if (modalEditPhoneBtn) {
      modalEditPhoneBtn.onclick = () => {
        openEditPhoneModal(phone.id);
      };
    }
    const modalBackBtnBottom = document.getElementById("modalBackBtnBottom");
    if (modalBackBtnBottom) {
      modalBackBtnBottom.onclick = () => {
        phoneDetailModal.classList.remove("active");
        phoneModalBackdrop.classList.remove("active");
      };
    }
    const modalEditBtnBottom = document.getElementById("modalEditBtnBottom");
    if (modalEditBtnBottom) {
      modalEditBtnBottom.onclick = () => {
        openEditPhoneModal(phone.id);
      };
    }
    const modalCompareBtnBottom = document.getElementById("modalCompareBtnBottom");
    if (modalCompareBtnBottom) {
      modalCompareBtnBottom.onclick = () => {
        toggleComparePhone(phone.id);
      };
    }

    phoneDetailModal.classList.add("active");
    phoneModalBackdrop.classList.add("active");
  }

  window.openPhoneDetailModal = openPhoneDetailModal;

  if (modalCloseBtn && phoneDetailModal && phoneModalBackdrop) modalCloseBtn.addEventListener("click", () => {
    phoneDetailModal.classList.remove("active");
    phoneModalBackdrop.classList.remove("active");
  });

  if (phoneModalBackdrop && phoneDetailModal) phoneModalBackdrop.addEventListener("click", () => {
    phoneDetailModal.classList.remove("active");
    phoneModalBackdrop.classList.remove("active");
  });

  // ==========================================
  // 8.5 SMARTFONNI TO'G'IRLASH MODALI (EDIT PHONE MODAL)
  // ==========================================
  function openEditPhoneModal(phoneId) {
    let phone = (typeof PHONES_DATABASE !== "undefined" ? PHONES_DATABASE.find(p => p.id === phoneId) : null)
      || state.phonesData.find(p => p.id === phoneId);
    if (!phone) return;

    let editModal = document.getElementById("siteEditPhoneModal");
    let editBackdrop = document.getElementById("siteEditPhoneModalBackdrop");
    if (!editModal) {
      const modalWrapper = document.createElement("div");
      modalWrapper.innerHTML = `
        <div class="modal-backdrop" id="siteEditPhoneModalBackdrop"></div>
        <div class="phone-modal edit-phone-modal" id="siteEditPhoneModal" style="max-width: 650px;">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <span class="brand-sub"><i class="fa-solid fa-pen-to-square text-cyan"></i> SMARTFON PARAMETRLARINI TAHRIRLASH</span>
              <h3 id="siteEditModalHeaderTitle">Smartfonni To'g'irlash</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <button class="modal-action-btn-pill modal-back-btn" id="siteEditModalBackTopBtn" title="Orqaga qaytish">
                <i class="fa-solid fa-arrow-left"></i> <span>Orqaga</span>
              </button>
              <button class="modal-close-btn" id="siteCloseEditModalBtn"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>
          <div class="modal-body" style="padding: 1.5rem;">
            <form id="siteEditPhoneForm">
              <input type="hidden" id="siteEditPhoneId">
              
              <div style="margin-bottom: 1.1rem;">
                <label style="display:block; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--accent-cyan);">
                  <i class="fa-solid fa-font"></i> 1. Ismini (Model Nomi) *
                </label>
                <input type="text" id="siteEditPhoneName" class="form-input" style="width: 100%; font-size: 1.05rem; font-weight: 700;" placeholder="Masalan: Samsung Galaxy S24 Ultra" required>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.1rem;">
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-tag"></i> Brendi *
                  </label>
                  <select id="siteEditPhoneBrand" class="form-select" style="width: 100%;">
                    <option value="Samsung">Samsung</option>
                    <option value="Apple">Apple</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Google">Google</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Asus">Asus</option>
                    <option value="Nothing">Nothing</option>
                    <option value="Sony">Sony</option>
                    <option value="Poco">Poco</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-dollar-sign"></i> Narxi (USD)
                  </label>
                  <input type="number" id="siteEditPhonePriceUSD" class="form-input" style="width: 100%;" placeholder="1199">
                </div>
              </div>

              <div style="margin-bottom: 1.1rem;">
                <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                  <i class="fa-solid fa-money-bill-wave"></i> Narxi (UZS)
                </label>
                <input type="text" id="siteEditPhonePriceUZS" class="form-input" style="width: 100%;" placeholder="15 500 000 so'm">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.1rem;">
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-camera"></i> Asosiy Kamera
                  </label>
                  <input type="text" id="siteEditPhoneCamera" class="form-input" style="width: 100%;" placeholder="200 MP, OIS">
                </div>
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-bolt"></i> Batareya & Zaryad
                  </label>
                  <input type="text" id="siteEditPhoneBattery" class="form-input" style="width: 100%;" placeholder="5000 mAh, 45W">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.1rem;">
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-microchip"></i> Chipset
                  </label>
                  <input type="text" id="siteEditPhoneChipset" class="form-input" style="width: 100%;" placeholder="Snapdragon 8 Gen 3">
                </div>
                <div>
                  <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                    <i class="fa-solid fa-desktop"></i> Displey
                  </label>
                  <input type="text" id="siteEditPhoneDisplay" class="form-input" style="width: 100%;" placeholder="6.8 Dynamic AMOLED">
                </div>
              </div>

              <div style="margin-bottom: 1.5rem;">
                <label style="display:block; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; color: var(--text-secondary);">
                  <i class="fa-solid fa-image"></i> Rasm URL Havolasi
                </label>
                <input type="url" id="siteEditPhoneImage" class="form-input" style="width: 100%;" placeholder="https://...">
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.2rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-secondary" id="siteCancelEditPhoneBtn">
                  <i class="fa-solid fa-arrow-left"></i> <span>Orqaga qaytish</span>
                </button>
                <button type="submit" class="btn btn-primary" id="siteSaveEditPhoneBtn">
                  <i class="fa-solid fa-floppy-disk"></i> <span>O'zgarishlarni Saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modalWrapper);
      editModal = document.getElementById("siteEditPhoneModal");
      editBackdrop = document.getElementById("siteEditPhoneModalBackdrop");

      const closeEditModal = () => {
        editModal.classList.remove("active");
        editBackdrop.classList.remove("active");
      };

      document.getElementById("siteCloseEditModalBtn").addEventListener("click", closeEditModal);
      document.getElementById("siteCancelEditPhoneBtn").addEventListener("click", closeEditModal);
      document.getElementById("siteEditModalBackTopBtn").addEventListener("click", closeEditModal);
      editBackdrop.addEventListener("click", closeEditModal);

      document.getElementById("siteEditPhoneForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("siteEditPhoneId").value;
        const currentTarget = (typeof PHONES_DATABASE !== "undefined" ? PHONES_DATABASE.find(p => p.id === id) : null)
          || state.phonesData.find(p => p.id === id);

        const updatedData = {
          name: document.getElementById("siteEditPhoneName").value.trim(),
          brand: document.getElementById("siteEditPhoneBrand").value,
          priceEstimateUSD: Number(document.getElementById("siteEditPhonePriceUSD").value) || (currentTarget ? currentTarget.priceEstimateUSD : 999),
          priceEstimateUZS: document.getElementById("siteEditPhonePriceUZS").value.trim() || (currentTarget ? currentTarget.priceEstimateUZS : "10 000 000 so'm"),
          image: document.getElementById("siteEditPhoneImage").value.trim() || (currentTarget ? currentTarget.image : ""),
        };

        const customEdits = getCustomPhoneEdits();
        customEdits[id] = Object.assign({}, customEdits[id] || {}, updatedData);
        
        const cameraVal = document.getElementById("siteEditPhoneCamera").value.trim();
        const batteryVal = document.getElementById("siteEditPhoneBattery").value.trim();
        const chipsetVal = document.getElementById("siteEditPhoneChipset").value.trim();
        const displayVal = document.getElementById("siteEditPhoneDisplay").value.trim();
        
        customEdits[id].quickSpecs = Object.assign({}, currentTarget ? currentTarget.quickSpecs : {}, {
          mainCamera: cameraVal || (currentTarget && currentTarget.quickSpecs && currentTarget.quickSpecs.mainCamera),
          battery: batteryVal || (currentTarget && currentTarget.quickSpecs && currentTarget.quickSpecs.battery),
          chipset: chipsetVal || (currentTarget && currentTarget.quickSpecs && currentTarget.quickSpecs.chipset),
          display: displayVal || (currentTarget && currentTarget.quickSpecs && currentTarget.quickSpecs.display)
        });

        localStorage.setItem("smartfon_custom_edits", JSON.stringify(customEdits));

        if (typeof PHONES_DATABASE !== "undefined") {
          const idx = PHONES_DATABASE.findIndex(p => p.id === id);
          if (idx !== -1) {
            PHONES_DATABASE[idx] = Object.assign({}, PHONES_DATABASE[idx], customEdits[id]);
          }
        }
        const stateIdx = state.phonesData.findIndex(p => p.id === id);
        if (stateIdx !== -1) {
          state.phonesData[stateIdx] = Object.assign({}, state.phonesData[stateIdx], customEdits[id]);
        }

        try {
          await fetch(`/api/phones/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customEdits[id])
          });
        } catch (err) {}

        closeEditModal();
        if (phonesGrid) {
          renderPhonesCatalog(state.phonesData);
        }
        showToast(`"${updatedData.name}" muvaffaqiyatli to'g'irlandi!`);

        if (phoneDetailModal && phoneDetailModal.classList.contains("active")) {
          openPhoneDetailModal(id);
        }
      });
    }

    document.getElementById("siteEditPhoneId").value = phone.id;
    document.getElementById("siteEditModalHeaderTitle").textContent = `${phone.name} — To'g'irlash`;
    document.getElementById("siteEditPhoneName").value = phone.name || "";
    document.getElementById("siteEditPhoneBrand").value = phone.brand || "Samsung";
    document.getElementById("siteEditPhonePriceUSD").value = phone.priceEstimateUSD || "";
    document.getElementById("siteEditPhonePriceUZS").value = phone.priceEstimateUZS || "";
    document.getElementById("siteEditPhoneCamera").value = (phone.quickSpecs && phone.quickSpecs.mainCamera) || (phone.camera && phone.camera.mainSensor && phone.camera.mainSensor.mp) || "";
    document.getElementById("siteEditPhoneBattery").value = (phone.quickSpecs && phone.quickSpecs.battery) || (phone.battery && phone.battery.capacity) || "";
    document.getElementById("siteEditPhoneChipset").value = (phone.quickSpecs && phone.quickSpecs.chipset) || (phone.performanceHardware && phone.performanceHardware.chipset) || "";
    document.getElementById("siteEditPhoneDisplay").value = (phone.quickSpecs && phone.quickSpecs.display) || (phone.display && phone.display.size) || "";
    document.getElementById("siteEditPhoneImage").value = phone.image || "";

    editModal.classList.add("active");
    editBackdrop.classList.add("active");
  }
  window.openEditPhoneModal = openEditPhoneModal;

  // ==========================================
  // 9. BUYER'S GUIDE & HARDWARE DEEP DIVE
  // ==========================================
  function renderBuyersGuide() {
    if (typeof BUYERS_GUIDE_DATA === "undefined") return;
    guideCardsGrid.innerHTML = "";
    BUYERS_GUIDE_DATA.goldenRules.forEach(rule => {
      const card = document.createElement("div");
      card.className = "guide-card";
      card.innerHTML = `
        <span class="guide-num-badge">0${rule.id}</span>
        <div class="guide-icon-wrap"><i class="${rule.icon}"></i></div>
        <h3 class="guide-card-title">${rule.title}</h3>
        <p class="guide-card-summary">${rule.summary}</p>
        <div class="guide-card-detail">${rule.detail}</div>
      `;
      guideCardsGrid.appendChild(card);
    });
  }

  function renderRecommendationsByNeed() {
    if (typeof BUYERS_GUIDE_DATA === "undefined") return;
    recsGridContainer.innerHTML = "";
    BUYERS_GUIDE_DATA.recommendationsByNeed.forEach(rec => {
      const card = document.createElement("div");
      card.className = "rec-card";
      card.innerHTML = `
        <div class="rec-header">
          <div class="rec-icon"><i class="${rec.icon}"></i></div>
          <h3>${rec.category}</h3>
        </div>
        <span class="rec-budget-badge"><i class="fa-solid fa-wallet"></i> Byudjet: ${rec.idealBudget}</span>
        
        <div class="rec-picks">
          <strong>Tavsiya etilgan modellar:</strong>
          <div class="picks-chips">
            ${rec.topPicks.map(p => `<span class="pick-chip">${p}</span>`).join("")}
          </div>
        </div>

        <div class="rec-musthaves">
          <strong style="color: var(--text-primary);"><i class="fa-solid fa-list-check text-cyan"></i> Bo'lishi shart apparat:</strong>
          <ul>
            ${rec.hardwareMustHaves.map(m => `<li>${m}</li>`).join("")}
          </ul>
        </div>

        <div class="rec-advice">
          <i class="fa-solid fa-lightbulb"></i> ${rec.advice}
        </div>
      `;
      recsGridContainer.appendChild(card);
    });
  }

  // Deep Dive Tabs Logic
  const tabBtns = document.querySelectorAll(".tech-tab-btn");
  const tabPanes = document.querySelectorAll(".tech-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // ==========================================
  // 10. SMART ADVISOR WIZARD (QUIZ)
  // ==========================================
  const quizStep1 = document.getElementById("quizStep1");
  const quizStep2 = document.getElementById("quizStep2");
  const quizStep3 = document.getElementById("quizStep3");
  const quizResult = document.getElementById("quizResult");
  const advisorResultCard = document.getElementById("advisorResultCard");
  const restartQuizBtn = document.getElementById("restartQuizBtn");

  document.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const step = parseInt(btn.getAttribute("data-step"));
      const value = btn.getAttribute("data-value");

      if (step === 1) {
        state.advisor.budget = value;
        quizStep1.classList.remove("active");
        quizStep2.classList.add("active");
      } else if (step === 2) {
        state.advisor.priority = value;
        quizStep2.classList.remove("active");
        quizStep3.classList.add("active");
      } else if (step === 3) {
        state.advisor.brand = value;
        quizStep3.classList.remove("active");
        calculateAdvisorResult();
      }
    });
  });

  async function calculateAdvisorResult() {
    let bestPhone;
    let alternatives = [];

    // Try backend API first
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.advisor)
      });
      if (res.ok) {
        const data = await res.json();
        bestPhone = data.recommended;
        alternatives = data.alternatives || [];
      }
    } catch (e) {}

    // Precise client-side matching (GitHub Pages & Fallback)
    if (!bestPhone) {
      const { budget, priority, brand } = state.advisor;
      const pool = (typeof PHONES_DATABASE !== "undefined" && PHONES_DATABASE.length > 0) ? [...PHONES_DATABASE] : [...state.phonesData];

      let minPrice = 0, maxPrice = Infinity;
      if (budget === "budget-entry") { minPrice = 200; maxPrice = 490; }
      else if (budget === "budget-mid") { minPrice = 450; maxPrice = 850; }
      else if (budget === "budget-premium") { minPrice = 850; maxPrice = 99999; }

      let budgetMatches = pool.filter(p => p.priceEstimateUSD >= minPrice && p.priceEstimateUSD <= maxPrice);
      let brandMatches = [];
      if (brand === "brand-apple") {
        brandMatches = (budgetMatches.length > 0 ? budgetMatches : pool).filter(p => p.brand === "Apple");
      } else if (brand === "brand-samsung") {
        brandMatches = (budgetMatches.length > 0 ? budgetMatches : pool).filter(p => p.brand === "Samsung");
      } else if (brand === "brand-xiaomi") {
        brandMatches = (budgetMatches.length > 0 ? budgetMatches : pool).filter(p => ["Xiaomi", "OnePlus", "Poco"].includes(p.brand));
      }

      let candidates = brandMatches.length > 0 ? brandMatches : (budgetMatches.length > 0 ? budgetMatches : pool);

      const scored = candidates.map(phone => {
        let score = phone.hardwareScores.overall;
        if (priority === "priority-gaming") {
          score = (phone.hardwareScores.performance * 0.6) + (phone.hardwareScores.display * 0.2) + (phone.hardwareScores.battery * 0.2);
          if (phone.id === "asus-rog-phone-8-pro") score += 5;
          if (phone.id === "poco-f6-pro") score += 3;
        } else if (priority === "priority-camera") {
          score = (phone.hardwareScores.camera * 0.7) + (phone.hardwareScores.display * 0.15) + (phone.hardwareScores.overall * 0.15);
          if (phone.id === "xiaomi-14-ultra" || phone.id === "vivo-x100-pro") score += 3;
        } else if (priority === "priority-battery") {
          score = (phone.hardwareScores.battery * 0.7) + (phone.hardwareScores.durability * 0.15) + (phone.hardwareScores.overall * 0.15);
          if (phone.id === "oneplus-12") score += 3;
        } else if (priority === "priority-durability") {
          score = (phone.hardwareScores.durability * 0.7) + (phone.hardwareScores.battery * 0.15) + (phone.hardwareScores.overall * 0.15);
          if (phone.quickSpecs && phone.quickSpecs.protection && phone.quickSpecs.protection.includes("Titanium")) score += 3;
        }
        return { phone, calculatedScore: score };
      });

      scored.sort((a, b) => b.calculatedScore - a.calculatedScore);
      bestPhone = scored[0].phone;
      alternatives = scored.slice(1, 3).map(s => s.phone);
    }

    // Dynamic reason text based on user priority
    let reasonText = "";
    if (state.advisor.priority === "priority-gaming") {
      reasonText = `Siz og'ir o'yinlar va maksimal tezlikni tanladingiz. Ushbu smartfon <strong>${bestPhone.quickSpecs.chipset}</strong> protsessori, kuchli sovitish bug'lanish kamerasi va <strong>${bestPhone.quickSpecs.display}</strong> ekrani tufayli geymingda eng yuqori apparat unumdorligiga (${bestPhone.hardwareScores.performance} ball) ega!`;
    } else if (state.advisor.priority === "priority-camera") {
      reasonText = `Siz professional fotografiya va videoni tanladingiz. Bu model <strong>${bestPhone.quickSpecs.mainCamera}</strong> apparatiga ega bo'lib, jismoniy sensor o'lchami va optik stabilizatsiya (OIS) bo'yicha o'z sinfida eng kuchli kamera balliga (${bestPhone.hardwareScores.camera} ball) ega!`;
    } else if (state.advisor.priority === "priority-battery") {
      reasonText = `Siz uzoqqa yetadigan batareya va tez zaryadlashni tanladingiz. Ushbu apparat <strong>${bestPhone.quickSpecs.battery}</strong> quvvatiga ega bo'lib, 1-2 kunga bemalol yetadigan eng mustahkam batareya ko'rsatkichiga (${bestPhone.hardwareScores.battery} ball) ega!`;
    } else if (state.advisor.priority === "priority-durability") {
      reasonText = `Siz mustahkamlik va suvdan himoyani tanladingiz. Bu telefon <strong>${bestPhone.quickSpecs.protection}</strong> jismoniy himoyasi bilan korpus chidamliligi bo'yicha (${bestPhone.hardwareScores.durability} ball) eng ishonchli variantdir!`;
    } else {
      reasonText = `Siz tanlagan byudjet va brend bo'yicha bu model jismoniy datchiklar o'lchami, sovitish tizimi va batareya samaradorligi bo'yicha eng yuqori apparat balliga ega.`;
    }

    const alternativesHtml = (alternatives && alternatives.length > 0) ? `
      <div style="margin-top: 1.8rem; padding-top: 1.2rem; border-top: 1px solid var(--border-color);">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.9rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
          <i class="fa-solid fa-scale-balanced text-cyan"></i> Shuningdek, e'tiborga loyiq muqobil variantlar:
        </h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          ${alternatives.map(alt => `
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.9rem; display: flex; gap: 0.8rem; align-items: center;">
              <img src="${alt.image}" alt="${alt.name}" style="width: 50px; height: 50px; object-fit: contain; background: var(--bg-surface); border-radius: 8px; padding: 4px;">
              <div style="flex: 1; min-width: 0;">
                <strong style="display: block; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${alt.name}</strong>
                <span style="font-size: 0.8rem; color: var(--accent-green); font-weight: 700;">${alt.priceEstimateUZS}</span>
                <div style="margin-top: 0.3rem;">
                  <button class="btn btn-secondary btn-sm" onclick="openPhoneDetailModal('${alt.id}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                    <i class="fa-solid fa-circle-info"></i> Tahlil
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    advisorResultCard.innerHTML = `
      <div class="result-header">
        <img src="${bestPhone.image}" alt="${bestPhone.name}" class="result-img">
        <div class="result-meta">
          <span class="card-badge" style="position: static; display: inline-block; margin-bottom: 0.3rem;"><i class="fa-solid fa-microchip"></i> ${bestPhone.badge}</span>
          <h3>${bestPhone.name}</h3>
          <span class="result-price-badge">${bestPhone.priceEstimateUZS} (~$${bestPhone.priceEstimateUSD})</span>
        </div>
      </div>

      <div class="result-hardware-reasons">
        <div class="reason-box">
          <i class="fa-solid fa-camera"></i>
          <strong>Kamera Apparati</strong>
          <p>${bestPhone.quickSpecs.mainCamera}</p>
        </div>
        <div class="reason-box">
          <i class="fa-solid fa-bolt"></i>
          <strong>Batareya & Zaryad</strong>
          <p>${bestPhone.quickSpecs.battery}</p>
        </div>
        <div class="reason-box">
          <i class="fa-solid fa-microchip"></i>
          <strong>Protsessor & Sovitish</strong>
          <p>${bestPhone.quickSpecs.chipset}</p>
        </div>
        <div class="reason-box">
          <i class="fa-solid fa-shield-halved"></i>
          <strong>Suv va Chang Himoyasi</strong>
          <p>${bestPhone.quickSpecs.protection}</p>
        </div>
      </div>

      <div style="background: rgba(139, 92, 246, 0.12); padding: 1.2rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-purple); margin-bottom: 1.5rem;">
        <strong style="color: var(--accent-purple);"><i class="fa-solid fa-check"></i> Nega aynan shu telefon tanlandi?</strong>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.3rem;">
          ${reasonText}
        </p>
      </div>

      ${alternativesHtml}

      <div style="display: flex; gap: 0.8rem; justify-content: flex-end; margin-top: 1.2rem;">
        <button class="btn btn-primary" onclick="openPhoneDetailModal('${bestPhone.id}')">
          <i class="fa-solid fa-circle-info"></i> To'liq Apparat Tahlilini Ko'rish
        </button>
      </div>
    `;

    quizResult.style.display = "block";
  }

  if (restartQuizBtn) restartQuizBtn.addEventListener("click", () => {
    quizResult.style.display = "none";
    quizStep1.classList.add("active");
    quizStep2.classList.remove("active");
    quizStep3.classList.remove("active");
    state.advisor = { step: 1, budget: null, priority: null, brand: null };
  });

  // Filter events
  if (categorySelect) categorySelect.addEventListener("change", (e) => {
    state.selectedCategory = e.target.value;
    fetchAndRenderPhones();
  });

  if (sortBySelect) sortBySelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    fetchAndRenderPhones();
  });

  if (filterIp68Chk) filterIp68Chk.addEventListener("change", (e) => {
    state.filterIp68 = e.target.checked;
    fetchAndRenderPhones();
  });

  if (filterOisChk) filterOisChk.addEventListener("change", (e) => {
    state.filterOis = e.target.checked;
    fetchAndRenderPhones();
  });

  if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", () => {
    state.selectedBrand = "all";
    state.selectedCategory = "all";
    state.searchQuery = "";
    state.filterIp68 = false;
    state.filterOis = false;
    phoneSearchInput.value = "";
    categorySelect.value = "all";
    filterIp68Chk.checked = false;
    filterOisChk.checked = false;
    hideSuggestions();
    renderBrandChips();
    fetchAndRenderPhones();
  });



  // ==========================================
  // 11. INITIAL RUN
  // ==========================================
  renderBrandChips();
  fetchAndRenderPhones();
  updateCompareUI();
  renderBuyersGuide();
  renderRecommendationsByNeed();
});
