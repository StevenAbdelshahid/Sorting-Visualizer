// compare.js

// Global variables
let dataSize = 50; // Default data size
let originalData = [];
let delay = 50; // Adjust delay for visualization

// Initialize data
function initializeData() {
    originalData = Array.from({ length: dataSize }, () => Math.floor(Math.random() * 100) + 1);
}

// Helper function to delay sorting for visualization
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the comparison
async function startComparison() {
    const selectedAlgorithms = Array.from(document.querySelectorAll('input[name="algorithm"]:checked')).map(cb => cb.value);

    if (selectedAlgorithms.length === 0) {
        alert('Please select at least one algorithm.');
        return;
    }

    // Get data size from input
    const dataSizeInput = document.getElementById('data-size');
    dataSize = parseInt(dataSizeInput.value);
    if (isNaN(dataSize) || dataSize < 10 || dataSize > 1000) {
        alert('Please enter a valid data size between 10 and 1000.');
        return;
    }

    // Initialize data
    initializeData();

    // Hide the form and show the comparison results section
    const comparisonForm = document.getElementById('comparison-form');
    const comparisonResults = document.getElementById('comparison-results');
    const visualizationContainer = document.getElementById('visualization-container');

    comparisonForm.style.display = 'none';
    comparisonResults.classList.remove('hidden');

    // Create visualizations for each selected algorithm
    const promises = [];
    visualizationContainer.innerHTML = ''; // Clear previous visualizations

    selectedAlgorithms.forEach(algo => {
        // Create canvas and context
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const context = canvas.getContext('2d');

        // Create a container for each visualization
        const vizContainer = document.createElement('div');
        vizContainer.classList.add('visualization');

        // Add algorithm name
        const algoTitle = document.createElement('h3');
        algoTitle.textContent = algo.charAt(0).toUpperCase() + algo.slice(1) + ' Sort';
        vizContainer.appendChild(algoTitle);

        // Add canvas to container
        vizContainer.appendChild(canvas);

        // Add metrics placeholder
        const metricsDiv = document.createElement('div');
        metricsDiv.classList.add('metrics');
        metricsDiv.innerHTML = `
            <p>Execution Time: <span class="time">Calculating...</span> ms</p>
            <p>Comparisons: <span class="comparisons">Calculating...</span></p>
            <p>Swaps: <span class="swaps">Calculating...</span></p>
        `;
        vizContainer.appendChild(metricsDiv);

        // Add to visualization container
        visualizationContainer.appendChild(vizContainer);

        // Start sorting algorithm
        const promise = createSortingAlgorithm(algo, originalData, canvas, context).then(result => {
            // Update metrics
            metricsDiv.querySelector('.time').textContent = result.time;
            metricsDiv.querySelector('.comparisons').textContent = result.comparisons;
            metricsDiv.querySelector('.swaps').textContent = result.swaps;
        });

        promises.push(promise);
    });

    // Adjust layout for visualizations
    adjustVisualizationLayout();

    // Wait for all algorithms to finish
    await Promise.all(promises);
}

// Adjust visualization layout
function adjustVisualizationLayout() {
    const visualizations = document.querySelectorAll('.visualization');
    visualizations.forEach((viz, index) => {
        viz.style.width = '48%';
        viz.style.display = 'inline-block';
        viz.style.verticalAlign = 'top';
        viz.style.margin = '1%';
    });
}

// Function to go back to the main page
function goBack() {
    window.location.href = 'index.html';
}

// Function to redo the comparison
function redoComparison() {
    // Reset the comparison page to initial state
    const comparisonForm = document.getElementById('comparison-form');
    const comparisonResults = document.getElementById('comparison-results');
    const visualizationContainer = document.getElementById('visualization-container');

    // Clear the visualization container
    visualizationContainer.innerHTML = '';

    // Hide the comparison results
    comparisonResults.classList.add('hidden');

    // Show the form again
    comparisonForm.style.display = 'block';
}

// Create Sorting Algorithm
function createSortingAlgorithm(algoName, data, canvas, context) {
    let comparisons = 0;
    let swaps = 0;

    // Helper functions for drawing
    function drawData(arr, options = {}) {
        const {
            pivotIndex = -1,
            currentIndices = [],
            comparingIndices = [],
            swappingIndices = [],
            sortedIndices = [],
        } = options;

        context.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = canvas.width / arr.length;

        arr.forEach((value, index) => {
            const barHeight = (value / 100) * canvas.height;

            // Determine the color based on the indices
            if (swappingIndices.includes(index)) {
                context.fillStyle = '#3498db'; // Blue for swapping
            } else if (currentIndices.includes(index)) {
                context.fillStyle = '#e67e22'; // Orange
            } else if (comparingIndices.includes(index)) {
                context.fillStyle = '#e74c3c'; // Red
            } else if (index === pivotIndex) {
                context.fillStyle = '#9b59b6'; // Purple
            } else if (sortedIndices.includes(index)) {
                context.fillStyle = '#2ecc71'; // Green
            } else {
                context.fillStyle = '#ecf0f1'; // White
            }

            context.fillRect(index * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
        });
    }

    // Return a promise that resolves when the sorting is complete
    return new Promise(async (resolve) => {
        const arr = [...data]; // Copy of the data

        const startTime = performance.now();

        // Implement sorting based on algoName
        switch (algoName) {
            case 'selection':
                await selectionSort(arr);
                break;
            case 'insertion':
                await insertionSort(arr);
                break;
            case 'bubble':
                await bubbleSort(arr);
                break;
            case 'shell':
                await shellSort(arr);
                break;
            case 'merge':
                await mergeSort(arr);
                break;
            case 'quick':
                await quickSort(arr);
                break;
            case 'heap':
                await heapSort(arr);
                break;
            default:
                break;
        }

        const endTime = performance.now();
        const executionTime = (endTime - startTime).toFixed(2);

        resolve({
            algorithm: algoName.charAt(0).toUpperCase() + algoName.slice(1) + ' Sort',
            time: executionTime,
            comparisons: comparisons,
            swaps: swaps,
        });

        // Sorting Algorithms Implementations

        // Selection Sort
        async function selectionSort(arr) {
            let n = arr.length;

            for (let i = 0; i < n - 1; i++) {
                let min_idx = i;
                for (let j = i + 1; j < n; j++) {
                    comparisons++;
                    if (arr[j] < arr[min_idx]) {
                        min_idx = j;
                    }

                    drawData(arr, {
                        currentIndices: [min_idx],
                        comparingIndices: [j],
                    });
                    await sleep(delay);
                }

                if (min_idx !== i) {
                    [arr[i], arr[min_idx]] = [arr[min_idx], arr[i]];
                    swaps++;

                    drawData(arr, {
                        swappingIndices: [i, min_idx],
                    });
                    await sleep(delay);
                }
            }
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Insertion Sort
        async function insertionSort(arr) {
            let n = arr.length;

            for (let i = 1; i < n; i++) {
                let key = arr[i];
                let j = i - 1;

                while (j >= 0 && arr[j] > key) {
                    comparisons++;
                    arr[j + 1] = arr[j];
                    swaps++;

                    drawData(arr, {
                        currentIndices: [j + 1],
                        comparingIndices: [j],
                    });
                    await sleep(delay);
                    j--;
                }
                arr[j + 1] = key;

                drawData(arr, {
                    currentIndices: [j + 1],
                });
                await sleep(delay);
            }
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Bubble Sort
        async function bubbleSort(arr) {
            let n = arr.length;

            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    comparisons++;
                    drawData(arr, {
                        comparingIndices: [j, j + 1],
                    });
                    await sleep(delay);

                    if (arr[j] > arr[j + 1]) {
                        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                        swaps++;

                        drawData(arr, {
                            swappingIndices: [j, j + 1],
                        });
                        await sleep(delay);
                    }
                }
            }
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Shell Sort
        async function shellSort(arr) {
            let n = arr.length;

            for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
                for (let i = gap; i < n; i++) {
                    let temp = arr[i];
                    let j = i;

                    while (j >= gap && arr[j - gap] > temp) {
                        comparisons++;
                        arr[j] = arr[j - gap];
                        swaps++;

                        drawData(arr, {
                            currentIndices: [j],
                            comparingIndices: [j - gap],
                        });
                        await sleep(delay);
                        j -= gap;
                    }
                    arr[j] = temp;
                    drawData(arr, {
                        currentIndices: [j],
                    });
                    await sleep(delay);
                }
            }
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Merge Sort
        async function mergeSort(arr) {
            async function mergeSortHelper(arr, l, r) {
                if (l >= r) {
                    return;
                }

                const m = Math.floor((l + r) / 2);
                await mergeSortHelper(arr, l, m);
                await mergeSortHelper(arr, m + 1, r);
                await merge(arr, l, m, r);
            }

            async function merge(arr, l, m, r) {
                const n1 = m - l + 1;
                const n2 = r - m;

                const L = arr.slice(l, m + 1);
                const R = arr.slice(m + 1, r + 1);

                let i = 0, j = 0, k = l;

                while (i < n1 && j < n2) {
                    comparisons++;
                    drawData(arr, {
                        currentIndices: [k],
                        comparingIndices: [l + i, m + 1 + j],
                    });
                    await sleep(delay);

                    if (L[i] <= R[j]) {
                        arr[k] = L[i];
                        i++;
                    } else {
                        arr[k] = R[j];
                        j++;
                    }
                    swaps++;
                    k++;
                }

                while (i < n1) {
                    arr[k] = L[i];
                    swaps++;
                    i++;
                    k++;

                    drawData(arr, {
                        currentIndices: [k - 1],
                    });
                    await sleep(delay);
                }

                while (j < n2) {
                    arr[k] = R[j];
                    swaps++;
                    j++;
                    k++;

                    drawData(arr, {
                        currentIndices: [k - 1],
                    });
                    await sleep(delay);
                }
            }

            await mergeSortHelper(arr, 0, arr.length - 1);
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Quick Sort
        async function quickSort(arr) {
            async function quickSortHelper(arr, low, high) {
                if (low < high) {
                    let pi = await partition(arr, low, high);
                    await quickSortHelper(arr, low, pi - 1);
                    await quickSortHelper(arr, pi + 1, high);
                }
            }

            async function partition(arr, low, high) {
                let pivot = arr[high];
                let i = low - 1;

                drawData(arr, {
                    pivotIndex: high,
                });
                await sleep(delay);

                for (let j = low; j < high; j++) {
                    comparisons++;
                    drawData(arr, {
                        pivotIndex: high,
                        comparingIndices: [j],
                    });
                    await sleep(delay);

                    if (arr[j] < pivot) {
                        i++;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        swaps++;

                        drawData(arr, {
                            swappingIndices: [i, j],
                            pivotIndex: high,
                        });
                        await sleep(delay);
                    }
                }
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                swaps++;
                drawData(arr, {
                    swappingIndices: [i + 1, high],
                });
                await sleep(delay);

                return i + 1;
            }

            await quickSortHelper(arr, 0, arr.length - 1);
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }

        // Heap Sort
        async function heapSort(arr) {
            let n = arr.length;

            async function heapify(arr, n, i) {
                let largest = i;
                let l = 2 * i + 1;
                let r = 2 * i + 2;

                if (l < n) {
                    comparisons++;
                    drawData(arr, {
                        currentIndices: [i],
                        comparingIndices: [l],
                    });
                    await sleep(delay);
                    if (arr[l] > arr[largest]) {
                        largest = l;
                    }
                }

                if (r < n) {
                    comparisons++;
                    drawData(arr, {
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
                    swaps++;

                    drawData(arr, {
                        swappingIndices: [i, largest],
                    });
                    await sleep(delay);

                    await heapify(arr, n, largest);
                }
            }

            // Build heap
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
                await heapify(arr, n, i);
            }

            // One by one extract elements
            for (let i = n - 1; i > 0; i--) {
                [arr[0], arr[i]] = [arr[i], arr[0]];
                swaps++;

                drawData(arr, {
                    swappingIndices: [0, i],
                });
                await sleep(delay);

                await heapify(arr, i, 0);
            }
            drawData(arr, { sortedIndices: [...Array(arr.length).keys()] });
        }
    });
}
