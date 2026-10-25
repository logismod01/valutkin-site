// Единое переключение тем для всех страниц сайта.
(function () {
    const STORAGE_KEY = "valutkin_theme";
    let storage = null;
    try { storage = window.localStorage; } catch (_) {}
    const readTheme = () => { try { return storage?.getItem(STORAGE_KEY) || "dark"; } catch (_) { return "dark"; } };
    const saveTheme = theme => { try { storage?.setItem(STORAGE_KEY, theme); } catch (_) {} };

    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        saveTheme(theme);
        document.querySelectorAll(".theme-btn").forEach(button => {
            button.classList.toggle("active", button.dataset.theme === theme);
            button.setAttribute("aria-pressed", button.dataset.theme === theme ? "true" : "false");
        });
    }

    applyTheme(readTheme());
    document.addEventListener("DOMContentLoaded", () => {
        applyTheme(readTheme());
        document.querySelectorAll(".theme-btn").forEach(button => {
            button.addEventListener("click", () => applyTheme(button.dataset.theme));
        });
    });
})();
