import { useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Space, Table, Typography } from 'antd';

import { useFinalizePayrollMutation, useGeneratePayrollMutation, usePayrollPeriodsQuery } from '@/gql';
import { StatusBadge } from '@/components/shared/columns';
import { useMessageContext } from '@/components/common/message-context';
import { payrollStatusEnum } from '@/utils/enum';
import { formatCurrency, formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

const money = (value: unknown) => <span className="tabular-figures">{formatCurrency(value)}</span>;

/** Payroll (SRS 4.6): attendance hours plus work order piece rates, per period. */
const Payroll = () => {
  const { messageApi } = useMessageContext();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const { data, loading, error, refetch } = usePayrollPeriodsQuery({
    fetchPolicy: 'network-only',
  });

  const [generate, { loading: generating }] = useGeneratePayrollMutation({
    onCompleted: () => {
      messageApi?.success('Payroll computed');
      setOpen(false);
      refetch();
    },
    onError,
  });
  const [finalize] = useFinalizePayrollMutation({
    onCompleted: () => {
      messageApi?.success('Payroll finalized and posted to the ledger');
      refetch();
    },
    onError,
  });

  const recompute = (p: any) =>
    generate({
      variables: {
        request: {
          uuid: p.uuid,
          name: p.name,
          startDate: dayjs(p.startDate).format('YYYY-MM-DD'),
          endDate: dayjs(p.endDate).format('YYYY-MM-DD'),
        },
      },
    });

  const periods = (data?.payrollPeriods ?? []) as any[];

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Button type="primary" size="small" onClick={() => setOpen(true)}>
          Run payroll
        </Button>
        <Text type="secondary">
          Pay is hours times the hourly rate, overtime at the Benefits multiplier, plus piece rate for each good unit
          reported on work orders.
        </Text>
      </Space>

      {error ? <Alert type="error" showIcon message="Payroll couldn't load." description={error.message} /> : null}
      {!loading && !error && !periods.length ? (
        <Alert type="info" showIcon message="No payroll yet. Run one for a pay period to compute everyone's pay." />
      ) : null}

      {periods.map((p) => (
        <Card
          key={p.uuid}
          size="small"
          title={
            <Space wrap>
              <span>{p.name}</span>
              <StatusBadge value={p.status} valueEnum={payrollStatusEnum} />
            </Space>
          }
          extra={
            p.status === 'draft' ? (
              <Space>
                <Button size="small" onClick={() => recompute(p)} loading={generating}>
                  Recompute
                </Button>
                <Popconfirm
                  title="Finalize this payroll?"
                  description="It can no longer be recomputed, and wages post to the accounting ledger."
                  okText="Finalize"
                  onConfirm={() => finalize({ variables: { request: { uuid: p.uuid } } })}
                >
                  <Button size="small" type="primary">
                    Finalize
                  </Button>
                </Popconfirm>
              </Space>
            ) : null
          }
        >
          <Table
            size="small"
            rowKey="uuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={p.entries ?? []}
            locale={{
              emptyText: 'Nobody had hours or work order output in this period.',
            }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={8}>
                  <Text strong>Total net pay</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong>{money(p.totalNetPay)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
            columns={[
              {
                title: 'Employee',
                render: (_: any, e: any) => (
                  <div>
                    <div>{e.staffName}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {e.employmentType === 'contractual' ? 'Contractual' : 'Regular'} · {formatCurrency(e.hourlyRate)}
                      /hr
                    </Text>
                  </div>
                ),
              },
              {
                title: 'Hours',
                align: 'right',
                render: (_: any, e: any) => (
                  <span className="tabular-figures">
                    {formatQty(e.regularHours)}
                    {Number(e.overtimeHours) ? ` + ${formatQty(e.overtimeHours)} OT` : ''}
                  </span>
                ),
              },
              {
                title: 'Base',
                align: 'right',
                render: (_: any, e: any) => money(e.basePay),
              },
              {
                title: 'Overtime',
                align: 'right',
                render: (_: any, e: any) => money(e.overtimePay),
              },
              {
                title: 'Piece rate',
                align: 'right',
                render: (_: any, e: any) => (
                  <div>
                    {money(e.incentivePay)}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatQty(e.unitsProduced)} units
                      </Text>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Gross',
                align: 'right',
                render: (_: any, e: any) => money(e.grossPay),
              },
              {
                title: 'Contributions',
                align: 'right',
                render: (_: any, e: any) =>
                  money(Number(e.sssDeduction) + Number(e.philhealthDeduction) + Number(e.pagibigDeduction)),
              },
              {
                title: 'Tax',
                align: 'right',
                render: (_: any, e: any) => money(e.taxDeduction),
              },
              {
                title: 'Net pay',
                align: 'right',
                render: (_: any, e: any) => <strong>{money(e.netPay)}</strong>,
              },
            ]}
          />
        </Card>
      ))}

      <Modal
        open={open}
        title="Run payroll"
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Compute"
        confirmLoading={generating}
        destroyOnClose
        width="min(460px, 100vw)"
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          onFinish={(v) =>
            generate({
              variables: {
                request: {
                  name: v.name,
                  startDate: v.period[0].format('YYYY-MM-DD'),
                  endDate: v.period[1].format('YYYY-MM-DD'),
                  payDate: v.payDate ? v.payDate.format('YYYY-MM-DD') : null,
                },
              },
            })
          }
        >
          <Form.Item name="period" label="Pay period" rules={[{ required: true, message: 'Choose the period' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input placeholder="Defaults to the date range" />
          </Form.Item>
          <Form.Item name="payDate" label="Pay date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default Payroll;
