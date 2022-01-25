import { useNavigate } from 'react-router-dom';

const SignOut = (props) => {

    const navigate = useNavigate();

    localStorage.removeItem("token");
    props.logout();
    navigate('/');

    return null;
};

export default SignOut;
