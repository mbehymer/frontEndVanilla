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
    constructor() {
        this.settings = this.defineSettings();
        this.settings.watch(false, ()=> this.updateSettings() );
    }
    // accessToken;
    settings = {}
    defineSettings = () => {
        return {
            immutableList: ['immutableList', 'watchList', 'watchAll', 'watch', 'clear', 'set', 'get'],
            watchList: {},
            watchAll: [], // List of all functions to run whenever a value is set in settings
            watch: (key, run) => { // this is only a shallow watch
                if (!key) return this.settings.watchAll.push(run);
                watchList[key] = watchList[key] ? [...watchList[key], run] : [run]; // for a give property to watch attach a function and if there is another function tied to the property we are watching continue adding functions so that they all can run when the value is updated
            },
            clear: (key) => {
                if ( this.settings.immutableList.includes(key) ) throw new Error(`Property ${key} is not mutable and thus cannot be changed`); 

                if (!key) {
                    this.settings = this.defineSettings();
                    this.settings.watch(false, ()=> this.updateSettings() );
                } else {
                    this.settings.set(key, undefined)
                }
            },
            set: (key, newValue) => { // Should this be an async function? Maybe so incase you want to keep the function going... but I think you can decide that with the function passed into the watch function
                if ( this.settings.immutableList.includes(key) ) throw new Error(`Property ${key} is not mutable and thus cannot be changed`); 
                let oldValue = this.settings[key];
                this.settings[key] = newValue;

                this.settings.watchAll.forEach(func => func(newValue, oldValue)); // this will run any function that is added to the watchAll array
                this.settings.watchList[key]?.forEach(func => func(newValue, oldValue) );// Run each function that is tied to that key
                
            },
            get: (key) => { 
                if (Array.isArray(key)) { // If someone passes in an array
                    let currentObj = this.settings
                    key.forEach(path => {
                        if (currentObj !== undefined) {
                            currentObj = currentObj[path];
                        }
                    });
                    return currentObj
                } else if (key.includes('.')) {
                    let pathing = key.split('.')
                    return this.settings.get(pathing);
                } else {
                    return this.settings[key] 
                }
            }
        };
    }
    
    updateSettings = (element) => { // TODO: At some point I need to have this function reference the original HTML and then update a copy of it, rather than updating the original because otherwise I lose where the original had the dynamic fields...
        let allElements = []; 
        // let parentElement = !!element ? 
        // element : 
        // viewManager.templateHTML(viewManager.view().name, 'dynamic');
        let isSingleUpdate = !!element;

        allElements = isSingleUpdate ? 
            [...element.querySelectorAll(".dynamic")].map( dynamic => {
                return {
                    'originalElement': dynamic,
                    'updatedElement': dynamic
                }
            }) : 
            viewManager.templateHTML(viewManager.view().name, 'dynamic', false);

        if (isSingleUpdate && element.className.includes('dynamic')) allElements.unshift({ 'originalElement': element, 'updatedElement': element }); // incase the element is also a dynamic field

        allElements.forEach(el => {
            let orginal = el.originalElement;
            let toUpdate = el.updatedElement;
            if (orginal.nodeName === 'INPUT' || orginal.nodeName === 'TEXTAREA') {
                
                let value = orginal.value; // use this so that we are able to update multiple times of dynamic interpolation like <input value="{{...}} {{...}}>"
                const matches = value.matchAll(/{{(.*?)}}/g)
                for (const match of matches) {
                    let val = this.settings.get(match[1]);
                    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
                        val = JSON.stringify(val);
                    } 
                    if ( val ) {
                        value = value.replace(match[0], val);
                    } else {
                        value = value.replace(match[0], '');
                        
                    }
                }

                toUpdate.value = value;
                toUpdate.dispatchEvent(new Event('input', { bubbles: true })); // trigger any event listeners tied to this element
            } else {
                let textContent = orginal.textContent; // use this so that we are able to update multiple times of dynamic interpolation like <div>{{...}} {{...}}</div>"
                const matches = textContent.matchAll(/{{(.*?)}}/g)
                for (const match of matches) {
                    let val = this.settings.get(match[1]);
                    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
                        val = JSON.stringify(val);
                    } 
                    if ( val ) {
                        textContent = textContent.replace(match[0], val);
                    } else {
                        textContent = textContent.replace(match[0], '');
                    }
                }
                toUpdate.textContent = textContent;
            }
        });
        // if (!element && allElements.length) {
        //     viewManager.templateHTML(viewManager.view().name, false, parentElement.children);
        //     viewManager.refreshView();
        // }
    };
    
    send = async (request, ...params) => {

        // let oldSettings = JSON.stringify(this.settings);
        
        const calls = {
            authenticate: this.authenticate,
            grabRefreshToken: this.grabRefreshToken,
            register: this.register,
            logout: this.logout,
            getUserInfo: this.getUserInfo,
            updateUserInfo: this.updateUserInfo,
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
            // let newSettings = JSON.stringify(this.settings);

            // if (oldSettings !== newSettings) this.updateSettings();
            
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
            this.settings.set('role', data.role);
            this.settings.set('id', data.id);
            accessToken = data.accessToken;
            // loader.end();
            return response;
    }

    grabRefreshToken = async () => {
        // loader.start();
        const response = await fetch(BASE_URL() + 'refresh', this.setReqParams('GET-auth'));
        
        const data = response.ok ? await response.json() : false;
        this.settings.set('role', data.role);
        this.settings.set('id', data.id);
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

        const response = await fetch(BASE_URL() + 'logout', this.setReqParams('GET-auth'));
        if (response.ok) this.settings.clear();
        return response;
    }

    getUserInfo = async () => {
        
        const response = await fetch(BASE_URL() + 'user-details/' + this.settings.get('id'),
            this._combine(this.setReqParams('GET-auth'), {headers: { 'authorization': `Bearer ${accessToken}` }})
        );
        const data = response.ok && response.status !== 204 ? await response.json() : false;

        this.settings.set('user', data);

        return response;
    }

    updateUserInfo = async (userInfo) => {
        
        const response = await fetch(BASE_URL() + 'user-details/' + this.settings.get('id'),
            this._combine(this.setReqParams('PUT-auth'), 
                { headers: { 'authorization': `Bearer ${accessToken}`},
                    body: JSON.stringify(userInfo)
                }
            )
        )
        const data = response.ok && response.status !== 204 ? await response.json() : false;

        if (response.ok) {
            this.settings.set('user', data.userData);
            this.settings.set('id', data.id);
        }

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
        if (!['A','E'].includes(this.settings.get('role'))) {
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
        if ( !['A','E'].includes( this.settings.get('role') ) ) {
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
        if ( !['A'].includes(this.settings.get('role')) ) {
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