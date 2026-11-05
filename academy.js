(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    KEY = "valutkin_academy_progress_v1",
    today = () => new Date().toISOString().slice(0, 10),
    courses = [
      {
        id: "money",
        icon: "💰",
        title: "Личные финансы",
        desc: "Бюджет, подушка и финансовые цели",
        lessons: [
          L(
            "budget",
            "Бюджет без стресса",
            "Доход — это все деньги, которые вы получаете. Расходы полезно делить на обязательные, гибкие и накопления. План нужен не для запретов, а чтобы заранее выбрать приоритеты.",
            "Что лучше сделать сначала?",
            [
              "Потратить остаток",
              "Записать доходы и обязательные расходы",
              "Взять кредит",
            ],
            1,
          ),
          L(
            "reserve",
            "Финансовая подушка",
            "Подушка защищает от непредвиденных расходов. Её создают постепенно и хранят отдельно от денег на повседневные покупки.",
            "Для чего нужна подушка?",
            [
              "Для рискованных сделок",
              "Для неожиданных обязательных расходов",
              "Для ежедневных развлечений",
            ],
            1,
          ),
          L(
            "goals",
            "Цели и регулярность",
            "Большую цель проще разбить на небольшие регулярные пополнения. Реалистичный срок важнее слишком жёсткого плана.",
            "Что обычно эффективнее?",
            [
              "Регулярные посильные взносы",
              "Один случайный большой взнос",
              "Не считать прогресс",
            ],
            0,
          ),
        ],
      },
      {
        id: "markets",
        icon: "📈",
        title: "Основы рынков",
        desc: "Акции, валюты, риск и диверсификация",
        lessons: [
          L(
            "assets",
            "Чем отличаются активы",
            "Акция — доля компании, облигация — долговое обязательство, валюта — средство расчёта, а криптоактивы имеют отдельные технологические и рыночные риски.",
            "Что такое акция?",
            [
              "Гарантированный вклад",
              "Доля компании",
              "Государственная валюта",
            ],
            1,
          ),
          L(
            "risk",
            "Доходность и риск",
            "Высокая потенциальная доходность почти всегда связана с высоким риском. Прошлый рост не гарантирует будущий.",
            "Что гарантирует график прошлого роста?",
            ["Будущую прибыль", "Отсутствие риска", "Ничего из перечисленного"],
            2,
          ),
          L(
            "diversify",
            "Диверсификация",
            "Распределение между разными активами не убирает риск полностью, но снижает зависимость результата от одной компании или отрасли.",
            "Диверсификация — это…",
            [
              "Покупка одного лидера",
              "Распределение риска",
              "Гарантия прибыли",
            ],
            1,
          ),
        ],
      },
      {
        id: "security",
        icon: "🛡️",
        title: "Цифровая безопасность",
        desc: "Пароли, мошенничество и Web3",
        lessons: [
          L(
            "passwords",
            "Защита аккаунта",
            "Используйте уникальные пароли и менеджер паролей. Двухфакторная защита снижает риск захвата аккаунта.",
            "Какой пароль безопаснее?",
            [
              "Один для всех сайтов",
              "Уникальный случайный пароль",
              "Дата рождения",
            ],
            1,
          ),
          L(
            "phishing",
            "Фишинг и давление",
            "Мошенники создают срочность: требуют немедленно перевести деньги, назвать код или открыть ссылку. Остановитесь и проверьте источник отдельно.",
            "Что делать при срочной просьбе назвать код?",
            [
              "Назвать быстрее",
              "Проверить источник и никому не сообщать код",
              "Переслать друзьям",
            ],
            1,
          ),
          L(
            "seed",
            "Seed-фраза и кошелёк",
            "Seed-фраза полностью контролирует кошелёк. Настоящий сервис не просит вводить её для просмотра публичного баланса.",
            "Кому можно сообщить seed-фразу?",
            ["Поддержке в чате", "Сайту для проверки", "Никому"],
            2,
          ),
        ],
      },
      {
        id: "travel",
        icon: "✈️",
        title: "Финансы в поездке",
        desc: "Курсы, страховка и групповые расходы",
        lessons: [
          L(
            "exchange",
            "Обмен валюты",
            "Сравнивайте не только курс, но и комиссию, фиксированный сбор и итоговую сумму. Избегайте обмена у неизвестных лиц.",
            "Что сравнивать при обмене?",
            [
              "Только яркую вывеску",
              "Итоговую сумму со всеми комиссиями",
              "Только название валюты",
            ],
            1,
          ),
          L(
            "insurance",
            "Страховка и резерв",
            "Проверьте покрытие, исключения и контакты страховщика. Отдельный резерв помогает оплатить непредвиденные расходы до возмещения.",
            "Что важно проверить?",
            [
              "Только цвет полиса",
              "Покрытие и исключения",
              "Количество страниц",
            ],
            1,
          ),
          L(
            "split",
            "Расходы группы",
            "Записывайте плательщика и участников сразу. Итоговый расчёт должен быть понятен всем, но приложение не обязано выполнять реальный перевод денег.",
            "Что уменьшает споры?",
            ["Записи расходов", "Память одного участника", "Случайное деление"],
            0,
          ),
        ],
      },
    ],
    achievements = [
      ["first", "🌱", "Первый урок", (p) => p.done.length >= 1],
      ["five", "⭐", "Пять уроков", (p) => p.done.length >= 5],
      ["graduate", "🎓", "Выпускник", (p) => p.done.length >= 12],
      ["perfect", "🎯", "Точный ответ", (p) => p.correct >= 1],
      ["streak", "🔥", "Три дня подряд", (p) => streak(p.days) >= 3],
      [
        "safe",
        "🛡️",
        "Безопасность",
        (p) =>
          ["passwords", "phishing", "seed"].every((x) => p.done.includes(x)),
      ],
    ];
  function L(id, title, text, question, answers, correct) {
    return { id, title, text, question, answers, correct, time: "3 мин" };
  }
  let progress = {
      done: [],
      answers: 0,
      correct: 0,
      xp: 0,
      days: [],
      badges: [],
    },
    activeCourse = courses[0].id,
    current = null;
  try {
    progress = {
      ...progress,
      ...JSON.parse(localStorage.getItem(KEY) || "{}"),
    };
  } catch {}
  const save = () => {
      progress.days = [...new Set([...progress.days, today()])].slice(-60);
      for (const [id, , , test] of achievements)
        if (test(progress) && !progress.badges.includes(id))
          progress.badges.push(id);
      try {
        localStorage.setItem(KEY, JSON.stringify(progress));
      } catch {}
      render();
    },
    esc = (x) =>
      String(x).replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      ),
    toast = (t) => {
      const e = $("academy-toast");
      e.textContent = t;
      e.classList.add("show");
      clearTimeout(e.t);
      e.t = setTimeout(() => e.classList.remove("show"), 2200);
    };
  function streak(days) {
    const set = new Set(days),
      d = new Date();
    let n = 0;
    while (set.has(d.toISOString().slice(0, 10))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }
  function render() {
    const level = Math.floor(progress.xp / 100) + 1,
      part = progress.xp % 100;
    $("academy-level").textContent = level;
    $("academy-level-bar").style.width = `${part}%`;
    $("academy-xp").textContent = `${part} / 100 XP`;
    $("lessons-done").textContent = progress.done.length;
    $("quiz-score").textContent = progress.answers
      ? `${Math.round((progress.correct / progress.answers) * 100)}%`
      : "0%";
    $("learning-streak").textContent = streak(progress.days);
    $("academy-badges").textContent = progress.badges.length;
    $("course-nav").innerHTML = courses
      .map(
        (c) =>
          `<button class="${c.id === activeCourse ? "active" : ""}" data-course="${c.id}"><span>${c.icon}</span><div><b>${c.title}</b><small>${c.lessons.filter((x) => progress.done.includes(x.id)).length}/${c.lessons.length} уроков</small></div></button>`,
      )
      .join("");
    document.querySelectorAll("[data-course]").forEach(
      (b) =>
        (b.onclick = () => {
          activeCourse = b.dataset.course;
          render();
        }),
    );
    const course = courses.find((x) => x.id === activeCourse);
    $("course-head").innerHTML =
      `<span>${course.icon}</span><div><small>КУРС</small><h2>${course.title}</h2><p>${course.desc}</p></div>${course.lessons.every((x) => progress.done.includes(x.id)) ? "<button data-certificate>Сертификат</button>" : ""}`;
    $("course-head")
      .querySelector("[data-certificate]")
      ?.addEventListener("click", () => certificate(course));
    $("lesson-grid").innerHTML = course.lessons
      .map(
        (x, i) =>
          `<button class="lesson-tile ${progress.done.includes(x.id) ? "done" : ""}" data-lesson="${x.id}"><span>${progress.done.includes(x.id) ? "✓" : i + 1}</span><div><small>${x.time}</small><h3>${x.title}</h3><p>${x.text.slice(0, 85)}…</p></div></button>`,
      )
      .join("");
    document
      .querySelectorAll("[data-lesson]")
      .forEach((b) => (b.onclick = () => openLesson(b.dataset.lesson)));
    $("achievement-list").innerHTML = achievements
      .map(
        ([id, icon, title]) =>
          `<article class="${progress.badges.includes(id) ? "unlocked" : ""}"><span>${icon}</span><b>${title}</b><small>${progress.badges.includes(id) ? "Получено" : "Ещё не получено"}</small></article>`,
      )
      .join("");
  }
  function openLesson(id) {
    current = courses.flatMap((x) => x.lessons).find((x) => x.id === id);
    $("lesson-view").innerHTML =
      `<p class="eyebrow">ИНТЕРАКТИВНЫЙ УРОК · ${current.time}</p><h2>${esc(current.title)}</h2><div class="lesson-content">${esc(current.text)}</div><h3>${esc(current.question)}</h3><div class="lesson-answers">${current.answers.map((x, i) => `<button data-answer="${i}">${esc(x)}</button>`).join("")}</div><div id="lesson-feedback"></div>`;
    $("lesson-dialog").showModal();
    document
      .querySelectorAll("[data-answer]")
      .forEach((b) => (b.onclick = () => answer(Number(b.dataset.answer))));
  }
  function answer(index) {
    if ($("lesson-feedback").textContent) return;
    const right = index === current.correct;
    progress.answers++;
    if (right) progress.correct++;
    if (!progress.done.includes(current.id)) {
      progress.done.push(current.id);
      progress.xp += right ? 30 : 20;
    }
    $("lesson-feedback").innerHTML =
      `<b class="${right ? "correct" : "wrong"}">${right ? "Верно!" : "Не совсем."}</b><p>${right ? "Ответ показывает понимание главной идеи." : `Правильный ответ: ${esc(current.answers[current.correct])}.`}</p><button id="finish-lesson">Завершить урок</button>`;
    $("finish-lesson").onclick = () => {
      $("lesson-dialog").close();
      save();
      toast(`Урок завершён · +${right ? 30 : 20} XP`);
    };
  }
  function certificate(course) {
    $("certificate-title").textContent = course.title;
    $("certificate-dialog").showModal();
  }
  $("lesson-close").onclick = () => $("lesson-dialog").close();
  $("certificate-close").onclick = () => $("certificate-dialog").close();
  $("certificate-download").onclick = () => {
    const text = `Академия Валюткина\nКурс: ${$("certificate-title").textContent}\nДата: ${new Date().toLocaleDateString("ru-RU")}\n\nЛокальное подтверждение учебного прогресса. Не является официальной квалификацией.`,
      blob = new Blob([text], { type: "text/plain" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "valutkin-certificate.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $("continue-learning").onclick = () => {
    const lesson =
      courses
        .flatMap((x) => x.lessons)
        .find((x) => !progress.done.includes(x.id)) || courses[0].lessons[0];
    activeCourse = courses.find((x) => x.lessons.includes(lesson)).id;
    render();
    openLesson(lesson.id);
  };
  $("reset-progress").onclick = () => {
    if (confirm("Сбросить весь учебный прогресс?")) {
      progress = {
        done: [],
        answers: 0,
        correct: 0,
        xp: 0,
        days: [],
        badges: [],
      };
      save();
    }
  };
  render();
})();
