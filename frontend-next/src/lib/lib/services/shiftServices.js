//manajemen shift sesi
export const shiftService = {
    getActiveShift() {
        if (typeof window === 'undefined') return null;  //berfungsi untuk mengembalikan retunr null jika 
        const s = localStorage.getItem('wrapping_active_shift');
        return s ? JSON.parse(s) : null;
    },
    startShift(data) {
        const shift = { ...data, startTime: new Date().toISOString(), status: 'AKTIF' };
        localStorage.setItem('wrapping_active_shift', JSON.stringify(shift));
        return shift;
    },
    endShift() {
        const current = this.getActiveShift();
        if (!current) return null;
        const finished = { ...current, endTime: new Date().toISOString(), status: 'SELESAI' };
        localStorage.removeItem('wrapping_active_shift');

        // Simpan ke riwayat
        const history = this.getShiftHistory();
        history.unshift(finished);
        localStorage.setItem('wrapping_shift_history', JSON.stringify(history.slice(0, 30)));
        return finished;
    },
    getShiftHistory() {
        if (typeof window === 'undefined') return [];
        const h = localStorage.getItem('wrapping_shift_history');
        return h ? JSON.parse(h) : [];
    }
};
