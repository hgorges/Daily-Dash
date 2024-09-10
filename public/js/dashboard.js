const apodHeading = document.querySelector('#apod-heading');
const apodTitle = document.querySelector('#apod-title');
const apodLink = document.querySelector('#apod-link');
const apodWidget = document.querySelector('#apod-widget');
const temperatureRange = document.querySelector('#temperature-range');

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

temperatureRange.addEventListener('click', function () {
    fetch('/switch-location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((_response) => {
            // TODO Manipulate the DOM without reloading the page
            window.location.reload();
        })
        .catch((error) => {
            console.error(error);
        });
});

function completeTodo() {
    const todoItems = document.querySelectorAll('.todo-item');

    todoItems.forEach((item) => {
        item.setAttribute('draggable', true);

        item.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', item.id);
        });

        item.addEventListener('dragend', function (e) {
            e.target.classList.remove('dragging');
        });
    });

    const completedZone = document.getElementById('completed-zone');
    completedZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        completedZone.classList.add('drag-over');
    });

    completedZone.addEventListener('dragleave', () => {
        completedZone.classList.remove('drag-over');
    });

    completedZone.addEventListener('drop', function (e) {
        e.preventDefault();
        completedZone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        fetch(`/todos/${id}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((_response) => {
                const item = document.getElementById(id);
                item.style.display = 'none';
            })
            .catch((error) => {
                console.error(error);
            });
    });

    const postponedZone = document.getElementById('postponed-zone');
    postponedZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        postponedZone.classList.add('drag-over');
    });

    postponedZone.addEventListener('dragleave', () => {
        postponedZone.classList.remove('drag-over');
    });

    postponedZone.addEventListener('drop', function (e) {
        e.preventDefault();
        postponedZone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        fetch(`/todos/${id}/postpone`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((_response) => {
                const item = document.getElementById(id);
                item.style.display = 'none';
            })
            .catch((error) => {
                console.error(error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Trigger resize event to set initial height of APOD link
    window.dispatchEvent(new Event('resize'));

    completeTodo();
});
