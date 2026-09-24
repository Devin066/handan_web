import dayjs from 'dayjs';
import { Alert, Descriptions, Drawer, Empty, Progress, Skeleton, Table, Tag, Typography } from 'antd';

import { StatusBadge } from '@/components/shared/columns';
import { useMessageContext } from '@/components/common/message-context';
import { tokens } from '@/components/common/theme';
import { useReportJobCardMutation, useWorkOrderQuery } from '@/gql';
import { workOrderStatusEnum } from '@/utils/enum';
import { formatQty } from '@/utils/format';
import { onError } from '@/utils';

import ReportJobCard from './report-job-card';

const { Text, Title } = Typography;

const when = (value?: string | null) => (value ? dayjs(value).format('MMM D, YYYY HH:mm') : '—');

const Qty = ({ value, uom }: { value: unknown; uom?: string | null }) => (
  <span className="tabular-figures">
    {formatQty(value)} {uom ? <Text type="secondary">{uom}</Text> : null}
  </span>
);

/**
 * A work order and everything done against it.
 *
 * Production steps (API: work order items) are the processes from the product's
 * BOM routing, one per operation, each needing the work order's quantity. Job
 * cards are the progress reports against a step: who did how many, and when.
 */
const WorkOrderDetail = ({ uuid, visible, onClose, onChanged }: any) => {
  const { messageApi } = useMessageContext();

  const { data, loading, error, refetch } = useWorkOrderQuery({
    skip: !uuid || !visible,
    variables: { request: { uuid } },
    fetchPolicy: 'network-only',
  });
  const order: any = data?.workOrder;

  const [reportJobCard] = useReportJobCardMutation({
    onCompleted: () => {
      messageApi?.success('Progress reported');
      refetch();
      onChanged?.();
    },
    onError,
  });

  const steps = [...(order?.items ?? [])].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
  const uom = order?.uomName;
  const isOpen = order && order.status !== 'completed' && order.status !== 'cancelled';

  return (
    <Drawer width="min(960px, 100vw)" title={order?.code ?? 'Work Order'} onClose={onClose} open={visible}>
      {loading && !order ? (
        <Skeleton active />
      ) : error || !order ? (
        <Alert type="error" showIcon message="Couldn't load this work order." description={error?.message} />
      ) : (
        <>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={[
              { key: 'p', label: 'Product', children: order.itemName },
              {
                key: 's',
                label: 'Status',
                children: <StatusBadge value={order.status} valueEnum={workOrderStatusEnum} />,
              },
              { key: 'q', label: 'Planned', children: <Qty value={order.plannedQty} uom={uom} /> },
              { key: 'd', label: 'Produced', children: <Qty value={order.producedQty} uom={uom} /> },
              { key: 'st', label: 'Stocked in', children: <Qty value={order.storedQty} uom={uom} /> },
              { key: 'start', label: 'Start', children: when(order.startTime) },
              { key: 'end', label: 'End', children: when(order.endTime) },
            ]}
          />

          <Title level={5} style={{ marginTop: 24, marginBottom: 4 }}>
            Production Steps
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            The operations from this product&apos;s BOM, in order. Report progress on a step as work is finished; expand
            a step to see its history.
          </Text>

          <Table
            size="small"
            rowKey="uuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={steps}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No production steps. The product's BOM has no processes."
                />
              ),
            }}
            expandable={{
              rowExpandable: (step: any) => (step.jobCards ?? []).length > 0,
              expandedRowRender: (step: any) => (
                <Table
                  size="small"
                  rowKey="uuid"
                  pagination={false}
                  dataSource={step.jobCards}
                  columns={[
                    { title: 'Operator', key: 'op', render: (_, card: any) => card.operatorStaff?.email ?? '—' },
                    {
                      title: 'Completed',
                      dataIndex: 'producedQty',
                      align: 'right',
                      render: (v) => <Qty value={v} uom={uom} />,
                    },
                    { title: 'Started', dataIndex: 'startTime', render: when },
                    { title: 'Finished', dataIndex: 'endTime', render: when },
                  ]}
                />
              ),
            }}
            columns={[
              {
                title: 'Step',
                key: 'step',
                render: (_, step: any, index) => (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Step {index + 1}
                    </Text>
                    <div style={{ fontWeight: 500 }}>{step.processName ?? 'Unnamed process'}</div>
                  </div>
                ),
              },
              {
                title: 'Progress',
                key: 'progress',
                width: 260,
                render: (_, step: any) => {
                  const required = Number(step.requiredQty ?? 0);
                  const produced = Number(step.producedQty ?? 0);
                  const done = required > 0 && produced >= required;
                  return (
                    <div style={{ minWidth: 200 }}>
                      <span className="tabular-figures" style={{ color: done ? tokens.success : undefined }}>
                        {formatQty(produced)} / {formatQty(required)}
                      </span>{' '}
                      <Text type="secondary">{uom}</Text>
                      <Progress
                        percent={required ? Math.min(100, Math.round((produced / required) * 100)) : 0}
                        size="small"
                        showInfo={false}
                        status={done ? 'success' : 'normal'}
                        strokeColor={done ? tokens.success : tokens.primary}
                      />
                    </div>
                  );
                },
              },
              {
                title: 'Reports',
                key: 'reports',
                align: 'right',
                render: (_, step: any) => (
                  <Text type="secondary" className="tabular-figures">
                    {(step.jobCards ?? []).length}
                  </Text>
                ),
              },
              {
                title: '',
                key: 'action',
                align: 'right',
                render: (_, step: any) => {
                  if (Number(step.producedQty) >= Number(step.requiredQty)) return <Tag color="success">Done</Tag>;
                  if (!isOpen) return null;
                  return (
                    <ReportJobCard
                      record={step}
                      onCreate={(request: any) => reportJobCard({ variables: { request } })}
                    />
                  );
                },
              },
            ]}
          />

          <Title level={5} style={{ marginTop: 24, marginBottom: 12 }}>
            Materials
          </Title>
          <Table
            size="small"
            rowKey="uuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            dataSource={order.materialRequests ?? []}
            locale={{ emptyText: 'No materials required.' }}
            columns={[
              { title: 'Material', dataIndex: 'itemName' },
              { title: 'Warehouse', key: 'wh', render: (_, m: any) => m.warehouse?.name ?? '—' },
              {
                title: 'Required',
                dataIndex: 'actualQty',
                align: 'right',
                render: (v, m: any) => <Qty value={v} uom={m.uomName} />,
              },
              {
                title: 'Issued',
                dataIndex: 'receivedQty',
                align: 'right',
                render: (v, m: any) => <Qty value={v} uom={m.uomName} />,
              },
              {
                title: 'Still Needed',
                dataIndex: 'remainingQty',
                align: 'right',
                render: (v, m: any) => (
                  <span style={{ color: Number(v) > 0 ? tokens.warning : undefined }}>
                    <Qty value={v} uom={m.uomName} />
                  </span>
                ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  );
};

export default WorkOrderDetail;
