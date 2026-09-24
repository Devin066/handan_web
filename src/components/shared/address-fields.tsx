import { Col, Form, Input, Row } from 'antd';

import { ADDRESS_FIELDS, isValidPostalCode } from '@/config/address';

const postalRules = [
  {
    validator: (_: unknown, value?: string) =>
      !value || isValidPostalCode(value)
        ? Promise.resolve()
        : Promise.reject(new Error('Use the 4-digit postal code.')),
  },
];

/**
 * Address entry in parts, stored under `name` as { street, barangay, city,
 * province, postalCode }. Compose it with composeAddress() on submit.
 */
const AddressFields = ({ name, label, extra }: { name: string; label: string; extra?: string }) => (
  <fieldset className="address-fields">
    <legend>{label}</legend>
    {extra ? <div className="address-fields-extra">{extra}</div> : null}
    <Row gutter={12}>
      {ADDRESS_FIELDS.map((field) => (
        <Col key={field.key} xs={24} sm={field.key === 'street' ? 24 : 12} md={field.key === 'street' ? 12 : 6}>
          <Form.Item name={[name, field.key]} label={field.label} rules={field.key === 'postalCode' ? postalRules : []}>
            <Input placeholder={field.placeholder} inputMode={field.key === 'postalCode' ? 'numeric' : undefined} />
          </Form.Item>
        </Col>
      ))}
    </Row>
  </fieldset>
);

export default AddressFields;
