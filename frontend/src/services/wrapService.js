import axiosClient from '../api/axiosClient';

export const wrapService = {
  // Ambil daftar harga wrapping berdasarkan kode terminal / cabang
  async getPrices(terminalCode = 'T1') {
    try {
      const res = await axiosClient.post('/grabdata_price', {
        terminal_code: terminalCode,
      });
      return res.data || [];
    } catch (error) {
      console.warn('Gagal ambil harga dari API, gunakan fallback jika perlu:', error);
      // Data fallback jika database belum terisi
      return [
        { id: 1, terminal_code: terminalCode, pack_type: 'WRAP_STD', name: 'Wrapping Standar (Koper Kecil/Sedang)', price: '50,000' },
        { id: 2, terminal_code: terminalCode, pack_type: 'WRAP_JUMBO', name: 'Wrapping Jumbo (Koper Besar/Kardus)', price: '75,000' },
        { id: 3, terminal_code: terminalCode, pack_type: 'STRAP', name: 'Strapping / Tali Pengaman', price: '25,000' },
        { id: 4, terminal_code: terminalCode, pack_type: 'BUBBLE', name: 'Bubble Wrap Tambahan', price: '30,000' },
      ];
    }
  },

  // Simpan transaksi penjualan wrapping
  async submitTransaction(trxData) {
    return await axiosClient.post('/lingga_trx', trxData);
  },

  // Check transaksi
  async checkTransaction(trxData) {
    return await axiosClient.post('/Check_Trx', trxData);
  }
};
