import { useState } from 'react';
import { Space, Button, Divider } from 'antd';
import { ModalForm, ProForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
import round from 'lodash.round';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import { fetchWarehouses, fetchSuppliers } from '@/utils/api';
import OrderItemForm from '@/components/sales-order/order-item-form';

const PurchaseOrderNew = (props: any) => {
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
      supplierUuid: values.supplierUuid,
      warehouseUuid: values.warehouseUuid,
      // supplierAddress: values.supplierAddress,
      purchase_items: updatedLineItems,
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

  const handleSelctSupplier = (value: any, opt: any) => {
    form.setFieldValue('supplierAddress', opt.address);
  };

  return (
    <>
      <Button
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New Purchase Order
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Purchase Order</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
        submitter={{
          render: (props, doms) => {
            return [
              <div key="lineItemTotal" style={{ marginRight: '10px' }}>
                Item Amount: <span style={{ fontSize: '20px', color: '#ab956d' }}>$ {amount.lineItemTotal}</span>{' '}
              </div>,
              <Divider key="divider1" type="vertical" />,
              <div key="total" style={{ marginRight: '10px' }}>
                Amount Payable: <span style={{ fontSize: '20px', color: '#ab956d' }}>$ {amount.total}</span>{' '}
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
            name="supplierUuid"
            label="Supplier"
            fieldProps={{
              onSelect: (value, opt) => handleSelctSupplier(value, opt),
            }}
            request={async (e) => fetchSuppliers(e)}
            rules={[{ required: true, message: 'Select supplier' }]}
            placeholder="Select supplier"
          />

          <ProFormText
            width="sm"
            name="supplierAddress"
            label="Supplier Address"
            placeholder="Enter supplier address"
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

export default PurchaseOrderNew;
