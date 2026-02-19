import React, { useState, useEffect } from 'react';
import { COUNTRIES } from '../constants/countries';

const PhoneInput = ({
    value,
    onChange,
    onFocus,
    error,
    label,
    placeholder = "300 123 4567",
    disabled = false,
    required = false
}) => {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default Colombia
    const [phoneNumber, setPhoneNumber] = useState('');

    // Sincronizar estado local cuando cambia el valor externo
    useEffect(() => {
        if (!value) {
            setPhoneNumber('');
            return;
        }

        // Intentar detectar el código del país en el valor existente
        const foundCountry = COUNTRIES.find(c => value.startsWith(c.dial_code));

        if (foundCountry) {
            setSelectedCountry(foundCountry);
            // Extraer el número sin el código y sin espacios iniciales
            const numberWithoutCode = value.slice(foundCountry.dial_code.length).trim();
            setPhoneNumber(numberWithoutCode);
        } else {
            // Si no coincide con ningún código, asumir que es solo el número o un formato desconocido
            setPhoneNumber(value);
        }
    }, [value]);

    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        const country = COUNTRIES.find(c => c.code === countryCode);
        if (country) {
            setSelectedCountry(country);
            // Actualizar el valor padre inmediatamente con el nuevo código
            // Si hay un número escrito, se preserva
            const newFullValue = `${country.dial_code} ${phoneNumber}`;
            onChange(newFullValue);
        }
    };

    const handlePhoneChange = (e) => {
        const newNumber = e.target.value;
        // Solo permitir números
        if (/^\d*$/.test(newNumber)) {
            setPhoneNumber(newNumber);
            const newFullValue = `${selectedCountry.dial_code} ${newNumber}`;
            onChange(newFullValue);
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && '*'}
                </label>
            )}
            <div className="flex relative">
                <select
                    value={selectedCountry.code}
                    onChange={handleCountryChange}
                    disabled={disabled}
                    className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-3 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 border-e-0 w-[140px]"
                >
                    {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.flag} {country.dial_code}
                        </option>
                    ))}
                </select>
                <div className="relative w-full">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onFocus={onFocus}
                        disabled={disabled}
                        required={required}
                        className={`block p-2.5 w-full z-20 text-sm text-gray-900 bg-white rounded-e-lg border-s-0 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                            }`}
                        placeholder={placeholder}
                    />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default PhoneInput;
