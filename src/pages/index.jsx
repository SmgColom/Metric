// URL: https://localhost:3000/
// [3A]: Home Page Navigation
import Link from "next/link"
// import Header from "@/components/layout/Header"

const HomePage = () => {
  return (
    <div>
      {/* <Header /> */}
      <h1>Proteccion personal y patrimonial para toda la familia </h1>
      <p>Construyamos juntos las mejores souciones de seguros a la medida de tus necesidades</p>

      <h4>Navigation</h4>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>        
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/news">News</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>        
        </ul>
      </nav>
    </div>
  )
}

export default HomePage