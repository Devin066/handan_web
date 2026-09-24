import Link from 'next/link';
import { Alert, Button, Card, Col, Empty, List, Row, Skeleton, Tag, Typography } from 'antd';
import {
  ArrowRightOutlined,
  ContainerOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
} from '@ant-design/icons';

import {
  useDeliveryNotesQuery,
  usePurchaseOrdersQuery,
  useReceiptNotesQuery,
  useSalesOrdersQuery,
  useWorkOrdersQuery,
} from '@/gql';
import { formatCurrency, formatQty } from '@/utils/format';
import { tokens } from '@/components/common/theme';

const { Text } = Typography;

const sum = (rows: any[] | undefined | null, field: string) =>
  (rows ?? []).reduce((total, row) => total + Number(row?.[field] ?? 0), 0);

/**
 * One figure in the KPI strip. The caption says what the number is for, so it
 * is not just a figure. Cells share one panel, divided by rules, so the row reads
 * as a single status line rather than four unrelated cards.
 */
const Kpi = ({
  title,
  value,
  caption,
  icon,
  attention,
  loading,
  href,
}: {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  /** Amber value: reserved for figures that need the operator's attention. */
  attention?: boolean;
  loading: boolean;
  href: string;
}) => (
  <Link href={href} className="kpi-cell">
    {loading ? (
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
    ) : (
      <>
        <div className="kpi-label">
          {icon}
          <span>{title}</span>
        </div>
        <div className="kpi-value tabular-figures" style={{ color: attention ? tokens.accent : tokens.text }}>
          {value}
        </div>
        <div className="kpi-caption">{caption}</div>
      </>
    )}
  </Link>
);

/** A short worklist. Empty is a good outcome here, so it says so plainly. */
const WorkList = ({
  title,
  href,
  items,
  loading,
  emptyText,
  renderMeta,
}: {
  title: string;
  href: string;
  items: any[];
  loading: boolean;
  emptyText: string;
  renderMeta: (item: any) => React.ReactNode;
}) => (
  <Card
    size="small"
    title={title}
    style={{ height: '100%', borderColor: tokens.border }}
    extra={
      <Link href={href} style={{ fontSize: 13 }}>
        View all <ArrowRightOutlined style={{ fontSize: 11 }} />
      </Link>
    }
  >
    {loading ? (
      <Skeleton active paragraph={{ rows: 3 }} title={false} />
    ) : items.length === 0 ? (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<Text type="secondary">{emptyText}</Text>}
        style={{ margin: '12px 0' }}
      />
    ) : (
      <List
        size="small"
        dataSource={items.slice(0, 5)}
        renderItem={(item: any) => (
          <List.Item style={{ paddingInline: 0 }}>
            <List.Item.Meta
              title={<span className="doc-code">{item.code}</span>}
              description={<span style={{ fontSize: 12 }}>{renderMeta(item)}</span>}
            />
          </List.Item>
        )}
      />
    )}
  </Card>
);

/**
 * The screen an operator lands on. It answers "what needs me today?" — money
 * outstanding, goods owed, and work in progress — rather than showing totals
 * that nobody acts on.
 */
const Dashboard = () => {
  const salesOrders = useSalesOrdersQuery();
  const purchaseOrders = usePurchaseOrdersQuery();
  const workOrders = useWorkOrdersQuery();
  const deliveryNotes = useDeliveryNotesQuery();
  const receiptNotes = useReceiptNotesQuery();

  const queries = [salesOrders, purchaseOrders, workOrders, deliveryNotes, receiptNotes];
  const loading = queries.some((q) => q.loading);
  const failed = queries.some((q) => q.error);

  const so = (salesOrders.data?.salesOrders ?? []) as any[];
  const po = (purchaseOrders.data?.purchaseOrders ?? []) as any[];
  const wo = (workOrders.data?.workOrders ?? []) as any[];
  const dn = (deliveryNotes.data?.deliveryNotes ?? []) as any[];
  const rn = (receiptNotes.data?.receiptNotes ?? []) as any[];

  const receivable = sum(so, 'remainingAmount');
  const payable = sum(po, 'remainingAmount');

  const toDeliver = so.filter((o) => o?.deliveryStatus !== 'fully_delivered');
  const toReceive = po.filter((o) => o?.receiptStatus !== 'fully_received');
  const openWork = wo.filter((o) => o?.status !== 'completed' && o?.status !== 'cancelled');
  const pendingStockOut = dn.filter((n) => n?.status === 'to_deliver');
  const pendingStockIn = rn.filter((n) => n?.status === 'to_receive');

  // Zeros from a failed request would read as real balances, so show nothing.
  if (failed) {
    return (
      <Alert
        type="error"
        showIcon
        message="The dashboard couldn't load."
        description="Figures are hidden rather than shown as zero. Check your connection and try again."
        action={
          <Button size="small" onClick={() => queries.forEach((q) => q.refetch())}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="kpi-strip">
        <Kpi
          title="Receivable"
          value={formatCurrency(receivable)}
          caption={`across ${so.length} sales order${so.length === 1 ? '' : 's'}`}
          attention={receivable > 0}
          icon={<DollarOutlined />}
          loading={loading}
          href="/selling/sales-orders"
        />
        <Kpi
          title="Payable"
          value={formatCurrency(payable)}
          caption={`across ${po.length} purchase order${po.length === 1 ? '' : 's'}`}
          icon={<ShoppingCartOutlined />}
          loading={loading}
          href="/purchasing/purchase-orders"
        />
        <Kpi
          title="Orders to deliver"
          value={formatQty(toDeliver.length)}
          caption={
            pendingStockOut.length
              ? `${pendingStockOut.length} note${pendingStockOut.length === 1 ? '' : 's'} awaiting stock out`
              : 'no notes awaiting stock out'
          }
          icon={<ContainerOutlined />}
          loading={loading}
          href="/stock/delivery-notes"
        />
        <Kpi
          title="Work in progress"
          value={formatQty(openWork.length)}
          caption={`of ${wo.length} work order${wo.length === 1 ? '' : 's'}`}
          icon={<ToolOutlined />}
          loading={loading}
          href="/production/work-orders"
        />
      </div>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={8}>
          <WorkList
            title="Awaiting delivery"
            href="/selling/sales-orders"
            items={toDeliver}
            loading={loading}
            emptyText="Every sales order has shipped."
            renderMeta={(o) => (
              <>
                {o.customerName} · {formatQty(o.remainingQty)} outstanding
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={8}>
          <WorkList
            title="Awaiting receipt"
            href="/purchasing/purchase-orders"
            items={toReceive}
            loading={loading}
            emptyText="Nothing outstanding from suppliers."
            renderMeta={(o) => (
              <>
                {o.supplierName} · {formatQty(o.remainingQty)} outstanding
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={8}>
          <WorkList
            title="Pending stock moves"
            href="/stock/delivery-notes"
            items={[...pendingStockOut, ...pendingStockIn]}
            loading={loading}
            emptyText="No notes waiting to be stocked in or out."
            renderMeta={(n) => (
              <>
                <Tag color={n.customerName ? 'blue' : 'green'} style={{ marginInlineEnd: 6 }}>
                  {n.customerName ? 'Out' : 'In'}
                </Tag>
                {n.customerName ?? n.supplierName} · {formatQty(n.totalQty)}
              </>
            )}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
