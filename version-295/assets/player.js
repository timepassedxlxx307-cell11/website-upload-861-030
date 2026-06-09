import { H as Hls } from './hls-dru42stk.js';

document.querySelectorAll('[data-player]').forEach(function (player) {
  var video = player.querySelector('video');
  var playButton = player.querySelector('[data-play]');
  var source = player.getAttribute('data-source');
  var hls = null;
  var started = false;

  var startVideo = function () {
    if (!video || !source) {
      return;
    }

    if (!started) {
      started = true;
      player.classList.add('is-playing');
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.muted = true;
        video.play().catch(function () {});
      });
    }
  };

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        startVideo();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
