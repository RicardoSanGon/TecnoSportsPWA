import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { home, heart, trophy } from 'ionicons/icons';

// Import pages
import Home from '../pages/Home';
import Favorites from '../pages/Favorites';
import Quinelas from '../pages/Quinelas';
import PoolDetails from '../pages/PoolDetails';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/favorites" component={Favorites} />
        <Route exact path="/tabs/quinelas" component={Quinelas} />
        <Route exact path="/tabs/pool/:id" component={PoolDetails} />
        <Route exact path="/tabs" render={() => <Redirect to="/tabs/home" />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" color="primary">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon icon={home} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>

        <IonTabButton tab="quinelas" href="/tabs/quinelas">
          <IonIcon icon={trophy} />
          <IonLabel>Quinelas</IonLabel>
        </IonTabButton>

        <IonTabButton tab="favorites" href="/tabs/favorites">
          <IonIcon icon={heart} />
          <IonLabel>Favoritos</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;