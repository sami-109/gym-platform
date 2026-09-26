import "./App.scss";
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
import ConfirmModal from "./components/ConfirmModal/ConfirmModal";
import ActivityLog from "./components/ActivityLog/ActivityLog";
import Loading from "./components/Loading/Loading";

function App() {
  const currentTime = useCurrentTime();

  const {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    message,
    user,
    handleLogin,
    handleLogout,
    requestLogout,
    cancelLogout,
    showLogoutConfirm,
    loggingIn,
  } = useLogin();

  const {
    members,
    setMembers,
    fetchMembers,
    loading: membersLoading,
  } = useMembers(user?.role);

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
    createMemberError,
    newMemberMembershipType,
    setNewMemberMembershipType,
    createdMemberMembershipType,
    setCreateMemberError,
  } = useCreateMember(fetchMembers);

  const {
    selectedMemberId,
    closeManageMember,
    handleApplyChanges,
    openManageMember,
    deleteMember,
    retrieveCredentials,
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

    selectedMember,
    manageMemberError,
    isRetrievingCredentials,

    requestDeleteMember,
    memberToDelete,
    cancelDeleteMember,
    isDeleting,
    applyingChanges,
  } = useManageMember(members, setMembers);

  const { membership } = useMembership(user?.id, user?.role);

  const retrievedMember = retrievedCredentials
    ? members.find((member) => member.user.id === retrievedCredentials.userId)
    : null;

  if (user) {
    if (user.role === "MEMBER") {
      return (
        <>
          <MemberDashboard
            firstName={user.firstName}
            lastName={user.lastName}
            membership={membership}
            currentTime={currentTime}
            onLogout={requestLogout}
          />

          {showLogoutConfirm && (
            <ConfirmModal
              title="Logout"
              memberName={`${user.firstName} ${user.lastName}`}
              memberId={user.id}
              message="Are you sure you want to logout?"
              isLoading={false}
              confirmLabel="Logout"
              onConfirm={handleLogout}
              onCancel={cancelLogout}
            />
          )}
        </>
      );
    }
    return (
      <AdminDashboard
        firstName={user?.firstName || ""}
        lastName={user?.lastName || ""}
        gymName={user?.managedGym?.name || ""}
        onLogout={requestLogout}
      >
        {user.role === "ADMIN" && (
          <section>
            {addMember && (
              <CreateMember
                firstName={newMemberFirstName}
                lastName={newMemberLastName}
                phone={newMemberPhone}
                email={newMemberEmail}
                membershipType={newMemberMembershipType}
                error={createMemberError}
                creating={creatingMember}
                onFirstNameChange={setNewMemberFirstName}
                onLastNameChange={setNewMemberLastName}
                onPhoneChange={setNewMemberPhone}
                onEmailChange={setNewMemberEmail}
                onMembershipTypeChange={setNewMemberMembershipType}
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
                membershipType={createdMemberMembershipType}
                username={createdMemberUsername}
                password={createdMemberPassword}
                onClose={() => {
                  setMemberCreated(false);
                  setAddMember(false);
                  setCreateMemberError("");
                }}
              />
            )}

            {retrievedCredentials && retrievedMember && (
              <MemberCredentials
                memberId={retrievedMember.user.id}
                memberName={`${retrievedMember.user.firstName} ${retrievedMember.user.lastName}`}
                memberPhone={retrievedMember.user.phone}
                memberEmail={retrievedMember.user.email || ""}
                membershipType=""
                username={retrievedCredentials.username}
                password={retrievedCredentials.password}
                title="Credentials Updated"
                onClose={clearRetrievedCredentials}
              />
            )}

            {membersLoading ? (
              <Loading message="Retrieving member info..." />
            ) : (
              <DisplayMembers
                members={members}
                currentTime={currentTime}
                onAddMember={() => {
                  setCreateMemberError("");
                  setAddMember(true);
                }}
                onManageMember={openManageMember}
                onDeleteMember={requestDeleteMember}
              />
            )}

            {memberToDelete !== null && (
              <ConfirmModal
                title="Delete Member"
                memberName={`${
                  members.find((member) => member.user?.id === memberToDelete)
                    ?.user?.firstName
                } ${
                  members.find((member) => member.user?.id === memberToDelete)
                    ?.user?.lastName
                }`}
                memberId={memberToDelete}
                message="Are you sure you want to delete this user? This action cannot be undone."
                isLoading={isDeleting}
                isLoadingMessage="Deleting member..."
                confirmLabel="Delete"
                onConfirm={() => deleteMember(memberToDelete)}
                onCancel={cancelDeleteMember}
              />
            )}
          </section>
        )}

        {selectedMemberId !== null && selectedMember && (
          <ManageMember
            member={selectedMember}
            isRetrievingCredentials={isRetrievingCredentials}
            currentTime={currentTime}
            firstName={editFirstName}
            lastName={editLastName}
            phone={editPhone}
            applyingChanges={applyingChanges}
            email={editEmail}
            error={manageMemberError}
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
            onRetrieveCredentials={retrieveCredentials}
          />
        )}

        {showLogoutConfirm && (
          <ConfirmModal
            title="Logout"
            memberName={`${user.firstName} ${user.lastName}`}
            memberId={user.id}
            message="Are you sure you want to logout?"
            isLoading={false}
            confirmLabel="Logout"
            onConfirm={handleLogout}
            onCancel={cancelLogout}
          />
        )}
      </AdminDashboard>
    );
  }

  return (
    <Login
      username={username}
      password={password}
      showPassword={showPassword}
      message={message}
      loggingIn={loggingIn}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onShowPasswordChange={setShowPassword}
      onLogin={handleLogin}
    />
  );
}

export default App;
