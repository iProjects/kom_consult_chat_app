import React from "react";
import { Row, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

// This is a function which renders the users in the users list
export function UserCard( props ){
    return (
        <Row style={{ marginRight:"0px" }}>
            <Card border="success" style={{ width:'100%', alignSelf:'center', marginLeft:"15px" }} >
              <Card.Body>
                  <Card.Title> { props.user_name } </Card.Title>
                  <Card.Subtitle> { props.user_address.length > 20 ? props.user_address.substring(0, 20) + " ..." : props.user_address } </Card.Subtitle>
              </Card.Body>
            </Card>
        </Row> 
    );
}