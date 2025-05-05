// [2B] NESTED ROUTES - URL: https://localhost:3000/news

// [3A-D] NAVIGATION
import { Fragment } from "react"
import Link from "next/link"

const NewsPage = ({ newsId = "World" }) => {
  console.log(newsId);

  return (
    <Fragment>
      <div>
        <h1>News Page</h1>
        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum tenetur iure perferendis fugiat cupiditate repellat tempora labore suscipit eveniet amet.</p>
      </div>

      {/* Navigation */}
      <ul>     
        {/* 3B: Return to Home Navigation */}
        <li>
          <Link href="/">Return to Home</Link>
        </li>

        {/* 3C: Details Navigation */}
        <li>
          <Link href="/news/politics">Politics</Link>
        </li>
        <li>
          <Link href="/news/business">Business</Link>
        </li>
        <li>
          <Link href="/news/sports">Sports</Link>
        </li>

        {/* 3D: Dynamic Details Navigation */}
        <li>
          <Link href={`/news/${newsId}`}>Project {newsId}</Link>
        </li>
      </ul>
    </Fragment>
  )
}

export default NewsPage