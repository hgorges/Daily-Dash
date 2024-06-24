const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const pageContent = document.querySelector('#page-content');
const menuToggle = document.querySelector('#side-menu-toggle');

function hideBackdrop() {
    if (backdrop && sideDrawer && pageContent) {
        backdrop.style.display = 'none';
        sideDrawer.classList.remove('open');
        pageContent.classList.remove('background');
    }
}

function showBackdrop() {
    if (backdrop && sideDrawer && pageContent) {
        backdrop.style.display = 'block';
        sideDrawer.classList.add('open');
        pageContent.classList.add('background');
    }
}

function menuToggleClickHandler() {
    if (sideDrawer.classList.contains('open')) {
        hideBackdrop();
    } else {
        showBackdrop();
    }
}

if (backdrop) {
    backdrop.addEventListener('click', hideBackdrop);
}

if (menuToggle) {
    menuToggle.addEventListener('click', menuToggleClickHandler);
}

window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
        hideBackdrop();
    }
});

// Custom area
const dashboardWidgets = document.querySelector('#widgets');
if (dashboardWidgets) {
    dashboardWidgets.addEventListener('click', hideBackdrop);
}
