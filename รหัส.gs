// ฟังก์ชัน getPrefixes: ดึงข้อมูลคำนำหน้าชื่อจากชีต prefix
function getPrefixes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('prefix');
  if (!sheet) return [];
  const data = sheet.getRange(1, 1, sheet.getLastRow()).getValues(); // อ่านคอลัมน์ A
  return data.flat(); // คืนค่าข้อมูลในรูปแบบ Array
}

// ฟังก์ชัน getPositions: ดึงข้อมูลตำแหน่งจากชีต position
function getPositions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('position');
  if (!sheet) return [];
  const data = sheet.getRange(1, 1, sheet.getLastRow()).getValues(); // อ่านคอลัมน์ A
  return data.flat(); // คืนค่าข้อมูลในรูปแบบ Array
}

// ฟังก์ชัน saveRegister: บันทึกข้อมูลลงทะเบียนลงในชีต registerid
function saveRegister(data) {
  let lock = LockService.getScriptLock(); // สร้าง Lock เพื่อป้องกันการเขียนข้อมูลพร้อมกัน
  if (!lock.tryLock(5000)) return false
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('registerid');
  let new_row = [
    data.cardId,
    data.prefix,
    data.firstName,
    data.lastName,
    data.age,
    data.phone,
    data.position
  ]
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, new_row.length) // อ่านแถวสุดท้ายและเพิ่ม 1 แถว
    .setNumberFormats([['@', '@', '@', '@', '#', '@', '@']]) // กำหนดรูปแบบข้อมูลเป็นข้อความ
    .setValues([new_row]); // บันทึกข้อมูลใหม่
  lock.releaseLock(); // ปลด Lock
  return true;
}

// ฟังก์ชัน getRegisterByCardId: ค้นหาข้อมูลในชีต registerid ตามรหัสบัตร
function getRegisterByCardId(cardId="927446019") {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('registerid');
  let finder = sheet.getRange('A1:A' + sheet.getLastRow()).createTextFinder(cardId).matchEntireCell(true).findNext();
  if (finder == null) return false;
  let row = finder.getRow();
  let data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues();
  data = {
    cardId: data[0][0],
    prefix: data[0][1],
    firstName: data[0][2],
    lastName: data[0][3],
    age: data[0][4],
    phone: data[0][5],
    position: data[0][6]
  }
  return data;
}

// ฟังก์ชัน saveWork: บันทึกเวลาเข้า-ออกลงในชีต working พร้อมตรวจสอบสถานะล่าสุด
function saveWork(cardId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('working');
  const rows = sheet.getDataRange().getValues();
  const lastRow = rows[rows.length - 1] || []; // อ่านแถวล่าสุด
  const lastAction = lastRow[1]; // อ่านสถานะล่าสุด (เข้า/ออก)
  const newAction = lastAction === 'IN' ? 'OUT' : 'IN'; // สลับสถานะ

  const now = new Date();
  sheet.appendRow([cardId, newAction, now]); // บันทึก รหัสบัตร, การกระทำ (เข้า/ออก), และเวลา

  return newAction; // ส่งสถานะใหม่กลับไป
}

// ฟังก์ชัน doGet: สำหรับแสดงหน้าเว็บ
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setTitle('RFID Web App');
}


function editRegister(data) {
  let lock = LockService.getScriptLock(); // สร้าง Lock เพื่อป้องกันการเขียนข้อมูลพร้อมกัน
  if (!lock.tryLock(5000)) return false
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('registerid');
  let finder = sheet.getRange('A1:A' + sheet.getLastRow()).createTextFinder(data.oldid).matchEntireCell(true).findNext();
  if (finder == null) return false;
  let row = finder.getRow();
  let edit_row = [
    data.cardId,
    data.prefix,
    data.firstName,
    data.lastName,
    data.age,
    data.phone,
    data.position
  ]
  sheet.getRange(row, 1, 1, edit_row.length)
    .setValues([edit_row]);
  lock.releaseLock(); // ปลด Lock
  return true;
}
