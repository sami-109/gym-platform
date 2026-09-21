import { useState } from "react";

function useCreateMember() {
  const [creatingMember, setCreatingMember] = useState(false);
  const [newMemberFirstName, setNewMemberFirstName] = useState("");
  const [newMemberLastName, setNewMemberLastName] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addMember, setAddMember] = useState(false);
  const [createdMemberUsername, setCreatedMemberUsername] = useState("");
  const [createdMemberPassword, setCreatedMemberPassword] = useState("");
  const [memberCreated, setMemberCreated] = useState(false);
  const [createdMemberId, setCreatedMemberId] = useState<number | null>(null);
  const [createdMemberName, setCreatedMemberName] = useState("");
  const [createdMemberPhone, setCreatedMemberPhone] = useState("");
  const [createdMemberEmail, setCreatedMemberEmail] = useState("");

  const createMember = async () => {
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

      return {
        memberId: data.credentials.userId,
        memberName: `${newMemberFirstName} ${newMemberLastName}`,
        memberPhone: newMemberPhone,
        memberEmail: newMemberEmail,
        username: data.credentials.username,
        password: data.credentials.password,
      };
    } finally {
      setCreatingMember(false);
    }
  };

  const handleCreateMember = async () => {
    try {
      const result = await createMember();

      if (!result) {
        return;
      }

      setCreatedMemberId(result.memberId);
      setCreatedMemberName(result.memberName);
      setCreatedMemberPhone(result.memberPhone);
      setCreatedMemberEmail(result.memberEmail);

      setCreatedMemberUsername(result.username);
      setCreatedMemberPassword(result.password);
      setMemberCreated(true);

      setAddMember(false);

      setNewMemberFirstName("");
      setNewMemberLastName("");
      setNewMemberPhone("");
      setNewMemberEmail("");
    } catch (error) {}
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
    createdMemberUsername,
    createdMemberPassword,
    memberCreated,
    setMemberCreated,
    createdMemberId,
    createdMemberName,
    createdMemberPhone,
    createdMemberEmail,
    handleCreateMember,
  };
}

export default useCreateMember;
