import React from 'react';
import {
  Navbar, Nav, NavItem, NavDropdown,
  MenuItem, Glyphicon,
  Grid, Col,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Contents from './Contents.jsx';
import IssueAddNavItem from './IssueAddNavItem.jsx';
import SignInNavItem from './SignInNavItem.jsx';
import Search from './Search.jsx';
import UserContext from './UserContext.js';

function Footer() {
  return (
    <small>
      <hr />
      <p className="text-center">
        Full source code available at this{' '}
        <a href="https://github.com/vasansr/pro-mern-stack-2">
          GitHub repository
        </a>
      </p>
    </small>
  );
}

export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: { signedIn: false, givenName: '' } };

    this.setUser = this.setUser.bind(this);
  }

  setUser(user) {
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    return (
      <div>
        <Navbar fluid>
          <Navbar.Header>
            <Navbar.Brand>Issue Tracker</Navbar.Brand>
          </Navbar.Header>
          <Nav>
            <LinkContainer exact to="/">
              <NavItem>Home</NavItem>
            </LinkContainer>
            <LinkContainer to="/issues">
              <NavItem>Issue List</NavItem>
            </LinkContainer>
            <LinkContainer to="/report">
              <NavItem>Report</NavItem>
            </LinkContainer>
          </Nav>
          <Col sm={5}>
            <Navbar.Form>
              <Search />
            </Navbar.Form>
          </Col>
          <Nav pullRight>
            <IssueAddNavItem disabled={!user.signedIn} />
            <SignInNavItem setUser={this.setUser} />
            <NavDropdown
              id="user-dropdown"
              title={<Glyphicon glyph="option-vertical" />}
              noCaret
            >
              <LinkContainer to="/about">
                <MenuItem>About</MenuItem>
              </LinkContainer>
            </NavDropdown>
          </Nav>
        </Navbar>
        <Grid fluid>
          <UserContext.Provider value={user}>
            <Contents />
          </UserContext.Provider>
        </Grid>
        <Footer />
      </div>
    );
  }
}