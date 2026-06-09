(function () {
  var activeHls = null;

  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        activeHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        activeHls.loadSource(source);
        activeHls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.load();
    }

    function startPlayback() {
      attachSource();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
})();
