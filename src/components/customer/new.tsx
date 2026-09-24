import { useState } from 'react';
import { Space, Button, Collapse, ConfigProvider, Typography } from 'antd';
import { ModalForm, ProForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';

import { customerSourceEnum, customerTypeEnum } from '@/utils/enum';
import {
  CONTACT_FIELDS,
  LANDLINE_HINT,
  MOBILE_HINT,
  NO_CONTACT_MESSAGE,
  POSTAL_HINT,
  isValidEmail,
  isValidLandline,
  isValidMobile,
  isValidPostalCode,
} from '@/config/ph-contact';

const { Text } = Typography;

const options = (source: Record<string, { text: string }>) =>
  Object.entries(source).map(([value, { text }]) => ({ value, label: text }));

/**
 * Optional-format rule: an empty field is fine, a filled one has to be right.
 * Required-ness is expressed separately so the two never contradict.
 */
const format = (isValid: (value: string) => boolean, message: string) => ({
  validator: (_: unknown, value: string) =>
    !value || isValid(value) ? Promise.resolve() : Promise.reject(new Error(message)),
});

const CustomerNew = (props: any) => {
  const [form] = ProForm.useForm();
  const { onCreate } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [customerType, setCustomerType] = useState<string>('individual');

  const isBusiness = customerType === 'business';

  /**
   * The rule that makes this a CRM record rather than a name in a list: it has
   * to be reachable somehow. Hung off the mobile field because that is where
   * people look first, but it is satisfied by any channel on the form —
   * including the ones tucked inside "More details".
   */
  const reachable = {
    validator: () => {
      const values = form.getFieldsValue(true) as Record<string, string | undefined>;
      const hasContact = CONTACT_FIELDS.some((field) => values[field]?.trim());
      return hasContact ? Promise.resolve() : Promise.reject(new Error(NO_CONTACT_MESSAGE));
    },
  };

  const onFinish = async (values: any) => {
    await onCreate(values);
    setModalVisible(false);
  };

  return (
    <>
      <Button
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New Customer
      </Button>

      <ModalForm
        form={form}
        modalProps={{ destroyOnClose: true }}
        width={880}
        onOpenChange={(open) => {
          setModalVisible(open);
          if (!open) setCustomerType('individual');
        }}
        title={<Space>New Customer</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
        initialValues={{ customerType: 'individual', sourcePlatform: 'direct' }}
      >
        {/* Small controls throughout: this form is 25 fields, and default-size
            inputs pushed the submit button two screens down. */}
        <ConfigProvider componentSize="small">
          <ProForm.Group>
            <ProFormSelect
              width="xs"
              name="customerType"
              label="Type"
              options={options(customerTypeEnum)}
              allowClear={false}
              fieldProps={{
                onChange: (value: string) => setCustomerType(value),
              }}
            />

            {isBusiness ? (
              <>
                <ProFormText
                  width="sm"
                  name="companyName"
                  label="Business Name"
                  placeholder="Dela Cruz Machine Shop"
                  rules={[{ required: true, message: 'Enter the business name' }]}
                />
                <ProFormText width="sm" name="contactName" label="Contact Person" placeholder="Who to ask for" />
              </>
            ) : null}

            <ProFormText
              width="sm"
              name="firstName"
              label="First Name"
              placeholder="Juan"
              // A business is identified by its name; only a person needs these.
              rules={isBusiness ? [] : [{ required: true, message: 'Enter the first name' }]}
            />
            <ProFormText width="sm" name="middleName" label="Middle Name" placeholder="Santos" />
            <ProFormText
              width="sm"
              name="lastName"
              label="Last Name"
              placeholder="Dela Cruz"
              rules={isBusiness ? [] : [{ required: true, message: 'Enter the last name' }]}
            />
            <ProFormText width="xs" name="suffix" label="Suffix" placeholder="Jr." />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormText
              width="sm"
              name="phone"
              label="Mobile Number"
              placeholder="0917 123 4567"
              tooltip={MOBILE_HINT}
              required
              rules={[reachable, format(isValidMobile, MOBILE_HINT)]}
            />
            <ProFormText
              width="sm"
              name="email"
              label="Email"
              placeholder="optional"
              rules={[format(isValidEmail, 'Enter a valid email address')]}
            />
            <ProFormText width="sm" name="messengerId" label="Messenger" placeholder="Name or m.me link" />
            <ProFormText width="sm" name="viber" label="Viber" placeholder="Viber number" />
          </ProForm.Group>

          <ProForm.Group>
            <ProFormSelect
              width="sm"
              name="sourcePlatform"
              label="Discovered On"
              options={options(customerSourceEnum)}
              allowClear={false}
              rules={[
                {
                  required: true,
                  message: 'Pick where this customer was found',
                },
              ]}
            />
          </ProForm.Group>

          {/* Everything below is real but rarely filled at the moment of first
              contact, so it starts folded rather than making the common case
              scroll past it. */}
          <Collapse
            ghost
            size="small"
            items={[
              {
                key: 'more',
                label: <Text type="secondary">More details: other channels, address, notes</Text>,
                children: (
                  <>
                    <ProForm.Group>
                      <ProFormText
                        width="sm"
                        name="alternatePhone"
                        label="Alternate Mobile"
                        placeholder="optional"
                        rules={[format(isValidMobile, MOBILE_HINT)]}
                      />
                      <ProFormText
                        width="sm"
                        name="landline"
                        label="Landline"
                        placeholder="(02) 8123 4567"
                        rules={[format(isValidLandline, LANDLINE_HINT)]}
                      />
                      <ProFormText width="sm" name="facebook" label="Facebook" placeholder="Profile or page" />
                      <ProFormText width="sm" name="whatsapp" label="WhatsApp" placeholder="optional" />
                    </ProForm.Group>

                    <ProForm.Group>
                      <ProFormText width="sm" name="telegram" label="Telegram" placeholder="optional" />
                      <ProFormText width="sm" name="instagram" label="Instagram" placeholder="@handle" />
                      <ProFormText width="sm" name="tiktok" label="TikTok" placeholder="@handle" />
                      <ProFormText
                        width="sm"
                        name="marketplaceAccount"
                        label="Marketplace"
                        placeholder="Shopee / Lazada name"
                      />
                    </ProForm.Group>

                    <ProForm.Group>
                      <ProFormText
                        width="sm"
                        name="address"
                        label="House / Unit & Street"
                        placeholder="123 Rizal St."
                      />
                      <ProFormText width="sm" name="barangay" label="Barangay" placeholder="Brgy. San Isidro" />
                      <ProFormText width="sm" name="city" label="City / Municipality" placeholder="Quezon City" />
                      <ProFormText width="sm" name="province" label="Province" placeholder="Bulacan" />
                    </ProForm.Group>

                    <ProForm.Group>
                      <ProFormText width="xs" name="region" label="Region" placeholder="NCR" />
                      <ProFormText
                        width="xs"
                        name="postalCode"
                        label="Postal Code"
                        placeholder="1100"
                        rules={[format(isValidPostalCode, POSTAL_HINT)]}
                      />
                      <ProFormTextArea
                        width="md"
                        name="buildSpecs"
                        label="Build specifications"
                        placeholder="Bike model, preferred finish, fitment notes"
                        fieldProps={{ rows: 2 }}
                      />
                      <ProFormTextArea
                        width="md"
                        name="notes"
                        label="Notes"
                        placeholder="Anything worth remembering"
                        fieldProps={{ rows: 1 }}
                      />
                    </ProForm.Group>
                  </>
                ),
              },
            ]}
          />
        </ConfigProvider>
      </ModalForm>
    </>
  );
};

export default CustomerNew;
