export default function AlertBox({ type = 'info', message, onClose }) {
    if (!message) return null;

    const styles = {
        success: 'bg-emerald-50 border-emerald-500 text-emerald-900',
        danger: 'bg-rose-50 border-rose-500 text-rose-900',
        warning: 'bg-amber-50 border-amber-500 text-amber-900',
        info: 'bg-blue-50 border-blue-500 text-blue-900',
    };

    return (
        <div className={`border-l-4 p-4 rounded-xl mb-4 flex items-center justify-between shadow-sm ${styles[type]}`}>
            <div className="font-semibold text-lg">{message}</div>
            {onClose && (
                <button onClick={onClose} className="text-xl font-bold ml-4 opacity-70 hover:opacity-100">
                    ✕
                </button>
            )}
        </div>
    );
}
