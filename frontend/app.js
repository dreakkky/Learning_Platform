// Learning Space - school platform prototype (front end only).
//
// How this file works:
//   1. D (below) holds all demo data and the current state of the app.
//   2. Small functions turn D into HTML strings (one function per screen or part).
//   3. render() puts the HTML on the page. Click handlers at the bottom change D
//      and call render() again.
//
// Nothing is saved: reload the page and D goes back to the values below.

// ---------------------------------------------------------------------------
// DEMO DATA AND APP STATE
// ---------------------------------------------------------------------------

// All demo data and the current state of the app live in this one object.
// Reading or changing D and then calling render() is how everything on the
// page works. In the full-stack version the data parts of D would come from
// the database through an API (see schema.sql).
var D = {
  // ---- Where the user is in the app ----
  role: 's', // 's' = student, 't' = teacher (chosen on the login screen)
  user: '', // username typed on the login screen
  course: null, // id of the open class, or null while the dashboard is shown
  tab: 'home', // open tab inside a class: 'home', 'books', 'zoom' or 'cards'
  hmode: 'news', // Home tab: 'news' (announcements) or 'tasks' (assignments)
  view: null, // teacher: id of the assignment whose submissions are open
  sel: null, // teacher: index of the student whose vocabulary is open
  tmode: 'words', // teacher vocabulary tab: 'words' (add words) or 'students'

  // ---- Student practice state ----
  mode: 'study', // 'study' (flip cards), 'quiz' or 'write' (type it)
  rev: false, // true = English to Bulgarian
  ci: 0, // index of the flashcard being studied
  last: -1, // index of the card asked last (so it is not asked twice in a row)
  sess: { n: 0, ok: 0, done: false }, // current round: answered, correct, finished
  q: null, // current question (null until a round starts)

  // ---- Classes ----
  // n / e = Bulgarian / English name, t / te = teacher, col = card color,
  // vocab = has a vocabulary tab, staff = teachers-only space, book = textbook link.
  // p, d and de are not shown any more.
  courses: [
    {
      id: 'bg',
      n: 'Български език',
      e: 'Bulgarian Language',
      t: 'г-жа Петрова',
      te: 'Mrs Petrova',
      p: 68,
      col: '#1b8c0a',
      vocab: true,
      book: 'https://example.com/uchebnik-bg',
      d: 'Правопис, граматика и работа с текст',
      de: 'Spelling, grammar and text work'
    },
    {
      id: 'hi',
      n: 'История',
      e: 'History',
      t: 'г-н Димитров',
      te: 'Mr Dimitrov',
      p: 45,
      col: '#c0001a',
      vocab: false,
      book: 'https://example.com/uchebnik-istoriya',
      d: 'България през Възраждането',
      de: 'Bulgaria in the Revival period'
    },
    {
      id: 'dir',
      n: 'Директор и учители',
      e: 'Director & Teachers',
      t: 'Само за учители',
      te: 'Teachers only',
      p: 0,
      col: '#3b6ea8',
      vocab: false,
      staff: true,
      book: '',
      d: '',
      de: ''
    }
  ],

  // ---- Assignments ----
  // due is a date like 14.10.; done = the demo student already handed it in.
  // sub is not used any more.
  tasks: [
    { id: 1, c: 'bg', n: 'Диктовка: правопис на ь и й', e: 'Dictation: spelling of ь and й', due: '14.10.', done: false, sub: 11 },
    { id: 2, c: 'bg', n: 'Упражнение: падежи и членуване', e: 'Exercise: cases and definite articles', due: '17.10.', done: true, sub: 19 },
    { id: 3, c: 'hi', n: 'Есе: Паисий Хилендарски', e: 'Essay: Paisius of Hilendar', due: '21.10.', done: false, sub: 6 }
  ],

  // ---- Submissions, keyed by assignment id ----
  // s = index of the student in students, fb = teacher feedback.
  subs: {
    1: [
      { s: 1, f: 'diktovka-ivan.pdf', u: '', note: '', when: ['вчера', 'yesterday'] },
      { s: 2, f: 'diktovka-elitsa.docx', u: '', note: 'Не бях сигурна за ь и й.', when: ['днес', 'today'] },
      { s: 4, f: 'diktovka-desi.pdf', u: '', note: '', when: ['днес', 'today'] }
    ],
    2: [
      { s: 0, f: 'uprazhnenie-maria.pdf', u: '', note: '', when: ['преди 2 дни', '2 days ago'], fb: { text: 'Много добре! Прегледай членуването в изречения 3 и 5.', files: [] } },
      { s: 3, f: 'uprazhnenie-nikolay.pdf', u: '', note: '', when: ['вчера', 'yesterday'] },
      { s: 4, f: 'uprazhnenie-desi.pdf', u: '', note: '', when: ['преди 2 дни', '2 days ago'] },
      { s: 2, f: 'uprazhnenie-elitsa.pdf', u: '', note: '', when: ['вчера', 'yesterday'] }
    ],
    3: [
      { s: 4, f: 'esse-desi.docx', u: '', note: '', when: ['днес', 'today'] }
    ]
  },

  // ---- Zoom meetings ----
  // d = weekday (0 = Monday), f / t = start / end time.
  zoom: [
    { id: 1, c: 'bg', d: 0, f: '09:00', t: '09:40', u: 'https://zoom.us/j/1111111111' },
    { id: 2, c: 'hi', d: 1, f: '10:00', t: '10:40', u: 'https://zoom.us/j/2222222222' },
    { id: 3, c: 'bg', d: 3, f: '09:00', t: '09:40', u: 'https://zoom.us/j/1111111111' },
    { id: 4, c: 'dir', d: 4, f: '19:00', t: '20:00', u: 'https://zoom.us/j/3333333333' }
  ],
  days: [
    ['Понеделник', 'Monday'],
    ['Вторник', 'Tuesday'],
    ['Сряда', 'Wednesday'],
    ['Четвъртък', 'Thursday'],
    ['Петък', 'Friday']
  ],

  // ---- Announcements ----
  // c = class id ('all' = every class), by = who posted (teachers space only),
  // g / e = title in Bulgarian / English, bg / en = text.
  news: [
    {
      c: 'dir',
      by: ['Директор', 'Director'],
      g: 'Среща на учителите',
      e: 'Teachers meeting',
      bg: 'Петък, 16.10., 19:00 ч. в Zoom.',
      en: 'Friday, 16 Oct, 7:00 pm on Zoom.'
    },
    {
      c: 'dir',
      by: ['г-н Димитров', 'Mr Dimitrov'],
      g: 'График за есенния концерт',
      e: 'Autumn concert schedule',
      bg: 'Моля, изпратете имената на участниците до сряда.',
      en: 'Please send participant names by Wednesday.'
    },
    {
      c: 'bg',
      g: 'Нова тема по правопис',
      e: 'New spelling topic',
      bg: 'Добавихме нови упражнения за ь и й.',
      en: 'We added new exercises on ь and й.'
    },
    {
      c: 'all',
      g: 'Родителска среща',
      e: 'Parent meeting',
      bg: 'Вторник, 13.10., 18:00 ч. в класната стая.',
      en: 'Tuesday, 13 Oct, 6:00 pm in the classroom.'
    },
    {
      c: 'hi',
      g: 'Конкурс за есе',
      e: 'Essay contest',
      bg: 'Тема: „Паисий и българската памет“. Срок до 21.10.',
      en: 'Topic: “Paisius and Bulgarian memory”. Deadline 21 Oct.'
    },
    {
      c: 'hi',
      g: 'Нова тема по история',
      e: 'New history topic',
      bg: 'Материалите за Възраждането са качени в учебника.',
      en: 'Materials on the Revival period are uploaded in the textbook.'
    }
  ],

  // ---- Flashcards of the demo student ----
  // pos = part of speech, g = gender, ex = example sentence,
  // m = meaning, t: true = the teacher added the word.
  cards: [
    {
      w: 'внимателен',
      m: 'careful, attentive',
      pos: 'adj',
      ex: 'Бъди внимателен на пътя.'
    },
    {
      w: 'възраждане',
      m: 'revival, renaissance',
      pos: 'noun',
      g: 'n',
      ex: 'Възраждането е важен период в историята на България.'
    },
    {
      w: 'правопис',
      m: 'spelling, orthography',
      pos: 'noun',
      g: 'm',
      ex: 'Правописът е трудна тема.'
    },
    {
      w: 'приятелство',
      m: 'friendship',
      t: true,
      pos: 'noun',
      g: 'n',
      ex: 'Нашето приятелство е силно.'
    }
  ],

  // ---- Made-up students for the teacher view ----
  // students[].w lists [index in pool, attempts, correct] for each practiced word.
  pool: [
    ['внимателен', 'careful'],
    ['възраждане', 'revival'],
    ['правопис', 'spelling'],
    ['приятелство', 'friendship'],
    ['училище', 'school'],
    ['история', 'history'],
    ['градина', 'garden'],
    ['съгласна', 'consonant']
  ],
  students: [
    { n: 'Мария Иванова', e: 'Maria Ivanova', last: ['днес', 'today'], w: [[0, 24, 21], [1, 18, 9], [2, 15, 14], [3, 9, 8], [5, 7, 5]] },
    { n: 'Иван Георгиев', e: 'Ivan Georgiev', last: ['преди 6 дни', '6 days ago'], w: [[4, 6, 2], [0, 3, 1], [6, 2, 1]] },
    { n: 'Елица Стоянова', e: 'Elitsa Stoyanova', last: ['вчера', 'yesterday'], w: [[2, 12, 7], [5, 10, 6], [1, 8, 3], [7, 5, 2]] },
    { n: 'Николай Колев', e: 'Nikolay Kolev', last: ['преди 3 дни', '3 days ago'], w: [[3, 5, 3], [4, 4, 3]] },
    { n: 'Десислава Тодорова', e: 'Desislava Todorova', last: ['днес', 'today'], w: [[0, 31, 29], [7, 22, 19], [6, 16, 15], [2, 14, 13], [3, 11, 10], [5, 9, 9]] }
  ],

  // ---- Old value, no longer used ----
  book: 'https://example.com/uchebnik'
};

// ---------------------------------------------------------------------------
// SMALL HELPERS
// ---------------------------------------------------------------------------

// Shortcut for document.querySelector.
var $ = function (s) {
  return document.querySelector(s);
};

// Show Bulgarian text with a small English translation next to it. If there is
// no English text, show just the Bulgarian.
function b(g, e) {
  return e ? g + ' <span class="en">' + e + '</span>' : g;
}

// Same as b() but as plain text, for places where HTML is not allowed
// (dropdown options and flashcards).
function bt(g, e) {
  return g + ' (' + e + ')';
}

// Make text safe to put inside HTML (turns < > & into harmless characters).
function esc(s) {
  var e = document.createElement('div');
  e.textContent = s;
  return e.innerHTML;
}

// Like esc(), and also safe inside an attribute value in double quotes.
function qe(x) {
  return esc(x || '').replace(/"/g, '&quot;');
}

// Find a class by its id.
function course(id) {
  return D.courses.filter(function (c) {
    return c.id === id;
  })[0];
}

// Class name with its English translation.
function cname(id) {
  var c = course(id);
  return b(c.n, c.e);
}

// Look up one entry of a list like POS or GEN by its short key.
function lk(L, k) {
  return L.filter(function (x) {
    return x[0] === k;
  })[0];
}

// Return a shuffled copy of a list.
function sh(a) {
  return a.slice().sort(function () {
    return Math.random() - .5;
  });
}

// Clean up a typed answer so it can be compared: lowercase, no . ! ? and no
// spaces at the ends.
function norm(x) {
  return (x || '').toLowerCase().replace(/[.!?]/g, '').trim();
}

// Tab names that are different for teachers.
var tabsT = { zoom: b('Zoom връзки', 'Zoom links'), cards: b('Думи на учениците', 'Student vocabulary') };

// Tab names inside a class.
var tabs = { home: b('Начало', 'Home'), zoom: b('Zoom информация', 'Zoom information'), books: b('Учебник', 'Textbook'), cards: b('Флашкарти', 'Flashcards') };

// ---------------------------------------------------------------------------
// DASHBOARD AND CLASS PAGE
// ---------------------------------------------------------------------------

// Dashboard (the first screen after login): greeting, the Staff room card for
// teachers, and a card for every class.
function dash() {
  var gr = (D.role === 's' ? (D.user ? b('Здравей, ' + esc(D.user) + '!', 'Hello, ' + esc(D.user) +
    '!') : b('Здравей, Мария!', 'Hello, Maria!')) : (D.user ? b('Добре дошли, ' + esc(D.user), 'Welcome, ' +
    esc(D.user)) : b('Добре дошли, г-жо Петрова', 'Welcome, Mrs Petrova')));
  function card(c) {
    return '<button class="ccard" data-course="' + c.id + '"><div class="band" style="background:' +
      c.col + '">' + b(c.n, c.e) + '</div><div class="cbody">' + cardInfo(c) + '</div></button>';
  }
  var g = '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">';
  var staff = D.role === 't' ? D.courses.filter(function (c) {
    return c.staff;
  }) : [];
  return '<h2>' + gr + '</h2>' + (staff.length ? '<h3 class="sec">' + b('Учителска стая', 'Staff room') +
    '</h3>' + g + staff.map(card).join('') + '</div>' : '') +
    '<h3 class="sec">' + b('Моите класове', 'My classes') + '</h3>' + g + D.courses.filter(function (c) {
    return !c.staff;
  }).map(card).join('') + '</div>';
}

// Text inside a class card on the dashboard: latest announcements plus what is
// due (or meetings in the teachers space).
function cardInfo(c) {
  var tl = D.role === 't' ? '' : '<div class="mute">' + b(c.t, c.te) + '</div>';
  var ann = D.news.filter(function (a) {
    return a.c === c.id || (a.c === 'all' && !c.staff);
  }).slice(0, 3);
  var annH = '<div class="ch">' + b('Съобщения', 'Announcements') + '</div>' + (ann.length ? ann.map(function (a) {
    return '<div class="ci">' + b(esc(a.g), esc(a.e)) + '</div>';
  }).join('') : '<div class="ci mute">' +
    b('Няма съобщения', 'No announcements') + '</div>');
  if (c.staff) {
    var mt = D.zoom.filter(function (z) {
      return z.c === c.id;
    }).sort(function (a, z) {
      return a.d - z.d || (a.f < z.f ? -1 : 1);
    }).slice(0, 3);
    return tl + annH + '<div class="ch">' + b('Срещи', 'Meetings') + '</div>' + (mt.length ? mt.map(function (z) {
      return '<div class="ci row"><span>' + b(D.days[z.d][0], D.days[z.d][1]) + '</span><span class="tag">' +
        z.f + '–' + z.t + '</span></div>';
    }).join('') : '<div class="ci mute">' + b('Няма срещи', 'No meetings') +
      '</div>');
  }
  var due = D.tasks.filter(function (t) {
    return t.c === c.id && (D.role === 't' || !t.done);
  }).sort(function (a, z) {
    return dueKey(a) - dueKey(z);
  }).slice(0, 3);
  return tl + annH +
    '<div class="ch">' + b('Срокове за предаване', 'Assignments due') + '</div>' +
    (due.length ? due.map(function (t) {
      return '<div class="ci row"><span>' + b(esc(t.n), esc(t.e || '')) + '</span><span class="tag">' +
        esc(t.due) + '</span></div>';
    }).join('') : '<div class="ci mute">' + b('Няма предстоящи срокове', 'Nothing due') +
      '</div>');
}

// Top of a class page: back button, colored banner and the tab bar. Which tabs
// show depends on the class (staff space has no textbook, only Bulgarian has
// vocabulary).
function courseHead(c) {
  var keys = c.staff ? ['home', 'zoom'] : ['home', 'books', 'zoom'].concat(c.vocab ? ['cards'] : []);
  return '<button class="btn alt" id="bk">← ' + b('Всички класове', 'All classes') +
    '</button><div class="cband" style="background:' + c.col + '"><h2>' + b(c.n, c.e) +
    '</h2>' + (D.role === 't' ? '' : '<span>' + b(c.t, c.te) + '</span>') + '</div>' +
    '<nav role="tablist" style="border:1px solid var(--line);border-top:0;border-radius:0 0 14px 14px">' +
    keys.map(function (k) {
      return '<button role="tab" data-t="' + k + '" aria-selected="' + (D.tab === k) + '">' +
        ((D.role === 't' && tabsT[k]) || tabs[k]) + '</button>';
    }).join('') + '</nav>';
}

// Content of the Home tab: announcements and assignments (only announcements
// in the teachers space).
function home() {
  return course(D.course).staff ? news() : homeTabs();
}

// The Announcements / Assignments buttons on a class Home tab, followed by the
// one that is selected.
function homeTabs() {
  var T = [['news', b('Съобщения', 'Announcements')], ['tasks', b('Задачи', 'Assignments')]];
  return '<div class="row" style="justify-content:flex-start;margin:0 0 14px">' +
    T.map(function (m) {
      return '<button class="btn' + (D.hmode === m[0] ? '' : ' alt') + '" data-hmode="' + m[0] +
        '">' + m[1] + '</button>';
    }).join('') + '</div>' + (D.hmode === 'news' ? news() : tasks());
}

// Turn a due date like 14.10. into a number so assignments can be sorted by
// date.
function dueKey(t) {
  var m = /(\d+)\.(\d+)/.exec(t.due || '');
  return m ? (+m[2]) * 100 + (+m[1]) : 9999;
}

// Old top menu. Not used any more because the tabs now live inside each class.
// Safe to delete.
function nav() {
  $('#nav').innerHTML = Object.keys(tabs).filter(function (k) {
    return k !== 'ins' || D.role === 't';
  }).map(function (k) {
    return '<button role="tab" data-t="' + k + '" aria-selected="' + (D.tab === k) +
      '">' + ((D.role === 't' && tabsT[k]) || tabs[k]) + '</button>';
  }).join('');
}

// ---------------------------------------------------------------------------
// ANNOUNCEMENTS
// ---------------------------------------------------------------------------

// Announcements of the open class. Teachers also get a New announcement button
// and Delete buttons.
function news() {
  var list = D.news.map(function (a, i) {
    if (a.c !== D.course && !(a.c === 'all' && !course(D.course).staff))
      return '';
    return '<div class="card"><div class="row"><h3>' +
      b(esc(a.g), esc(a.e)) + '</h3>' + (D.role === 't' ? '<button class="btn alt" data-dn="' +
      i + '">' + b('Изтрий', 'Delete') + '</button>' : '') + '</div>' + byLine(a) + '<p class="mute">' +
      b(esc(a.bg), esc(a.en)) + '</p></div>';
  }).join('');
  var add = D.role === 't' ? '<button class="btn" id="newN">+ ' + b('Ново съобщение', 'New announcement') +
    '</button>' : '';
  return '<div class="row"><h2>' + b('Съобщения', 'Announcements') + '</h2>' + add +
    '</div><div class="list">' + list + '</div>';
}

// Pop-up form for writing a new announcement.
function newsForm() {
  return '<h3>' + b('Ново съобщение', 'New announcement') + '</h3><label for="n1">' +
    b('Заглавие', 'Title') + '</label><input id="n1"><label for="n2">' + b('Текст', 'Message') +
    '</label><textarea id="n2" rows="4"></textarea><p class="row"><button class="btn alt" id="cx">' +
    b('Отказ', 'Cancel') + '</button><button class="btn" id="pn">' + b('Публикувай', 'Post') +
    '</button></p>';
}

// Small "Posted by" line under an announcement (shown in the teachers space
// only).
function byLine(a) {
  if (!a.by || !course(D.course).staff)
    return '';
  var n = a.by[0] === a.by[1] ? esc(a.by[0]) : b(esc(a.by[0]), esc(a.by[1]));
  return '<div class="mute" style="margin-top:2px;font-size:.88rem">' +
    b('Публикувано от', 'Posted by') + ' ' + n + '</div>';
}

// ---------------------------------------------------------------------------
// ASSIGNMENTS
// ---------------------------------------------------------------------------

// Assignments of the open class. A teacher who pressed View sees the
// submissions page instead.
function tasks() {
  if (D.role === 't' && D.view !== null && task(D.view))
    return subsView(task(D.view));
  var add = D.role === 't' ? '<button class="btn" id="newT">+ ' + b('Нова задача', 'New assignment') +
    '</button>' : '';
  return '<div class="row"><h2>' + b('Задачи', 'Assignments') + '</h2>' + add + '</div><div class="list">' +
    D.tasks.filter(function (t) {
      return t.c === D.course;
    }).map(D.role === 't' ? ttask : taskRow).join('') + '</div>';
}

// One assignment as the student sees it: title, due date, instructions, files,
// teacher feedback and the Submit button.
function taskRow(t) {
  var right = D.role === 's'
    ? (t.done ? '<span class="tag">' + b('Предадена', 'Submitted') + '</span>' : '<button class="btn" data-sub="' +
      t.id + '">' + b('Предай', 'Submit') + '</button>')
    : '<span class="tag">' + b(subsOf(t.id).length + ' от ' + D.students.length + ' предали', subsOf(t.id).length +
      ' of ' + D.students.length + ' submitted') + '</span>';
  return '<div class="card row"><div><h3>' + b(esc(t.n), esc(t.e || '')) + '</h3><span class="mute">' +
    cname(t.c) + ' · ' + b('срок', 'due') + ' ' + t.due + '</span>' + (t.desc ? '<p style="margin:6px 0 0">' +
    b(esc(t.desc), esc(t.de || '')) + '</p>' : '') + fileLinks(t) + fbBox(t) + '</div>' + right +
    '</div>';
}

// One assignment as the teacher sees it, with Edit, View and Delete buttons.
function ttask(t) {
  return '<div class="card"><div class="row"><div><h3>' + b(esc(t.n), esc(t.e || '')) +
    '</h3><span class="mute">' + cname(t.c) + ' · ' + b('срок', 'due') + ' ' + t.due + '</span></div><span class="tag">' +
    b(subsOf(t.id).length + ' от ' + D.students.length + ' предали', subsOf(t.id).length +
      ' of ' + D.students.length + ' submitted') + '</span></div>' + (t.desc ? '<p>' + b(esc(t.desc), esc(t.de || '')) +
    '</p>' : '') + fileLinks(t) + '<div class="row" style="justify-content:flex-start;margin-top:10px"><button class="btn alt" data-edit="' +
    t.id + '">' + b('Редактирай', 'Edit') + '</button><button class="btn alt" data-view="' +
    t.id + '">' + b('Преглед', 'View') + '</button><button class="btn alt" data-del="' +
    t.id + '">' + b('Изтрий', 'Delete') + '</button></div></div>';
}

// Pop-up form for creating or editing an assignment (title, due date,
// instructions and attached files).
function taskForm(t) {
  t = t || {};
  return '<h3>' + b(t.id ? 'Редактиране на задача' : 'Нова задача', t.id ? 'Edit assignment' : 'New assignment') +
    '</h3>' +
    '<label for="tn">' + b('Заглавие', 'Title') + '</label><input id="tn" value="' +
    qe(t.n) + '">' +
    '<label for="td">' + b('Срок', 'Due date') + '</label><input id="td" value="' +
    qe(t.due) + '" placeholder="напр. 25.10. / e.g. 25.10.">' +
    '<label for="tdb">' + b('Указания за учениците', 'Instructions for students') +
    '</label><textarea id="tdb" rows="3">' + esc(t.desc || '') + '</textarea>' +
    '<label for="tf">' + b('Прикачи файлове (по избор)', 'Attach files (optional)') +
    '</label><input type="file" id="tf" multiple>' +
    (t.files && t.files.length ? '<div class="mute" style="margin-top:8px">' + b('Прикачени файлове:', 'Attached files:') +
      '</div>' + t.files.map(function (x, i) {
      return '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;cursor:pointer;color:var(--ink)"><input type="checkbox" class="kf" value="' +
        i + '" checked style="width:auto">' + esc(x.n) + '</label>';
    }).join('') : '') +
    '<p class="row"><button class="btn alt" id="cx">' + b('Отказ', 'Cancel') + '</button><button class="btn" id="ct" data-id="' +
    (t.id || '') + '">' + b('Запази', 'Save') + '</button></p>';
}

// Find an assignment by its id.
function task(id) {
  return D.tasks.filter(function (a) {
    return a.id == id;
  })[0];
}

// Paperclip links for attached files.
function fileLinks(t) {
  return t.files && t.files.length ? '<div class="row" style="justify-content:flex-start;gap:8px;margin-top:8px">' +
    t.files.map(function (x) {
      return '<a class="tag" style="text-decoration:none" href="' + qe(x.u) + '" download="' +
        qe(x.n) + '" target="_blank" rel="noopener">📎 ' + esc(x.n) + '</a>';
    }).join('') +
    '</div>' : '';
}

// All submissions for one assignment.
function subsOf(id) {
  return D.subs[id] || [];
}

// Number of submissions that still have no teacher feedback (not shown on
// screen any more).
function pending() {
  var n = 0;
  D.tasks.forEach(function (t) {
    subsOf(t.id).forEach(function (x) {
      if (!x.fb)
        n++;
    });
  });
  return n;
}

// ---------------------------------------------------------------------------
// SUBMISSIONS AND TEACHER FEEDBACK
// ---------------------------------------------------------------------------

// Teacher page for one assignment: every student, their submission, and the
// feedback buttons.
function subsView(t) {
  var rows = D.students.map(function (st, i) {
    var sb = subsOf(t.id).filter(function (x) {
      return x.s === i;
    })[0];
    if (!sb)
      return '<div class="card row"><h3>' + b(st.n, st.e) + '</h3><span class="tag late">' +
        b('Не е предадена', 'Not submitted') + '</span></div>';
    var file = sb.f ? (sb.u ? '<a class="tag" style="text-decoration:none" href="' +
      qe(sb.u) + '" download="' + qe(sb.f) + '" target="_blank" rel="noopener">📎 ' + esc(sb.f) +
      '</a>' : '<span class="tag">📎 ' + esc(sb.f) + '</span>') : '';
    return '<div class="card"><div class="row"><h3>' + b(st.n, st.e) + '</h3><span class="tag">' +
      b('Предадена', 'Submitted') + ' · ' + b(sb.when[0], sb.when[1]) + '</span></div>' +
      (file ? '<div class="row" style="justify-content:flex-start;gap:8px;margin-top:8px">' +
        file + '</div>' : '') + (sb.note ? '<p class="mute" style="margin:8px 0 0">' + esc(sb.note) +
      '</p>' : '') + fbHtml(sb) +
      '<p style="margin:12px 0 0"><button class="btn alt" data-fb="' + t.id +
      '|' + i + '">' + (sb.fb ? b('Редактирай коментара', 'Edit feedback') : b('Добави коментар или файл', 'Add comment or file')) +
      '</button></p></div>';
  }).join('');
  return '<button class="btn alt" id="vb">← ' + b('Всички задачи', 'All assignments') +
    '</button><h2 style="margin-top:14px">' + b(esc(t.n), esc(t.e || '')) + '</h2><p class="mute">' +
    cname(t.c) + ' · ' + b('срок', 'due') + ' ' + t.due + ' · ' + b(subsOf(t.id).length + ' от ' +
    D.students.length + ' предали', subsOf(t.id).length + ' of ' + D.students.length +
    ' submitted') + '</p><div class="list">' + rows + '</div>';
}

// Pop-up form where the teacher writes feedback and attaches files for one
// submission.
function fbForm(tid, si) {
  var sb = subsOf(tid).filter(function (x) {
    return x.s === si;
  })[0], fb = sb.fb || {}, st = D.students[si];
  return '<h3>' + b('Коментар за', 'Feedback for') + ' ' + b(st.n, st.e) + '</h3><label for="fbt">' +
    b('Какво трябва да се поправи', 'What needs correcting') + '</label><textarea id="fbt" rows="4">' +
    esc(fb.text || '') + '</textarea><label for="fbf">' + b('Прикачи файл (по избор)', 'Attach a file (optional)') +
    '</label><input type="file" id="fbf" multiple>' +
    (fb.files && fb.files.length ? '<div class="mute" style="margin-top:8px">' +
      b('Прикачени файлове:', 'Attached files:') + '</div>' + fb.files.map(function (x, i) {
      return '<label style="display:flex;gap:8px;align-items:center;margin:4px 0;cursor:pointer;color:var(--ink)"><input type="checkbox" class="kf" value="' +
        i + '" checked style="width:auto">' + esc(x.n) + '</label>';
    }).join('') : '') +
    '<p class="row"><button class="btn alt" id="cx">' + b('Отказ', 'Cancel') + '</button><button class="btn" id="sfb" data-id="' +
    tid + '|' + si + '">' + b('Запази', 'Save') + '</button></p>';
}

// Green "Teacher feedback" box with the comment and files.
function fbHtml(sb) {
  if (!sb || !sb.fb)
    return '';
  return '<div style="margin-top:10px;padding:12px;border-radius:12px;background:var(--green-t)"><strong>' +
    b('Коментар от учителя', 'Teacher feedback') + '</strong>' + (sb.fb.text ? '<p style="margin:6px 0 0;white-space:pre-wrap">' +
    esc(sb.fb.text) + '</p>' : '') + fileLinks({ files: sb.fb.files }) + '</div>';
}

// Feedback box for the demo student's own submission (student 0 is the
// logged-in demo student).
function fbBox(t) {
  return fbHtml(subsOf(t.id).filter(function (x) {
    return x.s === 0;
  })[0]);
}

// ---------------------------------------------------------------------------
// TEXTBOOK
// ---------------------------------------------------------------------------

// Textbook tab: link to the class textbook. Teachers can change the link.
function books() {
  var c = course(D.course);
  return '<h2>' + b('Учебник', 'Textbook') + '</h2><p class="mute">' + b('Бърз достъп до учебника на класа.', 'Quick access to the class textbook.') +
    '</p>' +
    '<div class="card" style="margin-top:14px"><h3>' + b(c.n, c.e) + '</h3><p class="mute">' +
    b('Дигитален учебник и допълнителни материали', 'Digital textbook and extra materials') +
    '</p><a class="btn" style="display:inline-block;text-decoration:none" href="' +
    qe(c.book) + '" target="_blank" rel="noopener">' + b('Отвори учебника', 'Open textbook') +
    '</a></div>' +
    (D.role === 't' ? '<div class="card" style="margin-top:14px"><label for="bu">' +
      b('Адрес на сайта с учебника', 'Textbook website address') + '</label><input id="bu" value="' +
      qe(c.book) + '"><p class="mute">' + b('Временен адрес – ще бъде заменен с реалния сайт.', 'Placeholder address – will be replaced with the real site.') +
      '</p></div>' : '');
}

// ---------------------------------------------------------------------------
// ZOOM
// ---------------------------------------------------------------------------

// Zoom information tab of the open class.
function zoomTab() {
  var tch = D.role === 't', st = course(D.course).staff;
  return '<div class="row"><h2>' + b(tch ? 'Zoom връзки' : 'Zoom информация', tch ? 'Zoom links' : 'Zoom information') +
    '</h2>' + (tch ? '<button class="btn" id="newZ">+ ' + b('Добави връзка', 'Add link') +
    '</button>' : '') + '</div>' +
    '<p class="mute">' + b(tch ? (st ? 'Добави връзки за срещите на учителите.' : 'Добави връзка за всеки предмет и час. Учениците я виждат веднага.') : 'Всички часове са онлайн. Натисни „Влез в час“, за да отвориш Zoom.', tch ? (st ? 'Add links for teacher meetings.' : 'Add a link for each subject and class time. Students see it right away.') : 'All classes are online. Tap “Join class” to open Zoom.') +
    ' ' + b('Връзките са примерни.', 'Links are placeholders.') + '</p>' +
    (zsorted().length ? '<div class="list">' + zsorted().map(zcard).join('') + '</div>' : '<p class="mute">' +
      b('Още няма добавени часове.', 'No classes added yet.') + '</p>');
}

// Zoom meetings of the open class, ordered by weekday and start time.
function zsorted() {
  return D.zoom.filter(function (z) {
    return z.c === D.course;
  }).sort(function (a, c) {
    return a.d - c.d || (a.f < c.f ? -1 : 1);
  });
}

// One Zoom meeting card. Students get a Join button, teachers get Edit and
// Delete.
function zcard(z) {
  var c = course(z.c), dy = D.days[z.d], tch = D.role === 't';
  return '<div class="card"><div class="row"><div><h3>' + b(c.n, c.e) + '</h3><span class="mute">' +
    b(dy[0], dy[1]) + ' · ' + z.f + '–' + z.t + '</span></div>' +
    (tch && !course(z.c).staff ? '' : '<a class="btn" style="text-decoration:none;text-align:center" href="' +
      qe(z.u) + '" target="_blank" rel="noopener">' + b(course(z.c).staff ? 'Влез в срещата' : 'Влез в час', course(z.c).staff ? 'Join meeting' : 'Join class') +
      '</a>') + '</div>' +
    '<p class="mute" style="word-break:break-all;margin:8px 0 0">' + esc(z.u) +
    '</p>' +
    (tch ? '<div class="row" style="justify-content:flex-start;margin-top:10px"><button class="btn alt" data-ez="' +
      z.id + '">' + b('Редактирай', 'Edit') + '</button><button class="btn alt" data-dz="' +
      z.id + '">' + b('Изтрий', 'Delete') + '</button></div>' : '') + '</div>';
}

// Pop-up form for adding or editing a Zoom meeting.
function zform(z) {
  z = z || {};
  return '<h3>' + b(course(D.course).staff ? (z.id ? 'Редактиране на среща' : 'Нова среща') : (z.id ? 'Редактиране на час' : 'Нов онлайн час'), course(D.course).staff ? (z.id ? 'Edit meeting' : 'New meeting') : (z.id ? 'Edit class' : 'New online class')) +
    '</h3>' +
    '<label for="zd">' + b('Ден', 'Day') + '</label><select id="zd">' + D.days.map(function (d, i) {
    return '<option value="' + i + '"' + (z.d === i ? ' selected' : '') + '>' + d[0] + ' / ' + d[1] +
      '</option>';
  }).join('') + '</select>' +
    '<label for="zf">' + b('От', 'From') + '</label><input type="time" id="zf" value="' +
    (z.f || '09:00') + '">' +
    '<label for="zt">' + b('До', 'To') + '</label><input type="time" id="zt" value="' +
    (z.t || '09:40') + '">' +
    '<label for="zu">' + b('Zoom връзка', 'Zoom link') + '</label><input id="zu" value="' +
    qe(z.u) + '" placeholder="https://zoom.us/j/...">' +
    '<p class="row"><button class="btn alt" id="cx">' + b('Отказ', 'Cancel') + '</button><button class="btn" id="sz" data-id="' +
    (z.id || '') + '">' + b('Запази', 'Save') + '</button></p>';
}

// Find a Zoom meeting by its id.
function zget(id) {
  return D.zoom.filter(function (a) {
    return a.id == id;
  })[0];
}

// ---------------------------------------------------------------------------
// WORD DETAILS (part of speech, gender, example sentence)
// ---------------------------------------------------------------------------

// Parts of speech: [key, Bulgarian, English].
var POS = [['noun', 'съществително', 'noun'], ['verb', 'глагол', 'verb'], ['adj', 'прилагателно', 'adjective'], ['adv', 'наречие', 'adverb'], ['pron', 'местоимение', 'pronoun'], ['prep', 'предлог', 'preposition'], ['other', 'друго', 'other']];

// Grammatical gender: [key, Bulgarian, English].
var GEN = [['m', 'мъжки род', 'masculine'], ['f', 'женски род', 'feminine'], ['n', 'среден род', 'neuter']];

// <option> list for a dropdown, starting with an empty choice.
function opts(L) {
  return '<option value="">—</option>' + L.map(function (x) {
    return '<option value="' + x[0] + '">' + bt(x[1], x[2]) + '</option>';
  }).join('');
}

// Small tags for a word: part of speech and gender.
function tagsHtml(c) {
  var p = lk(POS, c.pos), g = lk(GEN, c.g);
  return (p ? '<span class="tag">' + b(p[1], p[2]) +
    '</span> ' : '') + (g ? '<span class="tag">' + b(g[1], g[2]) + '</span> ' : '');
}

// The optional form fields for part of speech, gender and example sentence.
// pre makes the ids unique: "w" for students, "cw" for the teacher class-word
// form.
function detailForm(pre) {
  return '<label for="' + pre + 'p">' + b('Част на речта (по избор)', 'Part of speech (optional)') +
    '</label><select id="' + pre + 'p">' + opts(POS) + '</select><label for="' + pre + 'g">' +
    b('Род (по избор)', 'Gender (optional)') + '</label><select id="' + pre + 'g">' +
    opts(GEN) + '</select><label for="' + pre + 'e">' + b('Примерно изречение (по избор)', 'Example sentence (optional)') +
    '</label><input id="' + pre + 'e">';
}

// Read those three fields back from the form.
function detailVals(pre) {
  return { pos: $('#' + pre + 'p').value, g: $('#' + pre + 'g').value, ex: $('#' + pre + 'e').value.trim() };
}

// Extra info shown on the back of a flashcard: tags and example sentence.
function flashDet(c) {
  var p = lk(POS, c.pos), g = lk(GEN, c.g), t = [];
  if (p)
    t.push(bt(p[1], p[2]));
  if (g)
    t.push(bt(g[1], g[2]));
  var s = t.join(' · ');
  return (s || c.ex) ? '<em style="display:block;font:400 .85rem Nunito,system-ui,sans-serif;margin-top:8px">' +
    esc(s) + (s && c.ex ? '<br>' : '') + esc(c.ex || '') + '</em>' : '';
}

// Tags and example sentence shown under a word in lists.
function extra(c) {
  return (tagsHtml(c) ? '<div style="margin-top:6px">' + tagsHtml(c) + '</div>' : '') +
    (c.ex ? '<p class="mute" style="margin:6px 0 0"><em>' + esc(c.ex) + '</em></p>' : '');
}

// ---------------------------------------------------------------------------
// STUDENT FLASHCARDS TAB
// ---------------------------------------------------------------------------

// Student "Flashcards" tab: mode buttons, practice area, add-word form and
// progress list. Teachers get tcards() instead.
function cards() {
  if (D.role === 't')
    return tcards();
  var M = [['study', b('Карти', 'Flashcards')], ['quiz', b('Тест', 'Quiz')], ['write', b('Писане', 'Type it')]];
  var bar = '<div class="row" style="justify-content:flex-start;margin:14px 0">' +
    M.map(function (m) {
      return '<button class="btn' + (D.mode === m[0] ? '' : ' alt') + '" data-mode="' + m[0] +
        '">' + m[1] + '</button>';
    }).join('') + '<label style="margin:0;display:flex;gap:6px;align-items:center;cursor:pointer"><input type="checkbox" id="rv" style="width:auto"' +
    (D.rev ? ' checked' : '') + '>' + b('Обратна посока: английски → български', 'Reverse: English → Bulgarian') +
    '</label></div>';
  var prog = D.cards.map(function (c) {
    var t = c.tr || 0, a = t ? Math.round(100 * c.ok / t) : 0, l = lvl(c);
    return '<div class="card' +
      (c.t ? ' tcard' : '') + '"><div class="row"><h3>' + esc(c.w) + ' <span class="en">' +
      esc(c.m) + '</span></h3><span>' + (c.t ? '<span class="tag teacher">' + b('От учителя', 'From teacher') +
      '</span> ' : '') + '<span class="tag' + l[0] + '">' + l[1] + '</span></span></div>' + extra(c) +
      '<div class="bar"><i style="width:' + a + '%"></i></div><div class="mute">' + b(t ? (c.ok || 0) +
      ' от ' + t + ' верни' : 'Още не е упражнявана', t ? (c.ok || 0) + ' of ' + t + ' correct' : 'Not practiced yet') +
      '</div></div>';
  }).join('');
  return '<h2>' + b('Моите флашкарти', 'My flashcards') + '</h2>' + bar + practice() +
    (D.mode !== 'study' ? '' :
      '<div class="card" style="margin-top:20px"><h3>' + b('Нова дума', 'New word') +
        '</h3><label for="w">' + b('Дума (на български)', 'Word (in Bulgarian)') + '</label><input id="w"><label for="m">' +
        b('Значение на английски', 'Meaning in English') + '</label><input id="m">' +
        detailForm('w') + '<p><button class="btn" id="ac">' + b('Добави карта', 'Add card') +
        '</button></p></div>' +
        '<h3 class="sec">' + b('Моят напредък', 'My progress') + '</h3><div class="list">' +
        prog + '</div>');
}

// Practice area: the flip card (study), a question (quiz or type it) or the
// final score of a round.
function practice() {
  if (!D.cards.length)
    return '<p class="mute center">' + b('Все още нямаш карти. Добави първата си дума отдолу.', 'No cards yet. Add your first word below.') +
      '</p>';
  if (D.mode === 'study') {
    var c = D.cards[D.ci];
    return '<p class="mute">' + b('Натисни картата, за да я обърнеш. Прелистването не се брои за напредък – опитай Теста или Писането!', 'Tap a card to flip it. Flipping does not count toward progress – try the Quiz or Type it!') +
      '</p>' +
      '<div class="flash' + (c.t ? ' tw' : '') + '" id="fl" tabindex="0" role="button" aria-label="Flip card"><div><span class="f">' +
      esc(qa(c)) + '</span><span class="b"><p style="margin:0">' + esc(aa(c)) + flashDet(c) +
      '</p></span></div></div>' +
      (c.t ? '<p class="center"><span class="tag teacher">' + b('Дума от учителя', 'Word from your teacher') +
        '</span></p>' : '') + '<div class="center"><button class="btn alt" id="pv">' +
      b('Назад', 'Back') + '</button> <span class="mute">' + (D.ci + 1) + ' / ' + D.cards.length +
      '</span> <button class="btn alt" id="nx">' + b('Напред', 'Next') + '</button> ' +
      (c.t ? '' : '<button class="btn alt" id="rm">' + b('Изтрий', 'Delete') + '</button>') +
      '</div>';
  }
  if (!D.q || !D.cards[D.q.i])
    startQ();
  if (D.sess.done)
    return '<div class="card center"><h2>' + b(D.sess.ok + ' от 10 верни', D.sess.ok +
      ' of 10 correct') + '</h2><p class="mute">' + b('Резултатите са записани и учителят ги вижда.', 'Your results are saved and your teacher can see them.') +
      '</p><button class="btn" id="again">' + b('Упражнявай пак', 'Practice again') +
      '</button></div>';
  var q = D.q, c = D.cards[q.i], ok = q.res, h = '<p class="mute">' + b('Въпрос ' + (D.sess.n +
    (ok === null ? 1 : 0)) + ' от 10', 'Question ' + (D.sess.n + (ok === null ? 1 : 0)) + ' of 10') +
    '</p><div class="card center"><h2 style="font-size:1.8rem">' + esc(qa(c)) + '</h2></div>';
  if (D.mode === 'quiz')
    h += '<div class="list">' + q.opts.map(function (o, k) {
      var st = ok === null ? '' : (o === aa(c) ? ' good' : (k === q.pick ? ' bad' : ''));
      return '<button class="choice' +
        st + '" data-opt="' + k + '"' + (ok === null ? '' : ' disabled') + '>' + esc(o) + '</button>';
    }).join('') +
      '</div>';
  else
    h += '<form id="wf" class="card" style="margin-top:12px"><label for="wa">' +
      b('Напиши отговора', 'Type the answer') + '</label><input id="wa" autocomplete="off"' +
      (ok === null ? '' : ' disabled value="' + qe(q.typed) + '"') + '>' + (ok === null ? '<p><button class="btn" type="submit">' +
      b('Провери', 'Check') + '</button></p>' : '') + '</form>';
  if (ok !== null)
    h += '<div class="card" style="margin-top:12px;background:' +
      (ok ? 'var(--green-t)' : 'var(--rose-t)') + '"><strong>' + (ok ? b('Вярно!', 'Correct!') : b('Не точно.', 'Not quite.')) +
      '</strong> ' + (ok ? '' : b('Верният отговор е: ', 'The correct answer is: ') + esc(aa(c))) +
      '</div><p><button class="btn" id="nq">' + (D.sess.n >= 10 ? b('Виж резултата', 'See results') : b('Следващ въпрос', 'Next question')) +
      '</button></p>';
  return h;
}

// Progress label for a word: New, Learning, or Mastered (80% or more correct
// after at least 3 tries).
function lvl(c) {
  var t = c.tr || 0;
  if (!t)
    return ['', b('Нова', 'New')];
  var a = c.ok / t;
  return a >= .8 && t >= 3 ? ['', b('Усвоена', 'Mastered')] : [' late', b('В процес', 'Learning')];
}

// ---------------------------------------------------------------------------
// PRACTICE: QUIZ AND TYPE IT
// ---------------------------------------------------------------------------

// The prompt shown to the student: Bulgarian, or English when the direction is
// reversed.
function qa(c) {
  return D.rev ? c.m : c.w;
}

// The correct answer: English, or Bulgarian when the direction is reversed.
function aa(c) {
  return D.rev ? c.w : c.m;
}

// All typed answers that count as correct (meanings can be separated by a
// comma or semicolon).
function alts(c) {
  return aa(c).split(/[,;]/).map(norm).filter(Boolean);
}

// Pick the next question: a random one among the 3 words the student knows
// least, never the same word twice in a row. Quiz mode also builds the 4
// answer choices.
function newQ() {
  if (!D.cards.length)
    return null;
  var L = D.cards.map(function (c, i) {
    return { i: i, s: c.tr ? c.ok / c.tr : -1 };
  }).filter(function (o) {
    return o.i !== D.last;
  }).sort(function (a, c) {
    return a.s - c.s;
  }).slice(0, 3);
  var i = L.length ? L[Math.floor(Math.random() * L.length)].i : 0;
  D.last = i;
  var c = D.cards[i], q = { i: i, res: null, opts: [] };
  if (D.mode === 'quiz') {
    var seen = {};
    seen[norm(aa(c))] = 1;
    var d = sh(D.cards.map(aa).concat(D.pool.map(function (p) {
      return D.rev ? p[0] : p[1];
    }))).filter(function (x) {
      var k = norm(x);
      if (seen[k])
        return false;
      seen[k] = 1;
      return true;
    }).slice(0, 3);
    q.opts = sh([aa(c)].concat(d));
  }
  return q;
}

// Start a new round of 10 questions.
function startQ() {
  D.sess = { n: 0, ok: 0, done: false };
  D.q = newQ();
}

// Record one answer for a word. These attempt and correct counts are what the
// teacher sees.
function note(c, ok) {
  c.tr = (c.tr || 0) + 1;
  if (ok)
    c.ok = (c.ok || 0) + 1;
  D.sess.n++;
  if (ok)
    D.sess.ok++;
}

// The student clicked an answer choice in the quiz.
function answerQ(k) {
  var q = D.q;
  if (!q || q.res !== null)
    return;
  var c = D.cards[q.i];
  q.pick = k;
  q.res = (q.opts[k] === aa(c));
  note(c, q.res);
  render();
}

// The student pressed Check in Type it.
function checkW() {
  var q = D.q;
  if (!q || q.res !== null)
    return;
  var c = D.cards[q.i], v = norm($('#wa').value);
  if (!v)
    return;
  q.typed = v;
  q.res = (alts(c).indexOf(v) >= 0 || v === norm(aa(c)));
  note(c, q.res);
  render();
}

// Go to the next question, or finish the round after 10.
function nextQ() {
  if (D.sess.n >= 10) {
    D.sess.done = true;
  } else {
    D.q = newQ();
  }
  render();
}

// ---------------------------------------------------------------------------
// TEACHER: STUDENT VOCABULARY TAB
// ---------------------------------------------------------------------------

// Teacher "Student vocabulary" tab: the two inner tabs, the student list and
// one student's detail page with the practice and accuracy bars.
function tcards() {
  var note = '<p class="mute">' + b('Демонстрационни данни. Резултатите от ученическия изглед се показват тук при Мария Иванова.', 'Demo data. Results from the student view appear here under Maria Ivanova.') +
    '</p>';
  if (D.sel !== null) {
    var st = D.students[D.sel], sm = stat(D.sel), cm = Math.max.apply(null, D.students.map(function (x, i) {
      return stat(i).tr;
    })), L = wl(D.sel).sort(function (a, c) {
      return c.tr - a.tr;
    }), mx = Math.max.apply(null, L.map(function (w) {
      return w.tr;
    })), live = D.sel === 0 && D.cards.some(function (c) {
      return c.tr;
    }), last = live ? ['днес', 'today'] : st.last;
    var rows = L.map(function (w) {
      var ac = Math.round(100 * w.ok / w.tr), low = ac < 60 && w.tr >= 5;
      return '<div class="card"><div class="row"><h3>' + w.w + ' <span class="en">' +
        w.m + '</span></h3>' + (low ? '<span class="tag late">' + b('Нужда от внимание', 'Needs attention') +
        '</span>' : '') + '</div>' +
        meter(b('Упражнения', 'Practice'), b(w.tr + ' опита', w.tr + ' attempts'), Math.round(100 * w.tr / mx), '') +
        meter(b('Верни отговори', 'Correct answers'), ac + '%', ac, ac < 60 ? 'var(--rose)' : '') +
        '</div>';
    }).join('');
    return '<button class="btn alt" id="sb">← ' + b('Всички ученици', 'All students') +
      '</button><h2 style="margin-top:14px">' + b(st.n, st.e) + '</h2>' +
      '<p><span class="tag">' + b(sm.n + ' думи', sm.n + ' words') + '</span> <span class="tag">' +
      b(sm.tr + ' опита', sm.tr + ' attempts') + '</span> <span class="tag' + (sm.acc < 60 ? ' late' : '') +
      '">' + b(sm.acc + '% верни', sm.acc + '% correct') + '</span></p>' +
      '<div class="card" style="margin:12px 0"><h3>' + b('Общо', 'Overall') + '</h3>' +
      meter(b('Колко упражнява', 'How much they practice'), b(sm.tr + ' опита', sm.tr +
        ' attempts'), Math.round(100 * sm.tr / cm), '') + meter(b('Колко от отговорите са верни', 'How many answers are correct'), sm.acc +
      '%', sm.acc, sm.acc < 60 ? 'var(--rose)' : '') + '</div>' +
      '<p class="mute">' + b('Последно упражнение: ' + last[0], 'Last practiced: ' +
      last[1]) + '. ' + b('Броят се само опити от Теста и Писането. Общата лента „Упражнява“ сравнява с най-активния ученик, а лентите при думите – с най-упражняваната дума на ученика.', 'Only Quiz and Type it attempts count. The overall practice bar compares with the most active student; the bars for each word compare with that student most practiced word.') +
      '</p><div class="list">' + rows + '</div>' + note;
  }
  var bar = '<div class="row" style="justify-content:flex-start;margin:14px 0">' +
    [['words', b('Добавяне на думи', 'Add words')], ['students', b('Ученици', 'Students')]].map(function (m) {
      return '<button class="btn' + (D.tmode === m[0] ? '' : ' alt') + '" data-tmode="' + m[0] +
        '">' + m[1] + '</button>';
    }).join('') + '</div>';
  if (D.tmode === 'words')
    return '<h2>' + b('Думи на учениците', 'Student vocabulary') +
      '</h2>' + bar + classWords();
  return '<h2>' + b('Думи на учениците', 'Student vocabulary') + '</h2>' + bar + '<p class="mute">' +
    b('Избери ученик, за да видиш думите му и как се справя.', 'Choose a student to see their words and how they are doing.') +
    '</p>' + note +
    '<div class="list">' + D.students.map(function (st, i) {
    var sm = stat(i), last = (i === 0 && D.cards.some(function (c) {
      return c.tr;
    })) ? ['днес', 'today'] : st.last;
    return '<button class="card row" data-st="' + i + '" style="width:100%;text-align:left;cursor:pointer"><div><h3>' +
      b(st.n, st.e) + '</h3><span class="mute">' + b('Последно: ' + last[0], 'Last: ' + last[1]) +
      '</span></div><div><span class="tag">' + b(sm.n + ' думи', sm.n + ' words') + '</span> <span class="tag">' +
      b(sm.tr + ' опита', sm.tr + ' attempts') + '</span> <span class="tag' + (sm.acc < 60 ? ' late' : '') +
      '">' + sm.acc + '%</span></div></button>';
  }).join('') + '</div>';
}

// Teacher "Add words" tab: form for a new class word and the list of words
// already added.
function classWords() {
  var L = D.cards.map(function (c, i) {
    return { c: c, i: i };
  }).filter(function (o) {
    return o.c.t;
  }).reverse(), fl = D.flash;
  D.flash = null;
  var form = '<div class="card"><h3>' + b('Нова дума за целия клас', 'New word for the whole class') +
    '</h3><p class="mute">' + b('Думата се появява в картите на всеки ученик. Учениците могат да добавят и свои думи.', 'The word appears in every student flashcard set. Students can still add their own words.') +
    '</p><label for="tw">' + b('Дума (на български)', 'Word (in Bulgarian)') + '</label><input id="tw"><label for="tm">' +
    b('Значение на английски', 'Meaning in English') + '</label><input id="tm">' +
    detailForm('cw') + '<p><button class="btn" id="atw">' + b('Добави за всички ученици', 'Add for all students') +
    '</button></p></div>';
  var banner = fl ? '<div class="card" style="margin-top:12px;background:var(--green-t)"><strong>✓ ' +
    b('Добавена е думата', 'Word added') + ': ' + esc(fl) + '</strong><div class="mute">' +
    b('Всички ученици я виждат в своите флашкарти.', 'All students now see it in their flashcards.') +
    '</div></div>' : '';
  var list = L.length ? L.map(function (o, k) {
    var fresh = fl && k === 0;
    return '<div class="card"><div class="row"><h3>' + esc(o.c.w) +
      ' <span class="en">' + esc(o.c.m) + '</span></h3><button class="btn alt" data-dw="' +
      o.i + '">' + b('Изтрий', 'Delete') + '</button></div>' + extra(o.c) + '</div>';
  }).join('') : '<p class="mute">' +
    b('Още няма добавени думи.', 'No class words yet.') + '</p>';
  return form + banner + '<h3 class="sec">' + b('Думи за класа', 'Class words') +
    ' (' + L.length + ')</h3><div class="list">' + list + '</div>';
}

// List of words for one student with their practice numbers. For the demo
// student it also includes what was practiced live in this session.
function wl(i) {
  var st = D.students[i], m = {};
  st.w.forEach(function (w) {
    var p = D.pool[w[0]];
    m[p[0]] = { w: p[0], m: p[1], tr: w[1], ok: w[2] };
  });
  if (i === 0)
    D.cards.forEach(function (c) {
      if (c.tr) {
        var x = m[c.w] || (m[c.w] = { w: c.w, m: c.m, tr: 0, ok: 0 });
        x.tr += c.tr;
        x.ok += c.ok;
      }
    });
  return Object.keys(m).map(function (k) {
    return m[k];
  });
}

// Totals for one student: number of words, attempts and accuracy percent.
function stat(i) {
  var L = wl(i), tr = 0, ok = 0;
  L.forEach(function (w) {
    tr += w.tr;
    ok += w.ok;
  });
  return { tr: tr, acc: tr ? Math.round(100 * ok / tr) : 0, n: L.length };
}

// A labeled progress bar: label, value text, percent and an optional color.
function meter(l, v, p, c) {
  return '<div style="margin-top:8px"><div class="row mute"><span>' + l + '</span><strong>' +
    v + '</strong></div><div class="bar" style="margin:4px 0 0"><i style="width:' +
    p + '%;' + (c ? 'background:' + c : '') + '"></i></div></div>';
}

// ---------------------------------------------------------------------------
// DRAWING THE PAGE
// ---------------------------------------------------------------------------

// Redraw the page for the current state: the dashboard, or the open class with
// its tab. Call it after any change to D.
function render() {
  var cc = D.course ? course(D.course) : null;
  if (cc && D.tab === 'cards' && !cc.vocab)
    D.tab = 'home';
  $('#main').innerHTML = cc ? courseHead(cc) + '<div id="cc" style="margin-top:16px">' +
    { home: home, zoom: zoomTab, books: books, cards: cards }[D.tab]() + '</div>' : dash();
  var wa = $('#wa');
  if (wa && D.q && D.q.res === null && D.mode === 'write')
    wa.focus();
}

// Show some HTML inside the pop-up window.
function openDlg(h) {
  $('#dform').innerHTML = h;
  $('#dlg').showModal();
}

// ---------------------------------------------------------------------------
// EVENT HANDLERS
// ---------------------------------------------------------------------------

// All button clicks. The handler finds the clicked button and runs the action
// that matches it, one block per button.
document.addEventListener('click', function (e) {
  // t = the button that was clicked (or the element itself if it is not inside a button)
  var t = e.target.closest('button,[data-st]') || e.target, x;

  // Open a class card from the dashboard
  if (t.dataset.course) {
    D.course = t.dataset.course;
    D.tab = 'home';
    D.hmode = 'news';
    D.sel = null;
    D.view = null;
    render();
    window.scrollTo(0, 0);
    return;
  }

  // Back to the dashboard ("All classes" button)
  if (t.id === 'bk') {
    D.course = null;
    D.tab = 'home';
    D.sel = null;
    D.view = null;
    render();
    return;
  }

  // Switch tab inside a class (Home, Textbook, Zoom, Flashcards)
  if (t.dataset.t) {
    D.tab = t.dataset.t;
    D.sel = null;
    D.view = null;
    render();
    return;
  }

  // Log out and show the login screen
  if (t.id === 'lo') {
    D.course = null;
    document.body.classList.add('out');
    window.scrollTo(0, 0);
    return;
  }

  // Old student/teacher switch buttons (no longer on the page)
  if (t.id === 'rs') {
    D.role = 's';
    if (D.tab === 'ins')
      D.tab = 'home';
    render();
    return;
  }
  if (t.id === 'rt') {
    D.role = 't';
    render();
    return;
  }

  // Student presses Submit on an assignment: show the submit form
  if (t.dataset.sub) {
    var id = +t.dataset.sub;
    openDlg('<h3>' + b('Предаване на задача', 'Submit assignment') + '</h3><label for="fi">' +
      b('Файл', 'File') + '</label><input type="file" id="fi"><label for="nt">' + b('Бележка към учителя', 'Note to teacher') +
      '</label><textarea id="nt" rows="3"></textarea><p class="row"><button class="btn alt" id="cx">' +
      b('Отказ', 'Cancel') + '</button><button class="btn" id="ok" data-id="' + id + '">' +
      b('Предай', 'Submit') + '</button></p>');
    return;
  }

  // Cancel button in any pop-up form
  if (t.id === 'cx') {
    $('#dlg').close();
    return;
  }

  // Student confirms the submission and it is saved
  if (t.id === 'ok') {
    var k = task(t.dataset.id), fl = ($('#fi').files || [])[0], sb = { s: 0, f: fl ? fl.name : '', u: fl ? URL.createObjectURL(fl) : '', note: $('#nt').value.trim(), when: ['днес', 'today'] };
    k.done = true;
    D.subs[k.id] = (D.subs[k.id] || []).filter(function (x) {
      return x.s !== 0;
    }).concat([sb]);
    $('#dlg').close();
    render();
    return;
  }

  // Teacher opens the submissions of an assignment
  if (t.dataset.view) {
    D.view = t.dataset.view;
    render();
    return;
  }

  // Back from the submissions to all assignments
  if (t.id === 'vb') {
    D.view = null;
    render();
    return;
  }

  // Teacher opens the feedback form for one submission
  if (t.dataset.fb) {
    var q = t.dataset.fb.split('|');
    openDlg(fbForm(q[0], +q[1]));
    return;
  }

  // Teacher saves the feedback (comment and/or files)
  if (t.id === 'sfb') {
    var q2 = t.dataset.id.split('|'), sb2 = subsOf(q2[0]).filter(function (x) {
      return x.s === +q2[1];
    })[0], fs2 = [];
    if (sb2.fb && sb2.fb.files) {
      Array.prototype.forEach.call(document.querySelectorAll('.kf'), function (c) {
        if (c.checked)
          fs2.push(sb2.fb.files[+c.value]);
      });
    }
    Array.prototype.forEach.call($('#fbf').files || [], function (fl) {
      fs2.push({ n: fl.name, u: URL.createObjectURL(fl) });
    });
    var tx = $('#fbt').value.trim();
    if (tx || fs2.length) {
      sb2.fb = { text: tx, files: fs2 };
    } else {
      delete sb2.fb;
    }
    $('#dlg').close();
    render();
    return;
  }

  // Teacher opens the New assignment form
  if (t.id === 'newT') {
    openDlg(taskForm());
    return;
  }

  // Teacher opens the Edit assignment form
  if (t.dataset.edit) {
    openDlg(taskForm(task(t.dataset.edit)));
    return;
  }

  // Ask before deleting an assignment
  if (t.dataset.del) {
    var q = task(t.dataset.del);
    openDlg('<h3>' + b('Да изтрием ли задачата?', 'Delete this assignment?') +
      '</h3><p>' + b(esc(q.n), esc(q.e || '')) + '</p><p class="row"><button class="btn alt" id="cx">' +
      b('Отказ', 'Cancel') + '</button><button class="btn" id="dok" data-id="' + q.id +
      '">' + b('Изтрий', 'Delete') + '</button></p>');
    return;
  }

  // Confirm deleting the assignment
  if (t.id === 'dok') {
    D.tasks = D.tasks.filter(function (a) {
      return a.id != t.dataset.id;
    });
    $('#dlg').close();
    render();
    return;
  }

  // Save a new or edited assignment
  if (t.id === 'ct') {
    var n = $('#tn').value.trim();
    if (n) {
      var o = { n: n, c: D.course, due: $('#td').value.trim() || '—', desc: $('#tdb').value.trim() }, ex = t.dataset.id ? task(t.dataset.id) : null, fs = [];
      if (ex && ex.files) {
        Array.prototype.forEach.call(document.querySelectorAll('.kf'), function (k) {
          if (k.checked)
            fs.push(ex.files[+k.value]);
        });
      }
      Array.prototype.forEach.call($('#tf').files || [], function (fl) {
        fs.push({ n: fl.name, u: URL.createObjectURL(fl) });
      });
      o.files = fs;
      if (ex) {
        Object.assign(ex, o);
      } else {
        o.id = Date.now();
        o.done = false;
        o.sub = 0;
        D.tasks.push(o);
      }
    }
    $('#dlg').close();
    render();
    return;
  }

  // Switch between Flashcards, Quiz and Type it
  if (t.dataset.mode) {
    D.mode = t.dataset.mode;
    if (D.mode !== 'study')
      startQ();
    render();
    return;
  }

  // Reverse direction checkbox
  if (t.id === 'rv') {
    D.rev = t.checked;
    if (D.mode !== 'study')
      startQ();
    render();
    return;
  }

  // Student picks an answer in the quiz
  if (t.dataset.opt !== undefined) {
    answerQ(+t.dataset.opt);
    return;
  }

  // Next question
  if (t.id === 'nq') {
    nextQ();
    return;
  }

  // Practice again: start another round
  if (t.id === 'again') {
    startQ();
    render();
    return;
  }

  // Teacher deletes a class word
  if (t.dataset.dw) {
    D.cards.splice(+t.dataset.dw, 1);
    D.ci = 0;
    D.q = null;
    D.last = -1;
    render();
    return;
  }

  // Teacher adds a word for the whole class
  if (t.id === 'atw') {
    var tw = $('#tw').value.trim(), tm = $('#tm').value.trim();
    if (tw && tm) {
      var dv = detailVals('cw');
      D.cards.push({ w: tw, m: tm, t: true, pos: dv.pos, g: dv.g, ex: dv.ex });
      D.flash = tw;
    }
    render();
    return;
  }

  // Switch tab inside a class (Home, Textbook, Zoom, Flashcards)
  if (t.dataset.tmode) {
    D.tmode = t.dataset.tmode;
    D.sel = null;
    render();
    return;
  }

  // Switch between Announcements and Assignments on a class Home tab
  if (t.dataset.hmode) {
    D.hmode = t.dataset.hmode;
    D.view = null;
    render();
    return;
  }

  // Open the New Zoom meeting form
  if (t.id === 'newZ') {
    openDlg(zform());
    return;
  }

  // Open the Edit Zoom meeting form
  if (t.dataset.ez) {
    openDlg(zform(zget(t.dataset.ez)));
    return;
  }

  // Delete a Zoom meeting
  if (t.dataset.dz) {
    D.zoom = D.zoom.filter(function (a) {
      return a.id != t.dataset.dz;
    });
    render();
    return;
  }

  // Save a Zoom meeting (adds https:// if it is missing)
  if (t.id === 'sz') {
    var u = $('#zu').value.trim();
    if (u) {
      if (!/^https?:\/\//.test(u))
        u = 'https://' + u;
      var o = { c: D.course, d: +$('#zd').value, f: $('#zf').value, t: $('#zt').value, u: u };
      if (t.dataset.id) {
        Object.assign(zget(t.dataset.id), o);
      } else {
        o.id = Date.now();
        D.zoom.push(o);
      }
    }
    $('#dlg').close();
    render();
    return;
  }

  // Teacher opens one student's vocabulary page
  if (t.dataset.st) {
    D.sel = +t.dataset.st;
    render();
    return;
  }

  // Back to the list of students
  if (t.id === 'sb') {
    D.sel = null;
    render();
    return;
  }

  // Open the New announcement form
  if (t.id === 'newN') {
    openDlg(newsForm());
    return;
  }

  // Post the announcement
  if (t.id === 'pn') {
    var g = $('#n1').value.trim(), bg = $('#n2').value.trim();
    if (g && bg) {
      D.news.unshift({ c: D.course, by: D.user ? [D.user, D.user] : ['г-жа Петрова', 'Mrs Petrova'], g: g, bg: bg, e: '', en: '' });
      $('#dlg').close();
      render();
    }
    return;
  }

  // Delete an announcement
  if (t.dataset.dn) {
    D.news.splice(+t.dataset.dn, 1);
    render();
    return;
  }

  // Student adds their own flashcard
  if (t.id === 'ac') {
    var w = $('#w').value.trim(), m = $('#m').value.trim();
    if (w && m) {
      var dv2 = detailVals('w');
      D.cards.push({ w: w, m: m, pos: dv2.pos, g: dv2.g, ex: dv2.ex });
      D.ci = D.cards.length - 1;
      render();
    }
    return;
  }

  // Previous flashcard
  if (t.id === 'pv') {
    D.ci = (D.ci - 1 + D.cards.length) % D.cards.length;
    render();
    return;
  }

  // Next flashcard
  if (t.id === 'nx') {
    D.ci = (D.ci + 1) % D.cards.length;
    render();
    return;
  }

  // Student deletes one of their own flashcards
  if (t.id === 'rm') {
    D.cards.splice(D.ci, 1);
    D.ci = 0;
    render();
    return;
  }

  // Click on the flashcard itself: flip it
  if (x = t.closest('#fl')) {
    x.classList.toggle('flip');
  }
});

// Form submits: the Type it answer and the login form.
document.addEventListener('submit', function (e) {
  if (e.target.id === 'wf') {
    e.preventDefault();
    checkW();
    return;
  }
  if (e.target.id !== 'lf')
    return;
  e.preventDefault();
  D.role = document.querySelector('input[name=lr]:checked').value;
  D.user = $('#lu').value.trim();
  $('#lp').value = '';
  D.tab = 'home';
  D.sel = null;
  D.view = null;
  D.course = null;
  document.body.classList.remove('out');
  render();
  window.scrollTo(0, 0);
});

// Keyboard: Enter or Space flips the flashcard.
document.addEventListener('keydown', function (e) {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'fl') {
    e.preventDefault();
    e.target.classList.toggle('flip');
  }
});

// Typing in the textbook address box saves the new link.
document.addEventListener('input', function (e) {
  if (e.target.id === 'bu')
    course(D.course).book = e.target.value;
});

// ---------------------------------------------------------------------------
// START
// ---------------------------------------------------------------------------

// Start: draw the first screen (the login screen is already visible).
render();
