const storageKeys = {
  threads: 'chem-aops-threads',
  wiki: 'chem-aops-wiki'
};

const demoThreads = [
  {
    title: 'Kinetic vs thermodynamic control in pericyclic reactions',
    author: 'SpectraSeeker',
    category: 'Organic',
    content: 'How do you decide which product dominates in olympiad problems featuring competing pericyclic pathways? Looking for a structured approach.',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
    replies: [
      { author: 'ReactionMechanic', content: 'Check activation energies and relative stability. IChO 2019 task 2 has a great example—free energy diagram is key.' },
      { author: 'ChemCoach', content: 'Add Hammond postulate reasoning. If temperature is low, favor kinetic product. Summarize assumptions explicitly in your write-up.' }
    ]
  },
  {
    title: 'Ionic strength adjustments in potentiometric titrations',
    author: 'LabNotebook',
    category: 'Analytical',
    content: 'For USNCO lab practical prep: any tips on when to include ionic strength adjusters? How do they impact the calculations?',
    createdAt: Date.now() - 1000 * 60 * 60 * 72
  }
];

const demoWiki = [
  {
    title: 'Buffer capacity derivation',
    summary: 'Derives the expression β = 2.303 C_total (Ka [H3O+] / (Ka + [H3O+])^2) and discusses olympiad-grade approximations for diprotic systems.',
    tags: ['acid-base', 'equilibrium', 'analytical']
  },
  {
    title: 'Qualitative analysis flowchart',
    summary: 'Step-by-step procedure for identifying cations in classic group qualitative analysis including confirmatory tests.',
    tags: ['inorganic', 'analysis']
  }
];

const navButtons = document.querySelectorAll('nav button');
const panels = document.querySelectorAll('.section-panel');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

navButtons.forEach(button => {
  button.addEventListener('click', () => {
    navButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    panels.forEach(panel => {
      panel.hidden = panel.id !== button.dataset.target;
    });
    panelFocus(button.dataset.target);
  });
});

function panelFocus(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  panel.setAttribute('tabindex', '-1');
  panel.focus({ preventScroll: false });
  panel.addEventListener('blur', () => panel.removeAttribute('tabindex'), { once: true });
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diff = Math.max(0, now - timestamp);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) {
    return 'moments ago';
  }
  if (diff < hour) {
    const minutes = Math.round(diff / minute);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    const hours = Math.round(diff / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diff < week) {
    const days = Math.round(diff / day);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  return new Date(timestamp).toLocaleDateString();
}

function loadState(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse state for', key, error);
    return fallback;
  }
}

function saveState(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save state for', key, error);
  }
}

// Forum logic
const threadTemplate = document.getElementById('thread-template');
const replyTemplate = document.getElementById('reply-template');
const emptyTemplate = document.getElementById('empty-template');
const threadListEl = document.getElementById('thread-list');
const newThreadForm = document.getElementById('new-thread-form');
const filterBadges = document.querySelectorAll('.forum-filters .badge');
const threadSortSelect = document.getElementById('thread-sort');

let threads = loadState(storageKeys.threads, demoThreads);
let activeFilter = 'All';
let sortOrder = threadSortSelect ? threadSortSelect.value : 'newest';

if (!Array.isArray(threads)) {
  threads = [];
} else {
  threads = threads.map(thread => ({
    ...thread,
    createdAt: thread && thread.createdAt ? thread.createdAt : Date.now(),
    replies: Array.isArray(thread && thread.replies) ? thread.replies : []
  }));
}

function renderThreads() {
  threadListEl.innerHTML = '';
  const filtered = threads.filter(thread => {
    if (!thread) {
      return false;
    }
    if (activeFilter === 'All') {
      return true;
    }
    return thread.category === activeFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    const timeA = a && a.createdAt ? a.createdAt : 0;
    const timeB = b && b.createdAt ? b.createdAt : 0;
    return sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  if (!sorted.length) {
    threadListEl.appendChild(emptyTemplate.content.cloneNode(true));
    return;
  }

  sorted.forEach(thread => {
    if (!thread) {
      return;
    }

    if (!thread.createdAt) {
      thread.createdAt = Date.now();
    }

    if (!Array.isArray(thread.replies)) {
      thread.replies = [];
    }

    const threadNode = threadTemplate.content.cloneNode(true);
    const article = threadNode.querySelector('article');
    const threadIndex = threads.indexOf(thread);
    if (threadIndex === -1) {
      return;
    }
    article.dataset.index = String(threadIndex);

    article.querySelector('h3').textContent = thread.title;
    article.querySelector('.thread-body').textContent = thread.content;

    const meta = article.querySelector('.muted');
    meta.textContent = `Started by ${thread.author} • ${formatRelativeTime(thread.createdAt)}`;

    const threadMeta = article.querySelector('.thread-meta');
    const categoryBadge = threadMeta.querySelector('.badge');
    categoryBadge.textContent = thread.category;

    const toggleButton = threadMeta.querySelector('.toggle-replies');

    const repliesContainer = article.querySelector('.forum-replies');
    repliesContainer.innerHTML = '';
    repliesContainer.classList.remove('collapsed');
    const repliesId = `thread-replies-${threadIndex}`;
    repliesContainer.id = repliesId;
    toggleButton.setAttribute('aria-controls', repliesId);

    const replies = thread.replies;
    const repliesCount = replies.length;

    if (repliesCount) {
      repliesContainer.hidden = false;
      replies.forEach(reply => {
        const replyNode = replyTemplate.content.cloneNode(true);
        replyNode.querySelector('strong').textContent = reply.author;
        replyNode.querySelector('p').textContent = reply.content;
        repliesContainer.appendChild(replyNode);
      });
      toggleButton.hidden = false;
      toggleButton.textContent = `Hide replies (${repliesCount})`;
      toggleButton.setAttribute('aria-expanded', 'true');
      toggleButton.addEventListener('click', () => {
        const collapsed = repliesContainer.classList.toggle('collapsed');
        repliesContainer.hidden = collapsed;
        toggleButton.setAttribute('aria-expanded', String(!collapsed));
        toggleButton.textContent = `${collapsed ? 'Show' : 'Hide'} replies (${repliesCount})`;
      });
    } else {
      repliesContainer.hidden = true;
      toggleButton.hidden = true;
      toggleButton.setAttribute('aria-expanded', 'false');
    }

    const replyForm = article.querySelector('.reply-form');
    replyForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(replyForm);
      const author = data.get('author').trim();
      const content = data.get('content').trim();
      if (!author || !content) {
        return;
      }
      const selectedIndex = Number(article.dataset.index);
      const newReply = { author, content };
      threads[selectedIndex].replies = threads[selectedIndex].replies || [];
      threads[selectedIndex].replies.push(newReply);
      saveState(storageKeys.threads, threads);
      replyForm.reset();
      renderThreads();
    });

    threadListEl.appendChild(threadNode);
  });
}

function setActiveFilter(filter) {
  activeFilter = filter;
  filterBadges.forEach(badge => {
    const isActive = badge.dataset.filter === filter;
    badge.classList.toggle('active', isActive);
    badge.setAttribute('aria-pressed', String(isActive));
  });
}

function handleFilterChange(filter) {
  setActiveFilter(filter);
  renderThreads();
}

newThreadForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(newThreadForm);
  const newThread = {
    title: data.get('title').trim(),
    author: data.get('author').trim(),
    category: data.get('category'),
    content: data.get('content').trim(),
    replies: [],
    createdAt: Date.now()
  };
  if (!newThread.title || !newThread.author || !newThread.content) {
    return;
  }
  threads = [newThread, ...threads];
  saveState(storageKeys.threads, threads);
  newThreadForm.reset();
  renderThreads();
});

filterBadges.forEach(badge => {
  badge.addEventListener('click', () => {
    handleFilterChange(badge.dataset.filter);
  });
  badge.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFilterChange(badge.dataset.filter);
    }
  });
});

if (threadSortSelect) {
  threadSortSelect.addEventListener('change', event => {
    sortOrder = event.target.value;
    renderThreads();
  });
}

setActiveFilter(activeFilter);

// Wiki logic
const wikiTemplate = document.getElementById('wiki-template');
const wikiListEl = document.getElementById('wiki-list');
const newWikiForm = document.getElementById('new-wiki-form');
const wikiSearch = document.getElementById('wiki-search');

let wikiEntries = loadState(storageKeys.wiki, demoWiki);
let wikiQuery = '';

function renderWiki() {
  wikiListEl.innerHTML = '';
  const normalizedQuery = wikiQuery.trim().toLowerCase();
  const filtered = wikiEntries.filter(entry => {
    if (!normalizedQuery) return true;
    const haystack = [
      entry.title,
      entry.summary,
      ...(entry.tags || [])
    ].join(' ').toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  if (!filtered.length) {
    const emptyNode = emptyTemplate.content.cloneNode(true);
    emptyNode.querySelector('p').textContent = 'No wiki articles yet. Try a different search or start one above!';
    wikiListEl.appendChild(emptyNode);
    return;
  }

  filtered.forEach(entry => {
    const wikiNode = wikiTemplate.content.cloneNode(true);
    const article = wikiNode.querySelector('article');
    article.querySelector('h3').textContent = entry.title;
    article.querySelector('.muted').textContent = entry.summary;
    const badge = article.querySelector('.badge');
    badge.textContent = entry.tags && entry.tags.length ? entry.tags.join(' • ') : 'untagged';
    wikiListEl.appendChild(wikiNode);
  });
}

newWikiForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(newWikiForm);
  const tagsRaw = data.get('tags');
  const entry = {
    title: data.get('title').trim(),
    summary: data.get('summary').trim(),
    tags: tagsRaw ? tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean) : []
  };
  if (!entry.title || !entry.summary) {
    return;
  }
  wikiEntries = [entry, ...wikiEntries];
  saveState(storageKeys.wiki, wikiEntries);
  newWikiForm.reset();
  renderWiki();
});

wikiSearch.addEventListener('input', event => {
  wikiQuery = event.target.value;
  renderWiki();
});

// Initial render
renderThreads();
renderWiki();
