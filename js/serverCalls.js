let accessToken;

// let BASE_URL = 'https://nodejsserver-a47a.onrender.com/'
let BASE_URL = () => {//'http://localhost:8080/'
    return localStorage.getItem('SERVER_SRC') || 'https://nodejsserver-a47a.onrender.com/'
}


function redirect(path) {
    window.location.href = path;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function authenticate() {
    const userField = document.querySelector("#username");
    const pwdField = document.querySelector("#pwd");
    const user = userField.value;
    const pwd = pwdField.value;
    userField.value = '';
    pwdField.value = '';
    loader.start();

    // await delay(1000);

    try {
        const response = await fetch(BASE_URL() + 'auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user, pwd })
        });

        accessToken = response.ok ? response.json() : false;
        loader.end();
        return response;
    } catch (err) {
        console.log(err.stack);
        loader.end();
        return false
    }
}

async function grabRefreshToken(onSuccess=()=>{}, onFailure=()=>{}) {
    // let refreshToken;
    try {
        const response = await fetch(BASE_URL() + 'refresh', {
            method: 'GET',
            withCredentials: true,
            credentials: 'include'
        });
        console.log(response);
        if (!response.ok) {
            onFailure();
        } else {           
            accessToken = await response.json();
            onSuccess();
        }
    } catch (err) {
        console.log(err.stack);
    }
}

async function register(info={user: false, pwd: false},onSuccess=()=>{}, onFailure=()=>{}) {
    if (!info.user || !info.pwd) return false;
    try {
        const response = await fetch(BASE_URL() + 'register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user: info.user, pwd: info.pwd })
        });
        if (!response.ok) {
            onFailure();
        } else {
            accessToken = await response.json();
            onSuccess();
        }
    } catch (err) {
        console.log(err.stack);
    }
}
async function logout(onSuccess=()=>{}, onFailure=()=>{}) {
    // let refreshToken;
    try {
        const response = await fetch(BASE_URL() + 'logout', {
            method: 'GET',
            withCredentials: true,
            credentials: 'include'
        });
        console.log(response);
        if (!response.ok) {
            onFailure();
        } else {         
            redirect('/index.html');
            onSuccess();
        }
    } catch (err) {
        console.log(err.stack);
        // redirect('/index.html');
    }
}


async function getCharacters(onSuccess=()=>{}, onFailure=()=>{}) {
    // let refreshToken = await grabRefreshToken();
    try {
        const response = await fetch(BASE_URL() + 'characters', {
            method: 'GET',
            headers: { 'authorization': `Bearer ${accessToken.accessToken}` },
            credentials: 'include',
            
            // body: JSON.stringify({ user, pwd })
        });
        if (!response.ok) {
            onFailure();
        } else {            
            console.log(response);
            let characters = await response.json();
            console.log(characters);
            onSuccess(characters);
        }
    } catch (err) {
        console.log(err.stack);
    }

}
async function updateCharacter(character, onSuccess=()=>{}, onFailure=()=>{}) {
    // let refreshToken = await grabRefreshToken();
    try {
        const response = await fetch(BASE_URL() + 'characters', {
            method: 'PUT',
            headers: { 
                'authorization': `Bearer ${accessToken.accessToken}`,
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({character})
            
            // body: JSON.stringify({ user, pwd })
        });
        if (!response.ok) {
            onFailure();
        } else {            
            console.log(response);
            let characters = await response.json();
            console.log(characters);
            onSuccess(characters);
        }
    } catch (err) {
        console.log(err.stack);
    }

}

async function createCharacter(character, onSuccess=()=>{}, onFailure=()=>{}) {
    // let refreshToken = await grabRefreshToken();
    try {
        const response = await fetch(BASE_URL() + 'characters', {
            method: 'POST',
            headers: { 
                'authorization': `Bearer ${accessToken.accessToken}`,
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({character})
            
        });
        if (!response.ok) {
            onFailure();
        } else {            
            console.log(response);
            let character = await response.json();
            console.log(character);
            onSuccess(character);
        }
    } catch (err) {
        console.log(err.stack);
    }

}