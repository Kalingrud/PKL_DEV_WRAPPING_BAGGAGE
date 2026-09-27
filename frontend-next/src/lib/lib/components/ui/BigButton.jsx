export default function BigButton({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary | success | danger | warning | outline
    size = 'lg',        // md | lg | xl
    disabled = false,
    fullWidth = false,
    className = '',
}) {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-150 active:scale-95 shadow-md disabled:opacity-50 disabled:pointer-events-none gap-3';

    const sizeStyles = {
        md: 'px-5 py-3 text-base min-h-[48px]',
        lg: 'px-6 py-4 text-lg min-h-[58px]',
        xl: 'px-8 py-5 text-xl md:text-2xl min-h-[68px]',
    };

    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
        success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200',
        danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
        outline: 'border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
        >
            {children}
        </button>
    );
}
