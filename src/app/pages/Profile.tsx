import * as React from 'react';
import styled from 'styled-components';
import supabase from '@app/utils/supabase';
import {sendMessageToBackground} from '@app/utils/message';
import {updateProfile} from '@app/utils/api';

const Container = styled.div`
  img {
    width: 100px;
  }
  p {
    color: #666;
  }
`;

const Profile = function ({authData, avatarData, onLoggedOut}) {
  const [profile, setProfile] = React.useState<any>();

  React.useEffect(() => {
    getProfile();
  }, [authData]);

  React.useEffect(() => {
    if (avatarData) {
      updateProfile(avatarData, authData.user.id).then(() => {
        getProfile();
      });
    }
  }, [avatarData]);

  async function getProfile() {
    const {data, error} = await supabase.postgrest.from('profiles').select().eq('id', authData.user.id);
    if (error) {
      console.error(error);
      return;
    }
    setProfile(data[0]);
  }

  function uploadAvatar() {
    sendMessageToBackground('ui:get-avatar');
  }

  return (
    <Container>
      {profile ? (
        <img src={supabase.getImageUrl('avatars', profile.avatar_url)} />
      ) : (
        <button onClick={uploadAvatar}>Upload</button>
      )}
      <div>Welcome, {authData.user.email.split('@')[0]}</div>
      <p>Select a layer in canvas, then click upload to update your avatar.</p>
      <button className="outline" onClick={onLoggedOut}>
        Log out
      </button>
    </Container>
  );
};

export default Profile;
