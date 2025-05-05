# [B] SERVER-SIDE RENDERING

## [1] NEXT.JS: INTRODUCTORY CONCEPTS

### A. Initialising Next.js toolchain

**1. Create a "bootstrap" or app-ready Next.js application:**

  - NPM: `npx create-next-app@latest`
  
  - YARN: `yarn create next-app` (*I will primarily use this next week!*)

&nbsp;

**2. Configure your Next.js app (we want v13 features):**

  - Project name: `.` or sub-folder like `server`
  - TypeScript: `No` (*normally `Yes`, but we want to keep simple*)
  - ESLint: `Yes`
  - Tailwind: `No` (*recommended to use SASS, unless you have prior experience with Tailwind*)
  - src/ directory: `Yes`
  - **Experimental app/ directory:** `NO` (**this feature is EXPERIMENTAL & IN BETA - we will look briefly at this week, but still not stable**)  
  - Turbopack: `Yes`
  - Import alias: `@`

- **NOTE:** Like Vite, we are using a specific branch toolchain of React.js, which comes with bundled package managers & various other packages already setup, so we can build our app without having to configure these (the "old" teething pains of Next.js)

&nbsp;

### B Review of Next.js Architecture

*Note the similarities & differences to our standard CRA application*

**1. SRC folder is optional & everything is on a level directory at the top**

  - No issue that we have faced with React, where we CANNOT talk between the `src` & `public` root directories, owing to how React.js apps are initialised in the DOM & Virtual DOM

  - Allows for easier passing of props between different directories - VIEW THIS LIKE A NODE SERVER (*almost!*)

&nbsp;

**2. Main initial folders + ONE hidden**

  - `pages`: Stores our main app AND api 
  - `public`: Holds public resources our pages might use, like images (NOTE: Unlike CRA, this does NOT hold an index.html, as Next.js as dynamically pre-renders a page on the request reaching the server!)
  - `components`: this will hold our reusable components and is created outside the `/pages` directory (*this is a changing landscape and devs have yet to produce a clear structure - I prefer OUTSIDE app directory BUT WITHIN `/src`*)
  - `styles`: Holds our GLOBAL stylesheets & CSS modules for each page
  - `next`: The application build served to the client (*hidden*)

  - *ALSO NOTE: We will use `_app.js` soon, and it is basically a mesh of our old React.js `App.js` AND `index.js` files*

&nbsp;

**3. Conduct some small cleanup:**

  - **Overall Structure:**

    - Change the `.js` files to `.jsx` for consistency (`_app.jsx`, `_document.jsx` & `index.jsx`)

  - **Create new directories**
    
    - Create NEW `components` folder on same level as `/pages` directory, within `/src` + include subfolders `common`, `features` & `layout`
    
    - Create NEW `styles` folder on same level as `/pages` directory, within `/src` (*done by default in `/pages` directory*)

  - **Adjusting `/styles`:**
    
    - Delete all CSS within `global.css` except the `*`, `html` & `body` CSS resets

    - Delete the `Home.module.css` file (*we will add our own system shortly*)

  - **Adjusting `index.jsx`:**

    - Remove all template content & replace with a basic `rafce` component of `HomePage`, with `<h1>` of `Home Page`
    
    - Delete the link to the `Home.module.css` file & remove its import

&nbsp;

### B. BUILDING NEXT.JS PAGES

**1.Setup Home Page** 

  - Create standard functional component, like React (use: `rafce` for React functional component **OR** with Next snippets, `rfc`)

    - index.js is our entry point for our BASE URL: `https://localhost:3000/`
    - We must continue to export our components, as usual (just change default component name to `HomePage` rather than `index`)
    - NO need for React imports, as Next.js like Vite cleverly builds this automatically
    - Our function must return JSX code, representing our rendered output

  - Much like React, we can build our pages using the same standard syntax in JSX 

  *- NOTE: You can prefer ES6 arrow functions over standard function syntax, just note the Next.js documentation writes components as standard functions NOT arrow*

&nbsp;

**2. Run the Server-Side Application**

  - With our first basic page created, we can test this in our Next.js development environment: `npm run dev`

  - **NOTE:** It creates a `next` folder, which houses the built application, which is served to the client for rendering (this is server-side rendering at work)

&nbsp;

**3. Useful VSCode Extensions:**

  - ES7 React Snippets (https://github.com/dsznajder/vscode-react-javascript-snippets/blob/HEAD/docs/Snippets.md)
  - React and Next.js Snippets (https://www.react-next-snippets.co/)