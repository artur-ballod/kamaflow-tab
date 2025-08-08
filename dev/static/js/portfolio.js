const sliderDefaults = {};

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

    sliderDefaults[id] = [start1, start2];

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

// Сброс значений при клике на кнопку "Сбросить"
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('portfolio__edit')) {
        e.preventDefault();

        const section = e.target.closest('.portfolio__item');
        if (!section) return;

        // Сбрасываем чекбоксы, радио и текстовые инпуты
        section.querySelectorAll('input').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.type === 'text' || input.type === 'number') {
                input.value = input.defaultValue || '';
            }
        });

        // Сбрасываем noUiSlider
        section.querySelectorAll('[id^="slider-"]').forEach(sliderEl => {
            const id = sliderEl.id.replace('slider-', '');
            if (sliderEl.noUiSlider && sliderDefaults[id]) {
                sliderEl.noUiSlider.set(sliderDefaults[id]);
            }
        });
    }
});