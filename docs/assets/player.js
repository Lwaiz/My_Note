// 歌单列表
const musicList = [
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
];

// DOM获取
const $ = id => document.getElementById(id);
const wrap = $('playerWrap'), mini = $('miniPlayer'), miniCover = $('miniCover'), miniPlay = $('miniPlayBtn');
const full = $('fullPlayer'), dragBar = $('dragBar'), collapse = $('collapseBtn'), audio = $('audio');
const cover = $('cover'), name = $('songName'), artist = $('songArtist'), play = $('playBtn');
const prev = $('prevBtn'), next = $('nextBtn'), listBtn = $('listBtn'), listWrap = $('listWrap');

let idx = 0, left = 0, bottom = 0, dragging = false, sx=0, sy=0, sl=0, sb=0;

// 渲染歌单（直接渲染到listWrap，不用额外容器，避免结构错误）
function renderList() {
  listWrap.innerHTML = '';
  musicList.forEach((m, i) => {
    const d = document.createElement('div');
    d.className = 'list-item' + (i === idx ? ' active' : '');
    d.innerHTML = `<span class="list-index">${i+1}</span><span class="list-name">${m.name}</span><span class="list-author">${m.artist}</span>`;
    d.onclick = () => { idx = i; load(idx); audio.play(); updateBtn(); };
    listWrap.appendChild(d);
  });
}

// 加载音乐
function load(i) {
  const m = musicList[i];
  audio.src = m.url;
  cover.src = miniCover.src = m.cover;
  name.innerText = m.name;
  artist.innerText = m.artist;
  renderList();
}

// 更新播放按钮状态
function updateBtn() {
  const i = audio.paused ? '▶' : '⏸';
  play.innerText = i;
  miniPlay.innerText = i;
}

// 向父页面发送状态同步消息
function post(msg) {
  try { window.parent.postMessage(msg, '*'); } catch(e) {}
}

// 事件绑定
mini.onclick = e => {
  if (e.target === miniPlay) return;
  wrap.classList.add('expand');
  post('expand');
};

collapse.onclick = () => {
  wrap.classList.remove('expand');
  listWrap.classList.remove('show');
  post('mini');
};

miniPlay.onclick = e => {
  e.stopPropagation();
  audio.paused ? audio.play() : audio.pause();
  updateBtn();
};

play.onclick = () => {
  audio.paused ? audio.play() : audio.pause();
  updateBtn();
};

prev.onclick = () => {
  idx = (idx - 1 + musicList.length) % musicList.length;
  load(idx); audio.play(); updateBtn();
};

next.onclick = () => {
  idx = (idx + 1) % musicList.length;
  load(idx); audio.play(); updateBtn();
};

// 歌单按钮点击事件（修复版，确保状态同步）
listBtn.onclick = e => {
  e.stopPropagation();
  const isShow = listWrap.classList.toggle('show');
  post(isShow ? 'list' : 'expand');
};

audio.onended = () => next.click();

// 拖拽功能
dragBar.onmousedown = e => {
  dragging = true;
  const r = wrap.getBoundingClientRect();
  sx = e.clientX; sy = e.clientY;
  sl = r.left; sb = window.parent.innerHeight - r.bottom;
  wrap.style.transition = 'none';
};

document.onmousemove = e => {
  if (!dragging) return;
  left = sl + (e.clientX - sx);
  bottom = sb - (e.clientY - sy);
  wrap.style.left = left + 'px';
  wrap.style.bottom = bottom + 'px';
};

document.onmouseup = () => {
  dragging = false;
  wrap.style.transition = 'left 0.15s ease, bottom 0.15s ease';
};

// 初始化
audio.volume = 0.1;
load(0);
renderList();
post('mini');