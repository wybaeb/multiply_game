/**
 * Модуль для управления монстром - адаптивный
 */

// Helper function to get correct sprite path
function getSpritePath(path) {
    // Check if we're running from a subdirectory (like js/)
    const currentPath = window.location.pathname;
    if (currentPath.includes('/js/') || currentPath.endsWith('/js')) {
        return `../sprites/${path}`;
    } else {
        return `sprites/${path}`;
    }
}

class Monster {
    constructor() {
        this.element = document.getElementById('monster');
        this.sprite = document.getElementById('monster-sprite');
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isMoving = false;
        this.position = { x: 75, y: 5 }; // в процентах
        this.health = 100;
        this.maxHealth = 100;
        this.difficulty = 1;
        this.moveSpeed = 2;
        this.attackCooldown = 0;
        this.attackCooldownTime = 2000; // 2 секунды
        this.lastAttackTime = 0;
        this.spriteSize = this.calculateSpriteSize();
        this.monsterType = 'monstr1'; // Текущий тип монстра
        this.monsterTypes = ['monstr1', 'monstr2']; // Доступные типы монстров
        this.currentMonsterIndex = 0; // Индекс текущего монстра
        this.initResizeHandler();
        this.setPosition(this.position.x, this.position.y);
    }

    /**
     * Расчет размера спрайта в зависимости от размера экрана
     */
    calculateSpriteSize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Базовый размер для экрана 1920x1080
        const baseWidth = 1920;
        const baseHeight = 1080;
        
        // Масштабируем размер спрайта
        const scaleX = screenWidth / baseWidth;
        const scaleY = screenHeight / baseHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Базовый размер спрайта монстра (одинаковый с игроком)
        const baseSpriteSize = 400;
        const spriteSize = Math.max(240, Math.min(400, baseSpriteSize * scale));
        
        return {
            width: spriteSize,
            height: spriteSize
        };
    }

    /**
     * Обработчик изменения размера окна
     */
    initResizeHandler() {
        window.addEventListener('resize', () => {
            this.spriteSize = this.calculateSpriteSize();
            this.updateSpriteSize();
        });
    }

    /**
     * Обновление размера спрайта
     */
    updateSpriteSize() {
        if (this.sprite) {
            this.sprite.style.width = `${this.spriteSize.width}px`;
            this.sprite.style.height = `${this.spriteSize.height}px`;
        }
    }

    /**
     * Инициализация монстра
     */
    init() {
        this.updateMonsterSprites();
        this.updateSpriteSize();
        this.hide();
    }

    /**
     * Показ монстра
     */
    show() {
        this.element.classList.remove('hidden');
        this.updateSpriteSize();
        this.updateMonsterSprites(); // Обновляем спрайты для текущего типа монстра
        this.startWalking();
        this.element.classList.add('monster-appear');
    }

    /**
     * Скрытие монстра
     */
    hide() {
        this.element.classList.add('hidden');
        this.stopWalking();
    }

    /**
     * Начало движения
     */
    startWalking() {
        if (this.currentState !== 'walking') {
            this.currentState = 'walking';
            this.isMoving = true;
            this.animate('monster-walking');
        }
    }

    /**
     * Остановка движения
     */
    stopWalking() {
        if (this.currentState === 'walking') {
            this.currentState = 'idle';
            this.isMoving = false;
            this.animate('idle');
        }
    }

    /**
     * Автоматическое движение монстра
     */
    autoMove() {
        // Если монстр видим, но не движется, запускаем движение
        if (this.isVisibleNow() && !this.isMoving && this.currentState === 'idle') {
            this.startWalking();
        }
        

        
        // Получаем оставшееся время из игрового движка
        const remainingTime = window.gameEngine ? window.gameEngine.getRemainingTime() : 60;
        const maxTime = 60; // Максимальное время таймера
        
        // Вычисляем позицию монстра на основе оставшегося времени
        // Когда время = 0, монстр должен зайти на середину героя
        // Позиция героя примерно 20%, середина героя = 20% + (размер спрайта / 2)
        const playerPosition = 20; // Позиция героя в процентах
        const playerSpriteWidth = this.spriteSize.width; // Ширина спрайта героя
        const screenWidth = window.innerWidth;
        const playerSpriteWidthPercent = (playerSpriteWidth / screenWidth) * 100;
        const playerCenter = playerPosition + (playerSpriteWidthPercent / 2);
        
        // Начальная позиция монстра (75%)
        const startPosition = 75;
        
        // Позиция для атаки - левая грань монстра заходит за правую грань героя наполовину ширины спрайта
        // Правая грань героя = playerPosition + playerSpriteWidthPercent
        // Левая грань монстра должна быть на playerPosition + playerSpriteWidthPercent - (ширина спрайта монстра / 2)
        const monsterSpriteWidthPercent = (this.spriteSize.width / screenWidth) * 100;
        const attackPosition = playerPosition + playerSpriteWidthPercent - (monsterSpriteWidthPercent / 2);
        
        // Вычисляем целевую позицию на основе времени
        let targetPosition;
        if (remainingTime <= 0) {
            // Когда время истекло, монстр заходит на позицию атаки
            targetPosition = attackPosition;
        } else {
            // Пропорциональное приближение
            const timeProgress = (maxTime - remainingTime) / maxTime; // 0 до 1
            const distanceToPlayer = startPosition - attackPosition;
            targetPosition = startPosition - (distanceToPlayer * timeProgress);
        }
        
        const currentLeft = parseFloat(this.element.style.left) || startPosition;
        
        // Плавное движение к целевой позиции
        if (Math.abs(currentLeft - targetPosition) > 0.1) {
            const moveSpeed = this.moveSpeed || 2; // Значение по умолчанию
            const moveStep = moveSpeed * 0.1; // Уменьшаем скорость для плавности
            let newLeft;
            
            if (currentLeft > targetPosition) {
                newLeft = currentLeft - moveStep;
            } else {
                newLeft = currentLeft + moveStep;
            }
            
            // Проверяем, что newLeft не NaN
            if (!isNaN(newLeft) && isFinite(newLeft)) {
                this.element.style.left = `${newLeft}%`;
            } else {
                console.error(`Invalid newLeft value: ${newLeft}, currentLeft: ${currentLeft}, moveStep: ${moveStep}, moveSpeed: ${this.moveSpeed}`);
            }
        }
        
        // Если время истекло и монстр достиг позиции атаки, атакуем
        if (remainingTime <= 0 && currentLeft <= attackPosition) {
            this.stopWalking();
            this.attack();
        }
    }

    /**
     * Атака
     */
    attack(penalty = null) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldownTime) {
            return false;
        }

        this.isAttacking = true;
        this.currentState = 'attacking';
        this.lastAttackTime = now;

        // Анимация атаки
        this.animate('monster-attacking');

        // Воспроизведение звука атаки
        try {
            const attackSound = new Audio(getSpritePath('music/attack.mp3'));
            attackSound.volume = 0.5; // Умеренная громкость
            attackSound.play().catch(e => console.log('Не удалось воспроизвести звук атаки:', e));
        } catch (e) {
            console.log('Ошибка создания звука атаки:', e);
        }

        // Если есть штраф, запускаем анимацию монет через небольшую задержку
        if (penalty) {
            setTimeout(() => {
                window.gameUI.animatePenaltyCoins(penalty);
            }, 300); // Задержка 300ms после начала атаки
        }

        // Возврат к ходьбе и отход после анимации
        setTimeout(() => {
            this.isAttacking = false;
            if (this.currentState === 'attacking') {
                this.startWalking();
                // Отходим назад от игрока
                this.retreatFromPlayer();
            }
        }, 600);

        return true;
    }

    /**
     * Создание эффекта атаки
     */
    createAttackEffect() {
        const attackEffect = document.createElement('div');
        attackEffect.className = 'monster-attack-effect';
        attackEffect.style.cssText = `
            position: absolute;
            width: 80px;
            height: 80px;
            background-image: url('${getSpritePath('monstr1/attack1.png')}');
            background-size: contain;
            background-repeat: no-repeat;
            image-rendering: pixelated;
            z-index: 13;
            left: 25%;
            bottom: 25%;
            animation: monster-attack 0.6s steps(3) forwards;
        `;

        document.getElementById('game-objects').appendChild(attackEffect);

        // Удаление эффекта после анимации
        setTimeout(() => {
            if (attackEffect.parentNode) {
                attackEffect.parentNode.removeChild(attackEffect);
            }
        }, 600);
    }

    /**
     * Анимация монстра
     */
    animate(animationClass) {
        if (this.sprite) {
            // Убираем все классы анимаций для всех типов монстров
            this.sprite.classList.remove('monster-walking', 'monster-attacking');
            this.monsterTypes.forEach(type => {
                this.sprite.classList.remove(`monster-walking-${type}`, `monster-attacking-${type}`);
            });
            
            // Добавляем нужный класс для текущего типа монстра
            if (animationClass !== 'idle') {
                const specificClass = animationClass === 'monster-walking' ? 
                    `monster-walking-${this.monsterType}` : 
                    `monster-attacking-${this.monsterType}`;
                this.sprite.classList.add(specificClass);
            }
        }
    }

    /**
     * Получение урона от игрока
     */
    takePlayerDamage() {
        const damage = 50;
        this.health = Math.max(0, this.health - damage);
        
        // Анимация получения урона
        this.element.classList.add('shake');
        setTimeout(() => {
            this.element.classList.remove('shake');
        }, 500);
        
        if (this.health <= 0) {
            // Ждем завершения анимации взрыва, затем исчезаем
            setTimeout(() => {
                this.deathAnimation();
            }, 300); // Время анимации взрыва
        }
        
        return this.health <= 0;
    }

    /**
     * Получение здоровья
     */
    getHealth() {
        return this.health;
    }

    /**
     * Получение максимального здоровья
     */
    getMaxHealth() {
        return this.maxHealth;
    }

    /**
     * Проверка, жив ли монстр
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Проверка, атакует ли монстр сейчас
     */
    isAttackingNow() {
        return this.isAttacking;
    }

    /**
     * Проверка, движется ли монстр сейчас
     */
    isMovingNow() {
        return this.isMoving;
    }

    /**
     * Получение текущего состояния
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Установка позиции
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        
        if (this.element) {
            this.element.style.left = `${x}%`;
            this.element.style.bottom = `${y}%`;
        }
    }

    /**
     * Получение позиции
     */
    getPosition() {
        return { ...this.position };
    }

    /**
     * Установка сложности
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.moveSpeed = 2 + (difficulty - 1) * 0.5;
        this.attackCooldownTime = Math.max(1000, 2000 - (difficulty - 1) * 200);
        this.maxHealth = 100 + (difficulty - 1) * 20;
        this.health = this.maxHealth;
    }

    /**
     * Получение сложности
     */
    getDifficulty() {
        return this.difficulty;
    }

    /**
     * Сброс монстра
     */
    reset() {
        this.health = this.maxHealth;
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isMoving = false;
        this.lastAttackTime = 0;
        this.setPosition(75, 5);
        this.updateSpriteSize();
        this.updateMonsterSprites(); // Обновляем спрайты для текущего типа монстра
        this.animate('idle');
        this.element.classList.remove('monster-appear', 'monster-disappear');
        this.element.style.left = '75%'; // Явно устанавливаем начальную позицию
    }

    /**
     * Анимация смерти
     */
    deathAnimation() {
        this.stopWalking();
        this.element.classList.add('monster-disappear');
        
        setTimeout(() => {
            this.hide();
            this.element.classList.remove('monster-disappear');
        }, 600);
    }

    /**
     * Анимация появления
     */
    spawnAnimation() {
        this.element.classList.add('monster-appear');
        setTimeout(() => {
            this.element.classList.remove('monster-appear');
        }, 800);
    }

    /**
     * Проверка видимости монстра
     */
    isVisibleNow() {
        return !this.element.classList.contains('hidden');
    }

    /**
     * Получение процента здоровья
     */
    getHealthPercentage() {
        return (this.health / this.maxHealth) * 100;
    }

    /**
     * Установка времени перезарядки атаки
     */
    setAttackCooldown(time) {
        this.attackCooldownTime = time;
    }

    /**
     * Получение оставшегося времени перезарядки
     */
    getAttackCooldownRemaining() {
        const now = Date.now();
        const timeSinceLastAttack = now - this.lastAttackTime;
        return Math.max(0, this.attackCooldownTime - timeSinceLastAttack);
    }

    /**
     * Установка скорости движения
     */
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
    }

    /**
     * Получение скорости движения
     */
    getMoveSpeed() {
        return this.moveSpeed;
    }

    /**
     * Подбегание к игроку и атака
     */
    approachAndAttack(penalty = null) {
        // Вычисляем позицию игрока
        const playerPosition = 20; // Позиция героя в процентах
        const playerSpriteWidth = this.spriteSize.width; // Ширина спрайта героя
        const screenWidth = window.innerWidth;
        const playerSpriteWidthPercent = (playerSpriteWidth / screenWidth) * 100;
        const playerCenter = playerPosition + (playerSpriteWidthPercent / 2);
        
        // Позиция для атаки - левая граница монстра должна быть равна левому краю героя + 1/4 ширины спрайта героя
        // Левая граница героя = playerPosition
        // 1/4 ширины спрайта героя = playerSpriteWidthPercent / 4
        // Позиция атаки = левая граница героя + 1/4 ширины = playerPosition + (playerSpriteWidthPercent / 4)
        const attackPosition = playerPosition + (playerSpriteWidthPercent / 4);
        
        const currentLeft = parseFloat(this.element.style.left) || 75;
        
        // Если монстр уже достаточно близко, сразу атакуем
        if (currentLeft <= attackPosition) {
            this.attack(penalty);
            // Урон игроку
            window.player.takeMonsterDamage();
            return;
        }
        
        // Иначе сначала подбегаем
        this.startWalking();
        
        // Функция для приближения к игроку
        const approachPlayer = () => {
            const currentPos = parseFloat(this.element.style.left) || 75;
            
            if (currentPos > attackPosition) {
                const moveSpeed = this.moveSpeed || 2;
                const moveStep = moveSpeed * 0.3; // Быстрое приближение
                const newLeft = currentPos - moveStep;
                
                if (!isNaN(newLeft) && isFinite(newLeft)) {
                    this.element.style.left = `${newLeft}%`;
                    
                    // Продолжаем приближение
                    requestAnimationFrame(approachPlayer);
                }
            } else {
                // Достигли позиции атаки, атакуем
                this.stopWalking();
                this.attack(penalty);
                // Урон игроку
                window.player.takeMonsterDamage();
            }
        };
        
        // Запускаем приближение
        requestAnimationFrame(approachPlayer);
    }

    /**
     * Отход от игрока после атаки
     */
    retreatFromPlayer() {
        const retreatPosition = 75; // Позиция отхода (исходная позиция монстра)
        const currentLeft = parseFloat(this.element.style.left) || 75;
        
        // Если монстр уже достаточно далеко, останавливаемся
        if (currentLeft >= retreatPosition) {
            this.stopWalking();
            return;
        }
        
        // Функция для отхода от игрока
        const retreatFromPlayer = () => {
            const currentPos = parseFloat(this.element.style.left) || 75;
            
            if (currentPos < retreatPosition) {
                const moveSpeed = this.moveSpeed || 2;
                const moveStep = moveSpeed * 0.2; // Медленный отход
                const newLeft = currentPos + moveStep;
                
                if (!isNaN(newLeft) && isFinite(newLeft)) {
                    this.element.style.left = `${newLeft}%`;
                    
                    // Продолжаем отход
                    requestAnimationFrame(retreatFromPlayer);
                }
            } else {
                // Достигли позиции отхода, останавливаемся
                this.stopWalking();
            }
        };
        
        // Запускаем отход
        requestAnimationFrame(retreatFromPlayer);
    }

    /**
     * Переключение на следующий тип монстра
     */
    switchMonsterType() {
        this.currentMonsterIndex = (this.currentMonsterIndex + 1) % this.monsterTypes.length;
        this.monsterType = this.monsterTypes[this.currentMonsterIndex];
        this.updateMonsterSprites();
        console.log(`Переключился на монстра типа: ${this.monsterType}, индекс: ${this.currentMonsterIndex}`);
    }

    /**
     * Обновление спрайтов монстра в CSS
     */
    updateMonsterSprites() {
        const style = document.createElement('style');
        style.id = 'monster-sprites-style';
        
        // Удаляем старый стиль, если он есть
        const oldStyle = document.getElementById('monster-sprites-style');
        if (oldStyle) {
            oldStyle.remove();
        }
        
        style.textContent = `
            @keyframes monster-walk-${this.monsterType} {
                0% { background-image: url('${getSpritePath(this.monsterType + '/walk1.png')}'); }
                33% { background-image: url('${getSpritePath(this.monsterType + '/walk2.png')}'); }
                66% { background-image: url('${getSpritePath(this.monsterType + '/walk3.png')}'); }
                100% { background-image: url('${getSpritePath(this.monsterType + '/walk1.png')}'); }
            }
            
            @keyframes monster-attack-${this.monsterType} {
                0% { background-image: url('${getSpritePath(this.monsterType + '/attack1.png')}'); }
                33% { background-image: url('${getSpritePath(this.monsterType + '/attack2.png')}'); }
                66% { background-image: url('${getSpritePath(this.monsterType + '/attack3.png')}'); }
                100% { background-image: url('${getSpritePath(this.monsterType + '/walk1.png')}'); }
            }
            
            .monster-walking-${this.monsterType} {
                animation: monster-walk-${this.monsterType} 0.8s steps(3) infinite;
                background-size: contain !important;
                background-repeat: no-repeat !important;
                background-position: center bottom !important;
            }
            
            .monster-attacking-${this.monsterType} {
                animation: monster-attack-${this.monsterType} 0.6s steps(3) forwards;
                background-size: contain !important;
                background-repeat: no-repeat !important;
                background-position: center bottom !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log(`Обновлены спрайты для монстра типа: ${this.monsterType}`);
    }
}

// Создаем глобальный экземпляр
window.monster = new Monster(); 