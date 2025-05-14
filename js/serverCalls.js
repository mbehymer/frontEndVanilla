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

class ServerConnection {
    
    // accessToken;
    
    setReqParams = function(req) {
        return {
            'GET': this._reqForGET(),
            'POST': this._reqForPOST(),
            'PUSH': this._reqForPUSH(),
            'DELETE': this._reqForDELETE(),
            'GET-auth': this._reqForGET(true),
            'POST-auth': this._reqForPOST(true),
            'PUSH-auth': this._reqForPUSH(true),
            'DELETE-auth': this._reqForDELETE(true)
        }[req];
    }

    _reqForGET  = (auth)=> { 
        return auth ? {
            method: 'GET',
            withCredentials: true,
            credentials: 'include'
        } : {
            method: 'GET',
        } 
    }
    _reqForPOST = (auth)=> { 
        return auth ? { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            credentials: 'include' 
        } : { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' } 
        }
    } 
    _reqForPUSH = (auth)=> { 
        return auth ? { 
            method: 'PUSH' 
        } : {

        } 
    }
    _reqForDELETE = (auth)=> { 
        return auth ? { 
            method: 'DELETE' 
        } : {
            
        } 
    }

    _combine = (...objs) => Object.assign(...objs);

    authenticate = async function() {
        const userField = document.querySelector("#username");
        const pwdField = document.querySelector("#pwd");
        const user = userField.value;
        const pwd = pwdField.value;
        userField.value = '';
        pwdField.value = '';
        loader.start();

        // await delay(1000);

        try {
            const response = await fetch(BASE_URL() + 'auth', 
                this._combine(this.setReqParams('POST-auth'), { body: JSON.stringify({ user, pwd })})
            );

            accessToken = response.ok ? response.json() : false;
            loader.end();
            return response;
        } catch (err) {
            console.log(err.stack);
            loader.end();
            return false
        }
    }

    grabRefreshToken = async function(onSuccess=()=>{}, onFailure=()=>{}) {
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

    register = async function(info={user: false, pwd: false},onSuccess=()=>{}, onFailure=()=>{}) {
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
    logout = async function (onSuccess=()=>{}, onFailure=()=>{}) {
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


    getCharacters = async function (onSuccess=()=>{}, onFailure=()=>{}) {
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
    updateCharacter = async function (character, onSuccess=()=>{}, onFailure=()=>{}) {
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

    createCharacter = async function (character, onSuccess=()=>{}, onFailure=()=>{}) {
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
}

const API = new ServerConnection();