/**
 * OogstWeb — Aanvragen opslaan in Google Sheets
 *
 * Installatie:
 * 1. Ga naar sheets.google.com en maak een nieuwe lege spreadsheet.
 *    Noem hem bijvoorbeeld "OogstWeb Aanvragen".
 * 2. Ga in het menu naar Extensies > Apps Script.
 * 3. Verwijder de voorbeeldcode die er staat en plak dit hele bestand ervoor in de plaats.
 * 4. Klik rechtsboven op "Implementeren" (Deploy) > "Nieuwe implementatie".
 * 5. Kies bij "Type selecteren" het tandwiel-icoon > "Webapp".
 * 6. Zet "Uitvoeren als": Ik (jouw account).
 * 7. Zet "Wie heeft toegang": Iedereen.
 * 8. Klik op "Implementeren". Google vraagt om toestemming — klik "Autoriseren toegang",
 *    kies je account, en klik op "Geavanceerd" > "Ga naar OogstWeb Aanvragen (onveilig)".
 *    Dit is jouw eigen script, dus dat is veilig.
 * 9. Kopieer de "Webapp-URL" die verschijnt (eindigt op /exec).
 * 10. Stuur die URL naar Claude — die verwerkt hem in de website.
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.bron === 'contact' ? 'Contactformulier' : 'Groeiscan';
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === 'Groeiscan') {
        sheet.appendRow([
          'Datum', 'Naam', 'Bedrijf', 'Huidige website', 'E-mail', 'Telefoon',
          'Branche', 'Bedrijfsgrootte', 'Waar naar op zoek', 'Vervolgantwoord',
          'Hoe komen klanten binnen', 'Grootste uitdaging', 'Voorkeur contactmoment'
        ]);
      } else {
        sheet.appendRow(['Datum', 'Naam', 'E-mail', 'Dienst', 'Bericht']);
      }
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const timestamp = new Date();
    if (sheetName === 'Groeiscan') {
      sheet.appendRow([
        timestamp, data.naam, data.bedrijf, data.website, data.email, data.telefoon,
        data.branche, data.grootte, data.type, data.vervolg, data.kanaal,
        data.uitdaging, data.tijdstip
      ]);
    } else {
      sheet.appendRow([timestamp, data.naam, data.email, data.dienst, data.bericht]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
