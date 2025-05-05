# [A] NEXT.JS: INTRODUCTORY CONCEPTS

## 4. STYLING FRAMEWORK FOR NEXT.JS

**OFFICIAL DOCUMENTATION ON CSS:** 

  - [NextJS CSS](https://nextjs.org/docs/basic-features/built-in-css-support)

  - [COLOUR THEORY USED 900 & 400 HUES](https://tailwindcss.com/docs/customizing-colors)

  - [Experimental `/app` CSS evolution](https://beta.nextjs.org/docs/styling/sass)

&nbsp;

### A. OVERVIEW of CSS MODULES

**Technology:** [CSS Modules](https://glenmaddern.com/articles/css-modules)
  - Bundled with Next.js (like CRA/Vite)
  - Allows us to "modularise" our CSS & attach it directly to components that need the CSS

**Benefits of Modular SCSS:**
  - Retains separation of concerns between CSS & JSX
  - Allows for tight scoping of CSS class names
  - Encourages abstraction of React code into components & reusing declarative components
  - Very UNopinionated & simple 

**Arguments AGAINST CSS Modules**
  - Some developers argue it does not do much OR can be outdone by its "CSS-in-JS" equivalents like styled-components OR vanilla-extract
  - Transition from pure SCSS can feel weird at first -> transition from global scss to part global - part modular, class-based system

&nbsp;

### B. CSS LEVELS - GLOBAL vs. MODULAR CSS

  - **GLOBAL:** You can style your application from the `globals.css`, and this by default will likely include base/root level styling such as targetting the `body`, `html` or general tags such as `h1`-`h6`

    - IMPORTANT: This is imported at the root level of our application, being `_app.js`

    - Without a pre-processor like SASS, this file could quickly get out of hand!

  - **MODULAR/COMPONENT-LEVEL:** You can also apply styling at a modular/component level, rather than having them all written at the global level

    - **MAIN ADVANTAGE:** CSS Modules locally scope CSS by automatically creating a unique class name. This allows you to use the same CSS class name in different files without worrying about collisions.  **Modules can be imported ANYWHERE in your application**

    - **ARCHITECTURE:** Next recommends you nest your CSS inside your components folder, alongside components NOT in pages

      - *DISTINCTION: - Pages should only contain the data and the layout of components || Components will contain HOW the UI/component is structured and how it displays the data, including CSS* 
      
      - We will revist this in our next Exemplar: `code-feed-setup`

  - **BUILD STEPS:** 

    - (i) Create a mock component inside components: `Header.jsx` inside `layout` folder, in `components` directory (*we will copy across our Home Navigation & link the component into About - `import Header from "../components/layout/Header"`*)

    - (ii) Create corresponding component-level CSS file: `Header.module.css` (*and make some basic styling to be applied*)

    - (iii) Import the modular CSS file as a `styles` object into the component: `import styles from './Header.module.css'`

    - (iv) Call the classes (as `className`) in the component, noting the styles is the object, and you are passing class props as the class attributes: `className={styles.header}` or `className={styles.brand}`

    - (v) Import the Header into the root `index.jsx`, using the `@` alias, to view how the header looks & ensure is working (*NOTE - it will only display on Home page for timebeing*)

&nbsp;

### C SASS INTEGRATION + REACT-ICONS

**INSTALLATION as DEV DEPENDENCY: `npm i -D sass`**

**INSTALLATION as DEPENDENCY: `npm i react-icons`**

  - (i) **NOTE:** Your Node version may conflict with versions of Sass or Next.  *Currently, Next 13 works with Node 18 works with SASS 1.62*  These are some of the difficulties that come with working with NEWER tech!

  - (ii) Whilst SASS may recommend a global install, Next.js cannot read it, so don't worry with this method.  You will want to install as dev dependency as you only want it to compile in a dev environment and build to CSS in the production version

  - (iii) Include `watch:scss` & `build:scss` scripts in `package.json` as we still want to have these to compile our SASS at build time

&nbsp;

**(a) GLOBAL SASS: Our standard approach**

  - (i) We can create our usual folders & files like `abstracts`, `base` (*include the globals.css in here*) & `components`

  - (ii) Import all the folders into `main.scss` (*except for abstracts, which we never bring into main*)

  - (iii) Import the `main.scss` into `_app.jsx` file & replace the `globals.css` file with `.scss` equivalent (like Term 1)

  - **(iv) COMPILED SASS:** Like with Vite though, the framework can compile the SASS in dev - so we can remove the compiler scrips + just link the `main.scss` file in `_app.jsx`

&nbsp;

**(b) MODULAR SCSS: Incorporate SCSS directly to components & use only base level `_partials` as the underpinning sass**

  - (i) In this case, create base level files in `sass` folder, like an `abstracts` folder with `_variables.scss`

  - (ii) Create a new component level `.scss` file for our navbar called `Header.module.scss`

  - (iii) Copy in all the old `.css` styling & import the `.scss` partials: `@use '../../styles/sass/abstracts/' as *;` 

  - (iv) Import in the `.scss` file instead of `.css` file into the component: `import styles from './Header.module.scss'`

  - (v) Still maintain the `globals.css`/`main.scss` as part of the `_app.jsx`, as this will still provide global CSS

  - (vi) As a preview - you can even import the `Header` into `_app.jsx` as part of the App (using a `Fragment` to nest the `Header` & `children` components)

&nbsp;

**3. CHALLENGE: BUILD THE FOOTER with CSS/SCSS of your choice**

  - **(a) JSX/MARKUP:** Create the Component for `Footer.jsx` & using `rfce`, build a basic footer with markup

  - **(b) STYLE:** Using global CSS/SCSS or CSS/SCSS modules - style the component so it has a background color same as Header, and has basic padding and so on.

  - **(c) ROUTE & LINK:** Make sure to include the Footer, in the correct order, in `_app.jsx`, much like the `Header` so it appears on all routes

  - **(d) BONUS:** See if you can apply some global styling so that the header appears at top & footer appears at bottom, using a vertical flexbox

&nbsp;

**4. RESPONSIVE FRAMEWORKS & CSS-IN-JS INTEGRATION**

  - FOR INFORMATION ON RESPONSIVE FRAMEWORKS: https://nextjs.org/docs/basic-features/built-in-css-support#import-styles-from-node_modules

  - FOR INFORMATION ON CSS-IN-JS: https://nextjs.org/docs/basic-features/built-in-css-support#import-styles-from-node_modules