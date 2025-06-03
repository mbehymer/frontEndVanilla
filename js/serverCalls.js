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
    
    updateSettings = function() {
        [...document.querySelectorAll(".dynamic")].forEach(el => {
        const matches = el.textContent.matchAll(/{{(.*?)}}/g)
        for (const match of matches) {
            if (this.settings[match[1]]) el.innerHTML = el.innerHTML.replace(match[0], JSON.stringify(this.settings[match[1]]));
        }
        })
    };
    
    send = async function(request, ...params) {

        let oldSettings = JSON.stringify(this.settings);
        
        const calls = {
            authenticate: this.authenticate,
            grabRefreshToken: this.grabRefreshToken,
            register: this.register,
            logout: this.logout,
            getUserInfo: this.getUserInfo,
            getCharacter: this.getCharacter,
            getCharacters: this.getCharacters,
            updateCharacter: this.updateCharacter,
            createCharacter: this.createCharacter,
            deleteCharacter: this.deleteCharacter,
        }
        
            loader.start();
        try {
            
            // Pre request

            // Authenticate the user upon grabbing each request (Maybe not the best idea but oh well haha).
            if (!['authenticate', 'grabRefreshToken', 'logout', 'register'].includes(request)) await this.send('grabRefreshToken');

            let response = await calls[request](...params);
            if (response.msg === undefined) response.msg = response.statusText;
            

            // Post request
            let newSettings = JSON.stringify(this.settings);

            if (oldSettings !== newSettings) this.updateSettings();
            
            loader.end();
            return response;

        } catch (err) {
            console.log(err.stack);
            loader.end();
            return {ok: false, msg: err.stack}
        }
    }

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

    authenticate = async () => { // These need to be arrow functions to use this. when it refers to the whole ServerConnection otherwise when they are called through the send method, the this. in these functions would only be able to see the other methods in the call object
        const userField = document.querySelector("#username");
        const pwdField = document.querySelector("#pwd");
        const user = userField.value;
        const pwd = pwdField.value;
        userField.value = '';
        pwdField.value = '';

            const response = await fetch(BASE_URL() + 'auth', 
                this._combine(this.setReqParams('POST-auth'), { body: JSON.stringify({ user, pwd })})
            );
            
            const data = response.ok ? await response.json() : false;
            this.settings.role = data.role;
            this.settings.id = data.id;
            accessToken = data.accessToken;
            // loader.end();
            return response;
    }

    grabRefreshToken = async () => {
        // loader.start();
        const response = await fetch(BASE_URL() + 'refresh', this.setReqParams('GET-auth'));
        
        const data = response.ok ? await response.json() : false;
        this.settings.role=data.role;
        this.settings.id = data.id;
        accessToken = data.accessToken;
        
        return response;
    }

    register = async (info={user: false, pwd: false}) => {
        try {
            
            if (!info.user || !info.pwd) return { ok: false, msg: `Please fill in the ${!info.user && ! info.pwd ? 'username and password' : !info.user ? 'username' : 'password'}`};
            
            const response = await fetch(BASE_URL() + 'register', 
                this._combine(this.setReqParams('POST-auth'), { body: JSON.stringify({ user: info.user, pwd: info.pwd })})
            );
            if (response.ok) accessToken = await response.json();
            return response;
        } catch (err) {
            return {ok: false, msg: err.stack}
        }
    }

    logout = async () => {
        return await fetch(BASE_URL() + 'logout', this.setReqParams('GET-auth'));
    }

    getUserInfo = async () => {
        
        const response = await fetch(BASE_URL() + 'user-details/' + this.settings.id,
            this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
        );
        const data = response.ok && response.status !== 204 ? await response.json() : false;

        this.settings.user = data;

        return response;
    }

    getCharacter = async (id) => {
        return await fetch(BASE_URL() + 'characters/' + id, 
            this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
        );
    }

    getCharacters = async () => {
        return await fetch(BASE_URL() + 'characters', 
            this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
        );
    }

    updateCharacter = async (character) => {
        if (!['A','E'].includes(this.settings.role)) {
            return { ok: false, msg: 'You are not allowed to Update'};
        }
        return await fetch(BASE_URL() + 'characters', 
            this._combine(this.setReqParams('PUT-auth'), 
                { headers: { 'authorization': `Bearer ${accessToken}`},
                body: JSON.stringify({character})}
            )
        );
    }

    createCharacter = async (character) => {
        if (!['A','E'].includes(this.settings.role)) {
            return { ok: false, msg: 'You are not allowed to Create'};
        }
        const header = this._combine(this.setReqParams('POST-auth'),
            {   headers: { 'authorization': `Bearer ${accessToken}`},
                body: JSON.stringify({character})
            }
        );
        return await fetch(BASE_URL() + 'characters', header);
    }
    
    deleteCharacter = async (id) => {
        if (!['A'].includes(this.settings.role)) {
            return { ok: false, msg: 'You are not allowed to Delete'};
        }
        const header = this._combine(this.setReqParams('DELETE-auth'),
            {   headers: { 'authorization': `Bearer ${accessToken}`}//,
                // body: JSON.stringify({character})
            }
        );
        return await fetch(BASE_URL() + 'characters/'+id, header);
    }
}

const API = new ServerConnection();