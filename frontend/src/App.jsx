import Login_card from './login.jsx';
import{BrowserRouter, Route, Routes} from "react-router-dom";
import Signup_card from './sign_up.jsx';
import Dashboard from './dashboard.jsx';
import mail from "./assets/mail.png";

function App() {
  return (
    <>
    
      <title>Park Nest</title>
      <link rel = "icon" type = "image/svg+xml" href={mail}/>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login_card />} />
          <Route path = "/dashboard" element = {<Dashboard />} />
          <Route path = "/signup" element = {<Signup_card />} />
        </Routes>
      </BrowserRouter>
  </>
  );
} 

export default App;