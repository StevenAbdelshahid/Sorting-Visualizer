document.addEventListener('DOMContentLoaded', function () {
    const algorithmItems = document.querySelectorAll('.algorithm-item');

    algorithmItems.forEach(item => {
        item.addEventListener('click', function () {
            const info = this.querySelector('.algo-info');
            if (info.classList.contains('hidden')) {
                info.classList.remove('hidden');
            } else {
                info.classList.add('hidden');
            }
        });
    });
});
