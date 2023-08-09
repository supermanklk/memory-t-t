import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'antd/dist/antd.css';
import MainPage from './MainPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}
