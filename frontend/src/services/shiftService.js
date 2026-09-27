export const shiftService = {
  // Ambil shift aktif saat ini dari penyimpanan lokal
  getActiveShift() {
    const shiftStr = localStorage.getItem('wrapping_active_shift');
    if (!shiftStr) return null;
    try {
      return JSON.parse(shiftStr);
    } catch {
      return null;
    }
  },

  // Simpan mulai shift
  startShift(shiftData) {
    const activeShift = {
      ...shiftData,
      startTime: new Date().toISOString(),
      status: 'AKTIF',
    };
    localStorage.setItem('wrapping_active_shift', JSON.stringify(activeShift));
    return activeShift;
  },

  // Selesaikan shift
  endShift() {
    const current = this.getActiveShift();
    if (current) {
      const finishedShift = {
        ...current,
        endTime: new Date().toISOString(),
        status: 'SELESAI',
      };
      localStorage.removeItem('wrapping_active_shift');
      // Simpan ke riwayat lokal shift
      const history = this.getShiftHistory();
      history.unshift(finishedShift);
      localStorage.setItem('wrapping_shift_history', JSON.stringify(history.slice(0, 20)));
      return finishedShift;
    }
    return null;
  },

  // Ambil riwayat shift lokal
  getShiftHistory() {
    const histStr = localStorage.getItem('wrapping_shift_history');
    if (!histStr) return [];
    try {
      return JSON.parse(histStr);
    } catch {
      return [];
    }
  }
};
