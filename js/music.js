/**
 * Модуль для управления музыкой в игре
 */

class MusicManager {
    constructor() {
        this.currentTrack = null;
        this.isMusicEnabled = true;
        this.volume = 0.5;
        this.tracks = {
            menu: 'sprites/music/bg1.mp3',
            game: 'sprites/music/bg1.mp3',
            monster: 'sprites/music/catch.mp3',
            victory: 'sprites/music/win.mp3'
        };
        this.audioElements = {};
        this.currentState = 'menu';
        
        this.initialize();
    }

    /**
     * Инициализация музыкальной системы
     */
    initialize() {
        console.log('Инициализация музыкальной системы...');
        
        // Создаем аудио элементы для каждого трека
        this.createAudioElements();
        
        // Устанавливаем громкость
        this.setVolume(this.volume);
        
        // Начинаем с музыки меню
        this.playMenuMusic();
    }

    /**
     * Создание аудио элементов
     */
    createAudioElements() {
        for (const [state, trackPath] of Object.entries(this.tracks)) {
            const audio = new Audio(trackPath);
            audio.loop = true; // Включаем зацикливание
            audio.volume = this.volume;
            audio.preload = 'auto';
            
            this.audioElements[state] = audio;
        }
    }

    /**
     * Воспроизведение музыки меню
     */
    playMenuMusic() {
        if (!this.isMusicEnabled) return;
        
        this.stopAllMusic();
        this.currentState = 'menu';
        
        const menuAudio = this.audioElements.menu;
        if (menuAudio) {
            menuAudio.currentTime = 0;
            menuAudio.play().catch(error => {
                console.warn('Не удалось воспроизвести музыку меню:', error);
            });
            this.currentTrack = menuAudio;
        }
    }

    /**
     * Воспроизведение музыки игры
     */
    playGameMusic() {
        if (!this.isMusicEnabled) return;
        
        this.stopAllMusic();
        this.currentState = 'game';
        
        const gameAudio = this.audioElements.game;
        if (gameAudio) {
            gameAudio.currentTime = 0;
            gameAudio.play().catch(error => {
                console.warn('Не удалось воспроизвести музыку игры:', error);
            });
            this.currentTrack = gameAudio;
        }
    }

    /**
     * Воспроизведение музыки при появлении монстра
     */
    playMonsterMusic() {
        if (!this.isMusicEnabled) return;
        
        this.stopAllMusic();
        this.currentState = 'monster';
        
        const monsterAudio = this.audioElements.monster;
        if (monsterAudio) {
            monsterAudio.currentTime = 0;
            monsterAudio.play().catch(error => {
                console.warn('Не удалось воспроизвести музыку монстра:', error);
            });
            this.currentTrack = monsterAudio;
        }
    }

    /**
     * Воспроизведение музыки победы
     */
    playVictoryMusic() {
        if (!this.isMusicEnabled) return;
        
        this.stopAllMusic();
        this.currentState = 'victory';
        
        const victoryAudio = this.audioElements.victory;
        if (victoryAudio) {
            victoryAudio.currentTime = 0;
            victoryAudio.play().catch(error => {
                console.warn('Не удалось воспроизвести музыку победы:', error);
            });
            this.currentTrack = victoryAudio;
        }
    }

    /**
     * Остановка всей музыки
     */
    stopAllMusic() {
        for (const audio of Object.values(this.audioElements)) {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        }
        this.currentTrack = null;
    }

    /**
     * Пауза музыки
     */
    pauseMusic() {
        if (this.currentTrack) {
            this.currentTrack.pause();
        }
    }

    /**
     * Возобновление музыки
     */
    resumeMusic() {
        if (this.currentTrack && this.isMusicEnabled) {
            this.currentTrack.play().catch(error => {
                console.warn('Не удалось возобновить музыку:', error);
            });
        }
    }

    /**
     * Установка громкости
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        for (const audio of Object.values(this.audioElements)) {
            if (audio) {
                audio.volume = this.volume;
            }
        }
    }

    /**
     * Включение/выключение музыки
     */
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        
        if (this.isMusicEnabled) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }
        
        return this.isMusicEnabled;
    }

    /**
     * Получение текущего состояния музыки
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Проверка, включена ли музыка
     */
    isMusicOn() {
        return this.isMusicEnabled;
    }

    /**
     * Получение текущей громкости
     */
    getVolume() {
        return this.volume;
    }

    /**
     * Обработка изменения видимости страницы
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }
}

// Создаем глобальный экземпляр после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.musicManager = new MusicManager();
    
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (window.musicManager) {
            window.musicManager.handleVisibilityChange();
        }
    });
}); 