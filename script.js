// script.js

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let data = [];
let delay = 50;
let arraySize = 50;
let sortingInProgress = false;
let isPaused = false;
let shouldCancelSort = false;
let currentSortButton = null;

// Initialize random data
function reshuffleData() {
    data = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
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

// Sorting algorithms implementations

// Selection Sort
async function selectionSort(arr) {
    let n = arr.length;

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

            if (arr[j] < arr[min_idx]) {
                min_idx = j;
                drawData({
                    currentIndices: [min_idx],
                    comparingIndices: [j],
                });
                await sleep(delay);
            }
        }

        if (min_idx !== i) {
            [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
            data[i] = arr[i];
            data[min_idx] = arr[min_idx];
            drawData({
                swappingIndices: [i, min_idx],
            });
            await sleep(delay);
        }
    }
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Insertion Sort
async function insertionSort(arr) {
    let n = arr.length;

    for (let i = 1; i < n; i++) {
        if (shouldCancelSort) return;
        let key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j] > key) {
            if (shouldCancelSort) return;
            await checkPaused();

            arr[j + 1] = arr[j];
            data[j + 1] = arr[j + 1];

            drawData({
                currentIndices: [j + 1],
                comparingIndices: [j],
            });
            await sleep(delay);
            j--;
        }
        arr[j + 1] = key;
        data[j + 1] = key;

        drawData({
            currentIndices: [j + 1],
        });
        await sleep(delay);
    }
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Bubble Sort
async function bubbleSort(arr) {
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        if (shouldCancelSort) return;
        for (let j = 0; j < n - i - 1; j++) {
            if (shouldCancelSort) return;
            await checkPaused();

            drawData({
                comparingIndices: [j, j + 1],
            });
            await sleep(delay);

            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                data[j] = arr[j];
                data[j + 1] = arr[j + 1];

                drawData({
                    swappingIndices: [j, j + 1],
                });
                await sleep(delay);
            }
        }
    }
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Shell Sort
async function shellSort(arr) {
    let n = arr.length;

    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        if (shouldCancelSort) return;
        for (let i = gap; i < n; i++) {
            if (shouldCancelSort) return;
            await checkPaused();

            let temp = arr[i];
            let j = i;

            while (j >= gap && arr[j - gap] > temp) {
                if (shouldCancelSort) return;
                await checkPaused();

                arr[j] = arr[j - gap];
                data[j] = arr[j];
                drawData({
                    currentIndices: [j],
                    comparingIndices: [j - gap],
                });
                await sleep(delay);
                j -= gap;
            }
            arr[j] = temp;
            data[j] = arr[j];
            drawData({
                currentIndices: [j],
            });
            await sleep(delay);
        }
    }
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Merge Sort
async function mergeSort(arr) {
    async function mergeSortHelper(arr, l, r) {
        if (shouldCancelSort) return;
        if (l >= r) {
            return;
        }

        const m = Math.floor((l + r) / 2);
        await mergeSortHelper(arr, l, m);
        await mergeSortHelper(arr, m + 1, r);
        await merge(arr, l, m, r);
    }

    async function merge(arr, l, m, r) {
        if (shouldCancelSort) return;

        const n1 = m - l + 1;
        const n2 = r - m;

        const L = arr.slice(l, m + 1);
        const R = arr.slice(m + 1, r + 1);

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            if (shouldCancelSort) return;
            await checkPaused();

            drawData({
                currentIndices: [k],
                comparingIndices: [l + i, m + 1 + j],
            });
            await sleep(delay);

            if (L[i] <= R[j]) {
                arr[k] = L[i];
                data[k] = arr[k];
                i++;
            } else {
                arr[k] = R[j];
                data[k] = arr[k];
                j++;
            }
            k++;
        }

        while (i < n1) {
            if (shouldCancelSort) return;
            await checkPaused();

            arr[k] = L[i];
            data[k] = arr[k];
            i++;
            k++;

            drawData({
                currentIndices: [k - 1],
            });
            await sleep(delay);
        }

        while (j < n2) {
            if (shouldCancelSort) return;
            await checkPaused();

            arr[k] = R[j];
            data[k] = arr[k];
            j++;
            k++;

            drawData({
                currentIndices: [k - 1],
            });
            await sleep(delay);
        }
    }

    await mergeSortHelper(arr, 0, arr.length - 1);
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Quick Sort
async function quickSort(arr) {
    async function quickSortHelper(arr, low, high) {
        if (shouldCancelSort) return;
        if (low < high) {
            let pi = await partition(arr, low, high);
            await quickSortHelper(arr, low, pi - 1);
            await quickSortHelper(arr, pi + 1, high);
        }
    }

    async function partition(arr, low, high) {
        if (shouldCancelSort) return;
        let pivot = arr[high];
        let i = low - 1;

        drawData({
            pivotIndex: high,
        });
        await sleep(delay);

        for (let j = low; j < high; j++) {
            if (shouldCancelSort) return;
            await checkPaused();

            drawData({
                pivotIndex: high,
                comparingIndices: [j],
            });
            await sleep(delay);

            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                data[i] = arr[i];
                data[j] = arr[j];

                drawData({
                    swappingIndices: [i, j],
                    pivotIndex: high,
                });
                await sleep(delay);
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        data[i + 1] = arr[i + 1];
        data[high] = arr[high];

        drawData({
            swappingIndices: [i + 1, high],
        });
        await sleep(delay);

        return i + 1;
    }

    await quickSortHelper(arr, 0, arr.length - 1);
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
}

// Heap Sort
async function heapSort(arr) {
    let n = arr.length;

    async function heapify(arr, n, i) {
        if (shouldCancelSort) return;
        let largest = i;
        let l = 2 * i + 1;
        let r = 2 * i + 2;

        if (l < n) {
            await checkPaused();
            drawData({
                currentIndices: [i],
                comparingIndices: [l],
            });
            await sleep(delay);
            if (arr[l] > arr[largest]) {
                largest = l;
            }
        }

        if (r < n) {
            await checkPaused();
            drawData({
                currentIndices: [i],
                comparingIndices: [r],
            });
            await sleep(delay);
            if (arr[r] > arr[largest]) {
                largest = r;
            }
        }

        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            data[i] = arr[i];
            data[largest] = arr[largest];

            drawData({
                swappingIndices: [i, largest],
            });
            await sleep(delay);

            await heapify(arr, n, largest);
        }
    }

    // Build heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        if (shouldCancelSort) return;
        await heapify(arr, n, i);
    }

    // One by one extract elements
    for (let i = n - 1; i > 0; i--) {
        if (shouldCancelSort) return;
        await checkPaused();

        [arr[0], arr[i]] = [arr[i], arr[0]];
        data[0] = arr[0];
        data[i] = arr[i];

        drawData({
            swappingIndices: [0, i],
        });
        await sleep(delay);

        await heapify(arr, i, 0);
    }
    drawData({ sortedIndices: [...Array(arr.length).keys()] });
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

    reshuffleData();
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
        let arrCopy = [...data]; // Make a copy of the data

        switch (type) {
            case 'selection':
                await selectionSort(arrCopy);
                break;
            case 'insertion':
                await insertionSort(arrCopy);
                break;
            case 'bubble':
                await bubbleSort(arrCopy);
                break;
            case 'shell':
                await shellSort(arrCopy);
                break;
            case 'merge':
                await mergeSort(arrCopy);
                break;
            case 'quick':
                await quickSort(arrCopy);
                break;
            case 'heap':
                await heapSort(arrCopy);
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

// Pause the sort when the Compare Algorithms button is clicked
document.getElementById('compare-btn').addEventListener('click', function() {
    if (!isPaused) {
        togglePause();
    }
});

// Initialize the visualizer with random data
reshuffleData();
drawData();

// Add speed control display
const speedSlider = document.getElementById('speed');
const speedDisplay = document.getElementById('speed-display');

speedSlider.oninput = function () {
    delay = 101 - this.value;
    speedDisplay.textContent = this.value;
};

// Add array size control
const sizeSlider = document.getElementById('size');
const sizeDisplay = document.getElementById('size-display');

sizeSlider.oninput = function () {
    arraySize = this.value;
    sizeDisplay.textContent = this.value;
    reshuffleData();
};
