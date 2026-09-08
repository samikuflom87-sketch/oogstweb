<?php
/**
 * Voet van elke pagina. Zelfde opzet als de demo, met de wettelijk
 * verplichte gegevens onderaan.
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
          <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/logo.svg' ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>" width="200" height="71" />
        </div>
        <p><?php echo esc_html( get_theme_mod( 'cbr_footer_tekst', 'Zorgvuldig geselecteerde verzorging voor krullend haar. Met de hand ingepakt en verzonden vanuit Nederland.' ) ); ?></p>
        <div class="socials">
          <?php if ( $ig = get_theme_mod( 'cbr_instagram' ) ) : ?>
            <a href="<?php echo esc_url( $ig ); ?>" aria-label="Instagram" rel="noopener">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
          <?php endif; ?>
          <?php if ( $tt = get_theme_mod( 'cbr_tiktok' ) ) : ?>
            <a href="<?php echo esc_url( $tt ); ?>" aria-label="TikTok" rel="noopener">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.6 2.4 2.2 3.8 4.5 4"/></svg>
            </a>
          <?php endif; ?>
        </div>
      </div>

      <div>
        <h4>Shop</h4>
        <ul>
          <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>">Alle producten</a></li>
          <li><a href="<?php echo esc_url( wc_get_cart_url() ); ?>">Winkelmand</a></li>
        </ul>
      </div>

      <div>
        <h4>Informatie</h4>
        <?php
        wp_nav_menu(
        	array(
        		'theme_location' => 'footer',
        		'container'      => false,
        		'depth'          => 1,
        		'fallback_cb'    => false,
        	)
        );
        ?>
      </div>

      <div>
        <h4>Contact</h4>
        <ul>
          <?php if ( $mail = get_theme_mod( 'cbr_email' ) ) : ?>
            <li><a href="mailto:<?php echo esc_attr( $mail ); ?>"><?php echo esc_html( $mail ); ?></a></li>
          <?php endif; ?>
          <?php if ( $kvk = get_theme_mod( 'cbr_kvk' ) ) : ?>
            <li>KvK <?php echo esc_html( $kvk ); ?></li>
          <?php endif; ?>
          <?php if ( $btw = get_theme_mod( 'cbr_btw' ) ) : ?>
            <li>Btw <?php echo esc_html( $btw ); ?></li>
          <?php endif; ?>
        </ul>
      </div>

    </div>

    <div class="footer__bottom">
      <span>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
      <span class="footer__pay">iDEAL &middot; Bancontact &middot; Creditcard &middot; Apple&nbsp;Pay &middot; Google&nbsp;Pay</span>
    </div>
  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
