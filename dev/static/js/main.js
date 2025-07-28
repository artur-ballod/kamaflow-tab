// // для колонок

// let data = {};

// function getEmbeddedData() {
//   const script = document.getElementById('data-json');
//   if (script) {
//     try {
//       data = JSON.parse(script.textContent);
//       console.log('Данные успешно загружены:', data);
//       // После загрузки данных инициализируем интерфейс
//       initialize();
//     } catch (error) {
//       console.error('Ошибка парсинга данных:', error);
//     }
//   } else {
//     console.error('Скрипт с данными не найден.');
//   }
// }

// const initialize = () => {
//   const leftPanel = document.querySelector('.analytic-aside');
//   const dataContainer = document.querySelector('.analytic-data');
//   const prevButton = document.querySelector('.js-prev');
//   const nextButton = document.querySelector('.js-next');
//   let currentIndex = 0;
//   let todayIndex = new Date().getMonth();
//   let isSmallScreen = window.innerWidth < 1000;
//   let isExtraSmallScreen = window.innerWidth < 480;
//   let dataPerLoad = isExtraSmallScreen ? 1 : (isSmallScreen ? 3 : 5);

//   // Функция обновления размеров экрана
//   const updateLayoutSettings = () => {
//     isSmallScreen = window.innerWidth < 1000;
//     isExtraSmallScreen = window.innerWidth < 480;
//     dataPerLoad = isExtraSmallScreen ? 1 : (isSmallScreen ? 3 : 5);

//     if (isExtraSmallScreen) {
//       currentIndex = todayIndex;
//     } else if (isSmallScreen) {
//       currentIndex = Math.max(todayIndex - 1, 0);
//     } else {
//       currentIndex = Math.max(todayIndex - 2, 0);
//     }
//   };

//   // Функция для ресайза экрана и перерисовки
//   const handleResize = () => {
//     const newIsSmallScreen = window.innerWidth < 1000;
//     const newIsExtraSmallScreen = window.innerWidth < 480;

//     // Если сменилась категория размера
//     if (newIsSmallScreen !== isSmallScreen || newIsExtraSmallScreen !== isExtraSmallScreen) {
//       updateLayoutSettings();
//       renderData();
//       renderIndicator();
//       renderLeftPanelResponsive();
//     }
//   };

//   updateLayoutSettings();
//   window.addEventListener('resize', handleResize);

//   // Функция для получения текущего индекса месяца
//   const getCurrentMonthIndex = () => {
//     const today = new Date();
//     const month = today.getMonth(); // Возвращает индекс от 0 до 11
//     return month;
//   };

//   // Функция для преобразования строки с символом рубля в число
//   const convertToNumber = (value) => {
//       if (typeof value === 'number') {
//           return value;
//       }
//       if (typeof value === 'string') {
//           // Удаляем пробелы и символ рубля
//           const numericString = value.replace(/\s+/g, '').replace('₽', '').replace('%', '');
//           return parseFloat(numericString);
//       }
//       return 0;
//   };

//   // Функция для расчета процентного увеличения
//   const calculatePercentageIncrease = (currentValue, previousValue) => {
//       const currentNumber = convertToNumber(currentValue);
//       const previousNumber = convertToNumber(previousValue);
//       if (previousNumber === 0 || isNaN(previousNumber)) {
//           return 'N/A';
//       }
//       const increase = ((currentNumber - previousNumber) / previousNumber) * 100;
//       return increase;
//   };

//   // Функция для определения класса на основе процентного изменения
//   const getPercentageClass = (percentage) => {
//       if (percentage > 0) {
//           return 'gain';
//       } else if (percentage < 0) {
//           return 'loss';
//       } else {
//           return '';
//       }
//   };

  // // Рендерим верхний индикатор
  // const renderIndicator = () => {
  //   const indicatorContainer = document.querySelector('.indicator-container');
  //   indicatorContainer.innerHTML = '';

  //   const totalMonths = data.months.length;
  //   const visibleRange = [currentIndex, currentIndex + dataPerLoad - 1];
  //   const currentMonthIndex = getCurrentMonthIndex();

  //   // Определяем, какой диапазон отображается
  //   let beforeCount = 0;
  //   let afterCount = 0;
  //   if (visibleRange[1] < currentMonthIndex) {
  //     beforeCount = dataPerLoad;
  //   } else if (visibleRange[0] > currentMonthIndex) {
  //     afterCount = dataPerLoad;
  //   } else {
  //     beforeCount = Math.max(currentMonthIndex - visibleRange[0], 0);
  //     afterCount = Math.max(visibleRange[1] - currentMonthIndex, 0);
  //   }

  //   // Создаем блоки
  //   const beforeDiv = document.createElement('div');
  //   beforeDiv.classList.add('indicator-container__block', 'before');
  //   beforeDiv.textContent = 'Data';
  //   indicatorContainer.appendChild(beforeDiv);

  //   const currentDiv = document.createElement('div');
  //   currentDiv.classList.add('indicator-container__block', 'current');
  //   currentDiv.textContent = 'Current';
  //   indicatorContainer.appendChild(currentDiv);

  //   const afterDiv = document.createElement('div');
  //   afterDiv.classList.add('indicator-container__block', 'after');
  //   afterDiv.textContent = 'Planning';
  //   indicatorContainer.appendChild(afterDiv);

  //   // Управляем видимостью и размером блоков
  //   if (currentIndex > currentMonthIndex) {
  //     // Current в предыдущем диапазоне, виден только after
  //     beforeDiv.style.display = 'none';
  //     currentDiv.style.display = 'none';
  //     afterDiv.style.display = 'flex';
  //     afterDiv.style.width = '100%';
  //   } else if (currentIndex + dataPerLoad - 1 < currentMonthIndex) {
  //     // Current в следующем диапазоне, виден только before
  //     beforeDiv.style.display = 'flex';
  //     beforeDiv.style.width = '100%';
  //     currentDiv.style.display = 'none';
  //     afterDiv.style.display = 'none';
  //   } else {
  //     // Current в текущем диапазоне
  //     beforeDiv.style.display = 'flex';
  //     currentDiv.style.display = 'flex';
  //     afterDiv.style.display = 'flex';

  //     if (currentIndex <= currentMonthIndex && currentIndex + dataPerLoad - 1 >= currentMonthIndex) {
  //       // Current находится в текущем диапазоне
  //       beforeDiv.style.width = `${(beforeCount / dataPerLoad) * 100}%`;
  //       afterDiv.style.width = `${(afterCount / dataPerLoad) * 100}%`;
  //       currentDiv.style.width = `${(1 / dataPerLoad) * 100}%`;
  //     } else if (currentIndex > currentMonthIndex) {
  //       // Current находится в предыдущем диапазоне
  //       beforeDiv.style.display = 'none';
  //       afterDiv.style.width = '100%';
  //       currentDiv.style.display = 'none';
  //     } else if (currentIndex + dataPerLoad - 1 < currentMonthIndex) {
  //       // Current находится в следующем диапазоне
  //       beforeDiv.style.width = '100%';
  //       afterDiv.style.display = 'none';
  //       currentDiv.style.display = 'none';
  //     }
  //   }

  //   // Скрываем блоки с нулевой шириной
  //   if (parseFloat(beforeDiv.style.width) === 0) {
  //     beforeDiv.style.display = 'none';
  //   }
  //   if (parseFloat(afterDiv.style.width) === 0) {
  //     afterDiv.style.display = 'none';
  //   }
  // };

//   // Рендерим левую панель
//   const renderLeftPanel = () => {
//     leftPanel.innerHTML = '';
      
//     let groupIndex = 0; // Добавляем счетчик для групп
//     data.groups.forEach(group => {
//       const groupDiv = document.createElement('div');
//       groupDiv.classList.add('analytic-aside__block');
//       const groupTitle = document.createElement('b');
//       groupTitle.classList.add('analytic-aside__title');
//       groupTitle.textContent = group.title;
//       groupDiv.appendChild(groupTitle);

//       group.rows.forEach((row, rowIndex) => { // Добавляем rowIndex
//         const rowDiv = document.createElement('span');
//         rowDiv.classList.add('analytic-aside__subtitle');
//         const rowDivText = document.createElement('p');
//         rowDivText.classList.add('analytic-aside__subtitle-text');
//         rowDivText.textContent = row.name;
//         rowDiv.appendChild(rowDivText);
//         // Добавляем data-type с использованием groupIndex
//         rowDiv.setAttribute('data-type', `group${groupIndex}-row${rowIndex}`);
//         groupDiv.appendChild(rowDiv);
//       });

//       leftPanel.appendChild(groupDiv);
//       groupIndex++; // Увеличиваем счетчик групп
//     });
//   };

//   const selectedDataTypes = new Set();
//   // Рендерим данные
//   const renderData = () => {
//     dataContainer.innerHTML = '';

//     const todayIndex = getCurrentMonthIndex();

//     for (let i = currentIndex; i < currentIndex + dataPerLoad && i < data.months.length; i++) {
//       const dataList = document.createElement('div');
//       dataList.classList.add('analytic-data__block');
//       if (i === todayIndex) {
//         dataList.classList.add('current');
//       }

//       const monthHeader = document.createElement('b');
//       monthHeader.classList.add('analytic-data__month');
//       monthHeader.textContent = data.months[i];
//       dataList.appendChild(monthHeader);
    
//       data.groups.forEach((group, groupIndex) => {
//         // Пропускаем первую группу
//         if (groupIndex === 0) {
//           return;
//         }
        
//         const groupDiv = document.createElement('div');
//         groupDiv.classList.add('analytic-data__group');

//         const ul = document.createElement('ul');
//         ul.classList.add('analytic-data__list');
//         // Добавляем пустой элемент <li> в начало
//         const emptyLi = document.createElement('li');
//         emptyLi.classList.add('start-item');
//         ul.appendChild(emptyLi);

//         let rowIndex = 0;
//         group.rows.forEach(row => {
//           const li = document.createElement('li');
//           li.classList.add('analytic-data__item');
//           li.textContent = row.data[i] !== undefined ? row.data[i] : '';
//           li.setAttribute('data-type', `group${groupIndex}-row${rowIndex}`);

//           // Рассчитываем разницу
//           if (dataList.classList.contains('current') && i > 0 && row.data[i - 1] !== undefined) {
//             const percentageIncrease = calculatePercentageIncrease(row.data[i], row.data[i - 1]);
//             if (percentageIncrease !== 'N/A' && percentageIncrease !== 0) {
//               const differenceSpan = document.createElement('span');
//               differenceSpan.classList.add('result');
//               differenceSpan.textContent = `${percentageIncrease > 0 ? '+' : ''}${percentageIncrease.toFixed(0)}%`;
//               // Добавляем соответствующий класс на основе процентного изменения
//               const percentageClass = getPercentageClass(percentageIncrease);
//               if (percentageClass) {
//                 differenceSpan.classList.add(percentageClass);
//               }
//               li.appendChild(differenceSpan);
//             }
//           }

//           if (selectedDataTypes.has(li.getAttribute('data-type'))) {
//             li.classList.add('clicked');
//           }
//           ul.appendChild(li);
//           rowIndex++;
//         });

//         groupDiv.appendChild(ul);
//         dataList.appendChild(groupDiv);
//       });

//       dataContainer.appendChild(dataList);
//     }

//     // Обновляем состояние кнопок
//     prevButton.disabled = currentIndex === 0;
//     nextButton.disabled = currentIndex + dataPerLoad >= data.months.length;
//   };

//   // Обработчик для кнопки "Назад"
//   prevButton.addEventListener('click', () => {
//     if (currentIndex > 0) {
//       currentIndex -= 1;
//       renderData();
//       renderIndicator();
//       setupHoverEffect();
//       setupClickEffect();
//     }
//   });

//   // Обработчик для кнопки "Вперёд"
//   nextButton.addEventListener('click', () => {
//     if (currentIndex + dataPerLoad < data.months.length) {
//       currentIndex += 1;
//       renderData();
//       renderIndicator();
//       setupHoverEffect();
//       setupClickEffect();
//     }
//   });

//   function setupHoverEffect() {
//     // Находим все элементы с data-type
//     const elements = document.querySelectorAll('[data-type]');
    
//     // Для каждого элемента добавляем обработчик наведения
//     elements.forEach(element => {
//       element.addEventListener('mouseenter', function() {
//         const dataType = this.getAttribute('data-type');
//         // Находим все элементы с тем же data-type
//         const relatedElements = document.querySelectorAll(`[data-type="${dataType}"]`);
//         // Добавляем класс для ховер-эффекта
//         relatedElements.forEach(el => {
//           el.classList.add('hovered');
//         });
//       });
      
//       element.addEventListener('mouseleave', function() {
//         const dataType = this.getAttribute('data-type');
//         // Находим все элементы с тем же data-type
//         const relatedElements = document.querySelectorAll(`[data-type="${dataType}"]`);
//         // Удаляем класс для ховер-эффекта
//         relatedElements.forEach(el => {
//           el.classList.remove('hovered');
//         });
//       });
//     });
//   }

//   function setupClickEffect() {
//     // Находим все элементы с data-type
//     const elements = document.querySelectorAll('[data-type]');
    
//     // Удаляем предыдущие обработчики кликов
//     elements.forEach(element => {
//       element.removeEventListener('click', handleClick);
//     });
    
//     // Добавляем новые обработчики
//     elements.forEach(element => {
//       element.addEventListener('click', handleClick);
//     });
//   }

//   function setAsideFrameWidth() {
//     const content = document.querySelector('.analytic-content');
//     if (content) {
//         const contentWidth = content.offsetWidth;
//         const asideFrames = document.querySelectorAll('.analytic-aside__frame');
//         asideFrames.forEach(asideFrame => {
//             if (asideFrame) {
//                 asideFrame.style.width = `${contentWidth - 10}px`;
//             }
//         });
//     }
//   }

//   // Функция для обработки клика на элемент
//   function handleClick(event) {
//       const clickedElement = event.target;
//       const dataType = clickedElement.getAttribute('data-type');

//       if (dataType) {
//           // Обработка клика на analytic-data__item
//           const isClicked = selectedDataTypes.has(dataType);
//           if (isClicked) {
//               selectedDataTypes.delete(dataType);
//           } else {
//               selectedDataTypes.add(dataType);
//           }
//           requestAnimationFrame(() => {
//               setAsideFrameWidth();
//           });
//       }

//       // Обновляем класс 'clicked' для всех элементов
//       updateClickedClasses();
//   } 

//   // Функция для обновления классов 'clicked'
//   function updateClickedClasses() {
//     // Удаляем класс 'clicked' у всех элементов
//     document.querySelectorAll('.analytic-aside__subtitle, .analytic-data__item').forEach(el => {
//         el.classList.remove('clicked');
//     });

//     // Добавляем класс 'clicked' для выбранных элементов
//     selectedDataTypes.forEach(dataType => {
//         document.querySelectorAll(`[data-type="${dataType}"]`).forEach(el => {
//             el.classList.add('clicked');
//         });
//     });

//     // Добавляем или удаляем span с изображением в analytic-aside__subtitle
//     const asideSubtitles = document.querySelectorAll('.analytic-aside__subtitle');
//     asideSubtitles.forEach(subtitle => {
//         const subtitleDataType = subtitle.getAttribute('data-type');
//         if (selectedDataTypes.has(subtitleDataType)) {
//             // Добавляем span если его нет
//             if (!subtitle.querySelector('span')) {
//                 const span = document.createElement('span');
//                 span.classList.add('analytic-aside__frame');
//                 span.innerHTML = `<img src="static/images/content/graph.svg" alt="Graph" />`;
//                 subtitle.appendChild(span);
//             }
//         } else {
//             // Удаляем span если он есть
//             const existingSpan = subtitle.querySelector('span');
//             if (existingSpan) {
//                 existingSpan.remove();
//             }
//         }
//     });
//   }


//   // Добавляем обработчик клика на все элементы с классом 'analytic-aside__subtitle' и 'analytic-data__item'
//   document.querySelectorAll('.analytic-aside__subtitle, .analytic-data__item').forEach(el => {
//       el.addEventListener('click', handleClick);
//   });

//   // Вызываем функцию при изменении размера окна
//   window.addEventListener('resize', setAsideFrameWidth);

//   // Инициализация интерфейса
//   renderLeftPanel();
//   renderData();
//   renderIndicator();
//   setupHoverEffect();
//   setupClickEffect(); 
// };

// document.addEventListener('DOMContentLoaded', getEmbeddedData);

// Функция для обработки клика на элемент с data-indicator

function toggleGraphContainers(clickedIndicatorId) {
    const graphContainerClass = 'analytic-frame';

    // Функция для добавления/удаления graph-container в заданном контейнере
    function toggleInContainer(container) {
        const indicators = container.querySelectorAll('.indicator-row');
        indicators.forEach(indicator => {
            if (indicator.getAttribute('data-indicator') === clickedIndicatorId) {
                let graphContainer = indicator.nextElementSibling;
                if (graphContainer && graphContainer.classList.contains(graphContainerClass)) {
                    // Удаляем graph-container
                    graphContainer.remove();
                } else {
                    // Создаем graph-container
                    graphContainer = document.createElement('div');
                    graphContainer.className = graphContainerClass;
                    let innerFrame = document.createElement('div');
                    innerFrame.className = 'analytic-frame__wrapper';
                    innerFrame.innerHTML = `<img class="analytic-frame__img" src="static/images/content/graph.svg" alt="Graph" />`;
                    graphContainer.appendChild(innerFrame);
                    indicator.parentElement.insertBefore(graphContainer, indicator.nextElementSibling);
                }
            }
        });
    }

    // Обновляем все слайды
    const slides = document.querySelectorAll('.swiper-slide');
    slides.forEach(slide => {
        toggleInContainer(slide);
    });

    // Обновляем фиксированный столбец
    const fixedColumn = document.querySelector('.analytic-aside');
    if (fixedColumn) {
        toggleInContainer(fixedColumn);
    }
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

window.addEventListener('resize', setAsideFrameWidth);
document.addEventListener('DOMContentLoaded', () => {
    setCurrentSlide();
});