(function () {
  const API_BASE = 'https://rndsolution-agent.onrender.com';
  let history = [];
  let isOpen = false;

  // ---- Token warna diambil persis dari tailwind.config situs rndsolution.id ----
  const C = {
    bg: '#0B0F19',
    surface: '#131826',
    text: '#F5F5F7',
    muted: '#9CA3AF',
    accent: '#6EE7B7',
  };

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    #rnd-agent-bubble, #rnd-agent-panel, #rnd-agent-panel * { box-sizing: border-box; }

    #rnd-agent-bubble {
      position: fixed; right: 20px; bottom: 90px; z-index: 9999;
      width: 54px; height: 54px; border-radius: 999px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: ${C.accent}; color: ${C.bg};
      border: 1px solid rgba(110,231,183,.55);
      box-shadow: 0 8px 30px rgba(110,231,183,.25), 0 2px 8px rgba(0,0,0,.4);
      transition: transform .16s ease, box-shadow .16s ease;
    }
    #rnd-agent-bubble:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(110,231,183,.35); }

    #rnd-agent-panel {
      position: fixed; right: 20px; bottom: 156px; z-index: 9999;
      width: 360px; max-width: calc(100vw - 40px); height: 520px; max-height: calc(100vh - 190px);
      display: flex; flex-direction: column; overflow: hidden;
      background: ${C.bg}; color: ${C.text};
      border: 1px solid rgba(255,255,255,.10); border-radius: 16px;
      box-shadow: 0 24px 60px rgba(0,0,0,.55);
      transition: opacity .18s ease, transform .18s ease;
      transform-origin: bottom right;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    }
    #rnd-agent-panel.rnd-hidden { opacity: 0; transform: scale(.96) translateY(10px); pointer-events: none; }

    .rnd-head {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 14px 16px; background: ${C.surface};
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .rnd-head-title { font-family: 'Sora', sans-serif; font-weight: 600; font-size: 14px; color: ${C.text}; line-height: 1.2; }
    .rnd-head-sub {
      font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .04em;
      color: ${C.accent}; text-transform: uppercase; margin-top: 3px;
      display: flex; align-items: center; gap: 6px;
    }
    .rnd-dot { width: 6px; height: 6px; border-radius: 999px; background: ${C.accent}; box-shadow: 0 0 0 3px rgba(110,231,183,.18); }
    .rnd-close { background: none; border: none; color: ${C.muted}; cursor: pointer; padding: 4px; display: flex; border-radius: 6px; transition: color .15s, background .15s; }
    .rnd-close:hover { color: ${C.text}; background: rgba(255,255,255,.06); }

    #rnd-agent-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      font-size: 13.5px; line-height: 1.6;
      scrollbar-width: thin; scrollbar-color: rgba(110,231,183,.4) transparent;
    }
    #rnd-agent-messages::-webkit-scrollbar { width: 6px; }
    #rnd-agent-messages::-webkit-scrollbar-thumb { background: rgba(110,231,183,.35); border-radius: 999px; }

    .rnd-row { display: flex; animation: rndIn .22s ease; }
    .rnd-row.user { justify-content: flex-end; }
    .rnd-row.bot { justify-content: flex-start; }
    @keyframes rndIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

    .rnd-bub { max-width: 86%; padding: 10px 13px; word-wrap: break-word; overflow-wrap: anywhere; }
    .rnd-bub.user {
      background: ${C.accent}; color: ${C.bg}; font-weight: 500;
      border-radius: 14px 14px 4px 14px;
    }
    .rnd-bub.bot {
      background: ${C.surface}; color: ${C.text};
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px 14px 14px 4px;
    }
    .rnd-bub.bot p { margin: 0 0 .7em 0; }
    .rnd-bub.bot p:last-child { margin-bottom: 0; }
    .rnd-bub.bot ul, .rnd-bub.bot ol { margin: 0 0 .7em 0; padding-left: 1.15em; }
    .rnd-bub.bot ul:last-child, .rnd-bub.bot ol:last-child { margin-bottom: 0; }
    .rnd-bub.bot li { margin-bottom: .3em; }
    .rnd-bub.bot li::marker { color: ${C.accent}; }
    .rnd-bub.bot strong { color: ${C.accent}; font-weight: 600; }
    .rnd-bub.bot a { color: ${C.accent}; text-decoration: underline; text-underline-offset: 2px; }
    .rnd-bub.bot code {
      font-family: 'JetBrains Mono', monospace; font-size: .88em;
      background: rgba(255,255,255,.07); padding: 1px 5px; border-radius: 4px; color: ${C.accent};
    }
    .rnd-bub.bot h1, .rnd-bub.bot h2, .rnd-bub.bot h3 {
      font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 600; margin: 0 0 .5em 0; color: ${C.text};
    }

    .rnd-typing { display: flex; gap: 4px; padding: 12px 14px; background: ${C.surface}; border: 1px solid rgba(255,255,255,.08); border-radius: 14px 14px 14px 4px; }
    .rnd-typing span { width: 6px; height: 6px; border-radius: 999px; background: ${C.muted}; animation: rndBounce 1.1s infinite; }
    .rnd-typing span:nth-child(2) { animation-delay: .15s; }
    .rnd-typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes rndBounce { 0%,60%,100% { transform: translateY(0); opacity: .45; } 30% { transform: translateY(-4px); opacity: 1; } }

    .rnd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
    .rnd-chip {
      font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
      padding: 6px 10px; border-radius: 999px; cursor: pointer;
      background: rgba(110,231,183,.10); color: ${C.accent};
      border: 1px solid rgba(110,231,183,.35);
      transition: background .15s, transform .15s;
    }
    .rnd-chip:hover { background: rgba(110,231,183,.2); transform: translateY(-1px); }

    .rnd-foot {
      padding: 12px; border-top: 1px solid rgba(255,255,255,.08);
      background: ${C.surface}; display: flex; gap: 8px; align-items: center;
    }
    #rnd-agent-input {
      flex: 1; min-width: 0; padding: 10px 14px; font-size: 13px;
      background: ${C.bg}; color: ${C.text};
      border: 1px solid rgba(255,255,255,.12); border-radius: 999px; outline: none;
      font-family: system-ui, -apple-system, sans-serif;
      transition: border-color .15s, box-shadow .15s;
    }
    #rnd-agent-input::placeholder { color: ${C.muted}; }
    #rnd-agent-input:focus { border-color: ${C.accent}; box-shadow: 0 0 0 3px rgba(110,231,183,.15); }
    #rnd-agent-send {
      flex-shrink: 0; width: 38px; height: 38px; border-radius: 999px; border: none; cursor: pointer;
      background: ${C.accent}; color: ${C.bg};
      display: flex; align-items: center; justify-content: center;
      transition: transform .15s, opacity .15s;
    }
    #rnd-agent-send:hover { transform: scale(1.06); }
    #rnd-agent-send:disabled { opacity: .45; cursor: not-allowed; transform: none; }

    @media (max-width: 420px) {
      #rnd-agent-panel { right: 12px; left: 12px; width: auto; bottom: 150px; height: 62vh; }
      #rnd-agent-bubble { right: 16px; }
    }
  `;
  document.head.appendChild(styleTag);

  const iconChat = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="23" height="23"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
  const iconClose = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="21" height="21"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const iconSend = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>`;

  const widgetHTML = `
    <div id="rnd-agent-bubble" role="button" aria-label="Buka chat">${iconChat}</div>
    <div id="rnd-agent-panel" class="rnd-hidden" role="dialog" aria-label="Chat RND Solution">
      <div class="rnd-head">
        <div>
          <div class="rnd-head-title">Tanya RND Solution</div>
          <div class="rnd-head-sub"><span class="rnd-dot"></span>online · balas cepat</div>
        </div>
        <button class="rnd-close" id="rnd-agent-close" aria-label="Tutup chat">${iconClose}</button>
      </div>
      <div id="rnd-agent-messages"></div>
      <div class="rnd-foot">
        <input id="rnd-agent-input" placeholder="Tulis kebutuhan kamu..." autocomplete="off" />
        <button id="rnd-agent-send" aria-label="Kirim pesan">${iconSend}</button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const bubble = document.getElementById('rnd-agent-bubble');
  const panel = document.getElementById('rnd-agent-panel');
  const closeBtn = document.getElementById('rnd-agent-close');
  const messagesEl = document.getElementById('rnd-agent-messages');
  const input = document.getElementById('rnd-agent-input');
  const sendBtn = document.getElementById('rnd-agent-send');

  // ---------- markdown loader ----------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const libsReady = (async () => {
    try {
      if (typeof window.marked === 'undefined') await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
      if (typeof window.DOMPurify === 'undefined') await loadScript('https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js');
    } catch (e) { console.warn('Markdown parser gagal dimuat, pakai teks biasa.', e); }
  })();

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  async function toHTML(text) {
    await libsReady;
    if (window.marked && window.DOMPurify) {
      return window.DOMPurify.sanitize(window.marked.parse(text, { breaks: true }));
    }
    return text.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  }

  function addRow(role) {
    const row = document.createElement('div');
    row.className = `rnd-row ${role === 'user' ? 'user' : 'bot'}`;
    const bub = document.createElement('div');
    bub.className = `rnd-bub ${role === 'user' ? 'user' : 'bot'}`;
    row.appendChild(bub);
    messagesEl.appendChild(row);
    scrollDown();
    return bub;
  }
  const scrollDown = () => { messagesEl.scrollTop = messagesEl.scrollHeight; };

  function addTyping() {
    const row = document.createElement('div');
    row.className = 'rnd-row bot';
    row.innerHTML = `<div class="rnd-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(row);
    scrollDown();
    return row;
  }

  function showGreeting() {
    const bub = addRow('assistant');
    bub.innerHTML =
      `<p>Halo. Saya asisten RND Solution — bantu cari solusi digital yang pas buat usaha kamu.</p>` +
      `<p>Ceritakan kebutuhanmu, atau pilih salah satu di bawah ini:</p>` +
      `<div class="rnd-chips">
         <button class="rnd-chip" data-q="Saya butuh website bisnis atau landing page">Website &amp; Landing Page</button>
         <button class="rnd-chip" data-q="Saya butuh aplikasi Android untuk operasional usaha, seperti kasir atau pembukuan">Aplikasi Android</button>
         <button class="rnd-chip" data-q="Saya butuh sistem atau aplikasi custom sesuai alur kerja bisnis saya">Sistem Custom</button>
         <button class="rnd-chip" data-q="Saya butuh bantuan deployment dan setup custom domain">Deploy &amp; Domain</button>
         <button class="rnd-chip" data-q="Berapa estimasi biaya dan lama pengerjaannya?">Biaya &amp; Estimasi</button>
       </div>`;
    bub.querySelectorAll('.rnd-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.q;
        sendMessage();
      });
    });
  }

  function togglePanel(open) {
    isOpen = open === undefined ? !isOpen : open;
    panel.classList.toggle('rnd-hidden', !isOpen);
    bubble.innerHTML = isOpen ? iconClose : iconChat;
    bubble.setAttribute('aria-label', isOpen ? 'Tutup chat' : 'Buka chat');
    if (isOpen) {
      if (messagesEl.children.length === 0) showGreeting();
      setTimeout(() => input.focus(), 160);
    }
  }

  bubble.addEventListener('click', () => togglePanel());
  closeBtn.addEventListener('click', () => togglePanel(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) togglePanel(false); });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

    addRow('user').innerHTML = esc(text).replace(/\n/g, '<br>');
    history.push({ role: 'user', content: text });

    const typing = addTyping();
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typing.remove();
      const reply = data.reply || 'Maaf, terjadi kesalahan.';
      const bub = addRow('assistant');
      bub.innerHTML = await toHTML(reply);
      scrollDown();
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.remove();
      addRow('assistant').innerHTML = '<p>Maaf, koneksi sedang bermasalah. Coba kirim ulang pesannya ya.</p>';
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
})();