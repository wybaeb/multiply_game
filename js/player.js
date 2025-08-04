/**
 * Модуль для управления персонажем - адаптивный
 */

class Player {
    constructor() {
        this.element = document.getElementById('player');
        this.sprite = document.getElementById('player-sprite');
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isMoving = false;
        this.position = { x: 20, y: 5 }; // в процентах
        this.health = 100;
        this.maxHealth = 100;
        this.attackCooldown = 0;
        this.attackCooldownTime = 1000; // 1 секунда
        this.lastAttackTime = 0;
        this.spriteSize = this.calculateSpriteSize();
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
        
        // Базовый размер спрайта персонажа (увеличенный в 2 раза)
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
     * Инициализация персонажа
     */
    init() {
        this.updateSpriteSize();
        this.show();
        this.startWalking();
    }

    /**
     * Показ персонажа
     */
    show() {
        this.element.classList.remove('hidden');
        this.updateSpriteSize();
    }

    /**
     * Скрытие персонажа
     */
    hide() {
        this.element.classList.add('hidden');
    }

    /**
     * Начало движения
     */
    startWalking() {
        if (this.currentState !== 'walking') {
            this.currentState = 'walking';
            this.isMoving = true;
            this.animate('player-walking');
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
     * Атака
     */
    attack() {
        const now = Date.now();
        if (now - this.lastAttackTime < this.attackCooldownTime) {
            return false; // Атака на кулдауне
        }

        this.isAttacking = true;
        this.currentState = 'attacking';
        this.lastAttackTime = now;

        // Анимация атаки (fire*.png)
        this.animate('player-attacking');

        // Создание выстрела
        this.createBlast();

        // Возврат к ходьбе через время анимации
        setTimeout(() => {
            this.isAttacking = false;
            if (this.currentState === 'attacking') {
                this.startWalking();
            }
        }, 800);

        return true;
    }

    /**
     * Создание выстрела - адаптивное
     */
    createBlast() {
        const blast = document.createElement('div');
        blast.className = 'blast-effect';
        
        // Адаптивный размер выстрела
        const blastSize = this.spriteSize.width * 0.8;
        
        // Получаем позицию героя относительно game-objects
        const gameObjects = document.getElementById('game-objects');
        const gameObjectsRect = gameObjects.getBoundingClientRect();
        const playerRect = this.element.getBoundingClientRect();
        
        // Позиция blast относительно game-objects (из центра героя по вертикали)
        const blastX = playerRect.left - gameObjectsRect.left + playerRect.width / 2 - blastSize / 2;
        const blastY = playerRect.bottom - gameObjectsRect.bottom + playerRect.height / 2 - blastSize / 2;
        
        blast.style.cssText = `
            position: absolute;
            width: ${blastSize}px;
            height: ${blastSize}px;
            background-image: url('sprites/hero/blast1.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 16;
            left: ${blastX}px;
            bottom: ${blastY}px;
            image-rendering: pixelated;
        `;

        document.getElementById('game-objects').appendChild(blast);

        // Анимация выстрела - летит к монстру
        const monsterElement = document.getElementById('monster');
        if (monsterElement) {
            const monsterRect = monsterElement.getBoundingClientRect();
            const blastRect = blast.getBoundingClientRect();
            
            // Вычисляем конечную позицию (центр монстра)
            const endX = monsterRect.left + monsterRect.width / 2 - blastRect.left;
            const endY = monsterRect.bottom - blastRect.bottom;
            
            // Убеждаемся, что blast летит к центру монстра
            console.log('Blast летит от:', blastRect.left, blastRect.bottom, 'к:', monsterRect.left + monsterRect.width / 2, monsterRect.bottom);
            
            // Анимация полета blast к монстру (ускоренная)
            blast.style.transition = 'all 0.2s ease-out';
            blast.style.transform = `translate(${endX}px, ${endY}px)`;
            
            // Смена спрайта blast на полпути
            setTimeout(() => {
                blast.style.backgroundImage = "url('sprites/hero/blast2.png')";
            }, 100);
            
            // Удаление blast и создание взрыва на монстре
            setTimeout(() => {
                if (blast.parentNode) {
                    blast.parentNode.removeChild(blast);
                }
                // Создаем взрыв на позиции монстра
                this.createBurstAtMonster();
            }, 200);
        } else {
            // Если монстр не найден, просто удаляем blast
            setTimeout(() => {
                if (blast.parentNode) {
                    blast.parentNode.removeChild(blast);
                }
            }, 400);
        }
    }

    /**
     * Создание взрыва на позиции монстра
     */
    createBurstAtMonster() {
        const monsterElement = document.getElementById('monster');
        if (!monsterElement) return;
        
        const burst = document.createElement('div');
        burst.className = 'burst-effect';
        
        // Адаптивный размер взрыва
        const burstSize = this.spriteSize.width * 1.5;
        
        const monsterRect = monsterElement.getBoundingClientRect();
        const gameObjects = document.getElementById('game-objects');
        const gameObjectsRect = gameObjects.getBoundingClientRect();
        
        // Позиция взрыва относительно game-objects (центр монстра)
        const burstX = monsterRect.left - gameObjectsRect.left + monsterRect.width / 2 - burstSize / 2;
        const burstY = monsterRect.bottom - gameObjectsRect.bottom + monsterRect.height / 2 - burstSize / 2;
        
        console.log('Взрыв создается на позиции монстра:', burstX, burstY);
        
        burst.style.cssText = `
            position: absolute;
            width: ${burstSize}px;
            height: ${burstSize}px;
            background-image: url('sprites/hero/burst.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 17;
            left: ${burstX}px;
            bottom: ${burstY}px;
            image-rendering: pixelated;
        `;

        gameObjects.appendChild(burst);

        // Удаление взрыва
        setTimeout(() => {
            if (burst.parentNode) {
                burst.parentNode.removeChild(burst);
            }
        }, 300);
    }

    /**
     * Создание взрыва - адаптивное (старый метод, оставляем для совместимости)
     */
    createBurst() {
        const burst = document.createElement('div');
        burst.className = 'burst-effect';
        
        // Адаптивный размер взрыва
        const burstSize = this.spriteSize.width * 1.5;
        
        burst.style.cssText = `
            position: absolute;
            width: ${burstSize}px;
            height: ${burstSize}px;
            background-image: url('sprites/hero/burst.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 17;
            left: ${this.element.offsetLeft - burstSize * 0.25}px;
            bottom: ${this.element.offsetTop + this.spriteSize.height * 0.2}px;
            image-rendering: pixelated;
        `;

        document.getElementById('game-objects').appendChild(burst);

        // Удаление взрыва
        setTimeout(() => {
            if (burst.parentNode) {
                burst.parentNode.removeChild(burst);
            }
        }, 300);
    }

    /**
     * Анимация персонажа
     */
    animate(animationClass) {
        if (this.sprite) {
            // Убираем все классы анимаций
            this.sprite.classList.remove('player-walking', 'player-attacking', 'player-blasting', 'player-bursting');
            
            // Добавляем нужный класс
            if (animationClass !== 'idle') {
                this.sprite.classList.add(animationClass);
            }
        }
    }

    /**
     * Получение урона
     */
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
        
        // Анимация получения урона
        this.element.classList.add('shake');
        setTimeout(() => {
            this.element.classList.remove('shake');
        }, 500);
        
        return this.health <= 0;
    }

    /**
     * Лечение
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
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
     * Проверка возможности атаки
     */
    canAttack() {
        return !this.isAttacking && Date.now() - this.lastAttackTime >= this.attackCooldownTime;
    }

    /**
     * Проверка, атакует ли персонаж сейчас
     */
    isAttackingNow() {
        return this.isAttacking;
    }

    /**
     * Проверка, движется ли персонаж сейчас
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
     * Сброс персонажа
     */
    reset() {
        this.health = this.maxHealth;
        this.currentState = 'idle';
        this.isAttacking = false;
        this.isMoving = false;
        this.lastAttackTime = 0;
        this.setPosition(20, 5);
        this.updateSpriteSize();
        this.animate('idle');
        // Запускаем анимацию ходьбы после сброса
        setTimeout(() => {
            this.startWalking();
        }, 100);
    }

    /**
     * Получение урона от монстра
     */
    takeMonsterDamage() {
        const damage = 20;
        return this.takeDamage(damage);
    }

    /**
     * Анимация победы
     */
    victoryAnimation() {
        // Просто возвращаемся к ходьбе, взрыв уже создан в createBurstAtMonster
        setTimeout(() => {
            this.startWalking();
        }, 300);
    }

    /**
     * Анимация поражения
     */
    defeatAnimation() {
        this.animate('idle');
        this.element.classList.add('shake');
        
        setTimeout(() => {
            this.element.classList.remove('shake');
            // Возвращаемся к ходьбе после анимации поражения
            this.startWalking();
        }, 1000);
    }

    /**
     * Проверка, жив ли персонаж
     */
    isAlive() {
        return this.health > 0;
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
}

// Создаем глобальный экземпляр
window.player = new Player(); 