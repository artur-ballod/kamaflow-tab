document.addEventListener('DOMContentLoaded', () => {
 	const emailDialog = document.getElementById('email-dialog');
  	const passwordDialog = document.getElementById('password-dialog');
	const phoneDialog = document.getElementById('phone-dialog');
	const newPhoneDialog = document.getElementById('phone-new-dialog');
    const confirmCodeDialog = document.getElementById('phone-confirm-dialog');

    const nextStepButton = document.getElementById('next-step');
    const sendNewCodeButton = document.getElementById('send-new-code');
    const sendNewPhoneButton = document.getElementById('send-new-phone');

    const resendCodeButton = document.getElementById('resend-code');
    const resendNewCodeButton = document.getElementById('resend-new-code');
	const resendTimerPhone = resendCodeButton.querySelector('.dialog__resend-count');
	const resendTimerNewPhone = resendNewCodeButton.querySelector('.dialog__resend-count');

    const confirmationCodeInput = document.getElementById('confirmation-code');
    const newPhoneInput = document.getElementById('new-phone');
    const confirmCodeInput = document.getElementById('confirm-code');

	function toggleButtonState(inputElement, buttonElement) {
        if (inputElement.value.trim() !== '') {
            buttonElement.classList.add('active');
            buttonElement.disabled = false;
        } else {
            buttonElement.classList.remove('active');
            buttonElement.disabled = true;
        }
    }

	confirmationCodeInput.addEventListener('input', () => {
        toggleButtonState(confirmationCodeInput, nextStepButton);
    });

    // Обработчик ввода для поля ввода нового номера телефона
    newPhoneInput.addEventListener('input', () => {
        toggleButtonState(newPhoneInput, sendNewCodeButton);
    });

    // Обработчик ввода для поля ввода кода подтверждения нового номера
    confirmCodeInput.addEventListener('input', () => {
        toggleButtonState(confirmCodeInput, sendNewPhoneButton);
    });

  // Обработчики кнопок
  document.querySelectorAll('.settings__btn').forEach(button => {
    button.addEventListener('click', function() {
      const field = this.dataset.field;
      const wrap = this.closest('.settings__wrap');
      const input = wrap.querySelector('.settings__input');

      switch(field) {
        case 'full_name':
          if (input.disabled) {
            input.disabled = false;
            this.classList.add('settings__btn--active');
            input.focus();
          }
          break;
          
        case 'email':
          if (input.disabled) {
            input.disabled = false;
          } else {
            input.disabled = true;
            showDialog(emailDialog);
            let infoWrap = document.querySelector('.settings__info');
			infoWrap.classList.remove('settings__info--hidden');
            // Удаляем класс active после показа диалога
            this.classList.remove('settings__btn--active');
          }
          break;
          
        case 'password':
          showDialog(passwordDialog);
          // Удаляем класс active после показа диалога
          this.classList.remove('settings__btn--active');
          break;
          
        case 'phone':
          showDialog(phoneDialog);
		  startResendTimer(resendCodeButton, resendTimerPhone, 30);
          // Удаляем класс active после показа диалога
          this.classList.remove('settings__btn--active');
          break;
      }
    });
  });

  	// Закрытие диалогов
  	function closeDialog(dialog, button) {
    	dialog.close();
    	button.classList.remove('settings__btn--active');
  	}

  	// Обработчики кнопок закрытия
  	document.getElementById('email-dialog-close').addEventListener('click', () => {
    	emailDialog.close();
  	});

  	document.getElementById('password-dialog-close').addEventListener('click', () => {
    	passwordDialog.close();
  	});

  	document.getElementById('phone-dialog-close').addEventListener('click', () => {
    	phoneDialog.close();
  	});

	document.getElementById('phone-new-dialog-close').addEventListener('click', () => {
    	newPhoneDialog.close();
  	});

	document.getElementById('phone-code-dialog-close').addEventListener('click', () => {
    	confirmCodeDialog.close();
  	});

  	document.getElementById('password-form').addEventListener('submit', e => {
    	e.preventDefault();
    	closeDialog(passwordDialog, document.querySelector('.settings__btn[data-field="password"]'));
  	});

	// Обработчик нажатия на кнопку "Далее" в первом диалоговом окне
	nextStepButton.addEventListener('click', () => {
        phoneDialog.close();
        showDialog(newPhoneDialog);
    });

    sendNewCodeButton.addEventListener('click', () => {
        newPhoneDialog.close();
		showDialog(confirmCodeDialog);
		startResendTimer(resendNewCodeButton, resendTimerNewPhone, 30);
    });

    sendNewPhoneButton.addEventListener('click', () => {
        confirmCodeDialog.close();
    });

	// Функция для управления счетчиком и состоянием кнопки
    function startResendTimer(button, timerElement, time) {
        let countdown = time;
        button.disabled = true;
        timerElement.textContent = countdown + ' сек';
        button.appendChild(timerElement);

        const intervalId = setInterval(() => {
            countdown--;
            timerElement.textContent = countdown + ' сек';

            if (countdown === 0) {
                clearInterval(intervalId);
                button.disabled = false;
                timerElement.parentElement.classList.add('active');
                button.classList.add('active');
            }
        }, 1000);
    }
});

function showDialog(dialog) {
  dialog.showModal();
}