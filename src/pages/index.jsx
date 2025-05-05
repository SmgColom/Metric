// URL: https://localhost:3000/
// [3A]: Home Page Navigation
import Link from "next/link"
// import Header from "@/components/layout/Header"

const HomePage = () => {
  return (
    <div>
      {/* <Header /> */}
      <h1>Welcome to Next.js Intro</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo perspiciatis ipsa saepe ex quibusdam quae, autem est ullam dicta ad?</p>

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