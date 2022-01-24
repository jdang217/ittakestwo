import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css"

import Navbar from './components/Navbar';
import Home from './pages';
import Games from './pages/games';
import Lobbies from './pages/lobbies';
import Leaderboards from './pages/leaderboards';
import Devblog from './pages/devblog';
import About from './pages/about';
import SignUp from './pages/signup';
import SignIn from './pages/signin';
import SignOut from "./pages/signout";
import axios from "axios";
import { token } from "morgan";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isAuth: false };
  }

  login = () => {
    axios({
      method: "get",
      url: "/api/signin",
      data: "",
      headers: { 
        "Content-Type": "text/plain",
        "x-auth-token": localStorage.getItem("token")
      },
    })
    .then((response) => {
      //handle success
      console.log(response);
      this.setState({ isAuth: true });
    })
    .catch((response) => {
      //handle error
      console.log(response);
    });
  }

  logout = () => {
    this.setState({ isAuth: false });
  }

  componentDidMount() {
    console.log("componentDidMount success")
  }

  render() {
    const { isAuth } = this.state;
    return (
      
      <div>
        <Router>
          <Navbar isLoggedIn={isAuth} logout={this.logout} login={this.login}/>
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/games' element={<Games/>} />
            <Route exact path='/lobbies' element={<Lobbies/>} />
            <Route exact path='/leaderboards' element={<Leaderboards/>} />
            <Route exact path='/devblog' element={<Devblog />} />
            <Route exact path='/about' element={<About />} />
            <Route exact path='/sign-up' element={<SignUp/>} />
            <Route exact path='/sign-in' element={<SignIn isLoggedIn={isAuth} login={this.login}/>} />
            <Route exact path='/sign-out' element={<SignOut isLoggedIn={isAuth} logout={this.logout}/>} />
          </Routes>
        </Router>
      </div>
    );
  }
}

export default App;
