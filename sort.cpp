#include <iostream>
#include <random>
#include <ranges>
#include <algorithm>
#include <SDL2/SDL.h>

void draw_state(
    std::vector<int>& v, 
    SDL_Renderer* renderer,  // Corrected typo from SDL_renderer to SDL_Renderer
    unsigned int red, 
    unsigned int blue)
{
    int index = 0;
    for (int i : v) 
    {
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);  // Missing semicolon
        SDL_RenderDrawLine(renderer, index, 99, index, 99 - i);  // Corrected parameters for drawing lines
        index += 1;
    }
}

int main()
{
    std::random_device rd;
    std::uniform_int_distribution d(1, 99);
    std::vector<int> v;

    // Populate vector with random numbers
    for (int i = 0; i < 100; i++)
    {
        v.push_back(d(rd));
    }

    SDL_Window* window = nullptr;
    SDL_Renderer* renderer = nullptr;
    SDL_CreateWindowAndRenderer(
        100 * 10, 100 * 10, 0,
        &window, &renderer);
    SDL_RenderSetScale(renderer, 10, 10);  // Corrected typo from SDL_RenderSetSCale

    // Sort algorithm
    for (unsigned int i = 0; i < v.size(); i++)
    {
        for (unsigned int j = i + 1; j < v.size(); j++)  // Corrected loop start and condition
        {
            if (v[j] < v[i])
            {
                std::swap(v[j], v[i]);
            }

            // Clear screen
            SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
            SDL_RenderClear(renderer);

            // Draw state of the sort
            draw_state(v, renderer, i, j);

            SDL_RenderPresent(renderer);
            SDL_Delay(10);
        }
    }

    for (int i : v)
    {
        std::cout << i << " ";
    }

    if (std::ranges::is_sorted(v))  // Added missing parenthesis
    {
        std::cout << "\nSorted\n";
    }

    SDL_DestroyRenderer(renderer);  // Added cleanup
    SDL_DestroyWindow(window);
    SDL_Quit();
    
    return 0;
}
