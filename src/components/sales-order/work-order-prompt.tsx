import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Checkbox, InputNumber, Modal, Select, Skeleton, Space, Table, Typography } from 'antd';

import { useCreateWorkOrderMutation, useListStaffQuery, useSalesOrderWorkOrdersQuery } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { formatQty } from '@/utils/format';
import { onError } from '@/utils';

const { Text } = Typography;

type Row = {
  salesOrderItemUuid: string;
  itemName: string;
  bomUuid: string;
  bomName: string;
  availableQty: number;
  suggestedQty: number;
  reason: string;
  selected: boolean;
  qty: number;
  assignedStaffUuid?: string;
  pieceRate?: number;
};

/**
 * Work order prompt (SRS 4.1): after an order is saved, lines for custom parts or
 * without enough finished stock can be sent to the shop floor in one step.
 */
const WorkOrderPrompt = ({ salesOrderUuid, onClose }: { salesOrderUuid?: string; onClose: () => void }) => {
  const { messageApi } = useMessageContext();
  const [rows, setRows] = useState<Row[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, loading, error } = useSalesOrderWorkOrdersQuery({
    skip: !salesOrderUuid,
    variables: { request: { salesOrderUuid } },
    fetchPolicy: 'network-only',
  });
  const staff = useListStaffQuery({ skip: !salesOrderUuid });
  const [createWorkOrder] = useCreateWorkOrderMutation({ onError });

  const order: any = data?.salesOrder;

  useEffect(() => {
    setRows(
      (order?.workOrderSuggestions ?? []).map((s: any) => ({
        ...s,
        selected: true,
        qty: Number(s.suggestedQty),
      })),
    );
  }, [order]);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const chosen = rows.filter((r) => r.selected && r.qty > 0);

  const submit = async () => {
    if (!order || !chosen.length) return onClose();
    setSaving(true);
    try {
      for (const row of chosen) {
        const result = await createWorkOrder({
          variables: {
            request: {
              bomUuid: row.bomUuid,
              warehouseUuid: order.warehouseUuid,
              plannedQty: row.qty,
              salesOrderUuid: order.uuid,
              assignedStaffUuid: row.assignedStaffUuid,
              pieceRate: row.pieceRate ?? 0,
            },
          },
        });
        if (result.errors) return;
      }
      messageApi?.success(`${chosen.length} work order${chosen.length === 1 ? '' : 's'} sent to the shop floor`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const staffOptions = (staff.data?.listStaff ?? [])
    .filter((s: any) => s.status !== 'inactive')
    .map((s: any) => ({ value: s.uuid, label: s.name ?? s.email }));

  return (
    <Modal
      open={!!salesOrderUuid}
      title={order ? `Work orders for ${order.code}` : 'Work orders'}
      onCancel={onClose}
      onOk={submit}
      okText={chosen.length ? `Create ${chosen.length} work order${chosen.length === 1 ? '' : 's'}` : 'Close'}
      cancelText="Not Now"
      confirmLoading={saving}
      width="min(900px, 100vw)"
      destroyOnClose
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="Couldn't check this order for work to make."
          description={error.message}
        />
      ) : !rows.length ? (
        <Alert
          type="success"
          showIcon
          message="Nothing to make for this order."
          description={
            order?.workOrders?.length
              ? `Already on the shop floor: ${order.workOrders.map((w: any) => w.code).join(', ')}.`
              : 'Finished stock covers every line, or the items have no bill of materials.'
          }
        />
      ) : (
        <>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            These lines need making.
            {order?.requiredDate
              ? ` Work orders will be due on the target date, ${dayjs(order.requiredDate).format('MMM D')}.`
              : ''}
          </Text>
          <Table
            size="small"
            rowKey="salesOrderItemUuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={rows}
            columns={[
              {
                title: '',
                width: 40,
                render: (_: any, row: Row, i: number) => (
                  <Checkbox
                    checked={row.selected}
                    aria-label={`Make ${row.itemName}`}
                    onChange={(e) => update(i, { selected: e.target.checked })}
                  />
                ),
              },
              {
                title: 'Item',
                render: (_: any, row: Row) => (
                  <>
                    <div>{row.itemName}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {row.reason} · {formatQty(row.availableQty)} in stock
                    </Text>
                  </>
                ),
              },
              {
                title: 'Qty to Make',
                render: (_: any, row: Row, i: number) => (
                  <InputNumber min={1} value={row.qty} onChange={(v) => update(i, { qty: Number(v ?? 0) })} />
                ),
              },
              {
                title: 'Assign to',
                render: (_: any, row: Row, i: number) => (
                  <Select
                    allowClear
                    style={{ width: 180 }}
                    placeholder="Machinist"
                    options={staffOptions}
                    value={row.assignedStaffUuid}
                    onChange={(v) => update(i, { assignedStaffUuid: v })}
                  />
                ),
              },
              {
                title: 'Piece Rate',
                render: (_: any, row: Row, i: number) => (
                  <Space>
                    <InputNumber
                      min={0}
                      value={row.pieceRate}
                      placeholder="0"
                      style={{ width: 100 }}
                      onChange={(v) => update(i, { pieceRate: Number(v ?? 0) })}
                    />
                  </Space>
                ),
              },
            ]}
          />
        </>
      )}
    </Modal>
  );
};

export default WorkOrderPrompt;
