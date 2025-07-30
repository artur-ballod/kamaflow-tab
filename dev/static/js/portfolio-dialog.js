document.addEventListener('DOMContentLoaded', () => {
      const dialog = document.getElementById('wizard');
      const steps = document.querySelectorAll('.dialog__content-step');
      const nextButtons = document.querySelectorAll('.js-next-btn');
      const saveButton = document.querySelector('.js-save-btn');
      const closeButton = document.querySelector('.dialog__close');
      let currentStep = 1;

      // Функция для обновления отображения шага
      function updateStep() {
        steps.forEach(step => {
          step.style.display = step.dataset.step == currentStep ? 'flex' : 'none';
        });
        document.getElementById('currentStep').textContent = currentStep;
      }

      // Обработчики кнопок "Далее"
      nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if(currentStep < 3) {
            currentStep++;
            updateStep();
          }
        });
      });

      // Обработчик кнопки "Сохранить"
      saveButton.addEventListener('click', () => {
        // Здесь добавить логику сохранения
        dialog.close();
      });

      // Обработчик кнопки закрытия
      closeButton.addEventListener('click', () => {
        dialog.close();
      });

      // Инициализация отображения
      updateStep();
    });

function createRangeSlider(id, min, max, start1, start2) {
    const slider = document.getElementById('slider-' + id);
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
    slider.noUiSlider.on('update', function(values) {
        document.getElementById('value-' + id + '-1').textContent = Math.round(values[0]);
        document.getElementById('value-' + id + '-2').textContent = Math.round(values[1]);
    });
}

// Инициализация слайдеров
createRangeSlider(1, 0, 100, 20, 80);
createRangeSlider(2, 50, 200, 75, 150);
createRangeSlider(3, 100, 500, 200, 400);
createRangeSlider(4, 0, 1000, 300, 700);