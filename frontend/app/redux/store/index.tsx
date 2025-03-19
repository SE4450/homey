import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../slice/tasks"; // Adjust this path if needed
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
});
