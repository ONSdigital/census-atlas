<script>
  export let serviceTitle, description;
</script>

<header class="ons-header ons-header--hero" role="banner">
  <div class="ons-header__main {description ? 'ons-header__main--with-description' : ''}">
    <div class="ons-container">
      <div
        class="ons-grid ons-grid--gutterless ons-grid--flex ons-grid--between ons-grid--vertical-center ons-grid--no-wrap"
      >
        <div class="ons-grid__col ons-col-auto ons-u-flex-shrink">
          <div class="ons-header__title {description ? 'header__title--with-description' : ''}">
            <h1>{serviceTitle}</h1>
          </div>
        </div>
      </div>
      {#if description}
        <p class="ons-header__desc">{description}</p>
      {/if}
    </div>
  </div>
</header>

<style lang="scss">
  @import "../../node_modules/@ons/design-system/scss/vars/_index.scss";

  .ons-container {
    padding: 0 1rem;
  }

  .ons-header__desc {
    margin: -0.2rem 0 0 0;
  }

  .ons-header__main {
    padding: 1rem 0;
  }
  a {
    color: $color-white;
  }
  a:hover {
    color: $color-white;
    text-decoration: underline solid $color-white 2px;
  }
  a:focus {
    background-color: $color-sun-yellow;
    -webkit-box-shadow: 0 -2px $color-sun-yellow, 0 4px $color-black;
    box-shadow: 0 -2px $color-sun-yellow, 0 4px $color-black;
    color: $color-black;
    outline: 3px solid transparent;
    text-decoration: none;
  }

  @media only screen and (min-width: map-get($grid-bp, m)) {
    .ons-header__main {
      height: auto;
    }
  }
</style>
