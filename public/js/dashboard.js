const apodHeading = document.querySelector('#apod-heading');
const apodTitle = document.querySelector('#apod-title');
const apodLink = document.querySelector('#apod-link');
const apodWidget = document.querySelector('#apod-widget');

function apodWidgetClickHandler() {
    const newHeight =
        apodWidget.offsetHeight -
        parseFloat(getComputedStyle(apodWidget).paddingTop) -
        parseFloat(getComputedStyle(apodWidget).paddingBottom) -
        parseFloat(getComputedStyle(apodHeading).height) -
        parseFloat(getComputedStyle(apodHeading).paddingTop) -
        parseFloat(getComputedStyle(apodHeading).paddingBottom) -
        parseFloat(getComputedStyle(apodHeading).marginTop) -
        parseFloat(getComputedStyle(apodHeading).marginBottom) -
        parseFloat(getComputedStyle(apodTitle).height) -
        parseFloat(getComputedStyle(apodTitle).paddingTop) -
        parseFloat(getComputedStyle(apodTitle).paddingBottom) -
        parseFloat(getComputedStyle(apodTitle).marginTop) -
        parseFloat(getComputedStyle(apodTitle).marginBottom);
    apodLink.style.height = newHeight + 'px';
}

window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
        apodWidgetClickHandler();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Trigger resize event to set initial height of APOD link
    window.dispatchEvent(new Event('resize'));
});
