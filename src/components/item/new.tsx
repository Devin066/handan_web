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
import { itemTypeEnum } from '@/utils/enum';

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
      itemType: values.itemType,
      sku: values.sku,
      category: values.category,
      standardCost: Number(values.standardCost ?? 0),
      minStockThreshold: Number(values.minStockThreshold ?? 0),
      sellingPrice: parseFloat(values.sellingPrice ?? 0),
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
        type="primary"
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New Material
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Material</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="itemType"
            label="Class"
            initialValue="raw_material"
            options={Object.entries(itemTypeEnum).map(([value, t]) => ({
              value,
              label: `${t.prefix} · ${t.text}`,
            }))}
            rules={[{ required: true, message: 'Choose a class' }]}
            tooltip="Raw materials are bought in, manufactured parts are made for larger assemblies, finished goods are sold."
          />
          <ProFormText
            width="sm"
            name="sku"
            label="Code"
            placeholder="Generated from the class"
            tooltip="Leave blank to get the next RM-, MP- or FG- number."
          />
          <ProFormText width="sm" name="category" label="Category" placeholder="e.g. Billet, Tubing, Fasteners" />
        </ProForm.Group>
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
            placeholder="0 if not sold"
          />

          <ProFormDigit
            width="sm"
            name="standardCost"
            label="Standard Cost"
            fieldProps={{ precision: 2, addonAfter: currency }}
            placeholder="Per unit"
            tooltip="Used to value stock on the dashboard and to estimate purchase requests."
          />

          <ProFormDigit
            width="sm"
            name="minStockThreshold"
            label="Reorder Level"
            min={0}
            placeholder="0"
            tooltip="At or below this, the dashboard warns of low stock."
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
