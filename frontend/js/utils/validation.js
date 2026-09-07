// Валидация форм через Pristine.js — красивые инлайн-ошибки вместо только бэкендовых сообщений

Pristine.addMessages('ru', {
    required: 'Это поле обязательно для заполнения',
    email: 'Введите корректный email-адрес',
    number: 'Введите число',
    integer: 'Введите целое число',
    url: 'Введите корректный адрес сайта',
    tel: 'Введите корректный номер телефона',
    maxlength: 'Длина поля должна быть меньше ${1}',
    minlength: 'Длина поля должна быть не меньше ${1}',
    min: 'Минимальное значение — ${1}',
    max: 'Максимальное значение — ${1}',
    pattern: 'Неверный формат',
    equals: 'Значения не совпадают',
    default: 'Введите корректное значение',
});

Pristine.addMessages('en', {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    number: 'Please enter a number',
    integer: 'Please enter a whole number',
    url: 'Please enter a valid website URL',
    tel: 'Please enter a valid phone number',
    maxlength: 'This field must be shorter than ${1} characters',
    minlength: 'This field must be at least ${1} characters',
    min: 'Minimum value is ${1}',
    max: 'Maximum value is ${1}',
    pattern: 'Please match the requested format',
    equals: 'The values do not match',
    default: 'Please enter a valid value',
});

Pristine.addMessages('cs', {
    required: 'Toto pole je povinné',
    email: 'Zadejte platnou e-mailovou adresu',
    number: 'Zadejte číslo',
    integer: 'Zadejte celé číslo',
    url: 'Zadejte platnou webovou adresu',
    tel: 'Zadejte platné telefonní číslo',
    maxlength: 'Délka pole musí být kratší než ${1}',
    minlength: 'Délka pole musí být alespoň ${1}',
    min: 'Minimální hodnota je ${1}',
    max: 'Maximální hodnota je ${1}',
    pattern: 'Neplatný formát',
    equals: 'Hodnoty se neshodují',
    default: 'Zadejte platnou hodnotu',
});

Pristine.setLocale(getLanguage());

const PRISTINE_CONFIG = {
    classTo: 'form-group',
    errorClass: 'has-error',
    successClass: 'has-success',
    errorTextParent: 'form-group',
    errorTextTag: 'span',
    errorTextClass: 'field-error-text',
};

// Один экземпляр Pristine на конкретный <form> — переживает повторные попытки отправки той же формы
function validateForm(form) {
    if (!form._pristine) {
        form._pristine = new Pristine(form, PRISTINE_CONFIG, true);
    }
    return form._pristine.validate();
}
