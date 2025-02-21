// 初始化学生名单和积分
const students = [
    "蔡明轩", "陈玮锋", "党梓羽", "樊佳佑", "高逸木", "黄子译", "贾奕卓", "金谷译",
    "李浩然", "李祺佑", "梁家瑞", "刘浩宇", "刘子辰", "孟辰辉", "任博天", "孙俊辉",
    "王晟睿", "王思润", "王泽坤", "吴嘉梵", "杨朗烨", "叶王泽祺", "张嘉凡", "张嘉华",
    "张嘉渲", "郑昊泽", "白李优璇", "常宋梓悦", "陈允歆", "冯宗英", "郭嘉宁", "郭嘉予",
    "侯丝雨", "蒋梓雪", "李晨阳", "李彦希", "刘晨溪", "刘羽希", "陆梓玥", "马子沐",
    "秦欣怡", "孙骏雅", "王涵", "王歆玥", "王煜茹", "温智贤", "徐晴", "杨青禾",
    "张辰瑾", "张梦冉", "张雨晨", "赵沐阳", "朱秦壹"
];

// 从localStorage加载积分数据
let scores = JSON.parse(localStorage.getItem("scores")) || {};
let lastScoredStudent = null; // 用于记录最近加分的学生
let currentMode = "morning-read"; // 默认早读版
let stopwatchTime = 0; // 秒表时间（毫秒）
let stopwatchInterval; // 秒表计时器
let stopwatchRunning = false; // 秒表是否正在运行

// 动态生成气泡
function generateBubbles() {
    const bubbleContainer = document.querySelector(".bubble-container");
    bubbleContainer.innerHTML = "";
    students.forEach(student => {
        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.textContent = student;
        bubble.onclick = () => {
            if (currentMode === "morning-read") {
                updateScore(student);
                bubble.style.display = "none"; // 早读版点击消失
            } else {
                updateScore(student);
            }
        };
        bubbleContainer.appendChild(bubble);
    });
}

// 更新积分
function updateScore(student) {
    lastScoredStudent = student; // 记录最近加分的学生
    if (!scores[student]) {
        scores[student] = { details: [] };
    }
    // 记录积分详情
    scores[student].details.push({
        timestamp: new Date().toISOString(),
        score: 1
    });
    saveScores();
    updateScoreDisplay();
    updateScoreTable();
}

// 保存积分到localStorage
function saveScores() {
    localStorage.setItem("scores", JSON.stringify(scores));
}

// 更新积分显示
function updateScoreDisplay() {
    const scoreList = document.getElementById("score-list");
    scoreList.innerHTML = "";
    const sortedScores = Object.entries(scores).sort((a, b) => getTotalScore(b[1].details) - getTotalScore(a[1].details));
    sortedScores.forEach(([student, data]) => {
        const listItem = document.createElement("li");
        const total = getTotalScore(data.details);
        if (currentMode === "morning-read") {
            listItem.textContent = `${student}: ${total}分`;
        } else {
            listItem.textContent = `${student}: ${total}分`;
        }
        scoreList.appendChild(listItem);
    });
}

// 获取总积分
function getTotalScore(details) {
    return details.reduce((sum, detail) => sum + detail.score, 0);
}

// 撤销加分
function undoLastScore() {
    if (lastScoredStudent && scores[lastScoredStudent] && scores[lastScoredStudent].details.length > 0) {
        scores[lastScoredStudent].details.pop(); // 移除最后一条记录
        saveScores();
        updateScoreDisplay();
        // 重新显示气泡
        const bubbleContainer = document.querySelector(".bubble-container");
        bubbleContainer.innerHTML = "";
        generateBubbles();
    }
}

// 清除单个学生数据
function clearStudentScore(student) {
    if (confirm(`确定要清除 ${student} 的所有积分数据吗？`)) {
        delete scores[student];
        saveScores();
        updateScoreDisplay();
        updateScoreTable();
        generateBubbles(); // 重新生成气泡
    }
}

// 全体清零
function clearAllScores() {
    if (confirm("确定要清除全体学生的积分数据吗？")) {
        scores = {};
        saveScores();
        updateScoreDisplay();
        updateScoreTable();
        generateBubbles(); // 重新生成气泡
    }
}

// 实时更新秒表
function startTimer() {
    if (!stopwatchRunning) {
        stopwatchInterval = setInterval(() => {
            stopwatchTime += 10; // 每10毫秒增加1
            updateStopwatchTime();
        }, 10);
        stopwatchRunning = true;
    }
}

function pauseTimer() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
}

function resetTimer() {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    updateStopwatchTime();
    stopwatchRunning = false;
}

function updateStopwatchTime() {
    const timeElement = document.getElementById("stopwatch-time");
    timeElement.textContent = formatTime(stopwatchTime);
}

function formatTime(time) {
    const milliseconds = Math.floor((time % 1000) / 10);
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor(time / 1000 / 3600);
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 2)}`;
}

function padZero(num, length = 2) {
    return num.toString().padStart(length, "0");
}

// 更新积分库表格
function updateScoreTable() {
    const scoreTableBody = document.getElementById("score-table-body");
    scoreTableBody.innerHTML = "";
    Object.entries(scores).forEach(([student, data]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student}</td>
            <td>${getDailyScore(data.details)}</td>
            <td>${getWeeklyScore(data.details)}</td>
            <td>${getMonthlyScore(data.details)}</td>
            <td>${getTotalScore(data.details)}</td>
            <td><button onclick="showScoreDetails('${student}')">详情</button></td>
        `;
        scoreTableBody.appendChild(row);
    });
}

// 获取单日积分
function getDailyScore(details) {
    const today = new Date().setHours(0, 0, 0, 0);
    return details.reduce((sum, detail) => {
        const detailDate = new Date(detail.timestamp).setHours(0, 0, 0, 0);
        return detailDate === today ? sum + detail.score : sum;
    }, 0);
}

// 获取单周积分
function getWeeklyScore(details) {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
    return details.reduce((sum, detail) => {
        const detailDate = new Date(detail.timestamp).setHours(0, 0, 0, 0);
        return detailDate >= weekStart ? sum + detail.score : sum;
    }, 0);
}

// 获取单月积分
function getMonthlyScore(details) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0, 0, 0, 0);
    return details.reduce((sum, detail) => {
        const detailDate = new Date(detail.timestamp).setHours(0, 0, 0, 0);
        return detailDate >= monthStart ? sum + detail.score : sum;
    }, 0);
}

// 显示积分明细
function showScoreDetails(student) {
    const detailsList = document.getElementById("score-details-list");
    detailsList.innerHTML = "";
    if (scores[student]) {
        scores[student].details.forEach((detail, index) => {
            const detailItem = document.createElement("li");
            detailItem.innerHTML = `
                <span>时间：${new Date(detail.timestamp).toLocaleString()}</span>
                <span>分数：${detail.score}</span>
                <button onclick="clearDetail('${student}', ${index})">清除</button>
            `;
            detailsList.appendChild(detailItem);
        });
    }
    const scoreDetails = document.querySelector(".score-details");
    scoreDetails.style.display = "block";
}

// 清除某条积分明细
function clearDetail(student, index) {
    if (confirm("确定要清除这条积分记录吗？")) {
        scores[student].details.splice(index, 1);
        saveScores();
        updateScoreTable();
        // 更新积分明细显示
        showScoreDetails(student);
    }
}

// 关闭积分明细界面
function closeScoreDetails() {
    const scoreDetails = document.querySelector(".score-details");
    scoreDetails.style.display = "none";
}

// 切换模式
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".right-buttons button").forEach(btn => btn.classList.remove("active"));
    document.getElementById(`${mode}-btn`).classList.add("active");
    generateBubbles(); // 重新生成气泡
}

// 显示/隐藏积分库
function toggleScoreLibrary() {
    const scoreLibrary = document.querySelector(".score-library");
    scoreLibrary.style.display = scoreLibrary.style.display === "none" ? "block" : "none";
    updateScoreTable();
}

// 初始化
generateBubbles();
updateScoreDisplay();
updateStopwatchTime();

// 监听字体设置变化
document.getElementById("font-size").addEventListener("input", updateGoalTextStyle);
document.getElementById("font-family").addEventListener("change", updateGoalTextStyle);

// 更新早读目标文本框样式
function updateGoalTextStyle() {
    const goalText = document.getElementById("goal-text");
    const fontSize = document.getElementById("font-size").value + "px";
    const fontFamily = document.getElementById("font-family").value;
    goalText.style.fontSize = fontSize;
    goalText.style.fontFamily = fontFamily;
}