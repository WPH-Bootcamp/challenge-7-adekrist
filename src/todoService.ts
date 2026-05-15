import type {
  HasilOperasi,
  RingkasanTugas,
  StatusFilter,
  Tugas,
} from './types';
import { hasilBerhasil, hasilGagal } from './errorUtils';
import { bacaDaftarTugas, simpanDaftarTugas } from './storage';
import { bersihkanJudul, validasiJudul } from './validators';

function buatIdUnik(): string {
  return crypto.randomUUID();
}

function buatWaktuSekarang(): string {
  return new Date().toISOString();
}

export function ambilSemuaTugas(): HasilOperasi<Tugas[]> {
  return bacaDaftarTugas();
}

export function tambahTugas(judul: string): HasilOperasi<Tugas[]> {
  const pesanValidasi = validasiJudul(judul);

  if (pesanValidasi !== null) {
    return hasilGagal(pesanValidasi);
  }

  const hasilBaca = bacaDaftarTugas();

  if (!hasilBaca.berhasil) {
    return hasilBaca;
  }

  const waktuSekarang = buatWaktuSekarang();

  const tugasBaru: Tugas = {
    id: buatIdUnik(),
    judul: bersihkanJudul(judul),
    selesai: false,
    dibuatPada: waktuSekarang,
    diperbaruiPada: waktuSekarang,
  };

  const daftarTugasTerbaru = [...hasilBaca.data, tugasBaru];

  return simpanDaftarTugas(daftarTugasTerbaru);
}

export function ubahStatusTugas(idTugas: string): HasilOperasi<Tugas[]> {
  const hasilBaca = bacaDaftarTugas();

  if (!hasilBaca.berhasil) {
    return hasilBaca;
  }

  const daftarTugas = hasilBaca.data;
  const tugasDitemukan = daftarTugas.some((tugas) => tugas.id === idTugas);

  if (!tugasDitemukan) {
    return hasilGagal('Tugas tidak ditemukan.');
  }

  const waktuSekarang = buatWaktuSekarang();

  const daftarTugasTerbaru = daftarTugas.map((tugas) => {
    if (tugas.id !== idTugas) {
      return tugas;
    }

    return {
      ...tugas,
      selesai: !tugas.selesai,
      diperbaruiPada: waktuSekarang,
    };
  });

  return simpanDaftarTugas(daftarTugasTerbaru);
}

export function hapusTugas(idTugas: string): HasilOperasi<Tugas[]> {
  const hasilBaca = bacaDaftarTugas();

  if (!hasilBaca.berhasil) {
    return hasilBaca;
  }

  const daftarTugas = hasilBaca.data;
  const tugasDitemukan = daftarTugas.some((tugas) => tugas.id === idTugas);

  if (!tugasDitemukan) {
    return hasilGagal('Tugas tidak ditemukan.');
  }

  const daftarTugasTerbaru = daftarTugas.filter(
    (tugas) => tugas.id !== idTugas
  );

  return simpanDaftarTugas(daftarTugasTerbaru);
}

export function filterDaftarTugas(
  daftarTugas: Tugas[],
  statusFilter: StatusFilter
): Tugas[] {
  if (statusFilter === 'aktif') {
    return daftarTugas.filter((tugas) => !tugas.selesai);
  }

  if (statusFilter === 'selesai') {
    return daftarTugas.filter((tugas) => tugas.selesai);
  }

  return daftarTugas;
}

export function hitungRingkasan(daftarTugas: Tugas[]): RingkasanTugas {
  const selesai = daftarTugas.filter((tugas) => tugas.selesai).length;
  const total = daftarTugas.length;

  return {
    total,
    aktif: total - selesai,
    selesai,
  };
}
