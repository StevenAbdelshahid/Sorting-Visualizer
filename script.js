const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let data = [];
let delay = 50;
let sortingInProgress = false;
let isPaused = false;
let shouldCancelSort = false;
let currentSortButton = null;

// Initialize random data
function reshuffleData(size) {
    data = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    drawData();
    shouldCancelSort = true; // Cancel any ongoing sort
    sortingInProgress = false;
    if (currentSortButton) {
        currentSortButton.classList.remove('selected');
        currentSortButton = null;
    }
}

// Draw the bars on the canvas with sort-specific markers
function drawData(options = {}) {
    const {
        pivotIndex = -1,
        currentIndices = [],
        comparingIndices = [],
        swappingIndices = [],
        sortedIndices = [],
    } = options;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / data.length;

    data.forEach((value, index) => {
        const barHeight = (value / 100) * canvas.height;

        // Determine the color based on the indices
        if (swappingIndices.includes(index)) {
            ctx.fillStyle = '#3498db'; // Blue for swapping
        } else if (currentIndices.includes(index)) {
            ctx.fillStyle = '#e67e22'; // Orange
        } else if (comparingIndices.includes(index)) {
            ctx.fillStyle = '#e74c3c'; // Red
        } else if (index === pivotIndex) {
            ctx.fillStyle = '#9b59b6'; // Purple
        } else if (sortedIndices.includes(index)) {
            ctx.fillStyle = '#2ecc71'; // Green
        } else {
            ctx.fillStyle = '#ecf0f1'; // White
        }

        ctx.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
    });
}

// Helper function to delay sorting for visualization
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to pause and resume sorting
function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById("pause-btn");
    pauseBtn.innerHTML = isPaused ? "&#x25B6;" : "&#x23F8;";
    pauseBtn.style.backgroundColor = isPaused ? "#7AC5F2" : "#87CEFA";
}

// Check if we are paused, if so, wait until unpaused
async function checkPaused() {
    while (isPaused) {
        await sleep(50);
    }
}

// Function to cancel the current sorting process
function cancelCurrentSort() {
    shouldCancelSort = true;
    isPaused = false;
    sortingInProgress = false;
    if (currentSortButton) {
        currentSortButton.classList.remove('selected');
        currentSortButton = null;
    }
}

// Selection Sort
async function selectionSort() {
    let n = data.length;
    for (let i = 0; i < n - 1; i++) {
        if (shouldCancelSort) return;
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
            if (shouldCancelSort) return;
            await checkPaused();

            drawData({
                currentIndices: [min_idx],
                comparingIndices: [j],
            });
            await sleep(delay);

            if (data[j] < data[min_idx]) {
                min_idx = j;

                drawData({
                    currentIndices: [min_idx],
                    comparingIndices: [j],
                });
                await sleep(delay);
            }
        }

        if (min_idx !== i) {
            [data[i], data[min_idx]] = [data[min_idx], data[i]];

            drawData({
                swappingIndices: [i, min_idx],
            });
            await sleep(delay);
        }
    }
    // Mark all as sorted after completion
    drawData({ sortedIndices: [...Array(data.length).keys()] });
}

// Quick Sort
async function quickSort(low, high) {
    if (shouldCancelSort) return;
    if (low < high) {
        let pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    } else if (low >= 0 && high >= 0 && low < data.length && high < data.length) {
        drawData({
            sortedIndices: [...Array(data.length).keys()],
        });
    }
}

async function partition(low, high) {
    if (shouldCancelSort) return low;
    let pivot = data[high];
    let i = low - 1;

    for (let j = low; j <= high - 1; j++) {
        if (shouldCancelSort) return low;
        await checkPaused();

        drawData({
            pivotIndex: high,
            comparingIndices: [j],
        });
        await sleep(delay);

        if (data[j] < pivot) {
            i++;
            [data[i], data[j]] = [data[j], data[i]];

            drawData({
                swappingIndices: [i, j],
                pivotIndex: high,
            });
            await sleep(delay);
        }
    }

    [data[i + 1], data[high]] = [data[high], data[i + 1]];

    drawData({
        swappingIndices: [i + 1, high],
    });
    await sleep(delay);

    return i + 1;
}

// Bubble Sort
async function bubbleSort() {
    let n = data.length;
    for (let i = 0; i < n - 1; i++) {
        if (shouldCancelSort) return;
        for (let j = 0; j < n - i - 1; j++) {
            if (shouldCancelSort) return;
            await checkPaused();

            drawData({
                comparingIndices: [j, j + 1],
            });
            await sleep(delay);

            if (data[j] > data[j + 1]) {
                [data[j], data[j + 1]] = [data[j + 1], data[j]];

                drawData({
                    swappingIndices: [j, j + 1],
                });
                await sleep(delay);
            }
        }
    }
    // Mark all as sorted after completion
    drawData({ sortedIndices: [...Array(data.length).keys()] });
}

// Insertion Sort
async function insertionSort() {
    let n = data.length;
    for (let i = 1; i < n; i++) {
        if (shouldCancelSort) return;
        let key = data[i];
        let j = i - 1;

        while (j >= 0 && data[j] > key) {
            if (shouldCancelSort) return;
            await checkPaused();

            data[j + 1] = data[j];

            drawData({
                currentIndices: [j + 1],
                comparingIndices: [j],
            });
            await sleep(delay);
            j--;
        }
        data[j + 1] = key;

        drawData({
            currentIndices: [j + 1],
        });
        await sleep(delay);
    }
    // Mark all as sorted after completion
    drawData({ sortedIndices: [...Array(data.length).keys()] });
}

// Merge Sort
async function mergeSort(start, end) {
    if (shouldCancelSort) return;
    if (start >= end) {
        return;
    }

    const mid = Math.floor((start + end) / 2);
    await mergeSort(start, mid);
    await mergeSort(mid + 1, end);
    await merge(start, mid, end);

    if (start === 0 && end === data.length - 1) {
        // Mark all as sorted after completion
        drawData({ sortedIndices: [...Array(data.length).keys()] });
    }
}

async function merge(start, mid, end) {
    if (shouldCancelSort) return;
    let left = data.slice(start, mid + 1);
    let right = data.slice(mid + 1, end + 1);
    let i = 0, j = 0, k = start;

    while (i < left.length && j < right.length) {
        if (shouldCancelSort) return;
        await checkPaused();

        if (left[i] <= right[j]) {
            data[k] = left[i];
            i++;
        } else {
            data[k] = right[j];
            j++;
        }

        drawData({
            currentIndices: [k],
        });
        await sleep(delay);
        k++;
    }

    while (i < left.length) {
        if (shouldCancelSort) return;
        await checkPaused();

        data[k] = left[i];
        drawData({
            currentIndices: [k],
        });
        await sleep(delay);
        i++;
        k++;
    }

    while (j < right.length) {
        if (shouldCancelSort) return;
        await checkPaused();

        data[k] = right[j];
        drawData({
            currentIndices: [k],
        });
        await sleep(delay);
        j++;
        k++;
    }
}

// Heap Sort
async function heapSort() {
    let n = data.length;

    // Build heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (shouldCancelSort) return;
        await heapify(n, i);
    }

    // One by one extract elements
    for (let i = n - 1; i >= 0; i--) {
        if (shouldCancelSort) return;
        await checkPaused();

        [data[0], data[i]] = [data[i], data[0]];

        drawData({
            swappingIndices: [0, i],
        });
        await sleep(delay);

        await heapify(i, 0);
    }

    // Mark all as sorted after completion
    drawData({ sortedIndices: [...Array(data.length).keys()] });
}

async function heapify(n, i) {
    if (shouldCancelSort) return;
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < n && data[left] > data[largest]) {
        largest = left;
    }

    if (right < n && data[right] > data[largest]) {
        largest = right;
    }

    if (largest !== i) {
        [data[i], data[largest]] = [data[largest], data[i]];

        drawData({
            swappingIndices: [i, largest],
        });
        await sleep(delay);

        await heapify(n, largest);
    }
}

// Shell Sort
async function shellSort() {
    let n = data.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            if (shouldCancelSort) return;
            await checkPaused();

            let temp = data[i];
            let j;
            for (j = i; j >= gap && data[j - gap] > temp; j -= gap) {
                if (shouldCancelSort) return;
                await checkPaused();

                data[j] = data[j - gap];

                drawData({
                    currentIndices: [j],
                    comparingIndices: [j - gap],
                });
                await sleep(delay);
            }
            data[j] = temp;

            drawData({
                currentIndices: [j],
            });
            await sleep(delay);
        }
    }
    // Mark all as sorted after completion
    drawData({ sortedIndices: [...Array(data.length).keys()] });
}

// Function to start sorting
async function startSort(type) {
    if (sortingInProgress) {
        // Cancel current sort and wait for it to finish
        shouldCancelSort = true;
        while (sortingInProgress) {
            await sleep(50);
        }
    }

    reshuffleData(50);
    await sleep(100); // Wait for reshuffle to complete

    shouldCancelSort = false;
    isPaused = false;

    // Update button styles
    if (currentSortButton) {
        currentSortButton.classList.remove('selected');
    }
    currentSortButton = document.getElementById(`${type}-btn`);
    currentSortButton.classList.add('selected');

    sortingInProgress = true;

    try {
        switch (type) {
            case 'selection':
                await selectionSort();
                break;
            case 'quick':
                await quickSort(0, data.length - 1);
                break;
            case 'merge':
                await mergeSort(0, data.length - 1);
                break;
            case 'bubble':
                await bubbleSort();
                break;
            case 'insertion':
                await insertionSort();
                break;
            case 'heap':
                await heapSort();
                break;
            case 'shell':
                await shellSort();
                break;
            default:
                break;
        }
    } catch (e) {
        // Handle any exceptions if necessary
    }

    sortingInProgress = false;

    // Reset button style after sorting
    if (currentSortButton) {
        currentSortButton.classList.remove('selected');
        currentSortButton = null;
    }
}

// Initialize the visualizer with random data
reshuffleData(50);
drawData();

// Add speed control display
const speedSlider = document.getElementById('speed');
const speedDisplay = document.getElementById('speed-display');

speedSlider.oninput = function () {
    delay = 101 - this.value;
    speedDisplay.textContent = this.value;
};


// Function to toggle the info section
function toggleInfo() {
    const infoSection = document.getElementById('info-section');
    infoSection.classList.toggle('hidden');
}