import React, { useState } from "react";
import api from '../config/api';

const ContactForm = ({ receiverEmail, orderDetails }) => {
    const [status, setStatus] = useState("Next");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");
        const { name, email, message } = e.target.elements;
        let details = {
            name: name.value,
            email: email.value,
            message: message.value,
            receiverEmail: receiverEmail, // Use the provided receiverEmail prop
            orderDetails: orderDetails, // Include order details
        };
        try {
            const response = await api.post("/contact", details);
            setStatus("Next");
            alert(response.data.status);
        } catch (error) {
            console.error("Contact form error:", error);
            alert("Failed to send message. Please try again.");
            setStatus("Next");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" required />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" required />
            </div>
            <div>
                <label htmlFor="message">Message:</label>
                <textarea id="message" required />
            </div>
            <button type="submit">{status}</button>
        </form>
    );
};

export default ContactForm;
