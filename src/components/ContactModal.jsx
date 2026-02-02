import { useState } from 'react';

export default function ContactModal({ currentLang, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted:', formData);
        onClose();
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-labelledby="modal-title"
                aria-modal="true"
            >
                <button
                    className="close-modal"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                >
                    ×
                </button>
                <h2 id="modal-title" data-es="INICIAR PROYECTO" data-en="START PROJECT">
                    {currentLang === 'es' ? 'INICIAR PROYECTO' : 'START PROJECT'}
                </h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                    <label htmlFor="name">
                        <span data-es="Nombre" data-en="Name">
                            {currentLang === 'es' ? 'Nombre' : 'Name'}
                        </span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email">
                        <span data-es="Email" data-en="Email">Email</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="message">
                        <span data-es="Mensaje" data-en="Message">
                            {currentLang === 'es' ? 'Mensaje' : 'Message'}
                        </span>
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    ></textarea>

                    <button type="submit" className="submit-btn">
                        <span data-es="ENVIAR" data-en="SEND">
                            {currentLang === 'es' ? 'ENVIAR' : 'SEND'}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
