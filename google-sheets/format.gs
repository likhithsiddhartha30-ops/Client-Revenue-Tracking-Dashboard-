/**
 * WorthyOps Client Revenue DB — one-time formatting for the Google Sheet.
 * Paste into an Apps Script project (standalone or Extensions → Apps Script) and run
 * formatWorthyOpsDB(). Safe to re-run.
 */
const SHEET_ID = '16vsKYg_vdNV3_SUmhuQdsTMJ7Cfq7Sq6UdaKn_cXAkU';

function formatWorthyOpsDB() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const NAVY = '#0f1b3d';      // header fill
  const BLUE = '#4f8cff';      // accent
  const CALC_BG = '#eef3ff';   // auto-calculated cells
  const CALC_FG = '#3b4a6b';
  const STRIPE = '#f7f9fd';
  const FONT = 'Inter';

  function base(sh, ncols, widths) {
    if (sh.getMaxColumns() > ncols) sh.deleteColumns(ncols + 1, sh.getMaxColumns() - ncols);
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 36);
    sh.setRowHeightsForced(2, sh.getMaxRows() - 1, 26);
    sh.getRange(1, 1, sh.getMaxRows(), ncols)
      .setFontFamily(FONT).setFontSize(10).setFontColor('#1f2937').setVerticalAlignment('middle');
    widths.forEach((w, i) => { if (w) sh.setColumnWidth(i + 1, w); });
    sh.getBandings().forEach(b => b.remove());
    sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(p => p.remove());
    sh.setHiddenGridlines(true);
  }

  function header(range) {
    range.setBackground(NAVY).setFontColor('#ffffff').setFontWeight('bold')
      .setFontSize(10).setVerticalAlignment('middle').setHorizontalAlignment('left')
      .setBorder(null, null, true, null, null, null, BLUE, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  function band(range) {
    range.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
      .setHeaderRowColor(NAVY).setFirstRowColor('#ffffff').setSecondRowColor(STRIPE);
  }

  function calc(range, note) {
    range.setBackground(CALC_BG).setFontColor(CALC_FG);
    range.protect().setDescription(note).setWarningOnly(true);
  }

  const nonNegative = SpreadsheetApp.newDataValidation()
    .requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false)
    .setHelpText('Enter a whole number, 0 or more.').build();

  /* ---------- Clients ---------- */
  const clients = ss.getSheetByName('Clients');
  base(clients, 4, [150, 260, 220, 170]);
  band(clients.getRange(1, 1, clients.getMaxRows(), 4));
  header(clients.getRange('A1:D1'));
  clients.getRange('A2:A').setFontWeight('bold').setFontColor('#1e3a8a');
  clients.getRange('D2:D').setNumberFormat('dd mmm yyyy');
  clients.getRange('A2:A').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('=COUNTIF($A$2:$A, A2) = 1').setAllowInvalid(false)
    .setHelpText('Short unique ID, e.g. apex. Used in Monthly_Records.').build());
  clients.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireDate().setAllowInvalid(false).setHelpText('Date the client started, e.g. 2026-10-01.').build());
  clients.getRange('A1').setNote('Short unique ID for the client (e.g. apex). Pick it from the dropdown in Monthly_Records.');
  clients.setTabColor(BLUE);

  /* ---------- Monthly_Records ---------- */
  const rec = ss.getSheetByName('Monthly_Records');
  base(rec, 13, [110, 130, 210, 120, 130, 110, 140, 110, 110, 130, 120, 110, 130]);
  band(rec.getRange(1, 1, rec.getMaxRows(), 13));
  header(rec.getRange('A1:M1'));
  // calculated headers in blue so they stand out from input columns
  ['C1', 'F1', 'K1', 'L1', 'M1'].forEach(a => rec.getRange(a).setBackground('#1e3a8a'));

  rec.getRange('A2:A').setNumberFormat('mmm yyyy').setHorizontalAlignment('left');
  rec.getRange('D2:I').setNumberFormat('#,##0');
  rec.getRange('J2:J').setNumberFormat('$#,##0');
  rec.getRange('K2:L').setNumberFormat('0.0%');
  rec.getRange('M2:M').setNumberFormat('$#,##0');

  rec.getRange('A2:A').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireDate().setAllowInvalid(false).setHelpText('First day of the month, e.g. 2026-10-01.').build());
  rec.getRange('B2:B').setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInRange(clients.getRange('A2:A'), true).setAllowInvalid(false)
    .setHelpText('Pick a client_id from the Clients tab.').build());
  ['D2:E', 'G2:J'].forEach(a => rec.getRange(a).setDataValidation(nonNegative));

  const autoNote = 'Auto-calculated — do not type here.';
  ['C2:C', 'F2:F', 'K2:M'].forEach(a => calc(rec.getRange(a), autoNote));
  ['C1', 'F1', 'K1', 'L1', 'M1'].forEach(a => rec.getRange(a).setNote(autoNote));
  rec.getRange('A1').setNote('First day of the month, e.g. 2026-10-01. One row per client per month.');
  rec.getRange('B1').setNote('Pick the client from the dropdown (IDs come from the Clients tab).');
  rec.setTabColor(BLUE);

  /* ---------- Summary ---------- */
  const sum = ss.getSheetByName('Summary');
  base(sum, 15, [130, 210, 110, 140, 110, 110, 130, 28, 28, 110, 110, 140, 110, 110, 130]);
  band(sum.getRange(1, 1, sum.getMaxRows(), 7));
  band(sum.getRange(1, 10, sum.getMaxRows(), 6));
  header(sum.getRange('A1:G1'));
  header(sum.getRange('J1:O1'));
  sum.getRange('H1:I').setBackground('#ffffff');
  sum.getRange('C2:F').setNumberFormat('#,##0');
  sum.getRange('G2:G').setNumberFormat('$#,##0').setFontWeight('bold');
  sum.getRange('J2:J').setNumberFormat('mmm yyyy').setHorizontalAlignment('left');
  sum.getRange('K2:N').setNumberFormat('#,##0');
  sum.getRange('O2:O').setNumberFormat('$#,##0').setFontWeight('bold');
  sum.getRange('A1:O').protect().setDescription('Summary is generated from Monthly_Records.').setWarningOnly(true);
  sum.getRange('A1').setNote('Totals per client, generated from Monthly_Records.');
  sum.getRange('J1').setNote('Totals per month, generated from Monthly_Records.');
  sum.setTabColor('#0f1b3d');

  // Tab order: Clients, Monthly_Records, Summary
  [clients, rec, sum].forEach((sh, i) => { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); });
  ss.setActiveSheet(rec);
  SpreadsheetApp.flush();
}
