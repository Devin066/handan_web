import { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Badge, Button, Col, Form, Input, Modal, Row, Select, Switch, Typography } from 'antd';

import client from '@/gql/apollo';
import { PaymentMethodsDocument, useCreatePaymentMethodMutation, useUpdatePaymentMethodMutation } from '@/gql';
import useModuleAccess from '@/hooks/use-module-access';
import DataTable from '@/components/shared/data-table';
import { useMessageContext } from '@/components/common/message-context';
import {
  CURRENCIES,
  PAYMENT_METHOD_KINDS,
  isValidAccountNumber,
  type PaymentMethodKind,
} from '@/config/payment-method';
import { onError } from '@/utils';

const { Text } = Typography;

const kindOptions = Object.entries(PAYMENT_METHOD_KINDS).map(([value, kind]) => ({ value, label: kind.label }));

const kindLabel = (kind?: string | null) =>
  kind && kind in PAYMENT_METHOD_KINDS ? PAYMENT_METHOD_KINDS[kind as PaymentMethodKind].label : '—';

/** Shows only the last four digits, the way a statement would. */
const maskAccount = (value?: string | null) => {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits.length > 4 ? `•••• ${digits.slice(-4)}` : value;
};

const PaymentMethodForm = ({ method, onClose, onSaved }: { method: any; onClose: () => void; onSaved: () => void }) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const editing = !!method?.uuid;
  const kind: PaymentMethodKind = Form.useWatch('kind', form) ?? method?.kind ?? 'cash';
  const hasAccount = PAYMENT_METHOD_KINDS[kind]?.hasAccount;

  const done = (name?: string | null) => {
    messageApi?.success(`${name} ${editing ? 'updated' : 'added'}`);
    onSaved();
    onClose();
  };
  const [create, { loading: creating }] = useCreatePaymentMethodMutation({
    onCompleted: (data) => done(data.createPaymentMethod?.name),
    onError,
  });
  const [update, { loading: updating }] = useUpdatePaymentMethodMutation({
    onCompleted: (data) => done(data.updatePaymentMethod?.name),
    onError,
  });

  const onFinish = (values: any) => {
    const request = { ...values, uuid: method?.uuid };
    if (editing) update({ variables: { request } });
    else create({ variables: { request } });
  };

  return (
    <Modal
      open={!!method}
      title={editing ? `Edit ${method.name}` : 'New payment method'}
      okText={editing ? 'Save Changes' : 'Add Payment Method'}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={creating || updating}
      width="min(640px, 100vw)"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        onFinish={onFinish}
        initialValues={{
          kind: 'cash',
          currency: 'PHP',
          requiresReference: false,
          isActive: true,
          ...method,
        }}
        onValuesChange={(changed) => {
          // A new transfer, wallet, check or card method asks for a reference by default.
          if ('kind' in changed && !editing) {
            const next = PAYMENT_METHOD_KINDS[changed.kind as PaymentMethodKind];
            form.setFieldValue('requiresReference', next?.referenceByDefault ?? false);
          }
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Name"
              extra="As it should appear on receipts, e.g. BDO Savings."
              rules={[
                { required: true, whitespace: true, message: 'Enter a name.' },
                { max: 60, message: 'Keep the name under 60 characters.' },
              ]}
            >
              <Input autoFocus />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="kind" label="Type" rules={[{ required: true, message: 'Choose a payment type.' }]}>
              <Select options={kindOptions} />
            </Form.Item>
          </Col>

          {hasAccount ? (
            <>
              <Col xs={24} sm={12}>
                <Form.Item name="provider" label={kind === 'e_wallet' ? 'Wallet' : 'Bank'}>
                  <Input placeholder={kind === 'e_wallet' ? 'e.g. GCash' : 'e.g. BDO'} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="accountName" label="Account Name">
                  <Input placeholder="Registered account holder" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="accountNumber"
                  label={kind === 'e_wallet' ? 'Account or Mobile Number' : 'Account Number'}
                  rules={[
                    {
                      validator: (_, value) =>
                        !value || isValidAccountNumber(value)
                          ? Promise.resolve()
                          : Promise.reject(new Error('Use 6 to 20 digits; spaces and dashes are allowed.')),
                    },
                  ]}
                >
                  <Input inputMode="numeric" autoComplete="off" />
                </Form.Item>
              </Col>
            </>
          ) : null}

          <Col xs={24} sm={12}>
            <Form.Item name="currency" label="Currency" rules={[{ required: true, message: 'Choose a currency.' }]}>
              <Select options={CURRENCIES.map((code) => ({ value: code, label: code }))} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="requiresReference"
              label="Require a Reference Number"
              valuePropName="checked"
              extra="Transfer reference, check number or wallet transaction ID, checked when a payment is recorded."
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="isActive"
              label="Active"
              valuePropName="checked"
              extra="Inactive methods stay on past payments but can't be chosen for new ones."
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="notes" label="Notes" rules={[{ max: 500, message: 'Keep notes under 500 characters.' }]}>
              <Input.TextArea rows={2} placeholder="e.g. Deposit before 3pm for same-day posting" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const PaymentMethodList: React.FC = () => {
  const canEdit = useModuleAccess().canEdit('settings');
  const actionRef = useRef<ActionType | null>(null);
  const [editing, setEditing] = useState<any>(null);

  const columns: ProColumns<any>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          {record.notes ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.notes}
            </Text>
          ) : null}
        </div>
      ),
    },
    { title: 'Type', dataIndex: 'kind', width: 190, render: (_, record) => kindLabel(record.kind) },
    {
      title: 'Account',
      key: 'account',
      width: 220,
      render: (_, record) =>
        record.accountNumber || record.provider ? (
          <div>
            <div>{record.provider ?? '—'}</div>
            <Text type="secondary" className="tabular-figures" style={{ fontSize: 12 }}>
              {[record.accountName, maskAccount(record.accountNumber)].filter(Boolean).join(' · ')}
            </Text>
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    { title: 'Currency', dataIndex: 'currency', width: 90 },
    {
      title: 'Reference',
      dataIndex: 'requiresReference',
      width: 110,
      render: (_, record) => (record.requiresReference ? 'Required' : <Text type="secondary">Optional</Text>),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 100,
      render: (_, record) => (
        <Badge status={record.isActive ? 'success' : 'default'} text={record.isActive ? 'Active' : 'Inactive'} />
      ),
    },
    {
      title: 'Actions',
      key: 'option',
      valueType: 'option',
      width: 80,
      render: (_, record) => [
        <Button key="edit" size="small" type="link" onClick={() => setEditing(record)}>
          Edit
        </Button>,
      ],
    },
  ];

  const renderToolbar = () => [
    <Button key="new" type="primary" size="small" onClick={() => setEditing({})}>
      New Payment Method
    </Button>,
  ];

  return (
    <>
      <DataTable
        actionRef={actionRef}
        columns={columns}
        entityName="payment methods"
        emptyHint="Add how customers pay you and how you pay suppliers, e.g. Cash, BDO transfer, GCash."
        request={async () => {
          const { data } = await client.query({ query: PaymentMethodsDocument, fetchPolicy: 'network-only' });
          const rows = data?.paymentMethods ?? [];
          return { data: rows, total: rows.length, success: true };
        }}
        toolBarRender={canEdit ? renderToolbar : undefined}
      />
      <PaymentMethodForm
        method={editing}
        onClose={() => setEditing(null)}
        onSaved={() => actionRef.current?.reload()}
      />
    </>
  );
};

export default PaymentMethodList;
