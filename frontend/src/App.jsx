import Login_card from './login.jsx';
import{BrowserRouter, Route, Routes} from "react-router-dom";
import Signup_card from './sign_up.jsx';
import Dashboard from './dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login_card />} />
        <Route path="/signup" element={<Signup_card />} />
        <Route path = "/dashboard" element = {<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
} 

export default App;