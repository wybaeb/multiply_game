/**
 * Модуль для управления монстром - адаптивный
 */

class Monster {
    constructor() {
        this.element = document.getElementById('monster');
        this.sprite = document.getElementById('monster-sprite');
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isMoving = false;
        this.position = { x: 80, y: 20 }; // в процентах
        this.health = 100;
        this.maxHealth = 100;
        this.difficulty = 1;
        this.moveSpeed = 2;
        this.attackCooldown = 0;
        this.attackCooldownTime = 2000; // 2 секунды
        this.lastAttackTime = 0;
        this.spriteSize = this.calculateSpriteSize();
        this.initResizeHandler();
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
        
        // Базовый размер спрайта монстра (увеличенный в 2 раза)
        const baseSpriteSize = 320;
        const spriteSize = Math.max(200, Math.min(320, baseSpriteSize * scale));
        
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
        this.updateSpriteSize();
        this.hide();
    }

    /**
     * Показ монстра
     */
    show() {
        this.element.classList.remove('hidden');
        this.updateSpriteSize();
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
        if (!this.isMoving) return;

        const currentLeft = parseFloat(this.element.style.left) || 80;
        const targetLeft = 60; // Позиция для атаки

        if (currentLeft > targetLeft) {
            const newLeft = currentLeft - this.moveSpeed;
            this.element.style.left = `${newLeft}%`;
            
            if (newLeft <= targetLeft) {
                this.stopWalking();
                this.attack();
            }
        }
    }

    /**
     * Атака
     */
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldownTime) {
            return false;
        }

        this.isAttacking = true;
        this.currentState = 'attacking';
        this.lastAttackTime = now;

        // Анимация атаки
        this.animate('monster-attacking');

        // Возврат к ходьбе через время анимации
        setTimeout(() => {
            this.isAttacking = false;
            if (this.currentState === 'attacking') {
                this.startWalking();
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
            background-image: url('sprites/monstr1/attack1.png');
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
            // Убираем все классы анимаций
            this.sprite.classList.remove('monster-walking', 'monster-attacking');
            
            // Добавляем нужный класс
            if (animationClass !== 'idle') {
                this.sprite.classList.add(animationClass);
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
            this.deathAnimation();
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
        this.setPosition(80, 5);
        this.updateSpriteSize();
        this.animate('idle');
        this.element.classList.remove('monster-appear', 'monster-disappear');
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
}

// Создаем глобальный экземпляр
window.monster = new Monster(); 