(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var searchInput = scope.querySelector('[data-card-search]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    var applyFilter = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute('data-year') === year;
        var matchRegion = !region || card.getAttribute('data-region') === region;
        card.style.display = matchKeyword && matchYear && matchRegion ? '' : 'none';
      });
    };

    [searchInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  var searchResults = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchStatus = document.querySelector('[data-search-status]');
  var searchForm = document.querySelector('[data-search-form]');

  if (searchResults && searchInput && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;

    var renderResult = function (movie) {
      return [
        '<article class="movie-card medium">',
        '  <a class="card-cover" href="' + movie.url + '">',
        '    <img src="./' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="score-badge">' + movie.score + '</span>',
        '    <span class="card-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    <p>' + escapeHtml(movie.summary) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre.split(/[，,\/、]/)[0] || movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    };

    var performSearch = function (value) {
      var term = value.trim().toLowerCase();

      if (!term) {
        return;
      }

      var results = window.MOVIE_INDEX.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.summary].join(' ').toLowerCase();
        return text.indexOf(term) !== -1;
      }).slice(0, 120);

      searchResults.innerHTML = results.map(renderResult).join('');

      if (searchStatus) {
        searchStatus.textContent = results.length ? '搜索结果：' + term : '未找到相关影片';
      }
    };

    if (query) {
      performSearch(query);
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = searchInput.value.trim();
        if (value) {
          window.history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
          performSearch(value);
        }
      });
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[character];
    });
  }
}());
