import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// Define the shape of a Task and its Expense
interface Expense {
  id: string; // e.g., a unique string ID
  amount: number; // e.g., the amount spent
}
interface Task {
  id: string; // Unique identifier for the task
  name: string; // Name of the task
  expenses: Expense[]; // Array of related expenses
}
// Define the shape of the entire slice state
interface TasksState {
  tasks: Task[];
}
const initialTasksState: TasksState = {
  tasks: [],
};
export const tasksSlice = createSlice({
  name: "tasks", // typically lower-case
  initialState: initialTasksState,
  reducers: {
    // Add a new Task
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    // Add an Expense to a specific Task
    addExpense: (
      state,
      action: PayloadAction<{ taskId: string; expense: Expense }>
    ) => {
      const { taskId, expense } = action.payload;
      const targetTask = state.tasks.find((task) => task.id === taskId);
      if (targetTask) {
        targetTask.expenses.push(expense);
      }
    },
  },
});
// Export actions and reducer
export const { addExpense, addTask } = tasksSlice.actions;
export default tasksSlice.reducer;
