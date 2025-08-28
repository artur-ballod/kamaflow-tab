// Функция для обработки клика на элемент с data-indicator
function collectMonths(indicatorId) {
    const slides = document.querySelectorAll(`.swiper-slide`);
    const currentYear = new Date().getFullYear();

    return Array.from(slides).map(slide => {
        const monthId = parseInt(slide.getAttribute('data-month'), 10);
        const monthName = slide.querySelector('.analytic-data__month').textContent.trim();
        const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
        if (!indicator) return null;

        const numbers = extractNumbers(indicator.textContent.trim());
        const value = numbers.length > 0
            ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.'))
            : null;
        return { id: monthId, name: monthName, value, year: currentYear };
    }).filter(Boolean);
}

function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// === универсальная функция для пересчёта ===
function rerenderAllCharts() {
  // работаем только на мобильных/планшетах
  if (window.innerWidth > 1000) return;

  const frames = document.querySelectorAll('.analytic-frame__wrapper');
  frames.forEach(frame => {
    const indicatorRow = frame.closest('.swiper-slide, .analytic-aside')
                             ?.querySelector('.indicator-row');
    if (indicatorRow) {
      const indicatorId = indicatorRow.getAttribute('data-indicator');
      const activeTab = frame.querySelector('.chart-tab.active');
      const type = activeTab ? activeTab.getAttribute('data-type') : 'bar';

      renderChart(frame, indicatorId, type);
    }
  });
}

// === 2. Группировка по кварталам ===
function groupByQuarters(months) {
    const quarters = [[], [], [], []];
    months.forEach((m, i) => {
        const q = Math.floor(i / 3); // 0..3
        quarters[q].push(m.value || 0);
    });
    return quarters.map(q => q.reduce((a, b) => a + b, 0)); // сумма по кварталу
}

// === 3. Столбиковый график (адаптирован) ===
function renderIndicatorChart(container, indicatorId) {
    const months = collectMonths(indicatorId);
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();

    if (months.length === 0) {
        container.innerHTML = '<div class="no-data">Нет данных для графика</div>';
        return;
    }

    const width = container.offsetWidth || 380;
    const svgHeight = 180;
    const paddingBottom = 24;
    const chartHeight = svgHeight - paddingBottom;

    const maxVal = Math.max(...months.map(m => m.value > 0 ? m.value : 0));
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

        const shortMonth = m.name.substring(0, 3);
        const labelMonth = shortMonth;
        const labelYear = String(currentYear).slice(-2);

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

    // Анимация
    const barsEls = container.querySelectorAll('.bar');
    barsEls.forEach(bar => {
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

// === 4. Радиальный график (по кварталам) ===
function renderRadialChart(container, indicatorId) {
    const slides = document.querySelectorAll(`.swiper-slide`);
    const months = Array.from(slides).map((slide, i) => {
        const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
        if (!indicator) return null;

        const numbers = extractNumbers(indicator.textContent.trim());
        const value = numbers.length > 0
            ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.'))
            : 0;

        return { id: i + 1, value }; // порядковый индекс вместо data-month
    }).filter(Boolean);

    // группируем по кварталам (по 3 месяца)
    const quarters = [0, 0, 0, 0];
    months.forEach((m, i) => {
        const qIndex = Math.floor(i / 3); // кварталы 0..3
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
    let cumulativeAngle = -Math.PI / 2; // старт сверху
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

    // дырка в центре
    const hole = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius / 1.25}" fill="white" />`;

    // легенда
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

// === 5. Универсальный рендер + переключатель ===
function renderChart(container, indicatorId, type = 'radial') {
    container.innerHTML = '';

    // кнопки-переключатели
    const switcher = document.createElement('div');
    switcher.className = 'chart-switcher';
    switcher.innerHTML = `
        <button data-type="bar" class="chart-tab ${type === 'bar' ? 'active' : ''}">Столбцы</button>
        <button data-type="radial" class="chart-tab ${type === 'radial' ? 'active' : ''}">Круг</button>
    `;
    container.appendChild(switcher);

    // обёртки для графиков
    const chartWrapperBar = document.createElement('div');
    chartWrapperBar.className = 'chart-container chart-bar';
    const chartWrapperRadial = document.createElement('div');
    chartWrapperRadial.className = 'chart-container chart-radial';

    container.appendChild(chartWrapperBar);
    container.appendChild(chartWrapperRadial);

    // отрисовываем оба
    renderIndicatorChart(chartWrapperBar, indicatorId);
    renderRadialChart(chartWrapperRadial, indicatorId);

    // скрываем неактивный
    if (type === 'bar') {
        chartWrapperRadial.style.display = 'none';
    } else {
        chartWrapperBar.style.display = 'none';
    }

    // навешиваем события
    switcher.querySelectorAll('.chart-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const newType = btn.getAttribute('data-type');

            switcher.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
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

function toggleGraphContainers(clickedIndicatorId) {
    const graphContainerClass = 'analytic-frame';

    function toggleInContainer(container) {
        const indicators = container.querySelectorAll('.indicator-row');
        indicators.forEach(indicator => {
            if (indicator.getAttribute('data-indicator') === clickedIndicatorId) {
                let graphContainer = indicator.nextElementSibling;
                if (graphContainer && graphContainer.classList.contains(graphContainerClass)) {
                    graphContainer.remove();
                } else {
                    graphContainer = document.createElement('div');
                    graphContainer.className = graphContainerClass;

                    let innerFrame = document.createElement('div');
                    innerFrame.className = 'analytic-frame__wrapper';
                    graphContainer.appendChild(innerFrame);

                    // 👇 теперь универсальный рендер
                    renderChart(innerFrame, clickedIndicatorId, 'bar');

                    indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
                }
            }
        });
    }

    // для всех слайдов
    const slides = document.querySelectorAll('.swiper-slide');
    slides.forEach(slide => {
        toggleInContainer(slide);
    });

    // для фиксированного столбца
    const fixedColumn = document.querySelector('.analytic-aside');
    if (fixedColumn) {
        toggleInContainer(fixedColumn);
    }
}

// === навешиваем события ===
window.addEventListener('resize', debounce(rerenderAllCharts, 200));
document.addEventListener('DOMContentLoaded', () => {
  rerenderAllCharts();
});

// поддержка чисел
function extractNumbers(text) {
    const regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
    const matches = text.match(regex);
    return matches ? matches : [];
}

function setAsideFrameWidth() {
  const content = document.querySelector('.analytic-content');
  if (content) {
    const contentWidth = content.offsetWidth;
    const asideFrames = document.querySelectorAll('.analytic-frame__wrapper');
    asideFrames.forEach(asideFrame => {
      if (asideFrame) {
        asideFrame.style.minWidth = `${contentWidth - 6}px`;
      }
    });
  }
}

// Функция для установки класса "current" для текущего месяца
function setCurrentSlide() {
    const today = new Date();
    let currentMonthIndex = today.getMonth();

    console.log('Current month index:', currentMonthIndex);

    const swiper = new Swiper('.slider', {
        loop: false,
        centeredSlides: true,
        centeredSlidesBounds: true,
        initialSlide: currentMonthIndex,
        watchSlidesProgress: true,
        setWrapperSize: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 0 
            },  
            768: {
                slidesPerView: 3,
                spaceBetween: 0
            },
            1024: {
                slidesPerView: 5,
                spaceBetween: 0
            }
        },

        on: {
            init: function () {
                const slides = this.slides;
                slides.forEach(slide => {
                    slide.classList.remove('current');
                });
                slides[this.realIndex].classList.add('current');

                updateIndicatorsWidth(this)
                calculateAndRenderDifference(this);
            
            },
            slideChange: function () {

              updateIndicatorsWidth(this)
            }
        }
    });

    function calculateAndRenderDifference(swiperInstance) {
        const currentSlide = swiperInstance.slides[swiperInstance.realIndex];
        const previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];

        if (!previousSlide) {
            // Если нет предыдущего слайда, ничего не делаем
            return;
        }

        const currentIndicators = currentSlide.querySelectorAll('.indicator-row');
        const previousIndicators = previousSlide.querySelectorAll('.indicator-row');

        currentIndicators.forEach(currentIndicator => {
            const dataIndicator = currentIndicator.getAttribute('data-indicator');
            const previousIndicator = previousSlide.querySelector(`.indicator-row[data-indicator="${dataIndicator}"]`);

            if (previousIndicator) {
                const currentValue = currentIndicator.textContent;
                const previousValue = previousIndicator.textContent;
                const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

                // Удаляем предыдущий элемент result, если он существует
                const existingResult = currentIndicator.querySelector('.result');
                if (existingResult) {
                    existingResult.remove();
                }

                if (percentageIncrease !== 'N/A' && percentageIncrease !== 0) {
                    const resultElement = document.createElement('span');
                    resultElement.classList.add('result');
                    resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;

                    if (percentageIncrease > 0) {
                        resultElement.classList.add('gain');
                    } else {
                        resultElement.classList.add('loss');
                    }

                    currentIndicator.appendChild(resultElement);
                }
            }
        });
    }
    // Функция для плавного перемещения к нужному слайду
    function scrollToSlide() {
        const slidesPerView = swiper.params.slidesPerView;
        const slidesTotal = swiper.slides.length;
        const visibleStart = Math.max(currentMonthIndex - Math.floor(slidesPerView / 2), 0);
        const visibleEnd = Math.min(visibleStart + slidesPerView, slidesTotal);

        if (currentMonthIndex < visibleStart || currentMonthIndex >= visibleEnd) {
            swiper.slideTo(currentMonthIndex, 0, false);
        }
    }

    setTimeout(scrollToSlide, 0);

    function updateIndicatorsWidth(swiperInstance) {
        const slidesPerView = swiperInstance.params.slidesPerView;
        const slidesTotal = swiperInstance.slides.length;
        const indicatorWrap = document.querySelector('.indicator-container');
        const indicatorWidth = 100 / slidesPerView;
        const lastIndicator = indicatorWrap.querySelector('.last');
        const currentIndicator = indicatorWrap.querySelector('.now');
        const futureIndicator = indicatorWrap.querySelector('.future');
        const visibleStart = Math.max(swiperInstance.realIndex - Math.floor(slidesPerView / 2), 0);
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

    function setIndicator(indicator, width, isHidden) {
        if (isHidden) {
            indicator.classList.add('hidden');
            indicator.style.width = '0%';
        } else {
            indicator.classList.remove('hidden');
            indicator.style.width = `${width}%`;
        }
    }

    function calculateAndRenderDifference(swiperInstance) {
        const currentSlide = swiperInstance.slides[swiperInstance.realIndex];
        const previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];

        if (!previousSlide) {
            // Если нет предыдущего слайда, ничего не делаем
            return;
        }

        const currentIndicators = currentSlide.querySelectorAll('.indicator-row');
        const previousIndicators = previousSlide.querySelectorAll('.indicator-row');

        currentIndicators.forEach(currentIndicator => {
            const dataIndicator = currentIndicator.getAttribute('data-indicator');
            const previousIndicator = previousSlide.querySelector(`.indicator-row[data-indicator="${dataIndicator}"]`);

            if (previousIndicator) {
                const currentText = currentIndicator.textContent.trim();
                const previousText = previousIndicator.textContent.trim();

                // Извлекаем числа, которые могут содержать пробелы, запятые и знак минуса
                const currentValues = extractNumbers(currentText);
                const previousValues = extractNumbers(previousText);

                // Если нет чисел, пропускаем
                if (currentValues.length === 0 || previousValues.length === 0) {
                    return;
                }

                // Предполагаем, что первое число является основным значением
                const currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
                const previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));

                if (isNaN(currentValue) || isNaN(previousValue)) {
                    // Если значения не являются числами, пропускаем
                    return;
                }

                const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

                // Удаляем предыдущий элемент result, если он существует
                const existingResult = currentIndicator.querySelector('.result');
                if (existingResult) {
                    existingResult.remove();
                }

                if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
                    const resultElement = document.createElement('span');
                    resultElement.classList.add('result');
                    if (percentageIncrease > 0) {
                        resultElement.classList.add('gain');
                    } else if (percentageIncrease < 0) {
                        resultElement.classList.add('loss');
                    }

                    resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;

                    currentIndicator.appendChild(resultElement);
                }
            }
        });
    }

    function extractNumbers(text) {
        // Регулярное выражение для извлечения чисел, которые могут содержать пробелы, запятые и знак минуса
        const regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
        const matches = text.match(regex);
        return matches ? matches : [];
    }

    function calculatePercentageIncrease(currentValue, previousValue) {
        if (previousValue === 0) {
            return previousValue === 0 ? 'N/A' : 100;
        }
        // Вычисляем изменение в процентах с учетом знака
        return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    }
}

// Обработчик клика на индикаторы в фиксированном столбце
document.querySelectorAll('.analytic-aside .indicator-row').forEach(row => {
    row.addEventListener('click', function() {
        const clickedIndicatorId = this.getAttribute('data-indicator');
        toggleGraphContainers(clickedIndicatorId);
        setAsideFrameWidth();
    });
});

// Обработчик клика на индикаторы в слайдах
document.querySelectorAll('.swiper-slide .indicator-row').forEach(row => {
    row.addEventListener('click', function() {
        const clickedIndicatorId = this.getAttribute('data-indicator');
        toggleGraphContainers(clickedIndicatorId);
        setAsideFrameWidth();
    });
});

// Обработчик события mouseenter для всех элементов .indicator-row
document.querySelectorAll('.indicator-row').forEach(row => {
    row.addEventListener('mouseenter', function() {
        const dataIndicator = this.getAttribute('data-indicator');
        // Находим все элементы с таким же data-indicator
        const relatedRows = document.querySelectorAll(`.indicator-row[data-indicator="${dataIndicator}"]`);
        // Добавляем класс highlight
        relatedRows.forEach(r => r.classList.add('highlight'));
    });

    // Обработчик события mouseleave для всех элементов .indicator-row
    row.addEventListener('mouseleave', function() {
        const dataIndicator = this.getAttribute('data-indicator');
        // Находим все элементы с таким же data-indicator
        const relatedRows = document.querySelectorAll(`.indicator-row[data-indicator="${dataIndicator}"]`);
        // Удаляем класс highlight
        relatedRows.forEach(r => r.classList.remove('highlight'));
    });
});

window.addEventListener('resize', setAsideFrameWidth);
document.addEventListener('DOMContentLoaded', () => {
    setCurrentSlide();
});