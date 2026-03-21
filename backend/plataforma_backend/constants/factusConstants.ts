// Factus API URLs por ambiente
export const FACTUS_URLS = {
    sandbox: 'https://api-sandbox.factus.com.co',
    produccion: 'https://api.factus.com.co',
};

// Endpoints Factus
export const FACTUS_ENDPOINTS = {
    token: '/oauth/token',
    // Facturas
    bills: '/v1/bills',
    billValidate: (id: number | string) => `/v1/bills/${id}/validate`,
    billDownloadPdf: (id: number | string) => `/v1/bills/download-pdf/${id}`,
    billDownloadXml: (id: number | string) => `/v1/bills/download-xml/${id}`,
    billSendEmail: (id: number | string) => `/v1/bills/send-email/${id}`,
    // Notas Crédito
    creditNotes: '/v1/credit-notes',
    creditNoteValidate: (id: number | string) => `/v1/credit-notes/${id}/validate`,
    creditNoteDownloadPdf: (id: number | string) => `/v1/credit-notes/download-pdf/${id}`,
    // Notas Débito
    debitNotes: '/v1/debit-notes',
    debitNoteValidate: (id: number | string) => `/v1/debit-notes/${id}/validate`,
    debitNoteDownloadPdf: (id: number | string) => `/v1/debit-notes/download-pdf/${id}`,
    // Documentos Soporte
    supportDocuments: '/v1/support-documents',
    supportDocumentValidate: (id: number | string) => `/v1/support-documents/${id}/validate`,
    supportDocumentDownloadPdf: (id: number | string) => `/v1/support-documents/download-pdf/${id}`,
    // Rangos numeración y tablas
    numberingRanges: '/v1/numbering-ranges',
    municipalities: '/v1/municipalities',
    tributes: '/v1/tributes',
    measurementUnits: '/v1/measurement-units',
};
