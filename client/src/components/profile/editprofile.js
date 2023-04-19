import React, { useEffect, useState } from 'react';
import './editprofile.css'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';


const EditProfile = (props) => {
    const navigate = useNavigate(); 
    const location = useLocation();
    const user = location.pathname.split("/")[2];
    const [ogData, setOgData] = useState({})
    const [username, setUsername] = useState()
    const [email, setEmail] = useState()
    const [tag, setTag] = useState()
    const [status, setStatus] = useState()

    const [submitDisable, setSubmitDisable] = useState(true)
    const [openModal, setOpenModal] = useState(false);

    const [errorMessage,  setErrorMessage] = useState("")
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [error, setError] = useState(false)

    const invalidEmailMsg = "There are errors in the provided email. Please make sure you have entered a valid email."
    const emptyUserMsg = "Username cannot be empty."
    const characterMsg = "Characters must be Aa-Zz, 0-9, or _"
    const lengthMsg = "Username must be 20 characters or less."
    const dupMsg = "This username is already taken."

    const theme = createTheme({
        palette: {
            primary: {
                main: '#FFFFFF',
                contrastText: "#774DCB",
            },
            secondary: {
                main: '#2F52A6',
                contrastText: '#FFFFFF'
            }
        },
    });

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      };

    useEffect(() => {
        if (user != props.user || user == "" || props.user == ""){
            navigate("/profile/" + user + "");
            return
        }
        axios({
            method: "get",
            url: "/api/profile/" + props.user,
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            if(response.data.email == undefined) {
                response.data.email = ""
            }
            if(response.data.tag == undefined) {
                response.data.tag = ""
            }
            if(response.data.status == undefined) {
                response.data.status = ""
            }
            setOgData(response.data)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        }); 
    }, [])

    useEffect(() => {
        if (ogData != undefined) {
            setUsername(ogData.username)
            setEmail(ogData.email)
            setTag(ogData.tag)
            setStatus(ogData.status)
        }
    }, [ogData])

    useEffect(() => {
        if (ogData != undefined) {
            if (username != ogData.username || email != ogData.email ||
                tag != ogData.tag || status != ogData.status) {
                setSubmitDisable(false)
            }
            else {
                setSubmitDisable(true)
            }
        }
    }, [username, email, tag, status])

    useEffect(() => {
        if (email != undefined) {
            var emailRegex = /^\S+@\S+\.\S+$/
            if (!emailRegex.test(email)) {
                setError(true)
                setErrorMessage(invalidEmailMsg)
            }
            else {
                setError(false)
                setErrorMessage("")
            }
        }
    }, [email])

    useEffect(() => {
        var letterNumber = /^[0-9a-zA-Z]+$/;
        if (!username || username === 0) {
            setError(true)
            setErrorMessage(emptyUserMsg)
        }
        else if (!letterNumber.test(username)) {
            setError(true)
            setErrorMessage(characterMsg)
        }
        else if (username.length > 20) {
            setError(true)
            setErrorMessage(lengthMsg)
        }
        else {
            setError(false)
            setErrorMessage("")
        }
    }, [username])

    const handleChangeIcon = (event) => {
        console.log("change icon clicked")
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handlePasswordChange = (event) => {
        alert("Password changes are not currently implemented")
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handleTagChange = (event) => {
        setTag(event.target.value)
    }

    const handleStatusChange = (event) => {
        setStatus(event.target.value)
    }

    const handleBack = (event) => {
        navigate("/profile/" + props.user);
    }

    const handleOpenModal = () => {
        if (error) {
            setOpenErrorModal(true)
        }
        else {
            setOpenModal(true);
        }
    }
    const handleCloseModal = () => setOpenModal(false);

    const handleOpenErrorModal = () => setOpenErrorModal(false);
    const handleCloseErrorModal = () => setOpenErrorModal(false);

    function getNewData() {
        var data = {}

        if (ogData != undefined) {

            if (username != ogData.username) {
                data["username"] = username
            }
            if (email != ogData.email) {
                data["email"] = email
            }
            if (tag != ogData.tag) {
                data["tag"] = tag
            }
            if (status != ogData.status) {
                data["status"] = status
            }
        }

        return data
    }

    const handleFinalSubmit = (event) => {
        var data = getNewData()
        axios({
            method: "post",
            url: "/api/profile/" + props.user,
            data: data,
            headers: { "Content-Type": "application/json",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(response => {
            //handle success
            if (username != ogData.username && !error) {
                localStorage.clear()
                props.logout();
                navigate('/');
                window.location.reload()
            }
        })
        .catch(function (error) {
            //handle error
            console.log(error);
            setError(true)
            setErrorMessage(dupMsg)
            setOpenErrorModal(true)
        }); 
    }

    const ConfirmModal = () => {
        var data = getNewData()
        var arrData = []
        for (const [key, value] of Object.entries(data)) {
            arrData.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
        }
        return (
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Confirm Account Changes
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to change the following information?
                    {arrData.map(aData => <div><br/>{aData}</div>)}
                </Typography>
                <div className='editprofile-modalbuttons'>
                <ThemeProvider theme={theme}>
                    <Button className='editprofile-finalsubmit' variant="contained" color='secondary' onClick={handleFinalSubmit}>Submit</Button>
                    <Button className='editprofile-finalback' variant="contained" onClick={handleCloseModal}>Back</Button>
                </ThemeProvider>
                </div>
                </Box>
            </Modal>
        );
    };

    const ErrorModal = () => {
        return (
            <Modal
                open={openErrorModal}
                onClose={handleCloseErrorModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Input Error
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    {errorMessage}
                </Typography>
                </Box>
            </Modal>
        );
    }

    return (
        <div className='editprofile-window'>
            <ThemeProvider theme={theme}>
            <div className='editprofile-allinfo'>
                <h1 className='editprofile-title'>Account Settings</h1>
                <div className='editprofile-line'></div>
                <Avatar className='editprofile-icon' sx={{ width: 150, height: 150 }}>{props.user.charAt(0).toUpperCase()}</Avatar>
                <div className='editprofile-changeicon' onClick={handleChangeIcon}>Change icon</div>
                <div className='editprofile-userlabel'>Username</div>
                <div className='editprofile-passlabel'>Password</div>
                <div className='editprofile-emaillabel'>Email</div>
                <div className='editprofile-taglabel'>Tag</div> 
                <input type="text" value={username} onChange={handleUsernameChange} className='editprofile-user'></input>
                <input type="text" value={"•••••••••••"} onChange={handlePasswordChange} className='editprofile-pass'></input>
                <input type="text" value={email} placeholder="Set Your Email" onChange={handleEmailChange} className='editprofile-email'></input>
                <input type="text" value={tag} onChange={handleTagChange} disabled="true" className='editprofile-tag'></input>
                <div className='editprofile-statuslabel'>Status Message</div>
                <textarea rows="3" maxlength="60" value={status} onChange={handleStatusChange} className='editprofile-status'></textarea>
                <div className='editprofile-achievementslabel'>Featured Achievements</div>
                <div className='editprofile-achievements'></div>
                <div className='editprofile-statslabel'>Featured Statistics</div>
                <div className='editprofile-stats'></div>
                <Button className='editprofile-submit' variant="contained" color='secondary' onClick={handleOpenModal} disabled={submitDisable}>Submit</Button>
                <Button className='editprofile-back' variant="contained" onClick={handleBack}>Back</Button>
            </div>
            </ThemeProvider>

            <ConfirmModal/>
            <ErrorModal/>
        </div>
    );
};

export default EditProfile;