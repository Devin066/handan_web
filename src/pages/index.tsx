import { Button, Card, Space, Typography } from 'antd';
import { useRouter } from 'next/router';
import { GithubOutlined, RocketOutlined, ThunderboltOutlined, HeartOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-12">
          <Title level={1} className="text-5xl font-bold mb-4">
            Handan
          </Title>
          <Paragraph className="text-xl text-gray-600 mb-8">
            Open-source ERP (MES) for small and medium businesses
          </Paragraph>
          <Space size="large">
            <Button type="primary" size="large" onClick={() => router.push('/login')} icon={<RocketOutlined />}>
              Get Started
            </Button>
            <Button
              size="large"
              icon={<GithubOutlined />}
              onClick={() => window.open('https://github.com/zven21/handan', '_blank')}
            >
              View Source
            </Button>
          </Space>
        </div>

        {/* Project Introduction */}
        <Card className="mb-8 shadow-lg">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={3}>
                <ThunderboltOutlined className="mr-2" />
                About the Project
              </Title>
              <Paragraph className="text-base text-gray-700">
                Handan is the open-source edition of <Text strong>Nianxiaoyou</Text>, a lightweight and easy-to-use
                management system built for small and medium manufacturers.
              </Paragraph>
              <Paragraph className="text-base text-gray-700">
                We know the challenges SMBs face in going digital: ERP systems are either too complex to learn or too
                expensive to afford. Handan aims to provide a <Text strong>simple, practical, open-source</Text>{' '}
                solution that lets companies digitize their business processes at the lowest possible cost.
              </Paragraph>
            </div>

            <div>
              <Title level={3}>
                <HeartOutlined className="mr-2" />
                Actively Maintained
              </Title>
              <Paragraph className="text-base text-gray-700">
                As an open-source project, Handan is continuously updated with new features and fixes. Community
                contributions are welcome &mdash; let&apos;s build a better open-source ERP together.
              </Paragraph>
            </div>
          </Space>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>📦 Stock</Title>
            <Paragraph>Real-time stock tracking, inbound/outbound management, stock ledger queries</Paragraph>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>🛒 Selling</Title>
            <Paragraph>Sales orders, customer management, sales analytics</Paragraph>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>🏭 Purchasing</Title>
            <Paragraph>Purchase orders, supplier management, purchase cost tracking</Paragraph>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>⚙️ Production</Title>
            <Paragraph>Work orders, BOM management, production task scheduling</Paragraph>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>💰 Finance</Title>
            <Paragraph>Payment records, transaction vouchers, payment method management</Paragraph>
          </Card>
          <Card className="shadow hover:shadow-lg transition-shadow">
            <Title level={4}>🔧 Products</Title>
            <Paragraph>Item records, units of measure, warehouse setup</Paragraph>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="shadow-lg">
          <Title level={3}>Tech Stack</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Title level={5}>Backend</Title>
              <ul className="list-disc list-inside text-gray-700">
                <li>Elixir + Phoenix</li>
                <li>Commanded (CQRS)</li>
                <li>Absinthe (GraphQL)</li>
                <li>PostgreSQL + EventStore</li>
              </ul>
            </div>
            <div>
              <Title level={5}>Frontend</Title>
              <ul className="list-disc list-inside text-gray-700">
                <li>Next.js + React</li>
                <li>TypeScript</li>
                <li>Apollo Client (GraphQL)</li>
                <li>Ant Design</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 text-gray-600">
          <Paragraph>
            License: MIT License |{' '}
            <a
              href="https://github.com/zven21/handan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
          </Paragraph>
        </div>
      </div>
    </div>
  );
}
