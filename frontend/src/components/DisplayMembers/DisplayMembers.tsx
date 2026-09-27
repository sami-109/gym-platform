import "./DisplayMembers.scss";
import { formatPhone } from "../../utils/phone";
import useDisplayMembers from "../../hooks/useDisplayMembers";
import type { DisplayMembersProps } from "../../types/displayMembers";
import { formatDate, getDaysRemaining } from "../../utils/membership";

function DisplayMembers({
  members,
  currentTime,
  onAddMember,
  onManageMember,
  onDeleteMember,
}: DisplayMembersProps) {
  const {
    searchTerm,
    setSearchTerm,

    filteredMembers,
    sortedMembers,

    statusFilterOpen,

    daysFilterOpen,

    sortBy,

    idSortAscending,
    nameSortAscending,
    daysSortAscending,

    handleIdSort,
    handleFirstNameSort,
    handleLastNameSort,
    handleDaysSort,

    toggleDaysFilter,
    selectDaysFilter,

    toggleStatusFilter,
    selectStatusFilter,
  } = useDisplayMembers(members, currentTime);

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
                  onClick={handleIdSort}
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
                  onClick={handleFirstNameSort}
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
                  onClick={handleLastNameSort}
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
                    onClick={handleDaysSort}
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
                      onClick={toggleDaysFilter}
                    >
                      ▾
                    </button>

                    {daysFilterOpen && (
                      <div className="days-filter-menu">
                        <button
                          type="button"
                          onClick={() => selectDaysFilter("ALL")}
                        >
                          All
                        </button>

                        <button
                          type="button"
                          onClick={() => selectDaysFilter("LESS_THAN_7")}
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
                      onClick={toggleStatusFilter}
                    >
                      ▾
                    </button>

                    {statusFilterOpen && (
                      <div className="status-filter-menu">
                        <button
                          type="button"
                          onClick={() => selectStatusFilter("ALL")}
                        >
                          All
                        </button>

                        <button
                          type="button"
                          onClick={() => selectStatusFilter("ACTIVE")}
                        >
                          Active
                        </button>

                        <button
                          type="button"
                          onClick={() => selectStatusFilter("FROZEN")}
                        >
                          Frozen
                        </button>

                        <button
                          type="button"
                          onClick={() => selectStatusFilter("DEACTIVATED")}
                        >
                          Deactivated
                        </button>

                        <button
                          type="button"
                          onClick={() => selectStatusFilter("EXPIRED")}
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
