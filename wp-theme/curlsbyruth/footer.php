<?php
/**
 * Voet van elke pagina. Vier kolommen, precies als in de demo: het logo met
 * de socials, de shop met de categorieën, de informatiepagina's en waar je
 * Ruth kunt volgen.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
</main>

<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">

      <div>
        <div class="footer__logo">
          <?php
          if ( has_custom_logo() ) {
          	the_custom_logo();
          } else {
          	printf(
          		'<img src="%s" alt="%s" width="200" height="71" />',
          		esc_url( get_template_directory_uri() . '/assets/logo.svg' ),
          		esc_attr( get_bloginfo( 'name' ) )
          	);
          }
          ?>
        </div>
        <p><?php echo esc_html( get_theme_mod( 'cbr_footer_tekst', 'Zorgvuldig geselecteerde verzorging voor krullend haar. Met de hand ingepakt en verzonden vanuit Nederland.' ) ); ?></p>
        <div class="socials">
          <a href="<?php echo esc_url( get_theme_mod( 'cbr_instagram', '#' ) ); ?>" aria-label="Instagram" rel="noopener">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="<?php echo esc_url( get_theme_mod( 'cbr_tiktok', '#' ) ); ?>" aria-label="TikTok" rel="noopener">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.6 2.4 2.2 3.8 4.5 4"/></svg>
          </a>
        </div>
      </div>

      <div>
        <h4>Shop</h4>
        <ul>
          <?php if ( cbr_shop_actief() ) : ?>
            <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Alle producten</a></li>
            <?php foreach ( array_slice( cbr_categorieen(), 0, 3 ) as $cat ) : ?>
              <li><a href="<?php echo esc_url( $cat['link'] ); ?>"><?php echo esc_html( $cat['naam'] ); ?></a></li>
            <?php endforeach; ?>
          <?php endif; ?>
        </ul>
      </div>

      <div>
        <h4>Informatie</h4>
        <?php
        /*
         * Heeft Ruth nog geen menu gemaakt, dan staan hier toch de vier
         * pagina's uit de demo. Een lege kolom ziet er verwaarloosd uit en
         * juist die pagina's moet een klant kunnen vinden.
         */
        wp_nav_menu(
        	array(
        		'theme_location' => 'footer',
        		'container'      => false,
        		'depth'          => 1,
        		'fallback_cb'    => 'cbr_footer_links',
        	)
        );
        ?>
      </div>

      <div>
        <h4>Volg ons</h4>
        <ul>
          <li><a href="<?php echo esc_url( get_theme_mod( 'cbr_instagram', '#' ) ); ?>" rel="noopener">Instagram</a></li>
          <li><a href="<?php echo esc_url( get_theme_mod( 'cbr_tiktok', '#' ) ); ?>" rel="noopener">TikTok</a></li>
        </ul>
      </div>

    </div>

    <div class="footer__bottom">
      <span>
        &copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?><?php
        /* Wettelijk verplicht zodra Ruth ze invult; tot die tijd niets. */
        $gegevens = array_filter(
        	array(
        		( $kvk = get_theme_mod( 'cbr_kvk' ) ) ? 'KvK ' . $kvk : '',
        		( $btw = get_theme_mod( 'cbr_btw' ) ) ? 'Btw ' . $btw : '',
        	)
        );
        if ( $gegevens ) {
        	echo ' &middot; ' . esc_html( implode( ' · ', $gegevens ) );
        }
        ?>
      </span>
      <span class="footer__juridisch">
        <?php cbr_juridische_links(); ?>
      </span>
    </div>
  </div>
</footer>

<?php if ( cbr_shop_actief() ) : ?>
	<div class="drawer-backdrop" data-drawer-backdrop hidden></div>

	<aside class="drawer" id="winkelmandlade" data-drawer aria-label="Winkelmand" aria-hidden="true">
		<div class="drawer__head">
			<h3 class="serif">Winkelmand</h3>
			<button class="icon-btn" data-drawer-sluit aria-label="Winkelmand sluiten">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
			</button>
		</div>

		<?php get_template_part( 'template-parts/cart-drawer' ); ?>
	</aside>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
