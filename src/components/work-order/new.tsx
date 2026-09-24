import { useState } from 'react';
import { Space, Button } from 'antd';
import {
  ModalForm,
  ProForm,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormDateTimePicker,
} from '@ant-design/pro-components';

// locale
import { getUTCTime } from '@/utils';
import { fetchWarehouses, fetchBoms, fetchStaff } from '@/utils/api';

const WorkOrderNew = (props: any) => {
  const { onCreate } = props;

  const [form] = ProForm.useForm();
  const [modalVisible, setModalVisible] = useState(false);

  const onFinish = async (values: any) => {
    const request = {
      warehouseUuid: values.warehouseUuid,
      bomUuid: values.bomUuid,
      plannedQty: values.plannedQty,
      startTime: getUTCTime(values.startTime),
      endTime: getUTCTime(values.endTime),
      dueDate: values.dueDate ? getUTCTime(values.dueDate) : null,
      assignedStaffUuid: values.assignedStaffUuid,
      pieceRate: values.pieceRate ?? 0,
    };

    await onCreate(request);
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
        New work order
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Work Order</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="warehouseUuid"
            label="Warehouse"
            request={async (e) => fetchWarehouses(e)}
            placeholder="Select warehouse"
            rules={[{ required: true, message: 'Select warehouse' }]}
          />

          <ProFormSelect
            width="sm"
            name="bomUuid"
            label="Product"
            request={async (e) => fetchBoms(e)}
            placeholder="Select product"
            rules={[{ required: true, message: 'Select product' }]}
          />

          <ProFormDigit
            width="sm"
            name="plannedQty"
            label="Planned Qty"
            fieldProps={{
              precision: 0,
            }}
            placeholder="Enter planned qty"
            rules={[{ required: true, message: 'Enter planned qty' }]}
          />

          <ProFormDateTimePicker
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: 'Enter start time' }]}
          />
          <ProFormDateTimePicker
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: 'Enter end time' }]}
          />
          <ProFormDatePicker name="dueDate" label="Due date" />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="assignedStaffUuid"
            label="Assign to"
            request={async (e) => fetchStaff(e)}
            placeholder="Machinist or fabricator"
            tooltip="Job cards reported without an operator are credited to this person."
          />
          <ProFormDigit
            width="sm"
            name="pieceRate"
            label="Piece rate"
            min={0}
            tooltip="Paid per good unit reported at each step, on top of hourly pay."
            placeholder="0"
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default WorkOrderNew;
