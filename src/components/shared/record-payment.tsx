import { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, Typography } from 'antd';

import { useRecordInvoicePaymentMutation } from '@/gql';
import { fetchPaymentMethods } from '@/utils/api';
import { formatCurrency } from '@/utils/format';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

/**
 * Confirms a payment against one invoice (SRS 4.5, 5). For a sales invoice the
 * Official Receipt number is required; it and the method are stamped on the
 * invoice and the payment is posted to the ledger.
 */
const RecordPayment = ({
  invoice,
  type,
  onClose,
  onRecorded,
}: {
  invoice: any;
  type: 'sales' | 'purchase';
  onClose: () => void;
  onRecorded: () => void;
}) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const [methods, setMethods] = useState<any[]>([]);
  const balance = Number(invoice?.balance ?? 0);
  const sales = type === 'sales';
  const orRules = sales ? [{ required: true, whitespace: true, message: 'Enter the OR number' }] : [];

  useEffect(() => {
    if (invoice) fetchPaymentMethods({}).then((m) => setMethods(m ?? []));
  }, [invoice]);

  const [record, { loading }] = useRecordInvoicePaymentMutation({
    onCompleted: () => {
      messageApi?.success(`Payment recorded on ${invoice?.code}`);
      onRecorded();
      onClose();
    },
    onError,
  });

  return (
    <Modal
      open={!!invoice}
      title={`Record payment on ${invoice?.code ?? ''}`}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Record payment"
      confirmLoading={loading}
      destroyOnClose
      width="min(480px, 100vw)"
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        {sales ? invoice?.customerName : invoice?.supplierName} · {formatCurrency(balance)} outstanding
      </Text>
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{ amount: balance }}
        onFinish={(values) =>
          record({
            variables: {
              request: {
                invoiceType: type,
                invoiceUuid: invoice.uuid,
                amount: Number(values.amount),
                paymentMethodUuid: values.paymentMethodUuid,
                orNumber: values.orNumber,
              },
            },
          })
        }
      >
        <Form.Item
          name="orNumber"
          label={sales ? 'Official Receipt (OR) number' : 'Supplier receipt or reference'}
          rules={orRules}
        >
          <Input placeholder={sales ? 'As printed on the receipt' : 'Optional'} autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="paymentMethodUuid"
          label="Payment method"
          rules={[{ required: true, message: 'Choose how it was paid' }]}
        >
          <Select options={methods} placeholder="Cash, bank transfer, cheque" />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Enter the amount' },
            {
              validator: (_, v) =>
                Number(v) > 0 && Number(v) <= balance + 1e-9
                  ? Promise.resolve()
                  : Promise.reject(new Error(`Enter an amount up to ${formatCurrency(balance)}`)),
            },
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RecordPayment;
