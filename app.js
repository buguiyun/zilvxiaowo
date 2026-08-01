/* 自律小窝 —— 侧边栏交互 + 卡片渲染 */
(function () {
  'use strict';

  var DATA = window.APP_DATA || { updatedDate: '', news: [], zhengxie: [], gongwen: [], mottos: [] };

  /* ========== 面板配置 ========== */
  var PANEL_CFG = {
    news:     { title: '每日新闻',   sub: '来自主流媒体的当日要闻 · 点开看详情' },
    zhengxie: { title: '政协工作干货', sub: '参政议政 & 材料撰写 · 碎片化学习' },
    gongwen:  { title: '公文写作学习', sub: '文种写法 · 结构思路 · 每日一练' }
  };

  /* ========== 顶部渲染 ========== */
  function renderHeader() {
    var dateEl = document.getElementById('appDate');
    var mottoEl = document.getElementById('dailyMotto');
    var d = DATA.updatedDate || '';
    dateEl.textContent = d ? (d + ' 更新') : '内容待更新';
    var mottos = DATA.mottos && DATA.mottos.length ? DATA.mottos : ['今天也要温柔而坚定地前进呀 \uD83C\uDF3F'];
    var dayIdx = d ? new Date(d).getDate() : new Date().getDate();
    mottoEl.textContent = mottos[dayIdx % mottos.length];
  }

  /* ========== 工具函数 ========== */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function accentOf(panel) {
    return panel;
  }
  function tagClassOf(panel) {
    return panel === 'news' ? 'tag-peach' : panel === 'zhengxie' ? 'tag-lavender' : 'tag-mint';
  }

  function badgeHTML(item) {
    var mt = item.mediaType || 'article';
    var icon = mt === 'video' ? '\u25B6' : mt === 'series' ? '\u29C9' : '\u270E';
    var label = mt === 'video' ? '视频' : mt === 'series' ? '系列' : '文章';
    return '<span class="badge badge-' + mt + '">' + icon + ' ' + label + '</span>';
  }

  /* ========== 卡片渲染 ========== */
  function cardHTML(item, accent, tagClass) {
    var tag = item.source ? '<span class="tag ' + tagClass + '">' + esc(item.source) + '</span>' : '';
    var time = item.time ? '<span class="card-time">' + esc(item.time) + '</span>' : '';
    var summary = item.summary
      ? '<p class="card-summary">' + esc(item.summary) + '</p>'
      : '';
    return (
      '<div class="card" data-accent="' + accent + '" data-id="' + esc(item.id) + '">' +
        '<div class="card-top">' + tag + badgeHTML(item) + time + '</div>' +
        '<h3 class="card-title">' + esc(item.title) + '</h3>' +
        summary +
        '<span class="card-more">查看详情 \u2192</span>' +
      '</div>'
    );
  }

  function renderList(panel) {
    var arr = DATA[panel] || [];
    var box = document.getElementById('list-' + panel);
    if (!box) return;
    if (!arr.length) {
      box.innerHTML = '<div class="empty">今天的内容还在路上\uFF5C<br>稍后再来翻翻看吧 \uD83C\uDF43</div>';
      return;
    }
    box.innerHTML = arr
      .map(function (it) { return cardHTML(it, accentOf(panel), tagClassOf(panel)); })
      .join('');
    var cards = box.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.animationDelay = (i * 0.06) + 's';
    }
  }

  /* ========== 详情浮层 ========== */
  var mask = document.getElementById('modalMask');
  var body = document.getElementById('modalBody');

  function openDetail(item) {
    var points = (item.points && item.points.length)
      ? '<div class="m-section-title">\uD83D\uDCCC 要点速览</div><ul class="m-points">' +
          item.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
      : '';
    var links = '';
    if (item.url || item.videoUrl) {
      links = '<div class="m-links">';
      if (item.url) {
        links += '<a class="m-link" href="' + esc(item.url) + '" target="_blank" rel="noopener">\uD83D\uDCD6 查看原文 \u2197</a>';
      }
      if (item.videoUrl) {
        links += '<a class="m-link m-link-video" href="' + esc(item.videoUrl) + '" target="_blank" rel="noopener">\u25B6\uFE0F 观看视频 \u2197</a>';
      }
      links += '</div>';
    }
    var meta = '';
    if (item.source) meta += '<span class="tag">' + esc(item.source) + '</span>';
    if (item.time) meta += '<span class="tag">' + esc(item.time) + '</span>';
    if (item.seriesName) meta += '<span class="tag tag-mint">\u29C9 ' + esc(item.seriesName) + '</span>';
    meta += badgeHTML(item);

    body.innerHTML =
      '<h3 class="m-title">' + esc(item.title) + '</h3>' +
      '<div class="m-meta">' + meta + '</div>' +
      (item.summary ? '<p class="m-summary">' + esc(item.summary) + '</p>' : '') +
      points + links;
    mask.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    mask.classList.remove('show');
    document.body.style.overflow = '';
  }

  mask.addEventListener('click', function (e) {
    if (e.target === mask) closeDetail();
  });
  document.getElementById('modalClose').addEventListener('click', closeDetail);

  /* ========== 卡片点击 ========== */
  document.querySelector('.app-main').addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    var panel = card.closest('.panel').getAttribute('data-panel');
    var id = card.getAttribute('data-id');
    var item = (DATA[panel] || []).filter(function (x) { return String(x.id) === String(id); })[0];
    if (item) openDetail(item);
  });

  /* ========== 侧边栏切换 ========== */
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  var toggleBtn = document.getElementById('sidebarToggle');
  var sideItems = document.querySelectorAll('.side-item');
  var isMobile = window.matchMedia('(max-width: 768px)');

  // 恢复折叠状态
  try {
    var saved = localStorage.getItem('zilx_sidebar_collapsed');
    if (saved === '1' && !isMobile.matches) {
      sidebar.classList.add('collapsed');
    }
  } catch (e) {}

  toggleBtn.addEventListener('click', function () {
    if (isMobile.matches) {
      // 移动端：展开/收起覆盖式抽屉
      var expanded = sidebar.classList.toggle('expanded');
      overlay.classList.toggle('show', expanded);
    } else {
      // 桌面端：折叠/展开
      var collapsed = sidebar.classList.toggle('collapsed');
      try { localStorage.setItem('zilx_sidebar_collapsed', collapsed ? '1' : '0'); } catch (e) {}
    }
  });

  overlay.addEventListener('click', function () {
    sidebar.classList.remove('expanded');
    overlay.classList.remove('show');
  });

  /* ========== 板块切换 ========== */
  var titleEl = document.getElementById('panelTitle');
  var subEl = document.getElementById('panelSub');

  function switchPanel(target) {
    sideItems.forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-target') === target);
    });
    document.querySelectorAll('.panel').forEach(function (p) {
      p.hidden = p.getAttribute('data-panel') !== target;
    });
    var cfg = PANEL_CFG[target];
    if (cfg) {
      titleEl.style.opacity = '0';
      subEl.style.opacity = '0';
      setTimeout(function () {
        titleEl.textContent = cfg.title;
        subEl.textContent = cfg.sub;
        titleEl.style.opacity = '1';
        subEl.style.opacity = '1';
      }, 150);
    }
    // 移动端切换后收起侧边栏
    if (isMobile.matches) {
      sidebar.classList.remove('expanded');
      overlay.classList.remove('show');
    }
    // 滚动到顶部
    document.querySelector('.main-area').scrollTo({ top: 0, behavior: 'smooth' });
  }

  sideItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      switchPanel(btn.getAttribute('data-target'));
    });
  });

  /* ========== 启动 ========== */
  renderHeader();
  renderList('news');
  renderList('zhengxie');
  renderList('gongwen');

  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
