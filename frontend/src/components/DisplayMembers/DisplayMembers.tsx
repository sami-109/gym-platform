import { formatDate, getDaysRemaining } from "../../utils/membership";
import type { Member } from "../../types/member";

type DisplayMembersProps = {
  members: Member[];
  currentTime: number;
  onAddMember: () => void;
  onManageMember: (memberId: number) => void;
};

function DisplayMembers({
  members,
  currentTime,
  onAddMember,
  onManageMember,
}: DisplayMembersProps) {
  return (
    <section>
      <div className="members-header">
        <h2>Members</h2>

        <button onClick={onAddMember}>+ Add Member</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Days Remaining</th>
            <th>Status</th>
            <th>Manage</th>
          </tr>
        </thead>

        <tbody>
          {members.map((member) => (
            <tr
              key={member.id}
              className={
                member.user.status === "DEACTIVATED"
                  ? "member-row-deactivated"
                  : ""
              }
            >
              <td>{member.user.id}</td>
              <td>{member.user.firstName}</td>
              <td>{member.user.lastName}</td>
              <td>{member.user.phone}</td>
              <td>{formatDate(member.startDate)}</td>
              <td>{formatDate(member.expiryDate)}</td>
              <td>{getDaysRemaining(member, currentTime)}</td>

              <td>
                {member.user.status === "DEACTIVATED"
                  ? "Deactivated"
                  : member.status === "FROZEN"
                    ? "Frozen"
                    : member.status === "EXPIRED"
                      ? "Expired"
                      : member.status === "ACTIVE"
                        ? "Active"
                        : member.status}
              </td>

              <td>
                <button onClick={() => onManageMember(member.id)}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default DisplayMembers;
