import React, {useEffect, useState} from 'react';
import { useLocation, useNavigate} from 'react-router-dom'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import moment from 'moment';


import './css/profile.css'

const theme = createTheme({
    palette: {
        primary: {
        main: '#774DCB',
        },
    },
});
  

const Profile = (props) => {
    const navigate = useNavigate(); 
    const location = useLocation();
    const user = location.pathname.split(/[\\/]/).pop();
    var currentDay = moment()

    const [profileData, setProfileData] = useState();
    const [lastSeen, setLastSeen] = useState();
    const [age, setAge] = useState("");
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [status, setStatus] = useState("")

    const [profileFound, setProfileFound] = useState(true)
    const [addedFriend, setAddedFriend] = useState(false)

    useEffect(() => {
        axios({
            method: "get",
            url: "/api/profile/" + user,
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            setProfileData(response.data)
        })
        .catch(function (error) {
            //handle error
            setProfileFound(false)
            console.log(error);
        }); 
    }, [])

    useEffect(() => {
        if (profileData != undefined) {
            setAge(getAge(profileData.createdAt))
            setFriends(profileData.friends == undefined ? [] : profileData.friends)
            setFriendRequests(profileData.friendRequests == undefined ? [] : profileData.friendRequests)
            setLastSeen(getLastSeen(profileData.lastSeen, profileData.createdAt))
            setStatus(profileData.status)
        }
    }, [profileData])

    function getAge(createdAt) {
        return moment(createdAt, 'YYYY-MM-DDTHH:mm:ss.SSS[Z]').format("MM/DD/YYYY")
    }

    function getLastSeen(lastSeenAt, createdAt) {

        var days
        
        if (lastSeenAt == undefined) {
            days = currentDay.diff(createdAt, "days")
        }
        else {
            days = currentDay.diff(lastSeenAt, "days")
        }

        if (days >= 365 && days < 730) {
            return "1 year ago"
        }
        else if (days >= 730) {
            days = currentDay.diff(lastSeenAt, "years")
            return `${days} years ago`
        }
        else {
            if (days == 0) {
                return "today"
            }
            else if (days == 1) {
                return "1 day ago"
            }
            return `${days} days ago`
        }
    }

    const handleAddFriend = (event) => {
        axios({
            method: "post",
            url: "/api/profile/" + props.user + "/" + user + "/request",
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(response)
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        }); 
        setAddedFriend(true)
    }

    const handleEditProfile = (event) => {
        navigate("/profile/" + props.user + "/settings");
    }

    if (!profileFound) {
        return (
            <div className='profile-profileerror'>
                <h2>Profile Not Found :(</h2>
            </div>
        );
    }

    return (
        <div className='profile-window'>
            <ThemeProvider theme={theme}>
                <div className='profile-profileinfo'>
                    <Avatar className='profile-icon' sx={{ width: 150, height: 150 }}>{user.charAt(0).toUpperCase()}</Avatar>
                    <div className='profile-username'>
                        {user}
                    </div>
                    <div className='profile-lastseen'>
                        Last seen {lastSeen}
                    </div>
                    {props.user != user && !friends.includes(props.user) && !friendRequests.includes(props.user) && !addedFriend && <div className='profile-addfriend'>
                        <Button className='profile-addfriendbutton' variant="contained" onClick={handleAddFriend}> 
                            <PersonAddAlt1Icon/><div style={{marginLeft: "10px"}}>Add Friend</div>
                        </Button>
                    </div>}
                    {props.user == user && <div className='profile-editprofile'>
                        <Button className='profile-editprofilbutton' variant="contained" onClick={handleEditProfile}> 
                            <SettingsIcon/><div style={{marginLeft: "10px"}}>Edit Profile</div>
                        </Button>
                    </div>}
                    <div className='profile-numfriends' onClick={() => {navigate("/profile/" + user + "/friends")}}>
                        <PersonIcon style={{ color: '#774DCB' }}/> {friends.length} Friends
                    </div>
                    <div className='profile-profileage'>
                        <CalendarTodayIcon style={{ color: '#774DCB' }}/> Member Since {age}
                    </div>
                    <div className='profile-status'>
                        {status == undefined || status.length == 0 ? "User has not set a status yet." : status}
                    </div>

                </div>

                <div className='profile-tagsandguild'>

                </div>

                <div className='profile-achievementsandstats'>

                </div>
            </ThemeProvider>
        </div>
    );
};

export default Profile;
