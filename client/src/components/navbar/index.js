import React from 'react';
import {
	Nav,
	NavLink,
	Bars,
	NavMenu,
	NavBtn,
	NavBtnLink,
} from './NavbarElements';

const Navbar = (props) => {

	const handleSubmit = (event) => { 
		alert("bars clicked");
		//var x = document.getElementsByClassName
	}

	return (
		<>
			<Nav>
				<Bars onClick={handleSubmit}/>

				<NavMenu>
					<NavLink to='/' activeStyle>
						Home
					</NavLink>
					<NavLink to='/games' activeStyle>
						Games
					</NavLink>
					<NavLink to='/lobbies' activeStyle>
						Lobbies
					</NavLink>
					<NavLink to='/leaderboards' activeStyle>
						Leaderboards
					</NavLink>
					<NavLink to='/devblog' activeStyle>
						Devblog
					</NavLink>
					<NavLink to='/about' activeStyle>
						About
					</NavLink>
					{!props.isLoggedIn &&
					(<NavLink to='/sign-up' activeStyle>
						Sign Up
					</NavLink>)}
				</NavMenu>

				<NavBtn>
					{props.isLoggedIn && (<NavBtnLink to='/sign-out'>Log Out</NavBtnLink>)}
  					{!props.isLoggedIn && (<NavBtnLink to='/sign-in'>Log In</NavBtnLink>)}
				</NavBtn>
			</Nav>
		</>
	);
};
//<NavBtnLink to='/sign-in'>Sign In</NavBtnLink>
export default Navbar;
