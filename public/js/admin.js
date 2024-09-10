document.addEventListener('DOMContentLoaded', () => {
    const approveButtons = document.getElementsByClassName('approve-button');
    Array.from(approveButtons).forEach((approveButton) => {
        approveButton.addEventListener('click', async (event) => {
            try {
                await fetch(
                    `/admin/approve-user/${event.target.dataset.userId}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'CSRF-Token': document
                                .querySelector('meta[name="csrf-token"]')
                                .getAttribute('content'),
                        },
                    },
                );
                window.location.reload();
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });

    const lockButtons = document.getElementsByClassName('lock-button');
    Array.from(lockButtons).forEach((lockButton) => {
        lockButton.addEventListener('click', async (event) => {
            try {
                await fetch(`/admin/lock-user/${event.target.dataset.userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': document
                            .querySelector('meta[name="csrf-token"]')
                            .getAttribute('content'),
                    },
                });
                window.location.reload();
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});
