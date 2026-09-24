import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  Typography,
} from 'antd';

import client from '@/gql/apollo';
import { ListStaffDocument, usePayslipsQuery, useSaveStaffMutation } from '@/gql';
import DataTable from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/columns';
import { useMessageContext } from '@/components/common/message-context';
import { EMPLOYMENT_TYPES, STAFF_STATUSES } from '@/config/staff';
import { formatCurrency, formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

const staffStatusEnum = {
  active: { text: 'Active', status: 'Success' as const },
  inactive: { text: 'Inactive', status: 'Default' as const },
};

const options = (source: Record<string, string>) => Object.entries(source).map(([value, label]) => ({ value, label }));

const EmployeeForm = ({ employee, onClose, onSaved }: { employee: any; onClose: () => void; onSaved: () => void }) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!employee?.uuid;

  const [save, { loading }] = useSaveStaffMutation({
    onCompleted: (data) => {
      messageApi?.success(`${data.saveStaff?.name} ${editing ? 'updated' : 'added'}`);
      onSaved();
      onClose();
    },
    onError,
  });

  return (
    <Modal
      open={!!employee}
      title={editing ? `Edit ${employee.name ?? employee.email}` : 'Add employee'}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={editing ? 'Save changes' : 'Add employee'}
      confirmLoading={loading}
      width="min(640px, 100vw)"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={{
          employmentType: 'regular',
          status: 'active',
          ...employee,
          hiredAt: employee?.hiredAt ? dayjs(employee.hiredAt) : undefined,
        }}
        onFinish={(values) =>
          save({
            variables: {
              request: {
                uuid: employee?.uuid,
                name: values.name,
                email: values.email,
                phone: values.phone,
                position: values.position,
                employmentType: values.employmentType,
                shift: values.shift,
                status: values.status,
                baseRate: Number(values.baseRate ?? 0),
                hiredAt: values.hiredAt ? values.hiredAt.startOf('day').toISOString() : null,
              },
            },
          })
        }
      >
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name="name" label="Name" rules={[{ required: true, whitespace: true, message: 'Enter a name' }]}>
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: 'Enter a valid email',
                },
              ]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="position" label="Position">
              <Input placeholder="Machinist, fabricator, admin" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label="Mobile">
              <Input placeholder="09XX XXX XXXX" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="employmentType"
              label="Employment status"
              extra="Regular staff get statutory benefits and tax withholding. Contractual staff do not."
            >
              <Select options={options(EMPLOYMENT_TYPES)} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="baseRate" label="Hourly rate">
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="hiredAt" label="Hired on">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="status" label="Status">
              <Select options={options(STAFF_STATUSES)} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

/** Payslips and completed work order output for one employee. */
const EmployeeDrawer = ({ employee, onClose }: { employee: any; onClose: () => void }) => {
  const { data, loading } = usePayslipsQuery({
    skip: !employee,
    variables: { request: { uuid: employee?.uuid } },
    fetchPolicy: 'network-only',
  });
  const payslips = (data?.payslips ?? []) as any[];
  const output = (data?.staffPerformance ?? []) as any[];

  return (
    <Drawer open={!!employee} onClose={onClose} width="min(760px, 100vw)" title={employee?.name ?? employee?.email}>
      <Descriptions size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Position">{employee?.position ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="Employment">
          {EMPLOYMENT_TYPES[employee?.employmentType as keyof typeof EMPLOYMENT_TYPES] ?? employee?.employmentType}
        </Descriptions.Item>
        <Descriptions.Item label="Hourly rate">{formatCurrency(employee?.baseRate)}</Descriptions.Item>
        <Descriptions.Item label="Hired">
          {employee?.hiredAt ? dayjs(employee.hiredAt).format('YYYY-MM-DD') : '—'}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        items={[
          {
            key: 'payslips',
            label: `Payslips (${payslips.length})`,
            children: (
              <Table
                size="small"
                rowKey="uuid"
                loading={loading}
                pagination={false}
                scroll={{ x: 'max-content' }}
                dataSource={payslips}
                locale={{
                  emptyText: 'No payroll has included this employee yet.',
                }}
                expandable={{
                  expandedRowRender: (p: any) => (
                    <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                      <Descriptions.Item label="Regular hours">{formatQty(p.regularHours)}</Descriptions.Item>
                      <Descriptions.Item label="Overtime hours">{formatQty(p.overtimeHours)}</Descriptions.Item>
                      <Descriptions.Item label="Base pay">{formatCurrency(p.basePay)}</Descriptions.Item>
                      <Descriptions.Item label="Overtime pay">{formatCurrency(p.overtimePay)}</Descriptions.Item>
                      <Descriptions.Item label={`Piece rate (${formatQty(p.unitsProduced)} units)`}>
                        {formatCurrency(p.incentivePay)}
                      </Descriptions.Item>
                      <Descriptions.Item label="SSS">{formatCurrency(p.sssDeduction)}</Descriptions.Item>
                      <Descriptions.Item label="PhilHealth">{formatCurrency(p.philhealthDeduction)}</Descriptions.Item>
                      <Descriptions.Item label="Pag-IBIG">{formatCurrency(p.pagibigDeduction)}</Descriptions.Item>
                      <Descriptions.Item label="Withholding tax">{formatCurrency(p.taxDeduction)}</Descriptions.Item>
                    </Descriptions>
                  ),
                }}
                columns={[
                  { title: 'Period', dataIndex: 'periodName' },
                  { title: 'Days', dataIndex: 'daysPresent', align: 'right' },
                  {
                    title: 'Gross',
                    align: 'right',
                    render: (_: any, p: any) => <span className="tabular-figures">{formatCurrency(p.grossPay)}</span>,
                  },
                  {
                    title: 'Net pay',
                    align: 'right',
                    render: (_: any, p: any) => (
                      <span className="tabular-figures" style={{ fontWeight: 600 }}>
                        {formatCurrency(p.netPay)}
                      </span>
                    ),
                  },
                ]}
              />
            ),
          },
          {
            key: 'output',
            label: `Work order output (${output.length})`,
            children: (
              <Table
                size="small"
                rowKey="uuid"
                loading={loading}
                pagination={{ pageSize: 20 }}
                scroll={{ x: 'max-content' }}
                dataSource={output}
                locale={{
                  emptyText: 'No completed work reported by this employee.',
                }}
                columns={[
                  {
                    title: 'Date',
                    render: (_: any, c: any) => dayjs(c.insertedAt).format('YYYY-MM-DD'),
                  },
                  {
                    title: 'Work order',
                    render: (_: any, c: any) => <span className="doc-code">{c.workOrder?.code}</span>,
                  },
                  {
                    title: 'Part',
                    render: (_: any, c: any) => c.workOrder?.itemName,
                  },
                  {
                    title: 'Step',
                    render: (_: any, c: any) => c.workOrderItem?.processName,
                  },
                  {
                    title: 'Good',
                    align: 'right',
                    render: (_: any, c: any) => formatQty(c.producedQty),
                  },
                  {
                    title: 'Defective',
                    align: 'right',
                    render: (_: any, c: any) => formatQty(c.defectiveQty),
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </Drawer>
  );
};

/** Employee Profile Management (SRS 4.6). */
const EmployeeList = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'Employee',
      dataIndex: 'name',
      render: (_, r) => (
        <div>
          <a onClick={() => setViewing(r)} style={{ fontWeight: 500 }}>
            {r.name ?? r.email}
          </a>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {[r.position, r.email].filter(Boolean).join(' · ')}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Employment',
      dataIndex: 'employmentType',
      width: 120,
      render: (_, r) => EMPLOYMENT_TYPES[r.employmentType as keyof typeof EMPLOYMENT_TYPES] ?? r.employmentType,
    },
    {
      title: 'Hourly rate',
      dataIndex: 'baseRate',
      width: 120,
      align: 'right',
      render: (_, r) => <span className="tabular-figures">{formatCurrency(r.baseRate)}</span>,
    },
    { title: 'Hired', dataIndex: 'hiredAt', valueType: 'date' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (_, r) => <StatusBadge value={r.status} valueEnum={staffStatusEnum} />,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 160,
      render: (_, r) => [
        <Button key="payslips" size="small" type="link" onClick={() => setViewing(r)}>
          Payslips
        </Button>,
        <Button key="edit" size="small" type="link" onClick={() => setEditing(r)}>
          Edit
        </Button>,
      ],
    },
  ];

  return (
    <>
      <DataTable
        entityName="employees"
        emptyHint="Add the shop's machinists, fabricators and admin staff."
        actionRef={actionRef}
        columns={columns}
        request={async () => {
          const { data } = await client.query({
            query: ListStaffDocument,
            fetchPolicy: 'network-only',
          });
          const staff = data?.listStaff ?? [];
          return { data: staff, total: staff.length, success: true };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" size="small" onClick={() => setEditing({})}>
            Add employee
          </Button>,
        ]}
      />
      <EmployeeForm employee={editing} onClose={() => setEditing(null)} onSaved={() => actionRef.current?.reload()} />
      <EmployeeDrawer employee={viewing} onClose={() => setViewing(null)} />
    </>
  );
};

export default EmployeeList;
