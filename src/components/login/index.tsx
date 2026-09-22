import { useRouter } from 'next/router';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';

// locale
import { sleep } from '@/utils';
import useAuthUserStore from '@/stores/persisted/useAuthUser';
import brand from '@/config/brand';

const Login = () => {
  const router = useRouter();
  const [messageAPI, contextHolder] = message.useMessage();
  const { login, isLogin } = useAuthUserStore();

  const onFinish = async (values: any) => {
    await login(values);
  };

  const initialValues = {
    email: '',
    password: '',
  };

  if (isLogin) {
    messageAPI.success('login success');

    sleep(1000).then(() => {
      router.push('/dashboard');
    });
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {contextHolder}
      <LoginForm title={brand.name} onFinish={onFinish} initialValues={initialValues}>
        <ProFormText
          name="email"
          fieldProps={{
            size: 'large',
          }}
          placeholder={'you@example.com'}
          rules={[
            {
              required: true,
              message: 'pls input your email',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
          }}
          placeholder={'123123123'}
          rules={[
            {
              required: true,
              message: 'pls input your password',
            },
          ]}
        />
      </LoginForm>
    </div>
  );
};

export default Login;
