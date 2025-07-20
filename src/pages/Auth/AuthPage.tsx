import { useState } from "react";
import { AuthContainer } from "../../components/Auth/AuthContainer";
import { RegisterForm } from "../../components/Auth/RegisterForm";
import { LoginForm } from "../../components/Auth/LoginForm";


const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <AuthContainer>
      {isRegister ? (
        <RegisterForm onToggle={() => setIsRegister(false)} />
      ) : (
        <LoginForm onToggle={() => setIsRegister(true)} />
      )}
    </AuthContainer>
  );
};

export default AuthPage;
