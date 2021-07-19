import { gql, useLazyQuery, useMutation } from '@apollo/client'
import React, { Fragment, useEffect, useState } from 'react'
import { Collapse, Col, Form, Tab, Tabs } from 'react-bootstrap'
import { useMessageDispatch, useMessageState } from '../../context/message'
import Message from './Message'
import ReactGiphySearchbox from 'react-giphy-searchbox'



const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!, $content_type: String) {
    sendMessage(to: $to, content: $content, content_type: $content_type) {
      uuid
      from
      to
      content
      content_type
      createdAt
    }
  }
`

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      content_type
      createdAt
      reactions{
        uuid 
        content
      }
    }
  }
`

export default function Messages() {
  const { users } = useMessageState()
  const dispatch = useMessageDispatch()
  const [content, setContent] = useState('')
  const [isPanelShow, setPanelShow] = useState(false)

  const selectedUser = users?.find((u) => u.selected === true)
  const messages = selectedUser?.messages

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES)

  const [sendMessage] = useMutation(SEND_MESSAGE, {    
    onError: (err) => console.log(err),
  })

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser])

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData])

  const submitMessage = (e) => {
    e.preventDefault()

    if (content.trim() === '' || !selectedUser) return

    setContent('')

    // mutation for sending the message
    sendMessage({ variables: { to: selectedUser.username, content } })
  }

  const submitCustomMsg = (item) => {
    if (item === null || !selectedUser) return    
    var msgUrl = item["images"]["downsized"]["url"]; 
    sendMessage({ variables: { to: selectedUser.username, content:msgUrl, content_type:"gif" } })
    setContent('')
  }

  let selectedChatMarkup
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading..</p>
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ))
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <p className="info-text">
        You are now connected! send your first message!
      </p>
    )
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div
        className="messages-box d-flex flex-column-reverse p-3"
        onClick={(e) => setPanelShow(false)}
      >
        {selectedChatMarkup}
      </div>
      <div className="px-3 py-2">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              className="message-input rounded-pill p-2 bg-secondary border-0"
              placeholder="Type a message.."
              value={content}
              onFocus={(e) => setPanelShow(false)}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-plus-circle fa-2x text-primary p-2"
              onClick={(e) => setPanelShow(!isPanelShow)}
              aria-controls="Panel"
              aria-expanded={isPanelShow}
              role="button"
            ></i>
            <i
              className="fas fa-paper-plane fa-2x text-primary p-2"
              onClick={submitMessage}
              role="button"
            ></i>
          </Form.Group>
        </Form>
      </div>
      <Collapse in={isPanelShow} className="overflow-auto">
        <div id="Panel">
          <div className="ms-2 py-2">
            <Tabs
              defaultActiveKey="Gif"
              id="uncontrolled-tab-example"
              className="mb-3"
            >
              <Tab eventKey="Gif" title="Gif">
                <div className="searchboxWrapper">
                  <ReactGiphySearchbox
                    poweredByGiphy={false}
                    masonryConfig={[
                      { columns: 2, imageWidth: 140, gutter: 10 },
                      { mq: "700px", columns: 4, imageWidth: 200, gutter: 10 },
                    ]}
                    apiKey="sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh" // Required: get your on https://developers.giphy.com
                    onSelect={(item) => submitCustomMsg(item)}
                  />
                </div>
              </Tab>
              <Tab eventKey="Sticker" title="Sticker">
                <div className="searchboxWrapper">
                  <ReactGiphySearchbox
                    poweredByGiphy={false}
                    library="stickers"
                    masonryConfig={[
                      { columns: 2, imageWidth: 140, gutter: 10 },
                      { mq: "700px", columns: 4, imageWidth: 200, gutter: 10 },
                    ]}
                    apiKey="sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh" // Required: get your on https://developers.giphy.com
                    onSelect={(item) => submitCustomMsg(item)}
                  />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </Collapse>
    </Col>
  );
}