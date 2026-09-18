import { useEffect, useState } from "react";
import "./App.css";

const getMembershipTimeRemaining = (
  expiryDate: string,
  currentTime: number,
) => {
  const remainingMilliseconds = new Date(expiryDate).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return "Membership expired";
  }

  const totalMinutes = Math.floor(remainingMilliseconds / (1000 * 60));

  const days = Math.floor(totalMinutes / (60 * 24));

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} remaining`;
  }

  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} remaining`;
  }

  const minutes = totalMinutes;

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} remaining`;
};

const getDaysRemaining = (
  membership: {
    status: string;
    expiryDate: string | null;
    frozenRemainingSeconds: number | null;
  },
  currentTime: number,
) => {
  if (membership.status === "EXPIRED") {
    return 0;
  }

  if (membership.status === "FROZEN") {
    if (!membership.frozenRemainingSeconds) {
      return 0;
    }

    return Math.floor(membership.frozenRemainingSeconds / (60 * 60 * 24));
  }

  if (!membership.expiryDate) {
    return 0;
  }

  const remainingMilliseconds =
    new Date(membership.expiryDate).getTime() - currentTime;

  if (remainingMilliseconds <= 0) {
    return 0;
  }

  return Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24));
};

const getMembershipDisplay = (
  membership: {
    status: string;
    expiryDate: string | null;
  },
  currentTime: number,
) => {
  if (membership.status === "FROZEN") {
    return "Membership Frozen";
  }

  if (!membership.expiryDate) {
    return "Membership expired";
  }

  return getMembershipTimeRemaining(membership.expiryDate, currentTime);
};

const formatDate = (date: string | null) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-GB");
};

function App() {
  const [manageMember, setManageMember] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editAction, setEditAction] = useState("");
  const [addMember, setAddMember] = useState(false);
  const [newMemberFirstName, setNewMemberFirstName] = useState("");
  const [newMemberLastName, setNewMemberLastName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [createdMemberUsername, setCreatedMemberUsername] = useState("");
  const [createdMemberPassword, setCreatedMemberPassword] = useState("");
  const [memberCreated, setMemberCreated] = useState(false);
  const [createdMemberId, setCreatedMemberId] = useState<number | null>(null);
  const [createdMemberName, setCreatedMemberName] = useState("");
  const [creatingMember, setCreatingMember] = useState(false);
  const [createdMemberPhone, setCreatedMemberPhone] = useState("");
  const [createdMemberEmail, setCreatedMemberEmail] = useState("");

  const handleCreateMember = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setCreatingMember(true);

    try {
      const response = await fetch("http://localhost:3000/api/members/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: newMemberFirstName,
          lastName: newMemberLastName,
          phone: newMemberPhone,
          email: newMemberEmail || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setCreatedMemberId(data.credentials.userId);
      setCreatedMemberName(`${newMemberFirstName} ${newMemberLastName}`);
      setCreatedMemberPhone(newMemberPhone);
      setCreatedMemberEmail(newMemberEmail);

      setCreatedMemberUsername(data.credentials.username);
      setCreatedMemberPassword(data.credentials.password);
      setMemberCreated(true);

      const membersResponse = await fetch(
        "http://localhost:3000/api/members/view",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const membersData = await membersResponse.json();

      if (membersResponse.ok) {
        setMembers(membersData.members);
      }

      setAddMember(false);

      setNewMemberFirstName("");
      setNewMemberLastName("");
      setNewMemberPhone("");
      setNewMemberEmail("");
    } finally {
      setCreatingMember(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedMember) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      if (editAction === "freeze") {
        const response = await fetch(
          `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/freeze`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: data.membership.status,
                  expiryDate: data.membership.expiryDate,
                  freezeStartDate: data.membership.freezeStartDate,
                  frozenRemainingSeconds:
                    data.membership.frozenRemainingSeconds,
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      if (editAction === "resume") {
        const response = await fetch(
          `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/resume`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: data.membership.status,
                  startDate: data.membership.startDate,
                  expiryDate: data.membership.expiryDate,
                  freezeStartDate: data.membership.freezeStartDate,
                  frozenRemainingSeconds:
                    data.membership.frozenRemainingSeconds,
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      if (editAction === "renew") {
        const response = await fetch(
          `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/renew`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: data.membership.status,
                  startDate: data.membership.startDate,
                  expiryDate: data.membership.expiryDate,
                  freezeStartDate: data.membership.freezeStartDate,
                  frozenRemainingSeconds:
                    data.membership.frozenRemainingSeconds,
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      if (!editAction && editStartDate && editExpiryDate) {
        const response = await fetch(
          `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/dates`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              startDate: new Date(editStartDate).toISOString(),
              expiryDate: new Date(editExpiryDate).toISOString(),
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: data.membership.status,
                  startDate: data.membership.startDate,
                  expiryDate: data.membership.expiryDate,
                  freezeStartDate: data.membership.freezeStartDate,
                  frozenRemainingSeconds:
                    data.membership.frozenRemainingSeconds,
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      if (editAction === "day-pass") {
        const response = await fetch(
          `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/day-pass`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  status: data.membership.status,
                  startDate: data.membership.startDate,
                  expiryDate: data.membership.expiryDate,
                  freezeStartDate: data.membership.freezeStartDate,
                  frozenRemainingSeconds:
                    data.membership.frozenRemainingSeconds,
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      if (editAction === "deactivate") {
        const response = await fetch(
          `http://localhost:3000/api/members/${selectedMember.user.id}/deactivate`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) => {
          const updatedMembers = currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    status: "DEACTIVATED",
                  },
                }
              : member,
          );

          return updatedMembers;
        });

        setManageMember(null);
        return;
      }
      if (editAction === "activate") {
        const response = await fetch(
          `http://localhost:3000/api/members/${selectedMember.user.id}/activate`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === selectedMember.id
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    status: "ACTIVE",
                  },
                }
              : member,
          ),
        );

        setManageMember(null);
        return;
      }
      const response = await fetch(
        `http://localhost:3000/api/members/${selectedMember.user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: editFirstName,
            lastName: editLastName,
            phone: editPhone,
            email: editEmail || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.user.id === selectedMember.user.id
            ? {
                ...member,
                user: {
                  ...member.user,
                  firstName: data.member.firstName,
                  lastName: data.member.lastName,
                  phone: data.member.phone,
                  email: data.member.email,
                },
              }
            : member,
        ),
      );

      setManageMember(null);
    } catch (error) {}
  };

  const [user, setUser] = useState<{
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    role: string;
    managedGym?: {
      id: number;
      name: string;
      gymCode: string;
      address: string;
      description: string | null;
    } | null;
  } | null>(null);

  const [membership, setMembership] = useState<{
    id: number;
    status: string;
    startDate: string;
    expiryDate: string | null;
  } | null>(null);

  const [members, setMembers] = useState<
    {
      id: number;
      userId: number;
      gymId: number;
      status: string;
      startDate: string;
      expiryDate: string | null;
      freezeStartDate: string | null;
      frozenRemainingSeconds: number | null;
      user: {
        id: number;
        firstName: string;
        lastName: string;
        phone: string;
        email: string | null;
        status: string;
        username: string;
      };
      gym: {
        id: number;
        name: string;
        gymCode: string;
      };
    }[]
  >([]);

  const handleLogin = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);

      setUser(data.user);

      const meResponse = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const meData = await meResponse.json();

      if (meResponse.ok) {
        setUser(meData.user);
      }

      setMessage("Login successful!");
    } catch {
      setMessage("Could not connect to the server.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!user || user.role !== "MEMBER") {
      return;
    }

    const fetchMembership = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/members/me/membership",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembership(data.membership);
      } catch (error) {}
    };

    fetchMembership();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      return;
    }

    const fetchMembers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/members/view", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setMembers(data.members);
      } catch (error) {}
    };

    fetchMembers();
  }, [user]);

  const selectedMember = members.find((member) => member.id === manageMember);

  if (user) {
    return (
      <main className="dashboard">
        <section className="profile-header">
          <div className="profile-icon">👤</div>

          <div>
            <h2>
              {user.firstName} {user.lastName}
            </h2>

            <p>
              {user.role === "ADMIN"
                ? user.managedGym?.name || "Not managing a gym currently"
                : membership
                  ? getMembershipDisplay(membership, currentTime)
                  : "Loading membership..."}
            </p>
          </div>
        </section>
        {user.role === "ADMIN" && (
          <section>
            <div className="members-header">
              <h2>Members</h2>

              <button onClick={() => setAddMember(true)}>+ Add Member</button>
            </div>
            {addMember && (
              <div className="modal-backdrop">
                <div className="manage-member-modal">
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => {
                      setMemberCreated(false);
                      setAddMember(false);
                    }}
                  >
                    ×
                  </button>
                  <h2>Add Member</h2>

                  <div className="form-section">
                    <h3>Member Information</h3>

                    <div className="form-grid">
                      <label>
                        First Name
                        <input
                          type="text"
                          value={newMemberFirstName}
                          onChange={(event) =>
                            setNewMemberFirstName(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Last Name
                        <input
                          type="text"
                          value={newMemberLastName}
                          onChange={(event) =>
                            setNewMemberLastName(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Phone
                        <input
                          type="text"
                          value={newMemberPhone}
                          onChange={(event) =>
                            setNewMemberPhone(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Email
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(event) =>
                            setNewMemberEmail(event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setAddMember(false)}>
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleCreateMember}
                      disabled={creatingMember}
                    >
                      {creatingMember ? "Creating..." : "Create Member"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {memberCreated && (
              <div className="modal-backdrop">
                <div className="manage-member-modal">
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => {
                      setMemberCreated(false);
                      setAddMember(false);
                    }}
                  >
                    ×
                  </button>
                  <h2>Member Created Successfully</h2>

                  <div className="form-section">
                    <h3>Member Information</h3>

                    <div className="credentials-display">
                      <p>
                        <strong>Member ID:</strong> {createdMemberId}
                      </p>

                      <p>
                        <strong>Full Name:</strong> {createdMemberName}
                      </p>

                      <p>
                        <strong>Mobile:</strong> {createdMemberPhone}
                      </p>

                      <p>
                        <strong>Email:</strong>{" "}
                        {createdMemberEmail || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Login Credentials</h3>

                    <div className="credentials-display">
                      <p>
                        <strong>Username:</strong> {createdMemberUsername}
                      </p>

                      <p>
                        <strong>Password:</strong> {createdMemberPassword}
                      </p>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setMemberCreated(false);
                        setAddMember(false);
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone</th>
                  <th>Email</th>
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
                    <td>{member.user.email || "-"}</td>
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
                      <button
                        onClick={() => {
                          setManageMember(member.id);
                          setEditFirstName(member.user.firstName);
                          setEditLastName(member.user.lastName);
                          setEditPhone(member.user.phone);
                          setEditEmail(member.user.email || "");
                          setEditStartDate(
                            new Date(member.startDate)
                              .toISOString()
                              .slice(0, 16),
                          );

                          setEditExpiryDate(
                            member.expiryDate
                              ? new Date(member.expiryDate)
                                  .toISOString()
                                  .slice(0, 16)
                              : "",
                          );
                          setEditAction("");
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {manageMember !== null && (
          <div className="modal-backdrop">
            <section className="manage-member-modal">
              <button
                type="button"
                className="modal-close"
                onClick={() => setManageMember(null)}
              >
                ×
              </button>

              <div className="modal-header">
                <h2>Manage Member</h2>

                {selectedMember && (
                  <p>
                    {selectedMember.user.firstName}{" "}
                    {selectedMember.user.lastName}
                  </p>
                )}
              </div>

              {selectedMember && (
                <>
                  <div className="form-section">
                    <h3>Personal Information</h3>

                    <div className="form-grid">
                      <label>
                        First Name
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(event) =>
                            setEditFirstName(event.target.value)
                          }
                        />
                      </label>

                      <label>
                        Last Name
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(event) =>
                            setEditLastName(event.target.value)
                          }
                        />
                      </label>
                    </div>

                    <label>
                      Phone
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(event) => setEditPhone(event.target.value)}
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="form-section">
                    <h3>Membership</h3>

                    {selectedMember.user.status === "DEACTIVATED" ? (
                      <>
                        <div className="membership-display">
                          <span>Membership Status: </span>
                          <strong>
                            {getMembershipDisplay(selectedMember, currentTime)}
                          </strong>
                        </div>

                        <label>
                          Membership Action
                          <select
                            value={editAction}
                            onChange={(event) =>
                              setEditAction(event.target.value)
                            }
                          >
                            <option value="">No action</option>
                            <option value="activate">Activate</option>
                          </select>
                        </label>
                      </>
                    ) : selectedMember.status === "FROZEN" ? (
                      <>
                        <div className="membership-display">
                          <span>MembershipStatus: </span>
                          <strong>
                            {getMembershipDisplay(selectedMember, currentTime)}
                          </strong>
                        </div>

                        <label>
                          Membership Action
                          <select
                            value={editAction}
                            onChange={(event) =>
                              setEditAction(event.target.value)
                            }
                          >
                            <option value="">No action</option>
                            <option value="resume">Resume</option>
                          </select>
                        </label>
                      </>
                    ) : (
                      <>
                        <div className="form-grid">
                          <label>
                            Start Date
                            <input
                              type="datetime-local"
                              value={editStartDate}
                              onChange={(event) =>
                                setEditStartDate(event.target.value)
                              }
                            />
                          </label>

                          <label>
                            End Date
                            <input
                              type="datetime-local"
                              value={editExpiryDate}
                              onChange={(event) =>
                                setEditExpiryDate(event.target.value)
                              }
                            />
                          </label>
                        </div>

                        {selectedMember.status === "ACTIVE" && (
                          <div className="membership-display">
                            <span>Time Remaining: </span>
                            <strong>
                              {getMembershipDisplay(
                                selectedMember,
                                currentTime,
                              )}
                            </strong>
                          </div>
                        )}

                        <label>
                          Membership Action
                          <select
                            value={editAction}
                            onChange={(event) =>
                              setEditAction(event.target.value)
                            }
                          >
                            <option value="">No action</option>

                            {selectedMember.status === "ACTIVE" && (
                              <>
                                <option value="freeze">Freeze</option>
                                <option value="renew">Renew</option>
                                <option value="deactivate">Deactivate</option>
                              </>
                            )}

                            {selectedMember.status === "EXPIRED" && (
                              <>
                                <option value="renew">Renew</option>
                                <option value="day-pass">Day Pass</option>
                                <option value="deactivate">Deactivate</option>
                              </>
                            )}

                            {selectedMember.status === "DEACTIVATED" && (
                              <option value="activate">Activate</option>
                            )}
                          </select>
                        </label>
                      </>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setManageMember(null)}>
                      Close
                    </button>

                    <button type="button" onClick={handleApplyChanges}>
                      Apply Changes
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Gym Platform</h1>

        <p className="auth-subtitle">Login to your account</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              type="text"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </section>
    </main>
  );
}

export default App;
