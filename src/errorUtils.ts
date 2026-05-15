import type { HasilOperasi } from './types';

export function hasilBerhasil<T>(data: T): HasilOperasi<T> {
  return {
    berhasil: true,
    data,
  };
}

export function hasilGagal<T>(pesan: string): HasilOperasi<T> {
  return {
    berhasil: false,
    pesan,
  };
}

export function ambilPesanError(errorTidakDikenal: unknown): string {
  if (errorTidakDikenal instanceof Error) {
    return errorTidakDikenal.message;
  }

  if (typeof errorTidakDikenal === 'string') {
    return errorTidakDikenal;
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
}
