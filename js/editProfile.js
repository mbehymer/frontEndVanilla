function processProfileForm() {
    
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
    .catch(err => {
        console.error('Error', err);
        quickMessage(err, {time: 5000, enabled: true}, 'error');
    });
}