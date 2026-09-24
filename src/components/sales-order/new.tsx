import { useState } from 'react';
import { Space, Button, Divider } from 'antd';
import { ModalForm, ProForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
import round from 'lodash.round';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import { fetchWarehouses, fetchCustomers } from '@/utils/api';
import { formatCurrency } from '@/utils/format';
import OrderItemForm from './order-item-form';

const SalesOrderNew = (props: any) => {
  const { messageApi } = useMessageContext();

  const [form] = ProForm.useForm();
  const { onCreate } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [lines, setLines] = useState<any>([]);

  const [amount, setAmount] = useState({
    lineItemTotal: 0,
    lineItemTotalWithTax: 0,
    total: 0,
  });

  const onFinish = async (values: any) => {
    const updatedLineItems = lines
      .map(({ item, unitPrice, orderedQty, stockUOM }: any) => {
        return {
          itemUuid: item.uuid,
          stockUomUuid: stockUOM.uuid,
          uomName: stockUOM.uomName,
          unitPrice: parseFloat(unitPrice),
          orderedQty: parseInt(orderedQty),
        };
      })
      .filter((item: any) => item.orderedQty > 0);

    if (size(updatedLineItems) == 0) {
      messageApi?.error('Please add or verify the item lines');
      return false;
    }

    const request = {
      customerUuid: values.customerUuid,
      warehouseUuid: values.warehouseUuid,
      customerAddress: values.customerAddress,
      salesItems: updatedLineItems,
    };

    await onCreate(request);
    setModalVisible(false);
  };

  const handleAdjustAmount = (values: any) => {
    setLines(values);

    const updatedLineItemTotal = values.reduce((acc: any, { unitPrice, orderedQty }: any) => {
      return acc + unitPrice * orderedQty;
    }, 0);

    setAmount({
      ...amount,
      lineItemTotal: round(updatedLineItemTotal, 2),
      total: round(updatedLineItemTotal, 2),
    });
  };

  const handleSelctCustomer = (value: any, opt: any) => {
    form.setFieldValue('customerAddress', opt.address);
  };

  return (
    <>
      <Button
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New Sales Order
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Sales Order</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
        submitter={{
          render: (props, doms) => {
            return [
              <div key="lineItemTotal" style={{ marginRight: '10px' }}>
                Item Amount:{' '}
                <span className="tabular-figures" style={{ fontSize: 18, fontWeight: 600 }}>
                  {formatCurrency(amount.lineItemTotal)}
                </span>{' '}
              </div>,
              <Divider key="divider1" type="vertical" />,
              <div key="total" style={{ marginRight: '10px' }}>
                Amount Receivable:{' '}
                <span className="tabular-figures" style={{ fontSize: 18, fontWeight: 600 }}>
                  {formatCurrency(amount.total)}
                </span>{' '}
              </div>,
              <Divider key="divider4" type="vertical" />,
              <Button type="primary" key="submit" onClick={() => props.form?.submit()}>
                Submit
              </Button>,
            ];
          },
        }}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="customerUuid"
            label="Customer"
            fieldProps={{
              onSelect: (value, opt) => handleSelctCustomer(value, opt),
            }}
            request={async (e) => fetchCustomers(e)}
            rules={[{ required: true, message: 'Select customer' }]}
            placeholder="Select customer"
          />

          <ProFormText
            width="sm"
            name="customerAddress"
            label="Customer Address"
            placeholder="Enter customer address"
          />

          <ProFormSelect
            width="sm"
            name="warehouseUuid"
            label="Warehouse"
            request={async (e) => fetchWarehouses(e)}
            placeholder="Select warehouse"
            rules={[{ required: true, message: 'Select warehouse' }]}
          />

          <ProFormDatePicker name="endTime" label="Delivery Date" />
        </ProForm.Group>

        <OrderItemForm onCallback={(values: any) => handleAdjustAmount(values)} />
      </ModalForm>
    </>
  );
};

export default SalesOrderNew;
