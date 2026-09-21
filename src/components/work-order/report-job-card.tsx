import { useState } from 'react';
import { Space, Button } from 'antd';
import { ModalForm, ProForm, ProFormDateTimePicker, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';

// locale
import { fetchStaff } from '@/utils/api';
import { getUTCTime } from '@/utils';

const ReportJobCard = (props: any) => {
  const [form] = ProForm.useForm();
  const { onCreate, record } = props;
  const [modalVisible, setModalVisible] = useState(false);

  const initialValues = {
    workOrderUuid: record.workOrderUuid,
    workOrderItemUuid: record.uuid,
    producedQty: record.requiredQty - record.producedQty,
    defectiveQty: 0,
  };

  const onFinish = async (values: any) => {
    const request = {
      workOrderUuid: record.workOrderUuid,
      workOrderItemUuid: record.uuid,
      operatorStaffUuid: values.staffUuid,
      producedQty: values.producedQty,
      defectiveQty: 0,
      startTime: getUTCTime(values.startTime),
      endTime: getUTCTime(values.endTime),
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
        Report Job Card
      </Button>

      <ModalForm
        form={form}
        initialValues={initialValues}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>Report Job Card</Space>}
        submitTimeout={2000}
        autoFocusFirstInput
        open={modalVisible}
        onFinish={onFinish}
      >
        <ProForm.Group>
          <ProFormSelect
            width="sm"
            name="staffUuid"
            label="Employee"
            request={async (e) => fetchStaff(e)}
            placeholder="Select employee"
            rules={[{ required: true, message: 'Select employee' }]}
          />

          <ProFormDigit
            width="sm"
            name="producedQty"
            label="Produced Qty"
            fieldProps={{
              precision: 0,
            }}
            placeholder="Enter produced qty"
            rules={[{ required: true, message: 'Enter produced qty' }]}
          />

          {/* <ProFormDigit
            width="sm"
            name="defectiveQty"
            label="Defective Qty"
            fieldProps={{
              precision: 0,
            }}
            placeholder="Enter defective qty"
            rules={[{ required: true, message: 'Enter defective qty' }]}
          /> */}

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
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default ReportJobCard;
