import React from 'react';
import {
	Nav,
	NavLink,
	Bars,
	NavMenu,
	NavBtn,
	NavBtnLink,
} from './NavbarElements';

const Navbar = () => {
	return (
		<>
			<Nav>
				<Bars />

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
					<NavLink to='/about' activeStyle>
						About
					</NavLink>
					<NavLink to='/sign-up' activeStyle>
						Sign Up
					</NavLink>
					{/* Second Nav */}
					{/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
				</NavMenu>
				<NavBtn>
					<NavBtnLink to='/sign-in'>Sign In</NavBtnLink>
				</NavBtn>
			</Nav>
		</>
	);
};

export default Navbar;
