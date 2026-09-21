import Link from 'next/link';
import { Card, Col, Empty, List, Row, Skeleton, Statistic, Tag, Typography } from 'antd';
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

/** A KPI. The caption says what the number is for, so it is not just a figure. */
const Kpi = ({
  title,
  value,
  caption,
  icon,
  accent,
  loading,
  href,
}: {
  title: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent: string;
  loading: boolean;
  href: string;
}) => (
  <Link href={href} style={{ display: 'block' }}>
    <Card
      size="small"
      style={{ height: '100%', borderColor: tokens.border }}
      styles={{ body: { padding: 16 } }}
      hoverable
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: accent, display: 'flex' }}>{icon}</span>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {title}
            </Text>
          </div>
          <Statistic value={value} valueStyle={{ fontSize: 24, fontWeight: 600, color: tokens.text }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {caption}
          </Text>
        </>
      )}
    </Card>
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
              title={<span style={{ fontWeight: 600, fontSize: 13 }}>{item.code}</span>}
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

  const loading = salesOrders.loading || purchaseOrders.loading || workOrders.loading || deliveryNotes.loading;

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

  return (
    <div>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} xl={6}>
          <Kpi
            title="Receivable"
            value={formatCurrency(receivable)}
            caption={`across ${so.length} sales order(s)`}
            icon={<DollarOutlined />}
            accent={tokens.accent}
            loading={loading}
            href="/selling/sales-orders"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Kpi
            title="Payable"
            value={formatCurrency(payable)}
            caption={`across ${po.length} purchase orders`}
            icon={<ShoppingCartOutlined />}
            accent={tokens.info}
            loading={loading}
            href="/purchasing/purchase-orders"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Kpi
            title="Orders to deliver"
            value={formatQty(toDeliver.length)}
            caption={
              pendingStockOut.length
                ? `${pendingStockOut.length} note(s) awaiting stock out`
                : 'no notes awaiting stock out'
            }
            icon={<ContainerOutlined />}
            accent={tokens.primary}
            loading={loading}
            href="/stock/delivery-notes"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Kpi
            title="Work in progress"
            value={formatQty(openWork.length)}
            caption={`${wo.length} work order(s) total`}
            icon={<ToolOutlined />}
            accent={tokens.success}
            loading={loading}
            href="/production/work-orders"
          />
        </Col>
      </Row>

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
            title="Stock movements pending"
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
