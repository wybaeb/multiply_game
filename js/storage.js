/**
 * Модуль для работы с локальным хранилищем и cookies
 */

class GameStorage {
    constructor() {
        this.storageKey = 'multiply_game_data';
        this.cookieName = 'multiply_game_progress';
        this.cookieExpiry = 365; // дней
    }

    /**
     * Сохранение данных игры
     */
    saveGameData(data) {
        try {
            // Сохраняем в localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            
            // Сохраняем в cookies
            this.setCookie(this.cookieName, JSON.stringify(data), this.cookieExpiry);
            
            console.log('Данные игры сохранены:', data);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            return false;
        }
    }

    /**
     * Загрузка данных игры
     */
    loadGameData() {
        try {
            // Пробуем загрузить из localStorage
            let data = localStorage.getItem(this.storageKey);
            
            if (!data) {
                // Если нет в localStorage, пробуем из cookies
                data = this.getCookie(this.cookieName);
            }
            
            if (data) {
                const parsedData = JSON.parse(data);
                console.log('Данные игры загружены:', parsedData);
                return parsedData;
            }
            
            // Возвращаем данные по умолчанию
            return this.getDefaultData();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return this.getDefaultData();
        }
    }

    /**
     * Получение данных по умолчанию
     */
    getDefaultData() {
        return {
            currentLevel: 3, // Начинаем с суммы 3
            totalScore: 0,
            currentScore: 0,
            completedLevels: [],
            sumGroupsProgress: {}, // Прогресс по группам сумм
            solvedProblems: [], // Список решенных примеров
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                difficulty: 'normal'
            },
            lastPlayed: new Date().toISOString()
        };
    }

    /**
     * Сброс прогресса игры
     */
    resetProgress() {
        try {
            // Удаляем из localStorage
            localStorage.removeItem(this.storageKey);
            
            // Удаляем cookies
            this.deleteCookie(this.cookieName);
            
            console.log('Прогресс игры сброшен');
            return true;
        } catch (error) {
            console.error('Ошибка сброса прогресса:', error);
            return false;
        }
    }

    /**
     * Обновление уровня
     */
    updateLevel(level) {
        const data = this.loadGameData();
        data.currentLevel = level;
        data.lastPlayed = new Date().toISOString();
        return this.saveGameData(data);
    }

    /**
     * Обновление очков
     */
    updateScore(score) {
        const data = this.loadGameData();
        data.totalScore += score;
        data.currentScore = score;
        data.lastPlayed = new Date().toISOString();
        return this.saveGameData(data);
    }

    /**
     * Сохранение решенного примера
     */
    saveSolvedProblem(problemId, sumGroup) {
        const data = this.loadGameData();
        
        // Добавляем в список решенных примеров
        if (!data.solvedProblems.includes(problemId)) {
            data.solvedProblems.push(problemId);
        }
        
        // Обновляем прогресс по группе сумм
        if (!data.sumGroupsProgress[sumGroup]) {
            data.sumGroupsProgress[sumGroup] = {
                solvedProblems: [],
                totalProblems: 0,
                completed: false
            };
        }
        
        if (!data.sumGroupsProgress[sumGroup].solvedProblems.includes(problemId)) {
            data.sumGroupsProgress[sumGroup].solvedProblems.push(problemId);
        }
        
        data.lastPlayed = new Date().toISOString();
        return this.saveGameData(data);
    }

    /**
     * Получение прогресса по группе сумм
     */
    getSumGroupProgress(sumGroup) {
        const data = this.loadGameData();
        return data.sumGroupsProgress[sumGroup] || {
            solvedProblems: [],
            totalProblems: 0,
            completed: false
        };
    }

    /**
     * Получение всех решенных примеров
     */
    getSolvedProblems() {
        const data = this.loadGameData();
        return data.solvedProblems || [];
    }

    /**
     * Получение статистики
     */
    getStats() {
        const data = this.loadGameData();
        return {
            totalScore: data.totalScore,
            solvedProblemsCount: data.solvedProblems ? data.solvedProblems.length : 0,
            currentLevel: data.currentLevel,
            lastPlayed: data.lastPlayed,
            sumGroupsProgress: data.sumGroupsProgress || {}
        };
    }

    /**
     * Установка cookie
     */
    setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    /**
     * Получение cookie
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    /**
     * Удаление cookie
     */
    deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }

    /**
     * Проверка поддержки localStorage
     */
    isLocalStorageSupported() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Проверка поддержки cookies
     */
    isCookieSupported() {
        return navigator.cookieEnabled;
    }

    /**
     * Получение информации о хранилище
     */
    getStorageInfo() {
        return {
            localStorage: this.isLocalStorageSupported(),
            cookies: this.isCookieSupported(),
            dataExists: this.loadGameData() !== null
        };
    }

    /**
     * Экспорт данных
     */
    exportData() {
        const data = this.loadGameData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `multiply_game_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Импорт данных
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            return this.saveGameData(data);
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }
}

// Создаем глобальный экземпляр
window.gameStorage = new GameStorage(); 