# [A] NEXT.JS: INTRODUCTORY CONCEPTS

## 3. SETTING APP NAVIGATION

### Component Navigation with next/link

**To Navigate around our application, we need to use the `Link` over using `<a></a>`**

  - If we use the anchor tags, we can see clicking on the link, it causes a load - as its actually making another request to the server to return the new page

  - If we have already loaded the pre-rendered page, we want the user to remain in this application, rather than pull a new pre-rendered page from the server.  By using `Link`, it keeps it within the React client-side application it preserves state across pages.  **This is why we use React**, as it makes our web page much more like a single-page application and much more fluid navigation

&nbsp;

**[A] Home Page Navigation**

  - Create our list of standard navigation anchors

  - We import in the `Link` component & replace the anchor tag with it (*Link still takes an href attribute/prop*) & we pass the path name, which is our file names!  

  - **COMPARE:** How the `<a></a>` loads to the `Link` loading, and how the latter functions like our standard React application!

&nbsp;

**[B] Return to Home Navigation (News Page)**

  - Import `Link` into our component (`<Fragment>` too as we still need to follow React.js rendering rules)

  - Call the `Link` element & provide `href="/"` prop 

&nbsp;

**[C] Details Pages Navigation (News Page)**

  - Import `Link` into our component
  - Call the `Link` element & provide `href` prop 
  - `href` prop will provide a further path, and our dynamic routing will direct it to the relevant page, as its passed as a param when we click the link!

&nbsp;

**[D] Dynamic Details Pages Navigation (News Page)**

  - Import `Link` into our component
  - Call the `Link` element & provide `href` prop 

  - NEW: In this case, we hard code a specific prop to the component, to simulate a dynamic project link: `({ newsId = "World" })`
  - Our href will use **string interpolation** to pass the dynamic param prop to the link: `href={/news/${newsId}}`
  - We can even use the dynamic prop to be our link name too!

&nbsp;

**[E]. Default & Custom 404 Page**

- Next.js comes with a default 404 error page built out of the box (test it now!)

- If we want to customise & overwrite the default 404 page, all you need to do is create a new file called `404.js` at the root level (same as index.js Home page)

- Begin styling and tweaking to make your own!