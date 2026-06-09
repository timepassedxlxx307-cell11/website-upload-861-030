(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-button');
        var mobileNav = document.querySelector('.mobile-nav');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                var expanded = menuButton.getAttribute('aria-expanded') === 'true';
                menuButton.setAttribute('aria-expanded', String(!expanded));
                mobileNav.hidden = expanded;
                menuButton.textContent = expanded ? '☰' : '×';
            });
        }

        document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
            if (!slides.length) {
                return;
            }
            var index = slides.findIndex(function (slide) {
                return slide.classList.contains('active');
            });
            if (index < 0) {
                index = 0;
            }
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                });
            });
            window.setInterval(function () {
                show(index + 1);
            }, 6200);
        });

        document.querySelectorAll('[data-card-filter]').forEach(function (controls) {
            var section = controls.closest('.section-inner') || document;
            var container = section.querySelector('[data-card-container]');
            if (!container) {
                return;
            }
            var search = controls.querySelector('.filter-search');
            var selects = Array.prototype.slice.call(controls.querySelectorAll('.filter-select'));
            var empty = section.querySelector('.empty-result');
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card, .rank-row'));
            function valueOf(card, key) {
                return (card.getAttribute('data-' + key) || '').toLowerCase();
            }
            function apply() {
                var query = search ? search.value.trim().toLowerCase() : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        valueOf(card, 'title'),
                        valueOf(card, 'region'),
                        valueOf(card, 'type'),
                        valueOf(card, 'year'),
                        valueOf(card, 'tags'),
                        valueOf(card, 'genre'),
                        valueOf(card, 'category')
                    ].join(' ');
                    var ok = !query || text.indexOf(query) !== -1;
                    selects.forEach(function (select) {
                        if (!ok || !select.value) {
                            return;
                        }
                        var key = select.getAttribute('data-filter') || '';
                        ok = valueOf(card, key) === select.value.toLowerCase();
                    });
                    card.classList.toggle('is-card-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (search) {
                search.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    });

    window.createMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;
        if (!video || !overlay || !streamUrl) {
            return;
        }
        function attach() {
            if (video.getAttribute('data-ready') === 'yes') {
                return Promise.resolve();
            }
            video.setAttribute('data-ready', 'yes');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return new Promise(function (resolve) {
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                });
            }
            video.src = streamUrl;
            return Promise.resolve();
        }
        function play() {
            overlay.classList.add('is-hidden');
            attach().then(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {});
                }
            });
        }
        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
