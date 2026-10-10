/**
 * JFS PTA JAG-A-THON LEADERBOARD WEB APPLICATION
 * James Franklin Smith Elementary PTA
 */

// ==========================================================
// OFFICIAL JFS ROSTER CLASSROOMS (24 Classes, 584 Students)
// ==========================================================
const JFS_ROSTER_CLASSES = [
  { teacher: "MCMINN", room: "K-A1", enrolled: 20, grade: "TK" },
  { teacher: "TALAGTAG", room: "A-4", enrolled: 20, grade: "TK" },
  { teacher: "ANGUIANO", room: "K-3", enrolled: 24, grade: "K" },
  { teacher: "BEIER", room: "K-1", enrolled: 24, grade: "K" },
  { teacher: "KHATUN", room: "K-2", enrolled: 24, grade: "K" },
  { teacher: "AVUNOORI - SDC", room: "B-15", enrolled: 10, grade: "Lower SDC" },
  { teacher: "CACCIARONI", room: "B-7", enrolled: 24, grade: "1" },
  { teacher: "MATHARU", room: "B-8", enrolled: 24, grade: "1" },
  { teacher: "QUIJANO", room: "B-9", enrolled: 23, grade: "1" },
  { teacher: "JONES", room: "B-5", enrolled: 23, grade: "2" },
  { teacher: "LUZOD", room: "B-11", enrolled: 23, grade: "2" },
  { teacher: "SWENOR", room: "B-6", enrolled: 24, grade: "2" },
  { teacher: "ALEXANDER", room: "A-5", enrolled: 23, grade: "3" },
  { teacher: "CICCARELLO", room: "A-3", enrolled: 24, grade: "3" },
  { teacher: "HART", room: "A-2", enrolled: 24, grade: "3" },
  { teacher: "HEAP - SDC", room: "B-13", enrolled: 11, grade: "Upper SDC" },
  { teacher: "FECI", room: "C-1", enrolled: 30, grade: "4" },
  { teacher: "NOYES", room: "C-2", enrolled: 27, grade: "4" },
  { teacher: "HOSLER", room: "C-4", enrolled: 30, grade: "4" },
  { teacher: "NUNES", room: "C-7", enrolled: 30, grade: "5" },
  { teacher: "ORLOFF", room: "C-5", enrolled: 30, grade: "5" },
  { teacher: "SCIBA", room: "A-8", enrolled: 31, grade: "5/6" },
  { teacher: "GASPAR", room: "A-9", enrolled: 31, grade: "6" },
  { teacher: "MUNOZ", room: "A-10", enrolled: 30, grade: "6" }
];

// Total student count across the 24 classrooms = 584
const TOTAL_ROSTER_STUDENTS = JFS_ROSTER_CLASSES.reduce((sum, c) => sum + c.enrolled, 0);

// ==========================================================
// DEFAULT STARTER DATASET (Grounded in Real JFS Classes)
// ==========================================================
const DEFAULT_STUDENTS = [
  { name: "Maya Sidhu", grade: "3", teacher: "ALEXANDER", week1: 150, week2: 120, week3: 160, week4: 180, laps: 36 },
  { name: "Aarav Patel", grade: "4", teacher: "FECI", week1: 130, week2: 140, week3: 125, week4: 150, laps: 34 },
  { name: "Olivia Martinez", grade: "5", teacher: "NUNES", week1: 140, week2: 160, week3: 130, week4: 170, laps: 38 },
  { name: "Daniel Young", grade: "3", teacher: "HART", week1: 130, week2: 140, week3: 110, week4: 120, laps: 35 },
  { name: "Zoe Carter", grade: "4", teacher: "HOSLER", week1: 125, week2: 135, week3: 140, week4: 130, laps: 36 },
  { name: "Charlotte King", grade: "5", teacher: "ORLOFF", week1: 115, week2: 125, week3: 130, week4: 145, laps: 37 },
  { name: "Emma Johnson", grade: "2", teacher: "JONES", week1: 110, week2: 95, week3: 120, week4: 110, laps: 30 },
  { name: "Jack Green", grade: "3", teacher: "CICCARELLO", week1: 110, week2: 90, week3: 105, week4: 130, laps: 33 },
  { name: "Lucas Nguyen", grade: "6", teacher: "GASPAR", week1: 90, week2: 130, week3: 80, week4: 120, laps: 30 },
  { name: "James Lewis", grade: "K", teacher: "ANGUIANO", week1: 90, week2: 105, week3: 115, week4: 110, laps: 33 },
  { name: "Sophia Garcia", grade: "4", teacher: "NOYES", week1: 80, week2: 90, week3: 110, week4: 105, laps: 34 },
  { name: "Chloe White", grade: "4", teacher: "FECI", week1: 105, week2: 90, week3: 85, week4: 95, laps: 31 },
  { name: "Evelyn Hall", grade: "6", teacher: "MUNOZ", week1: 95, week2: 115, week3: 100, week4: 90, laps: 32 },
  { name: "Ella Adams", grade: "5/6", teacher: "SCIBA", week1: 95, week2: 110, week3: 120, week4: 115, laps: 34 },
  { name: "Scarlett Gonzalez", grade: "2", teacher: "LUZOD", week1: 90, week2: 95, week3: 100, week4: 85, laps: 30 },
  { name: "Amelia Lopez", grade: "2", teacher: "SWENOR", week1: 85, week2: 90, week3: 105, week4: 90, laps: 29 },
  { name: "Jackson Lee", grade: "1", teacher: "CACCIARONI", week1: 85, week2: 60, week3: 95, week4: 80, laps: 30 },
  { name: "Alexander Walker", grade: "1", teacher: "MATHARU", week1: 80, week2: 95, week3: 65, week4: 75, laps: 28 },
  { name: "Owen Baker", grade: "K", teacher: "BEIER", week1: 80, week2: 85, week3: 90, week4: 85, laps: 26 },
  { name: "Ethan Brown", grade: "TK", teacher: "MCMINN", week1: 95, week2: 60, week3: 85, week4: 70, laps: 29 },
  { name: "Benjamin Harris", grade: "TK", teacher: "TALAGTAG", week1: 70, week2: 85, week3: 90, week4: 65, laps: 27 },
  { name: "Ava Thomas", grade: "1", teacher: "QUIJANO", week1: 75, week2: 80, week3: 70, week4: 85, laps: 25 },
  { name: "Harper Scott", grade: "Lower SDC", teacher: "AVUNOORI - SDC", week1: 75, week2: 85, week3: 95, week4: 80, laps: 31 },
  { name: "Henry Wright", grade: "Upper SDC", teacher: "HEAP - SDC", week1: 70, week2: 60, week3: 75, week4: 70, laps: 22 },
  { name: "Leo Nelson", grade: "K", teacher: "KHATUN", week1: 70, week2: 80, week3: 85, week4: 75, laps: 28 }
];

const DEFAULT_CONFIG = {
  schoolGoal: 45000,
  donationUrl: "https://forms.gle/8XA8oq5FmHDBwYHFA",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu-eBhkVNZJ2Tl4QlanuCBO-a1bCy9rZMfuCg6O_uU7udBcWnIgeKlrsiJTe-kS_Um5PoLYCJ_EFfv/pub?gid=99878568&single=true&output=csv",
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

  // Silently auto-refresh live data if Google Sheet CSV URL configured
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
      const parsed = JSON.parse(savedStudents);
      const isCorrupted = parsed.some(s => s.name && (s.name.includes('<') || s.name.includes('function') || s.total > 10000000));
      if (isCorrupted) {
        console.warn("Corrupted HTML cache detected. Resetting to default sample data.");
        state.students = normalizeStudentList(DEFAULT_STUDENTS);
        saveStudentsToStorage();
      } else {
        state.students = normalizeStudentList(parsed);
      }
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
    const w4 = Number(s.week4) || 0;
    const total = s.total !== undefined ? Number(s.total) : (w1 + w2 + w3 + w4);
    const laps = Number(s.laps) || 0;
    return {
      name: String(s.name || '').trim(),
      grade: String(s.grade || 'K').trim(),
      teacher: String(s.teacher || 'General').trim(),
      week1: w1,
      week2: w2,
      week3: w3,
      week4: w4,
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
// ROSTER MATCHING HELPER
// ==========================================================
function findCanonicalRosterClass(teacherStr) {
  if (!teacherStr) return null;
  const clean = teacherStr.trim().toUpperCase();

  // Exact match on canonical teacher name, room, or combined
  for (const rc of JFS_ROSTER_CLASSES) {
    if (clean === rc.teacher || clean === `${rc.teacher} (${rc.room})` || clean === rc.room) {
      return rc;
    }
  }

  // Substring match on base name (e.g. "McMinn" in "Mrs. McMinn", "Avunoori" in "Avunoori - SDC")
  for (const rc of JFS_ROSTER_CLASSES) {
    const baseName = rc.teacher.replace(/ - SDC/i, '').trim();
    if (clean.includes(baseName)) {
      return rc;
    }
  }

  return null;
}

// ==========================================================
// MAIN CALCULATION & RENDERING
// ==========================================================
function calculateAndRender() {
  renderHeaderStats();
  populateFilterOptions();
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

  // Top Individual (with tie handling)
  const sortedStudents = [...state.students].sort((a, b) => b.total - a.total);
  const maxStudentTotal = sortedStudents[0]?.total || 0;
  const topStudents = sortedStudents.filter(s => s.total === maxStudentTotal && s.total > 0);
  const topStudentText = document.getElementById('topStudentText');
  const topStudentSub = document.getElementById('topStudentSub');

  if (topStudents.length > 1) {
    topStudentText.textContent = `Tied: ${topStudents.map(s => formatStudentName(s.name)).join(' & ')}`;
    topStudentSub.textContent = `${formatCurrency(maxStudentTotal)} each (${topStudents.length} tied)`;
  } else if (topStudents.length === 1) {
    topStudentText.textContent = formatStudentName(topStudents[0].name);
    topStudentSub.textContent = `${formatCurrency(topStudents[0].total)} (${topStudents[0].teacher})`;
  } else {
    topStudentText.textContent = '-';
    topStudentSub.textContent = 'Awaiting donations';
  }

  // Top Class (with tie handling)
  const classMap = aggregateClasses();
  const sortedClasses = Object.values(classMap).sort((a, b) => b.total - a.total);
  const maxClassTotal = sortedClasses[0]?.total || 0;
  const topClasses = sortedClasses.filter(c => c.total === maxClassTotal && c.total > 0);
  const leadingClassText = document.getElementById('leadingClassText');
  const leadingClassSub = document.getElementById('leadingClassSub');

  if (topClasses.length > 1) {
    leadingClassText.textContent = `Tied: ${topClasses.map(c => c.teacher).join(' & ')}`;
    leadingClassSub.textContent = `${formatCurrency(maxClassTotal)} each (${topClasses.length} classes tied)`;
  } else if (topClasses.length === 1) {
    leadingClassText.textContent = topClasses[0].teacher;
    leadingClassSub.textContent = `${formatCurrency(topClasses[0].total)} (${topClasses[0].participating}/${topClasses[0].enrolled} participating)`;
  } else {
    leadingClassText.textContent = '-';
    leadingClassSub.textContent = 'Awaiting donations';
  }
}

function aggregateClasses() {
  const map = {};

  // 1. Initialize all 24 official JFS classrooms
  JFS_ROSTER_CLASSES.forEach(rc => {
    map[rc.teacher] = {
      teacher: rc.teacher,
      room: rc.room,
      grade: rc.grade,
      enrolled: rc.enrolled,
      participating: 0,
      total: 0,
      week1: 0,
      week2: 0,
      week3: 0,
      week4: 0,
      students: [],
      topStudent: null
    };
  });

  // 2. Aggregate students into classrooms
  state.students.forEach(s => {
    const rc = findCanonicalRosterClass(s.teacher);
    const key = rc ? rc.teacher : (s.teacher || 'General');

    if (!map[key]) {
      map[key] = {
        teacher: key,
        room: '',
        grade: s.grade || 'K',
        enrolled: 0,
        participating: 0,
        total: 0,
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        students: [],
        topStudent: null
      };
    }

    const cls = map[key];
    cls.total += s.total;
    cls.week1 += s.week1;
    cls.week2 += s.week2;
    cls.week3 += s.week3;
    cls.week4 += (s.week4 || 0);
    cls.students.push(s);

    if (s.total > 0) {
      cls.participating += 1;
    }

    if (s.total > 0 && (!cls.topStudent || s.total > cls.topStudent.total)) {
      cls.topStudent = s;
    }
  });

  // 3. Compute participation percentage and average per student
  Object.values(map).forEach(c => {
    const denom = c.enrolled > 0 ? c.enrolled : (c.participating > 0 ? c.participating : 1);
    c.participationPct = c.enrolled > 0 ? Math.min(100, Math.round((c.participating / c.enrolled) * 100)) : (c.participating > 0 ? 100 : 0);
    c.average = Math.round(c.total / denom);
  });

  return map;
}

// ==========================================================
// OVERALL INDIVIDUAL TAB (With Tied Co-Leader Display)
// ==========================================================
function renderOverallTab() {
  const sorted = [...state.students].sort((a, b) => b.total - a.total);
  const podiumEl = document.getElementById('individualPodium');

  if (podiumEl) {
    const positiveStudents = sorted.filter(s => s.total > 0);
    const distinctAmounts = Array.from(new Set(positiveStudents.map(s => s.total))).sort((a, b) => b - a);

    if (distinctAmounts.length === 0) {
      podiumEl.innerHTML = `
        <div class="podium-card" style="flex: 1; max-width: 500px; padding: 28px;">
          <div class="podium-badge">🐾</div>
          <div class="podium-name">Fundraising In Progress!</div>
          <div class="podium-meta">Top student fundraisers will appear here as donations arrive.</div>
        </div>
      `;
    } else {
      const firstTier = positiveStudents.filter(s => s.total === distinctAmounts[0]);

      // If multiple students tie for 1st place!
      if (firstTier.length > 1) {
        let html = firstTier.map(s => `
          <div class="podium-card tied-co-leader">
            <div class="podium-badge" style="background: linear-gradient(135deg, #ffd700 0%, #ffae00 100%);">🥇</div>
            <div class="podium-name">${formatStudentName(s.name)}</div>
            <div class="podium-meta">Grade ${s.grade} &bull; ${s.teacher}</div>
            <div class="podium-amount" style="color: #b45309;">${formatCurrency(s.total)}</div>
            <span class="co-leader-pill">🥇 Tied for 1st</span>
          </div>
        `).join('');

        // If there's a runner-up tier, show it
        if (distinctAmounts.length > 1 && firstTier.length === 2) {
          const secondTier = positiveStudents.filter(s => s.total === distinctAmounts[1]);
          if (secondTier.length > 0) {
            const runnerUp = secondTier[0];
            html += `
              <div class="podium-card rank-3">
                <div class="podium-badge">🥉</div>
                <div class="podium-name">${formatStudentName(runnerUp.name)}</div>
                <div class="podium-meta">Grade ${runnerUp.grade} &bull; ${runnerUp.teacher}</div>
                <div class="podium-amount">${formatCurrency(runnerUp.total)}</div>
                <span class="co-leader-pill" style="background: #ffedd5; color: #9a3412;">3rd Place</span>
              </div>
            `;
          }
        }
        podiumEl.innerHTML = html;
      } else {
        // Single 1st place student: Olympic 2-1-3 layout
        const first = firstTier[0];
        const secondTier = distinctAmounts.length > 1 ? positiveStudents.filter(s => s.total === distinctAmounts[1]) : [];
        const second = secondTier[0];
        const thirdTier = distinctAmounts.length > 2 ? positiveStudents.filter(s => s.total === distinctAmounts[2]) : [];
        const third = thirdTier[0];

        podiumEl.innerHTML = `
          ${second ? `
            <div class="podium-card rank-2">
              <div class="podium-badge">🥈</div>
              <div class="podium-name">${formatStudentName(second.name)}</div>
              <div class="podium-meta">Grade ${second.grade} &bull; ${second.teacher}</div>
              <div class="podium-amount">${formatCurrency(second.total)}</div>
              ${secondTier.length > 1 ? `<span class="co-leader-pill" style="background:#f1f5f9; color:#475569;">🥈 Tied for 2nd</span>` : ''}
            </div>
          ` : ''}

          <div class="podium-card rank-1">
            <div class="podium-badge">🥇</div>
            <div class="podium-name">${formatStudentName(first.name)}</div>
            <div class="podium-meta">Grade ${first.grade} &bull; ${first.teacher}</div>
            <div class="podium-amount">${formatCurrency(first.total)}</div>
          </div>

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
    }
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
      case 'week4_desc': return (b.week4 || 0) - (a.week4 || 0);
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
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--gray-500);">
          No students found matching your search or filters.
        </td>
      </tr>
    `;
    return;
  }

  // Standard competition ranking with ties (1, 1, 3...)
  const sortedAll = [...state.students].sort((a, b) => b.total - a.total);
  const allRankedMap = new Map();
  let currentRank = 1;
  for (let i = 0; i < sortedAll.length; i++) {
    if (i > 0 && sortedAll[i].total < sortedAll[i - 1].total) {
      currentRank = i + 1;
    }
    allRankedMap.set(sortedAll[i].name, currentRank);
  }

  tbody.innerHTML = list.map(student => {
    const rank = allRankedMap.get(student.name) || '-';
    let rankBadgeClass = 'normal';
    if (rank === 1 && student.total > 0) rankBadgeClass = 'top-1';
    else if (rank === 2 && student.total > 0) rankBadgeClass = 'top-2';
    else if (rank === 3 && student.total > 0) rankBadgeClass = 'top-3';

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
        <td class="num-col">${formatCurrency(student.week4 || 0)}</td>
        <td class="num-col total-cell">${formatCurrency(student.total)}</td>
      </tr>
    `;
  }).join('');
}

function populateFilterOptions() {
  // 1. Grade Select (Strictly unique grades from roster & students)
  const gradeSelect = document.getElementById('gradeFilterSelect');
  if (gradeSelect) {
    const currentGrade = gradeSelect.value;
    const rosterGrades = JFS_ROSTER_CLASSES.map(c => c.grade);
    const studentGrades = state.students.map(s => s.grade);
    const allGrades = Array.from(new Set([...rosterGrades, ...studentGrades])).filter(Boolean);

    // Natural pedagogical order: TK, K, Lower SDC, 1, 2, 3, Upper SDC, 4, 5, 5/6, 6
    const gradeOrder = ['TK', 'K', 'Lower SDC', '1', '2', '3', 'Upper SDC', '4', '5', '5/6', '6'];
    allGrades.sort((a, b) => {
      const idxA = gradeOrder.indexOf(a);
      const idxB = gradeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    gradeSelect.innerHTML = `<option value="ALL">All Grades (${allGrades.length})</option>` +
      allGrades.map(g => `<option value="${g}" ${g === currentGrade ? 'selected' : ''}>${g.toLowerCase().includes('sdc') || g.toLowerCase().startsWith('grade') ? g : 'Grade ' + g}</option>`).join('');
  }

  // 2. Teacher Select (Strictly unique teachers from roster & students)
  const teacherSelect = document.getElementById('teacherFilterSelect');
  if (teacherSelect) {
    const currentTeacher = teacherSelect.value;
    const rosterTeachers = JFS_ROSTER_CLASSES.map(c => c.teacher);
    const studentTeachers = state.students.map(s => s.teacher);
    const teachers = Array.from(new Set([...rosterTeachers, ...studentTeachers])).filter(Boolean).sort();
    teacherSelect.innerHTML = `<option value="ALL">All Teachers (${teachers.length})</option>` +
      teachers.map(t => `<option value="${t}" ${t === currentTeacher ? 'selected' : ''}>${t}</option>`).join('');
  }
}

// ==========================================================
// WEEKLY LEADERS TAB (4 Weeks, Date Ranges & Tie Handling)
// ==========================================================
function renderWeeklyTab() {
  const weekNum = state.activeWeek;
  const weekKey = `week${weekNum}`;

  const weekLabels = {
    1: "Week 1: Oct 19 - 23",
    2: "Week 2: Oct 24 - 30",
    3: "Week 3: Oct 31 - Nov 6",
    4: "Week 4: Nov 7 - 13"
  };
  const weekLabel = weekLabels[weekNum] || `Week ${weekNum}`;

  const sortedWeekly = [...state.students].sort((a, b) => (b[weekKey] || 0) - (a[weekKey] || 0));
  const weeklyTotal = state.students.reduce((acc, s) => acc + (s[weekKey] || 0), 0);

  // Active Week Spotlight (With tie handling)
  const maxWeekly = sortedWeekly[0]?.[weekKey] || 0;
  const topWeeklyStudents = sortedWeekly.filter(s => s[weekKey] === maxWeekly && s[weekKey] > 0);
  const spotlightEl = document.getElementById('weekSpotlightCard');

  if (spotlightEl) {
    if (topWeeklyStudents.length === 0) {
      spotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">🐾</div>
          <div>
            <div class="spotlight-meta-label">${weekLabel} Leaderboard</div>
            <div class="spotlight-leader-name">Awaiting ${weekLabel} donations</div>
            <div class="spotlight-meta-sub">Donations recorded for this sprint will appear here!</div>
          </div>
        </div>
      `;
    } else if (topWeeklyStudents.length > 1) {
      spotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">🐆</div>
          <div>
            <div class="spotlight-meta-label">🏆 ${weekLabel} Co-Leaders (Tied)</div>
            <div class="spotlight-leader-name">${topWeeklyStudents.map(s => formatStudentName(s.name)).join(' & ')}</div>
            <div class="spotlight-meta-sub">${topWeeklyStudents.map(s => `Grade ${s.grade} (${s.teacher})`).join(' &bull; ')}</div>
          </div>
        </div>
        <div class="spotlight-stats">
          <div class="spotlight-meta-label">${weekLabel} Raised</div>
          <div class="spotlight-amount">${formatCurrency(maxWeekly)}</div>
          <div class="spotlight-sub">Tied for 1st this week!</div>
        </div>
      `;
    } else {
      const topWeekly = topWeeklyStudents[0];
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
          <div class="spotlight-sub">Cumulative total across all weeks: ${formatCurrency(topWeekly.total)}</div>
        </div>
      `;
    }
  }

  // Update card heading
  const tableTitle = document.getElementById('weeklyTableTitle');
  const badgeRaised = document.getElementById('weeklyTotalRaisedBadge');
  const colHead = document.getElementById('weeklyColHead');

  if (tableTitle) tableTitle.textContent = `Top Fundraisers for ${weekLabel}`;
  if (badgeRaised) badgeRaised.textContent = `${formatCurrency(weeklyTotal)} Raised in ${weekLabel}`;
  if (colHead) colHead.textContent = `${weekLabel} Amount`;

  // Weekly Table (Top 15 with competition ranking)
  const tbody = document.getElementById('weeklyTableBody');
  if (!tbody) return;

  const top15 = sortedWeekly.slice(0, 15);
  let currentRank = 1;
  tbody.innerHTML = top15.map((student, idx) => {
    if (idx > 0 && (student[weekKey] || 0) < (top15[idx - 1][weekKey] || 0)) {
      currentRank = idx + 1;
    }
    const rank = currentRank;
    let badgeClass = 'normal';
    if (rank === 1 && (student[weekKey] || 0) > 0) badgeClass = 'top-1';
    else if (rank === 2 && (student[weekKey] || 0) > 0) badgeClass = 'top-2';
    else if (rank === 3 && (student[weekKey] || 0) > 0) badgeClass = 'top-3';

    return `
      <tr>
        <td>
          <span class="rank-badge ${badgeClass}">${rank}</span>
        </td>
        <td class="student-name-cell">${formatStudentName(student.name)}</td>
        <td>Grade ${student.grade}</td>
        <td>${student.teacher}</td>
        <td class="num-col total-cell">${formatCurrency(student[weekKey] || 0)}</td>
        <td class="num-col">${formatCurrency(student.total)}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================================
// CLASSES & TEACHERS TAB (24 Hardcoded Classes, Pizza Party & Prizes)
// ==========================================================
function renderClassesTab() {
  const classMap = aggregateClasses();
  const sortedClasses = Object.values(classMap).sort((a, b) => b.total - a.total);
  const classesGrid = document.getElementById('classesGrid');

  const maxClassTotal = sortedClasses[0]?.total || 0;
  const topClasses = sortedClasses.filter(c => c.total === maxClassTotal && c.total > 0);
  const isTied = topClasses.length > 1;

  if (classesGrid) {
    let currentRank = 1;
    classesGrid.innerHTML = sortedClasses.map((cls, idx) => {
      if (idx > 0 && cls.total < sortedClasses[idx - 1].total) {
        currentRank = idx + 1;
      }
      const isTop = cls.total === maxClassTotal && cls.total > 0;
      const roomBadge = cls.room ? `<span class="class-grade-tag" style="margin-left: 6px; background: #e2e8f0; color: #475569; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem;">Room ${cls.room}</span>` : '';

      return `
        <div class="class-card ${isTop ? 'top-class' : ''}">
          <div>
            <div class="class-card-header">
              <div>
                <h4 class="class-teacher-name">${cls.teacher}</h4>
                <div style="display: flex; align-items: center; margin-top: 4px;">
                  <span class="class-grade-tag">${cls.grade.toLowerCase().includes('sdc') ? cls.grade : 'Grade ' + cls.grade}</span>
                  ${roomBadge}
                </div>
              </div>
              ${isTop ? `<span class="class-trophy-tag">🏆 ${isTied ? 'Tied for #1 Class' : '#1 Class'}</span>` : `<span class="rank-badge normal">#${currentRank}</span>`}
            </div>

            ${isTop ? `
              <div style="margin: 6px 0 10px;">
                <span class="badge badge-light" style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.76rem; padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                  🚌 Leading Contender: Cal Academy Field Trip!
                </span>
              </div>
            ` : ''}

            <div class="class-raised-amount">${formatCurrency(cls.total)}</div>
            <p class="class-metric-sub">Average per enrolled student: <strong>${formatCurrency(cls.average)}</strong></p>

            <!-- Pizza Party 100% Participation Tracker -->
            <div class="pizza-party-tracker">
              <div class="pizza-party-header">
                <span>🍕 Pizza Party Participation</span>
                <span>${cls.participationPct}%</span>
              </div>
              <div class="pizza-progress-track">
                <div class="pizza-progress-fill" style="width: ${cls.participationPct}%;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.75rem; color: #854d0e;">
                <span>${cls.participating} of ${cls.enrolled || cls.participating} students</span>
                ${cls.participationPct >= 100 
                  ? `<span class="badge-pizza-unlocked">🎉 Unlocked! +$100 Card</span>` 
                  : `<span>${(cls.enrolled || 0) - cls.participating > 0 ? `${cls.enrolled - cls.participating} more needed` : ''}</span>`
                }
              </div>
            </div>

            <!-- Top Student in Class -->
            <div class="class-top-student-row">
              <span>⭐ Class Top Student:</span>
              ${cls.topStudent 
                ? `<strong>${formatStudentName(cls.topStudent.name)} (${formatCurrency(cls.topStudent.total)})</strong>` 
                : `<span class="text-gray-500">Awaiting donations</span>`
              }
            </div>
          </div>

          <div class="class-metrics-row">
            <span><strong>${cls.participating}</strong> Active / <strong>${cls.enrolled || cls.participating}</strong> Enrolled</span>
            <span>W1-4: <strong>${formatCurrency(cls.total)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Grade Breakdown summary (With Movie + Pizza Night MPR callout)
  const gradeMap = {};
  state.students.forEach(s => {
    gradeMap[s.grade] = (gradeMap[s.grade] || 0) + s.total;
  });

  const gradeGrid = document.getElementById('gradeBarsGrid');
  if (gradeGrid) {
    const rosterGrades = JFS_ROSTER_CLASSES.map(c => c.grade);
    const studentGrades = state.students.map(s => s.grade);
    const uniqueGrades = Array.from(new Set([...rosterGrades, ...studentGrades])).filter(Boolean);

    const gradeOrder = ['TK', 'K', 'Lower SDC', '1', '2', '3', 'Upper SDC', '4', '5', '5/6', '6'];
    uniqueGrades.sort((a, b) => {
      const idxA = gradeOrder.indexOf(a);
      const idxB = gradeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const maxGradeAmount = Math.max(...Object.values(gradeMap), 1);

    if (uniqueGrades.length === 0) {
      gradeGrid.innerHTML = `<p style="color:var(--gray-500); padding: 12px;">No grades loaded in roster.</p>`;
    } else {
      gradeGrid.innerHTML = `
        <div style="grid-column: 1 / -1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; font-size: 0.86rem; color: #166534; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.2rem;">🎬</span>
          <div><strong>Grade-Wide Contest:</strong> The grade level with the highest total funds raised wins an exclusive <strong>Movie + Pizza Night in the MPR</strong>!</div>
        </div>
      ` + uniqueGrades.map(grade => {
        const amount = gradeMap[grade] || 0;
        const pct = Math.round((amount / maxGradeAmount) * 100);
        const label = grade.toLowerCase().includes('sdc') || grade.toLowerCase().startsWith('grade') ? grade : `Grade ${grade}`;

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
  if (!text || typeof text !== 'string') return [];

  // Guard against HTML web pages
  const trimmed = text.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<script') || trimmed.includes('<head')) {
    console.warn("Rejected HTML response from Google Sheets URL. URL must be CSV format (output=csv).");
    return [];
  }

  const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
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
    // Group donation transactions by student!
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
          week4: 0,
          total: 0,
          laps: 0
        });
      }

      const s = studentMap.get(rawName);
      if (grade && grade !== 'K') s.grade = grade;
      if (teacher && teacher !== 'General') s.teacher = teacher;

      if (weekNum === 1) s.week1 += amt;
      else if (weekNum === 2) s.week2 += amt;
      else if (weekNum === 3) s.week3 += amt;
      else s.week4 += amt;

      s.total += amt;
    }

    return Array.from(studentMap.values());
  }

  // ROSTER FORMAT (Columns: Student Name, Grade, Teacher, Week 1, Week 2, Week 3, Week 4, Laps)
  const w1Idx = headers.findIndex(h => h.includes('week 1') || h.includes('week1') || h.includes('w1'));
  const w2Idx = headers.findIndex(h => h.includes('week 2') || h.includes('week2') || h.includes('w2'));
  const w3Idx = headers.findIndex(h => h.includes('week 3') || h.includes('week3') || h.includes('w3'));
  const w4Idx = headers.findIndex(h => h.includes('week 4') || h.includes('week4') || h.includes('w4'));
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
    const week4 = w4Idx !== -1 ? cleanNumber(row[w4Idx]) : 0;
    const laps = lapsIdx !== -1 ? cleanNumber(row[lapsIdx]) : 0;

    let total = totalIdx !== -1 ? cleanNumber(row[totalIdx]) : (week1 + week2 + week3 + week4);
    if (total === 0 && (week1 > 0 || week2 > 0 || week3 > 0 || week4 > 0)) {
      total = week1 + week2 + week3 + week4;
    }

    students.push({
      name,
      grade,
      teacher,
      week1,
      week2,
      week3,
      week4,
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
    const lower = dateStr.toLowerCase();
    if (lower.includes('4')) return 4;
    if (lower.includes('3')) return 3;
    if (lower.includes('2')) return 2;
    return 1;
  }

  // 4-Week Schedule:
  // Week 1: Oct 19 - Oct 23
  // Week 2: Oct 24 - Oct 30
  // Week 3: Oct 31 - Nov 6
  // Week 4: Nov 7 - Nov 13
  const month = parsed.getMonth(); // 9 = Oct, 10 = Nov
  const day = parsed.getDate();

  if (month === 9) { // October
    if (day <= 23) return 1;
    return 2; // Oct 24 - Oct 31
  } else if (month === 10) { // November
    if (day <= 6) return 3; // Nov 1 - Nov 6
    return 4; // Nov 7 - Nov 13+
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
  const headers = "Student Name,Grade,Teacher,Week 1,Week 2,Week 3,Week 4,Laps Run\n";
  const sample = "Aarav Patel,4,FECI,120,85,95,110,32\nMaya Sidhu,3,ALEXANDER,150,110,140,160,36\n";
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jfs_jagathon_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCurrentDataCsv() {
  const headers = ["Student Name", "Grade", "Teacher", "Week 1", "Week 2", "Week 3", "Week 4", "Total", "Laps Run"].join(",");
  const rows = state.students.map(s => {
    return [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.grade}"`,
      `"${s.teacher.replace(/"/g, '""')}"`,
      s.week1 || 0,
      s.week2 || 0,
      s.week3 || 0,
      s.week4 || 0,
      s.total,
      s.laps || 0
    ].join(",");
  });

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jfs_jagathon_export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("📥 Exported current leaderboard data!");
}

// ==========================================================
// GOOGLE SHEETS LIVE SYNC
// ==========================================================
function normalizeGoogleSheetsCsvUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // 1. If user pasted a /pubhtml URL, convert it to /pub
  if (url.includes('/pubhtml')) {
    url = url.replace('/pubhtml', '/pub');
  }

  // 2. Ensure output=csv parameter is present for /pub URLs
  if (url.includes('/pub')) {
    if (!url.includes('output=csv')) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}output=csv`;
    }
    return url;
  }

  // 3. If user pasted a standard Google Sheet edit/view URL
  const docMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (docMatch && docMatch[1]) {
    const docId = docMatch[1];
    const gidMatch = url.match(/gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv${gidParam}`;
  }

  return url;
}

async function syncFromGoogleSheets() {
  const urlInput = document.getElementById('googleSheetUrlInput');
  const rawUrl = urlInput ? urlInput.value.trim() : '';

  if (!rawUrl) {
    showToast("⚠️ Please enter a published Google Sheets CSV URL first.");
    return;
  }

  const normalizedUrl = normalizeGoogleSheetsCsvUrl(rawUrl);
  if (urlInput) urlInput.value = normalizedUrl;

  showToast("🔄 Fetching latest data from Google Sheets...");

  try {
    const cacheBuster = `&_cb=${Date.now()}`;
    const fetchUrl = normalizedUrl.includes('?') ? `${normalizedUrl}${cacheBuster}` : `${normalizedUrl}?${cacheBuster}`;
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    const parsed = parseCsvText(csvText);

    if (parsed.length > 0) {
      state.students = parsed;
      state.config.googleSheetUrl = normalizedUrl;
      saveStudentsToStorage();
      saveConfigToStorage();
      calculateAndRender();
      showToast(`🎉 Synced ${parsed.length} students live from Google Sheets!`);
    } else {
      showToast("⚠️ Could not parse CSV rows. Ensure sheet is published as CSV.");
    }
  } catch (err) {
    console.error(err);
    showToast("❌ Could not sync. Make sure Sheet is published: File > Share > Publish to web > CSV.");
  }
}

async function autoSyncFromGoogleSheets() {
  try {
    const targetUrl = normalizeGoogleSheetsCsvUrl(state.config.googleSheetUrl);
    if (!targetUrl) return;

    const cacheBuster = `&_cb=${Date.now()}`;
    const fetchUrl = targetUrl.includes('?') ? `${targetUrl}${cacheBuster}` : `${targetUrl}?${cacheBuster}`;
    const res = await fetch(fetchUrl);
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
