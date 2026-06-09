(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.display = "none";
      }, { once: true });
    });

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function activate(index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function next() {
        if (slides.length === 0) {
          return;
        }
        activate((current + 1) % slides.length);
      }

      function start() {
        stop();
        timer = window.setInterval(next, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var index = Number(dot.getAttribute("data-hero-dot"));
          activate(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));

    function filterCards(value) {
      var keyword = String(value || "").trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));

      cards.forEach(function (card) {
        var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword.length > 0 && haystack.indexOf(keyword) === -1);
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        filterCards(input.value);
      });
    });

    document.querySelectorAll("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter") || "";
        var group = button.closest("[data-filter-group]");

        if (group) {
          group.querySelectorAll("[data-filter]").forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
        }

        searchInputs.forEach(function (input) {
          input.value = value;
        });
        filterCards(value);
      });
    });

    document.querySelectorAll("[data-drag-scroll]").forEach(function (row) {
      var down = false;
      var startX = 0;
      var scrollLeft = 0;

      row.addEventListener("pointerdown", function (event) {
        down = true;
        startX = event.pageX - row.offsetLeft;
        scrollLeft = row.scrollLeft;
        row.setPointerCapture(event.pointerId);
      });

      row.addEventListener("pointermove", function (event) {
        if (!down) {
          return;
        }
        event.preventDefault();
        var x = event.pageX - row.offsetLeft;
        row.scrollLeft = scrollLeft - (x - startX);
      });

      row.addEventListener("pointerup", function () {
        down = false;
      });

      row.addEventListener("pointerleave", function () {
        down = false;
      });
    });
  });
}());
