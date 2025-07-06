class ViewManager {
    views = {
        dashboard: {
            name: 'dashboard',
            run: dashboardCtrl,
            template: 'templates/dashboard.html'
        },
        login: {
            name: 'login',
            run: loginCtrl,
            template: 'templates/login.html'
        },
        register: {
            name: 'register',
            run: registerCtrl,
            template: 'templates/register.html'
        },
        editProfile: {
            name: 'editProfile',
            run: editProfileCtrl,
            template: 'templates/edit_profile.html'
        }
    }

    loadView() {
        try {
            if (!this.view()) this.redirect('login');

            fetch(this.view().template).then(res => {
                return res.text();
            })
            .then(file => {
                let main = document.querySelector('main'); // At some point this should be changed so that it doesn't use the body, but rather gets put into whatever parent container it was requested for... So it could be part of a template.
                this.templateHTMLSetValue(this.view().name, file);
                main.replaceChildren(...[this.templateHTML(this.view().name, 'updated')]);//main.innerHTML = this.templateHTML(this.view().name, false, file).innerHTML;
                this.view().run();
                this.loadNavbar();
            })
        } catch (err) {
            console.error('loadView:', this.view(), 'Error:', err);
        }
    }

    // refreshView() {
    //     try {
    //         if (!this.view()) this.redirect('login');
           
    //         let main = document.querySelector('main'); // At some point this should be changed so that it doesn't use the body, but rather gets put into whatever parent container it was requested for... So it could be part of a template.
            
    //         //main.replaceChildren(...[this.templateHTML(this.view().name)]);
    //         // this.view().run();
    //     } catch (err) {
    //         console.error('loadView:', this.view(), 'Error:', err);
    //     }
    // }

    params = () => { return location.search.replace('?','').split('&').map(search => {
            let pair = search.split('=');
            let key = pair[0];
            let value = pair[1];
            return { key, value }
        });
    }; // Probably could use Object.assign({}) here to make this into an object...

    view = () => {
        let viewParam = this.params().filter(param => param.key === 'view')[0];
        if (viewParam === undefined) return false;
        return this.views[viewParam.value];
    }

    templateHTMLList = {}; // This is to store the original versions of the HTML
    templateHTMLSetValue = (key, value) => {
        let container = document.createElement('div');
        container.innerHTML = value;
        this.templateHTMLList[key] = {
            'original': container.cloneNode(true),
            'updated': container,
            'dynamic': [...container.querySelectorAll('.dynamic')].map( dynamic => {

                let clone = dynamic.cloneNode(true);
                API.updateSettings(dynamic);

                return {
                    'originalElement': clone,
                    'updatedElement': dynamic
                }
            })
        };
    }

    templateHTML = (key, type) => {
        if (this.templateHTMLList[key] === undefined) throw Error(`Missing value for ${key}`);
        switch (type) {
            case 'original' :
                return this.templateHTMLList[key]['original'].cloneNode(true);
                break;
            case 'updated' :
                return this.templateHTMLList[key]['updated'];
                break;
            case 'dynamic' :
            default: 
                if (this.templateHTMLList[key]['dynamic'] === undefined) throw Error(`Missing value for ${key} in the dynamic fields`);
                return this.templateHTMLList[key]['dynamic']
        }
        // if (!value) {
        //     return type === 'original' ? 
        //     this.templateHTMLList[key]['original'].cloneNode(true) : 
        //     this.templateHTMLList[key]['updated'];//.innerHTML; // I don't know that this will really be all that useful to clone and only send the innerHTML seems like cloning is pointless...
        // }

        // let container = document.createElement('div');
        // if (this.isElement(value)) {
        //     container.appendChild(value);
        // } else if (this.isHTMLCollection(value)) {
        //     container.replaceChildren(...value)
        // } else {
        //     container.innerHTML = value;
        // }
        // if (this.templateHTMLList[key]['original'] === undefined) {
        //     this.templateHTMLList[key]['original'] = container;
        // }
        
        // if (this.templateHTMLList[key]['updated'] === undefined) {
        //     this.templateHTMLList[key]['updated'] = container.cloneNode(true);
        // } else {
        //     this.templateHTMLList[key]['updated'].replaceChildren(...container.children); // this is important so that we always keep the same nod as that will be the reference
        // }
        // return this.templateHTML(key); // This just executes the first line of this function so I don't have to repeat it...
    }

    redirect(path) {
        if (!this.views.hasOwnProperty(path)) return false;

        const url = new URL(window.location.href);
        url.searchParams.set('view', path);
        window.history.replaceState(null, null, url); // or pushState

        this.loadView();
        // window.location.href = `index.html?view=${path}`;
    }

    isElement = (obj) => {
        try {
            //Using W3 DOM2 (works for FF, Opera and Chrome)
            return obj instanceof HTMLElement;
        }
        catch(e){
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have (works on IE7)
            return (typeof obj==="object") &&
                (obj.nodeType===1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument ==="object");
        }
    }
    
    isHTMLCollection = (obj) => {
        try {
            //Using W3 DOM2 (works for FF, Opera and Chrome)
            return obj instanceof HTMLCollection;
        }
        catch(e){
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have (works on IE7)
            // return (typeof obj==="object") &&
            //     (obj.nodeType===1) && (typeof obj.style === "object") &&
            //     (typeof obj.ownerDocument ==="object");
            return false
        }
        
    }

    navbarSettings = {
        dropdownOpen: true,
        hasNavbar: false
    }

    loadNavbar = () => {
        let parent = document.querySelector('body');
        if (parent.querySelector('#navbar')) return // There is already a header.
        let navbar = document.createElement('div');
        navbar.id='navbar';
        navbar.innerHTML =`
                <ul class="nav-links">
                    <li><a href="index.html?view=editProfile">Edit</a></li>
                    <li><a href="index.html?view=dashboard">Dashboard</a></li>
                    <li><a class="btn btn-secondary logout-btn">Logout</a></li>
                </ul>
                <span class="toggle-nav">&#9776;</span>
        `;
        let firstChild = parent.firstElementChild
        navbar.querySelector('.logout-btn').addEventListener('click', async () => {
            await API.send('logout');
            // navbar.remove();
            document.querySelector('header').remove();
            viewManager.redirect('login');
        })
        if (firstChild.tagName === 'HEADER') {
            firstChild.appendChild(navbar);
        } else {
        let header = document.createElement('header');
            header.appendChild(navbar);
            parent.insertBefore(header, firstChild);
        }
    }
}




function insertHeaderNav(parentElement) {
    let parent = document.querySelector(parentElement);
    if (parent.querySelector('#navbar')) return // There is already a header.
    let navbar = document.createElement('div');
    navbar.id='navbar';
    navbar.innerHTML =`
                <ul class="nav-links">
                    <li><a href="index.html?view=editProfile">Edit</a></li>
                    <li><a href="index.html?view=dashboard">Dashboard</a></li>
                    <li><button class="btn btn-secondary logout-btn">Logout</button></li>
                </ul>
                <span class="toggle-nav">&#9776;</span>
        `;
    
    let firstChild = parent.firstElementChild
    navbar.querySelector('.logout-btn').addEventListener('click', async () => {
        await API.send('logout');
        // navbar.remove();
        document.querySelector('header').remove();
        viewManager.redirect('login');
    })
    if (firstChild.tagName === 'HEADER') {
        firstChild.appendChild(navbar);
    } else {
    let header = document.createElement('header');
        header.appendChild(navbar);
        parent.insertBefore(header, firstChild);
    }
};