export function formatRupiah(number) {
    const clean = String(number || '0').replace(/[.,]/g, '');
    const num = parseInt(clean, 10) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
}

export function formatDateTime(isoString) {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
