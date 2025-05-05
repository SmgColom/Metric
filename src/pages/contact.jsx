import { useState } from "react";
import Joi from "joi-browser";
import styles from "./ContactForm.module.scss";

const ContactPage= () => {
  const [formData, setFormData] = useState({ Nombre: "", Apellido: "",Celular: "", email: "", Mensaje: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const schema = Joi.object({
    Nombre: Joi.string().min(2).required(),
    Apellido: Joi.string().min(2).required(),
    Celular: Joi.string().regex(/^[0-9+\-()\s]{7,15}$/).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    Mensaje: Joi.string().min(5).max(500).required(),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = schema.validate(formData, { abortEarly: false });
    if (error) {
      const validationErrors = {};
      error.details.forEach(err => validationErrors[err.path[0]] = err.message);
      setErrors(validationErrors);
      return;
    }

    // Aquí puedes integrar con Google Forms o una API
    setSubmitted(true);
    setFormData({ Nombre: "", Apellido: "", Celular: "", email: "", Mensaje: "" });
    setErrors({});
  };

  return (
    <div className={styles.contactWrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Contáctame</h2>

        <input name="Nombre" placeholder="Nombre" value={formData.Nombre} onChange={handleChange} />
        {errors.Nombre && <small>{errors.Nombre}</small>}

        <input name="Apellido" placeholder="Apellido" value={formData.Apellido} onChange={handleChange} />
        {errors.Apellido && <small>{errors.Apellido}</small>}

        <input name="Celular" placeholder="Celular" value={formData.Celular} onChange={handleChange} />
        {errors.Celular && <small>{errors.Celular}</small>}

        <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
        {errors.email && <small>{errors.email}</small>}

        <textarea name="Mensaje" placeholder="Mensaje" rows="5" value={formData.Mensaje} onChange={handleChange} />
        {errors.Mensaje && <small>{errors.Mensaje}</small>}

        <button type="submit">Enviar</button>
        {submitted && <p className={styles.success}>Gracias! Tu mensaje fue enviado.</p>}
      </form>
    </div>
  );
}

export default ContactPage;
