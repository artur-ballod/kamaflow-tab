let swiperInstance = null;
let activeYear = null;

function getStore() {
    const el = document.getElementById('analytics-json');
    if (!el) return null;

    try {
        return JSON.parse(el.textContent);
    } catch (e) {
        return null;
    }
}


function getActiveYear() {
    return activeYear;
}

// ------------------------------
// Utils
// ------------------------------
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function extractNumbers(text) {
    const regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
    const matches = text.match(regex);
    return matches ? matches : [];
}

// ------------------------------
// Year UI
// ------------------------------
function getActiveYearFromUI() {
    const btn = document.querySelector('.year-selector button.active');
    if (!btn) return null;
    const y = parseInt(btn.dataset.year, 10);
    return Number.isFinite(y) ? y : null;
}

function setActiveYearUI(year) {
    document.querySelectorAll('.year-selector button[data-year]').forEach((b) => {
        b.classList.toggle('active', parseInt(b.dataset.year, 10) === year);
    });
}

function getMonthsForYear(year) {
    const store = getStore();
    if (!store || !store.monthsByYear) return [];
    return store.monthsByYear[year] || [];
}

// ------------------------------
// DOM render slides
// ------------------------------
function renderSlidesForYear(year) {
    const months = getMonthsForYear(year);
    const wrapper = document.querySelector('.analytic-data.slider .swiper-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = months
        .map((month) => {
            const groupsHtml = (month.groups || [])
                .map((group) => {
                    const items = (group.indicators || [])
                        .map((ind) => {
                            const v = ind.value ?? '';
                            return `<div class="analytic-data__item indicator-row" data-indicator="${ind.id}">${v}</div>`;
                        })
                        .join('');

                    return `
              <div class="analytic-data__group">
                <div class="start-item"></div>
                <div class="analytic-data__list">${items}</div>
              </div>
            `;
                })
                .join('');

            return `
          <div class="analytic-data__block swiper-slide" data-month="${month.id}">
            <div class="analytic-data__month swiper">${month.name}</div>
            ${groupsHtml}
          </div>
        `;
        })
        .join('');
}

// ------------------------------
// Collect months from DOM (для графиков)
// ------------------------------
function collectMonths(indicatorId) {
    const slides = document.querySelectorAll('.swiper-slide');
    const year = getActiveYear();

    return Array.from(slides)
        .map((slide, i) => {
            const monthId = slide.getAttribute('data-month'); // строка: jan/feb/...
            const monthName = slide.querySelector('.analytic-data__month')?.textContent.trim() || '';
            const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
            if (!indicator) return null;

            const numbers = extractNumbers(indicator.textContent.trim());
            const value =
                numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : null;

            return { id: monthId || String(i + 1), name: monthName, value, year };
        })
        .filter(Boolean);
}

// ------------------------------
// Charts
// ------------------------------
function groupByQuarters(months) {
    const quarters = [[], [], [], []];
    months.forEach((m, i) => {
        const q = Math.floor(i / 3);
        quarters[q].push(m.value || 0);
    });
    return quarters.map((q) => q.reduce((a, b) => a + b, 0));
}

function renderIndicatorChart(container, indicatorId) {
    const months = collectMonths(indicatorId);
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const year = getActiveYear() || today.getFullYear();

    if (months.length === 0) {
        container.innerHTML = '<div class="no-data">Нет данных для графика</div>';
        return;
    }

    const width = container.offsetWidth || 380;
    const svgHeight = 180;
    const paddingBottom = 24;
    const chartHeight = svgHeight - paddingBottom;

    const maxVal = Math.max(...months.map((m) => (m.value > 0 ? m.value : 0)));
    const scale = maxVal > 0 ? (chartHeight - 10) / maxVal : 1;
    const gap = 6;
    const barWidth = width / months.length - gap;

    let bars = '';
    let labels = '';

    months.forEach((m, i) => {
        const x = i * (barWidth + gap) + gap / 2;
        const barHeight = m.value > 0 ? m.value * scale : 2;

        let color = '#F1F1F1';
        if (i === currentMonthIndex) {
            color = '#34A3DC';
        } else if (m.value > 0) {
            if (i < currentMonthIndex) color = '#3ECB22';
        }

        const shortMonth = (m.name || '').substring(0, 3);
        const labelMonth = shortMonth;
        const labelYear = String(year).slice(-2);

        bars += `<rect class="bar" data-target="${barHeight}"
                      x="${x}" y="${chartHeight}"
                      width="${barWidth}" height="0"
                      fill="${color}" rx="3" />`;

        labels += `
        <text x="${x + barWidth / 2}" y="${chartHeight + 12}"
              text-anchor="middle" font-size="10">${labelMonth}</text>
        <text x="${x + barWidth / 2}" y="${chartHeight + 22}"
              text-anchor="middle" font-size="10">${labelYear}</text>
      `;
    });

    container.innerHTML = `
      <svg class="indicator-chart" width="${width}" height="${svgHeight}">
        ${bars}
        ${labels}
      </svg>
    `;

    const barsEls = container.querySelectorAll('.bar');
    barsEls.forEach((bar) => {
        const targetHeight = parseFloat(bar.getAttribute('data-target'));
        let currentHeight = 0;
        const step = targetHeight / 30;

        function animate() {
            currentHeight += step;
            if (currentHeight >= targetHeight) currentHeight = targetHeight;

            bar.setAttribute('height', currentHeight);
            bar.setAttribute('y', chartHeight - currentHeight);

            if (currentHeight < targetHeight) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    });
}

function renderRadialChart(container, indicatorId) {
    const slides = document.querySelectorAll('.swiper-slide');
    const months = Array.from(slides)
        .map((slide, i) => {
            const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
            if (!indicator) return null;

            const numbers = extractNumbers(indicator.textContent.trim());
            const value =
                numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : 0;

            return { id: i + 1, value };
        })
        .filter(Boolean);

    const quarters = [0, 0, 0, 0];
    months.forEach((m, i) => {
        const qIndex = Math.floor(i / 3);
        quarters[qIndex] += m.value;
    });

    const total = quarters.reduce((a, b) => a + b, 0);
    if (total === 0) {
        container.innerHTML = '<div class="no-data">Нет данных для круговой диаграммы</div>';
        return;
    }

    const colors = ['#3ECB22', '#34A3DC', '#F1C40F', '#E74C3C'];
    const size = 160;
    const radius = size / 2;
    let cumulativeAngle = -Math.PI / 2;
    let paths = '';

    quarters.forEach((val, i) => {
        if (val <= 0) return;

        const angle = (val / total) * 2 * Math.PI;

        const x1 = size / 2 + radius * Math.cos(cumulativeAngle);
        const y1 = size / 2 + radius * Math.sin(cumulativeAngle);

        cumulativeAngle += angle;

        const x2 = size / 2 + radius * Math.cos(cumulativeAngle);
        const y2 = size / 2 + radius * Math.sin(cumulativeAngle);

        const largeArc = angle > Math.PI ? 1 : 0;

        paths += `
        <path d="
          M${size / 2},${size / 2}
          L${x1},${y1}
          A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
          Z
        " fill="${colors[i]}" />
      `;
    });

    const hole = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius / 1.25}" fill="white" />`;

    let legend = `<div class="legend">`;
    quarters.forEach((_, i) => {
        legend += `
        <div class="legend__item">
          <span class="legend__item-color" style="background:${colors[i]}"></span>
          Q${i + 1}
        </div>
      `;
    });
    legend += `</div>`;

    container.innerHTML = `
      ${legend}
      <svg width="${size}" height="${size}">
        ${paths}
        ${hole}
      </svg>
    `;
}

function renderChart(container, indicatorId, type = 'radial') {
    container.innerHTML = '';

    const switcher = document.createElement('div');
    switcher.className = 'chart-switcher';
    switcher.innerHTML = `
      <button data-type="bar" class="chart-tab ${type === 'bar' ? 'active' : ''}">Столбцы</button>
      <button data-type="radial" class="chart-tab ${type === 'radial' ? 'active' : ''}">Круг</button>
    `;
    container.appendChild(switcher);

    const chartWrapperBar = document.createElement('div');
    chartWrapperBar.className = 'chart-container chart-bar';
    const chartWrapperRadial = document.createElement('div');
    chartWrapperRadial.className = 'chart-container chart-radial';

    container.appendChild(chartWrapperBar);
    container.appendChild(chartWrapperRadial);

    renderIndicatorChart(chartWrapperBar, indicatorId);
    renderRadialChart(chartWrapperRadial, indicatorId);

    if (type === 'bar') {
        chartWrapperRadial.style.display = 'none';
    } else {
        chartWrapperBar.style.display = 'none';
    }

    switcher.querySelectorAll('.chart-tab').forEach((btn) => {
        btn.addEventListener('click', () => {
            const newType = btn.getAttribute('data-type');

            switcher.querySelectorAll('.chart-tab').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            if (newType === 'bar') {
                chartWrapperBar.style.display = '';
                chartWrapperRadial.style.display = 'none';
            } else {
                chartWrapperBar.style.display = 'none';
                chartWrapperRadial.style.display = '';
            }
        });
    });
}

// ------------------------------
// Graph containers (unchanged logic, but works with delegated click)
// ------------------------------
function toggleGraphContainers(clickedIndicatorId) {
    const graphContainerClass = 'analytic-frame';

    function toggleInContainer(container) {
        const indicators = container.querySelectorAll('.indicator-row');
        indicators.forEach((indicator) => {
            if (indicator.getAttribute('data-indicator') === clickedIndicatorId) {
                let graphContainer = indicator.nextElementSibling;
                if (graphContainer && graphContainer.classList.contains(graphContainerClass)) {
                    graphContainer.remove();
                } else {
                    graphContainer = document.createElement('div');
                    graphContainer.className = graphContainerClass;

                    const innerFrame = document.createElement('div');
                    innerFrame.className = 'analytic-frame__wrapper';
                    graphContainer.appendChild(innerFrame);

                    renderChart(innerFrame, clickedIndicatorId, 'bar');

                    indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
                }
            }
        });
    }

    document.querySelectorAll('.swiper-slide').forEach((slide) => toggleInContainer(slide));

    const fixedColumn = document.querySelector('.analytic-aside');
    if (fixedColumn) toggleInContainer(fixedColumn);
}

function setAsideFrameWidth() {
    const content = document.querySelector('.analytic-content');
    if (!content) return;

    const contentWidth = content.offsetWidth;
    const asideFrames = document.querySelectorAll('.analytic-frame__wrapper');
    asideFrames.forEach((asideFrame) => {
        asideFrame.style.minWidth = `${contentWidth - 6}px`;
    });
}

// ------------------------------
// Swiper + month highlighting + segments + diff
// ------------------------------
// function highlightCurrentMonth(swiper) {
//     const today = new Date();
//     const currentMonthIndex = today.getMonth();

//     swiper.slides.forEach((slide) => slide.classList.remove('current'));
//     if (swiper.slides[currentMonthIndex]) {
//         swiper.slides[currentMonthIndex].classList.add('current');
//     }
// }
function highlightCurrentMonth(swiper) {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const systemYear = today.getFullYear();

    // всегда сначала чистим
    swiper.slides.forEach((slide) => slide.classList.remove('current'));

    // если выбран НЕ текущий год — ничего не подсвечиваем
    if (getActiveYear() !== systemYear) return;

    if (swiper.slides[currentMonthIndex]) {
        swiper.slides[currentMonthIndex].classList.add('current');
    }
}

function setIndicator(indicator, width, isHidden) {
    if (!indicator) return;
    if (isHidden) {
        indicator.classList.add('hidden');
        indicator.style.width = '0%';
    } else {
        indicator.classList.remove('hidden');
        indicator.style.width = `${width}%`;
    }
}

function updateIndicatorsWidth(swiper) {
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const systemYear = today.getFullYear();

    const slidesPerView = swiper.params.slidesPerView;
    const slidesTotal = swiper.slides.length;
    const indicatorWrap = document.querySelector('.indicator-container');
    if (!indicatorWrap) return;

    const indicatorWidth = 100 / slidesPerView;
    const lastIndicator = indicatorWrap.querySelector('.last');
    const currentIndicator = indicatorWrap.querySelector('.now');
    const futureIndicator = indicatorWrap.querySelector('.future');

    // ---- ДОБАВИТЬ: если выбран не текущий год ----
    if (getActiveYear() !== systemYear) {
        setIndicator(lastIndicator, 100, false); // Last видим и на всю ширину
        setIndicator(currentIndicator, 0, true); // Current скрыт
        setIndicator(futureIndicator, 0, true);  // Future скрыт
        return;
    }
    // ---- КОНЕЦ ДОБАВКИ ----

    const visibleStart = Math.max(swiper.realIndex - Math.floor(slidesPerView / 2), 0);
    const visibleEnd = Math.min(visibleStart + slidesPerView - 1, slidesTotal);
    const outOfStart = visibleStart - 1;
    const outOfEnd = visibleEnd + 1;

    if (currentMonthIndex <= outOfStart) {
        setIndicator(lastIndicator, 0, true);
        setIndicator(currentIndicator, 0, true);
        setIndicator(futureIndicator, 100, false);
    } else if (currentMonthIndex >= outOfEnd) {
        setIndicator(lastIndicator, 100, false);
        setIndicator(currentIndicator, 0, true);
        setIndicator(futureIndicator, 0, true);
    } else {
        const lastIndicatorDiff = currentMonthIndex - visibleStart;
        const futureIndicatorDiff = visibleEnd - currentMonthIndex;
        setIndicator(lastIndicator, indicatorWidth * lastIndicatorDiff, lastIndicatorDiff === 0);
        setIndicator(currentIndicator, indicatorWidth, false);
        setIndicator(futureIndicator, indicatorWidth * futureIndicatorDiff, futureIndicatorDiff === 0);
    }
}

function calculatePercentageIncrease(currentValue, previousValue) {
    if (previousValue === 0) return 'N/A';
    return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
}

function calculateAndRenderDifference(swiper) {
    const currentSlide = swiper.slides[swiper.realIndex];
    const previousSlide = swiper.slides[swiper.realIndex - 1];
    if (!currentSlide || !previousSlide) return;

    const currentIndicators = currentSlide.querySelectorAll('.indicator-row');

    currentIndicators.forEach((currentIndicator) => {
        const dataIndicator = currentIndicator.getAttribute('data-indicator');
        const previousIndicator = previousSlide.querySelector(
            `.indicator-row[data-indicator="${dataIndicator}"]`
        );
        if (!previousIndicator) return;

        const currentText = currentIndicator.textContent.trim();
        const previousText = previousIndicator.textContent.trim();

        const currentValues = extractNumbers(currentText);
        const previousValues = extractNumbers(previousText);

        if (currentValues.length === 0 || previousValues.length === 0) return;

        const currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
        const previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));

        if (isNaN(currentValue) || isNaN(previousValue)) return;

        const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

        const existingResult = currentIndicator.querySelector('.result');
        if (existingResult) existingResult.remove();

        if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
            const resultElement = document.createElement('span');
            resultElement.classList.add('result');

            if (percentageIncrease > 0) resultElement.classList.add('gain');
            else if (percentageIncrease < 0) resultElement.classList.add('loss');

            resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(
                0
            )}%`;

            currentIndicator.appendChild(resultElement);
        }
    });
}

// Сравнение для всех слайдов при инициализации

function calculateAndRenderDifferenceForAllSlides() {
    const slides = Array.from(document.querySelectorAll('.swiper-slide'));
    if (slides.length < 2) return;

    for (let i = 1; i < slides.length; i++) {
        const currentSlide = slides[i];
        const previousSlide = slides[i - 1];

        currentSlide.querySelectorAll('.indicator-row').forEach((currentIndicator) => {
            const id = currentIndicator.getAttribute('data-indicator');
            const previousIndicator = previousSlide.querySelector(`.indicator-row[data-indicator="${id}"]`);
            if (!previousIndicator) return;

            const currentValues = extractNumbers(currentIndicator.textContent.trim());
            const previousValues = extractNumbers(previousIndicator.textContent.trim());
            if (currentValues.length === 0 || previousValues.length === 0) return;

            const currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
            const previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));
            if (isNaN(currentValue) || isNaN(previousValue)) return;

            const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

            const existingResult = currentIndicator.querySelector('.result');
            if (existingResult) existingResult.remove();

            if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
                const resultElement = document.createElement('span');
                resultElement.classList.add('result');
                if (percentageIncrease > 0) resultElement.classList.add('gain');
                else if (percentageIncrease < 0) resultElement.classList.add('loss');

                resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;
                currentIndicator.appendChild(resultElement);
            }
        });
    }
}

function scrollToCurrentMonth(swiper) {
    const today = new Date();
    const systemYear = today.getFullYear();

    // Не скроллим, если выбран не текущий год
    if (getActiveYear() !== systemYear) return;

    const currentMonthIndex = today.getMonth();

    const slidesPerView = swiper.params.slidesPerView;
    const slidesTotal = swiper.slides.length;

    const visibleStart = Math.max(currentMonthIndex - Math.floor(slidesPerView / 2), 0);
    const visibleEnd = Math.min(visibleStart + slidesPerView, slidesTotal);

    if (currentMonthIndex < visibleStart || currentMonthIndex >= visibleEnd) {
        swiper.slideTo(currentMonthIndex, 0, false);
    }
}

function initSwiper() {
    if (swiperInstance && typeof swiperInstance.destroy === 'function') {
        swiperInstance.destroy(true, true); // deleteInstance + cleanStyles [Swiper API]
        swiperInstance = null;
    }

    swiperInstance = new Swiper('.slider', {
        loop: false,
        watchSlidesProgress: true,
        setWrapperSize: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 0 },
            768: { slidesPerView: 3, spaceBetween: 0 },
            1024: { slidesPerView: 5, spaceBetween: 0 },
        },
        on: {
            init: function () {
                highlightCurrentMonth(this);
                updateIndicatorsWidth(this);
                calculateAndRenderDifference(this);
            },
            slideChange: function () {
                highlightCurrentMonth(this);
                updateIndicatorsWidth(this);
                calculateAndRenderDifference(this);
            },
        },
    });

    setTimeout(() => scrollToCurrentMonth(swiperInstance), 0);
}

// ------------------------------
// Rerender charts on mobile (unchanged behavior)
// ------------------------------
function rerenderAllCharts() {
    if (window.innerWidth > 1000) return;

    const frames = document.querySelectorAll('.analytic-frame__wrapper');
    frames.forEach((frame) => {
        const indicatorRow = frame
            .closest('.swiper-slide, .analytic-aside')
            ?.querySelector('.indicator-row');

        if (indicatorRow) {
            const indicatorId = indicatorRow.getAttribute('data-indicator');
            const activeTab = frame.querySelector('.chart-tab.active');
            const type = activeTab ? activeTab.getAttribute('data-type') : 'bar';

            renderChart(frame, indicatorId, type);
        }
    });
}

// ------------------------------
// Apply year (main)
// ------------------------------
function applyYear(year) {
    activeYear = year;
    setActiveYearUI(year);

    renderSlidesForYear(year);
    document.querySelectorAll('.analytic-frame').forEach((n) => n.remove());

    const systemYear = new Date().getFullYear();
    if (year < systemYear) {
        calculateAndRenderDifferenceForAllSlides();
    }

    initSwiper();
    setAsideFrameWidth();
    rerenderAllCharts();
}
// ------------------------------
// Event delegation (click + hover)
// ------------------------------
function initDelegatedEvents() {
    document.addEventListener('click', (e) => {
        const yearBtn = e.target.closest('.year-selector button[data-year]');
        if (yearBtn) {
            const y = parseInt(yearBtn.dataset.year, 10);
            if (Number.isFinite(y) && y !== activeYear) applyYear(y);
            return;
        }

        const row = e.target.closest('.indicator-row');
        if (row) {
            const clickedIndicatorId = row.getAttribute('data-indicator');
            toggleGraphContainers(clickedIndicatorId);
            setAsideFrameWidth();
        }
    });

    // Для mouseenter/mouseleave делегирование через capture (как было у тебя поштучно)
    document.addEventListener(
        'mouseover',
        (e) => {
            const row = e.target.closest('.indicator-row');
            if (!row) return;
            const id = row.getAttribute('data-indicator');
            document
                .querySelectorAll(`.indicator-row[data-indicator="${id}"]`)
                .forEach((r) => r.classList.add('highlight'));
        },
        true
    );

    document.addEventListener(
        'mouseout',
        (e) => {
            const row = e.target.closest('.indicator-row');
            if (!row) return;
            const id = row.getAttribute('data-indicator');
            document
                .querySelectorAll(`.indicator-row[data-indicator="${id}"]`)
                .forEach((r) => r.classList.remove('highlight'));
        },
        true
    );
}

// ------------------------------
// Boot
// ------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initDelegatedEvents();

    const store = getStore();
    const initial =
        getActiveYearFromUI() ||
        (store && store.initialYear) ||
        new Date().getFullYear();

    applyYear(initial);

    window.addEventListener('resize', debounce(rerenderAllCharts, 200));
    window.addEventListener('resize', setAsideFrameWidth);
});
