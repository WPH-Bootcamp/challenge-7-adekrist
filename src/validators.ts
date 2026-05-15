import type { DataPenyimpanan, StatusFilter, Tugas } from './types';

export function adalahObjek(nilai: unknown): nilai is Record<string, unknown> {
  return typeof nilai === 'object' && nilai !== null && !Array.isArray(nilai);
}

export function adalahTugas(nilai: unknown): nilai is Tugas {
  if (!adalahObjek(nilai)) {
    return false;
  }

  return (
    typeof nilai.id === 'string' &&
    typeof nilai.judul === 'string' &&
    typeof nilai.selesai === 'boolean' &&
    typeof nilai.dibuatPada === 'string' &&
    typeof nilai.diperbaruiPada === 'string'
  );
}

export function adalahDaftarTugas(nilai: unknown): nilai is Tugas[] {
  return Array.isArray(nilai) && nilai.every(adalahTugas);
}

export function adalahDataPenyimpanan(
  nilai: unknown
): nilai is DataPenyimpanan {
  if (!adalahObjek(nilai)) {
    return false;
  }

  return (
    typeof nilai.versi === 'number' && adalahDaftarTugas(nilai.daftarTugas)
  );
}

export function adalahStatusFilter(nilai: string): nilai is StatusFilter {
  return nilai === 'semua' || nilai === 'aktif' || nilai === 'selesai';
}

export function bersihkanJudul(judul: string): string {
  return judul.trim().replace(/\s+/g, ' ');
}

export function validasiJudul(judul: string): string | null {
  const judulBersih = bersihkanJudul(judul);

  if (judulBersih.length === 0) {
    return 'Judul tugas tidak boleh kosong.';
  }

  if (judulBersih.length < 3) {
    return 'Judul tugas minimal 3 karakter.';
  }

  if (judulBersih.length > 80) {
    return 'Judul tugas maksimal 80 karakter.';
  }

  return null;
}
