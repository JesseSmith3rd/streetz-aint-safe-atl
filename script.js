// Dynamic Footer Copyright Year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Mobile Menu Drawer Toggle Logic
const toggle = document.querySelector(".navToggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("isOpen");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    
    // Accessibility icon change (☰ to ✕)
    toggle.textContent = isOpen ? "✕" : "☰";
    
    // Prevent body scrolling when fullscreen drawer is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
}

// Active Nav Link Highlighter (using pathname comparison)
const currentFile = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach(link => {
  const href = link.getAttribute("href");
  if (href === currentFile) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
