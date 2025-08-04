/**
 * Модуль для работы с математическими задачами
 */

class MathGame {
    constructor() {
        this.currentLevel = 1;
        this.levelConfigs = this.initializeLevelConfigs();
        this.currentProblem = null;
    }

    /**
     * Инициализация конфигураций уровней
     */
    initializeLevelConfigs() {
        return {
            1: {
                name: "Уровень 1",
                description: "Умножение на 1 и 2",
                problems: [
                    { a: 1, b: 2 },
                    { a: 2, b: 1 }
                ],
                difficulty: "easy"
            },
            2: {
                name: "Уровень 2",
                description: "Умножение на 1, 2 и 3",
                problems: [
                    { a: 2, b: 3 },
                    { a: 3, b: 2 },
                    { a: 1, b: 3 },
                    { a: 3, b: 1 }
                ],
                difficulty: "easy"
            },
            3: {
                name: "Уровень 3",
                description: "Умножение на 2, 3 и 4",
                problems: [
                    { a: 2, b: 4 },
                    { a: 4, b: 2 },
                    { a: 3, b: 4 },
                    { a: 4, b: 3 }
                ],
                difficulty: "medium"
            },
            4: {
                name: "Уровень 4",
                description: "Умножение на 3, 4 и 5",
                problems: [
                    { a: 3, b: 5 },
                    { a: 5, b: 3 },
                    { a: 4, b: 5 },
                    { a: 5, b: 4 }
                ],
                difficulty: "medium"
            },
            5: {
                name: "Уровень 5",
                description: "Умножение на 4, 5 и 6",
                problems: [
                    { a: 4, b: 6 },
                    { a: 6, b: 4 },
                    { a: 5, b: 6 },
                    { a: 6, b: 5 }
                ],
                difficulty: "medium"
            },
            6: {
                name: "Уровень 6",
                description: "Умножение на 5, 6 и 7",
                problems: [
                    { a: 5, b: 7 },
                    { a: 7, b: 5 },
                    { a: 6, b: 7 },
                    { a: 7, b: 6 }
                ],
                difficulty: "hard"
            },
            7: {
                name: "Уровень 7",
                description: "Умножение на 6, 7 и 8",
                problems: [
                    { a: 6, b: 8 },
                    { a: 8, b: 6 },
                    { a: 7, b: 8 },
                    { a: 8, b: 7 }
                ],
                difficulty: "hard"
            },
            8: {
                name: "Уровень 8",
                description: "Умножение на 7, 8 и 9",
                problems: [
                    { a: 7, b: 9 },
                    { a: 9, b: 7 },
                    { a: 8, b: 9 },
                    { a: 9, b: 8 }
                ],
                difficulty: "very_hard"
            },
            9: {
                name: "Уровень 9",
                description: "Финальный уровень - 9 на 9",
                problems: [
                    { a: 9, b: 9 }
                ],
                difficulty: "expert"
            }
        };
    }

    /**
     * Установка текущего уровня
     */
    setLevel(level) {
        if (this.levelConfigs[level]) {
            this.currentLevel = level;
            return true;
        }
        return false;
    }

    /**
     * Получение текущего уровня
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Получение конфигурации уровня
     */
    getLevelConfig(level = this.currentLevel) {
        return this.levelConfigs[level] || null;
    }

    /**
     * Генерация случайной задачи для текущего уровня
     */
    generateProblem(level = this.currentLevel) {
        const config = this.getLevelConfig(level);
        if (!config) {
            throw new Error(`Уровень ${level} не найден`);
        }

        // Выбираем случайную задачу из уровня
        const randomIndex = Math.floor(Math.random() * config.problems.length);
        const problem = config.problems[randomIndex];

        this.currentProblem = {
            a: problem.a,
            b: problem.b,
            answer: problem.a * problem.b,
            level: level,
            difficulty: config.difficulty
        };

        return this.currentProblem;
    }

    /**
     * Получение текста задачи
     */
    getProblemText() {
        if (!this.currentProblem) {
            return "Ошибка: задача не сгенерирована";
        }
        return `${this.currentProblem.a} × ${this.currentProblem.b} = ?`;
    }

    /**
     * Проверка ответа
     */
    checkAnswer(userAnswer) {
        if (!this.currentProblem) {
            return { correct: false, message: "Задача не сгенерирована" };
        }

        const userNum = parseInt(userAnswer);
        const correctAnswer = this.currentProblem.answer;

        if (isNaN(userNum)) {
            return { correct: false, message: "Введите число" };
        }

        if (userNum === correctAnswer) {
            return { 
                correct: true, 
                message: "Правильно!", 
                answer: correctAnswer,
                points: this.calculatePoints()
            };
        } else {
            return { 
                correct: false, 
                message: `Неправильно. Правильный ответ: ${correctAnswer}`, 
                answer: correctAnswer,
                points: -50
            };
        }
    }

    /**
     * Расчет очков за правильный ответ
     */
    calculatePoints(timeRemaining = 60) {
        const basePoints = 10;
        const timeBonus = Math.floor(timeRemaining * 0.5);
        return basePoints + timeBonus;
    }

    /**
     * Получение всех задач для уровня
     */
    getAllProblemsForLevel(level = this.currentLevel) {
        const config = this.getLevelConfig(level);
        if (!config) {
            return [];
        }

        return config.problems.map(problem => ({
            a: problem.a,
            b: problem.b,
            answer: problem.a * problem.b,
            text: `${problem.a} × ${problem.b} = ${problem.a * problem.b}`
        }));
    }

    /**
     * Проверка завершения уровня
     */
    isLevelCompleted(level = this.currentLevel) {
        const config = this.getLevelConfig(level);
        if (!config) {
            return false;
        }

        // Уровень считается завершенным, если решено минимум 3 задачи
        return config.problems.length >= 3;
    }

    /**
     * Получение следующего уровня
     */
    getNextLevel() {
        const nextLevel = this.currentLevel + 1;
        return this.levelConfigs[nextLevel] ? nextLevel : null;
    }

    /**
     * Получение статистики по уровням
     */
    getLevelStats() {
        const stats = {};
        
        for (let level = 1; level <= 9; level++) {
            const config = this.getLevelConfig(level);
            if (config) {
                stats[level] = {
                    name: config.name,
                    description: config.description,
                    difficulty: config.difficulty,
                    problemCount: config.problems.length,
                    problems: config.problems
                };
            }
        }

        return stats;
    }

    /**
     * Генерация тренировочной задачи
     */
    generateTrainingProblem(minLevel = 1, maxLevel = 9) {
        const availableLevels = [];
        
        for (let level = minLevel; level <= maxLevel; level++) {
            if (this.levelConfigs[level]) {
                availableLevels.push(level);
            }
        }

        if (availableLevels.length === 0) {
            throw new Error("Нет доступных уровней");
        }

        const randomLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)];
        return this.generateProblem(randomLevel);
    }

    /**
     * Проверка сложности уровня
     */
    getLevelDifficulty(level = this.currentLevel) {
        const config = this.getLevelConfig(level);
        return config ? config.difficulty : 'unknown';
    }

    /**
     * Получение подсказки для задачи
     */
    getHint() {
        if (!this.currentProblem) {
            return "Сначала сгенерируйте задачу";
        }

        const { a, b } = this.currentProblem;
        
        // Различные типы подсказок в зависимости от сложности
        switch (this.currentProblem.difficulty) {
            case 'easy':
                return `Попробуйте сложить ${a} + ${a} + ${a} (${b} раз)`;
            case 'medium':
                return `Помните: ${a} × ${b} = ${b} × ${a}`;
            case 'hard':
                return `Разбейте на части: ${a} × ${b} = (${a} × ${Math.floor(b/2)}) + (${a} × ${Math.ceil(b/2)})`;
            case 'very_hard':
                return `Используйте таблицу умножения`;
            case 'expert':
                return `9 × 9 = 81 - это нужно запомнить!`;
            default:
                return "Попробуйте еще раз";
        }
    }

    /**
     * Получение прогресса по уровням
     */
    getProgress() {
        const progress = {};
        
        for (let level = 1; level <= 9; level++) {
            const config = this.getLevelConfig(level);
            if (config) {
                progress[level] = {
                    name: config.name,
                    difficulty: config.difficulty,
                    problemCount: config.problems.length,
                    completed: false // Будет заполняться из хранилища
                };
            }
        }

        return progress;
    }

    /**
     * Валидация ввода
     */
    validateInput(input) {
        // Убираем все нецифровые символы
        const cleanInput = input.replace(/[^0-9]/g, '');
        
        // Проверяем длину (максимум 3 цифры)
        if (cleanInput.length > 3) {
            return false;
        }

        // Проверяем диапазон (0-999)
        const num = parseInt(cleanInput);
        return num >= 0 && num <= 999;
    }

    /**
     * Форматирование ввода
     */
    formatInput(input) {
        return input.replace(/[^0-9]/g, '');
    }
}

// Создаем глобальный экземпляр
window.mathGame = new MathGame(); 