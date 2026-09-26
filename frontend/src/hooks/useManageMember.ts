import { useState } from "react";
import type { Member } from "../types/member";

function useManageMember(
  members: Member[],
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>,
) {
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editAction, setEditAction] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [manageMemberError, setManageMemberError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [isRetrievingCredentials, setIsRetrievingCredentials] = useState(false);
  const [retrievedCredentials, setRetrievedCredentials] = useState<{
    userId: number;
    username: string;
    password: string;
  } | null>(null);

  const clearRetrievedCredentials = () => {
    setRetrievedCredentials(null);
  };

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  const closeManageMember = () => {
    setSelectedMemberId(null);
    setManageMemberError("");
  };

  const freezeMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

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

    if (!response.ok) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              expiryDate: data.membership.expiryDate,
              freezeStartDate: data.membership.freezeStartDate,
              frozenRemainingSeconds: data.membership.frozenRemainingSeconds,
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const resumeMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

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

    if (!response.ok) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              startDate: data.membership.startDate,
              expiryDate: data.membership.expiryDate,
              freezeStartDate: data.membership.freezeStartDate,
              frozenRemainingSeconds: data.membership.frozenRemainingSeconds,
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const renewMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

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

    if (!response.ok) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              startDate: data.membership.startDate,
              expiryDate: data.membership.expiryDate,
              freezeStartDate: data.membership.freezeStartDate,
              frozenRemainingSeconds: data.membership.frozenRemainingSeconds,
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const adjustMembershipDates = async (
    startDate: string,
    expiryDate: string,
  ) => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch(
      `http://localhost:3000/api/gyms/${selectedMember.gymId}/memberships/${selectedMember.id}/dates`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: new Date(startDate).toISOString(),
          expiryDate: new Date(expiryDate).toISOString(),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              startDate: data.membership.startDate,
              expiryDate: data.membership.expiryDate,
              freezeStartDate: data.membership.freezeStartDate,
              frozenRemainingSeconds: data.membership.frozenRemainingSeconds,
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const addDayPass = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

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

    if (!response.ok) return;

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              startDate: data.membership.startDate,
              expiryDate: data.membership.expiryDate,
              freezeStartDate: data.membership.freezeStartDate,
              frozenRemainingSeconds: data.membership.frozenRemainingSeconds,
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const deactivateMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

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

    if (!response.ok) return;

    console.log("Deactivate response:", data);

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              status: data.membership.status,
              expiryDate: data.membership.expiryDate,
              user: {
                ...member.user,
                status: "DEACTIVATED",
              },
            }
          : member,
      ),
    );

    closeManageMember();
  };

  const activateMember = async () => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch(
      `http://localhost:3000/api/members/${selectedMember.user.id}/activate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await response.json();

    if (!response.ok) return;

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

    closeManageMember();
  };

  const editMember = async (
    firstName: string,
    lastName: string,
    phone: string,
    email: string,
  ) => {
    if (!selectedMember) return;

    const token = localStorage.getItem("token");

    if (!token) return;

    setManageMemberError("");

    const response = await fetch(
      `http://localhost:3000/api/members/${selectedMember.user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email: email || null,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setManageMemberError(data.message || "Something went wrong.");
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

    closeManageMember();
  };

  const handleApplyChanges = async () => {
    if (!selectedMember) {
      return;
    }

    setApplyingChanges(true);

    try {
      // First save personal information if it changed
      const personalInfoChanged =
        editFirstName !== selectedMember.user.firstName ||
        editLastName !== selectedMember.user.lastName ||
        editPhone !== selectedMember.user.phone ||
        editEmail !== (selectedMember.user.email || "");

      if (personalInfoChanged) {
        await editMember(editFirstName, editLastName, editPhone, editEmail);
      }

      // Then perform the selected membership action
      if (editAction === "freeze") {
        await freezeMember();
        return;
      }

      if (editAction === "resume") {
        await resumeMember();
        return;
      }

      if (editAction === "renew") {
        await renewMember();
        return;
      }

      if (editAction === "day-pass") {
        await addDayPass();
        return;
      }

      if (editAction === "deactivate") {
        await deactivateMember();
        return;
      }

      if (editAction === "activate") {
        await activateMember();
        return;
      }

      // If there is no action, check whether dates changed
      if (
        !editAction &&
        editStartDate &&
        editExpiryDate &&
        (editStartDate !==
          new Date(selectedMember.startDate).toISOString().slice(0, 16) ||
          editExpiryDate !==
            (selectedMember.expiryDate
              ? new Date(selectedMember.expiryDate).toISOString().slice(0, 16)
              : ""))
      ) {
        await adjustMembershipDates(editStartDate, editExpiryDate);
        return;
      }

      // Nothing else to do
      if (!editAction && !personalInfoChanged) {
        closeManageMember();
      }
    } catch (error) {
      // Keep the modal open if something goes wrong
    } finally {
      setApplyingChanges(false);
    }
  };

  const openManageMember = (memberId: number) => {
    const member = members.find((member) => member.id === memberId);

    if (!member) {
      return;
    }

    setSelectedMemberId(member.id);
    setEditFirstName(member.user.firstName);
    setEditLastName(member.user.lastName);
    setEditPhone(member.user.phone);
    setEditEmail(member.user.email || "");

    setEditStartDate(new Date(member.startDate).toISOString().slice(0, 16));

    setEditExpiryDate(
      member.expiryDate
        ? new Date(member.expiryDate).toISOString().slice(0, 16)
        : "",
    );

    setEditAction("");
  };

  const retrieveCredentials = async (memberId: number) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    setIsRetrievingCredentials(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/members/${memberId}/retrieve-credentials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to retrieve credentials.");
      }

      setRetrievedCredentials(data.credentials);
    } catch (error) {
      throw error;
    } finally {
      setIsRetrievingCredentials(false);
    }
  };

  const requestDeleteMember = (memberId: number) => {
    setMemberToDelete(memberId);
  };

  const cancelDeleteMember = () => {
    setMemberToDelete(null);
  };

  const deleteMember = async (memberId: number) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete member.");
      }

      setMembers((currentMembers) =>
        currentMembers.filter((member) => member.user.id !== memberId),
      );

      setMemberToDelete(null);
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedMemberId,
    retrievedCredentials,
    clearRetrievedCredentials,

    editFirstName,
    setEditFirstName,
    editLastName,
    setEditLastName,
    editPhone,
    setEditPhone,
    editEmail,
    setEditEmail,
    editStartDate,
    setEditStartDate,
    editExpiryDate,
    setEditExpiryDate,
    editAction,
    setEditAction,

    closeManageMember,
    selectedMember,

    handleApplyChanges,
    openManageMember,
    manageMemberError,
    retrieveCredentials,
    deleteMember,
    requestDeleteMember,
    memberToDelete,
    cancelDeleteMember,
    isDeleting,
    applyingChanges,
    isRetrievingCredentials,
  };
}

export default useManageMember;
