"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// // Функция для обработки клика на элемент с data-indicator
// function collectMonths(indicatorId) {
//     const slides = document.querySelectorAll(`.swiper-slide`);
//     const currentYear = new Date().getFullYear();

//     return Array.from(slides).map(slide => {
//         const monthId = parseInt(slide.getAttribute('data-month'), 10);
//         const monthName = slide.querySelector('.analytic-data__month').textContent.trim();
//         const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
//         if (!indicator) return null;

//         const numbers = extractNumbers(indicator.textContent.trim());
//         const value = numbers.length > 0
//             ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.'))
//             : null;
//         return { id: monthId, name: monthName, value, year: currentYear };
//     }).filter(Boolean);
// }

// function debounce(func, delay) {
//   let timeout;
//   return function(...args) {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(this, args), delay);
//   };
// }

// // === универсальная функция для пересчёта ===
// function rerenderAllCharts() {
//   // работаем только на мобильных/планшетах
//   if (window.innerWidth > 1000) return;

//   const frames = document.querySelectorAll('.analytic-frame__wrapper');
//   frames.forEach(frame => {
//     const indicatorRow = frame.closest('.swiper-slide, .analytic-aside')
//                              ?.querySelector('.indicator-row');
//     if (indicatorRow) {
//       const indicatorId = indicatorRow.getAttribute('data-indicator');
//       const activeTab = frame.querySelector('.chart-tab.active');
//       const type = activeTab ? activeTab.getAttribute('data-type') : 'bar';

//       renderChart(frame, indicatorId, type);
//     }
//   });
// }

// // === 2. Группировка по кварталам ===
// function groupByQuarters(months) {
//     const quarters = [[], [], [], []];
//     months.forEach((m, i) => {
//         const q = Math.floor(i / 3); // 0..3
//         quarters[q].push(m.value || 0);
//     });
//     return quarters.map(q => q.reduce((a, b) => a + b, 0)); // сумма по кварталу
// }

// // === 3. Столбиковый график (адаптирован) ===
// function renderIndicatorChart(container, indicatorId) {
//     const months = collectMonths(indicatorId);
//     const today = new Date();
//     const currentMonthIndex = today.getMonth();
//     const currentYear = today.getFullYear();

//     if (months.length === 0) {
//         container.innerHTML = '<div class="no-data">Нет данных для графика</div>';
//         return;
//     }

//     const width = container.offsetWidth || 380;
//     const svgHeight = 180;
//     const paddingBottom = 24;
//     const chartHeight = svgHeight - paddingBottom;

//     const maxVal = Math.max(...months.map(m => m.value > 0 ? m.value : 0));
//     const scale = maxVal > 0 ? (chartHeight - 10) / maxVal : 1;
//     const gap = 6;
//     const barWidth = width / months.length - gap;

//     let bars = '';
//     let labels = '';

//     months.forEach((m, i) => {
//         const x = i * (barWidth + gap) + gap / 2;
//         const barHeight = m.value > 0 ? m.value * scale : 2;

//         let color = '#F1F1F1';
//         if (i === currentMonthIndex) {
//             color = '#34A3DC';
//         } else if (m.value > 0) {
//             if (i < currentMonthIndex) color = '#3ECB22';
//         }

//         const shortMonth = m.name.substring(0, 3);
//         const labelMonth = shortMonth;
//         const labelYear = String(currentYear).slice(-2);

//         bars += `<rect class="bar" data-target="${barHeight}" 
//                         x="${x}" y="${chartHeight}" 
//                         width="${barWidth}" height="0" 
//                         fill="${color}" rx="3" />`;

//         labels += `
//             <text x="${x + barWidth / 2}" y="${chartHeight + 12}" 
//                   text-anchor="middle" font-size="10">${labelMonth}</text>
//             <text x="${x + barWidth / 2}" y="${chartHeight + 22}" 
//                   text-anchor="middle" font-size="10">${labelYear}</text>
//         `;
//     });

//     container.innerHTML = `
//         <svg class="indicator-chart" width="${width}" height="${svgHeight}">
//             ${bars}
//             ${labels}
//         </svg>
//     `;

//     // Анимация
//     const barsEls = container.querySelectorAll('.bar');
//     barsEls.forEach(bar => {
//         const targetHeight = parseFloat(bar.getAttribute('data-target'));
//         let currentHeight = 0;
//         const step = targetHeight / 30;

//         function animate() {
//             currentHeight += step;
//             if (currentHeight >= targetHeight) currentHeight = targetHeight;

//             bar.setAttribute('height', currentHeight);
//             bar.setAttribute('y', chartHeight - currentHeight);

//             if (currentHeight < targetHeight) {
//                 requestAnimationFrame(animate);
//             }
//         }
//         requestAnimationFrame(animate);
//     });
// }

// // === 4. Радиальный график (по кварталам) ===
// function renderRadialChart(container, indicatorId) {
//     const slides = document.querySelectorAll(`.swiper-slide`);
//     const months = Array.from(slides).map((slide, i) => {
//         const indicator = slide.querySelector(`.indicator-row[data-indicator="${indicatorId}"]`);
//         if (!indicator) return null;

//         const numbers = extractNumbers(indicator.textContent.trim());
//         const value = numbers.length > 0
//             ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.'))
//             : 0;

//         return { id: i + 1, value }; // порядковый индекс вместо data-month
//     }).filter(Boolean);

//     // группируем по кварталам (по 3 месяца)
//     const quarters = [0, 0, 0, 0];
//     months.forEach((m, i) => {
//         const qIndex = Math.floor(i / 3); // кварталы 0..3
//         quarters[qIndex] += m.value;
//     });

//     const total = quarters.reduce((a, b) => a + b, 0);
//     if (total === 0) {
//         container.innerHTML = '<div class="no-data">Нет данных для круговой диаграммы</div>';
//         return;
//     }

//     const colors = ['#3ECB22', '#34A3DC', '#F1C40F', '#E74C3C'];
//     const size = 160;
//     const radius = size / 2;
//     let cumulativeAngle = -Math.PI / 2; // старт сверху
//     let paths = '';

//     quarters.forEach((val, i) => {
//         if (val <= 0) return;

//         const angle = (val / total) * 2 * Math.PI;

//         const x1 = size / 2 + radius * Math.cos(cumulativeAngle);
//         const y1 = size / 2 + radius * Math.sin(cumulativeAngle);

//         cumulativeAngle += angle;

//         const x2 = size / 2 + radius * Math.cos(cumulativeAngle);
//         const y2 = size / 2 + radius * Math.sin(cumulativeAngle);

//         const largeArc = angle > Math.PI ? 1 : 0;

//         paths += `
//             <path d="
//               M${size / 2},${size / 2}
//               L${x1},${y1}
//               A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}
//               Z
//             " fill="${colors[i]}" />
//         `;
//     });

//     // дырка в центре
//     const hole = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius / 1.25}" fill="white" />`;

//     // легенда
//     let legend = `<div class="legend">`;
//     quarters.forEach((_, i) => {
//         legend += `
//             <div class="legend__item">
//                 <span class="legend__item-color" style="background:${colors[i]}"></span>
//                 Q${i + 1}
//             </div>
//         `;
//     });
//     legend += `</div>`;

//     container.innerHTML = `
//         ${legend}
//         <svg width="${size}" height="${size}">
//             ${paths}
//             ${hole}
//         </svg>
//     `;
// }

// // === 5. Универсальный рендер + переключатель ===
// function renderChart(container, indicatorId, type = 'radial') {
//     container.innerHTML = '';

//     // кнопки-переключатели
//     const switcher = document.createElement('div');
//     switcher.className = 'chart-switcher';
//     switcher.innerHTML = `
//         <button data-type="bar" class="chart-tab ${type === 'bar' ? 'active' : ''}">Столбцы</button>
//         <button data-type="radial" class="chart-tab ${type === 'radial' ? 'active' : ''}">Круг</button>
//     `;
//     container.appendChild(switcher);

//     // обёртки для графиков
//     const chartWrapperBar = document.createElement('div');
//     chartWrapperBar.className = 'chart-container chart-bar';
//     const chartWrapperRadial = document.createElement('div');
//     chartWrapperRadial.className = 'chart-container chart-radial';

//     container.appendChild(chartWrapperBar);
//     container.appendChild(chartWrapperRadial);

//     // отрисовываем оба
//     renderIndicatorChart(chartWrapperBar, indicatorId);
//     renderRadialChart(chartWrapperRadial, indicatorId);

//     // скрываем неактивный
//     if (type === 'bar') {
//         chartWrapperRadial.style.display = 'none';
//     } else {
//         chartWrapperBar.style.display = 'none';
//     }

//     // навешиваем события
//     switcher.querySelectorAll('.chart-tab').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const newType = btn.getAttribute('data-type');

//             switcher.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
//             btn.classList.add('active');

//             if (newType === 'bar') {
//                 chartWrapperBar.style.display = '';
//                 chartWrapperRadial.style.display = 'none';
//             } else {
//                 chartWrapperBar.style.display = 'none';
//                 chartWrapperRadial.style.display = '';
//             }
//         });
//     });
// }

// function toggleGraphContainers(clickedIndicatorId) {
//     const graphContainerClass = 'analytic-frame';

//     function toggleInContainer(container) {
//         const indicators = container.querySelectorAll('.indicator-row');
//         indicators.forEach(indicator => {
//             if (indicator.getAttribute('data-indicator') === clickedIndicatorId) {
//                 let graphContainer = indicator.nextElementSibling;
//                 if (graphContainer && graphContainer.classList.contains(graphContainerClass)) {
//                     graphContainer.remove();
//                 } else {
//                     graphContainer = document.createElement('div');
//                     graphContainer.className = graphContainerClass;

//                     let innerFrame = document.createElement('div');
//                     innerFrame.className = 'analytic-frame__wrapper';
//                     graphContainer.appendChild(innerFrame);

//                     // 👇 теперь универсальный рендер
//                     renderChart(innerFrame, clickedIndicatorId, 'bar');

//                     indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
//                 }
//             }
//         });
//     }

//     // для всех слайдов
//     const slides = document.querySelectorAll('.swiper-slide');
//     slides.forEach(slide => {
//         toggleInContainer(slide);
//     });

//     // для фиксированного столбца
//     const fixedColumn = document.querySelector('.analytic-aside');
//     if (fixedColumn) {
//         toggleInContainer(fixedColumn);
//     }
// }

// // === навешиваем события ===
// window.addEventListener('resize', debounce(rerenderAllCharts, 200));
// document.addEventListener('DOMContentLoaded', () => {
//   rerenderAllCharts();
// });

// // поддержка чисел
// function extractNumbers(text) {
//     const regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
//     const matches = text.match(regex);
//     return matches ? matches : [];
// }

// function setAsideFrameWidth() {
//   const content = document.querySelector('.analytic-content');
//   if (content) {
//     const contentWidth = content.offsetWidth;
//     const asideFrames = document.querySelectorAll('.analytic-frame__wrapper');
//     asideFrames.forEach(asideFrame => {
//       if (asideFrame) {
//         asideFrame.style.minWidth = `${contentWidth - 6}px`;
//       }
//     });
//   }
// }

// // Функция для установки класса "current" для текущего месяца
// function setCurrentSlide() {
//     const today = new Date();
//     let currentMonthIndex = today.getMonth();

//     console.log('Current month index:', currentMonthIndex);

//     const swiper = new Swiper('.slider', {
//         loop: false,
//         watchSlidesProgress: true,
//         setWrapperSize: true,
//         pagination: {
//             el: '.swiper-pagination',
//             clickable: true,
//         },
//         breakpoints: {
//             320: { slidesPerView: 1, spaceBetween: 0 },
//             768: { slidesPerView: 3, spaceBetween: 0 },
//             1024: { slidesPerView: 5, spaceBetween: 0 }
//         },
//         on: {
//             init: function () {
//                 highlightCurrentMonth(this);
//                 updateIndicatorsWidth(this);
//                 calculateAndRenderDifference(this);
//             },
//             slideChange: function () {
//                 highlightCurrentMonth(this);
//                 updateIndicatorsWidth(this);
//                 calculateAndRenderDifference(this);
//             }
//         }
//     });

//     // Добавление/удаление класса current по индексу месяца
//     function highlightCurrentMonth(swiperInstance) {
//         swiperInstance.slides.forEach(slide => slide.classList.remove('current'));

//         // Проверяем, есть ли слайд с индексом currentMonthIndex
//         if (swiperInstance.slides[currentMonthIndex]) {
//             swiperInstance.slides[currentMonthIndex].classList.add('current');
//         }
//     }

//     function calculateAndRenderDifference(swiperInstance) {
//         const currentSlide = swiperInstance.slides[swiperInstance.realIndex];
//         const previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];

//         if (!previousSlide) {
//             // Если нет предыдущего слайда, ничего не делаем
//             return;
//         }

//         const currentIndicators = currentSlide.querySelectorAll('.indicator-row');
//         const previousIndicators = previousSlide.querySelectorAll('.indicator-row');

//         currentIndicators.forEach(currentIndicator => {
//             const dataIndicator = currentIndicator.getAttribute('data-indicator');
//             const previousIndicator = previousSlide.querySelector(`.indicator-row[data-indicator="${dataIndicator}"]`);

//             if (previousIndicator) {
//                 const currentValue = currentIndicator.textContent;
//                 const previousValue = previousIndicator.textContent;
//                 const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

//                 // Удаляем предыдущий элемент result, если он существует
//                 const existingResult = currentIndicator.querySelector('.result');
//                 if (existingResult) {
//                     existingResult.remove();
//                 }

//                 if (percentageIncrease !== 'N/A' && percentageIncrease !== 0) {
//                     const resultElement = document.createElement('span');
//                     resultElement.classList.add('result');
//                     resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;

//                     if (percentageIncrease > 0) {
//                         resultElement.classList.add('gain');
//                     } else {
//                         resultElement.classList.add('loss');
//                     }

//                     currentIndicator.appendChild(resultElement);
//                 }
//             }
//         });
//     }
//     // Функция для плавного перемещения к нужному слайду
//     function scrollToSlide() {
//         const slidesPerView = swiper.params.slidesPerView;
//         const slidesTotal = swiper.slides.length;
//         const visibleStart = Math.max(currentMonthIndex - Math.floor(slidesPerView / 2), 0);
//         const visibleEnd = Math.min(visibleStart + slidesPerView, slidesTotal);

//         if (currentMonthIndex < visibleStart || currentMonthIndex >= visibleEnd) {
//             swiper.slideTo(currentMonthIndex, 0, false);
//         }
//     }

//     setTimeout(scrollToSlide, 0);

//     function updateIndicatorsWidth(swiperInstance) {
//         const slidesPerView = swiperInstance.params.slidesPerView;
//         const slidesTotal = swiperInstance.slides.length;
//         const indicatorWrap = document.querySelector('.indicator-container');
//         const indicatorWidth = 100 / slidesPerView;
//         const lastIndicator = indicatorWrap.querySelector('.last');
//         const currentIndicator = indicatorWrap.querySelector('.now');
//         const futureIndicator = indicatorWrap.querySelector('.future');
//         const visibleStart = Math.max(swiperInstance.realIndex - Math.floor(slidesPerView / 2), 0);
//         const visibleEnd = Math.min(visibleStart + slidesPerView - 1, slidesTotal);
//         const outOfStart = visibleStart - 1;
//         const outOfEnd = visibleEnd + 1;

//         if (currentMonthIndex <= outOfStart) {
//             setIndicator(lastIndicator, 0, true);
//             setIndicator(currentIndicator, 0, true);
//             setIndicator(futureIndicator, 100, false);
//         } else if (currentMonthIndex >= outOfEnd) {
//             setIndicator(lastIndicator, 100, false);
//             setIndicator(currentIndicator, 0, true);
//             setIndicator(futureIndicator, 0, true);
//         } else {
//             const lastIndicatorDiff = currentMonthIndex - visibleStart;
//             const futureIndicatorDiff = visibleEnd - currentMonthIndex;
//             setIndicator(lastIndicator, indicatorWidth * lastIndicatorDiff, lastIndicatorDiff === 0);
//             setIndicator(currentIndicator, indicatorWidth, false);
//             setIndicator(futureIndicator, indicatorWidth * futureIndicatorDiff, futureIndicatorDiff === 0);
//         }
//     }

//     function setIndicator(indicator, width, isHidden) {
//         if (isHidden) {
//             indicator.classList.add('hidden');
//             indicator.style.width = '0%';
//         } else {
//             indicator.classList.remove('hidden');
//             indicator.style.width = `${width}%`;
//         }
//     }

//     function calculateAndRenderDifference(swiperInstance) {
//         const currentSlide = swiperInstance.slides[swiperInstance.realIndex];
//         const previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];

//         if (!previousSlide) {
//             // Если нет предыдущего слайда, ничего не делаем
//             return;
//         }

//         const currentIndicators = currentSlide.querySelectorAll('.indicator-row');
//         const previousIndicators = previousSlide.querySelectorAll('.indicator-row');

//         currentIndicators.forEach(currentIndicator => {
//             const dataIndicator = currentIndicator.getAttribute('data-indicator');
//             const previousIndicator = previousSlide.querySelector(`.indicator-row[data-indicator="${dataIndicator}"]`);

//             if (previousIndicator) {
//                 const currentText = currentIndicator.textContent.trim();
//                 const previousText = previousIndicator.textContent.trim();

//                 // Извлекаем числа, которые могут содержать пробелы, запятые и знак минуса
//                 const currentValues = extractNumbers(currentText);
//                 const previousValues = extractNumbers(previousText);

//                 // Если нет чисел, пропускаем
//                 if (currentValues.length === 0 || previousValues.length === 0) {
//                     return;
//                 }

//                 // Предполагаем, что первое число является основным значением
//                 const currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
//                 const previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));

//                 if (isNaN(currentValue) || isNaN(previousValue)) {
//                     // Если значения не являются числами, пропускаем
//                     return;
//                 }

//                 const percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

//                 // Удаляем предыдущий элемент result, если он существует
//                 const existingResult = currentIndicator.querySelector('.result');
//                 if (existingResult) {
//                     existingResult.remove();
//                 }

//                 if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
//                     const resultElement = document.createElement('span');
//                     resultElement.classList.add('result');
//                     if (percentageIncrease > 0) {
//                         resultElement.classList.add('gain');
//                     } else if (percentageIncrease < 0) {
//                         resultElement.classList.add('loss');
//                     }

//                     resultElement.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;

//                     currentIndicator.appendChild(resultElement);
//                 }
//             }
//         });
//     }

//     function extractNumbers(text) {
//         // Регулярное выражение для извлечения чисел, которые могут содержать пробелы, запятые и знак минуса
//         const regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
//         const matches = text.match(regex);
//         return matches ? matches : [];
//     }

//     function calculatePercentageIncrease(currentValue, previousValue) {
//         if (previousValue === 0) {
//             return previousValue === 0 ? 'N/A' : 100;
//         }
//         // Вычисляем изменение в процентах с учетом знака
//         return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
//     }
// }

// // Обработчик клика на индикаторы в фиксированном столбце
// document.querySelectorAll('.analytic-aside .indicator-row').forEach(row => {
//     row.addEventListener('click', function() {
//         const clickedIndicatorId = this.getAttribute('data-indicator');
//         toggleGraphContainers(clickedIndicatorId);
//         setAsideFrameWidth();
//     });
// });

// // Обработчик клика на индикаторы в слайдах
// document.querySelectorAll('.swiper-slide .indicator-row').forEach(row => {
//     row.addEventListener('click', function() {
//         const clickedIndicatorId = this.getAttribute('data-indicator');
//         toggleGraphContainers(clickedIndicatorId);
//         setAsideFrameWidth();
//     });
// });

// // Обработчик события mouseenter для всех элементов .indicator-row
// document.querySelectorAll('.indicator-row').forEach(row => {
//     row.addEventListener('mouseenter', function() {
//         const dataIndicator = this.getAttribute('data-indicator');
//         // Находим все элементы с таким же data-indicator
//         const relatedRows = document.querySelectorAll(`.indicator-row[data-indicator="${dataIndicator}"]`);
//         // Добавляем класс highlight
//         relatedRows.forEach(r => r.classList.add('highlight'));
//     });

//     // Обработчик события mouseleave для всех элементов .indicator-row
//     row.addEventListener('mouseleave', function() {
//         const dataIndicator = this.getAttribute('data-indicator');
//         // Находим все элементы с таким же data-indicator
//         const relatedRows = document.querySelectorAll(`.indicator-row[data-indicator="${dataIndicator}"]`);
//         // Удаляем класс highlight
//         relatedRows.forEach(r => r.classList.remove('highlight'));
//     });
// });

// window.addEventListener('resize', setAsideFrameWidth);
// document.addEventListener('DOMContentLoaded', () => {
//     setCurrentSlide();
// });
/* analytic.js
 * Требования:
 * - В Pug должен быть объявлен window.analyticsData = { data, monthsByYear, initialYear }
 * - Разметка слайдера: .analytic-data.slider.swiper-container > .swiper-wrapper > .swiper-slide
 * - Кнопки годов: .year-selector button[data-year]
 *
 * Сохранено:
 * - клики по .indicator-row открывают/закрывают графики (в слайдах и в aside)
 * - hover подсветка связанных строк
 * - Swiper + текущий месяц + сегменты Last/Current/Future + % дельты
 * - графики bar/radial
 */

/* global Swiper */

var swiperInstance = null;
var activeYear = null;
function getStore() {
  var el = document.getElementById('analytics-json');
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
  var timeout;
  return function () {
    var _this = this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      return func.apply(_this, args);
    }, delay);
  };
}
function extractNumbers(text) {
  var regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
  var matches = text.match(regex);
  return matches ? matches : [];
}

// ------------------------------
// Year UI
// ------------------------------
function getActiveYearFromUI() {
  var btn = document.querySelector('.year-selector button.active');
  if (!btn) return null;
  var y = parseInt(btn.dataset.year, 10);
  return Number.isFinite(y) ? y : null;
}
function setActiveYearUI(year) {
  document.querySelectorAll('.year-selector button[data-year]').forEach(function (b) {
    b.classList.toggle('active', parseInt(b.dataset.year, 10) === year);
  });
}
function getMonthsForYear(year) {
  var store = getStore();
  if (!store || !store.monthsByYear) return [];
  return store.monthsByYear[year] || [];
}

// ------------------------------
// DOM render slides
// ------------------------------
function renderSlidesForYear(year) {
  var months = getMonthsForYear(year);
  var wrapper = document.querySelector('.analytic-data.slider .swiper-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = months.map(function (month) {
    var groupsHtml = (month.groups || []).map(function (group) {
      var items = (group.indicators || []).map(function (ind) {
        var _ind$value;
        var v = (_ind$value = ind.value) !== null && _ind$value !== void 0 ? _ind$value : '';
        return "<div class=\"analytic-data__item indicator-row\" data-indicator=\"".concat(ind.id, "\">").concat(v, "</div>");
      }).join('');
      return "\n              <div class=\"analytic-data__group\">\n                <div class=\"start-item\"></div>\n                <div class=\"analytic-data__list\">".concat(items, "</div>\n              </div>\n            ");
    }).join('');
    return "\n          <div class=\"analytic-data__block swiper-slide\" data-month=\"".concat(month.id, "\">\n            <div class=\"analytic-data__month swiper\">").concat(month.name, "</div>\n            ").concat(groupsHtml, "\n          </div>\n        ");
  }).join('');
}

// ------------------------------
// Collect months from DOM (для графиков)
// ------------------------------
function collectMonths(indicatorId) {
  var slides = document.querySelectorAll('.swiper-slide');
  var year = getActiveYear();
  return Array.from(slides).map(function (slide, i) {
    var _slide$querySelector;
    var monthId = slide.getAttribute('data-month'); // строка: jan/feb/...
    var monthName = ((_slide$querySelector = slide.querySelector('.analytic-data__month')) === null || _slide$querySelector === void 0 ? void 0 : _slide$querySelector.textContent.trim()) || '';
    var indicator = slide.querySelector(".indicator-row[data-indicator=\"".concat(indicatorId, "\"]"));
    if (!indicator) return null;
    var numbers = extractNumbers(indicator.textContent.trim());
    var value = numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : null;
    return {
      id: monthId || String(i + 1),
      name: monthName,
      value: value,
      year: year
    };
  }).filter(Boolean);
}

// ------------------------------
// Charts
// ------------------------------
function groupByQuarters(months) {
  var quarters = [[], [], [], []];
  months.forEach(function (m, i) {
    var q = Math.floor(i / 3);
    quarters[q].push(m.value || 0);
  });
  return quarters.map(function (q) {
    return q.reduce(function (a, b) {
      return a + b;
    }, 0);
  });
}
function renderIndicatorChart(container, indicatorId) {
  var months = collectMonths(indicatorId);
  var today = new Date();
  var currentMonthIndex = today.getMonth();
  var year = getActiveYear() || today.getFullYear();
  if (months.length === 0) {
    container.innerHTML = '<div class="no-data">Нет данных для графика</div>';
    return;
  }
  var width = container.offsetWidth || 380;
  var svgHeight = 180;
  var paddingBottom = 24;
  var chartHeight = svgHeight - paddingBottom;
  var maxVal = Math.max.apply(Math, _toConsumableArray(months.map(function (m) {
    return m.value > 0 ? m.value : 0;
  })));
  var scale = maxVal > 0 ? (chartHeight - 10) / maxVal : 1;
  var gap = 6;
  var barWidth = width / months.length - gap;
  var bars = '';
  var labels = '';
  months.forEach(function (m, i) {
    var x = i * (barWidth + gap) + gap / 2;
    var barHeight = m.value > 0 ? m.value * scale : 2;
    var color = '#F1F1F1';
    if (i === currentMonthIndex) {
      color = '#34A3DC';
    } else if (m.value > 0) {
      if (i < currentMonthIndex) color = '#3ECB22';
    }
    var shortMonth = (m.name || '').substring(0, 3);
    var labelMonth = shortMonth;
    var labelYear = String(year).slice(-2);
    bars += "<rect class=\"bar\" data-target=\"".concat(barHeight, "\"\n                      x=\"").concat(x, "\" y=\"").concat(chartHeight, "\"\n                      width=\"").concat(barWidth, "\" height=\"0\"\n                      fill=\"").concat(color, "\" rx=\"3\" />");
    labels += "\n        <text x=\"".concat(x + barWidth / 2, "\" y=\"").concat(chartHeight + 12, "\"\n              text-anchor=\"middle\" font-size=\"10\">").concat(labelMonth, "</text>\n        <text x=\"").concat(x + barWidth / 2, "\" y=\"").concat(chartHeight + 22, "\"\n              text-anchor=\"middle\" font-size=\"10\">").concat(labelYear, "</text>\n      ");
  });
  container.innerHTML = "\n      <svg class=\"indicator-chart\" width=\"".concat(width, "\" height=\"").concat(svgHeight, "\">\n        ").concat(bars, "\n        ").concat(labels, "\n      </svg>\n    ");
  var barsEls = container.querySelectorAll('.bar');
  barsEls.forEach(function (bar) {
    var targetHeight = parseFloat(bar.getAttribute('data-target'));
    var currentHeight = 0;
    var step = targetHeight / 30;
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
  var slides = document.querySelectorAll('.swiper-slide');
  var months = Array.from(slides).map(function (slide, i) {
    var indicator = slide.querySelector(".indicator-row[data-indicator=\"".concat(indicatorId, "\"]"));
    if (!indicator) return null;
    var numbers = extractNumbers(indicator.textContent.trim());
    var value = numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : 0;
    return {
      id: i + 1,
      value: value
    };
  }).filter(Boolean);
  var quarters = [0, 0, 0, 0];
  months.forEach(function (m, i) {
    var qIndex = Math.floor(i / 3);
    quarters[qIndex] += m.value;
  });
  var total = quarters.reduce(function (a, b) {
    return a + b;
  }, 0);
  if (total === 0) {
    container.innerHTML = '<div class="no-data">Нет данных для круговой диаграммы</div>';
    return;
  }
  var colors = ['#3ECB22', '#34A3DC', '#F1C40F', '#E74C3C'];
  var size = 160;
  var radius = size / 2;
  var cumulativeAngle = -Math.PI / 2;
  var paths = '';
  quarters.forEach(function (val, i) {
    if (val <= 0) return;
    var angle = val / total * 2 * Math.PI;
    var x1 = size / 2 + radius * Math.cos(cumulativeAngle);
    var y1 = size / 2 + radius * Math.sin(cumulativeAngle);
    cumulativeAngle += angle;
    var x2 = size / 2 + radius * Math.cos(cumulativeAngle);
    var y2 = size / 2 + radius * Math.sin(cumulativeAngle);
    var largeArc = angle > Math.PI ? 1 : 0;
    paths += "\n        <path d=\"\n          M".concat(size / 2, ",").concat(size / 2, "\n          L").concat(x1, ",").concat(y1, "\n          A").concat(radius, ",").concat(radius, " 0 ").concat(largeArc, ",1 ").concat(x2, ",").concat(y2, "\n          Z\n        \" fill=\"").concat(colors[i], "\" />\n      ");
  });
  var hole = "<circle cx=\"".concat(size / 2, "\" cy=\"").concat(size / 2, "\" r=\"").concat(radius / 1.25, "\" fill=\"white\" />");
  var legend = "<div class=\"legend\">";
  quarters.forEach(function (_, i) {
    legend += "\n        <div class=\"legend__item\">\n          <span class=\"legend__item-color\" style=\"background:".concat(colors[i], "\"></span>\n          Q").concat(i + 1, "\n        </div>\n      ");
  });
  legend += "</div>";
  container.innerHTML = "\n      ".concat(legend, "\n      <svg width=\"").concat(size, "\" height=\"").concat(size, "\">\n        ").concat(paths, "\n        ").concat(hole, "\n      </svg>\n    ");
}
function renderChart(container, indicatorId) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'radial';
  container.innerHTML = '';
  var switcher = document.createElement('div');
  switcher.className = 'chart-switcher';
  switcher.innerHTML = "\n      <button data-type=\"bar\" class=\"chart-tab ".concat(type === 'bar' ? 'active' : '', "\">\u0421\u0442\u043E\u043B\u0431\u0446\u044B</button>\n      <button data-type=\"radial\" class=\"chart-tab ").concat(type === 'radial' ? 'active' : '', "\">\u041A\u0440\u0443\u0433</button>\n    ");
  container.appendChild(switcher);
  var chartWrapperBar = document.createElement('div');
  chartWrapperBar.className = 'chart-container chart-bar';
  var chartWrapperRadial = document.createElement('div');
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
  switcher.querySelectorAll('.chart-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var newType = btn.getAttribute('data-type');
      switcher.querySelectorAll('.chart-tab').forEach(function (b) {
        return b.classList.remove('active');
      });
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
  var graphContainerClass = 'analytic-frame';
  function toggleInContainer(container) {
    var indicators = container.querySelectorAll('.indicator-row');
    indicators.forEach(function (indicator) {
      if (indicator.getAttribute('data-indicator') === clickedIndicatorId) {
        var graphContainer = indicator.nextElementSibling;
        if (graphContainer && graphContainer.classList.contains(graphContainerClass)) {
          graphContainer.remove();
        } else {
          graphContainer = document.createElement('div');
          graphContainer.className = graphContainerClass;
          var innerFrame = document.createElement('div');
          innerFrame.className = 'analytic-frame__wrapper';
          graphContainer.appendChild(innerFrame);
          renderChart(innerFrame, clickedIndicatorId, 'bar');
          indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
        }
      }
    });
  }
  document.querySelectorAll('.swiper-slide').forEach(function (slide) {
    return toggleInContainer(slide);
  });
  var fixedColumn = document.querySelector('.analytic-aside');
  if (fixedColumn) toggleInContainer(fixedColumn);
}
function setAsideFrameWidth() {
  var content = document.querySelector('.analytic-content');
  if (!content) return;
  var contentWidth = content.offsetWidth;
  var asideFrames = document.querySelectorAll('.analytic-frame__wrapper');
  asideFrames.forEach(function (asideFrame) {
    asideFrame.style.minWidth = "".concat(contentWidth - 6, "px");
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
  var today = new Date();
  var currentMonthIndex = today.getMonth();
  var systemYear = today.getFullYear();

  // всегда сначала чистим
  swiper.slides.forEach(function (slide) {
    return slide.classList.remove('current');
  });

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
    indicator.style.width = "".concat(width, "%");
  }
}
function updateIndicatorsWidth(swiper) {
  var today = new Date();
  var currentMonthIndex = today.getMonth();
  var systemYear = today.getFullYear();
  var slidesPerView = swiper.params.slidesPerView;
  var slidesTotal = swiper.slides.length;
  var indicatorWrap = document.querySelector('.indicator-container');
  if (!indicatorWrap) return;
  var indicatorWidth = 100 / slidesPerView;
  var lastIndicator = indicatorWrap.querySelector('.last');
  var currentIndicator = indicatorWrap.querySelector('.now');
  var futureIndicator = indicatorWrap.querySelector('.future');

  // ---- ДОБАВИТЬ: если выбран не текущий год ----
  if (getActiveYear() !== systemYear) {
    setIndicator(lastIndicator, 100, false); // Last видим и на всю ширину
    setIndicator(currentIndicator, 0, true); // Current скрыт
    setIndicator(futureIndicator, 0, true); // Future скрыт
    return;
  }
  // ---- КОНЕЦ ДОБАВКИ ----

  var visibleStart = Math.max(swiper.realIndex - Math.floor(slidesPerView / 2), 0);
  var visibleEnd = Math.min(visibleStart + slidesPerView - 1, slidesTotal);
  var outOfStart = visibleStart - 1;
  var outOfEnd = visibleEnd + 1;
  if (currentMonthIndex <= outOfStart) {
    setIndicator(lastIndicator, 0, true);
    setIndicator(currentIndicator, 0, true);
    setIndicator(futureIndicator, 100, false);
  } else if (currentMonthIndex >= outOfEnd) {
    setIndicator(lastIndicator, 100, false);
    setIndicator(currentIndicator, 0, true);
    setIndicator(futureIndicator, 0, true);
  } else {
    var lastIndicatorDiff = currentMonthIndex - visibleStart;
    var futureIndicatorDiff = visibleEnd - currentMonthIndex;
    setIndicator(lastIndicator, indicatorWidth * lastIndicatorDiff, lastIndicatorDiff === 0);
    setIndicator(currentIndicator, indicatorWidth, false);
    setIndicator(futureIndicator, indicatorWidth * futureIndicatorDiff, futureIndicatorDiff === 0);
  }
}
function calculatePercentageIncrease(currentValue, previousValue) {
  if (previousValue === 0) return 'N/A';
  return (currentValue - previousValue) / Math.abs(previousValue) * 100;
}
function calculateAndRenderDifference(swiper) {
  var currentSlide = swiper.slides[swiper.realIndex];
  var previousSlide = swiper.slides[swiper.realIndex - 1];
  if (!currentSlide || !previousSlide) return;
  var currentIndicators = currentSlide.querySelectorAll('.indicator-row');
  currentIndicators.forEach(function (currentIndicator) {
    var dataIndicator = currentIndicator.getAttribute('data-indicator');
    var previousIndicator = previousSlide.querySelector(".indicator-row[data-indicator=\"".concat(dataIndicator, "\"]"));
    if (!previousIndicator) return;
    var currentText = currentIndicator.textContent.trim();
    var previousText = previousIndicator.textContent.trim();
    var currentValues = extractNumbers(currentText);
    var previousValues = extractNumbers(previousText);
    if (currentValues.length === 0 || previousValues.length === 0) return;
    var currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
    var previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));
    if (isNaN(currentValue) || isNaN(previousValue)) return;
    var percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);
    var existingResult = currentIndicator.querySelector('.result');
    if (existingResult) existingResult.remove();
    if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
      var resultElement = document.createElement('span');
      resultElement.classList.add('result');
      if (percentageIncrease > 0) resultElement.classList.add('gain');else if (percentageIncrease < 0) resultElement.classList.add('loss');
      resultElement.textContent = "".concat(percentageIncrease > 0 ? '+' : '').concat(percentageIncrease.toFixed(0), "%");
      currentIndicator.appendChild(resultElement);
    }
  });
}

// Сравнение для всех слайдов при инициализации

function calculateAndRenderDifferenceForAllSlides() {
  var slides = Array.from(document.querySelectorAll('.swiper-slide'));
  if (slides.length < 2) return;
  var _loop = function _loop() {
    var currentSlide = slides[i];
    var previousSlide = slides[i - 1];
    currentSlide.querySelectorAll('.indicator-row').forEach(function (currentIndicator) {
      var id = currentIndicator.getAttribute('data-indicator');
      var previousIndicator = previousSlide.querySelector(".indicator-row[data-indicator=\"".concat(id, "\"]"));
      if (!previousIndicator) return;
      var currentValues = extractNumbers(currentIndicator.textContent.trim());
      var previousValues = extractNumbers(previousIndicator.textContent.trim());
      if (currentValues.length === 0 || previousValues.length === 0) return;
      var currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
      var previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));
      if (isNaN(currentValue) || isNaN(previousValue)) return;
      var percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);
      var existingResult = currentIndicator.querySelector('.result');
      if (existingResult) existingResult.remove();
      if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
        var resultElement = document.createElement('span');
        resultElement.classList.add('result');
        if (percentageIncrease > 0) resultElement.classList.add('gain');else if (percentageIncrease < 0) resultElement.classList.add('loss');
        resultElement.textContent = "".concat(percentageIncrease > 0 ? '+' : '').concat(percentageIncrease.toFixed(0), "%");
        currentIndicator.appendChild(resultElement);
      }
    });
  };
  for (var i = 1; i < slides.length; i++) {
    _loop();
  }
}
function scrollToCurrentMonth(swiper) {
  var today = new Date();
  var systemYear = today.getFullYear();

  // Не скроллим, если выбран не текущий год
  if (getActiveYear() !== systemYear) return;
  var currentMonthIndex = today.getMonth();
  var slidesPerView = swiper.params.slidesPerView;
  var slidesTotal = swiper.slides.length;
  var visibleStart = Math.max(currentMonthIndex - Math.floor(slidesPerView / 2), 0);
  var visibleEnd = Math.min(visibleStart + slidesPerView, slidesTotal);
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
      clickable: true
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
      init: function init() {
        highlightCurrentMonth(this);
        updateIndicatorsWidth(this);
        calculateAndRenderDifference(this);
      },
      slideChange: function slideChange() {
        highlightCurrentMonth(this);
        updateIndicatorsWidth(this);
        calculateAndRenderDifference(this);
      }
    }
  });
  setTimeout(function () {
    return scrollToCurrentMonth(swiperInstance);
  }, 0);
}

// ------------------------------
// Rerender charts on mobile (unchanged behavior)
// ------------------------------
function rerenderAllCharts() {
  if (window.innerWidth > 1000) return;
  var frames = document.querySelectorAll('.analytic-frame__wrapper');
  frames.forEach(function (frame) {
    var _frame$closest;
    var indicatorRow = (_frame$closest = frame.closest('.swiper-slide, .analytic-aside')) === null || _frame$closest === void 0 ? void 0 : _frame$closest.querySelector('.indicator-row');
    if (indicatorRow) {
      var indicatorId = indicatorRow.getAttribute('data-indicator');
      var activeTab = frame.querySelector('.chart-tab.active');
      var type = activeTab ? activeTab.getAttribute('data-type') : 'bar';
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
  document.querySelectorAll('.analytic-frame').forEach(function (n) {
    return n.remove();
  });
  var systemYear = new Date().getFullYear();
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
  document.addEventListener('click', function (e) {
    var yearBtn = e.target.closest('.year-selector button[data-year]');
    if (yearBtn) {
      var y = parseInt(yearBtn.dataset.year, 10);
      if (Number.isFinite(y) && y !== activeYear) applyYear(y);
      return;
    }
    var row = e.target.closest('.indicator-row');
    if (row) {
      var clickedIndicatorId = row.getAttribute('data-indicator');
      toggleGraphContainers(clickedIndicatorId);
      setAsideFrameWidth();
    }
  });

  // Для mouseenter/mouseleave делегирование через capture (как было у тебя поштучно)
  document.addEventListener('mouseover', function (e) {
    var row = e.target.closest('.indicator-row');
    if (!row) return;
    var id = row.getAttribute('data-indicator');
    document.querySelectorAll(".indicator-row[data-indicator=\"".concat(id, "\"]")).forEach(function (r) {
      return r.classList.add('highlight');
    });
  }, true);
  document.addEventListener('mouseout', function (e) {
    var row = e.target.closest('.indicator-row');
    if (!row) return;
    var id = row.getAttribute('data-indicator');
    document.querySelectorAll(".indicator-row[data-indicator=\"".concat(id, "\"]")).forEach(function (r) {
      return r.classList.remove('highlight');
    });
  }, true);
}

// ------------------------------
// Boot
// ------------------------------
document.addEventListener('DOMContentLoaded', function () {
  initDelegatedEvents();
  var store = getStore();
  var initial = getActiveYearFromUI() || store && store.initialYear || new Date().getFullYear();
  applyYear(initial);
  window.addEventListener('resize', debounce(rerenderAllCharts, 200));
  window.addEventListener('resize', setAsideFrameWidth);
});