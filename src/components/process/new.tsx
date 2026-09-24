import { useState } from 'react';
import { Button, Col, Form, Input, Modal, Row } from 'antd';

/**
 * A routing step on a BOM (cutting, machining, inspection). The code is what
 * appears on job cards, so it is required and unique.
 */
const ProcessNew = ({ onCreate }: { onCreate: (values: any) => Promise<unknown> }) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const onFinish = async (values: any) => {
    setSaving(true);
    try {
      await onCreate(values);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button type="primary" size="small" onClick={() => setOpen(true)}>
        New Process
      </Button>
      <Modal
        open={open}
        title="New Process"
        okText="Add Process"
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        confirmLoading={saving}
        width="min(560px, 100vw)"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false} onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={15}>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  { required: true, whitespace: true, message: 'Enter a process name.' },
                  { max: 60, message: 'Keep the name under 60 characters.' },
                ]}
              >
                <Input autoFocus placeholder="e.g. Surface grinding" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={9}>
              <Form.Item
                name="code"
                label="Code"
                extra="Shown on job cards."
                normalize={(value) => value?.toUpperCase()}
                rules={[
                  { required: true, whitespace: true, message: 'Enter a code.' },
                  { pattern: /^[A-Z0-9-]{1,12}$/i, message: 'Letters, numbers and dashes, up to 12.' },
                ]}
              >
                <Input placeholder="e.g. GRD" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ max: 500, message: 'Keep it under 500 characters.' }]}
              >
                <Input.TextArea rows={3} placeholder="What happens at this step, tolerances, checks" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ProcessNew;
