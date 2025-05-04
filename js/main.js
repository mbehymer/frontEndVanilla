async function login() {
    // authenticate(() => {
    //     redirect('/dashboard.html');
    // });
    let response = await authenticate();
    if (response.ok) { redirect('/dashboard.html'); }
    else { quickMessage("LOGIN UNSUCCESSFUL", timer={time:5000, enabled:true}) }
}

function transitionToRegister() {
    let loginContainer = document.querySelector('#login-container');
    loginContainer.classList.remove('rotateFrom-90');
    loginContainer.classList.add('rotateTo90');
    loginContainer.addEventListener("animationend", ()=>{
        redirect('/register.html')
    }, false);
}

let source = document.querySelector('#source-selector');
source.addEventListener('change', e => {
    localStorage.setItem('SERVER_SRC', e.target.value);
})