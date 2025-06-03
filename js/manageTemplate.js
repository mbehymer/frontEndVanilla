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
                let body = document.querySelector('body');
                body.innerHTML = file;
                this.view().run();
            })
        } catch (err) {
            console.error('loadView:', this.view(), 'Error:', err);
        }
    }

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

   
    redirect(path) {
        if (!this.views.hasOwnProperty(path)) return false;

        const url = new URL(window.location.href);
        url.searchParams.set('view', path);
        window.history.replaceState(null, null, url); // or pushState

        this.loadView();
        // window.location.href = `index.html?view=${path}`;
    }

}