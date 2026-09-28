export const getNextTransactionNumber = async (prisma: {
  transaction: {
    findFirst: (args: {
      orderBy: {
        transactionNumber: "desc";
      };
      select: {
        transactionNumber: true;
      };
    }) => Promise<{ transactionNumber: number } | null>;
  };
}) => {
  const lastTransaction = await prisma.transaction.findFirst({
    orderBy: {
      transactionNumber: "desc",
    },
    select: {
      transactionNumber: true,
    },
  });

  return (lastTransaction?.transactionNumber ?? 0) + 1;
};
