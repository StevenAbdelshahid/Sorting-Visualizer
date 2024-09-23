// Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const acc = document.getElementsByClassName('accordion');

    for (let i = 0; i < acc.length; i++) {
        acc[i].addEventListener('click', function() {
            // Toggle 'active' class on the clicked header
            this.classList.toggle('active');

            // Get the next sibling, which should be the 'algo-info' div
            const panel = this.nextElementSibling;

            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        });
    }
});

// Function to go back to the main page
function goBack() {
    window.location.href = 'index.html';
}
