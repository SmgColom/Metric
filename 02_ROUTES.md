# [A] NEXT.JS: INTRODUCTORY CONCEPTS

## 2. CREATING STATIC & DYNAMIC ROUTES

**Routing is IMPLICIT not EXPLICIT** 

  - **In React.js:** We integrate in `react-router-dom` and internally navigate our client-side application using `App.js` to store the app-tree & `Link` to navigate between the application pages

  - **In Next.js:** The URL pages are implicit in the file names, much like with vanilla HTML.  If we want to navigate to our `/about` page, we just create a `about.js` file in the pages, at the root level:

    - MUST be created within in the `/pages` directory (*becoming known as a **root** node*)

    - MUST create at least `index.jsx` within any new directory

&nbsp;

**ROUTING CONCEPT: 'Branches' & 'Leaves'**

  - Your main choice when creating a routed page is whether you wish to **EXTEND** a `BRANCH` or **END** with a `LEAF`

  - **(a) OPTION 1 - LEAF:** These are URL routes which expect to create a page, that has nothing built off it = `/about`

  - **(b) OPTION 2 - BRANCH:** These are URL routes which expect to create a URL segment, which then holds many sub-segments off it = `/news/australia` & `/news/global` 

  - **RATIONALE:** If we need a LEAF, make a **routed file** - if we need a BRANCH, make a **routed directory**

&nbsp;

### Setting up our Routed System

**[A] Basic LEAF Route**

  - NEW path at base URL, we can just create a new pages file & the name of the file will be the URL path to it
  
    - Using `rafce` shortcut, create a functional component & make sure to build out some dummy content such as `h1` & `p` tags

    - Name the component something-`Page`: `AboutPage`

  - **EXAMPLE:** `/about/page.jsx` = `localhost:3000/about`

  *- NOTE: View Page Source - we can see we no longer have an empty skeleton, unlike React.js, where the HTML code is sent by the server & provides ALL our pre-rendered content, meaning no load times AND search engines can ALSO see this content!* 

&nbsp;

**[B] Nested BRANCH Routes**

  - NEW path at a custom subdomain, we create a new directory & name files within it:

    - Create a new directory & this will represent the URL subdomain

    - Create an `index.jsx` inside this directory, otherwise the URL subdomain will lead to a `404` error

    - We can then create FURTHER pages in this subdomain, by just creating more files inside this folder, such as `portfolio.jsx`

  - **EXAMPLE:** `news` folder with `index.jsx` AND `sports.jsx` = `localhost:3000/newsa` & `localhost:3000/news/sports`

    - IMPORTANT: Our exported component names DO NOT necessarily match our file name & that's fine!

&nbsp;

**[C] Dynamic BRANCH Routes**

  - THEORY: With subdomains, for many modern web applications, we usually don't hardcode each of these nested files, as they are generally dynamically created based on the data obtained from an API or database

    - EXAMPLE: Think about Netflix - they have to create a specific page for EVERY movie in their database.  They cannot hardcode each of these in as it would TAKE AGES + lead to a bloated architecture. 

    - We need to use dynamic file routes so we can just pass the `ids` into the URL and find the page with the content populated by the database.

  - **(i) Dynamic Page**
    - We create a dynamic route by naming the file with square brackets & the dynamic URL path it will be passed

    - EXAMPLE: `[newsId]` inside the `news` folder = `https://localhost:3000/news/:newsId`
    - TEST: We can test this in the browser by passing any type of id into the query string held by `:newsId`, like "global" or "aus"

  &nbsp;

  - **(ii) Extracting Dynamic Params Value**

    - THEORY: We will need to interact & extract the dynamic URL param value - we will a custom Next.js hook called Router.  This exposes router specific functionality & we can then access the values passed into the URL query encoding

    - EXAMPLE:
      - Import useRouter hook: `import { useRouter } from "next/router";`
      - Save instance object of class inside component: `const router = useRouter();`
      - Call query property to access value: ` const newsId = router.query.newsId;`
      - We can now use that value as we need within our component
      - **NOTE:** The chained `newsId` must match our named dynamic page of `[newsId].jsx`

  &nbsp;

  **- CHALLENGE 1: Static CONTACT Route (5mins)**

    - (a) Create a new route from root URL which will look like this: `localhost:3000/contact` & has viewable content.  This must only be created as a **LEAF**

    - (b) If time - try to add some styling from `/styles/globals.css`

  &nbsp;

  **- CHALLENGE 2: Dynamic Blog Route (15mins)**

    - (a) Create a new route from root URL which will look like this: `localhost:3000/faq` & has a viewable parent FAQ page

    - (b) Make a FAQ subdomain & ensure nested route is dynamic, to allow for routing like this: `localhost:3000/faq/:faqId`, where the `faqId` is a dynamic URL param 

    - (c) The nested routes MUST be able to show the dynamic blog id passed into the URL, on the page in HTML