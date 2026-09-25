import { useState } from 'react';
import { Alert, Button, Checkbox, Form, InputNumber, Modal, Select, Table, Typography } from 'antd';

import { useCompleteReceiptNoteMutation, useCreateReceiptNoteMutation, usePurchaseOrdersQuery } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { onError } from '@/utils';

const { Text } = Typography;

const outstanding = (line: any) => Math.max(0, Number(line.orderedQty ?? 0) - Number(line.receivedQty ?? 0));

/**
 * Receive a delivery against a purchase order: pick the PO, enter what actually
 * arrived per line (it may be short), and optionally stock it in straight away.
 */
const ReceiptNoteNew = ({ onCreated }: { onCreated: () => void }) => {
  const { messageApi } = useMessageContext();
  const [open, setOpen] = useState(false);
  const [orderUuid, setOrderUuid] = useState<string>();
  const [quantities, setQuantities] = useState<Record<string, number | null>>({});
  const [stockNow, setStockNow] = useState(true);

  const { data, loading } = usePurchaseOrdersQuery({ skip: !open, fetchPolicy: 'network-only' });
  const openOrders = ((data?.purchaseOrders ?? []) as any[]).filter(
    (o) => o.status !== 'draft' && o.receiptStatus !== 'fully_received',
  );
  const order = openOrders.find((o) => o.uuid === orderUuid);
  const lines = ((order?.items ?? []) as any[]).filter((line) => outstanding(line) > 0);

  const [createReceipt, { loading: creating }] = useCreateReceiptNoteMutation({ onError });
  const [completeReceipt, { loading: completing }] = useCompleteReceiptNoteMutation({ onError });

  const reset = () => {
    setOpen(false);
    setOrderUuid(undefined);
    setQuantities({});
    setStockNow(true);
  };

  const pickOrder = (uuid: string) => {
    setOrderUuid(uuid);
    const picked = openOrders.find((o) => o.uuid === uuid);
    // Start from "everything still outstanding arrived"; the receiver corrects short deliveries.
    setQuantities(Object.fromEntries((picked?.items ?? []).map((line: any) => [line.uuid, outstanding(line)])));
  };

  const receiptItems = lines
    .map((line) => ({ purchaseOrderItemUuid: line.uuid, actualQty: Number(quantities[line.uuid] ?? 0) }))
    .filter((line) => line.actualQty > 0);

  const submit = async () => {
    const created = await createReceipt({ variables: { request: { purchaseOrderUuid: orderUuid, receiptItems } } });
    const note = created.data?.createReceiptNote;
    if (!note) return;
    if (stockNow) {
      const done = await completeReceipt({
        variables: { request: { purchaseOrderUuid: orderUuid, receiptNoteUuid: note.uuid } },
      });
      if (!done.data?.completeReceiptNote) {
        // The receipt exists; it can still be stocked in from the list.
        onCreated();
        reset();
        return;
      }
      messageApi?.success(`${note.code} received and stocked in`);
    } else {
      messageApi?.success(`${note.code} created. Stock it in when the goods are checked.`);
    }
    onCreated();
    reset();
  };

  return (
    <>
      <Button type="primary" size="small" onClick={() => setOpen(true)}>
        New Goods Receipt
      </Button>
      <Modal
        open={open}
        title="New Goods Receipt"
        okText={stockNow ? 'Receive and Stock In' : 'Create Goods Receipt'}
        okButtonProps={{ disabled: !order || !receiptItems.length }}
        confirmLoading={creating || completing}
        onOk={submit}
        onCancel={reset}
        width="min(880px, calc(100vw - 32px))"
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Purchase Order" required extra="Only orders with goods still to receive are listed.">
            <Select
              showSearch
              loading={loading}
              optionFilterProp="label"
              placeholder="Choose the purchase order this delivery is for"
              value={orderUuid}
              onChange={pickOrder}
              notFoundContent="No purchase order is waiting for goods."
              options={openOrders.map((o) => ({
                value: o.uuid,
                label: `${o.code} · ${o.supplierName}${o.warehouseName ? ` → ${o.warehouseName}` : ''}`,
              }))}
            />
          </Form.Item>
        </Form>

        {order ? (
          <>
            <Table
              size="small"
              rowKey="uuid"
              pagination={false}
              dataSource={lines}
              scroll={{ x: 'max-content' }}
              columns={[
                { title: 'Item', dataIndex: 'itemName' },
                {
                  title: 'Ordered',
                  align: 'right',
                  render: (_: any, l: any) => `${Number(l.orderedQty)} ${l.uomName ?? ''}`,
                },
                { title: 'Received', align: 'right', render: (_: any, l: any) => Number(l.receivedQty ?? 0) },
                { title: 'Outstanding', align: 'right', render: (_: any, l: any) => outstanding(l) },
                {
                  title: 'Received Now',
                  width: 140,
                  render: (_: any, l: any) => (
                    <InputNumber
                      aria-label={`Quantity of ${l.itemName} received now`}
                      min={0}
                      max={outstanding(l)}
                      value={quantities[l.uuid]}
                      onChange={(value) => setQuantities((q) => ({ ...q, [l.uuid]: value }))}
                      style={{ width: '100%' }}
                    />
                  ),
                },
              ]}
            />
            <Text type="secondary" style={{ display: 'block', margin: '8px 0 12px' }}>
              Enter what actually arrived. A short delivery leaves the rest open on the purchase order; set a line to 0
              if none of it came.
            </Text>
            <Checkbox checked={stockNow} onChange={(e) => setStockNow(e.target.checked)}>
              Stock in now (updates stock and raises the supplier&apos;s purchase invoice)
            </Checkbox>
            {!receiptItems.length ? (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 12 }}
                message="Enter a quantity on at least one line."
              />
            ) : null}
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default ReceiptNoteNew;
