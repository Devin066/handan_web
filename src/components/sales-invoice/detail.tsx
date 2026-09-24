import dayjs from 'dayjs';
import { Alert, Col, Descriptions, Drawer, Row, Skeleton, Table, Typography } from 'antd';

import { useSalesInvoiceQuery } from '@/gql';
import { PAYMENT_TERMS, VAT_MODES } from '@/config/invoice';
import { StatusBadge } from '@/components/shared/columns';
import { invoiceStatusEnum } from '@/utils/enum';
import { formatCurrency, formatQty } from '@/utils/format';

const { Text } = Typography;

const date = (value?: string | null) => (value ? dayjs(value).format('MMM D, YYYY') : '—');

const SalesInvoiceDetail = ({ uuid, onClose }: { uuid?: string; onClose: () => void }) => {
  const { data, loading, error } = useSalesInvoiceQuery({
    skip: !uuid,
    variables: { request: { salesInvoiceUuid: uuid } },
    fetchPolicy: 'network-only',
  });
  const invoice: any = data?.salesInvoice;

  const vatLabel =
    invoice?.vatMode && invoice.vatMode in VAT_MODES
      ? VAT_MODES[invoice.vatMode as keyof typeof VAT_MODES].short
      : 'Not recorded';

  return (
    <Drawer title={invoice?.code ?? 'Invoice'} width="min(960px, 100vw)" open={!!uuid} onClose={onClose}>
      {loading ? (
        <Skeleton active />
      ) : error || !invoice ? (
        <Alert type="error" showIcon message="Couldn't load this invoice." description={error?.message} />
      ) : (
        <>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Descriptions
                size="small"
                column={1}
                title="Bill to"
                items={[
                  { key: 'c', label: 'Customer', children: invoice.customerName },
                  { key: 'a', label: 'Address', children: invoice.customerAddress || '—' },
                  { key: 't', label: 'TIN', children: invoice.customerTin || '—' },
                  { key: 'r', label: 'Reference', children: invoice.customerReference || '—' },
                ]}
              />
            </Col>
            <Col xs={24} md={12}>
              <Descriptions
                size="small"
                column={1}
                title="Invoice"
                items={[
                  {
                    key: 's',
                    label: 'Status',
                    children: <StatusBadge value={invoice.status} valueEnum={invoiceStatusEnum} />,
                  },
                  { key: 'd', label: 'Invoice Date', children: date(invoice.invoiceDate) },
                  {
                    key: 'terms',
                    label: 'Terms',
                    children:
                      invoice.paymentTerms && invoice.paymentTerms in PAYMENT_TERMS
                        ? PAYMENT_TERMS[invoice.paymentTerms as keyof typeof PAYMENT_TERMS].label
                        : '—',
                  },
                  { key: 'due', label: 'Due Date', children: date(invoice.dueDate) },
                  { key: 'so', label: 'Sales Order', children: invoice.salesOrderCode ?? '—' },
                ]}
              />
            </Col>
          </Row>

          <Table
            size="small"
            rowKey="uuid"
            pagination={false}
            scroll={{ x: 'max-content' }}
            style={{ marginTop: 16 }}
            dataSource={invoice.items ?? []}
            locale={{ emptyText: 'This invoice was raised before line items were recorded.' }}
            columns={[
              {
                title: 'Item',
                dataIndex: 'itemName',
                render: (name, line: any) => (
                  <div>
                    <div>{name}</div>
                    {line.description ? (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {line.description}
                      </Text>
                    ) : null}
                  </div>
                ),
              },
              {
                title: 'Qty',
                dataIndex: 'qty',
                align: 'right',
                render: (qty, line: any) => (
                  <span className="tabular-figures">
                    {formatQty(qty)} <Text type="secondary">{line.uomName}</Text>
                  </span>
                ),
              },
              {
                title: 'Unit Price',
                dataIndex: 'unitPrice',
                align: 'right',
                render: (v) => <span className="tabular-figures">{formatCurrency(v)}</span>,
              },
              {
                title: 'Discount',
                dataIndex: 'discount',
                align: 'right',
                render: (v) => <span className="tabular-figures">{Number(v) ? formatCurrency(v) : '—'}</span>,
              },
              {
                title: 'Amount',
                dataIndex: 'lineTotal',
                align: 'right',
                render: (v) => <span className="tabular-figures">{formatCurrency(v)}</span>,
              },
            ]}
          />

          <Row gutter={24} style={{ marginTop: 20 }}>
            <Col xs={24} md={14}>
              {invoice.notes ? (
                <Descriptions size="small" column={1} items={[{ key: 'n', label: 'Notes', children: invoice.notes }]} />
              ) : null}
            </Col>
            <Col xs={24} md={10}>
              <Descriptions
                size="small"
                column={1}
                bordered
                labelStyle={{ width: '55%' }}
                contentStyle={{ textAlign: 'right' }}
                items={[
                  { key: 'sub', label: 'Subtotal', children: formatCurrency(invoice.subtotal) },
                  { key: 'disc', label: 'Discount', children: `− ${formatCurrency(invoice.discountAmount)}` },
                  { key: 'vm', label: 'VAT Treatment', children: vatLabel },
                  { key: 'vatable', label: 'Vatable Sales', children: formatCurrency(invoice.vatableAmount) },
                  { key: 'vat', label: 'VAT (12%)', children: formatCurrency(invoice.vatAmount) },
                  {
                    key: 'tot',
                    label: <Text strong>Total</Text>,
                    children: <Text strong>{formatCurrency(invoice.amount)}</Text>,
                  },
                  { key: 'paid', label: 'Paid', children: formatCurrency(invoice.paidAmount) },
                  {
                    key: 'bal',
                    label: <Text strong>Balance Due</Text>,
                    children: <Text strong>{formatCurrency(invoice.balance)}</Text>,
                  },
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </Drawer>
  );
};

export default SalesInvoiceDetail;
