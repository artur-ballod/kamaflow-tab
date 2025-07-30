"use strict";

document.addEventListener('DOMContentLoaded', function () {
  var dialog = document.getElementById('wizard');
  var steps = document.querySelectorAll('.dialog__content-step');
  var nextButtons = document.querySelectorAll('.js-next-btn');
  var saveButton = document.querySelector('.js-save-btn');
  var closeButton = document.querySelector('.dialog__close');
  var currentStep = 1;

  // Функция для обновления отображения шага
  function updateStep() {
    steps.forEach(function (step) {
      step.style.display = step.dataset.step == currentStep ? 'flex' : 'none';
    });
    document.getElementById('currentStep').textContent = currentStep;
  }

  // Обработчики кнопок "Далее"
  nextButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (currentStep < 3) {
        currentStep++;
        updateStep();
      }
    });
  });

  // Обработчик кнопки "Сохранить"
  saveButton.addEventListener('click', function () {
    // Здесь добавить логику сохранения
    dialog.close();
  });

  // Обработчик кнопки закрытия
  closeButton.addEventListener('click', function () {
    dialog.close();
  });

  // Инициализация отображения
  updateStep();
});
function createRangeSlider(id, min, max, start1, start2) {
  var slider = document.getElementById('slider-' + id);
  noUiSlider.create(slider, {
    start: [start1, start2],
    connect: true,
    range: {
      'min': min,
      'max': max
    },
    step: 1
  });

  // Обновление значений
  slider.noUiSlider.on('update', function (values) {
    document.getElementById('value-' + id + '-1').textContent = Math.round(values[0]);
    document.getElementById('value-' + id + '-2').textContent = Math.round(values[1]);
  });
}

// Инициализация слайдеров
createRangeSlider(1, 0, 100, 20, 80);
createRangeSlider(2, 50, 200, 75, 150);
createRangeSlider(3, 100, 500, 200, 400);
createRangeSlider(4, 0, 1000, 300, 700);