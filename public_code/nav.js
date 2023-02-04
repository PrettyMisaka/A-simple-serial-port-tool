let navBtn = document.getElementById('nav-end');
let nav_isMaximize = false;
const img_url = ['../nav_icon/minimize-2.svg', '../nav_icon/maximize-2.svg']

window.userWinManagement.windowIsMaximize((event, IsMaximize) => {
    nav_isMaximize = IsMaximize;
    if (nav_isMaximize) {
        navBtn.children[1].innerHTML = "";
    } else {
        navBtn.children[1].innerHTML = "";
    }
})

navBtn.children[0].addEventListener('click', () => {
    window.userWinManagement.minimizeWindows(0);
})
navBtn.children[1].addEventListener('click', () => {

    window.userWinManagement.minimizeWindows(1);
})
navBtn.children[2].addEventListener('click', () => {
    window.userWinManagement.minimizeWindows(2);
})