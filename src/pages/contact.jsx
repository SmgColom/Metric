import { useState } from "react";
import Joi from "joi";
import styles from "./ContactForm.module.scss";
import { BsWhatsapp } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    Nombre: "", Apellido: "", Celular: "", email: "", Mensaje: ""
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const schema = Joi.object({
    Nombre: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.empty": "El nombre es obligatorio.",
        "string.min": "El nombre debe tener al menos 2 caracteres.",
      }),
  
    Apellido: Joi.string()
      .min(2)
      .required()
      .messages({
        "string.empty": "El apellido es obligatorio.",
        "string.min": "El apellido debe tener al menos 2 caracteres.",
      }),
  
    Celular: Joi.string()
      .pattern(/^[0-9+\-()\s]{7,15}$/)
      .required()
      .messages({
        "string.empty": "El celular es obligatorio.",
        "string.pattern.base": "Ingresa un número de celular válido.",
      }),
  
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "El correo es obligatorio.",
        "string.email": "Ingresa un correo electrónico válido.",
      }),
  
    Mensaje: Joi.string()
      .min(5)
      .max(500)
      .required()
      .messages({
        "string.empty": "El mensaje es obligatorio.",
        "string.min": "El mensaje debe tener al menos 5 caracteres.",
        "string.max": "El mensaje no puede tener más de 500 caracteres.",
      }),
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

    setSubmitted(true);
    setFormData({ Nombre: "", Apellido: "", Celular: "", email: "", Mensaje: "" });
    setErrors({});
  };

  return (
    <div className={styles.fullWrapper}>
      <div className={styles.container}>
        {/* FORMULARIO */}
        <div className={styles.formSection}>
          <h2>Contáctame</h2>
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
            {submitted && <p className={styles.success}>¡Gracias! Tu mensaje fue enviado.</p>}
          </form>
        </div>

        {/* INFOBOX */}
        <div className={styles.infoSection}>
          <div className={styles.infoBox}>
            <div>
              <a
                href="https://wa.me/+57 3009919207?text=Hola!%20Quisiera%20hablar%20contigo%20sobre%20una%20consulta."
                target="_blank" rel="noopener noreferrer">
                <div className={styles.icon}><BsWhatsapp /></div>
              </a>
              <h3>WhatsApp</h3>
              <p> 300 991 9207</p>
            </div>

            <div>
              <a href="mailto:milena.toro@asesorsura.com?subject=Consulta&body=Hola, quisiera contactarte...">
                <div className={styles.icon}><MdEmail /></div>
              </a>
              <h3>Correo</h3>
              <p>milena.toro@asesorsura.com</p>
            </div>

            <div>
              <div className={styles.icon}><IoLocationOutline /></div>
              <h3>Ubicación</h3>
              <p>Calle 27  46  70  Local 144 C Ccial Punto Clave, Medellín, Colombia </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

