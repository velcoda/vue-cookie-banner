# Vue Cookie Comply 🍪

[//]: # (Insert on Made with vue!)

> A Vue 3 compatible component to handle cookie consent based off https://github.com/yaiks/vue-cookie-banner

## Features

- 🔹 Small bundle size (2.2kb minified + gziped)
- 🤖 Opinated and customizable data structure for the modal content
- 👐 Emit events on user actions so you can use your handlers
- 📱 Default responsive layout
- 🗄️ Highly customizable through **slots**
- 🚪 Usage of Vue 3 **Teleport** to render the modal anywhere in your app
- 💅 Write your own CSS or use the default styles
- Locks scrolling until the user has made a decision

> Heavily inspired by Airbnb's cookie consent UI

## Installation

> This package is only compatible with Vue 3.x

First install `vue-cookie-banner` as a dependency of your Vue app:

```sh
yarn add vue-cookie-banner

# or

npm install vue-cookie-banner
```

Then, install `vue-cookie-banner` as a plugin wherever you create your Vue app:

```js
import { createApp } from 'vue'
import App from './App.vue'
import VueCookieBanner from 'vue-cookie-banner'
import 'vue-cookie-banner/dist/style.css'

const app = createApp(App)

app.use(VueCookieBanner)
app.mount('#app')
```

**Don't forget to import the `css` file if you want to leverage the default style** 😉

## Usage

Now you're ready to use the component `<vue-cookie-banner />` it in your app:

```vue
<template>
  <main>
    <header />

    <div />

      <vue-cookie-banner
        :preferences="preferences"
        @on-accept-all-cookies="onAccept"
        @on-save-cookie-preferences="onSavePreferences"
        @on-reject-all-cookies="onReject"
      />

    <footer />
  </main>
</template>
```

> `vue-cookie-banner` automatically places the component at the bottom of your page

## Props

### headerTitle

A string that goes into the component header. It defaults to "Cookie settings".

### headerDescription

A string that gives more context to the user about your cookie policies. It defaults to the following text:

> We use cookies and similar technologies to help personalize content and offer a better experience. You can opt to customize them by clicking the preferences button.

### preferencesLabel

A string that controls the button label for the preferences button. It defaults to "Preferences".

### acceptAllLabel

A string that controls the button label for the acceptance button. It defaults to "Accept All".

### preferences

An array of objects to display the options of cookie preferences **in the modal**. The user may or may not be able to interact with a preference option (see `isRequired` field):

### greyOutBody
A boolean to set whether the rest of the page should be greyed out

### showAcceptAllInModal
A boolean for showing the "Accept All" button in the modal

### showEditButton
A boolean for showing the edit cookies button after submit the consent.

### editCookieIconPath
A string if you want to change the edit cookies button´s icon.

```js
[
  {
    title: 'Performance',
    description:
      'Bla bla serviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer erviços que podemos oferecer serviços que podemos oferecer.',
    items: [{ label: 'Active', value: 'performance', isRequired: true }],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'GoogleAnalytics', description: 'Google Analytics Description', value: 'ga' },
      { label: 'Sentry', description: 'Sentry Description',value: 'sentry', isEnable: true },
      { label: 'Mapbox', description: 'Mapbox Description',value: 'mapbox' },
      { label: 'New Relic', description: 'New Relic Description',value: 'newRelic', isEnable: true },
      { label: 'Dog Food', description: 'Dog Food Description',value: 'dogfood' },
    ],
  },
];
```

Each object is a section of the **preference's modal**. Each section consists of the following values:

- title: the cookie preference name to be displayed

- description: the cookie preference description to be displayed along with the title

- items: array of objects displaying the preference's options the user may interact with
  - label: name of the option
  - value: value to be dispatched once the user select this option
  - isEnable: if `true`, means the options will be enabled when the user first opens the modal. It defaults to `false`
  - isRequired: if `true`, means the preference is obligatory and such cookies _cannot be opted out_

### target

A string in form of a **css selector** to target where the preference modal will be placed in your app. It is used for the `Teleport` feature of Vue 3. It defaults to `body`, but you can attach any selector such as `#app`, `.my-class`, etc...

## Events

### on-accept-all-cookies

This event is dispatched when the user clicks the `Accept All` button. You can call your own handler to do whatever you might do in this case:

```vue
<template>
  <vue-cookie-banner
    :preferences="preferences"
    @on-accept-all-cookies="onAccept"
  />
</template>

<script>
  export default {
    methods: {
      onAccept() {
        console.log('User has accepted all cookies')
      }
    }
  }
</script>
```

After `on-accept-all-cookies` is dispatched, a item with key `cookie-banner` is placed in the `localStorage`, with the value `all`. You can use the presence of this key and value to do some logic on the client. Once the `cookie-banner` key exists in the `localStorage`, the `vue-cookie-banner` won't show anymore in the page.

### on-save-cookie-preferences

This event is dispatched when the user open the modal and saves their preferences. The handler will receive an Array containing the `values` of preferences the user opted in:

```vue
<template>
  <vue-cookie-banner
    :preferences="preferences"
    @on-save-cookie-preferences="onSavePreferences"
  />
</template>

<script>
  export default {
    methods: {
      onSavePreferences(preferences) {
        console.log(preferences) // ['performance', 'ga', 'newRelic']
      }
    }
  }
</script>
```

After `on-save-cookie-preferences` is dispatched, a item with key `cookie-banner` is placed in the `localStorage`, with the value of an array containing the values the user opted in, eg. `['performance', 'ga', 'newRelic']`. You can use the presence of this key and value to do some logic on the client. Once the `cookie-banner` key exists in the `localStorage`, the `vue-cookie-banner` won't show anymore in the page.

## Composition

You can use slots to leverage composition and customize `vue-cookie-banner` with your own components. If the slots are not used, it will default to the internal components.

```vue
<vue-cookie-banner
  :preferences="preferences"
  @on-accept-all-cookies="onAcceptAll"
  @on-save-cookie-preferences="onSavePreferences"
>
    <template v-slot:header>
      <header>Custom header</header>
    </template>

    <template v-slot:modal-header>
      <h3>My custom modal header</h3>
    </template>

    <template v-slot:modal-body="{ preference, index }">
      <div>{{ preference.title }}</div>
    </template>

    <template v-slot:modal-footer>
      <footer>
        My custom modal footer
      </footer>
    </template>
  </vue-cookie-banner>
```

There are 4 slots to be customized: `v-slot:header`, `v-slot:modal-header`, `v-slot:modal-body`, `v-slot:modal-footer`. 

Note that `v-slot:modal-body` is a [scoped slot](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) so you can have access to the preference's values 🤩.

## Tricks

Since the modal it's using the [Vue Teleport](https://v3.vuejs.org/guide/teleport.html) feature and it targets the `<body>` tag by default, if you have any global styles make sure they are applied to the body, so the modal can inherit styles such as font-family, color, etc..

```css
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
```

## Contributing

Feel free to open an issue with bugs, suggestions for features, enhancements, weird behaviours, questions and more. Also, feel more than welcome to open an PR to fix something you came across or improve the code 🚀
