import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Popover } from 'antd';
import { useState } from 'react';

const PurchaseInvoiceNew = (props: any) => {
  const { record, onCallback } = props;
  const [visible, setVisible] = useState(false);

  const onFinish = (values: any) => {
    const request = {
      purchaseOrderUuid: values.purchaseOrderUuid,
      amount: parseFloat(values.amount),
    };

    onCallback && onCallback(request);
    setVisible(false);
  };

  return (
    <div>
      <Button size="small" type="link" onClick={() => setVisible(true)}>
        Add Payment Voucher
      </Button>
      <Popover
        title="Add Payment Voucher"
        overlayInnerStyle={{ width: '200px' }}
        content={
          <ProForm onFinish={onFinish} initialValues={{ purchaseOrderUuid: record.uuid }}>
            <ProFormText name="purchaseOrderUuid" hidden />
            <ProFormText
              width="sm"
              name="amount"
              label="Payment Amount"
              placeholder="Enter amount"
              rules={[{ required: true, message: 'Enter amount' }]}
            />
          </ProForm>
        }
        trigger="click"
        open={visible}
        onOpenChange={() => setVisible(!visible)}
      />
    </div>
  );
};

export default PurchaseInvoiceNew;
