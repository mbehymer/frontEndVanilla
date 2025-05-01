let loader = {

    start: function() {
        let body = document.querySelector('body');
        let loadContainer = document.querySelector('div');
        loadContainer.innerHTML = `
        <div class="spinner">
        </div>
        `;
        loadContainer.classList.add('load-container');
        return loadContainer;
    },
    end: function() {
        return document.querySelector('.load-container').remove();
    }
}



// function insert(parentElement) {
//     let parent = document.querySelector(parentElement);
//     let navbar = `
//             <div id="navbar">
//                 <ul>
//                     <li>Dashboard</li>
//                     <li><button class="btn btn-secondary" onclick="logout()" >Logout</button></li>
//                 </ul>
//             </div>
//         `;
//     let firstChild = parent.firstChild
//     if (firstChild.tagName === 'HEADER') {
//         firstChild.innerHTML = navbar;
//     } else {
//     let header = document.createElement('header');
//         header.innerHTML = navbar;
//         parent.insertBefore(header, firstChild);
//     }
// };