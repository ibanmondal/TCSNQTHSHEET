import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Problems } from './pages/Problems';
import { Today } from './pages/Today';
import { Revision } from './pages/Revision';
import { Calendar } from './pages/Calendar';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';
import { Workspace } from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/problem/:id" element={<Workspace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="problems" element={<Problems />} />
          <Route path="today" element={<Today />} />
          <Route path="revision" element={<Revision />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
