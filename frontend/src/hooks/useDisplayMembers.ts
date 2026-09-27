import { useState } from "react";
import { getDaysRemaining } from "../utils/membership";
import type {
  MemberDaysFilter,
  MemberSortBy,
  MemberStatusFilter,
} from "../types/displayMembers";
import type { Member } from "../types/member";

function useDisplayMembers(members: Member[], currentTime: number) {
  const [idSortAscending, setIdSortAscending] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [daysSortAscending, setDaysSortAscending] = useState(true);
  const [nameSortAscending, setNameSortAscending] = useState(true);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<MemberSortBy>("id");
  const [daysFilter, setDaysFilter] = useState<MemberDaysFilter>("ALL");
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

  const handleIdSort = () => {
    setSortBy("id");
    setIdSortAscending((current) => !current);
  };

  const handleFirstNameSort = () => {
    setSortBy("firstName");
    setNameSortAscending((current) => !current);
  };

  const handleLastNameSort = () => {
    setSortBy("lastName");
    setNameSortAscending((current) => !current);
  };

  const handleDaysSort = () => {
    setSortBy("days");
    setDaysSortAscending((current) => !current);
  };

  const toggleDaysFilter = () => {
    setDaysFilterOpen((current) => !current);
  };

  const selectDaysFilter = (filter: MemberDaysFilter) => {
    setDaysFilter(filter);
    setDaysFilterOpen(false);
  };

  const toggleStatusFilter = () => {
    setStatusFilterOpen((current) => !current);
  };

  const selectStatusFilter = (filter: MemberStatusFilter) => {
    setStatusFilter(filter);
    setStatusFilterOpen(false);
  };

  return {
    searchTerm,
    setSearchTerm,

    filteredMembers,
    sortedMembers,

    statusFilter,
    statusFilterOpen,

    daysFilter,
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
  };
}

export default useDisplayMembers;
