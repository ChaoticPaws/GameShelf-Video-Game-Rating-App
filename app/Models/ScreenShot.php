<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screenshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_game_id',
        'image'
    ];

    public function videoGame()
    {
        return $this->belongsTo(VideoGame::class);
    }
}
