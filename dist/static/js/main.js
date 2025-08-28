"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Функция для обработки клика на элемент с data-indicator
function collectMonths(indicatorId) {
  var slides = document.querySelectorAll(".swiper-slide");
  var currentYear = new Date().getFullYear();
  return Array.from(slides).map(function (slide) {
    var monthId = parseInt(slide.getAttribute('data-month'), 10);
    var monthName = slide.querySelector('.analytic-data__month').textContent.trim();
    var indicator = slide.querySelector(".indicator-row[data-indicator=\"".concat(indicatorId, "\"]"));
    if (!indicator) return null;
    var numbers = extractNumbers(indicator.textContent.trim());
    var value = numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : null;
    return {
      id: monthId,
      name: monthName,
      value: value,
      year: currentYear
    };
  }).filter(Boolean);
}
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

// === универсальная функция для пересчёта ===
function rerenderAllCharts() {
  // работаем только на мобильных/планшетах
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

// === 2. Группировка по кварталам ===
function groupByQuarters(months) {
  var quarters = [[], [], [], []];
  months.forEach(function (m, i) {
    var q = Math.floor(i / 3); // 0..3
    quarters[q].push(m.value || 0);
  });
  return quarters.map(function (q) {
    return q.reduce(function (a, b) {
      return a + b;
    }, 0);
  }); // сумма по кварталу
}

// === 3. Столбиковый график (адаптирован) ===
function renderIndicatorChart(container, indicatorId) {
  var months = collectMonths(indicatorId);
  var today = new Date();
  var currentMonthIndex = today.getMonth();
  var currentYear = today.getFullYear();
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
    var shortMonth = m.name.substring(0, 3);
    var labelMonth = shortMonth;
    var labelYear = String(currentYear).slice(-2);
    bars += "<rect class=\"bar\" data-target=\"".concat(barHeight, "\" \n                        x=\"").concat(x, "\" y=\"").concat(chartHeight, "\" \n                        width=\"").concat(barWidth, "\" height=\"0\" \n                        fill=\"").concat(color, "\" rx=\"3\" />");
    labels += "\n            <text x=\"".concat(x + barWidth / 2, "\" y=\"").concat(chartHeight + 12, "\" \n                  text-anchor=\"middle\" font-size=\"10\">").concat(labelMonth, "</text>\n            <text x=\"").concat(x + barWidth / 2, "\" y=\"").concat(chartHeight + 22, "\" \n                  text-anchor=\"middle\" font-size=\"10\">").concat(labelYear, "</text>\n        ");
  });
  container.innerHTML = "\n        <svg class=\"indicator-chart\" width=\"".concat(width, "\" height=\"").concat(svgHeight, "\">\n            ").concat(bars, "\n            ").concat(labels, "\n        </svg>\n    ");

  // Анимация
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

// === 4. Радиальный график (по кварталам) ===
function renderRadialChart(container, indicatorId) {
  var slides = document.querySelectorAll(".swiper-slide");
  var months = Array.from(slides).map(function (slide, i) {
    var indicator = slide.querySelector(".indicator-row[data-indicator=\"".concat(indicatorId, "\"]"));
    if (!indicator) return null;
    var numbers = extractNumbers(indicator.textContent.trim());
    var value = numbers.length > 0 ? parseFloat(numbers[0].replace(/\s/g, '').replace(',', '.')) : 0;
    return {
      id: i + 1,
      value: value
    }; // порядковый индекс вместо data-month
  }).filter(Boolean);

  // группируем по кварталам (по 3 месяца)
  var quarters = [0, 0, 0, 0];
  months.forEach(function (m, i) {
    var qIndex = Math.floor(i / 3); // кварталы 0..3
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
  var cumulativeAngle = -Math.PI / 2; // старт сверху
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
    paths += "\n            <path d=\"\n              M".concat(size / 2, ",").concat(size / 2, "\n              L").concat(x1, ",").concat(y1, "\n              A").concat(radius, ",").concat(radius, " 0 ").concat(largeArc, ",1 ").concat(x2, ",").concat(y2, "\n              Z\n            \" fill=\"").concat(colors[i], "\" />\n        ");
  });

  // дырка в центре
  var hole = "<circle cx=\"".concat(size / 2, "\" cy=\"").concat(size / 2, "\" r=\"").concat(radius / 1.25, "\" fill=\"white\" />");

  // легенда
  var legend = "<div class=\"legend\">";
  quarters.forEach(function (_, i) {
    legend += "\n            <div class=\"legend__item\">\n                <span class=\"legend__item-color\" style=\"background:".concat(colors[i], "\"></span>\n                Q").concat(i + 1, "\n            </div>\n        ");
  });
  legend += "</div>";
  container.innerHTML = "\n        ".concat(legend, "\n        <svg width=\"").concat(size, "\" height=\"").concat(size, "\">\n            ").concat(paths, "\n            ").concat(hole, "\n        </svg>\n    ");
}

// === 5. Универсальный рендер + переключатель ===
function renderChart(container, indicatorId) {
  var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'radial';
  container.innerHTML = '';

  // кнопки-переключатели
  var switcher = document.createElement('div');
  switcher.className = 'chart-switcher';
  switcher.innerHTML = "\n        <button data-type=\"bar\" class=\"chart-tab ".concat(type === 'bar' ? 'active' : '', "\">\u0421\u0442\u043E\u043B\u0431\u0446\u044B</button>\n        <button data-type=\"radial\" class=\"chart-tab ").concat(type === 'radial' ? 'active' : '', "\">\u041A\u0440\u0443\u0433</button>\n    ");
  container.appendChild(switcher);

  // обёртки для графиков
  var chartWrapperBar = document.createElement('div');
  chartWrapperBar.className = 'chart-container chart-bar';
  var chartWrapperRadial = document.createElement('div');
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

          // 👇 теперь универсальный рендер
          renderChart(innerFrame, clickedIndicatorId, 'bar');
          indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
        }
      }
    });
  }

  // для всех слайдов
  var slides = document.querySelectorAll('.swiper-slide');
  slides.forEach(function (slide) {
    toggleInContainer(slide);
  });

  // для фиксированного столбца
  var fixedColumn = document.querySelector('.analytic-aside');
  if (fixedColumn) {
    toggleInContainer(fixedColumn);
  }
}

// === навешиваем события ===
window.addEventListener('resize', debounce(rerenderAllCharts, 200));
document.addEventListener('DOMContentLoaded', function () {
  rerenderAllCharts();
});

// поддержка чисел
function extractNumbers(text) {
  var regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
  var matches = text.match(regex);
  return matches ? matches : [];
}
function setAsideFrameWidth() {
  var content = document.querySelector('.analytic-content');
  if (content) {
    var contentWidth = content.offsetWidth;
    var asideFrames = document.querySelectorAll('.analytic-frame__wrapper');
    asideFrames.forEach(function (asideFrame) {
      if (asideFrame) {
        asideFrame.style.minWidth = "".concat(contentWidth - 6, "px");
      }
    });
  }
}

// Функция для установки класса "current" для текущего месяца
function setCurrentSlide() {
  var today = new Date();
  var currentMonthIndex = today.getMonth();
  console.log('Current month index:', currentMonthIndex);
  var swiper = new Swiper('.slider', {
    loop: false,
    centeredSlides: true,
    centeredSlidesBounds: true,
    initialSlide: currentMonthIndex,
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
        var slides = this.slides;
        slides.forEach(function (slide) {
          slide.classList.remove('current');
        });
        slides[this.realIndex].classList.add('current');
        updateIndicatorsWidth(this);
        calculateAndRenderDifference(this);
      },
      slideChange: function slideChange() {
        updateIndicatorsWidth(this);
      }
    }
  });
  function calculateAndRenderDifference(swiperInstance) {
    var currentSlide = swiperInstance.slides[swiperInstance.realIndex];
    var previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];
    if (!previousSlide) {
      // Если нет предыдущего слайда, ничего не делаем
      return;
    }
    var currentIndicators = currentSlide.querySelectorAll('.indicator-row');
    var previousIndicators = previousSlide.querySelectorAll('.indicator-row');
    currentIndicators.forEach(function (currentIndicator) {
      var dataIndicator = currentIndicator.getAttribute('data-indicator');
      var previousIndicator = previousSlide.querySelector(".indicator-row[data-indicator=\"".concat(dataIndicator, "\"]"));
      if (previousIndicator) {
        var currentValue = currentIndicator.textContent;
        var previousValue = previousIndicator.textContent;
        var percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

        // Удаляем предыдущий элемент result, если он существует
        var existingResult = currentIndicator.querySelector('.result');
        if (existingResult) {
          existingResult.remove();
        }
        if (percentageIncrease !== 'N/A' && percentageIncrease !== 0) {
          var resultElement = document.createElement('span');
          resultElement.classList.add('result');
          resultElement.textContent = "".concat(percentageIncrease > 0 ? '+' : '').concat(percentageIncrease.toFixed(0), "%");
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
    var slidesPerView = swiper.params.slidesPerView;
    var slidesTotal = swiper.slides.length;
    var visibleStart = Math.max(currentMonthIndex - Math.floor(slidesPerView / 2), 0);
    var visibleEnd = Math.min(visibleStart + slidesPerView, slidesTotal);
    if (currentMonthIndex < visibleStart || currentMonthIndex >= visibleEnd) {
      swiper.slideTo(currentMonthIndex, 0, false);
    }
  }
  setTimeout(scrollToSlide, 0);
  function updateIndicatorsWidth(swiperInstance) {
    var slidesPerView = swiperInstance.params.slidesPerView;
    var slidesTotal = swiperInstance.slides.length;
    var indicatorWrap = document.querySelector('.indicator-container');
    var indicatorWidth = 100 / slidesPerView;
    var lastIndicator = indicatorWrap.querySelector('.last');
    var currentIndicator = indicatorWrap.querySelector('.now');
    var futureIndicator = indicatorWrap.querySelector('.future');
    var visibleStart = Math.max(swiperInstance.realIndex - Math.floor(slidesPerView / 2), 0);
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
  function setIndicator(indicator, width, isHidden) {
    if (isHidden) {
      indicator.classList.add('hidden');
      indicator.style.width = '0%';
    } else {
      indicator.classList.remove('hidden');
      indicator.style.width = "".concat(width, "%");
    }
  }
  function calculateAndRenderDifference(swiperInstance) {
    var currentSlide = swiperInstance.slides[swiperInstance.realIndex];
    var previousSlide = swiperInstance.slides[swiperInstance.realIndex - 1];
    if (!previousSlide) {
      // Если нет предыдущего слайда, ничего не делаем
      return;
    }
    var currentIndicators = currentSlide.querySelectorAll('.indicator-row');
    var previousIndicators = previousSlide.querySelectorAll('.indicator-row');
    currentIndicators.forEach(function (currentIndicator) {
      var dataIndicator = currentIndicator.getAttribute('data-indicator');
      var previousIndicator = previousSlide.querySelector(".indicator-row[data-indicator=\"".concat(dataIndicator, "\"]"));
      if (previousIndicator) {
        var currentText = currentIndicator.textContent.trim();
        var previousText = previousIndicator.textContent.trim();

        // Извлекаем числа, которые могут содержать пробелы, запятые и знак минуса
        var currentValues = extractNumbers(currentText);
        var previousValues = extractNumbers(previousText);

        // Если нет чисел, пропускаем
        if (currentValues.length === 0 || previousValues.length === 0) {
          return;
        }

        // Предполагаем, что первое число является основным значением
        var currentValue = parseFloat(currentValues[0].replace(/,/g, '').replace(/\s/g, ''));
        var previousValue = parseFloat(previousValues[0].replace(/,/g, '').replace(/\s/g, ''));
        if (isNaN(currentValue) || isNaN(previousValue)) {
          // Если значения не являются числами, пропускаем
          return;
        }
        var percentageIncrease = calculatePercentageIncrease(currentValue, previousValue);

        // Удаляем предыдущий элемент result, если он существует
        var existingResult = currentIndicator.querySelector('.result');
        if (existingResult) {
          existingResult.remove();
        }
        if (percentageIncrease !== 'N/A' && !isNaN(percentageIncrease) && percentageIncrease !== 0) {
          var resultElement = document.createElement('span');
          resultElement.classList.add('result');
          if (percentageIncrease > 0) {
            resultElement.classList.add('gain');
          } else if (percentageIncrease < 0) {
            resultElement.classList.add('loss');
          }
          resultElement.textContent = "".concat(percentageIncrease > 0 ? '+' : '').concat(percentageIncrease.toFixed(0), "%");
          currentIndicator.appendChild(resultElement);
        }
      }
    });
  }
  function extractNumbers(text) {
    // Регулярное выражение для извлечения чисел, которые могут содержать пробелы, запятые и знак минуса
    var regex = /-?\d{1,3}(?:[\s,]?\d{3})*(?:\.\d+)?/g;
    var matches = text.match(regex);
    return matches ? matches : [];
  }
  function calculatePercentageIncrease(currentValue, previousValue) {
    if (previousValue === 0) {
      return previousValue === 0 ? 'N/A' : 100;
    }
    // Вычисляем изменение в процентах с учетом знака
    return (currentValue - previousValue) / Math.abs(previousValue) * 100;
  }
}

// Обработчик клика на индикаторы в фиксированном столбце
document.querySelectorAll('.analytic-aside .indicator-row').forEach(function (row) {
  row.addEventListener('click', function () {
    var clickedIndicatorId = this.getAttribute('data-indicator');
    toggleGraphContainers(clickedIndicatorId);
    setAsideFrameWidth();
  });
});

// Обработчик клика на индикаторы в слайдах
document.querySelectorAll('.swiper-slide .indicator-row').forEach(function (row) {
  row.addEventListener('click', function () {
    var clickedIndicatorId = this.getAttribute('data-indicator');
    toggleGraphContainers(clickedIndicatorId);
    setAsideFrameWidth();
  });
});

// Обработчик события mouseenter для всех элементов .indicator-row
document.querySelectorAll('.indicator-row').forEach(function (row) {
  row.addEventListener('mouseenter', function () {
    var dataIndicator = this.getAttribute('data-indicator');
    // Находим все элементы с таким же data-indicator
    var relatedRows = document.querySelectorAll(".indicator-row[data-indicator=\"".concat(dataIndicator, "\"]"));
    // Добавляем класс highlight
    relatedRows.forEach(function (r) {
      return r.classList.add('highlight');
    });
  });

  // Обработчик события mouseleave для всех элементов .indicator-row
  row.addEventListener('mouseleave', function () {
    var dataIndicator = this.getAttribute('data-indicator');
    // Находим все элементы с таким же data-indicator
    var relatedRows = document.querySelectorAll(".indicator-row[data-indicator=\"".concat(dataIndicator, "\"]"));
    // Удаляем класс highlight
    relatedRows.forEach(function (r) {
      return r.classList.remove('highlight');
    });
  });
});
window.addEventListener('resize', setAsideFrameWidth);
document.addEventListener('DOMContentLoaded', function () {
  setCurrentSlide();
});