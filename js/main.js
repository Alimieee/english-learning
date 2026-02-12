/* ===== English Learning Website – Interactive Engine ===== */
/* Handles: drag-and-drop, answer validation, scoring, true/false toggles,
   sentence reordering, and category sorting. */

document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  initCategorySorting();
  initTrueFalseToggles();
  initSentenceReorder();
  initOptionLabels();
  initSubmitButtons();
});

/* ──────────────────────────────────────────────
   1.  DRAG-AND-DROP  (word bank → drop zone)
   ────────────────────────────────────────────── */
function initDragAndDrop() {
  document.querySelectorAll('.word-bank-item[draggable="true"]').forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    /* touch support */
    item.addEventListener('touchstart', handleTouchStart, { passive: false });
    item.addEventListener('touchmove', handleTouchMove, { passive: false });
    item.addEventListener('touchend', handleTouchEnd);
  });

  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', handleDrop);
    /* click to remove */
    zone.addEventListener('click', handleZoneClick);
  });
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.style.opacity = '.4';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.value || this.textContent.trim());
}

function handleDragEnd() {
  this.style.opacity = '';
  document.querySelectorAll('.drop-zone').forEach(z => z.classList.remove('drag-over'));
}

function handleDrop(e) {
  e.preventDefault();
  const zone = this;
  zone.classList.remove('drag-over');
  if (!draggedItem) return;

  /* if zone already has a word, return it first */
  if (zone.dataset.filled) {
    returnWordToBank(zone);
  }

  const val = draggedItem.dataset.value || draggedItem.textContent.trim();
  zone.textContent = draggedItem.textContent.trim();
  zone.dataset.filled = val;
  zone.classList.add('filled');
  draggedItem.classList.add('placed');
  draggedItem = null;
}

function handleZoneClick() {
  if (this.dataset.filled) {
    returnWordToBank(this);
  }
}

function returnWordToBank(zone) {
  const val = zone.dataset.filled;
  const bankId = zone.dataset.bank;
  const bank = bankId ? document.getElementById(bankId) : zone.closest('.exercise, .section');
  if (!bank) return;
  const items = bank.querySelectorAll('.word-bank-item');
  items.forEach(item => {
    const iv = item.dataset.value || item.textContent.trim();
    if (iv.toLowerCase() === val.toLowerCase() && item.classList.contains('placed')) {
      item.classList.remove('placed');
    }
  });
  zone.textContent = '';
  zone.dataset.filled = '';
  zone.classList.remove('filled', 'correct-zone', 'incorrect-zone');
}

/* ── Touch support for mobile drag ── */
let touchClone = null;
let touchSource = null;

function handleTouchStart(e) {
  touchSource = this;
  const touch = e.touches[0];
  touchClone = this.cloneNode(true);
  touchClone.style.cssText = `position:fixed;z-index:9999;pointer-events:none;opacity:.85;
    transform:scale(1.1);left:${touch.clientX - 40}px;top:${touch.clientY - 20}px;`;
  document.body.appendChild(touchClone);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchClone) return;
  const touch = e.touches[0];
  touchClone.style.left = (touch.clientX - 40) + 'px';
  touchClone.style.top = (touch.clientY - 20) + 'px';

  document.querySelectorAll('.drop-zone, .category-column').forEach(z => {
    const rect = z.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      z.classList.add('drag-over');
    } else {
      z.classList.remove('drag-over');
    }
  });
}

function handleTouchEnd(e) {
  if (!touchClone || !touchSource) return;
  touchClone.remove();
  const touch = e.changedTouches[0];

  /* check drop zones */
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.classList.remove('drag-over');
    const rect = zone.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      if (zone.dataset.filled) returnWordToBank(zone);
      const val = touchSource.dataset.value || touchSource.textContent.trim();
      zone.textContent = touchSource.textContent.trim();
      zone.dataset.filled = val;
      zone.classList.add('filled');
      touchSource.classList.add('placed');
    }
  });

  /* check category columns */
  document.querySelectorAll('.category-column').forEach(col => {
    col.classList.remove('drag-over');
    const rect = col.getBoundingClientRect();
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
      touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      const clone = touchSource.cloneNode(true);
      clone.classList.remove('placed');
      clone.draggable = false;
      clone.addEventListener('click', function () { removeCatItem(this, touchSource); });
      col.appendChild(clone);
      touchSource.classList.add('placed');
    }
  });

  touchClone = null;
  touchSource = null;
}

/* ──────────────────────────────────────────────
   2.  CATEGORY SORTING  (drag into columns)
   ────────────────────────────────────────────── */
function initCategorySorting() {
  document.querySelectorAll('.category-column').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', handleCategoryDrop);
  });
}

function handleCategoryDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (!draggedItem) return;

  const clone = draggedItem.cloneNode(true);
  clone.classList.remove('placed');
  clone.draggable = false;
  const src = draggedItem;
  clone.addEventListener('click', function () { removeCatItem(this, src); });
  this.appendChild(clone);
  draggedItem.classList.add('placed');
  draggedItem = null;
}

function removeCatItem(clone, src) {
  clone.remove();
  if (src) src.classList.remove('placed');
}

/* ──────────────────────────────────────────────
   3.  TRUE / FALSE  TOGGLES
   ────────────────────────────────────────────── */
function initTrueFalseToggles() {
  document.querySelectorAll('.tf-toggle-group').forEach(group => {
    group.querySelectorAll('.tf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        group.dataset.selected = btn.dataset.value;
      });
    });
  });
}

/* ──────────────────────────────────────────────
   4.  SENTENCE REORDER  (drag list items)
   ────────────────────────────────────────────── */
function initSentenceReorder() {
  document.querySelectorAll('.sentence-order-list').forEach(list => {
    let dragItem = null;

    list.querySelectorAll('.sentence-order-item').forEach(item => {
      item.addEventListener('dragstart', function (e) {
        dragItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', function () {
        this.classList.remove('dragging');
        list.querySelectorAll('.sentence-order-item').forEach(i => i.classList.remove('drag-over-item'));
        dragItem = null;
      });
      item.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (this !== dragItem) this.classList.add('drag-over-item');
      });
      item.addEventListener('dragleave', function () { this.classList.remove('drag-over-item'); });
      item.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('drag-over-item');
        if (dragItem && dragItem !== this) {
          const children = [...list.children];
          const fromIdx = children.indexOf(dragItem);
          const toIdx = children.indexOf(this);
          if (fromIdx < toIdx) {
            list.insertBefore(dragItem, this.nextSibling);
          } else {
            list.insertBefore(dragItem, this);
          }
        }
      });
    });
  });
}

/* ──────────────────────────────────────────────
   5.  OPTION LABELS  (visual radio/checkbox)
   ────────────────────────────────────────────── */
function initOptionLabels() {
  document.querySelectorAll('.option-label').forEach(label => {
    const input = label.querySelector('input');
    if (!input) return;
    input.addEventListener('change', () => {
      if (input.type === 'radio') {
        const name = input.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
          r.closest('.option-label')?.classList.remove('selected');
        });
      }
      label.classList.toggle('selected', input.checked);
    });
  });
}

/* ──────────────────────────────────────────────
   6.  SUBMIT BUTTONS
   ────────────────────────────────────────────── */
function initSubmitButtons() {
  document.querySelectorAll('.btn-submit').forEach(btn => {
    btn.addEventListener('click', () => {
      const exerciseId = btn.dataset.exercise;
      if (exerciseId) submitExercise(exerciseId);
    });
  });
}

/* ──────────────────────────────────────────────
   7.  ANSWER MAPS  (exerciseId → answers)
   ────────────────────────────────────────────── */
const answers = {
  /* === LISTENING MODULE === */
  listening_intro: {
    type: 'text',
    items: {
      'l-intro-q1': 'positive and negative',
      'l-intro-q2': 'i, you, we, they',
      'l-intro-q3': 'he, she, it',
    }
  },

  listening_mod1: {
    type: 'text',
    items: {
      'l-mod1-q1': 'get up',
      'l-mod1-q2': 'has breakfast',
      'l-mod1-q3': 'watches tv',
    }
  },

  listening_mod2: {
    type: 'text',
    items: {
      'l-mod2-q1': 'do',
      'l-mod2-q2': 'does',
      'l-mod2-q3': 'do',
    }
  },

  song1_exercise: {
    type: 'drop',
    items: {
      'song1-drop1': 'night',
      'song1-drop2': 'smile',
      'song1-drop3': 'mine',
      'song1-drop4': 'life',
    }
  },

  song2_exercise: {
    type: 'drop',
    items: {
      'song2-drop1': 'beautiful',
      'song2-drop2': 'love',
      'song2-drop3': 'arms',
      'song2-drop4': 'angel',
    }
  },

  listening_tips: {
    type: 'text',
    items: {
      'l-tips-q1': 'subtitles',
      'l-tips-q2': 'repeat',
    }
  },

  /* === READING MODULE === */
  reading_mod1: {
    type: 'mixed',
    drops: {
      'r1-drop1': 'lina',
      'r1-drop2': 'six',
      'r1-drop3': 'bank',
      'r1-drop4': 'reading',
      'r1-drop5': 'park',
    },
    tf: {
      'r1-tf1': 'false',
      'r1-tf2': 'true',
      'r1-tf3': 'true',
      'r1-tf4': 'false',
    }
  },

  reading_mod2: {
    type: 'mixed',
    selects: {
      'match1': 'rock climbing',
      'match2': 'rafting',
      'match3': 'caving',
      'match4': 'surfing',
      'match5': 'parachuting',
    },
    selects2: {
      'fix1': 'rocks',
      'fix2': 'scared',
      'fix3': 'bats',
      'fix4': 'surfing',
    }
  },

  /* === WRITING MODULE === */
  writing_mod1: {
    type: 'drop',
    items: {
      'w1-drop1': 'house',
      'w1-drop2': 'brother',
      'w1-drop3': 'teacher',
      'w1-drop4': 'malaysian',
      'w1-drop5': 'hair',
      'w1-drop6': 'eyes',
      'w1-drop7': 'cat',
    }
  },

  writing_grammar: {
    type: 'radio',
    items: {
      'grammar1': 'a',
      'grammar2': 'b',
      'grammar3': 'b',
      'grammar4': 'b',
    }
  },

  writing_mod3: {
    type: 'drop',
    items: {
      'w3-drop1': 'so',
      'w3-drop2': 'but',
      'w3-drop3': 'and',
      'w3-drop4': 'because',
      'w3-drop5': 'and',
    }
  },

  writing_order: {
    type: 'order',
    items: {
      'order-list-1': ['hello', 'everyone,', 'my', "name's", 'sarah.'],
      'order-list-2': ["i'm", '14', 'years', 'old.'],
      'order-list-3': ["i'm", 'from', 'kedah.'],
      'order-list-4': ["i'm", 'in', 'class', '2', 'gemilang.'],
      'order-list-5': ["i've", 'got', 'a', 'rabbit', 'named', 'snowy.'],
    }
  },
};

/* ──────────────────────────────────────────────
   8.  EXERCISE SUBMISSION LOGIC
   ────────────────────────────────────────────── */
function submitExercise(exerciseId) {
  const config = answers[exerciseId];
  if (!config) return;

  let correct = 0;
  let total = 0;

  /* --- text inputs --- */
  if (config.type === 'text') {
    Object.entries(config.items).forEach(([id, ans]) => {
      total++;
      const el = document.getElementById(id);
      if (!el) return;
      const val = el.value.trim().toLowerCase();
      if (val === ans.toLowerCase()) {
        el.classList.remove('incorrect'); el.classList.add('correct');
        correct++;
      } else {
        el.classList.remove('correct'); el.classList.add('incorrect');
      }
    });
  }

  /* --- drop zones --- */
  if (config.type === 'drop') {
    Object.entries(config.items).forEach(([id, ans]) => {
      total++;
      const zone = document.getElementById(id);
      if (!zone) return;
      const filled = (zone.dataset.filled || '').toLowerCase();
      if (filled === ans.toLowerCase()) {
        zone.classList.remove('incorrect-zone'); zone.classList.add('correct-zone');
        correct++;
      } else {
        zone.classList.remove('correct-zone'); zone.classList.add('incorrect-zone');
      }
    });
  }

  /* --- radio buttons --- */
  if (config.type === 'radio') {
    Object.entries(config.items).forEach(([name, ans]) => {
      total++;
      const selected = document.querySelector(`input[name="${name}"]:checked`);
      const labels = document.querySelectorAll(`input[name="${name}"]`);
      labels.forEach(r => {
        const lbl = r.closest('.option-label');
        if (!lbl) return;
        lbl.classList.remove('correct-opt', 'incorrect-opt');
        if (r.value === ans) lbl.classList.add('correct-opt');
      });
      if (selected && selected.value === ans) {
        correct++;
      } else if (selected) {
        selected.closest('.option-label')?.classList.add('incorrect-opt');
      }
    });
  }

  /* --- mixed (drops + true/false + selects) --- */
  if (config.type === 'mixed') {
    if (config.drops) {
      Object.entries(config.drops).forEach(([id, ans]) => {
        total++;
        const zone = document.getElementById(id);
        if (!zone) return;
        const filled = (zone.dataset.filled || '').toLowerCase();
        if (filled === ans.toLowerCase()) {
          zone.classList.remove('incorrect-zone'); zone.classList.add('correct-zone');
          correct++;
        } else {
          zone.classList.remove('correct-zone'); zone.classList.add('incorrect-zone');
        }
      });
    }
    if (config.tf) {
      Object.entries(config.tf).forEach(([id, ans]) => {
        total++;
        const group = document.getElementById(id);
        if (!group) return;
        const sel = group.dataset.selected;
        group.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('correct-tf', 'incorrect-tf'));
        if (sel === ans) {
          group.querySelector(`.tf-btn[data-value="${sel}"]`)?.classList.add('correct-tf');
          correct++;
        } else if (sel) {
          group.querySelector(`.tf-btn[data-value="${sel}"]`)?.classList.add('incorrect-tf');
          group.querySelector(`.tf-btn[data-value="${ans}"]`)?.classList.add('correct-tf');
        } else {
          group.querySelector(`.tf-btn[data-value="${ans}"]`)?.classList.add('correct-tf');
        }
      });
    }
    if (config.selects) {
      Object.entries(config.selects).forEach(([id, ans]) => {
        total++;
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('correct', 'incorrect');
        if (el.value.toLowerCase() === ans.toLowerCase()) {
          el.classList.add('correct'); correct++;
        } else {
          el.classList.add('incorrect');
        }
      });
    }
    if (config.selects2) {
      Object.entries(config.selects2).forEach(([id, ans]) => {
        total++;
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('correct', 'incorrect');
        if (el.value.toLowerCase() === ans.toLowerCase()) {
          el.classList.add('correct'); correct++;
        } else {
          el.classList.add('incorrect');
        }
      });
    }
  }

  /* --- sentence order --- */
  if (config.type === 'order') {
    Object.entries(config.items).forEach(([listId, correctOrder]) => {
      const list = document.getElementById(listId);
      if (!list) return;
      const items = list.querySelectorAll('.sentence-order-item');
      items.forEach((itm, idx) => {
        total++;
        const word = (itm.dataset.word || itm.textContent.trim()).toLowerCase();
        itm.classList.remove('correct-opt', 'incorrect-opt');
        itm.style.borderColor = '';
        itm.style.background = '';
        if (word === correctOrder[idx]) {
          itm.style.borderColor = 'var(--success)';
          itm.style.background = 'rgba(16,185,129,.06)';
          correct++;
        } else {
          itm.style.borderColor = 'var(--error)';
          itm.style.background = 'rgba(239,68,68,.06)';
        }
      });
    });
  }

  showScore(exerciseId, correct, total);
}

/* ──────────────────────────────────────────────
   9.  SCORE DISPLAY
   ────────────────────────────────────────────── */
function showScore(exerciseId, correct, total) {
  const containerId = 'score-' + exerciseId;
  let container = document.getElementById(containerId);
  if (!container) {
    /* create one next to the submit button */
    const btn = document.querySelector(`[data-exercise="${exerciseId}"]`);
    if (!btn) return;
    container = document.createElement('div');
    container.id = containerId;
    btn.parentNode.insertBefore(container, btn);
  }

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  let emoji, msg;
  if (pct === 100) { emoji = '🎉'; msg = 'Perfect score! Amazing work!'; }
  else if (pct >= 80) { emoji = '🌟'; msg = 'Great job! Almost perfect!'; }
  else if (pct >= 60) { emoji = '👍'; msg = 'Good effort! Keep practising!'; }
  else if (pct >= 40) { emoji = '💪'; msg = 'Not bad! Try again for a better score!'; }
  else { emoji = '📚'; msg = "Keep learning! You'll get there!"; }

  container.className = 'score-display';
  container.innerHTML = `${emoji} You scored <strong>${correct}</strong> out of <strong>${total}</strong> (${pct}%) — ${msg}`;
}

/* ──────────────────────────────────────────────
   10. RESET EXERCISE
   ────────────────────────────────────────────── */
function resetExercise(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  /* text inputs */
  section.querySelectorAll('input[type="text"], textarea').forEach(el => {
    el.value = '';
    el.classList.remove('correct', 'incorrect');
  });

  /* selects */
  section.querySelectorAll('select').forEach(el => {
    el.selectedIndex = 0;
    el.classList.remove('correct', 'incorrect');
  });

  /* radio/checkbox */
  section.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(el => {
    el.checked = false;
  });
  section.querySelectorAll('.option-label').forEach(el => {
    el.classList.remove('selected', 'correct-opt', 'incorrect-opt');
  });

  /* drop zones */
  section.querySelectorAll('.drop-zone').forEach(zone => {
    zone.textContent = '';
    zone.dataset.filled = '';
    zone.classList.remove('filled', 'correct-zone', 'incorrect-zone');
  });

  /* word bank items */
  section.querySelectorAll('.word-bank-item').forEach(item => {
    item.classList.remove('placed');
  });

  /* true/false toggles */
  section.querySelectorAll('.tf-toggle-group').forEach(group => {
    group.dataset.selected = '';
    group.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active', 'correct-tf', 'incorrect-tf'));
  });

  /* sentence order */
  section.querySelectorAll('.sentence-order-item').forEach(item => {
    item.style.borderColor = '';
    item.style.background = '';
  });

  /* score display */
  section.querySelectorAll('.score-display').forEach(s => s.remove());
}
