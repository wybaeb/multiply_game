/**
 * Модуль для управления пользовательским интерфейсом - адаптивный
 */

class GameUI {
    constructor() {
        this.elements = this.initializeElements();
        this.currentInput = '';
        this.isKeyboardVisible = false;
        this.isInputVisible = false;
        this.parallaxLayers = [];
        this.parallaxActive = false;
        this.parallaxOffsets = [0, 0, 0, 0];
        this.lastParallaxUpdate = null;
        this.parallaxAnimation = null;
        this.bindEvents();
        this.initResizeHandler();
    }

    /**
     * Инициализация элементов UI
     */
    initializeElements() {
        return {
            // Экраны
            loadingScreen: document.getElementById('loading-screen'),
            menuScreen: document.getElementById('menu-screen'),
            
            // Игровые элементы
            gameContainer: document.getElementById('game-container'),
            parallaxContainer: document.getElementById('parallax-container'),
            gameObjects: document.getElementById('game-objects'),
            uiContainer: document.getElementById('ui-container'),
            
            // Персонажи
            player: document.getElementById('player'),
            playerSprite: document.getElementById('player-sprite'),
            monster: document.getElementById('monster'),
            monsterSprite: document.getElementById('monster-sprite'),
            
            // UI элементы
            resetBtn: document.getElementById('reset-btn'),
            scoreContainer: document.getElementById('score-container'),
            scoreText: document.getElementById('score-text'),
            scoreAnimation: document.getElementById('score-animation'),
            timerContainer: document.getElementById('timer-container'),
            timerBar: document.getElementById('timer-bar'),
            timerText: document.getElementById('timer-text'),
            
            // Математические элементы
            mathProblem: document.getElementById('math-problem'),
            problemText: document.getElementById('problem-text'),
            keyboard: document.getElementById('keyboard'),
            inputContainer: document.getElementById('input-container'),
            answerInput: document.getElementById('answer-input'),
            
            // Меню
            currentLevel: document.getElementById('current-level'),
            totalScore: document.getElementById('total-score'),
            startGameBtn: document.getElementById('start-game-btn'),
            resetProgressBtn: document.getElementById('reset-progress-btn'),
            musicToggleBtn: document.getElementById('music-toggle-btn'),
            
            // Эффекты
            effectsContainer: document.getElementById('effects-container')
        };
    }

    /**
     * Обработчик изменения размера окна
     */
    initResizeHandler() {
        window.addEventListener('resize', () => {
            this.updateUIScaling();
            // Обновляем позицию поля ввода при изменении размера окна
            if (this.isInputVisible) {
                setTimeout(() => this.updateInputWidth(), 100);
            }
        });
        
        // Обработчик изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateUIScaling();
                if (this.isInputVisible) {
                    this.updateInputWidth();
                }
            }, 500);
        });
    }

    /**
     * Обновление масштабирования UI
     */
    updateUIScaling() {
        // Обновляем размеры элементов в зависимости от размера экрана
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Масштабируем шрифты
        const baseFontSize = Math.min(screenWidth, screenHeight) / 50;
        
        // Обновляем размеры кнопок клавиатуры
        const keyButtons = document.querySelectorAll('.key-btn');
        const keySize = Math.max(30, Math.min(60, Math.min(screenWidth, screenHeight) / 20));
        
        keyButtons.forEach(btn => {
            btn.style.width = `${keySize}px`;
            btn.style.height = `${keySize}px`;
            btn.style.fontSize = `${Math.max(10, keySize / 4)}px`;
        });
        
        // Обновляем размеры таймера
        if (this.elements.timerContainer) {
            const timerWidth = Math.max(200, Math.min(400, screenWidth * 0.3));
            const timerHeight = Math.max(25, Math.min(50, screenHeight * 0.05));
            this.elements.timerContainer.style.width = `${timerWidth}px`;
            this.elements.timerContainer.style.height = `${timerHeight}px`;
        }
        
        // Вычисляем ширину клавиатуры и применяем к полю ввода
        this.updateInputWidth();
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        // Кнопка сброса
        this.elements.resetBtn.addEventListener('click', () => {
            // Останавливаем игру, если она запущена
            if (window.gameEngine && window.gameEngine.isGameActive()) {
                window.gameEngine.stopGame();
            } else {
                this.showMenu();
            }
        });

        // Кнопки клавиатуры
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const digit = e.target.dataset.digit;
                if (digit) {
                    this.handleKeyPress(digit);
                }
            });
        });

        // Кнопка очистки
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearInput();
        });

        // Кнопка ввода
        document.getElementById('enter-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Кнопки меню
        this.elements.startGameBtn.addEventListener('click', () => {
            this.hideMenu();
            if (window.gameEngine) {
                window.gameEngine.startGame();
            }
        });

        this.elements.resetProgressBtn.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите начать заново? Весь прогресс будет потерян.')) {
                if (window.gameEngine) {
                    window.gameEngine.reset();
                }
            }
        });

        // Кнопка управления музыкой
        const musicToggleBtn = document.getElementById('music-toggle-btn');
        if (musicToggleBtn) {
            musicToggleBtn.addEventListener('click', () => {
                if (window.musicManager) {
                    const isMusicOn = window.musicManager.toggleMusic();
                    musicToggleBtn.textContent = isMusicOn ? '🔊 Музыка' : '🔇 Музыка';
                }
            });
        }

        // Обработчики новых кнопок статистики
        const showStatsBtn = document.getElementById('show-stats-btn');
        if (showStatsBtn) {
            showStatsBtn.addEventListener('click', () => {
                this.showSumGroupsStats();
            });
        }

        const showProgressBtn = document.getElementById('show-progress-btn');
        if (showProgressBtn) {
            showProgressBtn.addEventListener('click', () => {
                this.showProgressStats();
            });
        }

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }

    /**
     * Обработка нажатия клавиши
     */
    handleKeyPress(digit) {
        if (this.currentInput.length < 3) {
            this.currentInput += digit;
            this.updateInputDisplay();
        }
    }

    /**
     * Обработка ввода с клавиатуры
     */
    handleKeyboardInput(e) {
        if (!this.isKeyboardVisible) return;

        if (e.key >= '0' && e.key <= '9') {
            this.handleKeyPress(e.key);
        } else if (e.key === 'Enter') {
            this.submitAnswer();
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            this.clearInput();
        }
    }

    /**
     * Очистка ввода
     */
    clearInput() {
        this.currentInput = '';
        this.updateInputDisplay();
    }

    /**
     * Обновление отображения ввода
     */
    updateInputDisplay() {
        if (this.elements.answerInput) {
            this.elements.answerInput.value = this.currentInput;
        }
    }

    /**
     * Отправка ответа
     */
    submitAnswer() {
        if (this.currentInput && window.gameEngine) {
            const answer = parseInt(this.currentInput);
            window.gameEngine.checkAnswer(answer);
            this.currentInput = '';
            this.updateInputDisplay();
        }
    }

    /**
     * Показ экрана загрузки
     */
    showLoading() {
        this.hideAllScreens();
        this.elements.loadingScreen.classList.remove('hidden');
    }

    /**
     * Скрытие экрана загрузки
     */
    hideLoading() {
        this.elements.loadingScreen.classList.add('hidden');
    }

    /**
     * Показ меню
     */
    showMenu() {
        this.hideAllScreens();
        this.elements.menuScreen.classList.remove('hidden');
        this.updateMenuStats();
    }

    /**
     * Скрытие меню
     */
    hideMenu() {
        this.elements.menuScreen.classList.add('hidden');
    }

    /**
     * Скрытие всех экранов
     */
    hideAllScreens() {
        this.elements.loadingScreen.classList.add('hidden');
        this.elements.menuScreen.classList.add('hidden');
    }

    /**
     * Обновление статистики в меню
     */
    updateMenuStats() {
        if (window.gameStorage) {
            const gameData = window.gameStorage.loadGameData();
            if (this.elements.currentLevel) {
                // Показываем текущую группу сумм вместо уровня
                const currentSumGroup = window.mathGame ? window.mathGame.getCurrentSumGroup() : 3;
                this.elements.currentLevel.textContent = `Сумма ${currentSumGroup}`;
            }
            if (this.elements.totalScore) {
                this.elements.totalScore.textContent = gameData.totalScore;
            }
            
            // Обновляем текст кнопки в зависимости от наличия сохраненных очков
            if (this.elements.startGameBtn) {
                if (gameData.totalScore > 0) {
                    this.elements.startGameBtn.textContent = 'Продолжить игру';
                } else {
                    this.elements.startGameBtn.textContent = 'Начать игру';
                }
            }
            
            // Обновляем состояние кнопки музыки
            if (this.elements.musicToggleBtn && window.musicManager) {
                const isMusicOn = window.musicManager.isMusicOn();
                this.elements.musicToggleBtn.textContent = isMusicOn ? '🔊 Музыка' : '🔇 Музыка';
            }
        }
    }

    /**
     * Обновление счета
     */
    updateScore(score) {
        if (this.elements.scoreText) {
            this.elements.scoreText.textContent = score;
            this.animateScore();
        }
    }

    /**
     * Анимация счета
     */
    animateScore() {
        if (this.elements.scoreAnimation) {
            this.elements.scoreAnimation.classList.add('score-coin-spin');
            setTimeout(() => {
                this.elements.scoreAnimation.classList.remove('score-coin-spin');
            }, 600);
        }
    }

    /**
     * Обновление таймера
     */
    updateTimer(seconds) {
        if (this.elements.timerText) {
            this.elements.timerText.textContent = seconds;
        }
        
        if (this.elements.timerBar) {
            const percentage = (seconds / 60) * 100;
            this.elements.timerBar.style.width = `${percentage}%`;
            
            // Добавляем предупреждение при малом времени
            if (seconds <= 10) {
                this.elements.timerContainer.classList.add('timer-warning');
            } else {
                this.elements.timerContainer.classList.remove('timer-warning');
            }
        }
    }

    /**
     * Показ математической задачи
     */
    showMathProblem(problemText) {
        if (this.elements.problemText) {
            this.elements.problemText.textContent = problemText;
        }
        if (this.elements.mathProblem) {
            this.elements.mathProblem.classList.remove('hidden');
            this.elements.mathProblem.classList.add('fade-in');
        }
    }

    /**
     * Скрытие математической задачи
     */
    hideMathProblem() {
        if (this.elements.mathProblem) {
            this.elements.mathProblem.classList.add('fade-out');
            setTimeout(() => {
                this.elements.mathProblem.classList.add('hidden');
                this.elements.mathProblem.classList.remove('fade-out');
            }, 300);
        }
    }

    /**
     * Показ клавиатуры
     */
    showKeyboard() {
        if (this.elements.keyboard) {
            this.elements.keyboard.classList.remove('hidden');
            this.elements.keyboard.classList.add('slide-in-right');
            this.isKeyboardVisible = true;
            // Обновляем ширину поля ввода после показа клавиатуры
            setTimeout(() => this.updateInputWidth(), 100);
        }
    }

    /**
     * Скрытие клавиатуры
     */
    hideKeyboard() {
        if (this.elements.keyboard) {
            this.elements.keyboard.classList.add('slide-out-right');
            setTimeout(() => {
                this.elements.keyboard.classList.add('hidden');
                this.elements.keyboard.classList.remove('slide-out-right');
            }, 500);
            this.isKeyboardVisible = false;
        }
    }

    /**
     * Показ поля ввода
     */
    showInput() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.classList.remove('hidden');
            this.elements.inputContainer.classList.add('fade-in');
            this.isInputVisible = true;
            // Обновляем ширину поля ввода
            this.updateInputWidth();
        }
    }

    /**
     * Скрытие поля ввода
     */
    hideInput() {
        if (this.elements.inputContainer) {
            this.elements.inputContainer.classList.add('fade-out');
            setTimeout(() => {
                this.elements.inputContainer.classList.add('hidden');
                this.elements.inputContainer.classList.remove('fade-out');
            }, 300);
            this.isInputVisible = false;
        }
    }

    /**
     * Анимация правильного ответа
     */
    animateCorrectAnswer() {
        if (this.elements.mathProblem) {
            this.elements.mathProblem.classList.add('correct-answer');
            setTimeout(() => {
                this.elements.mathProblem.classList.remove('correct-answer');
            }, 500);
        }
    }

    /**
     * Анимация неправильного ответа
     */
    animateWrongAnswer() {
        if (this.elements.mathProblem) {
            this.elements.mathProblem.classList.add('wrong-answer');
            setTimeout(() => {
                this.elements.mathProblem.classList.remove('wrong-answer');
            }, 500);
        }
    }

    /**
     * Анимация монет
     */
    animateCoins(count = 1) {
        // Максимальное время анимации - 3 секунды
        const maxAnimationTime = 3000;
        
        // Определяем время полета одной монеты в зависимости от размера экрана
        let singleCoinFlightTime;
        if (window.innerWidth <= 768) {
            singleCoinFlightTime = 500; // Мобильные устройства
        } else if (window.innerWidth >= 1200) {
            singleCoinFlightTime = 700; // Большие экраны
        } else {
            singleCoinFlightTime = 600; // Средние экраны
        }
        
        // Время анимации счетчика очков
        const scoreAnimationDelay = 200;
        
        // Рассчитываем задержку между монетами так, чтобы общее время не превышало maxAnimationTime
        const totalDelayTime = maxAnimationTime - singleCoinFlightTime - scoreAnimationDelay;
        const delayBetweenCoins = Math.max(50, Math.floor(totalDelayTime / Math.max(1, count - 1)));
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createCoinAnimation();
            }, i * delayBetweenCoins);
        }
        
        // Анимация счетчика очков в конце полета всех монет
        setTimeout(() => {
            this.animateScore();
        }, (count - 1) * delayBetweenCoins + singleCoinFlightTime + scoreAnimationDelay);
    }

    /**
     * Создание анимации монеты
     */
    createCoinAnimation() {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        
        // Адаптивный размер монеты
        const coinSize = Math.max(20, Math.min(40, Math.min(window.innerWidth, window.innerHeight) / 30));
        
        // Получаем позиции таймера и счетчика очков
        const timerContainer = document.getElementById('timer-container');
        const scoreContainer = document.getElementById('score-container');
        
        let startX, startY, endX, endY;
        
        if (timerContainer && scoreContainer) {
            const timerRect = timerContainer.getBoundingClientRect();
            const scoreRect = scoreContainer.getBoundingClientRect();
            
            // Начальная позиция - центр таймера
            startX = timerRect.left + timerRect.width / 2;
            startY = timerRect.top + timerRect.height / 2;
            
            // Конечная позиция - центр счетчика очков
            endX = scoreRect.left + scoreRect.width / 2;
            endY = scoreRect.top + scoreRect.height / 2;
        } else {
            // Fallback позиции если элементы не найдены
            startX = window.innerWidth / 2; // центр экрана по горизонтали
            startY = window.innerHeight - 50; // нижняя часть экрана
            endX = window.innerWidth - 50; // правый край экрана
            endY = 50; // верхняя часть экрана
        }
        
        // Добавляем небольшое случайное смещение для более естественной анимации
        const randomOffsetX = (Math.random() - 0.5) * 20;
        const randomOffsetY = (Math.random() - 0.5) * 20;
        
        // Случайный начальный спрайт монеты для разнообразия
        const coinSprites = ['coin1.png', 'coin2.png', 'coin3.png', 'coin4.png', 'coin5.png'];
        const randomSprite = coinSprites[Math.floor(Math.random() * coinSprites.length)];
        
        coin.style.cssText = `
            position: fixed;
            width: ${coinSize}px;
            height: ${coinSize}px;
            background-image: url('sprites/coin/${randomSprite}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 30;
            left: ${startX + randomOffsetX}px;
            top: ${startY + randomOffsetY}px;
            transform: translate(-50%, -50%);
            image-rendering: pixelated;
        `;

        document.body.appendChild(coin);

        // Анимация полета монеты
        setTimeout(() => {
            coin.classList.add('coin-fly');
            
            // Создаем случайные завихрения для каждой монеты
            const swirlIntensity = 30 + Math.random() * 40; // 30-70px интенсивность завихрений
            const swirlDirection = Math.random() > 0.5 ? 1 : -1; // Случайное направление
            const swirlOffset = Math.random() * 20 - 10; // Случайное смещение
            
            // Устанавливаем конечную позицию через CSS переменные с завихрениями
            coin.style.setProperty('--end-x', `${endX - startX - randomOffsetX}px`);
            coin.style.setProperty('--end-y', `${endY - startY - randomOffsetY}px`);
            coin.style.setProperty('--swirl-intensity', `${swirlIntensity}px`);
            coin.style.setProperty('--swirl-direction', `${swirlDirection}`);
            coin.style.setProperty('--swirl-offset', `${swirlOffset}px`);
        }, 100);

        // Звуковой эффект для монеты (только для каждой пятой монеты)
        if (Math.random() < 0.2) { // 20% вероятность = 1/5 монет
            try {
                const coinSound = new Audio('sprites/music/smrpg_coin.wav');
                coinSound.volume = 0.4; // Умеренная громкость
                coinSound.play().catch(e => console.log('Не удалось воспроизвести звук монеты:', e));
            } catch (e) {
                console.log('Ошибка создания звука монеты:', e);
            }
        }

        // Удаление монеты
        setTimeout(() => {
            if (coin.parentNode) {
                coin.parentNode.removeChild(coin);
            }
        }, 600); // Соответствует времени CSS анимации
    }

    /**
     * Анимация штрафа
     */
    animatePenalty(penalty) {
        // Создаем элемент для отображения штрафа
        const penaltyElement = document.createElement('div');
        penaltyElement.className = 'penalty-animation';
        penaltyElement.textContent = `-${penalty}`;
        
        // Адаптивный размер шрифта
        const fontSize = Math.max(16, Math.min(32, Math.min(window.innerWidth, window.innerHeight) / 40));
        
        // Получаем позицию счетчика очков
        const scoreContainer = document.getElementById('score-container');
        let startX, startY;
        
        if (scoreContainer) {
            const scoreRect = scoreContainer.getBoundingClientRect();
            startX = scoreRect.left + scoreRect.width / 2;
            startY = scoreRect.top + scoreRect.height / 2;
        } else {
            // Fallback позиции
            startX = window.innerWidth - 50;
            startY = 50;
        }
        
        penaltyElement.style.cssText = `
            position: fixed;
            font-size: ${fontSize}px;
            font-weight: bold;
            color: #ff4444;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            z-index: 40;
            left: ${startX}px;
            top: ${startY}px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            opacity: 1;
        `;

        document.body.appendChild(penaltyElement);

        // Анимация появления и исчезновения
        setTimeout(() => {
            penaltyElement.style.transition = 'all 1.5s ease-out';
            penaltyElement.style.transform = 'translate(-50%, -50%) scale(1.5)';
            penaltyElement.style.opacity = '0';
        }, 100);



        // Удаление элемента штрафа
        setTimeout(() => {
            if (penaltyElement.parentNode) {
                penaltyElement.parentNode.removeChild(penaltyElement);
            }
        }, 1600);
    }

    /**
     * Анимация монет при штрафе
     */
    animatePenaltyCoins(penalty) {
        // Вычисляем количество монет: минимум 3, максимум 8 монет
        const coinCount = Math.max(3, Math.min(8, Math.floor(penalty / 10) + 3));
        
        // Получаем позицию игрока для начала анимации
        const playerElement = document.getElementById('player');
        let startX, startY;
        
        if (playerElement) {
            const playerRect = playerElement.getBoundingClientRect();
            startX = playerRect.left + playerRect.width / 2;
            startY = playerRect.top + playerRect.height / 2;
        } else {
            // Fallback позиции
            startX = window.innerWidth * 0.2; // 20% от ширины экрана
            startY = window.innerHeight * 0.6; // 60% от высоты экрана
        }
        
        // Создаем все монеты одновременно как салют
        for (let i = 0; i < coinCount; i++) {
            this.createPenaltyCoinAnimation(startX, startY);
        }
    }

    /**
     * Создание анимации монеты при штрафе с физикой
     */
    createPenaltyCoinAnimation(startX, startY) {
        const coin = document.createElement('div');
        coin.className = 'penalty-coin-animation';
        
        // Адаптивный размер монеты
        const coinSize = Math.max(20, Math.min(40, Math.min(window.innerWidth, window.innerHeight) / 30));
        
        // Случайный спрайт монеты
        const coinSprites = ['coin1.png', 'coin2.png', 'coin3.png', 'coin4.png', 'coin5.png'];
        const randomSprite = coinSprites[Math.floor(Math.random() * coinSprites.length)];
        
        // Получаем позицию пола
        const floorY = window.innerHeight - 50; // 50px от нижнего края
        
        // Физические параметры
        const gravity = 0.6; // пикселей в кадр
        const initialVelocity = 12 + Math.random() * 8; // 12-20 пикселей в кадр
        
        // Угол вылета: ±45 градусов от вертикали
        const angle = (Math.random() - 0.5) * Math.PI / 2; // от -45 до +45 градусов
        let velocityX = Math.sin(angle) * initialVelocity;
        let velocityY = -Math.cos(angle) * initialVelocity; // отрицательная - вверх
        
        // Начальная позиция
        let x = startX;
        let y = startY;
        
        // Случайная задержка для разных фаз анимации
        const randomDelay = Math.random() * 0.3;
        
        // Случайная скорость вращения
        const spinSpeed = 1.5 + Math.random() * 1;
        let rotation = 0;
        
        coin.style.cssText = `
            position: fixed;
            width: ${coinSize}px;
            height: ${coinSize}px;
            background-image: url('sprites/coin/${randomSprite}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 35;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%) rotate(0deg);
            image-rendering: pixelated;
            opacity: 1;
        `;

        document.body.appendChild(coin);

        // Анимация с физикой
        const animate = () => {
            // Применяем гравитацию
            velocityY += gravity;
            
            // Обновляем позицию
            x += velocityX;
            y += velocityY;
            
            // Вращение
            rotation += 360 / (spinSpeed * 60); // 60 FPS
            
            // Проверяем столкновение с полом
            if (y >= floorY - coinSize / 2) {
                y = floorY - coinSize / 2;
                velocityY = -velocityY * 0.7; // отскок с потерей энергии
                
                // Если скорость слишком мала, останавливаем
                if (Math.abs(velocityY) < 1.5) {
                    velocityY = 0;
                }
            }
            
            // Проверяем границы экрана по горизонтали
            if (x < coinSize / 2) {
                x = coinSize / 2;
                velocityX = -velocityX * 0.8;
            } else if (x > window.innerWidth - coinSize / 2) {
                x = window.innerWidth - coinSize / 2;
                velocityX = -velocityX * 0.8;
            }
            
            // Обновляем позицию монеты
            coin.style.left = `${x}px`;
            coin.style.top = `${y}px`;
            coin.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            
            // Продолжаем анимацию если монета еще движется или время не истекло
            if ((Math.abs(velocityY) > 0.5 || Math.abs(velocityX) > 0.5) && Date.now() - startTime < 3000) {
                requestAnimationFrame(animate);
            } else {
                // Плавно исчезаем
                coin.style.transition = 'opacity 0.5s ease-out';
                coin.style.opacity = '0';
                setTimeout(() => {
                    if (coin.parentNode) {
                        coin.parentNode.removeChild(coin);
                    }
                }, 500);
            }
        };
        
        const startTime = Date.now();
        setTimeout(() => {
            requestAnimationFrame(animate);
        }, 50 + randomDelay * 1000);
    }

    /**
     * Показ персонажа
     */
    showPlayer() {
        if (this.elements.player) {
            this.elements.player.classList.remove('hidden');
        }
    }

    /**
     * Скрытие персонажа
     */
    hidePlayer() {
        if (this.elements.player) {
            this.elements.player.classList.add('hidden');
        }
    }

    /**
     * Показ монстра
     */
    showMonster() {
        if (this.elements.monster) {
            this.elements.monster.classList.remove('hidden');
        }
    }

    /**
     * Скрытие монстра
     */
    hideMonster() {
        if (this.elements.monster) {
            this.elements.monster.classList.add('hidden');
        }
    }

    /**
     * Анимация персонажа
     */
    animatePlayer(action) {
        if (this.elements.playerSprite) {
            this.elements.playerSprite.className = action;
        }
    }

    /**
     * Анимация монстра
     */
    animateMonster(action) {
        if (this.elements.monsterSprite) {
            this.elements.monsterSprite.className = action;
        }
    }

    /**
     * Запуск параллакса
     */
    startParallax() {
        if (this.parallaxActive) return;
        
        this.parallaxActive = true;
        this.parallaxLayers = [
            document.getElementById('bg-layer-1'),
            document.getElementById('bg-layer-2'),
            document.getElementById('bg-layer-3'),
            document.getElementById('bg-layer-4')
        ];

        // Сбрасываем offset'ы
        this.parallaxOffsets = [0, 0, 0, 0];
        this.lastParallaxUpdate = null;

        // Запускаем JavaScript управление параллаксом
        this.startJavaScriptParallax();
    }

    /**
     * JavaScript управление параллаксом с постоянно увеличивающимся offset
     */
    startJavaScriptParallax() {
        if (!this.parallaxActive) return;
        
        // Скорости для каждого слоя (пикселей в секунду) - УВЕЛИЧЕНЫ В 8 РАЗ ОТ ИСХОДНЫХ
        // Сохраняем ваши исходные скорости: 40s, 30s, 20s, 15s
        const speeds = [16, 24, 32, 40]; // Медленный, средний, быстрый, очень быстрый (было 8, 12, 16, 20)
        
        // Запускаем анимацию
        this.parallaxAnimation = requestAnimationFrame(() => {
            this.updateParallax(speeds);
        });
    }

    /**
     * Обновление параллакса
     */
    updateParallax(speeds) {
        if (!this.parallaxActive) return;
        
        const now = Date.now();
        if (!this.lastParallaxUpdate) {
            this.lastParallaxUpdate = now;
        }
        
        const deltaTime = (now - this.lastParallaxUpdate) / 1000; // в секундах
        this.lastParallaxUpdate = now;
        
        // Обновляем позиции каждого слоя
        this.parallaxLayers.forEach((layer, index) => {
            if (layer) {
                // Увеличиваем offset (никогда не обнуляем!)
                this.parallaxOffsets[index] += speeds[index] * deltaTime;
                
                // Применяем позицию через background-position
                layer.style.backgroundPosition = `${-this.parallaxOffsets[index]}px 0`;
            }
        });
        
        // Продолжаем анимацию
        this.parallaxAnimation = requestAnimationFrame(() => {
            this.updateParallax(speeds);
        });
    }

    /**
     * Остановка JavaScript параллакса
     */
    stopJavaScriptParallax() {
        if (this.parallaxAnimation) {
            cancelAnimationFrame(this.parallaxAnimation);
            this.parallaxAnimation = null;
        }
        this.lastParallaxUpdate = null;
    }

    /**
     * Остановка параллакса
     */
    stopParallax() {
        this.parallaxActive = false;
        this.parallaxLayers.forEach(layer => {
            if (layer) {
                layer.classList.remove('parallax-slow', 'parallax-medium', 'parallax-fast', 'parallax-very-fast');
            }
        });
        
        // Останавливаем JavaScript параллакс
        this.stopJavaScriptParallax();
    }

    /**
     * Показ сообщения
     */
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // Адаптивные стили для сообщения
        const fontSize = Math.max(14, Math.min(24, Math.min(window.innerWidth, window.innerHeight) / 40));
        
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border: 3px solid #fff;
            font-family: 'Press Start 2P', cursive;
            font-size: ${fontSize}px;
            z-index: 1000;
            text-align: center;
        `;

        document.body.appendChild(messageElement);

        // Удаление сообщения
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }

    /**
     * Сброс UI
     */
    reset() {
        this.currentInput = '';
        this.isKeyboardVisible = false;
        this.isInputVisible = false;
        this.updateInputDisplay();
        this.hideMathProblem();
        this.hideKeyboard();
        this.hideInput();
        this.updateUIScaling();
    }

    /**
     * Получение текущего ввода
     */
    getCurrentInput() {
        return this.currentInput;
    }

    /**
     * Проверка, показана ли клавиатура
     */
    isKeyboardShown() {
        return this.isKeyboardVisible;
    }

    /**
     * Проверка, показано ли поле ввода
     */
    isInputShown() {
        return this.isInputVisible;
    }

    /**
     * Обновление ширины поля ввода на основе ширины клавиатуры
     */
    updateInputWidth() {
        if (this.elements.keyboard && this.elements.inputContainer) {
            // Получаем первый ряд клавиатуры
            const firstRow = this.elements.keyboard.querySelector('.keyboard-row');
            if (firstRow) {
                // Вычисляем ширину ряда (3 кнопки + 2 промежутка)
                const buttons = firstRow.querySelectorAll('.key-btn');
                if (buttons.length >= 3) {
                    const buttonWidth = buttons[0].offsetWidth;
                    const gap = parseFloat(getComputedStyle(firstRow).gap);
                    const totalWidth = 3 * buttonWidth + 2 * gap;
                    
                    // Применяем ширину к контейнеру поля ввода
                    this.elements.inputContainer.style.width = `${totalWidth}px`;
                    
                    // Убеждаемся, что поле ввода имеет тень
                    if (this.elements.answerInput) {
                        this.elements.answerInput.style.boxShadow = '3px 3px 0 #000 !important';
                        this.elements.inputContainer.style.boxShadow = '3px 3px 0 #000 !important';
                    }
                }
            }
        }
    }

    /**
     * Показ информации о текущей группе сумм
     */
    showSumGroupInfo() {
        if (!window.mathGame) return;

        const sumGroupInfo = window.mathGame.getCurrentSumGroupInfo();
        const progressStats = window.mathGame.getProgressStats();
        
        // Создаем информационное сообщение
        const message = `Группа: сумма ${sumGroupInfo.sum} (${sumGroupInfo.currentIndex + 1}/${sumGroupInfo.totalProblems})
Прогресс: ${progressStats.solvedProblems}/${progressStats.totalProblems} примеров (${progressStats.progressPercentage}%)
Сложность: ${this.getDifficultyText(sumGroupInfo.difficulty)}`;
        
        this.showMessage(message, 'info');
    }

    /**
     * Получение текста сложности
     */
    getDifficultyText(difficulty) {
        const difficultyTexts = {
            'easy': 'Легкая',
            'medium': 'Средняя',
            'hard': 'Сложная',
            'very_hard': 'Очень сложная',
            'expert': 'Эксперт'
        };
        return difficultyTexts[difficulty] || 'Неизвестно';
    }

    /**
     * Показ статистики прогресса
     */
    showProgressStats() {
        if (!window.mathGame) return;

        const stats = window.mathGame.getProgressStats();
        const sumGroupInfo = window.mathGame.getCurrentSumGroupInfo();
        
        const message = `Общий прогресс: ${stats.progressPercentage}%
Решено примеров: ${stats.solvedProblems}/${stats.totalProblems}
Текущая группа: сумма ${sumGroupInfo.sum} (${sumGroupInfo.currentIndex + 1}/${sumGroupInfo.totalProblems})
Прогресс группы: ${sumGroupInfo.currentIndex + 1}/${sumGroupInfo.totalProblems}`;
        
        this.showMessage(message, 'info');
    }

    /**
     * Показ статистики по всем группам сумм
     */
    showSumGroupsStats() {
        if (!window.mathGame) return;

        const stats = window.mathGame.getSumGroupsStats();
        let message = 'Статистика по группам сумм:\n';
        
        // Показываем только группы с прогрессом
        for (let sum = 3; sum <= 18; sum++) {
            if (stats[sum] && stats[sum].solvedProblems > 0) {
                message += `Сумма ${sum}: ${stats[sum].solvedProblems}/${stats[sum].totalProblems} (${stats[sum].progressPercentage}%)\n`;
            }
        }
        
        this.showMessage(message, 'info');
    }
}

// Создаем глобальный экземпляр
window.gameUI = new GameUI(); 