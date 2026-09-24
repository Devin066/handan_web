import Link from 'next/link';
import dayjs from 'dayjs';
import { Alert, Badge, Button, Card, Col, Empty, List, Row, Skeleton, Tooltip, Typography } from 'antd';
import {
  ArrowRightOutlined,
  DollarOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { useDashboardQuery } from '@/gql';
import { formatCurrency, formatQty } from '@/utils/format';
import { tokens } from '@/components/common/theme';

const { Text } = Typography;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const date = (value?: string | null) => (value ? dayjs(value).format('MMM D') : null);

/** One figure in the KPI strip; the caption says what the number is for. */
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
  caption: React.ReactNode;
  icon: React.ReactNode;
  /** Amber value: reserved for figures that need attention. */
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
  renderTitle,
  renderMeta,
  count,
}: {
  title: string;
  href: string;
  items: any[];
  loading: boolean;
  emptyText: string;
  renderTitle?: (item: any) => React.ReactNode;
  renderMeta: (item: any) => React.ReactNode;
  count?: number;
}) => (
  <Card
    size="small"
    title={
      <span>
        {title}
        {!loading && (count ?? items.length) > 0 ? (
          <Text type="secondary" className="tabular-figures" style={{ marginLeft: 8, fontWeight: 400 }}>
            {count ?? items.length}
          </Text>
        ) : null}
      </span>
    }
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
        dataSource={items.slice(0, 6)}
        renderItem={(item: any) => (
          <List.Item style={{ paddingInline: 0 }}>
            <List.Item.Meta
              title={renderTitle ? renderTitle(item) : <span className="doc-code">{item.code}</span>}
              description={<span style={{ fontSize: 12 }}>{renderMeta(item)}</span>}
            />
          </List.Item>
        )}
      />
    )}
  </Card>
);

/** Outstanding money split by how late it is. */
const Aging = ({ title, href, data, loading }: { title: string; href: string; data: any; loading: boolean }) => {
  const rows = [
    ['Not yet due', data?.current],
    ['1 to 30 days late', data?.days1to30],
    ['31 to 60 days late', data?.days31to60],
    ['61 to 90 days late', data?.days61to90],
    ['Over 90 days late', data?.over90],
  ] as const;
  return (
    <Card
      size="small"
      title={title}
      style={{ height: '100%', borderColor: tokens.border }}
      extra={
        <Link href={href} style={{ fontSize: 13 }}>
          Invoices <ArrowRightOutlined style={{ fontSize: 11 }} />
        </Link>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} title={false} />
      ) : (
        <>
          <div className="tabular-figures" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
            {formatCurrency(data?.total ?? 0)}
          </div>
          {rows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                padding: '2px 0',
              }}
            >
              <Text type="secondary">{label}</Text>
              <span
                className="tabular-figures"
                style={{
                  color: label !== 'Not yet due' && Number(value) > 0 ? tokens.warning : undefined,
                }}
              >
                {formatCurrency(value ?? 0)}
              </span>
            </div>
          ))}
        </>
      )}
    </Card>
  );
};

const riskBadge = (risk?: string | null) =>
  risk === 'overdue' ? (
    <Badge status="error" text="Overdue" />
  ) : risk === 'at_risk' ? (
    <Badge status="warning" text="Due soon" />
  ) : null;

/**
 * Executive & Operations Dashboard (SRS 3): stock alerts, money owed both ways,
 * purchasing and production queues, delivery risk and who is in today.
 */
const Dashboard = () => {
  const { data, loading, error, refetch } = useDashboardQuery({
    fetchPolicy: 'cache-and-network',
  });
  const d = (data?.dashboard ?? {}) as any;

  // Zeros from a failed request would read as real balances, so show nothing.
  if (error && !data) {
    return (
      <Alert
        type="error"
        showIcon
        message="The dashboard couldn't load."
        description="Figures are hidden rather than shown as zero. Check your connection and try again."
        action={
          <Button size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const busy = loading && !data;
  const low = d.lowStock ?? [];
  const out = d.outOfStock ?? [];
  const valuation = d.stockValuation ?? {};
  const workforce = d.workforce ?? {};
  const delayed = d.delayedSalesOrders ?? [];

  return (
    <div>
      {!busy && out.length > 0 ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message={`${plural(out.length, 'item')} out of stock`}
          description={out
            .slice(0, 6)
            .map((i: any) => i.name)
            .join(', ')
            .concat(out.length > 6 ? ` and ${out.length - 6} more` : '')}
          action={
            <Link href="/purchasing/purchase-requests">
              <Button size="small">Raise a Purchase Request</Button>
            </Link>
          }
        />
      ) : null}

      <div className="kpi-strip">
        <Kpi
          title="Stock value"
          value={formatCurrency(valuation.total ?? 0)}
          caption={
            <Tooltip
              title={
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                  <div>Raw materials: {formatCurrency(valuation.rawMaterial ?? 0)}</div>
                  <div>Manufactured parts: {formatCurrency(valuation.manufacturedPart ?? 0)}</div>
                  <div>Finished goods: {formatCurrency(valuation.finishedGood ?? 0)}</div>
                </div>
              }
            >
              <span>at cost, {plural(low.length, 'item')} low</span>
            </Tooltip>
          }
          attention={low.length > 0}
          icon={<InboxOutlined />}
          loading={busy}
          href="/setup/items"
        />
        <Kpi
          title="Receivable"
          value={formatCurrency(d.accountsReceivable?.total ?? 0)}
          caption={`on ${plural(d.accountsReceivable?.count ?? 0, 'open sales invoice')}`}
          attention={(d.accountsReceivable?.total ?? 0) - (d.accountsReceivable?.current ?? 0) > 0}
          icon={<DollarOutlined />}
          loading={busy}
          href="/finance/sales-invoices"
        />
        <Kpi
          title="Payable"
          value={formatCurrency(d.accountsPayable?.total ?? 0)}
          caption={`on ${plural(d.accountsPayable?.count ?? 0, 'open purchase invoice')}`}
          icon={<ShoppingCartOutlined />}
          loading={busy}
          href="/finance/purchase-invoices"
        />
        <Kpi
          title="Present today"
          value={`${workforce.present ?? 0} / ${workforce.total ?? 0}`}
          caption={
            workforce.absent?.length ? `not in: ${workforce.absent.slice(0, 3).join(', ')}` : 'everyone is clocked in'
          }
          icon={<TeamOutlined />}
          loading={busy}
          href="/hr/attendance"
        />
      </div>

      <h2 className="dash-section">Inventory</h2>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <WorkList
            title="Out of Stock"
            href="/setup/items"
            items={out}
            loading={busy}
            emptyText="No tracked item is at zero."
            renderTitle={(i) => i.name}
            renderMeta={(i) => (
              <>
                {i.sku ?? 'No code'} · reorder level {formatQty(i.minStockThreshold)}
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={12}>
          <WorkList
            title="Low Stock"
            href="/setup/items"
            items={low}
            loading={busy}
            emptyText="Everything is above its reorder level."
            renderTitle={(i) => i.name}
            renderMeta={(i) => (
              <>
                {formatQty(i.onHandQty)} on hand · reorder level {formatQty(i.minStockThreshold)}
              </>
            )}
          />
        </Col>
      </Row>

      <h2 className="dash-section">Finance</h2>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Aging
            title="Accounts Receivable"
            href="/finance/sales-invoices"
            data={d.accountsReceivable}
            loading={busy}
          />
        </Col>
        <Col xs={24} md={12}>
          <Aging title="Accounts Payable" href="/finance/purchase-invoices" data={d.accountsPayable} loading={busy} />
        </Col>
      </Row>

      <h2 className="dash-section">CRM</h2>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={8}>
          <WorkList
            title="Delivery date at risk"
            href="/selling/sales-orders"
            items={delayed}
            loading={busy}
            emptyText="No open order is late or due within 3 days."
            renderTitle={(o) => (
              <span>
                <span className="doc-code">{o.code}</span> <span style={{ marginLeft: 6 }}>{riskBadge(o.risk)}</span>
              </span>
            )}
            renderMeta={(o) => (
              <>
                {o.customerName} · target {date(o.requiredDate)}
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={8}>
          <WorkList
            title="Open sales orders"
            href="/selling/sales-orders"
            items={d.openSalesOrders ?? []}
            loading={busy}
            emptyText="Every sales order is complete."
            renderMeta={(o) => (
              <>
                {o.customerName}
                {o.requiredDate ? ` · target ${date(o.requiredDate)}` : ''}
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={8}>
          <WorkList
            title={`FY${d.fiscalYear ?? ''} invoices`}
            href="/finance/sales-invoices"
            items={d.fiscalYearInvoices?.latest ?? []}
            count={d.fiscalYearInvoices?.count}
            loading={busy}
            emptyText="No sales invoices issued this fiscal year."
            renderMeta={(inv) => (
              <>
                {inv.customerName} · {formatCurrency(inv.amount)}
              </>
            )}
          />
        </Col>
      </Row>

      <h2 className="dash-section">Purchasing</h2>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <WorkList
            title="Open purchase orders"
            href="/purchasing/purchase-orders"
            items={d.openPurchaseOrders ?? []}
            loading={busy}
            emptyText="Nothing outstanding from suppliers."
            renderMeta={(po) => (
              <>
                {po.supplierName} ·{' '}
                {po.expectedDate ? (
                  <span style={{ color: po.overdue ? tokens.danger : undefined }}>
                    {po.overdue ? 'was due' : 'expected'} {date(po.expectedDate)}
                  </span>
                ) : (
                  'no delivery date'
                )}
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={12}>
          <WorkList
            title="Open purchase requests"
            href="/purchasing/purchase-requests"
            items={d.openPurchaseRequests ?? []}
            loading={busy}
            emptyText="Every request is on a purchase order."
            renderMeta={(pr) => (
              <>
                {pr.status === 'pending' ? 'Awaiting approval' : 'Approved'} · {plural(pr.openLines, 'line')} to order
                {pr.requestedBy ? ` · ${pr.requestedBy}` : ''}
              </>
            )}
          />
        </Col>
      </Row>

      <h2 className="dash-section">Production</h2>
      <Row gutter={[12, 12]}>
        <Col xs={24} lg={12}>
          <WorkList
            title="Open work orders"
            href="/production/work-orders"
            items={d.openWorkOrders ?? []}
            loading={busy}
            emptyText="No work orders in progress."
            renderMeta={(wo) => (
              <>
                {wo.itemName} · {formatQty(wo.producedQty)} / {formatQty(wo.plannedQty)} made
                {wo.dueDate ? ` · due ${date(wo.dueDate)}` : ''}
              </>
            )}
          />
        </Col>
        <Col xs={24} lg={12}>
          <WorkList
            title="Manufactured today"
            href="/production/work-orders"
            items={d.manufacturedToday ?? []}
            loading={busy}
            emptyText="Nothing stored from production yet today."
            renderTitle={(m) => m.itemName}
            renderMeta={(m) => <>{formatQty(m.qty)} stored</>}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
