(function () {
  var readyCallbacks = [];

  function ready(callback) {
    if (document.readyState === "loading") {
      readyCallbacks.push(callback);
    } else {
      callback();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    readyCallbacks.forEach(function (callback) {
      callback();
    });
  });

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      currentSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === currentSlide);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === currentSlide);
      });
    }

    if (slides.length) {
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
        });
      });

      showSlide(0);

      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5800);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    filterPanels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var searchInput = panel.querySelector("[data-filter-search]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var emptyState = scope.querySelector("[data-empty-state]");

      function applyFilters() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search-text") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !year || cardYear === year;
          var show = matchKeyword && matchYear;
          card.hidden = !show;

          if (show) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle("is-visible", visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
      }
    });
  });
})();

function bindMoviePlayer(source) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var trigger = document.querySelector("[data-play-trigger]");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function startVideo() {
    loadVideo();

    if (cover) {
      cover.hidden = true;
    }

    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (trigger) {
    trigger.addEventListener("click", startVideo);
  }

  if (cover) {
    cover.addEventListener("click", startVideo);
  }

  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      startVideo();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
