function manageView() {
    const views = {
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
        }
    }

    function loadView(view) {
        try {
            fetch(view.template).then(res => {
                return res.text();
            })
            .then(file => {
                let body = document.querySelector('body');
                body.innerHTML = file;
                view.run();
            })
        } catch (err) {
            console.error('loadView:', view, 'Error:', err);
        }
    }

    let params = () => { return location.search.replace('?','').split('&').map(search => {
            let pair = search.split('=');
            let key = pair[0];
            let value = pair[1];
            return { key, value }
        });
    }; // Probably could use Object.assign({}) here to make this into an object...


    let view = params().filter(param => param.key === 'view')[0];
    loadView(views[view.value]);
}