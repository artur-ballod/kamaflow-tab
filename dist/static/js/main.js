"use strict";

// для колонок

var data = {};
function getEmbeddedData() {
  var script = document.getElementById('data-json');
  if (script) {
    try {
      data = JSON.parse(script.textContent);
      console.log('Данные успешно загружены:', data);
      // После загрузки данных инициализируем интерфейс
      initialize();
    } catch (error) {
      console.error('Ошибка парсинга данных:', error);
    }
  } else {
    console.error('Скрипт с данными не найден.');
  }
}
var initialize = function initialize() {
  var leftPanel = document.querySelector('.analytic-aside');
  var dataContainer = document.querySelector('.analytic-data');
  var prevButton = document.querySelector('.js-prev');
  var nextButton = document.querySelector('.js-next');
  var currentIndex = 0;
  var todayIndex = new Date().getMonth();
  var isSmallScreen = window.innerWidth < 1000;
  var isExtraSmallScreen = window.innerWidth < 480;
  var dataPerLoad = isExtraSmallScreen ? 1 : isSmallScreen ? 3 : 5;

  // Функция обновления размеров экрана
  var updateLayoutSettings = function updateLayoutSettings() {
    isSmallScreen = window.innerWidth < 1000;
    isExtraSmallScreen = window.innerWidth < 480;
    dataPerLoad = isExtraSmallScreen ? 1 : isSmallScreen ? 3 : 5;
    if (isExtraSmallScreen) {
      currentIndex = todayIndex;
    } else if (isSmallScreen) {
      currentIndex = Math.max(todayIndex - 1, 0);
    } else {
      currentIndex = Math.max(todayIndex - 2, 0);
    }
  };

  // Функция для ресайза экрана и перерисовки
  var handleResize = function handleResize() {
    var newIsSmallScreen = window.innerWidth < 1000;
    var newIsExtraSmallScreen = window.innerWidth < 480;

    // Если сменилась категория размера
    if (newIsSmallScreen !== isSmallScreen || newIsExtraSmallScreen !== isExtraSmallScreen) {
      updateLayoutSettings();
      renderData();
      renderIndicator();
      renderLeftPanelResponsive();
    }
  };
  updateLayoutSettings();
  window.addEventListener('resize', handleResize);

  // Функция для получения текущего индекса месяца
  var getCurrentMonthIndex = function getCurrentMonthIndex() {
    var today = new Date();
    var month = today.getMonth(); // Возвращает индекс от 0 до 11
    return month;
  };

  // Функция для преобразования строки с символом рубля в число
  var convertToNumber = function convertToNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      // Удаляем пробелы и символ рубля
      var numericString = value.replace(/\s+/g, '').replace('₽', '').replace('%', '');
      return parseFloat(numericString);
    }
    return 0;
  };

  // Функция для расчета процентного увеличения
  var calculatePercentageIncrease = function calculatePercentageIncrease(currentValue, previousValue) {
    var currentNumber = convertToNumber(currentValue);
    var previousNumber = convertToNumber(previousValue);
    if (previousNumber === 0 || isNaN(previousNumber)) {
      return 'N/A';
    }
    var increase = (currentNumber - previousNumber) / previousNumber * 100;
    return increase;
  };

  // Функция для определения класса на основе процентного изменения
  var getPercentageClass = function getPercentageClass(percentage) {
    if (percentage > 0) {
      return 'gain';
    } else if (percentage < 0) {
      return 'loss';
    } else {
      return '';
    }
  };

  // Рендерим верхний индикатор
  var renderIndicator = function renderIndicator() {
    var indicatorContainer = document.querySelector('.indicator-container');
    indicatorContainer.innerHTML = '';
    var totalMonths = data.months.length;
    var visibleRange = [currentIndex, currentIndex + dataPerLoad - 1];
    var currentMonthIndex = getCurrentMonthIndex();

    // Определяем, какой диапазон отображается
    var beforeCount = 0;
    var afterCount = 0;
    if (visibleRange[1] < currentMonthIndex) {
      beforeCount = dataPerLoad;
    } else if (visibleRange[0] > currentMonthIndex) {
      afterCount = dataPerLoad;
    } else {
      beforeCount = Math.max(currentMonthIndex - visibleRange[0], 0);
      afterCount = Math.max(visibleRange[1] - currentMonthIndex, 0);
    }

    // Создаем блоки
    var beforeDiv = document.createElement('div');
    beforeDiv.classList.add('indicator-container__block', 'before');
    beforeDiv.textContent = 'Data';
    indicatorContainer.appendChild(beforeDiv);
    var currentDiv = document.createElement('div');
    currentDiv.classList.add('indicator-container__block', 'current');
    currentDiv.textContent = 'Current';
    indicatorContainer.appendChild(currentDiv);
    var afterDiv = document.createElement('div');
    afterDiv.classList.add('indicator-container__block', 'after');
    afterDiv.textContent = 'Planning';
    indicatorContainer.appendChild(afterDiv);

    // Управляем видимостью и размером блоков
    if (currentIndex > currentMonthIndex) {
      // Current в предыдущем диапазоне, виден только after
      beforeDiv.style.display = 'none';
      currentDiv.style.display = 'none';
      afterDiv.style.display = 'flex';
      afterDiv.style.width = '100%';
    } else if (currentIndex + dataPerLoad - 1 < currentMonthIndex) {
      // Current в следующем диапазоне, виден только before
      beforeDiv.style.display = 'flex';
      beforeDiv.style.width = '100%';
      currentDiv.style.display = 'none';
      afterDiv.style.display = 'none';
    } else {
      // Current в текущем диапазоне
      beforeDiv.style.display = 'flex';
      currentDiv.style.display = 'flex';
      afterDiv.style.display = 'flex';
      if (currentIndex <= currentMonthIndex && currentIndex + dataPerLoad - 1 >= currentMonthIndex) {
        // Current находится в текущем диапазоне
        beforeDiv.style.width = "".concat(beforeCount / dataPerLoad * 100, "%");
        afterDiv.style.width = "".concat(afterCount / dataPerLoad * 100, "%");
        currentDiv.style.width = "".concat(1 / dataPerLoad * 100, "%");
      } else if (currentIndex > currentMonthIndex) {
        // Current находится в предыдущем диапазоне
        beforeDiv.style.display = 'none';
        afterDiv.style.width = '100%';
        currentDiv.style.display = 'none';
      } else if (currentIndex + dataPerLoad - 1 < currentMonthIndex) {
        // Current находится в следующем диапазоне
        beforeDiv.style.width = '100%';
        afterDiv.style.display = 'none';
        currentDiv.style.display = 'none';
      }
    }

    // Скрываем блоки с нулевой шириной
    if (parseFloat(beforeDiv.style.width) === 0) {
      beforeDiv.style.display = 'none';
    }
    if (parseFloat(afterDiv.style.width) === 0) {
      afterDiv.style.display = 'none';
    }
  };

  // Рендерим левую панель
  var renderLeftPanel = function renderLeftPanel() {
    leftPanel.innerHTML = '';
    var groupIndex = 0; // Добавляем счетчик для групп
    data.groups.forEach(function (group) {
      var groupDiv = document.createElement('div');
      // Добавляем класс из свойства group.class
      if (group["class"]) {
        groupDiv.classList.add('analytic-aside__block', group["class"]);
      } else {
        groupDiv.classList.add('analytic-aside__block');
      }
      var groupTitle = document.createElement('b');
      groupTitle.classList.add('analytic-aside__title');
      groupTitle.textContent = group.title;
      groupDiv.appendChild(groupTitle);
      group.rows.forEach(function (row, rowIndex) {
        // Добавляем rowIndex
        var rowDiv = document.createElement('span');
        rowDiv.classList.add('analytic-aside__subtitle');
        var rowDivText = document.createElement('p');
        rowDivText.classList.add('analytic-aside__subtitle-text');
        rowDivText.textContent = row.name;
        rowDiv.appendChild(rowDivText);
        // Добавляем data-type с использованием groupIndex
        rowDiv.setAttribute('data-type', "group".concat(groupIndex, "-row").concat(rowIndex));
        groupDiv.appendChild(rowDiv);
      });
      leftPanel.appendChild(groupDiv);
      groupIndex++; // Увеличиваем счетчик групп
    });
  };

  var selectedDataTypes = new Set();
  // Рендерим данные
  var renderData = function renderData() {
    dataContainer.innerHTML = '';
    var todayIndex = getCurrentMonthIndex();
    var _loop = function _loop(i) {
      var dataList = document.createElement('div');
      dataList.classList.add('analytic-data__block');
      if (i === todayIndex) {
        dataList.classList.add('current');
      }
      var monthHeader = document.createElement('b');
      monthHeader.classList.add('analytic-data__month');
      monthHeader.textContent = data.months[i];
      dataList.appendChild(monthHeader);
      data.groups.forEach(function (group, groupIndex) {
        // Пропускаем первую группу
        if (groupIndex === 0) {
          return;
        }
        var groupDiv = document.createElement('div');
        groupDiv.classList.add('analytic-data__group');
        var ul = document.createElement('ul');
        ul.classList.add('analytic-data__list');
        // Добавляем пустой элемент <li> в начало
        var emptyLi = document.createElement('li');
        emptyLi.classList.add('start-item');
        ul.appendChild(emptyLi);
        var rowIndex = 0;
        group.rows.forEach(function (row) {
          var li = document.createElement('li');
          li.classList.add('analytic-data__item');
          li.textContent = row.data[i] !== undefined ? row.data[i] : '';
          li.setAttribute('data-type', "group".concat(groupIndex, "-row").concat(rowIndex));

          // Рассчитываем разницу
          if (dataList.classList.contains('current') && i > 0 && row.data[i - 1] !== undefined) {
            var percentageIncrease = calculatePercentageIncrease(row.data[i], row.data[i - 1]);
            if (percentageIncrease !== 'N/A' && percentageIncrease !== 0) {
              var differenceSpan = document.createElement('span');
              differenceSpan.classList.add('result');
              differenceSpan.textContent = "".concat(percentageIncrease > 0 ? '+' : '').concat(percentageIncrease.toFixed(0), "%");
              // Добавляем соответствующий класс на основе процентного изменения
              var percentageClass = getPercentageClass(percentageIncrease);
              if (percentageClass) {
                differenceSpan.classList.add(percentageClass);
              }
              li.appendChild(differenceSpan);
            }
          }
          if (selectedDataTypes.has(li.getAttribute('data-type'))) {
            li.classList.add('clicked');
          }
          ul.appendChild(li);
          rowIndex++;
        });
        groupDiv.appendChild(ul);
        dataList.appendChild(groupDiv);
      });
      dataContainer.appendChild(dataList);
    };
    for (var i = currentIndex; i < currentIndex + dataPerLoad && i < data.months.length; i++) {
      _loop(i);
    }

    // Обновляем состояние кнопок
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex + dataPerLoad >= data.months.length;
  };

  // Обработчик для кнопки "Назад"
  prevButton.addEventListener('click', function () {
    if (currentIndex > 0) {
      currentIndex -= 1;
      renderData();
      renderIndicator();
      setupHoverEffect();
      setupClickEffect();
    }
  });

  // Обработчик для кнопки "Вперёд"
  nextButton.addEventListener('click', function () {
    if (currentIndex + dataPerLoad < data.months.length) {
      currentIndex += 1;
      renderData();
      renderIndicator();
      setupHoverEffect();
      setupClickEffect();
    }
  });
  function setupHoverEffect() {
    // Находим все элементы с data-type
    var elements = document.querySelectorAll('[data-type]');

    // Для каждого элемента добавляем обработчик наведения
    elements.forEach(function (element) {
      element.addEventListener('mouseenter', function () {
        var dataType = this.getAttribute('data-type');
        // Находим все элементы с тем же data-type
        var relatedElements = document.querySelectorAll("[data-type=\"".concat(dataType, "\"]"));
        // Добавляем класс для ховер-эффекта
        relatedElements.forEach(function (el) {
          el.classList.add('hovered');
        });
      });
      element.addEventListener('mouseleave', function () {
        var dataType = this.getAttribute('data-type');
        // Находим все элементы с тем же data-type
        var relatedElements = document.querySelectorAll("[data-type=\"".concat(dataType, "\"]"));
        // Удаляем класс для ховер-эффекта
        relatedElements.forEach(function (el) {
          el.classList.remove('hovered');
        });
      });
    });
  }
  function setupClickEffect() {
    // Находим все элементы с data-type
    var elements = document.querySelectorAll('[data-type]');

    // Удаляем предыдущие обработчики кликов
    elements.forEach(function (element) {
      element.removeEventListener('click', handleClick);
    });

    // Добавляем новые обработчики
    elements.forEach(function (element) {
      element.addEventListener('click', handleClick);
    });
  }
  function setAsideFrameWidth() {
    var content = document.querySelector('.analytic-content');
    if (content) {
      var contentWidth = content.offsetWidth;
      var asideFrames = document.querySelectorAll('.analytic-aside__frame');
      asideFrames.forEach(function (asideFrame) {
        if (asideFrame) {
          asideFrame.style.width = "".concat(contentWidth - 10, "px");
        }
      });
    }
  }

  // Функция для обработки клика на элемент
  function handleClick(event) {
    var clickedElement = event.target;
    var dataType = clickedElement.getAttribute('data-type');
    if (dataType) {
      // Обработка клика на analytic-data__item
      var isClicked = selectedDataTypes.has(dataType);
      if (isClicked) {
        selectedDataTypes["delete"](dataType);
      } else {
        selectedDataTypes.add(dataType);
      }
      requestAnimationFrame(function () {
        setAsideFrameWidth();
      });
    }

    // Обновляем класс 'clicked' для всех элементов
    updateClickedClasses();
  }

  // Функция для обновления классов 'clicked'
  function updateClickedClasses() {
    // Удаляем класс 'clicked' у всех элементов
    document.querySelectorAll('.analytic-aside__subtitle, .analytic-data__item').forEach(function (el) {
      el.classList.remove('clicked');
    });

    // Добавляем класс 'clicked' для выбранных элементов
    selectedDataTypes.forEach(function (dataType) {
      document.querySelectorAll("[data-type=\"".concat(dataType, "\"]")).forEach(function (el) {
        el.classList.add('clicked');
      });
    });

    // Добавляем или удаляем span с изображением в analytic-aside__subtitle
    var asideSubtitles = document.querySelectorAll('.analytic-aside__subtitle');
    asideSubtitles.forEach(function (subtitle) {
      var subtitleDataType = subtitle.getAttribute('data-type');
      if (selectedDataTypes.has(subtitleDataType)) {
        // Добавляем span если его нет
        if (!subtitle.querySelector('span')) {
          var span = document.createElement('span');
          span.classList.add('analytic-aside__frame');
          span.innerHTML = "<img src=\"static/images/content/graph.svg\" alt=\"Graph\" />";
          subtitle.appendChild(span);
        }
      } else {
        // Удаляем span если он есть
        var existingSpan = subtitle.querySelector('span');
        if (existingSpan) {
          existingSpan.remove();
        }
      }
    });
  }

  // Добавляем обработчик клика на все элементы с классом 'analytic-aside__subtitle' и 'analytic-data__item'
  document.querySelectorAll('.analytic-aside__subtitle, .analytic-data__item').forEach(function (el) {
    el.addEventListener('click', handleClick);
  });

  // Вызываем функцию при изменении размера окна
  window.addEventListener('resize', setAsideFrameWidth);

  // Инициализация интерфейса
  renderLeftPanel();
  renderData();
  renderIndicator();
  setupHoverEffect();
  setupClickEffect();
};
document.addEventListener('DOMContentLoaded', getEmbeddedData);