

function login() {
    // authenticate(() => {
    //    
    // viewManager.redirect('dashboard');
    // });
    API.send('authenticate').then(response => {
        if (response.ok) { viewManager.redirect('dashboard'); }
        else { quickMessage(`LOGIN UNSUCCESSFUL: ${response.msg}`, timer={time:5000, enabled:true}, 'error') }
    })
}

function transitionToRegister() {
    let loginContainer = document.querySelector('#login-container');
    let transitionClass = 'rotateTo90'
    let existsTransitionClass = [...document.styleSheets].filter(style => {
        return [...style.cssRules].filter(rule => {
            return rule?.selectorText?.includes(transitionClass);
        }).length;
    }).length > 0;

    
    loginContainer.classList.remove('rotateFrom-90');

    if (existsTransitionClass) {
        loginContainer.classList.add(transitionClass);
        loginContainer.addEventListener("animationend", ()=>{
            viewManager.redirect('register')
        }, false);
    } else {
        viewManager.redirect('register')
    }
}

loginCtrl = () => {
    let source = document.querySelector('#source-selector');
    if (!['localhost', '127.0.0.1'].includes(location.host.split(':')[0])) {
        source.remove();
        localStorage.setItem('SERVER_SRC', 'https://nodejsserver-a47a.onrender.com/')
    } else {

        if (localStorage.getItem('SERVER_SRC')) { source.value = localStorage.getItem('SERVER_SRC');}
        source.addEventListener('change', e => {
            localStorage.setItem('SERVER_SRC', e.target.value);
        })
    }
};
