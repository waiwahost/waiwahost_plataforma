import React from 'react';
import { Download } from 'lucide-react';

interface ExportExcelButtonProps {
    onClick: () => void;
}

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-tourism-teal text-white rounded-lg hover:bg-tourism-teal/90 transition-colors font-medium shadow-sm"
        >
            <Download className="h-4 w-4" />
            Exportar Excel
        </button>
    );
};

export default ExportExcelButton;
