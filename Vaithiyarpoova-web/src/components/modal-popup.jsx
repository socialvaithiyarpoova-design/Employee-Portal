import React, { useEffect, useRef, useState } from "react";
import '../assets/styles/modal-popup.css';
import { Modal } from 'bootstrap'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import configModule from '../../config.js';
import { useAuth } from '../components/context/Authcontext.jsx'; 

function ModalPopup() {
  const modalRef = useRef(null);
  const [count, setCount] = useState("");
  const today = new Date();
  const config = configModule.config();
  const { user } = useAuth();
  const loginTime = user?.loginTime;
  const  userId = user?. userId;
  const formattedLoginTime = loginTime ? new Date(loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
  const formattedDate = `${today.toLocaleDateString("en-US", { weekday: "long" })}, ${today
    .toLocaleDateString("en-GB")
    .split("/")
    .join("-")}`;

  useEffect(() => {
    if (modalRef.current) {
      const modal = new Modal(modalRef.current, {
        backdrop: "static",
        keyboard: false,
      });
      modal.show();
    }
  }, []);

  // Close modal when Escape is pressed
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (modalRef.current) {
          const modalInstance = Modal.getInstance(modalRef.current) || new Modal(modalRef.current);
          modalInstance.hide();
          setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
          }, 300);
        }
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSubmit = async () => {
    if (!count || isNaN(count)) {
      toast.warning("Please enter a valid number.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}SaveLeadCount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ count: parseInt(count), userId: parseInt(userId) })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Count submitted successfully!");

        if (modalRef.current) {
          const modalInstance = Modal.getInstance(modalRef.current) || new Modal(modalRef.current);
          modalInstance.hide();

          setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style.paddingRight = '';
          }, 300);
        }
       setTimeout(() => {
        window.location.reload();
      }, 500);
      } else {
        toast.error("Failed to submit count: " + result.message);
      }
    } catch (error) {
      toast.error("Error submitting count: " + error.message);
    }
  };

  return (
    <div
      className="modal fade"
      id="exampleModal"
      tabIndex="-1"
      ref={modalRef}
      aria-hidden="true"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header modal-header-cust">
            <h5 className="modal-title" id="exampleModalLabel">Welcome!</h5>
            <p className='mb-0'>{formattedDate} / Login - {formattedLoginTime}</p>
          </div>
          <div className="modal-body modal-body-cust">
            <input
              type="number"
              className="enter-lrad-count"
              required
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <button
              className="btn btn-primary submit-lead-count"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalPopup;
