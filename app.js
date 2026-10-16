import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 🔑 اطلاعات پروژه VOID GFX
const SUPABASE_URL = "https://bqclfxdhxvswgmvdvtok.supabase.co";
const SUPABASE_KEY = "sb_secret_5WAe2N_9iR7Iq7W4LpYYeg_3Tziq-Ge"; / کلید منقضی شده و قابل استفاده نیست

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;

// =========================
// DOM Elements
// =========================
const assetGrid = document.getElementById("assetGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortButtons = document.querySelectorAll(".sort-btn");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// =========================
// State
// =========================
let currentCategory = "all";
let currentSort = "latest";
let currentSearch = "";
let currentPage = 0;
const assetsPerPage = 30;
let hasMoreAssets = true;
let isLoadingAssets = false;
let searchTimeout;

// =========================
// Helpers
// =========================
function escapeHTML(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return number.toString();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => toast.classList.remove("show"), 2800);
}

// =========================
// Load Assets
// =========================
async function loadAssets(reset = true) {
  if (!assetGrid || isLoadingAssets) return;
  isLoadingAssets = true;

  if (reset) {
    currentPage = 0;
    hasMoreAssets = true;
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
  }

  let query = window.supabase
    .from("assets")
    .select("*");

  const categoryMap = {
    rigs: "Rig",
    models: "Model",
    thumbnails: "Thumbnail",
    minecraft: "Minecraft",
    other: "Other"
  };

  if (currentCategory !== "all") {
    const dbCategory = categoryMap[currentCategory];
    if (dbCategory) query = query.eq("category", dbCategory);
  }

  if (currentSearch.trim()) {
    const term = currentSearch.trim().replace(/[%(),]/g, " ");
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (currentSort === "popular") {
    query = query.order("likes", { ascending: false, nullsFirst: false });
  } else if (currentSort === "downloads") {
    query = query.order("downloads", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = currentPage * assetsPerPage;
  const to = from + assetsPerPage - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    if (emptyState) {
      emptyState.style.display = "block";
      const title = emptyState.querySelector("h3");
      const text = emptyState.querySelector("p");
      if (title) title.textContent = "خطا در بارگذاری";
      if (text) text.textContent = "اتصال به پایگاه داده با مشکل مواجه شد.";
    }
    isLoadingAssets = false;
    return;
  }

  const assets = data || [];
  if (assets.length < assetsPerPage) hasMoreAssets = false;

  renderAssets(assets, !reset);

  if (loadMoreBtn) {
    loadMoreBtn.style.display = hasMoreAssets ? "block" : "none";
  }

  isLoadingAssets = false;
}

// =========================
// Render Assets
// =========================
function renderAssets(assets, append = false) {
  if (!assetGrid) return;
  if (!append) assetGrid.innerHTML = "";

  if (!assets || !assets.length) {
    if (!append && emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  assets.forEach(asset => {
    if (!asset || !asset.id) return;

    const card = document.createElement("article");
    card.className = "asset-card";

    const preview = asset.preview_url
      ? `<img src="${escapeHTML(asset.preview_url)}" alt="${escapeHTML(asset.title || "Asset")}" loading="lazy">`
      : `<div class="asset-preview-placeholder">NO PREVIEW</div>`;

    card.innerHTML = `
      <div class="asset-preview">${preview}</div>
      <div class="asset-info">
        <div class="asset-category">${escapeHTML(asset.category || "Asset")}</div>
        <div class="asset-title">${escapeHTML(asset.title || "Untitled")}</div>
        <div class="asset-meta">
          <div class="asset-stats">
            <span>♥ ${formatNumber(asset.likes)}</span>
            <span>↓ ${formatNumber(asset.downloads)}</span>
          </div>
        </div>
      </div>
    `;

    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `asset.html?id=${encodeURIComponent(asset.id)}`;
    });

    assetGrid.appendChild(card);
  });
}

// =========================
// Filter Buttons
// =========================
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentCategory = button.dataset.category || "all";
    loadAssets(true);
  });
});

// =========================
// Sort Buttons
// =========================
sortButtons.forEach(button => {
  button.addEventListener("click", () => {
    sortButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
    currentSort = button.dataset.sort || "latest";
    loadAssets(true);
  });
});

// =========================
// Search
// =========================
if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = searchInput.value.trim();
      loadAssets(true);
    }, 350);
  });
}

// =========================
// Load More
// =========================
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", async () => {
    if (!hasMoreAssets || isLoadingAssets) return;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = "در حال بارگذاری...";
    currentPage++;
    await loadAssets(false);
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = "نمایش بیشتر";
  });
}

// =========================
// Scroll Animation
// =========================
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(".section, .scroll-reveal, .scroll-grid")
  .forEach(el => observer.observe(el));

// =========================
// Initial Load
// =========================
loadAssets(true);

console.log("%cVOID GFX", "color:#8b5cf6;font-size:20px;font-weight:bold");
