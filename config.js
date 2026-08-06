/* ======================================================================
   SDÍLENÁ KONFIGURACE — používá ji index.html i poznamky.html
   Uprav zde, změna se projeví v obou stránkách.
   ====================================================================== */
const CONFIG = {
  // POZOR: data.csv už appka nečte přímo z tohoto souboru/URL - stahuje
  // ho přes Apps Script (action=csv), který ověří heslo a teprve pak
  // vrátí obsah souboru uloženého na Google Drive. Tato hodnota se
  // nepoužívá, ponechána jen pro referenci / případný návrat k původnímu
  // řešení bez hesla.
  CSV_URL: 'data.csv',

  // URL nasazeného Google Apps Script Web Appu (viz README / Code.gs).
  // Appka přes ni čte i zapisuje poznámky - Sheet samotný zůstává
  // soukromý, přístup k němu má jen tvůj Google účet, pod kterým je
  // skript nasazený.
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzDhFA4JkzN71s0HgWbqbMO3B4REHu3-td4mLHk0Y0IbQixH5G3PnfJ9LucWWwpnYiEfQ/exec',

  MAP_CENTER: [50.045, 14.47],
  MAP_ZOOM: 12,
};

/* ======================================================================
   SDÍLENÁ AUTENTIZACE
   Heslo se nikde neukládá natrvalo (jen v sessionStorage prohlížeče -
   zmizí při zavření karty/prohlížeče). Slouží k odclonění náhodných
   kolemjdoucích, ne jako ochrana proti cílenému útoku.
   ====================================================================== */
const AUTH = {
  getPassword() {
    return sessionStorage.getItem('appPassword') || '';
  },
  setPassword(pw) {
    sessionStorage.setItem('appPassword', pw);
  },
  clearPassword() {
    sessionStorage.removeItem('appPassword');
  },
  // Přidá heslo jako query parametr k URL (pro GET požadavky)
  withPw(url) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}pw=${encodeURIComponent(AUTH.getPassword())}`;
  },
};

/* ======================================================================
   PŘIHLAŠOVACÍ OBRAZOVKA
   Zavolej await requireAuth() na začátku appky - vrátí se, až je heslo
   ověřené (buď z uložené session, nebo po úspěšném zadání ve formuláři).
   Vyžaduje v HTML kontejner <div id="authOverlay">.
   ====================================================================== */
function requireAuth() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('authOverlay');
    const form = document.getElementById('authForm');
    const nameInput = document.getElementById('authName');
    const pwInput = document.getElementById('authPw');
    const errorEl = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmit');

    nameInput.value = localStorage.getItem('authorName') || '';

    async function tryPassword(pw, showErrors) {
      try {
        const res = await fetch(AUTH.withPw(`${CONFIG.APPS_SCRIPT_URL}?action=ping`));
        const result = await res.json().catch(() => ({ ok: false }));
        if (result.ok) return true;
        if (showErrors) errorEl.textContent = result.error || 'Nesprávné heslo.';
        return false;
      } catch (e) {
        if (showErrors) errorEl.textContent = 'Nepodařilo se ověřit heslo. Zkontroluj připojení.';
        return false;
      }
    }

    async function finish() {
      overlay.style.display = 'none';
      resolve();
    }

    // Zkus rovnou heslo uložené v této session (nemusí se zadávat opakovaně)
    const stored = AUTH.getPassword();
    if (stored) {
      tryPassword(stored, false).then(ok => {
        if (ok) { finish(); return; }
        AUTH.clearPassword();
        overlay.style.display = 'flex';
      });
    } else {
      overlay.style.display = 'flex';
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const pw = pwInput.value;
      errorEl.textContent = '';
      if (!name) { errorEl.textContent = 'Vyplň prosím jméno.'; return; }
      if (!pw) { errorEl.textContent = 'Vyplň prosím heslo.'; return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Ověřuji…';
      const ok = await tryPassword(pw, true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Vstoupit';

      if (ok) {
        localStorage.setItem('authorName', name);
        AUTH.setPassword(pw);
        finish();
      }
    };
  });
}
