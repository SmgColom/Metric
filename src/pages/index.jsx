import { Fragment } from 'react';
import Head from 'next/head';
import HeroHome from '@/components/layout/HeroSection/HeroHome';

function HomePage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro | Home</title>
        <meta 
          name='Seguros Mile Toro '
          description='Aquí encuentras las soluciones de seguros a tu medida con el mejor respaldo de Sura'
          />
          </Head>
      <HeroHome 
      title="Proteccion personal y patrimonial para toda la familia"
      description="Despues de conocernos e identificar juntos tus necesidades, construyamoslas mejores soluciones de seguros a la medida para ti, tu familia, tu patrimonio y tu futuro,con el respaldo de la compañía líder del mercado, Seguros Sura"
       imageUrl="/tigre.jpg"
      />
    </Fragment>
  )
}

//export const getStaticProps = async () => {
  // Fetch data BUT FROM OUR API
  //const response = await fetch(`${process.env.SERVER_NAME}/api/news`);
  //const data = await response.json();

  // ERROR HANDLING WITH SSR
  //if(!response.ok){
    //throw new Error(`Failed to fetch posts - Error ${response.status}: ${data.message}`)
 // }

  // Check the data is loading
  //console.log(data);

  //return {
   // props: {
     // articles: data
    //},
    //revalidate: 60 * 60
  //};
//};

export default HomePage;