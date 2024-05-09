import React from "react";
import { Row, Card } from "react-bootstrap";

// This is a functional component which renders the individual messages
export function Message( props ){
    return (
        <Row style={{ marginRight:"0px" }}>
            <Card  border="success" style={{ width:'80%', alignSelf:'center', margin:"0 0 5px " + props.marginLeft, float:"right", right:"0px" }}>
                <Card.Body>
                    <h6 style={{ float:"right" }}> 
                        { props.timestamp } 
                    </h6>
                    <Card.Subtitle>
                        <h6>
                            { props.sender_name }
                        </h6>
                    </Card.Subtitle>
                    <Card.Text>
                        <h4> 
                            <b>
                                { props.msg }
                            </b>
                        </h4>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Row>
    );
}



