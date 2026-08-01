/* 自律小窝 —— 渲染与交互 */
(function () {
  'use strict';

  var DATA = window.APP_DATA || { updatedDate: '', news: [], zhengxie: [], gongwen: [], mottos: [] };

  // 顶部日期与寄语
  function renderHeader() {
    var dateEl = document.getElementById('appDate');
    var mottoEl = document.getElementById('dailyMotto');
    var d = DATA.updatedDate || '';
    dateEl.textContent = d ? (d + ' · 内容已更新') : '内容待更新';
    var mottos = DATA.mottos && DATA.mottos.length ? DATA.mottos : ['今天也要温柔而坚定地前进呀 🌿'];
    var dayIdx = d ? new Date(d).getDate() : new Date().getDate();
    mottoEl.textContent = mottos[dayIdx % mottos.length];
  }

  // 单条卡片
  function cardHTML(item, accent, tagClass) {
    var tag = item.source ? '<span class="tag ' + tagClass + '">' + esc(item.source) + '</span>' : '';
    var time = item.time ? '<span class="card-time">' + esc(item.time) + '</span>' : '';
    var summary = item.summary
      ? '<p class="card-summary">' + esc(item.summary) + '</p>'
      : '';
    return (
      '<div class="card" data-accent="' + accent + '" data-id="' + esc(item.id) + '">' +
        '<div class="card-top">' + tag + time + '</div>' +
        '<h3 class="card-title">' + esc(item.title) + '</h3>' +
        summary +
        '<span class="card-more">查看详情 →</span>' +
      '</div>'
    );
  }

  function accentOf(panel) {
    return panel === 'news' ? 'news' : panel === 'zhengxie' ? 'zhengxie' : 'gongwen';
  }
  function tagClassOf(panel) {
    return panel === 'news' ? 'tag-peach' : panel === 'zhengxie' ? 'tag-lavender' : 'tag-mint';
  }

  function renderList(panel) {
    var arr = DATA[panel] || [];
    var box = document.getElementById('list-' + panel);
    if (!arr.length) {
      box.innerHTML = '<div class="empty">今天的内容还在路上～<br>稍后再来翻翻看吧 🍃</div>';
      return;
    }
    box.innerHTML = arr
      .map(function (it) { return cardHTML(it, accentOf(panel), tagClassOf(panel)); })
      .join('');
    // 入场错峰动画
    var cards = box.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.animationDelay = (i * 0.06) + 's';
    }
  }

  // 详情浮层
  var mask = document.getElementById('modalMask');
  var sheet = document.getElementById('modalSheet');
  var body = document.getElementById('modalBody');

  function openDetail(item) {
    var points = (item.points && item.points.length)
      ? '<div class="m-section-title">📌 要点速览</div><ul class="m-points">' +
          item.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'
      : '';
    var link = item.url
      ? '<a class="m-link" href="' + encodeURI(item.url) + '" target="_blank" rel="noopener">前往来源查看原文 ↗</a>'
      : '';
    var meta = '';
    if (item.source) meta += '<span class="tag">' + esc(item.source) + '</span>';
    if (item.time) meta += '<span class="tag">' + esc(item.time) + '</span>';
    body.innerHTML =
      '<h3 class="m-title">' + esc(item.title) + '</h3>' +
      '<div class="m-meta">' + meta + '</div>' +
      (item.summary ? '<p class="m-summary">' + esc(item.summary) + '</p>' : '') +
      points + link;
    mask.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeDetail() {
    mask.hidden = true;
    document.body.style.overflow = '';
  }

  mask.addEventListener('click', function (e) {
    if (e.target === mask) closeDetail();
  });
  document.getElementById('modalClose').addEventListener('click', closeDetail);

  // 卡片点击（事件委托）
  document.querySelector('.app-main').addEventListener('click', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    var panel = card.closest('.panel').getAttribute('data-panel');
    var id = card.getAttribute('data-id');
    var item = (DATA[panel] || []).filter(function (x) { return String(x.id) === String(id); })[0];
    if (item) openDetail(item);
  });

  // 底部 Tab 切换
  var navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-target');
      navItems.forEach(function (b) { b.classList.toggle('active', b === btn); });
      document.querySelectorAll('.panel').forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== target;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // 启动
  renderHeader();
  renderList('news');
  renderList('zhengxie');
  renderList('gongwen');

  // 注册 Service Worker（需 http/localhost 环境）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
