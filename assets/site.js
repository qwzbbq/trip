(function () {
  const spots = window.TRIP_SPOTS || [];

  function $(selector) {
    return document.querySelector(selector);
  }

  function createSpotCard(spot) {
    return `
      <article class="spot-card tone-${spot.tone}">
        <div class="spot-card-top">
          <span class="spot-meta">${spot.region} / ${spot.category}</span>
          <h3>${spot.title}</h3>
          <p>${spot.subtitle}</p>
        </div>
        <ul class="spot-facts">
          <li><strong>季节</strong><span>${spot.season}</span></li>
          <li><strong>时长</strong><span>${spot.duration}</span></li>
          <li><strong>门票</strong><span>${spot.ticket}</span></li>
        </ul>
        <a class="button button-secondary" href="spot.html?slug=${spot.slug}">查看攻略</a>
      </article>
    `;
  }

  function renderHome() {
    const featured = $("#featured-spots");
    if (!featured) return;
    featured.innerHTML = spots.map(createSpotCard).join("");
  }

  function fillSelect(select, values) {
    select.innerHTML = ['<option value="">全部</option>']
      .concat(values.map((value) => `<option value="${value}">${value}</option>`))
      .join("");
  }

  function renderList() {
    const listRoot = $("#list-spots");
    if (!listRoot) return;

    const searchInput = $("#search-input");
    const regionFilter = $("#region-filter");
    const categoryFilter = $("#category-filter");
    const seasonFilter = $("#season-filter");
    const resultCount = $("#results-count");

    fillSelect(regionFilter, [...new Set(spots.map((spot) => spot.region))]);
    fillSelect(categoryFilter, [...new Set(spots.map((spot) => spot.category))]);
    fillSelect(
      seasonFilter,
      [...new Set(spots.map((spot) => spot.season))]
    );

    function update() {
      const keyword = searchInput.value.trim().toLowerCase();
      const region = regionFilter.value;
      const category = categoryFilter.value;
      const season = seasonFilter.value;

      const filtered = spots.filter((spot) => {
        const matchesKeyword =
          !keyword ||
          [spot.title, spot.city, spot.province, spot.subtitle].join(" ").toLowerCase().includes(keyword);
        const matchesRegion = !region || spot.region === region;
        const matchesCategory = !category || spot.category === category;
        const matchesSeason = !season || spot.season === season;
        return matchesKeyword && matchesRegion && matchesCategory && matchesSeason;
      });

      resultCount.textContent = `共找到 ${filtered.length} 个景点`;
      listRoot.innerHTML = filtered.map(createSpotCard).join("");
    }

    [searchInput, regionFilter, categoryFilter, seasonFilter].forEach((element) => {
      element.addEventListener("input", update);
      element.addEventListener("change", update);
    });

    update();
  }

  function renderDetail() {
    const root = $("#detail-root");
    if (!root) return;

    const slug = new URLSearchParams(window.location.search).get("slug");
    const spot = spots.find((item) => item.slug === slug) || spots[0];

    document.title = `${spot.title}攻略 | Trip`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", `${spot.title}详细旅行攻略，包含亮点、交通、路线、美食、住宿、预算和注意事项。`);
    }

    const relatedSpots = spot.related
      .map((relatedSlug) => spots.find((item) => item.slug === relatedSlug))
      .filter(Boolean);

    root.innerHTML = `
      <section class="detail-hero tone-${spot.tone}">
        <div class="detail-hero-copy">
          <p class="eyebrow">${spot.region} / ${spot.category}</p>
          <h1>${spot.title}</h1>
          <p class="detail-subtitle">${spot.subtitle}</p>
          <p class="detail-intro">${spot.intro}</p>
        </div>
        <aside class="info-panel">
          <h2>基本信息</h2>
          <ul>
            <li><span>所在城市</span><strong>${spot.city}</strong></li>
            <li><span>开放时间</span><strong>${spot.hours}</strong></li>
            <li><span>建议时长</span><strong>${spot.duration}</strong></li>
            <li><span>门票参考</span><strong>${spot.ticket}</strong></li>
            <li><span>最佳季节</span><strong>${spot.season}</strong></li>
          </ul>
        </aside>
      </section>

      <section class="anchor-nav">
        <a href="#highlights">亮点</a>
        <a href="#transport">交通</a>
        <a href="#routes">路线</a>
        <a href="#food">美食</a>
        <a href="#stay">住宿</a>
        <a href="#budget">预算</a>
        <a href="#faq">FAQ</a>
      </section>

      <section class="detail-section" id="highlights">
        <div class="section-heading">
          <p class="eyebrow">Highlights</p>
          <h2>核心亮点</h2>
        </div>
        <div class="detail-grid three">
          ${spot.highlights.map((item) => `<article class="detail-card"><p>${item}</p></article>`).join("")}
        </div>
      </section>

      <section class="detail-section" id="transport">
        <div class="section-heading">
          <p class="eyebrow">Transportation</p>
          <h2>交通攻略</h2>
        </div>
        <div class="detail-grid two">
          <article class="detail-card"><h3>飞机</h3><p>${spot.transportation.air}</p></article>
          <article class="detail-card"><h3>高铁 / 火车</h3><p>${spot.transportation.rail}</p></article>
          <article class="detail-card"><h3>市内交通</h3><p>${spot.transportation.local}</p></article>
          <article class="detail-card"><h3>自驾建议</h3><p>${spot.transportation.drive}</p></article>
        </div>
      </section>

      <section class="detail-section" id="routes">
        <div class="section-heading">
          <p class="eyebrow">Suggested Routes</p>
          <h2>游玩路线推荐</h2>
        </div>
        <div class="detail-grid three">
          ${spot.itineraries
            .map(
              (route) => `
                <article class="detail-card route-card">
                  <h3>${route.title}</h3>
                  <p>${route.summary}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-grid two">
          <article class="detail-card">
            <h2>必看景点 / 打卡点</h2>
            <ul class="tag-list">
              ${spot.attractions.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
          <article class="detail-card" id="food">
            <h2>美食推荐</h2>
            <ul class="tag-list">
              ${spot.food.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
        </div>
      </section>

      <section class="detail-section" id="stay">
        <div class="section-heading">
          <p class="eyebrow">Stay</p>
          <h2>住宿建议</h2>
        </div>
        <div class="detail-grid three">
          <article class="detail-card">
            <h3>高端型</h3>
            <p>${spot.hotel.luxury.join(" ")}</p>
          </article>
          <article class="detail-card">
            <h3>舒适型</h3>
            <p>${spot.hotel.comfort.join(" ")}</p>
          </article>
          <article class="detail-card">
            <h3>经济型</h3>
            <p>${spot.hotel.budget.join(" ")}</p>
          </article>
        </div>
      </section>

      <section class="detail-section">
        <div class="detail-grid two">
          <article class="detail-card" id="budget">
            <h2>预算参考</h2>
            <p><strong>单人预算：</strong>${spot.budget.single}</p>
            <p><strong>双人预算：</strong>${spot.budget.couple}</p>
          </article>
          <article class="detail-card">
            <h2>注意事项</h2>
            <ul class="stack-list">
              ${spot.tips.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </article>
        </div>
      </section>

      <section class="detail-section" id="faq">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2>常见问题</h2>
        </div>
        <div class="faq-list">
          ${spot.faq
            .map(
              (item) => `
                <article class="detail-card">
                  <h3>${item.q}</h3>
                  <p>${item.a}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="detail-section">
        <div class="section-heading">
          <p class="eyebrow">Related Spots</p>
          <h2>相关推荐</h2>
        </div>
        <div class="spot-grid">
          ${relatedSpots.map(createSpotCard).join("")}
        </div>
      </section>
    `;
  }

  function bindNavToggle() {
    const toggle = $(".nav-toggle");
    const nav = $(".site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  bindNavToggle();

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "list") renderList();
  if (page === "detail") renderDetail();
})();
