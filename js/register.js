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

    if (!verifyPassword(pwdField.value,pwdVerifyField.value)) return quickMessage('Passwords do not match!',{time:25000, enabled:true}, 'error');

    // submit the registration fields        
    const response = API.send('register', {user: userField.value, pwd: pwdField.value}).then(response => {
        
        if (response.ok) {
            let res = API.send('authenticate');
            if (res.ok) { 
               
                viewManager.redirect('login')
                quickMessage('Registration successful', {time:0, enabled: false});
            } else { quickMessage("There was an error, please try logging in.", timer={time:5000, enabled:true}, 'error') };
        } else {
            quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
        }
    })
    .catch(err =>{
        
        quickMessage(err, {time: 5000, enabled: true}, 'error');
    })


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
       
        viewManager.redirect('login')
    }, false);
}

registerCtrl = () => {
    API.send('grabRefreshToken').then(response => {
        if (response.ok) {
            insertHeaderNav('body')
        } else {
           
            // viewManager.redirect('login')
            quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
        }
    })
    .catch(err => {
        console.warn('err', error)
    });
};