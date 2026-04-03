
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './Dashboard.jsx';
import Meet from './Meet.jsx';
import Landing from './Landing.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
        <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="/meet/:meetingId" element={<ErrorBoundary><Meet /></ErrorBoundary>} />
        <Route path="/meeting/:meetingId" element={<ErrorBoundary><Meet /></ErrorBoundary>} />
        <Route path="/join/:meetingId" element={<ErrorBoundary><Meet /></ErrorBoundary>} />
        <Route path="*" element={<ErrorBoundary><Landing /></ErrorBoundary>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
