#include <iostream>
#include <random>
#include <algorithm>
#include <SDL2/SDL.h>
#include <string>
#include <vector>
#include <cmath>
#include <queue>

class SortVisualizer {
private:
    SDL_Renderer* renderer;
    SDL_Window* window;
    std::vector<int> data;
    int delay;
    bool isPaused;
    bool isRunning;
    int lastSortAlgorithm;

public:
    SortVisualizer(int size, int delay) : renderer(nullptr), window(nullptr), delay(delay), isPaused(true), isRunning(true), lastSortAlgorithm(0) {
        initialize(size);
    }

    ~SortVisualizer() {
        cleanup();
    }

    void initialize(int size) {
        // Initialize SDL
        if (SDL_Init(SDL_INIT_VIDEO) != 0) {
            std::cerr << "SDL_Init Error: " << SDL_GetError() << std::endl;
            return;
        }

        // Create window and renderer
        SDL_CreateWindowAndRenderer(1000, 600, 0, &window, &renderer);
        if (!window || !renderer) {
            std::cerr << "SDL_CreateWindowAndRenderer Error: " << SDL_GetError() << std::endl;
            SDL_Quit();
            return;
        }

        // Generate random data
        reshuffle_data(size);
    }

    void reshuffle_data(int size) {
        std::random_device rd;
        std::uniform_int_distribution<int> dist(1, 99);
        data.resize(size);
        std::generate(data.begin(), data.end(), [&]() { return dist(rd); });
    }

    void draw_state(int red = -1, int blue = -1) {
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);  // Clear background to black
        SDL_RenderClear(renderer);

        int max_height = 500;
        int window_width = 1000;  // Width of the window
        int window_height = 600;  // Height of the window

        // Adjust bar width to fill the entire window width
        int bar_width = window_width / data.size();

        for (size_t index = 0; index < data.size(); index++) {
            int value = data[index];
            int bar_height = (value / 99.0) * max_height;

            // Create an SDL_Rect for the bar
            SDL_Rect bar;
            bar.x = index * bar_width;            // Horizontal position
            bar.y = window_height - bar_height;   // Start from the bottom of the window
            bar.w = bar_width - 1;                // Width of the bar (subtract 1 for spacing)
            bar.h = bar_height;                   // Height of the bar

            // Determine color for the current bar
            if (index == red)
                SDL_SetRenderDrawColor(renderer, 255, 0, 0, 255);  // Red for the 'red' index
            else if (index == blue)
                SDL_SetRenderDrawColor(renderer, 0, 0, 255, 255);  // Blue for the 'blue' index
            else 
                SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);  // Default white color

            // Draw the bar as a filled rectangle
            SDL_RenderFillRect(renderer, &bar);
        }

        SDL_RenderPresent(renderer);
    }

    void draw_text(const std::string& text, int x, int y) {
        // Placeholder for text rendering
        // Use SDL_ttf for real text rendering
    }

    // Sorting algorithms
    void selection_sort() {
        for (unsigned int i = 0; i < data.size(); i++) {
            int minIndex = i;
            for (unsigned int j = i + 1; j < data.size(); j++) {
                handle_user_input();

                // If sorting is paused, wait until resumed
                while (isPaused && isRunning) {
                    handle_user_input();
                    SDL_Delay(100);
                }
                if (!isRunning) return;

                if (data[j] < data[minIndex])
                    minIndex = j;

                if (isRunning && !isPaused) {
                    draw_state(minIndex, j);  // Visualize comparison
                    SDL_Delay(delay);
                }
            }

            if (minIndex != i) {
                std::swap(data[i], data[minIndex]);
                draw_state(i, minIndex);  // Visualize swap
                SDL_Delay(delay);
            }
        }
    }

    void quick_sort(int low, int high) {
        if (low < high) {
            int pivot = partition(low, high);

            // Visualize after partition
            draw_state(pivot);
            SDL_Delay(delay);

            quick_sort(low, pivot - 1);
            quick_sort(pivot + 1, high);
        }
    }

    int partition(int low, int high) {
        int pivot = data[high];
        int i = low - 1;

        for (int j = low; j <= high - 1; j++) {
            handle_user_input();

            while (isPaused && isRunning) {
                handle_user_input();
                SDL_Delay(100);
            }
            if (!isRunning) return i;

            if (data[j] < pivot) {
                i++;
                std::swap(data[i], data[j]);
                draw_state(i, j);  // Visualize swap
                SDL_Delay(delay);
            }
        }
        std::swap(data[i + 1], data[high]);
        return (i + 1);
    }

    void merge_sort(int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;

            merge_sort(left, mid);
            merge_sort(mid + 1, right);
            merge(left, mid, right);
        }
    }

    void merge(int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        std::vector<int> L(n1), R(n2);

        for (int i = 0; i < n1; i++)
            L[i] = data[left + i];
        for (int i = 0; i < n2; i++)
            R[i] = data[mid + 1 + i];

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            handle_user_input();

            while (isPaused && isRunning) {
                handle_user_input();
                SDL_Delay(100);
            }
            if (!isRunning) return;

            if (L[i] <= R[j]) {
                data[k] = L[i];
                i++;
            } else {
                data[k] = R[j];
                j++;
            }
            draw_state(k);  // Visualize merge
            SDL_Delay(delay);
            k++;
        }

        while (i < n1) {
            handle_user_input();
            data[k] = L[i];
            draw_state(k);  // Visualize merge
            SDL_Delay(delay);
            i++;
            k++;
        }

        while (j < n2) {
            handle_user_input();
            data[k] = R[j];
            draw_state(k);  // Visualize merge
            SDL_Delay(delay);
            j++;
            k++;
        }
    }

    void bubble_sort() {
        for (unsigned int i = 0; i < data.size() - 1; i++) {
            for (unsigned int j = 0; j < data.size() - i - 1; j++) {
                handle_user_input();

                while (isPaused && isRunning) {
                    handle_user_input();
                    SDL_Delay(100);
                }
                if (!isRunning) return;

                if (data[j] > data[j + 1]) {
                    std::swap(data[j], data[j + 1]);
                    draw_state(j, j + 1);  // Visualize swap
                    SDL_Delay(delay);
                }
            }
        }
        draw_state();
    }

    void insertion_sort() {
        for (unsigned int i = 1; i < data.size(); i++) {
            int key = data[i];
            int j = i - 1;

            while (j >= 0 && data[j] > key) {
                handle_user_input();

                while (isPaused && isRunning) {
                    handle_user_input();
                    SDL_Delay(100);
                }
                if (!isRunning) return;

                data[j + 1] = data[j];
                draw_state(j + 1, j);  // Visualize swap
                SDL_Delay(delay);
                j--;
            }
            data[j + 1] = key;
        }
        draw_state();
    }

    void heap_sort() {
        int n = data.size();

        // Build heap (rearrange array)
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(n, i);
        }

        // Extract elements from heap one by one
        for (int i = n - 1; i > 0; i--) {
            handle_user_input();

            std::swap(data[0], data[i]);
            draw_state(0, i);  // Visualize swap
            SDL_Delay(delay);

            heapify(i, 0);
        }
        draw_state();
    }

    void heapify(int n, int i) {
        int largest = i;  // Initialize largest as root
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n && data[left] > data[largest])
            largest = left;

        if (right < n && data[right] > data[largest])
            largest = right;

        if (largest != i) {
            std::swap(data[i], data[largest]);
            draw_state(i, largest);  // Visualize swap
            SDL_Delay(delay);

            heapify(n, largest);
        }
    }

    void shell_sort() {
        for (int gap = data.size() / 2; gap > 0; gap /= 2) {
            for (unsigned int i = gap; i < data.size(); i++) {
                int temp = data[i];
                int j;
                for (j = i; j >= gap && data[j - gap] > temp; j -= gap) {
                    handle_user_input();

                    while (isPaused && isRunning) {
                        handle_user_input();
                        SDL_Delay(100);
                    }
                    if (!isRunning) return;

                    data[j] = data[j - gap];
                    draw_state(j, j - gap);  // Visualize swap
                    SDL_Delay(delay);
                }
                data[j] = temp;
            }
        }
        draw_state();
    }


    void handle_user_input() {
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type == SDL_QUIT) {
                isRunning = false;
            } else if (event.type == SDL_KEYDOWN) {
                switch (event.key.keysym.sym) {
                    case SDLK_q:
                    case SDLK_ESCAPE:
                        isRunning = false;
                        break;
                    case SDLK_p:
                        isPaused = !isPaused;
                        break;
                    case SDLK_r:
                        isPaused = true;
                        reshuffle_data(data.size());
                        draw_state();
                        lastSortAlgorithm = 0;
                        break;
                    case SDLK_1:
                        lastSortAlgorithm = 1;
                        isPaused = false;
                        selection_sort();
                        break;
                    case SDLK_2:
                        lastSortAlgorithm = 2;
                        isPaused = false;
                        quick_sort(0, data.size() - 1);
                        draw_state();
                        break;
                    case SDLK_3:
                        lastSortAlgorithm = 3;
                        isPaused = false;
                        merge_sort(0, data.size() - 1);
                        draw_state();
                        break;
                    case SDLK_4:
                        lastSortAlgorithm = 4;
                        isPaused = false;
                        bubble_sort();
                        break;
                    case SDLK_5:
                        lastSortAlgorithm = 5;
                        isPaused = false;
                        insertion_sort();
                        break;
                    case SDLK_6:
                        lastSortAlgorithm = 6;
                        isPaused = false;
                        heap_sort();
                        break;
                    case SDLK_7:
                        lastSortAlgorithm = 7;
                        isPaused = false;
                        shell_sort();
                        break;
                    default:
                        break;
                }
            }
        }
    }

    void select_sorting_algorithm() {
        draw_state();  // Draw initial state with sorting options

        // Wait for user input to select sorting algorithm
        while (isPaused && isRunning) {
            handle_user_input();
        }

        // Engage sorting based on the last selected algorithm
        switch (lastSortAlgorithm) {
            case 1:
                selection_sort();
                break;
            case 2:
                quick_sort(0, data.size() - 1);
                draw_state(); // Ensure final state is drawn
                break;
            case 3:
                merge_sort(0, data.size() - 1);
                draw_state(); // Ensure final state is drawn
                break;
            case 4:
                bubble_sort();
                break;
            case 5:
                insertion_sort();
                break;
            case 6:
                heap_sort();
                break;
            case 7:
                shell_sort();
                break;
            default:
                break;
        }
    }

    void cleanup() {
        SDL_DestroyRenderer(renderer);
        SDL_DestroyWindow(window);
        SDL_Quit();
    }

    bool is_sorted() const {
        return std::is_sorted(data.begin(), data.end());
    }

    void print_data() const {
        for (int num : data) {
            std::cout << num << " ";
        }
        std::cout << std::endl;
    }
};

int SDL_main(int argc, char* argv[]) {
    int size = 100;
    int delay = 50;

    SortVisualizer visualizer(size, delay);
    visualizer.select_sorting_algorithm();

    if (visualizer.is_sorted()) {
        std::cout << "Sorted!" << std::endl;
    }

    visualizer.print_data();
    return 0;
}
