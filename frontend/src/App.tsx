import "./App.css";
import Login from "./components/Login/Login";
import DisplayMembers from "./components/DisplayMembers/DisplayMembers";
import CreateMember from "./components/CreateMember/CreateMember";
import MemberCredentials from "./components/MemberCredentials/MemberCredentials";
import ManageMember from "./components/ManageMember/ManageMember";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import useMembers from "./hooks/useMembers";
import useCreateMember from "./hooks/useCreateMember";
import useManageMember from "./hooks/useManageMember";
import MemberDashboard from "./components/MemberDashboard/MemberDashboard";
import useLogin from "./hooks/useLogin";
import useCurrentTime from "./hooks/useCurrentTime";
import useMembership from "./hooks/useMembership";

function App() {
  const currentTime = useCurrentTime();

  const {
    username,
    setUsername,
    password,
    setPassword,
    message,
    user,
    handleLogin,
  } = useLogin();

  const { members, setMembers } = useMembers(user?.role);

  const {
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
  } = useCreateMember();

  const {
    selectedMemberId,
    closeManageMember,
    handleApplyChanges,
    openManageMember,

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

    selectedMember,
  } = useManageMember(members, setMembers);

  const { membership } = useMembership(user?.id, user?.role);

  if (user) {
    if (user.role === "MEMBER") {
      return (
        <MemberDashboard
          firstName={user.firstName}
          lastName={user.lastName}
          membership={membership}
          currentTime={currentTime}
        />
      );
    }
    return (
      <AdminDashboard
        firstName={user?.firstName || ""}
        lastName={user?.lastName || ""}
        gymName={user?.managedGym?.name || ""}
      >
        {user.role === "ADMIN" && (
          <section>
            {addMember && (
              <CreateMember
                firstName={newMemberFirstName}
                lastName={newMemberLastName}
                phone={newMemberPhone}
                email={newMemberEmail}
                creating={creatingMember}
                onFirstNameChange={setNewMemberFirstName}
                onLastNameChange={setNewMemberLastName}
                onPhoneChange={setNewMemberPhone}
                onEmailChange={setNewMemberEmail}
                onCreate={handleCreateMember}
                onClose={() => {
                  setMemberCreated(false);
                  setAddMember(false);
                }}
              />
            )}

            {memberCreated && (
              <MemberCredentials
                memberId={createdMemberId}
                memberName={createdMemberName}
                memberPhone={createdMemberPhone}
                memberEmail={createdMemberEmail}
                username={createdMemberUsername}
                password={createdMemberPassword}
                onClose={() => {
                  setMemberCreated(false);
                  setAddMember(false);
                }}
              />
            )}

            <DisplayMembers
              members={members}
              currentTime={currentTime}
              onAddMember={() => setAddMember(true)}
              onManageMember={openManageMember}
            />
          </section>
        )}

        {selectedMemberId !== null && selectedMember && (
          <ManageMember
            member={selectedMember}
            currentTime={currentTime}
            firstName={editFirstName}
            lastName={editLastName}
            phone={editPhone}
            email={editEmail}
            startDate={editStartDate}
            expiryDate={editExpiryDate}
            action={editAction}
            onFirstNameChange={setEditFirstName}
            onLastNameChange={setEditLastName}
            onPhoneChange={setEditPhone}
            onEmailChange={setEditEmail}
            onStartDateChange={setEditStartDate}
            onExpiryDateChange={setEditExpiryDate}
            onActionChange={setEditAction}
            onApply={handleApplyChanges}
            onClose={closeManageMember}
          />
        )}
      </AdminDashboard>
    );
  }

  return (
    <Login
      username={username}
      password={password}
      message={message}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onLogin={handleLogin}
    />
  );
}

export default App;
