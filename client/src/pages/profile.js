import React from 'react';
import { useLocation } from 'react-router-dom'

const Profile = (props) => {
    const location = useLocation();
    const user = location.pathname.split(/[\\/]/).pop();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'Right',
                height: '100vh'
            }}
        >
            <h1>Profile Page for {user}</h1>
            <ul>
                <li>Profile pic</li>
                <li>account age</li>
                <li>online status</li>
                <li>link to profile settings</li>
                <li>bio/status message</li>
                <li>if not current user, add friend button</li>
                <li>wins in each game/ maybe total wins</li>
                <li>rank in each game depending on wins</li>
                <li>achievements</li>
            </ul>
        </div>
    );
};

/* axios({
    method: "get",
    url: "/api/profile/" + props.user,
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
}); */

export default Profile;
