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
import SignOut from './pages/signout';
import Profile from './pages/profile';
import FaceChat from './pages/games/facechat/facechat';
import TicTacToe from "./pages/games/tictactoe/tictactoe";
import Template from "./pages/games/1v1Template";
import MultiPeerTemplateRewrite from "./pages/games/multiPeerTemplateRewrite";
import Poker from "./pages/games/poker/poker";
import axios from "axios";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isAuth: false, user: "" };
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
      this.setState({ isAuth: true, user: response.data.username });
    })
    .catch((response) => {
      //handle error
      console.log(response);
    });
  }

  logout = () => {
    this.setState({ isAuth: false });
  }

  componentDidMount () {
    this.login();
  }

  render() {
    const { isAuth, user } = this.state;
    return (
      
      <div> 
        <Router>
          <Navbar isLoggedIn={isAuth} user={user} logout={this.logout} login={this.login} />
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/games' element={<Games/>} />
            <Route exact path='/lobbies' element={<Lobbies/>} />
            <Route exact path='/leaderboards' element={<Leaderboards/>} />
            <Route exact path='/devblog' element={<Devblog isLoggedIn={isAuth}/>} />
            <Route exact path='/about' element={<About />} />
            <Route exact path='/sign-up' element={<SignUp/>} />
            <Route exact path='/sign-in' element={<SignIn isLoggedIn={isAuth} login={this.login}/>} />
            <Route exact path='/sign-out' element={<SignOut isLoggedIn={isAuth} logout={this.logout}/>} />
            <Route exact path='/profile/:user' element={<Profile/>} />
            <Route exact path='/facechat' element={<FaceChat user={user} />} />
            <Route exact path='/tictactoe' element={<TicTacToe user={user} />} />
            <Route exact path='/template' element={<Template user={user} />} />
            <Route exact path='/multi-peer-template-rewrite' element={<MultiPeerTemplateRewrite user={user} />} />
            <Route exact path='/poker' element={<Poker user={user} />} />
          </Routes>
        </Router> 
      </div>
    );
  }
}

export default App;
