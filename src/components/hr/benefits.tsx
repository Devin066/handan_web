import { useEffect } from 'react';
import { Alert, Button, Card, Col, Form, InputNumber, Row, Skeleton, Typography } from 'antd';

import { useBenefitsQuery, useUpdateBenefitsMutation } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

const percent = {
  min: 0,
  max: 100,
  step: 0.25,
  addonAfter: '%',
  style: { width: '100%' },
};

/**
 * Benefits & Incentives (SRS 4.6). Statutory rates start blank rather than at an
 * assumed figure: enter the rates currently in force for your payroll.
 */
const Benefits = () => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const { data, loading, error } = useBenefitsQuery({
    fetchPolicy: 'network-only',
  });
  const [update, { loading: saving }] = useUpdateBenefitsMutation({
    onCompleted: () => messageApi?.success('Rates saved. They apply the next time payroll is computed.'),
    onError,
  });

  useEffect(() => {
    if (data?.benefits) form.setFieldsValue(data.benefits);
  }, [data, form]);

  if (error) return <Alert type="error" showIcon message="Rates couldn't load." description={error.message} />;
  if (loading && !data) return <Skeleton active />;

  const statutoryUnset = ['sssRate', 'philhealthRate', 'pagibigRate'].every(
    (k) => !Number((data?.benefits as any)?.[k]),
  );

  return (
    <Form form={form} layout="vertical" onFinish={(values) => update({ variables: { request: values } })}>
      {statutoryUnset ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Statutory rates are not set"
          description="Regular employees are paid without SSS, PhilHealth or Pag-IBIG deductions until you enter the current employee-share rates below."
        />
      ) : null}
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <Card size="small" title="Statutory deductions (regular employees only)" style={{ height: '100%' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Employee share, as a percentage of gross pay. Contractual employees have none.
            </Text>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="sssRate" label="SSS">
                  <InputNumber {...percent} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="philhealthRate" label="PhilHealth">
                  <InputNumber {...percent} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="pagibigRate" label="Pag-IBIG">
                  <InputNumber {...percent} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="withholdingTaxRate" label="Withholding tax" extra="Applied after contributions.">
                  <InputNumber {...percent} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title="Hours and incentives" style={{ height: '100%' }}>
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="standardHoursPerDay"
                  label="Regular hours per day"
                  extra="Beyond this counts as overtime."
                >
                  <InputNumber min={1} max={24} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="overtimeMultiplier" label="Overtime multiplier" extra="Times the hourly rate.">
                  <InputNumber min={1} step={0.05} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="defaultPieceRate"
                  label="Default piece rate"
                  extra="Per good unit, for work orders without their own rate."
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit" loading={saving} style={{ marginTop: 12 }}>
        Save Rates
      </Button>
    </Form>
  );
};

export default Benefits;
