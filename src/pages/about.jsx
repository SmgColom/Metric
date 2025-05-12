import styles from "./about.module.scss";

const AboutPage = () => {
  return <div>
    <h1>Soy Mile Toro, tu asesora de protección familiar y patrimonial</h1>
    <p>Porque cuidar lo que más quieres no debería ser complicado.Soy asesora de seguros y estoy para acompañarte con empatía, claridad y el respaldo de la mano de la compañía que cumple cuando más lo necesitás.solo dime qué te preocupa, y construimos juntos la mejor solución. 💙</p>
    <div className={styles.imagen}>
    <img src="/Imagenperfil.jpeg" alt="Imagen de perfil asesora Mile Toro" />
    </div>
  </div>;
  
};
export default AboutPage;