// [2C(i)] DYNAMIC ROUTES - URL: https://localhost:3000/news/:newsId
// TEST: We can test this in the browser by passing any type of id into the query string held by ":projectId", like "p2" or "p2000"

// [2C(ii)] IMPORT useRouter HOOK
import { useRouter } from "next/router";

function NewsDetails() {
  // [2C(ii)] EXTRACT PARAM VALUE by declaring router object & calling query property
  const router = useRouter();
  const newsId = router.query.newsId;
  console.log(newsId);

  return (
    <div>
      <h1>Highlighted News Page: { newsId }</h1>
      <p>This page would likely have data dynamically rendered from the API / database, into UI we have created to house this data!</p>
    </div>
  )
}

export default NewsDetails