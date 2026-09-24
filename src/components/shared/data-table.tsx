import { useMemo } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ProTableProps } from '@ant-design/pro-components';
import { Empty, Grid, Typography } from 'antd';
import { tokens } from '@/components/common/theme';

const { Text } = Typography;

type DataTableProps<T extends Record<string, any>> = ProTableProps<T, any> & {
  /** What this screen lists, e.g. "sales orders". Used in the empty state. */
  entityName?: string;
  /** One line telling the user how to get their first record. */
  emptyHint?: string;
  /** Overrides "No {entityName} yet", e.g. when a search or filter is active. */
  emptyTitle?: string;
};

/**
 * The list-screen table.
 *
 * Wraps ProTable so every list shares the same density, pagination, sticky
 * header and empty state. Screens pass columns and a request; everything about
 * how a table *behaves* is decided here.
 */
function DataTable<T extends Record<string, any>>({
  entityName = 'records',
  emptyHint,
  emptyTitle,
  columns,
  ...props
}: DataTableProps<T>) {
  /**
   * These tables scroll horizontally, which on a wide list pushes the row
   * actions off-screen — the one column the operator came to use. Pin it.
   */
  const screens = Grid.useBreakpoint();
  // On a phone a pinned column is wider than the viewport and hides the data.
  const pinActions = screens.md !== false;

  const pinnedColumns = useMemo(
    () =>
      (columns ?? []).map((column) => {
        const col = column as ProColumns<T>;

        if (col.valueType === 'option' && pinActions) {
          return { ...column, fixed: 'right' as const };
        }

        // Date columns with no width collapse to the width of their content,
        // which wraps the header one letter per line when the cell is empty.
        if ((col.valueType === 'date' || col.valueType === 'dateTime') && !col.width) {
          return { ...column, width: col.valueType === 'dateTime' ? 165 : 120 };
        }

        return column;
      }),
    [columns, pinActions],
  );

  return (
    <ProTable<T, any>
      // ProTable keeps its first column set, so remount when pinning changes.
      key={pinActions ? 'pinned' : 'unpinned'}
      rowKey="uuid"
      // Compact rows: these screens are read in bulk, and default padding fits
      // roughly a third fewer rows on screen.
      size="small"
      cardBordered={false}
      // Keeps the header in view while scrolling a long list.
      sticky
      // Wide operational tables scroll horizontally rather than squeezing
      // columns until the numbers are unreadable.
      scroll={{ x: 'max-content' }}
      columns={pinnedColumns}
      dateFormatter="string"
      search={false}
      options={{ density: true, fullScreen: true, reload: true, setting: true }}
      pagination={{
        showQuickJumper: true,
        showSizeChanger: true,
        defaultPageSize: 20,
        pageSizeOptions: [10, 20, 50, 100],
        showTotal: (total, range) => (
          <Text type="secondary">
            {range[0]}–{range[1]} of {total}
          </Text>
        ),
      }}
      // A blank table tells the user nothing about whether it is broken or just
      // empty, so say which, and what to do next.
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <div style={{ color: tokens.textSecondary, marginBottom: 4 }}>
                  {emptyTitle ?? `No ${entityName} yet`}
                </div>
                {emptyHint ? (
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {emptyHint}
                  </Text>
                ) : null}
              </span>
            }
            style={{ padding: '32px 0' }}
          />
        ),
      }}
      {...props}
    />
  );
}

export default DataTable;
