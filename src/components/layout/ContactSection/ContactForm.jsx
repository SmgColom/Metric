  import { useState } from "react";
  import Joi from "joi";
  import styles from "./ContactForm.module.scss";

  const ContactForm = () => {
    const [formData, setFormData] = useState({ Nombre: "", Apellido: "", Celular: "", email: "", Mensaje: "" });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const schema = Joi.object({
      Nombre: Joi.string().min(2).required().messages({
        "string.empty": "El nombre es obligatorio.",
        "string.min": "El nombre debe tener al menos 2 caracteres.",
      }),
      Apellido: Joi.string().min(2).required().messages({
        "string.empty": "El apellido es obligatorio.",
        "string.min": "El apellido debe tener al menos 2 caracteres.",
      }),
      Celular: Joi.string().pattern(/^[0-9+\-()\s]{7,15}$/).required().messages({
        "string.empty": "El celular es obligatorio.",
        "string.pattern.base": "Ingresa un número de celular válido.",
      }),
      email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        "string.empty": "El correo es obligatorio.",
        "string.email": "Ingresa un correo electrónico válido.",
      }),
      Mensaje: Joi.string().min(5).max(500).required().messages({
        "string.empty": "El mensaje es obligatorio.",
        "string.min": "Debe tener al menos 5 caracteres.",
        "string.max": "Máximo 500 caracteres.",
      }),
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
      e.preventDefault();
      const { error } = schema.validate(formData, { abortEarly: false });
      if (error) {
        const newErrors = {};
        error.details.forEach(err => newErrors[err.path[0]] = err.message);
        setErrors(newErrors);
        return;
      }

      // Enviar a Google Forms
const formDataToSend = new FormData();
formDataToSend.append("entry.399147502", formData.Nombre);
formDataToSend.append("entry.1038662462", formData.Apellido);
formDataToSend.append("entry.1852247219", formData.Celular);
formDataToSend.append("entry.1300937957", formData.email);
formDataToSend.append("entry.304608279", formData.Mensaje);
     // Reemplaza la URL con la de tu formulario (vista pública)
fetch("https://docs.google.com/forms/d/e/1FAIpQLSflq8LwsEpjMXZxpXzWzJqTC3BQSiJLKxA_shtjebM87QPiCA/formResponse", {
  method: "POST",
  mode: "no-cors",
  body: formDataToSend,
});
setSubmitted(true);
setFormData({ Nombre: "", Apellido: "", Celular: "", email: "", Mensaje: "" });
setErrors({});
    };

    return (
      <div className={styles.infoWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
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
          {submitted && <p className={styles.contact__successMessage}>¡Gracias! Tu mensaje fue enviado.</p>}
        </form>
      </div>
    );
  };

  export default ContactForm;




