/* TA SERIES app mode (v1.0.4).
   Loaded by every website page (see the <script> tag in <head>).
   When the app opens the site it adds ?app=1 to the link. This script
   remembers that choice, marks the page as in-app (style.css hides the
   site header/footer and applies the app colours), and gives the app's
   back button a way to go up one folder level on the Study Materials page.
   On any other page it answers false, so the app uses WebView history. */
(function(){
  var inApp = /[?&]app=1/.test(location.search);
  try { if (sessionStorage.getItem('ta-app') === '1') inApp = true; } catch (e) {}
  if (inApp) {
    try { sessionStorage.setItem('ta-app', '1'); } catch (e) {}
    document.documentElement.classList.add('in-app');
  }
  window.taBack = function(){
    try {
      if (typeof state !== 'undefined' && state && state.path &&
          state.path.length > 0 && !state.q && typeof goTo === 'function') {
        goTo(state.path.slice(0, -1));
        return true;
      }
    } catch (e) {}
    return false;
  };
})();
