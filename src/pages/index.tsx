import { Button, Card, Col, Row, Space, Typography } from 'antd';
import { useRouter } from 'next/router';
import {
  ApartmentOutlined,
  DollarOutlined,
  InboxOutlined,
  LoginOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
} from '@ant-design/icons';

import brand from '@/config/brand';
import { tokens } from '@/components/common/theme';

const { Title, Paragraph, Text } = Typography;

const modules = [
  {
    icon: <ShoppingCartOutlined />,
    title: 'Selling',
    body: 'Sales orders, customers, delivery notes and invoicing through to payment.',
  },
  {
    icon: <ShopOutlined />,
    title: 'Purchasing',
    body: 'Purchase orders, suppliers, goods receipt and supplier invoices.',
  },
  {
    icon: <ToolOutlined />,
    title: 'Production',
    body: 'Work orders expanded from a BOM, process routing and job card reporting.',
  },
  {
    icon: <InboxOutlined />,
    title: 'Stock',
    body: 'On-hand by warehouse, backed by a full movement ledger you can audit.',
  },
  {
    icon: <DollarOutlined />,
    title: 'Finance',
    body: 'Payment entries allocated across outstanding invoices, oldest first.',
  },
  {
    icon: <ApartmentOutlined />,
    title: 'Setup',
    body: 'Items, units of measure, warehouses, processes and workstations.',
  },
];

/**
 * Public entry page. Deliberately short: the product is an internal operational
 * tool, so the job here is to identify the system and get the user to sign in.
 */
export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: tokens.background }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ fontSize: 44, marginBottom: 8, color: tokens.text }}>
            {brand.name}
          </Title>
          <Paragraph
            style={{
              fontSize: 17,
              color: tokens.textSecondary,
              marginBottom: 28,
            }}
          >
            Manufacturing resource planning for small and medium businesses
          </Paragraph>
          <Space size="middle">
            <Button type="primary" size="large" icon={<LoginOutlined />} onClick={() => router.push('/login')}>
              Sign in
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {modules.map((module) => (
            <Col xs={24} sm={12} lg={8} key={module.title}>
              <Card size="small" style={{ height: '100%', borderColor: tokens.border }}>
                <Space align="start" size={12}>
                  <span
                    style={{
                      color: tokens.primary,
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                  >
                    {module.icon}
                  </span>
                  <div>
                    <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
                      {module.title}
                    </Title>
                    <Paragraph
                      style={{
                        marginBottom: 0,
                        color: tokens.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      {module.body}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <div
          style={{
            textAlign: 'center',
            marginTop: 48,
            color: tokens.textTertiary,
            fontSize: 13,
          }}
        >
          {/*
            Credit is kept as plain text, not an outbound link. The MIT terms are
            satisfied by LICENSE and NOTICE shipping with the source; they do not
            require a clickable link in the running UI.
          */}
          <Paragraph style={{ color: tokens.textTertiary, marginBottom: 0 }}>
            Built on the MIT-licensed Handan project. <Text type="secondary">See NOTICE for attribution.</Text>
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
