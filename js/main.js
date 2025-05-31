function login() {
    // authenticate(() => {
    //     redirect('/dashboard.html');
    // });
    API.send('authenticate').then(response => {
        if (response.ok) { redirect('/dashboard.html'); }
        else { quickMessage(`LOGIN UNSUCCESSFUL: ${response.msg}`, timer={time:5000, enabled:true}, 'error') }
    })
}

function transitionToRegister() {
    let loginContainer = document.querySelector('#login-container');
    loginContainer.classList.remove('rotateFrom-90');
    loginContainer.classList.add('rotateTo90');
    loginContainer.addEventListener("animationend", ()=>{
        redirect('/register.html')
    }, false);
}

loginCtrl = () => {
    let source = document.querySelector('#source-selector');
    if (localStorage.getItem('SERVER_SRC')) { source.value = localStorage.getItem('SERVER_SRC');}
    source.addEventListener('change', e => {
        localStorage.setItem('SERVER_SRC', e.target.value);
    })
};
