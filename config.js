/* ======================================================================
   SDÍLENÁ KONFIGURACE — používá ji index.html i poznamky.html
   Uprav zde, změna se projeví v obou stránkách.
   ====================================================================== */
const CONFIG = {
  // Cesta k CSV souboru s úseky (relativně k index.html)
  CSV_URL: 'data.csv',

  // URL nasazeného Google Apps Script Web Appu (viz README / Code.gs).
  // Appka přes ni čte i zapisuje poznámky - Sheet samotný zůstává
  // soukromý, přístup k němu má jen tvůj Google účet, pod kterým je
  // skript nasazený.
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzDhFA4JkzN71s0HgWbqbMO3B4REHu3-td4mLHk0Y0IbQixH5G3PnfJ9LucWWwpnYiEfQ/exec',

  MAP_CENTER: [50.045, 14.47],
  MAP_ZOOM: 12,
};
