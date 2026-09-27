import { useState } from "react";
import type { CreatedMember } from "../types/createMember";

function useCreateMember(
  fetchMembers: (showLoading?: boolean) => Promise<void>,
) {
  const [creatingMember, setCreatingMember] = useState(false);

  const [newMemberFirstName, setNewMemberFirstName] = useState("");
  const [newMemberLastName, setNewMemberLastName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const [addMember, setAddMember] = useState(false);

  const [isMemberCreated, setIsMemberCreated] = useState(false);

  const [createdMemberData, setCreatedMemberData] =
    useState<CreatedMember | null>(null);

  const [createMemberError, setCreateMemberError] = useState("");

  const [newMemberMembershipType, setNewMemberMembershipType] =
    useState("1-month");

  const createMemberRequest = async (): Promise<CreatedMember | null> => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCreateMemberError("Authentication token is missing.");
      return null;
    }

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
        membershipType: newMemberMembershipType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setCreateMemberError(data.message || "Something went wrong.");
      return null;
    }

    return {
      memberId: data.credentials.userId,
      memberName: `${newMemberFirstName} ${newMemberLastName}`,
      memberPhone: newMemberPhone,
      memberEmail: newMemberEmail,
      membershipType: newMemberMembershipType,
      username: data.credentials.username,
      password: data.credentials.password,
    };
  };

  const createMember = async () => {
    setCreatingMember(true);
    setCreateMemberError("");

    try {
      const result = await createMemberRequest();

      if (!result) {
        return;
      }

      await fetchMembers(false);

      setCreatedMemberData(result);

      setIsMemberCreated(true);
      setAddMember(false);

      setNewMemberFirstName("");
      setNewMemberLastName("");
      setNewMemberPhone("");
      setNewMemberEmail("");
      setNewMemberMembershipType("1-month");
    } catch (error) {
      setCreateMemberError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the member.",
      );
    } finally {
      setCreatingMember(false);
    }
  };

  return {
    creatingMember,

    newMemberFirstName,
    setNewMemberFirstName,
    newMemberLastName,
    setNewMemberLastName,
    newMemberPhone,
    setNewMemberPhone,
    newMemberEmail,
    setNewMemberEmail,

    addMember,
    setAddMember,

    createdMemberData,
    isMemberCreated,
    setIsMemberCreated,

    createMember,

    createMemberError,

    newMemberMembershipType,
    setNewMemberMembershipType,

    setCreateMemberError,
  };
}

export default useCreateMember;
