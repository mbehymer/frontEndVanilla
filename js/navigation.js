function insertHeaderNav(parentElement) {
    let parent = document.querySelector(parentElement);
    let navbar = `
            <div id="navbar">
                <ul>
                    <li>Dashboard</li>
                    <li><button class="btn btn-secondary" onclick="logout()" >Logout</button></li>
                </ul>
            </div>
        `;
    let firstChild = parent.firstChild
    if (firstChild.tagName === 'HEADER') {
        firstChild.innerHTML = navbar;
    } else {
    let header = document.createElement('header');
        header.innerHTML = navbar;
        parent.insertBefore(header, firstChild);
    }
};