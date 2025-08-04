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
        this.lastAnswerCorrect = false; // Флаг для отслеживания правильности последнего ответа
        
        this.initialize();
    }

    /**
     * Инициализация игры
     */
    async initialize() {
        console.log('Инициализация игры...');
        
        // Загружаем данные
        const gameData = window.gameStorage.loadGameData();
        
        // Если очки отрицательные, сбрасываем прогресс
        if (gameData.totalScore < 0) {
            console.log('Обнаружены отрицательные очки, сбрасываем прогресс');
            window.gameStorage.resetProgress();
            const resetData = window.gameStorage.loadGameData();
            this.currentLevel = resetData.currentLevel;
            this.currentScore = resetData.totalScore;
        } else {
            this.currentLevel = gameData.currentLevel;
            this.currentScore = gameData.totalScore;
        }

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

        // Запускаем параллакс для фона
        window.gameUI.startParallax();

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
        
        // Загружаем сохраненные данные
        const gameData = window.gameStorage.loadGameData();
        
        // Если есть сохраненные очки > 0, используем их, иначе начинаем с 0
        if (gameData.totalScore > 0) {
            this.currentScore = gameData.totalScore;
            this.currentLevel = gameData.currentLevel; // Загружаем сохраненный уровень
            console.log('Продолжаем игру с очками:', this.currentScore, 'и уровнем:', this.currentLevel);
        } else {
            this.currentScore = 0;
            this.currentLevel = gameData.currentLevel; // Используем сохраненный уровень даже для новой игры
            console.log('Начинаем новую игру с 0 очков и уровнем:', this.currentLevel);
        }
        
        // Устанавливаем уровень в математическом модуле
        window.mathGame.setLevel(this.currentLevel);
        
        this.timer = 60;
        this.combatActive = false;
        this.lastAnswerCorrect = false;

        // Сброс UI
        window.gameUI.reset();

        // Сброс персонажей
        window.player.reset();
        window.monster.reset();

        // Показываем персонажа
        window.player.show();

        // Обновляем отображение счета
        window.gameUI.updateScore(this.currentScore);

        // Запускаем параллакс
        window.gameUI.startParallax();

        // Запускаем музыку игры
        if (window.musicManager) {
            window.musicManager.playGameMusic();
        }

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

        // Сохраняем текущие очки и уровень, если очки > 0
        if (this.currentScore > 0) {
            console.log('Сохраняем очки и уровень при остановке игры:', this.currentScore, this.currentLevel);
            // Принудительно устанавливаем сохраненные очки и уровень
            const gameData = window.gameStorage.loadGameData();
            gameData.totalScore = this.currentScore;
            gameData.currentLevel = this.currentLevel;
            window.gameStorage.saveGameData(gameData);
        }

        // Останавливаем все таймеры
        this.stopTimer();
        this.stopMonsterSpawn();
        this.stopGameLoop();

        // Останавливаем параллакс
        window.gameUI.stopParallax();

        // Возвращаемся к музыке меню
        if (window.musicManager) {
            window.musicManager.playMenuMusic();
        }

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
        this.lastAnswerCorrect = false; // Сбрасываем флаг правильности ответа
        
        // Сбрасываем позицию монстра на начальную
        window.monster.setPosition(75, 5);
        window.monster.show();

        // Включаем музыку монстра
        if (window.musicManager) {
            window.musicManager.playMonsterMusic();
        }

        // Останавливаем движение персонажа на короткое время
        window.player.stopWalking();
        
        // Запускаем движение персонажа снова через небольшую задержку
        setTimeout(() => {
            window.player.startWalking();
        }, 500);

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
        
        // Устанавливаем флаг правильного ответа
        this.lastAnswerCorrect = true;
        
        // Останавливаем таймер
        this.stopTimer();
        
        // Включаем музыку победы
        if (window.musicManager) {
            window.musicManager.playVictoryMusic();
        }
        
        // Анимации
        window.gameUI.animateCorrectAnswer();
        window.player.attack();
        
        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();

        // Ждем завершения анимации атаки, затем обрабатываем результат
        setTimeout(() => {
            // Монстр получает урон и исчезает
            window.monster.takePlayerDamage();

            // Обновляем очки
            const points = result.points + this.timer * 10; // Бонус за оставшееся время
            this.currentScore += points;
            window.gameUI.updateScore(this.currentScore);

            // Анимация монет
            const coinCount = Math.floor(points / 10);
            window.gameUI.animateCoins(coinCount);

            // Проверяем, не стали ли очки отрицательными после добавления очков
            if (this.currentScore < 0) {
                // Сбрасываем прогресс при отрицательных очках
                window.gameStorage.resetProgress();
                this.handleGameOver('Очки стали отрицательными! Игра окончена!');
            } else {
                // Анимация победы
                this.victoryAnimation();
                // Сохраняем прогресс только если очки не отрицательные
                window.gameStorage.updateScore(points);
            }
        }, 1200); // Ждем завершения анимации атаки (800ms blast + 400ms burst)
    }

    /**
     * Обработка неправильного ответа
     */
    handleWrongAnswer(result) {
        console.log('Неправильный ответ!');
        
        // Устанавливаем флаг неправильного ответа
        this.lastAnswerCorrect = false;
        
        // Останавливаем таймер
        this.stopTimer();
        
        // Вычисляем штраф: 500 очков + номер уровня
        const penalty = 500 + this.currentLevel;
        this.currentScore -= penalty;
        
        // Обновляем отображение очков
        window.gameUI.updateScore(this.currentScore);
        
        // Показываем сообщение о штрафе
        window.gameUI.showMessage(`Неправильный ответ! Штраф: -${penalty} очков`, 'error');
        
        // Анимация штрафа
        window.gameUI.animatePenalty(penalty);
        
        // Анимации
        window.gameUI.animateWrongAnswer();
        
        // Монстр сначала подбегает к игроку, потом атакует
        window.monster.approachAndAttack(penalty);

        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();

        // Проверяем здоровье игрока и отрицательные очки
        if (!window.player.isAlive() || this.currentScore < 0) {
            if (this.currentScore < 0) {
                // Сбрасываем прогресс при отрицательных очках
                window.gameStorage.resetProgress();
                this.handleGameOver('Очки стали отрицательными! Игра окончена!');
            } else {
                this.handlePlayerDeath();
            }
        } else {
            // Продолжаем игру с того же уровня
            setTimeout(() => {
                this.continueAfterCombat();
            }, 2000);
            // Сохраняем прогресс только если очки не отрицательные
            window.gameStorage.updateScore(-penalty);
        }
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
     * Обработка окончания игры (общий метод)
     */
    handleGameOver(message) {
        console.log('Игра окончена:', message);
        
        window.player.defeatAnimation();
        
        // Если очки отрицательные, сразу сбрасываем прогресс и не показываем сообщение об ошибке
        if (this.currentScore < 0) {
            console.log('Сбрасываем прогресс из-за отрицательных очков');
            window.gameStorage.resetProgress();
        } else {
            // Показываем сообщение только если не отрицательные очки
            window.gameUI.showMessage(message, 'error');
        }

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
        
        // Устанавливаем флаг неправильного ответа
        this.lastAnswerCorrect = false;
        
        this.stopTimer();
        
        // Вычисляем штраф: 500 очков + номер уровня
        const penalty = 500 + this.currentLevel;
        this.currentScore -= penalty;
        
        // Обновляем отображение очков
        window.gameUI.updateScore(this.currentScore);
        
        // Показываем сообщение о штрафе
        window.gameUI.showMessage(`Время истекло! Штраф: -${penalty} очков`, 'warning');
        
        // Анимация штрафа
        window.gameUI.animatePenalty(penalty);
        
        // Монстр сначала подбегает к игроку, потом атакует
        window.monster.approachAndAttack(penalty);
        
        // Скрываем UI
        window.gameUI.hideMathProblem();
        window.gameUI.hideKeyboard();
        window.gameUI.hideInput();
        
        // Проверяем здоровье игрока и отрицательные очки
        if (!window.player.isAlive() || this.currentScore < 0) {
            if (this.currentScore < 0) {
                // Сбрасываем прогресс при отрицательных очках
                window.gameStorage.resetProgress();
                this.handleGameOver('Очки стали отрицательными! Игра окончена!');
            } else {
                this.handlePlayerDeath();
            }
        } else {
            // Продолжаем игру с того же уровня
            setTimeout(() => {
                this.continueAfterCombat();
            }, 2000);
            // Сохраняем прогресс только если очки не отрицательные
            window.gameStorage.updateScore(-penalty);
        }
    }

    /**
     * Продолжение игры после боя
     */
    continueAfterCombat() {
        this.combatActive = false;
        this.currentProblem = null;

        // Скрываем монстра
        window.monster.hide();

        // Переключаем тип монстра для следующего спавна
        window.monster.switchMonsterType();

        // Возвращаемся к музыке игры
        if (window.musicManager) {
            window.musicManager.playGameMusic();
        }

        // Возобновляем движение персонажа
        window.player.startWalking();

        // Запускаем спавн следующего монстра
        this.startMonsterSpawn();

        // Проверяем переход к следующей группе сумм только при правильном ответе
        if (this.lastAnswerCorrect) {
            this.checkSumGroupTransition();
        } else {
            // При неправильном ответе или истечении времени остаемся на том же уровне
            console.log('Остаемся на том же уровне из-за неправильного ответа');
        }
    }

    /**
     * Проверка перехода к следующей группе сумм
     */
    checkSumGroupTransition() {
        // Проверяем, завершена ли текущая группа сумм
        if (window.mathGame.isCurrentSumGroupCompleted()) {
            const currentSumGroup = window.mathGame.getCurrentSumGroup();
            const nextSumGroup = currentSumGroup + 1;
            
            // Если достигли максимума, начинаем заново
            if (nextSumGroup > 18) {
                this.currentLevel = 3; // Обновляем уровень в игровом движке
                window.mathGame.setLevel(3); // Начинаем заново с суммы 3
                window.gameUI.showMessage('Новый цикл! Начинаем заново!', 'info');
            } else {
                // Переходим к следующей группе сумм
                this.currentLevel = nextSumGroup; // Обновляем уровень в игровом движке
                window.mathGame.setLevel(nextSumGroup);
                window.gameUI.showMessage(`Новая группа: сумма ${nextSumGroup}!`, 'info');
            }
            
            // Сохраняем новый уровень
            window.gameStorage.updateLevel(this.currentLevel);
            
            // Обновляем сложность монстра
            const difficulty = window.mathGame.getLevelDifficulty();
            window.monster.setDifficulty(difficulty);
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
        window.mathGame.resetProgress();
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
            
            // Пауза музыки
            if (window.musicManager) {
                window.musicManager.pauseMusic();
            }
            
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
            
            // Возобновление музыки
            if (window.musicManager) {
                window.musicManager.resumeMusic();
            }
            
            window.gameUI.showMessage('Игра возобновлена', 'info');
        }
    }

    /**
     * Получение статистики прогресса
     */
    getProgressStats() {
        return window.mathGame.getProgressStats();
    }

    /**
     * Получение информации о текущей группе сумм
     */
    getCurrentSumGroupInfo() {
        return window.mathGame.getCurrentSumGroupInfo();
    }

    /**
     * Получение статистики по всем группам сумм
     */
    getSumGroupsStats() {
        return window.mathGame.getSumGroupsStats();
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