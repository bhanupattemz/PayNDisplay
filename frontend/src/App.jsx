import { useState } from 'react';
import './App.css';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Swal from 'sweetalert2';
import Card from 'react-bootstrap/Card';
import Loader from './Loader'; 


function App() {
  const [playerName, setPlayerName] = useState("");
  const [playerContent, setPlayerContent] = useState("");
  const [show, setShow] = useState(false);
  const [pastData, setPastData] = useState(undefined);
  const [count, setCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getName = async () => {
    const { data } = await axios.get('https://randomuser.me/api/');
    setPlayerName(`${data.results[0].name.first} ${data.results[0].name.last}`);
  };

  const handlePayment = async () => {
    if (!playerName || !playerContent) {
      return Swal.fire({
        title: 'Missing Information',
        text: 'Please provide both a player name and content to proceed.',
        icon: 'warning',
        confirmButtonText: 'Got it'
      });
    }
    setShow(false);
    setLoading(true); 

    try {
      const { data } = await axios.post("http://localhost:8000/api/v1/create-order", {
        amount: 10,
        receipt: `order_rcptid_${Date.now()}`
      });

      const { order } = data;
      const options = {
        key: "rzp_test_lZvUm6MCLYeXBW",
        amount: order.amount,
        currency: order.currency,
        name: "Pay N Display",
        description: "Payment for Exclusive Content",
        order_id: order.id,
        handler: async (response) => {
          try {
            const result = await axios.post("http://localhost:8000/api/v1/order/validate", {
              data: response,
              memberData: {
                player: playerName,
                content: playerContent
              }
            });

            setPastData(result.data.members);
            setCount(result.data.members.length);

            Swal.fire({
              title: 'Payment Successful!',
              text: 'Thank you! Your content is now live for others to enjoy.',
              icon: 'success',
              confirmButtonText: 'Awesome'
            });
          } catch (err) {
            Swal.fire({
              title: 'Payment Failed',
              text: 'Oops! Something went wrong with your payment. Please try again.',
              icon: 'error',
              confirmButtonText: 'Okay'
            });
          } finally {
            setLoading(false); 
          }
        },
        prefill: {
          name: playerName || `player${Math.floor(Math.random() * 10000)}`,
          email: "customer@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: 'Error',
        text: 'An error occurred while creating the order. Please try again later.',
        icon: 'error',
        confirmButtonText: 'Okay'
      });
    }
  };

  return (
    <div className="App">
      {loading ? (
        <Loader />
      ) : pastData ? (
        <div className='container'>
          <h1>Welcome, {playerName}!</h1>
          <p><b>Your Message:</b> {playerContent}</p>
          <p><b>Total Contributions:</b> {count}</p>
          <div className="scroll-container">
            <div className="scroll-content">
              {pastData.map((item, inx) => (
                <div className="card-container" key={inx}>
                  <Card style={{ width: '18rem' }}>
                    <Card.Body>
                      <Card.Title>{item.playerId}</Card.Title>
                      <Card.Text>{item.content}</Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
            <div>
              <div className='mb-3 mt-3'>
                <Button variant="primary" onClick={() => setShowAll(val => !val)}>
                  {showAll ? "Hide" : "Show All"}
                </Button>
              </div>
              <div className='card-data-container'>
                {showAll && pastData.map((item, inx) => (
                  <div className="card-container mb-3" key={inx}>
                    <Card style={{ width: '18rem' }}>
                      <Card.Body>
                        <Card.Title>{item.playerId}</Card.Title>
                        <Card.Text>{item.content}</Card.Text>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <h1>Welcome to Pay N Display!</h1>
          <p>Join the fun! Add your unique message to our wall of fame by contributing just ₹10.</p>
          <p>Once you’ve made your payment, your message will be showcased for all to see, and you’ll unlock access to all other messages in the community. Ready to leave your mark?</p>
          <div>
            <div className='user_form'>
              <Button variant="primary" onClick={handleShow}>
                Add Your Message
              </Button>

              <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Enter Your Display Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Share a fun or inspirational message for others to see! Your contribution will bring joy to the community.
                  <InputGroup className="mb-3 mt-3">
                    <InputGroup.Text id="basic-addon1">Player Name</InputGroup.Text>
                    <Form.Control
                      placeholder="Enter your name"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                    />
                  </InputGroup>
                  <InputGroup className='mb-3'>
                    <InputGroup.Text>Your Message</InputGroup.Text>
                    <Form.Control
                      as="textarea"
                      aria-label="With textarea"
                      placeholder="Add a message that others will see..."
                      value={playerContent}
                      onChange={(e) => setPlayerContent(e.target.value)}
                    />
                  </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={getName}>
                    Generate Random Name
                  </Button>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={handlePayment}>Pay & Display</Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
