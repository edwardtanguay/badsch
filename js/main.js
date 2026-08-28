import { config } from "./config.js";
import { seeAlsoLinks } from "./data-parsed/see-also-links.js";
import { notes } from "./data-parsed/notes.js";

function initApp() {
  initThemeToggle();
  initNavigation();
  initFooter();
  initSeeAlsoLinks();
  initNotes();
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

/* Footer visibility based on config */
function initFooter() {
  const footer = document.querySelector("footer.bottom-bar");
  const container = document.querySelector(".container");

  if (!config.showFooter) {
    if (footer) {
      footer.style.display = "none";
    }
    if (container) {
      container.classList.add("no-footer");
    }
  }
}

/* Theme Switcher with sleek SVG icons */
function initThemeToggle() {
  const themeToggleBtn = document.querySelector("[data-theme-toggle]");
  if (!themeToggleBtn) return;

  const moonIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `;

  const sunIconSvg = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;

  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  function renderTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      themeToggleBtn.innerHTML = sunIconSvg;
      themeToggleBtn.setAttribute("aria-label", "Switch to light mode");
      themeToggleBtn.setAttribute("title", "Switch to light mode");
    } else {
      document.documentElement.removeAttribute("data-theme");
      themeToggleBtn.innerHTML = moonIconSvg;
      themeToggleBtn.setAttribute("aria-label", "Switch to dark mode");
      themeToggleBtn.setAttribute("title", "Switch to dark mode");
    }
  }

  renderTheme(initialTheme);

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    renderTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  });
}

/* Page Navigation & Dynamic Hamburger Logic */
function initNavigation() {
  const navContainer = document.querySelector(".site-nav__container");
  const hamburgerBtn = document.querySelector(".site-nav__hamburger");
  const navList = document.querySelector(".site-nav__list");
  const navLinks = document.querySelectorAll("[data-nav-target]");
  const pageViews = document.querySelectorAll(".page-view");

  // Conditional hamburger display: only show hamburger if there are 4 or more nav items
  const navItemsCount = navLinks.length;
  if (navItemsCount >= 4 && navContainer && hamburgerBtn) {
    navContainer.classList.add("has-hamburger");
    hamburgerBtn.style.display = "inline-flex";
  } else if (hamburgerBtn) {
    hamburgerBtn.style.display = "none";
  }

  if (hamburgerBtn && navList) {
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
      navList.classList.toggle("open");
    });
  }

  // Fast view switching
  function switchView(targetId) {
    const targetSection = document.getElementById(`view-${targetId}`);
    if (!targetSection) return;

    // Update active nav link
    navLinks.forEach((link) => {
      if (link.getAttribute("data-nav-target") === targetId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Close mobile menu if open
    if (navList && navList.classList.contains("open")) {
      navList.classList.remove("open");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    }

    // View visibility
    pageViews.forEach((view) => {
      if (view === targetSection) {
        view.classList.add("active");
        view.classList.add("visible");
      } else {
        view.classList.remove("visible");
        view.classList.remove("active");
      }
    });
  }

  // Handle initial view based on hash or default to welcome
  const rawHash = window.location.hash.replace("#", "");
  const initialTarget = rawHash && document.getElementById(`view-${rawHash}`) ? rawHash : "welcome";
  switchView(initialTarget);

  // Attach click listeners to nav links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-nav-target");
      if (targetId) {
        switchView(targetId);
        window.scrollTo({ top: 0, behavior: "smooth" });
        history.replaceState(null, "", `#${targetId}`);
      }
    });
  });
}

/**
 * Format link display text according to length and slash segments rule:
 * - Strip protocol & www
 * - If length <= 30 chars, show full clean URL
 * - If > 30 chars, drop domain and take rightmost whole slash segments <= 30 chars without mid-word cutting
 */
function formatLinkDisplayText(url) {
  const cleanUrl = url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");

  if (cleanUrl.length <= 30) {
    return cleanUrl;
  }

  const segments = cleanUrl.split("/");
  const pathSegments = segments.length > 1 ? segments.slice(1) : segments;

  const chosenSegments = [];
  for (let i = pathSegments.length - 1; i >= 0; i--) {
    const candidate = [pathSegments[i], ...chosenSegments].join("/");
    if (candidate.length <= 30 || chosenSegments.length === 0) {
      chosenSegments.unshift(pathSegments[i]);
    } else {
      break;
    }
  }

  return chosenSegments.join("/");
}

/* Format & Render See Also Links */
function initSeeAlsoLinks() {
  const container = document.getElementById("see-also-container");
  if (!container) return;

  if (!Array.isArray(seeAlsoLinks) || seeAlsoLinks.length === 0) {
    container.innerHTML = "<p class='text-muted'>No links available.</p>";
    return;
  }

  container.innerHTML = "";

  seeAlsoLinks.forEach((item) => {
    if (!item.url || !item.title) return;

    const displayText = formatLinkDisplayText(item.url);

    const linkItem = document.createElement("div");
    linkItem.className = "link-item";

    const anchor = document.createElement("a");
    anchor.className = "link-item__anchor";
    anchor.href = item.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    // Link icon SVG
    const linkIconSvg = `
      <svg class="link-item__icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </svg>
    `;
    anchor.innerHTML = `${linkIconSvg}<span>${displayText}</span>`;

    const titleSpan = document.createElement("span");
    titleSpan.className = "link-item__title";
    titleSpan.textContent = item.title;

    linkItem.appendChild(anchor);
    linkItem.appendChild(titleSpan);

    container.appendChild(linkItem);
  });
}

/* Escape HTML special characters */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Simplify URL for clean display */
function simplifyUrl(rawUrl) {
  try {
    const urlObj = new URL(rawUrl);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || rawUrl;
  }
}

/* Create formatted inline link (YouTube or External) */
function createFormattedLinkHtml(url, linkText) {
  const isYoutube = url.toLowerCase().includes("youtube.com") || url.toLowerCase().includes("youtu.be");
  let displayText = "";

  if (isYoutube) {
    displayText = linkText && linkText.trim() ? escapeHtml(linkText.trim()) : "youtube.com";
  } else {
    displayText = linkText && linkText.trim() ? escapeHtml(linkText.trim()) : escapeHtml(simplifyUrl(url));
  }

  const youtubeIconSvg = `
    <svg class="note-link-icon note-link-icon--youtube" viewBox="1.5 4.5 21 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="5" rx="4" fill="currentColor" stroke="none"></rect>
      <polygon points="10 9 15 12 10 15 10 9" fill="white" stroke="none"></polygon>
    </svg>
  `;

  const externalLinkIconSvg = `
    <svg class="note-link-icon note-link-icon--external" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;

  const icon = isYoutube ? youtubeIconSvg : externalLinkIconSvg;
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="note-link">${icon}<span>${displayText}</span></a>`;
}

/* Parse inline formatting (Markdown, emoticons, links, pronunciation) */
function renderFormattedContent(text) {
  if (!text) return "";

  let html = escapeHtml(text);

  // Emoticons: replace shortcodes with WhatsApp style emoji images
  const emojiMap = {
    ":thinking:": { file: "emoji-thinking.png", alt: "🤔" },
    ":stareyes:": { file: "emoji-stareyes.png", alt: "🤩" },
    ":smile:": { file: "emoji-smile.png", alt: "😊" },
    ":ohmygod:": { file: "emoji-ohmygod.png", alt: "😮" },
    ":whatever:": { file: "emoji-whatever.png", alt: "🤪" },
    ":shootingstar:": { file: "emoji-shootingstar.png", alt: "💫" },
    ":muscle:": { file: "emoji-muscle.png", alt: "💪" },
    ":thumbsup:": { file: "emoji-thumbsup.png", alt: "👍" },
    ":twohearts:": { file: "emoji-twohearts.png", alt: "💕" },
    ":redheart:": { file: "emoji-redheart.png", alt: "❤️" },
    ":water:": { file: "emoji-water.png", alt: "💦" },
    ":twinkle:": { file: "emoji-twinkle.png", alt: "✨" },
    ":laugh:": { file: "emoji-laugh.png", alt: "😅" },
    ":check:": { file: "emoji-check.png", alt: "✅" },
    ":ohno:": { file: "emoji-ohno.png", alt: "😬" },
    ":party:": { file: "emoji-party.png", alt: "🎉" }
  };

  Object.entries(emojiMap).forEach(([code, emoji]) => {
    const regex = new RegExp(code, "g");
    const imgHtml = `<img src="images/icons/${emoji.file}" alt="${emoji.alt}" title="${code}" class="font-emoji font-emoji--img" width="20" height="20" />`;
    html = html.replace(regex, imgHtml);
  });

  // 1. Markdown links: [title](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, title, url) => createFormattedLinkHtml(url, title)
  );

  // 2. Bare URLs (http:// or https://) - not preceded by href=" or ="
  html = html.replace(
    /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
    (_match, prefix, url) => `${prefix}${createFormattedLinkHtml(url)}`
  );

  // 3. Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="note-bold">$1</strong>');

  // 4. Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em class="note-italic">$1</em>');

  // 5. Pronunciation brackets: [text] at end of line
  html = html.replace(
    /\s*\[([^\]]+)\]\s*$/,
    ' <span class="note-pronunciation font-courier">[$1]</span>'
  );

  return html;
}

/* Format & Render Notes List */
function initNotes() {
  const container = document.getElementById("notes-container");
  if (!container) return;

  if (!Array.isArray(notes) || notes.length === 0) {
    container.innerHTML = "<p class='text-muted'>No notes available.</p>";
    return;
  }

  const listElement = document.createElement("ul");
  listElement.className = "notes-list";

  notes.forEach((item) => {
    const li = document.createElement("li");
    li.className = "note-item";
    li.style.marginLeft = `${item.indent * 1.5}rem`;

    const contentSpan = document.createElement("span");
    contentSpan.className = "note-content";
    contentSpan.innerHTML = renderFormattedContent(item.body);
    li.appendChild(contentSpan);

    if (item.image) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "note-image-wrap";

      if (item.image.startsWith("NOT_FOUND:")) {
        const missingTag = item.image.replace("NOT_FOUND:", "");
        const notFoundBadge = document.createElement("div");
        notFoundBadge.className = "note-image-not-found";
        notFoundBadge.textContent = `no image "${missingTag}" found`;
        imageContainer.appendChild(notFoundBadge);
      } else {
        const img = document.createElement("img");
        img.src = `images/outline/${item.image}`;
        img.alt = item.image;
        img.className = "note-image";
        img.loading = "lazy";
        imageContainer.appendChild(img);
      }

      li.appendChild(imageContainer);
    }

    listElement.appendChild(li);
  });

  container.innerHTML = "";
  container.appendChild(listElement);
}

