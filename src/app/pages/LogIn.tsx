import * as React from 'react';
import styled from 'styled-components';
import supabase from '@app/utils/supabase';

const Container = styled.div`
    img {
        width: 100px;
    }
    input {
        margin-bottom: 12px;
    }
`;

const LogIn = function ({onLoggedIn}) {
    const [values, setValues] = React.useState({
        email: '',
        password: '',
    });

    async function logIn() {
        const {data, error} = await supabase.signIn(values);
        if (error) {
            console.error(error);
        } else {
            onLoggedIn(data);
        }
    }

    function handleChange(e) {
        const {name, value} = e.target;
        setValues({
            ...values,
            [name]: value,
        });
    }

    return (
        <Container>
            <img src={require('../assets/logo.svg').default} className="logo" />
            <h2>Figma × Supabase</h2>
            <input placeholder="email" name="email" value={values.email} onChange={handleChange} />
            <input
                placeholder="password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
            />
            <button onClick={logIn}>Log in</button>
        </Container>
    );
};

export default LogIn;
