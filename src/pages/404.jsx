// CUSTOM 404 PAGE
import Link from "next/link"

function NotFoundPage() {
  return (
    <div>
      <h1>Welcome to Custom 404</h1>
      <p>You are in the wrong place!</p>
      <ul>     
        {/* 3E: Return to Home Navigation */}
        <li>
          <Link href="/">Return to Home</Link>
        </li>
      </ul>
    </div>
  )
}

export default NotFoundPage