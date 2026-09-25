import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined, ReloadOutlined } from '@ant-design/icons';

import { useMoveWorkOrderStageMutation, useProductionBoardQuery, useWorkOrderStageLogsQuery } from '@/gql';
import { useMessageContext } from '@/components/common/message-context';
import { MOVES, STAGES, STAGE_LABELS, type Move, type Stage } from '@/config/production-stage';
import { fetchStaff } from '@/utils/api';
import { formatQty } from '@/utils/format';
import { onError } from '@/utils';

dayjs.extend(relativeTime);

const { Text } = Typography;

/** Refresh often enough that the office screen stays current without anyone touching it. */
const REFRESH_MS = 15_000;

const extraOf = (task: any) => Math.max(0, Number(task.reportedQty) - Number(task.plannedQty));

const isOverdue = (task: any) =>
  task.stage !== 'completed' && !!task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');

const TaskCard = ({ task, onOpen }: { task: any; onOpen: () => void }) => {
  const extra = extraOf(task);
  const counted = Number(task.goodQty) > 0 ? task.goodQty : task.reportedQty;
  return (
    <button type="button" className="board-card" onClick={onOpen}>
      <div className="board-card-top">
        <span className="doc-code">{task.code}</span>
        {isOverdue(task) ? <span className="board-flag board-flag-late">Late</span> : null}
      </div>
      <div className="board-card-item">{task.itemName}</div>
      <div className="board-card-qty tabular-figures">
        {Number(counted) > 0 ? `${formatQty(counted)} / ` : ''}
        {formatQty(task.plannedQty)} {task.uomName}
        {extra > 0 ? <span className="board-flag board-flag-extra">+{formatQty(extra)} extra</span> : null}
      </div>
      <div className="board-card-meta">
        <span>{task.assignedStaffName ?? 'Unassigned'}</span>
        <span>{dayjs(task.stageChangedAt).fromNow(true)}</span>
      </div>
      {task.dueDate ? <div className="board-card-due">Due {dayjs(task.dueDate).format('MMM D')}</div> : null}
    </button>
  );
};

/** The moves available for one task, with the inputs each move needs. */
const TaskDrawer = ({
  task,
  canSupervise,
  claimMode,
  onClose,
  onMoved,
}: {
  task: any;
  canSupervise: boolean;
  claimMode: string;
  onClose: () => void;
  onMoved: () => void;
}) => {
  const [form] = Form.useForm();
  const { messageApi } = useMessageContext();
  const [pending, setPending] = useState<Move | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const logs = useWorkOrderStageLogsQuery({
    variables: { request: { uuid: task?.uuid } },
    skip: !task,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (task) fetchStaff({}).then((rows) => setStaff(rows ?? []));
    setPending(null);
    form.resetFields();
  }, [task, form]);

  const [move, { loading }] = useMoveWorkOrderStageMutation({
    onCompleted: (data) => {
      messageApi?.success(`${task.code} moved to ${STAGE_LABELS[data.moveWorkOrderStage?.stage as Stage]}`);
      onMoved();
      onClose();
    },
    onError,
  });

  if (!task) return null;
  const stage = task.stage as Stage;
  const reported = Number(task.reportedQty);

  const allowed = MOVES[stage].filter((m) => {
    if (m.supervisorOnly && !canSupervise) return false;
    if (m.to === 'assigned' && claimMode === 'manager' && !canSupervise) return false;
    return true;
  });
  const hidden = MOVES[stage].length - allowed.length;

  const submit = (values: any) =>
    move({
      variables: {
        request: {
          uuid: task.uuid,
          toStage: pending!.to,
          staffUuid: values.staffUuid,
          reportedQty: values.reportedQty,
          goodQty: values.goodQty,
          note: values.note,
        },
      },
    });

  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      width="min(520px, 100vw)"
      title={`${task.code} · ${task.itemName}`}
      // Render inside the board so it still shows when the board is full screen.
      getContainer={() => document.getElementById('production-board') ?? document.body}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div className="board-detail">
          <div>
            <Text type="secondary">Stage</Text>
            <div>{STAGE_LABELS[stage]}</div>
          </div>
          <div>
            <Text type="secondary">Ordered</Text>
            <div className="tabular-figures">
              {formatQty(task.plannedQty)} {task.uomName}
            </div>
          </div>
          <div>
            <Text type="secondary">Made</Text>
            <div className="tabular-figures">{reported ? formatQty(reported) : '—'}</div>
          </div>
          <div>
            <Text type="secondary">Passed / Rejected</Text>
            <div className="tabular-figures">
              {Number(task.goodQty) || Number(task.rejectedQty)
                ? `${formatQty(task.goodQty)} / ${formatQty(task.rejectedQty)}`
                : '—'}
            </div>
          </div>
          <div>
            <Text type="secondary">Assigned To</Text>
            <div>{task.assignedStaffName ?? 'Nobody yet'}</div>
          </div>
        </div>

        {pending ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            initialValues={{ staffUuid: task.assignedStaffUuid ?? undefined, goodQty: reported || undefined }}
          >
            {pending.to === 'assigned' ? (
              <Form.Item
                name="staffUuid"
                label={claimMode === 'self' && !canSupervise ? 'Your Name' : 'Assign to'}
                rules={[{ required: true, message: 'Choose who will do this task.' }]}
              >
                <Select options={staff} showSearch optionFilterProp="label" placeholder="Choose an employee" />
              </Form.Item>
            ) : null}
            {pending.to === 'quality_check' && stage === 'in_progress' ? (
              <Form.Item
                name="reportedQty"
                label="Pieces Made"
                extra={`Ordered ${formatQty(task.plannedQty)}. Enter the real count; anything over the order is logged as extra.`}
                rules={[{ required: true, message: 'Enter how many pieces were made.' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} autoFocus />
              </Form.Item>
            ) : null}
            {pending.to === 'final_check' ? (
              <Form.Item
                name="goodQty"
                label="Pieces That Passed"
                extra={`${formatQty(reported)} made. The rest are recorded as rejected.`}
                rules={[
                  { required: true, message: 'Enter how many pieces passed.' },
                  {
                    validator: (_, v) =>
                      v == null || v <= reported
                        ? Promise.resolve()
                        : Promise.reject(new Error(`Only ${formatQty(reported)} were made.`)),
                  },
                ]}
              >
                <InputNumber min={0} max={reported} style={{ width: '100%' }} autoFocus />
              </Form.Item>
            ) : null}
            <Form.Item
              name="note"
              label="Note"
              rules={
                pending.needsNote ? [{ required: true, whitespace: true, message: 'Say why it is going back.' }] : []
              }
            >
              <Input.TextArea
                rows={2}
                placeholder={pending.needsNote ? 'What needs fixing' : 'Optional, e.g. why there are extra pieces'}
              />
            </Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {pending.label}
              </Button>
              <Button onClick={() => setPending(null)}>Cancel</Button>
            </Space>
          </Form>
        ) : (
          <Space wrap>
            {allowed.map((m, i) => (
              <Button key={m.to} type={i === 0 ? 'primary' : 'default'} onClick={() => setPending(m)}>
                {m.label}
              </Button>
            ))}
            {allowed.length === 0 && stage !== 'completed' ? (
              <Alert
                type="info"
                showIcon
                message={
                  stage === 'queued'
                    ? 'A manager assigns tasks from this queue.'
                    : 'The next step needs a manager or the owner.'
                }
              />
            ) : null}
            {hidden > 0 && allowed.length > 0 ? (
              <Text type="secondary">Some steps need a manager or the owner.</Text>
            ) : null}
          </Space>
        )}

        <div>
          <Text strong>History</Text>
          <Timeline
            style={{ marginTop: 12 }}
            items={(logs.data?.workOrderStageLogs ?? []).map((l: any) => ({
              children: (
                <div>
                  <div>
                    {STAGE_LABELS[l.toStage as Stage] ?? l.toStage}
                    {l.staffName ? ` · ${l.staffName}` : ''}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(l.insertedAt).format('MMM D, HH:mm')}
                    {l.movedBy ? ` by ${l.movedBy}` : ''}
                    {l.goodQty != null ? ` · ${formatQty(l.goodQty)} passed, ${formatQty(l.rejectedQty)} rejected` : ''}
                    {l.goodQty == null && Number(l.reportedQty) > 0 ? ` · ${formatQty(l.reportedQty)} made` : ''}
                  </Text>
                  {l.note ? <div style={{ fontSize: 13 }}>“{l.note}”</div> : null}
                </div>
              ),
            }))}
          />
          {!logs.loading && !(logs.data?.workOrderStageLogs ?? []).length ? (
            <Text type="secondary">No moves yet.</Text>
          ) : null}
        </div>
      </Space>
    </Drawer>
  );
};

/**
 * The production office board. Meant to stay open on a screen in the office:
 * it refreshes itself, and full screen hides the app chrome for a TV.
 */
const ProductionBoard = () => {
  const { data, loading, error, refetch } = useProductionBoardQuery({
    pollInterval: REFRESH_MS,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: false,
  });
  const [openUuid, setOpenUuid] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const board = data?.productionBoard;
  const tasks: any[] = board?.tasks ?? [];
  const open = tasks.find((t) => t.uuid === openUuid) ?? null;

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.getElementById('production-board')?.requestFullscreen();
  };

  if (error && !board) {
    return (
      <Alert
        type="error"
        showIcon
        message="The production board couldn't load."
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <div id="production-board" className="board">
      <div className="board-toolbar">
        <Text type="secondary">
          {board?.claimMode === 'self'
            ? 'Workers claim tasks from the queue.'
            : 'A manager assigns tasks from the queue.'}{' '}
        </Text>
        <Space>
          <Tooltip title="Refresh Now">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading} aria-label="Refresh Now" />
          </Tooltip>
          <Button icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />} onClick={toggleFullscreen}>
            {fullscreen ? 'Exit Full Screen' : 'Full Screen'}
          </Button>
        </Space>
      </div>

      <div className="board-columns">
        {STAGES.map((stage) => {
          const column = tasks.filter((t) => t.stage === stage);
          return (
            <section key={stage} className={`board-column board-column-${stage}`} aria-label={STAGE_LABELS[stage]}>
              <header className="board-column-head">
                <span>{stage === 'completed' ? 'Completed today' : STAGE_LABELS[stage]}</span>
                <span className="board-count tabular-figures">{column.length}</span>
              </header>
              <div className="board-column-body">
                {column.map((task) => (
                  <TaskCard key={task.uuid} task={task} onOpen={() => setOpenUuid(task.uuid)} />
                ))}
                {!column.length ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={null} style={{ margin: '16px 0' }} />
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <TaskDrawer
        task={open}
        canSupervise={!!board?.canSupervise}
        claimMode={board?.claimMode ?? 'manager'}
        onClose={() => setOpenUuid(null)}
        onMoved={() => refetch()}
      />
    </div>
  );
};

export default ProductionBoard;
