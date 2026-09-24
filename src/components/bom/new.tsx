import { useState } from 'react';
import { Space, Button } from 'antd';
import {
  ModalForm,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProColumns,
  EditableProTable,
  ProCard,
} from '@ant-design/pro-components';
import size from 'lodash.size';

// locale
import { useMessageContext } from '@/components/common/message-context';
import { fetchItems } from '@/utils/api';
import { useProcessesLazyQuery, useItemsLazyQuery } from '@/gql';
import { onError } from '@/utils';

const BOMNew = (props: any) => {
  const { messageApi } = useMessageContext();

  const [form] = ProForm.useForm();
  const { onCreate } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [processes, setProcesses] = useState<any>([]);
  const [bomItems, setBomItems] = useState<any>([]);
  const [bomProcesses, setBomProcesses] = useState<any>([]);

  const [fetchItems2] = useItemsLazyQuery({
    onCompleted: (data: any) => {
      setItems(data.items);
    },
    onError,
  });

  const [fetchProcesses] = useProcessesLazyQuery({
    onCompleted: (data: any) => {
      setProcesses(data.processes);
    },
    onError,
  });

  const onFinish = async (values: any) => {
    const updatedBomItems = bomItems.map((entry: any) => {
      const { item, qty } = entry;
      return {
        itemUuid: item.uuid,
        qty: qty,
      };
    });

    const updatedBomProcesses = bomProcesses.map((entry: any) => {
      const { process, position } = entry;
      return {
        processUuid: process.uuid,
        position: position,
      };
    });

    if (size(updatedBomItems) == 0) {
      messageApi?.error('Please add or verify the item lines');
      return false;
    }

    if (size(updatedBomProcesses) == 0) {
      messageApi?.error('Please add or verify the process lines');
      return false;
    }

    const request = {
      itemUuid: values.itemUuid,
      name: values.name,
      bomItems: updatedBomItems,
      bomProcesses: updatedBomProcesses,
    };

    await onCreate(request);
    setModalVisible(false);
  };

  const handleSelctItem = (value: any, opt: any) => {
    form.setFieldValue('name', opt.label);
  };

  const itemColumns: ProColumns<any>[] = [
    {
      title: 'Process Name',
      dataIndex: 'name',
      valueType: 'select',
      align: 'center',
      fieldProps: (form, { rowKey, rowIndex }) => {
        return {
          showSearch: true,
          style: { width: '100%' },
          defaultActiveFirstOption: false,
          placeholder: 'Search',
          suffixIcon: null,
          onSearch: (value: any) => {
            fetchItems2({ variables: {} });
          },
          onChange: (value: any) => {
            if (value) {
              const item = JSON.parse(value);
              form.setFieldsValue({
                [rowKey]: {
                  item,
                  name: item.name,
                },
              });
            }
          },
          options: (items || []).map((d) => ({
            value: JSON.stringify(d),
            label: d.name,
          })),
        };
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: 'This field is required' }],
        };
      },
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      valueType: 'digit',
      align: 'center',
      // Components are not always whole units — a part may take a fraction of a
      // sheet or a length off a bar, so the BOM accepts fractional quantities.
      fieldProps: { precision: 4, step: 0.1, min: 0 },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: 'This field is required' }],
        };
      },
      width: '15%',
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

  const processColumns: ProColumns<any>[] = [
    {
      title: 'Process Name',
      dataIndex: 'name',
      valueType: 'select',
      align: 'center',
      fieldProps: (form, { rowKey, rowIndex }) => {
        return {
          showSearch: true,
          style: { width: '100%' },
          defaultActiveFirstOption: false,
          placeholder: 'Search',
          suffixIcon: null,
          onSearch: (value: any) => {
            fetchProcesses({ variables: {} });
          },
          onChange: (value: any) => {
            if (value) {
              const process = JSON.parse(value);
              form.setFieldsValue({
                [rowKey]: {
                  process,
                  name: process.name,
                },
              });
            }
          },
          options: (processes || []).map((d) => ({
            value: JSON.stringify(d),
            label: d.name,
          })),
        };
      },
      formItemProps: () => {
        return {
          rules: [{ required: true, message: 'This field is required' }],
        };
      },
    },
    {
      title: 'Position',
      dataIndex: 'position',
      valueType: 'digit',
      align: 'center',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: 'This field is required' }],
        };
      },
      width: '15%',
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

  const handleAdjustBomItems = (values: any) => {
    setBomItems(values);
  };

  const handleAdjustBomProcesses = (values: any) => {
    setBomProcesses(values);
  };

  return (
    <>
      <Button
        type="primary"
        size="small"
        onClick={() => {
          setModalVisible(true);
        }}
      >
        New BOM
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New BOM</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="itemUuid"
            label="Select Item"
            fieldProps={{
              onSelect: (value, opt) => handleSelctItem(value, opt),
            }}
            request={async (e) => fetchItems(e)}
            rules={[{ required: true, message: 'Select item' }]}
            placeholder="Select item"
          />

          <ProFormText
            width="sm"
            name="name"
            label="BOM Name"
            placeholder="Enter BOM name"
            rules={[{ required: true, message: 'Enter BOM name' }]}
          />
        </ProForm.Group>

        <ProCard title="BOM Items" extra="BOM Items" headerBordered>
          <EditableProTable
            key="bomItems"
            rowKey="uuid"
            size="small"
            maxLength={20}
            controlled
            recordCreatorProps={{
              position: 'bottom',
              record: () => ({ uuid: (Math.random() * 1000000).toFixed(0) }),
            }}
            loading={false}
            columns={itemColumns}
            value={bomItems}
            onChange={(values) => handleAdjustBomItems(values)}
          />
        </ProCard>
        <ProCard title="BOM Processes" extra="BOM Processes" headerBordered>
          <EditableProTable
            key="bomProcesses"
            rowKey="uuid"
            size="small"
            maxLength={20}
            controlled
            recordCreatorProps={{
              position: 'bottom',
              record: () => ({ uuid: (Math.random() * 1000000).toFixed(0) }),
            }}
            loading={false}
            columns={processColumns}
            value={bomProcesses}
            onChange={(values) => handleAdjustBomProcesses(values)}
          />
        </ProCard>
      </ModalForm>
    </>
  );
};

export default BOMNew;
