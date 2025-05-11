

function quickMessage(message, timer={time:5000, enabled:true}) {
    let body = document.querySelector('body');
    let msgContainer = document.createElement('div');
    msgContainer.innerHTML = `<div class='q-msg-close-container'><span class='q-msg-close'>&#10006;</span></div>
            <p class='q-msg'>${message}</p>
        `;
    msgContainer.classList.add('q-msg-container');
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

function openModal(settings={onOkay: ()=>{}, bodyHtml: '', headerName: ''}) {
    let body = document.querySelector('body');
    let modalBackdrop = document.createElement('div');
    modalBackdrop.classList.add('modal-backdrop');
    let modalContainer = document.createElement('div');
    modalContainer.classList.add('modal-container');
    modalContainer.innerHTML =  `
        <div class='modal-header'><h2>${settings.headerName}</h2></div>
        <div class='modal-body'></div>
        <div class='modal-footer'><button class='btn btn-primary modal-btn-ok'>OK</button><button class='btn btn-cancel modal-btn-cancel'>Close</div>
    `;
    
    modalContainer.querySelector('.modal-body').appendChild(settings.bodyHtml);
    // modalContainer.querySelector('.modal-body').replaceChildren(...settings.bodyHtml/*.children*/);
    modalContainer.querySelector('.modal-btn-cancel').addEventListener('click', ()=>{ modalBackdrop.remove() });
    modalContainer.querySelector('.modal-btn-ok').addEventListener('click', ()=>{ 
        settings.onOkay();
        modalBackdrop.remove();
    }
    );
    
    modalBackdrop.appendChild(modalContainer);
    body.appendChild(modalBackdrop);
    
}
