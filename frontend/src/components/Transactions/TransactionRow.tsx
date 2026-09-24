import "./Transactions.scss";
type TransactionRowProps = {
  date: string;
  member: string;
  action: string;
  amount: number;
  onEdit: () => void;
  onDelete: () => void;
};

function TransactionRow({
  date,
  member,
  action,
  amount,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  return (
    <tr>
      <td>{member}</td>
      <td>{action}</td>
      <td>${amount.toFixed(2)}</td>
      <td>{date}</td>
      <td>
        <div className="transaction-actions">
          <button type="button" onClick={onEdit}>
            Edit
          </button>

          <button type="button" onClick={onDelete}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default TransactionRow;
