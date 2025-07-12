const VIEW_CONSTANTS = {

}


class ViewManager {

    constructor () {
        
    }

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

    isMobile() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera,'http://detectmobilebrowser.com/mobile');
        return check;
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
            return obj instanceof HTMLCollection;
        }
        catch(e){
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
                <ul class="nav-links slide-up">
                    <li><a href="?view=editProfile">Edit</a></li>
                    <li><a href="?view=dashboard">Dashboard</a></li>
                    <li><a class="btn btn-secondary logout-btn">Logout</a></li>
                </ul>
                <div class="toggle-nav"><span>&#9776;</span></div>
        `;
        let firstChild = parent.firstElementChild;
        let navLinks = navbar.querySelector('.nav-links');
        let dropDownBtn = navbar.querySelector('.toggle-nav span');
        // navLinks.addEventListener('transitionend', (event) => {
        //     if ([...event.target.classList].includes('slide-up')) {
        //         console.log('end-before', navLinks.classList);
        //         navLinks.classList.add('hide');
        //         console.log('end-after', navLinks.classList);
        //     }
        // });
        // navLinks.addEventListener('transitionstart', (event) => {
        //     if (![...event.target.classList].includes('slide-up')) {
        //         console.log('start-before', navLinks.classList);
        //         navLinks.classList.remove('hide');
        //         console.log('start-after', navLinks.classList);
        //     }
        // });
        dropDownBtn.addEventListener('click', (e) => {
            if (!this.isMobile() && window.innerWidth > 412) return;

            if ([...navLinks.classList].includes('slide-up')) navLinks.classList.remove('hide');
            navLinks.classList.toggle('slide-up');

            // navLinks.classList.toggle('hide');
            e.target.classList.toggle('active');
        });

        navbar.querySelector('.logout-btn').addEventListener('click', async () => {
            await API.send('logout');
            // navbar.remove();
            document.querySelector('header').remove();
            viewManager.redirect('login');
        });

        if (firstChild.tagName === 'HEADER') {
            firstChild.appendChild(navbar);
        } else {
            let header = document.createElement('header');
            header.appendChild(navbar);
            parent.insertBefore(header, firstChild);
        }
    }
}




// function insertHeaderNav(parentElement) {
//     let parent = document.querySelector(parentElement);
//     if (parent.querySelector('#navbar')) return // There is already a header.
//     let navbar = document.createElement('div');
//     navbar.id='navbar';
//     navbar.innerHTML =`
//                 <ul class="nav-links">
//                     <li><a href="index.html?view=editProfile">Edit</a></li>
//                     <li><a href="index.html?view=dashboard">Dashboard</a></li>
//                     <li><button class="btn btn-secondary logout-btn">Logout</button></li>
//                 </ul>
//                 <span class="toggle-nav">&#9776;</span>
//         `;
    
//     let firstChild = parent.firstElementChild
//     navbar.querySelector('.logout-btn').addEventListener('click', async () => {
//         await API.send('logout');
//         // navbar.remove();
//         document.querySelector('header').remove();
//         viewManager.redirect('login');
//     })
//     if (firstChild.tagName === 'HEADER') {
//         firstChild.appendChild(navbar);
//     } else {
//     let header = document.createElement('header');
//         header.appendChild(navbar);
//         parent.insertBefore(header, firstChild);
//     }
// };