import type { DataPenyimpanan, HasilOperasi, Tugas } from './types';
import { ambilPesanError, hasilBerhasil, hasilGagal } from './errorUtils';
import { adalahDataPenyimpanan } from './validators';

const KUNCI_PENYIMPANAN = 'todo-app-typescript-browser';
const VERSI_PENYIMPANAN = 1;

function buatDataKosong(): DataPenyimpanan {
  return {
    versi: VERSI_PENYIMPANAN,
    daftarTugas: [],
  };
}

export function bacaDaftarTugas(): HasilOperasi<Tugas[]> {
  try {
    const dataMentah = localStorage.getItem(KUNCI_PENYIMPANAN);

    if (dataMentah === null) {
      const dataKosong = buatDataKosong();
      localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(dataKosong));
      return hasilBerhasil(dataKosong.daftarTugas);
    }

    const dataHasilParse: unknown = JSON.parse(dataMentah);

    if (!adalahDataPenyimpanan(dataHasilParse)) {
      return hasilGagal(
        'Format data di localStorage tidak valid. Data tidak dapat digunakan.'
      );
    }

    return hasilBerhasil(dataHasilParse.daftarTugas);
  } catch (errorTidakDikenal: unknown) {
    return hasilGagal(
      `Gagal membaca data dari localStorage: ${ambilPesanError(errorTidakDikenal)}`
    );
  }
}

export function simpanDaftarTugas(daftarTugas: Tugas[]): HasilOperasi<Tugas[]> {
  try {
    const dataPenyimpanan: DataPenyimpanan = {
      versi: VERSI_PENYIMPANAN,
      daftarTugas,
    };

    localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(dataPenyimpanan));

    return hasilBerhasil(daftarTugas);
  } catch (errorTidakDikenal: unknown) {
    return hasilGagal(
      `Gagal menyimpan data ke localStorage: ${ambilPesanError(errorTidakDikenal)}`
    );
  }
}
