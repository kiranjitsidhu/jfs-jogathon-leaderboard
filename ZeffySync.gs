/**
 * JAG-A-THON MASTER SUITE — EXECUTIVE PRINT & SYNC EDITION
 * 1. Weekly & Cumulative Reports (Grade-Sorted Classrooms, A-Z Students, Tier-Wise Tchotchke Summary)
 * 2. Automated 1-Click Raffle Winner Drawings (Logged to 'Raffle Winners' tab)
 * 3. Automated Gmail Sync with Exact Timestamps (YYYY-MM-DD HH:mm)
 * 4. Smart Export Tab Sync with Deduplication & Official Tax Receipt Upgrades
 * 5. Data Hygiene Tools: Student Name Cleaner & Date Standardizer
 * 6. 1-Click Repair Tool for Email Sync Rows
 */

const ZEFFY_CONFIG = {
  SHEET_NAME: 'Donations Log',     // Default tab name (auto-detects 'Donations', 'Donations Log', 'Sheet1', etc.)
  EXPORT_TAB_NAME: 'Export',       // Name of your export tab
  PROCESSED_LABEL: 'Zeffy-Synced',
  GMAIL_SEARCH_QUERY: 'from:zeffy.com -label:Zeffy-Synced'
};

const MIN_DONATION_FOR_TCHOTCHKE = 1.00;

// Natural Pedagogical Grade Order
const GRADE_ORDER = ['TK', 'K', 'Lower SDC', '1', '2', '3', 'Upper SDC', '4', '5', '5/6', '6'];

// All 24 Canonical JFS Classrooms
const JFS_ROSTER = {
  "K-A1": { teacher: "MCMINN", grade: "TK" },
  "A-4":  { teacher: "TALAGTAG", grade: "TK" },
  "K-3":  { teacher: "ANGUIANO", grade: "K" },
  "K-1":  { teacher: "BEIER", grade: "K" },
  "K-2":  { teacher: "KHATUN", grade: "K" },
  "B-15": { teacher: "AVUNOORI", grade: "Lower SDC" },
  "B-7":  { teacher: "CACCIARONI", grade: "1" },
  "B-8":  { teacher: "MATHARU", grade: "1" },
  "B-9":  { teacher: "QUIJANO", grade: "1" },
  "B-5":  { teacher: "JONES", grade: "2" },
  "B-11": { teacher: "LUZOD", grade: "2" },
  "B-6":  { teacher: "SWENOR", grade: "2" },
  "A-5":  { teacher: "ALEXANDER", grade: "3" },
  "A-3":  { teacher: "CICCARELLO", grade: "3" },
  "A-2":  { teacher: "HART", grade: "3" },
  "B-13": { teacher: "HEAP", grade: "Upper SDC" },
  "C-1":  { teacher: "FECI", grade: "4" },
  "C-2":  { teacher: "NOYES", grade: "4" },
  "C-4":  { teacher: "HOSLER", grade: "4" },
  "C-7":  { teacher: "NUNES", grade: "5" },
  "C-5":  { teacher: "ORLOFF", grade: "5" },
  "A-8":  { teacher: "SCIBA", grade: "5/6" },
  "A-9":  { teacher: "GASPAR", grade: "6" },
  "A-10": { teacher: "MUNOZ", grade: "6" }
};

// Official Weekly Cutoffs (Week 1 includes until 5:30 PM; Week 2 includes until 6:05 PM; Weeks 3-4 sharp at 4:00 PM)
const SPRINT_SCHEDULE = {
  "1": { name: "Week 1", cutoff: new Date(2026, 9, 23, 17, 30, 0) }, // Oct 23, 5:30 PM
  "2": { name: "Week 2", cutoff: new Date(2026, 9, 30, 18, 5, 0) },   // Oct 30, 6:05 PM
  "3": { name: "Week 3", cutoff: new Date(2026, 10, 6, 16, 0, 0) },  // Nov 6, 4:00 PM
  "4": { name: "Week 4", cutoff: new Date(2026, 10, 13, 16, 0, 0) }  // Nov 13, 4:00 PM
};

function getDonationsSheet(ss) {
  let s = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME);
  if (s) return s;
  const candidates = ["donations log", "donations", "sheet1", "donation", "raw data", "main"];
  for (const sheet of ss.getSheets()) {
    if (candidates.includes(sheet.getName().trim().toLowerCase())) return sheet;
  }
  for (const sheet of ss.getSheets()) {
    if (sheet.getLastRow() >= 1 && sheet.getLastColumn() >= 3) {
      const topRow = sheet.getRange(1, 1, 1, Math.min(8, sheet.getLastColumn())).getValues()[0].join(" ").toLowerCase();
      if (topRow.includes("student") && (topRow.includes("amount") || topRow.includes("teacher"))) {
        return sheet;
      }
    }
  }
  return ss.getSheets()[0];
}

function getExportSheet(ss) {
  let s = ss.getSheetByName(ZEFFY_CONFIG.EXPORT_TAB_NAME);
  if (s) return s;
  for (const sheet of ss.getSheets()) {
    const name = sheet.getName().trim().toLowerCase();
    if (name === "export" || name.startsWith("export") || name.includes("zeffyexport") || name.includes("zeffy export")) {
      return sheet;
    }
  }
  return null;
}

// ==========================================
// 1. CUSTOM MENU CREATION
// ==========================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐾 Jag-a-Thon Tools')
    .addItem('⚡ Sync New Zeffy Emails Now', 'syncZeffyDonations')
    .addItem('📥 Sync from Export Tab', 'importFromZeffyExportTab')
    .addSeparator()
    .addSubMenu(ui.createMenu('🏃 Generate Weekly Prize Reports')
      .addItem('Week 1 Report', 'generateWeek1Report')
      .addItem('Week 2 Report', 'generateWeek2Report')
      .addItem('Week 3 Report', 'generateWeek3Report')
      .addItem('Week 4 Report', 'generateWeek4Report')
      .addItem('🏆 Cumulative Overall Report', 'generateCumulativeReport'))
    .addSeparator()
    .addSubMenu(ui.createMenu('🎲 Draw Raffle Winners')
      .addItem('🎲 Draw Week 1 Raffle Winners', 'drawWeek1RaffleWinners')
      .addItem('🎲 Draw Week 2 Raffle Winners', 'drawWeek2RaffleWinners')
      .addItem('🎲 Draw Week 3 Raffle Winners', 'drawWeek3RaffleWinners')
      .addItem('🎲 Draw Week 4 Raffle Winners', 'drawWeek4RaffleWinners'))
    .addSeparator()
    .addItem('🔧 Repair Blank Email Rows (Rows 82-85)', 'repairBlankDonationsFromGmail')
    .addSeparator()
    .addSubMenu(ui.createMenu('🧹 Data Hygiene')
      .addItem('Clean Student Names in Donations Tab', 'cleanAllStudentNamesInColumnC')
      .addItem('Standardize Dates in Donations Tab', 'fixAllDatesInColumnA'))
    .addSeparator()
    .addItem('🧪 Test Zeffy Email Parse', 'testLatestEmailParse')
    .addItem('⏰ Enable 15-Min Auto-Sync', 'createZeffyAutoTrigger')
    .addToUi();
}

function generateWeek1Report() { generatePrizeReport("Week 1"); }
function generateWeek2Report() { generatePrizeReport("Week 2"); }
function generateWeek3Report() { generatePrizeReport("Week 3"); }
function generateWeek4Report() { generatePrizeReport("Week 4"); }
function generateCumulativeReport() { generatePrizeReport("Cumulative"); }

// Aliases for compatibility
function runWeek1Report() { generatePrizeReport("Week 1"); }
function runWeek2Report() { generatePrizeReport("Week 2"); }
function runWeek3Report() { generatePrizeReport("Week 3"); }
function runWeek4Report() { generatePrizeReport("Week 4"); }
function runAllTimeReport() { generatePrizeReport("Cumulative"); }

function drawWeek1RaffleWinners() { drawRaffleWinners("Week 1"); }
function drawWeek2RaffleWinners() { drawRaffleWinners("Week 2"); }
function drawWeek3RaffleWinners() { drawRaffleWinners("Week 3"); }
function drawWeek4RaffleWinners() { drawRaffleWinners("Week 4"); }

// ==========================================
// 2. 1-CLICK RAFFLE DRAW TOOL
// ==========================================
function drawRaffleWinners(period) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = getDonationsSheet(ss);
  if (!dataSheet) {
    SpreadsheetApp.getUi().alert("Could not find Donations Log sheet.");
    return;
  }

  const data = dataSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("No donation data found.");
    return;
  }

  const headers = data[0].map(h => String(h || '').trim().toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const nameIdx = headers.findIndex(h => h.includes('student'));
  const teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('room'));
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('total') || h.includes('$'));

  if (nameIdx === -1 || amountIdx === -1) {
    SpreadsheetApp.getUi().alert("Required columns (Student Name, Amount) not found.");
    return;
  }

  const studentMap = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rawDate = dateIdx !== -1 ? row[dateIdx] : null;

    if (period !== "Cumulative" && !isValidForWeek(rawDate, period)) {
      continue;
    }

    const rawName = String(row[nameIdx] || '').trim();
    const cleanName = cleanStudentName(rawName);
    if (!cleanName) continue;

    const amt = parseFloat(String(row[amountIdx] || '0').replace(/[^0-9.-]+/g, '')) || 0;
    const teacherRaw = teacherIdx !== -1 ? String(row[teacherIdx] || '').trim() : 'General';
    const match = findCanonicalClass(teacherRaw);
    const teacher = match ? match.teacher : (teacherRaw || 'General');
    const grade = match ? match.grade : 'General';

    if (!studentMap[cleanName]) {
      studentMap[cleanName] = { name: cleanName, teacher: teacher, grade: grade, total: 0 };
    }
    studentMap[cleanName].total += amt;
  }

  const allStudents = Object.values(studentMap).sort((a, b) => b.total - a.total);
  if (allStudents.length === 0) {
    SpreadsheetApp.getUi().alert(`No eligible donations found for ${period}.`);
    return;
  }

  const topFundraiser = allStudents[0];

  const tier1 = []; // $1 - $24.99
  const tier2 = []; // $25 - $99.99
  const tier3 = []; // $100+ (excluding top prize winner)

  allStudents.forEach(s => {
    if (s.total < 1.00) return;
    if (s.total < 25.00) {
      tier1.push(s);
    } else if (s.total < 100.00) {
      tier2.push(s);
    } else {
      if (s.name !== topFundraiser.name) {
        tier3.push(s);
      }
    }
  });

  const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  const winner1 = pickRandom(tier1);
  const winner2 = pickRandom(tier2);
  const winner3 = pickRandom(tier3);

  let logSheet = ss.getSheetByName("Raffle Winners");
  if (!logSheet) {
    logSheet = ss.insertSheet("Raffle Winners");
    logSheet.appendRow(["Timestamp", "Period", "Prize Category", "Winner Name", "Grade", "Teacher", "Amount Raised"]);
    logSheet.getRange(1, 1, 1, 7).setBackground("#0F2942").setFontColor("#FFFFFF").setFontWeight("bold");
    logSheet.setFrozenRows(1);
  }

  const nowStr = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd HH:mm:ss");
  
  if (winner1) logSheet.appendRow([nowStr, period, "Tier 1 Raffle ($1–$24)", winner1.name, winner1.grade, winner1.teacher, `$${winner1.total.toFixed(2)}`]);
  if (winner2) logSheet.appendRow([nowStr, period, "Tier 2 Raffle ($25–$99)", winner2.name, winner2.grade, winner2.teacher, `$${winner2.total.toFixed(2)}`]);
  if (winner3) logSheet.appendRow([nowStr, period, "Tier 3 Raffle ($100+)", winner3.name, winner3.grade, winner3.teacher, `$${winner3.total.toFixed(2)}`]);

  const message = 
    `🎉 OFFICIAL ${period.toUpperCase()} DRAW RESULTS 🎉\n\n` +
    `🚲 BIKE / SCOOTER WINNER (Top Fundraiser):\n` +
    `   ${topFundraiser.name} (${topFundraiser.grade} • ${topFundraiser.teacher}) — $${topFundraiser.total.toFixed(2)}\n\n` +
    `🎲 TIER 1 RAFFLE WINNER ($1–$24):\n` +
    `   ${winner1 ? `${winner1.name} (${winner1.grade} • ${winner1.teacher}) — $${winner1.total.toFixed(2)}` : 'No eligible students'}\n\n` +
    `🎲 TIER 2 RAFFLE WINNER ($25–$99):\n` +
    `   ${winner2 ? `${winner2.name} (${winner2.grade} • ${winner2.teacher}) — $${winner2.total.toFixed(2)}` : 'No eligible students'}\n\n` +
    `🎲 TIER 3 RAFFLE WINNER ($100+):\n` +
    `   ${winner3 ? `${winner3.name} (${winner3.grade} • ${winner3.teacher}) — $${winner3.total.toFixed(2)}` : 'No eligible students'}\n\n` +
    `Results have been automatically saved to the 'Raffle Winners' tab!`;

  SpreadsheetApp.getUi().alert(`${period} Winners Drawn!`, message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==========================================
// 3. WEEKLY PRIZE REPORT GENERATOR (OLD ORIGINAL FORMAT)
// ==========================================
function generatePrizeReport(period) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = getDonationsSheet(ss);
  if (!dataSheet) {
    SpreadsheetApp.getUi().alert("Could not find Donations Log sheet.");
    return;
  }

  const data = dataSheet.getDataRange().getValues();
  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("No donation data found in the main tab.");
    return;
  }

  const headers = data[0].map(h => String(h || '').trim().toLowerCase());
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const nameIdx = headers.findIndex(h => h.includes('student'));
  const teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('room'));
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('total') || h.includes('$'));

  if (nameIdx === -1 || amountIdx === -1) {
    SpreadsheetApp.getUi().alert("Required columns (Student Name, Amount) not found.");
    return;
  }

  const studentMap = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rawDate = dateIdx !== -1 ? row[dateIdx] : null;

    if (period !== "Cumulative" && !isValidForWeek(rawDate, period)) {
      continue;
    }

    const rawName = String(row[nameIdx] || '').trim();
    const cleanName = cleanStudentName(rawName);
    if (!cleanName) continue;

    const amt = parseFloat(String(row[amountIdx] || '0').replace(/[^0-9.-]+/g, '')) || 0;
    const teacherRaw = teacherIdx !== -1 ? String(row[teacherIdx] || '').trim() : 'General';
    const match = findCanonicalClass(teacherRaw);
    const teacher = match ? match.teacher : (teacherRaw || 'General');
    const grade = match ? match.grade : 'General';
    const room = match ? match.roomKey : '';

    if (!studentMap[cleanName]) {
      studentMap[cleanName] = {
        name: cleanName,
        teacher: teacher,
        grade: grade,
        room: room,
        total: 0
      };
    }
    studentMap[cleanName].total += amt;
  }

  const allEligibleStudents = Object.values(studentMap).filter(s => s.total >= MIN_DONATION_FOR_TCHOTCHKE);
  const totalPrizeRecipients = allEligibleStudents.length;

  if (totalPrizeRecipients === 0) {
    SpreadsheetApp.getUi().alert(`No donations found for ${period}.`);
    return;
  }

  allEligibleStudents.sort((a, b) => b.total - a.total);
  const topStudent = allEligibleStudents[0];

  const classroomMap = {};
  allEligibleStudents.forEach(s => {
    const key = `${s.grade} — ${s.teacher}`;
    if (!classroomMap[key]) {
      classroomMap[key] = { grade: s.grade, teacher: s.teacher, students: [] };
    }
    classroomMap[key].students.push(s);
  });

  const getGradeWeight = (grade) => {
    const idx = GRADE_ORDER.indexOf(grade);
    return idx !== -1 ? idx : 999;
  };

  const sortedClassrooms = Object.values(classroomMap).sort((a, b) => {
    const gwA = getGradeWeight(a.grade);
    const gwB = getGradeWeight(b.grade);
    if (gwA !== gwB) return gwA - gwB;
    return a.teacher.localeCompare(b.teacher);
  });

  sortedClassrooms.forEach(c => {
    c.students.sort((a, b) => a.name.localeCompare(b.name));
  });

  const isLowerGrade = (g) => {
    const lower = String(g).toLowerCase();
    return lower.includes('tk') || lower === 'k' || lower === '1' || lower === '2' || lower.includes('lower');
  };

  let lowerT1 = 0, lowerT2 = 0, lowerT3 = 0;
  let upperT1 = 0, upperT2 = 0, upperT3 = 0;

  allEligibleStudents.forEach(s => {
    const amt = s.total;
    const isLower = isLowerGrade(s.grade);
    if (amt >= 100) {
      if (isLower) lowerT3++; else upperT3++;
    } else if (amt >= 25) {
      if (isLower) lowerT2++; else upperT2++;
    } else {
      if (isLower) lowerT1++; else upperT1++;
    }
  });

  const lowerTotal = lowerT1 + lowerT2 + lowerT3;
  const upperTotal = upperT1 + upperT2 + upperT3;
  const grandTotal = lowerTotal + upperTotal;

  // Use the exact em-dash tab name format
  const tabTitle = period === "Cumulative" ? "Report — Cumulative" : `Report — ${period}`;
  let reportSheet = ss.getSheetByName(tabTitle);
  if (reportSheet) {
    reportSheet.clear();
  } else {
    reportSheet = ss.insertSheet(tabTitle);
  }

  const rows = [];
  rows.push([`🐾 J.F. SMITH JAG-A-THON — PRIZE DISTRIBUTION REPORT (${period.toUpperCase()})`, "", "", "", ""]);
  rows.push([`Run Date: ${Utilities.formatDate(new Date(), "America/Los_Angeles", "MMM d, yyyy h:mm a")} | Total Students Earning Prizes: ${totalPrizeRecipients}`, "", "", "", ""]);
  rows.push(["", "", "", "", ""]);

  if (period !== "Cumulative" && topStudent) {
    rows.push([`🏆 TOP FUNDRAISER OF THE WEEK (BIKE/SCOOTER WINNER): ${topStudent.name} ($${topStudent.total.toFixed(2)}) — Grade ${topStudent.grade}, Room ${topStudent.room} (${topStudent.teacher})`, "", "", "", ""]);
    rows.push(["", "", "", "", ""]);
  }

  rows.push(["🎁 TIER-WISE TCHOTCHKE SUMMARY BREAKDOWN", "", "", "", ""]);
  rows.push(["Grade Division", "Tier 1 ($1–$24)", "Tier 2 ($25–$99)", "Tier 3 ($100+)", "Total Tchotchkes"]);
  rows.push(["Lower Grades (TK, K, 1, 2, Lower SDC)", lowerT1, lowerT2, lowerT3, lowerTotal]);
  rows.push(["Upper Grades (3, 4, 5, 5/6, 6, Upper SDC)", upperT1, upperT2, upperT3, upperTotal]);
  rows.push(["Schoolwide Grand Total", lowerT1 + upperT1, lowerT2 + upperT2, lowerT3 + upperT3, grandTotal]);
  rows.push(["", "", "", "", ""]);

  const bannerRowStart = rows.length - 5;

  const classHeaderRowIndices = [];
  const studentRowIndices = [];

  sortedClassrooms.forEach(c => {
    classHeaderRowIndices.push(rows.length + 1);
    rows.push([`🏫 Grade ${c.grade} • Teacher: ${c.teacher} (${c.students.length} student${c.students.length > 1 ? 's' : ''})`, "", "", "", ""]);
    rows.push(["Delivered?", "Student Name", "Grade", "Amount Raised", "Prize / Tchotchke Tier"]);

    c.students.forEach(s => {
      studentRowIndices.push(rows.length + 1);
      const prizeLevel = getPrizeTierDescription(s.total, period === "Cumulative");
      rows.push([false, s.name, s.grade, `$${s.total.toFixed(2)}`, prizeLevel]);
    });

    rows.push(["", "", "", "", ""]);
  });

  reportSheet.getRange(1, 1, rows.length, 5).setValues(rows);

  // Formatting
  reportSheet.getRange(1, 1, 1, 5).merge().setBackground("#0F2942").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(14).setHorizontalAlignment("center");
  reportSheet.getRange(2, 1, 1, 5).merge().setBackground("#F0F4F8").setFontColor("#334E68").setFontStyle("italic").setHorizontalAlignment("center");

  if (period !== "Cumulative" && topStudent) {
    reportSheet.getRange(4, 1, 1, 5).merge().setBackground("#FEFCBF").setFontColor("#744210").setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
  }

  // Format Tchotchke Summary Table
  reportSheet.getRange(bannerRowStart, 1, 1, 5).merge().setBackground("#0F2942").setFontColor("#FFFFFF").setFontWeight("bold").setHorizontalAlignment("center");
  reportSheet.getRange(bannerRowStart + 1, 1, 1, 5).setBackground("#E2E8F0").setFontWeight("bold").setHorizontalAlignment("center");
  reportSheet.getRange(bannerRowStart + 2, 1, 3, 5).setHorizontalAlignment("center");
  reportSheet.getRange(bannerRowStart + 4, 1, 1, 5).setFontWeight("bold").setBackground("#FEFCBF");
  reportSheet.getRange(bannerRowStart, 1, 5, 5).setBorder(true, true, true, true, true, true, "#CBD5E0", SpreadsheetApp.BorderStyle.SOLID);

  classHeaderRowIndices.forEach(r => {
    reportSheet.getRange(r, 1, 1, 5).merge().setBackground("#0F2942").setFontColor("#FFFFFF").setFontWeight("bold").setFontSize(11);
    reportSheet.getRange(r + 1, 1, 1, 5).setBackground("#E2E8F0").setFontWeight("bold").setFontColor("#2D3748");
  });

  studentRowIndices.forEach(r => {
    reportSheet.getRange(r, 1).insertCheckboxes();
    reportSheet.getRange(r, 1).setHorizontalAlignment("center");
    reportSheet.getRange(r, 4).setHorizontalAlignment("right");
    reportSheet.getRange(r, 1, 1, 5).setBorder(true, true, true, true, true, true, "#E2E8F0", SpreadsheetApp.BorderStyle.SOLID);
  });

  reportSheet.setColumnWidth(1, 100);
  reportSheet.setColumnWidth(2, 220);
  reportSheet.setColumnWidth(3, 80);
  reportSheet.setColumnWidth(4, 120);
  reportSheet.setColumnWidth(5, 260);

  reportSheet.activate();
  SpreadsheetApp.getUi().alert(`✅ ${tabTitle} generated with sorted rosters, checkboxes, and tier summary!`);
}

function getPrizeTierDescription(amt, isCumulative) {
  if (isCumulative) {
    if (amt >= 250) return "🏆 Jaguar Champion VIP Gift + T-Shirt + Tchotchke";
    if (amt >= 100) return "👕 Official T-Shirt + Tchotchke";
    if (amt >= 50) return "✨ Level 2 Enrichment Gift + Tchotchke";
    return "🎁 Tier 1 Tchotchke";
  } else {
    if (amt >= 100) return "Tier 3 Best Tchotchke ($100+)";
    if (amt >= 25) return "Tier 2 Better Tchotchke ($25+)";
    return "Tier 1 Tchotchke ($1+)";
  }
}

function isValidForWeek(dateVal, period) {
  const d = parseSheetDate(dateVal);
  if (!d || isNaN(d.getTime())) return false;
  const t = d.getTime();
  const w1Cut = SPRINT_SCHEDULE["1"].cutoff.getTime();
  const w2Cut = SPRINT_SCHEDULE["2"].cutoff.getTime();
  const w3Cut = SPRINT_SCHEDULE["3"].cutoff.getTime();
  const w4Cut = SPRINT_SCHEDULE["4"].cutoff.getTime();

  if (period === "Week 1") return t <= w1Cut;
  if (period === "Week 2") return t > w1Cut && t <= w2Cut;
  if (period === "Week 3") return t > w2Cut && t <= w3Cut;
  if (period === "Week 4") return t > w3Cut && t <= w4Cut;
  return true;
}

function parseSheetDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;
  const str = String(dateVal).trim();
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const mo = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    const h = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
    const mi = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
    return new Date(y, mo, d, h, mi, 0);
  }
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (m) {
    const mo = parseInt(m[1], 10) - 1;
    const d = parseInt(m[2], 10);
    const y = parseInt(m[3], 10);
    const h = m[4] ? parseInt(m[4], 10) : 0;
    const mi = m[5] ? parseInt(m[5], 10) : 0;
    return new Date(y, mo, d, h, mi, 0);
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function findCanonicalClass(rawTeacher) {
  if (!rawTeacher) return null;
  const t = String(rawTeacher).trim().toUpperCase();
  for (const [room, info] of Object.entries(JFS_ROSTER)) {
    if (t === room.toUpperCase() || t === info.teacher.toUpperCase() || t.includes(info.teacher.toUpperCase()) || info.teacher.toUpperCase().includes(t)) {
      return { teacher: info.teacher, grade: info.grade, roomKey: room };
    }
  }
  return null;
}

// ==========================================
// 4. GMAIL LIVE AUTO-SYNC
// ==========================================
function syncZeffyDonations() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Sync paused: sheet is busy. Please try again.', 'Jagathon Sync');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = getDonationsSheet(ss);

    ensureHeaders(sheet);

    const lastRow = sheet.getLastRow();
    const existingTxIds = new Set();
    const existingCompositeKeys = new Set();

    if (lastRow > 1) {
      const existingData = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      existingData.forEach(row => {
        const rowDate = String(row[0] || '').trim().slice(0, 10);
        const rowAmt = parseFloat(row[1]) || 0;
        const rowStudent = String(row[2] || '').trim().toLowerCase();
        const txId = String(row[6] || '').trim();

        if (txId) existingTxIds.add(txId);
        if (rowStudent && rowAmt > 0) {
          existingCompositeKeys.add(`${rowStudent}|${rowAmt.toFixed(2)}|${rowDate}`);
        }
      });
    }

    let label = GmailApp.getUserLabelByName(ZEFFY_CONFIG.PROCESSED_LABEL);
    if (!label) {
      label = GmailApp.createLabel(ZEFFY_CONFIG.PROCESSED_LABEL);
    }

    const threads = GmailApp.search(ZEFFY_CONFIG.GMAIL_SEARCH_QUERY, 0, 50);
    const rowsToAppend = [];
    const threadsToLabel = [];

    for (let t = 0; t < threads.length; t++) {
      const messages = threads[t].getMessages();
      for (let m = 0; m < messages.length; m++) {
        const msg = messages[m];
        const parsed = parseZeffyMessage(msg);
        // CRITICAL GUARD: Never add donations without a student name or with invalid amount!
        if (!parsed || !parsed.studentName || !parsed.amount || parsed.amount <= 0) {
          continue;
        }

        const datePart = parsed.date.slice(0, 10);
        const compKey = `${parsed.studentName.toLowerCase()}|${parsed.amount.toFixed(2)}|${datePart}`;

        if (existingTxIds.has(parsed.transactionId) || existingCompositeKeys.has(compKey)) {
          continue;
        }

        rowsToAppend.push([
          parsed.date,
          parsed.amount,
          parsed.studentName,
          parsed.grade,
          parsed.teacher,
          parsed.note,
          parsed.transactionId,
          parsed.rawStudentName
        ]);

        existingTxIds.add(parsed.transactionId);
        existingCompositeKeys.add(compKey);
      }
      threadsToLabel.push(threads[t]);
    }

    if (rowsToAppend.length > 0) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
        sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).setNumberFormat('#,##0.00');
      }
      ss.toast(`Synced ${rowsToAppend.length} new donation(s)!`, 'Jagathon Sync', 5);
    } else {
      ss.toast('No new organizer notifications to add.', 'Jagathon Sync', 4);
    }

    threadsToLabel.forEach(th => th.addLabel(label));

  } catch (err) {
    Logger.log('Sync Error: ' + err.toString());
    SpreadsheetApp.getUi().alert('Sync Error: ' + err.toString());
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// 5. IMPORT FROM ZEFFY EXPORT TAB
// ==========================================
function importFromZeffyExportTab() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Sheet is busy. Please try again.', 'Jagathon Sync');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const exportSheet = getExportSheet(ss);
    const mainSheet = getDonationsSheet(ss);

    if (!exportSheet) {
      SpreadsheetApp.getUi().alert('⚠️ Could not find a tab named "Export".');
      return;
    }
    if (!mainSheet) {
      SpreadsheetApp.getUi().alert('⚠️ Could not find "Donations Log" tab.');
      return;
    }

    ensureHeaders(mainSheet);

    const exportData = exportSheet.getDataRange().getValues();
    if (exportData.length <= 1) {
      SpreadsheetApp.getUi().alert(`⚠️ The tab "${exportSheet.getName()}" is empty.`);
      return;
    }

    const mainLastRow = mainSheet.getLastRow();
    const existingTxRowMap = new Map();
    const existingCompositeMap = new Map();

    if (mainLastRow > 1) {
      const existingData = mainSheet.getRange(2, 1, mainLastRow - 1, 7).getValues();
      for (let r = 0; r < existingData.length; r++) {
        const rowDate = String(existingData[r][0] || '').trim();
        const rowAmt = parseFloat(existingData[r][1]) || 0;
        const rowStudent = String(existingData[r][2] || '').trim().toLowerCase();
        const id = String(existingData[r][6] || '').trim();
        const rowNumber = r + 2;

        if (id) existingTxRowMap.set(id, rowNumber);

        const datePart = rowDate.slice(0, 10);
        const compKey = `${rowStudent}|${rowAmt.toFixed(2)}|${datePart}`;
        existingCompositeMap.set(compKey, { row: rowNumber, currentId: id });
      }
    }

    const headers = exportData[0].map(h => String(h).trim().toLowerCase());
    
    const colDate = headers.findIndex(h => h.includes('date'));
    const colTime = headers.findIndex(h => h.includes('time'));
    const colAmount = headers.findIndex(h => h.includes('amount') || h.includes('total'));
    const colStatus = headers.findIndex(h => h.includes('status'));
    const colFirst = headers.findIndex(h => h.includes('first name'));
    const colLast = headers.findIndex(h => h.includes('last name'));
    const colTaxReceipt = headers.findIndex(h => h.includes('tax receipt') || h.includes('order id') || h.includes('payment id') || h.includes('transaction id'));
    const colNotes = headers.findIndex(h => h.includes('note') || h.includes('comment'));
    
    let colStudent = headers.findIndex(h => h.includes('student full name') || h.includes('student name'));
    if (colStudent === -1) colStudent = headers.findIndex(h => h.includes('student'));
    
    let colTeacher = headers.findIndex(h => h.includes('teacher'));
    let colGrade = headers.findIndex(h => h.includes('grade'));

    if (colAmount === -1) {
      SpreadsheetApp.getUi().alert('⚠️ Could not find an "Amount" column in the Export tab.');
      return;
    }

    const rowsToAppend = [];
    let updatedCount = 0;

    for (let i = 1; i < exportData.length; i++) {
      const row = exportData[i];

      if (colStatus !== -1 && row[colStatus]) {
        const status = String(row[colStatus]).trim().toLowerCase();
        if (status && !status.includes('succeed') && !status.includes('paid') && !status.includes('complete')) {
          continue;
        }
      }

      const rawStudent = colStudent !== -1 ? String(row[colStudent] || '').trim() : '';
      const cleanStudent = cleanStudentName(rawStudent);
      const amount = parseFloat(row[colAmount]) || 0;
      if (amount <= 0 && !cleanStudent) continue;

      const rawDateVal = colDate !== -1 ? row[colDate] : '';
      const rawTimeVal = colTime !== -1 ? row[colTime] : '';
      const dateTimeStr = standardizeDateTime(rawDateVal, rawTimeVal);

      let txId = colTaxReceipt !== -1 ? String(row[colTaxReceipt] || '').trim() : '';
      if (!txId) {
        const timePart = rawTimeVal ? String(rawTimeVal).replace(/[^0-9a-zA-Z]/g, '') : '';
        const namePart = (cleanStudent || 'Offline').replace(/\s+/g, '');
        txId = `ZEFFY-${dateTimeStr.slice(0, 10)}-${timePart}-${amount}-${namePart}`;
      }

      const datePart = dateTimeStr.slice(0, 10);
      const compKey = `${cleanStudent.toLowerCase()}|${amount.toFixed(2)}|${datePart}`;

      if (existingTxRowMap.has(txId)) {
        const existingRow = existingTxRowMap.get(txId);
        const currentStoredDate = String(mainSheet.getRange(existingRow, 1).getValue()).trim();
        if (dateTimeStr.includes(' ') && !currentStoredDate.includes(':')) {
          mainSheet.getRange(existingRow, 1).setValue(dateTimeStr);
          updatedCount++;
        }
        continue;
      }

      if (existingCompositeMap.has(compKey)) {
        const match = existingCompositeMap.get(compKey);
        if (match.currentId.length === 16 || match.currentId.startsWith('ZEFFY-')) {
          mainSheet.getRange(match.row, 7).setValue(txId);
          if (dateTimeStr.includes(' ')) {
            mainSheet.getRange(match.row, 1).setValue(dateTimeStr);
          }
          existingTxRowMap.set(txId, match.row);
          updatedCount++;
          continue;
        }
      }

      const teacher = colTeacher !== -1 ? String(row[colTeacher] || '').trim() : '';
      const grade = colGrade !== -1 ? String(row[colGrade] || '').trim() : '';

      const firstName = colFirst !== -1 ? String(row[colFirst] || '').trim() : '';
      const lastName = colLast !== -1 ? String(row[colLast] || '').trim() : '';
      const donor = `${firstName} ${lastName}`.trim();
      const rawNote = colNotes !== -1 ? String(row[colNotes] || '').trim() : '';

      let note = 'Zeffy Online';
      if (rawNote) {
        note = donor ? `${rawNote} - ${donor}` : rawNote;
      } else if (donor) {
        note = `Zeffy - ${donor}`;
      } else {
        note = 'Zeffy Offline';
      }

      rowsToAppend.push([
        dateTimeStr,
        amount,
        cleanStudent,
        grade,
        teacher,
        note,
        txId,
        rawStudent
      ]);

      existingTxRowMap.set(txId, true);
    }

    if (rowsToAppend.length > 0) {
      const startRow = mainSheet.getLastRow() + 1;
      mainSheet.getRange(startRow, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
      if (mainSheet.getLastRow() > 1) {
        mainSheet.getRange(2, 1, mainSheet.getLastRow() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
        mainSheet.getRange(2, 2, mainSheet.getLastRow() - 1, 1).setNumberFormat('#,##0.00');
      }
      SpreadsheetApp.getUi().alert(`🎉 Added ${rowsToAppend.length} new donation(s) and upgraded ${updatedCount} existing transaction(s)!`);
    } else if (updatedCount > 0) {
      SpreadsheetApp.getUi().alert(`✅ All donations up-to-date! Upgraded ${updatedCount} transaction(s) with official Tax Receipt IDs / exact timestamps.`);
    } else {
      SpreadsheetApp.getUi().alert('✨ All donations in Export tab are already fully synced and deduplicated.');
    }

  } catch (err) {
    Logger.log('Export Sync Error: ' + err.toString());
    SpreadsheetApp.getUi().alert('Export Sync Error: ' + err.toString());
  } finally {
    lock.releaseLock();
  }
}

// Optional helper to sync backwards into Export tab if needed
function syncExportTab() {
  importFromZeffyExportTab();
}

// ==========================================
// 6. DATA HYGIENE: CLEAN NAMES & DATES
// ==========================================
const STUDENT_NAME_ALIASES = {
  'evanaleah a': 'Evanaleah Alvarez',
  'evanaleah a.': 'Evanaleah Alvarez',
  'evannaleah alvarez': 'Evanaleah Alvarez'
};

function cleanStudentName(rawName) {
  if (!rawName) return '';
  const str = String(rawName).trim();
  let s = str.replace(/[\"“”][^\"“”]*[\"“”]/g, '');
  s = s.replace(/\([^)]*\)/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (!s) return str;
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

function cleanAllStudentNamesInColumnC() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getDonationsSheet(ss);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  let updated = 0;
  for (let i = 1; i < data.length; i++) {
    const orig = String(data[i][2] || '');
    const clean = cleanStudentName(orig);
    if (orig !== clean) {
      sheet.getRange(i + 1, 3).setValue(clean);
      if (!data[i][7] || String(data[i][7]).trim() === '') {
        sheet.getRange(i + 1, 8).setValue(orig);
      }
      updated++;
    }
  }
  SpreadsheetApp.getUi().alert(`Cleaned ${updated} student names in ${sheet.getName()}.`);
}

function cleanStudentNamesInDonations() {
  cleanAllStudentNamesInColumnC();
}

function fixAllDatesInColumnA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getDonationsSheet(ss);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const range = sheet.getRange(2, 1, lastRow - 1, 1);
  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {
    values[i][0] = standardizeDateTime(values[i][0], '');
  }

  range.setValues(values);
  range.setNumberFormat('yyyy-mm-dd hh:mm');

  SpreadsheetApp.getUi().alert('All dates in Column A are now standardized to YYYY-MM-DD HH:mm!');
}

function standardizeDatesInDonations() {
  fixAllDatesInColumnA();
}

function standardizeDateTime(dateVal, timeVal) {
  if (!dateVal && !timeVal) return "";
  const tz = Session.getScriptTimeZone() || "America/Los_Angeles";

  // Case 1: dateVal is already a JS Date object
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
    if (dateVal.getHours() !== 0 || dateVal.getMinutes() !== 0 || dateVal.getSeconds() !== 0) {
      return Utilities.formatDate(dateVal, tz, "yyyy-MM-dd HH:mm");
    }
    const dateStr = Utilities.formatDate(dateVal, tz, "yyyy-MM-dd");
    if (timeVal) {
      const parsedTime = parseTimeComponent(timeVal);
      if (parsedTime) return `${dateStr} ${parsedTime}`;
    }
    return dateStr;
  }

  // Case 2: string parsing
  let s = String(dateVal || "").trim();
  let tStr = String(timeVal || "").trim();

  // Extract embedded time if dateVal has both date & time (e.g. "10/30/2026 6:13 PM")
  if (!tStr && (s.includes(" ") || s.includes("T"))) {
    const sep = s.includes("T") ? "T" : " ";
    const firstSpace = s.indexOf(sep);
    tStr = s.substring(firstSpace + 1).trim();
    s = s.substring(0, firstSpace).trim();
  }

  // Standardize date portion to YYYY-MM-DD
  let datePart = "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    datePart = s.substring(0, 10);
  } else {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      const mm = m[1].padStart(2, "0");
      const dd = m[2].padStart(2, "0");
      datePart = `${m[3]}-${mm}-${dd}`;
    } else {
      datePart = s;
    }
  }

  if (!tStr) return datePart;

  const parsedTime = parseTimeComponent(tStr);
  if (parsedTime) {
    return `${datePart} ${parsedTime}`;
  }
  return `${datePart} ${tStr}`.trim();
}

function parseTimeComponent(timeVal) {
  if (!timeVal) return "";
  if (timeVal instanceof Date && !isNaN(timeVal.getTime())) {
    const tz = Session.getScriptTimeZone() || "America/Los_Angeles";
    return Utilities.formatDate(timeVal, tz, "HH:mm");
  }
  const tStr = String(timeVal).trim();
  const tm = tStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (tm) {
    let h = parseInt(tm[1], 10);
    const mins = tm[2];
    const ampm = tm[4] ? tm[4].toLowerCase() : "";
    if (ampm === "pm" && h < 12) h += 12;
    if (ampm === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${mins}`;
  }
  return tStr;
}

function ensureHeaders(sheet) {
  const h1 = sheet.getRange(1, 8).getValue();
  if (!h1 || String(h1).trim() === '') {
    sheet.getRange(1, 8).setValue('Raw Student Name');
  }
}

// ==========================================
// 7. ROBUST ZEFFY EMAIL PARSER & REPAIR TOOL
// ==========================================
function parseZeffyMessage(msg, isRepair) {
  const subject = msg.getSubject() || '';
  let rawBody = msg.getPlainBody() || '';
  if (!rawBody || rawBody.length < 10) {
    rawBody = (msg.getBody() || '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/(p|div|tr|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, ' ');
  }

  const dateObj = msg.getDate();
  const formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone() || 'America/Los_Angeles', 'yyyy-MM-dd HH:mm');
  const msgId = msg.getId();

  const bodyLower = rawBody.toLowerCase();
  if (bodyLower.includes('manage your donations')) {
    return null;
  }
  if (!isRepair && !bodyLower.includes('custom question')) {
    return null;
  }

  let amount = 0;
  const subjectAmountMatch = subject.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
  if (subjectAmountMatch) {
    amount = parseFloat(subjectAmountMatch[1].replace(/,/g, ''));
  } else {
    const bodyAmountMatch = rawBody.match(/(?:Amount|Total|Donation|New donation of)\s*[:\s]*\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (bodyAmountMatch) {
      amount = parseFloat(bodyAmountMatch[1].replace(/,/g, ''));
    }
  }

  if (!amount || amount <= 0) return null;

  let donorName = '';
  const donorMatch = subject.match(/received from (.+)$/i) || subject.match(/from (.+)$/i);
  if (donorMatch) {
    donorName = donorMatch[1].trim();
  }

  const cleanBody = rawBody.replace(/[*_#~]/g, '');
  const lines = cleanBody.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const KNOWN_HEADERS = [
    'custom questions', 'custom question', 'student full name', 'student name', 'student',
    'grade', 'grade level', 'teacher', 'teacher name', 'room', 'room number',
    'amount', 'total', 'donor', 'buyer', 'billing', 'billing information',
    'payment details', 'order summary', 'view donation'
  ];

  function isHeaderLine(str) {
    let s = str.toLowerCase().trim();
    if (s.endsWith(':')) s = s.slice(0, -1).trim();
    return KNOWN_HEADERS.includes(s);
  }

  function getAnswerAfter(pattern) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const colonIdx = lines[i].indexOf(':');
        if (colonIdx !== -1) {
          const val = lines[i].substring(colonIdx + 1).trim();
          if (val) return val;
        }
        if (i + 1 < lines.length) {
          const next = lines[i + 1].trim();
          if (!isHeaderLine(next)) {
            return next;
          }
        }
      }
    }
    return '';
  }

  let rawStudent = getAnswerAfter(/^Student(?:\s*Full)?(?:\s*Name)?/i);
  if (!rawStudent) {
    const fb = cleanBody.match(/(?:Student\s*Full\s*Name|Student\s*Name|Student)\s*[:\s]*[\r\n]+\s*([^\r\n]+)/i) ||
               cleanBody.match(/(?:Student\s*Full\s*Name|Student\s*Name|Student)\s*:\s*([^\r\n]+)/i);
    if (fb && !isHeaderLine(fb[1])) rawStudent = fb[1].trim();
  }

  const studentName = cleanStudentName(rawStudent);

  let grade = getAnswerAfter(/^Grade/i);
  if (!grade) {
    const gb = cleanBody.match(/Grade\s*[:\s]*[\r\n]+\s*([^\r\n]+)/i) || cleanBody.match(/Grade\s*:\s*([^\r\n]+)/i);
    if (gb && !isHeaderLine(gb[1])) grade = gb[1].trim();
  }

  let teacher = getAnswerAfter(/^Teacher/i);
  if (!teacher) {
    const tb = cleanBody.match(/Teacher\s*[:\s]*[\r\n]+\s*([^\r\n]+)/i) || cleanBody.match(/Teacher\s*:\s*([^\r\n]+)/i);
    if (tb && !isHeaderLine(tb[1])) teacher = tb[1].trim();
  }

  if (!donorName) {
    const db = getAnswerAfter(/^(?:Donor|Buyer|Contact)/i);
    if (db) donorName = db;
  }

  if (!isRepair && !studentName) return null;

  const note = donorName ? `Zeffy - ${donorName}` : 'Zeffy Online';

  return {
    date: formattedDate,
    amount: amount,
    studentName: studentName,
    rawStudentName: rawStudent,
    teacher: teacher,
    grade: grade,
    note: note,
    transactionId: msgId
  };
}

/**
 * 1-Click Repair tool: Restores student name, grade, teacher, and donor note
 * for rows (such as rows 82-85) where Gmail sync added the transaction ID but missed student info.
 */
function repairBlankDonationsFromGmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getDonationsSheet(ss);
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Could not find Donations sheet.');
    return;
  }

  ensureHeaders(sheet);

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('Sheet has no data rows.');
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  let repairedCount = 0;
  const logEntries = [];

  for (let r = 0; r < data.length; r++) {
    const rowNum = r + 2;
    const studentName = String(data[r][2] || '').trim();
    const txId = String(data[r][6] || '').trim();

    // Target rows where student is blank and txId is a 16-hex Gmail message ID
    if (!studentName && /^[0-9a-f]{16}$/i.test(txId)) {
      try {
        const msg = GmailApp.getMessageById(txId);
        if (msg) {
          const parsed = parseZeffyMessage(msg, true); // true = repair mode
          if (parsed && (parsed.studentName || parsed.rawStudentName)) {
            sheet.getRange(rowNum, 3).setValue(parsed.studentName);
            sheet.getRange(rowNum, 4).setValue(parsed.grade);
            sheet.getRange(rowNum, 5).setValue(parsed.teacher);
            sheet.getRange(rowNum, 6).setValue(parsed.note);
            sheet.getRange(rowNum, 8).setValue(parsed.rawStudentName);
            repairedCount++;
            logEntries.push(`Row ${rowNum}: ${parsed.studentName} ($${parsed.amount}) • ${parsed.teacher} • ${parsed.note}`);
          } else {
            logEntries.push(`Row ${rowNum} (${txId}): Email found in Gmail, but no student name inside.`);
          }
        } else {
          logEntries.push(`Row ${rowNum} (${txId}): Message ID not found in Gmail.`);
        }
      } catch (err) {
        logEntries.push(`Row ${rowNum} (${txId}): Error - ${err.message}`);
      }
    }
  }

  if (repairedCount > 0) {
    SpreadsheetApp.getUi().alert(
      `🎉 Repaired ${repairedCount} Blank Donation(s)!`,
      `The following rows have been updated directly from Gmail:\n\n` + logEntries.join('\n'),
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    SpreadsheetApp.getUi().alert(
      'Repair Status',
      logEntries.length > 0 ? logEntries.join('\n') : 'No blank email rows (with Gmail message IDs) found.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

function testLatestEmailParse() {
  const threads = GmailApp.search('from:zeffy.com "CUSTOM QUESTIONS"', 0, 1);
  if (threads.length === 0) {
    SpreadsheetApp.getUi().alert('No organizer emails found with CUSTOM QUESTIONS.');
    return;
  }

  const msg = threads[0].getMessages()[0];
  const parsed = parseZeffyMessage(msg, true);

  const preview = 
    `Subject: ${msg.getSubject()}\n\n` +
    `--- Extracted Values ---\n` +
    `Date & Time: ${parsed ? parsed.date : 'N/A'}\n` +
    `Amount: $${parsed ? parsed.amount : 'N/A'}\n` +
    `Clean Student (Col C): "${parsed ? parsed.studentName : 'Not Found'}"\n` +
    `Raw Student (Col H): "${parsed ? parsed.rawStudentName : 'Not Found'}"\n` +
    `Grade: "${parsed ? parsed.grade : 'Not Found'}"\n` +
    `Teacher: "${parsed ? parsed.teacher : 'Not Found'}"\n` +
    `Column F (Note): "${parsed ? parsed.note : 'N/A'}"\n` +
    `Transaction ID: ${parsed ? parsed.transactionId : 'N/A'}`;

  SpreadsheetApp.getUi().alert('Preview of Latest Zeffy Organizer Email', preview, SpreadsheetApp.getUi().ButtonSet.OK);
}

function createZeffyAutoTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncZeffyDonations') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('syncZeffyDonations')
    .timeBased()
    .everyMinutes(15)
    .create();

  SpreadsheetApp.getUi().alert('Auto-Sync Enabled! The sheet will automatically check for new Zeffy donations every 15 minutes.');
}
