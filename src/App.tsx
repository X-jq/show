import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLayout from './admin/AdminLayout'
import RequireAuth from './admin/RequireAuth'
import Login from './admin/pages/Login'
import Dashboard from './admin/pages/Dashboard'
import ProfileAdmin from './admin/pages/ProfileAdmin'
import SkillsAdmin from './admin/pages/SkillsAdmin'
import ProjectsAdmin from './admin/pages/ProjectsAdmin'
import ProjectEdit from './admin/pages/ProjectEdit'
import PostsAdmin from './admin/pages/PostsAdmin'
import PostEdit from './admin/pages/PostEdit'
import Settings from './admin/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfileAdmin />} />
          <Route path="skills" element={<SkillsAdmin />} />
          <Route path="projects" element={<ProjectsAdmin />} />
          <Route path="projects/new" element={<ProjectEdit />} />
          <Route path="projects/:id" element={<ProjectEdit />} />
          <Route path="posts" element={<PostsAdmin />} />
          <Route path="posts/new" element={<PostEdit />} />
          <Route path="posts/:slug" element={<PostEdit />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
