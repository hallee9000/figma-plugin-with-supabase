import * as React from 'react';
import LogIn from '@app/pages/LogIn';
import Profile from '@app/pages/Profile';
import supabase from '@app/utils/supabase';
import {sendMessageToBackground} from '@app/utils/message';

const App = ({}) => {
    const [authData, setAuthData] = React.useState(null);
    const [avatarData, setAvatarData] = React.useState(null);

    React.useEffect(() => {
        // This is how we read messages sent from the plugin controller
        window.onmessage = async (event) => {
            const {type, message} = event.data.pluginMessage;
            switch (type) {
                case 'bg:get-auth':
                    // Show LogIn if user is logged In
                    if (!!message.auth) {
                        // Handle auth if has local auth data
                        await supabase.verifyAuth(message.auth, function (authData) {
                            if (authData) {
                                handleLoggedIn(authData);
                            } else {
                                handleLoggedOut();
                            }
                        });
                    }
                    break;

                case 'bg:get-avatar':
                    setAvatarData(message.avatarData);
                    break;

                default:
                    break;
            }
        };
    }, []);

    function handleLoggedIn(authData) {
        setAuthData(authData);
        // Store user auth data in figma.clientStorage
        sendMessageToBackground('ui:set-auth', {auth: authData});
    }

    function handleLoggedOut() {
        setAuthData(null);
        // Clear auth data in figma.clientStorage
        sendMessageToBackground('ui:clear-auth');
    }

    return (
        <>
            {!!authData ? (
                <Profile authData={authData} onLoggedOut={handleLoggedOut} avatarData={avatarData} />
            ) : (
                <LogIn onLoggedIn={handleLoggedIn} />
            )}
        </>
    );
};

export default App;
