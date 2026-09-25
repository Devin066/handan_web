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

/** The row's values, prefilled into the Edit dialog. A new material starts blank. */
const editInitialValues = (item: any) => ({
  itemType: item.itemType,
  sku: item.sku,
  category: item.category,
  name: item.name,
  spec: item.spec,
  sellingPrice: item.sellingPrice,
  standardCost: item.standardCost,
  minStockThreshold: item.minStockThreshold,
  uomName: item.defaultStockUomName,
});

const ItemNew = (props: any) => {
  const currency = useConfigStore((state) => state.currency);
  const { onCreate, onUpdate, record, onClose } = props;

  // With a record this is the Edit dialog: no button, open while mounted.
  const editing = !!record;

  const [form] = ProForm.useForm();
  const [modalVisible, setModalVisible] = useState(editing);
  const [uoms, setUoms] = useState([]);
  const [stockItems, setStockItems] = useState([]);

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
    // Opening stock is set once, when the material is first created.
    if (!editing) fetchWarehouses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdjustDataSource = (values: any) => {
    setStockItems(values);
  };

  const onFinish = async (values: any) => {
    if (editing) {
      // Class, unit and stock are deliberately absent: the server rejects them,
      // and the form shows them read-only for the same reason.
      const result = await onUpdate(record.uuid, {
        name: values.name,
        sku: values.sku,
        category: values.category ?? '',
        spec: values.spec ?? '',
        standardCost: Number(values.standardCost ?? 0),
        minStockThreshold: Number(values.minStockThreshold ?? 0),
        sellingPrice: parseFloat(values.sellingPrice ?? 0),
      });

      // A rejected save (a code another material already uses, say) must leave
      // the dialog up with the typed values still in it. Closing would show the
      // operator an error toast over a list that never changed, and lose the
      // edit they would have to type again.
      if (!result?.data?.updateItem) return false;

      onClose?.();
      return;
    }

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
      {editing ? null : (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setModalVisible(true);
          }}
        >
          New Material
        </Button>
      )}

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => onClose?.(),
        }}
        width={'70%'}
        onOpenChange={(open) => {
          setModalVisible(open);
          if (!open) onClose?.();
        }}
        title={<Space>{editing ? `Edit ${record.name}` : 'New Material'}</Space>}
        submitTimeout={2000}
        submitter={editing ? { searchConfig: { submitText: 'Save changes' } } : undefined}
        autoFocusFirstInput
        open={modalVisible}
        initialValues={editing ? editInitialValues(record) : undefined}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="itemType"
            label="Class"
            // A field-level default would collide with the form's initialValues
            // when editing, and React logs it: the class is only defaulted for a
            // material that does not have one yet.
            initialValue={editing ? undefined : 'raw_material'}
            disabled={editing}
            options={Object.entries(itemTypeEnum).map(([value, t]) => ({
              value,
              label: `${t.prefix} · ${t.text}`,
            }))}
            rules={[{ required: true, message: 'Choose a class' }]}
            tooltip={
              editing
                ? 'Fixed after creation: the code was issued from this class, and orders and documents already quote that code.'
                : 'Raw materials are bought in, manufactured parts are made for larger assemblies, finished goods are sold.'
            }
          />
          <ProFormText
            width="sm"
            name="sku"
            label="Code"
            placeholder="Generated from the class"
            tooltip={
              editing
                ? 'Changing this changes the code on every screen that lists this material. Past documents keep the code they were printed with.'
                : 'Leave blank to get the next RM-, MP- or FG- number.'
            }
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
            label="Low-Stock Alert At"
            min={0}
            placeholder="0"
            tooltip="When available stock drops to this level or below, the material shows as Low here and on the dashboard. 0 warns only when it runs out."
          />

          {/* Read-only when editing, and shown as the unit's name rather than as a
              disabled picker holding a uuid the operator cannot read. */}
          {editing ? (
            <ProFormText
              width="sm"
              name="uomName"
              label="UOM"
              disabled
              tooltip="Fixed after creation: every quantity on hand, on order and in the ledger is counted in this unit."
            />
          ) : (
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
          )}
        </ProForm.Group>

        {/* Opening stock belongs to creation. Afterwards quantities move through
            receipts, issues and adjustments so the ledger stays whole. */}
        {editing ? null : (
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
        )}
      </ModalForm>
    </>
  );
};

export default ItemNew;
