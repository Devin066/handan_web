import { useState, useEffect } from 'react';
import { Space, Button } from 'antd';
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormDigit,
  ProFormSelect,
  EditableProTable,
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

// locale
import { useUoMsLazyQuery, useWarehousesLazyQuery } from '@/gql';
import { onError } from '@/utils';
import useConfigStore from '@/stores/useConfig';

const ItemNew = (props: any) => {
  const currency = useConfigStore((state) => state.currency);
  const { onCreate } = props;

  const [form] = ProForm.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [uoms, setUoms] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [stockItems, setStockItems] = useState([]);

  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  };

  const [fetchUoMs] = useUoMsLazyQuery({
    fetchPolicy: 'no-cache',
    variables: {},
    onCompleted: (data: any) => {
      const result = data?.uoms?.map((item: any) => {
        return {
          value: item.uuid,
          label: item.name,
        };
      });

      setUoms(result);
    },
    onError,
  });

  const [fetchWarehouses] = useWarehousesLazyQuery({
    fetchPolicy: 'no-cache',
    variables: {},
    onCompleted: (data: any) => {
      const result = data?.warehouses?.map((item: any) => {
        return {
          ...item,
          qty: 0,
        };
      });

      setStockItems(result);
    },
    onError,
  });

  useEffect(() => {
    fetchUoMs();
    fetchWarehouses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdjustDataSource = (values: any) => {
    setStockItems(values);
  };

  const onFinish = async (values: any) => {
    const stockUoms = [
      {
        uomUuid: values.uomUuid,
        conversionFactor: 1,
        sequence: 1,
      },
    ];

    const openingStocks = stockItems.map((item: any) => {
      return {
        warehouseUuid: item.uuid,
        qty: item.qty,
      };
    });

    const request = {
      name: values.name,
      sellingPrice: parseFloat(values.sellingPrice),
      spec: values.spec,
      stockUoms,
      openingStocks,
    };

    await onCreate(request);

    setModalVisible(false);
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Warehouse',
      dataIndex: 'name',
      valueType: 'select',
      align: 'center',
      readonly: true,
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      valueType: 'digit',
      fieldProps: {
        defaultValue: 0,
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: 'This field is required' }],
        };
      },
    },
    {
      title: 'Actions',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.uuid);
          }}
        >
          Edit
        </a>,
      ],
    },
  ];

  return (
    <>
      <Button
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New Item
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Item</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormText
            width="sm"
            name="name"
            label="Name"
            placeholder="Enter name"
            rules={[{ required: true, message: 'Enter name' }]}
          />

          <ProFormText width="sm" name="spec" label="Spec" placeholder="optional" />

          <ProFormDigit
            width="sm"
            name="sellingPrice"
            label="Sale Price"
            fieldProps={{
              precision: 2,
              addonAfter: currency,
            }}
            placeholder="Enter sale price"
            rules={[{ required: true, message: 'Enter sale price' }]}
          />

          <ProFormSelect
            width="sm"
            name="uomUuid"
            label="UOM"
            options={uoms}
            placeholder="Select unit"
            fieldProps={{
              showSearch: true,
              filterOption: true,
            }}
          />
        </ProForm.Group>

        <EditableProTable
          rowKey="uuid"
          size="small"
          maxLength={20}
          controlled
          recordCreatorProps={false}
          loading={false}
          columns={columns}
          value={stockItems}
          onChange={(values) => handleAdjustDataSource(values)}
          editable={{
            actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel],
          }}
        />
      </ModalForm>
    </>
  );
};

export default ItemNew;
