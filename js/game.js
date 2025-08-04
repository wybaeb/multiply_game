/**
 * Основной игровой движок
 */

class GameEngine {
    constructor() {
        this.gameState = 'LOADING';
        this.currentLevel = 1;
        this.currentScore = 0;
        this.timer = 60;
        this.timerInterval = null;
        this.gameLoop = null;
        this.isGameRunning = false;
        this.currentProblem = null;
        this.monsterSpawnTimer = null;
        this.monsterSpawnDelay = 2000; // 2 секунды
        this.combatActive = false;
        this.victoryAnimationTimer = null;
        
        this.initialize();
    }

    /**
     * Инициализация игры
     */
    async initialize() {
        console.log('Инициализация игры...');
        
        // Загружаем данные
        const gameData = window.gameStorage.loadGameData();
        this.currentLevel = gameData.currentLevel;
        this.currentScore = gameData.totalScore;

        // Устанавливаем уровень в математическом модуле
        window.mathGame.setLevel(this.currentLevel);

        // Инициализируем персонажей
        window.player.init();
        window.monster.init();

        // Устанавливаем сложность монстра
        const difficulty = window.mathGame.getLevelDifficulty();
        window.monster.setDifficulty(difficulty);

        // Показываем экран загрузки
        window.gameUI.showLoading();

        // Симулируем загрузку ресурсов
        await this.loadResources();

        // Скрываем экран загрузки и показываем меню
        window.gameUI.hideLoading();
        window.gameUI.showMenu();

        this.gameState = 'MENU';
        console.log('Игра инициализирована');
    }

    /**
     * Загрузка ресурсов
     */
    async loadResources() {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalResources = 20; // Примерное количество ресурсов

            const updateProgress = () => {
                loadedCount++;
                const progress = (loadedCount / totalResources) * 100;
                
                // Обновляем прогресс загрузки
                const progressBar = document.querySelector('.loading-progress');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }

                if (loadedCount >= totalResources) {
                    setTimeout(resolve, 500); // Небольшая задержка для плавности
                }
            };

            // Симулируем загрузку ресурсов
            for (let i = 0; i < totalResources; i++) {
                setTimeout(updateProgress, Math.random() * 100 + 50);
            }
        });
    }

    /**
     * Запуск игры
     */
    startGame() {
        console.log('Запуск игры...');
        
        this.gameState = 'RUNNING';
        this.isGameRunning = true;
        this.currentScore = 0;
        this.timer = 60;
        this.combatActive = false;

        // Сброс UI
        window.gameUI.reset();

        // Сброс персонажей
        window.player.reset();
        window.monster.reset();

        // Показываем персонажа
        window.player.show();

        // Запускаем параллакс
        window.gameUI.startParallax();

        // Запускаем игровой цикл
        this.startGameLoop();

        // Запускаем спавн монстров
        this.startMonsterSpawn();

        console.log('Игра запущена');
    }

    /**
     * Остановка игры
     */
    stopGame() {
        console.log('Остановка игры...');
        
        this.isGameRunning = false;
        this.gameState = 'MENU';

        // Останавливаем все таймеры
        this.stopTimer();
        this.stopMonsterSpawn();
        this.stopGameLoop();

        // Останавливаем параллакс
        window.gameUI.stopParallax();

        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();
        window.gameUI.hideMonster();

        // Показываем меню
        window.gameUI.showMenu();

        console.log('Игра остановлена');
    }

    /**
     * Запуск игрового цикла
     */
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (!this.isGameRunning) return;

            // Обновляем движение монстра только во время боя
            if (this.combatActive && window.monster.isVisibleNow()) {
                window.monster.autoMove();
            }
        }, 16); // ~60 FPS
    }

    /**
     * Остановка игрового цикла
     */
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    /**
     * Запуск таймера
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isGameRunning || !this.combatActive) return;

            this.timer--;
            window.gameUI.updateTimer(this.timer);

            if (this.timer <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    /**
     * Остановка таймера
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Запуск спавна монстров
     */
    startMonsterSpawn() {
        this.monsterSpawnTimer = setTimeout(() => {
            if (this.isGameRunning && !this.combatActive) {
                this.spawnMonster();
            }
        }, this.monsterSpawnDelay);
    }

    /**
     * Остановка спавна монстров
     */
    stopMonsterSpawn() {
        if (this.monsterSpawnTimer) {
            clearTimeout(this.monsterSpawnTimer);
            this.monsterSpawnTimer = null;
        }
    }

    /**
     * Спавн монстра
     */
    spawnMonster() {
        console.log('Спавн монстра...');
        
        this.combatActive = true;
        this.timer = 60; // Сброс таймера
        window.monster.show();

        // Останавливаем движение персонажа
        window.player.stopWalking();

        // Генерируем задачу
        this.currentProblem = window.mathGame.generateProblem();
        const problemText = window.mathGame.getProblemText();

        // Показываем задачу и клавиатуру
        window.gameUI.showMathProblem(problemText);
        window.gameUI.showKeyboard();
        window.gameUI.showInput();

        // Запускаем таймер
        this.startTimer();
    }

    /**
     * Проверка ответа
     */
    checkAnswer(userAnswer) {
        if (!this.currentProblem) return;

        const result = window.mathGame.checkAnswer(userAnswer);
        
        if (result.correct) {
            this.handleCorrectAnswer(result);
        } else {
            this.handleWrongAnswer(result);
        }
    }

    /**
     * Обработка правильного ответа
     */
    handleCorrectAnswer(result) {
        console.log('Правильный ответ!');
        
        // Останавливаем таймер
        this.stopTimer();
        
        // Анимации
        window.gameUI.animateCorrectAnswer();
        window.player.attack();
        window.monster.takePlayerDamage();

        // Обновляем очки
        const points = result.points + this.timer * 10; // Бонус за оставшееся время
        this.currentScore += points;
        window.gameUI.updateScore(this.currentScore);

        // Анимация монет
        const coinCount = Math.floor(points / 10);
        window.gameUI.animateCoins(coinCount);

        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();

        // Анимация победы
        this.victoryAnimation();

        // Сохраняем прогресс
        window.gameStorage.updateScore(points);
    }

    /**
     * Обработка неправильного ответа
     */
    handleWrongAnswer(result) {
        console.log('Неправильный ответ!');
        
        // Останавливаем таймер
        this.stopTimer();
        
        // Анимации
        window.gameUI.animateWrongAnswer();
        window.monster.attack();

        // Обновляем очки
        this.currentScore += result.points; // Отрицательные очки
        window.gameUI.updateScore(this.currentScore);

        // Урон игроку
        window.player.takeMonsterDamage();

        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();

        // Проверяем здоровье игрока
        if (!window.player.isAlive()) {
            this.handlePlayerDeath();
        } else {
            // Продолжаем игру
            this.continueAfterCombat();
        }

        // Сохраняем прогресс
        window.gameStorage.updateScore(result.points);
    }

    /**
     * Анимация победы
     */
    victoryAnimation() {
        window.player.victoryAnimation();
        window.monster.deathAnimation();

        // Показываем сообщение о победе
        window.gameUI.showMessage('Победа!', 'success');

        // Продолжаем игру через некоторое время
        this.victoryAnimationTimer = setTimeout(() => {
            this.continueAfterCombat();
        }, 2000);
    }

    /**
     * Обработка смерти игрока
     */
    handlePlayerDeath() {
        console.log('Игрок погиб!');
        
        window.player.defeatAnimation();
        window.gameUI.showMessage('Игра окончена!', 'error');

        // Останавливаем игру через некоторое время
        setTimeout(() => {
            this.stopGame();
        }, 3000);
    }

    /**
     * Обработка окончания времени
     */
    handleTimeUp() {
        console.log('Время истекло!');
        
        this.stopTimer();
        window.gameUI.showMessage('Время истекло!', 'warning');

        // Останавливаем игру через некоторое время
        setTimeout(() => {
            this.stopGame();
        }, 2000);
    }

    /**
     * Продолжение игры после боя
     */
    continueAfterCombat() {
        this.combatActive = false;
        this.currentProblem = null;

        // Скрываем монстра
        window.monster.hide();

        // Возобновляем движение персонажа
        window.player.startWalking();

        // Запускаем спавн следующего монстра
        this.startMonsterSpawn();

        // Проверяем завершение уровня
        this.checkLevelCompletion();
    }

    /**
     * Проверка завершения уровня
     */
    checkLevelCompletion() {
        // Здесь можно добавить логику проверки завершения уровня
        // Например, после определенного количества побед
        const nextLevel = window.mathGame.getNextLevel();
        if (nextLevel) {
            // Переход на следующий уровень
            this.currentLevel = nextLevel;
            window.mathGame.setLevel(nextLevel);
            window.gameStorage.updateLevel(nextLevel);
            
            // Обновляем сложность монстра
            const difficulty = window.mathGame.getLevelDifficulty();
            window.monster.setDifficulty(difficulty);

            window.gameUI.showMessage(`Уровень ${nextLevel}!`, 'info');
        }
    }

    /**
     * Получение текущего состояния игры
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Получение текущего уровня
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Получение текущего счета
     */
    getCurrentScore() {
        return this.currentScore;
    }

    /**
     * Получение оставшегося времени
     */
    getRemainingTime() {
        return this.timer;
    }

    /**
     * Проверка, запущена ли игра
     */
    isGameActive() {
        return this.isGameRunning;
    }

    /**
     * Сброс игры
     */
    reset() {
        this.stopGame();
        window.gameStorage.resetProgress();
        this.currentLevel = 1;
        this.currentScore = 0;
        window.mathGame.setLevel(1);
        window.gameUI.updateMenuStats();
    }

    /**
     * Пауза игры
     */
    pause() {
        if (this.isGameRunning) {
            this.isGameRunning = false;
            this.stopTimer();
            this.stopMonsterSpawn();
            this.stopGameLoop();
            window.gameUI.showMessage('Игра на паузе', 'info');
        }
    }

    /**
     * Возобновление игры
     */
    resume() {
        if (this.gameState === 'RUNNING' && !this.isGameRunning) {
            this.isGameRunning = true;
            this.startMonsterSpawn();
            this.startGameLoop();
            if (this.combatActive) {
                this.startTimer();
            }
            window.gameUI.showMessage('Игра возобновлена', 'info');
        }
    }
}

// Создаем глобальный экземпляр после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GameEngine();
});

// Обработка видимости страницы для паузы
document.addEventListener('visibilitychange', () => {
    if (window.gameEngine) {
        if (document.hidden) {
            window.gameEngine.pause();
        } else {
            window.gameEngine.resume();
        }
    }
}); 