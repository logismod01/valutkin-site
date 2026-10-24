// Единое переключение тем для всех страниц сайта.
(function () {
    const STORAGE_KEY = "valutkin_theme";

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(STORAGE_KEY, theme);
        document.querySelectorAll(".theme-btn").forEach(button => {
            button.classList.toggle("active", button.dataset.theme === theme);
            button.setAttribute("aria-pressed", button.dataset.theme === theme ? "true" : "false");
        });
    }

    applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");
    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");
        document.querySelectorAll(".theme-btn").forEach(button => {
            button.addEventListener("click", () => applyTheme(button.dataset.theme));
        });
    });
})();
