// Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const acc = document.getElementsByClassName('accordion');

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', function() {
            this.classList.toggle('active');
            const panel = this.nextElementSibling;

            if (panel.style.display === 'block') {
                panel.style.display = 'none';
            } else {
                panel.style.display = 'block';
            }
        });
    }
});

// Function to go back to the main page
function goBack() {
    window.location.href = 'index.html';
}
