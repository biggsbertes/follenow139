// Anti-debugger e proteção contra inspeção
export const initAntiDebug = () => {
  // DESABILITADO TEMPORARIAMENTE PARA DESENVOLVIMENTO
  console.log('Anti-debug desabilitado para desenvolvimento');
  return;
  
  // Skip anti-debug protections in development and on localhost
  const isLocalhost = typeof window !== 'undefined' && [
    'localhost',
    '127.0.0.1',
    '[::1]'
  ].includes(window.location.hostname);
  // Vite exposes import.meta.env.DEV
  const isDevEnv = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.DEV;
  if (isDevEnv || isLocalhost) {
    return;
  }
  // 1. Detectar DevTools aberto
  let devtools = { open: false, orientation: null };
  
  const threshold = 160;
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        console.clear();
        // Redirecionar ou bloquear
        document.body.innerHTML = '<h1>Acesso negado</h1>';
        window.location.href = 'about:blank';
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // 2. Bloquear F12, Ctrl+Shift+I, Ctrl+U
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C (Inspect)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
  });

  // 3. Bloquear menu de contexto (botão direito)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 4. Detectar debugger
  let debuggerDetected = false;
  const detectDebugger = () => {
    const start = new Date().getTime();
    debugger;
    const end = new Date().getTime();
    
    if (end - start > 100) {
      if (!debuggerDetected) {
        debuggerDetected = true;
        document.body.innerHTML = '<h1>Debug detectado - Acesso negado</h1>';
        window.location.href = 'about:blank';
      }
    }
  };

  // Executar detecção a cada 1 segundo
  setInterval(detectDebugger, 1000);

  // 5. Ofuscar console
  if (typeof console !== 'undefined') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.info = () => {};
    console.debug = () => {};
    console.clear = () => {};
  }

  // 6. Detectar ferramentas de desenvolvimento
  let checkStatus = false;
  
  Object.defineProperty(window, 'console', {
    get: () => {
      checkStatus = true;
      return console;
    },
    set: () => {}
  });

  // 7. Bloquear seleção de texto
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // 8. Bloquear arrastar
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // 9. Detectar extensões de desenvolvedor
  const detectDevExtensions = () => {
    const img = new Image();
    let detected = false;
    
    img.onload = () => {
      detected = true;
    };
    
    img.onerror = () => {
      if (detected) {
        document.body.innerHTML = '<h1>Extensão de desenvolvimento detectada</h1>';
        window.location.href = 'about:blank';
      }
    };
    
    img.src = 'chrome-extension://invalid';
  };

  detectDevExtensions();

  // 10. Anti-tamper - verificar se código foi modificado
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // Log todas as requisições suspeitas
    const input = args[0] as RequestInfo | URL;
    let url = '';
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (typeof Request !== 'undefined' && input instanceof Request) {
      url = input.url;
    }

    if (url.includes('/api/admin') || url.includes('/config') || url.includes('/auth')) {
      console.log('Tentativa de acesso suspeito bloqueada');
      return Promise.reject(new Error('Blocked'));
    }
    
    // Permitir acesso à rota segura de importação
    if (url.includes('/api/secure/import-leads') || url.includes('/api/secure/import-status')) {
      return originalFetch.apply(this, args);
    }
    return originalFetch.apply(this, args);
  };
};
