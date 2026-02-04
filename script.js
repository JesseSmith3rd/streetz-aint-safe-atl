const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const toggle = document.querySelector(".navToggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("isOpen");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav a").forEach(a => {
  const href = a.getAttribute("href");
  if (href === current) a.classList.add("active");
});
