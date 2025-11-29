import React from 'react';

function CompanyBillingFields({ values, onChange, labels }) {
  return (
    <div className="company-billing-fields">
      <div>
        <label>{labels.companyName}</label>
        <input
          type="text"
          name="companyName"
          value={values.companyName || ''}
          onChange={onChange}
        />
      </div>
      <div>
        <label>{labels.taxId}</label>
        <input
          type="text"
          name="taxId"
          value={values.taxId || ''}
          onChange={onChange}
        />
      </div>
      <div>
        <label>{labels.address}</label>
        <input
          type="text"
          name="address"
          value={values.address || ''}
          onChange={onChange}
        />
      </div>
      <div>
        <label>{labels.phone}</label>
        <input
          type="text"
          name="phone"
          value={values.phone || ''}
          onChange={onChange}
        />
      </div>
      <div>
        <label>{labels.email}</label>
        <input
          type="email"
          name="email"
          value={values.email || ''}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default CompanyBillingFields;
