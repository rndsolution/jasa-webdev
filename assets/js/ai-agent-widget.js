(function () {
  const API_BASE = 'https://rndsolution-agent.onrender.com'; // sementara untuk testing lokal — nanti diganti setelah deploy
  let history = [];

  const widgetHTML = `
    <div id="rnd-agent-bubble" class="fixed right-5 z-50 cursor-pointer bg-teal-500 hover:bg-teal-400 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl" style="bottom: 90px;">💬</div>
    <div id="rnd-agent-panel" class="fixed right-5 z-50 hidden w-80 max-h-[70vh] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl flex flex-col overflow-hidden" style="bottom: 160px;">
      <div class="p-3 bg-teal-500 text-white font-semibold" style="font-family:'Sora',sans-serif">Tanya RND Solution</div>
      <div id="rnd-agent-messages" class="flex-1 overflow-y-auto p-3 space-y-2 text-sm"></div>
      <div class="p-2 border-t flex gap-2">
        <input id="rnd-agent-input" class="flex-1 border rounded px-2 py-1 text-sm bg-white text-neutral-900 border-neutral-300 dark:bg-neutral-800 dark:text-white dark:border-neutral-600" style="font-family:'JetBrains Mono',monospace" placeholder="Tulis pesan..." />
        <button id="rnd-agent-send" class="bg-teal-500 text-white px-3 rounded text-sm">Kirim</button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const bubble = document.getElementById('rnd-agent-bubble');
  const panel = document.getElementById('rnd-agent-panel');
  const messagesEl = document.getElementById('rnd-agent-messages');
  const input = document.getElementById('rnd-agent-input');
  const sendBtn = document.getElementById('rnd-agent-send');

  bubble.addEventListener('click', () => panel.classList.toggle('hidden'));

  function appendMessage(role, text) {
  const el = document.createElement('div');
  el.className = role === 'user' ? 'text-right' : 'text-left';
  el.innerHTML = `<span class="inline-block px-3 py-1.5 rounded-lg ${role === 'user' ? 'bg-teal-500 text-white' : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'}">${text}</span>`;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage('user', text);
    history.push({ role: 'user', content: text });

    appendMessage('assistant', '...'); // indikator loading sederhana
    const loadingEl = messagesEl.lastElementChild;

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      loadingEl.remove();
      appendMessage('assistant', data.reply || 'Maaf, terjadi kesalahan.');
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      loadingEl.remove();
      appendMessage('assistant', 'Maaf, terjadi kesalahan koneksi. Coba lagi ya.');
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
})();