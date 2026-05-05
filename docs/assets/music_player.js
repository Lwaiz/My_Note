document.addEventListener('DOMContentLoaded', function () {
  // 加载 CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
  document.head.appendChild(link);

  // 创建容器
  const playerDiv = document.createElement('div');
  playerDiv.id = 'player';
  playerDiv.className = 'aplayer-fixed';
  document.body.appendChild(playerDiv);

  // 加载 JS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';

  script.onload = function () {
    let currentLeft = 20;
    let currentBottom = 20;

    const ap = new APlayer({
      container: document.getElementById('player'),
      fixed: true,
      autoplay: false,
      volume: 0.1,
      theme: '#0969da',
      lrcType: 0,
      listFolded: true, 
      audio: [
        {
          name: "所念皆星河(纯音乐)",
          artist: "房东的猫",
          url: "https://music.163.com/song/media/outer/url?id=1384026889.mp3",
          cover: "https://p2.music.126.net/M34HFzLO2xhDLuX_zEALKA==/109951164291347934.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1384026889"
        },
        {  
          name: "所念皆星河",
          artist: "房东的猫",
          url: "https://music.163.com/song/media/outer/url?id=1476239407.mp3",
          cover: "https://p2.music.126.net/M34HFzLO2xhDLuX_zEALKA==/109951164291347934.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1476239407"
        },
        {
          name: "菊次郎的夏天",
          artist: "久石让",
          url: "https://music.163.com/song/media/outer/url?id=541326593.mp3",
          cover: "http://p1.music.126.net/8762hSisUAxBEZkq-5EBUg==/109951163163900877.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=541326593"
        },
        {
          name: "题词",
          artist: "房东的猫",
          url:"https://music.163.com/song/media/outer/url?id=1981000772.mp3",
          cover: "http://p1.music.126.net/_cEhfywLzi12jXJ0rDpYkg==/109951167873602739.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1981000772"
        },
        {
          name: "树涝河畔的恋人",
          artist: "约里 / 沙玛阿呷",
          url: "https://music.163.com/song/media/outer/url?id=1425260844.mp3",
          cover: "http://p1.music.126.net/u5amj1wa6rolfLv4wLxr3g==/109951168708901123.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1425260844"
        },
        {
          name: "再见悲哀",
          artist: "林忆莲",
          url: "https://music.163.com/song/media/outer/url?id=28838055.mp3",
          cover: "http://p2.music.126.net/0RS2zl87FxMnaSHJdIycDA==/109951170379820260.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=28838055"
        },
        {
          name: "恰似你温柔",
          artist: "岩贵",
          url: "https://music.163.com/song/media/outer/url?id=1941325110.mp3",
          cover: "http://p2.music.126.net/Q8exgT9nIYvrbQj9_vjjRQ==/109951167339017500.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1941325110"
        },
        {
          name: "Reality",
          artist: "Lost Frequencies / Janieck",
          url: "https://music.163.com/song/media/outer/url?id=32835377.mp3",
          cover: "http://p1.music.126.net/QSK1HDTVJToJGD9ZLT90zA==/109951168660488322.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=32835377"
        },
        {
          name: "Once Upon a Time",
          artist: "Max Oazo / Moonessa",
          url: "https://music.163.com/song/media/outer/url?id=1299570939.mp3",
          cover: "http://p2.music.126.net/Ih0GQRKYyd_yRaWa-jwmVA==/109951167480965715.jpg",
          lrc: "https://api.injahow.cn/meting/?server=netease&type=lrc&id=1299570939"
        }
      ]
    });

    const player = document.getElementById('player');

    function clampPosition(left, bottom) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pw = player.offsetWidth || 400;
      const ph = player.offsetHeight || 80;
      return {
        left: Math.min(Math.max(left, 0), w - pw),
        bottom: Math.min(Math.max(bottom, 0), h - ph)
      };
    }

    function fixPos() {
      const { left, bottom } = clampPosition(currentLeft, currentBottom);
      player.style.left = left + 'px';
      player.style.bottom = bottom + 'px';
      player.style.top = 'auto';
      player.style.right = 'auto';
      currentLeft = left;
      currentBottom = bottom;
    }

    ap.on('ready', function () {
      ap.volume(0.1, true);
      fixPos();
    });

    const observer = new MutationObserver(() => fixPos());
    observer.observe(player, { attributes: true, attributeFilter: ['style', 'class'], subtree: true });
    ap.on('listshow', fixPos);
    ap.on('listhide', fixPos);
    window.addEventListener('resize', fixPos);

    let isDrag = false;
    let startX, startY, startLeft, startBottom;

    function getClientPos(e) {
      return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    }

    function onDragStart(e) {
      const allowDrag = !e.target.closest(
        '.aplayer-play, .aplayer-button, .aplayer-bar, .aplayer-volume, .aplayer-list, .aplayer-icon-menu, .aplayer-lrc'
      );
      if (!allowDrag) return;

      isDrag = true;
      const rect = player.getBoundingClientRect();
      const pos = getClientPos(e);
      startX = pos.x;
      startY = pos.y;
      startLeft = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      player.style.transition = 'none';
    }

    function onDragMove(e) {
      if (!isDrag) return;
      const pos = getClientPos(e);
      currentLeft = startLeft + (pos.x - startX);
      currentBottom = startBottom - (pos.y - startY);
      fixPos();
    }

    function onDragEnd() {
      isDrag = false;
      player.style.transition = '0.2s ease';
    }

    player.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    player.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  };

  document.body.appendChild(script);
});
