(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = $('#mobile-menu-button');
        var menu = $('#mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = $('[data-hero-slider]');
        if (!hero) {
            return;
        }
        var slides = $$('[data-hero-slide]', hero);
        var dots = $$('[data-hero-dot]', hero);
        var prev = $('[data-hero-prev]', hero);
        var next = $('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearch() {
        var data = window.MOVIES_SEARCH_INDEX || [];
        $$('[data-global-search]').forEach(function (form) {
            var input = $('input[type="search"]', form);
            var panel = $('[data-search-results]', form);
            if (!input || !panel) {
                return;
            }

            function render() {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    return;
                }
                var matches = data.filter(function (item) {
                    return item.text.indexOf(query) !== -1;
                }).slice(0, 12);
                if (!matches.length) {
                    panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
                    panel.classList.add('is-open');
                    return;
                }
                panel.innerHTML = matches.map(function (item) {
                    return '<a class="search-item" href="' + item.url + '">' +
                        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                        '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
                        '</a>';
                }).join('');
                panel.classList.add('is-open');
            }

            input.addEventListener('input', render);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });
    }

    function setupFilters() {
        $$('[data-filter-panel]').forEach(function (panel) {
            var keyword = $('[data-filter-keyword]', panel);
            var year = $('[data-filter-year]', panel);
            var region = $('[data-filter-region]', panel);
            var reset = $('[data-filter-reset]', panel);
            var container = panel.parentElement;
            var list = $('[data-filter-list]', container);
            if (!list) {
                return;
            }
            var cards = $$('.movie-card', list);

            function apply() {
                var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-text') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardRegion = card.getAttribute('data-region') || '';
                    var visible = true;
                    if (keywordValue && text.indexOf(keywordValue) === -1) {
                        visible = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        visible = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        visible = false;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            [keyword, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (keyword) {
                        keyword.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    apply();
                });
            }
        });
    }

    function setupPlayer() {
        var video = $('#movie-player');
        var overlay = $('#play-overlay');
        var configNode = $('#video-config');
        if (!video || !overlay || !configNode) {
            return;
        }
        var config = {};
        try {
            config = JSON.parse(configNode.textContent || '{}');
        } catch (error) {
            config = {};
        }
        var source = config.src;
        var hls = null;
        var ready = false;

        function start() {
            if (!source) {
                return;
            }
            overlay.classList.add('is-hidden');
            if (!ready) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    ready = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 36,
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    ready = true;
                } else {
                    video.src = source;
                    ready = true;
                }
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupFilters();
        setupPlayer();
    });
}());
