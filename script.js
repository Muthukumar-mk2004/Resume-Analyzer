// ============================================================================
// DOM ELEMENTS
// ============================================================================

const resumeUpload1 = document.getElementById('resume-upload-1');
const resumeUpload2 = document.getElementById('resume-upload-2');
const skillsInput = document.getElementById('skills-input');
const fileNameDisplay1 = document.getElementById('file-name-1');
const fileNameDisplay2 = document.getElementById('file-name-2');
const analyzeBtn = document.getElementById('analyze-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const uploadSection = document.getElementById('upload-section');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const comparisonCard = document.getElementById('comparison-card');
const resultsResume1 = document.getElementById('results-resume-1');
const resultsResume2 = document.getElementById('results-resume-2');
const skillsChartCanvas = document.getElementById('skills-chart');

// Local storage key
const HISTORY_KEY = 'resumeAnalyzerHistory';
const MAX_HISTORY = 5;

// Sample Resume Texts (Mock Data)
const sampleResume1 = `
John Doe
Frontend Developer

Skills:
- HTML5, CSS3, JavaScript (ES6+)
- React.js, Vue.js
- Git, GitHub
- Responsive Web Design
- RESTful APIs
- UI/UX Design Principles
- Node.js, Express

Experience:
- Developed responsive web applications using React and CSS
- Implemented API integrations with RESTful services
- Designed user interfaces with modern UI/UX principles
- Collaborated using Git for version control
`;

const sampleResume2 = `
Jane Smith
Full Stack Developer

Skills:
- JavaScript, TypeScript
- React, Angular
- HTML5, CSS3
- Node.js, Express
- MongoDB, PostgreSQL
- Docker, Kubernetes
- AWS, Azure

Experience:
- Built full stack applications with Node.js and React
- Managed databases using MongoDB and PostgreSQL
- Deployed applications using Docker and Kubernetes
- Optimized performance and user experience
`;

// ============================================================================
// EVENT LISTENERS
// ============================================================================

resumeUpload1.addEventListener('change', checkFormValidity);
resumeUpload2.addEventListener('change', checkFormValidity);
skillsInput.addEventListener('input', checkFormValidity);
analyzeBtn.addEventListener('click', analyzeResumes);
clearHistoryBtn.addEventListener('click', clearHistory);

// ============================================================================
// FORM VALIDATION
// ============================================================================

function checkFormValidity() {
    const file1 = resumeUpload1.files[0];
    const file2 = resumeUpload2.files[0];
    const skills = skillsInput.value.trim();

    // Update file name displays
    if (file1) {
        fileNameDisplay1.textContent = `✓ ${file1.name}`;
    } else {
        fileNameDisplay1.textContent = '';
    }

    if (file2) {
        fileNameDisplay2.textContent = `✓ ${file2.name}`;
    } else {
        fileNameDisplay2.textContent = '';
    }

    // At least one resume and skills required
    const hasAtLeastOneResume = file1 || file2;
    if (hasAtLeastOneResume && skills) {
        analyzeBtn.disabled = false;
    } else {
        analyzeBtn.disabled = true;
    }
}

// ============================================================================
// ANALYZE RESUMES
// ============================================================================

function analyzeResumes() {
    const file1 = resumeUpload1.files[0];
    const file2 = resumeUpload2.files[0];
    const skillsString = skillsInput.value.trim();
    const requiredSkills = skillsString
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

    if (requiredSkills.length === 0) {
        alert('Please enter at least one skill');
        return;
    }

    // Hide upload and show loading
    uploadSection.classList.add('hidden');
    historySection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    // Simulate analysis delay
    setTimeout(() => {
        const results = [];
        const fileNames = [];

        // Analyze Resume 1 if provided
        if (file1) {
            const resume1Text = extractTextFromResume(1);
            const analysis1 = analyzeSkills(resume1Text, requiredSkills);
            results.push(analysis1);
            fileNames.push(file1.name);
        }

        // Analyze Resume 2 if provided
        if (file2) {
            const resume2Text = extractTextFromResume(2);
            const analysis2 = analyzeSkills(resume2Text, requiredSkills);
            results.push(analysis2);
            fileNames.push(file2.name);
        }

        // Display results
        displayResults(results, fileNames);

        // Save to history
        results.forEach((result, index) => {
            saveToHistory(fileNames[index], result.matchPercent);
        });

        // Hide loading and show results
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }, 2000);
}

// ============================================================================
// TEXT EXTRACTION (Mock)
// ============================================================================

function extractTextFromResume(resumeNumber) {
    // In a real app, this would extract text from PDF/DOCX
    // For demo, use sample data
    return resumeNumber === 1 ? sampleResume1 : sampleResume2;
}

// ============================================================================
// SKILL ANALYSIS
// ============================================================================

function analyzeSkills(resumeText, requiredSkills) {
    const resumeLower = resumeText.toLowerCase();
    const matched = [];
    const missing = [];

    requiredSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (resumeLower.includes(skillLower)) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    });

    const matchPercent =
        requiredSkills.length > 0
            ? Math.round((matched.length / requiredSkills.length) * 100)
            : 0;

    return {
        matched,
        missing,
        matchPercent
    };
}

// ============================================================================
// DISPLAY RESULTS
// ============================================================================

function displayResults(results, fileNames) {
    // Clear previous results
    resultsResume2.classList.add('hidden');
    comparisonCard.classList.add('hidden');

    if (results.length === 1) {
        // Single resume analysis
        displaySingleResult(results[0], fileNames[0], 1);
    } else {
        // Dual resume analysis with comparison
        displayDualResults(results, fileNames);
    }
}

function displaySingleResult(analysis, fileName, resumeNumber) {
    const containerId = `results-resume-${resumeNumber}`;
    const container = document.getElementById(containerId);
    container.classList.remove('hidden');

    updateResultsUI(analysis, resumeNumber);
    createSkillsChart(analysis.matched.length, analysis.missing.length);
}

function displayDualResults(results, fileNames) {
    // Show both resumes
    resultsResume2.classList.remove('hidden');
    comparisonCard.classList.remove('hidden');

    // Display Resume 1
    updateResultsUI(results[0], 1, fileNames[0]);

    // Display Resume 2
    updateResultsUI(results[1], 2, fileNames[1]);

    // Show comparison
    displayComparison(results, fileNames);

    // Create combined chart
    createSkillsChart(
        results[0].matched.length + results[1].matched.length,
        results[0].missing.length + results[1].missing.length
    );
}

function updateResultsUI(analysis, resumeNumber, fileName = '') {
    const percentageId = `match-percentage-${resumeNumber}`;
    const percentageCircleId = `percentage-circle-${resumeNumber}`;
    const matchedSkillsId = `matched-skills-${resumeNumber}`;
    const missingSkillsId = `missing-skills-${resumeNumber}`;
    const progressBarId = `progress-bar-${resumeNumber}`;
    const progressFillId = `progress-fill-${resumeNumber}`;
    const progressLabelId = `progress-label-${resumeNumber}`;
    const badgeId = `badge-resume-${resumeNumber}`;

    // Update percentage circle
    const percentageElement = document.getElementById(percentageId);
    const percentageCircle = document.getElementById(percentageCircleId);

    animatePercentage(percentageElement, analysis.matchPercent);
    percentageCircle.style.background = `conic-gradient(#3498db 0% ${analysis.matchPercent}%, #ecf0f1 ${analysis.matchPercent}% 100%)`;

    // Update progress bar
    const progressFill = document.getElementById(progressFillId);
    const progressLabel = document.getElementById(progressLabelId);
    const progressBar = document.getElementById(progressBarId);

    setTimeout(() => {
        progressFill.style.width = analysis.matchPercent + '%';
    }, 100);
    progressLabel.textContent = analysis.matchPercent + '%';

    // Set progress bar color
    if (analysis.matchPercent <= 40) {
        progressFill.classList.add('red');
    } else if (analysis.matchPercent <= 70) {
        progressFill.classList.add('orange');
    } else {
        progressFill.classList.add('green');
    }

    // Update skills
    const matchedContainer = document.getElementById(matchedSkillsId);
    const missingContainer = document.getElementById(missingSkillsId);

    matchedContainer.innerHTML = analysis.matched
        .map(
            skill =>
                `<span class="skill-tag skill-matched"><i class="fas fa-check-circle"></i> ${skill}</span>`
        )
        .join('');

    missingContainer.innerHTML = analysis.missing
        .map(
            skill =>
                `<span class="skill-tag skill-missing"><i class="fas fa-times-circle"></i> ${skill}</span>`
        )
        .join('');
}

function displayComparison(results, fileNames) {
    const comparisonRow1 = document.getElementById('comparison-resume-1');
    const comparisonRow2 = document.getElementById('comparison-resume-2');

    const betterScore = Math.max(results[0].matchPercent, results[1].matchPercent);

    // Create comparison rows
    comparisonRow1.innerHTML = createComparisonRowHTML(
        fileNames[0],
        results[0],
        betterScore === results[0].matchPercent
    );

    comparisonRow2.innerHTML = createComparisonRowHTML(
        fileNames[1],
        results[1],
        betterScore === results[1].matchPercent
    );

    // Add better-match class
    if (betterScore === results[0].matchPercent) {
        comparisonRow1.classList.add('better-match');
        comparisonRow2.classList.remove('better-match');
    } else {
        comparisonRow2.classList.add('better-match');
        comparisonRow1.classList.remove('better-match');
    }
}

function createComparisonRowHTML(fileName, analysis, isBetterMatch) {
    return `
        <div class="col"><strong>${fileName}</strong></div>
        <div class="col"><strong>${analysis.matchPercent}%</strong></div>
        <div class="col"><span class="skill-count">${analysis.matched.length} skills</span></div>
        <div class="col"><span class="skill-count">${analysis.missing.length} skills</span></div>
    `;
}

// ============================================================================
// PERCENTAGE ANIMATION
// ============================================================================

function animatePercentage(element, finalPercent) {
    let currentPercent = 0;
    const increment = finalPercent / 50; // 50 steps for smooth animation
    const timer = setInterval(() => {
        currentPercent += increment;
        if (currentPercent >= finalPercent) {
            currentPercent = finalPercent;
            clearInterval(timer);
        }
        element.textContent = `${Math.round(currentPercent)}%`;
    }, 40);
}

// ============================================================================
// CREATE SKILLS CHART
// ============================================================================

function createSkillsChart(matchedCount, missingCount) {
    const ctx = skillsChartCanvas.getContext('2d');

    // Destroy existing chart if any
    if (window.skillsChart instanceof Chart) {
        window.skillsChart.destroy();
    }

    window.skillsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Matched Skills', 'Missing Skills'],
            datasets: [
                {
                    data: [matchedCount, missingCount],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ============================================================================
// LOCAL STORAGE - HISTORY
// ============================================================================

function saveToHistory(resumeName, score) {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    // Add new entry
    const newEntry = {
        id: Date.now(),
        resumeName: resumeName,
        score: score,
        date: new Date().toLocaleString()
    };

    history.unshift(newEntry);

    // Keep only last 5 entries
    if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
    }

    historySection.classList.remove('hidden');
    historyList.innerHTML = history
        .map(
            entry => `
        <div class="history-card" onclick="viewHistoryItem(${entry.id})">
            <div class="history-card-title">
                <i class="fas fa-file"></i> ${entry.resumeName.substring(0, 20)}...
            </div>
            <div class="history-card-score">${entry.score}%</div>
            <div class="history-card-date">
                <i class="fas fa-clock"></i> ${entry.date}
            </div>
            <button class="history-card-button" onclick="event.stopPropagation(); viewHistoryItem(${entry.id})">
                <i class="fas fa-eye"></i> View
            </button>
        </div>
    `
        )
        .join('');
}

function viewHistoryItem(id) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const item = history.find(h => h.id === id);

    if (item) {
        // Populate UI with historical data
        skillsInput.value = 'HTML, CSS, JavaScript, React, Git'; // Example skills
        uploadSection.classList.add('hidden');
        historySection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');

        // Note: Full history replay would require storing the entire analysis
        // For now, show a message
        alert(`Viewing analysis of: ${item.resumeName}\nScore: ${item.score}%\nDate: ${item.date}`);
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem(HISTORY_KEY);
        displayHistory();
    }
}

// ============================================================================
// NAVIGATION
// ============================================================================

function goBack() {
    // Reset UI
    uploadSection.classList.remove('hidden');
    historySection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    resultsSection.classList.add('hidden');

    // Clear form
    resumeUpload1.value = '';
    resumeUpload2.value = '';
    fileNameDisplay1.textContent = '';
    fileNameDisplay2.textContent = '';
    skillsInput.value = '';

    checkFormValidity();
    displayHistory();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    displayHistory();
});