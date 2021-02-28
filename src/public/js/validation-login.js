let emailInput = document.querySelector("#inputEmail");
let divErrorEmail = document.querySelector('div.email-error');
let passwordInput = document.querySelector("#inputPassword");
let divErrorPassword = document.querySelector('div.password-error')

const errorMessages = {
    required: "<small class='text-danger'>Campo obligatorio.</small>",
    wrongEmailFormat: "<small class='text-danger'>Ingrese un email válido.</small>",
}

const errors = {};

let formLogin = document.querySelector('form.login-form');

formLogin.addEventListener('submit', function(e) {
    validateEmail();
    validatePassword();
    

    if (Object.keys(errors).length > 0) {
        e.preventDefault();
    } 
})


emailInput.addEventListener('blur', function() {
    validateEmail();
})

passwordInput.addEventListener('blur', function() {
    validatePassword();
})


function validateEmail() {
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailInput.value == '') {
        errors.email = true;
        divErrorEmail.innerHTML = errorMessages.required;
    } else if (!regex.test(emailInput.value)) {
        errors.email = true;
        divErrorEmail.innerHTML = errorMessages.wrongEmailFormat;
    } else {
        delete errors.email;
        divErrorEmail.innerHTML = '';
    }
}

function validatePassword() {
    if (passwordInput.value == '') {
        errors.password = true;
        divErrorPassword.innerHTML = errorMessages.required;
    } else {
        delete errors.password;
        divErrorPassword.innerHTML = '';
    }
}