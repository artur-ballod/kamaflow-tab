"use strict";

document.addEventListener('DOMContentLoaded', function () {
  var emailDialog = document.getElementById('email-dialog');
  var passwordDialog = document.getElementById('password-dialog');
  var phoneDialog = document.getElementById('phone-dialog');
  var newPhoneDialog = document.getElementById('phone-new-dialog');
  var confirmCodeDialog = document.getElementById('phone-confirm-dialog');
  var nextStepButton = document.getElementById('next-step');
  var sendNewCodeButton = document.getElementById('send-new-code');
  var sendNewPhoneButton = document.getElementById('send-new-phone');
  var resendCodeButton = document.getElementById('resend-code');
  var resendNewCodeButton = document.getElementById('resend-new-code');
  var resendTimerPhone = resendCodeButton.querySelector('.dialog__resend-count');
  var resendTimerNewPhone = resendNewCodeButton.querySelector('.dialog__resend-count');
  var confirmationCodeInput = document.getElementById('confirmation-code');
  var newPhoneInput = document.getElementById('new-phone');
  var confirmCodeInput = document.getElementById('confirm-code');
  function toggleButtonState(inputElement, buttonElement) {
    if (inputElement.value.trim() !== '') {
      buttonElement.classList.add('active');
      buttonElement.disabled = false;
    } else {
      buttonElement.classList.remove('active');
      buttonElement.disabled = true;
    }
  }
  confirmationCodeInput.addEventListener('input', function () {
    toggleButtonState(confirmationCodeInput, nextStepButton);
  });

  // Обработчик ввода для поля ввода нового номера телефона
  newPhoneInput.addEventListener('input', function () {
    toggleButtonState(newPhoneInput, sendNewCodeButton);
  });

  // Обработчик ввода для поля ввода кода подтверждения нового номера
  confirmCodeInput.addEventListener('input', function () {
    toggleButtonState(confirmCodeInput, sendNewPhoneButton);
  });

  // Обработчики кнопок
  document.querySelectorAll('.settings__btn').forEach(function (button) {
    button.addEventListener('click', function () {
      var field = this.dataset.field;
      var wrap = this.closest('.settings__wrap');
      var input = wrap.querySelector('.settings__input');
      switch (field) {
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
            var infoWrap = document.querySelector('.settings__info');
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
  document.getElementById('email-dialog-close').addEventListener('click', function () {
    emailDialog.close();
  });
  document.getElementById('password-dialog-close').addEventListener('click', function () {
    passwordDialog.close();
  });
  document.getElementById('phone-dialog-close').addEventListener('click', function () {
    phoneDialog.close();
  });
  document.getElementById('phone-new-dialog-close').addEventListener('click', function () {
    newPhoneDialog.close();
  });
  document.getElementById('phone-code-dialog-close').addEventListener('click', function () {
    confirmCodeDialog.close();
  });
  document.getElementById('password-form').addEventListener('submit', function (e) {
    e.preventDefault();
    closeDialog(passwordDialog, document.querySelector('.settings__btn[data-field="password"]'));
  });

  // Обработчик нажатия на кнопку "Далее" в первом диалоговом окне
  nextStepButton.addEventListener('click', function () {
    phoneDialog.close();
    showDialog(newPhoneDialog);
  });
  sendNewCodeButton.addEventListener('click', function () {
    newPhoneDialog.close();
    showDialog(confirmCodeDialog);
    startResendTimer(resendNewCodeButton, resendTimerNewPhone, 30);
  });
  sendNewPhoneButton.addEventListener('click', function () {
    confirmCodeDialog.close();
  });

  // Функция для управления счетчиком и состоянием кнопки
  function startResendTimer(button, timerElement, time) {
    var countdown = time;
    button.disabled = true;
    timerElement.textContent = countdown + ' сек';
    button.appendChild(timerElement);
    var intervalId = setInterval(function () {
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