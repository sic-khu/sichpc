(() => {
  'use strict';

  const THEME_KEY = 'sichpc-theme';

  /* ── Theme toggle ── */
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);

    document.getElementById('btnTheme')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      updateThemeIcon(next);
    });
  }

  function updateThemeIcon(theme) {
    const btn = document.getElementById('btnTheme');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }
  }

  /* ── Copy code ── */
  function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const block = btn.closest('.code-block');
        const pre = block?.querySelector('pre');
        if (!pre) return;

        const text = pre.textContent.trim();
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add('copied');
          const label = btn.querySelector('span') || btn;
          const original = label.textContent;
          label.textContent = '복사됨!';
          setTimeout(() => {
            btn.classList.remove('copied');
            label.textContent = original;
          }, 2000);
        } catch {
          btn.textContent = '실패';
        }
      });
    });
  }

  /* ── Slurm tabs ── */
  function initSlurmTabs() {
    const tabs = document.querySelectorAll('.slurm-tab');
    const panes = document.querySelectorAll('.slurm-tab-pane');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach((t) => t.classList.remove('active'));
        panes.forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  /* ── Slurm table search ── */
  function initSlurmSearch() {
    const input = document.getElementById('slurmSearch');
    if (!input) return;

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      document.querySelectorAll('.slurm-table tbody tr').forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.classList.toggle('hidden', query.length > 0 && !text.includes(query));
      });
    });
  }

  /* ── Example tabs ── */
  function initExampleTabs() {
    const tabs = document.querySelectorAll('.example-tab');
    const panes = document.querySelectorAll('.example-pane');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.example;
        tabs.forEach((t) => t.classList.remove('active'));
        panes.forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });
  }

  /* ── TOC scroll spy ── */
  function initScrollSpy() {
    const links = document.querySelectorAll('.toc-list a[href^="#"]');
    const sections = [];

    links.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) sections.push({ id, el, link });
    });

    function updateActive() {
      const scrollPos = window.scrollY + 120;
      let current = sections[0];

      for (const section of sections) {
        if (section.el.offsetTop <= scrollPos) {
          current = section;
        }
      }

      links.forEach((l) => l.classList.remove('active'));
      if (current) {
        current.link.classList.add('active');
      }
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ── Mobile TOC ── */
  function initMobileToc() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const btnOpen = document.getElementById('btnTocMobile');
    const btnClose = document.getElementById('btnTocClose');

    function open() {
      sidebar?.classList.add('open');
      overlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
      document.body.style.overflow = '';
    }

    btnOpen?.addEventListener('click', open);
    btnClose?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    sidebar?.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) close();
      });
    });
  }

  /* ── Notice board ── */
  const NOTICE_DIR = 'notices/';
  const NOTICES_PER_PAGE = 5;
  const NEW_BADGE_DAYS = 7;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function isRecent(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return false;
    return (Date.now() - date.getTime()) / 86400000 <= NEW_BADGE_DAYS;
  }

  function parseNotice(file, text) {
    const meta = {};
    let body = text;
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fm) {
      fm[1].split(/\r?\n/).forEach((line) => {
        const m = line.match(/^(\w+)\s*:\s*(.*)$/);
        if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      });
      body = text.slice(fm[0].length);
    }
    return {
      id: file.replace(/\.md$/, ''),
      title: meta.title || file,
      date: meta.date || '',
      pinned: meta.pinned === 'true',
      body,
    };
  }

  function renderMarkdown(container, markdown) {
    if (!window.marked || !window.DOMPurify) {
      container.textContent = markdown;
      container.style.whiteSpace = 'pre-line';
      return;
    }
    container.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }));
    container.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  function renderNoticeItem(notice) {
    const item = el('li', 'notice-item' + (notice.pinned ? ' pinned' : ''));
    item.id = `notice-${notice.id}`;

    const row = el('button', 'notice-row');
    row.type = 'button';
    row.setAttribute('aria-expanded', 'false');

    const title = el('span', 'notice-col-title');
    if (notice.pinned) {
      const pin = el('i', 'bi bi-pin-angle-fill notice-pin');
      pin.setAttribute('aria-label', '고정 공지');
      title.appendChild(pin);
    }
    title.appendChild(el('span', 'notice-title-text', notice.title));
    if (isRecent(notice.date)) title.appendChild(el('span', 'notice-new', 'NEW'));

    const date = el('span', 'notice-col-date', notice.date);

    row.append(title, date);

    const body = el('div', 'notice-body');
    body.hidden = true;
    const content = el('div', 'notice-content');
    renderMarkdown(content, notice.body);
    body.appendChild(content);

    row.addEventListener('click', () => {
      const open = row.getAttribute('aria-expanded') === 'true';
      row.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
      item.classList.toggle('open', !open);
    });

    item.append(row, body);
    return item;
  }

  function renderNoticePage(notices, page) {
    const list = document.getElementById('noticeList');
    const pager = document.getElementById('noticePagination');
    const totalPages = Math.max(1, Math.ceil(notices.length / NOTICES_PER_PAGE));
    const start = (page - 1) * NOTICES_PER_PAGE;

    list.replaceChildren();
    if (notices.length === 0) {
      list.appendChild(el('li', 'notice-empty', '등록된 공지사항이 없습니다.'));
    } else {
      notices.slice(start, start + NOTICES_PER_PAGE)
        .forEach((n) => list.appendChild(renderNoticeItem(n)));
    }

    pager.replaceChildren();
    if (totalPages <= 1) return;
    for (let p = 1; p <= totalPages; p++) {
      const btn = el('button', 'notice-page' + (p === page ? ' active' : ''), String(p));
      btn.type = 'button';
      if (p === page) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => renderNoticePage(notices, p));
      pager.appendChild(btn);
    }
  }

  async function initNotices() {
    const list = document.getElementById('noticeList');
    if (!list) return;

    try {
      const res = await fetch(NOTICE_DIR + 'index.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.statusText);
      const files = await res.json();

      const loaded = await Promise.all(files.map(async (file) => {
        try {
          const r = await fetch(NOTICE_DIR + encodeURIComponent(file), { cache: 'no-cache' });
          return r.ok ? parseNotice(file, await r.text()) : null;
        } catch {
          return null;
        }
      }));

      const notices = loaded.filter(Boolean).sort((a, b) => {
        if (b.pinned !== a.pinned) return b.pinned ? 1 : -1;
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
      });
      renderNoticePage(notices, 1);

      const target = location.hash.match(/^#notice-(.+)$/);
      if (target) {
        const id = decodeURIComponent(target[1]);
        const idx = notices.findIndex((n) => n.id === id);
        if (idx >= 0) {
          renderNoticePage(notices, Math.floor(idx / NOTICES_PER_PAGE) + 1);
          const item = document.getElementById(`notice-${id}`);
          item?.querySelector('.notice-row')?.click();
          item?.scrollIntoView({ block: 'center' });
        }
      }
    } catch {
      list.replaceChildren(el('li', 'notice-empty', '공지사항을 불러오지 못했습니다.'));
    }
  }

  /* ── Back to top ── */
  function initBackToTop() {
    const btn = document.getElementById('btnBackTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCopyButtons();
    initSlurmTabs();
    initSlurmSearch();
    initExampleTabs();
    initScrollSpy();
    initMobileToc();
    initBackToTop();
    initNotices();
  });
})();
