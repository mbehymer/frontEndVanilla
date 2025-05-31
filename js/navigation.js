function insertHeaderNav(parentElement) {
    let parent = document.querySelector(parentElement);
    let navbar = document.createElement('div');
    navbar.id='navbar';
    navbar.innerHTML =`
                <ul>
                    <li><a href="index.html?view=dashboard">Dashboard</a></li>
                    <li><button class="btn btn-secondary logout-btn">Logout</button></li>
                </ul>
        `;
    
    let firstChild = parent.firstElementChild
    navbar.querySelector('.logout-btn').addEventListener('click', async () => {
        await API.send('logout');
       
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