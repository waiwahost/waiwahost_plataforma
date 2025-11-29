import React, { ReactNode } from 'react';

interface ScrollableTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente wrapper para tablas con scroll horizontal
 * Mantiene la columna de acciones fija a la derecha mientras permite scroll en las demás columnas
 */
const ScrollableTable: React.FC<ScrollableTableProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`w-full border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="w-full overflow-x-auto max-w-full">
        <div className="table-wrapper">
          {children}
        </div>
      </div>

      <style jsx>{`
        .table-wrapper {
          position: relative;
          width: fit-content;
          min-width: 100%;
        }
        
        /* Controlar el ancho de la tabla */
        .table-wrapper :global(.scrollable-table) {
          position: relative;
          min-width: 1000px; /* Ancho mínimo que activa el scroll */
          width: auto;
          border-collapse: collapse;
        }
        
        /* Hacer que la columna de acciones (última) sea sticky */
        .table-wrapper :global(.scrollable-table thead tr th:last-child),
        .table-wrapper :global(.scrollable-table tbody tr td:last-child) {
          position: sticky;
          right: 0;
          z-index: 10;
          min-width: 180px;
          max-width: 180px;
          width: 180px;
          border-left: 1px solid #e5e7eb;
          box-shadow: -2px 0 8px -2px rgba(0, 0, 0, 0.1);
        }
        
        /* Fondos correctos para headers */
        .table-wrapper :global(.scrollable-table thead tr th:last-child) {
          background-color: #f9fafb;
        }
        
        /* Fondos correctos para celdas */
        .table-wrapper :global(.scrollable-table tbody tr td:last-child) {
          background-color: white;
        }
        
        /* Mantener hover en columna fija */
        .table-wrapper :global(.scrollable-table tbody tr:hover td:last-child) {
          background-color: #f9fafb;
        }
        
        /* Centrar contenido en columna de acciones */
        .table-wrapper :global(.scrollable-table thead tr th:last-child),
        .table-wrapper :global(.scrollable-table tbody tr td:last-child) {
          text-align: center;
          vertical-align: middle;
        }
        
        /* Ancho mínimo para otras columnas para garantizar scroll */
        .table-wrapper :global(.scrollable-table thead tr th:not(:last-child)),
        .table-wrapper :global(.scrollable-table tbody tr td:not(:last-child)) {
          min-width: 100px;
          white-space: nowrap;
        }
        
        /* Mejorar el espaciado */
        .table-wrapper :global(.scrollable-table thead tr th),
        .table-wrapper :global(.scrollable-table tbody tr td) {
          padding: 12px 16px;
        }
      `}</style>
    </div>
  );
};

export default ScrollableTable;