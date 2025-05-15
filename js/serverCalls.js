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
            'PUT': this._reqForPUT(),
            'DELETE': this._reqForDELETE(),
            'GET-auth': this._reqForGET(true),
            'POST-auth': this._reqForPOST(true),
            'PUT-auth': this._reqForPUT(true),
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
    _reqForPUT = (auth)=> { 
        return auth ? { 
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
        } : {
            method: 'PUT',
        } 
    }
    _reqForDELETE = (auth)=> { 
        return auth ? { 
            method: 'DELETE' 
        } : {
            
        } 
    }

    _combine = (...objs) => {
        let currentObj = {};
        objs.forEach(obj => {
            // Take the currentObj and combine it with obj
            Object.entries(obj).forEach(([key,value]) => {
                if (currentObj[key] === null || currentObj[key] === undefined) {
                    currentObj[key] = value;
                } else if (typeof value !== 'object') {
                    if (typeof currentObj[key] !== 'object') {
                        // If the value isn't an object and the same key in your currentObj isn't an object, add it to the currentObj
                        currentObj[key] = value; // This will overwrite anything that isn't an object in currentObj at the given key
                    } else if (Array.isArray(currentObj[key])) {
                        currentObj[key] = [...currentObj, value]; // add the value into the currentObj[key] if the latter is an array
                    } else {
                        console.error('Cannot Merge', currentObj[key], 'with', value, 'because one is an object and the other is a', typeof value);
                    }
                } else if (Array.isArray(value)) {
                    // If the value is an array which is a type of object...
                    if (typeof currentObj[key] !== 'object') { 
                        currentObj[key] = [currentObj[key], ...value];
                    } else {
                        if (!Array.isArray(currentObj[key])) { 
                            console.warn('The object', structuredClone(currentObj[key]),'was merged with the array', structuredClone(value)); 
                        }
                        currentObj[key] = Object.assign(currentObj, value);
                    }
                } else { // the value is an object
                    currentObj[key] = this._combine(currentObj[key], value);
                }
            })
        });
        return currentObj;
    };

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
            const response = await fetch(BASE_URL() + 'refresh', this.setReqParams('GET-auth'));
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
            const response = await fetch(BASE_URL() + 'register', 
                this._combine(this.setReqParams('POST-auth'), { body: JSON.stringify({ user: info.user, pwd: info.pwd })})
            );
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
            const response = await fetch(BASE_URL() + 'logout', this.setReqParams('GET-auth'));
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
            const response = await fetch(BASE_URL() + 'characters', 
                this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken.accessToken}` }})
            );
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
            const response = await fetch(BASE_URL() + 'characters', 
                this._combine(this.setReqParams('POST-auth'), 
                    { headers: { 'authorization': `Bearer ${accessToken.accessToken}`},
                    body: JSON.stringify({character})}
                )
            );
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
            const header = this._combine(this.setReqParams('POST-auth'),
            {   headers: { 'authorization': `Bearer ${accessToken.accessToken}`},
                body: JSON.stringify({character})
            }
        );
        console.log('HEADER',header);
            const response = await fetch(BASE_URL() + 'characters', header);
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