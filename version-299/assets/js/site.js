(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initCardFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var container = document.querySelector("[data-card-container]");
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
            var search = panel.querySelector("[data-card-search]");
            var year = panel.querySelector("[data-year-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var region = panel.querySelector("[data-region-filter]");
            var count = panel.querySelector("[data-visible-count]");

            function applyFilters() {
                var query = normalize(search && search.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var selectedRegion = normalize(region && region.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }

                if (container) {
                    var empty = container.querySelector(".empty-results");
                    if (visible === 0 && !empty) {
                        empty = document.createElement("div");
                        empty.className = "empty-results";
                        empty.textContent = "没有找到匹配影片";
                        container.appendChild(empty);
                    } else if (visible > 0 && empty) {
                        empty.remove();
                    }
                }
            }

            [search, year, type, region].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilters);
                    element.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        });
    }

    function initGlobalSearch() {
        var form = document.querySelector("[data-global-search-form]");
        var input = document.querySelector("[data-global-search-input]");
        var results = document.querySelector("[data-global-search-results]");
        var count = document.querySelector("[data-global-search-count]");
        if (!form || !input || !results || !window.MOVIE_INDEX) {
            return;
        }

        function cardTemplate(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return "" +
                "<article class=\"movie-card\">" +
                    "<a class=\"movie-card__poster\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
                        "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                        "<span class=\"movie-card__play\">▶</span>" +
                        "<span class=\"movie-card__score\">" + movie.rating + "</span>" +
                    "</a>" +
                    "<div class=\"movie-card__body\">" +
                        "<div class=\"movie-card__meta\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                        "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
                        "<p>" + escapeHtml(movie.description) + "</p>" +
                        "<div class=\"movie-card__tags\">" + tags + "</div>" +
                    "</div>" +
                "</article>";
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch() {
            var query = normalize(input.value);
            var words = query.split(/\s+/).filter(Boolean);
            var matches = window.MOVIE_INDEX.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.description,
                    movie.category
                ].join(" "));

                return words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
            }).slice(0, 120);

            results.innerHTML = matches.length
                ? matches.map(cardTemplate).join("")
                : "<div class=\"empty-results\">没有找到匹配影片</div>";

            if (count) {
                count.textContent = String(matches.length);
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            runSearch();
        });
        input.addEventListener("input", runSearch);

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
        }
        runSearch();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".watch-player"));
        players.forEach(function (wrapper) {
            var video = wrapper.querySelector("video");
            var button = wrapper.querySelector(".play-overlay");
            var source = wrapper.getAttribute("data-video-src");
            var hls = null;
            var loaded = false;

            if (!video || !button || !source) {
                return;
            }

            function loadAndPlay() {
                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls();
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {});
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                        video.addEventListener("loadedmetadata", function () {
                            video.play().catch(function () {});
                        }, { once: true });
                    } else {
                        video.src = source;
                    }
                    loaded = true;
                }

                wrapper.classList.add("is-playing");
                video.play().catch(function () {});
            }

            button.addEventListener("click", loadAndPlay);
            video.addEventListener("play", function () {
                wrapper.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    wrapper.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initCardFilters();
        initGlobalSearch();
        initPlayers();
    });
})();
