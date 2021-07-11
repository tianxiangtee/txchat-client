import React from "react";
// import "./styles.css";
import { Nav, Navbar } from "react-bootstrap";
import { useAuthDispatch } from '../../context/auth';
import { ReactComponent as Logo } from "../../logo.svg";

//import "bootstrap/dist/css/bootstrap.min.css";

export default function Hamburger() {
    const authDispatch = useAuthDispatch()
    const logout = () => {
        authDispatch({ type: 'LOGOUT' })
        window.location.href = '/'
      }
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand href="#home">
        <Logo
          alt=""
          width="30"
          height="30"
          className="d-inline-block align-top"
        />
        TX Chat
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="#">Coming Soon</Nav.Link>
          <Nav.Link onClick={logout}>Logout</Nav.Link>          
        </Nav>        
      </Navbar.Collapse>
    </Navbar>
  );
}
