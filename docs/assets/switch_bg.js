// 等异步引入的按钮HTML渲染完成后再初始化
function initBgSwitch() {
  const btn = document.getElementById('bgToggleBtn');
  const panel = document.getElementById('bgPanel');
  const options = document.querySelectorAll('.bg-option');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (!btn || !panel) return;

  // 初始化缩略图/纯色
  options.forEach(opt => {
    const url = opt.dataset.url;
    const color = opt.dataset.color;
    if (url) {
      opt.style.backgroundImage = `url(${url})`;
      opt.style.backgroundSize = 'cover';
      opt.style.backgroundPosition = 'center';
    } else if (color) {
      opt.style.backgroundColor = color;
      opt.style.backgroundImage = 'none';
    }
  });

  // 读取本地记忆
  const savedType = localStorage.getItem('bgType');
  const savedValue = localStorage.getItem('bgValue');
  if (savedType && savedValue) {
    setBg(savedType, savedValue);
  }

  // 展开收起面板
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('show');
  });

  // 标签切换
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('show'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('show');
    });
  });

  // 点击选项切换背景
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = opt.dataset.url;
      const color = opt.dataset.color;
      if (url) {
        setBg('image', url);
        localStorage.setItem('bgType', 'image');
        localStorage.setItem('bgValue', url);
      } else if (color) {
        setBg('color', color);
        localStorage.setItem('bgType', 'color');
        localStorage.setItem('bgValue', color);
      }
      panel.classList.remove('show');
    });
  });

  // 空白关闭
  document.addEventListener('click', () => {
    panel.classList.remove('show');
  });
}

// 设置背景
function setBg(type, value) {
  if (type === 'image') {
    document.body.style.backgroundImage = `url(${value})`;
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = value;
  }
  document.body.style.transition = 'all 0.5s ease';
}