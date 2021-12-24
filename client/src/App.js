import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';
import "./index.css";
import "./App.css"

import Navbar from './components/Navbar';
import Home from './pages';
import About from './pages/about';
import Events from './pages/events';
import AnnualReport from './pages/annual';
import Teams from './pages/team';
import Blogs from './pages/blogs';
import SignUp from './pages/signup';
import SignIn from './pages/signin';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bestShows: []
    };
  }

  componentDidMount() {
    console.log("componentDidMount success")
    axios.get('/api/data')
      .then(res => {
        console.log("data recieved: ", res.data);
        this.setState({ bestShows: res.data[0] });
      })
      .catch(alert);
  }


  render() {
    console.log("render bestShows: ", this.state.bestShows)
    return (
      
      <div>
        <Router>
          <Navbar />
          <Routes>
            <Route exact path='/' element={<Home />} />
            <Route exact path='/about' element={<About />} />
            <Route exact path='/events' element={<Events/>} />
            <Route exact path='/annual' element={<AnnualReport/>} />
            <Route exact path='/team' element={<Teams/>} />
            <Route exact path='/blogs' element={<Blogs/>} />
            <Route exact path='/sign-up' element={<SignUp/>} />
            <Route exact path='/sign-in' element={<SignIn/>} />
          </Routes>
        </Router>
        <ul>
          {
            Object.keys(this.state.bestShows).map((cur, idx) => (
              <li>{cur} - {this.state.bestShows[cur]} </li>
            ))
          }
        </ul>
      </div>
    );
  }
}

/*
mongo db example
<ul>
  {
    Object.keys(this.state.bestShows).map((cur, idx) => (
      <li>{cur} - {this.state.bestShows[cur]} </li>
    ))
  }
</ul>
*/

export default App;
