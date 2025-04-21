// Predefined exchange rate (example rate, you can update it as needed)
const exchangeRate = 270; // 1 USD = 270 PKR

// Function to convert amounts between USD and PKR
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  if (fromCurrency === "USD" && toCurrency === "PKR") {
    return amount * exchangeRate;
  }
  if (fromCurrency === "PKR" && toCurrency === "USD") {
    return amount / exchangeRate;
  }
  return amount;
};

export const addTransaction = (data, setData, newTransaction) => {
  const amount = parseFloat(newTransaction.amount);
  if (isNaN(amount)) {
    console.error("Invalid transaction amount:", newTransaction.amount);
    return;
  }

  const transactionDate = new Date(newTransaction.date);
  const currentDate = new Date();

  if (transactionDate > currentDate) {
    // Add to upcomingTransactions if the transaction date is in the future
    setData((prevData) => ({
      ...prevData,
      upcomingTransactions: [
        ...prevData.upcomingTransactions,
        {
          id: Date.now(), // Generate unique ID
          ...newTransaction,
          amount,
        },
      ],
    }));
  } else {
    // Add to recentTransactions if the transaction date is in the past or today
    setData((prevData) => ({
      ...prevData,
      recentTransactions: [
        ...prevData.recentTransactions,
        {
          id: Date.now(), // Generate unique ID
          ...newTransaction,
          amount,
        },
      ],
    }));
  }
};

export const updateRecentTransaction = (data, setData, updatedTransaction) => {
  const amount = parseFloat(updatedTransaction.amount);
  if (isNaN(amount)) {
    console.error("Invalid transaction amount:", updatedTransaction.amount);
    return;
  }

  setData((prevData) => ({
    ...prevData,
    recentTransactions: prevData.recentTransactions.map((tx) =>
      tx.id === updatedTransaction.id ? { ...updatedTransaction, amount } : tx
    ),
  }));
};

export const deleteRecentTransaction = (data, setData, transactionId) => {
  setData((prevData) => ({
    ...prevData,
    recentTransactions: prevData.recentTransactions.filter(
      (tx) => tx.id !== transactionId
    ),
  }));
};

export const updateUpcomingTransaction = (
  data,
  setData,
  updatedTransaction
) => {
  const amount = parseFloat(updatedTransaction.amount);
  if (isNaN(amount)) {
    console.error("Invalid transaction amount:", updatedTransaction.amount);
    return;
  }

  setData((prevData) => ({
    ...prevData,
    upcomingTransactions: prevData.upcomingTransactions.map((tx) =>
      tx.id === updatedTransaction.id ? { ...updatedTransaction, amount } : tx
    ),
  }));
};

export const deleteUpcomingTransaction = (data, setData, transactionId) => {
  setData((prevData) => ({
    ...prevData,
    upcomingTransactions: prevData.upcomingTransactions.filter(
      (tx) => tx.id !== transactionId
    ),
  }));
};

export const calculateBalance = (data, setData) => {
  const userCurrency = data.user.currency;

  const balance = data.recentTransactions.reduce((acc, transaction) => {
    const amountInUserCurrency = convertCurrency(
      transaction.amount,
      transaction.currency,
      userCurrency
    );
    return transaction.type === "added"
      ? acc + (isNaN(amountInUserCurrency) ? 0 : amountInUserCurrency)
      : acc - (isNaN(amountInUserCurrency) ? 0 : amountInUserCurrency);
  }, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const income = data.recentTransactions
    .filter(
      (transaction) =>
        transaction.type === "added" &&
        new Date(transaction.date).getMonth() === currentMonth &&
        new Date(transaction.date).getFullYear() === currentYear
    )
    .reduce(
      (acc, transaction) =>
        acc +
        (isNaN(
          convertCurrency(
            transaction.amount,
            transaction.currency,
            userCurrency
          )
        )
          ? 0
          : convertCurrency(
              transaction.amount,
              transaction.currency,
              userCurrency
            )),
      0
    );

  const expense = data.recentTransactions
    .filter(
      (transaction) =>
        transaction.type === "deducted" &&
        new Date(transaction.date).getMonth() === currentMonth &&
        new Date(transaction.date).getFullYear() === currentYear
    )
    .reduce(
      (acc, transaction) =>
        acc +
        (isNaN(
          convertCurrency(
            transaction.amount,
            transaction.currency,
            userCurrency
          )
        )
          ? 0
          : convertCurrency(
              transaction.amount,
              transaction.currency,
              userCurrency
            )),
      0
    );

  setData((prevData) => ({
    ...prevData,
    balance,
    income,
    expense,
  }));
};
