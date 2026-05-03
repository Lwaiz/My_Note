

// ==============================
// 背景图片切换功能（安全集成版）
// ==============================
// ==============================
// 全局背景切换（三页面同步记忆）
// ==============================
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('bgToggleBtn');
  const panel = document.getElementById('bgPanel');
  const options = document.querySelectorAll('.bg-option');

  if (!btn || !panel || !options.length) return;

  // 初始化缩略图
  options.forEach(opt => {
    const url = opt.dataset.url;
    if (url) opt.style.backgroundImage = `url(${url})`;
  });

  // 读取记忆的背景
  const savedBg = localStorage.getItem('siteBackground');
  if (savedBg) {
    setBackground(savedBg);
  }

  // 展开/收起面板
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.toggle('show');
  });

  // 点击切换背景 + 保存记忆
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = opt.dataset.url;
      if (url) {
        setBackground(url);
        localStorage.setItem('siteBackground', url);
        panel.classList.remove('show');
      }
    });
  });

  // 点击空白关闭
  document.addEventListener('click', () => {
    panel.classList.remove('show');
  });

  function setBackground(url) {
    document.body.style.backgroundImage = `url(${url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.transition = 'background 0.5s ease';
  }
});