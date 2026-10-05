/**
 * JFS PTA JOG-A-THON LEADERBOARD WEB APPLICATION
 * James Franklin Smith Elementary PTA
 */

// ==========================================================
// DEFAULT STARTER DATASET (Realistic JFS Elementary Classes)
// ==========================================================
const DEFAULT_STUDENTS = [
  { name: "Maya Sidhu", grade: "3", teacher: "Mr. Davis", week1: 150, week2: 120, week3: 160, laps: 36 },
  { name: "Aarav Patel", grade: "4", teacher: "Mrs. Anderson", week1: 130, week2: 140, week3: 125, laps: 34 },
  { name: "Olivia Martinez", grade: "5", teacher: "Ms. Chang", week1: 140, week2: 160, week3: 130, laps: 38 },
  { name: "Daniel Young", grade: "3", teacher: "Mr. Davis", week1: 130, week2: 140, week3: 110, laps: 35 },
  { name: "Zoe Carter", grade: "4", teacher: "Mrs. Anderson", week1: 125, week2: 135, week3: 140, laps: 36 },
  { name: "Charlotte King", grade: "5", teacher: "Ms. Chang", week1: 115, week2: 125, week3: 130, laps: 37 },
  { name: "Emma Johnson", grade: "2", teacher: "Mrs. Miller", week1: 110, week2: 95, week3: 120, laps: 30 },
  { name: "Jack Green", grade: "3", teacher: "Mr. Davis", week1: 110, week2: 90, week3: 105, laps: 33 },
  { name: "Lucas Nguyen", grade: "5", teacher: "Ms. Chang", week1: 90, week2: 130, week3: 80, laps: 30 },
  { name: "James Lewis", grade: "K", teacher: "Mrs. Lee", week1: 90, week2: 105, week3: 115, laps: 33 },
  { name: "Sophia Garcia", grade: "4", teacher: "Mrs. Anderson", week1: 80, week2: 90, week3: 110, laps: 34 },
  { name: "Chloe White", grade: "4", teacher: "Mrs. Anderson", week1: 105, week2: 90, week3: 85, laps: 31 },
  { name: "Evelyn Hall", grade: "4", teacher: "Mrs. Anderson", week1: 95, week2: 115, week3: 100, laps: 32 },
  { name: "Ella Adams", grade: "5", teacher: "Ms. Chang", week1: 95, week2: 110, week3: 120, laps: 34 },
  { name: "Scarlett Gonzalez", grade: "2", teacher: "Mrs. Miller", week1: 90, week2: 95, week3: 100, laps: 30 },
  { name: "Amelia Lopez", grade: "2", teacher: "Mrs. Miller", week1: 85, week2: 90, week3: 105, laps: 29 },
  { name: "Jackson Lee", grade: "1", teacher: "Ms. Taylor", week1: 85, week2: 60, week3: 95, laps: 30 },
  { name: "Alexander Walker", grade: "1", teacher: "Ms. Taylor", week1: 80, week2: 95, week3: 65, laps: 28 },
  { name: "Owen Baker", grade: "K", teacher: "Mrs. Lee", week1: 80, week2: 85, week3: 90, laps: 26 },
  { name: "Ethan Brown", grade: "3", teacher: "Mr. Davis", week1: 95, week2: 60, week3: 85, laps: 29 },
  { name: "Benjamin Harris", grade: "3", teacher: "Mr. Davis", week1: 70, week2: 85, week3: 90, laps: 27 },
  { name: "Ava Thomas", grade: "2", teacher: "Mrs. Miller", week1: 75, week2: 80, week3: 70, laps: 25 },
  { name: "Harper Scott", grade: "4", teacher: "Mrs. Anderson", week1: 75, week2: 85, week3: 95, laps: 31 },
  { name: "Henry Wright", grade: "K", teacher: "Mrs. Lee", week1: 70, week2: 60, week3: 75, laps: 22 },
  { name: "Leo Nelson", grade: "1", teacher: "Ms. Taylor", week1: 70, week2: 80, week3: 85, laps: 28 },
  { name: "Liam Smith", grade: "1", teacher: "Ms. Taylor", week1: 65, week2: 70, week3: 90, laps: 26 },
  { name: "Harper Robinson", grade: "2", teacher: "Mrs. Miller", week1: 65, week2: 70, week3: 80, laps: 25 },
  { name: "Sebastian Hill", grade: "1", teacher: "Ms. Taylor", week1: 60, week2: 75, week3: 80, laps: 27 },
  { name: "Mia Clark", grade: "5", teacher: "Ms. Chang", week1: 60, week2: 75, week3: 80, laps: 26 },
  { name: "Noah Wilson", grade: "K", teacher: "Mrs. Lee", week1: 50, week2: 65, week3: 80, laps: 24 }
];

const DEFAULT_CONFIG = {
  schoolGoal: 45000,
  donationUrl: "https://forms.gle/8XA8oq5FmHDBwYHFA",
  googleSheetUrl: "",
  privacyMode: false,
  targetDate: "2026-11-13T09:00:00",
  adminPin: "1113"
};

// ==========================================================
// APPLICATION STATE
// ==========================================================
let state = {
  students: [],
  config: { ...DEFAULT_CONFIG },
  activeWeek: 1,
  activeTab: 'overall',
  isAdminUnlocked: false,
  filters: {
    search: '',
    grade: 'ALL',
    teacher: 'ALL',
    sort: 'total_desc'
  }
};

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupAdminAccessTriggers();
  setupEventListeners();
  calculateAndRender();
  setupCountdown();

  // If a Google Sheet live sync URL is configured, auto-refresh live data silently!
  if (state.config.googleSheetUrl) {
    autoSyncFromGoogleSheets();
  }
});

function loadStoredData() {
  try {
    const savedConfig = localStorage.getItem('jfs_jogathon_config_v1');
    if (savedConfig) {
      state.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
    }

    const savedStudents = localStorage.getItem('jfs_jogathon_data_v1');
    if (savedStudents) {
      state.students = JSON.parse(savedStudents);
    } else {
      state.students = normalizeStudentList(DEFAULT_STUDENTS);
      saveStudentsToStorage();
    }
  } catch (err) {
    console.error("Error loading data from localStorage:", err);
    state.students = normalizeStudentList(DEFAULT_STUDENTS);
  }

  // Check if admin is unlocked in this browser session
  if (sessionStorage.getItem('jfs_admin_session') === 'true') {
    state.isAdminUnlocked = true;
  }

  // Populate Config UI fields
  const goalInput = document.getElementById('goalAmountInput');
  const donationUrlInput = document.getElementById('donationUrlInput');
  const googleSheetUrlInput = document.getElementById('googleSheetUrlInput');
  const privacyToggle = document.getElementById('privacyToggle');

  if (goalInput) goalInput.value = state.config.schoolGoal;
  if (donationUrlInput) donationUrlInput.value = state.config.donationUrl;
  if (googleSheetUrlInput) googleSheetUrlInput.value = state.config.googleSheetUrl || '';
  if (privacyToggle) privacyToggle.checked = !!state.config.privacyMode;

  updateDonationLinkTargets();
}

function normalizeStudentList(rawList) {
  return rawList.map(s => {
    const w1 = Number(s.week1) || 0;
    const w2 = Number(s.week2) || 0;
    const w3 = Number(s.week3) || 0;
    const total = s.total !== undefined ? Number(s.total) : (w1 + w2 + w3);
    const laps = Number(s.laps) || 0;
    return {
      name: String(s.name || '').trim(),
      grade: String(s.grade || 'K').trim(),
      teacher: String(s.teacher || 'General').trim(),
      week1: w1,
      week2: w2,
      week3: w3,
      total: total,
      laps: laps
    };
  });
}

function saveStudentsToStorage() {
  localStorage.setItem('jfs_jogathon_data_v1', JSON.stringify(state.students));
}

function saveConfigToStorage() {
  localStorage.setItem('jfs_jogathon_config_v1', JSON.stringify(state.config));
}

// ==========================================================
// TAB SWITCHING
// ==========================================================
function switchTab(tabId) {
  state.activeTab = tabId;

  // Toggle button styling
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tabBtn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Toggle panels
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  const activePanel = document.getElementById(`tabContent-${tabId}`);
  if (activePanel) activePanel.classList.add('active');

  // Specific tab actions
  if (tabId === 'donate') {
    initDonationIframe();
  }
}

function selectWeeklyTab(weekNum) {
  state.activeWeek = weekNum;
  document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
  const activePill = document.getElementById(`weekPill-${weekNum}`);
  if (activePill) activePill.classList.add('active');

  renderWeeklyTab();
}

// ==========================================================
// FORMATTERS & HELPERS
// ==========================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatStudentName(fullName) {
  if (!state.config.privacyMode) return fullName;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function updateDonationLinkTargets() {
  const url = state.config.donationUrl || "https://forms.gle/8XA8oq5FmHDBwYHFA";
  const extBtn = document.getElementById('externalDonationBtn');
  const iframePopout = document.getElementById('iframePopoutBtn');
  const iframeFallback = document.getElementById('iframeFallbackLink');
  const iframeDisplay = document.getElementById('iframeUrlDisplay');

  if (extBtn) extBtn.href = url;
  if (iframePopout) iframePopout.href = url;
  if (iframeFallback) iframeFallback.href = url;
  if (iframeDisplay) iframeDisplay.textContent = url;
}

function initDonationIframe() {
  const iframe = document.getElementById('donationIframe');
  const url = state.config.donationUrl || "https://forms.gle/8XA8oq5FmHDBwYHFA";
  if (iframe && (!iframe.src || iframe.src === 'about:blank')) {
    iframe.src = url;
  }
}

// ==========================================================
// MAIN CALCULATION & RENDERING
// ==========================================================
function calculateAndRender() {
  renderHeaderStats();
  populateTeacherFilterOptions();
  renderOverallTab();
  renderWeeklyTab();
  renderClassesTab();
}

function renderHeaderStats() {
  const totalRaised = state.students.reduce((acc, s) => acc + s.total, 0);
  const goal = state.config.schoolGoal || 45000;
  const percentage = Math.min(100, Math.round((totalRaised / goal) * 100));
  const remaining = Math.max(0, goal - totalRaised);

  // Thermometer & Goal
  const totalRaisedText = document.getElementById('totalRaisedText');
  const schoolGoalText = document.getElementById('schoolGoalText');
  const goalProgressBar = document.getElementById('goalProgressBar');
  const percentGoalText = document.getElementById('percentGoalText');
  const amountRemainingText = document.getElementById('amountRemainingText');

  if (totalRaisedText) totalRaisedText.textContent = formatCurrency(totalRaised);
  if (schoolGoalText) schoolGoalText.textContent = formatCurrency(goal);
  if (goalProgressBar) goalProgressBar.style.width = `${percentage}%`;
  if (percentGoalText) percentGoalText.textContent = `${percentage}% of school target achieved!`;
  if (amountRemainingText) {
    amountRemainingText.textContent = remaining > 0 ? `${formatCurrency(remaining)} remaining` : '🎉 Goal Met!';
  }

  // Top Individual
  const sortedStudents = [...state.students].sort((a, b) => b.total - a.total);
  const topStudent = sortedStudents[0];
  const topStudentText = document.getElementById('topStudentText');
  const topStudentSub = document.getElementById('topStudentSub');
  if (topStudent && topStudentText) {
    topStudentText.textContent = formatStudentName(topStudent.name);
    topStudentSub.textContent = `${formatCurrency(topStudent.total)} (${topStudent.teacher})`;
  }

  // Top Class
  const classMap = aggregateClasses();
  const sortedClasses = Object.values(classMap).sort((a, b) => b.total - a.total);
  const topClass = sortedClasses[0];
  const leadingClassText = document.getElementById('leadingClassText');
  const leadingClassSub = document.getElementById('leadingClassSub');
  if (topClass && leadingClassText) {
    leadingClassText.textContent = topClass.teacher;
    leadingClassSub.textContent = `${formatCurrency(topClass.total)} (${topClass.count} students)`;
  }
}

function aggregateClasses() {
  const map = {};
  state.students.forEach(s => {
    if (!map[s.teacher]) {
      map[s.teacher] = {
        teacher: s.teacher,
        grade: s.grade,
        total: 0,
        week1: 0,
        week2: 0,
        week3: 0,
        count: 0
      };
    }
    map[s.teacher].total += s.total;
    map[s.teacher].week1 += s.week1;
    map[s.teacher].week2 += s.week2;
    map[s.teacher].week3 += s.week3;
    map[s.teacher].count += 1;
  });

  Object.values(map).forEach(c => {
    c.average = c.count > 0 ? Math.round(c.total / c.count) : 0;
  });

  return map;
}

// ==========================================================
// OVERALL INDIVIDUAL TAB
// ==========================================================
function renderOverallTab() {
  const sorted = [...state.students].sort((a, b) => b.total - a.total);

  // Render Podium for Top 3
  const podiumEl = document.getElementById('individualPodium');
  if (podiumEl) {
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    podiumEl.innerHTML = `
      ${second ? `
        <div class="podium-card rank-2">
          <div class="podium-badge">🥈</div>
          <div class="podium-name">${formatStudentName(second.name)}</div>
          <div class="podium-meta">Grade ${second.grade} &bull; ${second.teacher}</div>
          <div class="podium-amount">${formatCurrency(second.total)}</div>
        </div>
      ` : ''}

      ${first ? `
        <div class="podium-card rank-1">
          <div class="podium-badge">🥇</div>
          <div class="podium-name">${formatStudentName(first.name)}</div>
          <div class="podium-meta">Grade ${first.grade} &bull; ${first.teacher}</div>
          <div class="podium-amount">${formatCurrency(first.total)}</div>
        </div>
      ` : ''}

      ${third ? `
        <div class="podium-card rank-3">
          <div class="podium-badge">🥉</div>
          <div class="podium-name">${formatStudentName(third.name)}</div>
          <div class="podium-meta">Grade ${third.grade} &bull; ${third.teacher}</div>
          <div class="podium-amount">${formatCurrency(third.total)}</div>
        </div>
      ` : ''}
    `;
  }

  // Filter and populate table
  filterStudents();
}

function filterStudents() {
  const searchInput = document.getElementById('studentSearchInput');
  const gradeSelect = document.getElementById('gradeFilterSelect');
  const teacherSelect = document.getElementById('teacherFilterSelect');
  const sortSelect = document.getElementById('sortOrderSelect');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedGrade = gradeSelect ? gradeSelect.value : 'ALL';
  const selectedTeacher = teacherSelect ? teacherSelect.value : 'ALL';
  const sortOrder = sortSelect ? sortSelect.value : 'total_desc';

  let list = state.students.filter(s => {
    const matchesSearch = !query || 
      s.name.toLowerCase().includes(query) || 
      s.teacher.toLowerCase().includes(query) || 
      String(s.grade).toLowerCase().includes(query);

    const matchesGrade = selectedGrade === 'ALL' || String(s.grade).toUpperCase() === selectedGrade.toUpperCase();
    const matchesTeacher = selectedTeacher === 'ALL' || s.teacher === selectedTeacher;

    return matchesSearch && matchesGrade && matchesTeacher;
  });

  // Sorting
  list.sort((a, b) => {
    switch (sortOrder) {
      case 'total_desc': return b.total - a.total;
      case 'week1_desc': return b.week1 - a.week1;
      case 'week2_desc': return b.week2 - a.week2;
      case 'week3_desc': return b.week3 - a.week3;
      case 'name_asc': return a.name.localeCompare(b.name);
      default: return b.total - a.total;
    }
  });

  const tbody = document.getElementById('studentsTableBody');
  const countEl = document.getElementById('visibleStudentCount');
  if (countEl) countEl.textContent = list.length;

  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--gray-500);">
          No students found matching your search or filters.
        </td>
      </tr>
    `;
    return;
  }

  // Find natural rank among all students for consistent badge numbering
  const allRankedMap = new Map();
  [...state.students].sort((a, b) => b.total - a.total).forEach((s, idx) => {
    allRankedMap.set(s.name, idx + 1);
  });

  tbody.innerHTML = list.map(student => {
    const rank = allRankedMap.get(student.name) || '-';
    let rankBadgeClass = 'normal';
    if (rank === 1) rankBadgeClass = 'top-1';
    else if (rank === 2) rankBadgeClass = 'top-2';
    else if (rank === 3) rankBadgeClass = 'top-3';

    return `
      <tr>
        <td>
          <span class="rank-badge ${rankBadgeClass}">${rank}</span>
        </td>
        <td class="student-name-cell">
          ${formatStudentName(student.name)}
        </td>
        <td>Grade ${student.grade}</td>
        <td>${student.teacher}</td>
        <td class="num-col">${formatCurrency(student.week1)}</td>
        <td class="num-col">${formatCurrency(student.week2)}</td>
        <td class="num-col">${formatCurrency(student.week3)}</td>
        <td class="num-col total-cell">${formatCurrency(student.total)}</td>
      </tr>
    `;
  }).join('');
}

function populateTeacherFilterOptions() {
  const teacherSelect = document.getElementById('teacherFilterSelect');
  if (!teacherSelect) return;

  const currentVal = teacherSelect.value;
  const teachers = Array.from(new Set(state.students.map(s => s.teacher))).sort();

  teacherSelect.innerHTML = `<option value="ALL">All Teachers</option>` +
    teachers.map(t => `<option value="${t}" ${t === currentVal ? 'selected' : ''}>${t}</option>`).join('');
}

// ==========================================================
// WEEKLY LEADERS TAB
// ==========================================================
function renderWeeklyTab() {
  const weekNum = state.activeWeek;
  const weekKey = `week${weekNum}`;
  const weekLabel = `Week ${weekNum}`;

  const sortedWeekly = [...state.students].sort((a, b) => b[weekKey] - a[weekKey]);
  const weeklyTotal = state.students.reduce((acc, s) => acc + s[weekKey], 0);

  // Active Week Spotlight
  const topWeekly = sortedWeekly[0];
  const spotlightEl = document.getElementById('weekSpotlightCard');
  if (spotlightEl && topWeekly) {
    spotlightEl.innerHTML = `
      <div class="spotlight-left">
        <div class="spotlight-trophy">🐆</div>
        <div>
          <div class="spotlight-meta-label">🏆 ${weekLabel} Leading Fundraiser</div>
          <div class="spotlight-leader-name">${formatStudentName(topWeekly.name)}</div>
          <div class="spotlight-meta-sub">Grade ${topWeekly.grade} &bull; ${topWeekly.teacher}</div>
        </div>
      </div>
      <div class="spotlight-stats">
        <div class="spotlight-meta-label">${weekLabel} Raised</div>
        <div class="spotlight-amount">${formatCurrency(topWeekly[weekKey])}</div>
        <div class="spotlight-sub">Total across all weeks: ${formatCurrency(topWeekly.total)}</div>
      </div>
    `;
  }

  // Update card heading
  const tableTitle = document.getElementById('weeklyTableTitle');
  const badgeRaised = document.getElementById('weeklyTotalRaisedBadge');
  const colHead = document.getElementById('weeklyColHead');

  if (tableTitle) tableTitle.textContent = `Top Performers for ${weekLabel}`;
  if (badgeRaised) badgeRaised.textContent = `${formatCurrency(weeklyTotal)} Raised in ${weekLabel}`;
  if (colHead) colHead.textContent = `${weekLabel} Amount`;

  // Weekly Table (Top 10)
  const tbody = document.getElementById('weeklyTableBody');
  if (!tbody) return;

  const top10 = sortedWeekly.slice(0, 15);
  tbody.innerHTML = top10.map((student, idx) => {
    const rank = idx + 1;
    let badgeClass = 'normal';
    if (rank === 1) badgeClass = 'top-1';
    else if (rank === 2) badgeClass = 'top-2';
    else if (rank === 3) badgeClass = 'top-3';

    return `
      <tr>
        <td>
          <span class="rank-badge ${badgeClass}">${rank}</span>
        </td>
        <td class="student-name-cell">${formatStudentName(student.name)}</td>
        <td>Grade ${student.grade}</td>
        <td>${student.teacher}</td>
        <td class="num-col total-cell">${formatCurrency(student[weekKey])}</td>
        <td class="num-col">${formatCurrency(student.total)}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================================
// CLASSES & TEACHERS TAB
// ==========================================================
function renderClassesTab() {
  const classMap = aggregateClasses();
  const sortedClasses = Object.values(classMap).sort((a, b) => b.total - a.total);
  const classesGrid = document.getElementById('classesGrid');

  if (classesGrid) {
    classesGrid.innerHTML = sortedClasses.map((cls, idx) => {
      const isTop = idx === 0;
      return `
        <div class="class-card ${isTop ? 'top-class' : ''}">
          <div>
            <div class="class-card-header">
              <div>
                <h4 class="class-teacher-name">${cls.teacher}</h4>
                <span class="class-grade-tag">Grade ${cls.grade}</span>
              </div>
              ${isTop ? '<span class="class-trophy-tag">🏆 #1 Class</span>' : `<span class="rank-badge normal">#${idx + 1}</span>`}
            </div>

            <div class="class-raised-amount">${formatCurrency(cls.total)}</div>
            <p class="class-metric-sub">Average per student: <strong>${formatCurrency(cls.average)}</strong></p>
          </div>

          <div class="class-metrics-row">
            <span><strong>${cls.count}</strong> Participating Students</span>
            <span>Week 3: <strong>${formatCurrency(cls.week3)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Grade Breakdown summary
  const gradeMap = {};
  state.students.forEach(s => {
    gradeMap[s.grade] = (gradeMap[s.grade] || 0) + s.total;
  });

  const gradeGrid = document.getElementById('gradeBarsGrid');
  if (gradeGrid) {
    const gradesOrder = ['K', '1', '2', '3', '4', '5', '6'];
    const maxGradeAmount = Math.max(...Object.values(gradeMap), 1);

    gradeGrid.innerHTML = gradesOrder.map(grade => {
      const amount = gradeMap[grade] || 0;
      const pct = Math.round((amount / maxGradeAmount) * 100);
      const label = grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;

      return `
        <div class="grade-bar-item">
          <div class="grade-bar-title">
            <span>${label}</span>
            <span>${formatCurrency(amount)}</span>
          </div>
          <div class="grade-bar-track">
            <div class="grade-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ==========================================================
// COUNTDOWN TIMER (Culmination: Friday, Nov 13th)
// ==========================================================
function setupCountdown() {
  const countdownEl = document.getElementById('countdownDaysText');
  if (!countdownEl) return;

  function update() {
    const target = new Date("2026-11-13T08:30:00");
    const now = new Date();
    const diffMs = target - now;

    if (diffMs <= 0) {
      countdownEl.textContent = "TODAY!";
      return;
    }

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    countdownEl.textContent = `${days}d`;
  }

  update();
  setInterval(update, 60000);
}

// ==========================================================
// CSV FILE IMPORT / PARSING & EXPORT
// ==========================================================
function handleCsvFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csvText = e.target.result;
      const parsedStudents = parseCsvText(csvText);

      if (parsedStudents.length === 0) {
        showToast("⚠️ Could not detect valid student rows in the CSV file.");
        return;
      }

      state.students = parsedStudents;
      saveStudentsToStorage();
      calculateAndRender();
      showToast(`✅ Successfully loaded ${parsedStudents.length} students from CSV!`);
      closeAdminModal();
    } catch (err) {
      console.error(err);
      showToast("❌ Error parsing CSV file. Please check file format.");
    }
  };
  reader.readAsText(file);
}

function setupAdminAccessTriggers() {
  const urlParams = new URLSearchParams(window.location.search);
  const adminParam = urlParams.get('admin');
  const openAdminBtn = document.getElementById('openAdminBtn');

  // 1. Reveal if URL has ?admin=true or ?admin=jaguars
  if (adminParam === 'true' || adminParam === 'jaguars' || adminParam === '1' || state.isAdminUnlocked) {
    if (openAdminBtn) openAdminBtn.style.display = 'inline-flex';
  }

  // 2. Secret Mascot 3-Click Trigger
  const mascot = document.querySelector('.brand-crest');
  if (mascot) {
    let clickCount = 0;
    let clickTimer = null;
    mascot.style.cursor = 'pointer';
    mascot.title = "James Franklin Smith Jaguars";

    mascot.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        if (openAdminBtn) openAdminBtn.style.display = 'inline-flex';
        openAdminModal();
      } else {
        clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
      }
    });
  }

  // 3. Secret Keyboard Shortcut (Cmd+Shift+A or Ctrl+Shift+A)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      if (openAdminBtn) openAdminBtn.style.display = 'inline-flex';
      openAdminModal();
    }
  });
}

function parseCsvText(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header row
  const headers = splitCsvRow(lines[0]).map(h => h.trim().toLowerCase());

  // Check if this is a TRANSACTION / DONATION LOG format (has Date/Timestamp + Amount)
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('when'));
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('donation') || h.includes('pledge') || h.includes('$'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
  const gradeIdx = headers.findIndex(h => h.includes('grade'));
  const teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('class') || h.includes('room'));

  const isTransactionLog = dateIdx !== -1 && amountIdx !== -1 && nameIdx !== -1;

  if (isTransactionLog) {
    // Aggregation mode: Group donation transactions by student!
    const studentMap = new Map();

    for (let i = 1; i < lines.length; i++) {
      const row = splitCsvRow(lines[i]);
      if (row.length === 0 || !row[nameIdx]) continue;

      const rawName = row[nameIdx]?.trim();
      if (!rawName) continue;

      const grade = gradeIdx !== -1 && row[gradeIdx] ? row[gradeIdx].trim() : 'K';
      const teacher = teacherIdx !== -1 && row[teacherIdx] ? row[teacherIdx].trim() : 'General';
      const amt = cleanNumber(row[amountIdx]);
      const dateStr = row[dateIdx] ? row[dateIdx].trim() : '';

      // Determine which week this donation belongs to based on date
      const weekNum = determineWeekFromDate(dateStr);

      if (!studentMap.has(rawName)) {
        studentMap.set(rawName, {
          name: rawName,
          grade: grade,
          teacher: teacher,
          week1: 0,
          week2: 0,
          week3: 0,
          total: 0,
          laps: 0
        });
      }

      const s = studentMap.get(rawName);
      if (grade && grade !== 'K') s.grade = grade;
      if (teacher && teacher !== 'General') s.teacher = teacher;

      if (weekNum === 1) s.week1 += amt;
      else if (weekNum === 2) s.week2 += amt;
      else s.week3 += amt;

      s.total += amt;
    }

    return Array.from(studentMap.values());
  }

  // ROSTER FORMAT (Columns: Student Name, Grade, Teacher, Week 1, Week 2, Week 3, Laps)
  const w1Idx = headers.findIndex(h => h.includes('week 1') || h.includes('week1') || h.includes('w1'));
  const w2Idx = headers.findIndex(h => h.includes('week 2') || h.includes('week2') || h.includes('w2'));
  const w3Idx = headers.findIndex(h => h.includes('week 3') || h.includes('week3') || h.includes('w3'));
  const lapsIdx = headers.findIndex(h => h.includes('lap'));
  const totalIdx = headers.findIndex(h => h.includes('total'));

  const students = [];

  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvRow(lines[i]);
    if (row.length === 0 || !row[nameIdx]) continue;

    const name = row[nameIdx]?.trim();
    if (!name) continue;

    const grade = gradeIdx !== -1 && row[gradeIdx] ? row[gradeIdx].trim() : 'K';
    const teacher = teacherIdx !== -1 && row[teacherIdx] ? row[teacherIdx].trim() : 'General';
    const week1 = w1Idx !== -1 ? cleanNumber(row[w1Idx]) : 0;
    const week2 = w2Idx !== -1 ? cleanNumber(row[w2Idx]) : 0;
    const week3 = w3Idx !== -1 ? cleanNumber(row[w3Idx]) : 0;
    const laps = lapsIdx !== -1 ? cleanNumber(row[lapsIdx]) : 0;

    let total = totalIdx !== -1 ? cleanNumber(row[totalIdx]) : (week1 + week2 + week3);
    if (total === 0 && (week1 > 0 || week2 > 0 || week3 > 0)) {
      total = week1 + week2 + week3;
    }

    students.push({
      name,
      grade,
      teacher,
      week1,
      week2,
      week3,
      total,
      laps
    });
  }

  return students;
}

function determineWeekFromDate(dateStr) {
  if (!dateStr) return 1;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // If not a standard date format, check if string mentions "week 1", "week 2", "week 3"
    const lower = dateStr.toLowerCase();
    if (lower.includes('3')) return 3;
    if (lower.includes('2')) return 2;
    return 1;
  }

  // Culmination is Friday, Nov 13.
  // 3-Week Schedule:
  // Week 1: Kickoff to Oct 30
  // Week 2: Oct 31 to Nov 6
  // Week 3: Nov 7 to Nov 13
  const month = parsed.getMonth(); // 9 = Oct, 10 = Nov
  const day = parsed.getDate();

  if (month === 9) { // October
    return day <= 30 ? 1 : 2;
  } else if (month === 10) { // November
    if (day <= 6) return 2;
    return 3;
  }
  return 1;
}

function splitCsvRow(rowStr) {
  const result = [];
  let insideQuotes = false;
  let current = '';

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '"' || char === "'") {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.replace(/^["']|["']$/g, '').trim());
}

function cleanNumber(val) {
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function downloadCsvTemplate() {
  const headers = "Student Name,Grade,Teacher,Week 1,Week 2,Week 3,Laps Run\n";
  const sample = "Aarav Patel,4,Mrs. Anderson,120,85,95,32\nMaya Sidhu,3,Mr. Davis,150,110,140,36\n";
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jfs_jogathon_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCurrentDataCsv() {
  const headers = ["Student Name", "Grade", "Teacher", "Week 1", "Week 2", "Week 3", "Total", "Laps Run"].join(",");
  const rows = state.students.map(s => {
    return [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.grade}"`,
      `"${s.teacher.replace(/"/g, '""')}"`,
      s.week1,
      s.week2,
      s.week3,
      s.total,
      s.laps
    ].join(",");
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jfs_jogathon_export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("📥 Exported current leaderboard data!");
}

// ==========================================================
// GOOGLE SHEETS LIVE SYNC
// ==========================================================
async function syncFromGoogleSheets() {
  const urlInput = document.getElementById('googleSheetUrlInput');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    showToast("⚠️ Please enter a published Google Sheets CSV URL first.");
    return;
  }

  showToast("🔄 Fetching latest data from Google Sheets...");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    const parsed = parseCsvText(csvText);

    if (parsed.length > 0) {
      state.students = parsed;
      state.config.googleSheetUrl = url;
      saveStudentsToStorage();
      saveConfigToStorage();
      calculateAndRender();
      showToast(`🎉 Synced ${parsed.length} students live from Google Sheets!`);
    } else {
      showToast("⚠️ No valid data rows found in Google Sheet CSV.");
    }
  } catch (err) {
    console.error(err);
    showToast("❌ Could not sync. Make sure Sheet is published: File > Share > Publish to web > CSV.");
  }
}

async function autoSyncFromGoogleSheets() {
  try {
    const res = await fetch(state.config.googleSheetUrl);
    if (res.ok) {
      const csvText = await res.text();
      const parsed = parseCsvText(csvText);
      if (parsed.length > 0) {
        state.students = parsed;
        saveStudentsToStorage();
        calculateAndRender();
        console.log(`Auto-synced ${parsed.length} students from Google Sheets`);
      }
    }
  } catch (e) {
    console.warn("Auto-sync from Google Sheets skipped:", e);
  }
}

// ==========================================================
// ADMIN MODAL & CONTROLS (PIN Protected)
// ==========================================================
function openAdminModal() {
  if (!state.isAdminUnlocked) {
    const enteredPin = prompt("🔒 Organizer Access\nPlease enter the 4-digit Admin PIN to open settings:");
    if (!enteredPin) return;

    const expectedPin = state.config.adminPin || "1113";
    if (enteredPin.trim() === expectedPin) {
      state.isAdminUnlocked = true;
      sessionStorage.setItem('jfs_admin_session', 'true');
      showToast("🔓 Organizer access granted!");
    } else {
      alert("❌ Incorrect PIN. Access denied.");
      return;
    }
  }

  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function togglePrivacyMode() {
  const checkbox = document.getElementById('privacyToggle');
  state.config.privacyMode = !!checkbox?.checked;
  saveConfigToStorage();
  calculateAndRender();
}

function saveAdminSettings() {
  const goalInput = document.getElementById('goalAmountInput');
  const donationUrlInput = document.getElementById('donationUrlInput');
  const googleSheetUrlInput = document.getElementById('googleSheetUrlInput');
  const privacyToggle = document.getElementById('privacyToggle');

  if (goalInput) state.config.schoolGoal = Number(goalInput.value) || 45000;
  if (donationUrlInput) state.config.donationUrl = donationUrlInput.value.trim() || state.config.donationUrl;
  if (googleSheetUrlInput) state.config.googleSheetUrl = googleSheetUrlInput.value.trim();
  if (privacyToggle) state.config.privacyMode = privacyToggle.checked;

  saveConfigToStorage();
  updateDonationLinkTargets();
  calculateAndRender();
  closeAdminModal();
  showToast("💾 Settings saved successfully!");
}

function resetToDefaultData() {
  if (confirm("Reset all data back to the default JFS Elementary sample dataset?")) {
    state.students = normalizeStudentList(DEFAULT_STUDENTS);
    state.config = { ...DEFAULT_CONFIG };
    saveStudentsToStorage();
    saveConfigToStorage();
    loadStoredData();
    calculateAndRender();
    showToast("🔄 Data reset to default sample dataset.");
    closeAdminModal();
  }
}

function copyDonationLink() {
  const url = state.config.donationUrl || "https://forms.gle/8XA8oq5FmHDBwYHFA";
  navigator.clipboard.writeText(url).then(() => {
    showToast("📋 Donation link copied to clipboard!");
  }).catch(() => {
    showToast("Link: " + url);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function setupEventListeners() {
  // Close modal on click outside box
  const adminModal = document.getElementById('adminModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) {
        closeAdminModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAdminModal();
    }
  });
}
