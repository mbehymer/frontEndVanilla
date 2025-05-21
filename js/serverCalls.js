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
    // constructor(name = "", level = 1, power = 1, health = 1, weapon = {}) {
    //     this.settings
    // }
    // accessToken;

    settings = {};
    
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
            
            const data = response.ok ? await response.json() : false;
            this.settings.role = data.role;
            accessToken = data.accessToken;
            loader.end();
            console.log('accessToken',accessToken);
            console.log('response',response);
            return response;
        } catch (err) {
            console.log(err.stack);
            loader.end();
            return {ok: false, msg: err.stack}
        }
    }

    grabRefreshToken = async function(onSuccess=()=>{}, onFailure=()=>{}) {
        // let refreshToken;
        loader.start();
        try {
            const response = await fetch(BASE_URL() + 'refresh', this.setReqParams('GET-auth'));
            
            const data = response.ok ? await response.json() : false;
            this.settings.role=data.role;
            accessToken = data.accessToken;
            
            loader.end();
            return response;
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }
    }

    register = async function(info={user: false, pwd: false},onSuccess=()=>{}, onFailure=()=>{}) {
        if (!info.user || !info.pwd) return false;
        loader.start();
        try {
            const response = await fetch(BASE_URL() + 'register', 
                this._combine(this.setReqParams('POST-auth'), { body: JSON.stringify({ user: info.user, pwd: info.pwd })})
            );
            accessToken = await response.json();
            loader.end();
            return response;
            // if (!response.ok) {
            //     onFailure();
            // } else {
                // accessToken = await response.json();
            //     onSuccess();
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }
    }

    logout = async function (onSuccess=()=>{}, onFailure=()=>{}) {
        // let refreshToken;
        loader.start();
        try {
            const response = await fetch(BASE_URL() + 'logout', this.setReqParams('GET-auth'));
            loader.end();
            return response;
            // if (!response.ok) {
            //     onFailure();
            // } else {         
            //     redirect('/index.html');
            //     onSuccess();
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
            // redirect('/index.html');
        }
    }

    getCharacter = async function (id) {
        // let refreshToken = await grabRefreshToken();
        loader.start();
        try {
            console.log('Request',this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }}))
            const response = await fetch(BASE_URL() + 'characters/' + id, 
                this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
            );
            loader.end();
            return response;
            // if (!response.ok) {
            //     return response.ok;
            //     onFailure();
            // } else {
            //     return await response.json();            
                // console.log(response);
                // let characters = await response.json();
                // console.log(characters);
                // onSuccess(characters);
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }

    }

    getCharacters = async function (onSuccess=()=>{}, onFailure=()=>{}) {
        // let refreshToken = await grabRefreshToken();
        loader.start();
        try {
            console.log('Request',this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }}))
            const response = await fetch(BASE_URL() + 'characters', 
                this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
            );
            loader.end();
            return response;
            // if (!response.ok) {
            //     return response.ok;
            //     onFailure();
            // } else {
            //     return await response.json();            
                // console.log(response);
                // let characters = await response.json();
                // console.log(characters);
                // onSuccess(characters);
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }

    }

    updateCharacter = async function (character, onSuccess=()=>{}, onFailure=()=>{}) {
        // let refreshToken = await grabRefreshToken();
        loader.start();
        if (!['A','E'].includes(this.settings.role)) {
            loader.end();
            return { ok: false, msg: 'You are not allowed to Update'};
        }
        try {
            const response = await fetch(BASE_URL() + 'characters', 
                this._combine(this.setReqParams('PUT-auth'), 
                    { headers: { 'authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify({character})}
                )
            );
            loader.end();
            return response;
            // if (!response.ok) {
            //     return response.ok;
            //     onFailure();
            // } else {
            //     return await response.json();  
            //     console.log(response);
            //     let characters = await response.json();
            //     console.log(characters);
            //     onSuccess(characters);
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }

    }

    createCharacter = async function (character, onSuccess=()=>{}, onFailure=()=>{}) {
        // let refreshToken = await grabRefreshToken();
        loader.start();
        if (!['A','E'].includes(this.settings.role)) {
            loader.end();
            return { ok: false, msg: 'You are not allowed to Create'};
        }
        try {
            const header = this._combine(this.setReqParams('POST-auth'),
                {   headers: { 'authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify({character})
                }
            );
            const response = await fetch(BASE_URL() + 'characters', header);
            loader.end();
            return response;
            // if (!response.ok) {
            //     return response.ok;
            //     onFailure();
            // } else {
            //     return await response.json();  
            //     console.log(response);
            //     let character = await response.json();
            //     console.log(character);
            //     onSuccess(character);
            // }
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }

    }
    
    deleteCharacter = async function (id) {
        // let refreshToken = await grabRefreshToken();
        loader.start();
        if (!['A'].includes(this.settings.role)) {
            loader.end();
            return { ok: false, msg: 'You are not allowed to Delete'};
        }
        try {
            const header = this._combine(this.setReqParams('DELETE-auth'),
                {   headers: { 'authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify({character})
                }
            );
            const response = await fetch(BASE_URL() + 'characters/'+id, header);
            loader.end();
            return response;
        } catch (err) {
            loader.end();
            console.log(err.stack);
            return {ok: false, msg: err.stack}
        }

    }
}

const API = new ServerConnection();