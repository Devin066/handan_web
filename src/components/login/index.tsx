import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Form, Input, Typography } from 'antd';

import useAuthUserStore from '@/stores/persisted/useAuthUser';
import brand from '@/config/brand';

const { Title, Text } = Typography;

const MODULES = [
  { name: 'Selling', docs: 'Sales orders, invoices' },
  { name: 'Purchasing', docs: 'Purchase orders, suppliers' },
  { name: 'Production', docs: 'Work orders, BOMs, job cards' },
  { name: 'Stock', docs: 'Receipts, deliveries, counts' },
  { name: 'Finance', docs: 'Payments, balances' },
];

const Login = () => {
  const router = useRouter();
  const { login, isLogin, error } = useAuthUserStore();
  const [submitting, setSubmitting] = useState(false);

  // The store persists, so a failure from an earlier visit must not greet the user.
  useEffect(() => {
    useAuthUserStore.setState({ error: null });
  }, []);

  // Redirect as an effect, not during render, so it runs once per sign-in.
  useEffect(() => {
    if (!isLogin) return;
    // Only same-site paths: "//host" would send the user off-site.
    const { next } = router.query;
    const isLocalPath = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//');
    router.replace(isLocalPath ? next : '/dashboard');
  }, [isLogin, router]);

  const onFinish = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    await login(values);
    setSubmitting(false);
  };

  return (
    <main className="login-page">
      {/* Names the real modules so the screen says what this system is for. */}
      <section className="login-aside">
        <div className="login-brand">{brand.name}</div>
        <p className="login-lede">Orders, production and stock for the shop floor, in one place.</p>
        <ul className="login-modules">
          {MODULES.map((module) => (
            <li key={module.name}>
              <span className="login-module-name">{module.name}</span>
              <span className="login-module-docs">{module.docs}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="login-panel">
        <div className="login-form">
          <Title level={3} style={{ margin: 0 }}>
            Sign in
          </Title>
          <Text type="secondary">Use your company account.</Text>

          {error && !submitting ? (
            <Alert
              type="error"
              showIcon
              message="That email and password don't match an account."
              style={{ marginTop: 20 }}
            />
          ) : null}

          <Form layout="vertical" requiredMark={false} onFinish={onFinish} style={{ marginTop: 20 }}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Enter your email address.' },
                {
                  type: 'email',
                  message: 'That doesn’t look like an email address.',
                },
              ]}
            >
              <Input size="large" type="email" autoComplete="username" autoFocus />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password.' }]}>
              <Input.Password size="large" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
              Sign in
            </Button>
          </Form>
        </div>
      </section>
    </main>
  );
};

export default Login;
