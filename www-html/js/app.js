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
  });
})();
