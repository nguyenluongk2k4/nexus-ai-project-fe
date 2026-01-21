import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const changeLanguage = (lng: 'en' | 'vi') => {
        i18n.changeLanguage(lng);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getCurrentLangLabel = () => {
        return i18n.language === 'en' ? 'English' : 'Tiếng Việt';
    }

    const getCurrentFlag = () => {
        return i18n.language === 'en' ? 'gb' : 'vn';
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    variant === 'minimal' 
                        ? 'text-slate-600 hover:text-primary hover:bg-slate-50' 
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
            >
                <img 
                    src={`https://flagcdn.com/w20/${getCurrentFlag()}.png`} 
                    alt={getCurrentLangLabel()} 
                    className="w-5 h-auto rounded-sm"
                />
                <span className="text-sm font-medium hidden sm:block">{getCurrentLangLabel()}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <button
                        onClick={() => changeLanguage('vi')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            i18n.language === 'vi' ? 'text-primary bg-primary/5' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <img src="https://flagcdn.com/w20/vn.png" alt="TN" className="w-5 h-auto rounded-sm" />
                        Tiếng Việt
                    </button>
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                            i18n.language === 'en' ? 'text-primary bg-primary/5' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-5 h-auto rounded-sm" />
                        English
                    </button>
                </div>
            )}
        </div>
    );
}
