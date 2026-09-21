import { useState } from 'react';
import { Space, Button } from 'antd';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';

const SupplierNew = (props: any) => {
  const [form] = ProForm.useForm();
  const { onCreate } = props;
  const [modalVisible, setModalVisible] = useState(false);

  const onFinish = async (values: any) => {
    await onCreate(values);
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
        New Supplier
      </Button>

      <ModalForm
        form={form}
        modalProps={{
          destroyOnClose: true,
        }}
        width={'70%'}
        onOpenChange={setModalVisible}
        title={<Space>New Supplier</Space>}
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

          <ProFormText
            width="sm"
            name="address"
            label="Address"
            placeholder="Enter address"
            rules={[{ required: true, message: 'Enter address' }]}
          />
        </ProForm.Group>
      </ModalForm>
    </>
  );
};

export default SupplierNew;
