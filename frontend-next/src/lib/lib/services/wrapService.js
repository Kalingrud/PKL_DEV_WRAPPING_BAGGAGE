import apiClient from '@/lib/axios';

export const wrapService = {
    // Ambil harga berdasarkan kode cabang/terminal (contoh: T1, T2, T3)
    async getPrices(terminalCode = 'T1') {  //untuk mengambil harga berdasarkan kode cabang/terminal
        try {  //untuk menangkap eror jika tidak ada data yang di isi
            const res = await apiClient.post('/grabdata_price', { terminal_code: terminalCode }); //untuk mengirim data ke terminal code
            return res.data || []; //mengembalikan data jika data ada
        } catch {  //jika tidak ada data akan mengembalikan info dibawah
            // Fallback data jika tabel belum diisi
            return [
                { id: 1, terminal_code: terminalCode, pack_type: 'WRAP_STD', name: 'Wrapping Standar', price: '50,000' },
                { id: 2, terminal_code: terminalCode, pack_type: 'WRAP_JUMBO', name: 'Wrapping Jumbo', price: '75,000' },
                { id: 3, terminal_code: terminalCode, pack_type: 'STRAP', name: 'Strapping / Tali', price: '25,000' },
                { id: 4, terminal_code: terminalCode, pack_type: 'BUBBLE', name: 'Bubble Wrap Tambahan', price: '30,000' },
            ];
        }
    },

    // Simpan transaksi penjualan
    async submitTransaction(trxPayload) {
        return await apiClient.post('/lingga_trx', trxPayload);
    },

    // Cek validasi QR / Trx
    async checkTrx(data) {
        return await apiClient.post('/Check_Trx', data);
    }
};
