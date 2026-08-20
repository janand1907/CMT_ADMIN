import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Table, THead, Th, TBody, Tr, Td, EmptyRow } from "@/components/admin/ui/Table";

// Shared [{ label, count }] renderer for the six Lead Reports breakdowns
// (date/source/destination/package/staff/status-wise) — same shape, six times.
export function BreakdownTable({ title, rows, labelHeader = "Label" }) {
  return (
    <Card padded={false}>
      <div className="p-6 pb-0">
        <CardHeader title={title} />
      </div>
      <Table>
        <THead>
          <Th>{labelHeader}</Th>
          <Th className="text-right">Count</Th>
        </THead>
        <TBody>
          {(!rows || rows.length === 0) && <EmptyRow colSpan={2}>No leads yet.</EmptyRow>}
          {rows?.map((row) => (
            <Tr key={row.label}>
              <Td>{row.label}</Td>
              <Td className="text-right font-medium text-gray-900">{row.count}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
