import React, {useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Profile = (props) => {
    const location = useLocation();
    const user = location.pathname.split(/[\\/]/).pop();

    const isCurrentUser = user === props.user;
    const [accAge, setAccAge] = useState(NaN);

    useEffect(() => {
        axios({
            method: "get",
            url: `/api/profile/${user}`,
            data: "",
            headers: { "Content-Type": "multipart/form-data",
                    "x-auth-token": localStorage.getItem("token")
            },
        })
        .then(function (response) {
            //handle success
            console.log(response)
            const postData = response.data;
            setAccAge(parseInt(response.headers["acc-age"]));
        })
        .catch(function (error) {
            //handle error
            console.log(error);
        });
    });

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'Right',
                height: '100vh'
            }} 
        >
            <div></div>
            <h1>Profile Page for {user}</h1>
            <ul>
                <li>Profile pic</li>
                <li>Account created: {accAge == NaN ? "N/A" : new Date(accAge).toLocaleDateString('en-US')}</li>
                <li>Online status: </li>
                {/* <li>link to profile settings</li> - - - I don't think this is necessary */}
                <li>bio/status message</li>
                {!isCurrentUser && <li>Add friend</li>} {/* if not current user, add friend button</li> */}
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
