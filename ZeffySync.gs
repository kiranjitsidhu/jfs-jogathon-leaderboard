/**
 * JAG-A-THON MASTER SUITE — EXECUTIVE PRINT & SYNC EDITION
 * 1. Weekly & Cumulative Reports (Grade-Sorted Classrooms, A-Z Students, Tier-Wise Tchotchke Summary)
 * 2. Automated 1-Click Raffle Winner Drawings (Logged to 'Raffle Winners' tab)
 * 3. Automated Gmail Sync with Exact Timestamps (YYYY-MM-DD HH:mm)
 * 4. Smart Export Tab Sync with Deduplication & Official Tax Receipt Upgrades
 * 5. Data Hygiene Tools: Student Name Cleaner & Date Standardizer
 */

const ZEFFY_CONFIG = {
  SHEET_NAME: 'Donations',         // Name of your main raw data tab
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

// Official Weekly Cutoffs (Week 1 includes until 5:30 PM; Weeks 2-4 sharp at 4:00 PM)
const SPRINT_SCHEDULE = {
  "1": { name: "Week 1", cutoff: new Date(2026, 9, 23, 17, 30, 0) }, // Oct 23, 5:30 PM
  "2": { name: "Week 2", cutoff: new Date(2026, 9, 30, 17, 20, 0) },  // Oct 30, 4:00 PM
  "3": { name: "Week 3", cutoff: new Date(2026, 10, 6, 16, 0, 0) },  // Nov 6, 4:00 PM
  "4": { name: "Week 4", cutoff: new Date(2026, 10, 13, 16, 0, 0) }  // Nov 13, 4:00 PM
};

// ==========================================================
// 1. MENU REGISTRATION
// ==========================================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🐾 Jag-a-Thon Tools')
    .addItem('🏃 Generate Week 1 Report', 'runWeek1Report')
    .addItem('🏃 Generate Week 2 Report', 'runWeek2Report')
    .addItem('🏃 Generate Week 3 Report', 'runWeek3Report')
    .addItem('🏃 Generate Week 4 Report', 'runWeek4Report')
    .addSeparator()
    .addItem('🎲 Draw Week 1 Raffle Winners', 'drawWeek1RaffleWinners')
    .addItem('🎲 Draw Week 2 Raffle Winners', 'drawWeek2RaffleWinners')
    .addItem('🎲 Draw Week 3 Raffle Winners', 'drawWeek3RaffleWinners')
    .addItem('🎲 Draw Week 4 Raffle Winners', 'drawWeek4RaffleWinners')
    .addSeparator()
    .addItem('🏆 Generate All-Time Cumulative Report', 'runAllTimeReport')
    .addSeparator()
    .addItem('🔄 Sync Online Donations from Gmail', 'syncZeffyDonations')
    .addItem('📥 Sync from Export Tab', 'importFromZeffyExportTab')
    .addSeparator()
    .addItem('🧹 Clean & Normalize Student Names', 'cleanAllStudentNamesInColumnC')
    .addItem('📅 Fix / Standardize All Dates', 'fixAllDatesInColumnA')
    .addSeparator()
    .addItem('🧪 Test Zeffy Email Parse', 'testLatestEmailParse')
    .addItem('⏰ Enable 15-Min Auto-Sync', 'createZeffyAutoTrigger')
    .addToUi();
}

// ==========================================================
// 2. REPORT & RAFFLE TRIGGERS
// ==========================================================
function runWeek1Report() { generatePrizeReport("Week 1", true); }
function runWeek2Report() { generatePrizeReport("Week 2", true); }
function runWeek3Report() { generatePrizeReport("Week 3", true); }
function runWeek4Report() { generatePrizeReport("Week 4", true); }
function runAllTimeReport() { generatePrizeReport("All-Time Cumulative", false); }

function drawWeek1RaffleWinners() { drawRaffleWinners("Week 1"); }
function drawWeek2RaffleWinners() { drawRaffleWinners("Week 2"); }
function drawWeek3RaffleWinners() { drawRaffleWinners("Week 3"); }
function drawWeek4RaffleWinners() { drawRaffleWinners("Week 4"); }

// ==========================================================
// 3. 1-CLICK RAFFLE DRAWING ENGINE
// ==========================================================
function drawRaffleWinners(period) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];
  if (!dataSheet) {
    SpreadsheetApp.getUi().alert("Could not find Donations sheet.");
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
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('$'));

  const studentMap = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rawName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
    const rawTeacher = teacherIdx !== -1 ? String(row[teacherIdx] || '').trim().toUpperCase() : '';
    const amt = amountIdx !== -1 ? parseFloat(String(row[amountIdx] || '').replace(/[^0-9.-]+/g, '')) || 0 : 0;
    const dateVal = dateIdx !== -1 ? row[dateIdx] : '';

    if (!rawName || amt <= 0) continue;
    if (!isValidForWeek(dateVal, period)) continue;

    let classLabel = rawTeacher;
    let gradeLabel = '';
    const matchRoom = Object.keys(JFS_ROSTER).find(k => JFS_ROSTER[k].teacher === rawTeacher || k === rawTeacher);
    if (matchRoom) {
      const item = JFS_ROSTER[matchRoom];
      classLabel = `${item.teacher} (Room ${matchRoom})`;
      gradeLabel = item.grade;
    }

    if (!studentMap[rawName]) {
      studentMap[rawName] = { name: rawName, amount: 0, classroom: classLabel, grade: gradeLabel };
    }
    studentMap[rawName].amount += amt;
  }

  const students = Object.values(studentMap);
  if (students.length === 0) {
    SpreadsheetApp.getUi().alert(`No donations found for ${period} yet.`);
    return;
  }

  // Sort descending to find Bike/Scooter winner (excluded from Tier 3 raffle)
  students.sort((a, b) => b.amount - a.amount);
  const bikeWinner = students[0];

  const pool1 = [];
  const pool2 = [];
  const pool3 = [];

  students.forEach(s => {
    if (s.amount < 1.00) return;
    if (s.amount < 25.00) {
      pool1.push(s);
    } else if (s.amount < 100.00) {
      pool2.push(s);
    } else {
      // Exclude bike winner from Tier 3 raffle draw if there are other $100+ candidates
      if (bikeWinner && s.name === bikeWinner.name && students.filter(x => x.amount >= 100).length > 1) {
        // Excluded to allow another student to win
      } else {
        pool3.push(s);
      }
    }
  });

  const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

  const winner1 = pickRandom(pool1);
  const winner2 = pickRandom(pool2);
  const winner3 = pickRandom(pool3);

  let msg = `🎉 OFFICIAL ${period.toUpperCase()} RAFFLE WINNERS DRAW 🎉\n\n`;
  
  msg += `🎁 TIER 1 RAFFLE WINNER ($1.00 – $24.99):\n`;
  if (winner1) {
    msg += `• Winner: ${winner1.name}\n• Classroom: ${winner1.classroom} • ${winner1.grade}\n• Raised: $${winner1.amount.toFixed(2)} (Pool: ${pool1.length} students)\n\n`;
  } else {
    msg += `• No eligible students in Tier 1.\n\n`;
  }

  msg += `🎁 TIER 2 RAFFLE WINNER ($25.00 – $99.99):\n`;
  if (winner2) {
    msg += `• Winner: ${winner2.name}\n• Classroom: ${winner2.classroom} • ${winner2.grade}\n• Raised: $${winner2.amount.toFixed(2)} (Pool: ${pool2.length} students)\n\n`;
  } else {
    msg += `• No eligible students in Tier 2.\n\n`;
  }

  msg += `🎁 TIER 3 RAFFLE WINNER ($100.00+):\n`;
  if (winner3) {
    msg += `• Winner: ${winner3.name}\n• Classroom: ${winner3.classroom} • ${winner3.grade}\n• Raised: $${winner3.amount.toFixed(2)} (Pool: ${pool3.length} students)\n`;
    if (bikeWinner) {
      msg += `  (Note: Bike Winner ${bikeWinner.name} excluded from raffle draw)\n\n`;
    }
  } else {
    msg += `• No eligible students in Tier 3.\n\n`;
  }

  // Record in "Raffle Winners" tab
  let raffleSheet = ss.getSheetByName('Raffle Winners');
  if (!raffleSheet) {
    raffleSheet = ss.insertSheet('Raffle Winners');
    raffleSheet.getRange(1, 1, 1, 7).setValues([['Draw Timestamp', 'Week', 'Raffle Tier', 'Winner Name', 'Classroom', 'Grade', 'Amount Raised']]);
    raffleSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#4338ca').setFontColor('#ffffff');
    raffleSheet.setColumnWidth(1, 170);
    raffleSheet.setColumnWidth(2, 90);
    raffleSheet.setColumnWidth(3, 150);
    raffleSheet.setColumnWidth(4, 200);
    raffleSheet.setColumnWidth(5, 200);
    raffleSheet.setColumnWidth(6, 100);
    raffleSheet.setColumnWidth(7, 120);
  }

  const nowStr = new Date().toLocaleString();
  const rowsToAdd = [];
  if (winner1) rowsToAdd.push([nowStr, period, 'Tier 1 ($1–$24)', winner1.name, winner1.classroom, winner1.grade, winner1.amount]);
  if (winner2) rowsToAdd.push([nowStr, period, 'Tier 2 ($25–$99)', winner2.name, winner2.classroom, winner2.grade, winner2.amount]);
  if (winner3) rowsToAdd.push([nowStr, period, 'Tier 3 ($100+)', winner3.name, winner3.classroom, winner3.grade, winner3.amount]);

  if (rowsToAdd.length > 0) {
    const nextRow = raffleSheet.getLastRow() + 1;
    raffleSheet.getRange(nextRow, 1, rowsToAdd.length, 7).setValues(rowsToAdd);
    raffleSheet.getRange(nextRow, 7, rowsToAdd.length, 1).setNumberFormat('$#,##0.00');
  }

  SpreadsheetApp.getUi().alert(`🎲 ${period} Raffle Winners Selected!`, msg + `✅ Saved permanently to the 'Raffle Winners' tab.`, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==========================================================
// 4. GRADE & PRIZE HELPERS
// ==========================================================
function getGradeOrderIndex(gradeStr) {
  if (!gradeStr) return 99;
  const s = String(gradeStr).trim().toUpperCase();
  if (s.includes('5/6') || s.includes('5-6')) return GRADE_ORDER.indexOf('5/6');
  if (s.includes('LOWER')) return GRADE_ORDER.indexOf('Lower SDC');
  if (s.includes('UPPER')) return GRADE_ORDER.indexOf('Upper SDC');
  if (s.includes('TK')) return GRADE_ORDER.indexOf('TK');
  if (s === 'K' || s.endsWith(' K')) return GRADE_ORDER.indexOf('K');
  if (s.includes('1')) return GRADE_ORDER.indexOf('1');
  if (s.includes('2')) return GRADE_ORDER.indexOf('2');
  if (s.includes('3')) return GRADE_ORDER.indexOf('3');
  if (s.includes('4')) return GRADE_ORDER.indexOf('4');
  if (s.includes('5')) return GRADE_ORDER.indexOf('5');
  if (s.includes('6')) return GRADE_ORDER.indexOf('6');
  return 99;
}

function assignPrize(studentTotal, schoolwideRank, isWeeklyOnly) {
  if (studentTotal < MIN_DONATION_FOR_TCHOTCHKE) return "Cheer Supporter (Below $1)";

  if (isWeeklyOnly) {
    let tierText = "Tier 1 Tchotchke ($1+)";
    if (studentTotal >= 100) {
      tierText = "Tier 3 Best Tchotchke ($100+)";
    } else if (studentTotal >= 25) {
      tierText = "Tier 2 Better Tchotchke ($25+)";
    }

    if (schoolwideRank === 1) {
      return "🚲 WEEKLY GRAND PRIZE: Brand New Bike / Scooter + " + tierText;
    }
    return tierText;
  } else {
    if (schoolwideRank === 1) {
      return "🥇 GRAND PRIZE #1: 4 Disneyland Tickets (or Pro Sports) + Official T-Shirt";
    } else if (schoolwideRank === 2) {
      return "🥈 GRAND PRIZE #2: 4 Warriors Game Tickets (or choice) + Official T-Shirt";
    } else if (schoolwideRank === 3) {
      return "🥉 GRAND PRIZE #3: 4 49ers Game Tickets (or choice) + Official T-Shirt";
    } else if (schoolwideRank <= 10) {
      return "🌟 TOP 10 FINALIST: Official Jag-a-Thon T-Shirt + Top 10 Honors";
    }
    return "👕 PARTICIPANT REWARD: Official Jag-a-Thon T-Shirt";
  }
}

function parseSheetDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  const s = String(val).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{1,2}):(\d{2}))?/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const h = m[4] ? parseInt(m[4], 10) : 0;
    const mi = m[5] ? parseInt(m[5], 10) : 0;
    return new Date(y, mo, d, h, mi, 0);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function isValidForWeek(dateVal, period) {
  const d = parseSheetDate(dateVal);
  if (!d || isNaN(d.getTime())) return true;
  const t = d.getTime();
  const w1Cut = SPRINT_SCHEDULE["1"].cutoff.getTime();
  const w2Cut = SPRINT_SCHEDULE["2"].cutoff.getTime();
  const w3Cut = SPRINT_SCHEDULE["3"].cutoff.getTime();
  const w4Cut = SPRINT_SCHEDULE["4"].cutoff.getTime();

  if (period === "Week 1") return t < w1Cut;
  if (period === "Week 2") return t >= w1Cut && t < w2Cut;
  if (period === "Week 3") return t >= w2Cut && t < w3Cut;
  if (period === "Week 4") return t >= w3Cut && t < w4Cut;
  return true;
}

// ==========================================================
// 5. BEAUTIFUL REPORT BUILDER (Grade-Ordered & A-Z Students)
// ==========================================================
function generatePrizeReport(selectedPeriod, isWeeklyOnly) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];

  if (!dataSheet) {
    SpreadsheetApp.getUi().alert("❌ Error: Could not find '" + ZEFFY_CONFIG.SHEET_NAME + "' tab!");
    return;
  }

  const classrooms = {};
  Object.keys(JFS_ROSTER).forEach(roomCode => {
    const item = JFS_ROSTER[roomCode];
    const label = `${item.teacher} (Room ${roomCode} • ${item.grade})`;
    classrooms[label] = {};
  });

  const lastRow = dataSheet.getLastRow();
  let totalDonationsFound = 0;

  if (lastRow > 1) {
    const dataRange = dataSheet.getRange(1, 1, lastRow, dataSheet.getLastColumn()).getValues();
    const headers = dataRange[0].map(h => String(h || '').trim().toLowerCase());

    const studentIdx = headers.findIndex(h => h.includes('student'));
    const amountIdx  = headers.findIndex(h => h.includes('amount') || h.includes('$'));
    const teacherIdx = headers.findIndex(h => h.includes('teacher') || h.includes('room'));
    const dateIdx    = headers.findIndex(h => h.includes('date'));

    for (let i = 1; i < dataRange.length; i++) {
      const row = dataRange[i];
      const rawName = studentIdx !== -1 ? String(row[studentIdx] || '').trim() : '';
      const rawRoomTeacher = teacherIdx !== -1 ? String(row[teacherIdx] || '').trim().toUpperCase() : '';
      const rawAmount = amountIdx !== -1 ? parseFloat(String(row[amountIdx] || '').replace(/[^0-9.-]+/g, '')) || 0 : 0;

      if (!rawName || rawAmount <= 0) continue;

      if (isWeeklyOnly && dateIdx !== -1 && row[dateIdx]) {
        if (!isValidForWeek(row[dateIdx], selectedPeriod)) continue;
      }

      let classLabel = rawRoomTeacher;
      if (JFS_ROSTER[rawRoomTeacher]) {
        const item = JFS_ROSTER[rawRoomTeacher];
        classLabel = `${item.teacher} (Room ${rawRoomTeacher} • ${item.grade})`;
      } else {
        const matchRoom = Object.keys(JFS_ROSTER).find(k => JFS_ROSTER[k].teacher === rawRoomTeacher);
        if (matchRoom) {
          const item = JFS_ROSTER[matchRoom];
          classLabel = `${rawRoomTeacher} (Room ${matchRoom} • ${item.grade})`;
        }
      }

      if (!classrooms[classLabel]) classrooms[classLabel] = {};
      if (!classrooms[classLabel][rawName]) classrooms[classLabel][rawName] = 0;
      classrooms[classLabel][rawName] += rawAmount;
      totalDonationsFound++;
    }
  }

  // 1. Schoolwide Individual Rankings
  const allStudents = [];
  Object.keys(classrooms).forEach(cLabel => {
    Object.keys(classrooms[cLabel]).forEach(sName => {
      allStudents.push({
        name: sName,
        classroom: cLabel,
        amount: classrooms[cLabel][sName]
      });
    });
  });
  allStudents.sort((a, b) => b.amount - a.amount);

  const schoolRankMap = {};
  allStudents.forEach((st, idx) => {
    schoolRankMap[st.name] = idx + 1;
  });

  // 2. Schoolwide Classroom Rankings
  const classRanks = Object.keys(classrooms).map(cLabel => {
    const total = Object.values(classrooms[cLabel]).reduce((sum, v) => sum + v, 0);
    return { classroom: cLabel, total: total, count: Object.keys(classrooms[cLabel]).length };
  }).sort((a, b) => b.total - a.total);

  // 3. Tier-Wise Tchotchkes Counts (Lower vs Upper Grades)
  const lowerTiers = { 1: 0, 2: 0, 3: 0 };
  const upperTiers = { 1: 0, 2: 0, 3: 0 };

  allStudents.forEach(st => {
    if (st.amount < MIN_DONATION_FOR_TCHOTCHKE) return;
    const tier = st.amount < 25 ? 1 : (st.amount < 100 ? 2 : 3);
    const item = Object.values(JFS_ROSTER).find(r => st.classroom.includes(r.teacher));
    const grade = item ? item.grade : '';
    const gradeIdx = getGradeOrderIndex(grade);
    
    // Lower Grades: TK, K, Lower SDC, 1, 2 (indices 0 to 4)
    // Upper Grades: 3, Upper SDC, 4, 5, 5/6, 6 (indices 5 to 10)
    if (gradeIdx <= 4) {
      lowerTiers[tier]++;
    } else {
      upperTiers[tier]++;
    }
  });

  const lowerTotal = lowerTiers[1] + lowerTiers[2] + lowerTiers[3];
  const upperTotal = upperTiers[1] + upperTiers[2] + upperTiers[3];
  const grandTotalTchotchkes = lowerTotal + upperTotal;

  // Tab Setup
  const tabName = `Report — ${selectedPeriod}`;
  let reportSheet = ss.getSheetByName(tabName);
  if (reportSheet) {
    reportSheet.clear();
  } else {
    reportSheet = ss.insertSheet(tabName);
  }

  reportSheet.setHiddenGridlines(false);

  const outputRows = [];
  const formattingActions = [];

  // Top Header Banners
  outputRows.push([`🐾 JFS JAG-A-THON — ${selectedPeriod.toUpperCase()} REPORT`, '', '', '']);
  outputRows.push([`CUTOFF / GENERATED: ${new Date().toLocaleString()}`, '', '', '']);

  // Top Individual Leader
  if (allStudents.length > 0 && allStudents[0].amount > 0) {
    const topSt = allStudents[0];
    if (isWeeklyOnly) {
      outputRows.push([`🚲 WEEKLY SPRINT LEADER: ${topSt.name} (${topSt.classroom}) — $${topSt.amount.toFixed(2)} (Earns Brand New Bike or Scooter!)`, '', '', '']);
    } else {
      outputRows.push([`🏰 OVERALL #1 GRAND PRIZE LEADER: ${topSt.name} (${topSt.classroom}) — $${topSt.amount.toFixed(2)} (Earns 4 Disneyland Tickets!)`, '', '', '']);
    }
  } else {
    outputRows.push([`STATUS: ${totalDonationsFound} Total Donations Logged Across School`, '', '', '']);
  }

  // Top Classroom Leader
  if (classRanks.length > 0 && classRanks[0].total > 0) {
    const topCl = classRanks[0];
    if (isWeeklyOnly) {
      outputRows.push([`🍨 LEADING CLASSROOM: ${topCl.classroom} with $${topCl.total.toFixed(2)} (Leading for Class Ice Cream Social + $100 Teacher Card!)`, '', '', '']);
    } else {
      outputRows.push([`🏛️ #1 CLASSROOM IN SCHOOL: ${topCl.classroom} with $${topCl.total.toFixed(2)} (Earns Cal Academy of Sciences Field Trip!)`, '', '', '']);
    }
  }

  // TCHOTCHKES SUMMARY TABLE (For Weekly Sprints)
  if (isWeeklyOnly) {
    outputRows.push(['', '', '', '']);
    const tchotchkeHeaderRow = outputRows.length + 1;
    outputRows.push([`🎁 WEEKLY TCHOTCHKES DISTRIBUTION TOTALS (TIER 1: $1–$24 • TIER 2: $25–$99 • TIER 3: $100+)`, '', '', '']);
    formattingActions.push({ type: 'tierSummaryHeader', row: tchotchkeHeaderRow });

    outputRows.push([
      'Lower Grades (TK, K, 1, 2, Lower SDC)',
      `Tier 1: ${lowerTiers[1]}`,
      `Tier 2: ${lowerTiers[2]}`,
      `Tier 3: ${lowerTiers[3]}   ➔   Subtotal: ${lowerTotal} tchotchkes`
    ]);
    formattingActions.push({ type: 'tierSummaryRow', row: outputRows.length });

    outputRows.push([
      'Upper Grades (3, 4, 5, 5/6, 6, Upper SDC)',
      `Tier 1: ${upperTiers[1]}`,
      `Tier 2: ${upperTiers[2]}`,
      `Tier 3: ${upperTiers[3]}   ➔   Subtotal: ${upperTotal} tchotchkes`
    ]);
    formattingActions.push({ type: 'tierSummaryRow', row: outputRows.length });

    outputRows.push([
      '⭐ SCHOOLWIDE GRAND TOTAL',
      `Tier 1 Total: ${lowerTiers[1] + upperTiers[1]}`,
      `Tier 2 Total: ${lowerTiers[2] + upperTiers[2]}`,
      `Tier 3 Total: ${lowerTiers[3] + upperTiers[3]}   ➔   TOTAL: ${grandTotalTchotchkes} items`
    ]);
    formattingActions.push({ type: 'tierGrandTotalRow', row: outputRows.length });
  }

  // SORT CLASSROOMS BY GRADE LEVEL (TK -> K -> Lower SDC -> 1 -> 2 -> 3 -> Upper SDC -> 4 -> 5 -> 5/6 -> 6)
  function sortClassLabelsByGrade(aLabel, bLabel) {
    const itemA = Object.values(JFS_ROSTER).find(r => aLabel.includes(r.teacher));
    const itemB = Object.values(JFS_ROSTER).find(r => bLabel.includes(r.teacher));
    const gA = itemA ? getGradeOrderIndex(itemA.grade) : 99;
    const gB = itemB ? getGradeOrderIndex(itemB.grade) : 99;
    if (gA !== gB) return gA - gB;
    return aLabel.localeCompare(bLabel);
  }

  const sortedClasses = Object.keys(classrooms).sort(sortClassLabelsByGrade);
  const activeClasses = sortedClasses.filter(c => Object.keys(classrooms[c]).length > 0);
  const quietClasses = sortedClasses.filter(c => Object.keys(classrooms[c]).length === 0);

  if (activeClasses.length === 0) {
    outputRows.push(['', '', '', '']);
    outputRows.push(['ℹ️ No donations logged yet for this period. All classrooms currently at $0.00.', '', '', '']);
    formattingActions.push({ type: 'emptyNotice', row: outputRows.length });
  } else {
    activeClasses.forEach(cLabel => {
      outputRows.push(['', '', '', '']);
      const classStartRow = outputRows.length + 1;

      outputRows.push([`🏫 CLASSROOM: ${cLabel}`, '', '', '']);
      outputRows.push(['Delivered?', 'Student Name', `${selectedPeriod} Total`, isWeeklyOnly ? 'Weekly Sprint Prize' : 'End-of-Event Reward / Prize']);

      formattingActions.push({ type: 'classHeader', row: classStartRow });
      formattingActions.push({ type: 'tableHeader', row: classStartRow + 1 });

      const students = classrooms[cLabel];
      // SORT STUDENTS ALPHABETICALLY BY NAME (A -> Z)
      const sortedStudents = Object.keys(students).sort((a, b) => a.localeCompare(b));
      const classLeader = Object.keys(students).sort((a, b) => students[b] - students[a])[0];
      let classTotal = 0;

      sortedStudents.forEach(studentName => {
        const studentRowIdx = outputRows.length + 1;
        const total = students[studentName];
        classTotal += total;
        const rank = schoolRankMap[studentName] || 999;
        const prize = assignPrize(total, rank, isWeeklyOnly);
        const isClassTop = (studentName === classLeader && sortedStudents.length > 1) ? ' ⭐ Class #1' : '';

        outputRows.push([
          false,
          studentName,
          total,
          prize + isClassTop
        ]);

        formattingActions.push({ type: 'studentRow', row: studentRowIdx });
      });

      const totalRowIdx = outputRows.length + 1;
      outputRows.push(['', 'Classroom Total:', classTotal, `${sortedStudents.length} contributing student(s)`]);
      formattingActions.push({ type: 'totalRow', row: totalRowIdx });
    });
  }

  // Compact Rollup of Quiet Classrooms at the bottom (4 columns wide)
  if (quietClasses.length > 0) {
    outputRows.push(['', '', '', '']);
    const quietHeaderRow = outputRows.length + 1;
    outputRows.push([`📋 CLASSROOMS WITH $0 DONATIONS THIS SPRINT (No deliveries needed):`, '', '', '']);
    formattingActions.push({ type: 'quietHeader', row: quietHeaderRow });

    for (let i = 0; i < quietClasses.length; i += 4) {
      const chunk = quietClasses.slice(i, i + 4);
      while (chunk.length < 4) chunk.push('');
      outputRows.push(chunk);
      formattingActions.push({ type: 'quietRow', row: outputRows.length });
    }
  }

  // Dimension checking
  const maxRows = reportSheet.getMaxRows();
  if (maxRows < outputRows.length) {
    reportSheet.insertRowsAfter(maxRows, outputRows.length - maxRows);
  }

  reportSheet.getRange(1, 1, outputRows.length, 4).setValues(outputRows);

  const currentCols = reportSheet.getMaxColumns();
  if (currentCols > 4) {
    reportSheet.deleteColumns(5, currentCols - 4);
  }

  const currentRows = reportSheet.getMaxRows();
  if (currentRows > outputRows.length) {
    reportSheet.deleteRows(outputRows.length + 1, currentRows - outputRows.length);
  }

  reportSheet.getRange(1, 1, outputRows.length, 4).setFontFamily('Arial');

  // Title Banner
  reportSheet.getRange('A1:D1').merge().setFontSize(13).setFontWeight('bold').setBackground('#0b4ea2').setFontColor('#ffffff').setHorizontalAlignment('center');
  reportSheet.getRange('A2:D2').merge().setFontSize(9).setFontWeight('bold').setBackground('#073570').setFontColor('#e2e8f0').setHorizontalAlignment('center');

  // Highlights
  reportSheet.getRange('A3:D3').merge().setFontSize(9.5).setFontWeight('bold').setBackground('#ecfdf5').setFontColor('#065f46').setHorizontalAlignment('center');
  if (classRanks.length > 0 && classRanks[0].total > 0) {
    reportSheet.getRange('A4:D4').merge().setFontSize(9.5).setFontWeight('bold').setBackground('#eff6ff').setFontColor('#1e40af').setHorizontalAlignment('center');
  }

  reportSheet.setColumnWidth(1, 95);  // Delivered?
  reportSheet.setColumnWidth(2, 220); // Student Name
  reportSheet.setColumnWidth(3, 120); // Amount
  reportSheet.setColumnWidth(4, 460); // Prize Tier / Reward

  formattingActions.forEach(action => {
    if (action.type === 'tierSummaryHeader') {
      reportSheet.getRange(action.row, 1, 1, 4).merge()
        .setFontSize(10).setFontWeight('bold')
        .setBackground('#4338ca').setFontColor('#ffffff')
        .setHorizontalAlignment('center').setVerticalAlignment('middle');
      reportSheet.setRowHeight(action.row, 26);
    }
    else if (action.type === 'tierSummaryRow') {
      reportSheet.getRange(action.row, 1, 1, 4)
        .setFontSize(9.5).setBackground('#f5f3ff').setFontColor('#1e1b4b')
        .setBorder(true, true, true, true, true, true, '#c7d2fe', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.getRange(action.row, 1).setFontWeight('bold');
      reportSheet.setRowHeight(action.row, 23);
    }
    else if (action.type === 'tierGrandTotalRow') {
      reportSheet.getRange(action.row, 1, 1, 4)
        .setFontSize(10).setFontWeight('bold').setBackground('#e0e7ff').setFontColor('#1e1b4b')
        .setBorder(true, true, true, true, true, true, '#818cf8', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.setRowHeight(action.row, 25);
    }
    else if (action.type === 'classHeader') {
      reportSheet.getRange(action.row, 1, 1, 4).merge()
        .setFontSize(11).setFontWeight('bold')
        .setBackground('#1e3a8a').setFontColor('#ffffff')
        .setVerticalAlignment('middle');
      reportSheet.setRowHeight(action.row, 28);
    } 
    else if (action.type === 'tableHeader') {
      reportSheet.getRange(action.row, 1, 1, 4)
        .setFontSize(9).setFontWeight('bold')
        .setBackground('#f1f5f9').setFontColor('#1e293b')
        .setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.getRange(action.row, 1).setHorizontalAlignment('center');
      reportSheet.getRange(action.row, 3).setHorizontalAlignment('right');
      reportSheet.setRowHeight(action.row, 24);
    }
    else if (action.type === 'studentRow') {
      reportSheet.getRange(action.row, 1).insertCheckboxes().setHorizontalAlignment('center');
      reportSheet.getRange(action.row, 2).setFontWeight('bold');
      reportSheet.getRange(action.row, 3).setNumberFormat('$#,##0.00').setFontWeight('bold').setHorizontalAlignment('right');
      reportSheet.getRange(action.row, 1, 1, 4).setBorder(true, true, true, true, true, true, '#e2e8f0', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.setRowHeight(action.row, 24);
    }
    else if (action.type === 'totalRow') {
      reportSheet.getRange(action.row, 1, 1, 4).setFontSize(9.5).setFontWeight('bold').setBackground('#f8fafc');
      reportSheet.getRange(action.row, 3).setNumberFormat('$#,##0.00').setHorizontalAlignment('right');
      reportSheet.getRange(action.row, 1, 1, 4).setBorder(true, true, true, true, false, false, '#94a3b8', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.setRowHeight(action.row, 24);
    }
    else if (action.type === 'quietHeader') {
      reportSheet.getRange(action.row, 1, 1, 4).merge()
        .setFontSize(9).setFontWeight('bold')
        .setBackground('#f1f5f9').setFontColor('#64748b');
      reportSheet.setRowHeight(action.row, 22);
    }
    else if (action.type === 'quietRow') {
      reportSheet.getRange(action.row, 1, 1, 4)
        .setFontSize(8.5).setFontColor('#64748b').setBackground('#ffffff')
        .setBorder(true, true, true, true, true, true, '#f1f5f9', SpreadsheetApp.BorderStyle.SOLID);
      reportSheet.setRowHeight(action.row, 20);
    }
    else if (action.type === 'emptyNotice') {
      reportSheet.getRange(action.row, 1, 1, 4).merge()
        .setFontSize(10).setFontStyle('italic').setFontColor('#64748b').setHorizontalAlignment('center');
    }
  });

  SpreadsheetApp.getUi().alert(`✨ '${tabName}' generated with grade sorting, A-Z students, and Tier-wise totals!`);
}

// ==========================================================
// 6. GMAIL SYNC: Auto-syncs new donations with timestamp
// ==========================================================
function syncZeffyDonations() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Sync paused: sheet is busy. Please try again.', 'Jagathon Sync');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];

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
        if (!parsed) continue;

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

// ==========================================================
// 7. EXPORT TAB SYNC: Deduplication & Tax Receipt Upgrade
// ==========================================================
function importFromZeffyExportTab() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Sheet is busy. Please try again.', 'Jagathon Sync');
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    let exportSheet = ss.getSheetByName(ZEFFY_CONFIG.EXPORT_TAB_NAME);
    if (!exportSheet) {
      const allSheets = ss.getSheets();
      for (let s of allSheets) {
        if (s.getName().toLowerCase().startsWith('export')) {
          exportSheet = s;
          break;
        }
      }
    }

    const mainSheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];

    if (!exportSheet) {
      SpreadsheetApp.getUi().alert(`⚠️ Could not find a tab named "Export".\nPlease make sure your export tab is named "Export".`);
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
    }

    SpreadsheetApp.getUi().alert(`Sync Complete!\n• New Rows Added: ${rowsToAppend.length}\n• Existing Rows Updated with Official ID/Time: ${updatedCount}`);

  } catch (err) {
    Logger.log('Export Sync Error: ' + err.toString());
    SpreadsheetApp.getUi().alert('Export Sync Error: ' + err.toString());
  } finally {
    lock.releaseLock();
  }
}

// ==========================================================
// 8. DATA HYGIENE TOOLS
// ==========================================================
function cleanAllStudentNamesInColumnC() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const range = sheet.getRange(2, 3, lastRow - 1, 1);
  const values = range.getValues();
  let cleanedCount = 0;

  for (let i = 0; i < values.length; i++) {
    const original = String(values[i][0] || '').trim();
    const cleaned = cleanStudentName(original);
    if (cleaned && cleaned !== original) {
      values[i][0] = cleaned;
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    range.setValues(values);
    SpreadsheetApp.getUi().alert(`Cleaned and normalized ${cleanedCount} student name(s) in Column C!`);
  } else {
    SpreadsheetApp.getUi().alert('All student names in Column C are already clean!');
  }
}

function fixAllDatesInColumnA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ZEFFY_CONFIG.SHEET_NAME) || ss.getSheets()[0];
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

function standardizeDateTime(dateVal, timeVal) {
  let s = String(dateVal || '').trim();
  let datePart = '';

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    datePart = s.substring(0, 10);
  } else {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) {
      const mm = m[1].padStart(2, '0');
      const dd = m[2].padStart(2, '0');
      datePart = `${m[3]}-${mm}-${dd}`;
    } else if (dateVal instanceof Date && !isNaN(dateVal.getTime())) {
      datePart = Utilities.formatDate(dateVal, Session.getScriptTimeZone() || 'America/Los_Angeles', 'yyyy-MM-dd');
    } else {
      datePart = s;
    }
  }

  let tStr = String(timeVal || '').trim();
  if (!tStr && s.includes(' ')) {
    const parts = s.split(' ');
    datePart = parts[0];
    tStr = parts.slice(1).join(' ');
  }

  if (!tStr) return datePart;

  const tm = tStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (tm) {
    let h = parseInt(tm[1], 10);
    const mins = tm[2];
    const ampm = tm[4] ? tm[4].toLowerCase() : '';
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return `${datePart} ${String(h).padStart(2, '0')}:${mins}`;
  }

  return `${datePart} ${tStr}`.trim();
}

const STUDENT_NAME_ALIASES = {
  'evanaleah a': 'Evanaleah Alvarez',
  'evanaleah a.': 'Evanaleah Alvarez',
  'evannaleah alvarez': 'Evanaleah Alvarez'
};

function cleanStudentName(rawName) {
  if (!rawName) return '';
  const str = String(rawName).trim();
  let s = str.replace(/["“”][^"“”]*["“”]/g, '');
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

function ensureHeaders(sheet) {
  const h1 = sheet.getRange(1, 8).getValue();
  if (!h1 || String(h1).trim() === '') {
    sheet.getRange(1, 8).setValue('Raw Student Name');
  }
}

// ==========================================================
// 9. EMAIL PARSER & BACKGROUND TRIGGERS
// ==========================================================
function parseZeffyMessage(msg) {
  const subject = msg.getSubject() || '';
  const rawBody = msg.getPlainBody() || '';
  const dateObj = msg.getDate();
  const formattedDate = Utilities.formatDate(dateObj, Session.getScriptTimeZone() || 'America/Los_Angeles', 'yyyy-MM-dd HH:mm');
  const msgId = msg.getId();

  if (rawBody.includes('manage your donations') || !rawBody.includes('CUSTOM QUESTIONS')) {
    return null;
  }

  let amount = 0;
  const subjectAmountMatch = subject.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
  if (subjectAmountMatch) {
    amount = parseFloat(subjectAmountMatch[1].replace(/,/g, ''));
  } else {
    const bodyAmountMatch = rawBody.match(/(?:Amount|Total|Donation|New)\s*\$?\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    if (bodyAmountMatch) {
      amount = parseFloat(bodyAmountMatch[1].replace(/,/g, ''));
    }
  }

  if (!amount || amount <= 0) return null;

  let donorName = '';
  const donorMatch = subject.match(/received from (.+)$/i);
  if (donorMatch) {
    donorName = donorMatch[1].trim();
  }

  const cleanBody = rawBody.replace(/[*_#~]/g, '');
  const lines = cleanBody.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  function getAnswerAfter(pattern) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const colonIdx = lines[i].indexOf(':');
        if (colonIdx !== -1 && lines[i].substring(colonIdx + 1).trim() !== '') {
          return lines[i].substring(colonIdx + 1).trim();
        }
        if (i + 1 < lines.length) {
          return lines[i + 1].trim();
        }
      }
    }
    return '';
  }

  const rawStudent = getAnswerAfter(/^Student/i);
  const studentName = cleanStudentName(rawStudent);
  const grade = getAnswerAfter(/^Grade/i);
  const teacher = getAnswerAfter(/^Teacher/i);

  if (!studentName) return null;

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

function testLatestEmailParse() {
  const threads = GmailApp.search('from:zeffy.com "CUSTOM QUESTIONS"', 0, 1);
  if (threads.length === 0) {
    SpreadsheetApp.getUi().alert('No organizer emails found with CUSTOM QUESTIONS.');
    return;
  }

  const msg = threads[0].getMessages()[0];
  const parsed = parseZeffyMessage(msg);

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