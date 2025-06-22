function processProfileForm() {
    
    let firstName = document.querySelector('#firstName').value;
    let lastName = document.querySelector('#lastName').value;
    


    API.send('updateUserInfo', {firstName, lastName}).then(res => {
        if (res.ok) {
            quickMessage('Submission Successful', {time: 5000, enabled: true});
        } else {
            quickMessage('Submission Unsuccessful', {time: 5000, enabled: true}, 'error');
        }
    })
}

function populateForm(user) {
    if (user) {
        let firstName = document.querySelector('#firstName');
        let lastName = document.querySelector('#lastName');

        firstName.value = user.firstName;
        lastName.value = user.lastName;
    }
}



function editProfileCtrl() {
    insertHeaderNav('body');
    API.send('grabRefreshToken')
    .then(response => {
        if (response.ok) {
            return API.send('getUserInfo');

        } else {
           
            viewManager.redirect('login');
            quickMessage(response.msg, {time: 5000, enabled: true}, 'error');
        }
    })
    .then(res=> {
        if (res.ok) {
            // let form = new Form({
            //     "settings": {

            //     },
            //     "displayOrder": 0,
            //     "items": [
            //         {
            //             "displayOrder": 1,
            //             "objType": "container",
            //             "items": [
            //                 {
            //                     "displayOrder": 1,
            //                     "id": "firstName",
            //                     "label": "First Name",
            //                     "valueType": "text",
            //                     "objType": "field",
            //                     "type": "input",
            //                     "objDepth": 2
            //                 },
            //                 {
            //                     "displayOrder": 2,
            //                     "id": "lastName",
            //                     "label": "Last Name",
            //                     "valueType": "text",
            //                     "objType": "field",
            //                     "type": "input",
            //                     "objDepth": 2
            //                 }
            //             ],
            //             "objDepth": 1
            //         },
            //         {
            //             "displayOrder": 2,
            //             "objType": "container",
            //             "items": [
            //                 {
            //                     "displayOrder": 1,
            //                     "id": "favoriteColor",
            //                     "label": "Favorite Color",
            //                     "valueType": "text",
            //                     "objType": "field",
            //                     "type": "input",
            //                     "objDepth": 2
            //                 },
            //                 {
            //                     "displayOrder": 2,
            //                     "id": "phoneNumber",
            //                     "label": "Phone Number",
            //                     "valueType": "tel",
            //                     "objType": "field",
            //                     "type": "input",
            //                     "objDepth": 2
            //                 }
            //             ],
            //             "objDepth": 1
            //         },
            //         {
            //             "displayOrder": 3,
            //             "id": "note",
            //             "label": "Notes",
            //             "valueType": "text",
            //             "objType": "field",
            //             "type": "textarea",
            //             "objDepth": 2
            //         },
                    
            //         {
            //             "displayOrder": 4,
            //             "id": "submit",
            //             "label": "Submit",
            //             "valueType": "submit",
            //             "objType": "button",
            //             "type": "button",
            //             "objDepth": 2
            //         },
            //     ],
            //     "objType": "container",
            //     "objDepth": 0
            // }, 'object');
            
            let form = new Form();
            form.loadAvailableFunctions(...[{parent: API, func: API.send}]);
            form.getFormHTML('forms/userInfo.json', 'file').then(res => {
                if (res.ok) {
                    document.querySelector('#info-form').replaceChildren(...[form.formHTML]);
                }
            });
            console.log('form', form);
            // populateForm(API.settings.get('user'));
        }
    })
    .catch(err => {
        console.error('Error', err);
        quickMessage(err, {time: 5000, enabled: true}, 'error');
    });
}