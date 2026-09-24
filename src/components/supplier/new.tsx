import { useState } from 'react';
import { Button, Col, Row, Typography } from 'antd';
import { ModalForm, ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import { LANDLINE_HINT, MOBILE_HINT, isValidEmail, isValidLandline, isValidMobile } from '@/config/ph-contact';

const { Text } = Typography;

/** An empty field is fine; a filled one has to be in the right format. */
const format = (isValid: (value: string) => boolean, message: string) => ({
  validator: (_: unknown, value: string) =>
    !value || isValid(value) ? Promise.resolve() : Promise.reject(new Error(message)),
});

const REACH_FIELDS = ['phone', 'landline', 'email'] as const;

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text strong style={{ display: 'block', margin: '4px 0 12px' }}>
    {children}
  </Text>
);

const SupplierNew = (props: any) => {
  const [form] = ProForm.useForm();
  const { onCreate } = props;
  const [modalVisible, setModalVisible] = useState(false);

  // A supplier is only useful if purchasing can actually reach someone there.
  const reachable = {
    validator: () => {
      const values = form.getFieldsValue(REACH_FIELDS as unknown as string[]);
      return REACH_FIELDS.some((field) => values[field]?.trim())
        ? Promise.resolve()
        : Promise.reject(new Error('Add a mobile, landline or email for the contact person.'));
    },
  };

  const onFinish = async (values: any) => {
    await onCreate(values);
    setModalVisible(false);
  };

  return (
    <>
      <Button type="primary" size="small" onClick={() => setModalVisible(true)}>
        New Supplier
      </Button>

      <ModalForm
        form={form}
        layout="vertical"
        modalProps={{ destroyOnClose: true }}
        width="min(720px, 100vw)"
        onOpenChange={setModalVisible}
        title="New Supplier"
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
        submitter={{ searchConfig: { submitText: 'Create Supplier' } }}
      >
        <SectionTitle>Business</SectionTitle>
        <Row gutter={16}>
          <Col xs={24} sm={16}>
            <ProFormText
              name="name"
              label="Business Name"
              rules={[{ required: true, message: 'Enter the business name.' }]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText name="tin" label="TIN" placeholder="000-000-000-000" />
          </Col>
          <Col span={24}>
            <ProFormText name="address" label="Address" rules={[{ required: true, message: 'Enter the address.' }]} />
          </Col>
        </Row>

        <SectionTitle>Contact person</SectionTitle>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <ProFormText
              name="contactFirstName"
              label="First Name"
              rules={[{ required: true, message: 'Enter a first name.' }]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText
              name="contactLastName"
              label="Last Name"
              rules={[{ required: true, message: 'Enter a last name.' }]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText name="contactPosition" label="Position" placeholder="e.g. Sales Manager" />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText
              name="phone"
              label="Mobile"
              placeholder="0917 123 4567"
              dependencies={['landline', 'email']}
              rules={[reachable, format(isValidMobile, MOBILE_HINT)]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText
              name="landline"
              label="Landline"
              placeholder="(02) 8123 4567"
              rules={[format(isValidLandline, LANDLINE_HINT)]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <ProFormText
              name="email"
              label="Email"
              placeholder="name@company.ph"
              rules={[format(isValidEmail, 'Enter a valid email address.')]}
            />
          </Col>
        </Row>

        <ProFormTextArea
          name="notes"
          label="Notes"
          placeholder="Payment terms, delivery days, anything purchasing should know"
          fieldProps={{ autoSize: { minRows: 2, maxRows: 5 } }}
        />
      </ModalForm>
    </>
  );
};

export default SupplierNew;
