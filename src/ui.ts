import type {
  ElemenAplikasi,
  HasilOperasi,
  StatusFilter,
  Tugas,
} from './types';
import {
  ambilSemuaTugas,
  filterDaftarTugas,
  hapusTugas,
  hitungRingkasan,
  tambahTugas,
  ubahStatusTugas,
} from './todoService';
import { adalahStatusFilter } from './validators';

let statusFilterAktif: StatusFilter = 'semua';

function ambilElemenWajib<T extends HTMLElement>(
  pemilih: string,
  jenisElemen: new () => T
): T {
  const elemen = document.querySelector(pemilih);

  if (!(elemen instanceof jenisElemen)) {
    throw new Error(`Elemen ${pemilih} tidak ditemukan atau tidak valid.`);
  }

  return elemen;
}

function ambilElemenAplikasi(): ElemenAplikasi {
  return {
    formulirTugas: ambilElemenWajib('#formulir-tugas', HTMLFormElement),
    inputJudul: ambilElemenWajib('#input-judul', HTMLInputElement),
    daftarTugas: ambilElemenWajib('#daftar-tugas', HTMLUListElement),
    pesanError: ambilElemenWajib('#pesan-error', HTMLParagraphElement),
    ringkasan: ambilElemenWajib('#ringkasan', HTMLParagraphElement),
    tombolFilter: Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-filter]')
    ),
  };
}

function tampilkanPesanError(
  elemenAplikasi: ElemenAplikasi,
  pesan: string
): void {
  elemenAplikasi.pesanError.textContent = pesan;
}

function bersihkanPesanError(elemenAplikasi: ElemenAplikasi): void {
  elemenAplikasi.pesanError.textContent = '';
}

function formatTanggal(nilaiTanggal: string): string {
  const tanggal = new Date(nilaiTanggal);

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(tanggal);
}

function buatElemenTugas(
  tugas: Tugas,
  elemenAplikasi: ElemenAplikasi
): HTMLLIElement {
  const itemTugas = document.createElement('li');
  itemTugas.className = tugas.selesai ? 'item-tugas selesai' : 'item-tugas';

  const bagianKonten = document.createElement('div');
  bagianKonten.className = 'konten-tugas';

  const checkboxTugas = document.createElement('input');
  checkboxTugas.type = 'checkbox';
  checkboxTugas.checked = tugas.selesai;
  checkboxTugas.setAttribute('aria-label', `Ubah status ${tugas.judul}`);

  const teksTugas = document.createElement('div');

  const judulTugas = document.createElement('strong');
  judulTugas.textContent = tugas.judul;

  const infoTugas = document.createElement('small');
  infoTugas.textContent = `Dibuat: ${formatTanggal(tugas.dibuatPada)}`;

  teksTugas.append(judulTugas, infoTugas);
  bagianKonten.append(checkboxTugas, teksTugas);

  const tombolHapus = document.createElement('button');
  tombolHapus.type = 'button';
  tombolHapus.className = 'tombol-hapus';
  tombolHapus.textContent = 'Hapus';
  tombolHapus.setAttribute('aria-label', `Hapus ${tugas.judul}`);

  checkboxTugas.addEventListener('change', () => {
    prosesHasilOperasi(ubahStatusTugas(tugas.id), elemenAplikasi);
  });

  tombolHapus.addEventListener('click', () => {
    prosesHasilOperasi(hapusTugas(tugas.id), elemenAplikasi);
  });

  itemTugas.append(bagianKonten, tombolHapus);

  return itemTugas;
}

function tampilkanDaftarTugas(
  daftarTugas: Tugas[],
  elemenAplikasi: ElemenAplikasi
): void {
  elemenAplikasi.daftarTugas.innerHTML = '';

  const daftarTugasTampil = filterDaftarTugas(daftarTugas, statusFilterAktif);

  if (daftarTugasTampil.length === 0) {
    const itemKosong = document.createElement('li');
    itemKosong.className = 'item-kosong';
    itemKosong.textContent = 'Belum ada tugas pada filter ini.';
    elemenAplikasi.daftarTugas.append(itemKosong);
    return;
  }

  const fragmen = document.createDocumentFragment();

  daftarTugasTampil.forEach((tugas) => {
    fragmen.append(buatElemenTugas(tugas, elemenAplikasi));
  });

  elemenAplikasi.daftarTugas.append(fragmen);
}

function tampilkanRingkasan(
  daftarTugas: Tugas[],
  elemenAplikasi: ElemenAplikasi
): void {
  const ringkasan = hitungRingkasan(daftarTugas);

  elemenAplikasi.ringkasan.textContent = `Total: ${ringkasan.total} | Aktif: ${ringkasan.aktif} | Selesai: ${ringkasan.selesai}`;
}

function perbaruiTombolFilter(elemenAplikasi: ElemenAplikasi): void {
  elemenAplikasi.tombolFilter.forEach((tombol) => {
    const nilaiFilter = tombol.dataset.filter;

    tombol.classList.toggle('aktif', nilaiFilter === statusFilterAktif);
  });
}

function renderAplikasi(
  daftarTugas: Tugas[],
  elemenAplikasi: ElemenAplikasi
): void {
  tampilkanDaftarTugas(daftarTugas, elemenAplikasi);
  tampilkanRingkasan(daftarTugas, elemenAplikasi);
  perbaruiTombolFilter(elemenAplikasi);
}

function prosesHasilOperasi(
  hasilOperasi: HasilOperasi<Tugas[]>,
  elemenAplikasi: ElemenAplikasi
): void {
  if (!hasilOperasi.berhasil) {
    tampilkanPesanError(elemenAplikasi, hasilOperasi.pesan);
    return;
  }

  bersihkanPesanError(elemenAplikasi);
  renderAplikasi(hasilOperasi.data, elemenAplikasi);
}

function pasangEventFormulir(elemenAplikasi: ElemenAplikasi): void {
  elemenAplikasi.formulirTugas.addEventListener('submit', (kejadian) => {
    kejadian.preventDefault();

    const judul = elemenAplikasi.inputJudul.value;
    const hasilTambah = tambahTugas(judul);

    if (hasilTambah.berhasil) {
      elemenAplikasi.inputJudul.value = '';
      elemenAplikasi.inputJudul.focus();
    }

    prosesHasilOperasi(hasilTambah, elemenAplikasi);
  });
}

function pasangEventFilter(elemenAplikasi: ElemenAplikasi): void {
  elemenAplikasi.tombolFilter.forEach((tombol) => {
    tombol.addEventListener('click', () => {
      const nilaiFilter = tombol.dataset.filter;

      if (typeof nilaiFilter !== 'string' || !adalahStatusFilter(nilaiFilter)) {
        tampilkanPesanError(elemenAplikasi, 'Filter tidak valid.');
        return;
      }

      statusFilterAktif = nilaiFilter;
      prosesHasilOperasi(ambilSemuaTugas(), elemenAplikasi);
    });
  });
}

export function jalankanAplikasi(): void {
  const elemenAplikasi = ambilElemenAplikasi();

  pasangEventFormulir(elemenAplikasi);
  pasangEventFilter(elemenAplikasi);

  prosesHasilOperasi(ambilSemuaTugas(), elemenAplikasi);
}
