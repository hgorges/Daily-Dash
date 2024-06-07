const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const pageContent = document.querySelector("#page-content");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
    backdrop.style.display = "none";
    sideDrawer.classList.remove("open");
    pageContent.classList.remove("background");
}

function menuToggleClickHandler() {
    backdrop.style.display = "block";
    sideDrawer.classList.add("open");
    pageContent.classList.add("background");
}

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);

// Close side drawer when window is resized
window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) {
        backdropClickHandler();
    }
});
