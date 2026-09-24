import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  TimePicker,
  Typography,
} from 'antd';

import { useAttendanceQuery, useClockAttendanceMutation, useListStaffQuery, useSaveAttendanceMutation } from '@/gql';
import { StatusBadge } from '@/components/shared/columns';
import { useMessageContext } from '@/components/common/message-context';
import { attendanceStatusEnum } from '@/utils/enum';
import { formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

const time = (value?: string | null) => (value ? dayjs(value).format('h:mm A') : '—');

/** Combines a calendar day with a picked time of day. */
const at = (day: Dayjs, t?: Dayjs | null) =>
  t ? day.hour(t.hour()).minute(t.minute()).second(0).millisecond(0).toISOString() : null;

/** Time & Attendance (SRS 4.6): shop clock in and out, hours and daily presence. */
const Attendance = () => {
  const { messageApi } = useMessageContext();
  const [day, setDay] = useState<Dayjs>(dayjs());
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const isToday = day.isSame(dayjs(), 'day');

  const staff = useListStaffQuery({ fetchPolicy: 'network-only' });
  const records = useAttendanceQuery({
    variables: { request: { date: day.format('YYYY-MM-DD') } },
    fetchPolicy: 'network-only',
  });

  const [clock, { loading: clocking }] = useClockAttendanceMutation({
    onCompleted: (data) => {
      messageApi?.success(data.clockAttendance?.timeOut ? 'Clocked out' : 'Clocked in');
      records.refetch();
    },
    onError,
  });
  const [save, { loading: saving }] = useSaveAttendanceMutation({
    onCompleted: () => {
      messageApi?.success('Attendance saved');
      setEditing(null);
      records.refetch();
    },
    onError,
  });

  const byStaff = new Map((records.data?.attendance ?? []).map((r: any) => [r.staffUuid, r]));
  const rows = (staff.data?.listStaff ?? [])
    .filter((s: any) => s.status !== 'inactive')
    .map((s: any) => ({ staff: s, record: byStaff.get(s.uuid) as any }));
  const present = rows.filter((r) => ['present', 'late'].includes(r.record?.status)).length;

  const openEdit = (row: any) => {
    setEditing(row);
    form.setFieldsValue({
      status: row.record?.status ?? 'present',
      timeIn: row.record?.timeIn ? dayjs(row.record.timeIn) : null,
      timeOut: row.record?.timeOut ? dayjs(row.record.timeOut) : null,
      notes: row.record?.notes,
    });
  };

  const failed = staff.error || records.error;

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <DatePicker
            value={day}
            allowClear={false}
            onChange={(d) => d && setDay(d)}
            disabledDate={(d) => d.isAfter(dayjs(), 'day')}
            aria-label="Attendance date"
          />
          <Text type="secondary">
            <span className="tabular-figures">
              {present} of {rows.length}
            </span>{' '}
            present
          </Text>
        </Space>
      }
    >
      {failed ? (
        <Alert type="error" showIcon message="Attendance couldn't load." description={failed.message} />
      ) : (
        <Table
          size="small"
          rowKey={(r: any) => r.staff.uuid}
          loading={staff.loading || records.loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={rows}
          locale={{
            emptyText: 'No active employees. Add them under HR, Employees.',
          }}
          columns={[
            {
              title: 'Employee',
              render: (_: any, r: any) => (
                <div>
                  <div>{r.staff.name ?? r.staff.email}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {r.staff.position ?? ''}
                  </Text>
                </div>
              ),
            },
            {
              title: 'Status',
              render: (_: any, r: any) =>
                r.record ? (
                  <StatusBadge value={r.record.status} valueEnum={attendanceStatusEnum} />
                ) : (
                  <Text type="secondary">Not recorded</Text>
                ),
            },
            { title: 'In', render: (_: any, r: any) => time(r.record?.timeIn) },
            {
              title: 'Out',
              render: (_: any, r: any) => time(r.record?.timeOut),
            },
            {
              title: 'Regular hrs',
              align: 'right',
              render: (_: any, r: any) => (
                <span className="tabular-figures">{formatQty(r.record?.regularHours ?? 0)}</span>
              ),
            },
            {
              title: 'Overtime hrs',
              align: 'right',
              render: (_: any, r: any) => (
                <span className="tabular-figures">{formatQty(r.record?.overtimeHours ?? 0)}</span>
              ),
            },
            {
              title: 'Actions',
              render: (_: any, r: any) => (
                <Space size={0}>
                  {isToday && !r.record?.timeOut ? (
                    <Button
                      size="small"
                      type="link"
                      loading={clocking}
                      onClick={() =>
                        clock({
                          variables: { request: { uuid: r.staff.uuid } },
                        })
                      }
                    >
                      {r.record?.timeIn ? 'Clock Out' : 'Clock in'}
                    </Button>
                  ) : null}
                  <Button size="small" type="link" onClick={() => openEdit(r)}>
                    Edit
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={!!editing}
        title={`${editing?.staff.name ?? ''}, ${day.format('MMM D, YYYY')}`}
        onCancel={() => setEditing(null)}
        onOk={() => form.submit()}
        okText="Save"
        confirmLoading={saving}
        destroyOnClose
        width="min(440px, 100vw)"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) =>
            save({
              variables: {
                request: {
                  staffUuid: editing.staff.uuid,
                  workDate: day.format('YYYY-MM-DD'),
                  status: v.status,
                  timeIn: at(day, v.timeIn),
                  timeOut: at(day, v.timeOut),
                  notes: v.notes,
                },
              },
            })
          }
        >
          <Form.Item name="status" label="Status">
            <Select options={Object.entries(attendanceStatusEnum).map(([value, e]) => ({ value, label: e.text }))} />
          </Form.Item>
          <Space wrap>
            <Form.Item name="timeIn" label="Time in">
              <TimePicker format="h:mm A" use12Hours minuteStep={5} />
            </Form.Item>
            <Form.Item name="timeOut" label="Time out">
              <TimePicker format="h:mm A" use12Hours minuteStep={5} />
            </Form.Item>
          </Space>
          <Form.Item name="notes" label="Notes">
            <Input placeholder="Optional" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Attendance;
