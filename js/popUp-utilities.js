

function quickMessage(message, timer={time:5000, enabled:true}, type) {
    let msgType = type === 'error' ? 'q-msg-error' : type === 'warning' ? 'q-msg-warning' : 'q-msg-ok' 
    let body = document.querySelector('body');
    let msgContainer = document.createElement('div');
    msgContainer.innerHTML = `<div class='q-msg-close-container'><span class='q-msg-close'>&#10006;</span></div>
            <p class='q-msg'>${message}</p>
        `;
    msgContainer.classList.add('q-msg-container');
    msgContainer.classList.add(msgType);
    const id = 'q-msg-'+crypto.randomUUID();
    msgContainer.classList.add(id);
    let closeBtn = msgContainer.querySelector('.q-msg-close');
    closeBtn.addEventListener('click', (e)=> {
        msgContainer.remove();
    })
    body.appendChild(msgContainer);
    //If the timer reaches the time specified, remove the element from the document
    //If there is a specified time run this code
    if (timer.enabled) {
        setTimeout(() =>{
            msgContainer.remove()
        },
        timer.time);
    }
};

function openModal(settings={ bodyHtml: '', headerName: '', footerSettings: { buttons: [{ label: 'Ok', action: ()=>{}, canClose: true, classes: ['btn', 'btn-primary'], includeIf: true},{ label: 'Close', action: ()=>{}, canClose: true, classes: ['btn', 'btn-secondary'], includeIf: true}]}}) {
    let body = document.querySelector('body');
    let modalBackdrop = document.createElement('div');
    modalBackdrop.classList.add('modal-backdrop');
    let modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    modalContainer.innerHTML =  `
        <div class='modal-header'><h2>${settings.headerName}</h2></div>
        <div class='modal-body'></div>
        <div class='modal-footer'></div>
    `;
    
    let footer = modalContainer.querySelector('.modal-footer');

    settings.footerSettings.buttons
    .filter(button => button.includeIf) // Verify if the button should be visible. For example, maybe it should only show if someone has the right authorization
    .forEach(button => {
        let btnElement = document.createElement('button');
        btnElement.classList.add(...button.classes);
        btnElement.innerText = button.label;
        btnElement.addEventListener('click', (e)=> {
            button.action();
            if (button.canClose) modalBackdrop.remove();
            console.log('This is still running');

        });
        footer.appendChild(btnElement);
    });

    modalContainer.querySelector('.modal-body').appendChild(settings.bodyHtml);
    modalBackdrop.appendChild(modalContainer);
    body.appendChild(modalBackdrop);
    // modalContainer.querySelector('.modal-body').replaceChildren(...settings.bodyHtml/*.children*/);
    // modalContainer.querySelector('.modal-btn-cancel').addEventListener('click', ()=>{ modalBackdrop.remove() });
    // modalContainer.querySelector('.modal-btn-ok').addEventListener('click', ()=>{ 
    //     settings.onOkay();
    //     modalBackdrop.remove();
    // }
    // );
    
    
}
