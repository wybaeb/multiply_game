/**
 * Модуль для работы с математическими задачами
 * Новая система: генерация по принципу суммы цифр с псевдослучайностью
 */

class MathGame {
    constructor() {
        this.currentLevel = 1;
        this.currentScore = 0;
        this.currentProblem = null;
        this.problemHistory = new Set(); // Для отслеживания уже решенных примеров
        this.currentSumGroup = 3; // Начинаем с суммы 3
        this.sumGroupProblems = []; // Проблемы текущей группы сумм
        this.sumGroupIndex = 0; // Индекс в текущей группе
        this.seed = Date.now(); // Семя для псевдослучайности
        this.maxSum = 18; // Максимальная сумма для таблицы умножения (9+9)
    }

    /**
     * Простой генератор псевдослучайных чисел
     */
    pseudoRandom() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    /**
     * Генерация всех примеров для заданной суммы цифр
     */
    generateSumGroupProblems(sum) {
        const problems = [];
        
        // Генерируем все возможные пары (a, b) где a + b = sum
        for (let a = 1; a <= Math.min(sum - 1, 9); a++) {
            const b = sum - a;
            if (b >= 1 && b <= 9) {
                problems.push({ a, b });
            }
        }
        
        return problems;
    }

    /**
     * Перемешивание массива с псевдослучайностью
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(this.pseudoRandom() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Установка текущего уровня (теперь это сумма цифр)
     */
    setLevel(level) {
        this.currentLevel = level;
        this.currentSumGroup = Math.max(3, level); // Минимум сумма 3
        
        // Генерируем проблемы для текущей группы сумм
        this.sumGroupProblems = this.generateSumGroupProblems(this.currentSumGroup);
        this.sumGroupProblems = this.shuffleArray(this.sumGroupProblems);
        this.sumGroupIndex = 0;
        
        return true;
    }

    /**
     * Получение текущего уровня
     */
    getCurrentLevel() {
        return this.currentLevel;
    }

    /**
     * Получение текущей группы сумм
     */
    getCurrentSumGroup() {
        return this.currentSumGroup;
    }

    /**
     * Генерация следующей задачи
     */
    generateProblem() {
        // Если прошли все проблемы в текущей группе, переходим к следующей
        if (this.sumGroupIndex >= this.sumGroupProblems.length) {
            this.currentSumGroup++;
            
            // Если достигли максимума, начинаем заново с 3
            if (this.currentSumGroup > this.maxSum) {
                this.currentSumGroup = 3;
                this.problemHistory.clear(); // Очищаем историю для нового цикла
            }
            
            this.sumGroupProblems = this.generateSumGroupProblems(this.currentSumGroup);
            this.sumGroupProblems = this.shuffleArray(this.sumGroupProblems);
            this.sumGroupIndex = 0;
        }

        // Выбираем следующую проблему из текущей группы
        const problem = this.sumGroupProblems[this.sumGroupIndex];
        
        this.currentProblem = {
            a: problem.a,
            b: problem.b,
            answer: problem.a * problem.b,
            level: this.currentLevel,
            sumGroup: this.currentSumGroup,
            problemId: `${problem.a}x${problem.b}`,
            difficulty: this.getDifficultyForSum(this.currentSumGroup)
        };

        this.sumGroupIndex++;
        return this.currentProblem;
    }

    /**
     * Определение сложности на основе суммы цифр
     */
    getDifficultyForSum(sum) {
        if (sum <= 5) return 'easy';
        if (sum <= 8) return 'medium';
        if (sum <= 12) return 'hard';
        if (sum <= 15) return 'very_hard';
        return 'expert';
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
            // Добавляем в историю решенных
            this.problemHistory.add(this.currentProblem.problemId);
            
            return { 
                correct: true, 
                message: "Правильно!", 
                answer: correctAnswer,
                points: this.calculatePoints(),
                sumGroup: this.currentSumGroup
            };
        } else {
            return { 
                correct: false, 
                message: `Неправильно. Правильный ответ: ${correctAnswer}`, 
                answer: correctAnswer,
                points: -50,
                sumGroup: this.currentSumGroup
            };
        }
    }

    /**
     * Расчет очков за правильный ответ
     */
    calculatePoints(timeRemaining = 60) {
        const basePoints = 10;
        const timeBonus = Math.floor(timeRemaining * 0.5);
        const difficultyBonus = this.getDifficultyBonus();
        return basePoints + timeBonus + difficultyBonus;
    }

    /**
     * Бонус за сложность
     */
    getDifficultyBonus() {
        const difficulty = this.currentProblem.difficulty;
        switch (difficulty) {
            case 'easy': return 0;
            case 'medium': return 5;
            case 'hard': return 10;
            case 'very_hard': return 15;
            case 'expert': return 20;
            default: return 0;
        }
    }

    /**
     * Получение статистики прогресса
     */
    getProgressStats() {
        const totalProblems = this.getTotalProblemsCount();
        const solvedProblems = this.problemHistory.size;
        const currentSumProgress = this.sumGroupIndex;
        const totalSumProgress = this.sumGroupProblems.length;
        
        return {
            totalProblems,
            solvedProblems,
            progressPercentage: Math.round((solvedProblems / totalProblems) * 100),
            currentSumGroup: this.currentSumGroup,
            currentSumProgress,
            totalSumProgress,
            sumProgressPercentage: Math.round((currentSumProgress / totalSumProgress) * 100)
        };
    }

    /**
     * Подсчет общего количества примеров в таблице умножения
     */
    getTotalProblemsCount() {
        let count = 0;
        for (let sum = 3; sum <= this.maxSum; sum++) {
            count += this.generateSumGroupProblems(sum).length;
        }
        return count;
    }

    /**
     * Получение информации о текущей группе сумм
     */
    getCurrentSumGroupInfo() {
        const problems = this.generateSumGroupProblems(this.currentSumGroup);
        return {
            sum: this.currentSumGroup,
            totalProblems: problems.length,
            currentIndex: this.sumGroupIndex,
            problems: problems.map(p => `${p.a} × ${p.b}`),
            difficulty: this.getDifficultyForSum(this.currentSumGroup)
        };
    }

    /**
     * Получение следующего уровня (следующая группа сумм)
     */
    getNextLevel() {
        const nextSum = this.currentSumGroup + 1;
        if (nextSum <= this.maxSum) {
            return nextSum;
        }
        return null; // Достигнут максимум
    }

    /**
     * Проверка завершения текущей группы сумм
     */
    isCurrentSumGroupCompleted() {
        return this.sumGroupIndex >= this.sumGroupProblems.length;
    }

    /**
     * Получение подсказки для задачи
     */
    getHint() {
        if (!this.currentProblem) {
            return "Сначала сгенерируйте задачу";
        }

        const { a, b, sumGroup } = this.currentProblem;
        
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
                return `Сложные примеры требуют хорошего знания таблицы!`;
            default:
                return "Попробуйте еще раз";
        }
    }

    /**
     * Получение статистики по группам сумм
     */
    getSumGroupsStats() {
        const stats = {};
        
        for (let sum = 3; sum <= this.maxSum; sum++) {
            const problems = this.generateSumGroupProblems(sum);
            const solvedInGroup = problems.filter(p => 
                this.problemHistory.has(`${p.a}x${p.b}`)
            ).length;
            
            stats[sum] = {
                totalProblems: problems.length,
                solvedProblems: solvedInGroup,
                progressPercentage: Math.round((solvedInGroup / problems.length) * 100),
                difficulty: this.getDifficultyForSum(sum),
                examples: problems.map(p => `${p.a} × ${p.b}`)
            };
        }

        return stats;
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

    /**
     * Сброс прогресса
     */
    resetProgress() {
        this.problemHistory.clear();
        this.currentSumGroup = 3;
        this.sumGroupIndex = 0;
        this.sumGroupProblems = this.generateSumGroupProblems(this.currentSumGroup);
        this.sumGroupProblems = this.shuffleArray(this.sumGroupProblems);
    }

    /**
     * Получение информации о сложности уровня
     */
    getLevelDifficulty() {
        return this.getDifficultyForSum(this.currentSumGroup);
    }
}

// Создаем глобальный экземпляр
window.mathGame = new MathGame(); 