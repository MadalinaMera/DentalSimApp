import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const App: React.FC = () => (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/chat" component={ChatPage} />
            <Route exact path="/history" component={HistoryPage} />
            <Route render={() => <Redirect to="/login" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
);

export default App;