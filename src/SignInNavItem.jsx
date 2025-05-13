import React from 'react';
import { NavItem, Modal, Button, NavDropdown, MenuItem } from 'react-bootstrap';
import withToast from './withToast.jsx';


class SigninNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      user: { signedIn: false, givenName: '' },
    };
    this.buttonDiv = React.createRef();
    
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.signOut = this.signOut.bind(this);
    this.handleCredentialResponse = this.handleCredentialResponse.bind(this);
  }

  async componentDidMount() {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const clientId = window.ENV?.GOOGLE_CLIENT_ID;
    const { showError } = this.props;

    await this.checkAuthStatus();
    
    if (!clientId) {
      showError('Missing GOOGLE_CLIENT_ID');
      return;
    }

    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: this.handleCredentialResponse,
    });
  }

  componentDidUpdate(_, prevState) {
    if (this.state.showing && !prevState.showing) {
      setTimeout(() => {
        if (this.buttonDiv.current && window.google) {
          window.google.accounts.id.renderButton(this.buttonDiv.current, {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            width: '100%'
          });
        }
      }, 100);
    }
  }

  async checkAuthStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Auth check failed');
      
      const userData = await response.json();
      this.setState({ user: userData });
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  async handleCredentialResponse(response) {
  const { showError } = this.props;
  try {
    const res = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
      credentials: 'include'
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Authentication failed');
    }

    const result = await res.json();
    this.setState({
      showing: false,
      user: result.user
    });
    if (this.props.setUser) this.props.setUser(result.user);


    // 🔍 Prueba que GraphQL recibe el token
    const graphqlQuery = {
      query: `
        query {
          about
        }
      `
    };

    const graphqlRes = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(graphqlQuery),
    });

    const graphqlData = await graphqlRes.json();
    console.log('GraphQL result:', graphqlData);

  } catch (err) {
    console.error('Auth error:', err);
    showError(err.message || 'Authentication failed');
  }
}


  async signOut() {
    try {
      await fetch('http://localhost:3000/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });
      this.setState({ user: { signedIn: false } });
      if (this.props.setUser) this.props.setUser({ signedIn: false });
      window.google.accounts.id.disableAutoSelect();
    } catch (error) {
      console.error('Signout error:', error);
    }
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  render() {
    const { user, showing } = this.state;

    if (user.signedIn) {
      return (
        <NavDropdown title={user.givenName} id="user">
          <MenuItem onClick={this.signOut}>Sign out</MenuItem>
        </NavDropdown>
      );
    }

    return (
      <>
        <NavItem onClick={this.showModal}>
          Sign in
        </NavItem>
        <Modal show={showing} onHide={this.hideModal} bsSize="sm">
          <Modal.Header closeButton>
            <Modal.Title>Sign in</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div ref={this.buttonDiv} style={{ display: 'flex', justifyContent: 'center' }}></div>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="link" onClick={this.hideModal}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default withToast(SigninNavItem);
