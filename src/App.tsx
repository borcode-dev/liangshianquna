import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import TaskList from "@/pages/TaskList";
import TaskForm from "@/pages/TaskForm";
import TaskDetail from "@/pages/TaskDetail";
import MapView from "@/pages/MapView";
import ProgressList from "@/pages/ProgressList";
import ProgressForm from "@/pages/ProgressForm";
import ProgressDetail from "@/pages/ProgressDetail";
import DisasterList from "@/pages/DisasterList";
import DisasterForm from "@/pages/DisasterForm";
import DisasterDetail from "@/pages/DisasterDetail";
import OfflineManage from "@/pages/OfflineManage";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/progress" element={<ProgressList />} />
          <Route path="/progress/new" element={<ProgressForm />} />
          <Route path="/progress/:id" element={<ProgressDetail />} />
          <Route path="/disaster" element={<DisasterList />} />
          <Route path="/disaster/new" element={<DisasterForm />} />
          <Route path="/disaster/:id" element={<DisasterDetail />} />
          <Route path="/offline" element={<OfflineManage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
