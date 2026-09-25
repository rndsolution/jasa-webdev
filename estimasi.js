const REPO = "dongengkids-wq/jasa-webdev";
const BRANCH = "main";

let selectedJenis = null;
let selectedBase = 0;
let selectedNamaJenis = '';
let waNumber = '62812xxxxxxx';

const jenisContainer = document.getElementById('jenisProject');
const fiturContainer = document.getElementById('fiturList');
const hasilHarga = document.getElementById('hasilHarga');
const ctaWhatsapp = document.getElementById('ctaWhatsapp');

function formatRupiah(angka) {
  return 'Rp' + angka.toLocaleString('id-ID');
}

async function fetchJSON(path) {
  try {
	    const res = await fetch(`/api/${path}?t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

function skeletonJenis() {
  return Array(3).fill(0).map(() => `<div class="p-4 rounded-xl border border-white/10 animate-pulse h-20 bg-white/5"></div>`).join('');
}

function skeletonFitur() {
  return Array(4).fill(0).map(() => `<div class="p-4 rounded-xl border border-white/10 animate-pulse h-12 bg-white/5"></div>`).join('');
}

function renderJenisProject(list) {
  jenisContainer.innerHTML = list.map(item => `
    <button type="button" class="jenis-btn text-left p-4 rounded-xl border border-white/10 hover:border-accent/40 transition-colors"
      data-slug="${item.slug}" data-base="${item.harga_dasar}" data-nama="${item.nama}">
      <p class="font-semibold text-sm mb-1">${item.nama}</p>
      <p class="text-muted text-xs">${item.deskripsi || ''}</p>
    </button>
  `).join('');

  document.querySelectorAll('.jenis-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.jenis-btn').forEach(b => b.classList.remove('border-accent', 'bg-accent/10'));
      btn.classList.add('border-accent', 'bg-accent/10');
      selectedJenis = btn.dataset.slug;
      selectedBase = parseInt(btn.dataset.base);
      selectedNamaJenis = btn.dataset.nama;
      hitungTotal();
    });
  });
}

function renderFiturTambahan(list) {
  fiturContainer.innerHTML = list.map(item => `
    <label class="flex items-center justify-between p-4 rounded-xl border border-white/10 cursor-pointer hover:border-accent/40 transition-colors">
      <span class="text-sm">${item.nama}</span>
      <input type="checkbox" class="fitur-check" data-harga="${item.harga}" data-nama="${item.nama}">
    </label>
  `).join('');

  document.querySelectorAll('.fitur-check').forEach(check => {
    check.addEventListener('change', hitungTotal);
  });
}

function hitungTotal() {
  if (!selectedJenis) {
    hasilHarga.textContent = 'Pilih jenis project dulu';
    return;
  }

  let total = selectedBase;
  let fiturDipilih = [];

  document.querySelectorAll('.fitur-check').forEach(check => {
    if (check.checked) {
      total += parseInt(check.dataset.harga);
      fiturDipilih.push(check.dataset.nama);
    }
  });

  const totalMin = total;
  const totalMax = Math.round(total * 1.3);

  hasilHarga.textContent = `${formatRupiah(totalMin)} - ${formatRupiah(totalMax)}`;

  const pesan = `Halo, saya tertarik dengan ${selectedNamaJenis}` +
    (fiturDipilih.length ? ` dengan fitur tambahan: ${fiturDipilih.join(', ')}` : '') +
    `. Estimasi yang saya lihat di website: ${formatRupiah(totalMin)} - ${formatRupiah(totalMax)}. Boleh info lebih lanjut?`;

  ctaWhatsapp.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(pesan)}`;
}

async function init() {
  jenisContainer.innerHTML = skeletonJenis();
  fiturContainer.innerHTML = skeletonFitur();

    const kalkulator = await fetchJSON('kalkulator');
  const kontak = await fetchJSON('settings/kontak');

  if (kontak && kontak.whatsapp) waNumber = kontak.whatsapp;

  if (kalkulator) {
    renderJenisProject(kalkulator.jenis_project || []);
    renderFiturTambahan(kalkulator.fitur_tambahan || []);
  } else {
    jenisContainer.innerHTML = '<p class="text-muted text-sm">Data belum tersedia.</p>';
  }
}

init();
