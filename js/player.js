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
        
        // Позиция blast относительно game-objects (из центра героя, поднят на половину высоты)
        const blastX = playerRect.left - gameObjectsRect.left + playerRect.width / 2;
        const blastY = playerRect.bottom - gameObjectsRect.bottom + playerRect.height / 2 + blastSize / 2;
        
        blast.style.cssText = `
            position: absolute;
            width: ${blastSize}px;
            height: ${blastSize}px;
            background-image: url('sprites/hero/blast1.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            z-index: 16;
            left: ${blastX - blastSize / 2}px;
            bottom: ${blastY - blastSize / 2}px;
            image-rendering: pixelated;
        `;

        document.getElementById('game-objects').appendChild(blast);

        // Анимация выстрела - летит к монстру
        const monsterElement = document.getElementById('monster');
        if (monsterElement) {
            // Получаем позиции относительно game-objects
            const gameObjects = document.getElementById('game-objects');
            const gameObjectsRect = gameObjects.getBoundingClientRect();
            const monsterRect = monsterElement.getBoundingClientRect();
            const blastRect = blast.getBoundingClientRect();
            
            // Вычисляем позицию центра монстра относительно game-objects
            const monsterX = monsterRect.left - gameObjectsRect.left + monsterRect.width / 2;
            const monsterY = monsterRect.bottom - gameObjectsRect.bottom + monsterRect.height / 2;
            
            // Вычисляем текущую позицию blast относительно game-objects
            const blastX = blastRect.left - gameObjectsRect.left;
            const blastY = blastRect.bottom - gameObjectsRect.bottom;
            
            // Вычисляем смещение для анимации (blast летит к центру монстра по горизонтали)
            const endX = monsterX - blastX - blastSize / 2;
            const endY = 0; // Blast летит на той же высоте
            
            console.log('Blast летит от:', blastX, blastY, 'к:', monsterX, monsterY);
            console.log('Размеры blast:', blastSize, 'размеры монстра:', monsterRect.width, monsterRect.height);
            
            // Анимация полета blast к монстру (еще более замедленная)
            blast.style.transition = 'all 0.8s ease-out';
            blast.style.transform = `translate(${endX}px, ${endY}px)`;
            
            // Смена спрайта blast на полпути
            setTimeout(() => {
                blast.style.backgroundImage = "url('sprites/hero/blast2.png')";
            }, 400);
            
            // Удаление blast и создание взрыва на монстре
            setTimeout(() => {
                if (blast.parentNode) {
                    blast.parentNode.removeChild(blast);
                }
                // Создаем взрыв на позиции монстра
                this.createBurstAtMonster();
            }, 800);
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
        
        console.log('Позиция монстра:', monsterRect.left, monsterRect.bottom);
        console.log('Позиция game-objects:', gameObjectsRect.left, gameObjectsRect.bottom);
        console.log('Размеры монстра:', monsterRect.width, monsterRect.height);
        
        // Позиция центра монстра относительно game-objects
        const monsterCenterX = monsterRect.left - gameObjectsRect.left + monsterRect.width / 2;
        const monsterCenterY = monsterRect.bottom - gameObjectsRect.bottom + monsterRect.height / 2;
        
        // Позиция взрыва (центр взрыва совпадает с центром монстра, поднят на половину высоты)
        const burstX = monsterCenterX;
        const burstY = monsterCenterY + burstSize / 2;
        
        console.log('Центр монстра:', monsterCenterX, monsterCenterY);
        console.log('Позиция взрыва:', burstX, burstY, 'размер взрыва:', burstSize);
        
        console.log('Центр монстра:', monsterCenterX, monsterCenterY);
        console.log('Позиция взрыва:', burstX, burstY, 'размер взрыва:', burstSize);
        
        console.log('Взрыв создается на позиции монстра:', burstX, burstY, 'размер взрыва:', burstSize);
        
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
            left: ${burstX - burstSize / 2}px;
            bottom: ${burstY - burstSize / 2}px;
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