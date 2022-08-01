import React from 'react';
import {AddReward} from './pages/staking/AddReward';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { DeployStaking } from './pages/staking/DeployStaking';
import { initializeIcons } from '@uifabric/icons';
initializeIcons();

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/admin/deploy">
          <DeployStaking />
        </Route>
        <Route path="/admin/addReward">
          <AddReward />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
