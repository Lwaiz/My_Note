document.addEventListener('DOMContentLoaded', function() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
  document.head.appendChild(link);

  const playerDiv = document.createElement('div');
  playerDiv.id = 'player';
  playerDiv.className = 'aplayer-fixed';
  document.body.appendChild(playerDiv);

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';

  script.onload = function() {
    Object.defineProperty(HTMLMediaElement.prototype, 'played', {
      get: () => ({ length: 0 })
    });

    localStorage.removeItem('aplayer-volume');

    const ap = new APlayer({
      container: document.getElementById('player'),
      fixed: true,
      autoplay: false,
      volume: 0.1,
      theme: '#0969da',
      audio: [
        {
          name: "所念皆星河",
          artist: "房东的猫",
          url: "https://music.163.com/song/media/outer/url?id=1384026889.mp3",
          cover: "https://p2.music.126.net/M34HFzLO2xhDLuX_zEALKA==/109951164291347934.jpg"
        },
        {
          name: "菊次郎的夏天",
          artist: "久石让",
          url: "https://music.163.com/song/media/outer/url?id=541326593.mp3",
          cover: "http://p1.music.126.net/8762hSisUAxBEZkq-5EBUg==/109951163163900877.jpg"
        }
      ]
    });

    const player = document.getElementById('player');
    let currentLeft = 20;
    let currentBottom = 20;

    ap.on('ready', function () {
      ap.volume(0.1, true);
      fixPos();
    });

    // 拖拽
    let isDrag = false;
    let startX, startY, startLeft, startBottom;

    player.addEventListener('mousedown', function(e) {
      if (e.target.closest('.aplayer-button, .aplayer-bar, .aplayer-volume, .aplayer-list')) return;
      isDrag = true;
      const rect = player.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      player.style.transition = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!isDrag) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      currentLeft = startLeft + dx;
      currentBottom = startBottom - dy;
      fixPos();
    });

    document.addEventListener('mouseup', function() {
      isDrag = false;
      player.style.transition = '0.2s ease';
    });

    // 🔥 终极位置锁定：永远用 left + bottom，绝不乱跳
    function fixPos() {
      player.style.left = currentLeft + 'px';
      player.style.bottom = currentBottom + 'px';
      player.style.top = 'auto';
      player.style.right = 'auto';
    }

    // 监听展开、收起，强制恢复位置
    ap.on('listshow', fixPos);
    ap.on('listhide', fixPos);

    // 每10毫秒加固一次位置（彻底防止下移）
    setInterval(fixPos, 10);
  };

  document.body.appendChild(script);
});