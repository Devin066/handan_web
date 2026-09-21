import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, Popover } from 'antd';
import { useState } from 'react';

const SalesInvoiceNew = (props: any) => {
  const { record, onCallback } = props;
  const [visible, setVisible] = useState(false);

  const onFinish = (values: any) => {
    const request = {
      salesOrderUuid: values.salesOrderUuid,
      amount: parseFloat(values.amount),
    };

    onCallback && onCallback(request);
    setVisible(false);
  };

  return (
    <div>
      <Button size="small" type="link" onClick={() => setVisible(true)}>
        Add Receipt Voucher
      </Button>
      <Popover
        title="Add Receipt Voucher"
        overlayInnerStyle={{ width: '200px' }}
        content={
          <ProForm onFinish={onFinish} initialValues={{ salesOrderUuid: record.uuid }}>
            <ProFormText name="salesOrderUuid" hidden />
            <ProFormText
              width="sm"
              name="amount"
              label="Receipt Amount"
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

export default SalesInvoiceNew;
