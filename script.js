function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return;
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
  });
}
window.initMobileMenu = initMobileMenu;

// Update nomor WA & email otomatis dari CMS (hanya berlaku di halaman yang punya elemen ini)

fetch(`/api/settings/kontak?t=${Date.now()}`)
  .then(res => res.ok ? res.json() : null)
  .then(kontak => {
    if (!kontak) return;
    document.querySelectorAll('.js-wa-link').forEach(el => {
      el.href = `https://wa.me/${kontak.whatsapp}`;
    });
    document.querySelectorAll('.js-email-link').forEach(el => {
      el.href = `mailto:${kontak.email}`;
    });
  });
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.innerHTML = '<p class="text-accent text-center font-semibold">✅ Pesan terkirim! Kami akan segera menghubungi kamu.</p>';
    } else {
      alert('Terjadi kesalahan, coba lagi atau hubungi lewat WhatsApp.');
    }
  } catch (error) {
    alert('Terjadi kesalahan koneksi, coba lagi atau hubungi lewat WhatsApp.');
  }

  return false;
}
window.handleSubmit = handleSubmit;
