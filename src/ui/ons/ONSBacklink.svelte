<script>
  export let href;
  export let inverted = false;
  let renderWhite = inverted ? "ons-breadcrumb__link--white" : "";
</script>

<nav class="ons-breadcrumb" aria-label="Back">
  <ol class="ons-breadcrumb__items ons-u-fs-s">
    <li class="ons-breadcrumb__item">
      <a class="ons-breadcrumb__link {renderWhite}" {href} id="back" data-attribute="Example attribute" on:click>Back</a
      >
      <svg
        class="ons-svg-icon "
        viewBox="0 0 8 13"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
        fill={inverted ? "#fff" : "currentColor"}
      >
        <path
          d="M5.74,14.28l-.57-.56a.5.5,0,0,1,0-.71h0l5-5-5-5a.5.5,0,0,1,0-.71h0l.57-.56a.5.5,0,0,1,.71,0h0l5.93,5.93a.5.5,0,0,1,0,.7L6.45,14.28a.5.5,0,0,1-.71,0Z"
          transform="translate(-5.02 -1.59)"
        />
      </svg>
    </li>
  </ol>
</nav>

<style>
  .ons-breadcrumb__link--white {
    color: #fff;
  }
</style>
