import { formatDate, getDaysRemaining } from "../../utils/membership";
import type { Member } from "../../types/member";
import "./DisplayMembers.scss";
import { formatPhone } from "../../utils/phone";
import { useState } from "react";

type DisplayMembersProps = {
  members: Member[];
  currentTime: number;
  onAddMember: () => void;
  onManageMember: (memberId: number) => void;
  onDeleteMember: (memberId: number) => void;
};

function DisplayMembers({
  members,
  currentTime,
  onAddMember,
  onManageMember,
  onDeleteMember,
}: DisplayMembersProps) {
  const [idSortAscending, setIdSortAscending] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [daysSortAscending, setDaysSortAscending] = useState(true);
  const [nameSortAscending, setNameSortAscending] = useState(true);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    "id" | "firstName" | "lastName" | "days"
  >("id");
  const [daysFilter, setDaysFilter] = useState("ALL");
  const [daysFilterOpen, setDaysFilterOpen] = useState(false);

  const filteredMembers = members.filter((member) => {
    const search = searchTerm.toLowerCase().trim();

    const fullName =
      `${member.user.firstName} ${member.user.lastName}`.toLowerCase();

    const normalizedSearch = search.replace(/\s/g, "");
    const normalizedPhone = member.user.phone.replace(/\s/g, "");

    const matchesSearch =
      fullName.includes(search) ||
      member.user.firstName.toLowerCase().includes(search) ||
      member.user.lastName.toLowerCase().includes(search) ||
      normalizedPhone.includes(normalizedSearch);

    if (!matchesSearch) return false;

    if (statusFilter !== "ALL") {
      if (statusFilter === "DEACTIVATED") {
        if (member.user.status !== "DEACTIVATED") return false;
      } else if (statusFilter === "EXPIRED") {
        if (
          member.status !== "EXPIRED" ||
          member.user.status === "DEACTIVATED"
        ) {
          return false;
        }
      } else if (member.status !== statusFilter) {
        return false;
      }
    }

    if (daysFilter === "LESS_THAN_7") {
      const daysRemaining = getDaysRemaining(member, currentTime);

      if (daysRemaining < 0 || daysRemaining >= 7) {
        return false;
      }
    }

    return true;
  });

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortBy === "id") {
      const idA = Number(a.user.username.match(/\d+$/)?.[0] ?? 0);
      const idB = Number(b.user.username.match(/\d+$/)?.[0] ?? 0);

      return idSortAscending ? idA - idB : idB - idA;
    }

    if (sortBy === "firstName") {
      const nameA = a.user.firstName.toLowerCase();
      const nameB = b.user.firstName.toLowerCase();

      return nameSortAscending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    if (sortBy === "lastName") {
      const nameA = a.user.lastName.toLowerCase();
      const nameB = b.user.lastName.toLowerCase();

      return nameSortAscending
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }

    const daysA = getDaysRemaining(a, currentTime);
    const daysB = getDaysRemaining(b, currentTime);

    return daysSortAscending ? daysA - daysB : daysB - daysA;
  });

  return (
    <section>
      <div className="members-header">
        <h2>Members</h2>

        <div className="members-search">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <button onClick={onAddMember}>+ Add Member</button>
      </div>

      <div className="table-header">
        <p>
          {filteredMembers.length}{" "}
          {filteredMembers.length === 1 ? "Member" : "Members"}
        </p>
      </div>
      <div className="members-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("id");
                    setIdSortAscending((current) => !current);
                  }}
                  className="id-sort-button"
                >
                  ID
                  {sortBy === "id" && (
                    <span className="sort-arrow">
                      {idSortAscending ? "↓" : "↑"}
                    </span>
                  )}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("firstName");
                    setNameSortAscending((current) => !current);
                  }}
                  className="name-sort-button"
                >
                  First Name
                  {sortBy === "firstName" && (
                    <span className="sort-arrow">
                      {nameSortAscending ? "↓" : "↑"}
                    </span>
                  )}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy("lastName");
                    setNameSortAscending((current) => !current);
                  }}
                  className="name-sort-button"
                >
                  Last Name
                  {sortBy === "lastName" && (
                    <span className="sort-arrow">
                      {nameSortAscending ? "↓" : "↑"}
                    </span>
                  )}
                </button>
              </th>
              <th>Phone</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>
                <div className="days-header">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("days");
                      setDaysSortAscending((current) => !current);
                    }}
                    className="days-sort-button"
                  >
                    Days Remaining
                    {sortBy === "days" && (
                      <span className="sort-arrow">
                        {daysSortAscending ? "↓" : "↑"}
                      </span>
                    )}
                  </button>

                  <div className="days-filter-wrapper">
                    <button
                      type="button"
                      className="days-filter-button"
                      onClick={() => setDaysFilterOpen((current) => !current)}
                    >
                      ▾
                    </button>

                    {daysFilterOpen && (
                      <div className="days-filter-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setDaysFilter("ALL");
                            setDaysFilterOpen(false);
                          }}
                        >
                          All
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDaysFilter("LESS_THAN_7");
                            setDaysFilterOpen(false);
                          }}
                        >
                          Less than 7 days
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th>
                <div className="status-header">
                  <span>Status</span>

                  <div className="status-filter-wrapper">
                    <button
                      type="button"
                      className="status-filter-button"
                      onClick={() => setStatusFilterOpen((current) => !current)}
                    >
                      ▾
                    </button>

                    {statusFilterOpen && (
                      <div className="status-filter-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("ALL");
                            setStatusFilterOpen(false);
                          }}
                        >
                          All
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("ACTIVE");
                            setStatusFilterOpen(false);
                          }}
                        >
                          Active
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("FROZEN");
                            setStatusFilterOpen(false);
                          }}
                        >
                          Frozen
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("DEACTIVATED");
                            setStatusFilterOpen(false);
                          }}
                        >
                          Deactivated
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStatusFilter("EXPIRED");
                            setStatusFilterOpen(false);
                          }}
                        >
                          Expired
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedMembers.length === 0 ? (
              <tr>
                <td colSpan={10}>No members</td>
              </tr>
            ) : (
              sortedMembers.map((member) => (
                <tr
                  key={member.id}
                  className={
                    member.user.status === "DEACTIVATED"
                      ? "member-row-deactivated"
                      : member.status === "FROZEN"
                        ? "member-row-frozen"
                        : member.status === "EXPIRED"
                          ? "member-row-expired"
                          : member.status === "ACTIVE"
                            ? "member-row-active"
                            : ""
                  }
                >
                  <td>{Number(member.user.username.replace(/\D/g, ""))}</td>
                  <td>{member.user.firstName}</td>
                  <td>{member.user.lastName}</td>
                  <td>{formatPhone(member.user.phone)}</td>
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

                  <td className="actions-column">
                    <div className="member-actions">
                      <button onClick={() => onManageMember(member.id)}>
                        Manage
                      </button>

                      <button onClick={() => onDeleteMember(member.user.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DisplayMembers;
