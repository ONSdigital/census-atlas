<main>
  <slot />
</main>

<style>
  main {
    background: #fff;
    box-sizing: border-box;
    padding: 24px;
    z-index: 2;
    width: 40%;
    position: relative;
  }
  @media (max-width: 900px) {
    main {
      width: 50%;
      z-index: 0;
    }
  }
  @media (max-width: 670px) {
    main {
      width: 100%;
      top: 70%;
      z-index: 0;
    }
  }
</style>
