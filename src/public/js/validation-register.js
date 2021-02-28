let inputName = document.querySelector('#name');
let divErrorName = document.querySelector('div.name-error');
let inputLastname = document.querySelector('#lastname');
let divErrorLastname = document.querySelector('div.lastname-error');
let inputEmail = document.querySelector('#email');
let divErrorEmail = document.querySelector('div.email-error');
let inputPassword = document.querySelector('#password');
let divErrorPassword = document.querySelector('div.password-error');
let inputRePassword = document.querySelector('#rePassword');
let divErrorRePassword = document.querySelector('div.rePassword-error');

let inputAvatar = document.querySelector('#avatar');
let divErrorAvatar = document.querySelector('div.avatar-error');


const errorMessages = {
    required: "<small class='text-danger'>Campo obligatorio.</small>",
    wrongEmailFormat: "<small class='text-danger'>Ingrese un email válido.</small>",
    maxLength: "<small class='text-danger'>Máximo de caracteres alcanzados.</small>",
    minLength: "<small class='text-danger'>Debe ingresar un minimo de 3 caracteres.</small>",
    notValidText: "<small class='text-danger'>El campo contiene caracteres invalidos.</small>",
    minPassword: "<small class='text-danger'>Debe contener minimo 4 caracteres.</small>",
    passwordsNotMatch: "<small class='text-danger'>Las constraseñas no coinciden.</small>",
    imageError: "<small class='text-danger'>Ingrese una imagen valida(jpg, png).</small>",
}

const errors = {};

let formRegister = document.querySelector('form#register-form');

formRegister.addEventListener('submit', function(e) {
    validateName();
    validateLastname()
    validateEmail();
    validatePassword();
    validateRePassword();
    validateAvatar();
    

    if (Object.keys(errors).length > 0) {
        e.preventDefault();
    } 
})

// validation on real time

inputName.addEventListener('blur', function() {
    validateName();
})

inputLastname.addEventListener('blur', function() {
    validateLastname();
})

inputEmail.addEventListener('blur', function() {
    validateEmail();
})

inputPassword.addEventListener('blur', function() {
    validatePassword();
})

inputRePassword.addEventListener('blur', function() {
    validateRePassword();
})

inputAvatar.addEventListener('change', function() {
    validateAvatar();
})

// validation functions

function validateName() {
    const regex = /^[a-zA-Z ]+$/;
    if (inputName.value == '') {
        errors.name = true;
        divErrorName.innerHTML = errorMessages.required;
    } else if (!regex.test(inputName.value)) {
        errors.name = true;
        divErrorName.innerHTML = errorMessages.notValidText;
    } else if (inputName.value.length < 3) {
        errors.name = true;
        divErrorName.innerHTML = errorMessages.minLength;
    } else if (inputName.value.length > 100) {
        errors.name = true;
        divErrorName.innerHTML = errorMessages.maxLength;
    } else {
        delete errors.name;
        divErrorName.innerHTML = '';
    }
}

function validateLastname() {
    const regex = /^[a-zA-Z ]+$/;
    if (inputLastname.value == '') {
        errors.lastname = true;
        divErrorLastname.innerHTML = errorMessages.required;
    } else if (!regex.test(inputLastname.value)) {
        errors.lastname = true;
        divErrorLastname.innerHTML = errorMessages.notValidText;
    } else if (inputLastname.value.length < 3) {
        errors.lastname = true;
        divErrorLastname.innerHTML = errorMessages.minLength;
    } else if (inputLastname.value.length > 100) {
        errors.lastname = true;
        divErrorLastname.innerHTML = errorMessages.maxLength;
    } else {
        delete errors.lastname;
        divErrorLastname.innerHTML = '';
    }
}

function validateEmail() {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (inputEmail.value == '') {
        errors.email = true;
        divErrorEmail.innerHTML = errorMessages.required;
    } else if (inputEmail.value.length > 100) {
        errors.email = true;
        divErrorEmail.innerHTML = errorMessages.maxLength;
    } else if (!regex.test(inputEmail.value)) {
        errors.email = true;
        divErrorEmail.innerHTML = errorMessages.wrongEmailFormat;
    } else {
        delete errors.email;
        divErrorEmail.innerHTML = '';
    }
}

function validatePassword() {
    if (inputPassword.value == '') {
        errors.password = true;
        divErrorPassword.innerHTML = errorMessages.required;
    } else if (inputPassword.value.length < 4) {
        errors.password = true;
        divErrorPassword.innerHTML = errorMessages.minPassword;
    } else if (inputPassword.value.length > 200) {
        errors.password = true;
        divErrorPassword.innerHTML = errorMessages.maxLength;
    } else {
        delete errors.password;
        divErrorPassword.innerHTML = '';
    }
}

function validateRePassword() {
    if (inputRePassword.value == '') {
        errors.rePassword = true;
        divErrorRePassword.innerHTML = errorMessages.required;
    } else if (inputRePassword.value.length < 4) {
        errors.rePassword = true;
        divErrorRePassword.innerHTML = errorMessages.minPassword;
    } else if (inputRePassword.value.length > 200) {
        errors.rePassword = true;
        divErrorRePassword.innerHTML = errorMessages.maxLength;
    } else if (inputRePassword.value !== inputPassword.value) {
        errors.rePassword = true;
        divErrorRePassword.innerHTML = errorMessages.passwordsNotMatch;
    } else {
        delete errors.rePassword;
        divErrorRePassword.innerHTML = '';
    }
    
}

function validateAvatar() {
    const regex = /(jpg|png|jpeg)$/;
    const file = inputAvatar.files && inputAvatar.files.length ? inputAvatar.files[0] : null ;

    if (file != null && !regex.test(file.type)) {
        errors.avatar = true;
        divErrorAvatar.innerHTML = errorMessages.imageError;
    } else {
        delete errors.avatar;
        divErrorAvatar.innerHTML = '';
    }
}

