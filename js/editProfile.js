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

function populateForm(data) {
    if (data.user) {
        let firstName = document.querySelector('#firstName');
        let lastName = document.querySelector('#lastName');

        firstName.value = data.user.firstName;
        lastName.value = data.user.lastName;
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
            populateForm(API.settings);
        }
    })
    .catch(err => {
        console.error('Error', err);
        quickMessage(err, {time: 5000, enabled: true}, 'error');
    });
}