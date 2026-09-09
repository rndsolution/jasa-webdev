(function () {
  const API_BASE = 'https://rndsolution-agent.onrender.com';
  let history = [];
  let isOpen = false;

  // ---------- Styles (animasi & scrollbar custom, tidak bisa full lewat Tailwind CDN) ----------
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    #rnd-agent-panel { transition: opacity .18s ease, transform .18s ease; transform-origin: bottom right; }
    #rnd-agent-panel.rnd-hidden { opacity: 0; transform: scale(.96) translateY(8px); pointer-events: none; }
    #rnd-agent-bubble { transition: transform .15s ease, box-shadow .15s ease; }
    #rnd-agent-bubble:hover { transform: translateY(-2px); }
    #rnd-agent-messages { scrollbar-width: thin; scrollbar-color: #14b8a6 transparent; }
    #rnd-agent-messages::-webkit-scrollbar { width: 6px; }
    #rnd-agent-messages::-webkit-scrollbar-thumb { background: #14b8a6; border-radius: 999px; }
    .rnd-msg { animation: rndFadeIn .2s ease; }
    @keyframes rndFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .rnd-bubble-content p { margin: 0 0 0.6em 0; }
    .rnd-bubble-content p:last-child { margin-bottom: 0; }
    .rnd-bubble-content ul, .rnd-bubble-content ol { margin: 0 0 0.6em 1.1em; padding: 0; }
    .rnd-bubble-content li { margin-bottom: 0.25em; }
    .rnd-bubble-content strong { font-weight: 600; }
    .rnd-bubble-content a { text-decoration: underline; }
    .rnd-typing-dot { animation: rndBounce 1s infinite; display: inline-block; }
    .rnd-typing-dot:nth-child(2) { animation-delay: .15s; }
    .rnd-typing-dot:nth-child(3) { animation-delay: .3s; }
    @keyframes rndBounce { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-3px); opacity: 1; } }
  `;
  document.head.appendChild(styleTag);

  // ---------- Ikon ----------
  const iconChat = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;
  const iconClose = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  // ---------- Markup ----------
  const widgetHTML = `
    <div id="rnd-agent-bubble" class="fixed right-5 z-50 cursor-pointer bg-teal-500 hover:bg-teal-400 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg" style="bottom: 90px;">${iconChat}</div>
    <div id="rnd-agent-panel" class="rnd-hidden fixed right-5 z-50 w-[22rem] max-w-[calc(100vw-2.5rem)] max-h-[70vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 dark:border-neutral-700" style="bottom: 160px;">
      <div class="flex items-center justify-between px-4 py-3 bg-teal-500 text-white">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-300"></span>
          <span class="font-semibold text-sm" style="font-family:'Sora',sans-serif">Tanya RND Solution</span>
        </div>
        <button id="rnd-agent-close" class="text-white/80 hover:text-white transition" aria-label="Tutup chat">${iconClose}</button>
      </div>
      <div id="rnd-agent-messages" class="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm"></div>
      <div class="p-2.5 border-t border-neutral-200 dark:border-neutral-700 flex gap-2 bg-white dark:bg-neutral-900">
        <input id="rnd-agent-input" class="flex-1 border rounded-full px-3.5 py-2 text-sm bg-neutral-50 text-neutral-900 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-neutral-800 dark:text-white dark:border-neutral-600" placeholder="Tulis pesan..." autocomplete="off" />
        <button id="rnd-agent-send" class="bg-teal-500 hover:bg-teal-400 text-white w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition" aria-label="Kirim">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
        </button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const bubble = document.getElementById('rnd-agent-bubble');
  const panel = document.getElementById('rnd-agent-panel');
  const closeBtn = document.getElementById('rnd-agent-close');
  const messagesEl = document.getElementById('rnd-agent-messages');
  const input = document.getElementById('rnd-agent-input');
  const sendBtn = document.getElementById('rnd-agent-send');

  function togglePanel(open) {
    isOpen = open !== undefined ? open : !isOpen;
    panel.classList.toggle('rnd-hidden', !isOpen);
    bubble.innerHTML = isOpen ? iconClose : iconChat;
    if (isOpen && messagesEl.children.length === 0) {
      appendMessage('assistant', 'Halo! Ada yang bisa dibantu soal layanan RND Solution? Ceritakan kebutuhan kamu ya.');
    }
    if (isOpen) setTimeout(() => input.focus(), 150);
  }

  bubble.addEventListener('click', () => togglePanel());
  closeBtn.addEventListener('click', () => togglePanel(false));

  // ---------- Markdown rendering (lazy-load marked + DOMPurify kalau belum ada di halaman) ----------
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const libsReady = (async () => {
    try {
      if (typeof window.marked === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
      }
      if (typeof window.DOMPurify === 'undefined') {
        await loadScript('https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js');
      }
    } catch (e) {
      console.warn('Gagal memuat markdown parser, fallback ke teks biasa.', e);
    }
  })();

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  async function renderAssistantHTML(text) {
    await libsReady;
    if (window.marked && window.DOMPurify) {
      const raw = window.marked.parse(text, { breaks: true });
      return window.DOMPurify.sanitize(raw);
    }
    // fallback: escape + ubah baris ganda jadi paragraf
    return text
      .split(/\n{2,}/)
      .map((p) => `<p>${escapeHTML(p).replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  function appendMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `rnd-msg flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;

    const bubbleEl = document.createElement('div');
    bubbleEl.className =
      role === 'user'
        ? 'max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-teal-500 text-white break-words'
        : 'max-w-[85%] px-3.5 py-2 rounded-2xl rounded-bl-sm bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 break-words rnd-bubble-content';

    if (role === 'user') {
      bubbleEl.innerHTML = escapeHTML(text).replace(/\n/g, '<br>');
    } else {
      bubbleEl.textContent = text; // placeholder, diisi async di bawah kalau perlu markdown
    }

    wrap.appendChild(bubbleEl);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubbleEl;
  }

  function appendTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'rnd-msg flex justify-start';
    wrap.innerHTML = `<div class="px-3.5 py-2.5 rounded-2xl rounded-bl-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300">
      <span class="rnd-typing-dot">●</span> <span class="rnd-typing-dot">●</span> <span class="rnd-typing-dot">●</span>
    </div>`;
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    history.push({ role: 'user', content: text });

    const typingEl = appendTyping();

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typingEl.remove();
      const reply = data.reply || 'Maaf, terjadi kesalahan.';
      const bubbleEl = appendMessage('assistant', reply);
      bubbleEl.innerHTML = await renderAssistantHTML(reply);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typingEl.remove();
      appendMessage('assistant', 'Maaf, terjadi kesalahan koneksi. Coba lagi ya.');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();