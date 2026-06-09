const Hls = window.Hls;

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').toLowerCase().trim();

const setupMobileMenu = () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.querySelector('[data-mobile-panel]');
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
};

const setupHero = () => {
  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const next = slider.querySelector('[data-hero-next]');
    const prev = slider.querySelector('[data-hero-prev]');
    if (!slides.length) return;
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
      dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        show(idx);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        start();
      });
    }

    show(0);
    start();
  });
};

const setupFilters = () => {
  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const category = panel.querySelector('[data-filter-category]');
    const grid = panel.parentElement.querySelector('.filter-grid');
    const empty = panel.parentElement.querySelector('[data-empty-message]');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('[data-card]'));

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }

    const apply = () => {
      const q = normalize(input ? input.value : '');
      const y = normalize(year ? year.value : '');
      const r = normalize(region ? region.value : '');
      const c = normalize(category ? category.value : '');
      let visible = 0;
      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.category,
          card.dataset.type
        ].join(' '));
        const okQuery = !q || haystack.includes(q);
        const okYear = !y || normalize(card.dataset.year) === y;
        const okRegion = !r || normalize(card.dataset.region) === r;
        const okCategory = !c || normalize(card.dataset.category) === c;
        const ok = okQuery && okYear && okRegion && okCategory;
        card.hidden = !ok;
        if (ok) visible += 1;
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    };

    [input, year, region, category].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
};

const setupPlayers = () => {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video[data-src]');
    const button = player.querySelector('[data-play-button]');
    const status = player.querySelector('[data-player-status]');
    if (!video || !button) return;
    let hlsInstance = null;
    let prepared = false;

    const setStatus = (message) => {
      if (status) status.textContent = message || '';
    };

    const fail = () => {
      setStatus('视频加载失败，请稍后重试');
      button.classList.remove('hidden');
    };

    const playVideo = () => {
      video.play().catch(() => {
        setStatus('请再次点击播放');
        button.classList.remove('hidden');
      });
    };

    const prepare = () => {
      const source = video.dataset.src;
      if (!source) return;
      button.classList.add('hidden');
      setStatus('加载中...');

      if (prepared) {
        setStatus('');
        playVideo();
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', () => {
          prepared = true;
          setStatus('');
          playVideo();
        }, { once: true });
        video.addEventListener('error', fail, { once: true });
        video.load();
        return;
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          prepared = true;
          setStatus('');
          playVideo();
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            if (hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
            }
            fail();
          }
        });
        return;
      }

      setStatus('当前浏览器暂不支持播放');
      button.classList.remove('hidden');
    };

    button.addEventListener('click', prepare);
    video.addEventListener('click', () => {
      if (!prepared) prepare();
    });
    window.addEventListener('pagehide', () => {
      if (hlsInstance) hlsInstance.destroy();
    });
  });
};

const setupBackTop = () => {
  const button = document.querySelector('[data-back-top]');
  if (!button) return;
  const toggle = () => {
    button.classList.toggle('show', window.scrollY > 360);
  };
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
};

const setupImages = () => {
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.classList.add('image-missing');
    }, { once: true });
  });
};

ready(() => {
  setupMobileMenu();
  setupHero();
  setupFilters();
  setupPlayers();
  setupBackTop();
  setupImages();
});
