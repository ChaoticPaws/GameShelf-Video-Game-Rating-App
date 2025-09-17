<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RawgApiService
{
    protected $baseUrl = 'https://api.rawg.io/api';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.rawg.key');
    }

    public function searchGame($gameName)
    {
        $response = Http::get("{$this->baseUrl}/games", [
            'key' => $this->apiKey,
            'search' => $gameName,
        ]);

        return $response->json();
    }
   public function getGameScreenshots($rawgId)
    {
        $response = Http::get("https://api.rawg.io/api/games/{$rawgId}/screenshots", [
            'key' => env('RAWG_API_KEY'),
        ]);

        if ($response->successful()) {
            return $response->json(); // Devuelve array con 'results'
        }
        return ['results' => []];
    }
}