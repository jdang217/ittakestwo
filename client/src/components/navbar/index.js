import React from 'react';
import {
	Nav,
	NavLink,
	Bars,
	NavMenu,
	NavBtn,
	NavBtnLink,
	AccBtn,
} from './NavbarElements';

import AccountMenu from './accountDrop'
import logo from '../../ITTLogo.png'

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
						<a><img src={logo} width="30" height="40"></img></a>
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
				
				{props.isLoggedIn && (
				<AccBtn>
					<AccountMenu user={props.user}/>
				</AccBtn>)}
				
				{!props.isLoggedIn && (
				<NavBtn>
  					<NavBtnLink to='/sign-in'>Log In</NavBtnLink>
				</NavBtn>)}
			</Nav>
		</>
	);
};
//{props.isLoggedIn && (<NavBtnLink to='/sign-out'>Log Out</NavBtnLink>)}
export default Navbar;
