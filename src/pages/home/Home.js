import { gql, useSubscription } from "@apollo/client";
import React, { Fragment, useEffect } from "react";
import { Row } from "react-bootstrap";
import { useAuthState } from "../../context/auth";
import { useMessageDispatch } from "../../context/message";
import Hamburger from "./Hamburger";
import Messages from "./Messages";
import Users from "./Users";

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const NEW_REACTION = gql`
  subscription newReaction {
    newReaction {
      uuid
      content
      message {
        uuid
        from
        to
      }
    }
  }
`;

export default function Home({ history }) {
  const messageDispatch = useMessageDispatch();

  const { user } = useAuthState();

  const { data: messageData, error: messageError } =
    useSubscription(NEW_MESSAGE);

  const { data: reactionData, error: reactionError } =
    useSubscription(NEW_REACTION);

  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser =
        user.username === message.to ? message.from : message.to;

      messageDispatch({
        type: "ADD_MESSAGE",
        payload: {
          username: otherUser,
          message,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageError, messageData]);

  useEffect(() => {
    if (reactionError) console.log(reactionError);

    if (reactionData) {
      const reaction = reactionData.newReaction;
      const otherUser =
        user.username === reaction.message.to
          ? reaction.message.from
          : reaction.message.to;

      messageDispatch({
        type: "ADD_REACTION",
        payload: {
          username: otherUser,
          reaction,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionError, reactionData]);

  return (
    <Fragment>
      <Row className="bg-white justify-content-around mb-1">
        {/* <Col>
          <Link to="/login">
            <Button variant="link">Login</Button>
          </Link>
        </Col>
        <Col>
          <Link to="/register">
            <Button variant="link">Register</Button>
          </Link>
        </Col>
        <Col>
          <Button variant="link" onClick={logout}>
            Logout
          </Button>
        </Col> */}
        <Hamburger />
      </Row>
      <Row className="bg-white">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  );
}
