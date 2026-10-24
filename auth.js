const USERS_KEY = "valutkin_demo_users";
const SESSION_KEY = "valutkin_demo_session";
const $ = id => document.getElementById(id);
const users = () => JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
const saveUsers = value => localStorage.setItem(USERS_KEY, JSON.stringify(value));
const normalizePhone = value => value.replace(/[^+\d]/g, "");
const validPassword = value => value.length >= 8 && /[A-Za-zА-Яа-я]/.test(value) && /\d/.test(value);
async function hash(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function message(text, error = false) { const el = $("auth-message"); el.textContent = text; el.className = `auth-message show ${error ? "error" : "success"}`; }
function show(view) {
  ["login", "register", "reset"].forEach(name => $(`${name}-form`).classList.toggle("hidden", name !== view));
  $("profile").classList.add("hidden");
  document.querySelector(".auth-tabs").classList.toggle("hidden", view === "reset");
  document.querySelectorAll("[data-view]").forEach(x => x.classList.toggle("active", x.dataset.view === view));
  $("form-title").textContent = view === "register" ? "Регистрация" : view === "reset" ? "Сброс пароля" : "Вход";
  $("auth-message").className = "auth-message";
}
function renderProfile(email) {
  const user = users().find(x => x.email === email); if (!user) return show("login");
  ["login-form", "register-form", "reset-form"].forEach(id => $(id).classList.add("hidden"));
  document.querySelector(".auth-tabs").classList.add("hidden"); $("profile").classList.remove("hidden");
  $("form-title").textContent = `Здравствуйте, ${user.name}`;
  $("profile-data").innerHTML = `<p>📧 ${user.email}</p><p>📱 ${user.phone}</p>`;
  $("bind-email").value = user.email; $("bind-phone").value = user.phone;
}
document.querySelectorAll("[data-view]").forEach(x => x.addEventListener("click", () => show(x.dataset.view)));
$("register-form").addEventListener("submit", async e => {
  e.preventDefault();
  const list = users(), email = $("reg-email").value.trim().toLowerCase(), phone = normalizePhone($("reg-phone").value), password = $("reg-password").value;
  if (!validPassword(password)) return message("Пароль должен содержать не менее 8 символов, букву и цифру.", true);
  if (phone.length < 10) return message("Проверьте номер телефона.", true);
  if (list.some(x => x.email === email || x.phone === phone)) return message("Почта или телефон уже зарегистрированы.", true);
  if (!window.grecaptcha) return message("CAPTCHA не загрузилась. Проверьте интернет и повторите.", true);
  if (!grecaptcha.getResponse()) return message("Подтвердите CAPTCHA.", true);
  list.push({ name: $("reg-name").value.trim(), email, phone, password: await hash(password), createdAt: new Date().toISOString() }); saveUsers(list);
  localStorage.setItem(SESSION_KEY, email); renderProfile(email); message("Аккаунт создан.");
});
$("login-form").addEventListener("submit", async e => {
  e.preventDefault(); const id = $("login-id").value.trim().toLowerCase();
  const user = users().find(x => x.email === id || x.phone === normalizePhone(id));
  if (!user || user.password !== await hash($("login-password").value)) return message("Неверная почта, телефон или пароль.", true);
  localStorage.setItem(SESSION_KEY, user.email); renderProfile(user.email);
});
$("reset-form").addEventListener("submit", async e => {
  e.preventDefault(); const list = users(), email = $("reset-email").value.trim().toLowerCase(), user = list.find(x => x.email === email);
  if (!user) return message("Аккаунт с такой почтой не найден.", true);
  const temporary = `Vk${Math.random().toString(36).slice(2, 8)}7`; user.password = await hash(temporary); saveUsers(list);
  message(`Временный пароль: ${temporary}`);
});
$("bind-form").addEventListener("submit", e => {
  e.preventDefault(); const current = localStorage.getItem(SESSION_KEY), list = users(), user = list.find(x => x.email === current);
  const email = $("bind-email").value.trim().toLowerCase(), phone = normalizePhone($("bind-phone").value);
  if (!user || phone.length < 10) return message("Проверьте контактные данные.", true);
  if (list.some(x => x !== user && (x.email === email || x.phone === phone))) return message("Эти контакты уже заняты.", true);
  user.email = email; user.phone = phone; saveUsers(list); localStorage.setItem(SESSION_KEY, email); renderProfile(email); message("Контакты обновлены.");
});
$("logout").addEventListener("click", () => { localStorage.removeItem(SESSION_KEY); show("login"); });
const session = localStorage.getItem(SESSION_KEY); if (session) renderProfile(session); else show("login");
