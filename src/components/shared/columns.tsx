import type { ProColumns } from '@ant-design/pro-components';
import { Badge, Tooltip } from 'antd';

import type { StatusEnum } from '@/utils/enum';
import { formatCurrency, formatProgress, formatQty } from '@/utils/format';
import { tokens } from '@/components/common/theme';

/**
 * Column builders shared by the list screens.
 *
 * They exist so that a status, an amount or a quantity looks and behaves the
 * same on every screen. Defining these inline per table is how the app ended up
 * with raw status strings in one place and coloured tags in another.
 */

/**
 * Status as an Ant Design Badge: a coloured dot *and* a readable label, so the
 * state is never carried by colour alone. Also gives the column a filter, since
 * "show me everything still to deliver" is the common question on these screens.
 */
export const statusColumn = (
  title: string,
  dataIndex: string,
  valueEnum: StatusEnum,
  extra: Partial<ProColumns<any>> = {},
): ProColumns<any> => ({
  title,
  dataIndex,
  valueType: 'select',
  valueEnum,
  filters: true,
  onFilter: true,
  width: 150,
  ...extra,
});

/** Right-aligned money with tabular figures, so columns of amounts line up. */
export const moneyColumn = (
  title: string,
  dataIndex: string,
  extra: Partial<ProColumns<any>> = {},
): ProColumns<any> => ({
  title,
  dataIndex,
  search: false,
  align: 'right',
  width: 130,
  render: (_: any, record: any) => <span className="tabular-figures">{formatCurrency(record[dataIndex])}</span>,
  ...extra,
});

/** Right-aligned quantity, optionally with the row's unit of measure. */
export const qtyColumn = (
  title: string,
  dataIndex: string,
  uomField?: string,
  extra: Partial<ProColumns<any>> = {},
): ProColumns<any> => ({
  title,
  dataIndex,
  search: false,
  align: 'right',
  width: 110,
  render: (_: any, record: any) => (
    <span className="tabular-figures">
      {formatQty(record[dataIndex])}
      {uomField && record[uomField] ? (
        <span style={{ color: tokens.textTertiary, marginLeft: 4 }}>{record[uomField]}</span>
      ) : null}
    </span>
  ),
  ...extra,
});

/**
 * "done / total" in one cell. A single number hides whether a line is part-done,
 * which is exactly what an operator is scanning for.
 */
export const progressColumn = (
  title: string,
  doneField: string,
  totalField: string,
  extra: Partial<ProColumns<any>> = {},
): ProColumns<any> => ({
  title,
  dataIndex: doneField,
  search: false,
  align: 'right',
  width: 130,
  render: (_: any, record: any) => {
    const done = Number(record[doneField] ?? 0);
    const total = Number(record[totalField] ?? 0);
    const complete = total > 0 && done >= total;

    return (
      <span className="tabular-figures" style={{ color: complete ? tokens.success : undefined }}>
        {formatProgress(record[doneField], record[totalField])}
      </span>
    );
  },
  ...extra,
});

/**
 * Outstanding / paid / total in one cell.
 *
 * This replaces three bare coloured tags. The numbers were unlabelled, so the
 * only thing distinguishing "owed" from "paid" was tag colour — unreadable for
 * anyone who can't separate red from green, and ambiguous for everyone else.
 */
export const amountBreakdownColumn = (
  title: string,
  fields: { due: string; paid: string; total: string },
  extra: Partial<ProColumns<any>> = {},
): ProColumns<any> => ({
  title,
  dataIndex: fields.total,
  search: false,
  align: 'right',
  width: 170,
  render: (_: any, record: any) => {
    const due = Number(record[fields.due] ?? 0);

    return (
      <Tooltip
        title={
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <div>Outstanding: {formatCurrency(record[fields.due])}</div>
            <div>Paid: {formatCurrency(record[fields.paid])}</div>
            <div>Total: {formatCurrency(record[fields.total])}</div>
          </div>
        }
      >
        <div className="tabular-figures" style={{ lineHeight: 1.35 }}>
          <div
            style={{
              fontWeight: 600,
              color: due > 0 ? tokens.warning : tokens.success,
            }}
          >
            {due > 0 ? `${formatCurrency(due)} due` : 'Settled'}
          </div>
          <div style={{ fontSize: 12, color: tokens.textTertiary }}>of {formatCurrency(record[fields.total])}</div>
        </div>
      </Tooltip>
    );
  },
  ...extra,
});

/** Document code, emphasised — it is the row's identity and what people search by. */
export const codeColumn = (title: string, dataIndex = 'code', onClick?: (record: any) => void): ProColumns<any> => ({
  title,
  dataIndex,
  width: 130,
  copyable: true,
  render: (_: any, record: any) =>
    onClick ? (
      <a onClick={() => onClick(record)} className="doc-code">
        {record[dataIndex]}
      </a>
    ) : (
      <span className="doc-code">{record[dataIndex]}</span>
    ),
});

/** A status outside a table, rendered the same way as `statusColumn`. */
export const StatusBadge = ({ value, valueEnum }: { value?: string | null; valueEnum: StatusEnum }) => {
  const entry = value ? valueEnum[value] : undefined;
  if (!entry) return <span>{value ?? '—'}</span>;
  return <Badge status={entry.status.toLowerCase() as any} text={entry.text} />;
};
