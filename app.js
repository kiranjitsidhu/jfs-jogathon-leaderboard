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
  { teacher: "AVUNOORI", room: "B-15", enrolled: 10, grade: "Lower SDC" },
  { teacher: "CACCIARONI", room: "B-7", enrolled: 24, grade: "1" },
  { teacher: "MATHARU", room: "B-8", enrolled: 24, grade: "1" },
  { teacher: "QUIJANO", room: "B-9", enrolled: 23, grade: "1" },
  { teacher: "JONES", room: "B-5", enrolled: 23, grade: "2" },
  { teacher: "LUZOD", room: "B-11", enrolled: 23, grade: "2" },
  { teacher: "SWENOR", room: "B-6", enrolled: 24, grade: "2" },
  { teacher: "ALEXANDER", room: "A-5", enrolled: 23, grade: "3" },
  { teacher: "CICCARELLO", room: "A-3", enrolled: 24, grade: "3" },
  { teacher: "HART", room: "A-2", enrolled: 24, grade: "3" },
  { teacher: "HEAP", room: "B-13", enrolled: 11, grade: "Upper SDC" },
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

// Pedagogical grade order: TK, K, Lower SDC, 1, 2, 3, Upper SDC, 4, 5, 5/6, 6
const GRADE_ORDER = ['TK', 'K', 'Lower SDC', '1', '2', '3', 'Upper SDC', '4', '5', '5/6', '6'];

function compareGrades(a, b) {
  const normA = (/^lower/i.test(a)) ? 'Lower SDC' : (/^upper/i.test(a)) ? 'Upper SDC' : a;
  const normB = (/^lower/i.test(b)) ? 'Lower SDC' : (/^upper/i.test(b)) ? 'Upper SDC' : b;
  const idxA = GRADE_ORDER.indexOf(normA);
  const idxB = GRADE_ORDER.indexOf(normB);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  return String(a).localeCompare(String(b));
}

// ==========================================================
// DEFAULT STARTER DATASET (Clean Empty Start - Awaiting Donations)
// ==========================================================
const DEFAULT_STUDENTS = [];

const CANONICAL_DONATION_URL = "https://www.zeffy.com/en-US/donation-form/jfs-pta-jag-a-thon-fundraiser";

const DEFAULT_CONFIG = {
  schoolGoal: 50000,
  donationUrl: CANONICAL_DONATION_URL,
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu-eBhkVNZJ2Tl4QlanuCBO-a1bCy9rZMfuCg6O_uU7udBcWnIgeKlrsiJTe-kS_Um5PoLYCJ_EFfv/pub?gid=0&single=true&output=csv",
  privacyMode: true,
  targetDate: "2026-11-13T09:00:00",
  adminPin: "1113"
};

// ==========================================================
// APPLICATION STATE
// ==========================================================
function getCurrentCampaignWeek() {
  const now = new Date();
  const y = now.getFullYear();
  const w1Cutoff = new Date(y, 9, 23, 17, 30, 0); // Oct 23 at 5:30 PM
  const w2Cutoff = new Date(y, 9, 30, 18, 5, 0);   // Oct 30 at 6:05 PM
  const w3Cutoff = new Date(y, 10, 6, 16, 0, 0);  // Nov 6 at 4:00 PM

  const t = now.getTime();
  if (t < w1Cutoff.getTime()) {
    return 1;
  } else if (t < w2Cutoff.getTime()) {
    return 2;
  } else if (t < w3Cutoff.getTime()) {
    return 3;
  } else {
    return 4;
  }
}

let state = {
  students: [],
  config: { ...DEFAULT_CONFIG },
  activeWeek: getCurrentCampaignWeek(),
  activeTab: 'overall',
  isAdminUnlocked: false,
  cardFormat: 'story',
  filters: {
    search: '',
    grade: 'ALL',
    room: 'ALL',
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
  initShareKitForm();

  // Silently auto-refresh live data if Google Sheet CSV URL configured
  if (state.config.googleSheetUrl) {
    autoSyncFromGoogleSheets();
  }
});

function loadStoredData() {
  try {
    let savedConfig = localStorage.getItem('jfs_jogathon_config_v2');
    if (!savedConfig) {
      savedConfig = localStorage.getItem('jfs_jogathon_config_v1');
    }
    if (savedConfig) {
      state.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
    }
    // Strictly heal stale or truncated donation URLs from previous browser sessions
    if (!state.config.donationUrl || 
        !state.config.donationUrl.includes('jfs-pta-jag-a-thon-fundraiser') || 
        !state.config.donationUrl.includes('/en-US/')) {
      state.config.donationUrl = CANONICAL_DONATION_URL;
    }
    // Strictly heal stale Google Sheet URL from previous deleted tab
    if (!state.config.googleSheetUrl || state.config.googleSheetUrl.includes('gid=99878568')) {
      state.config.googleSheetUrl = DEFAULT_CONFIG.googleSheetUrl;
    }
    saveConfigToStorage();

    // Purge legacy test session data
    localStorage.removeItem('jfs_jogathon_data_v1');
    const savedStudents = localStorage.getItem('jfs_jogathon_data_v2');
    if (savedStudents) {
      const parsed = JSON.parse(savedStudents);
      const isCorrupted = parsed.some(s => s.name && (s.name.includes('<') || s.name.includes('function') || s.total > 10000000));
      if (isCorrupted) {
        state.students = [];
        saveStudentsToStorage();
      } else {
        // Heal any entries where teacher was temporarily stored as a room number (e.g. "B-11")
        parsed.forEach(s => {
          if (s.teacher && (s.teacher.match(/^[A-K]-[0-9]+$/i) || s.teacher === 'B-11')) {
            const rc = JFS_ROSTER_CLASSES.find(c => c.room.toUpperCase() === s.teacher.toUpperCase());
            if (rc) {
              s.room = rc.room;
              s.teacher = rc.teacher;
              s.grade = rc.grade;
            }
          }
        });
        state.students = normalizeStudentList(parsed);
        saveStudentsToStorage();
      }
    } else {
      state.students = [];
      saveStudentsToStorage();
    }
  } catch (err) {
    console.error("Error loading data from localStorage:", err);
    state.students = [];
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

    let teacher = String(s.teacher || 'General').trim();
    let room = String(s.room || '').trim();
    let grade = String(s.grade || 'K').trim();

    // If teacher looks like a room code (e.g. "B-11", "K-3"), swap/fix it
    if (teacher.match(/^[A-K]-[0-9]+$/i) || teacher === 'B-11') {
      const rc = JFS_ROSTER_CLASSES.find(c => c.room.toUpperCase() === teacher.toUpperCase());
      if (rc) {
        room = rc.room;
        teacher = rc.teacher;
        grade = rc.grade;
      }
    }

    // Use canonical roster matching to sync room & teacher
    const rc = findCanonicalRosterClass(teacher, room);
    const canonicalTeacher = rc ? rc.teacher : teacher;
    const canonicalRoom = rc ? rc.room : room;
    let canonicalGrade = rc ? rc.grade : grade;
    if (/^lower(\s*sdc|\s*grade)?$/i.test(canonicalGrade) || canonicalTeacher === 'AVUNOORI') canonicalGrade = 'Lower SDC';
    if (/^upper(\s*sdc|\s*grade)?$/i.test(canonicalGrade) || canonicalTeacher === 'HEAP') canonicalGrade = 'Upper SDC';

    return {
      name: String(s.name || '').trim(),
      grade: canonicalGrade,
      teacher: canonicalTeacher,
      room: canonicalRoom,
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
  localStorage.setItem('jfs_jogathon_data_v2', JSON.stringify(state.students));
  localStorage.removeItem('jfs_jogathon_data_v1');
}

function saveConfigToStorage() {
  localStorage.setItem('jfs_jogathon_config_v2', JSON.stringify(state.config));
  localStorage.removeItem('jfs_jogathon_config_v1');
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
  if (tabId === 'weekly') {
    // Default to the current competition week if user hasn't explicitly selected one
    const currentWk = getCurrentCampaignWeek();
    selectWeeklyTab(state.activeWeek || currentWk);
  } else if (tabId === 'donate') {
    initDonationIframe();
  } else if (tabId === 'volunteer') {
    initVolunteerIframe();
  } else if (tabId === 'share') {
    initShareKitForm();
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
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function formatGradeLabel(grade) {
  if (!grade) return '';
  const g = String(grade).trim();
  if (/^lower(\s*sdc|\s*grade)?$/i.test(g)) return 'Lower SDC';
  if (/^upper(\s*sdc|\s*grade)?$/i.test(g)) return 'Upper SDC';
  if (g.toLowerCase().startsWith('grade')) return g;
  return `Grade ${g}`;
}

function getEffectiveDonationUrl() {
  if (state.config.donationUrl && 
      state.config.donationUrl.includes('jfs-pta-jag-a-thon-fundraiser') && 
      state.config.donationUrl.includes('/en-US/')) {
    return state.config.donationUrl;
  }
  return CANONICAL_DONATION_URL;
}

function updateDonationLinkTargets() {
  const url = getEffectiveDonationUrl();
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
  const url = getEffectiveDonationUrl();
  if (iframe && (!iframe.src || iframe.src === 'about:blank')) {
    iframe.src = url;
  }
}

function initVolunteerIframe() {
  const iframe = document.getElementById('volunteerIframe');
  const url = "https://docs.google.com/forms/d/e/1FAIpQLScKwthYPsAzpuebmTkiN0hehdbyq-8CDHC8Vmb2fpkRikZS8Q/viewform?embedded=true";
  if (iframe && (!iframe.src || iframe.src === 'about:blank' || iframe.src.includes('forms.gle'))) {
    iframe.src = url;
  }
}

// ==========================================================
// ROSTER MATCHING HELPER (Supports Teacher & Room Matching)
// ==========================================================
function findCanonicalRosterClass(teacherStr, roomStr) {
  const cleanRoom = (roomStr || '').trim().toUpperCase().replace(/^ROOM\s*/i, '');
  const cleanTeacher = (teacherStr || '').trim().toUpperCase().replace(/\s*-\s*SDC/i, '').replace(/\s+SDC/i, '').trim();

  // 1. Direct match on room first if provided
  if (cleanRoom) {
    const byRoom = JFS_ROSTER_CLASSES.find(rc => rc.room.toUpperCase() === cleanRoom);
    if (byRoom) return byRoom;
  }

  if (!cleanTeacher) return null;

  // 2. Direct match on canonical teacher name, room, or combined
  for (const rc of JFS_ROSTER_CLASSES) {
    if (cleanTeacher === rc.teacher || cleanTeacher === `${rc.teacher} (${rc.room})` || cleanTeacher === rc.room) {
      return rc;
    }
  }

  // 3. Substring match on base name (e.g. "McMinn" in "Mrs. McMinn", "Avunoori", "Heap")
  for (const rc of JFS_ROSTER_CLASSES) {
    const baseName = rc.teacher.replace(/ - SDC/i, '').trim();
    if (cleanTeacher.includes(baseName)) {
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
  const goal = state.config.schoolGoal || 50000;
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

  // Top Individual (with tie handling, no room)
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

  // Top Class (with tie handling, no room, % only)
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
    leadingClassText.textContent = `${topClasses[0].teacher}`;
    leadingClassSub.textContent = `${formatCurrency(topClasses[0].total)} (${topClasses[0].participationPct}% participation)`;
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
      topStudent: null,
      topStudents: []
    };
  });

  // 2. Aggregate students into classrooms
  state.students.forEach(s => {
    const rc = findCanonicalRosterClass(s.teacher, s.room);
    const key = rc ? rc.teacher : (s.teacher || 'General');

    if (!map[key]) {
      map[key] = {
        teacher: key,
        room: s.room || '',
        grade: s.grade || 'K',
        enrolled: 0,
        participating: 0,
        total: 0,
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0,
        students: [],
        topStudent: null,
        topStudents: []
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
  });

  // 3. Compute participation percentage, average, and all tied top students
  Object.values(map).forEach(c => {
    const denom = c.enrolled > 0 ? c.enrolled : (c.participating > 0 ? c.participating : 1);
    c.participationPct = c.enrolled > 0 ? Math.min(100, Math.round((c.participating / c.enrolled) * 100)) : (c.participating > 0 ? 100 : 0);
    c.average = Math.round(c.total / denom);

    // Identify all students sharing the top positive donation amount in this class
    const positiveStudents = c.students.filter(s => s.total > 0);
    const maxTotal = positiveStudents.reduce((max, s) => Math.max(max, s.total), 0);
    if (maxTotal > 0) {
      c.topStudents = positiveStudents.filter(s => s.total === maxTotal);
      c.topStudent = c.topStudents[0];
    } else {
      c.topStudents = [];
      c.topStudent = null;
    }
  });

  return map;
}

// ==========================================================
// OVERALL INDIVIDUAL TAB (With Top 10 & Class Champions)
// ==========================================================
function renderOverallTab() {
  const sorted = [...state.students].sort((a, b) => b.total - a.total);
  const positiveStudents = sorted.filter(s => s.total > 0);
  const distinctAmounts = Array.from(new Set(positiveStudents.map(s => s.total))).sort((a, b) => b - a);

  // 1. Olympic Podium for Top 3 (No room numbers)
  const podiumEl = document.getElementById('individualPodium');
  if (podiumEl) {
    if (distinctAmounts.length === 0) {
      podiumEl.innerHTML = `
        <div class="podium-card rank-2 podium-placeholder">
          <div class="podium-badge">🥈</div>
          <div class="podium-name">Awaiting 2nd Place</div>
          <div class="podium-meta">James Franklin Smith Jaguars</div>
          <div class="podium-amount">$0</div>
          <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥈 In Contention</span>
        </div>
        <div class="podium-card rank-1 podium-placeholder">
          <div class="podium-badge">🥇</div>
          <div class="podium-name">Awaiting 1st Place</div>
          <div class="podium-meta">James Franklin Smith Jaguars</div>
          <div class="podium-amount">$0</div>
          <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥇 In Contention</span>
        </div>
        <div class="podium-card rank-3 podium-placeholder">
          <div class="podium-badge">🥉</div>
          <div class="podium-name">Awaiting 3rd Place</div>
          <div class="podium-meta">James Franklin Smith Jaguars</div>
          <div class="podium-amount">$0</div>
          <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥉 In Contention</span>
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
            <div class="podium-meta">${formatGradeLabel(s.grade)} &bull; ${s.teacher}</div>
            <div class="podium-amount" style="color: #b45309;">${formatCurrency(s.total)}</div>
            <span class="co-leader-pill">🥇 Tied for 1st</span>
          </div>
        `).join('');

        if (firstTier.length === 2) {
          if (distinctAmounts.length > 1) {
            const runnerUpTier = positiveStudents.filter(s => s.total === distinctAmounts[1]);
            const runnerUp = runnerUpTier[0];
            html += `
              <div class="podium-card rank-3">
                <div class="podium-badge">🥉</div>
                <div class="podium-name">${formatStudentName(runnerUp.name)}</div>
                <div class="podium-meta">${formatGradeLabel(runnerUp.grade)} &bull; ${runnerUp.teacher}</div>
                <div class="podium-amount">${formatCurrency(runnerUp.total)}</div>
                <span class="co-leader-pill" style="background: #ffedd5; color: #9a3412;">3rd Place</span>
              </div>
            `;
          } else {
            html += `
              <div class="podium-card rank-3 podium-placeholder">
                <div class="podium-badge">🥉</div>
                <div class="podium-name">Awaiting 3rd Place</div>
                <div class="podium-meta">James Franklin Smith Jaguars</div>
                <div class="podium-amount">$0</div>
                <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥉 In Contention</span>
              </div>
            `;
          }
        }
        podiumEl.innerHTML = html;
      } else {
        const first = firstTier[0];
        const secondTier = distinctAmounts.length > 1 ? positiveStudents.filter(s => s.total === distinctAmounts[1]) : [];
        const second = secondTier[0] || null;

        let third = null;
        let thirdIsTiedSecond = false;
        if (secondTier.length > 1) {
          third = secondTier[1];
          thirdIsTiedSecond = true;
        } else if (distinctAmounts.length > 2) {
          const thirdTier = positiveStudents.filter(s => s.total === distinctAmounts[2]);
          third = thirdTier[0] || null;
        }

        const secondCardHtml = second ? `
          <div class="podium-card rank-2">
            <div class="podium-badge">🥈</div>
            <div class="podium-name">${formatStudentName(second.name)}</div>
            <div class="podium-meta">${formatGradeLabel(second.grade)} &bull; ${second.teacher}</div>
            <div class="podium-amount">${formatCurrency(second.total)}</div>
            ${secondTier.length > 1 ? `<span class="co-leader-pill" style="background:#f1f5f9; color:#475569;">🥈 Tied for 2nd</span>` : ''}
          </div>
        ` : `
          <div class="podium-card rank-2 podium-placeholder">
            <div class="podium-badge">🥈</div>
            <div class="podium-name">Awaiting 2nd Place</div>
            <div class="podium-meta">James Franklin Smith Jaguars</div>
            <div class="podium-amount">$0</div>
            <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥈 In Contention</span>
          </div>
        `;

        const firstCardHtml = `
          <div class="podium-card rank-1">
            <div class="podium-badge">🥇</div>
            <div class="podium-name">${formatStudentName(first.name)}</div>
            <div class="podium-meta">${formatGradeLabel(first.grade)} &bull; ${first.teacher}</div>
            <div class="podium-amount">${formatCurrency(first.total)}</div>
          </div>
        `;

        const thirdCardHtml = third ? `
          <div class="podium-card rank-3">
            <div class="podium-badge">${thirdIsTiedSecond ? '🥈' : '🥉'}</div>
            <div class="podium-name">${formatStudentName(third.name)}</div>
            <div class="podium-meta">${formatGradeLabel(third.grade)} &bull; ${third.teacher}</div>
            <div class="podium-amount">${formatCurrency(third.total)}</div>
            ${thirdIsTiedSecond ? `<span class="co-leader-pill" style="background:#f1f5f9; color:#475569;">🥈 Tied for 2nd</span>` : ''}
          </div>
        ` : `
          <div class="podium-card rank-3 podium-placeholder">
            <div class="podium-badge">🥉</div>
            <div class="podium-name">Awaiting 3rd Place</div>
            <div class="podium-meta">James Franklin Smith Jaguars</div>
            <div class="podium-amount">$0</div>
            <span class="co-leader-pill" style="background: #f1f5f9; color: #64748b;">🥉 In Contention</span>
          </div>
        `;

        podiumEl.innerHTML = secondCardHtml + firstCardHtml + thirdCardHtml;
      }
    }
  }

  // 2. Render Top 10 Individual Students Table
  const top10Tbody = document.getElementById('top10TableBody');
  if (top10Tbody) {
    const top10List = positiveStudents.slice(0, 10);
    if (top10List.length === 0) {
      top10Tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: var(--gray-500);">
            Donations are arriving soon! Top 10 individual leaders will be showcased here.
          </td>
        </tr>
      `;
    } else {
      let currentRank = 1;
      top10Tbody.innerHTML = top10List.map((student, idx) => {
        if (idx > 0 && student.total < top10List[idx - 1].total) {
          currentRank = idx + 1;
        }
        const rank = currentRank;
        let badgeClass = 'normal';
        if (rank === 1) badgeClass = 'top-1';
        else if (rank === 2) badgeClass = 'top-2';
        else if (rank === 3) badgeClass = 'top-3';

        const gradeLabel = formatGradeLabel(student.grade);

        return `
          <tr>
            <td><span class="rank-badge ${badgeClass}">#${rank}</span></td>
            <td class="student-name-cell"><strong>${formatStudentName(student.name)}</strong></td>
            <td>${gradeLabel}</td>
            <td>${student.teacher}</td>
            <td class="num-col total-cell">${formatCurrency(student.total)}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. Render Top Student per Classroom (Replacing full records)
  filterClassTopStudents();
}

function filterClassTopStudents() {
  const searchInput = document.getElementById('classTopSearchInput');
  const gradeSelect = document.getElementById('gradeFilterSelect');
  const teacherSelect = document.getElementById('teacherFilterSelect');
  const sortSelect = document.getElementById('sortOrderSelect');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedGrade = state.filters.grade || (gradeSelect ? gradeSelect.value : 'ALL');
  const selectedTeacher = state.filters.teacher || (teacherSelect ? teacherSelect.value : 'ALL');
  const sortOrder = sortSelect ? sortSelect.value : 'total_desc';

  const classMap = aggregateClasses();
  let list = Object.values(classMap);

  // Filters: allows teacher or grade search (e.g. "Lower SDC", "SDC", "Grade 2", "Anguiano")
  list = list.filter(cls => {
    const gradeLabel = formatGradeLabel(cls.grade).toLowerCase();
    const rawGrade = String(cls.grade).toLowerCase();
    const teacherName = cls.teacher.toLowerCase();
    const topStudentName = cls.topStudent ? cls.topStudent.name.toLowerCase() : '';

    const matchesSearch = !query ||
      teacherName.includes(query) ||
      rawGrade.includes(query) ||
      gradeLabel.includes(query) ||
      topStudentName.includes(query);

    const matchesGrade = selectedGrade === 'ALL' ||
      String(cls.grade).toUpperCase() === selectedGrade.toUpperCase() ||
      formatGradeLabel(cls.grade).toUpperCase() === formatGradeLabel(selectedGrade).toUpperCase();

    const matchesTeacher = selectedTeacher === 'ALL' || cls.teacher === selectedTeacher;

    return matchesSearch && matchesGrade && matchesTeacher;
  });

  // Sorting
  list.sort((a, b) => {
    const aTotal = a.topStudent ? a.topStudent.total : 0;
    const bTotal = b.topStudent ? b.topStudent.total : 0;
    switch (sortOrder) {
      case 'total_desc':
        return bTotal - aTotal;
      case 'teacher_asc':
        return a.teacher.localeCompare(b.teacher);
      case 'grade_asc':
        return compareGrades(a.grade, b.grade);
      default:
        return bTotal - aTotal;
    }
  });

  const tbody = document.getElementById('classTopTableBody');
  const countEl = document.getElementById('visibleClassTopCount');
  if (countEl) countEl.textContent = list.length;
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 30px; color: var(--gray-500);">
          No classrooms matching your filter criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(cls => {
    const hasTop = cls.topStudent && cls.topStudent.total > 0;
    const gradeLabel = formatGradeLabel(cls.grade);

    return `
      <tr>
        <td><strong>${cls.teacher}</strong></td>
        <td>${gradeLabel}</td>
        <td class="student-name-cell">
          ${hasTop 
            ? (cls.topStudents && cls.topStudents.length > 1
                ? `<span>${cls.topStudents.map(s => formatStudentName(s.name)).join(' & ')} <span class="badge badge-light" style="font-size:0.7rem;">Tied</span></span>`
                : formatStudentName(cls.topStudent.name)
              )
            : `<span style="color:var(--gray-400);">Awaiting donations</span>`
          }
        </td>
        <td class="num-col total-cell">${formatCurrency(hasTop ? (cls.topStudent ? cls.topStudent.total : 0) : 0)}</td>
        <td>
          ${hasTop 
            ? `<span class="badge" style="background: #ecfdf5; color: #047857; font-weight: 700; font-size: 0.76rem; padding: 4px 8px; border-radius: 9999px;">🎁 $25 Gift Card Leader</span>`
            : `<span style="color:var(--gray-400); font-size:0.8rem;">$25 Gift Card in Contention</span>`
          }
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================================
// CASCADING / INTERDEPENDENT FILTER HANDLERS
// ==========================================================
function onGradeFilterChange() {
  const gradeSelect = document.getElementById('gradeFilterSelect');
  const selectedGrade = gradeSelect ? gradeSelect.value : 'ALL';
  state.filters.grade = selectedGrade;

  // If grade changed, check if current teacher still belongs to this grade
  if (selectedGrade !== 'ALL') {
    const validClasses = JFS_ROSTER_CLASSES.filter(c => 
      String(c.grade).toUpperCase() === selectedGrade.toUpperCase() ||
      formatGradeLabel(c.grade).toUpperCase() === formatGradeLabel(selectedGrade).toUpperCase()
    );
    const validTeachers = validClasses.map(c => c.teacher.toUpperCase());

    if (!validTeachers.includes(state.filters.teacher.toUpperCase())) {
      state.filters.teacher = 'ALL';
    }
  } else {
    state.filters.teacher = 'ALL';
  }

  updateDependentDropdowns();
  filterClassTopStudents();
}

function onTeacherFilterChange() {
  const teacherSelect = document.getElementById('teacherFilterSelect');
  const selectedTeacher = teacherSelect ? teacherSelect.value : 'ALL';
  state.filters.teacher = selectedTeacher;

  if (selectedTeacher !== 'ALL') {
    const matchedClass = findCanonicalRosterClass(selectedTeacher, '');
    if (matchedClass) {
      state.filters.grade = matchedClass.grade;
    }
  }

  updateDependentDropdowns();
  filterClassTopStudents();
}

function updateDependentDropdowns() {
  const gradeSelect = document.getElementById('gradeFilterSelect');
  const teacherSelect = document.getElementById('teacherFilterSelect');

  const selectedGrade = state.filters.grade || 'ALL';
  const selectedTeacher = state.filters.teacher || 'ALL';

  if (gradeSelect) {
    gradeSelect.value = selectedGrade;
  }

  // Teacher dropdown
  if (teacherSelect) {
    const relevantClasses = selectedGrade === 'ALL'
      ? JFS_ROSTER_CLASSES
      : JFS_ROSTER_CLASSES.filter(c => 
          String(c.grade).toUpperCase() === selectedGrade.toUpperCase() ||
          formatGradeLabel(c.grade).toUpperCase() === formatGradeLabel(selectedGrade).toUpperCase()
        );

    const rosterTeachers = relevantClasses.map(c => c.teacher);
    const availableTeachers = Array.from(new Set(rosterTeachers)).sort();

    const teacherAllLabel = selectedGrade === 'ALL'
      ? `All Teachers (${availableTeachers.length})`
      : `All Teachers (${formatGradeLabel(selectedGrade)})`;

    teacherSelect.innerHTML = `<option value="ALL">${teacherAllLabel}</option>` +
      availableTeachers.map(t => `<option value="${t}" ${t === selectedTeacher ? 'selected' : ''}>${t}</option>`).join('');
  }
}

function populateFilterOptions() {
  const gradeSelect = document.getElementById('gradeFilterSelect');
  if (gradeSelect) {
    const currentGrade = state.filters.grade || 'ALL';
    const rosterGrades = JFS_ROSTER_CLASSES.map(c => c.grade);
    const allGrades = Array.from(new Set(rosterGrades)).filter(Boolean);

    allGrades.sort(compareGrades);

    gradeSelect.innerHTML = `<option value="ALL">All Grades (${allGrades.length})</option>` +
      allGrades.map(g => `<option value="${g}" ${g === currentGrade ? 'selected' : ''}>${formatGradeLabel(g)}</option>`).join('');
  }

  updateDependentDropdowns();
}

// ==========================================================
// WEEKLY LEADERS TAB (4 Weeks, Bike/Scooter Prizes, No Cumulative Total)
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

  // Only consider students who have collected donations > 0 in this specific week
  const activeWeeklyStudents = state.students.filter(s => (s[weekKey] || 0) > 0);
  const sortedWeekly = activeWeeklyStudents.sort((a, b) => (b[weekKey] || 0) - (a[weekKey] || 0));
  const weeklyTotal = activeWeeklyStudents.reduce((acc, s) => acc + (s[weekKey] || 0), 0);

  // 1. Active Week Individual Spotlight (Bike/Scooter prize, no cumulative total, no room)
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
            <div class="spotlight-meta-sub">🏆 Prize: Brand New Bike or Scooter!</div>
          </div>
        </div>
      `;
    } else if (topWeeklyStudents.length > 1) {
      spotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">
            <img src="jfs-logo.png" alt="JFS Jaguars Mascot" class="spotlight-mascot-img">
          </div>
          <div>
            <div class="spotlight-meta-label">🏆 ${weekLabel} Co-Leaders (Tied)</div>
            <div class="spotlight-leader-name">${topWeeklyStudents.map(s => formatStudentName(s.name)).join(' & ')}</div>
            <div class="spotlight-meta-sub">${topWeeklyStudents.map(s => `${formatGradeLabel(s.grade)} (${s.teacher})`).join(' &bull; ')}</div>
            <div style="margin-top:6px; color:#b45309; font-weight:700; font-size:0.8rem;">🚲 Sprint Prize: Brand New Bike / Scooter!</div>
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
      const gradeLabel = formatGradeLabel(topWeekly.grade);
      spotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">
            <img src="jfs-logo.png" alt="JFS Jaguars Mascot" class="spotlight-mascot-img">
          </div>
          <div>
            <div class="spotlight-meta-label">🏆 ${weekLabel} Leading Fundraiser</div>
            <div class="spotlight-leader-name">${formatStudentName(topWeekly.name)}</div>
            <div class="spotlight-meta-sub">${gradeLabel} &bull; ${topWeekly.teacher}</div>
            <div style="margin-top:6px; color:#b45309; font-weight:700; font-size:0.82rem;">🚲 Sprint Prize: Brand New Bike / Scooter!</div>
          </div>
        </div>
        <div class="spotlight-stats">
          <div class="spotlight-meta-label">${weekLabel} Raised</div>
          <div class="spotlight-amount">${formatCurrency(topWeekly[weekKey])}</div>
        </div>
      `;
    }
  }

  // 2. Active Week Classroom Spotlight (No contributing students count, no room)
  const classWeeklyMap = {};
  JFS_ROSTER_CLASSES.forEach(rc => {
    classWeeklyMap[rc.teacher] = {
      teacher: rc.teacher,
      room: rc.room,
      grade: rc.grade,
      enrolled: rc.enrolled,
      weekAmount: 0,
      activeStudents: 0
    };
  });

  state.students.forEach(s => {
    const rc = findCanonicalRosterClass(s.teacher, s.room);
    const key = rc ? rc.teacher : (s.teacher || 'General');
    if (!classWeeklyMap[key]) {
      classWeeklyMap[key] = {
        teacher: key,
        room: s.room || '',
        grade: s.grade || 'K',
        enrolled: 0,
        weekAmount: 0,
        activeStudents: 0
      };
    }
    const amt = s[weekKey] || 0;
    classWeeklyMap[key].weekAmount += amt;
    if (amt > 0) {
      classWeeklyMap[key].activeStudents += 1;
    }
  });

  const activeWeeklyClasses = Object.values(classWeeklyMap).filter(c => c.weekAmount > 0);
  const sortedWeeklyClasses = activeWeeklyClasses.sort((a, b) => b.weekAmount - a.weekAmount);
  const maxWeeklyClass = sortedWeeklyClasses[0]?.weekAmount || 0;
  const topWeeklyClasses = sortedWeeklyClasses.filter(c => c.weekAmount === maxWeeklyClass && c.weekAmount > 0);
  const classSpotlightEl = document.getElementById('weekClassSpotlightCard');

  if (classSpotlightEl) {
    if (topWeeklyClasses.length === 0) {
      classSpotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">🏫</div>
          <div>
            <div class="spotlight-meta-label">🏫 Top Earning Classroom (${weekLabel})</div>
            <div class="spotlight-leader-name">Awaiting ${weekLabel} donations</div>
            <div class="spotlight-meta-sub">🏆 Prize: Teacher $100 Gift Card + Student Ice Cream Social!</div>
          </div>
        </div>
      `;
    } else if (topWeeklyClasses.length > 1) {
      classSpotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">🍦</div>
          <div>
            <div class="spotlight-meta-label">🏆 Top Earning Classrooms (Tied)</div>
            <div class="spotlight-leader-name">${topWeeklyClasses.map(c => c.teacher).join(' & ')}</div>
            <div class="spotlight-meta-sub">🎉 Tied Reward: Teacher $100 Gift Card + Student Ice Cream Social!</div>
          </div>
        </div>
        <div class="spotlight-stats">
          <div class="spotlight-meta-label">${weekLabel} Raised</div>
          <div class="spotlight-amount">${formatCurrency(maxWeeklyClass)}</div>
          <div class="spotlight-sub">${topWeeklyClasses.length} classrooms tied this sprint!</div>
        </div>
      `;
    } else {
      const topCls = topWeeklyClasses[0];
      const gradeLabel = formatGradeLabel(topCls.grade);
      classSpotlightEl.innerHTML = `
        <div class="spotlight-left">
          <div class="spotlight-trophy">🍦</div>
          <div>
            <div class="spotlight-meta-label">🏆 Top Earning Classroom (${weekLabel})</div>
            <div class="spotlight-leader-name">${topCls.teacher}</div>
            <div class="spotlight-meta-sub">${gradeLabel} &bull; 🏆 Prize: Teacher $100 Gift Card + Student Ice Cream Social!</div>
          </div>
        </div>
        <div class="spotlight-stats">
          <div class="spotlight-meta-label">${weekLabel} Raised</div>
          <div class="spotlight-amount">${formatCurrency(maxWeeklyClass)}</div>
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

  // Weekly Table (5 columns: Rank, Student, Grade, Teacher, Week Amount — Room & Overall Total removed!)
  const tbody = document.getElementById('weeklyTableBody');
  if (!tbody) return;

  if (sortedWeekly.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 40px; color: var(--gray-500);">
          No donations recorded yet for ${weekLabel}.
        </td>
      </tr>
    `;
    return;
  }

  const topWeeklyList = sortedWeekly.slice(0, 25);
  let currentRank = 1;
  tbody.innerHTML = topWeeklyList.map((student, idx) => {
    if (idx > 0 && (student[weekKey] || 0) < (topWeeklyList[idx - 1][weekKey] || 0)) {
      currentRank = idx + 1;
    }
    const rank = currentRank;
    let badgeClass = 'normal';
    if (rank === 1) badgeClass = 'top-1';
    else if (rank === 2) badgeClass = 'top-2';
    else if (rank === 3) badgeClass = 'top-3';

    const gradeLabel = formatGradeLabel(student.grade);

    return `
      <tr>
        <td>
          <span class="rank-badge ${badgeClass}">${rank}</span>
        </td>
        <td class="student-name-cell">${formatStudentName(student.name)}</td>
        <td>${gradeLabel}</td>
        <td>${student.teacher}</td>
        <td class="num-col total-cell">${formatCurrency(student[weekKey] || 0)}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================================
// 100% PARTICIPATION, TEACHER, & GRADE COMPETITIONS TAB
// ==========================================================
function renderClassesTab() {
  const classMap = aggregateClasses();
  const sortedClasses = Object.values(classMap).sort((a, b) => b.total - a.total);
  const classesGrid = document.getElementById('classesGrid');

  const maxClassTotal = sortedClasses[0]?.total || 0;
  const topClasses = sortedClasses.filter(c => c.total === maxClassTotal && c.total > 0);
  const isTied = topClasses.length > 1;

  // 1. 100% Participation Leaderboard (Active Contenders, auto-capped to top 5)
  const participationGrid = document.getElementById('participationLeaderboardGrid');
  if (participationGrid) {
    const sortedByParticipation = [...sortedClasses].sort((a, b) => {
      if (b.participationPct !== a.participationPct) return b.participationPct - a.participationPct;
      return b.total - a.total;
    });

    // Only consider classes that have active participation (>0%) so 0% classes aren't arbitrarily ranked #2, #3, etc.
    const activeContenders = sortedByParticipation.filter(c => c.participationPct > 0 || c.total > 0);

    // If active contenders exist, auto-select up to top 5 (or just the active ones if fewer than 5)
    const topContenders = activeContenders.slice(0, 5);

    if (topContenders.length === 0) {
      participationGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 24px 20px; background: white; border-radius: var(--radius-md); border: 1px dashed var(--gray-300); color: var(--gray-600);">
          <div style="font-size: 1.5rem; margin-bottom: 6px;">🍕</div>
          <div style="font-weight: 700; color: var(--navy); font-size: 0.95rem;">Contest underway! All 24 classrooms are contending for 1st to 100%.</div>
          <p style="margin: 4px 0 0; font-size: 0.85rem; color: var(--gray-500);">Every student who receives at least 1 donation counts toward their classroom total. Leaders will appear here as donations arrive!</p>
        </div>
      `;
    } else {
      let currentRank = 1;
      participationGrid.innerHTML = topContenders.map((cls, idx) => {
        if (idx > 0 && cls.participationPct < topContenders[idx - 1].participationPct) {
          currentRank = idx + 1;
        }

        const isTied = (idx > 0 && cls.participationPct === topContenders[idx - 1].participationPct) ||
                       (idx < topContenders.length - 1 && cls.participationPct === topContenders[idx + 1].participationPct);

        const rankLabel = isTied ? `Tied #${currentRank}` : `#${currentRank}`;
        const isComplete = cls.participationPct >= 100;
        const gradeLabel = formatGradeLabel(cls.grade);

        let rankBadgeClass = 'normal';
        if (currentRank === 1) rankBadgeClass = 'top-1';
        else if (currentRank === 2) rankBadgeClass = 'top-2';
        else if (currentRank === 3) rankBadgeClass = 'top-3';

        return `
          <div class="participation-card ${isComplete ? 'participation-winner' : ''}">
            <div class="participation-card-header">
              <span class="rank-badge ${rankBadgeClass}">${rankLabel}</span>
              <div class="participation-class-info">
                <h4 class="class-teacher-name">${cls.teacher}</h4>
                <span class="class-grade-tag">${gradeLabel}</span>
              </div>
              <div class="participation-pct-pill ${isComplete ? 'pct-100' : ''}">
                ${cls.participationPct}%
              </div>
            </div>
            <div class="participation-progress-track">
              <div class="participation-progress-fill" style="width: ${cls.participationPct}%;"></div>
            </div>
            <div class="participation-card-footer">
              <span>${isComplete ? '🎉 100% Participation Reached!' : '🍕 Contending for 1st to 100%'}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 2. Grade Level Leaderboard
  const gradeMap = {};
  state.students.forEach(s => {
    gradeMap[s.grade] = (gradeMap[s.grade] || 0) + s.total;
  });

  const gradeGrid = document.getElementById('gradeBarsGrid');
  if (gradeGrid) {
    const rosterGrades = JFS_ROSTER_CLASSES.map(c => c.grade);
    const studentGrades = state.students.map(s => s.grade);
    const uniqueGrades = Array.from(new Set([...rosterGrades, ...studentGrades])).filter(Boolean);

    uniqueGrades.sort(compareGrades);

    const maxGradeAmount = Math.max(...Object.values(gradeMap), 0);
    const hasDonations = maxGradeAmount > 0;
    const leadingGrades = hasDonations 
      ? uniqueGrades.filter(g => (gradeMap[g] || 0) === maxGradeAmount)
      : [];
    const isGradeTied = leadingGrades.length > 1;

    if (uniqueGrades.length === 0) {
      gradeGrid.innerHTML = `<p style="color:var(--gray-500); padding: 12px;">No grades loaded in roster.</p>`;
    } else {
      const bannerHtml = `
        <div class="grade-contest-banner">
          <div class="contest-icon">🎬</div>
          <div class="contest-info">
            <div class="contest-title">
              <strong>Grade Level Leaderboard:</strong> The grade level with the highest total funds raised wins an exclusive <strong>Pizza + Ice Cream Movie Night in the MPR!</strong>
            </div>
            ${leadingGrades.length > 0 ? `
              <div class="contest-current-leader">
                <span class="leader-trophy">🏆</span>
                <span><strong>Current ${isGradeTied ? 'Leaders (Tied)' : 'Leader'}:</strong> <strong>${leadingGrades.map(g => formatGradeLabel(g)).join(' & ')}</strong> with <strong>${formatCurrency(maxGradeAmount)}</strong> raised!</span>
              </div>
            ` : `
              <div class="contest-current-leader awaiting">
                <span>🏁</span> Contest underway — make a donation to put your student's grade in 1st place!
              </div>
            `}
          </div>
        </div>
      `;

      gradeGrid.innerHTML = bannerHtml + uniqueGrades.map(grade => {
        const amount = gradeMap[grade] || 0;
        const pct = maxGradeAmount > 0 ? Math.round((amount / maxGradeAmount) * 100) : 0;
        const label = formatGradeLabel(grade);
        const isLeading = leadingGrades.includes(grade);

        if (isLeading) {
          return `
            <div class="grade-bar-item leading-grade">
              <div class="grade-leader-tag">
                <span class="leader-badge-pill">${isGradeTied ? '🏆 Tied for #1' : '🏆 #1 In The Lead'}</span>
              </div>
              <div class="grade-bar-title">
                <span class="grade-name-label">${label}</span>
                <span class="grade-amount-label">${formatCurrency(amount)}</span>
              </div>
              <div class="grade-bar-track">
                <div class="grade-bar-fill leading-fill" style="width: ${pct}%;"></div>
              </div>
              <div class="grade-leader-status-note">
                🎬 Current MPR Movie Night Leader!
              </div>
            </div>
          `;
        }

        return `
          <div class="grade-bar-item">
            <div class="grade-bar-title">
              <span class="grade-name-label">${label}</span>
              <span class="grade-amount-label">${formatCurrency(amount)}</span>
            </div>
            <div class="grade-bar-track">
              <div class="grade-bar-fill" style="width: ${pct}%;"></div>
            </div>
            ${amount === 0 ? `<div class="grade-awaiting-note">$0 raised so far</div>` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // 3. Classroom Leaderboard Callout Banner (Matching Grade Banner style)
  const classroomBanner = document.getElementById('classroomContestBanner');
  if (classroomBanner) {
    classroomBanner.innerHTML = `
      <div class="contest-icon">🏛️</div>
      <div class="contest-info">
        <div class="contest-title">
          <strong>Classroom Contest:</strong> The class with the highest total funds raised wins a <strong>Class Field Trip to the California Academy of Sciences</strong>!
        </div>
        ${topClasses.length > 0 ? `
          <div class="contest-current-leader">
            <span class="leader-trophy">🏆</span>
            <span><strong>Current ${isTied ? 'Leaders (Tied)' : 'Leader'}:</strong> <strong>${topClasses.map(c => c.teacher).join(' & ')}</strong> with <strong>${formatCurrency(maxClassTotal)}</strong> raised!</span>
          </div>
        ` : `
          <div class="contest-current-leader awaiting">
            <span>🏁</span> Contest underway — make a donation to propel your teacher's class into 1st place!
          </div>
        `}
      </div>
    `;
  }

  // 4. Classroom Leaderboard Grid (Keep #1-3 for top 3, remove rest! No room numbers, no student counts)
  if (classesGrid) {
    let currentRank = 1;
    classesGrid.innerHTML = sortedClasses.map((cls, idx) => {
      if (idx > 0 && cls.total < sortedClasses[idx - 1].total) {
        currentRank = idx + 1;
      }
      const isTop = cls.total === maxClassTotal && cls.total > 0;
      const gradeLabel = formatGradeLabel(cls.grade);

      // Dynamically rank classrooms: keep #1-3 for top 3, remove rest!
      let rankBadgeHtml = '';
      if (currentRank === 1 && cls.total > 0) {
        rankBadgeHtml = `<span class="class-trophy-tag">🏆 ${isTied ? 'Tied #1' : '#1 Class'}</span>`;
      } else if (currentRank === 2 && cls.total > 0) {
        rankBadgeHtml = `<span class="rank-badge top-2">#2</span>`;
      } else if (currentRank === 3 && cls.total > 0) {
        rankBadgeHtml = `<span class="rank-badge top-3">#3</span>`;
      }

      return `
        <div class="class-card ${isTop ? 'top-class' : ''}">
          <div>
            <div class="class-card-header">
              <div>
                <h4 class="class-teacher-name">${cls.teacher}</h4>
                <div style="display: flex; align-items: center; margin-top: 4px;">
                  <span class="class-grade-tag">${gradeLabel}</span>
                </div>
              </div>
              ${rankBadgeHtml}
            </div>

            ${isTop ? `
              <div style="margin: 6px 0 10px;">
                <span class="badge badge-light" style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.76rem; padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px;">
                  🚌 Leading Contender: Cal Academy Field Trip!
                </span>
              </div>
            ` : ''}

          </div>

          <div class="class-metrics-row">
            <span>Participation: <strong>${cls.participationPct}%</strong></span>
            <span class="metric-raised">Raised So Far: <strong>${formatCurrency(cls.total)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ==========================================================
// COUNTDOWN TIMER (Jag-a-Thon: Friday, Nov 13th)
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

const STUDENT_NAME_ALIASES = {
  'evanaleah a': 'Evanaleah Alvarez',
  'evanaleah a.': 'Evanaleah Alvarez',
  'evannaleah alvarez': 'Evanaleah Alvarez'
};

function cleanStudentName(rawName) {
  if (!rawName || typeof rawName !== 'string') return '';
  // Strip nicknames in quotes: "The GOAT", “The GOAT”, or parentheses (The GOAT)
  let s = rawName.replace(/["“”][^"“”]*["“”]/g, '');
  s = s.replace(/\([^)]*\)/g, '');
  // Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();
  if (!s) return '';
  // Title Case each word
  const cleaned = s.split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const key = cleaned.toLowerCase();
  if (STUDENT_NAME_ALIASES[key]) {
    return STUDENT_NAME_ALIASES[key];
  }
  return cleaned;
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

  // Priority search for teacher column (do NOT let Room hijack Teacher index)
  let teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('educator'));
  if (teacherIdx === -1) {
    teacherIdx = headers.findIndex(h => h.includes('class') && !h.includes('room'));
  }
  const roomIdx = headers.findIndex(h => h.includes('room'));
  if (teacherIdx === -1 && roomIdx !== -1) {
    teacherIdx = roomIdx;
  }

  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student'));
  const gradeIdx = headers.findIndex(h => h.includes('grade'));
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('when'));
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('donation') || h.includes('pledge') || h.includes('$'));

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
      const room = roomIdx !== -1 && row[roomIdx] ? row[roomIdx].trim() : '';
      const amt = cleanNumber(row[amountIdx]);
      const dateStr = row[dateIdx] ? row[dateIdx].trim() : '';

      // Determine which week this donation belongs to based on date
      const weekNum = determineWeekFromDate(dateStr);

      const rc = findCanonicalRosterClass(teacher, room);
      const canonicalTeacher = rc ? rc.teacher : teacher;
      const canonicalRoom = rc ? rc.room : room;
      const canonicalGrade = rc ? rc.grade : grade;

      const cleanName = cleanStudentName(rawName);
      if (!cleanName) continue;

      const groupKey = cleanName.toLowerCase();

      if (!studentMap.has(groupKey)) {
        studentMap.set(groupKey, {
          name: cleanName,
          grade: canonicalGrade,
          teacher: canonicalTeacher,
          room: canonicalRoom,
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          total: 0,
          laps: 0
        });
      }

      const s = studentMap.get(groupKey);
      if (canonicalGrade && canonicalGrade !== 'K') s.grade = canonicalGrade;
      if (canonicalTeacher && canonicalTeacher !== 'General') s.teacher = canonicalTeacher;
      if (canonicalRoom) s.room = canonicalRoom;

      if (weekNum === 1) s.week1 += amt;
      else if (weekNum === 2) s.week2 += amt;
      else if (weekNum === 3) s.week3 += amt;
      else s.week4 += amt;

      s.total += amt;
    }

    return Array.from(studentMap.values());
  }

  // ROSTER FORMAT (Columns: Student Name, Grade, Room, Teacher, Week 1, Week 2, Week 3, Week 4, Laps)
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
    const room = roomIdx !== -1 && row[roomIdx] ? row[roomIdx].trim() : '';
    const week1 = w1Idx !== -1 ? cleanNumber(row[w1Idx]) : 0;
    const week2 = w2Idx !== -1 ? cleanNumber(row[w2Idx]) : 0;
    const week3 = w3Idx !== -1 ? cleanNumber(row[w3Idx]) : 0;
    const week4 = w4Idx !== -1 ? cleanNumber(row[w4Idx]) : 0;
    const laps = lapsIdx !== -1 ? cleanNumber(row[lapsIdx]) : 0;

    let total = totalIdx !== -1 ? cleanNumber(row[totalIdx]) : (week1 + week2 + week3 + week4);
    if (total === 0 && (week1 > 0 || week2 > 0 || week3 > 0 || week4 > 0)) {
      total = week1 + week2 + week3 + week4;
    }

    const rc = findCanonicalRosterClass(teacher, room);
    const canonicalTeacher = rc ? rc.teacher : teacher;
    const canonicalRoom = rc ? rc.room : room;
    const canonicalGrade = rc ? rc.grade : grade;

    students.push({
      name,
      grade: canonicalGrade,
      teacher: canonicalTeacher,
      room: canonicalRoom,
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

function parsePacificDateTime(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const str = dateStr.trim();

  // Format 1: YYYY-MM-DD HH:mm (or HH:mm:ss, optional AM/PM)
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1; // 0-indexed
    const day = parseInt(isoMatch[3], 10);
    let hours = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
    const mins = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    const ampm = isoMatch[7] ? isoMatch[7].toLowerCase() : '';

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, mins, 0);
  }

  // Format 2: MM/DD/YYYY H:mm AM/PM
  const mdyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?/i);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1;
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    let hours = mdyMatch[4] ? parseInt(mdyMatch[4], 10) : 0;
    const mins = mdyMatch[5] ? parseInt(mdyMatch[5], 10) : 0;
    const ampm = mdyMatch[7] ? mdyMatch[7].toLowerCase() : '';

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, mins, 0);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function determineWeekFromDate(dateStr) {
  if (!dateStr) return 1;
  const parsed = parsePacificDateTime(dateStr);
  if (!parsed || isNaN(parsed.getTime())) {
    const lower = String(dateStr).toLowerCase();
    if (lower.includes('4')) return 4;
    if (lower.includes('3')) return 3;
    if (lower.includes('2')) return 2;
    return 1;
  }

  // Official Jag-a-Thon Weekly Cutoffs:
  // Week 1 Cutoff: Friday, Oct 23, 2026 at 5:30 PM (17:30) [Includes 5:13 PM donation]
  // Week 2 Cutoff: Friday, Oct 30, 2026 at 6:05 PM (18:05) [Includes all Friday entries up to 6:05 PM]
  // Week 3 Cutoff: Friday, Nov 6, 2026 at 4:00 PM (16:00 sharp)
  // Week 4 Cutoff: Friday, Nov 13, 2026 at 4:00 PM (16:00 sharp)
  const y = parsed.getFullYear();
  const w1Cutoff = new Date(y, 9, 23, 17, 30, 0); // Oct 23 at 5:30 PM (Month 9 = October)
  const w2Cutoff = new Date(y, 9, 30, 18, 5, 0);   // Oct 30 at 6:05 PM
  const w3Cutoff = new Date(y, 10, 6, 16, 0, 0);  // Nov 6 at 4:00 PM

  const t = parsed.getTime();
  if (t < w1Cutoff.getTime()) {
    return 1;
  } else if (t < w2Cutoff.getTime()) {
    return 2;
  } else if (t < w3Cutoff.getTime()) {
    return 3;
  } else {
    return 4;
  }
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
  const headers = "Student Name,Grade,Room,Teacher,Week 1,Week 2,Week 3,Week 4,Laps Run\n";
  const sample = "Aarav Patel,4,C-1,FECI,120,85,95,110,32\nMaya Sidhu,3,A-5,ALEXANDER,150,110,140,160,36\n";
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jfs_jagathon_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCurrentDataCsv() {
  const headers = ["Student Name", "Grade", "Room", "Teacher", "Week 1", "Week 2", "Week 3", "Week 4", "Total", "Laps Run"].join(",");
  const rows = state.students.map(s => {
    return [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.grade}"`,
      `"${(s.room || '').replace(/"/g, '""')}"`,
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
    const trimmed = csvText.trim();
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<script')) {
      showToast("⚠️ Could not parse CSV. Make sure Sheet is published as CSV.");
      return;
    }
    const parsed = parseCsvText(csvText);

    state.students = parsed;
    state.config.googleSheetUrl = normalizedUrl;
    saveStudentsToStorage();
    saveConfigToStorage();
    calculateAndRender();
    if (parsed.length > 0) {
      showToast(`🎉 Synced ${parsed.length} students live from Google Sheets!`);
    } else {
      showToast("ℹ️ Google Sheet synced: 0 donations logged (awaiting donations).");
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
      const trimmed = csvText.trim();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.includes('<script')) {
        console.warn("Auto-sync skipped: received HTML rather than CSV");
        return;
      }
      const parsed = parseCsvText(csvText);
      state.students = parsed;
      saveStudentsToStorage();
      calculateAndRender();
      console.log(`Auto-synced ${parsed.length} students from Google Sheets`);
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
  if (confirm("Clear all local data and reset leaderboard to awaiting state?")) {
    state.students = [];
    state.config = { ...DEFAULT_CONFIG };
    saveStudentsToStorage();
    saveConfigToStorage();
    loadStoredData();
    calculateAndRender();
    showToast("🔄 Data reset: Awaiting donations.");
    closeAdminModal();
  }
}

function copyDonationLink() {
  const url = getEffectiveDonationUrl();
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

// ==========================================================
// SHARE KIT (STUDENT DIGITAL CARD & QR CODE GENERATOR)
// ==========================================================
function initShareKitForm() {
  const teacherSelect = document.getElementById('shareTeacherSelect');
  if (teacherSelect && teacherSelect.options.length <= 1) {
    const teachers = Array.from(new Set(JFS_ROSTER_CLASSES.map(c => c.teacher))).sort();
    teachers.forEach(t => {
      const cls = JFS_ROSTER_CLASSES.find(c => c.teacher === t);
      const gradeLabel = cls ? formatGradeLabel(cls.grade) : '';
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = `${t} (${gradeLabel})`;
      teacherSelect.appendChild(opt);
    });
  }
}

function generateShareKit() {
  const studentNameInput = document.getElementById('shareStudentName');
  const teacherSelect = document.getElementById('shareTeacherSelect');

  const studentName = (studentNameInput.value || '').trim();
  const teacher = teacherSelect.value;
  const cls = JFS_ROSTER_CLASSES.find(c => c.teacher === teacher);
  const gradeText = cls ? formatGradeLabel(cls.grade) : '';

  if (!studentName || !teacher) {
    showToast('⚠️ Please enter student name and choose a teacher.');
    return;
  }

  // Reveal results area
  const resultsArea = document.getElementById('shareResultsArea');
  if (resultsArea) {
    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Draw Card with Artwork Background & Zeffy QR Code
  drawPledgeCard(studentName, teacher, gradeText);
  showToast('✨ Custom Jag-a-Thon card & QR generated!');
}

function drawPledgeCard(studentName, teacher, grade) {
  const canvas = document.getElementById('pledgeCardCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Rectangular 16:9 canvas matching the background artwork
  const W = 1376;
  const H = 768;
  canvas.width = W;
  canvas.height = H;

  // Load Background Artwork
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  bgImg.src = 'jfs-card-bg.jpg';

  const renderCard = () => {
    // 1. Draw Full Background Artwork (Title, Subtitle, Logo, and Running Kids)
    ctx.drawImage(bgImg, 0, 0, W, H);

    // 2. Dynamic Student Details inside the clean container box
    // Center point of the student container box is x = 955
    ctx.textAlign = 'center';

    // Eyebrow Callout
    ctx.fillStyle = '#d97706'; // Warm Amber/Gold
    ctx.font = '800 24px "Outfit", sans-serif';
    ctx.fillText('⭐ PLEASE SPONSOR MY RUN! ⭐', 955, 295);

    // Student Name (dynamically sizing for longer names)
    ctx.fillStyle = '#071f4a'; // Deep Navy
    let nameSize = 54;
    if (studentName.length > 22) nameSize = 40;
    else if (studentName.length > 15) nameSize = 46;
    ctx.font = `900 ${nameSize}px "Outfit", sans-serif`;
    ctx.fillText(studentName, 955, 360);

    // Teacher & Grade Badge Pill
    const badgeText = `${grade}  •  Teacher: ${teacher}`;
    ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeW = Math.min(textWidth + 48, 550);
    const badgeH = 48;
    const badgeX = 955 - badgeW / 2;
    const badgeY = 388;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 24, '#1e3a8a', '#3b82f6', 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, 955, badgeY + 33);

    // Mission/Tax-Deductible Note to the left of the QR code
    ctx.fillStyle = '#334155';
    ctx.font = '700 19px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('100% Tax-Deductible Donation', 870, 482);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Powers STEM, Arts & Student Enrichment!', 870, 508);

    // 3. Draw Real Scannable Zeffy QR Code in the Bottom-Right Box
    const qrX = 1125;
    const qrY = 495;
    const qrSize = 190;

    // Draw crisp white background for QR code
    drawRoundedRect(ctx, 1105, 475, 230, 230, 28, '#ffffff', '#cbd5e1', 2);

    // Generate real scannable QR Code
    if (typeof QRCode !== 'undefined') {
      const tempDiv = document.createElement('div');
      new QRCode(tempDiv, {
        text: CANONICAL_DONATION_URL,
        width: qrSize,
        height: qrSize,
        colorDark: '#071f4a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      const qrCanvas = tempDiv.querySelector('canvas');
      const qrImg = tempDiv.querySelector('img');

      if (qrCanvas) {
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      } else if (qrImg && qrImg.src) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        img.src = qrImg.src;
      } else {
        setTimeout(() => {
          const el = tempDiv.querySelector('canvas') || tempDiv.querySelector('img');
          if (el) ctx.drawImage(el, qrX, qrY, qrSize, qrSize);
        }, 50);
      }
    }
  };

  if (bgImg.complete && bgImg.naturalWidth > 0) {
    renderCard();
  } else {
    bgImg.onload = renderCard;
    bgImg.onerror = renderCard;
  }
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = strokeWidth || 1;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function downloadPledgeCard() {
  const canvas = document.getElementById('pledgeCardCanvas');
  if (!canvas) return;
  const sName = (document.getElementById('shareStudentName')?.value || 'Student').trim().replace(/\s+/g, '_');
  const link = document.createElement('a');
  link.download = `${sName}_JFS_Jagathon_Card.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('📥 Downloading high-res Jag-a-Thon card!');
}
