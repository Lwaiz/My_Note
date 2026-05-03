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
    // 初始位置（可以用 localStorage 记忆）
    let currentLeft = 20;
    let currentBottom = 20;

    const ap = new APlayer({
      container: document.getElementById('player'),
      fixed: true,
      autoplay: false,
      volume: 0.1,
      theme: '#0969da',
      audio: [
        {
          name: "所念皆星河(纯音乐)",
          artist: "房东的猫",
          url: "https://music.163.com/song/media/outer/url?id=1384026889.mp3",
          cover: "https://p2.music.126.net/M34HFzLO2xhDLuX_zEALKA==/109951164291347934.jpg"
        },
        {  
          name: "所念皆星河",
          artist: "房东的猫",
          url: "https://music.163.com/song/media/outer/url?id=1476239407.mp3",
          cover: "https://p2.music.126.net/M34HFzLO2xhDLuX_zEALKA==/109951164291347934.jpg"
        },
        {
          name: "菊次郎的夏天",
          artist: "久石让",
          url: "https://music.163.com/song/media/outer/url?id=541326593.mp3",
          cover: "http://p1.music.126.net/8762hSisUAxBEZkq-5EBUg==/109951163163900877.jpg"
        },
        {
          name: "题词",
          artist: "房东的猫",
          url:"https://music.163.com/song/media/outer/url?id=1981000772.mp3",
          cover: "http://p1.music.126.net/_cEhfywLzi12jXJ0rDpYkg==/109951167873602739.jpg"
        },
        {
          name: "树涝河畔的恋人",
          artist: "约里 / 沙玛阿呷",
          url: "https://music.163.com/song/media/outer/url?id=1425260844.mp3",
          cover: "http://p1.music.126.net/u5amj1wa6rolfLv4wLxr3g==/109951168708901123.jpg"
        },
        {
          name: "再见悲哀",
          artist: "林忆莲",
          url: "https://music.163.com/song/media/outer/url?id=28838055.mp3",
          cover: "http://p2.music.126.net/0RS2zl87FxMnaSHJdIycDA==/109951170379820260.jpg"
        },
        {
          name: "恰似你温柔",
          artist: "岩贵",
          url: "https://music.163.com/song/media/outer/url?id=1941325110.mp3",
          cover: "http://p2.music.126.net/Q8exgT9nIYvrbQj9_vjjRQ==/109951167339017500.jpg"
        },
        {
          name: "Reality",
          artist: "Lost Frequencies / Janieck",
          url: "https://music.163.com/song/media/outer/url?id=32835377.mp3",
          cover: "http://p1.music.126.net/QSK1HDTVJToJGD9ZLT90zA==/109951168660488322.jpg"
        },
        {
          name: "Once Upon a Time",
          artist: "Max Oazo / Moonessa",
          url: "https://music.163.com/song/media/outer/url?id=1299570939.mp3",
          cover: "http://p2.music.126.net/Ih0GQRKYyd_yRaWa-jwmVA==/109951167480965715.jpg"
        }
      ]
    });

    const player = document.getElementById('player');

    // 位置修正函数（带边界限制）
    function clampPosition(left, bottom) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pw = player.offsetWidth;
      const ph = player.offsetHeight;
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

    // 初始化时应用一次位置
    ap.on('ready', function () {
      ap.volume(0.1, true); // 确保音量为 0.1
      fixPos();
    });

    // ---- 用 MutationObserver 监听 APlayer 的样式/属性改动 ----
    const observer = new MutationObserver(() => {
      // 一旦 APlayer 修改了自身样式（如列表开关），立即校准位置
      fixPos();
    });
    observer.observe(player, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true
    });

    // 仍可保留列表显隐的事件回调，双重保险
    ap.on('listshow', fixPos);
    ap.on('listhide', fixPos);

    // 窗口大小变化时重新约束位置
    window.addEventListener('resize', fixPos);

    // ---- 统一拖拽（支持鼠标与触摸） ----
    function getClientPos(e) {
      if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    let isDrag = false;
    let startX, startY, startLeft, startBottom;

    function onDragStart(e) {
      // 避免与播放器控件交互冲突
      if (e.target.closest('.aplayer-button, .aplayer-bar, .aplayer-volume, .aplayer-list, .aplayer-lrc')) return;
      e.preventDefault();
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
      const dx = pos.x - startX;
      const dy = pos.y - startY;
      currentLeft = startLeft + dx;
      currentBottom = startBottom - dy;
      fixPos();
    }

    function onDragEnd() {
      isDrag = false;
      player.style.transition = '0.2s ease';
    }

    // 鼠标事件
    player.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    // 触摸事件
    player.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  };

  document.body.appendChild(script);
});