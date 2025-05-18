function redirect(path) {
    window.location.href = path;
}

function clearElementValues(...elements) {
    elements.forEach(element=>{
        element.value='';
    })
}

function registrationCleanup(...elements) {
    clearElementValues(...elements);
}

function processRegistration() {
    // Grab the username and password fields
    const userField = document.querySelector("#username");
    const pwdField = document.querySelector("#pwd");
    const pwdVerifyField = document.querySelector("#pwd-verify");

    if (!verifyPassword(pwdField.value,pwdVerifyField.value)) return quickMessage('Passwords do not match!',{time:25000, enabled:true});

    // submit the registration fields        
    const response = API.register({user: userField.value, pwd: pwdField.value});
    if (response.ok) {
    
        let res = API.authenticate();
        if (res.ok) { 
            redirect('/index.html')
            quickMessage('Registration successful', {time:0, enabled: false});
        } else { quickMessage("There was an error, please try logging in.", timer={time:5000, enabled:true}) };
    }


    // remove the values from the registration form
    registrationCleanup([userField,pwdField,pwdVerifyField]);
}

function verifyPassword(pwd, pwdVerifier) {
    return pwd === pwdVerifier
}


function transitionToLogin() {
    let loginContainer = document.querySelector('#register-form');
    loginContainer.classList.remove('rotateFrom-90');
    loginContainer.classList.add('rotateTo90');
    loginContainer.addEventListener("animationend", ()=>{
        redirect('/index.html')
    }, false);
}

setTimeout(() => {
    API.grabRefreshToken().then(response => {
        if (response.ok) {
            insertHeaderNav('body')
        } else {
            redirect('/index.html')
            quickMessage(response.msg, {time: 5000, enabled: true});
        }
    });
}
, 0);