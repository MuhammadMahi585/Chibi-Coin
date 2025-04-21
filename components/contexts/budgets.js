export const addBudget = (data, setData, newBudget) => {
  const calculateBudgetAmount = (budget) => {
    const { category, startDate, endDate } = budget;
    const transactions = data.recentTransactions.filter(
      (transaction) =>
        transaction.category === category &&
        new Date(transaction.date) >= new Date(startDate) &&
        new Date(transaction.date) <= new Date(endDate)
    );
    return transactions.reduce((sum, transaction) => {
      const amount = parseFloat(transaction.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const budgetAmount = calculateBudgetAmount(newBudget);

  setData((prevData) => ({
    ...prevData,
    budget: [
      ...prevData.budget,
      {
        id: Date.now(),
        ...newBudget,
        amount: budgetAmount,
        date: new Date(),
      },
    ],
  }));
};

export const deleteBudget = (data, setData, budgetId) => {
  setData((prevData) => ({
    ...prevData,
    budget: prevData.budget.filter((budget) => budget.id !== budgetId),
  }));
};
