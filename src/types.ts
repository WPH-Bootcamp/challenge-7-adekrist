export type StatusFilter = 'semua' | 'aktif' | 'selesai';

export interface Tugas {
  id: string;
  judul: string;
  selesai: boolean;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface DataPenyimpanan {
  versi: number;
  daftarTugas: Tugas[];
}

export type HasilOperasi<T> =
  | {
      berhasil: true;
      data: T;
    }
  | {
      berhasil: false;
      pesan: string;
    };

export interface RingkasanTugas {
  total: number;
  aktif: number;
  selesai: number;
}

export interface ElemenAplikasi {
  formulirTugas: HTMLFormElement;
  inputJudul: HTMLInputElement;
  daftarTugas: HTMLUListElement;
  pesanError: HTMLParagraphElement;
  ringkasan: HTMLParagraphElement;
  tombolFilter: HTMLButtonElement[];
}
