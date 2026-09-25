import { Alert, Button, Card, Col, Descriptions, Form, Input, Row, Skeleton, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import { useChangeMyPasswordMutation, useMyModulesQuery, useMyProfileQuery, useUpdateMyProfileMutation } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { ROLE_LABELS } from '@/components/roles';
import { EMPLOYMENT_TYPES } from '@/config/staff';
import { MOBILE_HINT, isValidMobile } from '@/config/ph-contact';
import useAuthUserStore from '@/stores/persisted/useAuthUser';
import { onError } from '@/utils';

const { Text } = Typography;

/**
 * Profile Settings: what a signed-in person may change about themselves. Role,
 * email, position and employment are set by the owner under User Management,
 * so they are shown here but not editable.
 */
const Profile = () => {
  const { messageApi } = useMessageContext();
  const { currentUser } = useAuthUserStore();
  const { data, loading, error } = useMyProfileQuery({ fetchPolicy: 'network-only' });
  const { data: access } = useMyModulesQuery();
  // Names feed payroll and records; only roles with Settings access change them.
  const canRename = ((access?.myModules ?? []) as string[]).includes('settings');
  const [detailsForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [updateProfile, { loading: saving }] = useUpdateMyProfileMutation({
    onCompleted: () => messageApi?.success('Profile saved'),
    onError,
    refetchQueries: ['ListStaff'],
  });
  const [changePassword, { loading: changing }] = useChangeMyPasswordMutation({
    onCompleted: () => {
      messageApi?.success('Password changed. Use the new one next time you sign in.');
      passwordForm.resetFields();
    },
    onError,
  });

  if (error) return <Alert type="error" showIcon message="Your profile couldn't load." description={error.message} />;
  if (loading && !data) return <Skeleton active />;

  const me: any = data?.myProfile;
  const employment = EMPLOYMENT_TYPES[me?.employmentType as keyof typeof EMPLOYMENT_TYPES];

  return (
    <Space direction="vertical" size={12} style={{ width: '100%', maxWidth: 720 }}>
      <Card title="Your Details">
        {me ? (
          <Form
            form={detailsForm}
            layout="vertical"
            initialValues={{ name: me.name, phone: me.phone }}
            onFinish={(values) =>
              updateProfile({
                variables: { request: { name: canRename ? values.name : undefined, phone: values.phone || null } },
              })
            }
          >
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  extra={canRename ? undefined : 'Only someone with Settings access can change names.'}
                  rules={[{ required: canRename, whitespace: true, message: 'Enter your name.' }]}
                >
                  <Input autoComplete="name" maxLength={80} disabled={!canRename} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="phone"
                  label="Mobile"
                  rules={[
                    {
                      validator: (_, value) =>
                        !value || isValidMobile(value) ? Promise.resolve() : Promise.reject(new Error(MOBILE_HINT)),
                    },
                  ]}
                >
                  <Input type="tel" autoComplete="tel" placeholder="0917 123 4567" />
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save Details
            </Button>
          </Form>
        ) : (
          <Text type="secondary">
            Your login isn&apos;t linked to a member record, so there are no details to edit. Ask the owner to link it
            under User Management.
          </Text>
        )}
      </Card>

      <Card title="Set by the Owner">
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Ask the owner or an admin to change these under User Management.
        </Text>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Email">{me?.email ?? currentUser?.email ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Role">{ROLE_LABELS[me?.role ?? currentUser?.role] ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Position">{me?.position || '—'}</Descriptions.Item>
          <Descriptions.Item label="Employment">{employment ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Shift">{me?.shift || '—'}</Descriptions.Item>
          <Descriptions.Item label="Date Hired">
            {me?.hiredAt ? dayjs(me.hiredAt).format('YYYY-MM-DD') : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Change Password">
        <Form
          form={passwordForm}
          layout="vertical"
          style={{ maxWidth: 360 }}
          onFinish={(values) =>
            changePassword({
              variables: { request: { currentPassword: values.currentPassword, newPassword: values.newPassword } },
            })
          }
        >
          {/* Lets password managers attach the new password to the right account. */}
          <input type="text" name="username" autoComplete="username" value={currentUser?.email ?? ''} readOnly hidden />
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Enter your current password.' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            extra="At least 8 characters."
            rules={[
              { required: true, message: 'Enter a new password.' },
              { min: 8, message: 'At least 8 characters.' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Type the new password again.' },
              ({ getFieldValue }) => ({
                validator: (_, value) =>
                  !value || value === getFieldValue('newPassword')
                    ? Promise.resolve()
                    : Promise.reject(new Error("The two passwords don't match.")),
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={changing}>
            Change Password
          </Button>
        </Form>
      </Card>
    </Space>
  );
};

export default Profile;
