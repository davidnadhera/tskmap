/**
 * Apps Script Web App - backend pro poznámky k úsekům.
 *
 * Postup nasazení:
 * 1. V Google Sheetu, který má list (tab) "Poznamky" s hlavičkou
 *    UsekId | Autor | Text | Cas, otevři Rozšíření -> Apps Script.
 * 2. Vlož tento kód do Code.gs (nahraď výchozí obsah).
 * 3. Nasadit -> Nové nasazení -> typ "Web App".
 *    - Spustit jako: Já (tvůj účet)
 *    - Kdo má přístup: Kdokoli
 *    (Sheet samotný zůstává soukromý - přístup k datům má jen skript,
 *    běží pod tvým účtem. Uživatelé appky se nikam nepřihlašují.)
 * 4. Zkopíruj vygenerovanou URL (.../exec) do CONFIG.APPS_SCRIPT_URL
 *    v index.html appky.
 * 5. Při každé změně kódu je potřeba udělat nové nasazení (Nové nasazení,
 *    ne jen uložení), aby se změny projevily na živé URL.
 */

const SHEET_NAME = 'Poznamky';

function getSheet_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function doGet(e) {
  const action = e.parameter.action || 'list';
  if (action !== 'list') {
    return jsonOutput_({ ok: false, error: 'Neznámá akce' });
  }

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const notes = [];
  for (let i = 1; i < values.length; i++) {
    const [usekId, autor, text, cas] = values[i];
    if (!usekId) continue;
    notes.push({
      usekId: String(usekId),
      autor: String(autor || ''),
      text: String(text || ''),
      cas: cas instanceof Date ? cas.toISOString() : String(cas || ''),
    });
  }
  return jsonOutput_(notes);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const usekId = String(body.usekId || '').trim();
    const autor = String(body.autor || '').trim();
    const text = String(body.text || '').trim();

    if (!usekId || !text) {
      return jsonOutput_({ ok: false, error: 'Chybí usekId nebo text.' });
    }

    // jednoduchý limit délky, ať appka nejde zaspamovat
    if (text.length > 2000) {
      return jsonOutput_({ ok: false, error: 'Poznámka je příliš dlouhá.' });
    }

    const sheet = getSheet_();
    sheet.appendRow([usekId, autor, text, new Date().toISOString()]);

    return jsonOutput_({ ok: true });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
