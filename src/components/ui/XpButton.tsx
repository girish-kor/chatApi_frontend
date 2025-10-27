import React from 'react';

interface XpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'close';
}

export const XpButton = React.memo<XpButtonProps>(({ children, variant = 'primary', className = '', ...props }) => {
    const baseClasses = 'px-6 py-1.5 text-xs font-bold border rounded-[3px] cursor-pointer focus:outline-dotted focus:outline-1 focus:outline-black focus:outline-offset-[-3px] active:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: `bg-gradient-to-b from-[#ece9d8] to-[#d1cdbf] border-[#003c74] text-black shadow-[1px_1px_3px_rgba(0,0,0,0.2)] hover:bg-gradient-to-b hover:from-[#FFF2E0] hover:to-[#FFD8A8] hover:border-[#E79B00] disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:border-gray-400`,
        close: `bg-gradient-to-b from-[#ff6b6b] to-[#e03c3c] border-[#8b0000] text-white`
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
});
